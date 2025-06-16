// components/VerticalNavBar/VerticalNavBar.js
"use client"; // Mantenha isso, pois usamos hooks de cliente

import Link from "next/link";
import { useState, useEffect } from "react"; // Importe useEffect
import { usePathname } from "next/navigation"; // Importe usePathname
import styles from "./navbar.module.css";

export default function VerticalNavBar() {
  const [openCadastros, setOpenCadastros] = useState(false);
  const pathname = usePathname(); // Obtém o caminho da URL atual

  const toggleCadastros = () => {
    setOpenCadastros(!openCadastros);
  };

  // Determina se "Cadastros" deve estar ativo ou aberto
  const isCadastrosActive =
    pathname.startsWith("/fornecedores") ||
    pathname.startsWith("/filial") ||
    pathname.startsWith("/produtos") ||
    pathname.startsWith("/grupos");

  // UseEffect para abrir "Cadastros" se um item filho estiver ativo
  useEffect(() => {
    if (isCadastrosActive && !openCadastros) {
      setOpenCadastros(true);
    }
  }, [isCadastrosActive, openCadastros]);

  // Função auxiliar para verificar se o link atual está ativo
  const isActive = (href) => {
    // Para rotas exatas (como /home, /relatorios)
    if (pathname === href) {
      return true;
    }
    // Para rotas base (como /estoque/visualizar ou /pedido/visualizar)
    // Verifica se o caminho atual começa com o href do link.
    // Isso é útil para quando você tem sub-rotas (ex: /estoque/detalhes/1)
    // e quer que o link principal /estoque/visualizar continue ativo.
    if (href !== "/" && pathname.startsWith(href)) {
        return true;
    }
    // Caso especial para a home ('/')
    if (href === '/' && pathname === '/') {
        return true;
    }
    return false;
  };

  return (
    <nav className={styles.verticalNavbar}>
      <ul className={styles.navList}>
        {/* ===== LINHA ALTERADA ===== */}
        <button className={styles.brand}>
          Super<span className={styles.brandHighlight}>Comercial</span>
        </button>

        <li className={styles.navItem}>
          <Link
            href="/home"
            className={`${styles.navLink} ${isActive("/home") ? styles.activeNavLink : ""}`}
          >
            Home
          </Link>
        </li>

        {/* Dropdown Cadastros */}
        <li className={styles.navItem}>
          <div
            className={`${styles.navLink} ${isCadastrosActive ? styles.activeNavLink : ""}`}
            onClick={toggleCadastros}
            style={{ cursor: "pointer" }}
          >
            Cadastros {openCadastros ? "▲" : "▼"}
          </div>
          {openCadastros && (
            <ul className={styles.subMenu}>
              <li>
                <Link
                  href="/fornecedores/visualizar"
                  className={`${styles.navLink} ${isActive("/fornecedores/visualizar") ? styles.activeNavLink : ""}`}
                >
                  Fornecedores
                </Link>
              </li>
              <li>
                <Link
                  href="/filial/visualizar"
                  className={`${styles.navLink} ${isActive("/filial/visualizar") ? styles.activeNavLink : ""}`}
                >
                  Filial
                </Link>
              </li>
              <li>
                <Link
                  href="/produtos/visualizar"
                  className={`${styles.navLink} ${isActive("/produtos/visualizar") ? styles.activeNavLink : ""}`}
                >
                  Produtos
                </Link>
              </li>
              <li>
                <Link
                  href="/grupos/visualizar"
                  className={`${styles.navLink} ${isActive("/grupos/visualizar") ? styles.activeNavLink : ""}`}
                >
                  Grupos
                </Link>
              </li>
            </ul>
          )}
        </li>

        <li className={styles.navItem}>
          <Link
            href="/estoque/visualizar"
            className={`${styles.navLink} ${isActive("/estoque/visualizar") ? styles.activeNavLink : ""}`}
          >
            Estoque
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link
            href="/pedido/visualizar"
            className={`${styles.navLink} ${isActive("/pedido/visualizar") ? styles.activeNavLink : ""}`}
          >
            Pedidos de Reposição
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link
            href="/ordem-compra/visualizar"
            className={`${styles.navLink} ${isActive("/ordem-compra/visualizar") ? styles.activeNavLink : ""}`}
          >
            Ordens de Compra
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link
            href="/movimentacao-estoque/visualizar"
            className={`${styles.navLink} ${isActive("/movimentacao-estoque/visualizar") ? styles.activeNavLink : ""}`}
          >
            Movimentação de Estoque
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link
            href="/relatorios"
            className={`${styles.navLink} ${isActive("/relatorios") ? styles.activeNavLink : ""}`}
          >
            Relatórios
          </Link>
        </li>
      </ul>
    </nav>
  );
}