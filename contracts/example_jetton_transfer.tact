import "@stdlib/deploy";


message(0xf8a7ea5) JettonTransfer {
    queryId: Int as uint64;
    amount: Int as coins;
    destination: Address;
    responseDestination: Address?;
    customPayload: Cell? = null;
    forwardTonAmount: Int as coins;
    forwardPayload: Slice as remaining;
}

const JettonTransferGas: Int = ton("0.05");

struct JettonWalletData {
    balance: Int as coins;
    ownerAddress: Address;
    jettonMasterAddress: Address;
    jettonWalletCode: Cell;
}

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


contract ExampleJettonTransfer with Deployable{
    myJettonWalletAddress: Address;
    myJettonAmount: Int as coins = 0;
    jettonMasterAddress: Address;
    jettonWalletCode: Cell;
    contractOwner: Address;

    init(jettonWalletCode: Cell, 
        jettonMasterAddress: Address) {
        
        self.myJettonWalletAddress = calculateJettonWalletAddress(
            myAddress(),
            jettonMasterAddress,
            jettonWalletCode,
        );

        self.jettonMasterAddress = jettonMasterAddress;
        self.jettonWalletCode = jettonWalletCode;
        self.contractOwner = sender();
    }

    // Empty receiver for the deployment,
    // which forwards the remaining value back to the sender
    receive() {}



receive("deploy_jetton_wallet") {
    let DeployWalletOp = 0x1; // обычно op-code = 1 (0x01)

    send(SendParameters{
        to: self.jettonMasterAddress,
        value: ton("0.1"),     // может потребоваться больше в зависимости от мастера
        bounce: true,
        body: beginCell()
            .storeUint(DeployWalletOp, 32)   // op-code
            .storeUint(0, 64)                // queryId
            .storeAddress(sender())          // адрес владельца, кому создаём JettonWallet
            .endCell()
    });
}


    receive("jetton_transf") {

        let jettonMasterAddress: Address = address("kQCKAaH-aOwVULH3Fonkbh9QUBCEYJHQjMjagS8W7qQL5H6G");
        let addressToSendSender: Address = calculateJettonWalletAddress(sender(), 
                                                                    jettonMasterAddress, 
                                                                    self.jettonWalletCode);

        let addressToSendOwner: Address = calculateJettonWalletAddress(self.contractOwner, 
                                                                    jettonMasterAddress, 
                                                                    self.jettonWalletCode);

        let addressToSendMyAddress: Address = calculateJettonWalletAddress(myAddress(), 
                    jettonMasterAddress, 
                    self.jettonWalletCode);

        // let body = beginCell()
        //     .storeUint(0xf8a7ea5, 32)           // op_code
        //     .storeUint(0, 64)                   // queryId
        //     .storeCoins(ton("6"))                      // amount
        //     .storeAddress(addressToSendSender)         // recipient
        //     .storeAddress(sender()) // response
        //     .storeMaybeRef(null)               // customPayload
        //     .storeCoins(1)                     // forwardTonAmount
        //     .storeRef(beginCell().storeUint(0xF, 4).endCell()) // forwardPayload
        //     .endCell();


        let body = JettonTransfer{
                // Unique identifier used to trace transactions across multiple contracts
                queryId: 6083770390913241100,
                // Jetton amount to transfer
                amount: ton("6"),
                // Where to transfer Jettons:
                // this is the address of the Jetton wallet
                // owner and not the Jetton wallet itself
                destination: sender(),
                // Where to send a confirmation notice of a successful transfer
                // and the remainder of the incoming message value
                responseDestination: sender(),
                // Can be used for custom logic of the Jettons themselves,
                // or set to null otherwise
                // customPayload: null,
                // Amount to transfer with JettonTransferNotification,
                // which is needed for the execution of custom logic
                forwardTonAmount: 0, // if it's 0, the notification won't be sent!
                // Compile-time way of expressing:
                // beginCell().storeUint(0xF, 4).endCell().beginParse()
                // For more complicated transfers, adjust accordingly
                forwardPayload: rawSlice("F")

            };


        send(SendParameters{
            to: addressToSendMyAddress,
            value: JettonTransferGas,
            bounce: true,
            body: body.toCell()
        });



    }


}