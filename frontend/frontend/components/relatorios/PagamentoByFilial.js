"use client";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function PagamentoByFilial() {
  // Mock data: Total payments per store (from Pagamentos table)
  const data = [
    { store: "Loja A", totalPayments: 5000 },
    { store: "Loja B", totalPayments: 3500 },
    { store: "Loja C", totalPayments: 4200 },
    { store: "Loja D", totalPayments: 2800 },
  ];

  return (
    <div>
      <h3>Relatório de Pagamentos por Loja</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="store" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="totalPayments" stroke="#FF8042" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
