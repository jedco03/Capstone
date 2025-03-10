import React, { useEffect, useState, useRef } from 'react';
import '../styles/sidebarstyles.css';
import { BiHome, BiBookAlt, BiSolidReport, BiStats, BiExit, BiMessage, BiHelpCircle, BiListPlus } from 'react-icons/bi';
import { NavLink } from 'react-router-dom';
import { notification } from 'antd'; // Import Ant Design's notification component
import api from './axiosInstance'; // Adjust the import path to your axiosInstance file

const Sidebar = () => {
    const [reports, setReports] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const lastFetchedReports = useRef([]);
    const role = localStorage.getItem('userRole'); // Retrieve role from localStorage

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await api.get('/Reports');
                const newReports = response.data;

                // Check if there are new unread reports
                const newUnreadCount = newReports.filter(report => !report.isPassed).length;
                const previousUnreadCount = lastFetchedReports.current.filter(report => !report.isPassed).length;

                console.log('Role:', role); // Debug: Log the role

                // If there are new unread reports and the user is SAC, show a notification
                if (newUnreadCount > previousUnreadCount && role === 'SAC') {
                    const newUnreadReports = newReports.filter(
                        report => !report.isPassed && !lastFetchedReports.current.some(r => r.id === report.id)
                    );
                    if (newUnreadReports.length > 0) {
                        notification.info({
                            message: 'New Report Received',
                            description: `You have ${newUnreadReports.length} new unread report(s).`,
                            placement: 'topRight',
                            duration: 5, // Notification will disappear after 5 seconds
                        });
                    }
                }

                // Update the last fetched reports
                lastFetchedReports.current = newReports;

                // Update state
                setReports(newReports);
                setUnreadCount(newUnreadCount);
            } catch (error) {
                console.error('Error fetching reports:', error);
            }
        };

        fetchReports(); // Initial fetch
        const interval = setInterval(fetchReports, 60000); // Refetch every 60 seconds

        return () => clearInterval(interval); // Cleanup interval on unmount
    }, [role]); // Add role as a dependency to re-fetch reports if the role changes

    return (
        <div className='menu'>
            <div className='logo'>
                <img src="/SACLOGO.png" alt="Login Logo" />
                <h2>SVMS</h2>
            </div>

            <div className='menu--list'>
                {/* Always show Dashboard */}
                <NavLink to="/home" className='item'>
                    <BiSolidReport className='icon' />
                    Dashboard
                </NavLink>

                {/* Show additional items for SAC */}
                {role === 'SAC' && (
                    <>
                        <a href='/reports-summary' className='item'>
                            <BiStats className='icon' />
                            Reports Summary
                        </a>
                        <a href='/reports' className='item'>
                            <BiMessage className='icon' />
                            Reports Inbox
                            {unreadCount > 0 && (
                                <span className="notification-bubble">{unreadCount}</span>
                            )}
                        </a>
                        <a href='#' className='item'>
                            <BiHelpCircle className='icon' />
                            Help
                        </a>
                        <a href='/addrecord' className='item'>
                            <BiListPlus className='icon' />
                            Add Record
                        </a>
                        <a href='/audit-trail' className='item'>
                            <BiExit className='icon' />
                            Audit Trail
                        </a>
                        <a href='/file-management' className='item'>
                            <BiExit className='icon' />
                            File Management
                        </a>
                    </>
                )}

                {/* Always show Logout */}
                <a href='#' className='item'>
                    <BiExit className='icon' />
                    Logout
                </a>
            </div>
        </div>
    );
};

export default Sidebar;