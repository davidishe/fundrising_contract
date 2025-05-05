import { Address, Cell, toNano } from '@ton/core';
import { ExampleJettonTransfer } from '../wrappers/ExampleJettonTransfer';
import { NetworkProvider } from '@ton/blueprint';


export async function run(provider: NetworkProvider) {


    const base64 = "te6cckECEgEAAygAART/APSkE/S88sgLAQIBYgMCABug9gXaiaH0AfSB9IGoYQICzA8EAgFICAUCASAHBgCDIAg1yHtRND6APpA+kDUMATTH4IQF41FGVIguoIQe92X3hO6ErHy4sXTPzH6ADAToFAjyFAE+gJYzxYBzxbMye1UgANs7UTQ+gD6QPpA1DAH0z/6APpAMFFRoVJJxwXy4sEnwv/y4sKCCJiWgKoAFqAWvPLiw4IQe92X3sjLHxXLP1AD+gIizxYBzxbJcYAYyMsFJM8WcPoCy2rMyYBA+wBAE8hQBPoCWM8WAc8WzMntVIAIBIA0JA/c7UTQ+gD6QPpA1DAI0z/6AFFRoAX6QPpAU1vHBVRzbXBUIBNUFAPIUAT6AljPFgHPFszJIsjLARL0APQAywDJ+QBwdMjLAsoHy//J0FANxwUcsfLiwwr6AFGooYIImJaAggiYloAStgihggiYloCgGKEn4w8l1wsBwwAjgDAsKAHbCALCOIYIQ1TJ223CAEMjLBVAIzxZQBPoCFstqEssfEss/yXL7AJM1bCHiA8hQBPoCWM8WAc8WzMntVAAOEEkQODdfBABwUnmgGKGCEHNi0JzIyx9SMMs/WPoCUAfPFlAHzxbJcYAYyMsFJM8WUAb6AhXLahTMyXH7ABAkECMB9QD0z/6APpAIfAB7UTQ+gD6QPpA1DBRNqFSKscF8uLBKML/8uLCVDRCcFQgE1QUA8hQBPoCWM8WAc8WzMkiyMsBEvQA9ADLAMkg+QBwdMjLAsoHy//J0AT6QPQEMfoAd4AYyMsFUAjPFnD6AhfLaxPMghAXjUUZyMsfGYA4Amss/UAf6AiLPFlAGzxYl+gJQA88WyVAFzCORcpFx4lAIqBOgggiYloCqAIIImJaAoKAUvPLixQTJgED7ABAjyFAE+gJYzxYBzxbMye1UAgHUERAAET6RDBwuvLhTYAC7CDHAJJfBOAB0NMDAXGwlRNfA/AL4PpA+kAx+gAxcdch+gAx+gAwAtMfghAPin6lUiC6lTE0WfAI4IIQF41FGVIgupYxREQD8AngNYIQWV8HvLqTWfAK4F8EhA/y8IGzFob4="; // получили с помощью внешней либы

    // Преобразуем в Cell
    const jettonWalletCode = Cell.fromBase64(base64);  // вставьте base64-код Cell JettonWallet
    const jettonMasterAddress = Address.parse("kQCKAaH-aOwVULH3Fonkbh9QUBCEYJHQjMjagS8W7qQL5H6G"); // адрес мастера jetton'ов
    // kQCKAaH-aOwVULH3Fonkbh9QUBCEYJHQjMjagS8W7qQL5H6G - 

    const exampleJettonTransfer = provider.open(await ExampleJettonTransfer.fromInit(jettonWalletCode, jettonMasterAddress));

    await exampleJettonTransfer.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(exampleJettonTransfer.address, 120000);
    console.log(`Контракт задеплоен по адресу: ${exampleJettonTransfer.address.toString()}`);

    // run methods on `exampleJettonTransfer`

}
