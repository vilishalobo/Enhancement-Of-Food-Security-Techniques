import { ethers } from "ethers";
import contractABI from "./SupplyChainABI.json";
import deployedConfig from "./deployedAddress.json";

const CONTRACT_ADDRESS = deployedConfig.contractAddress;// Replace with your contract address

export const getBlockchain = async () => {
    if (!window.ethereum) {
        alert("MetaMask is required!");
        return null;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

    // Automatically request account access
    const accounts = await window.ethereum.request({ method: "eth_accounts" });

    return { contract, signer, account: accounts.length > 0 ? accounts[0] : null };
};
