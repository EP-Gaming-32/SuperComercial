'use client';
import React, { useState, useEffect } from 'react';
import styles from './FormPageProdutos.module.css'; 

export default function FormPageOrdemCompra({
  data,
  fornecedores = [],
  produtosOriginais = [],
  mode,
  onSubmit,
  onCancel
}) {
  const [formData, setFormData] = useState({
    id_fornecedor: '',
    data_ordem: new Date().toISOString().split('T')[0],
    data_entrega_prevista: '',
    observacao: ''
  });

  const [itensOC, setItensOC] = useState([]);

  // ✅ 1. Criamos a constante para a data de hoje.
  const hoje = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (data) {
      setFormData({
        id_fornecedor: data.id_fornecedor ?? '',
        data_ordem: data.data_ordem?.split('T')[0] ?? hoje, // Usamos 'hoje' como padrão
        data_entrega_prevista: data.data_entrega_prevista?.split('T')[0] ?? '',
        observacao: data.observacao ?? ''
      });
      setItensOC(data.itens || []);
    }
  }, [data]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ... (O resto das suas funções permanecem iguais)
  const handleAdicionarItem = (produto, preco) => {
    if (!formData.id_fornecedor) return alert('Selecione um fornecedor antes');
    setItensOC(prev => [
      ...prev,
      { ...produto, quantidade: 1, preco_unitario: preco }
    ]);
  };

  const handleItemChange = (idx, field, valor) => {
    setItensOC(prev => {
      const novo = [...prev];
      novo[idx][field] = field === 'quantidade'
        ? parseInt(valor, 10) || 0
        : parseFloat(valor) || 0;
      return novo;
    });
  };

  const handleRemoverItem = idx =>
    setItensOC(prev => prev.filter((_, i) => i !== idx));

  const calcularValorTotal = () =>
    itensOC.reduce((sum, it) => sum + it.quantidade * it.preco_unitario, 0);

  const submitForm = e => {
    e.preventDefault();
    onSubmit({
      ...formData,
      itens: itensOC,
      valor_total: calcularValorTotal()
    });
  };

  const campoConfig = [
    {
      name: 'id_fornecedor',
      label: 'Fornecedor',
      type: 'select',
      required: true,
      options: fornecedores,
      optionKey: 'id_fornecedor',
      optionLabel: 'nome_fornecedor'
    },
    {
      name: 'data_ordem',
      label: 'Data da Ordem',
      type: 'date',
      required: true
    },
    {
      name: 'data_entrega_prevista',
      label: 'Previsão de Entrega',
      type: 'date'
    },
    {
      name: 'observacao',
      label: 'Observação',
      type: 'textarea',
      rows: 3
    }
  ];

  return (
    <form onSubmit={submitForm} className={styles.form}>
      
      {campoConfig.map(({ name, label, type, required, options, optionKey, optionLabel, rows }) => (
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
              required={required}
              className={styles.input}
            >
              <option value="">Selecione...</option>
              {options.map(opt => (
                <option key={opt[optionKey]} value={opt[optionKey]}>
                  {opt[optionLabel]}
                </option>
              ))}
            </select>
          ) : type === 'textarea' ? (
            <textarea
              id={name}
              name={name}
              value={formData[name] ?? ''}
              onChange={handleChange}
              rows={rows || 3}
              className={styles.input}
              style={{ resize: 'none' }}              
            />
          ) : (
            <input
              id={name}
              name={name}
              type={type}
              value={formData[name] ?? ''}
              onChange={handleChange}
              required={required}
              className={styles.input}
              // ✅ 2. Adicionamos a propriedade 'min' condicionalmente para os inputs de data.
              min={type === 'date' ? hoje : undefined}
            />
          )}
        </div>
      ))}

      {/* O restante do seu formulário... */}
      <div className={styles.produtosSection}>
        <h3>Itens</h3>
         {produtosOriginais.map(prod => (
           <button key={prod.id_produto} type="button" onClick={() => handleAdicionarItem({ id_produto: prod.id_produto, nome_produto: prod.nome_produto }, prod.preco_fornecedor)}>
             + {prod.nome_produto}
           </button>
         ))}
        {itensOC.map((it, idx) => (
           <div key={idx} className={styles.itemRow}>
             <span>{it.nome_produto}</span>
             <input type="number" min="1" value={it.quantidade} onChange={e => handleItemChange(idx, 'quantidade', e.target.value)} />
             <input type="number" step="0.01" value={it.preco_unitario.toFixed(2)} onChange={e => handleItemChange(idx, 'preco_unitario', e.target.value)} />
             <button type="button" onClick={() => handleRemoverItem(idx)}>Remover</button>
           </div>
         ))}
        <div className={styles.total}>Total: R$ {calcularValorTotal().toFixed(2)}</div>
      </div>

      <div className={styles.buttonGroup}>
        <button type="button" onClick={onCancel} className={styles.backButton}>Voltar</button>
        <button type="submit" className={styles.submitButton} disabled={itensOC.length === 0}>
          {mode === 'edit' ? 'Atualizar' : 'Cadastrar'} Ordem
        </button>
      </div>
    </form>
  );
}