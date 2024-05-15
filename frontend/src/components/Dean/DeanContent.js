import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FetchRecords from '../Dean/fetchRecordsDean';


function DeanContent({ onExpand }) { 
  
    return (
      <div>
        <FetchRecords 
          apiEndpoint="https://localhost:7096/api/records/students-with-violations" 
          onExpand={onExpand} 
        />
      </div>
    );
  }
  
  export default DeanContent; 