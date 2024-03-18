import React from 'react';
import '../styles/sidebarstyles.css'
import { BiHome, BiBookAlt, BiSolidReport, BiStats, BiExit, BiMessage, BiHelpCircle } from 'react-icons/bi'

const Sidebar = () => {
    return <div className='menu'>
        <div className='logo'>
            <BiBookAlt className='logo-icon'/>
            <h2>SVMS</h2>
        </div>

        <div className='menu--list'>
            <a href='#' className='item'>
                <BiSolidReport className='icon'/>
                Dashboard
            </a>
            <a href='#' className='item'>
                <BiStats className='icon'/>
                Reports Summary
            </a>
            <a href='#' className='item'>
                <BiMessage className='icon'/>
                Reports Inbox
            </a>
            <a href='#' className='item'>
                <BiHelpCircle className='icon'/>
                Help
            </a>
            <a href='#' className='item'>
                <BiExit className='icon'/>
                Logout
            </a>
        </div>
    </div>
}

export default Sidebar;