"use client";
import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Card from "./Card";

export default function FilialVisual() {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todos");

  const dataOriginal = [
    { filial: "Filial 1", pedidos: 120, categoria: "Região Norte" },
    { filial: "Filial 2", pedidos: 80, categoria: "Região Sul" },
    { filial: "Filial 3", pedidos: 60, categoria: "Região Norte" },
  ];

  const categorias = ["Todos", ...Array.from(new Set(dataOriginal.map(d => d.categoria)))];

  const dataFiltrada =
    categoriaSelecionada === "Todos"
      ? dataOriginal
      : dataOriginal.filter(d => d.categoria === categoriaSelecionada);

  return (
    <Card title="Pedidos por Filial">
      <div style={{ marginBottom: 10 }}>
        <label>Filtrar por categoria:</label>
        <select
          onChange={e => setCategoriaSelecionada(e.target.value)}
          value={categoriaSelecionada}
          style={{
            marginLeft: 10,
            padding: "5px 10px",
            borderRadius: 5,
            border: "1px solid #ccc",
          }}
        >
          {categorias.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <AreaChart
          data={dataFiltrada}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="filial" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            label={{
              value: "Pedidos",
              angle: -90,
              position: "insideLeft",
              fontSize: 12,
            }}
          />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="pedidos"
            stroke="#29b6f6"
            fill="#29b6f6"
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
