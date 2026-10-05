import { gerarDesenho } from '../../lib/desenho.js';

function erro(status, mensagem, extra = {}) {
  return new Response(JSON.stringify({ erro: mensagem }), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...extra },
  });
}

export async function onRequest({ request, env }) {
  // 1) Método (405)
  if (request.method !== 'POST') {
    return erro(405, 'Use POST.', { Allow: 'POST' });
  }

  // 2) Corpo (400)
  let corpo;
  try {
    corpo = await request.json();
  } catch {
    return erro(400, 'Corpo ausente ou JSON inválido.');
  }
  const numero = corpo && corpo.numero;
  if (!Number.isInteger(numero) || numero < 1 || numero > 100) {
    return erro(400, 'numero deve ser inteiro de 1 a 100.');
  }

  // 3) Token (401)
  const auth = request.headers.get('Authorization') || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) {
    return erro(401, 'Token ausente.');
  }

  let info;
  try {
    const r = await fetch(
      'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(m[1].trim())
    );
    if (r.status !== 200) {
      return erro(401, 'Token inválido ou expirado.');
    }
    info = await r.json();
  } catch {
    return erro(401, 'Não foi possível validar o token.');
  }

  if (!env.GOOGLE_CLIENT_ID || info.aud !== env.GOOGLE_CLIENT_ID) {
    return erro(401, 'Token de outro aplicativo.');
  }
  if (String(info.email_verified) !== 'true' || !info.email) {
    return erro(401, 'E-mail não verificado.');
  }

  // 200: o e-mail vem do token, nunca do cliente
  const svg = gerarDesenho(numero, info.email);
  return new Response(svg, {
    status: 200,
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store' },
  });
}
