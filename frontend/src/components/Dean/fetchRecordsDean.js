import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../../styles/dashStyles.css';
import '../../styles/content.css';
import { BiSearch, BiNotification } from 'react-icons/bi';

function FetchRecords({ apiEndpoint, onExpand }) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tableData, setTableData] = useState();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setData([]);
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
    setTableData(filteredData);  
}, [data, searchTerm]);

  return (
    <div>
      <div className='search-box'>
        <input
          type="text"
          placeholder="Search Student Number"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <BiSearch className='icon' />
      </div>

      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}

      {!isLoading && !error && data && (
        <>
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
                    <th>Count</th>
                    <th>Expand</th>
                  </tr>
                </thead>
                <tbody>
                  {data.filter(student =>
                    student.studentNumber.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((student) => (
                    <tr key={student.id}>
                      <td>{student.studentNumber}</td>
                      <td>{student.firstName} {student.middleName} {student.lastName}</td>
                      <td>{student.college}</td>
                      <td>{student.year}</td>
                      <td>{student.gender}</td>
                      <td>{student.phoneNumber}</td>
                      <td>{student.guardian}</td>
                      <td>{student.numberOfViolations}</td>
                      <td>
                        <Link to={`/home/expanded-record-dean/${student.studentNumber}`}>
                          Expand
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default FetchRecords;
