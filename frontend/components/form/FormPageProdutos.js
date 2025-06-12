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
  const [formData, setFormData] = useState({});

  useEffect(() => {
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

  const campoConfig = [
    { name: 'sku', label: 'SKU', type: 'text', maxLength: 20 },
    { name: 'nome_produto', label: 'Nome', type: 'text', maxLength: 100 },
    { name: 'id_grupo', label: 'Grupo', type: 'select', options: grupos || [], optionKey: 'id_grupo', optionLabel: 'nome_grupo' },
    { name: 'valor_produto', label: 'Preço', type: 'number' },
    { name: 'prazo_validade', label: 'Validade (dias)', type: 'number' },
    { name: 'unidade_medida', label: 'Unidade', type: 'text', maxLength: 10 },
    { name: 'codigo_barras', label: 'Código de Barras', type: 'text', maxLength: 20 },
    { name: 'id_fornecedor', label: 'Fornecedor', type: 'select', options: fornecedores || [], optionKey: 'id_fornecedor', optionLabel: 'nome_fornecedor' },
    { name: 'preco_compra', label: 'Preço de Compra', type: 'number' },
    { name: 'prazo_entrega', label: 'Prazo Entrega (dias)', type: 'number' },
    { name: 'condicoes_pagamento', label: 'Condições', type: 'text', maxLength: 100 }
  ];

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {campoConfig.map(({ name, label, type, options, optionKey, optionLabel, maxLength }) => (
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
              {...(type === 'text' && maxLength ? { maxLength } : {})}
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
          {mode === 'edit' ? 'Atualizar' : 'Cadastrar'} Produto
        </button>
      </div>
    </form>
  );
}
