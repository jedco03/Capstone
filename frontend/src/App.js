import React, { useState, useEffect } from 'react'; // Import useState
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; 
import LoginPage from './pages/LoginPage';
import HomePage from './pages/Home';
import ExpandedRecord from './components/ExpandedRecord';
import ExpandedRecordDean from './components/Dean/ExpandedRecordsDean';
import AddRecordPage from './pages/AddRecord';
import GuardContent from './components/Guard/GuardContent';
import FileManagementPage from './pages/FileManagementPage';
import AuditTrailPage from './pages/AuditTrailPage';
import ReportSummary from './pages/ReportSummary';
import ProtectedRoute from './ProtectedRoute'; // Import the ProtectedRoute component
import './myStyles.css';

function App() {
  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the token
    localStorage.removeItem('userRole'); // Clear other user data
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    window.location.href = '/'; // Redirect to login
  };

  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem('token');

      if (token) {
        const isTokenExpired = (token) => {
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000; // Convert to seconds
          return decodedToken.exp < currentTime; // Check if token is expired
        };

        if (isTokenExpired(token)) {
          handleLogout(); // Log out if token is expired
        }
      }
    };

    // Check token expiration immediately
    checkTokenExpiration();

    // Check token expiration every 60 seconds
    const interval = setInterval(checkTokenExpiration, 60000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []); // No dependencies needed

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} /> 
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home/expanded-record-admin/:studentId"
            element={
              <ProtectedRoute>
                <ExpandedRecord />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home/expanded-record-dean/:studentId"
            element={
              <ProtectedRoute>
                <ExpandedRecordDean />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addrecord"
            element={
              <ProtectedRoute>
                <AddRecordPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <GuardContent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/file-management"
            element={
              <ProtectedRoute>
                <FileManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit-trail"
            element={
              <ProtectedRoute>
                <AuditTrailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports-summary"
            element={
              <ProtectedRoute>
                <ReportSummary />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;