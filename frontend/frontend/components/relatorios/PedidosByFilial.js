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

export default function PedidosByFilial() {
  // Mock data: number of orders per store (from Pedidos table)
  const data = [
    { store: "Loja A", orders: 120 },
    { store: "Loja B", orders: 85 },
    { store: "Loja C", orders: 150 },
    { store: "Loja D", orders: 60 },
  ];

  return (
    <div>
      <h3>Relatório de Pedidos por Loja</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="store" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="orders" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
