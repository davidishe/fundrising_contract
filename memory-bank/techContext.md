# TECHNICAL CONTEXT: TON Crowdfunding Smart Contracts

## 🔧 TECHNOLOGY STACK

### Core Technologies
- **Smart Contract Language**: Tact
- **Blockchain Platform**: TON (The Open Network)
- **Development Environment**: Tact compiler + TON SDK
- **Testing Framework**: Jest + TON testnet
- **Build System**: npm scripts

### Tact Language Benefits
- **Type Safety**: Статическая типизация для безопасности
- **Gas Optimization**: Автоматическая оптимизация газа
- **TON Integration**: Нативная интеграция с TON
- **Developer Experience**: Простота разработки и отладки

## 🏗️ SMART CONTRACT ARCHITECTURE

### Two-Contract System
Master Contract управляет общей логикой, User Contract хранит данные пользователя

### Contract Responsibilities

#### Master Contract
- Принимает входящие TON от пользователей
- Управляет текущей ценой jetton'а
- Создает и инициализирует пользовательские контракты
- Административные функции
- Валидация прав доступа

#### User Contract  
- Хранит баланс jetton'ов пользователя
- Ведет историю покупок с ценами
- Обрабатывает refund запросы
- Рассчитывает суммы к возврату
- Управляет индивидуальными операциями

## 📋 SMART CONTRACT SPECIFICATIONS

### Master Contract Interface
```
contract MasterCrowdfunding {
    admin: Address
    currentPrice: Int
    totalSupply: Int
    totalTonCollected: Int
}
```

### User Contract Interface
```
contract UserCrowdfunding {
    owner: Address
    master: Address
    jettonBalance: Int
    purchases: история покупок
}
```

## 🔒 SECURITY CONSIDERATIONS

### Access Control
- Только admin может менять цену
- Только владелец может делать refund
- Валидация всех входящих сумм

### Safety Features
- Проверка переполнения
- Защита от реентрантности
- Валидация адресов

## 🧪 TESTING STRATEGY

### Test Coverage
- Unit tests для всех функций
- Integration tests для взаимодействия контрактов
- Testnet deployment testing
- Security audit testing

## 🔄 DEPLOYMENT STRATEGY

### Phases
1. Local development and testing
2. Testnet deployment and validation
3. Security audit
4. Mainnet deployment

### Configuration
- Separate configs for testnet/mainnet
- Environment variables for sensitive data
- Automated deployment scripts

## 📊 DATA FLOW

### Investment Process
1. User sends TON to Master Contract
2. Master validates amount and sender
3. Master calculates jetton amount based on current price
4. Master creates/finds user contract
5. User contract updates balance and purchase history
6. Confirmation sent back to user

### Refund Process  
1. User initiates refund from user contract
2. User contract validates ownership and amount
3. Contract calculates TON amount based on purchase history
4. Contract sends TON back to user
5. Balance updated in user contract

### Price Update Process
1. Admin sends price update to master contract
2. Master validates admin permissions  
3. Price updated in master contract state
4. New price affects only future purchases
5. Historical prices preserved for refunds 