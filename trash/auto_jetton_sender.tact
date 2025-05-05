import "@stdlib/deploy";

// Залить токены на указанный jettonWallet.
// Убедиться, что этот Wallet принадлежит вашему контракту или его адресу, иначе не даст отправлять.
// Можно сделать jettonWallet → мультивалютный кошелек (через JettonWallet стандарт) от имени контракта.
contract AutoJettonSender with Deployable {

    // Настройки
    owner: Address;
    jettonWallet: Address; 
    jettonMaster: Address;
    tokenRate: Int as uint64;          // Сколько токенов выдавать за 1 TON
    const OP_INTERNAL_TRANSFER: Int = 0x178d4519;

    init(jettonMaster: Address, jettonWallet: Address, tokenRate: Int) {
        self.owner = sender();
        self.jettonMaster = jettonMaster;
        self.jettonWallet = jettonWallet;
        self.tokenRate = tokenRate;
    }

    receive("receive") {
        let context: Context = context();
        let tonReceived = context.value;
        require(tonReceived > 0, "Zero payment");

        // let sender = context.sender;
        // require(sender() != null, "Unknown sender");

        // Валидация jetton master и wallet
        // require(self.jettonMaster, "Invalid jetton master");
        // require(self.jettonWallet != null, "Invalid jetton wallet");

        // Считаем сколько токенов нужно отправить
        let tokensToSend = self.tokenRate * tonReceived / 1_000_000_000;

        // Создаем тело internal_transfer
        let transferBody = beginCell()
            .storeUint(self.OP_INTERNAL_TRANSFER, 32)   // op
            .storeUint(0, 64)                      // query_id
            .storeCoins(tokensToSend)              // amount
            .storeAddress(context.sender)                  // destination
            .storeAddress(context.sender)                    // response_destination
            .storeMaybeRef(null)                   // custom_payload
            .storeCoins(0)                         // forward_ton_amount
            .storeUint(0, 1)                       // no forward_payload
            .endCell();

        // Отправляем сообщение на Jetton Wallet
        send(SendParameters{
                to: self.jettonWallet,
                value: ton("0.05"), // Отправляем немного TON на оплату газа
                mode: SendPayGasSeparately + SendIgnoreErrors,
                body: transferBody
            });
    }
}
