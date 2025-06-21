import { toNano, Address } from '@ton/core';
import { CrowdfundingMaster } from '../build/CrowdfundingMaster/CrowdfundingMaster_CrowdfundingMaster';
import { NetworkProvider } from '@ton/blueprint';

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
    console.log('💰 CROWDFUNDING INVESTMENT SCRIPT');
    console.log('=================================');
    console.log('');


    // const args = process.argv.slice(2);
    let contractAddressStr: string = 'kQDKwxFAI43nku5gB886xa7QUqrkKz_uioAQLiOXMmxWIm6J'; // 1️⃣ CrowdfundingMaster contract address
    let amount: string = '0.4'; // 2️⃣ Investment amount in TON



    let contractAddress: Address;
    try {
        contractAddress = Address.parse(contractAddressStr);
    } catch (e) {
        console.log('❌ Invalid contract address format.');
        return;
    }

    if (!amount) {
        amount = await promptUser('💰 Enter investment amount (in TON): ');
    }


    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        console.log('❌ Invalid amount. Please enter a positive number.');
        return;
    }


    if (parsedAmount < 0.15) {
        console.log('⚠️ Warning: Investment amount might be too small (minimum ~0.1 TON + gas)');
        const proceed = await promptUser('Continue? (y/N): ');
        if (proceed.toLowerCase() !== 'y') {
            console.log('❌ Investment cancelled.');
            return;
        }
    }

    console.log('');
    console.log('📋 INVESTMENT DETAILS:');
    console.log('======================');
    console.log(`📍 Contract: ${contractAddress}`);
    console.log(`💰 Amount: ${amount} TON`);

    // const crowdfundingMaster = provider.open(CrowdfundingMaster.fromAddress(contractAddress));

    try {

        console.log('');
        console.log('🔍 Fetching contract information...');

        async function safeGet<T>(fn: () => Promise<T>, label: string): Promise<T | null> {
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    return await fn();
                } catch (e) {
                    const msg = e instanceof Error ? e.message : String(e);
                    console.log(`⚠️  ${label} attempt ${attempt} failed: ${msg}`);
                    if (attempt < 3) {
                        await new Promise(res => setTimeout(res, attempt * 2000));
                        continue;
                    }
                    return null;
                }
            }
            return null;
        }


        // TODO: тут доработать
        const currentPrice = toNano(0.2);
        console.log('🧮 Getting Master Jetton Wallet address...');
        const masterJettonWallet = 'getMasterJettonWallet';

        if (currentPrice !== null) {
            console.log(`💰 Current Price: ${Number(currentPrice) / 1e9} TON per jetton`);
        }
        if (masterJettonWallet !== null) {
            console.log(`💳 Master Jetton Wallet: ${masterJettonWallet}`);
        }

        const investmentAmountNano = toNano(amount);
        const gasForTransfer = toNano('0.1');
        const netInvestment = investmentAmountNano - gasForTransfer;
        const expectedJettons = currentPrice !== null ? Number(netInvestment * BigInt(1000000000) / currentPrice) / 1e9 : 0;

        console.log('');
        console.log('📊 INVESTMENT CALCULATION:');
        console.log('===========================');
        console.log(`💸 Gross Investment: ${amount} TON`);
        console.log(`⛽ Gas Cost: ~0.1 TON`);
        console.log(`💰 Net Investment: ~${Number(netInvestment) / 1e9} TON`);
        if (currentPrice !== null) {
            console.log(`🪙 Expected Jettons: ~${expectedJettons.toFixed(2)}`);
        }

        console.log('');
        console.log('🔧 HOW INVESTMENT WORKS:');
        console.log('========================');
        console.log('1. 📤 You send TON to the contract');
        console.log('2. 🧮 Contract calculates jettons to give you');
        console.log('3. 🔄 Contract transfers jettons from its wallet to you');
        console.log('4. ✅ Investment is recorded in your UserInvestment contract');
        console.log('');
        console.log('⚠️ IMPORTANT: Contract must have enough jettons in its wallet!');

        console.log('');
        console.log('🔍 ADDRESS RETRIEVAL METHOD:');
        console.log('=============================');
        console.log('ℹ️ Master Jetton Wallet address retrieved using:');
        console.log(`   CrowdfundingMaster.getMasterJettonWallet()`);
        console.log('ℹ️ Address must be set via SetJettonWallet message first');

        console.log('');
        console.log('🌐 You can check the contract status at:');
        console.log(`   https://testnet.tonviewer.com/${contractAddress}`);
        console.log(`   https://testnet.tonviewer.com/${masterJettonWallet} (jetton wallet)`);

        const confirmInvestment = await promptUser('🚀 Proceed with investment? (y/N): ');

        if (confirmInvestment.toLowerCase() === 'y') {
            console.log('');
            console.log('⏳ Sending investment transaction...');

            try {
                await crowdfundingMaster.send(
                    provider.sender(),
                    {
                        value: toNano(amount),
                    },
                    {
                        $$type: 'Invest',
                    }
                );

                console.log('✅ Investment transaction sent successfully!');
                console.log('');
                console.log('📋 NEXT STEPS:');
                console.log('==============');
                console.log('1. ⏰ Wait for transaction confirmation (~30 seconds)');
                console.log('2. 🔍 Check transaction on tonviewer.com');
                console.log('3. 💰 Jettons should appear in your wallet');
                console.log('4. 📊 Your investment will be recorded in UserInvestment contract');
                console.log('');
                console.log('🌐 Track your transaction:');
                console.log(`   https://testnet.tonviewer.com/${contractAddress}`);
                console.log('');
                console.log('💡 If transaction fails:');
                console.log('   - Check if contract has enough jettons');
                console.log('   - Verify contract is properly funded');
                console.log('   - Make sure investment amount > minimum (0.1 TON)');

            } catch (error) {
                console.log('❌ Investment failed:', error);
                console.log('');
                console.log('💡 Common issues:');
                console.log('   - Insufficient jettons in contract wallet');
                console.log('   - Investment amount too small');
                console.log('   - Network connectivity issues');
                console.log('   - Insufficient balance for gas fees');
            }
        } else {
            console.log('❌ Investment cancelled.');
        }

    } catch (error) {
        console.log('❌ Error fetching contract information:', error);
        console.log('');
        console.log('💡 Possible issues:');
        console.log('   - Invalid contract address');
        console.log('   - Invalid jetton master address');
        console.log('   - Contract not deployed');
        console.log('   - Network connectivity issues');
    }
} 