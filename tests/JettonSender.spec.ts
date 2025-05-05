import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { JettonSender } from '../wrappers/JettonSender';
import '@ton/test-utils';

describe('JettonSender', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let jettonSender: SandboxContract<JettonSender>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        jettonSender = blockchain.openContract(await JettonSender.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await jettonSender.send(
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
            to: jettonSender.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and jettonSender are ready to use
    });
});
