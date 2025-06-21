# Jetton Wallet Setup для CrowdfundingMaster

## Проблема циклической зависимости

При разработке системы краудфандинга с jetton'ами возникает классическая проблема циклической зависимости:

1. **Для создания CrowdfundingMaster** нужно знать адрес его jetton wallet'а
2. **Для получения адреса jetton wallet'а** нужно знать адрес CrowdfundingMaster'а  
3. **Адрес CrowdfundingMaster'а** зависит от параметров инициализации

## Решение: Двухэтапный деплой

### Этап 1: Деплой CrowdfundingMaster

```bash
# Установить переменные окружения
export JETTON_MASTER_ADDRESS="EQD..."
export INITIAL_PRICE="0.001"

# Задеплоить контракт
npx blueprint run deployCrowdfundingMaster --testnet
```

Контракт инициализируется с `masterJettonWallet = newAddress(0, 0)` (нулевой адрес).

### Этап 2: Получение и установка jetton wallet address

После деплоя у вас есть адрес CrowdfundingMaster. Теперь можно:

1. **Получить адрес jetton wallet'а** через jetton master contract
2. **Установить адрес** через `SetJettonWallet` сообщение

## Методы получения jetton wallet address

### Метод 1: Через get_wallet_address (рекомендуется)

Если ваш jetton master поддерживает getter `get_wallet_address`:

```typescript
// Пример запроса к jetton master
const jettonMaster = provider.open(JettonMaster.createFromAddress(
    Address.parse("JETTON_MASTER_ADDRESS")
));

const walletAddress = await jettonMaster.getGetWalletAddress(
    Address.parse("CROWDFUNDING_MASTER_ADDRESS")
);

console.log("Jetton wallet address:", walletAddress.toString());
```

### Метод 2: Через блокчейн эксплореры

1. Зайти в TONscan или аналогичный эксплорер
2. Найти jetton master contract
3. Использовать метод `get_wallet_address` с owner = CrowdfundingMaster address

### Метод 3: Через тестовый transfer

1. Отправить небольшое количество jetton'ов на CrowdfundingMaster
2. Посмотреть в транзакциях, какой jetton wallet был создан

## Установка jetton wallet address

После получения правильного адреса:

```bash
# Через blueprint script
npx blueprint run setJettonWallet --testnet [CROWDFUNDING_ADDRESS] [JETTON_WALLET_ADDRESS]

# Или интерактивно
npx blueprint run setJettonWallet --testnet
```

## Проверка конфигурации

После установки jetton wallet address проверьте:

1. **Адрес установлен**: вызовите getter для проверки
2. **Jetton wallet принадлежит контракту**: убедитесь что owner = CrowdfundingMaster
3. **Jetton wallet имеет достаточный баланс** для распределения

## Пример полного процесса

```bash
# 1. Деплой CrowdfundingMaster
npx blueprint run deployCrowdfundingMaster --testnet [JETTON_MASTER_ADDRESS] 0.001

# Результат: CROWDFUNDING_MASTER_ADDRESS="EQD..."

# 2. Получить jetton wallet address
# (используя jetton master get_wallet_address)
JETTON_WALLET_ADDRESS="EQD..."

# 3. Установить jetton wallet
npx blueprint run setJettonWallet --testnet [CROWDFUNDING_MASTER_ADDRESS] [JETTON_WALLET_ADDRESS]

# 4. Пополнить jetton wallet токенами для распределения
# (зависит от типа jetton contract)
```

## Альтернативные подходы

### Подход 1: Pre-calculated addresses

Некоторые инструменты позволяют заранее вычислить адреса:

- Использовать тот же init hash что и будет при деплое
- Запросить jetton wallet для вычисленного адреса
- Задеплоить с известным jetton wallet

### Подход 2: Factory pattern

- Создать factory contract который деплоит CrowdfundingMaster
- Factory знает адреса заранее и может их координировать
- Более сложно, но решает циклическую зависимость

## Безопасность

⚠️ **Важно**: 
- Убедитесь что jetton wallet действительно принадлежит CrowdfundingMaster
- Проверьте что у вас есть права на установку (только owner)
- Jetton wallet должен иметь достаточный баланс для операций

## Troubleshooting

**Ошибка "Master jetton wallet not set"**:
- Убедитесь что вызвали SetJettonWallet
- Проверьте что адрес не нулевой

**Ошибка при transfere jetton'ов**:
- Проверьте баланс master jetton wallet
- Убедитесь что jetton wallet принадлежит CrowdfundingMaster
- Проверьте что jetton master contract поддерживает transfer'ы 