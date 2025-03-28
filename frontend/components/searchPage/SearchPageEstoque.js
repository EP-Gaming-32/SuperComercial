"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SearchComponent from "@/components/SearchComponent";
import ShowComponent from "@/components/ShowComponent";
import PaginationComponent from "@/components/PaginationComponent";
import styles from "./SearchPageProdutos.module.css";

export default function SearchPageEstoque() {
  const [results, setResults] = useState([]);
  const [searchParams, setSearchParams] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  // Updated mock data matching the schema for Estoque
  const mockResults = [
    { id: 1, item: "Item A", quantidade: 50, local_armazenamento: "Depósito 1", status_estoque: "Disponível" },
    { id: 2, item: "Item B", quantidade: 20, local_armazenamento: "Depósito 2", status_estoque: "Baixo estoque" },
    { id: 3, item: "Item C", quantidade: 100, local_armazenamento: "Depósito 1", status_estoque: "Disponível" },
    { id: 4, item: "Item D", quantidade: 75, local_armazenamento: "Depósito 2", status_estoque: "Disponível" },
    { id: 5, item: "Item E", quantidade: 30, local_armazenamento: "Depósito 1", status_estoque: "Baixo estoque" },
    { id: 6, item: "Item F", quantidade: 90, local_armazenamento: "Depósito 3", status_estoque: "Disponível" },
    { id: 7, item: "Item G", quantidade: 10, local_armazenamento: "Depósito 1", status_estoque: "Baixo estoque" },
    { id: 8, item: "Item H", quantidade: 60, local_armazenamento: "Depósito 2", status_estoque: "Disponível" },
    { id: 9, item: "Item I", quantidade: 40, local_armazenamento: "Depósito 3", status_estoque: "Baixo estoque" },
    { id: 10, item: "Item J", quantidade: 80, local_armazenamento: "Depósito 1", status_estoque: "Disponível" },
    { id: 11, item: "Item K", quantidade: 25, local_armazenamento: "Depósito 2", status_estoque: "Baixo estoque" },
  ];

  useEffect(() => {
    // Simulate fetching data (replace with an API call as needed)
    setResults(mockResults);
    setTotalPages(1); // Example value
  }, [searchParams, currentPage]);

  const handleSearch = (params) => {
    setSearchParams((prev) => ({ ...prev, ...params }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => setCurrentPage(page);

  const handleItemClick = (item) => {
    router.push(`/estoque/detalhes/${item.id}`);
  };

  // Define fields to display in each inventory item block
  const fieldsToDisplay = ["item", "quantidade", "local_armazenamento", "status_estoque"];

  return (
    <div className={styles.container}>
      <div className={styles.searchWrapper}>
        <SearchComponent
          keywordPlaceholder="Buscar no estoque..."
          filters={[
            { name: "item", label: "Item", placeholder: "Digite o nome do item" },
            { name: "local_armazenamento", label: "Local de Armazenamento", placeholder: "Digite o local" },
            { name: "status_estoque", label: "Status do Estoque", options: [
              { value: "Disponível", label: "Disponível" },
              { value: "Baixo estoque", label: "Baixo estoque" },
              { value: "Crítico", label: "Crítico" }
            ]},
            { name: "quantidade_min", label: "Quantidade Mínima", type: "number", placeholder: "Mínimo" },
            { name: "quantidade_max", label: "Quantidade Máxima", type: "number", placeholder: "Máximo" },
          ]}
          onSearch={handleSearch}
        />
      </div>

      <div className={styles.showWrapper}>
        <ShowComponent
          data={results}
          fields={fieldsToDisplay}
          onItemClick={handleItemClick}
        />
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
