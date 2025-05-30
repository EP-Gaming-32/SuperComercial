"use client";
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import styles from "./Visuals.module.css";

export default function ComprasVisual() {
  const [data, setData] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [filialSelecionada, setFilialSelecionada] = useState("");

  // Carrega as filiais
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
          setFilialSelecionada(lista[0].id); // seleciona a primeira por padrão
        }
      })
      .catch((err) => console.error("Erro ao buscar filiais:", err));
  }, []);

  // Carrega os dados do gráfico quando a filial muda
  useEffect(() => {
    if (!filialSelecionada) return;
    fetch(`http://localhost:5000/relatorios/pedidos-filial?id_filial=${filialSelecionada}`)
      .then((res) => res.json())
      .then((dados) => {
        const formatado = dados.map((item) => {
          const [ano, mes] = item.mes.split("-");
          const date = new Date(ano, mes - 1);
          return {
            month: date.toLocaleDateString("pt-BR", {
              month: "short",
              year: "2-digit"
            }),
            valor_total: item.valor_total
          };
        });
        setData(formatado);
      })
      .catch((err) => console.error("Erro ao buscar dados de pedidos:", err));
  }, [filialSelecionada]);

  return (
    <div className={styles.visualContainer}>
      <h2 className={styles.visualTitle}>Pedidos - Valor Total por Mês</h2>

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
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis
              tick={{ fontSize: 10 }}
              label={{
                value: "Valor Total (R$)",
                angle: -90,
                position: "insideLeft",
                fontSize: 10
              }}
            />
            <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
            <Line
              type="monotone"
              dataKey="valor_total"
              stroke="#29b6f6"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
