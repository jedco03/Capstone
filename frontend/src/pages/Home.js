import React from 'react';
import FetchRecords from '../components/fetchRecords';
import '../myStyles.css';

function HomePage() {
  return (
    <div>
      <FetchRecords apiEndpoint="https://localhost:7096/api/records" /> 
    </div>
  );
}

export default HomePage;
