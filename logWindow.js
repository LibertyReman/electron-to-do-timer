// DOM読み込み完了後
window.addEventListener('DOMContentLoaded', async () => {
  // クエリパラメータの取得
  const urlParams = new URLSearchParams(window.location.search);
  const logpath = urlParams.get('logpath');

  // ログファイルを読み込み、一番下へスクロール
  const filedata = await fetch(logpath);
  const $logcontent = document.querySelector('.js-log-content');
  $logcontent.textContent = await filedata.text();
  $logcontent.scrollTop = $logcontent.scrollHeight;

  // 本日の合計時間を表示
  await displayTodaysTotalHours();

  // CLOSEボタン押下
  document.querySelector('.js-log-close-btn').addEventListener('click', () => {
    window.close();
  });
})

async function displayTodaysTotalHours() {
  const totalMinutes = await window.timer.getTodaysTotalMinutes();
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  document.querySelector('.js-log-todays-total-hours').textContent = `本日の合計：${hours}時間${minutes}分`;
}

