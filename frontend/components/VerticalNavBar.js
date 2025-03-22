import Link from "next/link";
import styles from "./navbar.module.css";

export default function VerticalNavBar() {
  return (
    <nav className={styles.verticalNavbar}>
      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <Link href="/dashboard" className={styles.navLink}>
            Dashboard
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/products" className={styles.navLink}>
            Products
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/stock" className={styles.navLink}>
            Stock
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/orders" className={styles.navLink}>
            Orders
          </Link>
        </li>
      </ul>
    </nav>
  );
}
