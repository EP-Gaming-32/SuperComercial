"use client";
import React, { useEffect, useState } from "react";
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import styles from "./Visuals.module.css";

export default function EstoqueVisual() {
  const [data, setData] = useState([]);

  const COLORS = ["#29b6f6", "#ffcc00", "#ff4d4d"];

  useEffect(() => {
    fetch("http://localhost:5000/relatorios/estoque-status")
      .then((res) => res.json())
      .then((data) => {
        // O backend retorna status em minúsculo, pode querer capitalizar nomes
        const formatted = data.map((item) => ({
          name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
          value: item.value,
        }));
        setData(formatted);
      })
      .catch((error) => {
        console.error("Erro ao carregar dados de estoque:", error);
      });
  }, []);

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
