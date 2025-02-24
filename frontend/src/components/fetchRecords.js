import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/dashStyles.css";
import "../styles/content.css";
import Filters from "./Filters";
import { BiSearch } from "react-icons/bi";

function FetchRecords({ apiEndpoint, collegesApiEndpoint, onExpand }) {
  const [data, setData] = useState([]);
  const [collegesMap, setCollegesMap] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [checkedColleges, setCheckedColleges] = useState({});
  const [tableData, setTableData] = useState([]);
  const colleges = ["CEIS", "SLCN", "CBMA", "CHTM", "CASE", "CAHS", "CMT"];
  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const [checkedYears, setCheckedYears] = useState({});
  const [count, setCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(12);

  // Fetch student data
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

  // Fetch colleges and create a mapping 
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await axios.get("https://localhost:7096/api/colleges");
  
        if (!Array.isArray(response.data)) {
          console.error("Unexpected API response format:", response.data);
          return;
        }
  
        const collegeMap = {};
        response.data.forEach((college, index) => {
  
          if (college.name && college.code) {
            collegeMap[college.name] = college.code;
          } else {
            console.warn(`College at index ${index} is missing name/code:`, college);
          }
        });
  
        setCollegesMap(collegeMap);
      } catch (error) {
        console.error("Error fetching colleges:", error);
      }
    };
  
    fetchColleges();
  }, [collegesApiEndpoint]);

  // Filter Data
  useEffect(() => {
    let filteredData = data.map((student) => ({
      ...student,
      collegeId: collegesMap[student.collegeId] || student.collegeId, 
      yearId: student.yearId.replace("Year", " Year"), 
    }));

    if (searchTerm) {
      filteredData = filteredData.filter((student) =>
        student.studentNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (Object.keys(checkedColleges).length > 0) {
      filteredData = filteredData.filter(
        (student) => checkedColleges[student.collegeId]
      );
    }
    if (Object.keys(checkedYears).length > 0) {
      filteredData = filteredData.filter((student) => checkedYears[student.yearId]);
    }
    if (count > 0) {
      filteredData = filteredData.filter(
        (student) => student.numberOfViolations === count
      );
    }

    setTableData(filteredData);
  }, [data, collegesMap, searchTerm, checkedColleges, checkedYears, count]);

  // Paginate records
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = tableData.slice(indexOfFirstRecord, indexOfLastRecord);

  return (
    <div className="content-wrapper">
      {/* Left Container (Table and Pagination) */}
      <div className="left-container">
        {/* Search Bar */}
        <div className="search-box">
          <input
            type="text"
            placeholder="Search Student Number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <BiSearch className="icon" />
        </div>

        <div className="table-section">
          <table className="recordsTable">
            <thead>
              <tr>
                <th>Student No.</th>
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
              {currentRecords.length > 0 ? (
                currentRecords.map((student) => (
                  <tr key={student.id}>
                    <td>{student.studentNumber}</td>
                    <td>
                      {student.firstName} {student.middleName} {student.lastName}
                    </td>
                    <td>{collegesMap[student.collegeId] || student.collegeId}</td>
                    <td>{student.yearId}</td>
                    <td>{student.gender}</td>
                    <td>{student.phoneNumber}</td>
                    <td>{student.guardian}</td>
                    <td>{student.numberOfViolations}</td>
                    <td>
                      <Link to={`/home/expanded-record-admin/${student.studentNumber}`}>
                        Expand
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9">No matching records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span>Page {currentPage}</span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === Math.ceil(tableData.length / recordsPerPage)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Right Container (Filters) */}
      <div className="right-container">
        <Filters
          colleges={colleges}
          checkedColleges={checkedColleges}
          onCollegeChange={setCheckedColleges}
          years={years}
          checkedYears={checkedYears}
          onYearChange={setCheckedYears}
          count={count}
          onCountChange={setCount}
        />
      </div>
    </div>
  );
}

export default FetchRecords;
