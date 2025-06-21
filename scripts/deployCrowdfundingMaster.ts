import { toNano, Address, beginCell, Cell, contractAddress } from '@ton/core';
import { CrowdfundingMaster } from '../build/CrowdfundingMaster/CrowdfundingMaster_CrowdfundingMaster';
import { NetworkProvider } from '@ton/blueprint';
import { Contract } from '@ton/core';

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

export async function run(provider: NetworkProvider, args: string[]) {
    try {
        console.log('🚀 CrowdfundingMaster Deployment Script');
        console.log('=====================================');
        console.log('');


        let jettonMasterAddress: Address;
        let price: number;

        if (args.length >= 2) {

            try {
                jettonMasterAddress = Address.parse(args[0]);
                price = parseFloat(args[1]);
                console.log(`📋 Using command line arguments:`);
                console.log(`🎯 Jetton Master: ${jettonMasterAddress}`);
                console.log(`💰 Price: ${price} TON`);
            } catch (error) {
                throw new Error('Invalid command line arguments. Usage: deployCrowdfundingMaster [jettonMasterAddress] [price]');
            }
        } else {
            console.log('💡 You can use command line arguments to skip prompts:');
            console.log('   npx blueprint run deployCrowdfundingMaster --testnet [jettonMaster] [price]');
            console.log('   Example: npx blueprint run deployCrowdfundingMaster --testnet [JETTON_ADDRESS] 0.001');
            console.log('');


            console.log('📋 JettonMaster Configuration');
            console.log('This crowdfunding system requires a deployed JettonMaster contract.');
            console.log('The JettonMaster will handle jetton transfers for investors.');
            console.log('');

            const jettonMasterInput = await promptUser('🎯 Enter JettonMaster contract address (REQUIRED): ');

            if (!jettonMasterInput.trim()) {
                throw new Error('JettonMaster address is required. Please deploy a JettonMaster contract first.');
            }

            try {
                jettonMasterAddress = Address.parse(jettonMasterInput.trim());
                console.log(`✅ Using JettonMaster: ${jettonMasterAddress}`);
            } catch (error) {
                throw new Error('Invalid JettonMaster address format. Please check the address and try again.');
            }

            console.log('');
            console.log('✨ The contract will automatically calculate its jetton wallet address using TEP-74 standard!');
            console.log('ℹ️ No manual jetton wallet address input required.');
            console.log('');


            console.log('💰 Initial Price Configuration');
            const priceInput = await promptUser('Enter initial price per jetton (in TON, e.g., 0.001): ');

            price = parseFloat(priceInput);
            if (isNaN(price) || price <= 0) {
                throw new Error('Invalid price. Please enter a positive number.');
            }

            if (price < 0.0001) {
                console.log('⚠️  Warning: Price is very low (< 0.0001 TON)');
                const confirm = await promptUser('Continue? (y/N): ');
                if (confirm.toLowerCase() !== 'y') {
                    console.log('❌ Deployment cancelled');
                    return;
                }
            }
        }

        const initialPrice = toNano(price.toString());
        console.log(`✅ Initial price: ${price} TON (${initialPrice} nanotons)`);
        console.log('');


        console.log('🔧 Preparing CrowdfundingMaster contract...');
        console.log('✨ Contract will automatically calculate jetton wallet address dynamically');


        const senderAddress = provider.sender().address;
        if (!senderAddress) {
            throw new Error('Sender address is not available. Please check your wallet connection.');
        }

        const crowdfundingMaster = provider.open(await CrowdfundingMaster.fromInit(
            jettonMasterAddress,
            initialPrice
        ));

        console.log(`📋 Contract will be deployed to: ${crowdfundingMaster.address}`);
        console.log(`👤 Contract owner will be: ${senderAddress}`);
        console.log('');


        console.log('📊 Deployment Summary:');
        console.log('=====================');
        console.log(`🎯 JettonMaster: ${jettonMasterAddress}`);
        console.log(`💰 Initial Price: ${price} TON per jetton`);
        console.log(`📍 Contract Address: ${crowdfundingMaster.address}`);
        console.log(`👤 Owner: ${senderAddress}`);
        console.log(`⛽ Gas Fee: ~0.1 TON`);
        console.log('');
        console.log('✨ Jetton Wallet Address Calculation:');
        console.log('   🔄 Will be calculated dynamically by the contract using TEP-74 standard');
        console.log('   📝 No manual input required - fully automated!');
        console.log('');


        const finalConfirm = await promptUser('🚀 Deploy CrowdfundingMaster contract? (y/N): ');
        if (finalConfirm.toLowerCase() !== 'y') {
            console.log('❌ Deployment cancelled');
            return;
        }

        console.log('⏳ Deploying contract to blockchain...');
        console.log('📱 Please check your wallet and CONFIRM the transaction');
        console.log('⏰ Waiting for transaction approval...');
        console.log('');

        try {

            const deployPromise = crowdfundingMaster.send(
                provider.sender(),
                {
                    value: toNano('0.1'),
                },
                {
                    $$type: 'Deploy',
                    queryId: 0n,
                }
            );


            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Transaction approval timeout. Please check your wallet and try again.'));
                }, 60000);
            });

            await Promise.race([deployPromise, timeoutPromise]);
            console.log('✅ Transaction sent successfully!');

        } catch (error) {
            if (error instanceof Error && error.message.includes('timeout')) {
                console.log('⏰ Transaction approval timed out');
                console.log('💡 Tips:');
                console.log('   - Check your wallet app for pending transactions');
                console.log('   - Make sure you have sufficient balance');
                console.log('   - Try closing and reopening your wallet app');
                console.log('   - Check your internet connection');
                throw error;
            }
            throw error;
        }

        console.log('⏳ Waiting for deployment confirmation on blockchain...');
        console.log('   This usually takes 10-30 seconds...');


        const deployWaitPromise = provider.waitForDeploy(crowdfundingMaster.address, 1200000);
        const deployTimeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error('Deployment confirmation timeout. The contract may still be deploying.'));
            }, 120000);
        });

        try {
            await Promise.race([deployWaitPromise, deployTimeoutPromise]);
        } catch (error) {
            if (error instanceof Error && error.message.includes('timeout')) {
                console.log('⚠️ Deployment confirmation timed out, but transaction may still succeed');
                console.log(`🔍 Check contract status at: https://testnet.tonviewer.com/${crowdfundingMaster.address}`);
                console.log('📋 Contract address: ' + crowdfundingMaster.address.toString());
                return;
            }
            throw error;
        }

        console.log('');
        console.log('🎉 DEPLOYMENT SUCCESSFUL!');
        console.log('========================');
        console.log(`✅ CrowdfundingMaster deployed to: ${crowdfundingMaster.address}`);
        console.log(`💰 Initial price: ${price} TON per jetton`);
        console.log(`🎯 JettonMaster: ${jettonMasterAddress}`);
        console.log(`👤 Owner: ${senderAddress}`);
        console.log('');
        console.log('✨ JETTON WALLET ADDRESS:');
        console.log('   🔄 The contract will calculate its jetton wallet address automatically');
        console.log('   📋 Use getMasterJettonWallet() or getOurJettonWalletAddress() getter to retrieve it');
        console.log('   ✅ TEP-74 standard compliance ensured');
        console.log('');
        console.log('📋 Next Steps:');
        console.log('1. Save the contract address for future interactions');
        console.log('2. Fund the contract\'s jetton wallet with jettons for investments');
        console.log('3. Use setPrice.ts to adjust pricing as needed');
        console.log('4. Users can now invest using invest.ts');
        console.log('5. Monitor investments using balances.ts');
        console.log('');
        console.log('📝 Contract Address (save this):');
        console.log(crowdfundingMaster.address.toString());

    } catch (error) {
        console.error('❌ Deployment failed:', error instanceof Error ? error.message : String(error));
        console.log('');
        console.log('💡 Common issues:');
        console.log('- Invalid JettonMaster address format');
        console.log('- Insufficient balance for deployment');
        console.log('- Network connectivity issues');
        console.log('- Invalid price value');
    }
} 