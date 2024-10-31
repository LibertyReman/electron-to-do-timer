let countdown;
let remainingTime;
const $startStopBtn = document.querySelector('.js-start-stop-btn');
const $saveResetBtn = document.querySelector('.js-save-reset-btn');
const $timerDuration = document.querySelector('.js-timer-duration');
const initTimerDuration = $timerDuration.textContent;

// DOM読み込み完了後
window.addEventListener('DOMContentLoaded', () => {
  timerState('INIT');

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
});

function timerState(state) {
  switch(state) {
    case 'INIT':
      clearInterval(countdown);
      $timerDuration.textContent = initTimerDuration;
      updateBtnUI('START', 'SAVE', true);
      break;

    case 'START':
      const [h, m, s] = $timerDuration.textContent.split(':').map(Number);
      remainingTime = 3600 * h + 60 * m + s;

      // タイマー起動
      countdown = setInterval(() => {
        remainingTime--;

        if(remainingTime <= 0) {
          timerState('SAVE');
          alert('TIME OUT');
        } else {
          updateTimerDisplay();
        }
      }, 1000);

      updateBtnUI('STOP', 'RESET', false);
      break;

    case 'STOP':
      clearInterval(countdown);
      updateBtnUI('START', 'SAVE', false);
      break;

    case 'SAVE':
      // TODO:ログ保存処理

      timerState('INIT');
      break;

    default:
      alert('undefined state');
      break;
  }
}

function updateTimerDisplay() {
  const h = String(Math.floor(remainingTime / 3600)).padStart(2, '0');
  const m = String(Math.floor((remainingTime % 3600) / 60)).padStart(2, '0');
  const s = String(remainingTime % 60).padStart(2, '0');
  $timerDuration.textContent = `${h}:${m}:${s}`;
}

function updateBtnUI(startStopText, saveResetText, saveResetDisabled) {
  $startStopBtn.textContent = startStopText;
  $startStopBtn.classList.toggle('u-bgcolor-red', startStopText === 'STOP');
  $saveResetBtn.textContent = saveResetText;
  $saveResetBtn.disabled = saveResetDisabled;
}


