import Link from "next/link";
import styles from "./navbar.module.css";

export default function HorizontalNavBar({ options = [] }) {
  return (
    <nav className={styles.horizontalNavbar}>
      <ul className={styles.navList}>
        {options.map((option, idx) => (
          <li key={idx} className={styles.navItem}>
            <Link href={option.url} className={styles.navLink}>
              {option.text}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}