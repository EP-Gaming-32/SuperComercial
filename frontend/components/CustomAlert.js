"use client";
import React from 'react';
import styles from './CustomAlert.module.css';

const CustomAlert = ({ message, onClose }) => {
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