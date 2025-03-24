"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SearchComponent from "@/components/SearchComponent";
import ShowComponent from "@/components/ShowComponent";
import PaginationComponent from "@/components/PaginationComponent";
import styles from "./SearchPageProductos.module.css";

export default function SearchPageProducts() {
  const [results, setResults] = useState([]);
  const [searchParams, setSearchParams] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  // For demonstration, using mock data:
  const mockResults = [
    { id: 1, name: "Produto A", fornecedor: "Fornecedor 1", lote: "Lote 1", filial: "Filial 1", grupo: "Grupo A" },
    { id: 2, name: "Produto B", fornecedor: "Fornecedor 2", lote: "Lote 2", filial: "Filial 1", grupo: "Grupo B" },
    { id: 3, name: "Produto C", fornecedor: "Fornecedor 1", lote: "Lote 3", filial: "Filial 2", grupo: "Grupo A" },
    // ... more products if needed
  ];

  // Simulate data fetching when searchParams or currentPage change
  useEffect(() => {
    // In a real app, replace this with an API call using searchParams & currentPage
    setResults(mockResults);
    setTotalPages(2); // Example value
  }, [searchParams, currentPage]);

  const handleSearch = (params) => {
    setSearchParams((prev) => ({ ...prev, ...params }));
    setCurrentPage(1);
    // In a real scenario, trigger an API call here
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Trigger re-fetching data for the new page if needed
  };

  // When an item is clicked, navigate to its detail page
  const handleItemClick = (item) => {
    router.push(`/produtos/detalhes/${item.id}`);
  };

  return (
    <div className={styles.container}>
      {/* Small Search Component at the Top */}
      <div className={styles.searchWrapper}>
        <SearchComponent
          keywordPlaceholder="Buscar produtos..."
          filters={[
            { name: "fornecedor", label: "Fornecedor", options: [
              { value: "Fornecedor 1", label: "Fornecedor 1" },
              { value: "Fornecedor 2", label: "Fornecedor 2" }
            ]},
            { name: "lote", label: "Lote", placeholder: "Digite lote" },
            { name: "filial", label: "Filial", options: [
              { value: "Filial 1", label: "Filial 1" },
              { value: "Filial 2", label: "Filial 2" }
            ]},
            { name: "id", label: "ID", placeholder: "Digite ID" },
            { name: "grupo", label: "Grupo", options: [
              { value: "Grupo A", label: "Grupo A" },
              { value: "Grupo B", label: "Grupo B" }
            ]}
          ]}
          onSearch={handleSearch}
        />
      </div>

      {/* Show Component fills the remaining space */}
      <div className={styles.showWrapper}>
        <ShowComponent data={results} onItemClick={handleItemClick} />
      </div>

      {/* Pagination Component in a small center-aligned area at the bottom */}
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
