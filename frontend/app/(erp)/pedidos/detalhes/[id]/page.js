import React from "react";
import styles from "./detalhes.module.css";
import SearchPagePedidos from "@/components/searchPage/SearchPagePedidos";
import BoxComponent from "@/components/BoxComponent";

export default function PedidosPage() {
  return (
    <div className={styles.container}>
      <BoxComponent>
        <SearchPagePedidos />
      </BoxComponent>
    </div>
  );
}
