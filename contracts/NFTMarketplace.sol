// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract NFTMarketplace {
    struct NFT {
        string pokeURL;
        bool isOnSale;
        uint256 sellingPrice;
        address owner;
        uint256 indPos;
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
    
    function mintNFT(string memory _pokeURL) external {
        uint256 nftId = nextNFTId++;    
        nfts[nftId] = NFT(_pokeURL, false, 0, msg.sender, nftId);
        users[userAddressesToIds[msg.sender]].ownedNFTs.push(nftId);
    }
    
    function getOwnedNFTs() external view returns (NFT[] memory) {
        uint256[] memory ownedNFTIds = users[userAddressesToIds[msg.sender]].ownedNFTs;
        NFT[] memory ownedNFT = new NFT[](ownedNFTIds.length);
    
        for (uint256 i = 0; i < ownedNFTIds.length; i++) {
            ownedNFT[i] = nfts[ownedNFTIds[i]];
        }
        return ownedNFT;
    }
    
    function getNFTsOnSale() external view returns (NFT[] memory) {
        NFT[] memory result = new NFT[](nextNFTId);
        uint256 count = 0;
        for (uint256 i = 0; i < nextNFTId; i++) {
            if (nfts[i].isOnSale) {
                result[count] = nfts[i];
                count++;
            }
        }
        assembly {
            mstore(result, count)
        }
        return result;
    }
    
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
    
    function sellNFT(uint256 _nftId, uint256 _sellingPrice) external {
        require(nfts[_nftId].owner == msg.sender, "You are not the owner of this NFT");
        
        nfts[_nftId].isOnSale = true;
        nfts[_nftId].sellingPrice = _sellingPrice;
    }
    
    function registerUser(string memory _name) external {
        uint256 userId = nextUserId++;
        users[userId].name = _name;
        users[userId].coins = 100; 
        userAddressesToIds[msg.sender] = userId;
    }

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
