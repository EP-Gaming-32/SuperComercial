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

export default function ProdutosVencidos() {
  // Mock data: Quantities of expired and damaged products per store
  const data = [
    { store: "Loja A", vencidos: 5, danificados: 2 },
    { store: "Loja B", vencidos: 3, danificados: 1 },
    { store: "Loja C", vencidos: 8, danificados: 3 },
    { store: "Loja D", vencidos: 2, danificados: 0 },
  ];

  return (
    <div>
      <h3>Produtos Vencidos/Danificados por Loja</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="store" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="vencidos" stackId="a" fill="#FF4D4D" name="Vencidos" />
          <Bar dataKey="danificados" stackId="a" fill="#FFA64D" name="Danificados" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
