import React, { useState } from 'react';
import axios from 'axios';
import bcrypt from 'bcryptjs'; 
import { useNavigate } from 'react-router-dom';
import '../myStyles.css';

function LoginForm({ isAuthenticated, setIsAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

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
    <div onSubmit={handleSubmit} className='loginForm'>
      <div>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username" 
        />
      </div>
      <div>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password" 
        />
      </div>
      <button type="button" onClick={handleSubmit}>Login</button> 
      {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
    </div>
  );
}

export default LoginForm;