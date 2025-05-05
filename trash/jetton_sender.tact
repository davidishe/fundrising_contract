import "@stdlib/deploy";
import "./objects";



fun calculateJettonWalletAddress(
    ownerAddress: Address,
    jettonMasterAddress: Address,
    jettonWalletCode: Cell,
): Address {

    let initData = JettonWalletData{
        balance: 0,
        ownerAddress,
        jettonMasterAddress,
        jettonWalletCode,
    };

    return contractAddress(StateInit{
        code: jettonWalletCode,
        data: initData.toCell(),
    });
}



contract JettonSender with Deployable {
    myJettonWalletAddress: Address;
    myJettonAmount: Int as coins = 0;

    init(   
            jettonWalletCode: Cell, 
            jettonMasterAddress: Address) {
            self.myJettonWalletAddress = calculateJettonWalletAddress(
            myAddress(),
            jettonMasterAddress,
            jettonWalletCode,
        );
    }

    // Empty receiver for the deployment,
    // which forwards the remaining value back to the sender
    receive() { 
        // cashback(sender()) 
    }

    receive(msg: Withdraw) {
        require(
            msg.amount <= self.myJettonAmount,
            "Not enough funds to withdraw"
        );

        send(SendParameters{
            to: self.myJettonWalletAddress,
            value: JettonTransferGas,
            body: JettonTransfer{
                // Unique identifier used to trace transactions across multiple contracts
                queryId: 42,
                // Jetton amount to transfer
                amount: msg.amount,
                // Where to transfer Jettons:
                // this is the address of the Jetton wallet
                // owner and not the Jetton wallet itself
                destination: sender(),
                // Where to send a confirmation notice of a successful transfer
                // and the remainder of the incoming message value
                responseDestination: sender(),
                // Can be used for custom logic of the Jettons themselves,
                // or set to null otherwise
                customPayload: null,
                // Amount to transfer with JettonTransferNotification,
                // which is needed for the execution of custom logic
                forwardTonAmount: 1, // if it's 0, the notification won't be sent!
                // Compile-time way of expressing:
                //     beginCell().storeUint(0xF, 4).endCell().beginParse()
                // For more complicated transfers, adjust accordingly
                forwardPayload: rawSlice("F")
            }.toCell(),
        });
    }
}


// contract JettonSender with Deployable {
//     // Empty init() function is present by default in all Tact contracts
//     // since v1.3.0, so the following may be omitted:
//     //
//     // init() {}
// }
