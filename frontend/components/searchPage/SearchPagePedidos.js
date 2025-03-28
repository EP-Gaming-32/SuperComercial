"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SearchComponent from "@/components/SearchComponent";
import ShowComponent from "@/components/ShowComponent";
import PaginationComponent from "@/components/PaginationComponent";
import styles from "./SearchPageProdutos.module.css";

export default function SearchPagePedidos() {
  const [results, setResults] = useState([]);
  const [searchParams, setSearchParams] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  // 🔹 Mock de dados para pedidos (substitua por API real)
  const mockResults = [
    { codigo: "001", fornecedor: "Loja 1", usuario: "Gerente 2", prazo: "10-02", observacao: "TEXTTEXT", status: "Confirmado" },
    { codigo: "002", fornecedor: "Loja 1", usuario: "Gerente 1", prazo: "03-02", observacao: "TEXTTEXT", status: "A caminho" },
    { codigo: "003", fornecedor: "Loja 3", usuario: "Gerente 3", prazo: "05-02", observacao: "TEXTTEXT", status: "A caminho" },
    { codigo: "004", fornecedor: "Loja 2", usuario: "Gerente 2", prazo: "13-05", observacao: "TEXTTEXT", status: "Pendente" },
    { codigo: "005", fornecedor: "Loja 1", usuario: "Gerente 2", prazo: "10-03", observacao: "TEXTTEXT", status: "Confirmado" },
  ];

  useEffect(() => {
    // Simular requisição de API (substituir quando houver backend)
    setResults(mockResults);
    setTotalPages(1);
  }, [searchParams, currentPage]);

  const handleSearch = (params) => {
    setSearchParams((prev) => ({ ...prev, ...params }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => setCurrentPage(page);

  const handleItemClick = (item) => {
    router.push(`/pedidos/detalhes/${item.codigo}`);
  };

  // 🔹 Campos que serão exibidos na listagem de pedidos
  const fieldsToDisplay = ["codigo", "fornecedor", "usuario", "prazo", "status"];

  return (
    <div className={styles.searchPageContainer}>
      <div className={styles.searchWrapper}>
        <SearchComponent
          keywordPlaceholder="Buscar pedidos..."
          filters={[
            { name: "codigo", label: "Código", placeholder: "Digite o código do pedido" },
            { name: "fornecedor", label: "Fornecedor", placeholder: "Nome do fornecedor" },
            { name: "usuario", label: "Usuário responsável", placeholder: "Nome do usuário" },
            { name: "prazo", label: "Prazo", type: "date" },
            { name: "status", label: "Status", options: [
              { value: "Pendente", label: "Pendente" },
              { value: "A caminho", label: "A caminho" },
              { value: "Confirmado", label: "Confirmado" },
            ]},
          ]}
          onSearch={handleSearch}
        />
      </div>

      <div className={styles.showWrapper}>
        <ShowComponent data={results} fields={fieldsToDisplay} onItemClick={handleItemClick} />
      </div>

      <div className={styles.paginationWrapper}>
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
