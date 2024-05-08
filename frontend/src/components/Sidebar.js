import React from 'react';
import '../styles/sidebarstyles.css'
import { BiHome, BiBookAlt, BiSolidReport, BiStats, BiExit, BiMessage, BiHelpCircle, BiListPlus } from 'react-icons/bi'
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    return <div className='menu'>
        <div className='logo'>
        <img src="/SACLOGO.png" alt="Login Logo"/>
            <h2>SVMS</h2>
        </div>

        <div className='menu--list'>
            <NavLink to="/home" className='item'>
                <BiSolidReport className='icon'/>
                Dashboard
            </NavLink>
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
            <a href='/addrecord' className='item'>
                <BiListPlus className='icon'/>
                Add Record
            </a>
            <a href='#' className='item'>
                <BiExit className='icon'/>
                Logout
            </a>
            <a href='#' className='item'>
                <BiExit className='icon'/>
                Audit  Trail
            </a>
            <a href='#' className='item'>
                <BiExit className='icon'/>
                File Management
            </a>
        </div>
    </div>
}

export default Sidebar;