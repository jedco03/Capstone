import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../Sidebar';
import '../../styles/dashStyles.css';
import '../../styles/expandedRecordsStyles.css';
import axios from 'axios';

function ExpandedRecordDean() {
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { studentId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`https://localhost:7096/api/records/${studentId}`);
        setStudentData(response.data);
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [studentId]);

  const handleAcknowledge = async (violationId) => {
    const confirmAcknowledge = window.confirm("Are you sure you want to acknowledge this violation?");
    if (confirmAcknowledge) { // Proceed only if confirmed
      try {
        await axios.put(`https://localhost:7096/api/records/acknowledge/${violationId}`);
        // Refresh the student data after acknowledging
        const response = await axios.get(`https://localhost:7096/api/records/${studentId}`);
        setStudentData(response.data);
      } catch (error) {
        console.error("Error acknowledging violation:", error);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    return date.toLocaleString('en-US', options);
  };

  return (
    <div>
      <div className='dashboard'>
        <Sidebar />
        <div className='dashboard--content'>
          {isLoading ? (
            <p>Loading student data...</p>
          ) : error ? (
            <p>Error: {error.message}</p>
          ) : studentData ? (
            <div>
              {/* ... (Student details: name, gender, college, year) ... */}

              {studentData.violations && studentData.violations.length > 0 ? (
                <div className="scrollable-table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Violation</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Remarks</th>
                        <th>Date</th>
                        <th>Acknowledge</th> {/* Add this header for the button column */}
                      </tr>
                    </thead>
                    <tbody>
                      {studentData.violations.map((violation, index) => (
                        <tr key={index}>
                          <td>{violation.violation}</td>
                          <td>{violation.type}</td>
                          <td>{violation.status}</td>
                          <td>{violation.remarks}</td>
                          <td>{formatDate(violation.date)}</td>
                          <td>
                          {violation.acknowledged ? (
                            <span className="acknowledged-text">Acknowledged!</span> // Text when acknowledged
                            ) : (
                                <button onClick={() => handleAcknowledge(violation.violationId)}>
                                Acknowledge
                                </button> // Button when not acknowledged
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No violations recorded.</p>
              )}
            </div>
          ) : (
            <p>No student data found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExpandedRecordDean;