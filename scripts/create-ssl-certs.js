import { certificateFor } from 'devcert'
import { existsSync, mkdirSync, writeFileSync } from 'fs'

if (!existsSync('./certs')) {
  mkdirSync('./certs')
}

const domains = ['ubuntu-vm.mshome.net']

certificateFor(domains, { getCaPath: true })
  .then(({ key, cert, caPath }) => {
    writeFileSync('./certs/devcert.key', key)
    writeFileSync('./certs/devcert.cert', cert)
    writeFileSync('./certs/.capath', caPath)
  })
  .catch(console.error)
