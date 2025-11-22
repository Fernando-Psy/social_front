import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        passwordConfirm: "",
    });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((s) => ({ ...s, [name]: value }));
        setErrors((e) => ({ ...e, [name]: "" }));
        setServerError("");
    }

    function validate() {
        const e = {};
        if (!form.name.trim()) e.name = "Nome é obrigatório.";
        if (!form.email.trim()) {
            e.email = "E‑mail é obrigatório.";
        } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
            e.email = "E‑mail inválido.";
        }
        if (!form.password) {
            e.password = "Senha é obrigatória.";
        } else if (form.password.length < 6) {
            e.password = "Senha precisa ter ao menos 6 caracteres.";
        }
        if (form.password !== form.passwordConfirm) {
            e.passwordConfirm = "Senhas não conferem.";
        }
        return e;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const validation = validate();
        setErrors(validation);
        if (Object.keys(validation).length) return;

        setLoading(true);
        setServerError("");

        try {
            // Ajuste a URL/headers conforme sua API
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name.trim(),
                    email: form.email.trim(),
                    password: form.password,
                }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.message || "Erro ao registrar usuário.");
            }

            // Registro ok: redireciona para login (ou outro lugar)
            navigate("/login", { replace: true });
        } catch (err) {
            setServerError(err.message || "Erro inesperado.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ maxWidth: 480, margin: "40px auto", padding: 16 }}>
            <h1>Cadastro</h1>

            <form onSubmit={handleSubmit} noValidate>
                <div style={{ marginBottom: 12 }}>
                    <label>
                        Nome
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            disabled={loading}
                            autoComplete="name"
                            style={{ display: "block", width: "100%", padding: 8 }}
                        />
                    </label>
                    {errors.name && <div style={{ color: "crimson" }}>{errors.name}</div>}
                </div>

                <div style={{ marginBottom: 12 }}>
                    <label>
                        E‑mail
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            disabled={loading}
                            autoComplete="email"
                            style={{ display: "block", width: "100%", padding: 8 }}
                        />
                    </label>
                    {errors.email && <div style={{ color: "crimson" }}>{errors.email}</div>}
                </div>

                <div style={{ marginBottom: 12 }}>
                    <label>
                        Senha
                        <input
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            disabled={loading}
                            autoComplete="new-password"
                            style={{ display: "block", width: "100%", padding: 8 }}
                        />
                    </label>
                    {errors.password && <div style={{ color: "crimson" }}>{errors.password}</div>}
                </div>

                <div style={{ marginBottom: 12 }}>
                    <label>
                        Confirmar senha
                        <input
                            name="passwordConfirm"
                            type="password"
                            value={form.passwordConfirm}
                            onChange={handleChange}
                            disabled={loading}
                            autoComplete="new-password"
                            style={{ display: "block", width: "100%", padding: 8 }}
                        />
                    </label>
                    {errors.passwordConfirm && (
                        <div style={{ color: "crimson" }}>{errors.passwordConfirm}</div>
                    )}
                </div>

                {serverError && <div style={{ color: "crimson", marginBottom: 12 }}>{serverError}</div>}

                <button type="submit" disabled={loading} style={{ padding: "8px 16px" }}>
                    {loading ? "Cadastrando..." : "Cadastrar"}
                </button>
            </form>

            <p style={{ marginTop: 12 }}>
                Já tem conta? <button type="button" onClick={() => navigate("/login")}>Entrar</button>
            </p>
        </div>
    );
}