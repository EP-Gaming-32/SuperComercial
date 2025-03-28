"use client";
import { useState } from "react";
import Head from "next/head";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message);
    } catch (error) {
      console.error("Erro:", error);
      setMessage("Erro ao enviar o e-mail de redefinição");
    }
  };

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <title>Esqueci a Senha</title>
      </Head>
      <div style={{ padding: "1rem", maxWidth: "400px", margin: "0 auto" }}>
        <h1>Esqueci Minha Senha</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
          />
          <button type="submit" style={{ width: "100%", padding: "0.5rem" }}>
            Enviar Link
          </button>
        </form>
        {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
      </div>
    </>
  );
}
