import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';
import Sidebar from './Sidebar';
import '../styles/dashStyles.css';
import '../styles/expandedRecordsStyles.css';
import axios from 'axios';

function ExpandedRecord() {
  const [studentData, setStudentData] = useState(null);
  const [violationsList, setViolationsList] = useState([]); // Store violations from DB
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [newViolation, setNewViolation] = useState({
    violationId: '',
    remarks: ''
  });

  const { studentId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [studentResponse, violationsResponse] = await Promise.all([
          axios.get(`https://localhost:7096/api/records/${studentId}`),
          axios.get(`https://localhost:7096/api/violations`) // Fetch violations from DB
        ]);

        setStudentData(studentResponse.data);
        setViolationsList(violationsResponse.data); // Set available violations list
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  const handleViolationChange = (event) => {
    const selectedId = event.target.value;
    const selectedViolation = violationsList.find(v => v.id === selectedId);
  
    setNewViolation((prevViolation) => ({
      ...prevViolation,
      violationId: selectedId,
      type: selectedViolation?.type || '', // Auto-set type
    }));
  };
  

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewViolation((prevViolation) => ({
      ...prevViolation,
      [name]: value,
    }));
  };

  const handleAddViolation = async (event) => {
    event.preventDefault();

    if (!newViolation.violationId || !newViolation.remarks) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const response = await axios.post(
        `https://localhost:7096/api/records/addViolation/${studentId}`,
        newViolation
      );

      setStudentData((prevData) => ({
        ...prevData,
        numberOfViolations: prevData.numberOfViolations + 1,
        violations: [...prevData.violations, response.data] // Add new violation to UI
      }));

      setNewViolation({ violationId: '', remarks: '' });
      setShowOverlay(false);
    } catch (error) {
      console.error("Error adding violation:", error);
    }
  };

  return (
    <div className='dashboard'>
      <Sidebar />
      <div className='dashboard--content'>
        {isLoading && <p>Loading student data...</p>}
        {error && <p>Error: {error.message}</p>}
        {!isLoading && !error && studentData && (
          <div className="expandedDiv">
            <div className="studentInformation">
              <p><strong>Student Number:</strong> {studentData.studentNumber}</p>
              <p><strong>Name:</strong> {studentData.firstName} {studentData.middleName} {studentData.lastName}</p>
              <p><strong>Gender:</strong> {studentData.gender}</p>
              <p><strong>Year Level:</strong> {studentData.yearId}</p>
              <p><strong>College:</strong> {studentData.collegeId}</p>
              <p><strong>Course:</strong> {studentData.courseId}</p>
            </div>

            {studentData.violations.length > 0 ? (
              <div className="scrollable-table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Violation</th>
                      <th>Type</th>
                      <th>Remarks</th>
                      <th>Date</th>
                      <th>Acknowledgement</th>
                    </tr>
                  </thead>
                  <tbody>
                  {studentData.violations.map((violation, index) => {
                    const matchedViolation = violationsList.find(v => v.id === violation.violationId);

                    return (
                      <tr key={index}>
                        <td>{matchedViolation?.name || 'Unknown'}</td>
                        <td>{matchedViolation?.type || 'Unknown'}</td> 
                        <td className="table-remarks" title={violation.remarks}>{violation.remarks}</td>
                        <td>{new Date(violation.date).toLocaleString()}</td>
                        <td>{violation.acknowledged ? "Yes" : "No"}</td>
                      </tr>
                    );
                  })}

                  </tbody>
                </table>
              </div>
            ) : <p>No violations recorded.</p>}

            <div className="addViolationBtn">
              <button onClick={() => setShowOverlay(true)}>Add Violation</button>
            </div>

            {showOverlay && (
              <div className="custom-overlay">
                <div className="custom-modal-content">
                  <h2>Report a Violation</h2>
                  <p>Input all the information about the violation below.</p>
                  <form onSubmit={handleAddViolation}>
                    <div className="expanded-form-group expanded-inline-group">
                      <div className='expanded-dropdown-group'>
                        <label>Violation:</label>
                        <select name="violationId" value={newViolation.violationId} onChange={handleViolationChange} id='expandedSelect'>
                          <option value="">Select Violation</option>
                          {violationsList.map((violation) => (
                            <option key={violation.id} value={violation.id}>
                              {violation.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className='expanded-dropdown-group'>
                      <label>Type:</label>
                        <select name="type" value={newViolation.type} onChange={handleInputChange} id='expandedSelect'>
                          <option value="Major">Major</option>
                          <option value="Minor">Minor</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="expanded-form-group">
                      <div className='expanded-dropdown-group'>
                        <label>Remarks:</label>
                        <textarea name="remarks" value={newViolation.remarks} onChange={handleInputChange} id='expandedText'/>
                      </div>
                    </div>
                    
                    <div className="expanded-button-group">
                      <button type="button" className="expanded-cancel-btn" onClick={() => setShowOverlay(false)} id='expandedCancel'>Cancel</button>
                      <button type="submit" className="expanded-submit-btn" id='expandedSubmit'>Submit</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExpandedRecord;
