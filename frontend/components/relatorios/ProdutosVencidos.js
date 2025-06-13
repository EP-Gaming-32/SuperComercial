"use client";
import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ProdutosVencidos() {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todos");

  const categorias = ["Todos", "Vencidos", "Danificados"];

  const dataOriginal = [
    {
      loja: "Loja A",
      Vencidos: { Leite: 2, Pão: 1, Suco: 2 },
      Danificados: { Arroz: 1, Macarrão: 1 },
    },
    {
      loja: "Loja B",
      Vencidos: { Leite: 1, Pão: 1, Suco: 1 },
      Danificados: { Arroz: 1 },
    },
    {
      loja: "Loja C",
      Vencidos: { Leite: 3, Pão: 3, Suco: 2 },
      Danificados: { Arroz: 2, Macarrão: 1 },
    },
    {
      loja: "Loja D",
      Vencidos: { Leite: 1, Suco: 1 },
      Danificados: {},
    },
  ];

  function somaCategoria(categoria, loja) {
    return Object.values(loja[categoria] || {}).reduce((a, b) => a + b, 0);
  }

  if (categoriaSelecionada === "Todos") {
    const dataTodos = dataOriginal.map((loja) => ({
      loja: loja.loja,
      Vencidos: somaCategoria("Vencidos", loja),
      Danificados: somaCategoria("Danificados", loja),
    }));

    return (
      <div>
        <h3>Produtos Vencidos/Danificados por Loja</h3>

        <label>Filtrar por categoria:</label>
        <select
          onChange={(e) => setCategoriaSelecionada(e.target.value)}
          value={categoriaSelecionada}
          style={{ marginBottom: 10, marginLeft: 10 }}
        >
          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dataTodos} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="loja" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Vencidos" fill="#FF4D4D" />
            <Bar dataKey="Danificados" fill="#FFA64D" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  const subcategorias = Object.keys(dataOriginal[0][categoriaSelecionada] || {});
  const dataPorSubcategoria = dataOriginal.map((loja) => {
    let obj = { loja: loja.loja };
    subcategorias.forEach((sub) => {
      obj[sub] = loja[categoriaSelecionada][sub] || 0;
    });
    return obj;
  });

  const colors = ["#FF4D4D", "#FFA64D", "#FFD700", "#FF8C00", "#F08080"];

  return (
    <div>
      <h3>Produtos {categoriaSelecionada} por Loja</h3>

      <label>Filtrar por categoria:</label>
      <select
        onChange={(e) => setCategoriaSelecionada(e.target.value)}
        value={categoriaSelecionada}
        style={{ marginBottom: 10, marginLeft: 10 }}
      >
        {categorias.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={dataPorSubcategoria} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="loja" />
          <YAxis />
          <Tooltip />
          <Legend />
          {subcategorias.map((sub, index) => (
            <Bar key={sub} dataKey={sub} fill={colors[index % colors.length]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
