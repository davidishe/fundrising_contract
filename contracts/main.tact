import "@stdlib/deploy";
import "@stdlib/ownable";

contract FundRising with Deployable, Ownable {
    owner: Address;
    fundrisingDeadline: Int as uint64;
    claimStart: Int as uint64;
    sellRate: Int as uint256;
    fundrisingGoal: Int as coins;
    jettonMaster: Address;
    refundFee: Int as coins;
    balances: map<Address, Int>; //TODO: убрать это, не масштабируется 

    init(
        deadline: Int as uint64,
        claim_start: Int as uint64,
        initialRate: Int as uint256,
        goal: Int as coins,
        jettonMaster: Address,
        fee: Int as coins
    ) {
        require(deadline < claim_start, "Deadline < Claim Start");
        self.owner = sender();
        self.fundrisingDeadline = deadline;
        self.claimStart = claim_start;
        self.sellRate = initialRate;
        self.fundrisingGoal = goal;
        self.jettonMaster = jettonMaster;
        self.refundFee = fee;
    }

    fun updateRate(newRate: Int) {
        self.requireOwner();
        require(newRate > self.sellRate, "Rate must grow");
        self.sellRate = newRate;
    }

    receive("donate") {
        require(now() < self.fundrisingDeadline, "Fundraising ended");
        
        let amount = context().value;
        require(amount > 0, "Amount must be positive");
        let tokens = amount / self.sellRate;
        let user = sender();
        
        self.balances.set(user, self.getUserBalance(user) + tokens);
        
        let msgBody = beginCell()
            .storeUint(0xf8a7ea5, 32)
            .storeUint(0, 64)
            .storeCoins(tokens)
            .storeAddress(user)
            .storeAddress(user)
            .storeBit(false)
            .storeCoins(ton("0.05"))
            .storeBit(true)
            .storeRef(
                beginCell()
                    .storeUint(self.sellRate, 256) // здесь полезная нагрузка не нужна, ее нужно читать при получении токенов на refund, уточнить этот момент в документации надо
                .endCell()
            )
            .endCell();
        
        send(SendParameters{
            to: self.jettonMaster,
            value: ton("0.5"),
            body: msgBody,
            bounce: true,
            mode: SendIgnoreErrors
        });
    }

    receive("refund") {
        require(now() < self.fundrisingDeadline, "Too late");
        let user = sender();
        let balance = self.getUserBalance(user);
        require(balance > 0, "Empty balance");
        
        let msgBody = beginCell()
            .storeUint(0xf8a7ea5, 32)
            .storeUint(0, 64)
            .storeCoins(balance)
            .storeAddress(user)
            .storeAddress(myAddress())
            .storeBit(false)
            .storeCoins(0)
            .endCell();
        
        send(SendParameters{
            to: self.jettonMaster,
            value: ton("0.5"), // нет чтения полезной нагрузки из forward payload
            body: msgBody,
            bounce: true,
            mode: SendIgnoreErrors
        });
    }

    receive() {
    // Обработка входящих сообщений только в период сбора средств
        if now() < self.fundrisingDeadline {
            let slice = inMsg();
        
        // Минимальная проверка: достаточно данных для чтения OP-кода (32 бита)
            if slice.bits() >= 32 {
            
            // Читаем OP-код без изменения положения в Slice
                let op = slice.preloadUint(32);
            
            // Обрабатываем только TransferNotification (0x7362d09c)
                if op == 0x7362d09c {
                
                // Пропускаем OP (32 бита) + query_id (64 бита)
                    slice.skipBits(32 + 64);

                // Проверяем, что достаточно данных для чтения amount (минимум 4 бита для VarUInteger 16)
                    if slice.bits() >= 16 {
                    
                    // 1. Загружаем количество возвращаемых токенов
                        let amount = slice.loadCoins();
                    
                    // 2. Загружаем адреса отправителя и получателя
                        let from = slice.loadAddress();
                        let to = slice.loadAddress();
                    
                    // Проверяем, что токены пришли именно на этот контракт
                        require(to == myAddress(), "Invalid recipient");

                    // 3. Пропускаем forward_ton_amount (если есть)
                        if slice.loadBit() && slice.bits() >= 16 {
                            slice.skipCoins(); // Пропуск coins (VarUInteger 16)
                        }

                    // 4. Обрабатываем forward_payload (если есть и есть ссылка)
                        if slice.loadBit() && slice.refs() > 0 {
                        
                        // Загружаем ячейку с курсом из ссылки
                            let rateCell = slice.loadRef();
                            let rate = rateCell.beginParse().loadUint(256);
                        
                        // Проверяем, что курс из уведомления не превышает текущий
                            require(rate <= self.sellRate, "Invalid rate");

                        // Рассчитываем сумму возврата (с вычетом комиссии)
                            let refundAmount = (amount * rate) - self.refundFee;
                        
                        // Проверяем возможность возврата
                            if refundAmount > 0 && refundAmount <= myBalance() {
                                let currentBalance = self.getUserBalance(from);
                            
                            // Проверяем, что у пользователя достаточно токенов
                                if currentBalance >= amount {
                                
                                // Списываем токены
                                    self.balances.set(from, currentBalance - amount);
                                
                                // Отправляем TON обратно пользователю
                                    send(SendParameters{
                                        to: from,
                                        value: refundAmount,
                                        bounce: true,
                                        mode: SendIgnoreErrors
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    receive("claim") {
        self.requireOwner();
        require(now() >= self.claimStart, "Too early");
        require(myBalance() > self.fundrisingGoal, "Goal not met");
        
        send(SendParameters{
            to: self.owner,
            value: myBalance() - ton("0.5"),
            bounce: true,
            mode: SendIgnoreErrors
        });
    }

    fun getUserBalance(user: Address): Int {
        return self.balances.exists(user) 
            ? self.balances.get(user)!!  // Явное преобразование Int? → Int
            : 0;
    }
}