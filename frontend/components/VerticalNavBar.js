// components/VerticalNavBar/VerticalNavBar.js

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import styles from "./navbar.module.css";

export default function VerticalNavBar() {
  const [openCadastros, setOpenCadastros] = useState(false);
  const pathname = usePathname();

  // Função para alternar o dropdown Cadastros (manual)
  const toggleCadastros = () => {
    setOpenCadastros(!openCadastros);
  };

  // Determina se "Cadastros" deve ser considerado "ativo" (se qualquer sub-item for ativo)
  const isCadastrosActive =
    pathname.startsWith("/fornecedores") ||
    pathname.startsWith("/filial") ||
    pathname.startsWith("/produtos") ||
    pathname.startsWith("/grupos");

  // --- LÓGICA CORRIGIDA PARA ABRIR/FECHAR O DROPDOWN "CADASTROS" AUTOMATICAMENTE ---
  useEffect(() => {
    // Se a rota atual está sob "Cadastros", garante que o dropdown esteja aberto
    if (isCadastrosActive) {
      setOpenCadastros(true);
    }
    // Se a rota atual NÃO está sob "Cadastros", fecha o dropdown
    else {
      setOpenCadastros(false);
    }
  }, [isCadastrosActive, pathname]);

  // Função auxiliar para verificar se o link atual está ativo
  const isActive = (href) => {
    // Para rotas exatas (como /home, /relatorios)
    if (pathname === href) {
      return true;
    }
    // Para rotas base (ex: /estoque/visualizar)
    // Verifica se o caminho atual começa com o href do link.
    // Isso é útil para quando você tem sub-rotas (ex: /estoque/detalhes/1)
    // e quer que o link principal continue ativo.
    // Adicionado `!['/home', '/cadastros', '/relatorios'].includes(href)` para evitar falsos positivos em links genéricos.
    if (href !== "/" && pathname.startsWith(href) && !['/home', '/relatorios'].includes(href) && !isCadastrosActive) {
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
      {/* Adicionado flex-grow: 1 para o navList no CSS para empurrar o footer para baixo */}
      <ul className={styles.navList}>
        <li className={styles.brandContainer}>
          <Link href="/home" className={styles.brand}>
            Super<span className={styles.brandHighlight}>Comercial</span>
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

        {/* Links de navegação principais */}
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

      {/* NOVO: Footer da Navbar */}
      <div className={styles.navbarFooter}>
        <span>&copy;</span> Todos os direitos reservados a Adam, Eduardo, Gabriel, Guilherme, Leonardo, Rafael.
      </div>
    </nav>
  );
}