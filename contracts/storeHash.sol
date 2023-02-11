pragma solidity >=0.4.22 <0.9.0;

contract storeHash{
    mapping(uint=>string) public hashes;

    function setHash( uint time, string memory hash)public {
        hashes[time]=hash;
    }
    function get(uint time) public view returns(string memory){
        return hashes[time];
    }
}
