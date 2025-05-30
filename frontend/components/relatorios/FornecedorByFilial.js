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
} from "recharts";

export default function FornecedorByFilial() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchFornecedores() {
      try {
        const response = await fetch("http://localhost:5000/relatorios/fornecedores-filial");
        const rawData = await response.json();

        // Agrupar e contar fornecedores por filial
        const agrupado = rawData.reduce((acc, item) => {
          const { nome_filial } = item;
          const existente = acc.find((f) => f.store === nome_filial);

          if (existente) {
            existente.suppliers += 1;
          } else {
            acc.push({ store: nome_filial, suppliers: 1 });
          }

          return acc;
        }, []);

        setData(agrupado);
      } catch (error) {
        console.error("Erro ao buscar dados de fornecedores por filial:", error);
      }
    }

    fetchFornecedores();
  }, []);

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Relatório de Fornecedores por Loja</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="store" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="suppliers" fill="#00C49F" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
