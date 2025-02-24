import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/dashStyles.css';
import '../../styles/content.css';
import '../../styles/reportsStyle.css';
import Sidebar from '../Sidebar';
import { Link, useNavigate } from 'react-router-dom';
import { BiSearch } from "react-icons/bi";

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
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredReports, setFilteredReports] = useState([]);
    const [selectedTab, setSelectedTab] = useState("All");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMappings = async () => {
            try {
                const [collegesRes, yearsRes, violationsRes] = await Promise.all([
                    axios.get('https://localhost:7096/api/colleges'),
                    axios.get('https://localhost:7096/api/years'),
                    axios.get('https://localhost:7096/api/violations'),
                ]);
        
        
                // Ensure `data` exists before using `.reduce()`
                setCollegeMap(collegesRes.data ? collegesRes.data.reduce((acc, col) => ({ ...acc, [col._id]: col.name }), {}) : {});
                setYearMap(yearsRes.data ? yearsRes.data.reduce((acc, yr) => ({ ...acc, [yr._id]: yr.name }), {}) : {});
                setViolationMap(violationsRes.data ? violationsRes.data.reduce((acc, vio) => ({ ...acc, [vio.id]: vio.name }), {}) : {});
        
            } catch (err) {
                console.error('Error fetching mappings:', err);
            }
        };
        

        fetchReports();
        fetchMappings();
    }, []);


    const fetchReports = async () => {
        try {
            const response = await axios.get('https://localhost:7096/api/reports');
    
            // Sort reports based on the specified priority
            const sortedReports = response.data.sort((a, b) => {
                if (a.isViewed !== b.isViewed) {
                    return a.isViewed ? 1 : -1;
                }
    
                if (a.isPassed !== b.isPassed) {
                    return a.isPassed ? 1 : -1;
                }
    
                return new Date(b.submissionDate) - new Date(a.submissionDate);
            });
    
            setReports(sortedReports);
            setFilteredReports(sortedReports); // Initialize filtered reports
            setIsLoading(false);
        } catch (err) {
            setError('Error fetching data');
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const filtered = reports.filter((report) => {
            if (selectedTab === "All") return true;
            if (selectedTab === "Passed") return report.isPassed;
            if (selectedTab === "Not Passed") return !report.isPassed;
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
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
        return date.toLocaleString('en-US', options);
    };


    const openModal = (report) => {

        if (!report || !report.id) {
            console.error("Report ID is missing!");
            return;
        }
    
        setSelectedReport(report);
        setIsModalOpen(true);
        
        // Pass only the report ID (string) instead of the whole report object
        updateIsViewed(report.id);
    
    };
    
    const updateIsViewed = async (reportId) => {
        if (!reportId) {
            console.error("Error: Report ID is undefined");
            return;
        }
    
        console.log("Final REPORT ID:", reportId); // Should log a string, not an object
    
        try {
            await axios.patch(`https://localhost:7096/api/reports/${reportId}`, {
                isViewed: true
            });
            console.log("isViewed updated successfully");
        } catch (error) {
            console.error("Error updating isViewed:", error);
        }
    };
    
    
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedReport(null);
        fetchReports(); // Re-fetch reports to update isViewed status
    };

    const handleProceed = async (report) => {

        if (report.isPassed) {
            alert("This report has already been processed.");
            return;
        }

        try {
            console.log("Processing report for student number:", report.studentNumber);
    
            let studentExists = false;
    
            // Step 1: Check if student exists by student number
            try {
                const studentResponse = await axios.get(`https://localhost:7096/api/records/${report.studentNumber}`);
                studentExists = true; // Student exists
                console.log("Student exists:", studentResponse.data);
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    console.log("Student not found, creating new record...");
    
                    // Step 2: Create new student
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
                        violations: []
                    };
    
                    const createStudentResponse = await axios.post('https://localhost:7096/api/records', newStudent);
                    console.log("New student response:", createStudentResponse.data);
    
                    if (!createStudentResponse.data.studentNumber) {
                        throw new Error("Failed to retrieve student number after creation.");
                    }
                    console.log("New student created:", createStudentResponse.data);
                } else {
                    throw error;
                }
            }
    
            // Step 3: Add violation to student (using studentNumber)
            const newViolation = {
                violationId: report.violation || "Missing violationId", 
                remarks: report.remarks || "No remarks provided",
                type: report.type || "No type specified",
                guardName: report.guardName || "Unknown guard", 
                isIDInPossession: report.isIDInPossession ?? false,  
            };
    
            console.log("Report object:", report);
            console.log("Adding violation for student number:", report.studentNumber);
            await axios.post(`https://localhost:7096/api/records/addViolation/${report.studentNumber}`, newViolation);
    
            // Step 4: Update isPassed to true
            try {
                console.log("Updating isPassed to true for report ID:", report.id);
                await axios.patch(`https://localhost:7096/api/reports/${report.id}`, {
                    isPassed: true
                });
                console.log("isPassed updated successfully.");
            } catch (error) {
                console.error("Error updating isPassed:", error);
                alert("Failed to update report status.");
            }
    
            return { success: true, message: "Violation successfully recorded." };
        } catch (error) {
            console.error("Error processing report:", error);
            alert("An error occurred while processing the report.");
        }
    };
    
    


    // Handle checkbox selection
    const handleCheckboxChange = (studentNumber) => {
        setSelectedReports(prevSelected =>
            prevSelected.includes(studentNumber)
                ? prevSelected.filter(id => id !== studentNumber)
                : [...prevSelected, studentNumber]
        );
    };

    const handleSelectAll = (e) => {
        console.log("Reports before filtering:", reports);
    
        if (e.target.checked) {
            const reportsToSelect = reports
                .filter(report => !report.isPassed)
                .map(report => report.id);
    
            console.log("Selected reports:", reportsToSelect);
    
            setSelectedReports(reportsToSelect);
        } else {
            setSelectedReports([]);
        }
    };
    
    

    const handleBulkApprove = async () => {
        if (selectedReports.length === 0) {
            alert("No reports selected.");
            return;
        }
    
        let failedReports = [];
        let successCount = 0;
    
        try {
            for (const reportId of selectedReports) {
                const report = reports.find(r => r.id === reportId); // Get the report data
                console.log("Processing report:", report);
    
                if (!report) {
                    failedReports.push(reportId);
                    continue; // Skip if report not found
                }
    
                try {
                    await handleProceed(report); // Reuse handleProceed function
                    successCount++; // Count successful reports
                } catch (error) {
                    console.error(`Failed to process report ${reportId}:`, error);
                    failedReports.push(reportId); // Track failed reports
                }
            }
    
            // Show summary message
            let message = "";
                if (successCount > 0) {
                    message += `${successCount} reports processed successfully.\n`;
                }
                if (failedReports.length > 0) {
                    message += `${failedReports.length} reports failed to process. Check console for details.`;
                }
                if (message) alert(message);
    
            fetchReports(); // Refresh the reports list
            setSelectedReports([]); // Clear selected checkboxes
        } catch (error) {
            console.error("Unexpected error processing reports:", error);
            alert("An unexpected error occurred while processing reports.");
        }
    };


    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className='dashboard'>
            <Sidebar />
            <div className="list-container">
                <div className="bulk-actions">
                    <button onClick={handleBulkApprove} disabled={selectedReports.length === 0}>Approve Selected</button>
                </div>

                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search Student Number"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <BiSearch className="icon" />
                </div>

                {/* Tab Navigation */}
                <div className="tabs">
                    {["All", "Passed", "Not Passed"].map((tab) => (
                        <button 
                            key={tab} 
                            className={`tab-button ${selectedTab === tab ? "active" : ""}`}
                            onClick={() => setSelectedTab(tab)}
                        >
                            {tab} ({reports.filter(report => 
                                tab === "All" ? true : 
                                tab === "Passed" ? report.isPassed === true : 
                                report.isPassed === false
                            ).length})
                        </button>
                    ))}
                </div>

                {reports.length > 0 ? (
                    <table className="reports-table">
                        <thead>
                            <tr>
                                <th>
                                <input
                                    type="checkbox"
                                    onChange={handleSelectAll}
                                    checked={
                                        selectedReports.length > 0 &&
                                        selectedReports.length === reports.filter(report => !report.isPassed).length
                                    }
                                />
                                </th>
                                <th>Student Number</th>
                                <th>Name</th>
                                <th>College</th>
                                <th>Year</th>
                                <th>Violation</th>
                                <th>Date & Time</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReports.map((report) => (
                                <tr 
                                    key={report.studentNumber} 
                                    className={report.isViewed ? 'viewed-report' : ''}
                                >
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedReports.includes(report.id)} // Use report.id instead
                                            onChange={() => handleCheckboxChange(report.id)} // Use report.id here too
                                        />
                                    </td>
                                    <td>{report.studentNumber}</td>
                                    <td>{report.firstName} {report.middleName} {report.lastName}</td>
                                    <td>{collegeMap[report.college] || 'Unknown'}</td>
                                    <td>{yearMap[report.year] || 'Unknown'}</td>
                                    <td>{violationMap[report.violation] || 'Unknown'}</td>
                                    <td>{formatDate(report.submissionDate)}</td>
                                    <td>
                                        <button onClick={() => openModal(report)} className="expand-link">
                                            View Report
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div>No matching records found</div>
                )}
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
                            {/* Conditionally render the Proceed button */}
                            {!selectedReport.isPassed && (
                                <button onClick={() => handleProceed(selectedReport)} className="proceed-btn">
                                    Proceed
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GuardContent;
