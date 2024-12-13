import { app, shell, BrowserWindow, ipcMain, Tray, Menu, Options } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import './store.ts'
import { store } from './store.ts'

let isQuiting = false
let tray: Tray | null = null

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    icon: join(__dirname, '../../src/renderer/src/assets/electron.png'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      contextIsolation: true,
      nodeIntegration: true
    },
    width: 400,
    height: 600,
    show: false
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR para desenvolvimento ou arquivo HTML em produção
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Configuração do Tray
  tray = new Tray(join(__dirname, '../../src/renderer/src/assets/electron.png')) // Corrigir o caminho do ícone
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Abrir configurações',
      click: () => {
        mainWindow?.show()
      }
    },
    {
      label: 'Fechar',
      click: () => {
        isQuiting = true
        app.quit()
      }
    }
  ])

  tray.setToolTip('Aplicação de backup')
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    mainWindow?.isVisible() ? mainWindow.hide() : mainWindow?.show()
  })

  mainWindow.on('close', (e) => {
    if (!isQuiting) {
      e.preventDefault()
      mainWindow?.hide()
    }
  })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))
  ipcMain.handle('getSettings', () => store.store)
  ipcMain.handle('setSettings', (_event, newSettings: Options) => {
    store.set(newSettings)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
