# Crowdfunding


## 1. Описание контракта в файле example_jetton_transfer.tact
В этом контракте попытка сделать метод, который получает TON, проверяет сумму (TODO) и отдает нужное количество токенов.
Токены выпущены стандартные: https://testnet.tonviewer.com/kQCKAaH-aOwVULH3Fonkbh9QUBCEYJHQjMjagS8W7qQL5H6G
Пытался разными вариантами сделать перевод, используя официальную доку Tact и GPT.
Ошибки, которые получаю:
https://testnet.tonviewer.com/transaction/43ff65446d4ccd4e6ef753b8544091a1b93d3538c4a09f54d21ae37d26d41aff
https://testnet.tonviewer.com/transaction/8cbd2ea4eda6cac07afb3a6665ca7800d2c35698a02e25d96e0602b43fbac150
https://testnet.tonviewer.com/transaction/ae1254a51dc4b156e3ccfc61449f485c048f1163c8222d5de803eb58d01d94f6

Попытки тестирования можно тут посмотреть:
https://testnet.tonviewer.com/0QDzRH3qt0upN6dgd5VOmHDv_fBApIm7G_NVl-ZXD0So7qCg

## 2. Описание задачи, которую в принципе хотим решить
Есть стандартный Jetton смарт-контракт, размещенный на тестнете, вот пример: https://testnet.tonviewer.com/kQBVBwxnLrS2HMxf8ZGUJHORraGP1I5kLDjVB3cby8V6HeAp
Нужно разработать смарт-контракт, который:
> принимает оплату в TON (если возможно - USDT)
> хранит в себе два курса - курс продажи (sellRate, он всегда растет, его можно менять с помощью offchain механизма) и курс покупки (курс стабильный, byeRate)
> также в смарт контракте есть 2 дедлайна: fundrisingDeadline и claimStart, которые задаются в init
> (donate) при поступлении ton до наступления fundrisingDeadline смарт-контракт выдает на адрес sender() токены из стандартного смарт-контракта по курсу продажи
> до наступления fundrisingDeadline можно отправить токены обратно на контракт и вернуть TON по курсу покупки а вычетом gas (const или calculate значение)
> claimStart > fundrisingDeadline например на 2 недели
> до наступления fundrisingDeadline владелец контракта не может получить деньги
> (claim) с смарт контракта можно получить все деньги если ты владелец и fundrusingGoal < баланс контракта
> (claim) с смарт контракта можно получить все деньги при наступлении claimStart, даже если fundrusingGoal > баланс контракта
> 1 смарт-контракт == 1 jetton