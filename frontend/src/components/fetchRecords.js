import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import '../myStyles.css';


function FetchRecords({ apiEndpoint }) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await axios.get(apiEndpoint);
        setData(result.data);
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [apiEndpoint]); 

  return (
    <div>
      {isLoading && <p>Loading...</p>} 
      {error && <p>Error: {error.message}</p>} 

      {!isLoading && !error && (
        <>
          <h1>Student Records</h1> 
          <table className='recordsTable'>
            <thead>
              <tr>
                <th>Student Number</th>
                <th>Name</th>
                <th>College</th>
                <th>Year</th>
                <th>Gender</th>
                <th>Phone No.</th>
                <th>Guardian</th>
                <th>Violation</th>
                <th>Type</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {data.map((student) => (
                <tr key={student._id}> 
                  <td>{student.studentNumber}</td>
                  <td>{student.firstName} {student.middleName} {student.lastName}</td>
                  <td>{student.college}</td>
                  <td>{student.year}</td>
                  <td>{student.gender}</td>
                  <td>{student.phoneNumber}</td>
                  <td>{student.guardian}</td>
                  <td>{student.violation}</td>
                  <td>{student.type}</td>
                  <td>{student.status}</td>
                  <td>{student.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}


export default FetchRecords;  