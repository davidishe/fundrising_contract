message Donation {
    queryId: Int as uint32;
}

message Bond {
    ammount: Int as uint64;
}

message Refund {
    to: Address;
    ammount: Int as uint64;
}