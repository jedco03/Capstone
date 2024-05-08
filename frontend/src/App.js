import { useState } from 'react';
import { BrowserRouter, Routes, Route , Navigate } from 'react-router-dom'; 
import LoginPage from './pages/LoginPage';
import HomePage from './pages/Home';
import ExpandedRecord from './components/ExpandedRecord';
import AddRecordPage from './pages/AddRecord';
import './myStyles.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={ <LoginPage setIsAuthenticated={setIsAuthenticated}  /> } /> 
          <Route path="/home" element={<HomePage />} /> 
          <Route path="/home/expanded-record/:studentId" element={<ExpandedRecord />} />
          <Route path="/addrecord" element={<AddRecordPage />} />
          {/*<Route path="/reports-summary" element={<ReportsSummaryPage />} /> 
          {/* ... routes for other pages */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
