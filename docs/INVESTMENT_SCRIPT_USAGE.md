# Investment Script Usage

## Fixed Issues

✅ **RESOLVED**: Removed JettonMinter dependency that was causing compilation errors
✅ **RESOLVED**: Fixed BigInt literal compatibility 
✅ **RESOLVED**: Updated TypeScript configuration for ES2022 support

## How to Use

### Option 1: Direct Blueprint Run (Recommended)

When using blueprint, select `invest` from the script list (it might not appear if other scripts have compilation errors):

```bash
cd foundrising_old
npx blueprint run
# Select "invest" from list
# Select network (testnet/mainnet)
# Select wallet type
```

### Option 2: Command Line with Arguments

```bash
cd foundrising_old
npx blueprint run invest --testnet [contractAddress] [amount]
```

Example:
```bash
npx blueprint run invest --testnet EQDk8e_FQLcW0vbwBY8-CUe43reR4xhTqgTPsycq9zMIt4cc 1.0
```

### Option 3: Direct Script Execution

If blueprint has issues with other scripts, you can run directly:

```bash
cd foundrising_old
npx tsx scripts/invest.ts
```

## Script Features

- ✅ No JettonMinter dependency required
- ✅ Gets jetton wallet address directly from CrowdfundingMaster
- ✅ Interactive prompts for contract address and amount
- ✅ Investment calculation preview
- ✅ Comprehensive error handling
- ✅ Transaction tracking links

## Requirements

1. CrowdfundingMaster must be deployed
2. SetJettonWallet message must have been sent to set correct jetton wallet address
3. Master jetton wallet must have sufficient jettons for the investment

## Process Flow

1. Script connects to wallet
2. Prompts for contract address and investment amount
3. Fetches contract information and jetton wallet address
4. Calculates expected jettons
5. Shows investment preview
6. Sends investment transaction on confirmation
7. Provides tracking links

## Architecture Summary

This investment flow uses the **two-phase deployment** solution:
- Phase 1: Deploy CrowdfundingMaster with zero jetton wallet address
- Phase 2: Set correct jetton wallet address via SetJettonWallet message
- Investment: Script gets jetton wallet address from contract, no circular dependency 