import Head from "next/head";
import styles from "./login.module.css";

export default function Login() {
  return (
    <>
    <Head>
      <meta charset="UTF-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Login</title>
    </Head>
    <div className={styles.container}>
        <div className={styles.loginBox}>
            <div className={styles.header}>Login</div>
            <div className={styles.avatar}>
                <span>👤</span>
            </div>
            <form className={styles.form} action="cadastro/">
                <label htmlfor="login" className={styles.label}>Login</label>
                <input type="text" id="login" placeholder="Login/Email" className={styles.input}/>
            
                <label for="senha" className={styles.label}>Senha <a href="#">Esqueceu a Senha?</a></label>
                <input type="password" id="senha" placeholder="Senha" className={styles.input}/>
            
                <button className={styles.button} type="submit">Login</button>
            </form>
        </div>
    </div>
    </>
  )
}