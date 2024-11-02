let flatPickr;
let countdown;
let initTime;
let remainingTime;
let remainingAngle;
const $startStopBtn = document.querySelector('.js-start-stop-btn');
const $saveResetBtn = document.querySelector('.js-save-reset-btn');
const $timerDuration = document.querySelector('.js-timer-duration');
const $timerCircle = document.querySelector('.js-timer-circle');
const $audio = document.querySelector('.js-audio');

// DOM読み込み完了後
window.addEventListener('DOMContentLoaded', () => {
  initTime = timeToSecond($timerDuration.value);
  initFlatpickr();
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

  // タイマー設定押下
  $timerDuration.onclick = () => {
    flatPickr.toggle();
  };

});

function timeToSecond(time) {
  const [h, m, s] = time.split(':').map(Number);
  return 3600 * h + 60 * m + s;
}

function initFlatpickr() {
  flatPickr = flatpickr('#flatpickr', {
    enableTime: true,
    noCalendar: true,
    dateFormat: 'H:i:S',
    time_24hr: true,
    clickOpens: false,
    onClose: () => {
      initTime = timeToSecond($timerDuration.value);
      timerState('INIT');
    },
  });
}

function timerState(state) {
  switch(state) {
    case 'INIT':
      clearInterval(countdown);
      remainingTime = initTime;
      remainingAngle = 360;
      updateTimerUI(remainingAngle, remainingTime, false);
      updateBtnUI('START', 'SAVE', true);
      break;

    case 'START':
      updateTimerUI(remainingAngle, remainingTime, true);
      updateBtnUI('STOP', 'RESET', false);

      // タイマー起動
      countdown = setInterval(() => {
        remainingTime--;
        remainingAngle -= 360 / initTime;
        updateTimerUI(remainingAngle, remainingTime, true);

        if(remainingTime < 0) {
          playAudio();
          timerState('SAVE');
        }
      }, 1000);
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

function updateTimerUI(angle, time, timeDisabled) {
  const h = String(Math.floor(time / 3600)).padStart(2, '0');
  const m = String(Math.floor((time % 3600) / 60)).padStart(2, '0');
  const s = String(time % 60).padStart(2, '0');

  $timerDuration.value = `${h}:${m}:${s}`;
  $timerDuration.disabled = timeDisabled;
  $timerCircle.style.backgroundImage = `conic-gradient(#F2A33C ${angle}deg, #565656 ${angle}deg)`;
}

function updateBtnUI(startStopText, saveResetText, saveResetDisabled) {
  $startStopBtn.textContent = startStopText;
  $startStopBtn.classList.toggle('u-bgcolor-red', startStopText === 'STOP');
  $saveResetBtn.textContent = saveResetText;
  $saveResetBtn.disabled = saveResetDisabled;
}

async function playAudio() {
  $audio.play();
}

async function stopAudio() {
  $audio.pause();
  $audio.currentTime = 0;
}


