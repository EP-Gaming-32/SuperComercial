"use client";
import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function FeedbackPedido() {
  // Mock data: Each order with a customer feedback score
  const data = [
    { order: "Pedido 1", score: 4 },
    { order: "Pedido 2", score: 3 },
    { order: "Pedido 3", score: 5 },
    { order: "Pedido 4", score: 2 },
    { order: "Pedido 5", score: 4 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  return (
    <div>
      <h3>Feedback do Cliente por Pedido</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="score"
            nameKey="order"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
