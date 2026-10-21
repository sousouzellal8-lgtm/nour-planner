/* ==================================================================
   RÉGLAGES DE NOUR PLANNER
   C'est le SEUL fichier à modifier pour personnaliser ton site.
   Ouvre-le avec le Bloc-notes (ou n'importe quel éditeur de texte),
   change ce qui est entre guillemets, enregistre, puis remets le
   fichier en ligne. Ne touche pas au reste.
   ================================================================== */
window.NOUR_CONFIG = {

  /* Le prix affiché sur le site et dans l'app (juste du texte). */
  prix: "12 €",

  /* MODE CRÉATEUR EN DIRECT (facultatif). Laisse vide tant que tu n'as pas fait l'installation (option avancée, inutilisée pour l'instant).
     url     = l'adresse REST de ta base Upstash (https://….upstash.io)
     lecture = le jeton « Read Only » (lecture seule) de cette base. Il peut être public : il ne sert qu'à lire.
     NE COLLE JAMAIS ICI le jeton d'écriture : tu le colles une seule fois dans createur.html, sur ton appareil. */
  contenuDistant: { url: "", lecture: "" },

  /* Prix : 12 €. Ce lien Stripe facture 12 € : si tu changes le prix, crée un nouveau lien Stripe au même montant
     et change aussi « prix » ci-dessus, pour que le site et la page de paiement affichent la même chose.
     Le lien de ta page de paiement. Il doit commencer par https://
     Tous les boutons « Acheter » du site et de l'app ouvrent directement ce lien (Stripe). Un lien PayPal.me
     écrit ici est ignoré : l'achat passe toujours par Stripe (PayPal peut être activé dans Stripe, voir plus bas).
     Actuellement : ton lien de paiement Stripe (carte, Apple Pay, Link, Klarna, et les autres moyens
     que tu as activés dans ton compte Stripe). Pour ajouter d'autres moyens, va dans Stripe :
     Paramètres > Paiements > Moyens de paiement. Rien à changer ici. */
  lienAchat: "https://buy.stripe.com/aFa5kDcvEc1L47LcVBfMA00",

  /* Facultatif : un second bouton « Payer avec PayPal », à côté du bouton principal, qui ouvre un lien PayPal.me
     (par exemple "https://www.paypal.me/nourplanner/10EUR"). Laisse "" (vide) pour ne pas l'afficher :
     le mieux est d'activer PayPal directement dans Stripe (Paramètres > Paiements > Moyens de paiement),
     pour que tous les moyens soient sur la même page de paiement. */
  lienPaypal: "",

  /* Facultatif : d'AUTRES moyens de paiement à afficher à côté du bouton d'achat (Revolut, Wero, virement,
     Lydia...). Chaque ligne = un moyen. Le client paie, puis t'écrit avec son e-mail : tu lui envoies son code.
     N'écris QUE des comptes qui existent vraiment et que tu surveilles. Laisse [] pour ne rien afficher.
     "detail" = ce que le client doit copier (identifiant, IBAN...). "lien" = un lien https si tu en as un.
     Exemple (recopie-le sous la ligne autresMoyens, en adaptant) :
     autresMoyens: [
       { nom: "Revolut", lien: "https://revolut.me/ton-identifiant" },
       { nom: "Virement bancaire", detail: "FR76 0000 0000 0000 0000 0000 000" }
     ], */
  autresMoyens: [],

  /* Ton adresse e-mail de contact (affichée dans l'aide et la FAQ). */
  email: "nourplannere@gmail.com",

  /* Fichier de la liste des codes désactivés (voir LISEZ-MOI). */
  fichierCodesBloques: "codes-bloques.json",

  /* ----- Ne pas modifier : clé publique qui vérifie tes codes ----- */
  clePublique: {"kty":"EC","crv":"P-256","x":"bBRHI64whTZVgJS06sp8Kw7zw-kWaizhgJrOKvlDeVo","y":"CnSqm7PjaCY9cTk-wZ9z4QJnGHZUJEzVQp71K6uAiqY"}
};
