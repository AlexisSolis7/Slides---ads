var express = require("express");
var cors = require("cors");
var app = express();

const mongoose = require('mongoose');
const Slide = require('./modelos/Slides');


app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + "/public"));

/* let slides = [
  {
    titulo: "Slide A",
    duracao: 10,
    conteudo: "<h1>EU SOU O SLIDE A, TREMAM DE MEDO</h1>",
    expiracao: new Date("2025-11-20T18:30:00")
  },
  {
    titulo: "Slide B",
    duracao: 5,
    conteudo: "<h1>Eu sou o slide B xD<h1>",
    expiracao: new Date("2025-11-30T18:30:00")
  },
  {
    titulo: "Slide Z",
    duracao: 12,
    conteudo: "<p>eu sou o slide Z mas nunca mais vou aparecer</p>",
    expiracao: new Date("2025-11-10T18:30:00")
  }
];
*/

/*app.get("/getSlides", function (req, resp) {
  resp.send(slides); // inicilamente vem do nada xd     /----LOGICA ANTE SO BANCO----/
}); */

//Aqui agente vai pegar os slides do banco de dados <----------------------
app.get('/slides', async (req, resp) => {
  try{
    const slides = await Slide.find(); // aqui agente pede ao mongoose para ele encontrar todos os slides
    resp.send(slides); // depois o moongose enviar os slides encontrados como resposta
  } catch (e) {
    resp.status(500).send({ mensagem: 'Erro ao buscar slides', erro: e.message });
  }
});


//Aqui vai ser para que o admin possa adicionar novos slides
app.post('/slides', async (req, resp)=>{
  const novo = req.body; // o objeto JSON que o admin enviou

  try{ 
    const dadosPraSalvar = {
      titulo: novo.titulo,
      html: novo.html,
      duracao: novo.duracao,
      expiracao: new Date(novo.expiracao)
    };

    const slide = new Slide(dadosPraSalvar); // cria o objeto slide conforme o modelo
    await slide.save(); // salva o slide no banco de dados
    resp.send(slide); //devolve o slide salvo para o front     <---------- basicamente o que vc fez antes
  } catch (e) {
    resp.status(400).send({ mensagem: 'Erro ao salvar slide', erro: e.message });
  }
});


//Aqui e para o admin remover slides
app.delete('/slides/:titulo', async (req, resp) => {
  const titulosPraRemover = req.params.titulo; //pega o titulo que veio na URL

  try{
    await Slide.findOneAndDelete({ titulo: titulosPraRemover }); // pede para o mongoose encontrar e remover o slide com o titulo indicado
    resp.send({ mensagem: 'Removido com sucesso' });
  } catch (e) {
    resp.status(500).send({ mensagem: 'Erro ao remover slide', erro: e.message }); //caso de algum erro com o bd
  }
});

app.listen(4000, function () {
  console.log("Rodando o servidor na porta 4000");
});



const MONGODB_URI = 'mongodb://localhost:27017/servidor-propaganda';
console.log('Conectando a DB .. .. .');
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Conectado com succeso');
    app.listen(4000, function(){
      console.log("Rodando o servidor na porta 4000");
    });
  })
  .catch((err) => {
    console.error('Erro ao conectar a DB:', err);
  });