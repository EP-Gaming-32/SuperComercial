"use client";
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function PagamentoByFilial() {
  const [dataOriginal, setDataOriginal] = useState([]);
  const [mesSelecionado, setMesSelecionado] = useState("Todos");
  const [meses, setMeses] = useState([]);

  useEffect(() => {
    const fetchPagamentos = async () => {
      try {
        const response = await fetch("http://localhost:5000/relatorios/pagamentos-filial");
        if (!response.ok) throw new Error("Erro ao buscar dados");
        const json = await response.json();

        // Agrupar pagamentos por filial e por mês
        const agrupado = {};

        json.forEach(({ nome_filial, mes_pagamento, total_pago }) => {
          if (!agrupado[nome_filial]) {
            agrupado[nome_filial] = { loja: nome_filial };
          }
          agrupado[nome_filial][mes_pagamento] =
            (agrupado[nome_filial][mes_pagamento] || 0) + total_pago;
        });

        const listaFormatada = Object.values(agrupado);
        setDataOriginal(listaFormatada);

        // Extrair lista de meses únicos
        const mesesUnicos = [...new Set(json.map((item) => item.mes_pagamento))];
        setMeses(["Todos", ...mesesUnicos]);
      } catch (error) {
        console.error("Erro ao carregar dados de pagamentos por filial:", error);
      }
    };

    fetchPagamentos();
  }, []);

  const dataFiltrada =
    mesSelecionado === "Todos"
      ? dataOriginal
      : dataOriginal.map((item) => ({
          loja: item.loja,
          [mesSelecionado]: item[mesSelecionado] || 0,
        }));

  const cores = ["#FF8042", "#0088FE", "#00C49F", "#AA336A", "#82ca9d", "#ffc658"];

  return (
    <div>
      <h3>Pagamentos por Loja</h3>

      <label htmlFor="mesFiltro">Filtrar por mês:</label>
      <select
        id="mesFiltro"
        value={mesSelecionado}
        onChange={(e) => setMesSelecionado(e.target.value)}
        style={{ marginBottom: 10, marginLeft: 10 }}
      >
        {meses.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={dataFiltrada}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="loja" />
          <YAxis />
          <Tooltip />
          <Legend />
          {mesSelecionado === "Todos"
            ? meses
                .filter((m) => m !== "Todos")
                .map((m, index) => (
                  <Line
                    key={`line-${m}`}
                    type="monotone"
                    dataKey={m}
                    stroke={cores[index % cores.length]}
                  />
                ))
            : (
              <Line
                key={`line-${mesSelecionado}`}
                type="monotone"
                dataKey={mesSelecionado}
                stroke="#FF8042"
              />
            )}
        </LineChart>
      </ResponsiveContainer>

    </div>
  );
}
