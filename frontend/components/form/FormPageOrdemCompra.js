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

  // Inicializa formData e itensOC se vierem em `data`
  useEffect(() => {
    if (data) {
      setFormData({
        id_fornecedor: data.id_fornecedor ?? '',
        data_ordem: data.data_ordem?.split('T')[0] ?? '',
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

  return (
    <form onSubmit={submitForm} className={styles.form}>
      {/* Seletor de Fornecedor */}
      <div className={styles.field}>
        <label>Fornecedor *</label>
        <select
          name="id_fornecedor"
          value={formData.id_fornecedor}
          onChange={handleChange}
          required
        >
          <option value="">Selecione...</option>
          {fornecedores.map(f => (
            <option key={f.id_fornecedor} value={f.id_fornecedor}>
              {f.nome_fornecedor}
            </option>
          ))}
        </select>
      </div>

      {/* Datas e observação */}
      <div className={styles.fieldGroup}>
        <input
          type="date"
          name="data_ordem"
          value={formData.data_ordem}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="data_entrega_prevista"
          value={formData.data_entrega_prevista}
          onChange={handleChange}
        />
      </div>
      <div className={styles.field}>
        <label>Observação</label>
        <textarea
          name="observacao"
          value={formData.observacao}
          onChange={handleChange}
          rows={3}
        />
      </div>

      {/* Itens da ordem */}
      <div className={styles.itensSection}>
        <h3>Itens</h3>
        {/* Botão “Adicionar” poderia abrir um modal/popup onde você lista
            produtosOriginais e busca o preço (mapeado na página) */}
        {/* Aqui, como exemplo rápido: */}
        {produtosOriginais.map(prod => (
          <button
            key={prod.id_produto}
            type="button"
            onClick={() =>
              handleAdicionarItem(
                { id_produto: prod.id_produto, nome_produto: prod.nome_produto },
                prod.preco_fornecedor  /* passar do parent */
              )
            }
          >
            + {prod.nome_produto}
          </button>
        ))}

        {/* Lista de itens adicionados */}
        {itensOC.map((it, idx) => (
          <div key={idx} className={styles.itemRow}>
            <span>{it.nome_produto}</span>
            <input
              type="number"
              min="1"
              value={it.quantidade}
              onChange={e => handleItemChange(idx, 'quantidade', e.target.value)}
            />
            <input
              type="number"
              step="0.01"
              value={it.preco_unitario.toFixed(2)}
              onChange={e => handleItemChange(idx, 'preco_unitario', e.target.value)}
            />
            <button type="button" onClick={() => handleRemoverItem(idx)}>
              Remover
            </button>
          </div>
        ))}

        <div className={styles.total}>Total: R$ {calcularValorTotal().toFixed(2)}</div>
      </div>

      {/* Botões */}
      <div className={styles.buttonGroup}>
        <button type="button" onClick={onCancel}>Voltar</button>
        <button type="submit" disabled={itensOC.length === 0}>
          {mode === 'edit' ? 'Atualizar' : 'Cadastrar'} Ordem
        </button>
      </div>
    </form>
  );
}