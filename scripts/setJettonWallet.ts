import { Address, toNano } from '@ton/core';
import { CrowdfundingMaster } from '../build/CrowdfundingMaster/CrowdfundingMaster_CrowdfundingMaster';
import { NetworkProvider } from '@ton/blueprint';
import { JettonWallet } from '../build/JettonWallet/JettonWallet_JettonWallet';

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
        console.log('🔧 Setting Jetton Wallet Address (Manual Input)');
        console.log('=================================================');
        console.log('');
        
        let crowdfundingMasterAddress: Address;
        let jettonWalletAddress: Address;
        
        if (args.length >= 2) {
            
            try {
                crowdfundingMasterAddress = Address.parse(args[0]);
                jettonWalletAddress = Address.parse(args[1]);
            } catch {
                throw new Error('Invalid command line arguments. Usage: setJettonWallet [crowdfundingMasterAddress] [jettonWalletAddress]');
            }
        } else {
            
            const crowdfundingMasterInput = await promptUser('🏦 Enter CrowdfundingMaster contract address: ');
            if (!crowdfundingMasterInput.trim()) {
                throw new Error('CrowdfundingMaster address is required');
            }

            try {
                crowdfundingMasterAddress = Address.parse(crowdfundingMasterInput.trim());
            } catch {
                throw new Error('Invalid CrowdfundingMaster address format');
            }

            const jettonWalletInput = await promptUser('💰 Enter JettonWallet contract address: ');
            if (!jettonWalletInput.trim()) {
                throw new Error('JettonWallet address is required');
            }

            try {
                jettonWalletAddress = Address.parse(jettonWalletInput.trim());
            } catch {
                throw new Error('Invalid JettonWallet address format');
            }
        }
        
        
        const crowdfundingMaster = provider.open(
            CrowdfundingMaster.fromAddress(crowdfundingMasterAddress)
        );
        console.log(`✅ Parsed addresses successfully.`);
        
        console.log('');
        console.log('📋 Configuration Summary:');
        console.log('========================');
        console.log(`�� CrowdfundingMaster: ${crowdfundingMasterAddress}`);
        console.log(`💰 JettonWallet: ${jettonWalletAddress}`);
        console.log(`👤 Sender: ${provider.sender().address?.toString()}`);
        
        
        const confirm = await promptUser('🚀 Set jetton wallet address? (y/N): ');
        if (confirm.toLowerCase() !== 'y') {
            console.log('❌ Operation cancelled');
            return;
        }
        
        console.log('📝 Sending SetJettonWallet transaction...');
        
        await crowdfundingMaster.send(
            provider.sender(),
            {
                value: toNano('0.02'),
            },
            {
                $$type: 'SetJettonWallet',
                walletAddress: jettonWalletAddress
            }
        );
        
        console.log('⏳ Waiting for transaction confirmation...');
        
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('');
        console.log('✅ Jetton wallet address set successfully!');
        console.log('');
        console.log('🎉 Configuration completed!');
        console.log('📋 Configuration:');
        console.log(`CROWDFUNDING_MASTER_ADDRESS=${crowdfundingMasterAddress}`);
        console.log(`JETTON_WALLET_ADDRESS=${jettonWalletAddress}`);
        console.log('');
        console.log('💡 Next steps:');
        console.log('1. Fund the jetton wallet with tokens for distribution');
        console.log('2. Test investment flow with invest script');
        console.log('3. Test refund flow if needed');
        
    } catch (error) {
        console.error('❌ Failed to set jetton wallet:', error instanceof Error ? error.message : String(error));
        console.log('');
        console.log('💡 Common issues:');
        console.log('- Invalid address format');
        console.log('- Insufficient gas balance');
        console.log('- Not contract owner');
        console.log('- Network connectivity issues');
    }
} 