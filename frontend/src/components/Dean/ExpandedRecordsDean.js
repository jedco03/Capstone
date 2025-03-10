import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Button, Modal, Dropdown, Menu, Descriptions, Card, Typography } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons'; // Import the ellipsis icon
import Sidebar from '../Sidebar';
import '../../styles/dashStyles.css';
import '../../styles/expandedRecordsStyles.css';
import api from '../axiosInstance';

function ExpandedRecordDean() {
  const [studentData, setStudentData] = useState(null);
  const [violationsList, setViolationsList] = useState([]);
  const [collegesList, setCollegesList] = useState([]);
  const [yearsList, setYearsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedViolationDetails, setSelectedViolationDetails] = useState(null); // For violation details modal
  const [showViolationDetailsModal, setShowViolationDetailsModal] = useState(false); // Control modal visibility

  const { studentId } = useParams();
  const { Text } = Typography;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [studentResponse, violationsResponse, collegesResponse, yearsResponse] = await Promise.all([
          api.get(`/records/${studentId}`),
          api.get('/violations'),
          api.get('/colleges'),
          api.get('/years'),
        ]);

        console.log('Colleges List:', collegesResponse.data);
        console.log('Years List:', yearsResponse.data);

        setStudentData(studentResponse.data);
        setViolationsList(violationsResponse.data);
        setCollegesList(collegesResponse.data);
        setYearsList(yearsResponse.data);
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (studentId) {
      fetchData();
    }
  }, [studentId]);

  const handleAcknowledge = async (recordId) => {
    Modal.confirm({
      title: 'Confirm Acknowledgment',
      content: 'Are you sure you want to acknowledge this violation?',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('No token found. User is not authenticated.');
            return;
          }

          await api.put(`/records/acknowledge/${recordId}`, {}, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const studentResponse = await api.get(`/records/${studentId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setStudentData(studentResponse.data);
        } catch (error) {
          console.error('Error acknowledging violation:', error);
        }
      },
      onCancel: () => {},
    });
  };

  const handleViewDetails = async (recordId) => {
    try {
      const response = await api.get(`/records/violationdetails/${recordId}`);
      const violationDetails = response.data;

      // Find the corresponding violation type from the violationsList
      const matchedViolation = violationsList.find((v) => v.id === violationDetails.violationId);

      // Add the type to the violation details
      const updatedViolationDetails = {
        ...violationDetails,
        type: matchedViolation?.type || 'Unknown',
      };

      console.log("Violation Details with Type: ", updatedViolationDetails);
      setSelectedViolationDetails(updatedViolationDetails);
      setShowViolationDetailsModal(true); // Show the modal
    } catch (error) {
      console.error('Error fetching violation details:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  const getViolationDetails = (violationId) => {
    const violation = violationsList.find((v) => v.id === violationId);
    return {
      name: violation ? violation.name : 'Unknown Violation',
      type: violation ? violation.type : 'Unknown Type',
    };
  };

  const actionsMenu = (record) => (
    <Menu>
      {!record.acknowledged && (
        <Menu.Item key="acknowledge" onClick={() => handleAcknowledge(record.recordId)}>
          Acknowledge
        </Menu.Item>
      )}
      <Menu.Item key="viewDetails" onClick={() => handleViewDetails(record.recordId)}>
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
        const violationDetails = getViolationDetails(record.violationId);
        return violationDetails.name;
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (text, record) => {
        const violationDetails = getViolationDetails(record.violationId);
        return violationDetails.type;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text) => formatDate(text),
    },
    {
      title: 'Acknowledged',
      dataIndex: 'acknowledged',
      key: 'acknowledged',
      render: (text) => (text ? 'Yes' : 'No'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Dropdown overlay={actionsMenu(record)} trigger={['click']}>
          <Button type="text" icon={<EllipsisOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard--content">
        {isLoading ? (
          <p>Loading student data...</p>
        ) : error ? (
          <p>Error: {error.message}</p>
        ) : studentData ? (
          <div>
            <h2>
              {studentData.firstName} {studentData.middleName} {studentData.lastName}
            </h2>
            <p>
              <strong>Student Number:</strong> {studentData.studentNumber}
            </p>
            <p>
              <strong>College:</strong> {studentData.collegeId}
            </p>
            <p>
              <strong>Year:</strong> {studentData.yearId}
            </p>

            {studentData.violations && studentData.violations.length > 0 ? (
              <Table
                dataSource={studentData.violations}
                columns={columns}
                rowKey="recordId"
                pagination={{ pageSize: 5 }}
                scroll={{ x: true }}
              />
            ) : (
              <p>No violations recorded.</p>
            )}
          </div>
        ) : (
          <p>No student data found.</p>
        )}

        {/* Violation Details Modal */}
        <Modal
          title="Violation Details"
          visible={showViolationDetailsModal}
          onCancel={() => setShowViolationDetailsModal(false)}
          footer={[
            <Button key="close" onClick={() => setShowViolationDetailsModal(false)}>
              Close
            </Button>,
          ]}
          width={800}
        >
          {selectedViolationDetails ? (
            <Card>
              <Descriptions
                bordered
                column={1}
                size="middle"
                labelStyle={{ fontWeight: 'bold', width: '30%' }}
                contentStyle={{ backgroundColor: '#fafafa' }}
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
                  <Text>{formatDate(selectedViolationDetails.date)}</Text>
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
      </div>
    </div>
  );
}

export default ExpandedRecordDean;