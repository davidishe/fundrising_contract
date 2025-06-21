import { 
    Address, 
    beginCell, 
    Cell, 
    Contract, 
    contractAddress, 
    ContractProvider, 
    Sender, 
    SendMode,
    toNano,
    TupleItem
} from '@ton/core';

export type UserInvestmentConfig = {
    master: Address;
    user: Address;
};

export function userInvestmentConfigToCell(config: UserInvestmentConfig): Cell {
    return beginCell()
        .storeAddress(config.master)
        .storeAddress(config.user)
        .endCell();
}

export interface InvestmentRecord {
    amount: bigint;
    price: bigint;
    jettons: bigint;
    timestamp: number;
}

export class UserInvestment implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell }
    ) {}

    static createFromAddress(address: Address) {
        return new UserInvestment(address);
    }

    static createFromConfig(config: UserInvestmentConfig, code: Cell, workchain = 0) {
        const data = userInvestmentConfigToCell(config);
        const init = { code, data };
        return new UserInvestment(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendRecordInvestment(
        provider: ContractProvider,
        via: Sender,
        params: {
            investor: Address;
            amount: bigint;
            price: bigint;
            jettons: bigint;
        }
    ) {
        await provider.internal(via, {
            value: toNano('0.05'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x11111, 32) // RecordInvestment opcode
                .storeAddress(params.investor)
                .storeCoins(params.amount)
                .storeCoins(params.price)
                .storeCoins(params.jettons)
                .endCell(),
        });
    }

    async sendRemoveLastInvestment(provider: ContractProvider, via: Sender) {
        await provider.internal(via, {
            value: toNano('0.02'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeStringTail("RemoveLastInvestment")
                .endCell(),
        });
    }

    async sendTokenNotification(
        provider: ContractProvider,
        via: Sender,
        params: {
            queryId: bigint;
            amount: bigint;
            from: Address;
            forwardPayload: Cell;
        }
    ) {
        await provider.internal(via, {
            value: toNano('0.1'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x7362d09c, 32) // TokenNotification opcode
                .storeUint(params.queryId, 64)
                .storeCoins(params.amount)
                .storeAddress(params.from)
                .storeRef(params.forwardPayload)
                .endCell(),
        });
    }

    // Get methods
    async getInvestmentCount(provider: ContractProvider): Promise<number> {
        const result = await provider.get('getInvestmentCount', []);
        return result.stack.readNumber();
    }

    async getTotalInvested(provider: ContractProvider): Promise<bigint> {
        const result = await provider.get('getTotalInvested', []);
        return result.stack.readBigNumber();
    }

    async getTotalJettons(provider: ContractProvider): Promise<bigint> {
        const result = await provider.get('getTotalJettons', []);
        return result.stack.readBigNumber();
    }

    async getInvestment(provider: ContractProvider, index: number): Promise<InvestmentRecord | null> {
        try {
            const result = await provider.get('getInvestment', [
                { type: 'int', value: BigInt(index) }
            ]);
            
            if (result.stack.remaining === 0) {
                return null;
            }

            const amount = result.stack.readBigNumber();
            const price = result.stack.readBigNumber();
            const jettons = result.stack.readBigNumber();
            const timestamp = result.stack.readNumber();

            return {
                amount,
                price,
                jettons,
                timestamp
            };
        } catch (error) {
            return null;
        }
    }

    async getOwner(provider: ContractProvider): Promise<Address> {
        const result = await provider.get('getOwner', []);
        return result.stack.readAddress();
    }

    async getAllInvestments(provider: ContractProvider): Promise<Map<number, InvestmentRecord>> {
        const count = await this.getInvestmentCount(provider);
        const investments = new Map<number, InvestmentRecord>();

        for (let i = 0; i < count; i++) {
            const investment = await this.getInvestment(provider, i);
            if (investment) {
                investments.set(i, investment);
            }
        }

        return investments;
    }

    // Helper methods for testing
    async getInvestmentSummary(provider: ContractProvider) {
        const count = await this.getInvestmentCount(provider);
        const totalInvested = await this.getTotalInvested(provider);
        const totalJettons = await this.getTotalJettons(provider);
        const owner = await this.getOwner(provider);

        return {
            count,
            totalInvested,
            totalJettons,
            owner
        };
    }
} 