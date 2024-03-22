import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import '../styles/dashStyles.css';
import '../styles/content.css';
import Filters from './Filters';
import { BiSearch, BiNotification } from 'react-icons/bi';


function FetchRecords({ apiEndpoint }) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [checkedColleges, setCheckedColleges] = useState({});
  const [tableData, setTableData] = useState();
  const colleges = ['CEIS', 'SLCN', 'CBMA', 'CHTM', 'CASE', 'CAHS', 'CMT'];

  //Populate Table
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

  useEffect(() => {
    let filteredData = data; 

    // Search filtering (always applies)
    if (searchTerm) {  
        filteredData = filteredData.filter(student => 
            student.studentNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    // Apply college filtering only if checkboxes are used
    if (Object.keys(checkedColleges).length > 0) {
        filteredData = filteredData.filter(student => 
            checkedColleges[student.college] 
        );
        
    } 

    setTableData(filteredData);  
}, [data, searchTerm, checkedColleges]);

  //Handle Chekcing and Unchecking
  const handleCollegeChange = (e) => {
    const college = e.target.value;
    console.log('Selected college:', college);
    console.log('Number of colleges: ', college.length)
    setCheckedColleges(prevCheckedColleges => {
      const updatedCheckedColleges = {...prevCheckedColleges};    
      updatedCheckedColleges[college] = !prevCheckedColleges[college];

      // Delete if the updated value is false:  
      if (!updatedCheckedColleges[college]) {
          delete updatedCheckedColleges[college];
      }

      return updatedCheckedColleges;  
  });
};

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
      
      
      {isLoading && <p>Loading...</p>} 
      {error && <p>Error: {error.message}</p>} 

      {!isLoading && !error && tableData && (
        <>
          <h1>Student Records</h1> 
          <div className='content-wrapper'>
            <div className='table-section'>
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
              {tableData !== null ? ( // Check if tableData is not null
                  tableData.length > 0 ? (
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
                  )
                ) : ( 
                  <tr><td colSpan="11">Loading...</td></tr>  // Loading placeholder
                )} 
              </tbody>
            </table>
          </div>

            <div class="filters-section">
              <Filters 
                colleges={colleges} 
                checkedColleges={checkedColleges}
                onCollegeChange={handleCollegeChange} 
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}


export default FetchRecords;  