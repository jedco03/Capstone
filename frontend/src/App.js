import { useState } from 'react';
import { BrowserRouter, Routes, Route , Navigate } from 'react-router-dom'; 
import LoginPage from './pages/LoginPage';
import HomePage from './pages/Home';
import ExpandedRecord from './components/ExpandedRecord';
import ExpandedRecordDean from './components/Dean/ExpandedRecordsDean';
import AddRecordPage from './pages/AddRecord';
import GuardContent from './components/Guard/GuardContent';
import FileManagementPage from './pages/FileManagementPage';
import AuditTrailPage from './pages/AuditTrailPage';
import ReportSummary from './pages/ReportSummary';
import './myStyles.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={ <LoginPage setIsAuthenticated={setIsAuthenticated}  /> } /> 
          <Route path="/home" element={<HomePage />} /> 
          <Route path="/home/expanded-record-admin/:studentId" element={<ExpandedRecord />} />
          <Route path="/home/expanded-record-dean/:studentId" element={<ExpandedRecordDean />} />
          <Route path="/addrecord" element={<AddRecordPage />} />
          <Route path="/reports" element={<GuardContent />} />
          <Route path="/file-management" element={<FileManagementPage />} />
          <Route path="/audit-trail" element={<AuditTrailPage />} />
          <Route path="/reports-summary" element={<ReportSummary />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
