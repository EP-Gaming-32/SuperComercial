// components/SearchComponent.js
"use client";

import React, { useState } from "react";
import styles from "./search.module.css";

export default function SearchComponent({
  keywordPlaceholder = "Enter keywords...",
  filters = [],
  onSearch,
}) {
  const [keyword, setKeyword] = useState("");
  // Build an initial state for each filter
  const initialFilterValues = filters.reduce((acc, filter) => {
    acc[filter.name] = filter.initialValue || "";
    return acc;
  }, {});
  const [filterValues, setFilterValues] = useState(initialFilterValues);

  const handleKeywordChange = (e) => setKeyword(e.target.value);
  const handleFilterChange = (e, name) =>
    setFilterValues({ ...filterValues, [name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Combine keyword and filter values and send via onSearch
    onSearch({ keyword, ...filterValues });
  };

  return (
    <form className={styles.searchSection} onSubmit={handleSubmit}>
      <div className={styles.searchFields}>
        {/* Keyword field with a placeholder for label space */}
        <div className={styles.fieldContainer}>
          <div className={styles.labelPlaceholder}></div>
          <input
            type="text"
            placeholder={keywordPlaceholder}
            value={keyword}
            onChange={handleKeywordChange}
            className={styles.keywordInput}
          />
        </div>
        {filters.map((filter, index) => (
          <div key={index} className={styles.fieldContainer}>
            <label className={styles.filterLabel}>{filter.label}</label>
            {filter.type === "select" ? (
              <select
                value={filterValues[filter.name]}
                onChange={(e) => handleFilterChange(e, filter.name)}
                className={styles.filterInput}
              >
                <option value="">{filter.placeholder || "All"}</option>
                {filter.options.map((option, idx) => (
                  <option key={idx} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder={filter.placeholder || ""}
                value={filterValues[filter.name]}
                onChange={(e) => handleFilterChange(e, filter.name)}
                className={styles.filterInput}
              />
            )}
          </div>
        ))}
        <div className={styles.fieldContainer}>
          <div className={styles.labelPlaceholder}></div>
          <button type="submit" className={styles.searchButton}>
            Search
          </button>
        </div>
      </div>
    </form>
  );
}
