// components/Card.js
import React from "react";
import styles from "./ModernCard.module.css";

export default function Card({ title, children, icon, subtitle }) {
  return (
    <div className={styles.modernCard}>
      {title && (
        <div className={styles.cardHeader}>
          <div className={styles.titleSection}>
            {icon && <div className={styles.cardIcon}>{icon}</div>}
            <div>
              <h3 className={styles.cardTitle}>{title}</h3>
              {subtitle && <p className={styles.cardSubtitle}>{subtitle}</p>}
            </div>
          </div>
        </div>
      )}
      <div className={styles.cardContent}>{children}</div>
    </div>
  );
}

