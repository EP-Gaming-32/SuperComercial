import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import styles from "./home.module.css";

export default function Chart() {
  const data = [
    { name: "Jan", vendas: 4000 },
    { name: "Fev", vendas: 3000 },
    { name: "Mar", vendas: 5000 },
    { name: "Abr", vendas: 4000 },
    { name: "Mai", vendas: 6000 },
    { name: "Jun", vendas: 5500 },
    { name: "Jul", vendas: 7000 },
    { name: "Ago", vendas: 6500 },
    { name: "Set", vendas: 7200 },
    { name: "Out", vendas: 8000 },
    { name: "Nov", vendas: 7500 },
    { name: "Dez", vendas: 9000 },
  ];

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Gráfico de Faturamento</h2>
      <div className={styles.cardContent}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="vendas" fill="#06b6d4" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
