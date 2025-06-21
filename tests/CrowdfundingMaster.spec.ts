import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { CrowdfundingMaster } from '../build/CrowdfundingMaster/CrowdfundingMaster_CrowdfundingMaster';
import '@ton/test-utils';

describe('CrowdfundingMaster', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let crowdfundingMaster: SandboxContract<CrowdfundingMaster>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        crowdfundingMaster = blockchain.openContract(await CrowdfundingMaster.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await crowdfundingMaster.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            null,
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: crowdfundingMaster.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and crowdfundingMaster are ready to use
    });
});
