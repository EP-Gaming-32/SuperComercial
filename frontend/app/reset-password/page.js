"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Head from "next/head";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      setMessage(data.message);
    } catch (error) {
      console.error("Erro:", error);
      setMessage("Erro ao redefinir a senha");
    }
  };

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <title>Redefinir Senha</title>
      </Head>
      <div style={{ padding: "1rem", maxWidth: "400px", margin: "0 auto" }}>
        <h1>Redefinir Senha</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Digite sua nova senha"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
          />
          <button type="submit" style={{ width: "100%", padding: "0.5rem" }}>
            Redefinir Senha
          </button>
        </form>
        {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
      </div>
    </>
  );
}
