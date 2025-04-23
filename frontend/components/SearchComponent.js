"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./search.module.css";

export default function SearchComponent({
  keywordPlaceholder = "Enter keywords...",
  filters = [],
  onSearch,
  addButton = false,
  addButtonLabel = "Cadastrar",
  addButtonUrl = "/",
}) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");

  const initialFilterValues = filters.reduce((acc, filter) => {
    acc[filter.name] = filter.initialValue || "";
    return acc;
  }, {});
  const [filterValues, setFilterValues] = useState(initialFilterValues);

  useEffect(() => {
    const updatedFilterValues = filters.reduce((acc, filter) => {
      acc[filter.name] = filter.initialValue || "";
      return acc;
    }, {});
    setFilterValues(updatedFilterValues);
  }, [filters]);

  const handleKeywordChange = (e) => setKeyword(e.target.value);

  const handleFilterChange = (e, name) => {
    const { value } = e.target;
    setFilterValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ keyword, ...filterValues });
  };

  const handleAddClick = () => {
    router.push(addButtonUrl);
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

        {/* Submit button */}
        <div className={styles.fieldContainer}>
          <div className={styles.labelPlaceholder}></div>
          <button type="submit" className={styles.searchButton}>
            Search
          </button>
        </div>

        {/* Add new item button */}
        {addButton && (
          <div className={styles.fieldContainer}>
            <div className={styles.labelPlaceholder}></div>
            <button
              type="button"
              onClick={handleAddClick}
              className={styles.addButton}
            >
              {addButtonLabel}
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
