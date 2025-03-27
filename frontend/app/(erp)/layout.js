"use client";

import { usePathname } from "next/navigation";
import VerticalNavbar from "@/components/VerticalNavBar";
import HorizontalNavbar from "@/components/HorizontalNavBar";
import styles from "./layout.module.css";

export default function ErpLayout({ children }) {
  const pathname = usePathname();

  // Define navbar options based on the current section
  const getNavOptions = () => {
    if (pathname.startsWith("/produtos")) {
      return [
        { text: "Visão Geral", url: "/produtos/dashboard" },
        { text: "Produtos", url: "/produtos/visualizar" },
        { text: "Relatórios", url: "/produtos/relatorios" },
      ];
    } else if (pathname.startsWith("/estoque")) {
      return [
        { text: "Visão Geral", url: "/estoque/dashboard" },
        { text: "Gerenciar Estoque", url: "/estoque/visualizar" },
        { text: "Relatórios", url: "/estoque/relatorios" },
      ];
    } else if (pathname.startsWith("/cadastros")) {
      return [
        { text: "Fornecedores", url: "/cadastros/fornecedores" },
        { text: "Lojas/Filiais", url: "/cadastros/filiais" },
        { text: "Funcionarios", url: "/cadastros/funcionarios" },
      ];
    }
    return [];
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <VerticalNavbar />
      </div>
      <div className={styles.mainContent}>
        <div className={styles.topNav}>
          <HorizontalNavbar options={getNavOptions()} />
        </div>
        <div className={styles.pageContent}>{children}</div>
      </div>
    </div>
  );
}
