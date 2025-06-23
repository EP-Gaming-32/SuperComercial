// components/SearchComponent.js
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./search.module.css";
import { IMaskInput } from "react-imask";

// 1. SUA FUNÇÃO ORIGINAL PARA FORMATAR A DATA (RESTAURADA)
const formatDateInput = (value) => {
  if (!value) return "";
  let digits = value.replace(/\D/g, "");
  let maskedValue = "";
  if (digits.length > 0) maskedValue += digits.substring(0, 2);
  if (digits.length > 2) maskedValue += "/" + digits.substring(2, 4);
  if (digits.length > 4) maskedValue += "/" + digits.substring(4, 8);
  return maskedValue.substring(0, 10);
};

// Máscara dinâmica para telefone (mantida)
const phoneMask = [{ mask: "(00) 0000-0000" }, { mask: "(00) 00000-0000" }];

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
    filters.forEach((f) => {
      initial[f.name] = f.initialValue ?? "";
    });
    return initial;
  });

  useEffect(() => {
    const newInitial = {};
    filters.forEach((f) => {
      newInitial[f.name] = f.initialValue ?? "";
    });
    setFilterValues(newInitial);
    setKeyword("");
  }, [filters]);

  // 2. FUNÇÃO HANDLECHANGE ATUALIZADA PARA LIDAR COM A DATA (RESTAURADA)
  const handleChange = (name, value, type) => {
    if (type === "date-mask") {
      setFilterValues((prev) => ({ ...prev, [name]: formatDateInput(value) }));
    } else {
      setFilterValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let query = { ...filterValues };
    if (keywordName && keyword) {
      query[keywordName] = keyword;
    }
    console.log("[SearchComponent] Parâmetros de busca enviados:", query);
    onSearch(query);
  };

  const handleAddClick = () => {
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
            onChange={(e) => setKeyword(e.target.value)}
            className={styles.keywordInput}
          />
        )}
        {filters.map((f) => (
          <div key={f.name} className={styles.fieldContainer}>
            <label className={styles.filterLabel}>{f.label}</label>

            {/* 3. LÓGICA DE RENDERIZAÇÃO COMPLETA (COM TODOS OS TIPOS) */}
            {f.type === "select" ? (
              <select
                value={filterValues[f.name] || ""}
                onChange={(e) => handleChange(f.name, e.target.value, f.type)}
                className={styles.filterInput}
              >
                <option value="">{f.placeholder || "Todos"}</option>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : f.type === "date-mask" ? ( // LÓGICA DA DATA RESTAURADA
              <input
                type="text"
                placeholder={f.placeholder || "dd/mm/aaaa"}
                maxLength="10"
                value={filterValues[f.name] || ""}
                onChange={(e) => handleChange(f.name, e.target.value, f.type)}
                className={styles.filterInput}
                inputMode="numeric"
              />
            ) : f.type === "tel" ? ( // LÓGICA DO TELEFONE MANTIDA
              <IMaskInput
                mask={phoneMask}
                value={filterValues[f.name] || ""}
                onAccept={(value) => handleChange(f.name, value, f.type)}
                placeholder="(00) 0000-0000"
                className={styles.filterInput}
              />
            ) : (
              // INPUT PADRÃO
              <input
                type={f.type || "text"}
                placeholder={f.placeholder || ""}
                value={filterValues[f.name] || ""}
                onChange={(e) => handleChange(f.name, e.target.value, f.type)}
                className={styles.filterInput}
                maxLength={f.maxLength || undefined}
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
