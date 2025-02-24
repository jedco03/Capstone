import React, { useState } from 'react';
import axios from 'axios';
import { useRole, setUseRole } from './useRole'
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
  
    try {
      const response = await axios.post(
        'https://localhost:7096/api/auth/authenticate',
        { username, password }, // Credentials
        { headers: { SelectedRole: selectedRole } } // Include selected role in headers
      );
      
      localStorage.setItem('userRole', selectedRole);
      setLoginError(null); // Clear previous errors
      console.log('Login successful!');
      console.log(response.data.role, " and ", selectedRole);
      setIsAuthenticated(true);
  
      // Proceed only if roles match
      if (response.data.role === selectedRole) {
        navigate('/home');
      } else {
        setLoginError("Role mismatch. Please select the correct role.");
      }
    } catch (error) {
      console.log(error);
      setLoginError("Invalid username, password");
    }
  };


  return (
    <div>
      <div onSubmit={handleSubmit} className='loginForm'>
        <img src="/SACLOGO.png" alt="Login Logo"/>
          <div class="inputcontainer">
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
              <select id="roleSelect" class="roleSelect">
                <option value="Dean">Dean</option>
                <option value="SAC">SAC</option>
              </select>
          </div>
      </div>
    </div>
  );
}

export default LoginForm;