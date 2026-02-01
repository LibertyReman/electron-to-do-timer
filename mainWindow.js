let flatPickr;
let countdown;
let initTime;
let startDateTime;
let remainingTime;
let remainingAngle;
const $logBtn = document.querySelector('.js-log-btn');
const $startStopBtn = document.querySelector('.js-start-stop-btn');
const $saveResetBtn = document.querySelector('.js-save-reset-btn');
const $timerCircle = document.querySelector('.js-timer-circle');
const $timerDuration = document.querySelector('.js-timer-duration');
const $timerTitle = document.querySelector('.js-timer-title');
const $timerTitleHistory = document.querySelector('.js-timer-title-history');
const $audio = document.querySelector('.js-audio');
const $modal = document.querySelector('.js-modal');
const $modalMessage = document.querySelector('.js-modal-message');
const $modalContinueBtn = document.querySelector('.js-modal-continue-btn');
const $modalCloseBtn = document.querySelector('.js-modal-close-btn');


// DOM読み込み完了後
window.addEventListener('DOMContentLoaded', () => {
  // ローカルストレージの値を表示
  const lastTime = localStorage.getItem('lastTime');
  if(lastTime) $timerDuration.value = lastTime;
  $timerTitle.value = localStorage.getItem('lastTitle');

  // 初期化処理
  initTime = timeToSecond($timerDuration.value);
  initializeFromQuery();
  initFlatpickr();
  timerState('INIT');

  // ログボタン押下
  $logBtn.onclick = () => {
    window.timer.openLogWindow();
  };

  // START・STOPボタン押下
  $startStopBtn.onclick = () => {
    if($startStopBtn.textContent === 'START') {
      timerState('START');
    }
    else {
      timerState('STOP');
    }
  };

  // SAVE・RESETボタン押下
  $saveResetBtn.onclick = () => {
    if($saveResetBtn.textContent === 'SAVE') {
      timerState('SAVE');
    } else {
      timerState('INIT');
    }
  };

  // タイマー設定押下
  $timerDuration.onclick = () => {
    flatPickr.toggle();
  };

  // タイマータイトル押下
  $timerTitle.onclick = () => {
    // タイトル履歴の表示
    renderFilteredHistory();
  };

  // タイマータイトル入力時
  $timerTitle.oninput = () => {
    // タイトル履歴の絞り込み
    renderFilteredHistory();

    // タイトル未設定の場合はSTARTボタン非表示
    if($timerTitle.value === '') {
      updateBtnUI('START', true, 'SAVE', true);
    } else {
      if(remainingTime != initTime) {
        // タイマー起動中の場合はSAVEボタン表示
        updateBtnUI('START', false, 'SAVE', false);
      } else {
        updateBtnUI('START', false, 'SAVE', true);
      }
    }
  };

  // タイトル履歴押下
  $timerTitleHistory.onmousedown = (e) => {
    // タイトルを設定
    $timerTitle.value = e.target.textContent;
    // タイトル変更を明示的に通知
    $timerTitle.dispatchEvent(new Event('input'));
  };

  // タイマータイトルのフォーカスが外れたとき
  $timerTitle.onblur = () => {
    // 起動時のタイトル用に最新タイトルを保存
    localStorage.setItem('lastTitle', $timerTitle.value);
    // タイトル履歴を非表示
    $timerTitleHistory.classList.remove('is-open');

    if($timerTitle.value !== '') {
      saveTitleHistory($timerTitle.value);
    }
  };

  // モーダルコンティニューボタン押下
  $modalContinueBtn.onclick = () => {
    stopAudio();
    closeModal();
    timerState('SAVE');
    timerState('START');
  };

  // モーダルクローズボタン押下
  $modalCloseBtn.onclick = () => {
    stopAudio();
    closeModal()
    timerState('SAVE');
  };
});

// クエリパラメータによる初期化
async function initializeFromQuery() {
  // クエリパラメータの取得
  const urlParams = new URLSearchParams(window.location.search);
  const encodedAppSettings = urlParams.get('appSettings');
  const appSettings = JSON.parse(decodeURIComponent(encodedAppSettings));

  await setAudio(appSettings.sound, appSettings.volume);
}

function timeToSecond(time) {
  const [h, m, s] = time.split(':').map(Number);
  return 3600 * h + 60 * m + s;
}

function secondToMinute(second) {
  const minutes = (second / 60).toFixed(0);
  if (minutes.length === 1) {
    return "  " + minutes;
  } else if (minutes.length === 2) {
    return " " + minutes;
  } else {
    return minutes;
  }
}

function secondToHour(second) {
  const hour = second / 3600;
  return hour.toFixed(2);
}

function initFlatpickr() {
  flatPickr = flatpickr('#flatpickr', {
    enableTime: true,
    noCalendar: true,
    dateFormat: 'H:i:S',
    time_24hr: true,
    clickOpens: false,
    onClose: () => {
      localStorage.setItem('lastTime', $timerDuration.value);
      initTime = timeToSecond($timerDuration.value);
      timerState('INIT');
    },
  });
}

function timerState(state) {
  switch(state) {
    case 'INIT':
      clearInterval(countdown);
      startDateTime = null;
      remainingTime = initTime;
      remainingAngle = 360;
      updateTimerUI(remainingAngle, remainingTime, false);
      $timerTitle.disabled = false;

      // タイトル未設定の場合はSTARTボタン非表示
      if($timerTitle.value === '') {
        updateBtnUI('START', true, 'SAVE', true);
      } else {
        updateBtnUI('START', false, 'SAVE', true);
      }
      break;

    case 'START':
      // タイマー開始時の日時を取得
      if(startDateTime === null) {
        startDateTime = new Date().toLocaleString('ja-JP', {
          weekday: 'short',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      }

      $timerTitle.disabled = true;
      updateTimerUI(remainingAngle, remainingTime, true);
      updateBtnUI('STOP', false, 'RESET', false);

      // タイマー起動
      countdown = setInterval(() => {
        remainingTime--;
        remainingAngle -= 360 / initTime;
        updateTimerUI(remainingAngle, remainingTime, true);

        if(remainingTime <= 0) {
          clearInterval(countdown);
          playAudio();
          openModal();

          // 1分後にアラームを止める
          setTimeout(() => {
            stopAudio();
          }, 1 * 60 * 1000);

        }
      }, 1000);
      break;

    case 'STOP':
      clearInterval(countdown);
      $timerTitle.disabled = false;
      updateBtnUI('START', false, 'SAVE', false);
      break;

    case 'SAVE':
      // ログ保存
      const log = `[${startDateTime}] ${secondToMinute(initTime - remainingTime)}分 ${$timerTitle.value}\n`;
      window.timer.saveLog(log);

      timerState('INIT');
      break;

    default:
      alert('undefined state');
      break;
  }
}

function updateTimerUI(angle, time, timeDisabled) {
  const h = String(Math.floor(time / 3600)).padStart(2, '0');
  const m = String(Math.floor((time % 3600) / 60)).padStart(2, '0');
  const s = String(time % 60).padStart(2, '0');

  $timerDuration.value = `${h}:${m}:${s}`;
  $timerDuration.disabled = timeDisabled;
  $timerCircle.style.backgroundImage = `conic-gradient(#F2A33C ${angle}deg, #565656 ${angle}deg)`;
}

function updateBtnUI(startStopText, startStopDisabled, saveResetText, saveResetDisabled) {
  $startStopBtn.textContent = startStopText;
  $startStopBtn.classList.toggle('u-bgcolor-red', startStopText === 'STOP');
  $startStopBtn.disabled = startStopDisabled;
  $saveResetBtn.textContent = saveResetText;
  $saveResetBtn.disabled = saveResetDisabled;
}

async function loadBase64Audio(path) {
  const response = await fetch(path);
  const base64 = await response.text();
  return 'data:audio/mp3;base64,' + base64.trim();
}

async function setAudio(sound, volume) {
  let base64DataUrl;

  if (sound === 'pipipi') {
    base64DataUrl = await loadBase64Audio('./audio/pipipi.base64');
  } else {
    base64DataUrl = await loadBase64Audio('./audio/poppo.base64');
  }

  $audio.src = base64DataUrl;
  $audio.volume = volume;
}

async function playAudio() {
  $audio.play();
}

async function stopAudio() {
  $audio.pause();
  $audio.currentTime = 0;
}

function openModal() {
  $modalMessage.innerHTML = `"${$timerTitle.value}"<br>${secondToMinute(initTime - remainingTime)}分 終了`;
  $modal.classList.add('is-open');
}

function closeModal() {
  $modal.classList.remove('is-open');
}

// タイトル履歴の保存
function saveTitleHistory(title) {
  let history = getTitleHistory();

  // 重複を削除して新しい値を先頭に追加
  history = history.filter(item => item !== title);
  history.unshift(title);

  // 最大15件に制限
  history = history.slice(0, 15);

  localStorage.setItem("titleHistory", JSON.stringify(history));
}

// タイトル履歴の取得
function getTitleHistory() {
  return JSON.parse(localStorage.getItem("titleHistory")) || [];
}

// タイトル履歴をフィルタして表示
function renderFilteredHistory() {
  const filter = $timerTitle.value;
  const history = getTitleHistory()
    .filter(item => item.toLowerCase().includes(filter.toLowerCase()));

  // タイトル履歴がない場合は表示しない
  if (history.length === 0) {
    $timerTitleHistory.classList.remove('is-open');
    return;
  }

  $timerTitleHistory.innerHTML = history
    .map(item => `<div class="p-timer__title-history__item">${item}</div>`)
    .join("");

  $timerTitleHistory.classList.add('is-open');
}

