'use client';
import React, { useState, useEffect } from 'react';
import styles from './FormPageProdutos.module.css';

export default function FormPageMovimentacao({
  data,
  produtos = [],
  filiais = [],
  mode,
  onSubmit,
  onCancel
}) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    setFormData(data || {});
  }, [data]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(formData);
  };

  const campoConfig = [
    {
      name: 'id_produto',
      label: 'Produto',
      type: 'select',
      options: produtos,
      optionKey: 'id_produto',
      optionLabel: 'nome_produto'
    },
    {
      name: 'id_filial',
      label: 'Filial',
      type: 'select',
      options: filiais,
      optionKey: 'id_filial',
      optionLabel: 'nome_filial'
    },
    {
      name: 'tipo_movimentacao',
      label: 'Tipo',
      type: 'select',
      options: [
        { value: 'entrada', label: 'Entrada' },
        { value: 'saida',   label: 'Saída' }
      ],
      optionKey: 'value',
      optionLabel: 'label'
    },
    { name: 'quantidade', label: 'Quantidade', type: 'number' }
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
          {mode === 'edit' ? 'Atualizar' : 'Cadastrar'} Movimentação
        </button>
      </div>
    </form>
  );
}