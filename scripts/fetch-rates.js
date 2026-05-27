const fs = require('fs')
const path = require('path')
const https = require('https')

const ENV_PATH = path.join(__dirname, '..', '.env')
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'data', 'latest-xpf.json')

function loadApiKey () {
  if (!fs.existsSync(ENV_PATH)) {
    console.error('Fichier .env introuvable. Ajoutez EXCHANGE_RATE_API_KEY (ou VUE_APP_EXCHANGE_RATE_API_KEY).')
    process.exit(1)
  }

  const content = fs.readFileSync(ENV_PATH, 'utf8')
  const patterns = [
    /^\s*EXCHANGE_RATE_API_KEY\s*=\s*(.+)\s*$/m,
    /^\s*VUE_APP_EXCHANGE_RATE_API_KEY\s*=\s*(.+)\s*$/m
  ]

  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match && match[1].trim()) {
      return match[1].trim()
    }
  }

  console.error('EXCHANGE_RATE_API_KEY (ou VUE_APP_EXCHANGE_RATE_API_KEY) est vide dans .env')
  process.exit(1)
}

function fetchRates (apiKey) {
  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/XPF`

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = ''
      res.on('data', (chunk) => { body += chunk })
      res.on('end', () => {
        try {
          resolve(JSON.parse(body))
        } catch (e) {
          reject(new Error('Réponse API invalide'))
        }
      })
    }).on('error', reject)
  })
}

async function main () {
  const apiKey = loadApiKey()
  console.log('Téléchargement des taux XPF…')

  const data = await fetchRates(apiKey)

  if (data.result === 'error') {
    console.error('Erreur API :', data['error-type'])
    process.exit(1)
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(data, null, 2)}\n`, 'utf8')

  console.log(`OK → ${OUTPUT_PATH}`)
  console.log('Dernière MAJ :', data.time_last_update_utc)
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
