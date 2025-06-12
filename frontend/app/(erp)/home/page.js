"use client";
import React from "react";
import DeliveryList from "@/components/home/DeliveryList";
import ProductList from "@/components/home/ProductList";
import Chart from "@/components/home/SalesChart";
import styles from "./home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard SuperComercial</h1>  
      <div className={styles.card}>
        <ProductList />
      </div>
    </div>
  );
}
