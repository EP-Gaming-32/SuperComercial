"use client";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function FornecedorByFilial() {
  // Mock data: Number of suppliers per store (from Fornecedor and relacionamento, for example)
  const data = [
    { store: "Loja A", suppliers: 15 },
    { store: "Loja B", suppliers: 10 },
    { store: "Loja C", suppliers: 12 },
    { store: "Loja D", suppliers: 8 },
  ];

  return (
    <div>
      <h3>Relatório de Fornecedores por Loja</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="store" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="suppliers" fill="#00C49F" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
