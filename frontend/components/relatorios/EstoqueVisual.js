"use client";
import React, { useEffect, useState } from "react";
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import styles from "./Visuals.module.css";

export default function EstoqueVisual() {
  const [data, setData] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [filialSelecionada, setFilialSelecionada] = useState("");

  const COLORS = ["#29b6f6", "#ffcc00", "#ff4d4d"];

  // Carrega as filiais
  useEffect(() => {
    fetch("http://localhost:5000/filial?page=1&limit=100")
      .then((res) => res.json())
      .then((resposta) => {
        const lista = resposta.data.map((f) => ({
          id: f.id_filial.toString(),
          nome: f.nome_filial,
        }));
        setFiliais(lista);
        if (lista.length > 0) {
          setFilialSelecionada(lista[0].id);
        }
      })
      .catch((err) => console.error("Erro ao buscar filiais:", err));
  }, []);

  // Carrega os dados do gráfico quando a filial muda
  useEffect(() => {
    if (!filialSelecionada) return;

    fetch(`http://localhost:5000/relatorios/estoque-status?id_filial=${filialSelecionada}`)
      .then((res) => res.json())
      .then((dados) => {
        const formatado = dados.map((item) => ({
          name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
          value: item.value,
        }));
        setData(formatado);
      })
      .catch((err) => console.error("Erro ao buscar dados de estoque:", err));
  }, [filialSelecionada]);

  return (
    <div className={styles.visualContainer}>
      <h2 className={styles.visualTitle}>Estoque - Status por Filial</h2>

      <div className={styles.visualControl}>
        <label htmlFor="filialSelect">Filial:</label>
        <select
          id="filialSelect"
          value={filialSelecionada}
          onChange={(e) => setFilialSelecionada(e.target.value)}
        >
          {filiais.map((filial) => (
            <option key={filial.id} value={filial.id}>
              {filial.nome}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.visualContent}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={90}
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
