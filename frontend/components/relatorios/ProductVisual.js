"use client";
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import styles from "./Visuals.module.css";

export default function ProductVisual() {
  const [data, setData] = useState([]);
  const [filialSelecionada, setFilialSelecionada] = useState("");
  const [filiais, setFiliais] = useState([]);

  // Carregar as filiais da API
  useEffect(() => {
    fetch("http://localhost:5000/filial?page=1&limit=100")
      .then((res) => res.json())
      .then((resposta) => {
        const lista = resposta.data.map((f) => ({
          id: f.id_filial.toString(),
          nome: f.nome_filial
        }));
        setFiliais(lista);
        if (lista.length > 0) {
          setFilialSelecionada(lista[0].id); // define a primeira como padrão
        }
      })
      .catch((error) => {
        console.error("Erro ao carregar filiais:", error);
      });
  }, []);

  // Carregar dados do gráfico quando a filial mudar
  useEffect(() => {
    if (!filialSelecionada) return;
    fetch(`http://localhost:5000/relatorios/estoque-filial?id_filial=${filialSelecionada}`)
      .then((res) => res.json())
      .then((dados) => {
        setData(dados);
      })
      .catch((error) => {
        console.error("Erro ao carregar dados de produtos:", error);
      });
  }, [filialSelecionada]);

  return (
    <div className={styles.visualContainer}>
      <h2 className={styles.visualTitle}>Produtos - Estoque por Filial</h2>

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
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nome_produto" tick={{ fontSize: 10 }} />
            <YAxis
              tick={{ fontSize: 10 }}
              label={{
                value: "Estoque",
                angle: -90,
                position: "insideLeft",
                fontSize: 10
              }}
            />
            <Tooltip />
            <Bar dataKey="quantidade" fill="#29b6f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
