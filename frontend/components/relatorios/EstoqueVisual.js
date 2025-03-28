"use client";
import React from "react";
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import styles from "./Visuals.module.css";

export default function EstoqueVisual() {
  const data = [
    { name: "Normal", value: 60 },
    { name: "Baixo", value: 25 },
    { name: "Crítico", value: 15 },
  ];

  const COLORS = ["#29b6f6", "#ffcc00", "#ff4d4d"];

  return (
    <div className={styles.visualContainer}>
      <h2 className={styles.visualTitle}>Estoque - Status</h2>
      <div className={styles.visualContent}>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={70} label fontSize={10}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend fontSize={10} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
