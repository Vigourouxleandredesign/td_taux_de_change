# Bureau de change — Taux de change XPF

Application Vue.js affichant les taux de conversion entre le franc pacifique (XPF) et les principales devises du Pacifique.

## Installation

```bash
npm install
cp .env.example .env
```

Renseigner `EXCHANGE_RATE_API_KEY` dans `.env` pour la mise à jour locale des taux (`npm run fetch:rates`).

## Développement

```bash
npm run serve
```

En développement, les taux sont chargés depuis `public/data/latest-xpf.json` (aucun appel API).

Mettre à jour le fichier JSON :

```bash
npm run fetch:rates
```

## Production

Build :

```bash
npm run build
```

Déploiement Netlify :

- **Build command :** `npm run build`
- **Publish directory :** `dist`
- **Variable d'environnement :** `EXCHANGE_RATE_API_KEY` (côté Functions uniquement)

Les taux en production passent par `/.netlify/functions/rates` (clé API côté serveur, cache 1 h).

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run serve` | Serveur de développement |
| `npm run build` | Build production |
| `npm run fetch:rates` | Télécharge les taux XPF dans `public/data/latest-xpf.json` |

## Stack

- Vue 3 (Composition API)
- Vue Router
- ExchangeRate-API
- Drapeaux via [flagcdn.com](https://flagcdn.com)
