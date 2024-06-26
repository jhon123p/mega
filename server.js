const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const admin = require('firebase-admin');
var serviceAccount = require("./serviceAccountKey.json");


const app = express();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

app.use(bodyParser.urlencoded({ extended: true }));

// Serve o formulário HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota para enviar os dados do formulário
app.post('/submit', async (req, res) => {
  const { name, email } = req.body;
  const id = Date.now().toString();
  try {
    const docRef = db.collection('users').doc(id);
    await docRef.set({
      name,
      email
    });
    res.redirect('/listar-mensagens'); // Redireciona para a página de listagem de mensagens
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
    res.status(500).send('Erro ao salvar dados.');
  }
});

// Rota para listar as mensagens
app.get('/listar-mensagens', async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const mensagens = [];
    snapshot.forEach(doc => {
      mensagens.push({
        id: doc.id,
        ...doc.data()
      });
    });
    res.json(mensagens); // Retorna as mensagens como JSON
  } catch (error) {
    console.error('Erro ao recuperar mensagens:', error);
    res.status(500).send('Erro ao recuperar mensagens.');
  }
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
