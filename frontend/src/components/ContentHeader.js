import React from 'react';
import { BiSearch, BiNotification } from 'react-icons/bi';

const ContentHeader = ({ searchTerm, onSearchChange }) => {
    return <div className='content--header'>
        <h1 className='header--title'>Dashboard</h1>
        <div className='header--activity'>
        </div>
    </div>
}

export default ContentHeader;