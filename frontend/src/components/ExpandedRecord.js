import { useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from './Sidebar'
import '../styles/dashStyles.css';
import axios from 'axios';

function ExpandedRecord() {
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
                          </tr>
                      </thead>
                      <tbody>
                          {studentData.violations.map((violation, index) => (
                              <tr key={index}> 
                                  <td>{violation.violation}</td>
                                  <td>{violation.type}</td>
                                  <td>{violation.status}</td> 
                                  <td>{violation.remarks}</td>
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
