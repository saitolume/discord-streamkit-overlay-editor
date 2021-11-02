import { spawn } from 'child_process'
import path from 'path'
import { build, createLogger, createServer } from 'vite'

/**
 * @param option {{ name: string, configFile: import('vite').InlineConfig['configFile'], writeBundle: import('vite').Plugin['writeBundle'] }}
 */
const getWatcher = ({ name, configFile, writeBundle }) => {
  return build({
    configFile,
    build: {
      watch: {},
    },
    plugins: [{ name, writeBundle }],
  })
}

/**
 * @param server {import('vite').ViteDevServer}
 */
const createMainWatcher = (server) => {
  // Write a value to an environment variable to pass it to the main process.
  {
    const protocol = `http${server.config.server.https ? 's' : ''}:`
    const host = server.config.server.host ?? 'localhost'
    const port = server.config.server.port ?? 3000
    const path = '/'
    process.env.VITE_DEV_SERVER_URL = `${protocol}//${host}:${port}${path}`
  }

  const logger = createLogger('info', {
    prefix: '[main]',
  })

  /** @type {import('child_process').ChildProcessWithoutNullStreams | null} */
  let spawnProcess = null

  return getWatcher({
    name: 'reload-app-on-main-package-change',
    configFile: path.resolve('main/vite.config.ts'),
    async writeBundle() {
      if (spawnProcess !== null) {
        spawnProcess.kill('SIGINT')
        spawnProcess = null
      }

      spawnProcess = spawn(
        path.resolve(
          'node_modules/electron/dist/Electron.app/Contents/MacOS/Electron'
        ),
        [path.resolve('dist/main/index.cjs')]
      )

      spawnProcess.stdout.on(
        'data',
        (d) =>
          d.toString().trim() && logger.warn(d.toString(), { timestamp: true })
      )
      spawnProcess.stderr.on(
        'data',
        (d) =>
          d.toString().trim() && logger.error(d.toString(), { timestamp: true })
      )
    },
  })
}

try {
  const server = await createServer({
    configFile: path.resolve('renderer/vite.config.ts'),
  })

  await createMainWatcher(server)
  await server.listen()
} catch (e) {
  console.error(e)
  process.exit(1)
}
