/* Après un paiement Stripe, donne au client son code d'accès, sans rien envoyer à la main.
   1) Stripe renvoie le client sur /merci.html?session_id=...
   2) Cette fonction demande à Stripe si cette session est bien PAYÉE
   3) si oui, elle signe un code avec ta clé secrète (variable PRIVATE_JWK, jamais dans le site)
   Variables à définir dans Netlify : STRIPE_KEY (clé restreinte, lecture des sessions Checkout) et PRIVATE_JWK. */
const crypto = require('crypto');
const ALPHA = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const PAYMENT_LINK = 'plink_1USKWxH4WFrkHkZf2q4DNfC4';

function b32enc(u8) {
  let bits = 0, val = 0, out = '';
  for (let i = 0; i < u8.length; i++) {
    val = (val << 8) | u8[i]; bits += 8;
    while (bits >= 5) { bits -= 5; out += ALPHA.charAt((val >> bits) & 31); }
    val &= (1 << bits) - 1;
  }
  if (bits > 0) out += ALPHA.charAt((val << (5 - bits)) & 31);
  return out;
}
const reply = (code, body) => ({
  statusCode: code,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(body)
});

exports.handler = async (event) => {
  try {
    const sid = String((event.queryStringParameters || {}).session_id || '');
    if (!/^cs_(live|test)_[A-Za-z0-9]{10,200}$/.test(sid)) return reply(400, { ok: false, raison: 'lien' });
    const key = process.env.STRIPE_KEY, jwk = process.env.PRIVATE_JWK;
    if (!key || !jwk) return reply(500, { ok: false, raison: 'config' });

    const base = process.env.STRIPE_API_BASE || 'https://api.stripe.com';
    const r = await fetch(base + '/v1/checkout/sessions/' + encodeURIComponent(sid), { headers: { Authorization: 'Bearer ' + key } });
    if (!r.ok) return reply(404, { ok: false, raison: 'introuvable' });
    const s = await r.json();
    if (s.payment_status !== 'paid') return reply(402, { ok: false, raison: 'non-paye' });
    if (s.payment_link !== PAYMENT_LINK) return reply(403, { ok: false, raison: 'autre-produit' });

    // même paiement = même code (identifiant tiré du numéro de session)
    const id = crypto.createHash('sha256').update('nour|' + sid).digest().subarray(0, 6);
    const payload = Buffer.concat([Buffer.from([1]), id]);
    const priv = crypto.createPrivateKey({ key: JSON.parse(jwk), format: 'jwk' });
    const sig = crypto.sign('sha256', payload, { key: priv, dsaEncoding: 'ieee-p1363' });
    const all = Buffer.concat([payload, sig]);
    const code = 'NOUR-' + b32enc(all).match(/.{1,6}/g).join('-');
    return reply(200, { ok: true, code });
  } catch (e) {
    return reply(500, { ok: false, raison: 'erreur' });
  }
};
