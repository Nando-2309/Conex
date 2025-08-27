// Usando import em vez de require
import express from "express";
import axios from "axios";
import qs from "qs";

const app = express();

const CLIENT_ID = "2gthjdhe4djrsirt54i32fv8ej";
const CLIENT_SECRET = "bsa9hb57ghv54prmkhkb7uu2aielsduar1mnqkh32qap9jr8175";
const REDIRECT_URI = "https://api-contaazul.onrender.com/oauth2/callback";

app.get("/oauth2/callback", async (req, res) => {
    const code = req.query.code;
    const state = req.query.state;

    console.log("🔹 Code recebido:", code);
    console.log("🔹 State recebido:", state);

    const tokenUrl = "https://api.contaazul.com/oauth2/token";

    try {
        const payload = qs.stringify({ // stringify → transforma objeto em string no formato certo
            grant_type: "authorization_code",
            code: code,
            redirect_uri: "https://api-contaazul.onrender.com/oauth2/callback" // precisa ser exatamente igual
        });
         console.log("🔹 Payload enviado:", payload);

        const response = await axios.post(tokenUrl, payload, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            auth: {
                username: "2gthjdhe4djrsirt54i32fv8ej",
                password: "bsa9hb57ghv54prmkhkb7uu2aielsduar1mnqkh32qap9jr8175"
            }
        });

        console.log("✅ Token recebido:", response.data);
        res.json({
            message: "Token gerado com sucesso!",
            token: response.data
        });

       } catch (error) {
        if (error.response) {
            console.error("❌ Erro na resposta da API Conta Azul:");
            console.error("Status:", error.response.status);
            console.error("Headers:", error.response.headers);
            console.error("Data:", error.response.data);
        } else if (error.request) {
            console.error("❌ Nenhuma resposta recebida da API Conta Azul:");
            console.error(error.request);
        } else {
            console.error("❌ Erro ao configurar a requisição:", error.message);
        }

        res.status(500).json({
            error: "Erro ao obter token do Conta Azul",
            details: error.response?.data || error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});