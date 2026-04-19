import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { handler } from './netlify/functions/ai-proxy.js'

// Load .env file
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envFile = path.join(__dirname, '.env')
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, 'utf8')
    .split('\n')
    .filter(line => line && !line.startsWith('#'))
    .forEach(line => {
      const [key, ...valueParts] = line.split('=')
      const value = valueParts.join('=')
      if (key && value) {
        process.env[key.trim()] = value.trim()
      }
    })
}

console.log('✓ Loaded environment variables')
console.log('✓ Available keys:')
console.log('  - ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? '✓' : '✗')
console.log('  - GROK_API_KEY:', process.env.GROK_API_KEY ? '✓' : '✗')
console.log('  - GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✓' : '✗')

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
    })
    res.end()
    return
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  let body = ''
  req.on('data', (chunk) => {
    body += chunk.toString()
  })

  req.on('end', async () => {
    try {
      const event = {
        httpMethod: req.method,
        headers: req.headers,
        body,
      }

      const result = await handler(event)
      res.writeHead(result.statusCode, result.headers)
      res.end(result.body)
    } catch (error) {
      console.error('Error handling request:', error)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ success: false, error: error.message }))
    }
  })
})

const PORT = 3001
server.listen(PORT, () => {
  console.log(`Dev proxy server running on http://localhost:${PORT}`)
})
