import { toNano } from '@ton/core';
import { AutoJettonSender } from '../wrappers/AutoJettonSender';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {

    // 📌 Указываем параметры деплоя
    const jettonMaster = 'kQBVBwxnLrS2HMxf8ZGUJHORraGP1I5kLDjVB3cby8V6HeAp' as any; // Заменить на реальный адрес
    const jettonWallet = '0QDCQTB1NBAtkP0UKjUWkqKAxnZGoVtSMpma4QPZBXbqEP4T' as any; // Заменить на реальный адрес
    const tokenRate = BigInt(100); // Например, 100 jetton за 1 TON
    const autoJettonSender = provider.open(await AutoJettonSender.fromInit(jettonMaster, jettonWallet, tokenRate));

    await autoJettonSender.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(autoJettonSender.address);

    // run methods on `autoJettonSender`
}
