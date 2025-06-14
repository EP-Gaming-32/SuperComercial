"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./navbar.module.css";

export default function VerticalNavBar() {
  const [openCadastros, setOpenCadastros] = useState(false);

  const toggleCadastros = () => {
    setOpenCadastros(!openCadastros);
  };

  return (
    <nav className={styles.verticalNavbar}>
      <ul className={styles.navList}>
        <button className={styles.brand}>SuperComercial</button>

        <li className={styles.navItem}>
          <Link href="/home" className={styles.navLink}>
            Home
          </Link>
        </li>

        {/* Dropdown Cadastros */}
        <li className={styles.navItem}>
          <div
            className={styles.navLink}
            onClick={toggleCadastros}
            style={{ cursor: "pointer" }}
          >
            Cadastros {openCadastros ? "▲" : "▼"}
          </div>
          {openCadastros && (
            <ul className={styles.subMenu}>
              <li>
                <Link href="/fornecedores/visualizar" className={styles.navLink}>
                  Fornecedores
                </Link>
              </li>
              <li>
                <Link href="/filial/visualizar" className={styles.navLink}>
                  Filial
                </Link>
              </li>
              <li>
                <Link href="/produtos/visualizar" className={styles.navLink}>
                  Produtos
                </Link>
              </li>
              <li>
                <Link href="/grupos/visualizar" className={styles.navLink}>
                  Grupos
                </Link>
              </li>
            </ul>
          )}
        </li>

        <li className={styles.navItem}>
          <Link href="/estoque/visualizar" className={styles.navLink}>
            Estoque
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/pedido/visualizar" className={styles.navLink}>
            Pedidos de Reposição
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/ordem-compra/visualizar" className={styles.navLink}>
            Ordens de Compra
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/movimentacao-estoque/visualizar" className={styles.navLink}>
            Movimentação de Estoque
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/relatorios" className={styles.navLink}>
            Relatórios
          </Link>
        </li>
      </ul>
    </nav>
  );
}
