import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import '../styles/addStyles.css'

const AddRecordForm = () => {
    const [studentNumber, setStudentNumber] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [colleges, setColleges] = useState([]);
    const [selectedCollege, setSelectedCollege] = useState(''); 
    const [selectedYear, setSelectedYear] = useState(0);
    const [genders, setGenders] = useState(['Male', 'Female']); 
  const [selectedGender, setSelectedGender] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [guardian, setGuardian] = useState('');

    //Communicate with API
    const handleSubmit = async (event) => {
        event.preventDefault();
    
        const newStudent = {
            studentNumber,
            firstName,
            lastName,
            middleName,
            selectedYear,
            college: selectedCollege, 
            gender: selectedGender,
            phoneNumber,
            guardian,
            violations: []
        };
    
        try {
            console.log('Student data to be sent:', newStudent);
            const response = await axios.post('https://localhost:7096/api/records', newStudent);
            console.log('Record Created:', response.data);
        } catch (error) {
            console.error('Error creating record:', error);    
        }
    }

    //Dropdown
    useEffect(() => {
        const fetchColleges = async () => {
          setColleges(['CEIS', 'SLCN', 'CBMA', 'CHTM', 'CASE', 'CAHS', 'CMT']); 
        };
        fetchColleges();
      }, []);

    return (
        <div className="container"> 
            <h2 className="form-title">Add Student Record</h2> 
            <form onSubmit={handleSubmit} className="add-record-form"> 

                <div className="form-group">
                    <label htmlFor="studentnumber">Student Number:</label>
                    <input 
                        type="text" 
                        id="studentnumber" 
                        value={studentNumber} 
                        onChange={(e) => setStudentNumber(e.target.value)} 
                    />
                </div>        

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
        
                <div className="form-group"> 
                    <label htmlFor="year">Year:</label> 
                    <select 
                        id="year" 
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                    </select>
                </div>

                <div className="form-group"> 
                    <label htmlFor="college">College:</label>
                    <select 
                        id="college"
                        value={selectedCollege} 
                        onChange={(e) => setSelectedCollege(e.target.value)}
                    >
                        {colleges.map((college) => (
                            <option key={college} value={college}>
                                {college}
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
                    {genders.map((gender) => (
                        <option key={gender} value={gender}>
                        {gender}
                        </option>
                    ))}
                    </select>
                </div>
        
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
        
        
                <button type="submit">Add Record</button>
            </form>
        </div>
    );

};

export default AddRecordForm;  

