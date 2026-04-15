import { spawn } from 'child_process'
import localtunnel from 'localtunnel'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PORT = '3000'

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const spawnCommand = process.platform === 'win32' ? 'npm' : npmCommand

let viteProcess
let tunnel

async function start() {
  tunnel = await localtunnel({ port: Number(PORT) })
  const tunnelUrl = new URL(tunnel.url)

  console.log('')
  console.log('============================================================')
  console.log('Sign Language Platform - Tunnel Preview')
  console.log('============================================================')
  console.log(`Public URL : ${tunnel.url}`)
  console.log(`Local URL  : http://localhost:${PORT}`)
  console.log('')

  viteProcess = spawn(
    spawnCommand,
    ['run', 'vite', '--', '--host', '0.0.0.0', '--port', PORT, '--strictPort'],
    {
      cwd: resolve(__dirname, '..'),
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: {
        ...process.env,
        VITE_HMR_HOST: tunnelUrl.hostname,
        VITE_HMR_PROTOCOL: 'wss',
        VITE_HMR_CLIENT_PORT: '443',
      },
    },
  )

  viteProcess.on('close', async (code) => {
    if (tunnel) {
      await tunnel.close()
    }
    process.exit(code ?? 0)
  })

  viteProcess.on('error', async (error) => {
    console.error('Failed to start Vite:', error)
    if (tunnel) {
      await tunnel.close()
    }
    process.exit(1)
  })

  tunnel.on('close', () => {
    console.error('Tunnel closed unexpectedly.')
  })
}

async function shutdown() {
  if (viteProcess) {
    viteProcess.kill('SIGINT')
  }
  if (tunnel) {
    await tunnel.close()
  }
}

process.on('SIGINT', async () => {
  await shutdown()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await shutdown()
  process.exit(0)
})

start().catch((error) => {
  console.error('Failed to start tunnel preview:', error)
  process.exit(1)
})
