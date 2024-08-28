const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const port = 3000;
const methodOverride = require('method-override');

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(methodOverride('_method'));

const url = 'mongodb://127.0.0.1:27017/';
const dbName = 'livraria';
const collectionName = 'livros';

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/cadastro', (req, res) => {
    res.sendFile(__dirname + '/cadastro.html');
});

app.post('/cadastro', async (req, res) => {
    const novoLivro = req.body;

    const client = new MongoClient(url);

    try {
        await client.connect();

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const result = await collection.insertOne(novoLivro);
        console.log(`Livro cadastrado com sucesso. ID: ${result.insertedId}`);

        res.redirect('/')
    } catch (err) {
        console.error('Erro ao cadastrar o livro:', err);
        res.status(500).send('Erro ao cadastrar o livro. Por favor, tente novamente mais tarde');
    } finally {
        client.close();
    }
});

app.post('/deletar', async (req, res) => {
    const { id } = req.body;
    const client = new MongoClient(url);

    try {
        await client.connect();

        const db = client.db(dbName);
        const collection = db.collection(collectionName)

        const result = await collection.deleteOne({ _id: new ObjectId(id)});

        if (result.deletedCount > 0){
            res.redirect('/');
        } else {
            res.status(404).send('Livro não encontrado.');
        }
    } catch (err) {
        console.error('Erro ao deletar o livro:', err);
        res.status(500).send(
            'Erro ao deletar o livro. por favor tente novamente mais tarde'
        )
    } finally {
        client.close();
    }
});

app.get('/livros', async (req, res) => {
    const client = new MongoClient(url)

    try {
        await client.connect()
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
    
        const livros = await collection.find({}, {
            projection: { _id: 1, titulo: 1, autor: 1, editora:1 }
        }).toArray();

        res.json(livros);
    } catch (err) {
        console.error('Erro ao buscar livros:', err);
        res.status(500).send(
            'Erro ao buscar livros, porfavor, tente novamente mais tarde'
        );
    } finally {
        client.close();
    }


})

app.listen(port, () => {
    console.log(`Servidor Node.js em execução em http://localhost:${port}`);
})