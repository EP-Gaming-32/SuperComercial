import VerticalNavbar from "@/components/VerticalNavBar";
import HorizontalNavbar from "@/components/HorizontalNavBar";
import styles from "./layout.module.css";

export default function ProdutosLayout({ children }) {
  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <VerticalNavbar />
      </div>
      <div className={styles.mainContent}>
        <div className={styles.topNav}>
          <HorizontalNavbar position="top" />
        </div>
        <div className={styles.pageContent}>
          {children}
        </div>
      </div>
    </div>
  );
}
