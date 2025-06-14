'use client';
import React, { useState, useEffect } from 'react';
import styles from './FormPageProdutos.module.css';

// --- FUNÇÕES DE FORMATAÇÃO ---

const formatCPF = (value) => {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const formatCNPJ = (value) => {
  return value
    .replace(/\D/g, '')
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
};

// --- NOVA FUNÇÃO PARA FORMATAR O TELEFONE ---
// Formata para o padrão (DDD) 9 XXXX-XXXX
const formatTelefone = (value) => {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/^(\d{2})(\d)/, '($1) $2') // Coloca parênteses nos dois primeiros dígitos
    .replace(/(\d{5})(\d{4})$/, '$1-$2'); // Coloca hífen entre o quinto e o sexto dígito (contando após o DD)
}


export default function FormPageFornecedor({
  data,
  mode,
  onSubmit,
  onCancel
}) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    setFormData(data || {});
  }, [data]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, cnpj_cpf: '' }));
  }, [formData.tipo_pessoa]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCnpjCpfChange = (e) => {
    const { value } = e.target;
    let formattedValue = value;

    if (formData.tipo_pessoa === 'fisica') {
      formattedValue = formatCPF(value);
    } else if (formData.tipo_pessoa === 'juridica') {
      formattedValue = formatCNPJ(value);
    } else {
      formattedValue = value.replace(/\D/g, '');
    }

    setFormData(prev => ({ ...prev, cnpj_cpf: formattedValue }));
  };
  
  // --- NOVO HANDLER PARA O TELEFONE ---
  const handleTelefoneChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, telefone_fornecedor: formatTelefone(value) }));
  };

  const campoConfig = [
    { name: 'nome_fornecedor', label: 'Fornecedor', type: 'text', maxLength: 255 },
    { name: 'endereco_fornecedor', label: 'Endereço', type: 'text', maxLength: 255 },
    // O campo de telefone será renderizado de forma customizada abaixo
    { name: 'email_fornecedor', label: 'Email', type: 'email', maxLength: 255 },
    {
      name: 'tipo_pessoa',
      label: 'Tipo de Pessoa',
      type: 'select',
      options: ['juridica', 'fisica']
    },
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
              {options.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
            </select>
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
      
      {/* --- CAMPO TELEFONE COM MÁSCARA ATUALIZADA --- */}
      <div className={styles.field}>
        <label htmlFor="telefone_fornecedor" className={styles.label}>Telefone</label>
        <input
          id="telefone_fornecedor"
          name="telefone_fornecedor"
          type="tel" // Usar type="tel" é semanticamente correto para telefones
          value={formData.telefone_fornecedor ?? ''}
          onChange={handleTelefoneChange} // Usa o novo handler
          className={styles.input}
          placeholder="Insira o número de telefone"
          maxLength={16} // (11) 1 1111-1111 -> 16 caracteres
          inputMode="numeric"
        />
      </div>

      {/* --- CAMPO CNPJ/CPF COM MÁSCARA DINÂMICA --- */}
      <div className={styles.field}>
        <label htmlFor="cnpj_cpf" className={styles.label}>
          {formData.tipo_pessoa === 'fisica' ? 'CPF' : formData.tipo_pessoa === 'juridica' ? 'CNPJ' : 'CNPJ/CPF'}
        </label>
        <input
          id="cnpj_cpf"
          name="cnpj_cpf"
          type="text"
          value={formData.cnpj_cpf ?? ''}
          onChange={handleCnpjCpfChange}
          className={styles.input}
          disabled={!formData.tipo_pessoa}
          placeholder={
            formData.tipo_pessoa === 'fisica' 
              ? '000.000.000-00' 
              : formData.tipo_pessoa === 'juridica'
              ? '00.000.000/0000-00'
              : 'Selecione o tipo de pessoa'
          }
          maxLength={formData.tipo_pessoa === 'fisica' ? 14 : 18}
          inputMode="numeric"
        />
      </div>

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