import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import '../styles/dashStyles.css';
import '../styles/content.css';
import { BiSearch, BiNotification } from 'react-icons/bi';


function FetchRecords({ apiEndpoint }) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColleges, setSelectedColleges] = useState([]);
  const [tableData, setTableData] = useState(null);

  const handleCollegeChange = (collegeName) => {
    const existingIndex = selectedColleges.indexOf(collegeName);
    if (existingIndex > -1) {
      setSelectedColleges(selectedColleges.filter(c => c !== collegeName));  
    } else {
      setSelectedColleges([...selectedColleges, collegeName]);
    }

    console.log('selectedColleges:', selectedColleges);
  };
  


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

  // Filter data based on searchTerm and selectedColleges 
  useEffect(() => {
    const filteredData = data.filter(student => { 
      if (student.studentNumber) {
        return student.studentNumber.toLowerCase().includes(searchTerm.toLowerCase());
      }
  
      if (selectedColleges.length > 0) {
        // Only include if the student's college is an exact match
        return selectedColleges.includes(student.college); // Changed from .some()
      } else { 
        return true;
      } 
    });
    console.log("filteredData (inside useEffect):", filteredData);
  setTableData(filteredData);
  console.log("tableData (after setting state):", tableData); 
  }, [data, selectedColleges, searchTerm]);

  return (
    <div>
      <div className='search-box'>
      <input 
        type="text" 
        placeholder="Search Student Number" 
        value={searchTerm} 
        onChange={e => setSearchTerm(e.target.value)}></input>
        <BiSearch className='icon' />
      </div>

      {/* College Checkboxes */}
      <div>
        {['CEIS', 'SLCN', 'CBMA', 'CHTM', 'CASE', 'CAHS', 'CMT'].map(collegeName => (
          <label key={collegeName}>
            <input
              type="checkbox"
              value={collegeName}
              checked={selectedColleges.includes(collegeName)}
              onChange={() => handleCollegeChange(collegeName)}
            />
            {collegeName}
          </label>
        ))}
      </div>
      
      
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
              {tableData.length > 0 ? (
                tableData.map((student) => ( 
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
                ))
              ) : (
                <tr><td colSpan="11">No matching records found</td></tr> 
              )} 
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}


export default FetchRecords;  