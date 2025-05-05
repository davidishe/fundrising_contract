import { toNano } from '@ton/core';
import { JettonSender } from '../wrappers/JettonSender';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const jettonSender = provider.open(await JettonSender.fromInit());

    await jettonSender.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(jettonSender.address);

    // run methods on `jettonSender`
}
