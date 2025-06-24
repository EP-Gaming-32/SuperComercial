'use client';
import React, { useState, useEffect } from 'react';
import styles from './FormPageProdutos.module.css';

export default function FormPageEstoqueLote({
  data = {}, produtos = [], fornecedores = [], filiais = [],
  mode, onSubmit, onCancel
}) {
  // 1) Estado inicial completo, sem campos undefined
  const [formData, setFormData] = useState({
    id_produto: '',
    id_fornecedor: '',
    id_filial: '',
    local_armazenamento: '',
    quantidade: '',
    estoque_minimo: '',
    estoque_maximo: '',
    hasLote: false,
    id_lote: null,
    codigo_lote: '',
    data_expedicao: '',
    data_validade: '',
    lote_quantidade: ''
  });

  // 2) Ao montar, se estivermos em 'edit', preenche com os dados recebidos
  useEffect(() => {
    if (mode === 'edit' && data.id_estoque) {
      setFormData({
        id_produto: data.id_produto ?? '',
        id_fornecedor: data.id_fornecedor ?? '',
        id_filial: data.id_filial ?? '',
        local_armazenamento: data.local_armazenamento ?? '',
        quantidade: data.quantidade ?? '',
        estoque_minimo: data.estoque_minimo ?? '',
        estoque_maximo: data.estoque_maximo ?? '',
        hasLote: !!data.id_lote,
        id_lote: data.id_lote ?? null,
        codigo_lote: data.codigo_lote || '',
        data_expedicao: data.data_expedicao || '',
        data_validade: data.data_validade || '',
        lote_quantidade: data.lote_quantidade || ''
      });
    }
  }, [mode, data]);

  const sanitizeNumber = (value) => {
    const num = Number(value);
    return isNaN(num) || num < 1 ? 1 : num;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === 'checkbox' ? checked : value;
    if (['quantidade','estoque_minimo','estoque_maximo'].includes(name)) {
      val = sanitizeNumber(val);
    }
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validações mínimas
    if (!formData.id_produto || !formData.id_fornecedor || !formData.id_filial) {
      alert('Selecione Produto, Fornecedor e Filial.');
      return;
    }
    if (formData.quantidade < 1 || formData.estoque_minimo < 1 || formData.estoque_maximo < 1) {
      alert('Quantidade, Estoque Mínimo e Máximo devem ser ao menos 1.');
      return;
    }
    if (formData.estoque_minimo > formData.estoque_maximo) {
      alert('Estoque Mínimo não pode ser maior que Estoque Máximo.');
      return;
    }

    const payload = { ...formData };

    if (formData.hasLote) {
      payload.codigo_lote = `LOTE-${Date.now()}`;
      payload.data_expedicao = new Date().toISOString().split('T')[0];
      payload.data_validade = formData.data_validade || null;
      payload.lote_quantidade = payload.quantidade;
    } else {
      payload.id_lote = null;
      payload.codigo_lote = '';
      payload.data_expedicao = '';
      payload.data_validade = '';
      payload.lote_quantidade = '';
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Checkbox Possui Lote? */}
      <div className={styles.field}>
        <label htmlFor="hasLote" className={styles.label}>
          <input
            type="checkbox"
            id="hasLote"
            name="hasLote"
            checked={formData.hasLote}
            onChange={handleChange}
          />
          {' '}Possui Lote?
        </label>
      </div>

      {/* Campos Estoque (sempre controlados) */}
      <div className={styles.field}>
        <label htmlFor="id_produto">Produto*</label>
        <select
          id="id_produto"
          name="id_produto"
          value={formData.id_produto}
          onChange={handleChange}
          required
          className={styles.input}
        >
          <option value="">Selecione...</option>
          {produtos.map(p => (
            <option key={p.id_produto} value={p.id_produto}>
              {p.nome_produto}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <label htmlFor="id_fornecedor">Fornecedor*</label>
        <select
          id="id_fornecedor"
          name="id_fornecedor"
          value={formData.id_fornecedor}
          onChange={handleChange}
          required
          className={styles.input}
        >
          <option value="">Selecione...</option>
          {fornecedores.map(f => (
            <option key={f.id_fornecedor} value={f.id_fornecedor}>
              {f.nome_fornecedor}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <label htmlFor="id_filial">Filial*</label>
        <select
          id="id_filial"
          name="id_filial"
          value={formData.id_filial}
          onChange={handleChange}
          required
          className={styles.input}
        >
          <option value="">Selecione...</option>
          {filiais.map(fi => (
            <option key={fi.id_filial} value={fi.id_filial}>
              {fi.nome_filial}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <label htmlFor="local_armazenamento">Local de Armazenamento*</label>
        <input
          type="text"
          id="local_armazenamento"
          name="local_armazenamento"
          value={formData.local_armazenamento}
          onChange={handleChange}
          maxLength={255}
          required
          className={styles.input}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="quantidade">Quantidade*</label>
        <input
          type="number"
          id="quantidade"
          name="quantidade"
          value={formData.quantidade}
          onChange={handleChange}
          min={1}
          required
          className={styles.input}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="estoque_minimo">Estoque Mínimo*</label>
        <input
          type="number"
          id="estoque_minimo"
          name="estoque_minimo"
          value={formData.estoque_minimo}
          onChange={handleChange}
          min={1}
          required
          className={styles.input}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="estoque_maximo">Estoque Máximo*</label>
        <input
          type="number"
          id="estoque_maximo"
          name="estoque_maximo"
          value={formData.estoque_maximo}
          onChange={handleChange}
          min={1}
          required
          className={styles.input}
        />
      </div>

      {/* Campos Lote (só aparece quando hasLote=true) */}
      {formData.hasLote && (
        <>
          <div className={styles.field}>
            <label htmlFor="codigo_lote">Código do Lote*</label>
            <input
              type="text"
              id="codigo_lote"
              name="codigo_lote"
              value={formData.codigo_lote}
              readOnly
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="data_expedicao">Data de Expedição*</label>
            <input
              type="date"
              id="data_expedicao"
              name="data_expedicao"
              value={formData.data_expedicao}
              readOnly
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="data_validade">Data de Validade</label>
            <input
              type="date"
              id="data_validade"
              name="data_validade"
              value={formData.data_validade}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="lote_quantidade">Quantidade no Lote*</label>
            <input
              type="number"
              id="lote_quantidade"
              name="lote_quantidade"
              value={formData.lote_quantidade}
              readOnly
              className={styles.input}
            />
          </div>
        </>
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