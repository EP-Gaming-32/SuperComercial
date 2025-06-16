import Head from "next/head";
import styles from "./cadastro.module.css"

export default function Cadastro () {
    return (
        <>
        <Head>
            <meta charset="UTF-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>Cadastro</title>
        </Head>
        <div className={styles.container}>
            <div className={styles.loginBox}>
                <div className={styles.header}>Junte-se a Nós!</div>
                <form className={styles.form}>
                    <label htmlFor="nome" className={styles.label}>Nome</label>
                    <input type="text" id="nome" placeholder="Nome Completo" className={styles.input}/>

                    <label htmlFor="email" className={styles.label}>Email</label>
                    <input type="email" id="email" placeholder="zeca@email.com"/>

                    <div className={styles.telefoneContainer}>
                        <div class="campo">
                            <label htmlFor="telefone" className={styles.label}>Telefone</label>
                            <input type="text" id="telefone" placeholder="+ 99 9999-9999" className={styles.input}/>
                        </div>
                        <div class="campo">
                            <label htmlFor="celular" className={styles.label}>Celular</label>
                            <input type="text" id="celular" placeholder="+ 99 99999-9999" className={styles.input}/>
                        </div>
                    </div>

                    <label htmlFor="senha" className={styles.label}>Senha</label>
                    <input type="password" id="senha" placeholder="Mínimo de 6 caracteres" className={styles.input}/>

                    <button type="submit" className={styles.button}>Cadastrar</button>
                </form>
            </div>
        </div>
        </>
    )
}