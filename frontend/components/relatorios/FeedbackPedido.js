"use client";
import React, { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Card from "./Card";

export default function FeedbackPedido() {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todos");

  // Dados com categoria para exemplo
  const dataOriginal = [
    { order: "Pedido 1", score: 4, categoria: "Satisfação" },
    { order: "Pedido 2", score: 3, categoria: "Satisfação" },
    { order: "Pedido 3", score: 5, categoria: "Qualidade" },
    { order: "Pedido 4", score: 2, categoria: "Qualidade" },
    { order: "Pedido 5", score: 4, categoria: "Entrega" },
  ];

  const categorias = ["Todos", ...Array.from(new Set(dataOriginal.map(d => d.categoria)))];

  // Filtra dados pela categoria
  const dataFiltrada =
    categoriaSelecionada === "Todos"
      ? dataOriginal
      : dataOriginal.filter(d => d.categoria === categoriaSelecionada);

  // Cores dinâmicas
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  return (
    <Card title="Feedback do Cliente por Pedido">
      <div style={{ marginBottom: 10 }}>
        <label>Filtrar por categoria:</label>
        <select
          onChange={e => setCategoriaSelecionada(e.target.value)}
          value={categoriaSelecionada}
          style={{ marginLeft: 10 }}
        >
          {categorias.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={dataFiltrada}
            dataKey="score"
            nameKey="order"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label
          >
            {dataFiltrada.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
