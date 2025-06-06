import SearchPageProdutos from "@/components/searchPage/SearchPageProdutos";
import BoxComponent from "@/components/BoxComponent";
import styles from "./visualizar.module.css";

export default function ProdutosVisualizarPage() {
  return (
    <div className={styles.container}>
      <BoxComponent>
        <SearchPageProdutos />
      </BoxComponent>
    </div>
  );
}
