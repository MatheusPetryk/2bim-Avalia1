import { gerarDesenho, numeroValido } from "./desenho.js";

const formulario = document.getElementById("formulario");
const campoNumero = document.getElementById("numero");
const campoEmail = document.getElementById("email");
const area = document.getElementById("desenho");
const mensagem = document.getElementById("mensagem");
const botaoBaixar = document.getElementById("baixar");

let svgAtual = "";

// ---- Login com Google (Google Identity Services) ----
const GOOGLE_CLIENT_ID = "497944650823-6fc28dae0ct1isfpbnhe55t1t841qtgt.apps.googleusercontent.com";

let idToken = null;
const statusLogin = document.getElementById("status-login");

function aoLogar(resposta) {
  idToken = resposta.credential;
  statusLogin.textContent = "Login realizado com Google.";
}

window.addEventListener("load", () => {
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: aoLogar,
  });
  google.accounts.id.renderButton(document.getElementById("botao-google"), {
    theme: "outline",
    size: "large",
  });
});

// ---- Formulário (ainda no navegador) ----
formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  mensagem.textContent = "";

  const numero = Number(campoNumero.value);
  const email = campoEmail.value.trim();

  if (!numeroValido(numero)) {
    mensagem.textContent = "Digite um inteiro entre 1 e 100.";
    return;
  }
  if (email === "") {
    mensagem.textContent = "Informe um e-mail.";
    return;
  }

  svgAtual = gerarDesenho(numero, email);
  area.innerHTML = svgAtual;
  botaoBaixar.hidden = false;
});

botaoBaixar.addEventListener("click", () => {
  const arquivo = new Blob([svgAtual], { type: "image/svg+xml" });
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement("a");
  link.href = url;
  link.download = "exemplo.svg";
  link.click();
  URL.revokeObjectURL(url);
});
