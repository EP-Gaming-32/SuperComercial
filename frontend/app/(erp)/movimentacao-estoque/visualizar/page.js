"use client";

import React, { useState, useEffect } from "react";
import BoxComponent from '@/components/BoxComponent';
import styles from "./visualizar.module.css";

export default function MovimentacaoEstoqueFormPage() {
  const [estoques, setEstoques] = useState([]);
  const [tiposMovimentacao, setTiposMovimentacao] = useState([]);
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [tipo, setTipo] = useState("");
  const [quantidade, setQuantidade] = useState(0);
  const [selecionado, setSelecionado] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [mensagem, setMensagem] = useState("");

  // Carrega estoques, tipos de movimentação e formas de pagamento
  useEffect(() => {
    // Estoques
    fetch("http://localhost:5000/estoque")
      .then(resp => resp.json())
      .then(data => setEstoques(data.data || data || []))
      .catch(() => setMensagem("Erro ao carregar estoques."));

    // Tipos de movimentação (ex: /movimentacaoEstoque/tipos)
    fetch("http://localhost:5000/movimentacaoEstoque/tipos")
      .then(resp => resp.json())
      .then(data => setTiposMovimentacao(data || []))
      .catch(() => setMensagem("Erro ao carregar tipos de movimentação."));

    // Formas de pagamento
    fetch("http://localhost:5000/formaPagamento?page=1&limit=100")
      .then(resp => resp.json())
      .then(result => setFormasPagamento(result.data || []))
      .catch(() => setMensagem("Erro ao carregar formas de pagamento."));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");

    if (!selecionado || quantidade <= 0 || !tipo) {
      setMensagem("Selecione estoque, tipo e informe quantidade válida.");
      return;
    }

    // Se for Vendido, exige forma de pagamento
    if (tipo === "Vendido" && !formaPagamento) {
      setMensagem("Por favor, selecione uma forma de pagamento para vendas.");
      return;
    }

    try {
      const payload = {
        id_estoque: selecionado,
        tipo_movimentacao: tipo,
        quantidade: Number(quantidade),
      };

      // Inclui forma de pagamento somente para vendas
      if (tipo === "Vendido") payload.forma_pagamento = formaPagamento;

      const resp = await fetch("http://localhost:5000/movimentacaoEstoque", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await resp.json();
      if (resp.ok) {
        setMensagem(`Movimentação registrada com sucesso. ID: ${result.id_movimentacao}`);
        // Reset campos
        setQuantidade(0);
        setSelecionado("");
        setTipo("");
        setFormaPagamento("");
        // Recarrega estoque
        fetch("http://localhost:5000/estoque")
          .then(resp => resp.json())
          .then(data => setEstoques(data.data || data || []));
      } else {
        setMensagem(result.error || result.message || "Erro ao registrar movimentação.");
      }
    } catch {
      setMensagem("Erro de conexão ao registrar movimentação.");
    }
  };

  return (
    <div className={styles.container}>
      <BoxComponent className={styles.mainBoxStyle}>
        <h2 className={styles.title}>Registrar Movimentação de Estoque</h2>
        <div className={styles.filterSection}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <label>
              Estoque:
              <select value={selecionado} onChange={e => setSelecionado(e.target.value)}>
                <option value="">Selecione</option>
                {estoques.map(e => (
                  <option key={e.id_estoque} value={e.id_estoque}>
                    {`${e.nome_produto} (${e.local_armazenamento}) — Qtde: ${e.quantidade}`}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Tipo de Movimentação:
              <select value={tipo} onChange={e => setTipo(e.target.value)}>
                <option value="">Selecione</option>
                {tiposMovimentacao.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>

            <label>
              Quantidade:
              <input
                type="number"
                min="0"
                value={quantidade}
                onChange={e => setQuantidade(Number(e.target.value))}
              />
            </label>

            {/* Exibe formas de pagamento apenas para tipo 'Vendido' */}
            {tipo === "Vendido" && (
              <label>
                Forma de Pagamento:
                <select value={formaPagamento} onChange={e => setFormaPagamento(e.target.value)}>
                  <option value="">Selecione</option>
                  {formasPagamento.map(fp => (
                    <option key={fp.id_forma_pagamento} value={fp.id_forma_pagamento}>
                      {fp.descricao}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <button type="submit">Registrar</button>
          </form>
        </div>
        {mensagem && <p className={styles.message}>{mensagem}</p>}
      </BoxComponent>
    </div>
  );
}