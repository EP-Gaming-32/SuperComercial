import Link from "next/link";
import styles from "./navbar.module.css";

export default function VerticalNavBar() {
  return (
    <nav className={styles.verticalNavbar}>
      <ul className={styles.navList}>
        <button>SuperComercial</button>
        <li className={styles.navItem}>
          <Link href="/home" className={styles.navLink}>
            Home
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/cadastros/fornecedores" className={styles.navLink}>
            Cadastros
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/produtos/dashboard" className={styles.navLink}>
            Produtos
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/estoque/dashboard" className={styles.navLink}>
            Estoque
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/pedidos/dashboard" className={styles.navLink}>
            Ordens de Compras
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/relatorios" className={styles.navLink}>
            Relatorios
          </Link>
        </li>
      </ul>
    </nav>
  );
}
