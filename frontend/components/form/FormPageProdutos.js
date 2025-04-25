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
    { name: 'sku', label: 'SKU', type: 'text' },
    { name: 'nome_produto', label: 'Nome', type: 'text' },
    { name: 'id_grupo', label: 'Grupo', type: 'select', options: grupos || [], optionKey: 'id_grupo', optionLabel: 'nome_grupo' },
    { name: 'valor_produto', label: 'Preço', type: 'number' },
    { name: 'prazo_validade', label: 'Validade (dias)', type: 'number' },
    { name: 'unidade_medida', label: 'Unidade', type: 'text' },
    { name: 'codigo_barras', label: 'Código de Barras', type: 'text' },
    { name: 'id_fornecedor', label: 'Fornecedor', type: 'select', options: fornecedores || [], optionKey: 'id_fornecedor', optionLabel: 'nome_fornecedor' },
    { name: 'preco_compra', label: 'Preço de Compra', type: 'number' },
    { name: 'prazo_entrega', label: 'Prazo Entrega (dias)', type: 'number' },
    { name: 'condicoes_pagamento', label: 'Condições', type: 'text' }
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
          {mode === 'edit' ? 'Atualizar' : 'Cadastrar'} Produto
        </button>
      </div>
    </form>
  );
}
