import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom';
import '../styles/addStyles.css';
import api from './axiosInstance';

const AddRecordForm = () => {
    const [studentNumber, setStudentNumber] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [colleges, setColleges] = useState([]);
    const [courses, setCourses] = useState([]); // ✅ Added Course State
    const [email, setEmail] = useState([]);
    const [years, setYears] = useState([]);
    const [selectedCollege, setSelectedCollege] = useState(''); 
    const [selectedCourse, setSelectedCourse] = useState(''); // ✅ Added Selected Course
    const [selectedYear, setSelectedYear] = useState('');
    const [genders, setGenders] = useState(['Male', 'Female']); 
    const [selectedGender, setSelectedGender] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [guardian, setGuardian] = useState('');
    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // Added for submission state
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [collegeResponse, yearResponse, courseResponse] = await Promise.all([
                    axios.get('https://localhost:7096/api/colleges'), 
                    axios.get('https://localhost:7096/api/years'),
                    axios.get('https://localhost:7096/api/courses') // ✅ Fetch courses
                ]);
                
                console.log("Fetched Colleges:", collegeResponse.data);
                console.log("Fetched Years:", yearResponse.data);
                console.log("Fetched Courses:", courseResponse.data);

                setColleges(collegeResponse.data);
                setYears(yearResponse.data);
                setCourses(courseResponse.data); // ✅ Store courses in state
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
            }
        };
        fetchDropdownData();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true); // Disable the submit button

        console.log("Submitting Student Data:", {
            studentNumber,
            email,
            firstName,
            lastName,
            middleName,
            yearId: selectedYear,
            collegeId: selectedCollege,
            courseId: selectedCourse,
            gender: selectedGender,
            phoneNumber,
            guardian,
            violations: [],
            isDelete: false, // Default to false for new records
            semester: null // Will be set in the backend
        });

        const newStudent = {
            studentNumber,
            email,
            firstName,
            lastName,
            middleName,
            yearId: selectedYear,
            collegeId: selectedCollege,
            courseId: selectedCourse,
            gender: selectedGender,
            phoneNumber,
            guardian,
            violations: [],
            isDelete: false, // Default to false for new records
            semester: null // Will be set in the backend
        };

        try {
            const response = await api.post('/records', newStudent);
            console.log('Record Created:', response.data);
            setIsSuccessModalVisible(true);
        } catch (error) {
            console.error('Error creating record:', error);
            setErrorMessage(error.response?.data?.message || 'An error occurred while adding the record.');
            setIsErrorModalVisible(true);
        } finally {
            setIsSubmitting(false); // Re-enable the submit button
        }
    };

    // Filter courses based on selected college
    const filteredCourses = courses.filter(course => course.college === selectedCollege);

    // Redirect after clicking modal button
    const handleRedirect = () => {
        navigate('/home'); 
    };

    return (
        <div className="container"> 
            <h2 className="form-title">Add Student Record</h2> 
            <form onSubmit={handleSubmit} className="add-record-form">

                {/* Student Number */}
                <div className="form-group">
                    <label htmlFor="studentnumber">Student Number:</label>
                    <input 
                        type="text" 
                        id="studentnumber" 
                        value={studentNumber} 
                        onChange={(e) => setStudentNumber(e.target.value)} 
                    />
                    <label htmlFor="email">Email:</label>
                    <input 
                        type="text" 
                        id="studentemail" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                    />
                </div>

                {/* First, Middle, Last Name */}
                <div className="form-group">
                    <label htmlFor="firstName">First Name:</label>
                    <input 
                        type="text" 
                        id="firstName" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="middleName">Middle Name:</label>
                    <input 
                        type="text" 
                        id="middleName" 
                        value={middleName} 
                        onChange={(e) => setMiddleName(e.target.value)} 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="lastName">Last Name:</label>
                    <input 
                        type="text" 
                        id="lastName" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                    />
                </div>

                {/* Year, College, Course, Gender */}
                <div className="form-group"> 
                    <label htmlFor="year">Year:</label> 
                    <select 
                        id="year" 
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(e.target.value)}
                    >
                        <option value="">Select Year</option>
                        {years.map((year) => (
                            <option key={year._id} value={year.id}>
                                {year.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group"> 
                    <label htmlFor="college">College:</label>
                    <select 
                        id="college"
                        value={selectedCollege} 
                        onChange={(e) => setSelectedCollege(e.target.value)}
                    >
                        <option value="">Select College</option>
                        {colleges.map((college) => (
                            <option key={college._id} value={college.id}>
                                {college.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* ✅ Course Dropdown */}
                <div className="form-group">
                    <label htmlFor="course">Course:</label>
                    <select 
                        id="course"
                        value={selectedCourse} 
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        disabled={!selectedCollege} // Disable until a college is selected
                    >
                        <option value="">Select Course</option>
                        {filteredCourses.map((course) => (
                            <option key={course._id} value={course.id}>
                                {course.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="gender">Gender:</label>
                    <select 
                        id="gender"
                        value={selectedGender} 
                        onChange={(e) => setSelectedGender(e.target.value)}
                    >
                        <option value="">Select Gender</option>
                        {genders.map((gender) => (
                            <option key={gender} value={gender}>
                                {gender}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Phone Number, Guardian */}
                <div className="form-group">
                    <label htmlFor="phonenumber">Phone Number:</label>
                    <input 
                        type="text" 
                        id="phonenumber" 
                        value={phoneNumber} 
                        onChange={(e) => setPhoneNumber(e.target.value)} 
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="guardian">Guardian:</label>
                    <input 
                        type="text" 
                        id="guardian" 
                        value={guardian} 
                        onChange={(e) => setGuardian(e.target.value)} 
                    />
                </div>

                {/* Submit Button */}
                <button type="submit" id='AddrecordButton' disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Add Record'}
                </button>
            </form>

            {/* Success Modal */}
            {isSuccessModalVisible && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <img src="/success.png" alt="Success" className="modal-image" />
                        <h2>You successfully added the record!</h2>
                        <button className="modal-button" onClick={handleRedirect}>Go to Records</button>
                    </div>
                </div>
            )}

            {/* Error Modal */}
            {isErrorModalVisible && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <img src="/fail.png" alt="Error" className="modal-image" />
                        <h2>Error Adding Record</h2>
                        <p>{errorMessage}</p>
                        <button className="modal-button" onClick={() => setIsErrorModalVisible(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddRecordForm;