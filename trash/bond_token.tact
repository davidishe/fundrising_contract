import "@stdlib/deploy";
import "./models";


contract BondToken with Deployable {
    campaign: Address;
    backer: Address;
    donation: Int as uint64;
    refunded: Bool;

    init(campaign: Address, backer: Address) {
        self.campaign = campaign;
        self.backer = backer;
        self.donation = 0;
        self.refunded = false;
    }

    receive(msg: Bond) {
        require(sender() == self.campaign, "Unauthorized attempt");
        self.donation += msg.ammount;
    }


    // using this call for get all refund to user from faund
    receive("get refund") {
        require(!self.refunded, "Already refunded or pending refund");
        self.refunded = true;
        send(SendParameters{
            to: self.campaign, 
            value: 0,
            mode: SendBounceIfActionFail,
            body: Refund{to: self.backer, ammount: self.donation}.toCell()
        })
    }

    bounced(msg: bounced<Refund>) {
        self.refunded = false;
    }

}