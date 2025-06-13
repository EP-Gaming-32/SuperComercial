"use client";
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import styles from "./Visuals.module.css";
import Card from "./Card";

export default function ComprasVisual() {
  const [data, setData] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [filialSelecionada, setFilialSelecionada] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todos");

  const categorias = ["Todos", "Alimentos", "Eletrônicos", "Higiene"];

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

    fetch(`http://localhost:5000/relatorios/pedidos-filial?id_filial=${filialSelecionada}`)
      .then((res) => res.json())
      .then((dados) => {
        const formatado = dados.map((item) => {
          const [ano, mes] = item.mes.split("-");
          const date = new Date(ano, mes - 1);
          return {
            month: date.toLocaleDateString("pt-BR", {
              month: "short",
              year: "2-digit",
            }),
            valor_total: parseFloat(item.valor_total_pedidos),
            total_pedidos: parseInt(item.total_pedidos),
            categoria: item.categoria || "Outros",
          };
        });
        setData(formatado);
      })
      .catch((err) => console.error("Erro ao buscar dados de pedidos:", err));
  }, [filialSelecionada]);

  const dataFiltrada = categoriaSelecionada === "Todos"
    ? data
    : data.filter(item => item.categoria === categoriaSelecionada);

  return (
    <div className={styles.visualContainer}>
      <h2 className={styles.visualTitle}>Pedidos - Valor e Quantidade por Mês</h2>

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
          <LineChart data={dataFiltrada}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 10 }}
              label={{
                value: "Valor Total (R$)",
                angle: -90,
                position: "insideLeft",
                fontSize: 10,
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 10 }}
              label={{
                value: "Total de Pedidos",
                angle: 90,
                position: "insideRight",
                fontSize: 10,
              }}
            />
            <Tooltip
              formatter={(value, name) => {
                if (name === "valor_total") return [`R$ ${value.toFixed(2)}`, "Valor Total"];
                return [value, "Total de Pedidos"];
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="valor_total"
              stroke="#29b6f6"
              strokeWidth={2}
              name="Valor Total"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="total_pedidos"
              stroke="#66bb6a"
              strokeWidth={2}
              name="Total de Pedidos"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <Card title="Compras - Valor Total por Categoria">
        <div style={{ marginBottom: "10px" }}>
          <label>Filtrar por categoria:</label>
          <select
            onChange={(e) => setCategoriaSelecionada(e.target.value)}
            value={categoriaSelecionada}
            style={{ marginLeft: "10px" }}
          >
            {categorias.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dataFiltrada}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis
              tick={{ fontSize: 10 }}
              label={{
                value: "Valor Total",
                angle: -90,
                position: "insideLeft",
                fontSize: 10,
              }}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="valor_total"
              stroke="#ff9800"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}