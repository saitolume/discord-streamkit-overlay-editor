import { app, BrowserWindow, session } from 'electron'
import path from 'path'

const { DEV, VITE_DEV_SERVER_URL } = import.meta.env

let window: BrowserWindow | null = null
let forceQuit = false

app.commandLine.appendSwitch('disable-site-isolation-trials')

const createMainWindow = async () => {
  window = new BrowserWindow({
    width: 1200,
    height: 900,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nativeWindowOpen: true,
      webSecurity: false,
    },
  })

  window.on('ready-to-show', () => {
    window?.show()
  })

  window.on('close', (event) => {
    if (forceQuit) return
    event.preventDefault()
    window?.hide()
  })

  if (DEV) {
    await window.loadURL(
      typeof VITE_DEV_SERVER_URL === 'string' ? VITE_DEV_SERVER_URL : ''
    )
  } else {
    await window.loadFile('../renderer/index.html')
  }
}

app.on('activate', () => {
  window?.show()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  forceQuit = true
})

app.on('will-quit', () => {
  window = null
})

const allowlist = [
  'https://streamkit.discord.com/*',
  'https://www.youtube.com/live_chat',
]

app
  .whenReady()
  .then(() => {
    session.defaultSession.webRequest.onHeadersReceived(
      {
        urls: allowlist,
      },
      (details, callback) => {
        if (details.responseHeaders === undefined) return callback(details)

        const entries = Object.entries(details.responseHeaders)
        const responseHeaders = Object.fromEntries(
          entries.filter(([key]) => key !== 'x-frame-options')
        )
        callback({
          ...details,
          responseHeaders,
        })
      }
    )
  })
  .then(createMainWindow)
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
