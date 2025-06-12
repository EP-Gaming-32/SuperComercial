"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SearchComponent from "@/components/SearchComponent";
import ShowComponent from "@/components/ShowComponent";
import PaginationComponent from "@/components/PaginationComponent";
import { useSearch } from "./hooks/useSearch";

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
    console.log("[SearchPage] handleSearch recebeu params:", params);
    setSearchParams(params);
    setPage(1);
  };

  const handleDetail = (item) => {
    console.debug('[SearchPage] Navigating to detail for:', item[idField]);
    router.push(`${detailRoute}/${item[idField]}`);
  };

  const handlePageChange = (newPage) => {
    console.debug('[SearchPage] Changing to page:', newPage);
    setPage(newPage);
  };

  return (
    <div>
      {title && <h1>{title}</h1>}

      <SearchComponent
        keywordName={keywordName}
        keywordPlaceholder={keywordPlaceholder}
        filters={filters}
        onSearch={handleSearch}
        addButton
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