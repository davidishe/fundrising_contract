import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { JettonMinter } from '../build/JettonMinter/JettonMinter_JettonMinter';
import '@ton/test-utils';

describe('JettonMinter', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let jettonMinter: SandboxContract<JettonMinter>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        jettonMinter = blockchain.openContract(await JettonMinter.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await jettonMinter.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            null,
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: jettonMinter.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and jettonMinter are ready to use
    });
});
