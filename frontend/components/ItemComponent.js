import React from "react";
import styles from "./ItemComponent.module.css";

function ItemComponent({ item, fields, onClick }) {
  return (
    <div className={styles.itemBlock} onClick={() => onClick(item)}>
      {fields.map(f => (
        <div key={f} className={styles.fieldBlock}>
          <span className={styles.fieldLabel}>{f}:</span>
          <span className={styles.fieldValue}>{item[f]}</span>
        </div>
      ))}
    </div>
  );
}

export default React.memo(ItemComponent);
