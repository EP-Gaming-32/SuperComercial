import React from 'react';
import styles from './DashboardComponent.module.css';
import StockMovementsList from './MovimentoEstoque';
import AlertaEstoque from './AlertaEstoque';
import PedidosByFilial from './relatorios/PedidosByFilial';

export default function DashboardSection() {

  const mockAlerts = [
    { productName: "Laranja", stock: 5 },
    { productName: "Leite", stock: 3 },
    { productName: "Café", stock: 2 },
    { productName: "Açucar", stock: 10},
    { productName: "Arroz", stock: 4}
    
  ];

  return (
    <div className={styles.container}>
      <div className={styles.squareTop}>
        <AlertaEstoque alerts={mockAlerts}></AlertaEstoque>
      </div>
      <div className={styles.squareBottom}>
        <PedidosByFilial></PedidosByFilial>
      </div>
      <div className={styles.rectangle}>
        <StockMovementsList></StockMovementsList>
      </div>
    </div>
  );
}
