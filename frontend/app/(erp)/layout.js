"use client";

import { usePathname } from "next/navigation";
import VerticalNavbar from "@/components/VerticalNavBar";
import styles from "./layout.module.css";

export default function ErpLayout({ children }) {
  const pathname = usePathname();

  const getNavOptions = () => {
    if (pathname.startsWith("/produtos")) {
      return [
        { text: "Visão Geral", url: "/produtos/dashboard" },
        { text: "Produtos", url: "/produtos/visualizar" },
      ];
    } else if (pathname.startsWith("/estoque")) {
      return [
        { text: "Visão Geral", url: "/estoque/dashboard" },
        { text: "Gerenciar Estoque", url: "/estoque/visualizar" },
      ];
    } else if (pathname.startsWith("/cadastros")) {
      return [
        { text: "Fornecedores", url: "/cadastros/fornecedores" },
        { text: "Lojas/Filiais", url: "/cadastros/filiais" },
        { text: "Funcionarios", url: "/cadastros/funcionarios" },
      ];
    } else if (pathname.startsWith("/pedidos")) {
      return [
        { text: "Pedidos", url: "/pedidos" },
        { text: "Visualizar", url: "/pedidos/visualizar" },
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
        <div className={styles.pageContent}>{children}</div>
      </div>
    </div>
  );
}
