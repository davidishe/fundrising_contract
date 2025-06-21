import "@stdlib/deploy";
import "./messages";
import "./utils";

contract UserInvestment with Deployable {
    
    
    masterContract: Address;
    userAddress: Address;
    totalInvested: Int as coins;
    totalJettons: Int as coins;
    investmentCount: Int as uint32;
    
    
    investments: map<Int as uint32, InvestmentRecord>;
    
    init(master: Address, user: Address) {
        self.masterContract = master;
        self.userAddress = user;
        self.totalInvested = 0;
        self.totalJettons = 0;
        self.investmentCount = 0;
    }
    
    
    receive(msg: RecordInvestment) {
        
        require(sender() == self.masterContract, "Only master can record investments");
        
        
        self.totalInvested = self.totalInvested + msg.amount;
        self.totalJettons = self.totalJettons + msg.jettons;
        
        
        let merged: Bool = false;
        if (self.investmentCount > 0) {
            let lastInv: InvestmentRecord? = self.investments.get(self.investmentCount);
            if (lastInv != null) {
                let last: InvestmentRecord = lastInv!!;
                if (last.price == msg.price) {
                    let updated: InvestmentRecord = InvestmentRecord{
                        amount: last.amount + msg.amount,
                        price: last.price,
                        jettons: last.jettons + msg.jettons
                    };
                    self.investments.set(self.investmentCount, updated);
                    merged = true;
                }
            }
        }

        if (!merged) {
            self.investmentCount = self.investmentCount + 1;
            self.investments.set(self.investmentCount, InvestmentRecord{
                amount: msg.amount,
                price: msg.price,
                jettons: msg.jettons
            });
        }
    }

    
    receive(msg: InitiateRefund) {
        require(sender() == self.masterContract, "Only master can initiate refund");
        require(msg.jettonAmount <= self.totalJettons, "Insufficient jettons");
        
        
        let targetPrice: Int = msg.price;
        let remainingJettons: Int = msg.jettonAmount;
        let i: Int = 1;
        let tonToReturn: Int = 0;
        let success: Bool = false;
        while (remainingJettons > 0 && i <= self.investmentCount) {
            let rec: InvestmentRecord? = self.investments.get(i);
            if (rec != null) {
                let r: InvestmentRecord = rec!!;
                if (r.price == targetPrice && r.jettons > 0) {
                    let take = min(r.jettons, remainingJettons);
                    let tonPart: Int = (take * r.price) / ton("1");
                    tonToReturn = tonToReturn + tonPart;
                    let updatedR: InvestmentRecord = InvestmentRecord{
                        amount: r.amount - tonPart,
                        price: r.price,
                        jettons: r.jettons - take
                    };
                    self.investments.set(i, updatedR);
                    remainingJettons = remainingJettons - take;
                }
            }
            i = i + 1;
        }

        success = remainingJettons == 0;

        
        send(SendParameters{
            to: self.masterContract,
            value: ton("0.01"),
            mode: SendIgnoreErrors,
            bounce: false,
            body: RefundInfo{
                jettonAmount: msg.jettonAmount,
                tonAmount: tonToReturn,
                isValid: success
            }.toCell()
        });

        if (success) {
            self.totalJettons = self.totalJettons - msg.jettonAmount;
            self.totalInvested = self.totalInvested - tonToReturn;
        }
    }

    
    receive(msg: GetRefundInfo) {
        let targetPrice: Int = msg.price;
        let remainingJettons: Int = msg.jettonAmount;
        let tonPreview: Int = 0;
        let i: Int = 1;
        while (remainingJettons > 0 && i <= self.investmentCount) {
            let rec: InvestmentRecord? = self.investments.get(i);
            if (rec != null) {
                let r: InvestmentRecord = rec!!;
                if (r.price == targetPrice && r.jettons > 0) {
                    let take = min(r.jettons, remainingJettons);
                    tonPreview = tonPreview + (take * r.price) / ton("1");
                    remainingJettons = remainingJettons - take;
                }
            }
            i = i + 1;
        }
        let valid: Bool = remainingJettons == 0;

        send(SendParameters{
            to: sender(),
            value: ton("0.01"),
            mode: SendIgnoreErrors,
            bounce: false,
            body: RefundInfo{
                jettonAmount: msg.jettonAmount,
                tonAmount: tonPreview,
                isValid: valid
            }.toCell()
        });
    }
    
    
    get fun getTotalInvested(): Int {
        return self.totalInvested;
    }
    
    get fun getTotalJettons(): Int {
        return self.totalJettons;
    }

    get fun getInvestmentCount(): Int {
        return self.investmentCount;
    }
    
    get fun getInvestment(index: Int): InvestmentRecord? {
        return self.investments.get(index);
    }
    
    get fun getUserAddress(): Address {
        return self.userAddress;
    }

    get fun getMasterContract(): Address {
        return self.masterContract;
    }
}

