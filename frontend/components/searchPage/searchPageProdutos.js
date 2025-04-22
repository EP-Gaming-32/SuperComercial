'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import SearchComponent from "@/components/SearchComponent";
import ShowComponent from "@/components/ShowComponent";
import PaginationComponent from "@/components/PaginationComponent";
import { useProdutos } from "./useProdutos";
import styles from "./SearchPageProdutos.module.css";

export default function SearchPageProdutos() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  // Usa o hook que criamos
  const { data: results, totalPages, loading, error } = useProdutos({
    page: currentPage,
    limit: 10,
    filters: searchParams
  });

  const handleSearch = (params) => {
    setSearchParams(params);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => setCurrentPage(page);

  const handleItemClick = (item) => {
    router.push(`/produtos/detalhes/${item.id_produto}`);
  };

  return (
    <div className={styles.searchPageContainer}>
      <SearchComponent
        keywordPlaceholder="Buscar produtos..."
        filters={[
          { name: "categoria", label: "Categoria", type: "select", options: [
            { value: "Eletrônicos", label: "Eletrônicos" },
            { value: "Roupas", label: "Roupas" },
            { value: "Alimentos", label: "Alimentos" }
          ]},
          { name: "sku", label: "Código SKU", placeholder: "Digite SKU" },
          { name: "preco_min", label: "Preço Mínimo", type: "number" },
          { name: "preco_max", label: "Preço Máximo", type: "number" },
          { name: "fornecedor", label: "Fornecedor", placeholder: "Digite nome do fornecedor" },
          { name: "ativo", label: "Status", type: "select", options: [
            { value: "true", label: "Ativo" },
            { value: "false", label: "Inativo" }
          ]},
          { name: "data_cadastro", label: "Data de Cadastro", type: "date" }
        ]}
        onSearch={handleSearch}
      />

      {loading && <p>Carregando...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && (
        <>
          {results.length > 0 ? (
            <ShowComponent
              data={results}
              fields={["nome_produto","categoria","sku","valor_produto","fornecedor","ativo"]}
              onItemClick={handleItemClick}
            />
          ) : (
            <p>Nenhum produto encontrado.</p>
          )}

          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}