'use client';
import React, { useState, useEffect } from 'react';
import styles from './FormPageProdutos.module.css';

export default function FormPageOrdemCompra({
  id,
  produtosOriginais = [],
  produtosFornecedores = [],
  mode,
  onSubmit,
  onCancel
}) {
  const hoje = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    data_ordem: hoje,
    data_entrega_prevista: '',
    observacao: '',
  });
  const [itensOC, setItensOC] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);

  useEffect(() => {
    if (mode !== 'edit' && produtosOriginais.length) {
      setItensOC(prev => {
        const existing = new Set(prev.map(i => i.id_produto));
        const novos = produtosOriginais
          .filter(p => !existing.has(p.id_produto))
          .map(p => ({
            ...p,
            id_fornecedor: '',
            quantidade: p.quantidade || 1,
            preco_unitario: p.preco_unitario || 0,
          }));
        return [...prev, ...novos];
      });
    }
  }, [produtosOriginais, mode]);

  useEffect(() => {
    fetch('http://localhost:5000/fornecedores')
      .then(res => res.json())
      .then(data => setFornecedores(data.data || []))
      .catch(() => setFornecedores([]));
  }, []);

  useEffect(() => {
    if (mode === 'edit' && id) {
      fetch(`http://localhost:5000/ordemCompra/detalhes/${id}`)
        .then(res => res.json())
        .then(resp => {
          const data = resp.data;
          setFormData({
            data_ordem: data.data_ordem.split('T')[0],
            data_entrega_prevista: data.data_entrega_prevista?.split('T')[0] || '',
            observacao: data.observacao || '',
          });
          setItensOC(data.itens.map(item => ({
            id_produto: item.id_produto,
            nome_produto: item.nome_produto,
            id_fornecedor: item.id_fornecedor,
            quantidade: item.quantidade,
            preco_unitario: parseFloat(item.preco_unitario),
          })));
        })
        .catch(() => {});
    }
  }, [mode, id]);

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (idx, field, value) => {
    setItensOC(prev =>
      prev.map((item, i) =>
        i === idx
          ? { ...item, [field]: field === 'quantidade' ? parseInt(value, 10) || 0 : field === 'preco_unitario' ? parseFloat(value) || 0 : value }
          : item
      )
    );
  };

  const handleRemoverItem = idx => {
    setItensOC(prev => prev.filter((_, i) => i !== idx));
  };

  const calcularValorTotal = () => itensOC.reduce((sum, item) => sum + item.quantidade * item.preco_unitario, 0);

  const submit = e => {
    e.preventDefault();
    if (itensOC.some(item => !item.id_fornecedor)) {
      alert('Selecione o fornecedor para todos os itens.');
      return;
    }
    onSubmit({ ...formData, itens: itensOC });
  };

  return (
    <form onSubmit={submit} className={styles.form}>
      <div className={styles.fieldGroup}>
        <label>Data da Ordem*</label>
        <input type="date" value={formData.data_ordem} onChange={e => handleFormChange('data_ordem', e.target.value)} required />
        <label>Previsão de Entrega</label>
        <input type="date" value={formData.data_entrega_prevista} onChange={e => handleFormChange('data_entrega_prevista', e.target.value)} />
      </div>
      <div className={styles.field}>
        <label>Observação</label>
        <textarea rows={3} value={formData.observacao} onChange={e => handleFormChange('observacao', e.target.value)} />
      </div>
      <div className={styles.itensSection}>
        <h3>Itens da Ordem</h3>
        {itensOC.length === 0 && <p>Nenhum item adicionado.</p>}
        {itensOC.map((item, idx) => {
          const opções = produtosFornecedores.filter(pf => pf.id_produto === item.id_produto);
          return (
            <div key={`${item.id_produto}-${idx}`} className={styles.itemRow}>
              <span>{item.nome_produto}</span>
              <select value={item.id_fornecedor} onChange={e => handleItemChange(idx, 'id_fornecedor', e.target.value)} required>
                <option value="">Fornecedor...</option>
                {opções.map((pf, optIndex) => {
                  const f = fornecedores.find(fv => fv.id_fornecedor === pf.id_fornecedor);
                  return (
                    <option
                      key={`${item.id_produto}-${pf.id_fornecedor}-${optIndex}`}
                      value={pf.id_fornecedor}
                    >
                      {f?.nome_fornecedor || `Fornecedor ${pf.id_fornecedor}`}
                    </option>
                  );
                })}
              </select>
              <input type="number" min={1} value={item.quantidade} onChange={e => handleItemChange(idx, 'quantidade', e.target.value)} required />
              <input type="number" step="0.01" value={item.preco_unitario.toFixed(2)} onChange={e => handleItemChange(idx, 'preco_unitario', e.target.value)} required />
              <button type="button" onClick={() => handleRemoverItem(idx)}>Remover</button>
            </div>
          );
        })}
        <div className={styles.total}>Total: R$ {calcularValorTotal().toFixed(2)}</div>
      </div>
      <div className={styles.buttonGroup}>
        <button type="button" onClick={onCancel}>Voltar</button>
        <button type="submit" disabled={itensOC.length === 0}>{mode === 'edit' ? 'Atualizar' : 'Cadastrar'} Ordem</button>
      </div>
    </form>
  );
}