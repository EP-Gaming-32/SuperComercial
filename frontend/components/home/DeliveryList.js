import React from "react";
import { Star } from "lucide-react";
import styles from "./home.module.css";

export default function DeliveryList() {
  const deliveries = [
    {
      pedido: "Pedido 1 Filial 2",
      veiculo: "2202-BE",
      status: "a caminho",
      chegada: "15/06/2024",
      codigo: "XXX",
    },
    {
      pedido: "Pedido 2 Filial 1",
      veiculo: "1101-AC",
      status: "pendente",
      chegada: "20/06/2024",
      codigo: "YYY",
    },
  ];

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Entregas a Receber</h2>
      <div className={styles.cardContent}>
        {deliveries.map((item, index) => (
          <div key={index} className={styles.tableRow}>
            <div className={styles.flex}>
              <Star size={20} color="#888" />
              <p className="font-semibold">{item.pedido}</p>
            </div>
            <p>
              Veículo: {item.veiculo} | Status: {item.status} | Chegada: {item.chegada}
            </p>
            <p className="font-semibold">Código: {item.codigo}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
