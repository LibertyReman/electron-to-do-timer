const $topmost = document.querySelector('.js-topmost-checkbox');

// DOM読み込み完了後
window.addEventListener('DOMContentLoaded', () => {
  initializeFromQuery();

  // Saveボタン押下時
  document.querySelector('.js-settings-save-btn').addEventListener('click', async () => {
    await window.timer.updateAppSettings($topmost.checked);
  });
})


// クエリパラメータによる初期化
function initializeFromQuery() {
  // クエリパラメータの取得
  const urlParams = new URLSearchParams(window.location.search);
  let topmost = urlParams.get('topmost');

  // チェックボックスの設定
  if (topmost === 'true') $topmost.checked = true;
}


