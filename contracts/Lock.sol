// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract Lock {
    uint public unlockTime;
    address payable public owner;

    event Withdrawal(uint amount, uint when);

    constructor(uint _unlockTime) payable {
        require(
            block.timestamp < _unlockTime,
            "Unlock time should be in the future"
        );

        unlockTime = _unlockTime;
        owner = payable(msg.sender);
    }

    function withdraw() public {

        require(block.timestamp >= unlockTime, "You can't withdraw yet");
        require(msg.sender == owner, "You aren't the owner");

        emit Withdrawal(address(this).balance, block.timestamp);

        owner.transfer(address(this).balance);
    }
    struct NFT {
        string pokeURL;
        bool isOnSale;
        uint256 sellingPrice;
        address owner;
    }
    
    struct User {
        string name;
        uint256 coins;
        uint256[] ownedNFTs;
    }
    
    mapping(uint256 => NFT) public nfts;
    mapping(address => uint256) public userAddressesToIds;
    mapping(uint256 => User) public users;
    uint256 public nextUserId;
    uint256 public nextNFTId;
    
    // Function to mint an NFT
    function mintNFT(string memory _pokeURL) external {
        uint256 nftId = nextNFTId++;    
        nfts[nftId] = NFT(_pokeURL, false, 0, msg.sender);
        users[userAddressesToIds[msg.sender]].ownedNFTs.push(nftId);
    }
    
    // Function to return list of NFTs owned by the sender
    function getOwnedNFTs() external view returns (uint256[] memory) {
        uint256[] memory ownedNFTs = users[userAddressesToIds[msg.sender]].ownedNFTs;
        return ownedNFTs;
    }
    
    // Function to return list of NFTs currently on sale
    function getNFTsOnSale() external view returns (uint256[] memory) {
        uint256[] memory result = new uint256[](nextNFTId);
        uint256 count = 0;
        for (uint256 i = 0; i < nextNFTId; i++) {
            if (nfts[i].isOnSale) {
                result[count] = i;
                count++;
            }
        }
        assembly {
            mstore(result, count)
        }
        return result;
    }
    
    // Function to buy an NFT
    function buyNFT(uint256 _nftId) external {
        require(nfts[_nftId].isOnSale, "NFT is not on sale");
        require(users[userAddressesToIds[msg.sender]].coins >= nfts[_nftId].sellingPrice, "Insufficient funds");
            
        uint256 sellerUserId = userAddressesToIds[nfts[_nftId].owner];
        uint256 buyerUserId = userAddressesToIds[msg.sender];

        users[buyerUserId].coins -= nfts[_nftId].sellingPrice;
        users[sellerUserId].coins += nfts[_nftId].sellingPrice;
        uint256[] storage sellerNFTs = users[sellerUserId].ownedNFTs;
        for (uint256 i = 0; i < sellerNFTs.length; i++) {
            if (sellerNFTs[i] == _nftId) {
                if (i != sellerNFTs.length - 1)
                    sellerNFTs[i] = sellerNFTs[sellerNFTs.length - 1];
                sellerNFTs.pop();
                break;
            }
        }
        users[buyerUserId].ownedNFTs.push(_nftId);
        nfts[_nftId].owner = msg.sender;
        nfts[_nftId].isOnSale = false;
        nfts[_nftId].sellingPrice = 0;
    }
    
    // Function to sell an NFT
    function sellNFT(uint256 _nftId, uint256 _sellingPrice) external {
        require(nfts[_nftId].owner == msg.sender, "You are not the owner of this NFT");
        
        nfts[_nftId].isOnSale = true;
        nfts[_nftId].sellingPrice = _sellingPrice;
    }
    
    // Function to register a new user
    function registerUser(string memory _name) external {
        uint256 userId = nextUserId++;
        users[userId].name = _name;
        users[userId].coins = 100; 
        userAddressesToIds[msg.sender] = userId;
    }

    // Function to check if a user is registered and return their name and coins count if registered
    function isRegistered() external view returns (bool, string memory, uint256) {
        uint256 userId = userAddressesToIds[msg.sender];
        if (userId == 0) {
            // User is not registered
            return (false, "", 0);
        } else {
            // User is registered, return their name and coins count
            return (true, users[userId].name, users[userId].coins);
        }
    }
}
