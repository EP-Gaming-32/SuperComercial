"use client";

import React, { useState, useEffect } from "react";
import BoxComponent from '@/components/BoxComponent';
import styles from "./visualizar.module.css";

export default function MovimentacaoEstoqueFormPage() {
  const [estoques, setEstoques] = useState([]);
  const [tipo, setTipo] = useState("Entrada");
  const [quantidade, setQuantidade] = useState(0);
  const [selecionado, setSelecionado] = useState("");
  const [mensagem, setMensagem] = useState("");

  const tipos = [
    { value: 'Entrada', label: 'Entrada' },
    { value: 'Reposição', label: 'Reposição' },
    { value: 'Vendido', label: 'Vendido' },
    { value: 'Quebrado', label: 'Quebrado' },
    { value: 'Vencido', label: 'Vencido' },
  ];

  // Carrega estoques
  const loadEstoques = async () => {
    try {
      const resp = await fetch("http://localhost:5000/estoque");
      const data = await resp.json();
      setEstoques(data.data || data || []);
    } catch (err) {
      console.error(err);
      setMensagem("Erro ao carregar estoques.");
    }
  };

  useEffect(() => {
    loadEstoques();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");
    if (!selecionado || quantidade < 0) {
      setMensagem("Selecione o estoque e informe quantidade válida.");
      return;
    }
    try {
      const resp = await fetch("http://localhost:5000/movimentacaoEstoque", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_estoque: selecionado,
          tipo_movimentacao: tipo,
          quantidade: Number(quantidade),
        }),
      });
      const result = await resp.json();
      if (resp.ok) {
        setMensagem("Movimentação registrada com sucesso. ID: " + result.id_movimentacao);
        setQuantidade(0);
        setSelecionado("");
        await loadEstoques();
      } else {
        setMensagem(result.error || result.message || "Erro ao registrar movimentação.");
      }
    } catch (err) {
      console.error(err);
      setMensagem("Erro de conexão ao registrar movimentação.");
    }
  };

  return (
    <div className={styles.container}>
      <BoxComponent>
        <h2>Registrar Movimentação de Estoque</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label>
            Estoque:
            <select value={selecionado} onChange={(e) => setSelecionado(e.target.value)}>
              <option value="">Selecione</option>
              {estoques.map((e) => (
                <option key={e.id_estoque} value={e.id_estoque}>
                  {`${e.nome_produto} (${e.local_armazenamento}) — Qtde: ${e.quantidade}`}
                </option>
              ))}
            </select>
          </label>

          <label>
            Tipo:
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              {tipos.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>

          <label>
            Quantidade:
            <input
              type="number"
              min="0"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
            />
          </label>

          <button type="submit">Registrar</button>
        </form>
        {mensagem && <p>{mensagem}</p>}
      </BoxComponent>
    </div>
  );
}