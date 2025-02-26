import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBlockchain } from "../blockchain"; // Assuming you have a method to get the blockchain data

const Register = ({ setUserRole }) => {
    const [isSignup, setIsSignup] = useState(false);
    const [role, setRole] = useState("Industry");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [account, setAccount] = useState("");

    useEffect(() => {
        const loadBlockchain = async () => {
            const blockchain = await getBlockchain();
            if (blockchain) {
                setAccount(blockchain.account);

                window.ethereum.on("accountsChanged", (accounts) => {
                    setAccount(accounts[0] || "Disconnected");
                });
            }
        };
        loadBlockchain();
    }, []);

    const handleAuth = () => {
        const users = JSON.parse(localStorage.getItem("users")) || {};

        if (isSignup) {
            const addressExists = Object.values(users).some(user => user.address === account && user.role !== role);

            if (addressExists) {
                alert(`This Ethereum address is already registered under a different role!`);
                return;
            }

            if (users[username]) {
                alert("Username already exists. Please log in.");
                return;
            }

            users[username] = { password, role, address: account };
            localStorage.setItem("users", JSON.stringify(users));

            alert("Account created successfully! Please log in.");
            setIsSignup(false);
        } else {
            if (users[username] && users[username].password === password) {
                if (users[username].address !== account) {
                    alert("Ethereum address does not match the registered address for this account.");
                    return;
                }

                setUserRole(users[username].role);
                localStorage.setItem("userRole", users[username].role);

                if (users[username].role === "Industry") {
                    navigate("/industry-dashboard");
                } else if (users[username].role === "Retailer") {
                    navigate("/retailer-dashboard");
                } else {
                    navigate("/customer-dashboard");
                }
            } else {
                alert("Invalid username or password.");
            }
        }
    };

    return (
        <div>
            <p>Connected Account: {account || "Not Connected"}</p>

            <h2>{isSignup ? "Sign Up" : "Login"}</h2>
            <label>Username:</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />

            <label>Password:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            {isSignup && (
                <>
                    <label>Select Role:</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="Industry">Industry</option>
                        <option value="Retailer">Retailer</option>
                        <option value="Customer">Customer</option>
                    </select>

                    <label>Ethereum Address:</label>
                    <input type="text" value={account} disabled />
                </>
            )}

            <button onClick={handleAuth}>{isSignup ? "Sign Up" : "Login"}</button>

            <p>
                {isSignup ? "Already have an account?" : "New user?"}{" "}
                <button onClick={() => setIsSignup(!isSignup)}>
                    {isSignup ? "Login" : "Sign Up"}
                </button>
            </p>
        </div>
    );
};

export default Register;
