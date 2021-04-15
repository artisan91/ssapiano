const playing = {}; // 현재 연주중인 키 저장(중복 입력 방지)
const pedal = 1; // pedal 밟는 효과. 지속시간
const oscillatorNodes = {}; // oscillatorNode 임시 저장 객체
const gainNodes = {}; // gainNodes 임시 저장 객체
let volume = 0.3; // volume
let oscillatorType = 'triangle'; // square, triangle, sawtooth
let octave = 3; // 옥타브 초기값 = 3

function octave_set(key, octave) {
  if (key.dataset.code) {
    key.dataset.code =
      key.dataset.code.slice(0, key.dataset.code.length - 1) + String(octave);
  }
}

// Pedal 조절
const PedalSlider = document.querySelector('#pedal-bar');
PedalSlider.addEventListener(
  'input',
  function () {
    pedal = parseInt(this.value);
  },
  false
);

// Volume 조절
const VolumeSlider = document.querySelector('#volume-bar');
VolumeSlider.addEventListener(
  'input',
  function () {
    volume = parseInt(this.value) / 10;
  },
  false
);

// Oscillator Type
const OscillatorTypeElement = document.querySelector('#oscillator-select');
OscillatorTypeElement.addEventListener('input', function () {
  oscillatorType = this.value;
});

let audioCtx;

// 페이지 로드 시 AudioContext 객체 생성 및 초기 옥타브 설정
window.addEventListener('load', (event) => {
  audioCtx = new AudioContext();

  //  모든 키보드 선택
  keys = document.querySelectorAll('.key');
  // 각 키보드의 data-code 값 조정
  for (key of keys) {
    octave_set(key, octave);
  }
});

// 위, 아래 방향키로 옥타브 조절
window.addEventListener('keydown', (event) => {
  // 각 키보드의 data-code 값 조정
  // 옥타브 범위는 0~7 (이미 경계값일 경우 옥타브 조정 없이 리턴)
  if (event.key === 'ArrowDown' && octave > 0) {
    octave--;
  } else if (event.key === 'ArrowUp' && octave < 7) {
    octave++;
  } else {
    return;
  }
  //  모든 키보드 선택
  keys = document.querySelectorAll('.key');
  // 모든 키에 대해서 옥타브 조정 반영
  for (key of keys) {
    octave_set(key, octave);
  }
});

window.addEventListener('keydown', (event) => {
  // 속성이 data-key, 값이 event.key인 요소
  // event.code 프로퍼티가 Backslash(\), Quote('), Quote(")인 경우
  // 예외로 data - key의 값이 event.code인 요소를 선택
  let key;
  if (event.code === 'Backslash' || event.code === 'Quote') {
    key = document.querySelector(`.key[data-key="${event.code}"]`);
  } else {
    key = document.querySelector(`.key[data-key="${event.key}"]`);
  }

  // 해당 키가 존재하지않거나, 이미 연주중인 키라면 return
  if (!key || playing[event.key]) {
    return;
  }

  // 아래 효과 줄 요소
  let effect;
  if (event.code === 'Backslash' || event.code === 'Quote') {
    effect = document.querySelector(`.light[data-key="${event.code}"]`);
  } else {
    effect = document.querySelector(`.light[data-key="${event.key}"]`);
  }

  //  연주 중으로 상태 표시 (키 중복 입력 방지)
  playing[event.key] = true;

  // 해당 키 노드에 'active_key' class 추가하여 활성 상태 시각화
  key.classList.add('active_key');

  if (effect) {
    // 아래 효과주기 위해 클래스 추가
    effect.classList.remove('animate__fadeOut');
    effect.classList.add('animate__animated');
    effect.classList.add('animate__fadeIn');
    effect.classList.add('active_key');
  }

  // oscillatorNode. 전기 진동을 일으키는 노드 생성 및 oscillatorNodes 객체에 업데이트
  o = audioCtx.createOscillator();
  oscillatorNodes[key.dataset.code] = o;

  // gainNode. 볼륨을 조절하는 노드 생성 및 gainNodes 객체에 업데이트
  g = audioCtx.createGain();
  gainNodes[key.dataset.code] = g;

  // key의 data-code 속성 값을 주파수에 할당(어떤 음을 낼 지 결정)
  o.frequency.value = noteValues[key.dataset.code];
  // 미리 정한 설정 적용(같은 주파수더라도 어떤 종류의 소리를 낼 지)
  o.type = oscillatorType;
  // oscillatorNode와 gainNode 연결
  o.connect(g);

  // volume 설정
  g.gain.setValueAtTime(volume, audioCtx.currentTime);
  // gainNode를 destination(소리가 최종적으로 render될 곳)가 연결
  g.connect(audioCtx.destination);

  // 진동 발생! (파라미터는 소리 발생 시작 시점)
  o.start(audioCtx.currentTime);
});

window.addEventListener('keyup', (event) => {
  // 속성이 data-key, 값이 event.key인 요소
  // event.code 프로퍼티가 Backslash(\), Quote('), Quote(")인 경우
  // 예외로 data - key의 값이 event.code인 요소를 선택
  let key;
  if (event.code === 'Backslash' || event.code === 'Quote') {
    key = document.querySelector(`.key[data-key="${event.code}"]`);
  } else {
    key = document.querySelector(`.key[data-key="${event.key}"]`);
  }
  // 해당 키가 존재하지않으면(입력된 key에 해당하는 미리 만들어 둔 html요소가 없으면) return
  if (!key) {
    return;
  }

  // 해당 키 노드에서 'active_key' class 제거하여 시각화 효과 제거
  key.classList.remove('active_key');

  // 아래 효과 뺄 요소
  let effect;
  if (event.code === 'Backslash' || event.code === 'Quote') {
    effect = document.querySelector(`.light[data-key="${event.code}"]`);
  } else {
    effect = document.querySelector(`.light[data-key="${event.key}"]`);
  }

  if (effect) {
    // 아래 효과 빼기 위해 클래스 제거 및 추가
    effect.classList.remove('animate__fadeIn');
    effect.classList.add('animate__fadeOut');
    // effect.classList.remove('active_key');
  }
  // 이미 만들어진, key에 해당하는 oscillatorNode와 gainNode 할당
  o = oscillatorNodes[key.dataset.code];
  g = gainNodes[key.dataset.code];
  // 서서히 소리가 작아지는 효과
  g.gain.exponentialRampToValueAtTime(0.000001, audioCtx.currentTime + pedal);
  // 아래 코드는 뚝 끊긴다.
  // o.stop(audioCtx.currentTime + pedal);
  // 키를 뗀 후에는 다시 'keydown' 이벤트를 받을 수 있도록 상태 변경
  playing[event.key] = false;
});

// 각 음에 해당하는 실제 주파수
const noteValues = {
  C0: 16.35,
  'C#0': 17.32,
  Db0: 17.32,
  D0: 18.35,
  'D#0': 19.45,
  Eb0: 19.45,
  E0: 20.6,
  F0: 21.83,
  'F#0': 23.12,
  Gb0: 23.12,
  G0: 24.5,
  'G#0': 25.96,
  Ab0: 25.96,
  A0: 27.5,
  'A#0': 29.14,
  Bb0: 29.14,
  B0: 30.87,
  C1: 32.7,
  'C#1': 34.65,
  Db1: 34.65,
  D1: 36.71,
  'D#1': 38.89,
  Eb1: 38.89,
  E1: 41.2,
  F1: 43.65,
  'F#1': 46.25,
  Gb1: 46.25,
  G1: 49.0,
  'G#1': 51.91,
  Ab1: 51.91,
  A1: 55.0,
  'A#1': 58.27,
  Bb1: 58.27,
  B1: 61.74,
  C2: 65.41,
  'C#2': 69.3,
  Db2: 69.3,
  D2: 73.42,
  'D#2': 77.78,
  Eb2: 77.78,
  E2: 82.41,
  F2: 87.31,
  'F#2': 92.5,
  Gb2: 92.5,
  G2: 98.0,
  'G#2': 103.83,
  Ab2: 103.83,
  A2: 110.0,
  'A#2': 116.54,
  Bb2: 116.54,
  B2: 123.47,
  C3: 130.81,
  'C#3': 138.59,
  Db3: 138.59,
  D3: 146.83,
  'D#3': 155.56,
  Eb3: 155.56,
  E3: 164.81,
  F3: 174.61,
  'F#3': 185.0,
  Gb3: 185.0,
  G3: 196.0,
  'G#3': 207.65,
  Ab3: 207.65,
  A3: 220.0,
  'A#3': 233.08,
  Bb3: 233.08,
  B3: 246.94,
  C4: 261.63,
  'C#4': 277.18,
  Db4: 277.18,
  D4: 293.66,
  'D#4': 311.13,
  Eb4: 311.13,
  E4: 329.63,
  F4: 349.23,
  'F#4': 369.99,
  Gb4: 369.99,
  G4: 392.0,
  'G#4': 415.3,
  Ab4: 415.3,
  A4: 440.0,
  'A#4': 466.16,
  Bb4: 466.16,
  B4: 493.88,
  C5: 523.25,
  'C#5': 554.37,
  Db5: 554.37,
  D5: 587.33,
  'D#5': 622.25,
  Eb5: 622.25,
  E5: 659.26,
  F5: 698.46,
  'F#5': 739.99,
  Gb5: 739.99,
  G5: 783.99,
  'G#5': 830.61,
  Ab5: 830.61,
  A5: 880.0,
  'A#5': 932.33,
  Bb5: 932.33,
  B5: 987.77,
  C6: 1046.5,
  'C#6': 1108.73,
  Db6: 1108.73,
  D6: 1174.66,
  'D#6': 1244.51,
  Eb6: 1244.51,
  E6: 1318.51,
  F6: 1396.91,
  'F#6': 1479.98,
  Gb6: 1479.98,
  G6: 1567.98,
  'G#6': 1661.22,
  Ab6: 1661.22,
  A6: 1760.0,
  'A#6': 1864.66,
  Bb6: 1864.66,
  B6: 1975.53,
  C7: 2093.0,
  'C#7': 2217.46,
  Db7: 2217.46,
  D7: 2349.32,
  'D#7': 2489.02,
  Eb7: 2489.02,
  E7: 2637.02,
  F7: 2793.83,
  'F#7': 2959.96,
  Gb7: 2959.96,
  G7: 3135.96,
  'G#7': 3322.44,
  Ab7: 3322.44,
  A7: 3520.0,
  'A#7': 3729.31,
  Bb7: 3729.31,
  B7: 3951.07,
  C8: 4186.01,
};
