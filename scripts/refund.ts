import { toNano, Address, beginCell, TupleBuilder } from '@ton/core';
import { JettonWallet, JettonTransfer } from '../build/JettonWallet/JettonWallet_JettonWallet';
import { JettonMinter } from '../build/JettonMinter/JettonMinter_JettonMinter';
import { NetworkProvider } from '@ton/blueprint';
import { UserInvestment } from '../build/UserInvestment/UserInvestment_UserInvestment';
import { CrowdfundingMaster, storeJettonTransfer } from '../build/CrowdfundingMaster/CrowdfundingMaster_CrowdfundingMaster';

async function promptUser(question: string): Promise<string> {
    const readline = await import('readline/promises');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    try {
        const answer = await rl.question(question);
        return answer;
    } finally {
        rl.close();
    }
}

export async function run(provider: NetworkProvider) {
    try {
        console.log('🔄 FIFO Refund (via Jetton Transfer)');
        console.log('====================================');

        console.log('📊 Connecting to your investment contract...');


        const masterAddressInput = await promptUser('📍 Enter CrowdfundingMaster contract address (destination): ');
        let masterAddress = Address.parse(masterAddressInput.trim());
        if (masterAddress.workChain !== 0) {
            masterAddress = new Address(0, masterAddress.hash);
        }


        const master = provider.open(CrowdfundingMaster.fromAddress(masterAddress));
        const ownerAddr = provider.sender().address!;
        let userContractAddr: Address;
        try {
            userContractAddr = await master.getGetUserContract(ownerAddr);
        } catch {

            const uiInput = await promptUser('🏠 Enter your UserInvestment contract address: ');
            userContractAddr = Address.parse(uiInput.trim());
        }

        const userInv = provider.open(UserInvestment.fromAddress(userContractAddr));

        const invCount = await userInv.getGetInvestmentCount();
        console.log(`\n📑 You have ${invCount} investment record(s):`);
        const records: { index: number; priceTON: string; jettons: string; amountTON: string }[] = [];
        try {
            for (let i = 1; i <= Number(invCount); i++) {
                let rec;
                try {
                    rec = await userInv.getGetInvestment(BigInt(i));
                } catch (parseErr) {

                    const tb = new TupleBuilder();
                    tb.writeNumber(BigInt(i));
                    const raw = await provider.provider(userInv.address).get('getInvestment', tb.build());
                    const inner = (raw.stack as any).items?.[0]?.items as any[];
                    if (inner && inner.length === 3) {
                        rec = {
                            amount: inner[0] as bigint,
                            price: inner[1] as bigint,
                            jettons: inner[2] as bigint,
                        };
                    } else {
                        console.error('Unknown raw format', raw.stack);
                        throw parseErr;
                    }
                }
                if (rec) {
                    records.push({
                        index: i,
                        priceTON: (Number(rec.price) / 1e9).toFixed(6),
                        jettons: (Number(rec.jettons) / 1e9).toFixed(6),
                        amountTON: (Number(rec.amount) / 1e9).toFixed(6),
                    } as any);
                }
            }
        } catch (loopErr) {
            console.error('ERROR during investment loop:', loopErr);
            throw loopErr;
        }
        console.table(records);


        const qtyInput = await promptUser('🎯 Enter number of jettons to refund (can be fractional): ');
        const jettonAmountFloat = parseFloat(qtyInput.replace(',', '.'));
        if (isNaN(jettonAmountFloat) || jettonAmountFloat <= 0) {
            throw new Error('Invalid jetton amount.');
        }
        const jettonAmountNano = BigInt(Math.round(jettonAmountFloat * 1e9));

        const priceInput = await promptUser('💰 Enter price (TON) from the table: ');
        if (!priceInput.trim()) {
            throw new Error('Price is required');
        }
        const priceNano = toNano(priceInput.trim());
        console.log(`📝 Jettons: ${jettonAmountFloat}, Price: ${priceInput} TON`);


        const jettonMasterInput = await promptUser('💎 Enter Jetton Minter (master) address: ');
        const jettonMasterAddr = Address.parse(jettonMasterInput.trim());

        const jettonMinter = provider.open(JettonMinter.fromAddress(jettonMasterAddr));
        const owner = provider.sender().address!;
        const jettonWalletAddress = await jettonMinter.getGetWalletAddress(owner);
        console.log(`📍 Your JettonWallet: ${jettonWalletAddress}`);


        const jettonWallet = provider.open(JettonWallet.fromAddress(jettonWalletAddress));


        const innerPayload = beginCell()
            .storeAddress(provider.sender().address!)
            .storeCoins(priceNano)
            .endCell();



        const fwdPayload = beginCell()
            .storeBit(true)
            .storeRef(innerPayload)
            .endCell();

        console.log(`📋 JettonWallet: ${jettonWallet.address}`);
        console.log('⚠️  Ensure this wallet holds at least the requested jettons');


        console.log('');
        console.log('🔄 Refund Logic:');
        console.log('   Contract will refund based on its current price configuration.');
        console.log('   The table above shows your historical investments for reference.');


        const finalConfirm = await promptUser('🚀 Execute refund now? (y/N): ');
        if (finalConfirm.toLowerCase() !== 'y') {
            console.log('❌ Operation cancelled');
            return;
        }


        console.log('⏳ Sending JettonTransfer transaction (refund request)...');


        console.log('===========');
        console.log('===========');
        console.log('===========');
        console.log('===========');
        console.log('===========');
        console.log('jettonAmountNano:');
        console.log(jettonAmountNano);
        console.log('===========');

        console.log('masterAddress:');
        console.log(masterAddress);
        console.log('===========');

        console.log("priceNano");
        console.log(priceNano);

        console.log("provider.sender().address");
        console.log(provider.sender().address!.toString({ testOnly: true, bounceable: true }));
        console.log('===========');
        console.log('===========');
        console.log('===========');
        console.log('===========');


        // 🧱 JettonTransfer структура
        const jettonTransfer: JettonTransfer = {
            $$type: 'JettonTransfer',
            queryId: 0n,
            amount: jettonAmountNano,
            destination: masterAddress,
            responseDestination: null,
            customPayload: null,
            forwardTonAmount: toNano('0.03'),
            forwardPayload: fwdPayload.beginParse(),
        };
        // 📤 Генерация payload в base64
        const body = beginCell().store(storeJettonTransfer(jettonTransfer)).endCell();
        const base64Payload = body.toBoc().toString('base64');
        console.log('base64Payload');
        console.log(base64Payload);





        await jettonWallet.send(
            provider.sender(),
            {
                value: toNano('0.15'),
            },
            {
                $$type: 'JettonTransfer',
                queryId: 0n,
                amount: jettonAmountNano,
                destination: masterAddress,
                responseDestination: null,
                customPayload: null,
                forwardTonAmount: toNano('0.03'),
                forwardPayload: fwdPayload.beginParse(),
            } as JettonTransfer
        );

        console.log('✅ JettonTransfer sent successfully!');
        console.log('📋 Wait until CrowdfundingMaster processes JettonNotification');
        console.log('💰 Your TON refund will arrive to your wallet once confirmed.');


        console.log('');
        console.log('📊 FIFO Refund Calculation:');
        console.log('   The contract will process your investments in chronological order');
        console.log('   Starting with your oldest investments first');
        console.log('   Until the requested jetton amount is reached');

    } catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : String(error));
        console.log('💡 Please check your input and try again.');
        console.log('💡 Ensure you own enough jettons and gas for the transaction.');
    }
} 