// components/SearchComponent.js
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./search.module.css";

const formatDateInput = (value) => {
  if (!value) return '';
  let digits = value.replace(/\D/g, '');
  let maskedValue = '';
  if (digits.length > 0) maskedValue += digits.substring(0, 2);
  if (digits.length > 2) maskedValue += '/' + digits.substring(2, 4);
  if (digits.length > 4) maskedValue += '/' + digits.substring(4, 8);
  return maskedValue.substring(0, 10);
};

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
  const [keyword, setKeyword] = useState("");
  const [filterValues, setFilterValues] = useState(() => {
    const initial = {};
    filters.forEach(f => {
      initial[f.name] = f.initialValue ?? "";
    });
    return initial;
  });

  useEffect(() => {
    const newInitial = {};
    filters.forEach(f => {
      newInitial[f.name] = f.initialValue ?? "";
    });
    setFilterValues(newInitial);
    setKeyword(""); 
  }, [filters]);


  const handleChange = (name, value, type) => {
    if (type === 'date-mask') {
      setFilterValues(prev => ({ ...prev, [name]: formatDateInput(value) }));
    } else {
      setFilterValues(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let query = { ...filterValues };

    if (keywordName && keyword) {
      query[keywordName] = keyword;
    }

    if (filters.some(f => f.name === 'data_pedido' && f.type === 'date-mask')) {
      const formattedDateValue = query.data_pedido;
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!formattedDateValue || !dateRegex.test(formattedDateValue)) {
        delete query.data_pedido;
      }
    }
    
    // ===============================================
    // ADICIONE ESTE CONSOLE.LOG PARA DEPURAR AQUI
    // ===============================================
    console.log('[SearchComponent] Parâmetros de busca enviados:', query);
    onSearch(query);
  };

  const handleAddClick = () => {
    console.debug('[SearchComponent] Navigating to:', addButtonUrl);
    router.push(addButtonUrl);
  };

  return (
    <form className={styles.searchSection} onSubmit={handleSubmit}>
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
                onChange={e => handleChange(f.name, e.target.value, f.type)}
                className={styles.filterInput} 
              >
                <option value="">{f.placeholder || 'Todos'}</option>
                {f.options.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ) : f.type === 'date-mask' ? (
              <input
                type="text"
                placeholder={f.placeholder || 'dd/mm/aaaa'}
                maxLength="10"
                value={filterValues[f.name] || ""}
                onChange={e => handleChange(f.name, e.target.value, f.type)}
                className={styles.filterInput} 
                inputMode="numeric" 
              />
            ) : (
              <input
                type={f.type || 'text'}
                placeholder={f.placeholder || ''}
                value={filterValues[f.name] || ""}
                onChange={e => handleChange(f.name, e.target.value, f.type)}
                className={styles.filterInput} 
              />
            )}
          </div>
        ))}
      </div>

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