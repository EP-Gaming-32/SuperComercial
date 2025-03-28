import React from "react";
import { ShoppingCart } from "lucide-react";
import styles from "./home.module.css";

export default function ProductList() {
  const products = [
    { nome: "Produto A", filial: "Filial 1", estoque: 200, vendas: 15, pvr: 50.0 },
    { nome: "Produto B", filial: "Filial 2", estoque: 120, vendas: 8, pvr: 30.5 },
    { nome: "Produto C", filial: "Filial 1", estoque: 300, vendas: 20, pvr: 70.0 },
  ];

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Produtos (PVR)</h2>
      <div className={styles.cardContent}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Filial</th>
              <th>Estoque</th>
              <th>Vendas</th>
              <th>PVR</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={index} className={styles.tableRow}>
                <td className={styles.flex}>
                  <ShoppingCart size={20} color="#888" /> {product.nome}
                </td>
                <td>{product.filial}</td>
                <td>{product.estoque}</td>
                <td>{product.vendas}</td>
                <td>R$ {product.pvr.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
