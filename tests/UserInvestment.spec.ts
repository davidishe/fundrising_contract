import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { UserInvestment } from '../build/UserInvestment/UserInvestment_UserInvestment';
import '@ton/test-utils';

describe('UserInvestment', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let userInvestment: SandboxContract<UserInvestment>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        userInvestment = blockchain.openContract(await UserInvestment.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await userInvestment.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            null,
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: userInvestment.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and userInvestment are ready to use
    });
});
