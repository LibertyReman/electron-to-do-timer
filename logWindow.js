// DOM読み込み完了後
window.addEventListener('DOMContentLoaded', () => {
  // クエリパラメータの取得
  const urlParams = new URLSearchParams(window.location.search);
  const logpath = urlParams.get('logpath');

  // ログファイルを読み込み、一番下へスクロール
  const $iframe = document.querySelector('.js-iframe');
  $iframe.src = logpath;
  const iframeDocument = $iframe.contentDocument;
  iframeDocument.documentElement.scrollTop = iframeDocument.documentElement.scrollHeight;

  // CLOSEボタン押下
  document.querySelector('.js-log-close-btn').addEventListener('click', () => {
    window.close();
  });
})


