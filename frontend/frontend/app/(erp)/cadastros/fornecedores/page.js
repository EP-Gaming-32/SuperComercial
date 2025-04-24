"use client";
import FormPageFornecedores from "./FormPageFornecedores";

export default function CadastroFornecedores() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Cadastro de Fornecedores</h1>
      <p style={styles.subtitle}>Preencha os dados abaixo para cadastrar um novo fornecedor.</p>
      <FormPageFornecedores />
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    textAlign: "center",
  },
  title: {
    color: "#333",
  },
  subtitle: {
    color: "#555",
    marginBottom: "20px",
  },
};
