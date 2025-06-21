
message Invest {
    
}

message SetPrice {
    newPrice: Int as coins;
}

message SetJettonWallet {
    walletAddress: Address; 
}

message RecordInvestment {
    investor: Address;
    amount: Int as coins;
    price: Int as coins;
    jettons: Int as coins;
}


message InitiateRefund {
    price: Int as coins;       
    jettonAmount: Int as coins;
}

message GetRefundInfo {
    price: Int as coins;
    jettonAmount: Int as coins;
}

message RefundInfo {
    jettonAmount: Int as coins;
    tonAmount: Int as coins;
    isValid: Bool;
}


message(0xf8a7ea5) JettonTransfer {
    queryId: Int as uint64;
    amount: Int as coins;
    destination: Address;
    responseDestination: Address?;
    customPayload: Cell?;
    forwardTonAmount: Int as coins;
    forwardPayload: Slice as remaining;
}

message(0x7362d09c) JettonNotification {
    queryId: Int as uint64;
    amount: Int as coins;
    from: Address;
    forwardPayload: Slice as remaining;
}

message(0xd53276db) JettonExcesses {
    queryId: Int as uint64;
} 


struct InvestmentRecord {
    amount: Int as coins;        
    price: Int as coins;         
    jettons: Int as coins;       
}


struct PendingInvestment {
    investor: Address;
    amount: Int as coins;
    price: Int as coins;
    jettons: Int as coins;
    queryId: Int as uint64;
    timestamp: Int as uint32;
}

message RollbackInvestment {
    price: Int as coins;
    jettonAmount: Int as coins;
    tonAmount: Int as coins;
} 