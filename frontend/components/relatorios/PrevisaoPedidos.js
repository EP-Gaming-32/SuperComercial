"use client";
import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function PrevisaoPedidos() {
  // Mock data: Forecast of orders per month for a store (you can also split by loja)
  const data = [
    { month: 'Jan', forecast: 100 },
    { month: 'Feb', forecast: 150 },
    { month: 'Mar', forecast: 130 },
    { month: 'Abr', forecast: 170 },
    { month: 'Mai', forecast: 160 },
    { month: 'Jun', forecast: 180 },
  ];

  return (
    <div>
      <h3>Previsão de Pedidos</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="forecast" stroke="#8884d8" fill="#8884d8" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
