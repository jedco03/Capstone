import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Form, Table, Select, Input, Modal, Dropdown, Menu, notification, Descriptions, Typography, Card } from 'antd';
import { Row, Col } from 'antd';
import Sidebar from './Sidebar';
import '../styles/dashStyles.css';
import '../styles/expandedRecordsStyles.css';
import api from './axiosInstance';

function ExpandedRecord() {
  const [studentData, setStudentData] = useState(null);
  const [violationsList, setViolationsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [newViolation, setNewViolation] = useState({
    violationId: '',
    remarks: '',
    date: new Date().toISOString(),
    status: 'Pending',
    acknowledged: false,
    IsIDInPossession: false,
  });
  const [showResolveOverlay, setShowResolveOverlay] = useState(false);
  const [showUpdateOverlay, setShowUpdateOverlay] = useState(false);
  const [showEditRecordOverlay, setShowEditRecordOverlay] = useState(false);
  const [selectedViolationId, setSelectedViolationId] = useState(null);
  const [selectedViolationDetails, setSelectedViolationDetails] = useState(null);
  const [editForm] = Form.useForm();

  const [colleges, setColleges] = useState([]);
  const [courses, setCourses] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);

  const { studentId } = useParams();
  const { Text } = Typography;

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [studentResponse, violationsResponse] = await Promise.all([
        api.get(`/records/${studentId}`),
        api.get(`/violations`),
      ]);
      console.log("DATA: ", studentResponse);
      setStudentData(studentResponse.data);
      setViolationsList(violationsResponse.data);
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [studentId]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [collegesResponse, coursesResponse, yearsResponse] = await Promise.all([
          api.get('/colleges'),
          api.get('/courses'),
          api.get('/years'),
        ]);
        setColleges(collegesResponse.data);
        setCourses(coursesResponse.data);
        setYears(yearsResponse.data);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };

    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (studentData && showEditRecordOverlay) {
      const yearId = years.find((y) => y.name.trim().toLowerCase() === studentData.yearId.trim().toLowerCase())?.id || studentData.yearId;
      const collegeId = colleges.find((c) => c.name.trim().toLowerCase() === studentData.collegeId.trim().toLowerCase())?.id || studentData.collegeId;
      const courseId = courses.find((c) => c.name.trim().toLowerCase() === studentData.courseId.trim().toLowerCase())?.id || studentData.courseId;

      editForm.setFieldsValue({
        studentNumber: studentData.studentNumber,
        email: studentData.email,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        middleName: studentData.middleName,
        year: yearId,
        college: collegeId,
        course: courseId,
        gender: studentData.gender,
        phoneNumber: studentData.phoneNumber,
        guardian: studentData.guardian,
      });

      setSelectedCollege(collegeId);
    }
  }, [studentData, showEditRecordOverlay, editForm, years, colleges, courses]);

  const handleCollegeChange = (value) => {
    setSelectedCollege(value);
    editForm.setFieldsValue({ course: undefined });
  };

  const filteredCourses = selectedCollege
    ? courses.filter((course) => course.college === selectedCollege)
    : [];

  const handleViolationChange = (value) => {
    const selectedViolation = violationsList.find((v) => v.id === value);
    setNewViolation((prevViolation) => ({
      ...prevViolation,
      violationId: value,
      type: selectedViolation?.type || '',
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewViolation((prevViolation) => ({
      ...prevViolation,
      [name]: value,
    }));
  };

  const handleAddViolation = async (e) => {
    e.preventDefault();
    if (!newViolation.violationId || !newViolation.remarks) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You are not authenticated. Please log in.');
        return;
      }

      await api.post(`/records/addViolation/${studentId}`, newViolation, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNewViolation({
        violationId: '',
        remarks: '',
        date: new Date().toISOString(),
        status: 'Pending',
        acknowledged: false,
        IsIDInPossession: false,
      });
      setShowOverlay(false);
      await fetchData();
    } catch (error) {
      console.error('Error adding violation:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleMarkAsResolved = async () => {
    if (!selectedViolationId) return;

    const selectedViolation = studentData.violations.find(
      (violation) => violation.recordId === selectedViolationId
    );

    if (!selectedViolation.acknowledged) {
      alert('Please acknowledge the violation before marking it as resolved.');
      return;
    }

    try {
      await api.put(`/records/markAsResolved/${selectedViolationId}`);
      setStudentData((prevData) => ({
        ...prevData,
        violations: prevData.violations.map((violation) =>
          violation.recordId === selectedViolationId
            ? { ...violation, status: 'Resolved' }
            : violation
        ),
      }));
      setShowResolveOverlay(false);
      await fetchData();
    } catch (error) {
      console.error('Error marking as resolved:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleUpdateViolation = async () => {
    if (!selectedViolationId) return;
  
    try {
      const response = await api.get(`/records/violationdetails/${selectedViolationId}`);
      const violationDetails = response.data;
  
      const matchedViolation = violationsList.find((v) => v.id === violationDetails.violationId);
  
      const updatedViolationDetails = {
        ...violationDetails,
        type: matchedViolation?.type || 'Unknown',
      };
  
      console.log("Violation Details with Type: ", updatedViolationDetails);
      setSelectedViolationDetails(updatedViolationDetails);
      setShowUpdateOverlay(true);
    } catch (error) {
      console.error('Error fetching violation details:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleEditRecord = async (values) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You are not authenticated. Please log in.');
        return;
      }

      await api.put(`/records/UpdateRecord/${studentId}`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowEditRecordOverlay(false);
      await fetchData();

      notification.success({
        message: 'Record Updated Successfully',
        description: `The record for Student #${studentId} has been updated.`,
        placement: 'topRight',
      });

    } catch (error) {
      console.error('Error updating student record:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const actionsMenu = (record) => (
    <Menu>
      <Menu.Item key="markAsResolved" onClick={() => {
        setSelectedViolationId(record.recordId);
        setShowResolveOverlay(true);
      }}>
        Mark as Resolved
      </Menu.Item>
      <Menu.Item key="update" onClick={() => {
        setSelectedViolationId(record.recordId);
        handleUpdateViolation();
      }}>
        View Details
      </Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: 'Violation',
      dataIndex: 'violation',
      key: 'violation',
      render: (text, record) => {
        const matchedViolation = violationsList.find((v) => v.id === record.violationId);
        return matchedViolation?.name || 'Unknown';
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (text, record) => {
        const matchedViolation = violationsList.find((v) => v.id === record.violationId);
        return matchedViolation?.type || 'Unknown';
      },
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      render: (text) => <span title={text}>{text}</span>,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Acknowledgement',
      dataIndex: 'acknowledged',
      key: 'acknowledged',
      render: (text) => (text ? 'Yes' : 'No'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) =>
        record.status !== 'Resolved' && (
          <Dropdown overlay={actionsMenu(record)} trigger={['click']}>
            <Button type="link">⋮</Button>
          </Dropdown>
        ),
    },
  ];

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard--content">
        {isLoading && <p>Loading student data...</p>}
        {error && <p>Error: {error.message}</p>}
        {!isLoading && !error && studentData && (
          <div className="expandedDiv">
            <div className="studentInformation">
              <p>
                <strong>Student Number:</strong> {studentData.studentNumber}
              </p>
              <p>
                <strong>Name:</strong> {studentData.firstName} {studentData.middleName}{' '}
                {studentData.lastName}
              </p>
              <p>
                <strong>Gender:</strong> {studentData.gender}
              </p>
              <p>
                <strong>Year Level:</strong> {studentData.yearId}
              </p>
              <p>
                <strong>College:</strong> {studentData.collegeId}
              </p>
              <p>
                <strong>Course:</strong> {studentData.courseId}
              </p>
            </div>

            {studentData.violations.length > 0 ? (
              <Table
                dataSource={studentData.violations.sort((a, b) => new Date(b.date) - new Date(a.date))}
                columns={columns}
                rowKey="recordId"
                pagination={{ pageSize: 5 }}
                scroll={{ x: true }}
              />
            ) : (
              <p>No violations recorded.</p>
            )}

            <div className="addViolationBtn">
              <Button type="primary" onClick={() => setShowOverlay(true)}>
                Add Violation
              </Button>
              <Button type="primary" onClick={() => setShowEditRecordOverlay(true)} style={{ marginLeft: '10px' }}>
                Edit Record
              </Button>
            </div>

            <Modal
              title="Report a Violation"
              visible={showOverlay}
              onCancel={() => setShowOverlay(false)}
              footer={[
                <Button key="cancel" onClick={() => setShowOverlay(false)}>
                  Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={handleAddViolation}>
                  Submit
                </Button>,
              ]}
            >
              <Form onSubmit={handleAddViolation}>
                <Form.Item label="Violation">
                  <Select
                    placeholder="Select Violation"
                    value={newViolation.violationId}
                    onChange={handleViolationChange}
                  >
                    {violationsList.map((violation) => (
                      <Select.Option key={violation.id} value={violation.id}>
                        {violation.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="Type">
                  <Select
                    placeholder="Select Type"
                    value={newViolation.type}
                    onChange={(value) =>
                      setNewViolation((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <Select.Option value="Major">Major</Select.Option>
                    <Select.Option value="Minor">Minor</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item label="Remarks">
                  <Input.TextArea
                    value={newViolation.remarks}
                    onChange={(e) =>
                      setNewViolation((prev) => ({ ...prev, remarks: e.target.value }))
                    }
                  />
                </Form.Item>
              </Form>
            </Modal>

            <Modal
              title="Confirm Resolution"
              visible={showResolveOverlay}
              onCancel={() => setShowResolveOverlay(false)}
              footer={[
                <Button key="cancel" onClick={() => setShowResolveOverlay(false)}>
                  Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={handleMarkAsResolved}>
                  Mark as Resolved
                </Button>,
              ]}
            >
              <p>Are you sure you want to mark this violation as resolved? This action cannot be undone.</p>
            </Modal>

            <Modal
              title="Violation Details"
              visible={showUpdateOverlay}
              onCancel={() => setShowUpdateOverlay(false)}
              footer={[
                <Button key="cancel" onClick={() => setShowUpdateOverlay(false)}>
                  Close
                </Button>,
              ]}
              width={800} // Adjust the width as needed
            >
              {selectedViolationDetails ? (
                <Card>
                  <Descriptions
                    bordered
                    column={1} // Display details in a single column
                    size="middle"
                    labelStyle={{ fontWeight: 'bold', width: '30%' }} // Style for labels
                    contentStyle={{ backgroundColor: '#fafafa' }} // Style for content
                  >
                    <Descriptions.Item label="Violation">
                      <Text>{selectedViolationDetails.violationId}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Type">
                      <Text>{selectedViolationDetails.type}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Remarks">
                      <Text>{selectedViolationDetails.remarks}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Date">
                      <Text>{new Date(selectedViolationDetails.date).toLocaleString()}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Text>{selectedViolationDetails.status}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Acknowledged">
                      <Text>{selectedViolationDetails.acknowledged ? 'Yes' : 'No'}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="ID in Possession">
                      <Text>{selectedViolationDetails.IsIDInPossession ? 'Yes' : 'No'}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Guard Name">
                      <Text>{selectedViolationDetails.guardName}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              ) : (
                <p>Loading violation details...</p>
              )}
            </Modal>

            <Modal
              title="Edit Student Record"
              visible={showEditRecordOverlay}
              onCancel={() => setShowEditRecordOverlay(false)}
              footer={[
                <Button key="cancel" onClick={() => setShowEditRecordOverlay(false)}>
                  Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={() => editForm.submit()}>
                  Save Changes
                </Button>,
              ]}
              width={1500}
            >
              <Form form={editForm} onFinish={handleEditRecord}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Student Number" name="studentNumber">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Email" name="email">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item label="First Name" name="firstName">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Last Name" name="lastName">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Middle Name" name="middleName">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item label="Gender" name="gender">
                      <Select>
                        <Select.Option value="Male">Male</Select.Option>
                        <Select.Option value="Female">Female</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Phone Number" name="phoneNumber">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Guardian" name="guardian">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item label="Year" name="year">
                      <Select>
                        {years.map((year) => (
                          <Select.Option key={year.id} value={year.id}>
                            {year.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="College" name="college">
                      <Select onChange={handleCollegeChange}>
                        {colleges.map((college) => (
                          <Select.Option key={college.id} value={college.id}>
                            {college.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Course" name="course">
                      <Select disabled={!selectedCollege}>
                        {filteredCourses.map((course) => (
                          <Select.Option key={course.id} value={course.id}>
                            {course.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Modal>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExpandedRecord;