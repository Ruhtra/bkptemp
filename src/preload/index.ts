import { contextBridge, Options } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

//fixing typing for Options

export interface IApi {
  getConfig: () => Promise<Options>
  setConfig: (newSettings: Options) => void
  openFile: (type: 'file' | 'folder' | 'any') => Promise<string[]>
}
// Custom APIs for renderer
const api: IApi = {
  getConfig: async () => {
    return await electronAPI.ipcRenderer.invoke('getSettings')
  },
  setConfig: (newSettings: Options) => {
    electronAPI.ipcRenderer.invoke('setSettings', newSettings)
  },
  openFile: async (type: 'file' | 'folder' | 'any'): Promise<string[]> => {
    return await electronAPI.ipcRenderer.invoke('dialog:openFile', type)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
