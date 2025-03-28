import React from "react";
import styles from "./pedidos.module.css";
import SearchPage from "@/components/searchPage/searchPageProdutos"; // Podemos criar SearchPagePedidos.js se necessário
import PaginationComponent from "@/components/PaginationComponent";
import InputField from "@/components/InputField";

const Pedidos = () => {
  const pedidos = [
    { codigo: "001", fornecedor: "Loja 1", usuario: "Gerente 2", prazo: "10-02", observacao: "TEXTTEXT", status: "Confirmado" },
    { codigo: "002", fornecedor: "Loja 1", usuario: "Gerente 1", prazo: "03-02", observacao: "TEXTTEXT", status: "A caminho" },
    { codigo: "003", fornecedor: "Loja 3", usuario: "Gerente 3", prazo: "05-02", observacao: "TEXTTEXT", status: "A caminho" },
    { codigo: "004", fornecedor: "Loja 2", usuario: "Gerente 2", prazo: "13-05", observacao: "TEXTTEXT", status: "Pendente" },
    { codigo: "005", fornecedor: "Loja 1", usuario: "Gerente 2", prazo: "10-03", observacao: "TEXTTEXT", status: "Confirmado" },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Pedidos</h1>
      
      <div className={styles.topActions}>
        <InputField placeholder="Buscar pedido..." className={styles.searchInput} />
        <button className={styles.novoPedido}>Novo Pedido</button>
      </div>

      <SearchPage data={pedidos} />
      
     
      
      <PaginationComponent />
    </div>
  );
};

export default Pedidos;
