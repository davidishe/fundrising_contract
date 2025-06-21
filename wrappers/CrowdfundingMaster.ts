import { 
    Address, 
    beginCell, 
    Cell, 
    Contract, 
    contractAddress, 
    ContractProvider, 
    Sender, 
    SendMode,
    toNano
} from '@ton/core';

export type CrowdfundingMasterConfig = {
    masterJettonWalletAddress: Address;
    initialPrice: bigint;
};

export function crowdfundingMasterConfigToCell(config: CrowdfundingMasterConfig): Cell {
    return beginCell()
        .storeAddress(config.masterJettonWalletAddress)
        .storeCoins(config.initialPrice)
        .endCell();
}

export class CrowdfundingMaster implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell }
    ) {}

    static createFromAddress(address: Address) {
        return new CrowdfundingMaster(address);
    }

    static createFromConfig(config: CrowdfundingMasterConfig, code: Cell, workchain = 0) {
        const data = crowdfundingMasterConfigToCell(config);
        const init = { code, data };
        return new CrowdfundingMaster(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendInvest(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .endCell(), // Empty message - investment amount is in ctx.value
        });
    }

    async sendSetPrice(
        provider: ContractProvider,
        via: Sender,
        newPrice: bigint
    ) {
        await provider.internal(via, {
            value: toNano('0.05'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeCoins(newPrice) // SetPrice message contains only newPrice
                .endCell(),
        });
    }

    async getCurrentPrice(provider: ContractProvider): Promise<bigint> {
        const result = await provider.get('getCurrentPrice', []);
        return result.stack.readBigNumber();
    }

    async getTotalInvested(provider: ContractProvider): Promise<bigint> {
        const result = await provider.get('getTotalInvested', []);
        return result.stack.readBigNumber();
    }

    async getUserContract(provider: ContractProvider, user: Address): Promise<Address> {
        const result = await provider.get('getUserContract', [
            { type: 'slice', cell: beginCell().storeAddress(user).endCell() }
        ]);
        return result.stack.readAddress();
    }

    async getJettonMaster(provider: ContractProvider): Promise<Address> {
        const result = await provider.get('getJettonMaster', []);
        return result.stack.readAddress();
    }

    async getMasterJettonWallet(provider: ContractProvider): Promise<Address> {
        const result = await provider.get('getMasterJettonWallet', []);
        return result.stack.readAddress();
    }

    async getOurJettonWalletAddress(provider: ContractProvider): Promise<Address> {
        const result = await provider.get('getOurJettonWalletAddress', []);
        return result.stack.readAddress();
    }
} 