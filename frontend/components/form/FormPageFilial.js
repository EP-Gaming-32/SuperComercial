// components/FormPageFilial.js (Versão Melhorada)
'use client';
import React, { useState, useEffect } from 'react';
import styles from './FormPageProdutos.module.css';
import { IMaskInput } from 'react-imask'; // 1. Importe o componente de máscara

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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 2. Função separada para a máscara
  const handleMaskedChange = (value, name) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  // 3. Máscara dinâmica para o telefone
  const phoneMask = [
    { mask: '(00) 0000-0000' },
    { mask: '(00) 00000-0000' }
  ];

  const campoConfig = [
    { name: "nome_filial",     label: "Nome da Filial",   type: "text",   maxLength: 255 },
    { name: "endereco_filial", label: "Endereço",         type: "text",   maxLength: 255 },
    { name: "telefone_filial", label: "Telefone",         type: "tel",    maxLength: 15  }, // Mudado o type para 'tel'
    { name: "email_filial",    label: "E-mail",           type: "email",  maxLength: 255 },
    { name: "gestor_filial",   label: "Gestor da Filial", type: "text",   maxLength: 255 },
    { name: "observacao",      label: "Observação",       type: "text",   maxLength: 1000}
  ];

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {campoConfig.map(({ name, label, type, maxLength }) => (
        <div key={name} className={styles.field}>
          <label htmlFor={name} className={styles.label}>{label}</label>
          
          {/* 4. Lógica para usar o IMaskInput no campo de telefone */}
          {type === 'tel' ? (
            <IMaskInput
              mask={phoneMask}
              id={name}
              name={name}
              value={formData[name] ?? ''}
              onAccept={(value) => handleMaskedChange(value, name)}
              className={styles.input}
              placeholder="(00) 0000-0000"
            />
          ) : (
            <input
              id={name}
              name={name}
              type={type}
              value={formData[name] ?? ''}
              onChange={handleChange}
              className={styles.input}
              maxLength={maxLength}
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
          {mode === 'edit' ? 'Atualizar' : 'Cadastrar'} Filial
        </button>
      </div>
    </form>
  );
}