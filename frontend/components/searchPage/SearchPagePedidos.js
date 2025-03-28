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
    { id: 1, cliente: "Cliente A", data: "2024-03-25", status: "Pendente", valor: "R$ 500,00" },
    { id: 2, cliente: "Cliente B", data: "2024-03-24", status: "Finalizado", valor: "R$ 1200,00" },
    { id: 3, cliente: "Cliente C", data: "2024-03-23", status: "Cancelado", valor: "R$ 320,00" },
    { id: 4, cliente: "Cliente D", data: "2024-03-22", status: "Pendente", valor: "R$ 750,00" },
    { id: 5, cliente: "Cliente E", data: "2024-03-21", status: "Finalizado", valor: "R$ 900,00" },
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
    router.push(`/pedidos/detalhes/${item.id}`);
  };

  // 🔹 Campos que serão exibidos para os pedidos
  const fieldsToDisplay = ["cliente", "data", "status", "valor"];

  return (
    <div className={styles.searchPageContainer}>
      <div className={styles.searchWrapper}>
        <SearchComponent
          keywordPlaceholder="Buscar pedidos..."
          filters={[
            { name: "cliente", label: "Cliente", placeholder: "Digite o nome do cliente" },
            { name: "data", label: "Data", type: "date" },
            { name: "status", label: "Status", options: [
              { value: "Pendente", label: "Pendente" },
              { value: "Finalizado", label: "Finalizado" },
              { value: "Cancelado", label: "Cancelado" },
            ]},
            { name: "id", label: "ID do Pedido", placeholder: "Digite o ID" },
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
