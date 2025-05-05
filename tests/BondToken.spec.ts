import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { BondToken } from '../wrappers/BondToken';
import '@ton/test-utils';

describe('BondToken', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let bondToken: SandboxContract<BondToken>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        bondToken = blockchain.openContract(await BondToken.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await bondToken.send(
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
            to: bondToken.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and bondToken are ready to use
    });
});
