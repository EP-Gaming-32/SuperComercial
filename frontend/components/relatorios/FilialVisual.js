"use client";
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import styles from "./Visuals.module.css";

export default function FilialVisual() {
  const data = [
    { filial: "Filial 1", pedidos: 120 },
    { filial: "Filial 2", pedidos: 80 },
    { filial: "Filial 3", pedidos: 60 },
  ];

  return (
    <div className={styles.visualContainer}>
      <h2 className={styles.visualTitle}>Pedidos por Filial</h2>
      <div className={styles.visualContent}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="filial" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} label={{ value: "Pedidos", angle: -90, position: "insideLeft", fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="pedidos" fill="#29b6f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
