import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Select, Spin } from "antd";
import "antd/dist/reset.css"; 

const AuditTrailTable = () => {
    const [auditTrails, setAuditTrails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionFilter, setActionFilter] = useState(null);

    const fetchAuditTrails = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await axios.get("https://localhost:7096/api/AuditTrail", {
                params: { action: actionFilter },
            });

            setAuditTrails(response.data);
        } catch (err) {
            setError("Failed to fetch audit trails.");
            console.error("Error fetching audit trails:", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAuditTrails();
    }, [actionFilter]);

    const columns = [
        {
            title: "Action",
            dataIndex: "action",
            key: "action",
        },
        {
            title: "User ID",
            dataIndex: "userId",
            key: "userId",
        },
        {
            title: "User Name",
            dataIndex: "userName",
            key: "userName",
        },
        {
            title: "Record ID",
            dataIndex: "recordId",
            key: "recordId",
        },
        {
            title: "Student Number",
            dataIndex: "studentNumber",
            key: "studentNumber",
        },
        {
            title: "Timestamp",
            dataIndex: "timestamp",
            key: "timestamp",
            render: (timestamp) => new Date(timestamp).toLocaleString(),
        },
        {
            title: "Details",
            dataIndex: "details",
            key: "details",
        },
    ];

    const actionOptions = [
        { value: null, label: "All Actions" },
        { value: "Create Account", label: "Create Account" },
        { value: "Update Account", label: "Update Account" },
        { value: "Delete Account", label: "Delete Account" },
        { value: "Change Password", label: "Change Password" },
        // Add more actions as needed
    ];

    return (
        <div>
            <h1>Audit Trail</h1>
            <Select
                placeholder="Filter by Action"
                options={actionOptions}
                onChange={(value) => setActionFilter(value)}
                style={{ width: 200, marginBottom: 16 }}
            />
            {loading ? (
                <Spin size="large" />
            ) : error ? (
                <p style={{ color: "red" }}>{error}</p>
            ) : (
                <Table
                    columns={columns}
                    dataSource={auditTrails}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            )}
        </div>
    );
};

export default AuditTrailTable;