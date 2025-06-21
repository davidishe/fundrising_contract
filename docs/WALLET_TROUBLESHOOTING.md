# Wallet Troubleshooting Guide

## Problem: Script Hangs on Transaction Signing

### Symptoms
- Script shows "Waiting for transaction approval..."
- Wallet app doesn't show transaction prompt
- Script appears frozen/hanging
- No error messages

### Quick Solutions

#### 1. Run Wallet Diagnostic First
```bash
cd foundrising_old
npx blueprint run walletDiagnostic --testnet
```

#### 2. Check Your Wallet App
- ✅ Make sure Tonkeeper/wallet app is open
- ✅ Check for pending transactions in wallet
- ✅ Verify you have > 0.1 TON balance
- ✅ Ensure internet connection is stable

#### 3. Try Different Connection Methods

**Option A: TON Connect (Recommended)**
```bash
npx blueprint run deployCrowdfundingMaster --testnet --tonconnect
```

**Option B: Deeplink**
```bash
npx blueprint run deployCrowdfundingMaster --testnet --deeplink
```

**Option C: Mnemonic (Advanced)**
```bash
npx blueprint run deployCrowdfundingMaster --testnet --mnemonic
```

### Common Issues & Solutions

#### Issue 1: Transaction Not Appearing in Wallet
**Solutions:**
- Close and reopen wallet app completely
- Check if QR code appeared but expired
- Restart the script
- Try different connection method

#### Issue 2: "Transaction timeout" Error
**Solutions:**
- The timeout is now set to 60 seconds for approval
- Script will show helpful tips if timeout occurs
- Check wallet for pending transactions
- Verify internet connection

#### Issue 3: Script Hangs at "Waiting for deployment confirmation"
**Solutions:**
- This timeout is now 2 minutes
- Script will provide tonviewer link if timeout
- Transaction may still succeed - check the link
- Contract address is provided even on timeout

### Improved Deployment Script Features

✅ **60-second timeout** for transaction approval
✅ **2-minute timeout** for blockchain confirmation  
✅ **Helpful error messages** with troubleshooting tips
✅ **Contract address provided** even if confirmation times out
✅ **Tonviewer links** for manual verification

### Step-by-Step Troubleshooting

#### Step 1: Verify Wallet Setup
```bash
# Run diagnostic
npx blueprint run walletDiagnostic --testnet

# Check output for:
# ✅ Wallet sender available
# ✅ Sender address: [your address]
# 🌐 Network: testnet
```

#### Step 2: Test Connection Method
```bash
# Try TON Connect first
npx blueprint run deployCrowdfundingMaster --testnet --tonconnect [jettonMaster] [price]

# If that fails, try mnemonic
npx blueprint run deployCrowdfundingMaster --testnet --mnemonic [jettonMaster] [price]
```

#### Step 3: Monitor Transaction
When script shows:
```
📱 Please check your wallet and CONFIRM the transaction
⏰ Waiting for transaction approval...
```

1. **Check wallet app immediately**
2. **Look for transaction prompt**
3. **Approve within 60 seconds**
4. **Watch for success message**

#### Step 4: Handle Timeouts
If you see timeout messages:
```
⏰ Transaction approval timed out
💡 Tips:
   - Check your wallet app for pending transactions
   - Make sure you have sufficient balance
   - Try closing and reopening your wallet app
   - Check your internet connection
```

**Action:** Follow the tips and restart the script

### Manual Transaction Verification

If deployment times out but shows contract address:
```
⚠️ Deployment confirmation timed out, but transaction may still succeed
🔍 Check contract status at: https://testnet.tonviewer.com/[CONTRACT_ADDRESS]
📋 Contract address: [CONTRACT_ADDRESS]
```

1. **Visit the tonviewer link**
2. **Check if contract exists and is active**
3. **If contract exists**: deployment succeeded
4. **If contract doesn't exist**: retry deployment

### Prevention Tips

1. **Stable Internet**: Use reliable connection
2. **Sufficient Balance**: Keep > 0.5 TON in wallet
3. **Wallet Ready**: Open wallet app before running script
4. **Clear Cache**: Restart wallet if it's been open long
5. **Test First**: Run diagnostic script before deployment

### Emergency Recovery

If script completely freezes:
1. **Press Ctrl+C** to stop script
2. **Check wallet** for any pending transactions
3. **Run diagnostic** to verify connection
4. **Restart script** with different connection method

### Contact & Support

If problems persist:
1. Run diagnostic and save output
2. Note exact error messages
3. Check tonviewer for any deployed contracts
4. Try different wallet app if available

The improved deployment script now handles most timeout scenarios gracefully and provides the information you need to verify deployment success manually. 