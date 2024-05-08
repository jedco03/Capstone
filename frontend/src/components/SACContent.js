import React, { useState, useEffect } from 'react';
import '../styles/content.css'
import FetchRecords from './fetchRecords';

const Content = ( onExpand ) => {

    return (
        
        <div className="content">
        <FetchRecords
            apiEndpoint="https://localhost:7096/api/records"
            onExpand={onExpand}
        />
    </div>

    );
}

export default Content;