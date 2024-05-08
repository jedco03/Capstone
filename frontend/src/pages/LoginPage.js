import React from 'react';
import LoginForm from '../components/loginForm'; 

function LoginPage({ setIsAuthenticated }) {
    return (
        <div className="LoginPage">
            <div className='loginFormContainer'>
                <div className='loginPage'>
                    <form className="loginForm">
                    <LoginForm setIsAuthenticated={setIsAuthenticated} /> 
                    </form>
                </div>
            </div>
        </div>
    );
  } 

export default LoginPage;