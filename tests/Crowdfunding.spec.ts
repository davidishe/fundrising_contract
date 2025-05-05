import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, toNano } from '@ton/core';
import { Crowdfunding } from '../wrappers/Crowdfunding';
import '@ton/test-utils';

let blockchain: Blockchain;
let deployer: SandboxContract<TreasuryContract>;
let crowdfunding: SandboxContract<Crowdfunding>;

describe('Crowdfunding', () => {

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        crowdfunding = blockchain.openContract(await Crowdfunding.fromInit());
        deployer = await blockchain.treasury('deployer');

        const deployResult = await crowdfunding.send(
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
            to: crowdfunding.address,
            deploy: true,
            success: true,
        });
    });


    // it('should address', async () => {
    //     const res = await crowdfunding.getDeadline();
    //     console.log(res);
    // });


    it('should donate', async () => {
        const deployResult = await crowdfunding.send(
            deployer.getSender(),
            {
                value: toNano('0.5'),
            },
            "donate"
        );

        // const res = await crowdfunding.getGetBackers();
        // console.log(res.values());
        // console.log(res.keys());
    });

    it('claim when not finished', async () => {

        const currentBalance = await crowdfunding.getBalance();
        const deployResult = await crowdfunding.send(
            deployer.getSender(),
            {
                value: toNano('4'),
            },
            "donate"
        );
        const balance = await crowdfunding.getBalance();
        expect(currentBalance < balance);

        // const res = await crowdfunding.getGetBackers();
        // expect(res.keys.length > 0);
    });



});



