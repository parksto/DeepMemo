# Notice de confidentialité - Export PDF

Ce document contient le message à afficher aux utilisateurs lors du premier export PDF.

## Message français

```
┌─────────────────────────────────────────────────────┐
│     Export PDF - Informations de confidentialité    │
└─────────────────────────────────────────────────────┘

Pour protéger nos coûts serveur, nous limitons les exports PDF :
• 5 PDFs par heure (maximum)
• 20 PDFs par jour (maximum)

Ces limites sont basées sur votre adresse IP, qui est hashée
(SHA-256) et conservée pendant 24 heures uniquement pour le
rate limiting. Votre IP n'est jamais stockée en clair.

Note : Votre hébergeur web (et le nôtre) conservent déjà les
adresses IP dans leurs logs standards (généralement 30-90 jours).
Notre système de rate limiting est beaucoup plus court (24h) et
utilise uniquement un hash cryptographique.

Aucune donnée de votre document n'est sauvegardée sur nos serveurs.
Le PDF est généré et envoyé directement à votre navigateur, puis
supprimé immédiatement.

Alternative offline : Un outil CLI (ligne de commande) est
disponible sur GitHub pour exporter sans limitation ni connexion
internet. Voir le dossier `bin/` du dépôt.

[ Compris, générer le PDF ]   [ Plus d'infos ]   [ Annuler ]

☐ Ne plus afficher ce message
```

## Message anglais

```
┌─────────────────────────────────────────────────────┐
│      PDF Export - Privacy Information               │
└─────────────────────────────────────────────────────┘

To protect our server costs, we limit PDF exports:
• 5 PDFs per hour (maximum)
• 20 PDFs per day (maximum)

These limits are based on your IP address, which is hashed
(SHA-256) and stored for 24 hours only for rate limiting.
Your IP is never stored in plain text.

Note: Your web host (and ours) already store IP addresses in
their standard logs (typically 30-90 days). Our rate limiting
system is much shorter (24h) and only uses a cryptographic hash.

No data from your document is saved on our servers. The PDF is
generated and sent directly to your browser, then immediately
deleted.

Offline alternative: A CLI tool is available on GitHub to export
without limitations or internet connection. See the `bin/` folder
in the repository.

[ OK, generate PDF ]   [ More info ]   [ Cancel ]

☐ Don't show this again
```

## Implémentation dans l'app

### Option 1 : Modale Bootstrap-style

Ajouter dans `index.html` avant `</body>` :

```html
<!-- Modal Privacy PDF -->
<div class="modal-overlay" id="pdfPrivacyModal">
  <div class="modal">
    <h2>📄 <span data-i18n="modals.pdfPrivacy.title">Export PDF - Confidentialité</span></h2>
    <div class="modal-body">
      <p style="color: var(--text-secondary); margin-bottom: 16px;">
        <span data-i18n="modals.pdfPrivacy.intro">
          Pour protéger nos coûts serveur, nous limitons les exports :
        </span>
      </p>
      <ul style="margin-left: 20px; margin-bottom: 16px;">
        <li data-i18n="modals.pdfPrivacy.limitHour">5 PDFs par heure (maximum)</li>
        <li data-i18n="modals.pdfPrivacy.limitDay">20 PDFs par jour (maximum)</li>
      </ul>
      <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 12px;">
        <span data-i18n="modals.pdfPrivacy.hashInfo">
          Ces limites sont basées sur votre IP hashée (SHA-256), conservée 24h uniquement.
          Votre IP n'est jamais stockée en clair.
        </span>
      </p>
      <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 12px;">
        <strong data-i18n="modals.pdfPrivacy.noteTitle">Note :</strong>
        <span data-i18n="modals.pdfPrivacy.noteContent">
          Votre hébergeur web conserve déjà les IPs dans ses logs standards (30-90 jours).
          Notre système de rate limiting est plus court (24h) et utilise un hash cryptographique.
        </span>
      </p>
      <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 12px;">
        <span data-i18n="modals.pdfPrivacy.noData">
          Aucune donnée de votre document n'est sauvegardée. Le PDF est généré
          et envoyé directement à votre navigateur.
        </span>
      </p>
      <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">
        <strong data-i18n="modals.pdfPrivacy.offlineTitle">Alternative offline :</strong>
        <span data-i18n="modals.pdfPrivacy.offlineContent">
          Un outil CLI est disponible sur GitHub pour exporter sans limitation
          ni connexion internet (dossier <code>bin/</code>).
        </span>
      </p>
      <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
        <input type="checkbox" id="pdfPrivacyDontShowAgain">
        <span data-i18n="modals.pdfPrivacy.dontShow">Ne plus afficher ce message</span>
      </label>
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary btn-small" data-i18n="modals.pdfPrivacy.cancel"
              onclick="app.closePdfPrivacyModal()">Annuler</button>
      <button class="btn btn-secondary btn-small" data-i18n="modals.pdfPrivacy.moreInfo"
              onclick="app.openPdfPrivacyInfo()">Plus d'infos</button>
      <button class="btn btn-small" data-i18n="modals.pdfPrivacy.confirm"
              onclick="app.confirmPdfPrivacyAndExport()">✓ Compris, générer</button>
    </div>
  </div>
</div>
```

### Option 2 : Fonction dans app.js

Ajouter dans `src/js/app.js` :

```javascript
// PDF Privacy Modal
window.app.showPdfPrivacyModal = function() {
  const modal = document.getElementById('pdfPrivacyModal');
  const dontShow = localStorage.getItem('deepmemo_pdf_privacy_accepted');

  if (dontShow === 'true') {
    // Directement exporter
    return true;
  }

  modal.style.display = 'flex';
  return false;
};

window.app.closePdfPrivacyModal = function() {
  document.getElementById('pdfPrivacyModal').style.display = 'none';
};

window.app.confirmPdfPrivacyAndExport = async function() {
  const dontShow = document.getElementById('pdfPrivacyDontShowAgain').checked;

  if (dontShow) {
    localStorage.setItem('deepmemo_pdf_privacy_accepted', 'true');
  }

  closePdfPrivacyModal();

  // Appeler la vraie fonction d'export
  await confirmExportPDF();
};

window.app.openPdfPrivacyInfo = function() {
  // Ouvrir GitHub README dans nouvel onglet
  window.open('https://github.com/votre-repo/tree/main/cloudflare-worker#privacy', '_blank');
};

// Modifier confirmExportPDF pour vérifier la modale
window.app.confirmExportPDF = async function() {
  // Vérifier si modale doit être affichée
  if (!showPdfPrivacyModal()) {
    return; // Modale affichée, attendre confirmation
  }

  // Reste du code existant...
  try {
    if (!navigator.onLine) {
      showToast(t('messages.pdfRequiresOnline'), '⚠️');
      return;
    }
    // ... code fetch worker ...
  } catch (error) {
    // ...
  }
};
```

### Strings i18n à ajouter

Dans `src/js/locales/fr.js` et `en.js` :

```javascript
// fr.js
modals: {
  pdfPrivacy: {
    title: "Export PDF - Confidentialité",
    intro: "Pour protéger nos coûts serveur, nous limitons les exports :",
    limitHour: "5 PDFs par heure (maximum)",
    limitDay: "20 PDFs par jour (maximum)",
    hashInfo: "Ces limites sont basées sur votre IP hashée (SHA-256), conservée 24h uniquement. Votre IP n'est jamais stockée en clair.",
    noteTitle: "Note :",
    noteContent: "Votre hébergeur web conserve déjà les IPs dans ses logs standards (30-90 jours). Notre système de rate limiting est plus court (24h) et utilise un hash cryptographique.",
    noData: "Aucune donnée de votre document n'est sauvegardée. Le PDF est généré et envoyé directement à votre navigateur.",
    offlineTitle: "Alternative offline :",
    offlineContent: "Un outil CLI est disponible sur GitHub pour exporter sans limitation ni connexion internet (dossier bin/).",
    dontShow: "Ne plus afficher ce message",
    cancel: "Annuler",
    moreInfo: "Plus d'infos",
    confirm: "✓ Compris, générer"
  }
}

// en.js
modals: {
  pdfPrivacy: {
    title: "PDF Export - Privacy",
    intro: "To protect our server costs, we limit exports:",
    limitHour: "5 PDFs per hour (maximum)",
    limitDay: "20 PDFs per day (maximum)",
    hashInfo: "These limits are based on your hashed IP (SHA-256), stored for 24h only. Your IP is never stored in plain text.",
    noteTitle: "Note:",
    noteContent: "Your web host already stores IPs in standard logs (30-90 days). Our rate limiting is shorter (24h) and uses a cryptographic hash.",
    noData: "No data from your document is saved. The PDF is generated and sent directly to your browser.",
    offlineTitle: "Offline alternative:",
    offlineContent: "A CLI tool is available on GitHub to export without limitations or internet connection (bin/ folder).",
    dontShow: "Don't show this again",
    cancel: "Cancel",
    moreInfo: "More info",
    confirm: "✓ OK, generate"
  }
}
```

## RGPD Compliance

Ce système respecte le RGPD car :
1. **Finalité légitime** : Anti-abuse pour protéger les coûts serveur
2. **Minimisation** : Seul un hash d'IP est stocké (pas l'IP en clair)
3. **Durée minimale** : TTL automatique de 24h (vs 30-90j pour logs hébergeurs)
4. **Transparence** : Information claire à l'utilisateur avant utilisation
5. **Pas de profilage** : Aucune donnée personnelle, juste compteur anonyme
6. **Droit d'accès** : Impossible de lier le hash à une personne spécifique
7. **Alternative** : CLI tool sans tracking pour usage offline

Aucune base légale de consentement nécessaire car :
- Pas de traitement de données personnelles (hash != donnée personnelle selon CNIL)
- Finalité technique stricte (rate limiting)
- Pas de transfert ni partage de données
