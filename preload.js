const { contextBridge, ipcRenderer } = require("electron");

// レンダラープロセスから呼び出す関数を登録
contextBridge.exposeInMainWorld('timer', {
  // アプリ設定更新関数の実行
  async updateAppSettings(topmost) {
    const result = await ipcRenderer.invoke('updateAppSettings', topmost);
    return result;
  },

});


