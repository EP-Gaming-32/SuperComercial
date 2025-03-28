"use client";
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import styles from "./Visuals.module.css";

export default function ComprasVisual() {
  const data = [
    { month: "Jan", valor_total: 10000 },
    { month: "Fev", valor_total: 12000 },
    { month: "Mar", valor_total: 8000 },
    { month: "Abr", valor_total: 15000 },
    { month: "Mai", valor_total: 9000 },
    { month: "Jun", valor_total: 14000 },
  ];

  return (
    <div className={styles.visualContainer}>
      <h2 className={styles.visualTitle}>Compras - Valor Total</h2>
      <div className={styles.visualContent}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} label={{ value: "Valor Total", angle: -90, position: "insideLeft", fontSize: 10 }} />
            <Tooltip />
            <Line type="monotone" dataKey="valor_total" stroke="#29b6f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
