import React from 'react';
import styles from './DashboardComponent.module.css';
import StockMovementsList from './MovimentoEstoque';

export default function DashboardSection() {
  return (
    <div className={styles.container}>
      <div className={styles.squareTop}>
        {/* Render your top square component */}
        <p>Top Square Component</p>
      </div>
      <div className={styles.squareBottom}>
        {/* Render your bottom square component */}
        <p>Bottom Square Component</p>
      </div>
      <div className={styles.rectangle}>
        <StockMovementsList></StockMovementsList>
      </div>
    </div>
  );
}
