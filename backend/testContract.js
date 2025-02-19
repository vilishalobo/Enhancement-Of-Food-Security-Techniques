require("dotenv").config();
const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545"); // Hardhat local blockchain
const contractABI = require("./SupplyChainABI.json"); // Ensure this file is correct
const contractAddress = deployedConfig.contractAddress; // Replace with your actual contract address

const wallet = new ethers.Wallet("ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider); // Replace with a Hardhat account private key
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

async function testContract() {
    try {
        console.log("Testing contract...");

        // Fetch total products count
        let productCount = await contract.productCount();
        console.log("Total Products:", Number(productCount));

        // Add a new product
        console.log("Adding new product...");
        const tx = await contract.addProduct("Test Product");
        await tx.wait();
        console.log("✅ Product added!");

        // Fetch updated product count
        productCount = await contract.productCount();
        console.log("Updated Product Count:", Number(productCount));

        // Fetch the newly added product
        const newProduct = await contract.products(productCount);
        console.log("New Product Details:", newProduct);
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

// Run the test
testContract();
