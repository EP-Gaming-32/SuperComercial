'use client';
import React, { useState, useEffect } from 'react';
// Se este caminho relativo funcionar, ótimo. Se não, use o caminho com '@/' que já validamos.
import styles from './FormPageProdutos.module.css';
import LoteSection from '@/components/searchPage/LoteSection';

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

  // ✅ Adicionada a propriedade `required: true` nos campos essenciais.
  const campoConfig = [
    { name: 'id_produto', label: 'Produto', type: 'select', options: produtos, optionKey: 'id_produto', optionLabel: 'nome_produto', required: true },
    { name: 'id_fornecedor', label: 'Fornecedor', type: 'select', options: fornecedores, optionKey: 'id_fornecedor', optionLabel: 'nome_fornecedor', required: true },
    { name: 'id_filial', label: 'Filial', type: 'select', options: filiais, optionKey: 'id_filial', optionLabel: 'nome_filial', required: true },
    { name: 'local_armazenamento', label: 'Local de Armazenamento', type: 'text', maxLength: 255, required: true },
    { name: 'quantidade', label: 'Quantidade', type: 'number', required: true },
    { name: 'estoque_minimo', label: 'Estoque Mínimo', type: 'number', required: true },
    { name: 'estoque_maximo', label: 'Estoque Máximo', type: 'number', required: true },
  ];

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* ✅ Adicionado 'required' na desestruturação para ser passado ao input/select */}
      {campoConfig.map(({ name, label, type, options, optionKey, optionLabel, maxLength, required }) => (
        <div key={name} className={styles.field}>
          <label htmlFor={name} className={styles.label}>
            {label} {required && <span className={styles.required}>*</span>}
          </label>
          {type === 'select' ? (
            <select
              id={name}
              name={name}
              value={formData[name] ?? ''}
              onChange={handleChange}
              className={styles.input}
              required={required} // Passando a propriedade para o select
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
              required={required} // Passando a propriedade para o input
              {...(type === 'text' && maxLength ? { maxLength } : {})}
            />
          )}
        </div>
      ))}

      {/* Seção de lotes vinculados */}
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