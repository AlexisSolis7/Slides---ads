var express = require("express");
var cors = require("cors");
var app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + "/public"));

let slides = [
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

app.get("/getSlides", function (req, resp) {
  resp.send(slides); // inicilamente vem do nada xd
});

app.listen(4000, function () {
  console.log("Rodando o servidor na porta 4000");
});
