"use client";
import { useState } from "react";
import styles from "./registrar.module.css";

export default function AdicionarPedido() {
  // Lista de produtos com detalhes
  const produtos = [
    { 
      nome: "Banana", 
      fornecedores: ["Fornecedor A", "Fornecedor B"], 
      lotes: ["Lote 123", "Lote 456"], 
      filiais: ["Filial Norte", "Filial Sul"], 
      grupos: ["Frutas", "Orgânicos"]
    },
    { 
      nome: "Maçã", 
      fornecedores: ["Fornecedor X", "Fornecedor Y"], 
      lotes: ["Lote 789", "Lote 101"], 
      filiais: ["Filial Leste", "Filial Oeste"], 
      grupos: ["Frutas", "Importados"]
    },
    { 
      nome: "Cereais", 
      fornecedores: ["Fornecedor Cereal Ltda"], 
      lotes: ["Lote 202", "Lote 303"], 
      filiais: ["Filial Central"], 
      grupos: ["Alimentos", "Secos"]
    }
  ];

  // Estados para os campos do formulário
  const [search, setSearch] = useState("");
  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState("");
  const [loteSelecionado, setLoteSelecionado] = useState("");
  const [filialSelecionada, setFilialSelecionada] = useState("");
  const [grupoSelecionado, setGrupoSelecionado] = useState("");

  // Filtra produtos baseados no input do usuário
  const produtosFiltrados = produtos.filter((produto) =>
    produto.nome.toLowerCase().includes(search.toLowerCase())
  );

  // Busca detalhes do produto selecionado
  const produtoDetalhes = produtos.find((p) => p.nome === produtoSelecionado);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Adicionar Pedido</h1>

      {/* Campo de busca */}
      <label className={styles.label}>Buscar Produto:</label>
      <input
        type="text"
        className={styles.input}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Digite o nome do produto..."
      />
      {search && (
        <ul className={styles.suggestions}>
          {produtosFiltrados.map((produto) => (
            <li
              key={produto.nome}
              onClick={() => {
                setProdutoSelecionado(produto.nome);
                setSearch("");
              }}
            >
              {produto.nome}
            </li>
          ))}
        </ul>
      )}

      {/* Dropdown para selecionar o produto */}
      <label className={styles.label}>Produto:</label>
      <select
        className={styles.input}
        value={produtoSelecionado}
        onChange={(e) => setProdutoSelecionado(e.target.value)}
      >
        <option value="">Selecione um produto</option>
        {produtos.map((produto) => (
          <option key={produto.nome} value={produto.nome}>
            {produto.nome}
          </option>
        ))}
      </select>

      {/* Se um produto foi selecionado, exibe os campos adicionais */}
      {produtoSelecionado && produtoDetalhes && (
        <>
          <label className={styles.label}>Fornecedor:</label>
          <select
            className={styles.input}
            value={fornecedorSelecionado}
            onChange={(e) => setFornecedorSelecionado(e.target.value)}
          >
            <option value="">Selecione um fornecedor</option>
            {produtoDetalhes.fornecedores.map((fornecedor, index) => (
              <option key={index} value={fornecedor}>
                {fornecedor}
              </option>
            ))}
          </select>

          <label className={styles.label}>Lote:</label>
          <select
            className={styles.input}
            value={loteSelecionado}
            onChange={(e) => setLoteSelecionado(e.target.value)}
          >
            <option value="">Selecione um lote</option>
            {produtoDetalhes.lotes.map((lote, index) => (
              <option key={index} value={lote}>
                {lote}
              </option>
            ))}
          </select>

          <label className={styles.label}>Filial:</label>
          <select
            className={styles.input}
            value={filialSelecionada}
            onChange={(e) => setFilialSelecionada(e.target.value)}
          >
            <option value="">Selecione uma filial</option>
            {produtoDetalhes.filiais.map((filial, index) => (
              <option key={index} value={filial}>
                {filial}
              </option>
            ))}
          </select>

          <label className={styles.label}>Grupo:</label>
          <select
            className={styles.input}
            value={grupoSelecionado}
            onChange={(e) => setGrupoSelecionado(e.target.value)}
          >
            <option value="">Selecione um grupo</option>
            {produtoDetalhes.grupos.map((grupo, index) => (
              <option key={index} value={grupo}>
                {grupo}
              </option>
            ))}
          </select>
        </>
      )}

      {/* Botão de envio */}
      <button className={styles.button} disabled={!produtoSelecionado}>
        Adicionar Pedido
      </button>
    </div>
  );
}
