const $logDate = document.querySelector('.js-log-date');
const $logLeftBtn = document.querySelector('.js-log-prev-btn');
const $logRightBtn = document.querySelector('.js-log-next-btn');
const $logCloseBtn = document.querySelector('.js-log-close-btn');

// DOM読み込み完了後
window.addEventListener('DOMContentLoaded', async () => {
  // 初期化処理
  await initializeFromQuery();

  // 今日の日付をセット
  $logDate.value = new Date().toLocaleDateString('sv-SE');

  // 合計分を表示
  await displayDateTotalMinutes($logDate.value);

  // 日付変更時
  $logDate.onchange = () => {
    displayDateTotalMinutes($logDate.value);
  };

  // 左ボタン押下
  $logLeftBtn.onclick = () => {
    const prevDate = new Date($logDate.value);
    prevDate.setDate(prevDate.getDate() - 1);
    $logDate.value = prevDate.toLocaleDateString('sv-SE');
    displayDateTotalMinutes($logDate.value);
  };

  // 右ボタン押下
  $logRightBtn.onclick = () => {
    const nextDate = new Date($logDate.value);
    nextDate.setDate(nextDate.getDate() + 1);
    $logDate.value = nextDate.toLocaleDateString('sv-SE');
    displayDateTotalMinutes($logDate.value);
  };

  // CLOSEボタン押下
  $logCloseBtn.onclick = () => {
    window.close();
  };

})

// クエリパラメータによる初期化
async function initializeFromQuery() {
  // クエリパラメータの取得
  const urlParams = new URLSearchParams(window.location.search);
  const logpath = urlParams.get('logpath');

  // ログファイルを読み込み、一番下へスクロール
  const filedata = await fetch(logpath);
  const $logcontent = document.querySelector('.js-log-content');
  $logcontent.textContent = await filedata.text();
  $logcontent.scrollTop = $logcontent.scrollHeight;
}

async function displayDateTotalMinutes(date) {
  const totalMinutes = await window.timer.getDateTotalMinutes(date);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  document.querySelector('.js-log-date-total-minutes').textContent = `の合計：${hours}時間${minutes}分`;
}

