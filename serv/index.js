var express = require("express");
var cors = require("cors");
var app = express();

const mongoose = require('mongoose');
const Slide = require('./modelos/Slides');


app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + "/public"));


////////////// SETUP SSE ///////////////////////// 
// faz sentido termos mais de um cliente por ter vários totens a serem conectados
let clientes = [];

const chamarVue = (dados) => {  // enviando um objeto
  const msg = `data: ${JSON.stringify(dados)}\n\n`;
  clientes.forEach(cliente => {
    cliente.res.write(msg);
  });
}

app.get("/api/events", (req, res) => {
  // aparentemente obrigatório no SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clienteId = Date.now();
  const novoCliente = {
    id: clienteId,
    res: res
  }
  clientes.push(novoCliente);
  // se o cliente fechar, é removido
  req.on('close', () => clientes.filter(cl => cl.id != clienteId))
})


////////////////// end SETUP SSE //////////////////////////


//Aqui agente vai pegar os slides do banco de dados <----------------------
app.get('/getSlides', async (req, resp) => {
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
      conteudo: novo.conteudo,
      duracao: novo.duracao,
      expiracao: new Date(novo.expiracao)
    };

    const slide = new Slide(dadosPraSalvar); // cria o objeto slide conforme o modelo
    await slide.save(); // salva o slide no banco de dados
    resp.send(slide); //devolve o slide salvo para o front     <---------- basicamente o que vc fez antes
    chamarVue({
      type: 'do_fetch',
      msg: 'Novo slide criado'
    });

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

    chamarVue({
      type: 'do_fetch',
      msg: 'Slide removido'
    });
  } catch (e) {
    resp.status(500).send({ mensagem: 'Erro ao remover slide', erro: e.message }); //caso de algum erro com o bd
  }
});


// Aqui para o admin editar slides
app.put('/slides/:titulo', async (req, resp) => {
  try {
    const tituloParaEditar = req.params.titulo; // pega o titulo que vem na url
    const dadosNovos = req.body; // pega os novos dados do slide que vieram no corpo da requisição

    dadosNovos.expiracao = new Date(dadosNovos.expiracao); // CONVverte de string a date

    const slideAtualizado = await Slide.findOneAndUpdate(
      { titulo: tituloParaEditar }, // filtro para encontrar o slide
      dadosNovos, // novos dados para atualizar
      { new: true } // opção para retornar o slide atualizado
    );
    if (!slideAtualizado) {
      return resp.status(404).send({ mensagem: 'Slide não encontrado com esse titulo' });
  }

  resp.send(slideAtualizado); // envia o slide atualizado como resposta

  chamarVue({
    type: 'do_fetch',
    msg: 'Slide atualizado'
  });
  } catch (e) {
    resp.status(500).send({ mensagem: 'Erro ao atualizar slide', erro: e.message });
  }
});

const MONGODB_URI = 'mongodb://localhost:27017/servidor-propaganda';
console.log('Conectando a DB .. .. .');
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Conectado com succeso');
  })
  .catch((err) => {
    console.error('Erro ao conectar a DB:', err);
  });

app.listen(4000, function () {
  console.log("Rodando o servidor na porta 4000");
});
