'use client';

import React, { useState, useEffect } from 'react';
import styles from './FormPageProdutos.module.css';

// ... (STATUS_OPTIONS permanece o mesmo)
const STATUS_OPTIONS = [
    { value: 'Pendente', label: 'Pendente' },
    { value: 'Atendido', label: 'Atendido' },
    { value: 'Em Separação no CD', label: 'Em Separação no CD' },
    { value: 'Enviado para Filial', label: 'Enviado para Filial' },
    { value: 'Recebido na Filial', label: 'Recebido na Filial' },
    { value: 'Cancelado', label: 'Cancelado' }
  ];

export default function FormPageOrdemCompra({
  id,
  itens = [],
  onItemChange,
  onItemRemove,
  fornecedores = [],
  filiais = [],
  mode,
  onSubmit,
  onCancel
}) {
  const hoje = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    data_ordem: hoje,
    data_entrega_prevista: '',
    observacao: '',
    status: mode === 'create' ? 'Pendente' : '',
    id_filial: ''
  });

  const handleFormChange = (field, value) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleItemValueChange = (idx, field, value) => {
    // ✅ LOG DE DEPURAÇÃO 1: Ver o que estamos recebendo
    console.log(`--- Alterando Item ---`);
    console.log(`Índice: ${idx}, Campo: ${field}, Valor recebido: '${value}' (Tipo: ${typeof value})`);

    let parsedValue = value;
    if (field === 'quantidade' || field === 'preco_unitario') {
      parsedValue = value === '' ? '' : parseFloat(value);
      if (isNaN(parsedValue)) {
        parsedValue = '';
      }
    }
    const novosItens = itens.map((item, i) =>
      i === idx ? { ...item, [field]: parsedValue } : item
    );
    onItemChange(novosItens);
  };

  const handleRemoverItemClick = (id_produto) => {
    onItemRemove(id_produto);
  };

  const calcularValorTotal = () =>
    itens.reduce((sum, item) => sum + (Number(item.quantidade) || 0) * (Number(item.preco_unitario) || 0), 0);

  const submit = e => {
    e.preventDefault();
    if (itens.some(item => !item.id_fornecedor)) {
      alert('Selecione um fornecedor para todos os itens.');
      return;
    }
    if (formData.status === 'Recebido na Filial' && !formData.id_filial) {
      alert('Selecione a filial de destino.');
      return;
    }
    const payload = {
      ...formData,
      id_filial: formData.id_filial ? parseInt(formData.id_filial, 10) : null,
      itens: itens.map(item => ({
          ...item,
          quantidade: Number(item.quantidade),
          preco_unitario: Number(item.preco_unitario)
      })),
      valor_total: calcularValorTotal()
    };
    onSubmit(payload);
  };
  
  const isSubmitDisabled = itens.length === 0 || itens.some(item => !item.id_fornecedor || !item.quantidade || Number(item.quantidade) <= 0);

  // ✅ LOG DE DEPURAÇÃO 2: Ver o estado atual dos itens e o resultado da validação
  console.log('--- Verificando Estado ---');
  console.log('Itens Atuais:', JSON.stringify(itens, null, 2)); // Mostra o array de itens de forma legível
  console.log('O botão está desabilitado?', isSubmitDisabled);
  console.log('-------------------------');

  const campoConfig = [
    { name: 'data_ordem', label: 'Data da Ordem*', type: 'date', required: true },
    { name: 'status', label: 'Status*', type: 'select', options: STATUS_OPTIONS, required: true },
    { name: 'data_entrega_prevista', label: 'Previsão de Entrega', type: 'date' },
    { name: 'observacao', label: 'Observação', type: 'textarea', rows: 4 },
  ];

  if (formData.status === 'Recebido na Filial') {
    campoConfig.push({
      name: 'id_filial', label: 'Filial de Destino*', type: 'select', options: filiais, optionKey: 'id_filial', optionLabel: 'nome_filial', required: true
    });
  }

  return (
    <form onSubmit={submit} className={styles.form}>
      {campoConfig.map(({ name, label, type, options, required, rows, optionKey, optionLabel }) => (
        <div key={name} className={styles.field}>
          <label className={styles.label} htmlFor={name}>{label}</label>
          {type === 'select' ? (
            <select id={name} name={name} value={formData[name] || ''} onChange={(e) => handleFormChange(name, e.target.value)} required={required} className={styles.input}>
              <option value="">Selecione...</option>
              {options.map(opt => (
                <option key={opt.value || opt[optionKey]} value={opt.value || opt[optionKey]}>
                  {opt.label || opt[optionLabel]}
                </option>
              ))}
            </select>
          ) : type === 'textarea' ? (
            <textarea id={name} name={name} value={formData[name] || ''} onChange={(e) => handleFormChange(name, e.target.value)} rows={rows || 3} className={styles.input} />
          ) : (
            <input id={name} name={name} type={type} value={formData[name] || ''} onChange={(e) => handleFormChange(name, e.target.value)} required={required} className={styles.input} min={type === 'date' ? hoje : undefined} />
          )}
        </div>
      ))}
      
      <div className={styles.itensSection}>
        <h3>Itens da Ordem</h3>
        <div className={styles.itemTableHeader}>
            <div>Produto</div>
            <div>Fornecedor</div>
            <div>Quantidade</div>
            <div>Preço Unit. (R$)</div>
            <div>Ação</div>
        </div>
        {itens.length === 0 && <p className={styles.emptyMessage}>Nenhum item adicionado.</p>}
        {itens.map((item, idx) => (
          <div key={item.id_produto} className={styles.itemRowGrid}>
            <span>{item.nome_produto}</span>
            <select value={item.id_fornecedor || ''} onChange={e => handleItemValueChange(idx, 'id_fornecedor', e.target.value)} required className={styles.input}>
              <option value="">Selecione...</option>
              {fornecedores.map(f => <option key={f.id_fornecedor} value={f.id_fornecedor}>{f.nome_fornecedor}</option>)}
            </select>
            <input type="number" min="1" value={item.quantidade || ''} onChange={e => handleItemValueChange(idx, 'quantidade', e.target.value)} required className={styles.input} />
            <input type="number" step="0.01" min="0" value={item.preco_unitario || ''} onChange={e => handleItemValueChange(idx, 'preco_unitario', e.target.value)} required className={styles.input} />
            <button type="button" onClick={() => handleRemoverItemClick(item.id_produto)} className={styles.removeButton}>Remover</button>
          </div>
        ))}
        <div className={styles.total}>Total: R$ {calcularValorTotal().toFixed(2)}</div>
      </div>

      <div className={styles.buttonGroup}>
        <button type="button" onClick={onCancel} className={styles.backButton}>Voltar</button>
        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={isSubmitDisabled}
          title={isSubmitDisabled ? 'Preencha um fornecedor e quantidade (maior que zero) para todos os itens' : 'Cadastrar Ordem de Compra'}
        >
          {mode === 'edit' ? 'Atualizar' : 'Cadastrar'} Ordem
        </button>
      </div>
    </form>
  );
}