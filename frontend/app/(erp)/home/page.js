"use client";
import React from "react";
import ProductList from "@/components/home/ProductList";
import styles from "./home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <ProductList />
      </div>
    </div>
  );
}
