// components/searchPage/SearchPage.js
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SearchComponent from "@/components/SearchComponent"; // Caminho do seu componente SearchComponent
import ShowComponent from "@/components/ShowComponent"; // Caminho do seu componente ShowComponent
import PaginationComponent from "@/components/PaginationComponent"; // Caminho do seu componente PaginationComponent
import { useSearch } from "../../hooks/useSearch"; // Caminho do seu hook useSearch

export default function SearchPage({
  title,
  endpoint,
  hookParams = {},
  filters,
  keywordName,
  keywordPlaceholder,
  detailRoute,
  idField,
  showFields,
  addButtonUrl,
  addButtonLabel,
}) {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState({});
  const [page, setPage] = useState(1);

  const { data: results, totalPages, loading, error } = useSearch({
    endpoint,
    page,
    ...hookParams,
    filters: searchParams,
  });

  const handleSearch = (params) => {
    // ===============================================
    // ADICIONADO: CONSOLE.LOG PARA DEPURAR AQUI
    // ===============================================
    console.log('[SearchPage] Parâmetros recebidos para useSearch:', params);
    setSearchParams(params);
    setPage(1); // Resetar para a primeira página em uma nova busca
  };

  const handleDetail = (item) => {
    router.push(`${detailRoute}/${item[idField]}`);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div>
      {title && <h1>{title}</h1>}

      <SearchComponent
        keywordName={keywordName}
        keywordPlaceholder={keywordPlaceholder}
        filters={filters}
        onSearch={handleSearch} // Passa o handler de busca para SearchComponent
        addButton // shorthand para addButton={true}
        addButtonLabel={addButtonLabel}
        addButtonUrl={addButtonUrl}
      />

      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <>
          {results.length > 0 ? (
            <ShowComponent
              data={results}
              fields={showFields}
              onItemClick={handleDetail}
              endpoint={endpoint}
              idField={idField}
            />
          ) : (
            <p>Nenhum item encontrado.</p>
          )}

          <PaginationComponent
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}