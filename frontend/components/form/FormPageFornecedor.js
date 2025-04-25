'use client';
import React, { useState, useEffect } from 'react';
import styles from './FormPageProdutos.module.css';

export default function FormPageFornecedor({
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
    { name: 'id_fornecedor', label: 'ID', type: 'number' },
    { name: 'nome_fornecedor', label: 'Fornecedor', type: 'text' },
    { name: 'endereco_fornecedor', label: 'Endereço', type: 'text' },
    { name: 'telefone_fornecedor', label: 'Telefone', type: 'text' },
    { name: 'email_fornecedor', label: 'Email', type: 'email' },
    { name: 'tipo_pessoa', label: 'Tipo de Pessoa', type: 'select', options: ['juridica', 'fisica'] },
    { name: 'cnpj_cpf', label: 'CNPJ/CPF', type: 'text' },
    { name: 'observacao', label: 'Observação', type: 'textarea' },
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
          {mode === 'edit' ? 'Atualizar' : 'Cadastrar'} Fornecedor
        </button>
      </div>
    </form>
  );
}
