import "@stdlib/deploy";

// Since v1.6.0, Tact has a contract parameters syntax that can supersede
// lazy initialization by init() for all contracts that do not require specific on-chain
// deployment logic that must be run only once in the `init()` function.
//
// Note that the empty parameter list above is still a parameter list,
// meaning that the contract won't have an implicit or explicit `init(){:tact}` function
// and will enjoy storage write optimizations and use less gas overall.
//
// See: https://docs.tact-lang.org/book/contracts/#parameters


// структура входящего уведомления
message JettonTransferNotification {
    queryId: Int as uint64;
    amount: Int as coins;
    sender: Address;
    forwardPayload: Slice;
}

contract FundHolder with Deployable {
    // Empty receiver for the deployment,
    // which expects the `null` message body

    init() {}

    receive() {
        // Forward the remaining value in the
        // incoming message back to the sender
    }


    receive("donate") {
        let jettonMasterAddress: Address = address("kQCKAaH-aOwVULH3Fonkbh9QUBCEYJHQjMjagS8W7qQL5H6G");
        // токены выдаем вручную, так как не умеем направлять их из контракта
    }


    receive(msg: JettonTransferNotification) {
        // сюда приходят 
        // сюда приходят токены, мы проверяем что они принадлежат нужному мастер контракту
        // пока вручную, не реализовано

        // Пример обработки кастомного payload (атрибутов)
        // Допустим, структура атрибутов: (uint32 type, uint32 id)
        let slice = msg.forwardPayload;
        if (slice.bits() >= 64) {
            let tokenType = slice.loadUint(32);
            let tokenId = slice.loadUint(32);
            dump("Received token with attributes:");
            dump("Type: ");
            dump(tokenType);
            dump("ID: ");
            dump(tokenId);
        } else {
            dump("Received token without attributes");
        }

        send(SendParameters{
            to: sender(),
            bounce: true,
            value: ton("0.1"),
            mode: SendIgnoreErrors,
        });
    }


    receive("acquire") {
        let jettonMasterAddress: Address = address("kQCKAaH-aOwVULH3Fonkbh9QUBCEYJHQjMjagS8W7qQL5H6G");
    }
}
