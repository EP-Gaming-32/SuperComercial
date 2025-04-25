import SearchPagePedido from "@/components/searchPage/SearchPagePedido";
import BoxComponent from "@/components/BoxComponent";
import styles from "./pedidos.module.css";

export default function PedidoVisualizarPage() {
  return (
    <div className={styles.container}>
      <BoxComponent>
        <SearchPagePedido />
      </BoxComponent>
    </div>
  );
}
