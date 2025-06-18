// components/CustomAlert.js
"use client";
import React from 'react';
import styles from './CustomAlert.module.css';

const CustomAlert = ({ message, onClose }) => {
  console.log('[CustomAlert] Renderizando. Message:', message, 'onClose existe:', !!onClose);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <p className={styles.message}>{message}</p>
        <button className={styles.okButton} onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

export default CustomAlert;