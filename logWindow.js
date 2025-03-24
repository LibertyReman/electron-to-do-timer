const $logDate = document.querySelector('.js-log-date');
const $logLeftBtn = document.querySelector('.js-log-prev-btn');
const $logRightBtn = document.querySelector('.js-log-next-btn');
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


