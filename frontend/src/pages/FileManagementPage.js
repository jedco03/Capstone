// src/pages/FileManagementPage.js
import React from 'react';
import Sidebar from '../components/Sidebar'
import FileManagement from '../components/FileManagement';

const FileManagementPage = () => {
  return (
    <div>
      <div className='dashboard'>
            <Sidebar />
            <div className='file-dashboard'>
                <FileManagement/>
            </div>
        </div>
    </div>
  );
};

export default FileManagementPage;