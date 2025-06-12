"use client";
import React from "react";
import styles from "./search.module.css";

export default function PaginationComponent({ currentPage, totalPages, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className={styles.paginationContainer}>
      {pages.map(num => (
        <button
          key={num}
          onClick={() => onPageChange(num)}
          className={num === currentPage ? styles.activePage : ''}
        >{num}</button>
      ))}
    </div>
  );
}