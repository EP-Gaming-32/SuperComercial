import Link from "next/link";
import styles from "./navbar.module.css";

export default function HorizontalNavBar() {
  return (
    <nav className={styles.horizontalNavbar}>
      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <Link href="/produtos" className={styles.navLink}>
            Produtos
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/estoque" className={styles.navLink}>
            Estoque
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/pedidos" className={styles.navLink}>
            Pedidos
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/clientes" className={styles.navLink}>
            Clientes
          </Link>
        </li>
      </ul>
    </nav>
  );
}
