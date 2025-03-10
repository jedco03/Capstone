import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Input } from 'antd';
import { BiSearch } from 'react-icons/bi';
import api from '../axiosInstance';
import Sidebar from '../Sidebar';
import '../../styles/dashStyles.css';
import '../../styles/content.css';
import '../../styles/reportsStyle.css';

function GuardContent() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collegeMap, setCollegeMap] = useState({});
  const [yearMap, setYearMap] = useState({});
  const [violationMap, setViolationMap] = useState({});
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReports, setSelectedReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredReports, setFilteredReports] = useState([]);
  const [selectedTab, setSelectedTab] = useState('Not Passed'); // Default to "Not Passed"
  const [showSuccess, setShowSuccess] = useState(false); // State for success message

  useEffect(() => {
    const fetchMappings = async () => {
      try {
        const [collegesRes, yearsRes, violationsRes] = await Promise.all([
          api.get('/colleges'),
          api.get('/years'),
          api.get('/violations'),
        ]);

        setCollegeMap(collegesRes.data.reduce((acc, col) => ({ ...acc, [col._id]: col.name }), {}));
        setViolationMap(violationsRes.data.reduce((acc, vio) => ({ ...acc, [vio.id]: vio.name }), {}));
        setYearMap(yearsRes.data.reduce((acc, yr) => ({ ...acc, [yr._id]: yr.name }), {}));
      } catch (err) {
        console.error('Error fetching mappings:', err);
      }
    };

    fetchReports();
    fetchMappings();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/reports');
      const sortedReports = response.data.sort((a, b) => {
        if (a.isViewed !== b.isViewed) return a.isViewed ? 1 : -1;
        if (a.isPassed !== b.isPassed) return a.isPassed ? 1 : -1;
        return new Date(b.submissionDate) - new Date(a.submissionDate);
      });

      setReports(sortedReports);
      setFilteredReports(sortedReports);
      setIsLoading(false);
    } catch (err) {
      setError('Error fetching data');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const filtered = reports.filter((report) => {
      if (selectedTab === 'Passed') return report.isPassed;
      if (selectedTab === 'Not Passed') return !report.isPassed;
      return false;
    }).filter(report => {
      const searchLower = searchTerm.toLowerCase();
      return (
        report.studentNumber.toLowerCase().includes(searchLower) ||
        report.firstName.toLowerCase().includes(searchLower) ||
        report.middleName.toLowerCase().includes(searchLower) ||
        report.lastName.toLowerCase().includes(searchLower)
      );
    });

    setFilteredReports(filtered);
  }, [selectedTab, searchTerm, reports]);

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

  const openModal = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
    updateIsViewed(report.id);
  };

  const updateIsViewed = async (reportId) => {
    try {
      await api.patch(`/reports/${reportId}`, { isViewed: true });
    } catch (error) {
      console.error('Error updating isViewed:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
    fetchReports();
  };

  const showSuccessMessage = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000); // Hide after 3 seconds
  };

  const handleProceed = async (report, isBulkOperation = false) => {
    if (report.isPassed) {
      alert('This report has already been processed.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const userFullName = localStorage.getItem('userName');

      let studentExists = false;

      try {
        await api.get(`/records/${report.studentNumber}`);
        studentExists = true;
      } catch (error) {
        if (error.response && error.response.status === 404) {
          const newStudent = {
            studentNumber: report.studentNumber,
            email: report.email,
            firstName: report.firstName,
            lastName: report.lastName,
            middleName: report.middleName || '',
            yearId: report.yearId,
            collegeId: report.collegeId,
            courseId: report.courseId || '',
            gender: report.gender,
            phoneNumber: report.phoneNumber || '',
            guardian: report.guardian || '',
            violations: [],
          };

          await api.post('/records', newStudent);
        } else {
          throw error;
        }
      }

      const newViolation = {
        violationId: report.violation || 'Missing violationId',
        remarks: report.remarks || 'No remarks provided',
        type: report.type || 'No type specified',
        guardName: report.guardName || 'Unknown guard',
        status: report.status,
        isIDInPossession: report.isIDInPossession ?? false,
      };

      await api.post(`/records/addViolation/${report.studentNumber}`, newViolation, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await api.patch(`/reports/${report.id}`, { isPassed: true, isViewed: true });

      if (!isBulkOperation) {
        showSuccessMessage(); // Show success message for single approval
        closeModal();
      }
    } catch (error) {
      console.error('Error processing report:', error);
      alert('An error occurred while processing the report.');
    }
  };

  const handleCheckboxChange = (reportId) => {
    setSelectedReports(prevSelected =>
      prevSelected.includes(reportId)
        ? prevSelected.filter(id => id !== reportId)
        : [...prevSelected, reportId]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const reportsToSelect = filteredReports
        .filter(report => !report.isPassed)
        .map(report => report.id);
      setSelectedReports(reportsToSelect);
    } else {
      setSelectedReports([]);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedReports.length === 0) {
      alert('No reports selected.');
      return;
    }

    let failedReports = [];
    let successCount = 0;

    for (const reportId of selectedReports) {
      const report = reports.find(r => r.id === reportId);
      if (!report) {
        failedReports.push(reportId);
        continue;
      }

      try {
        await handleProceed(report, true); // Pass `true` to indicate bulk operation
        successCount++;
      } catch (error) {
        failedReports.push(reportId);
      }
    }

    // Show success message only once after all reports are processed
    if (successCount > 0) {
      showSuccessMessage();
    }

    let message = '';
    if (successCount > 0) message += `${successCount} reports processed successfully.\n`;
    if (failedReports.length > 0) message += `${failedReports.length} reports failed to process.`;
    if (message) alert(message);

    fetchReports();
    setSelectedReports([]);
  };

  const columns = [
    {
      title: (
        <input
          type="checkbox"
          checked={selectedReports.length > 0 && selectedReports.length === filteredReports.filter(report => !report.isPassed).length}
          onChange={handleSelectAll}
        />
      ),
      key: 'select',
      render: (text, record) => (
        <input
          type="checkbox"
          checked={selectedReports.includes(record.id)}
          onChange={() => handleCheckboxChange(record.id)}
        />
      ),
    },
    {
      title: 'Student Number',
      dataIndex: 'studentNumber',
      key: 'studentNumber',
    },
    {
      title: 'Name',
      key: 'name',
      render: (text, record) => `${record.firstName} ${record.middleName} ${record.lastName}`,
    },
    {
      title: 'College',
      key: 'college',
      render: (text, record) => collegeMap[record.college] || 'Unknown',
    },
    {
      title: 'Year',
      key: 'year',
      render: (text, record) => yearMap[record.year] || 'Unknown',
    },
    {
      title: 'Violation',
      key: 'violation',
      render: (text, record) => violationMap[record.violation] || 'Unknown',
    },
    {
      title: 'Date & Time',
      key: 'submissionDate',
      render: (text, record) => formatDate(record.submissionDate),
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Button type="link" onClick={() => openModal(record)}>
          View Report
        </Button>
      ),
    },
  ];

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard--content">
        <div className="list-container">
          <div className="header-actions">
            <div className="search-box">
              <Input
                placeholder="Search Student Number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                prefix={<BiSearch className="icon" />}
              />
            </div>
            <div className="bulk-actions">
              <Button 
                type="primary" 
                onClick={handleBulkApprove} 
                disabled={selectedReports.length === 0}
              >
                Approve Selected
              </Button>
            </div>
          </div>

          <div className="tabs">
            {['Not Passed', 'Passed'].map((tab) => (
              <Button 
                key={tab} 
                type={selectedTab === tab ? 'primary' : 'default'}
                onClick={() => setSelectedTab(tab)}
              >
                {tab} ({reports.filter(report => 
                  tab === 'Passed' ? report.isPassed : !report.isPassed
                ).length})
              </Button>
            ))}
          </div>

          {filteredReports.length > 0 ? (
            <Table
              dataSource={filteredReports}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 6 }}
              scroll={{ x: true }}
            />
          ) : (
            <div>No matching records found</div>
          )}
        </div>
      </div>

      {isModalOpen && selectedReport && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div id='modalHeader'>
              <div>
                <h2>{selectedReport.firstName} {selectedReport.middleName} {selectedReport.lastName}</h2>
                <p className='modalStudNum'>{selectedReport.studentNumber}</p>
              </div>
              <div id='modalStatus'>
                <p><strong>Status:</strong> {selectedReport.status}</p>
              </div>
            </div>

            <table className="modal-table">
              <tbody>
                <tr>
                  <td colSpan="2"><strong>College: {collegeMap[selectedReport.college] || 'Unknown'}</strong></td>
                  <td colSpan="2"><strong>Year: {yearMap[selectedReport.year] || 'Unknown'}</strong></td>
                </tr>
                <tr>
                  <td colSpan="4" className="table-label"><strong>Violation Details</strong></td>
                </tr>
                <tr>
                  <td colSpan="2"><strong>Guard Name: {selectedReport.guardName}</strong></td>
                  <td colSpan="2"><strong>Date & Time: {formatDate(selectedReport.submissionDate)}</strong></td>
                </tr>
                <tr>
                  <td colSpan="4"><strong>Violation:</strong> {violationMap[selectedReport.violation] || 'Unknown'}</td>
                </tr>
                <tr>
                  <td colSpan="4"><strong>Remarks:</strong> {selectedReport.remarks}</td>
                </tr>
              </tbody>
            </table>

            <div className="button-container">
              <button onClick={closeModal} className="close-modal-btn">Close</button>
              {!selectedReport.isPassed && (
                <button onClick={() => handleProceed(selectedReport)} className="proceed-btn">
                  Proceed
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className="success-message">
          Success! The operation was completed successfully.
        </div>
      )}
    </div>
  );
}

export default GuardContent;