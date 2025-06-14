'use client';
import React, { useState, useEffect } from 'react';
import styles from './FormPageProdutos.module.css';

// --- NOVA FUNÇÃO PARA FORMATAR MOEDA ---
// Converte um valor numérico para uma string no formato BRL (R$ 1.234,56)
const formatCurrency = (value) => {
  // Se o valor for nulo ou indefinido, retorna uma string vazia
  if (value === null || value === undefined || value === '') {
    return '';
  }

  // Garante que estamos trabalhando com um número
  const numberValue = Number(value);
  if (isNaN(numberValue)) {
    return '';
  }

  // Usa a API Intl para formatar o número no padrão brasileiro
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numberValue);
};


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
    // Garante que o estado inicial também receba os dados passados por props
    setFormData(data || {});
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- NOVO HANDLER PARA CAMPOS DE MOEDA ---
  const handleCurrencyChange = (e) => {
    const { name, value } = e.target;
    
    // 1. Remove todos os caracteres não numéricos do input
    let rawValue = value.replace(/\D/g, '');

    // Se o valor ficar vazio, atualiza o estado para null (ou 0, se preferir)
    if (rawValue === '') {
      setFormData(prev => ({ ...prev, [name]: null }));
      return;
    }

    // 2. Converte a string de dígitos para um valor numérico (ex: "12345" -> 123.45)
    const numericValue = Number(rawValue) / 100;

    // 3. Atualiza o estado com o valor NUMÉRICO puro
    setFormData(prev => ({ ...prev, [name]: numericValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Envia os dados com os valores numéricos puros para o backend
    onSubmit(formData);
  };

  // --- CONFIGURAÇÃO ATUALIZADA ---
  // Trocamos type: 'number' por type: 'currency' nos campos de preço
  const campoConfig = [
    { name: 'sku', label: 'SKU', type: 'text', maxLength: 20 },
    { name: 'nome_produto', label: 'Nome', type: 'text', maxLength: 100 },
    { name: 'id_grupo', label: 'Grupo', type: 'select', options: grupos || [], optionKey: 'id_grupo', optionLabel: 'nome_grupo' },
    { name: 'valor_produto', label: 'Preço de Venda', type: 'currency' }, // ATUALIZADO
    { name: 'codigo_barras', label: 'Código de Barras', type: 'text', maxLength: 20 },
    { name: 'id_fornecedor', label: 'Fornecedor', type: 'select', options: fornecedores || [], optionKey: 'id_fornecedor', optionLabel: 'nome_fornecedor' },
    { name: 'condicoes_pagamento', label: 'Condições', type: 'text', maxLength: 100 }
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
          // --- NOVA CONDIÇÃO PARA RENDERIZAR CAMPOS DE MOEDA ---
          ) : type === 'currency' ? (
            <input
              id={name}
              name={name}
              type="text" // Usamos "text" para ter controle total sobre o formato
              inputMode="decimal" // Melhora a experiência em celulares, mostrando teclado numérico
              value={formatCurrency(formData[name])} // O valor exibido é SEMPRE o formatado
              onChange={handleCurrencyChange} // Usa o handler customizado
              className={styles.input}
              placeholder="R$ 0,00"
            />
          ) : (
            <input
              id={name}
              name={name}
              type={type}
              // Para inputs do tipo "number", impede a inserção de valores negativos
              {...(type === 'number' ? { min: 0 } : {})}
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
          {mode === 'edit' ? 'Atualizar' : 'Cadastrar'} Produto
        </button>
      </div>
    </form>
  );
}