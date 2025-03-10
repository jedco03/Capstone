import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Table, Input, Select, notification } from 'antd';
import { BiSearch } from 'react-icons/bi';
import api from '../axiosInstance';
import '../../styles/dashStyles.css';
import '../../styles/content.css';

function FetchRecords({ apiEndpoint, onExpand }) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null); // State for selected year
  const [unacknowledgedStudents, setUnacknowledgedStudents] = useState([]); // Track students with unacknowledged violations
  const notifiedStudents = useRef(new Set()); // Track students who have already been notified

  // Year options for the Select component
  const yearOptions = [
    { value: null, label: "All Years" },
    { value: "1st Year", label: "1st Year" },
    { value: "2nd Year", label: "2nd Year" },
    { value: "3rd Year", label: "3rd Year" },
    { value: "4th Year", label: "4th Year" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setData([]); // Clear existing data
      try {
        const token = localStorage.getItem("token"); // Get the token from storage
        const result = await api.get("/records/students-with-violations", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("API Response:", result);

        // Check if the response is JSON
        if (result.headers['content-type'].includes('application/json')) {
          // Transform the data to match the table columns
          const transformedData = result.data.map(student => ({
            id: student.id,
            studentNumber: student.studentNumber,
            firstName: student.firstName,
            lastName: student.lastName,
            middleName: student.middleName,
            college: student.collegeId, // Map collegeId to college
            year: student.yearId, // Map yearId to year
            gender: student.gender,
            phoneNumber: student.phoneNumber,
            guardian: student.guardian,
            numberOfViolations: student.numberOfViolations,
            unacknowledgedViolations: student.violations.filter(violation => !violation.acknowledged).length, // Track unacknowledged violations
          }));
          setData(transformedData);

          // Check for students with unacknowledged violations
          const unacknowledged = transformedData.filter(student => student.unacknowledgedViolations > 0);
          setUnacknowledgedStudents(unacknowledged);

          // Show notification for new unacknowledged students
          const newUnacknowledged = unacknowledged.filter(
            student => !notifiedStudents.current.has(student.studentNumber)
          );
          if (newUnacknowledged.length > 0) {
            notification.warning({
              message: 'Unacknowledged Violations',
              description: `You have ${newUnacknowledged.length} student(s) with unacknowledged violations.`,
              placement: 'topRight',
              duration: 5, // Notification will disappear after 5 seconds
            });

            // Add the new students to the notified set
            newUnacknowledged.forEach(student => notifiedStudents.current.add(student.studentNumber));
          }
        } else {
          throw new Error('Invalid response format: Expected JSON');
        }
      } catch (error) {
        console.error("API Error:", error);
        if (error.response) {
          console.error("Response Data:", error.response.data); // Log the error response
        }
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 60000); // Polling every 60 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  useEffect(() => {
    let filtered = data;

    // Search filtering
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.studentNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Year level filtering
    if (selectedYear) {
      filtered = filtered.filter(student => student.year === selectedYear);
    }

    setFilteredData(filtered);
  }, [data, searchTerm, selectedYear]);

  const columns = [
    {
      title: 'Student Number',
      dataIndex: 'studentNumber',
      key: 'studentNumber',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => `${record.firstName} ${record.middleName} ${record.lastName}`,
    },
    {
      title: 'College',
      dataIndex: 'college',
      key: 'college',
    },
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
    },
    {
      title: 'Phone No.',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Guardian',
      dataIndex: 'guardian',
      key: 'guardian',
    },
    {
      title: 'Count',
      dataIndex: 'numberOfViolations',
      key: 'numberOfViolations',
    },
    {
      title: 'Expand',
      key: 'expand',
      render: (text, record) => (
        <Link to={`/home/expanded-record-dean/${record.studentNumber}`}>
          Expand
        </Link>
      ),
    },
  ];

  return (
    <div>
      <div className='search-box'>
        <Input
          placeholder="Search Student Number"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          prefix={<BiSearch className='icon' />}
        />
      </div>

      <div>
        <Select
          placeholder="Filter by Year"
          options={yearOptions}
          onChange={(value) => setSelectedYear(value)}
          style={{ width: 200, marginBottom: 16 }}
        />
      </div>

      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}

      {!isLoading && !error && (
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          className="recordsTable"
        />
      )}
    </div>
  );
}

export default FetchRecords;