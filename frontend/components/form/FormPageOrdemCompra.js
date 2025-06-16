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
    status: mode === 'create' ? 'Pendente' : '',
    filial_destino: ''
  });

  const [itensOC, setItensOC] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [filiais, setFiliais] = useState([]);

  // 🔄 Carregar dados para edição
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
            status: data.status || 'Pendente',
            filial_destino: data.filial_destino?.toString() || ''
          });
          setItensOC(data.itens.map(item => ({
            id_produto: item.id_produto,
            nome_produto: item.nome_produto,
            id_fornecedor: item.id_fornecedor,
            quantidade: item.quantidade,
            preco_unitario: parseFloat(item.preco_unitario)
          })));
        });
    }
  }, [mode, id]);

  // 🔄 Preencher itens no modo criação
  useEffect(() => {
    if (mode !== 'edit' && produtosOriginais.length) {
      setItensOC(produtosOriginais.map(p => ({
        ...p,
        id_fornecedor: '',
        quantidade: p.quantidade || 1,
        preco_unitario: p.preco_unitario || 0
      })));
    }
  }, [produtosOriginais, mode]);

  // 🔄 Buscar fornecedores
  useEffect(() => {
    fetch('http://localhost:5000/fornecedores')
      .then(res => res.json())
      .then(data => setFornecedores(data.data || []));
  }, []);

  // 🔄 Buscar filiais
  useEffect(() => {
    fetch('http://localhost:5000/filial')
      .then(res => res.json())
      .then(data => setFiliais(data.data || []));
  }, []);

  // 🎯 Manipuladores
  const handleFormChange = (field, value) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleItemChange = (idx, field, value) => {
    setItensOC(prev =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              [field]:
                field === 'quantidade'
                  ? parseInt(value, 10) || 0
                  : field === 'preco_unitario'
                  ? parseFloat(value) || 0
                  : value
            }
          : item
      )
    );
  };

  const handleRemoverItem = idx =>
    setItensOC(prev => prev.filter((_, i) => i !== idx));

  const calcularValorTotal = () =>
    itensOC.reduce((sum, item) => sum + item.quantidade * item.preco_unitario, 0);

  const submit = e => {
    e.preventDefault();

    // 🛑 Validações
    if (itensOC.some(item => !item.id_fornecedor)) {
      alert('Selecione um fornecedor para todos os itens.');
      return;
    }

    if (formData.status === 'Recebido na Filial' && !formData.filial_destino) {
      alert('Selecione a filial de destino.');
      return;
    }

    // ✅ Prepara payload
    const payload = {
      ...formData,
      filial_destino: formData.filial_destino
        ? parseInt(formData.filial_destino, 10)
        : null,
      itens: itensOC,
      valor_total: calcularValorTotal()
    };

    onSubmit(payload);
  };

  // 🚀 Render
  return (
    <form onSubmit={submit} className={styles.form}>
      {/* 🗓️ Dados Gerais */}
      <div className={styles.fieldGroup}>
        <label>Data da Ordem*</label>
        <input
          type="date"
          value={formData.data_ordem}
          onChange={e => handleFormChange('data_ordem', e.target.value)}
          required
        />

        <label>Status*</label>
        <select
          value={formData.status}
          onChange={e => handleFormChange('status', e.target.value)}
          required
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <label>Previsão de Entrega</label>
        <input
          type="date"
          value={formData.data_entrega_prevista}
          onChange={e => handleFormChange('data_entrega_prevista', e.target.value)}
        />
      </div>

      {/* 📝 Observação */}
      <div className={styles.field}>
        <label>Observação</label>
        <textarea
          rows={3}
          value={formData.observacao}
          onChange={e => handleFormChange('observacao', e.target.value)}
        />
      </div>

      {/* 🏢 Filial de Destino */}
      {formData.status === 'Recebido na Filial' && (
        <div className={styles.fieldGroup}>
          <label>Filial de Destino*</label>
          <select
            value={formData.filial_destino}
            onChange={e => handleFormChange('filial_destino', e.target.value)}
            required
          >
            <option value="">Selecione...</option>
            {filiais.map(f => (
              <option key={f.id_filial} value={f.id_filial}>
                {f.nome_filial}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 📦 Itens */}
      <div className={styles.itensSection}>
        <h3>Itens da Ordem</h3>
        {itensOC.length === 0 && <p>Nenhum item adicionado.</p>}

        {itensOC.map((item, idx) => (
          <div key={idx} className={styles.itemRow}>
            <span>{item.nome_produto}</span>

            <select
              value={item.id_fornecedor}
              onChange={e => handleItemChange(idx, 'id_fornecedor', e.target.value)}
              required
            >
              <option value="">Fornecedor...</option>
              {produtosFornecedores
                .filter(pf => pf.id_produto === item.id_produto)
                .map(pf => {
                  const f = fornecedores.find(
                    x => x.id_fornecedor === pf.id_fornecedor
                  );
                  return (
                    <option key={pf.id_fornecedor} value={pf.id_fornecedor}>
                      {f?.nome_fornecedor || 'Fornecedor'}
                    </option>
                  );
                })}
            </select>

            <input
              type="number"
              min={1}
              value={item.quantidade}
              onChange={e => handleItemChange(idx, 'quantidade', e.target.value)}
              required
            />

            <input
              type="number"
              step="0.01"
              value={item.preco_unitario.toFixed(2)}
              onChange={e => handleItemChange(idx, 'preco_unitario', e.target.value)}
              required
            />

            <button type="button" onClick={() => handleRemoverItem(idx)}>
              Remover
            </button>
          </div>
        ))}

        <div className={styles.total}>
          Total: R$ {calcularValorTotal().toFixed(2)}
        </div>
      </div>

      {/* 🎯 Botões */}
      <div className={styles.buttonGroup}>
        <button type="button" onClick={onCancel}>
          Voltar
        </button>
        <button type="submit">
          {mode === 'edit' ? 'Atualizar' : 'Cadastrar'} Ordem
        </button>
      </div>
    </form>
  );
}