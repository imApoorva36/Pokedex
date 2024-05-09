
const { ethers } = require('hardhat');
async function main() { 
    // Deploy NFTMarketplace contract
    const NFTMarketplace = await ethers.getContractFactory('NFTMarketplace');
    const nftMarketplace = await NFTMarketplace.deploy({
        gasLimit: 6000000, // Specify the gas limit according to your contract's deployment requirements
        gasPrice: ethers.utils.parseUnits('10', 'gwei'), // Specify the gas price (in gwei)
    });

    console.log('NFTMarketplace deployed to:', await nftMarketplace.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
