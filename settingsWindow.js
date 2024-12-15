const $sound = document.querySelector('.js-sound-select');
const $volume = document.querySelector('.js-volume-range');
const $topmost = document.querySelector('.js-topmost-checkbox');
const $resetHours = document.querySelector('.js-reset-hours-number');

// DOM読み込み完了後
window.addEventListener('DOMContentLoaded', () => {
  initializeFromQuery();

  // リセット時間入力時
  $resetHours.oninput = () => {
    // 入力を2桁に制限
    $resetHours.value = $resetHours.value.slice(0, 2);

    // 最大値を23に固定
    let value = parseInt($resetHours.value, 10);
    if(value > 23) value = 23;
    $resetHours.value = value;
  };

  // Saveボタン押下時
  document.querySelector('.js-settings-save-btn').addEventListener('click', async () => {
    const settings = {
      sound: $sound.value,
      volume: $volume.value,
      resetHours: $resetHours.value,
      topmost: $topmost.checked
    };

    await window.timer.updateAppSettings(settings);
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

  // リセット時間の設定
  $resetHours.value = appSettings.resetHours;

  // チェックボックスの設定
  if (appSettings.topmost === true) $topmost.checked = true;
}


