import { Address, toNano } from '@ton/core';
import { BondToken } from '../wrappers/BondToken';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {



    const address: Address = new Address(334, "sfsdfsfsfsf");
    const bondToken = provider.open(await BondToken.fromInit(address));

    await bondToken.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(bondToken.address);

    // run methods on `bondToken`
}
