import VerticalNavbar from "@/components/VerticalNavBar";
import HorizontalNavbar from "@/components/HorizontalNavBar";
import styles from "./layout.module.css";

export default function ProdutosLayout({ children }) {
  // opções da navbar horizontal
  const navOptions = [
    { text: "Visão Geral", url: "/produtos/dashboard" },
    { text: "Produtos", url: "/produtos/visualizar" },
    { text: "Relatórios", url: "/produtos/relatorios" },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <VerticalNavbar />
      </div>
      <div className={styles.mainContent}>
        <div className={styles.topNav}>
          <HorizontalNavbar options={navOptions} />
        </div>
        <div className={styles.pageContent}>
          {children}
        </div>
      </div>
    </div>
  );
}

