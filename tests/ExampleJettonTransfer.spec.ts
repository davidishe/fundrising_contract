import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { ExampleJettonTransfer } from '../wrappers/ExampleJettonTransfer';
import '@ton/test-utils';

describe('ExampleJettonTransfer', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let exampleJettonTransfer: SandboxContract<ExampleJettonTransfer>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        exampleJettonTransfer = blockchain.openContract(await ExampleJettonTransfer.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await exampleJettonTransfer.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: exampleJettonTransfer.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and exampleJettonTransfer are ready to use
    });
});
