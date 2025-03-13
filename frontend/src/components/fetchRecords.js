import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/dashStyles.css";
import "../styles/content.css";
import Filters from "./Filters";
import { BiSearch } from "react-icons/bi";
import { Table, Pagination } from "antd"; // Import Ant Design components

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
    }));

    if (searchTerm) {
      filteredData = filteredData.filter((student) =>
        student.studentNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // College Filter
    if (Object.keys(checkedColleges).length > 0) {
      filteredData = filteredData.filter(
        (student) => checkedColleges[student.collegeId]
      );
    }

    // Year Filter
    if (Object.keys(checkedYears).length > 0) {
      filteredData = filteredData.filter((student) => {
        return checkedYears[student.yearId];
      });
    }

    // Count Filter
    if (count > 0) {
      filteredData = filteredData.filter(
        (student) => student.numberOfViolations === count
      );
    }

    // Sort by number of violations (highest to lowest)
    filteredData.sort((a, b) => b.numberOfViolations - a.numberOfViolations);

    setTableData(filteredData);
  }, [data, collegesMap, searchTerm, checkedColleges, checkedYears, count]);

  // Columns for the Ant Design Table
  const columns = [
    {
      title: "Student No.",
      dataIndex: "studentNumber",
      key: "studentNumber",
    },
    {
      title: "Name",
      key: "name",
      render: (text, record) => (
        `${record.firstName} ${record.middleName} ${record.lastName}`
      ),
    },
    {
      title: "College",
      dataIndex: "collegeId",
      key: "collegeId",
    },
    {
      title: "Year",
      dataIndex: "yearId",
      key: "yearId",
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
    },
    {
      title: "Phone No.",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Guardian",
      dataIndex: "guardian",
      key: "guardian",
    },
    {
      title: "Count",
      dataIndex: "numberOfViolations",
      key: "numberOfViolations",
    },
    {
      title: "Expand",
      key: "expand",
      render: (text, record) => (
        <Link to={`/home/expanded-record-admin/${record.studentNumber}`}>
          Expand
        </Link>
      ),
    },
  ];

  // Pagination change handler
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

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

        {/* Ant Design Table */}
        <div className="table-section">
          <Table
            columns={columns}
            dataSource={tableData}
            pagination={{ pageSize: 8 }}
            rowKey="id"
            loading={isLoading}
            locale={{ emptyText: "No matching records found" }}
            rowClassName={(record) => {
              if (record.numberOfViolations >= 3) {
                return "highlight-red"; // Apply red highlight for 3+ violations
              } else if (record.numberOfViolations === 2) {
                return "highlight-yellow"; // Apply yellow highlight for 2 violations
              }
              return ""; // No highlight for other records
            }}
          />
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