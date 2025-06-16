'use client';
import React, { useState, useEffect } from 'react';
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
    let newValue = value;

    // --- VALIDAÇÃO DE NÚMEROS: Quantidade, Estoque Mínimo e Máximo (mínimo 1) ---
    if (['quantidade', 'estoque_minimo', 'estoque_maximo'].includes(name)) {
        const numValue = Number(value);
        
        // Todos esses campos devem ser no mínimo 1
        if (isNaN(numValue) || numValue < 1) { // Verifica se não é número ou é menor que 1
            newValue = 1; // Força para 1
        } else {
            newValue = numValue; // Usa o valor numérico válido
        }
    }
    // --- FIM DA VALIDAÇÃO ---

    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // --- VALIDAÇÃO FINAL NO SUBMIT ---
    // Garante que Quantidade, Estoque Mínimo e Estoque Máximo sejam pelo menos 1 antes de enviar
    if (Number(formData.quantidade) < 1) { 
        alert("A Quantidade em estoque deve ser no mínimo 1.");
        return; // Impede o envio do formulário
    }
    if (Number(formData.estoque_minimo) < 1) {
        alert("O Estoque Mínimo deve ser no mínimo 1.");
        return;
    }
    if (Number(formData.estoque_maximo) < 1) {
        alert("O Estoque Máximo deve ser no mínimo 1.");
        return;
    }
    
    // Opcional: Adicionar validação se estoque_minimo for maior que estoque_maximo
    if (Number(formData.estoque_minimo) > Number(formData.estoque_maximo)) {
      alert("Estoque Mínimo não pode ser maior que Estoque Máximo.");
      return;
    }

    onSubmit(formData);
  };

  const campoConfig = [
    { name: 'id_produto', label: 'Produto', type: 'select', options: produtos, optionKey: 'id_produto', optionLabel: 'nome_produto', required: true },
    { name: 'id_fornecedor', label: 'Fornecedor', type: 'select', options: fornecedores, optionKey: 'id_fornecedor', optionLabel: 'nome_fornecedor', required: true },
    { name: 'id_filial', label: 'Filial', type: 'select', options: filiais, optionKey: 'id_filial', optionLabel: 'nome_filial', required: true },
    { name: 'local_armazenamento', label: 'Local de Armazenamento', type: 'text', maxLength: 255, required: true },
    { name: 'quantidade', label: 'Quantidade', type: 'number', required: true, min: 1 }, // ✅ MUDANÇA: min: 1
    { name: 'estoque_minimo', label: 'Estoque Mínimo', type: 'number', required: true, min: 1 }, // ✅ MUDANÇA: min: 1
    { name: 'estoque_maximo', label: 'Estoque Máximo', type: 'number', required: true, min: 1 }, // ✅ MUDANÇA: min: 1
  ];

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {campoConfig.map(({ name, label, type, options, optionKey, optionLabel, maxLength, required, min }) => (
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
              required={required}
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
              required={required}
              {...(type === 'text' && maxLength ? { maxLength } : {})}
              {...(type === 'number' && typeof min !== 'undefined' ? { min } : {})} 
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