import React, { useState, useEffect } from 'react';
import FetchRecords from '../components/fetchRecords';
import Sidebar from '../components/Sidebar'
import Content from '../components/Content'
import Profile from '../components/Profile'
import '../styles/dashStyles.css';

function HomePage() {

  const [showExpandedRecord, setShowExpandedRecord] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState(null);

    const handleExpand = (studentId) => {
      setSelectedStudentId(studentId);
      setShowExpandedRecord(true);
  };

  return (
    <div>
      <div className='dashboard'>
        <Sidebar />
        <div className='dashboard--content'>
        <Content 
            showExpandedRecord={showExpandedRecord}
            selectedStudentId={selectedStudentId}
            onExpand={handleExpand}  
        /> 
        </div>
      </div>
    </div>
  );
}

export default HomePage;

