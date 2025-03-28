"use client";

import Head from "next/head";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./auth.module.css";
import InputField from "@/components/InputField";
import ColoredText from "@/components/InlineColor";

export default function AuthPage() {
  const { slug } = useParams();
  const router = useRouter();

  const initialData =
    slug === "cadastro"
      ? { nome: "", email: "", telefone: "", celular: "", senha: "" }
      : { email: "", senha: "" };

  const [formData, setFormData] = useState(initialData);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = slug === "cadastro" ? "/cadastro" : "/login";
  
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setMessage(data.message);

      if (slug === "login" && data.token) {
        localStorage.setItem("token", data.token);
        router.push("/home");
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
      
      <div className={styles.wrapper}>
        <div className={styles.title}>
          <ColoredText />
        </div>
        
        <div className={styles.container}>
          <div className={styles.loginBox}>
            <div className={styles.header}>
              {slug === "login" ? "Login" : "Junte-se a Nós!"}
            </div>
            
            <form className={styles.form} onSubmit={handleSubmit}>
              {slug === "cadastro" && (
                <InputField
                  id="nome"
                  placeholder="Nome Completo"
                  value={formData.nome}
                  onChange={handleChange}
                  label="Nome"
                />
              )}
              
              <InputField
                id="email"
                type="email"
                placeholder="Seu email"
                value={formData.email}
                onChange={handleChange}
                label="Email"
              />

              <InputField
                id="senha"
                type="password"
                placeholder="Senha"
                value={formData.senha}
                onChange={handleChange}
                label="Senha"
              />

              {slug === "cadastro" && (
                <>
                  <InputField
                    id="telefone"
                    placeholder="+ 99 9999-9999"
                    value={formData.telefone}
                    onChange={handleChange}
                    label="Telefone"
                  />
                  
                  <InputField
                    id="celular"
                    placeholder="+ 99 99999-9999"
                    value={formData.celular}
                    onChange={handleChange}
                    label="Celular"
                  />
                </>
              )}

              <button type="submit" className={styles.button}>
                {slug === "login" ? "Login" : "Cadastrar"}
              </button>

              <button
                type="button"
                className={styles.buttonSecondary}
                onClick={() => router.push(slug === "login" ? "/auth/cadastro" : "/auth/login")}
              >
                {slug === "login" ? "Tela de Cadastro" : "Tela de Login"}
              </button>
            </form>

            {message && <p className={styles.message}>{message}</p>}
          </div>
        </div>
      </div>
    </>
  );
}