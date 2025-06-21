import "@stdlib/deploy";
import "@stdlib/ownable";
import "./messages";
import "./utils";
import "./user_investment";




struct PendingRevert {
    investor: Address;
    price: Int as coins;
    amountTon: Int as coins;
    jettons: Int as coins;
}

contract CrowdfundingMaster with Deployable, Ownable {
    
    
    owner: Address;
    
    
    currentPrice: Int as coins;          
    jettonMaster: Address;               
    masterJettonWallet: Address;         
    
    
    pendingRefunds: map<Address, Address>; 
    
    
    const MinInvestment: Int = ton("0.1");
    const GasForTransfer: Int = ton("0.2");
    const GasForDeploy: Int = ton("0.05");
    
    init(jettonMasterAddress: Address, initialPrice: Int) {
        self.owner = sender();
        self.jettonMaster = jettonMasterAddress;
        self.masterJettonWallet = newAddress(0, 0); 
        self.currentPrice = initialPrice;
    }
    
    
    receive(msg: SetJettonWallet) {
        self.requireOwner();
        self.masterJettonWallet = msg.walletAddress;
    }
    
    
    
    get fun getJettonWalletAddress(owner: Address): Address {
        
        
        if (owner == myAddress()) {
            return self.masterJettonWallet;
        }
        
        return newAddress(0, 0);
    }
    
    
    receive(msg: Invest) {
        let ctx: Context = context();
        let investmentAmount: Int = ctx.value - self.GasForTransfer;
        
        require(investmentAmount >= self.MinInvestment, "Investment too small");
        require(self.currentPrice > 0, "Price not set");
        require(self.masterJettonWallet != newAddress(0, 0), "Master jetton wallet not set"); 
        
        
        let jettonsToTransfer: Int = investmentAmount * ton("1") / self.currentPrice;
        require(jettonsToTransfer > 0, "Invalid jetton calculation");
        
        
        send(SendParameters{
            to: self.masterJettonWallet,
            value: self.GasForTransfer,
            mode: SendIgnoreErrors,
            bounce: true,
            body: JettonTransfer{
                queryId: 0,
                amount: jettonsToTransfer,
                destination: ctx.sender,
                responseDestination: ctx.sender,
                customPayload: null,
                forwardTonAmount: ton("0.01"),
                forwardPayload: beginCell().storeBit(false).endCell().beginParse()
            }.toCell()
        });

        
        let userContractAddress: Address = self.getUserContractAddress(ctx.sender);

        send(SendParameters{
            to: userContractAddress,
            value: ton("0.02"),
            mode: SendIgnoreErrors,
            bounce: false,
            body: RecordInvestment{
                investor: ctx.sender,
                amount: investmentAmount,
                price: self.currentPrice,
                jettons: jettonsToTransfer
            }.toCell(),
            code: initOf UserInvestment(myAddress(), ctx.sender).code,
            data: initOf UserInvestment(myAddress(), ctx.sender).data
        });
    }

    
    
    receive(msg: JettonNotification) {
        
        if (sender() == self.masterJettonWallet) {
            
            

            if (msg.forwardPayload.loadBit() == true) {
                
                let inner: Slice = msg.forwardPayload.loadRef().beginParse();
                let userAddress: Address = inner.loadAddress();
                let price: Int = inner.loadCoins();

                let userContractAddress: Address = self.getUserContractAddress(userAddress);

                
                self.pendingRefunds.set(userContractAddress, userAddress);

                
                send(SendParameters{
                    to: userContractAddress,
                    value: ton("0.03"),
                    mode: SendIgnoreErrors,
                    bounce: true,
                    body: InitiateRefund{
                        price: price,
                        jettonAmount: msg.amount
                    }.toCell()
                });
            }
        }
    }

    
    receive(msg: SetPrice) {
        self.requireOwner();
        require(msg.newPrice > 0, "Price must be positive");
        
        self.currentPrice = msg.newPrice;
    }
    
    
    receive(msg: RefundInfo) {
        
        let userContractAddress: Address = sender();
        let userAddress: Address? = self.pendingRefunds.get(userContractAddress);
        
        if (msg.isValid && msg.tonAmount > 0 && userAddress != null) {
            let user: Address = userAddress!!;
            
            
            send(SendParameters{
                to: user,
                value: msg.tonAmount,
                mode: SendIgnoreErrors,
                bounce: false,
                body: "TON refund processed".asComment()
            });
            
            
            self.pendingRefunds.set(userContractAddress, null);
        }
    }

    
    fun getUserContractAddress(userAddress: Address): Address {
        return contractAddress(initOf UserInvestment(myAddress(), userAddress));
    }

    
    get fun getCurrentPrice(): Int {
        return self.currentPrice;
    }
    
    get fun getJettonMaster(): Address {
        return self.masterJettonWallet;
    }
    
    get fun getMasterJettonWallet(): Address {
        return self.masterJettonWallet;
    }
    
    get fun getOurJettonWalletAddress(): Address {
        return self.masterJettonWallet;
    }

    get fun getUserContract(userAddress: Address): Address {
        return self.getUserContractAddress(userAddress);
    }

    
    receive(msg: JettonExcesses) {
        
    }
} 

