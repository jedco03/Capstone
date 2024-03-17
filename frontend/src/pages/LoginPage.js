import React from 'react';
import LoginForm from '../components/loginForm'; 

function LoginPage({ setIsAuthenticated }) {
    return (
        <div className="LoginPage">
            <div className="loginDesign">
            <img src="/LogoDesigner.png" alt="Login Logo"/>
            </div>
            <div className='loginFormContainer'>
                <div className='loginPage'>
                    <form className="loginForm">
                    <img src="/SACLOGO.png" alt="Login Logo"/>
                    <LoginForm setIsAuthenticated={setIsAuthenticated} /> 
                    </form>
                </div>
            </div>
        </div>
    );
  } 

export default LoginPage;