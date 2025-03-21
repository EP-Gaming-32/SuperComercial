"use client";

import Link from "next/link";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <nav>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <Link href="/dashboard">Dashboard</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/products">Produtos</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/stock">Estoque</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/reports">Relatórios</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/settings">Configurações</Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
