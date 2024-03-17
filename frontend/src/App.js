import { useState } from 'react';
import { BrowserRouter, Routes, Route , Navigate } from 'react-router-dom'; 
import LoginPage from './pages/LoginPage';
import HomePage from './pages/Home';
import './myStyles.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={ <LoginPage setIsAuthenticated={setIsAuthenticated}  /> } /> 
          <Route path="/home" element={ isAuthenticated ? <HomePage /> : <Navigate replace to="/" /> } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
