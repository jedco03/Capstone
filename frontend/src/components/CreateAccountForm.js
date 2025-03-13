import React, { useState } from "react";
import axios from "axios";
import api from "./axiosInstance";

const CreateAccountForm = ({ colleges, onCreateAccount, setError, setLoading, setShowOverlay }) => {
  
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [newAccount, setNewAccount] = useState({
    username: "",
    name: "",
    email: "",
    role: "dean",
    college: "",
    password: "",
  });

  const handleCreateAccount = async (e) => {
    setLoadingAccounts(true);
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
        // Hash the password
        const hashedPassword = await api.post("/auth/hash", {
            password: newAccount.password,
        });

        // Create the account payload
        const accountPayload = {
            ...newAccount,
            PasswordHash: hashedPassword.data,
        };

        // Send the request to create the account
        const response = await api.post("/auth/register", accountPayload, {
            headers: { "Content-Type": "application/json" },
        });

        if (response.data) {
            // Reset form and close modal
            onCreateAccount(response.data);
            setNewAccount({
                username: "",
                name: "",
                email: "",
                role: "Dean",
                college: "",
                password: "",
            });
            setShowOverlay(false);
        }
    } catch (err) {
        console.error("Error creating account:", err.response?.data || err.message);
        setError("Failed to create account.");
    }
    setLoadingAccounts(false);
};
  

  return (
    <div className="FM-overlay">
      <div className="FM-modal-content">
        <h2>Create New Account</h2>
        <p>Fill in the details to create a new account.</p>
        <form onSubmit={handleCreateAccount}>
          {/* Row 1: Username & Name */}
          <div className="FM-row">
            <div className="FM-form-group">
              <label>Username:</label>
              <input
                type="text"
                value={newAccount.username}
                onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })}
                className="FM-input"
                required
              />
            </div>
            <div className="FM-form-group">
              <label>Name:</label>
              <input
                type="text"
                value={newAccount.name}
                onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                className="FM-input"
                required
              />
            </div>
          </div>

          {/* Row 2: Email */}
          <div className="FM-row">
            <div className="FM-form-group FM-full-width">
              <label>Email:</label>
              <input
                type="email"
                value={newAccount.email}
                onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                className="FM-input"
                required
              />
            </div>
          </div>

          {/* Row 3: Role & College (College only shows if role is 'Dean') */}
          <div className="FM-row">
            <div className="FM-form-group">
              <label>Role:</label>
              <select
                value={newAccount.role}
                onChange={(e) => setNewAccount({ ...newAccount, role: e.target.value, college: "" })}
                className="FM-select"
              >
                <option value="Dean">Dean</option>
                <option value="Guard">Guard</option>
                <option value="SAC">SAC</option>
              </select>
            </div>

            {newAccount.role === "dean" && (
              <div className="FM-form-group">
                <label>College:</label>
                <select
                  value={newAccount.college}
                  onChange={(e) => setNewAccount({ ...newAccount, college: e.target.value })}
                  className="FM-select"
                  required={newAccount.role === "dean"}
                >
                  <option value="">Select College</option>
                  {colleges.map((college) => (
                    <option key={college.id} value={college.id}>
                      {college.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Row 4: Password */}
          <div className="FM-row">
            <div className="FM-form-group FM-full-width">
              <label>Password:</label>
              <input
                type="password"
                value={newAccount.password}
                onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                className="FM-input"
                required
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="FM-button-group">
            <button type="button" className="FM-cancel-btn" onClick={() => setShowOverlay(false)}>
              Cancel
            </button>
            <button type="submit" className="FM-submit-btn">Create Account</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAccountForm;
