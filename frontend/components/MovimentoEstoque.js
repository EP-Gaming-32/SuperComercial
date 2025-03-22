"use client";

import React, { useEffect, useState } from "react";
import styles from "./MovimentoEstoque.module.css";

// Mock data for stock movements
const mockData = [
    {
      id: 1,
      product: "Product A",
      movement: 10,
      date: "2023-04-01T12:00:00Z",
    },
    {
      id: 2,
      product: "Product B",
      movement: -5,
      date: "2023-04-02T09:30:00Z",
    },
    {
      id: 3,
      product: "Product C",
      movement: 20,
      date: "2023-04-03T15:45:00Z",
    },
  ];
  
  export default function StockMovementsList() {
    return (
      <div className={styles.container}>
        <h2>Stock Movements</h2>
        <ul className={styles.list}>
          {mockData.map((item) => (
            <li key={item.id} className={styles.item}>
              <span className={styles.product}>{item.product}</span>
              <span className={styles.movement}>{item.movement}</span>
              <span className={styles.date}>
                {new Date(item.date).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
