"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SearchComponent from "@/components/SearchComponent";
import ShowComponent from "@/components/ShowComponent";
import PaginationComponent from "@/components/PaginationComponent";
import styles from "./SearchPageProdutos.module.css";

export default function SearchPageProdutos() {
  const [results, setResults] = useState([]);
  const [searchParams, setSearchParams] = useState({
    categoria: "",
    sku: "",
    preco_min: "",
    preco_max: "",
    fornecedor: "",
    ativo: "",
    data_cadastro: ""
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  // Mock data aligned with new schema
  const mockResults = [
    { id: 1, nome: "Notebook Dell Inspiron", categoria: "Eletrônicos", sku: "DELL-12345", preco: 4500.00, fornecedor: "Dell Brasil", ativo: "Sim", data_cadastro: "2024-01-10" },
    { id: 2, nome: "Camiseta Polo", categoria: "Roupas", sku: "CAM-POLO-567", preco: 89.90, fornecedor: "Roupas S.A.", ativo: "Sim", data_cadastro: "2023-12-15" },
    { id: 3, nome: "Smartphone Samsung Galaxy", categoria: "Eletrônicos", sku: "SAMSUNG-GALAXY", preco: 3500.00, fornecedor: "Samsung Brasil", ativo: "Não", data_cadastro: "2023-11-20" },
    { id: 4, nome: "Pasta de Amendoim Integral", categoria: "Alimentos", sku: "PASTA-AMENDOIM", preco: 25.00, fornecedor: "Natural Foods Ltda", ativo: "Sim", data_cadastro: "2024-02-05" },
    { id: 5, nome: "Fone de Ouvido JBL", categoria: "Eletrônicos", sku: "JBL-HEADPHONE", preco: 299.90, fornecedor: "JBL", ativo: "Sim", data_cadastro: "2023-08-23" },
    { id: 6, nome: "Jaqueta de Couro", categoria: "Roupas", sku: "JAQUETA-COURO-123", preco: 499.99, fornecedor: "Moda Premium", ativo: "Não", data_cadastro: "2023-10-11" },
    { id: 7, nome: "Cafeteira Elétrica", categoria: "Eletrodomésticos", sku: "CAFE-1234", preco: 180.00, fornecedor: "Café Express", ativo: "Sim", data_cadastro: "2024-03-01" },
    { id: 8, nome: "Tênis Nike Air", categoria: "Roupas", sku: "NIKE-AIR-567", preco: 399.90, fornecedor: "Nike", ativo: "Sim", data_cadastro: "2023-09-09" },
    { id: 9, nome: "Lâmpada LED 10W", categoria: "Eletrodomésticos", sku: "LAM-LED-10W", preco: 15.00, fornecedor: "Ilumina", ativo: "Sim", data_cadastro: "2024-02-10" },
    { id: 10, nome: "Cadeira Ergonomica", categoria: "Móveis", sku: "CADEIRA-ERGON", preco: 799.90, fornecedor: "ErgoDesign", ativo: "Sim", data_cadastro: "2023-12-01" },
    { id: 11, nome: "Câmera de Segurança 4K", categoria: "Eletrônicos", sku: "CAM-4K", preco: 799.00, fornecedor: "SecurityPlus", ativo: "Sim", data_cadastro: "2024-01-21" },
    { id: 12, nome: "Blender Vitamix", categoria: "Eletrodomésticos", sku: "BLENDER-VITAMIX", preco: 1299.99, fornecedor: "Vitamix", ativo: "Não", data_cadastro: "2023-11-29" }
  ];
  useEffect(() => {
    // Simulate fetching data (replace with API call)
    setResults(mockResults);
    setTotalPages(1);
  }, [searchParams, currentPage]);

  const handleSearch = (params) => {
    setSearchParams((prev) => ({
      ...prev,
      ...params,
      ativo: params.ativo !== undefined ? String(params.ativo) : ""
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => setCurrentPage(page);

  const handleItemClick = (item) => {
    router.push(`/produtos/detalhes/${item.id}`);
  };

  // Fields to display for each product
  const fieldsToDisplay = ["nome", "categoria", "sku", "preco", "fornecedor", "ativo"];

  return (
    <div className={styles.searchPageContainer}>
      <div className={styles.searchWrapper}>
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
