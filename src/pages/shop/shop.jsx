import React, { useState, useEffect } from 'react';
import './shop.module.css'; 
const { ethers } = require("ethers");

function Shop() {
  const [pokemonCards, setPokemonCards] = useState([]);
  const [userCoins, setUserCoins] = useState(0);
  const [contract, setContract] = useState(null);
  const [purchaseConfirmation, setPurchaseConfirmation] = useState(null);

  useEffect(() => {
    async function initContract() {
      const provider = new ethers.JsonRpcProvider();
      const contractAddress = 'YOUR_CONTRACT_ADDRESS';
      const contractABI = ['YOUR_CONTRACT_ABI'];
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      setContract(contract);
      await getNFTsOnSale();
      await checkUserRegistration();
    }

    initContract();
  }, []);

  const getNFTsOnSale = async () => {
    if (!contract) return;
    const nftsOnSale = await contract.getNFTsOnSale();
    setPokemonCards(nftsOnSale);
  };

  const checkUserRegistration = async () => {
    if (!contract) return;
    const [registered, name, coins] = await contract.isRegistered();
    if (registered) {
      setUserCoins(coins);
    } else {
      alert("You are not registered.");
    }
  };

  const buyNFT = async (nftId, sellingPrice) => {
    if (userCoins < sellingPrice) {
      alert("You don't have sufficient coins to buy this card.");
      return;
    }
    if (!window.confirm(`Are you sure you want to purchase the card with ID ${nftId} for ${sellingPrice} coins?`)) {
      return;
    }
    try {
      await contract.buyNFT(nftId);
      setPurchaseConfirmation({ nftId, sellingPrice });
      await getNFTsOnSale(); 
      await checkUserRegistration(); 
    } catch (error) {
      alert(error.message);
    }
  };
  

  const confirmPurchase = () => {
    setUserCoins(userCoins - purchaseConfirmation.sellingPrice);
    setPurchaseConfirmation(null);
  };

  return (
    <div className="container">
      <h1>The Pokemon Card Shop</h1>
      <div className="user-info">
        <p>Your Coins: {userCoins}</p>
      </div>
      {purchaseConfirmation && (
        <div className="purchase-confirmation">
          <p>Successfully purchased NFT with ID: {purchaseConfirmation.nftId}</p>
          <p>Your new balance: {userCoins - purchaseConfirmation.sellingPrice}</p>
          <button onClick={confirmPurchase}>Confirm</button>
        </div>
      )}
      <div className="pokemon-cards">
        {pokemonCards.map((nftId, index) => (
          <div className="pokemon-card" key={index}>
            <h2>NFT ID: {nftId}</h2>
            <button onClick={() => buyNFT(nftId)}>Buy</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Shop;
