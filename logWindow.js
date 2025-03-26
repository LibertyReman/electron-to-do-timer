const $logDate = document.querySelector('.js-log-date');
const $logLeftBtn = document.querySelector('.js-log-prev-btn');
const $logRightBtn = document.querySelector('.js-log-next-btn');
const $logSearch = document.querySelector('.js-log-search');
const $logCloseBtn = document.querySelector('.js-log-close-btn');

// DOM読み込み完了後
window.addEventListener('DOMContentLoaded', async () => {
  // 初期化処理
  initializeTabs();
  await initializeFromQuery();
  initializeChart();

  // 今日の合計分を表示
  $logDate.value = new Date().toLocaleDateString('sv-SE');
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

  // ログ検索入力時
  $logSearch.oninput = () => {
    initializeSearchLog();
    searchLog($logSearch.value);
    displayLogSearchSum($logSearch.value);
  };

  // CLOSEボタン押下
  $logCloseBtn.onclick = () => {
    window.close();
  };

})

function initializeTabs() {
  const $tabs = document.querySelectorAll(".js-tab li");
  const $contents = document.querySelectorAll(".js-tab-contents > div");

  $tabs.forEach((tab, index) => {
    // タブ押下
    tab.addEventListener("click", () => {
      $tabs.forEach(l => l.classList.remove("active"));
      $contents.forEach(c => c.classList.remove("active"));

      tab.classList.add("active");
      $contents[index].classList.add("active");

      // Searchタブでログ検索していない場合
      if ($contents[index].querySelector(".js-log-content-search") && $logSearch.value == "") {
        initializeSearchLog();
      }
    });
  });
}

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

  document.querySelector('.js-log-date-sum').textContent = `の合計：${hours}時間${minutes}分`;
}

function displayLogSearchSum(txt) {
  if (txt == "") {
    document.querySelector('.js-log-search-sum').textContent = `"" の合計：0時間0分`;
    return;
  }

  const $logcontentSearch = document.querySelector('.js-log-content-search');
  const logText = $logcontentSearch.textContent;

  // 分を抽出して合計を計算
  const lines = logText.split("\n");
  let totalMinutes = 0;
  lines.forEach(line => {
    // 正規表現で「数字+分」を見つける
    const match = line.match(/(\d{1,3})分/);
    if (match) {
      totalMinutes += parseInt(match[1], 10);
    }
  });

  // 合計時間を表示
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  document.querySelector('.js-log-search-sum').textContent = `"${txt}" の合計：${hours}時間${minutes}分`;
}

async function initializeChart() {
  // 過去7日間の日付を生成
  const today = new Date();
  const labels = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() - i);
    return date.toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' });
  }).reverse();
  const data = await Promise.all(
    Array.from({ length: 7 }, async (_, i) => {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const totalMinutes = await window.timer.getDateTotalMinutes(date.toLocaleDateString('sv-SE'));
      return (totalMinutes / 60).toFixed(1);
    }).reverse()
  );

  // グラフ作成
  const $chart = document.querySelector(".js-chart");
  new Chart($chart, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        borderWidth: 2
      }]
    },
    options: {
      animation: {
        duration: 0
      },
      plugins: {
        title: {
          display: false
        },
        legend: {
          display: false
        },
        tooltip: {
          enabled: false
        },
        datalabels: {
          align: 'top',
          anchor: 'center',
          font: {
            weight: 'bold'
          },
          formatter: (value) => value + 'h'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}

// ログファイルを読み込み、一番下へスクロール
function initializeSearchLog() {
  const $logcontent = document.querySelector('.js-log-content');
  const $logcontentSearch = document.querySelector('.js-log-content-search');
  $logcontentSearch.textContent = $logcontent.textContent;
  $logcontentSearch.scrollTop = $logcontentSearch.scrollHeight;
}

// ログ検索
function searchLog(txt) {
  const $logcontentSearch = document.querySelector('.js-log-content-search');
  const lines = $logcontentSearch.textContent.split("\n");

  // 検索ワードをスペースで分割し、小文字に変換
  const keywords = txt.toLowerCase().split(/\s+/).filter(Boolean);

  const filteredLines = lines.filter(line => {
    const lowerLine = line.toLowerCase();
    // すべてのキーワードが含まれるかチェック（AND 条件）
    return keywords.every(keyword => lowerLine.includes(keyword));
  });

  $logcontentSearch.textContent = filteredLines.join("\n");
}


