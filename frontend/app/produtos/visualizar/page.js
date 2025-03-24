// app/produtos/visualizar/page.js
import SearchPageProdutos from "@/components/searchPage/searchPageProdutos";
import styles from "./visualizar.module.css";

export default function ProdutosVisualizarPage() {
  return (
    <div className={styles.container}>
      <SearchPageProdutos />
    </div>
  );
}
