const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// ✅ Substitua essa URL pela URL gerada pelo Render após o deploy
const redirectUri = 'https://api-contaazul.onrender.com/oauth2/callback'; // exemplo

// 🔐 Pegando dados do ambiente (configure no painel do Render)
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

// 🔹 Rota principal
app.get('/', (req, res) => {
  res.send('Servidor Express no Render está rodando!');
});

// 🔁 Rota de callback da Conta Azul
app.get('/oauth2/callback', async (req, res) => {
  const authorizationCode = req.query.code;

  if (!authorizationCode) {
    return res.status(400).send('Código de autorização não encontrado.');
  }

  try {
    const response = await axios.post('https://auth.contaazul.com/oauth2/token', null, {
      params: {
        grant_type: 'authorization_code',
        code: authorizationCode,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret
      }
    });

    const accessToken = response.data.access_token;
    res.send(`✅ Token de acesso recebido: ${accessToken}`);
  } catch (error) {
    console.error('Erro ao trocar o código por um token:', error.response?.data || error.message);
    res.status(500).send('Erro ao trocar o código por um token.');
  }
});

// 🚀 Inicia o servidor (sem HTTPS, pois Render já oferece)
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
