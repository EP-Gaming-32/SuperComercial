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
          <Link href="/fornecedores/visualizar" className={styles.navLink}>
            Fornecedores
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/filial/visualizar" className={styles.navLink}>
            Filial
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/lotes/visualizar" className={styles.navLink}>
            Lotes
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/produtos/visualizar" className={styles.navLink}>
            Produtos
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/estoque/visualizar" className={styles.navLink}>
            Estoque
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/pedido/visualizar" className={styles.navLink}>
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
