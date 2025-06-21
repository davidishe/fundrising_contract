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
    try {
        console.log('🔧 Admin Price Setting Script');
        console.log('============================');
        
        
        console.log('📊 Current crowdfunding state...');
        
        
        const priceInput = await promptUser('💰 Enter new price per jetton (in TON): ');
        
        
        const price = parseFloat(priceInput);
        if (isNaN(price) || price <= 0) {
            throw new Error('Invalid price. Please enter a positive number.');
        }
        
        if (price < 0.001) {
            console.log('⚠️  Warning: Price is very low (< 0.001 TON)');
            const confirm = await promptUser('Continue? (y/N): ');
            if (confirm.toLowerCase() !== 'y') {
                console.log('❌ Operation cancelled');
                return;
            }
        }
        
        
        const priceNano = toNano(price.toString());
        
        console.log(`📝 Setting price to: ${price} TON (${priceNano} nanotons)`);
        
        
        const masterAddressInput = await promptUser('📍 Enter CrowdfundingMaster contract address: ');

        if (!masterAddressInput.trim()) {
            throw new Error('CrowdfundingMaster address is required');
        }

        const crowdfundingMaster = provider.open(
            CrowdfundingMaster.fromAddress(Address.parse(masterAddressInput.trim()))
        );
        
        console.log(`📋 Contract address: ${crowdfundingMaster.address}`);
        
        
        const finalConfirm = await promptUser('🚀 Execute price change? (y/N): ');
        if (finalConfirm.toLowerCase() !== 'y') {
            console.log('❌ Operation cancelled');
            return;
        }
        
        
        console.log('⏳ Sending price change transaction...');
        
        await crowdfundingMaster.send(
            provider.sender(),
            {
                value: toNano('0.05'), 
            },
            {
                $$type: 'SetPrice',
                newPrice: priceNano
            }
        );
        
        console.log('✅ Price change transaction sent successfully!');
        console.log(`💰 New price: ${price} TON per jetton`);
        console.log('📋 Transaction should be confirmed on the blockchain shortly.');
        
    } catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : String(error));
        console.log('💡 Please check your input and try again.');
    }
} 