"use client";

import React, { useState } from "react";

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



export default function EstoqueBarChart() {

  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todos");



  const categorias = ["Todos", "Eletrônicos", "Alimentos", "Higiene"];



  // Dados detalhados com subcategorias

  const dataOriginal = [

    {

      loja: "Loja A",

      Eletrônicos: { Celular: 150, TV: 100, Fone: 150 },

      Alimentos: { Bolacha: 120, Farinha: 100, Salgado: 80 },

      Higiene: { Sabonete: 90, Shampoo: 110 },

    },

    {

      loja: "Loja B",

      Eletrônicos: { Celular: 80, TV: 100, Fone: 70 },

      Alimentos: { Bolacha: 200, Farinha: 150, Salgado: 100 },

      Higiene: { Sabonete: 60, Shampoo: 90 },

    },

    {

      loja: "Loja C",

      Eletrônicos: { Celular: 200, TV: 150, Fone: 150 },

      Alimentos: { Bolacha: 130, Farinha: 110, Salgado: 110 },

      Higiene: { Sabonete: 50, Shampoo: 50 },

    },

  ];



  // Função para somar valores de uma categoria por loja

  function somaCategoria(categoria, loja) {

    return Object.values(loja[categoria] || {}).reduce((a, b) => a + b, 0);

  }



  // Dados para "Todos" - soma geral por loja

  if (categoriaSelecionada === "Todos") {

    const dataTodos = dataOriginal.map((loja) => ({

      loja: loja.loja,

      Eletrônicos: somaCategoria("Eletrônicos", loja),

      Alimentos: somaCategoria("Alimentos", loja),

      Higiene: somaCategoria("Higiene", loja),

    }));



    return (

      <div>

        <h3>Relatório de Estoque por Loja</h3>



        <label>Filtrar por categoria:</label>

        <select

          onChange={(e) => setCategoriaSelecionada(e.target.value)}

          value={categoriaSelecionada}

          style={{ marginBottom: 10, marginLeft: 10 }}

        >

          {categorias.map((cat) => (

            <option key={cat} value={cat}>

              {cat}

            </option>

          ))}

        </select>



        <ResponsiveContainer width="100%" height={350}>

          <BarChart data={dataTodos} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="loja" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Bar dataKey="Eletrônicos" fill="#8884d8" />

            <Bar dataKey="Alimentos" fill="#82ca9d" />

            <Bar dataKey="Higiene" fill="#ffc658" />

          </BarChart>

        </ResponsiveContainer>

      </div>

    );

  }



  // Dados para uma categoria específica: transformar subcategorias em barras

  // Exemplo: para "Alimentos" mostramos Bolacha, Farinha, Salgado, cada um como uma barra agrupada por loja

  const subcategorias = Object.keys(dataOriginal[0][categoriaSelecionada] || {});



  // Monta dados para gráfico, cada objeto com { loja: "Loja A", Bolacha: val, Farinha: val, Salgado: val }

  const dataPorSubcategoria = dataOriginal.map((loja) => {

    let obj = { loja: loja.loja };

    subcategorias.forEach((sub) => {

      obj[sub] = loja[categoriaSelecionada][sub] || 0;

    });

    return obj;

  });



  // Cores para as barras (repete se precisar)

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#d88484", "#84d8d8"];



  return (

    <div>

      <h3>Relatório de Estoque por Loja - Categoria: {categoriaSelecionada}</h3>



      <label>Filtrar por categoria:</label>

      <select

        onChange={(e) => setCategoriaSelecionada(e.target.value)}

        value={categoriaSelecionada}

        style={{ marginBottom: 10, marginLeft: 10 }}

      >

        {categorias.map((cat) => (

          <option key={cat} value={cat}>

            {cat}

          </option>

        ))}

      </select>



      <ResponsiveContainer width="100%" height={350}>

        <BarChart data={dataPorSubcategoria} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="loja" />

          <YAxis />

          <Tooltip />

          <Legend />

          {subcategorias.map((sub, index) => (

            <Bar key={sub} dataKey={sub} fill={colors[index % colors.length]} />

          ))}

        </BarChart>

      </ResponsiveContainer>

    </div>

  );

}
