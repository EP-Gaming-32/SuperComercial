"use client";
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import styles from "./Visuals.module.css";

export default function ProductVisual() {
  const data = [
    { name: "Produto A", estoque: 200 },
    { name: "Produto B", estoque: 120 },
    { name: "Produto C", estoque: 300 },
    { name: "Produto D", estoque: 50 },
    { name: "Produto E", estoque: 75 },
  ];

  return (
    <div className={styles.visualContainer}>
      <h2 className={styles.visualTitle}>Produtos - Estoque</h2>
      <div className={styles.visualContent}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} label={{ value: "Estoque", angle: -90, position: "insideLeft", fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="estoque" fill="#29b6f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
