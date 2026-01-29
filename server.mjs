import express from "express";
import axios from "axios";
import qs from "qs";

const app = express();
app.use(express.json());

// ==================
// VARIÁVEIS DE AMBIENTE (Render)
// ==================
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// ==================
// CONTROLE DE TOKEN (exemplo simples)
// ==================
let accessToken = null;
let refreshToken = null;

// ==================
// CALLBACK OAUTH2
// ==================
app.get("/oauth2/callback", async (req, res) => {
    const { code, state } = req.query;

    console.log("🔹 Code recebido:", code);
    console.log("🔹 State recebido:", state);

    if (!code) {
        return res.status(400).json({ error: "Code não recebido" });
    }

    const tokenUrl = "https://api.contaazul.com/oauth2/token";

    try {
        const payload = qs.stringify({
            grant_type: "authorization_code",
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            code: code
        });

        const response = await axios.post(tokenUrl, payload, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        accessToken = response.data.access_token;
        refreshToken = response.data.refresh_token;

        console.log("✅ Access Token:", accessToken);
        console.log("🔄 Refresh Token:", refreshToken);

        res.send(`
            <h2>Autenticação concluída com sucesso ✅</h2>
            <p><b>Access Token:</b></p>
            <pre>${accessToken}</pre>
            <p><b>Refresh Token:</b></p>
            <pre>${refreshToken}</pre>
        `);

    } catch (error) {
        console.error(
            "❌ Erro ao obter token:",
            error.response?.data || error.message
        );

        res.status(500).json({
            error: "Erro ao obter token da Conta Azul",
            details: error.response?.data || error.message
        });
    }
});

// ==================
// REFRESH TOKEN
// ==================
app.post("/oauth2/refresh", async (req, res) => {
    const tokenToRefresh = req.body.refresh_token || refreshToken;

    if (!tokenToRefresh) {
        return res.status(400).json({
            error: "Refresh token não informado"
        });
    }

    const tokenUrl = "https://api.contaazul.com/oauth2/token";

    try {
        const payload = qs.stringify({
            grant_type: "refresh_token",
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            refresh_token: tokenToRefresh
        });

        const response = await axios.post(tokenUrl, payload, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        accessToken = response.data.access_token;
        refreshToken = response.data.refresh_token;

        console.log("♻️ Token renovado");

        res.json({
            message: "Token renovado com sucesso",
            access_token: accessToken,
            refresh_token: refreshToken
        });

    } catch (error) {
        console.error(
            "❌ Erro ao renovar token:",
            error.response?.data || error.message
        );

        res.status(500).json({
            error: "Erro ao renovar token",
            details: error.response?.data || error.message
        });
    }
});

// ==================
// ENDPOINT DE TESTE (opcional)
// ==================
app.get("/", (req, res) => {
    res.send("🚀 API Conta Azul rodando");
});

// ==================
// START SERVER
// ==================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
