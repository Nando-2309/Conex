import express from "express";
import axios from "axios";
import qs from "qs";

const app = express();

// Acessando corretamente as variáveis de ambiente
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

let accessToken = null;
let refreshToken = null; // Novo

app.get("/oauth2/callback", async (req, res) => {
    const code = req.query.code;
    const state = req.query.state;

    console.log("🔹 Code recebido:", code);
    console.log("🔹 State recebido:", state);

    const tokenUrl = "https://api.contaazul.com/oauth2/token";

    try {
        const payload = qs.stringify({
            grant_type: "authorization_code",
            client_id: CLIENT_ID,          // Adicionando client_id no payload
            client_secret: CLIENT_SECRET,  // Adicionando client_secret no payload
            code: code,
            redirect_uri: REDIRECT_URI
        });

        const response = await axios.post(tokenUrl, payload, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });

        accessToken = response.data.access_token;
        refreshToken = response.data.refresh_token; // Armazena o refresh token

        console.log("✅ Access token:", accessToken);
        console.log("🔄 Refresh token:", refreshToken);

        res.send(`Token de acesso recebido com sucesso!<br>Access Token: ${accessToken}<br>Refresh Token: ${refreshToken}`);

    } catch (error) {
        console.error("❌ Erro ao obter token:", error.response?.data || error.message);
        res.status(500).json({
            error: "Erro ao obter token do Conta Azul",
            details: error.response?.data || error.message
        });
    }
});

// Endpoint para trocar o refresh token por um novo access token
app.post("/oauth2/refresh", async (req, res) => {
    const refreshTokenFromRequest = req.body.refresh_token || refreshToken;

    if (!refreshTokenFromRequest) {
        return res.status(400).json({ error: "Refresh token não fornecido" });
    }

    const tokenUrl = "https://api.contaazul.com/oauth2/token";

    try {
        const payload = qs.stringify({
            grant_type: "refresh_token",
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            refresh_token: refreshTokenFromRequest
        });

        const response = await axios.post(tokenUrl, payload, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });

        accessToken = response.data.access_token;
        refreshToken = response.data.refresh_token; // Atualiza o refresh token

        console.log("✅ Novo Access Token:", accessToken);
        console.log("🔄 Novo Refresh Token:", refreshToken);

        res.json({
            message: "Access token renovado com sucesso!",
            access_token: accessToken,
            refresh_token: refreshToken
        });

    } catch (error) {
        console.error("❌ Erro ao renovar token:", error.response?.data || error.message);
        res.status(500).json({
            error: "Erro ao renovar token do Conta Azul",
            details: error.response?.data || error.message
        });
    }
});

// Usar a variável PORT fornecida pela plataforma (Render, Heroku, etc.)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
