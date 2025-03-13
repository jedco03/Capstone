import React from 'react';
import LoginForm from '../components/loginForm.js'; 

function LoginPage() {
  return (
    <div className="LoginPage">
      <div className="loginFormContainer">
        <div className="loginPage">
          <LoginForm /> 
        </div>
      </div>
    </div>
  );
}

export default LoginPage;