const { contextBridge, ipcRenderer } = require("electron");

// レンダラープロセスから呼び出す関数を登録
contextBridge.exposeInMainWorld('task', {
  // タスク一覧読み込み関数の実行
  async loadTaskList() {
    // メインプロセス内のloadTaskList関数を実行
    const result = await ipcRenderer.invoke('loadTaskList');
    return result;
  },

  // 画面の横幅をリサイズする関数の実行
  async resizeWindowWidth(width) {
    // メインプロセス内のresizeWindowWidth関数を実行
    const result = await ipcRenderer.invoke('resizeWindowWidth', width);
    return result;
  },

  // タスク保存関数の実行
  async saveTask(name, date) {
    const result = await ipcRenderer.invoke('saveTask', name, date);
    return result;
  },

  // タスク作成画面の作成関数の実行
  async openCreateTaskWindow(name, date) {
    const result = await ipcRenderer.invoke('openCreateTaskWindow', name, date);
    return result;
  },

  // アプリ設定更新関数の実行
  async updateAppSettings(thema, topmost) {
    const result = await ipcRenderer.invoke('updateAppSettings', thema, topmost);
    return result;
  },

});


