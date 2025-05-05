import { toNano } from '@ton/core';
import { FundHolder } from '../wrappers/FundHolder';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const fundHolder = provider.open(await FundHolder.fromInit());

    await fundHolder.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        null,
    );

    await provider.waitForDeploy(fundHolder.address, 120000);
    console.log(`Контракт задеплоен по адресу: ${fundHolder.address.toString()}`);

    // run methods on `fundHolder`
}
