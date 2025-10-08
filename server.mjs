import express from "express";
import axios from "axios";
import qs from "qs";

const app = express();

const CLIENT_ID = process.env.clientId;
const CLIENT_SECRET = process.env.clientSecret;
const REDIRECT_URI = process.env.redirectUri;

let accessToken = null; // Aqui vamos armazenar o token recebido

app.get("/oauth2/callback", async (req, res) => {
    const code = req.query.code;
    const state = req.query.state;

    console.log("🔹 Code recebido:", code);
    console.log("🔹 State recebido:", state);

    const tokenUrl = "https://api.contaazul.com/oauth2/token";

    try {
        const payload = qs.stringify({
    grant_type: "authorization_code",
    code: code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET
});

const response = await axios.post(tokenUrl, payload, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
});


        // Salva o token globalmente
        accessToken = response.data.access_token;
        console.log("✅ Token de acesso recebido:", accessToken);

        res.send(`Token de acesso recebido com sucesso!<br>${accessToken}`);

    } catch (error) {
        console.error("❌ Erro ao obter token:", error.response?.data || error.message);
        res.status(500).json({
            error: "Erro ao obter token do Conta Azul",
            details: error.response?.data || error.message
        });
    }
});

// Exemplo de rota que usa o token para chamar a API da Conta Azul
app.get("/meu-perfil", async (req, res) => {
    if (!accessToken) return res.status(400).send("Token não disponível. Faça login primeiro.");

    try {
        const response = await axios.get("https://api.contaazul.com/v1/users/me", {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error("❌ Erro ao chamar API:", error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
