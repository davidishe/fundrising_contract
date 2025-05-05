import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { AutoJettonSender } from '../wrappers/AutoJettonSender';
import '@ton/test-utils';

describe('AutoJettonSender', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let autoJettonSender: SandboxContract<AutoJettonSender>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        autoJettonSender = blockchain.openContract(await AutoJettonSender.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await autoJettonSender.send(
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
            to: autoJettonSender.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and autoJettonSender are ready to use
    });
});
