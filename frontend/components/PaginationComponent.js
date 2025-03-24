// components/PaginationComponent.js
"use client";

import React from "react";
import styles from "./search.module.css";

export default function PaginationComponent({ currentPage, totalPages, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className={styles.paginationContainer}>
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={page === currentPage ? styles.activePage : ""}
        >
          {page}
        </button>
      ))}
    </div>
  );
}
