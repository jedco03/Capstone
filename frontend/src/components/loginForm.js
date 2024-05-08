import React, { useState } from 'react';
import axios from 'axios';
import { useRole } from './useRole'
import { useNavigate } from 'react-router-dom';
import '../myStyles.css';

function LoginForm({ isAuthenticated, setIsAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const selectedRole = document.getElementById('roleSelect').value;
    localStorage.setItem('userRole', selectedRole);

    console.log("Username:", username);
    console.log("Password:", password);

    axios.post('https://localhost:7096/api/auth/authenticate', {
        username,
        password 
      })
      .then(response => {
        setLoginError(null); 
        console.log('Login successful!'); // Check if this gets printed
        setIsAuthenticated(true);  
        navigate('/home');
      })
      .catch(error => {
        console.log(error)
        setLoginError("Invalid username or password");
    });
  };


  return (
    <div>
      <div onSubmit={handleSubmit} className='loginForm'>
      <img src="/SACLOGO.png" alt="Login Logo"/>
        <div className='inputBox'>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)} 
            required="required" 
          />
          <span>Username</span>
        </div>
        <div>
          <div className='inputBox'>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required="required" 
            />
            <span>Password</span>
          </div>
        </div>
        <button type="button" onClick={handleSubmit}>Login</button> 
        {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
        <select id="roleSelect">
          <option value="Dean">Dean</option>
          <option value="SAC">SAC</option>
        </select>
      </div>
    </div>
  );
}

export default LoginForm;