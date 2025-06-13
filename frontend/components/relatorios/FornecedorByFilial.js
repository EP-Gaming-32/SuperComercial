"use client";
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function FornecedorByFilial() {
  const [dataOriginal, setDataOriginal] = useState([]);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState("Todos");
  const [fornecedores, setFornecedores] = useState([]);

  useEffect(() => {
    async function fetchFornecedores() {
      try {
        const response = await fetch("http://localhost:5000/relatorios/fornecedores-filial");
        const rawData = await response.json();

        // Agrupar por loja e contar por fornecedor
        const agrupado = {};

        rawData.forEach((item) => {
          const { nome_filial, nome_fornecedor } = item;

          if (!agrupado[nome_filial]) {
            agrupado[nome_filial] = { loja: nome_filial };
          }

          agrupado[nome_filial][nome_fornecedor] =
            (agrupado[nome_filial][nome_fornecedor] || 0) + 1;
        });

        const lista = Object.values(agrupado);
        setDataOriginal(lista);

        // Extrai nomes únicos de fornecedores
        const nomesUnicos = [...new Set(rawData.map((i) => i.nome_fornecedor))];
        setFornecedores(["Todos", ...nomesUnicos]);
      } catch (error) {
        console.error("Erro ao buscar dados de fornecedores por filial:", error);
      }
    }

    fetchFornecedores();
  }, []);

  const dataFiltrada =
    fornecedorSelecionado === "Todos"
      ? dataOriginal
      : dataOriginal.map((item) => ({
          loja: item.loja,
          [fornecedorSelecionado]: item[fornecedorSelecionado] || 0,
        }));

  const cores = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a6d8ff", "#c0a0ff"];

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Relatório de Fornecedores por Loja</h3>

      <div style={{ marginBottom: 10 }}>
        <label htmlFor="filtroFornecedor">Fornecedor: </label>
        <select
          id="filtroFornecedor"
          value={fornecedorSelecionado}
          onChange={(e) => setFornecedorSelecionado(e.target.value)}
        >
          {fornecedores.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={dataFiltrada}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="loja" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          {fornecedorSelecionado === "Todos"
            ? fornecedores
                .filter((f) => f !== "Todos")
                .map((f, index) => (
                  <Bar key={f} dataKey={f} fill={cores[index % cores.length]} />
                ))
            : <Bar dataKey={fornecedorSelecionado} fill="#8884d8" />}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
