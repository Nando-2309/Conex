import express from "express";
import axios from "axios";
import qs from "qs";

const app = express();

const CLIENT_ID = process.env.clientId;
const CLIENT_SECRET = process.env.clientSecret;
const REDIRECT_URI = process.env.redirectUri;

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
            code: code,
            redirect_uri: REDIRECT_URI
        });

        const response = await axios.post(tokenUrl, payload, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            auth: {
                username: CLIENT_ID,
                password: CLIENT_SECRET
            }
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
