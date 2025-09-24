const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openImage: (filePath) => ipcRenderer.send('open-image', filePath)
});
