import React from 'react';
import '../styles/content.css'
import ContentHeader from './ContentHeader';
import FetchRecords from './fetchRecords';

const Content = () => {
    return <div className='content'>
        <ContentHeader />
        <FetchRecords apiEndpoint="https://localhost:7096/api/records" /> 
    </div>
}

export default Content;