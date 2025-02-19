const fs = require("fs");
const hre = require("hardhat");

async function main() {
  let contractAddress = null;

  // Check if contract is already deployed
  const filePath = "./deployedAddress.json";
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    contractAddress = data.contractAddress;
    console.log("✅ Using existing deployed contract at:", contractAddress);
  }

  if (!contractAddress) {
    console.log("🚀 Deploying new contract...");
    const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
    const supplyChain = await SupplyChain.deploy();
    await supplyChain.waitForDeployment();

    contractAddress = await supplyChain.getAddress();
    console.log("🎉 Contract deployed to:", contractAddress);

    // Save the address to a file
    fs.writeFileSync(filePath, JSON.stringify({ contractAddress }));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
