import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Select } from 'antd';
import { Bar, Pie } from '@ant-design/charts';
import api from './axiosInstance'; // Import your custom Axios instance

const { Option } = Select;

const ReportSummaryCharts = () => {
  const [students, setStudents] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [violations, setViolations] = useState([]);
  const [courses, setCourses] = useState([]);
  const [years, setYears] = useState([]);

  // State for filtering
  const [groupBy, setGroupBy] = useState('college'); // Default: Group by College
  const [filterBy, setFilterBy] = useState(null); // Default: No filter
  const [filterOptions, setFilterOptions] = useState([]); // Options for the filter dropdown
  const [chartData, setChartData] = useState([]); // Data for the charts

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all required data
        const studentsResponse = await api.get('/records');
        const collegesResponse = await api.get('/colleges');
        const violationsResponse = await api.get('/violations');
        const coursesResponse = await api.get('/courses');
        const yearsResponse = await api.get('/years');

        console.log("Fetched Data: ", studentsResponse, collegesResponse, violationsResponse, coursesResponse, yearsResponse);

        setStudents(studentsResponse.data);
        setColleges(collegesResponse.data);
        setViolations(violationsResponse.data);
        setCourses(coursesResponse.data);
        setYears(yearsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Update filter options when groupBy changes
  useEffect(() => {
    switch (groupBy) {
      case 'college':
        setFilterOptions(colleges.map(c => ({ label: c.name, value: c._id })));
        break;
      case 'year':
        setFilterOptions(years.map(y => ({ label: y.name, value: y._id })));
        break;
      case 'course':
        setFilterOptions(courses.map(c => ({ label: c.name, value: c._id })));
        break;
      case 'violation':
        setFilterOptions(violations.map(v => ({ label: v.name, value: v._id })));
        break;
      default:
        setFilterOptions([]);
    }
    setFilterBy(null); // Reset filter when groupBy changes
  }, [groupBy, colleges, years, courses, violations]);

  // Process data based on groupBy and filterBy
  useEffect(() => {
    if (students.length === 0 || colleges.length === 0 || violations.length === 0 || courses.length === 0 || years.length === 0) {
      return; // Wait until all data is fetched
    }

    let processedData = [];

    // Group data based on the selected groupBy
    switch (groupBy) {
      case 'college':
        processedData = Object.entries(
          students.reduce((acc, student) => {
            const college = colleges.find(c => c._id === student.college);
            if (college && (!filterBy || student.college === filterBy)) {
              acc[college.name] = (acc[college.name] || 0) + student.numberOfViolations;
            }
            return acc;
          }, {})
        ).map(([name, count]) => ({ name, count }));
        console.log("College Data: ", processedData);
        break;

      case 'year':
        processedData = Object.entries(
          students.reduce((acc, student) => {
            const year = years.find(y => y._id === student.year);
            if (year && (!filterBy || student.year === filterBy)) {
              acc[year.name] = (acc[year.name] || 0) + student.numberOfViolations;
            }
            return acc;
          }, {})
        ).map(([name, count]) => ({ name, count }));
        console.log("College Data: ", processedData);
        break;

      case 'course':
        processedData = Object.entries(
          students.reduce((acc, student) => {
            const course = courses.find(c => c._id === student.course);
            if (course && (!filterBy || student.course === filterBy)) {
              acc[course.name] = (acc[course.name] || 0) + student.numberOfViolations;
            }
            return acc;
          }, {})
        ).map(([name, count]) => ({ name, count }));
        console.log("College Data: ", processedData);
        break;

      case 'violation':
        processedData = Object.entries(
          students.reduce((acc, student) => {
            student.violations.forEach(violation => {
              const violationName = violations.find(v => v._id === violation.violationId)?.name;
              if (violationName && (!filterBy || violation.violationId === filterBy)) {
                acc[violationName] = (acc[violationName] || 0) + 1;
              }
            });
            return acc;
          }, {})
        ).map(([name, count]) => ({ name, count }));
        console.log("College Data: ", processedData);
        break;

      default:
        processedData = [];
    }

    setChartData(processedData);
  }, [groupBy, filterBy, students, colleges, violations, courses, years]);

  // Bar chart configuration
  const barChartConfig = {
    data: chartData,
    xField: 'count',
    yField: 'name',
    seriesField: 'name',
    legend: { position: 'top-left' },
    xAxis: { title: { text: 'Number of Violations' } },
    yAxis: { title: { text: groupBy.charAt(0).toUpperCase() + groupBy.slice(1) } },
  };

  // Pie chart configuration
  const pieChartConfig = {
    data: chartData,
    angleField: 'count',
    colorField: 'name',
    radius: 0.8,
    label: {
      content: '{name} - {count}',
    },
    legend: { position: 'bottom' },
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={16}>
        <Col span={24}>
          <Card
            title={
              <div>
                <Select
                  defaultValue="college"
                  style={{ width: 200, marginRight: 16 }}
                  onChange={value => setGroupBy(value)}
                >
                  <Option value="college">Group by College</Option>
                  <Option value="year">Group by Year</Option>
                  <Option value="course">Group by Course</Option>
                  <Option value="violation">Group by Violation</Option>
                </Select>
                <Select
                  style={{ width: 200 }}
                  placeholder="Filter by..."
                  value={filterBy}
                  onChange={value => setFilterBy(value)}
                  allowClear
                >
                  {filterOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </div>
            }
          >
            <Row gutter={16}>
              <Col span={12}>
                <Card title="Bar Chart">
                  <Bar {...barChartConfig} />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Pie Chart">
                  <Pie {...pieChartConfig} />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReportSummaryCharts;