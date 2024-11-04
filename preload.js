const { contextBridge, ipcRenderer } = require("electron");

// レンダラープロセスから呼び出す関数を登録
contextBridge.exposeInMainWorld('timer', {
  // アプリ設定更新関数の実行
  async updateAppSettings(sound, topmost) {
    const result = await ipcRenderer.invoke('updateAppSettings', sound, topmost);
    return result;
  },

  // ログ保存関数の実行
  async saveLog(log) {
    const result = await ipcRenderer.invoke('saveLog', log);
    return result;
  },

});


