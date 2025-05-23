'use client';
import React, { useState, useEffect } from 'react';
import styles from './FormPageProdutos.module.css';

export default function FormPagePedido({
  data,
  filial = [],
  fornecedores = [],
  statusPedido = [],
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
    {
      name: 'id_filial',
      label: 'Filial',
      type: 'select',
      options: filial,
      optionKey: 'id_filial',
      optionLabel: 'nome_filial'
    },
    {
      name: 'id_fornecedor',
      label: 'Fornecedor',
      type: 'select',
      options: fornecedores,
      optionKey: 'id_fornecedor',
      optionLabel: 'nome_fornecedor'
    },
    {
      name: 'tipo_pedido',
      label: 'Tipo de Pedido',
      type: 'select',
      options: [
        { value: 'compra', label: 'Compra' },
        { value: 'reposição', label: 'Reposição' }
      ],
      optionKey: 'value',
      optionLabel: 'label'
    },
    { name: 'valor_total', label: 'Valor Total', type: 'number' },
    { name: 'observacao', label: 'Observação', type: 'text', maxLength: 255 },
    { name: 'data_pedido', label: 'Data do Pedido', type: 'date' },
    {
      name: 'id_status',
      label: 'Status do Pedido',
      type: 'select',
      options: statusPedido,
      optionKey: 'id_status',
      optionLabel: 'descricao'
    }
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

      <div className={styles.buttonGroup}>
        {onCancel && (
          <button type="button" onClick={onCancel} className={styles.backButton}>
            Voltar
          </button>
        )}
        <button type="submit" className={styles.submitButton}>
          {mode === 'edit' ? 'Atualizar' : 'Cadastrar'} Pedido
        </button>
      </div>
    </form>
  );
}
