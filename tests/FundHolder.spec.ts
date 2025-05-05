import { Address, beginCell, toNano } from "@ton/core";
import { FundHolder } from "../build/FundHolder/tact_FundHolder";
import { Blockchain, BlockchainConfig, SandboxContract, SendMessageResult, TreasuryContract } from "@ton/sandbox";
import { debug } from "console";

describe("FundHolder", () => {


    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let fundHolderContract: SandboxContract<FundHolder>;
    let jettonSender: SandboxContract<TreasuryContract>;

    let contractAddress: Address;
    let deployerAddress: Address;


    beforeAll(async () => {

        blockchain = await Blockchain.create();

        fundHolderContract = blockchain.openContract(await FundHolder.fromInit());
        deployer = await blockchain.treasury('deployer');
        jettonSender = await blockchain.treasury('sender');

        const deployResult = await fundHolderContract.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        contractAddress = fundHolderContract.address;
    });

    it("should receive JettonTransferNotification and show dump logs", async () => {
        // Сформировать кастомный forwardPayload с атрибутами
        const forwardPayload = beginCell()
            .storeUint(1001, 32) // tokenType
            .storeUint(9999, 32) // tokenId
            .endCell();

        // Сформировать тело сообщения JettonTransferNotification
        const body = beginCell()
            .storeUint(0x7362d09c, 32) // op code for JettonTransferNotification
            .storeUint(42n, 64) // queryId
            .storeUint(toNano("10"), 64) // amount
            .storeAddress(jettonSender.address) // sender
            .storeAddress(jettonSender.address) // originalOwner
            .storeUint(toNano("0.01"), 64) // forwardTonAmount
            .storeRef(forwardPayload) // forwardPayload
            .endCell();

        const res: SendMessageResult = await fundHolderContract.send(jettonSender.getSender(),
            {
                value: toNano("0.2"),
            },
            {
                $$type: "JettonTransferNotification",
                queryId: 1n,
                amount: toNano("10"),
                sender: jettonSender.address,
                forwardPayload: forwardPayload.asSlice(),
            }
        );

        // Проверим, что дамп был вызван и содержит ожидаемые строки

        res.transactions.forEach(element => {
            console.log(element.debugLogs);
        });


    });
});
