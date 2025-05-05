import "@stdlib/deploy";
import "@stdlib/ownable";
import "./models";
import "./bond_token";


    contract Crowdfunding with Deployable, Ownable {
        owner: Address;
        goal: Int as uint64;
        campaignDeadline: Int as uint64;
        claimingStart: Int as uint64;
        FEE: Int = ton("0.1");


    // TODO: make goal and campaignDeadline params with init
    // goal: Int, 
    // campaignDeadline: Int
    init() {
        self.campaignDeadline = now() + 1700;
        self.claimingStart = self.campaignDeadline + 1700;
        require(self.campaignDeadline < self.claimingStart, "claiming start must be greater then camp deadline");
        self.owner = sender();
        self.goal = ton("8");
    }

    
    // receive donate from backers
    receive("donate") {
        require(now() < self.campaignDeadline, "Cannot donate after campaign campaignDeadline");
        let ctx: Context = context();
        let bond: StateInit = initOf BondToken(myAddress(), ctx.sender);
        send(SendParameters{
                to: contractAddress(bond), 
                value: 0,
                mode: SendBounceIfActionFail & SendRemainingValue,
                body: Bond{ammount: ctx.value}.toCell(),
                code: bond.code,
                data: bond.data
            })
    }


    // this message calling from token contract
    // refund available when deadline is out and claim start is not yet arrived
    // no available if the goal has been achieved
    receive(msg: Refund) {
        require(now() >= self.campaignDeadline, "Refund are not possible for ongoing campaign");
        require(myBalance() < self.goal, "Cannot get refund if campaign finished");
        let bond: StateInit = initOf BondToken(myAddress(), msg.to);
        require(sender() == contractAddress(bond), "Only backers can refund");
        send(SendParameters{
            to: msg.to, 
            value: msg.ammount - self.FEE,
            mode: SendRemainingValue | SendIgnoreErrors
        })
    }

    // when contract owner wants get all fund
    // available when claimingStart time arrived
    receive("claim") {
        require(sender() == self.owner, "Only contract owner can claim funds");   
        require(now() >= self.claimingStart, "Cannot claim before claim start period");
        send(SendParameters{
            to: sender(), 
            value: myBalance() - self.FEE,
            mode: SendRemainingValue | SendIgnoreErrors
        })
    }


    get fun balance(): Int {
        return myBalance();
    }

    get fun campaignDeadline(): Int {
        return self.campaignDeadline
    }

    get fun claimingStart(): Int {
        return self.claimingStart
    }

}
