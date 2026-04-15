import { spawn } from 'child_process'
import os from 'os'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PORT = '3000'

function isPrivateIPv4(ip) {
  if (!ip || typeof ip !== 'string') return false

  if (ip.startsWith('10.')) return true
  if (ip.startsWith('192.168.')) return true

  const match = ip.match(/^172\.(\d{1,3})\./)
  if (!match) return false

  const secondOctet = Number(match[1])
  return secondOctet >= 16 && secondOctet <= 31
}

function getLocalIPs() {
  const interfaces = os.networkInterfaces()
  const ips = []

  for (const ifaces of Object.values(interfaces)) {
    for (const iface of ifaces || []) {
      if (iface.family !== 'IPv4' || iface.internal) continue
      if (iface.address.startsWith('169.254.')) continue
      if (!isPrivateIPv4(iface.address)) continue
      ips.push(iface.address)
    }
  }

  return [...new Set(ips)]
}

const allIPs = getLocalIPs()
const preferredIP = allIPs[0] || 'localhost'

console.log('')
console.log('============================================================')
console.log('Sign Language Platform - Mobile Development Mode')
console.log('============================================================')
console.log('')
console.log(`Local URL : http://localhost:${PORT}`)
console.log(`LAN URL   : http://${preferredIP}:${PORT}`)
if (allIPs.length > 1) {
  console.log(`All LAN IPs: ${allIPs.join(', ')}`)
}
console.log('')
console.log('If phone cannot open the page:')
console.log('1) Ensure phone and computer are on the same Wi-Fi')
console.log('2) Turn off phone VPN/proxy')
console.log('3) Allow Node.js through Windows Firewall')
console.log('')

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const viteArgs = ['run', 'vite', '--', '--host', '0.0.0.0', '--port', PORT, '--strictPort']

const viteProcess = spawn(npmCommand, viteArgs, {
  cwd: resolve(__dirname, '..'),
  stdio: 'inherit',
  env: {
    ...process.env,
    ...(preferredIP !== 'localhost' ? { VITE_HMR_HOST: preferredIP } : {}),
  },
})

viteProcess.on('close', (code) => {
  process.exit(code ?? 0)
})

viteProcess.on('error', (error) => {
  console.error('Failed to start Vite:', error)
  process.exit(1)
})
