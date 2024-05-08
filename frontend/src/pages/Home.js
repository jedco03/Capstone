import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar'
import Content from '../components/SACContent'
import { useRole } from '../components/useRole'
import DeanContent from '../components/Dean/DeanContent';
import '../styles/dashStyles.css';

function HomePage() {

  const [showExpandedRecord, setShowExpandedRecord] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const role = useRole();

    const handleExpand = (studentId) => {
      setSelectedStudentId(studentId);
      setShowExpandedRecord(true);
  };
  
  return (
    <div>
      <div className='dashboard'>
          <Sidebar />
          <div className='dashboard--content'>
              {role === 'Dean' && (
                  <DeanContent 
                      showExpandedRecord={showExpandedRecord}
                      selectedStudentId={selectedStudentId}
                      onExpand={handleExpand}/>
              )}

              {role === 'SAC' && (
                  <Content 
                      showExpandedRecord={showExpandedRecord}
                      selectedStudentId={selectedStudentId}
                      onExpand={handleExpand}  
                  />
              )}
          </div>
      </div>
  </div>
  );
}

export default HomePage;

