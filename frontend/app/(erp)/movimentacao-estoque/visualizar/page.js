"use client";

import React, { useState, useEffect } from "react";
import BoxComponent from '@/components/BoxComponent';
import styles from "./visualizar.module.css";

export default function MovimentacaoEstoqueFormPage() {
  const [estoques, setEstoques] = useState([]);
  const [tipo, setTipo] = useState("entrada");
  const [quantidade, setQuantidade] = useState(0);
  const [selecionado, setSelecionado] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    async function loadEstoques() {
      try {
        const resp = await fetch("http://localhost:5000/estoque");
        const data = await resp.json();
        setEstoques(data.data || data || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadEstoques();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selecionado || quantidade <= 0) {
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
      if (resp.ok) {
        setMensagem("Movimentação registrada com sucesso.");
        setQuantidade(0);
        setSelecionado("");
      } else {
        const error = await resp.json();
        setMensagem(error.message || "Erro ao registrar movimentação.");
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
            <select
              value={selecionado}
              onChange={(e) => setSelecionado(e.target.value)}
            >
              <option value="">Selecione</option>
              {estoques.map((e) => (
                <option key={e.id_estoque} value={e.id_estoque}>
                  {`${e.nome_produto} (${e.local_armazenamento})`}
                </option>
              ))}
            </select>
          </label>

          <label>
            Tipo:
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
          </label>

          <label>
            Quantidade:
            <input
              type="number"
              min="1"
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