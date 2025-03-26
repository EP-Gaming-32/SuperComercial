"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SearchComponent from "@/components/SearchComponent";
import ShowComponent from "@/components/ShowComponent";
import PaginationComponent from "@/components/PaginationComponent";
import styles from "./SearchPageProdutos.module.css";

export default function SearchPageProdutos() {
  const [results, setResults] = useState([]);
  const [searchParams, setSearchParams] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  // Example mock data with 14 items (each with several fields)
  const mockResults = [
    { id: 1, name: "Produto A", fornecedor: "Fornecedor 1", lote: "Lote 1", filial: "Filial 1", grupo: "Grupo A" },
    { id: 2, name: "Produto B", fornecedor: "Fornecedor 2", lote: "Lote 2", filial: "Filial 1", grupo: "Grupo B" },
    { id: 3, name: "Produto C", fornecedor: "Fornecedor 1", lote: "Lote 3", filial: "Filial 2", grupo: "Grupo A" },
    { id: 4, name: "Produto D", fornecedor: "Fornecedor 1", lote: "Lote 1", filial: "Filial 1", grupo: "Grupo A" },
    { id: 5, name: "Produto E", fornecedor: "Fornecedor 2", lote: "Lote 2", filial: "Filial 1", grupo: "Grupo B" },
    { id: 6, name: "Produto F", fornecedor: "Fornecedor 1", lote: "Lote 3", filial: "Filial 2", grupo: "Grupo A" },
    { id: 7, name: "Produto G", fornecedor: "Fornecedor 1", lote: "Lote 1", filial: "Filial 1", grupo: "Grupo A" },
    { id: 8, name: "Produto H", fornecedor: "Fornecedor 2", lote: "Lote 2", filial: "Filial 1", grupo: "Grupo B" },
    { id: 9, name: "Produto I", fornecedor: "Fornecedor 1", lote: "Lote 3", filial: "Filial 2", grupo: "Grupo A" },
    { id: 10, name: "Produto J", fornecedor: "Fornecedor 1", lote: "Lote 1", filial: "Filial 1", grupo: "Grupo A" },
    { id: 11, name: "Produto K", fornecedor: "Fornecedor 2", lote: "Lote 2", filial: "Filial 1", grupo: "Grupo B" },
  ];

  useEffect(() => {
    // Simulate fetching data (replace with actual API call as needed)
    setResults(mockResults);
    setTotalPages(2);
  }, [searchParams, currentPage]);

  const handleSearch = (params) => {
    setSearchParams((prev) => ({ ...prev, ...params }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => setCurrentPage(page);

  const handleItemClick = (item) => {
    router.push(`/produtos/detalhes/${item.id}`);
  };

  // Specify which fields to display as blocks for each product item.
  const fieldsToDisplay = ["name", "fornecedor", "lote", "filial", "grupo"];

  return (
    <div className={styles.searchPageContainer}>
      <div className={styles.searchWrapper}>
        <SearchComponent
          keywordPlaceholder="Buscar produtos..."
          filters={[
            { name: "fornecedor", label: "Fornecedor", options: [
              { value: "Fornecedor 1", label: "Fornecedor 1" },
              { value: "Fornecedor 2", label: "Fornecedor 2" },
            ]},
            { name: "lote", label: "Lote", placeholder: "Digite lote" },
            { name: "filial", label: "Filial", options: [
              { value: "Filial 1", label: "Filial 1" },
              { value: "Filial 2", label: "Filial 2" },
            ]},
            { name: "id", label: "ID", placeholder: "Digite ID" },
            { name: "grupo", label: "Grupo", options: [
              { value: "Grupo A", label: "Grupo A" },
              { value: "Grupo B", label: "Grupo B" },
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
