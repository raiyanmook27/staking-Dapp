import React, { useState } from "react";
import "./overlay.css"; // Import the CSS file for styling (create this file in the same folder)

const OverlayAlert = ({ balance, onClose }) => {
  const [showOverlay, setShowOverlay] = useState(true);

  const handleClose = () => {
    setShowOverlay(false);
    onClose();
  };

  return (
    <div className={`overlay ${showOverlay ? "active" : ""}`}>
      <div className="overlay-content">
        <p>User Pending Rewards: {balance}</p>
        <button onClick={handleClose}>Close</button>
      </div>
    </div>
  );
};

export default OverlayAlert;
