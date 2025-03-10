import React from "react";
import "../styles/fileManagementStyles.css";

const SuccessModal = ({ message, onClose }) => {
  return (
    <div className="success-modal-overlay">
      <div className="success-modal">
        <h3>Success!</h3>
        <p>{message}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default SuccessModal;