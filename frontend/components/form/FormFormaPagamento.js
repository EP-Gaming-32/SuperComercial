'use client';
import React, { useState, useEffect } from 'react';
import styles from './FormPageProdutos.module.css';

export default function FormPageFormaPagamento({
  data,
  mode,
  onSubmit,
  onCancel
}) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    // Inicializa ou reseta o formulário com os dados recebidos
    setFormData(data);
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Configuração dinâmica dos campos
  const campoConfig = [
    { name: 'id_forma_pagamento', label: 'ID', type: 'text' },
    { name: 'descricao', label: 'Pagamento', type: 'text' }
  ];

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {campoConfig.map(({ name, label, type, options, optionKey, optionLabel }) => (
        <div key={name} className={styles.field}>
          <label htmlFor={name} className={styles.label}>{label}</label>
          {type === 'select' ? (
            <select
              id={name}
              name={name}
              value={formData[name] || ''}
              onChange={handleChange}
              className={styles.input}
            >
              <option value="">Selecione...</option>
              {(options || []).map(opt => (
                <option key={opt[optionKey]} value={opt[optionKey]}>
                  {opt[optionLabel]}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={name}
              name={name}
              type={type}
              value={formData[name] ?? ''}
              onChange={handleChange}
              className={styles.input}
            />
          )}
        </div>
      ))}

      <div className={styles.buttonGroup}>
        {onCancel && (
          <button type="button" onClick={onCancel} className={styles.backButton}>
            Voltar
          </button>
        )}
        <button type="submit" className={styles.submitButton}>
          {mode === 'edit' ? 'Atualizar' : 'Cadastrar'} Grupo
        </button>
      </div>
    </form>
  );
}
