// script.js
// A página só envia o número e o token. O desenho é gerado no servidor.

const formulario = document.getElementById("formulario");
const campoNumero = document.getElementById("numero");
const area = document.getElementById("desenho");
const mensagem = document.getElementById("mensagem");
const botaoBaixar = document.getElementById("baixar");
const statusLogin = document.getElementById("status-login");

let svgAtual = "";
let idToken = null;

// ---- Login com Google ----
const GOOGLE_CLIENT_ID = "497944650823-6fc28dae0ct1isfpbnhe55t1t841qtgt.apps.googleusercontent.com";

function aoLogar(resposta) {
  idToken = resposta.credential;
  statusLogin.textContent = "Login realizado com Google.";
  mensagem.textContent = "";
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

// ---- Formulário ----
formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensagem.textContent = "";

  if (!idToken) {
    mensagem.textContent = "Faça login com o Google antes de desenhar.";
    return;
  }

  const numero = Number(campoNumero.value);

  try {
    const resposta = await fetch("/api/desenho", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + idToken,
      },
      body: JSON.stringify({ numero }),
    });

    if (resposta.status === 400) {
      mensagem.textContent = "Erro 400: digite um inteiro entre 1 e 100.";
      return;
    }
    if (resposta.status === 401) {
      idToken = null;
      statusLogin.textContent = "Sessão inválida ou expirada.";
      mensagem.textContent = "Erro 401: faça login com o Google novamente.";
      return;
    }
    if (!resposta.ok) {
      mensagem.textContent = "Erro inesperado (" + resposta.status + ").";
      return;
    }

    svgAtual = await resposta.text();
    area.innerHTML = svgAtual;
    botaoBaixar.hidden = false;
  } catch {
    mensagem.textContent = "Falha de rede ao chamar o servidor.";
  }
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