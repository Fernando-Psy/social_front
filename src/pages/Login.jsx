import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// /mnt/projetos/front_end/social_front/src/pages/Login.jsx

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const validate = () => {
        if (!email) return "Email é obrigatório.";
        // simples validação de email
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(email)) return "Email inválido.";
        if (!password) return "Senha é obrigatória.";
        if (password.length < 6) return "Senha deve ter ao menos 6 caracteres.";
        return "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        try {
            // Ajuste a URL da API conforme necessário
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.message || "Falha ao fazer login.");
            }

            const data = await res.json();
            // Exemplo: salvar token e redirecionar
            if (data.token) {
                localStorage.setItem("token", data.token);
            }
            navigate("/");
        } catch (err) {
            setError(err.message || "Erro inesperado.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.wrapper}>
            <form onSubmit={handleSubmit} style={styles.card} aria-labelledby="login-title">
                <h2 id="login-title" style={styles.title}>Entrar</h2>

                {error && <div role="alert" style={styles.error}>{error}</div>}

                <label style={styles.label}>
                    Email
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                        autoComplete="username"
                        required
                    />
                </label>

                <label style={styles.label}>
                    Senha
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                        autoComplete="current-password"
                        required
                    />
                </label>

                <button type="submit" style={styles.button} disabled={loading}>
                    {loading ? "Entrando..." : "Entrar"}
                </button>

                <div style={styles.footer}>
                    <span>Não tem conta?</span>
                    <button
                        type="button"
                        onClick={() => navigate("/register")}
                        style={styles.linkButton}
                    >
                        Cadastre-se
                    </button>
                </div>
            </form>
        </div>
    );
}

const styles = {
    wrapper: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f7fb",
        padding: 16,
    },
    card: {
        width: "100%",
        maxWidth: 420,
        background: "#fff",
        padding: 24,
        borderRadius: 8,
        boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
    },
    title: { margin: 0, marginBottom: 12, textAlign: "center" },
    label: { display: "flex", flexDirection: "column", marginBottom: 12, fontSize: 14 },
    input: {
        marginTop: 6,
        padding: "10px 12px",
        fontSize: 14,
        borderRadius: 6,
        border: "1px solid #d6dbe6",
    },
    button: {
        marginTop: 8,
        padding: "10px 12px",
        fontSize: 15,
        borderRadius: 6,
        border: "none",
        background: "#2563eb",
        color: "#fff",
        cursor: "pointer",
    },
    error: {
        marginBottom: 12,
        padding: 10,
        background: "#fff1f0",
        color: "#9b1c1c",
        borderRadius: 6,
        border: "1px solid #f5c2c2",
    },
    footer: {
        marginTop: 14,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 13,
        color: "#475569",
    },
    linkButton: {
        marginLeft: 8,
        background: "transparent",
        border: "none",
        color: "#2563eb",
        cursor: "pointer",
        textDecoration: "underline",
        padding: 0,
        fontSize: 13,
    },
};