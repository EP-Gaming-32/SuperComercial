"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./search.module.css";

export default function SearchComponent({
  keywordName = null,
  keywordPlaceholder = "Digite palavras-chave...",
  filters = [],
  onSearch,
  addButton = false,
  addButtonLabel = "Cadastrar",
  addButtonUrl = "/",
}) {
  const router = useRouter();
  const initialFilters = React.useMemo(
    () => Object.fromEntries(filters.map(f => [f.name, f.initialValue ?? ""])),
    [filters]
  );

  const [keyword, setKeyword] = useState("");
  const [filterValues, setFilterValues] = useState(initialFilters);

  const handleChange = (name, value) => {
    setFilterValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const query = { ...filterValues };
    if (keywordName) query[keywordName] = keyword;
    console.debug('[SearchComponent] Submit with query:', query);
    onSearch(query);
  };

  const handleAddClick = () => {
    console.debug('[SearchComponent] Navigating to:', addButtonUrl);
    router.push(addButtonUrl);
  };

  return (
    <form className={styles.searchSection} onSubmit={handleSubmit}>
  {/* --- primeira linha: filtros --- */}
  <div className={styles.searchFields}>
    {keywordName && (
      <input
        type="text"
        placeholder={keywordPlaceholder}
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
        className={styles.keywordInput}
      />
    )}
    {filters.map(f => (
      <div key={f.name} className={styles.fieldContainer}>
        <label className={styles.filterLabel}>{f.label}</label>
        {f.type === 'select' ? (
          <select
            value={filterValues[f.name] || ""}
            onChange={e => handleChange(f.name, e.target.value)}
            className={styles.filterInput}
          >
            <option value="">{f.placeholder || 'Todos'}</option>
            {f.options.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        ) : (
          <input
            type={f.type || 'text'}
            placeholder={f.placeholder || ''}
            value={filterValues[f.name] || ""}
            onChange={e => handleChange(f.name, e.target.value)}
            className={styles.filterInput}
          />
        )}
      </div>
    ))}
  </div>

  {/* --- segunda linha: botões --- */}
  <div className={styles.buttonRow}>
    {addButton && (
      <button
        type="button"
        onClick={handleAddClick}
        className={styles.addButton}
      >
        {addButtonLabel}
      </button>
    )}
    <button type="submit" className={styles.searchButton}>
      Buscar
    </button>
  </div>
</form>

  );
}