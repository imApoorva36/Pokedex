import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import NFTMarketplace from "./artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
import "./App.css";

function App() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [connectedAddress, setConnectedAddress] = useState(null);
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [nftsOnSale, setNFTsOnSale] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userName, setUserName] = useState("");
  const [userCoins, setUserCoins] = useState(0);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const url = "https://pokeapi.co/api/v2/pokemon/";

  useEffect(() => {
    async function initialize() {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);

        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setConnectedAddress(accounts[0]);
        }

        const contractAddress = "0x8e8dFf4D3E88A2813b4694c9008dAe89F0fc72a4";
        const contract = new ethers.Contract(
          contractAddress,
          NFTMarketplace.abi,
          provider.getSigner()
        );
        setContract(contract);

        const [registered, name, coins] = await contract.isRegistered();
        setIsRegistered(registered);
        setUserName(name);
        setUserCoins(coins.toString());
        console.log(registered);
        console.log(name);
        console.log(coins.toString());

        if (registered) {
          const owned = await contract.getOwnedNFTs();
          setOwnedNFTs(owned);
        }

        const onSale = await contract.getNFTsOnSale();
        console.log(onSale);
        setNFTsOnSale(onSale);
      } else {
        console.log("MetaMask is not installed");
      }
    }

    initialize();
  }, []);

  const connectToMetaMask = async () => {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        setConnectedAddress(accounts[0]);
      }
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
    }
  };

  const callContractFunction = async (functionName, args) => {
    try {
      const response = await contract[functionName](...args);
      console.log(`${functionName} response:`, response);
      // Update UI as needed after function call
    } catch (error) {
      console.error(`Error calling ${functionName}:`, error);
    }
  };

  const registerUser = async () => {
    try {
      await contract.registerUser(nameInput);
      setIsRegistered(true);
      setUserName(nameInput);
      setUserCoins(100);
      setShowRegisterModal(false);
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };

  const mintNFT = async () => {
    try {
      // Fetch a random Pokémon from the PokeAPI
      const id = Math.floor(Math.random() * 150) + 1;
      const pokeUrl = `${url}${id}`;
      const response = await fetch(pokeUrl);
      const data = await response.json();

      // Extract necessary information from the API response
      const pokeImageUrl = data.sprites.other.dream_world.front_default;

      // Mint the NFT using the fetched Pokémon URL
      await contract.mintNFT(pokeImageUrl);
      console.log("NFT Minted:", pokeImageUrl);
      // You might want to refresh the data after minting
    } catch (error) {
      console.error("Error minting NFT:", error);
    }
  };

  const putNFTForSale = async (nftId) => {
    try {
      const sellingPrice = prompt("Enter the selling price for this NFT:");
      if (sellingPrice === null || sellingPrice === "") {
        return;
      }
      await callContractFunction("sellNFT", [nftId, parseInt(sellingPrice)]);
      const owned = await contract.getOwnedNFTs();
      setOwnedNFTs(owned);
    } catch (error) {
      console.error("Error putting NFT for sale:", error);
    }
  };

  const buyNFT = async (nftId) => {
    try {
      await callContractFunction("buyNFT", [nftId]);
      // Refresh owned NFTs after buying
      const owned = await contract.getOwnedNFTs();
      setOwnedNFTs(owned);
      // Refresh NFTs on sale after buying
      const onSale = await contract.getNFTsOnSale();
      setNFTsOnSale(onSale);
    } catch (error) {
      console.error("Error buying NFT:", error);
    }
  };

  const fetchAndGenerateCard = async (pokeUrl, card) => {
    try {
      const response = await fetch(pokeUrl);
      const data = await response.json();
      generateCard(data, card);
    } catch (error) {
      console.error("Error fetching Pokemon data:", error);
    }
  };

  const generateCard = (data, card) => {
    console.log(data);
    const hp = data.stats[0].base_stat;
    const imgSrc = data.sprites.other.dream_world.front_default;
    const pokeName = data.name[0].toUpperCase() + data.name.slice(1);
    const statAttack = data.stats[1].base_stat;
    const statDefense = data.stats[2].base_stat;
    const statSpeed = data.stats[5].base_stat;

    const themeColor = typeColor[data.types[0].type.name];
    console.log(themeColor);

    card.innerHTML = `
      <p class="hp">
        <span>HP</span>
        ${hp}
      </p>
      <img src=${imgSrc} />
      <h2 class="poke-name">${pokeName}</h2>
      <div class="types"></div>
      <div class="stats">
        <div>
          <h3>${statAttack}</h3>
          <p>Attack</p>
        </div>
        <div>
          <h3>${statDefense}</h3>
          <p>Defense</p>
        </div>
        <div>
          <h3>${statSpeed}</h3>
          <p>Speed</p>
        </div>
      </div>
    `;
    appendTypes(data.types);
    styleCard(themeColor);
  };

  const appendTypes = (types) => {
    types.forEach((item) => {
      let span = document.createElement("SPAN");
      span.textContent = item.type.name;
      document.querySelector(".types").appendChild(span);
    });
  };

  const styleCard = (color, card) => {
    // const card = document.getElementById("card");
    card.style.background = `radial-gradient(circle at 50% 0%, ${color} 36%, #ffffff 36%)`;
    card.querySelectorAll(".types span").forEach((typeColor) => {
      typeColor.style.backgroundColor = color;
    });
  };

  return (
    <div className="container">
      <h1>My DApp</h1>
      <p className="address">Connected Address: {connectedAddress}</p>
      {connectedAddress ? (
        <div className="user-section">
          <div className="user-info">
            <p>User: {isRegistered ? userName : "Not registered"}</p>
            <p>Coins: {isRegistered ? userCoins : "0"}</p>
          </div>
          {isRegistered && (
            <div className="owned-nfts">
              <h2>Owned NFTs</h2>
              <ul className="nft-list">
                {ownedNFTs.map((nft) => (
                  <li key={nft.indPos} className="nft-item">
                    <img
                      src={nft.pokeURL}
                      alt={nft.pokeURL}
                      className="nft-image"
                    />
                    <button
                      onClick={() => putNFTForSale(nft.indPos)}
                      className="sale-btn"
                    >
                      Put for Sale
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="nfts-on-sale">
            <h2>NFTs on Sale</h2>
            <ul className="nft-list">
              {nftsOnSale.map((nft) => (
                <li key={nft.indPos} className="nft-item">
                  <img
                    src={nft.pokeURL}
                    alt={nft.pokeURL}
                    className="nft-image"
                  />
                  <button
                    onClick={() => buyNFT(nft.indPos)}
                    className="buy-btn"
                  >
                    Buy for {nft.sellingPrice.toString()} coins
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {!isRegistered && (
            <button
              onClick={() => setShowRegisterModal(true)}
              className="register-btn"
            >
              Register
            </button>
          )}
          <button onClick={connectToMetaMask} className="connect-btn">
            Connect to MetaMask
          </button>
          <button onClick={mintNFT} className="mint-btn">
            Mint NFT
          </button>
          <button
            onClick={() => callContractFunction("getOwnedNFTs", [])}
            className="get-owned-btn"
          >
            Get Owned NFTs
          </button>
          <button
            onClick={() => callContractFunction("getNFTsOnSale", [])}
            className="get-sale-btn"
          >
            Get NFTs on Sale
          </button>
        </div>
      ) : (
        <button onClick={connectToMetaMask} className="connect-btn">
          Connect to MetaMask
        </button>
      )}

      {showRegisterModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowRegisterModal(false)}>
              &times;
            </span>
            <h2>Register User</h2>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Enter your name"
              className="name-input"
            />
            <button onClick={registerUser} className="register-user-btn">
              Register
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
