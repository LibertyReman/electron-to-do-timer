let appSettings = null
let todayDate = null;
let weekChart = null;
let weekChartDate = null;
const $logDateInput = document.querySelector('.js-log-date-input');
const $logContent = document.querySelector('.js-log-content');
const $logLeftBtn = document.querySelector('.js-log-prev-btn');
const $logRightBtn = document.querySelector('.js-log-next-btn');
const $chartLeftBtn = document.querySelector('.js-chart-prev-btn');
const $chartRightBtn = document.querySelector('.js-chart-next-btn');
const $search = document.querySelector('.js-search');
const $searchContent = document.querySelector('.js-search-content');
const $closeBtn = document.querySelector('.js-close-btn');

// DOM読み込み完了後
window.addEventListener('DOMContentLoaded', async () => {
  // 初期化処理
  initializeTabs();
  await initializeFromQuery();

  // 今日の日付を設定
  todayDate = getUpdatedDate();
  weekChartDate = new Date(todayDate);

  // チャート作成
  initializeWeekChart(weekChartDate);

  // 今日の合計分を表示
  $logDateInput.value = todayDate.toLocaleDateString('sv-SE');
  displayDateTotalMinutes(todayDate);

  // 日付変更時
  $logDateInput.onchange = () => {
    const date = new Date($logDateInput.value);
    displayDateTotalMinutes(date);
  };

  // ログの左ボタン押下
  $logLeftBtn.onclick = () => {
    const prevDate = new Date($logDateInput.value);
    prevDate.setDate(prevDate.getDate() - 1);
    $logDateInput.value = prevDate.toLocaleDateString('sv-SE');
    displayDateTotalMinutes(prevDate);
  };

  // ログの右ボタン押下
  $logRightBtn.onclick = () => {
    const nextDate = new Date($logDateInput.value);
    nextDate.setDate(nextDate.getDate() + 1);
    $logDateInput.value = nextDate.toLocaleDateString('sv-SE');
    displayDateTotalMinutes(nextDate);
  };

  // チャートの左ボタン押下
  $chartLeftBtn.onclick = () => {
    weekChartDate.setDate(weekChartDate.getDate() - 7);
    updateWeekChart(weekChartDate);
  };

  // チャートの右ボタン押下
  $chartRightBtn.onclick = () => {
    weekChartDate.setDate(weekChartDate.getDate() + 7);
    updateWeekChart(weekChartDate);
  };

  // ログ検索入力時
  $search.oninput = () => {
    initializeSearchLog();
    searchLog($search.value);
    displaySearchSum($search.value);
  };

  // CLOSEボタン押下
  $closeBtn.onclick = () => {
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
      if ($contents[index].querySelector(".js-search-content") && $search.value == "") {
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
  const encodedAppSettings = urlParams.get('appSettings');
  appSettings = JSON.parse(decodeURIComponent(encodedAppSettings));

  // ログファイルを読み込み、一番下へスクロール
  const filedata = await fetch(logpath);
  $logContent.textContent = await filedata.text();
  $logContent.scrollTop = $logContent.scrollHeight;
}

function displayDateTotalMinutes(date) {
  const totalMinutes = getDateTotalMinutes(date);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  document.querySelector('.js-log-date-sum').textContent = `の合計：${hours}時間${minutes}分`;
}

function displayChartSum(week, totalMinutes) {
  const $chartSum = document.querySelector('.js-chart-sum');
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  $chartSum.innerHTML = `${week} の合計：${hours}時間${minutes}分`;
}

function displaySearchSum(txt) {
  if (txt == "") {
    document.querySelector('.js-search-sum').textContent = `"" の合計：0時間0分`;
    return;
  }

  const logText = $searchContent.textContent;

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
  document.querySelector('.js-search-sum').textContent = `"${txt}" の合計：${hours}時間${minutes}分`;
}

function getUpdatedDate() {
  const updateDate = new Date();

  // リセット時間を超えていない場合は日付更新しない
  if(updateDate.getHours() < appSettings.resetHours) {
    updateDate.setDate(updateDate.getDate() - 1)
  }

  return updateDate;
}

// 本日の合計分を計算
function getDateTotalMinutes(date) {
  const startTime = new Date(date);
  const endTime = new Date(startTime);

  // 合計分の計算範囲
  startTime.setHours(appSettings.resetHours, 0, 0, 0)
  endTime.setHours(appSettings.resetHours, 0, 0, 0);
  endTime.setDate(endTime.getDate() + 1);

  // 合計分の計算
  let totalMinutes = 0;
  const logData = $logContent.textContent;
  const lines = logData.split('\n');

  lines.forEach(line => {
    // ログのタイムスタンプ抽出
    const timestampMatch = line.match(/\[(.*?)\]/);
    if(timestampMatch){
      // 計算範囲内の合計分を計算
      const logTime = new Date(timestampMatch[1]);
      if(startTime <= logTime && logTime < endTime) {
        const minuteMatch = line.match(/(\d{1,3})分/);
        if(minuteMatch) {
          totalMinutes += parseInt(minuteMatch[1], 10);
        }
      }
    }
  });

  return totalMinutes;
}

// その週の日曜日の取得
function getWeekStartDate(date) {
  const dayOfWeek = date.getDay();
  const weekStartDate = new Date(date);
  weekStartDate.setDate(date.getDate() - dayOfWeek);
  return weekStartDate;
}

function initializeWeekChart(date) {
  const todayDate = new Date(date);
  const weekStartDate = getWeekStartDate(todayDate);
  const dataLength = todayDate.getDay() - weekStartDate.getDay() + 1;

  const labels = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStartDate);
    date.setDate(weekStartDate.getDate() + i);
    return date.toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' });
  });

  const data = Array.from({ length: dataLength }, (_, i) => {
    const date = new Date(weekStartDate);
    date.setDate(weekStartDate.getDate() + i);
    return getDateTotalMinutes(date);
  });

  // チャート作成
  const $chart = document.querySelector(".js-chart");
  weekChart = new Chart($chart, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        data: data.map(val => (val / 60).toFixed(1)),
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

  // 1週間の合計を表示
  displayChartSum(`${labels[0]} - ${labels[labels.length -1]}`, data.reduce((acc, val) => acc + val, 0));
}

function updateWeekChart(date) {
  let dataLength = 7;
  const todayDate = getUpdatedDate();
  const thisWeekStartDate = getWeekStartDate(todayDate);
  const weekStartDate = getWeekStartDate(date);

  // 今週の場合
  if (weekStartDate.getDate() == thisWeekStartDate.getDate()) {
    dataLength = todayDate.getDay() - weekStartDate.getDay() + 1;
  // 来週以降の場合
  } else if (weekStartDate > thisWeekStartDate) {
    dataLength = 0;
  }

  const labels = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStartDate);
    date.setDate(weekStartDate.getDate() + i);
    return date.toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' });
  });

  const data = Array.from({ length: dataLength }, (_, i) => {
    const date = new Date(weekStartDate);
    date.setDate(weekStartDate.getDate() + i);
    return getDateTotalMinutes(date);
  });

  // パラメータ更新
  weekChart.data.labels = labels;
  weekChart.data.datasets[0].data = data.map(val => (val / 60).toFixed(1));

  // チャート更新
  weekChart.update();

  // 1週間の合計を表示
  displayChartSum(`${labels[0]} - ${labels[labels.length -1]}`, data.reduce((acc, val) => acc + val, 0));
}

// ログファイルを読み込み、一番下へスクロール
function initializeSearchLog() {
  $searchContent.textContent = $logContent.textContent;
  $searchContent.scrollTop = $searchContent.scrollHeight;
}

// ログ検索
function searchLog(txt) {
  const lines = $searchContent.textContent.split("\n");

  // 検索ワードをスペースで分割し、小文字に変換
  const keywords = txt.toLowerCase().split(/\s+/).filter(Boolean);

  const filteredLines = lines.filter(line => {
    const lowerLine = line.toLowerCase();
    // すべてのキーワードが含まれるかチェック（AND 条件）
    return keywords.every(keyword => lowerLine.includes(keyword));
  });

  $searchContent.textContent = filteredLines.join("\n");
}


