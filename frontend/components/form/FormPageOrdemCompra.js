'use client';

import React, { useState, useEffect } from 'react';
import styles from './FormPageProdutos.module.css';

const STATUS_OPTIONS = [
  { value: 'Pendente', label: 'Pendente' },
  { value: 'Atendido', label: 'Atendido' },
  { value: 'Em Separação no CD', label: 'Em Separação no CD' },
  { value: 'Enviado para Filial', label: 'Enviado para Filial' },
  { value: 'Recebido na Filial', label: 'Recebido na Filial' },
  { value: 'Cancelado', label: 'Cancelado' }
];

export default function FormPageOrdemCompra({
  initialData = null,
  itens: propItens = [],
  onItemChange,
  onItemRemove,
  fornecedores = [],
  filiais = [],
  mode = 'create',
  onSubmit,
  onCancel
}) {
  const hoje = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    data_ordem: hoje,
    status: mode === 'create' ? 'Pendente' : '',
    data_entrega_prevista: '',
    observacao: '',
    id_filial: ''
  });
  const [itens, setItens] = useState([]);

  // em edit, popula de initialData
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        data_ordem: initialData.data_ordem,
        status: initialData.status,
        data_entrega_prevista: initialData.data_entrega_prevista,
        observacao: initialData.observacao,
        id_filial: initialData.id_filial
      });
      setItens(initialData.itens);
    }
  }, [mode, initialData]);

  // em create, sincroniza com propItens
  useEffect(() => {
    if (mode === 'create') setItens(propItens);
  }, [mode, propItens]);

  const handleFormChange = (f, v) => setFormData(prev => ({ ...prev, [f]: v }));

  const handleItemChange = (idx, field, val) => {
    let v = val;
    if (['quantidade', 'preco_unitario'].includes(field)) {
      v = val === '' ? '' : parseFloat(val);
      if (isNaN(v)) v = '';
    }
    const upd = itens.map((it, i) => i === idx ? { ...it, [field]: v } : it);
    mode === 'create' ? onItemChange(upd) : setItens(upd);
  };

  const handleRemove = id => {
    const upd = itens.filter(it => it.id_produto !== id);
    mode === 'create' ? onItemRemove(id) : setItens(upd);
  };

  const total = itens.reduce((s, it) => s + (Number(it.quantidade) || 0) * (Number(it.preco_unitario) || 0), 0);

  const submit = e => {
    e.preventDefault();
    if (itens.some(it => !it.id_fornecedor)) return alert('Selecione fornecedor.');
    if (formData.status === 'Recebido na Filial' && !formData.id_filial)
      return alert('Selecione filial destino.');
    const payload = {
      ...formData,
      itens: itens.map(it => ({
        id_produto: it.id_produto,
        id_fornecedor: it.id_fornecedor,
        quantidade: Number(it.quantidade),
        preco_unitario: Number(it.preco_unitario) / 100
      })),
      valor_total: total / 100
    };

    onSubmit(payload);
  };

  const disabled = itens.length === 0 || itens.some(it => !it.id_fornecedor || !it.quantidade);

  const campos = [
    { n: 'data_ordem', l: 'Data Ordem*', t: 'date', req: true },
    { n: 'status', l: 'Status*', t: 'select', opts: STATUS_OPTIONS, req: true },
    { n: 'data_entrega_prevista', l: 'Previsão', t: 'date' },
    { n: 'observacao', l: 'Observação', t: 'textarea', rows: 4 }
  ];
  if (formData.status === 'Recebido na Filial')
    campos.push({
      n: 'id_filial', l: 'Filial Destino*', t: 'select',
      opts: filiais, key: 'id_filial', label: 'nome_filial', req: true
    });

  return (
    <form onSubmit={submit} className={styles.form}>
      {campos.map(c => (
        <div key={c.n} className={styles.field}>
          <label className={styles.label}>{c.l}</label>
          {c.t === 'select' ? (
            <select value={formData[c.n] || ''}
              onChange={e => handleFormChange(c.n, e.target.value)}
              required={c.req}
              className={styles.input}>
              <option value="">Selecione...</option>
              {c.opts.map(o => (
                <option key={o.value || o[c.key]} value={o.value || o[c.key]}>
                  {o.label || o[c.label]}
                </option>
              ))}
            </select>
          ) : c.t === 'textarea' ? (
            <textarea
              rows={c.rows || 3}
              value={formData[c.n] || ''}
              onChange={e => handleFormChange(c.n, e.target.value)}
              className={styles.input}
            />
          ) : (
            <input
              type={c.t}
              min={c.t === 'date' ? hoje : undefined}
              required={c.req}
              value={formData[c.n] || ''}
              onChange={e => handleFormChange(c.n, e.target.value)}
              className={styles.input}
            />
          )}
        </div>
      ))}

      <div className={styles.itensSection}>
        <h3>Itens</h3>
        {itens.map((it, idx) => (
          <div key={it.id_produto} className={styles.itemRowGrid}>
            <span>{it.nome_produto}</span>
            <select
              value={it.id_fornecedor || ''}
              onChange={e => handleItemChange(idx, 'id_fornecedor', e.target.value)}
              className={styles.input}>
              <option value="">Selecione...</option>
              {fornecedores.map(f => (
                <option key={f.id_fornecedor} value={f.id_fornecedor}>
                  {f.nome_fornecedor}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              value={it.quantidade || ''}
              onChange={e => handleItemChange(idx, 'quantidade', e.target.value)}
              className={styles.input}
            />
            <input
              type="text"
              inputMode="numeric"
              value={Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format((Number(it.preco_unitario) / 100) || 0)}
              onChange={e => {
                const raw = e.target.value.replace(/\D/g, ''); // Remove tudo que não for número
                const precoCentavos = raw.slice(0, 9); // Limita tamanho se quiser
                handleItemChange(idx, 'preco_unitario', precoCentavos);
              }}
              className={styles.input}
            />





            <button type="button" onClick={() => handleRemove(it.id_produto)}>
              Remover
            </button>
          </div>
        ))}
        <div className={styles.total}>
          Total: {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(total / 100)}
        </div>

      </div>

      <div className={styles.buttonGroup}>
        <button type="button" onClick={onCancel}>Voltar</button>
        <button type="submit" disabled={disabled}>
          {mode === 'edit' ? 'Atualizar' : 'Cadastrar'}
        </button>
      </div>
    </form>
  );
}

