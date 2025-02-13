import { createServer as createHttpsServer } from 'https'
import next from 'next'
import { existsSync, readFileSync } from 'fs'
const chalk = import('chalk')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const PORT = process.env.PORT || 3000

if (!existsSync('./certs/.capath')) {
  console.error(chalk.red('\nError: Missing SSL certificates\n'))

  console.error(`To fix this error, run the command below:`)
  console.error(`→ npm run ssl:setup\n`)

  process.exit()
}

app
  .prepare()
  .then(() => {
    const server = createHttpsServer(
      {
        key: readFileSync('./certs/devcert.key'),
        cert: readFileSync('./certs/devcert.cert'),
      },
      (req, res) => handle(req, res)
    )

    return server.listen(PORT, (err) => {
      if (err) throw err

      console.log('> Ready on port 3000')
    })
  })
  .catch((err) => {
    console.error(err)
  })
