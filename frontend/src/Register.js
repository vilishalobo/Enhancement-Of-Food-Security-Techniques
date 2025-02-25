import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBlockchain } from "./blockchain"; // Assuming you have a method to get the blockchain data

const Register = ({ setUserRole }) => {
    const [isSignup, setIsSignup] = useState(false);
    const [role, setRole] = useState("Industry");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [address, setAddress] = useState("");
    const navigate = useNavigate();

    // Fetch blockchain account (MetaMask address)
    useEffect(() => {
        const loadBlockchain = async () => {
            const blockchain = await getBlockchain();
            if (blockchain) {
                setAddress(blockchain.account);
            }
        };
        loadBlockchain();
    }, []);

    const handleAuth = () => {
        const users = JSON.parse(localStorage.getItem("users")) || {};

        if (isSignup) {
            // **Check if Ethereum address is already used for a different role**
            const addressExists = Object.values(users).some(user => user.address === address && user.role !== role);

            if (addressExists) {
                alert(`This Ethereum address is already registered under a different role!`);
                return;
            }

            // **Check if username already exists**
            if (users[username]) {
                alert("Username already exists. Please log in.");
                return;
            }

            // **Store username, password, role, and unique Ethereum address**
            users[username] = { password, role, address };
            localStorage.setItem("users", JSON.stringify(users));

            alert("Account created successfully! Please log in.");
            setIsSignup(false);
        } else {
            // **Login validation**
            if (users[username] && users[username].password === password) {
                // **Ensure Ethereum address matches the stored one for the user**
                if (users[username].address !== address) {
                    alert("Ethereum address does not match the registered address for this account.");
                    return;
                }

                setUserRole(users[username].role);
                localStorage.setItem("userRole", users[username].role);

                // Redirect based on role
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
                </>
            )}

            {/* Display Ethereum Address for Sign Up */}
            {isSignup && address && (
                <>
                    <label>Ethereum Address:</label>
                    <input type="text" value={address} disabled />
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
