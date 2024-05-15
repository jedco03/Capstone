import { useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import { Modal, Button,   } from 'react-bootstrap';
import Sidebar from './Sidebar'
import '../styles/dashStyles.css';
import '../styles/expandedRecordsStyles.css'
import axios from 'axios';

function ExpandedRecord() {
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showViolationForm, setShowViolationForm] = useState(false);
  const [newViolation, setNewViolation] = useState({
    violation: '',
    type: '',
    status: 'Pending',
    remarks: ''
  });

  // Use useParams to get the student ID from the URL 
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

  const handleInputChange = (event) => {
    setNewViolation({
      ...newViolation,
      [event.target.name]: event.target.value
    }); 
  };

  const handleAddViolation = async (event) => {
 
    try {
      const response = await axios.post(`https://localhost:7096/api/records/addViolation/${studentId}`, newViolation);


      const updatedStudentData = { ...studentData };
      updatedStudentData.numberOfViolations++;

      setStudentData(response.data);  
      setNewViolation({ violation: '', type: '', status: 'Pending', remarks: '' });
      setShowViolationForm(false);
      setStudentData(updatedStudentData);

    } catch (error) {
      console.error("Error adding violation:", error);
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
        {isLoading && <p>Loading student data...</p>}
        {error && <p>Error: {error.message}</p>}

        {!isLoading && !error && studentData && (
          <div>
          {isLoading ? (
          <p>Loading student data...</p> 
          ) : (
          studentData ? (
              <div>
                  <p>
              <strong>Name:</strong> {studentData.firstName} {studentData.middleName} {studentData.lastName}
            </p>
            <p>
              <strong>Gender:</strong> {studentData.gender} 
            </p> 
            <p>
              <strong>College:</strong> {studentData.college} 
            </p>
            <p>
              <strong>Year Level:</strong> {studentData.year} 
            </p>

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
                              <th>Acknowledgement</th>
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
                                  <td>{violation.acknowledged ? "Yes" : "No"}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          ) : (
              <p>No violations recorded.</p>
          )}
            <button onClick={() => setShowOverlay(true)}>Add Violation</button>  

            {showOverlay && (
              <div className="overlay">
                <div className="modal-content">
                  <button className="close-button" onClick={() => setShowOverlay(false)}>X</button>

                  <h2>Record Violation</h2>
                  <form onSubmit={handleAddViolation}> 
                    <div className="form-group">
                      <label htmlFor="violation">Violation:</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="violation" 
                        name="violation"
                        value={newViolation.violation}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="type">Type:</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="type" 
                        name="type"
                        value={newViolation.type}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="remarks">Remarks:</label>
                      <textarea
                        className="form-control"
                        id="remarks"
                        name="remarks"
                        value={newViolation.remarks}
                        onChange={handleInputChange}
                      />
                    </div>
                    <Button variant="primary" type="submit">
                      Record Violation
                    </Button>
                  </form>
                </div>
              </div>
            )}
            </div>
              ) : (
                  <p>Error: Student data could not be retrieved.</p> 
              )
          )}
        </div>
        )}
          </div>
        </div>
    </div>
  );
}

export default ExpandedRecord;
