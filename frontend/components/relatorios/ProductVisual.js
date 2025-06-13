"use client";
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import styles from "./Visuals.module.css";

export default function ProductVisual() {
  const [data, setData] = useState([]);
  const [dataOriginal, setDataOriginal] = useState([]);
  const [filialSelecionada, setFilialSelecionada] = useState("");
  const [filiais, setFiliais] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todos");

  const categorias = ["Todos", "Bebidas", "Laticínios", "Snacks"];

  // Carregar as filiais
  useEffect(() => {
    fetch("http://localhost:5000/filial?page=1&limit=100")
      .then((res) => res.json())
      .then((resposta) => {
        const lista = resposta.data.map((f) => ({
          id: f.id_filial.toString(),
          nome: f.nome_filial,
        }));
        setFiliais(lista);
        if (lista.length > 0) {
          setFilialSelecionada(lista[0].id);
        }
      })
      .catch((error) => {
        console.error("Erro ao carregar filiais:", error);
      });
  }, []);

  // Carregar os dados da filial
  useEffect(() => {
    if (!filialSelecionada) return;
    fetch(`http://localhost:5000/relatorios/estoque-filial?id_filial=${filialSelecionada}`)
      .then((res) => res.json())
      .then((dados) => {
        setData(dados);
        setDataOriginal(dados);
      })
      .catch((error) => {
        console.error("Erro ao carregar dados de produtos:", error);
      });
  }, [filialSelecionada]);

  function somaCategoria(categoria, loja) {
    return Object.values(loja[categoria] || {}).reduce((a, b) => a + b, 0);
  }

  // Visualização para "Todos"
  if (categoriaSelecionada === "Todos") {
    const dataTodos = dataOriginal.map((loja) => ({
      produto: loja.produto,
      Bebidas: somaCategoria("Bebidas", loja),
      Laticínios: somaCategoria("Laticínios", loja),
      Snacks: somaCategoria("Snacks", loja),
    }));

    return (
      <div className={styles.visualContainer}>
        <h2 className={styles.visualTitle}>Estoque de Produtos por Mercado</h2>

        <div className={styles.visualControl}>
          <label htmlFor="filialSelect">Filial:</label>
          <select
            id="filialSelect"
            value={filialSelecionada}
            onChange={(e) => setFilialSelecionada(e.target.value)}
          >
            {filiais.map((filial) => (
              <option key={filial.id} value={filial.id}>
                {filial.nome}
              </option>
            ))}
          </select>

          <label style={{ marginLeft: 10 }}>Categoria:</label>
          <select
            value={categoriaSelecionada}
            onChange={(e) => setCategoriaSelecionada(e.target.value)}
            style={{ marginLeft: 5 }}
          >
            {categorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.visualContent}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataTodos} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="produto" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Bebidas" fill="#8884d8" />
              <Bar dataKey="Laticínios" fill="#82ca9d" />
              <Bar dataKey="Snacks" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // Visualização para categoria específica
  const subcategorias = Object.keys(dataOriginal[0]?.[categoriaSelecionada] || {});
  const dataPorSubcategoria = dataOriginal.map((loja) => {
    let obj = { produto: loja.produto };
    subcategorias.forEach((sub) => {
      obj[sub] = loja[categoriaSelecionada][sub] || 0;
    });
    return obj;
  });

  const cores = ["#8884d8", "#82ca9d", "#ffc658", "#d88484", "#84d8d8"];

  return (
    <div className={styles.visualContainer}>
      <h2 className={styles.visualTitle}>Produtos - Estoque por Filial</h2>

      <div className={styles.visualControl}>
        <label htmlFor="filialSelect">Filial:</label>
        <select
          id="filialSelect"
          value={filialSelecionada}
          onChange={(e) => setFilialSelecionada(e.target.value)}
        >
          {filiais.map((filial) => (
            <option key={filial.id} value={filial.id}>
              {filial.nome}
            </option>
          ))}
        </select>

        <label style={{ marginLeft: 10 }}>Categoria:</label>
        <select
          value={categoriaSelecionada}
          onChange={(e) => setCategoriaSelecionada(e.target.value)}
          style={{ marginLeft: 5 }}
        >
          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.visualContent}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dataPorSubcategoria} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="produto" tick={{ fontSize: 10 }} />
            <YAxis
              tick={{ fontSize: 10 }}
              label={{
                value: "Estoque",
                angle: -90,
                position: "insideLeft",
                fontSize: 10,
              }}
            />
            <Tooltip />
            {subcategorias.map((sub, index) => (
              <Bar key={sub} dataKey={sub} fill={cores[index % cores.length]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
