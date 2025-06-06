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
    setFormData(data);
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const campoConfig = [
    { name: 'nome_fornecedor', label: 'Fornecedor', type: 'text', maxLength: 255 },
    { name: 'endereco_fornecedor', label: 'Endereço', type: 'text', maxLength: 255 },
    { name: 'telefone_fornecedor', label: 'Telefone', type: 'text', maxLength: 15 },
    { name: 'email_fornecedor', label: 'Email', type: 'email', maxLength: 255 },
    {
      name: 'tipo_pessoa',
      label: 'Tipo de Pessoa',
      type: 'select',
      options: ['juridica', 'fisica']
    },
    { name: 'cnpj_cpf', label: 'CNPJ/CPF', type: 'text', maxLength: 12 },
    { name: 'observacao', label: 'Observação', type: 'textarea', maxLength: 255 },
  ];

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className={styles.form}>
      {campoConfig.map(({ name, label, type, options, maxLength }) => (
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
              {(options || []).map(opt =>
                typeof opt === 'string' ? (
                  <option key={opt} value={opt}>{opt}</option>
                ) : (
                  <option key={opt[optionKey]} value={opt[optionKey]}>
                    {opt[optionLabel]}
                  </option>
                )
              )}
            </select>
          ) : name === 'cnpj_cpf' ? (
            <input
              id={name}
              name={name}
              type="text"
              value={formData[name] ?? ''}
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/\D/g, '').slice(0, 12);
                setFormData(prev => ({ ...prev, [name]: onlyNumbers }));
              }}
              className={styles.input}
              maxLength={12}
              pattern="[0-9]*"
              inputMode="numeric"
            />
          ) : name === 'telefone_fornecedor' ? (
            <input
              id={name}
              name={name}
              type="text"
              value={formData[name] ?? ''}
              onChange={(e) => {
                let onlyNumbers = e.target.value.replace(/\D/g, '').slice(0, 10);
                let formatted = onlyNumbers;

                if (onlyNumbers.length > 6) {
                  formatted = `(${onlyNumbers.slice(0, 2)})${onlyNumbers.slice(2, 6)}-${onlyNumbers.slice(6)}`;
                } else if (onlyNumbers.length > 2) {
                  formatted = `(${onlyNumbers.slice(0, 2)})${onlyNumbers.slice(2)}`;
                } else if (onlyNumbers.length > 0) {
                  formatted = `(${onlyNumbers}`;
                }

                setFormData(prev => ({ ...prev, [name]: formatted }));
              }}
              className={styles.input}
              maxLength={14}
              inputMode="numeric"
            />
          ) : type === 'textarea' ? (
            <textarea
              id={name}
              name={name}
              value={formData[name] ?? ''}
              onChange={handleChange}
              className={styles.input}
              maxLength={maxLength}
            />
          ) : (
            <input
              id={name}
              name={name}
              type={type}
              value={formData[name] ?? ''}
              onChange={handleChange}
              className={styles.input}
              {...(maxLength ? { maxLength } : {})}
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
