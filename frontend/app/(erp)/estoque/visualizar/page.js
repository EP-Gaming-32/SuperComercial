import SearchPageEstoque from "@/components/searchPage/SearchPageEstoque";
import BoxComponent from "@/components/BoxComponent";
import styles from "./visualizar.module.css";

export default function EstoqueVisualizarPage() {
  return (
    <div className={styles.container}>
      <BoxComponent>
        <SearchPageEstoque />
      </BoxComponent>
    </div>
  );
}
