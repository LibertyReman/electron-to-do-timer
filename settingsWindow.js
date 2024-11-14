const $sound = document.querySelector('.js-sound-select');
const $volume = document.querySelector('.js-volume-range');
const $topmost = document.querySelector('.js-topmost-checkbox');

// DOM読み込み完了後
window.addEventListener('DOMContentLoaded', () => {
  initializeFromQuery();

  // Saveボタン押下時
  document.querySelector('.js-settings-save-btn').addEventListener('click', async () => {
    await window.timer.updateAppSettings($sound.value, $volume.value, $topmost.checked);
  });

  // CANCELボタン押下
  document.querySelector('.js-settings-cancel-btn').addEventListener('click', () => {
    window.close();
  });
})


// クエリパラメータによる初期化
function initializeFromQuery() {
  // クエリパラメータの取得
  const urlParams = new URLSearchParams(window.location.search);
  const data = urlParams.get('data');
  const appSettings = JSON.parse(decodeURIComponent(data));

  // レンジスライダーの設定
  $volume.value = appSettings.volume;

  // ドロップダウンリストの設定
  $sound.value = appSettings.sound;
  // チェックボックスの設定
  if (appSettings.topmost === true) $topmost.checked = true;
}


