"use client";
import { useState } from "react";
import styles from "@/components/form/FormPageFornecedores.module.css";


export default function FormPageFornecedores() {
  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    email: "",
    telefone: "",
    representante: "",
    endereco: "",
    numero: "",
    cidade: "",
    estado: "",
    cep: "",
    categoria: "",
    site: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dados enviados:", formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h2>Cadastro de Fornecedor</h2>

      <label>Nome da Empresa:</label>
      <input
        type="text"
        name="nome"
        value={formData.nome}
        onChange={handleChange}
        required
      />

      <label>CNPJ:</label>
      <input
        type="text"
        name="cnpj"
        value={formData.cnpj}
        onChange={handleChange}
        required
      />

      <label>Email:</label>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <label>Telefone:</label>
      <input
        type="tel"
        name="telefone"
        value={formData.telefone}
        onChange={handleChange}
        required
      />

      <label>Nome do Representante:</label>
      <input
        type="text"
        name="representante"
        value={formData.representante}
        onChange={handleChange}
      />

      <label>Endereço:</label>
      <input
        type="text"
        name="endereco"
        value={formData.endereco}
        onChange={handleChange}
        required
      />

      <label>Número:</label>
      <input
        type="text"
        name="numero"
        value={formData.numero}
        onChange={handleChange}
      />

      <label>Cidade:</label>
      <input
        type="text"
        name="cidade"
        value={formData.cidade}
        onChange={handleChange}
        required
      />

      <label>Estado:</label>
      <input
        type="text"
        name="estado"
        value={formData.estado}
        onChange={handleChange}
        required
      />

      <label>CEP:</label>
      <input
        type="text"
        name="cep"
        value={formData.cep}
        onChange={handleChange}
        required
      />

      <label>Categoria:</label>
      <input
        type="text"
        name="categoria"
        value={formData.categoria}
        onChange={handleChange}
      />

      <label>Site (Opcional):</label>
      <input
        type="url"
        name="site"
        value={formData.site}
        onChange={handleChange}
      />

      <button type="submit">Cadastrar Fornecedor</button>
    </form>
  );
}

