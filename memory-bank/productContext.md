# PRODUCT CONTEXT: TON Crowdfunding Platform

## 🎯 BUSINESS CONTEXT

### Target Audience
- **Проект-краудфандеры**: Команды, запускающие краудфандинг кампании
- **Инвесторы**: Пользователи, желающие инвестировать TON в проекты
- **TON экосистема**: Участники блокчейна TON

### Business Problem
Отсутствие надежных и прозрачных механизмов краудфандинга в экосистеме TON с возможностью безопасного возврата средств.

## 💡 PRODUCT VISION

**Видение**: Создать надежную и масштабируемую платформу краудфандинга на TON, где инвесторы могут безопасно вкладывать средства с гарантией возможности возврата.

## 🎮 USER STORIES

### Investor Stories
```
AS AN investor
I WANT TO invest TON and receive jettons
SO THAT I can participate in crowdfunding campaigns

AS AN investor  
I WANT TO refund my jettons
SO THAT I can get my TON back at the original purchase price

AS AN investor
I WANT TO see my investment history
SO THAT I can track my participation
```

### Admin Stories
```
AS AN admin
I WANT TO set jetton price
SO THAT I can control the exchange rate

AS AN admin
I WANT TO change jetton price over time
SO THAT I can adapt to market conditions

AS AN admin
I WANT TO monitor the crowdfunding progress
SO THAT I can make informed decisions
```

## 🔄 USER FLOW

### Investment Flow
1. Пользователь отправляет TON на мастер-контракт
2. Система создает/обновляет пользовательский контракт
3. Jetton'ы зачисляются на баланс пользователя
4. Сохраняется история покупки с текущей ценой

### Refund Flow
1. Пользователь инициирует возврат jetton'ов
2. Система проверяет баланс и историю покупок
3. Рассчитывается сумма к возврату по исторической цене
4. TON возвращаются пользователю

### Admin Flow
1. Администратор устанавливает новую цену
2. Обновляется текущая цена в мастер-контракте
3. Новые покупки происходят по новой цене
4. Старые покупки сохраняют историческую цену для refund

## 📊 BUSINESS METRICS

### Success Indicators
- Общий объем привлеченных TON
- Количество активных инвесторов
- Процент успешных refund операций
- Среднее время выполнения транзакций

### Revenue Model
- Комиссия с транзакций покупки (например, 1-2%)
- Комиссия с refund операций
- Административные сборы

## 🔐 SECURITY REQUIREMENTS

### Financial Security
- Безопасное хранение TON в контрактах
- Защита от реентрантности атак
- Валидация всех входящих транзакций

### Access Control
- Только администратор может менять цену
- Только владелец может делать refund
- Защита от несанкционированного доступа

## 🎨 UX PRINCIPLES

### Simplicity
- Простой процесс инвестирования (один клик)
- Понятный интерфейс refund
- Прозрачная история операций

### Trust
- Открытый исходный код контрактов
- Аудируемая история транзакций
- Гарантированный возврат средств

## 🚀 COMPETITIVE ADVANTAGES

1. **Гарантированный refund** по исторической цене
2. **Масштабируемая архитектура** с индивидуальными контрактами
3. **Прозрачность** всех операций в блокчейне
4. **Низкие комиссии** благодаря TON
5. **Быстрые транзакции** в сети TON

## 📈 GROWTH STRATEGY

### Phase 1: MVP Launch
- Базовая функциональность краудфандинга
- Простой refund механизм
- Административная панель

### Phase 2: Enhanced Features
- Множественные краудфандинг кампании
- Расширенная аналитика
- Интеграция с TON кошельками

### Phase 3: Ecosystem Integration
- API для внешних проектов
- Интеграция с DeFi протоколами
- Мобильные приложения

## 🎯 SUCCESS CRITERIA

### Technical Success
- ✅ Контракты успешно деплоятся в testnet
- ✅ Все транзакции выполняются корректно
- ✅ Refund работает без ошибок

### Business Success
- ✅ Привлечение первых 100 инвесторов
- ✅ Общий объем инвестиций 1000+ TON
- ✅ 0% неуспешных refund операций 