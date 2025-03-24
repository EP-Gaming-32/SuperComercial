"use client";

import Head from "next/head";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./auth.module.css";
import InputField from "@/components/InputField"; // adjust path if necessary
import ColoredText from "@/components/InlineColor";

export default function AuthPage() {
  const { slug } = useParams(); // slug will be either "login" or "cadastro"
  const router = useRouter();

  // Set initial form data depending on the slug
  const initialData =
    slug === "cadastro"
      ? { nome: "", email: "", telefone: "", celular: "", senha: "" }
      : { email: "", senha: "" };

  const [formData, setFormData] = useState(initialData);
  const [message, setMessage] = useState("");

  // Update state when input fields change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Handle form submission using fetch
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Determine endpoint based on slug
    const endpoint = slug === "cadastro" ? "/cadastro" : "/login";
  
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setMessage(data.message);
  
      // For login, if successful (token exists), redirect to home  
      if (slug === "login" && data.token) {
        // Optionally store the token in localStorage
        localStorage.setItem("token", data.token);
  
        // Redirect to the home
        router.push("/home");  // Redirects user to the home page
      }
    } catch (error) {
      console.error("Submission error:", error);
      setMessage("Erro ao enviar dados");
    }
  };
  

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{slug === "login" ? "Login" : "Cadastro"}</title>
      </Head>
      
      <div>
        <div className={styles.container}>
          <ColoredText></ColoredText>
        </div>
        <div className={styles.container}>
          <div className={styles.loginBox}>
            <div className={styles.header}>
              {slug === "login" ? "Login" : "Junte-se a Nós!"}
            </div>
            <form className={styles.form} onSubmit={handleSubmit}>
              {/* For registration (cadastro), include the "nome" field */}
              {slug === "cadastro" && (
                <InputField
                  id="nome"
                  placeholder="Nome Completo"
                  value={formData.nome}
                  onChange={handleChange}
                  label="Nome"
                  className={styles.inputWrapper}
                />
              )}
              <InputField
                id="email"
                type="email"
                placeholder="Seu email"
                value={formData.email}
                onChange={handleChange}
                label="Email"
                className={styles.inputWrapper}
              />
              <InputField
                id="senha"
                type="password"
                placeholder="Senha"
                value={formData.senha}
                onChange={handleChange}
                label="Senha"
                className={styles.inputWrapper}
              />
              {/* Optionally, include additional fields for registration */}
              {slug === "cadastro" && (
                <>
                  <InputField
                    id="telefone"
                    placeholder="+ 99 9999-9999"
                    value={formData.telefone}
                    onChange={handleChange}
                    label="Telefone"
                    className={styles.inputWrapper}
                  />
                  <InputField
                    id="celular"
                    placeholder="+ 99 99999-9999"
                    value={formData.celular}
                    onChange={handleChange}
                    label="Celular"
                    className={styles.inputWrapper}
                  />
                </>
              )}
              <button type="submit" className={styles.button}>
                {slug === "login" ? "Login" : "Cadastrar"}
              </button>
              <button
                  type="button"
                  className={styles.button}
                  onClick={() => router.push(slug === "login" ? "/auth/cadastro" : "/auth/login")}
                  >
                  {slug === "login" ? "Tela de Cadastro" : "Tela de Login"}
              </button>

            </form>
            {message && <p>{message}</p>}
          </div>
        </div>
      </div>
    </>
  );
}