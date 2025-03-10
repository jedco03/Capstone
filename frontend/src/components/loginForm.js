import React, { useState } from 'react';
import axios from 'axios';
import api from './axiosInstance';
import { useNavigate } from 'react-router-dom';
import '../myStyles.css';

function LoginForm({ isAuthenticated, setIsAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      const response = await api.post(
        'https://localhost:7096/api/auth/authenticate',
        { username, password }
      );
  
      if (response.data.token) { // Ensure token is received
        localStorage.setItem('token', response.data.token);  // Store JWT token
        localStorage.setItem('userRole', response.data.role); // Store user role
        localStorage.setItem('userId', response.data.userId); 
        localStorage.setItem('userName', response.data.name);
        console.log('Login successful!');
        console.log("Logged in as:", response.data.role);
        setIsAuthenticated(true);
        
        navigate('/home'); // Redirect to home
      } else {
        console.error("No token received from server.");
        setLoginError("Authentication failed.");
      }
  
    } catch (error) {
      console.log(error);
      setLoginError("Invalid username or password");
    }
  };
  
  

  return (
    <div>
      <div className='loginForm'>
        <img src="/SACLOGO.png" alt="Login Logo"/>
        <div className="inputcontainer">
          <div className='inputBox'>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)} 
              required
            />
            <span>Username</span>
          </div>
          <div className='inputBox'>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span>Password</span>
          </div>
          <button type="button" onClick={handleSubmit}>Login</button> 
          {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
