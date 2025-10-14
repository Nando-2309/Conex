import express from "express";
import axios from "axios";
import qs from "qs";

const app = express();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

let accessToken = null;
let refreshToken = null;
let tokenExpiresAt = null; // timestamp de expiração

// Função para renovar o token
async function renewAccessToken() {
    if (!refreshToken) throw new Error("Refresh token não disponível");

    const payload = qs.stringify({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
    });

    const response = await axios.post("https://api.contaazul.com/oauth2/token", payload, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });

    accessToken = response.data.access_token;
    refreshToken = response.data.refresh_token; // substitui sempre que retornar novo
    tokenExpiresAt = Date.now() + response.data.expires_in * 1000;

    console.log("♻️ Token renovado com sucesso!");
}

// Rota de callback do OAuth2
app.get("/oauth2/callback", async (req, res) => {
    const code = req.query.code;
    const state = req.query.state;

    console.log("🔹 Code recebido:", code);
    console.log("🔹 State recebido:", state);

    try {
        const payload = qs.stringify({
            grant_type: "authorization_code",
            code: code,
            redirect_uri: REDIRECT_URI,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET
        });

        const response = await axios.post("https://api.contaazul.com/oauth2/token", payload, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });

        accessToken = response.data.access_token;
        refreshToken = response.data.refresh_token;
        tokenExpiresAt = Date.now() + response.data.expires_in * 1000;

        console.log("✅ Access token:", accessToken);
        console.log("✅ Refresh token:", refreshToken);

        res.send(`Tokens obtidos com sucesso!<br>Access token: ${accessToken}<br>Refresh token: ${refreshToken}`);
    } catch (error) {
        console.error("❌ Erro ao obter tokens:", error.response?.data || error.message);
        res.status(500).send(error.response?.data || error.message);
    }
});

// Rota exemplo usando o token
app.get("/meu-perfil", async (req, res) => {
    try {
        // Renova o token se estiver prestes a expirar
        if (!accessToken || (tokenExpiresAt && Date.now() >= tokenExpiresAt - 30000)) {
            await renewAccessToken();
        }

        const response = await axios.get("https://api.contaazul.com/v1/users/me", {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        res.json(response.data);
    } catch (error) {
        console.error("❌ Erro ao chamar API:", error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
