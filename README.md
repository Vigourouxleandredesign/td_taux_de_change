# Bureau de change — Taux de change XPF

Application Vue.js affichant les taux de conversion entre le **franc pacifique (XPF)** et les principales devises du Pacifique.

## Installation

```bash
npm install
```

Copiez `.env.example` vers `.env` et ajoutez votre clé API :

```
VUE_APP_EXCHANGE_RATE_API_KEY=votre_cle
```

## Développement (JSON local — recommandé)

En mode `npm run serve`, l’application charge **`public/data/latest-xpf.json`** et **n’appelle pas l’API**, pour préserver le quota gratuit (1 500 requêtes/mois).

### Mettre à jour le fichier JSON depuis l’API

Une seule commande (1 appel API) :

```bash
npm run fetch:rates
```

Cela écrase `public/data/latest-xpf.json` avec les taux actuels XPF.

### Forcer l’API en local (tests)

Dans `.env` :

```
VUE_APP_USE_LOCAL_RATES=false
```

Puis redémarrer `npm run serve`.

## Production (Netlify)

Le build de production utilise **l’API live** automatiquement. Configurez `VUE_APP_EXCHANGE_RATE_API_KEY` dans les variables d’environnement Netlify.

- **Build command :** `npm run build`
- **Publish directory :** `dist`

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run serve` | Serveur de dev (JSON local) |
| `npm run build` | Build production (API) |
| `npm run fetch:rates` | Télécharge les taux XPF dans le JSON local |

## Développement en 2 étapes (consigne du TD)

Le sujet demande une **progression**, pas deux applications parallèles :

1. **Étape 1 — Options API** (`/`)  
   Composant `ExchangeBoardOptions.vue` : `data()`, `computed`, `mounted`, `beforeUnmount`.

2. **Étape 2 — Composition API** (`/composition`)  
   Refactorisation dans `ExchangeBoard.vue` avec `ref()`, `computed()`, `onMounted()` et `onUnmounted()` pour l’état et le chargement des taux (composable `useExchangeRates`).

**Version à déployer sur Netlify :** `/composition` (lien final du projet).

### Actualisation automatique (toutes les heures)

- Intervalle : **3 600 000 ms** (1 heure), via `setInterval`
- Au montage : `mounted()` (Options) / `onMounted()` (Composition) → premier chargement puis timer
- Pied de page : date et heure de la **dernière mise à jour** (format `fr-FR`) + prochaine actualisation prévue

## Drapeaux (Flagpedia → flagcdn.com)

Le TD demande d’afficher les drapeaux via **Flagpedia**. La documentation officielle d’intégration se trouve ici :

- [Flagpedia — Embed country flag images over CDN (HTTP API)](https://flagpedia.net/download/api)

Cette page décrit l’usage du CDN **`https://flagcdn.com`**, avec des URLs du type :

```text
https://flagcdn.com/56x42/eu.png
```

### Pourquoi flagcdn.com dans le code ?

| Approche | Résultat |
|----------|----------|
| URLs `https://flagpedia.net/data/flags/w580/{code}.png` (première version) | OK pour la plupart des pays, mais **404 pour `eu`** (drapeau Union européenne, indispensable pour l’euro) |
| URLs `https://flagcdn.com/{taille}/{code}.png` (version actuelle) | **Tous** les drapeaux du tableau s’affichent, y compris `eu` |

**Conclusion pour le correcteur :** on suit la doc Flagpedia, qui pointe vers **flagcdn.com** comme CDN d’hébergement des images. Ce n’est pas un service tiers différent : c’est le canal recommandé par Flagpedia pour embarquer les drapeaux.

### Où c’est implémenté

| Fichier | Rôle |
|---------|------|
| `src/constants/currencies.js` | Liste des devises + `flagCode` (ISO 3166-1 alpha-2) + fonctions `getFlagUrl()` / `getFlagSrcSet()` |
| `src/components/CurrencyRow.vue` | Affiche le drapeau dans chaque ligne (`<img :src="flagUrl">`) |

Exemple pour l’euro : `flagCode: 'eu'` → `https://flagcdn.com/56x42/eu.png`.

Aucun fichier image n’est versionné dans `public/` : les PNG sont chargés à la volée depuis le CDN.

## Stack

- Vue 3 — Options API puis Composition API
- Vue Router
- ExchangeRate-API — [documentation](https://www.exchangerate-api.com/docs/standard-requests)
- Drapeaux — [Flagpedia (API / CDN)](https://flagpedia.net/download/api) via **flagcdn.com**
