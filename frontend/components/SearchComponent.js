"use client";

import React, { useState, useEffect } from "react";
import styles from "./search.module.css";

export default function SearchComponent({
  keywordPlaceholder = "Enter keywords...",
  filters = [],
  onSearch,
}) {
  const [keyword, setKeyword] = useState("");
  
  // Initialize filter values with empty strings or initial values provided by props
  const initialFilterValues = filters.reduce((acc, filter) => {
    acc[filter.name] = filter.initialValue || ""; // Set initial value to an empty string or the one passed
    return acc;
  }, {});
  const [filterValues, setFilterValues] = useState(initialFilterValues);

  useEffect(() => {
    // Sync filter values if filters change (optional)
    const updatedFilterValues = filters.reduce((acc, filter) => {
      acc[filter.name] = filter.initialValue || "";
      return acc;
    }, {});
    setFilterValues(updatedFilterValues);
  }, [filters]);

  const handleKeywordChange = (e) => setKeyword(e.target.value);

  const handleFilterChange = (e, name) => {
    const { value } = e.target;
    setFilterValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Send the combined keyword and filter values to the parent component
    onSearch({ keyword, ...filterValues });
  };

  return (
    <form className={styles.searchSection} onSubmit={handleSubmit}>
      <div className={styles.searchFields}>
        {/* Keyword input */}
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

        {/* Filters */}
        {filters.map((filter, index) => (
          <div key={index} className={styles.fieldContainer}>
            <label className={styles.filterLabel}>{filter.label}</label>

            {filter.type === "select" ? (
              <select
                value={filterValues[filter.name]} // Controlled value
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
                value={filterValues[filter.name]} // Controlled value
                onChange={(e) => handleFilterChange(e, filter.name)}
                className={styles.filterInput}
              />
            )}
          </div>
        ))}

        {/* Submit button */}
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
