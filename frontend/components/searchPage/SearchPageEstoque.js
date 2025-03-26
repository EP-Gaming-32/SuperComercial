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

  // Mock data
  const mockResults = [
    { id: 1, item: "Item A", quantidade: 50, local: "Depósito 1", status: "Disponível" },
    { id: 2, item: "Item B", quantidade: 20, local: "Depósito 2", status: "Baixo estoque" },
    { id: 3, item: "Item C", quantidade: 100, local: "Depósito 1", status: "Disponível" },
    { id: 4, item: "Item D", quantidade: 75, local: "Depósito 2", status: "Disponível" },
    { id: 5, item: "Item E", quantidade: 30, local: "Depósito 1", status: "Baixo estoque" },
    { id: 6, item: "Item F", quantidade: 90, local: "Depósito 3", status: "Disponível" },
    { id: 7, item: "Item G", quantidade: 10, local: "Depósito 1", status: "Baixo estoque" },
    { id: 8, item: "Item H", quantidade: 60, local: "Depósito 2", status: "Disponível" },
    { id: 9, item: "Item I", quantidade: 40, local: "Depósito 3", status: "Baixo estoque" },
    { id: 10, item: "Item J", quantidade: 80, local: "Depósito 1", status: "Disponível" },
    { id: 11, item: "Item K", quantidade: 25, local: "Depósito 2", status: "Baixo estoque" },
  ];

  useEffect(() => {
    setResults(mockResults);
    setTotalPages(1);
  }, [searchParams, currentPage]);

  const handleSearch = (params) => {
    setSearchParams((prev) => ({ ...prev, ...params }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemClick = (item) => {
    router.push(`/estoque/detalhes/${item.id}`);
  };

  // Campos que serão exibidos no ShowComponent
  const fieldsToDisplay = ["item", "quantidade", "local", "status"];

  return (
    <div className={styles.container}>
      <div className={styles.searchWrapper}>
        <SearchComponent
          keywordPlaceholder="Buscar no estoque..."
          filters={[
            { name: "local", label: "Local", placeholder: "Digite o local" },
            { name: "status", label: "Status", options: [
              { value: "Disponível", label: "Disponível" },
              { value: "Baixo estoque", label: "Baixo estoque" }
            ]}
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
