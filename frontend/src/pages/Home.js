import React from 'react';
import FetchRecords from '../components/fetchRecords';
import Sidebar from '../components/Sidebar'
import Content from '../components/Content'
import Profile from '../components/Profile'
import '../styles/dashStyles.css';

function HomePage() {
  return (
    <div>
      <div className='dashboard'>
        <Sidebar />
        <div className='dashboard--content'>
          <Content />
        </div>
      </div>
    </div>
  );
}

export default HomePage;

