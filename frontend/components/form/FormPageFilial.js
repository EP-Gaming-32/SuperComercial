'use client';
import React, { useState, useEffect } from 'react';
import styles from './FormPageProdutos.module.css';

export default function FormPageFilial({
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

    if (name === 'telefone_filial') {
      let onlyNumbers = value.replace(/\D/g, '').slice(0, 10);
      let formatted = onlyNumbers;

      if (onlyNumbers.length > 6) {
        formatted = `(${onlyNumbers.slice(0, 2)})${onlyNumbers.slice(2, 6)}-${onlyNumbers.slice(6)}`;
      } else if (onlyNumbers.length > 2) {
        formatted = `(${onlyNumbers.slice(0, 2)})${onlyNumbers.slice(2)}`;
      } else if (onlyNumbers.length > 0) {
        formatted = `(${onlyNumbers}`;
      }

      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const campoConfig = [
    { name: "nome_filial",     label: "Nome da Filial",   type: "text",   maxLength: 255 },
    { name: "endereco_filial", label: "Endereço",         type: "text",   maxLength: 255 },
    { name: "telefone_filial", label: "Telefone",         type: "text",   maxLength: 14 },
    { name: "email_filial",    label: "E-mail",           type: "email",  maxLength: 255 },
    { name: "gestor_filial",   label: "Gestor da Filial", type: "text",   maxLength: 255 },
    { name: "observacao",      label: "Observação",       type: "text",   maxLength: 1000 }
  ];

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {campoConfig.map(({ name, label, type, maxLength }) => (
        <div key={name} className={styles.field}>
          <label htmlFor={name} className={styles.label}>{label}</label>
          <input
            id={name}
            name={name}
            type={type}
            value={formData[name] ?? ''}
            onChange={handleChange}
            className={styles.input}
            maxLength={maxLength}
            inputMode={name === 'telefone_filial' ? 'numeric' : undefined}
          />
        </div>
      ))}

      <div className={styles.buttonGroup}>
        {onCancel && (
          <button type="button" onClick={onCancel} className={styles.backButton}>
            Voltar
          </button>
        )}
        <button type="submit" className={styles.submitButton}>
          {mode === 'edit' ? 'Atualizar' : 'Cadastrar'} Filial
        </button>
      </div>
    </form>
  );
}
