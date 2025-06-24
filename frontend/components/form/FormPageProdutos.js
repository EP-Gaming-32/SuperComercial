// src/components/form/FormPageProdutos.js
'use client';

import React, { useState, useEffect } from 'react';
import styles from './FormPageProdutos.module.css';

export default function FormPageProdutos({
  data,
  grupos = [],
  fornecedores = [],
  mode,
  onSubmit,
  onCancel
}) {
  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '';
    const numberValue = Number(value);
    if (isNaN(numberValue)) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numberValue);
  };

  const [formData, setFormData] = useState({});

  useEffect(() => {
    setFormData(data || {});
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCurrencyChange = (e) => {
    const { name, value } = e.target;
    let rawValue = value.replace(/\D/g, '');

    if (rawValue === '') {
      setFormData(prev => ({ ...prev, [name]: null }));
      return;
    }
    const numericValue = Number(rawValue) / 100;
    setFormData(prev => ({ ...prev, [name]: numericValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const campoConfig = [
    {
      name: 'sku',
      label: 'SKU',
      type: 'text',
      maxLength: 20,
      disabled: mode === 'add',
      placeholderText: mode === 'add' ? 'SKU gerado automaticamente' : 'Digite o SKU'
    },
    { name: 'nome_produto', label: 'Nome', type: 'text', maxLength: 100 },
    {
      name: 'id_grupo',
      label: 'Grupo',
      type: 'select',
      options: grupos || [],
      optionKey: 'id_grupo',
      optionLabel: 'nome_grupo'
    },
    { name: 'valor_produto', label: 'Preço de Venda', type: 'currency' },
    { name: 'codigo_barras', label: 'Código de Barras', type: 'text', maxLength: 20 },
    {
      name: 'id_fornecedor',
      label: 'Fornecedor',
      type: 'select',
      options: fornecedores || [],
      optionKey: 'id_fornecedor',
      optionLabel: 'nome_fornecedor'
    },
    { name: 'condicoes_pagamento', label: 'Condições', type: 'text', maxLength: 100 }
  ];

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Campos principais */}
      <div className={styles.fieldsWrapper}>
        {campoConfig.map(({ name, label, type, options, optionKey, optionLabel, maxLength, disabled, placeholderText }) => (
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
            ) : type === 'currency' ? (
              <input
                id={name}
                name={name}
                type="text"
                inputMode="decimal"
                value={formatCurrency(formData[name])}
                onChange={handleCurrencyChange}
                className={styles.input}
                placeholder="R$ 0,00"
              />
            ) : (
              <input
                id={name}
                name={name}
                type={type}
                value={formData[name] ?? ''}
                onChange={handleChange}
                className={`${styles.input} ${disabled ? styles.disabledInput : ''}`}
                {...(type === 'text' && maxLength ? { maxLength } : {})}
                {...(disabled ? { disabled: true } : {})}
                {...(placeholderText ? { placeholder: placeholderText } : {})}
              />
            )}
          </div>
        ))}
      </div>

      {/* Fornecedores */}
      <div className={styles.fornecedoresSection}>
        <h2>Fornecedores do Produto</h2>
        {data?.fornecedores?.length > 0 ? (
          <div className={styles.fornecedoresGrid}>
            {data.fornecedores.map(f => (
              <div key={f.id_fornecedor} className={styles.fornecedorCard}>
                <label>Fornecedor:</label>
                <div>{f.nome_fornecedor}</div>

                <label>Preço:</label>
                <div>R$ {Number(f.preco).toFixed(2)}</div>

                {f.condicoes_pagamento && (
                  <>
                    <label>Condições de Pagamento:</label>
                    <div>{f.condicoes_pagamento}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.semFornecedores}>Sem fornecedores vinculados.</p>
        )}
      </div>

      {/* Botões */}
      <div className={styles.buttonGroup}>
        {onCancel && (
          <button type="button" onClick={onCancel} className={styles.backButton}>
            Voltar
          </button>
        )}
        <button type="submit" className={styles.submitButton}>
          {mode === 'edit' ? 'Atualizar' : 'Cadastrar'} Produto
        </button>
      </div>
    </form>
  );
}