'use client';
import React, { useState, useEffect } from 'react';
import styles from './FormPageProdutos.module.css';
import LoteSection from '@/components/searchPage/LoteSection'; // 🔥 Novo componente

export default function FormPageEstoqueLote({
  data = {},
  produtos = [],
  fornecedores = [],
  filiais = [],
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
    { name: 'id_produto', label: 'Produto', type: 'select', options: produtos, optionKey: 'id_produto', optionLabel: 'nome_produto' },
    { name: 'id_fornecedor', label: 'Fornecedor', type: 'select', options: fornecedores, optionKey: 'id_fornecedor', optionLabel: 'nome_fornecedor' },
    { name: 'id_filial', label: 'Filial', type: 'select', options: filiais, optionKey: 'id_filial', optionLabel: 'nome_filial' },
    { name: 'local_armazenamento', label: 'Local de Armazenamento', type: 'text', maxLength: 255 },
    { name: 'quantidade', label: 'Quantidade', type: 'number' },
    { name: 'estoque_minimo', label: 'Estoque Mínimo', type: 'number' },
    { name: 'estoque_maximo', label: 'Estoque Máximo', type: 'number' },
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
              value={formData[name] ?? ''}
              onChange={handleChange}
              className={styles.input}
            >
              <option value="">Selecione...</option>
              {options.map(opt => (
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

      {/* 🔥 Seção de lotes vinculados */}
      {mode === 'edit' && data?.id_estoque && (
        <div className={styles.historicoWrapper}>
          <LoteSection id_estoque={data.id_estoque} />
        </div>
      )}

      <div className={styles.buttonGroup}>
        {onCancel && (
          <button type="button" onClick={onCancel} className={styles.backButton}>
            Voltar
          </button>
        )}
        <button type="submit" className={styles.submitButton}>
          {mode === 'edit' ? 'Atualizar' : 'Cadastrar'}
        </button>
      </div>
    </form>
  );
}
