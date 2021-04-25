/**
 * Key Arranger
 * 1. Key Arrangement
 * 
 * Sound Controller
 * 1. Pedal
 * 2. Volume
 * 3. Oscilliator Type
 * 4. Octave
 * 5. Clickable
 * 
 * Sound Generator
 * 1. start/stop sound
 * 2. start/stop effect
 * 3. using key
 * 4. using mouse
 */

// Key Arranger
const Main = document.getElementById("main");
const oneLineBtn = document.getElementById("oneLineBtn");
const twoLinesBtn = document.getElementById("twoLinesBtn");
let sharpKeys;
let notSharpKeys;

// 한 줄
oneLineBtn.addEventListener('click', 
  function(){
    console.log("one line");
    Main.innerHTML = oneLine;

    sharpKeys = document.querySelectorAll('.key.sharp'); // 흑건
    sharpKeys.forEach((sharpKey) => {
      sharpKey.style.width = "2.6%";
    })

    notSharpKeys = document.querySelectorAll('.key:not(.sharp)'); // 백건
    notSharpKeys.forEach((notSharpKey) => {
      notSharpKey.style.width="4%";
      notSharpKey.style.left ="1.3%";
    })
  },
  false
) 

// 두 줄
twoLinesBtn.addEventListener('click', 
  function(){
    console.log("two lines");
    Main.innerHTML = twoLines;

    sharpKeys = document.querySelectorAll('.key.sharp'); // 흑건
    sharpKeys.forEach((sharpKey) => {
      sharpKey.style.width = "4%";
    })

    notSharpKeys = document.querySelectorAll('.key:not(.sharp)'); // 백건
    notSharpKeys.forEach((notSharpKey) => {
      notSharpKey.style.width="7%";
      notSharpKey.style.left ="2%";
    })
  },
  false
) 


// Sound Controller
// Pedal 조절
let pedal = 1; // pedal 밟는 효과. 지속시간
const PedalSlider = document.querySelector('#pedal-bar');

PedalSlider.addEventListener(
  'input',
  function () {
    pedal = parseInt(this.value);
  },
  false
);
// Pedal++
window.addEventListener('keydown', (event) => {
  if(event.code === 'Space'){
    pedal += 7;
  }
});

window.addEventListener('keyup', (event) => {
  if(event.code === 'Space'){
    pedal -= 7;
  }
});

// Volume 조절
let volume = 0.3; // volume
const VolumeSlider = document.querySelector('#volume-bar');

VolumeSlider.addEventListener(
  'input',
  function () {
    volume = parseInt(this.value) / 10;
  },
  false
);

// Oscillator Type
let oscillatorType = 'triangle'; // square, triangle, sawtooth
const OscillatorTypeElement = document.querySelector('#oscillator-select');
OscillatorTypeElement.addEventListener('input', function () {
  oscillatorType = this.value;
});


// Octave
let octave_base = 2; // 가장 낮은 옥타브 초기값 = 2
let octave1_keys;
let octave2_keys;
let octave3_keys;
let octave4_keys;

// 가장 낮은 옥타브를 octave_base 값에 맞춰 전체 키 변경
function octave_set(octave_base) {
  octave1_keys = document.querySelectorAll('.octave1');
  octave2_keys = document.querySelectorAll('.octave2');
  octave3_keys = document.querySelectorAll('.octave3');
  octave4_keys = document.querySelectorAll('.octave4');
  octave1_keys.forEach((key) => {
    key.dataset.code =
      key.dataset.code.slice(0, key.dataset.code.length - 1) + octave_base;
  });
  octave2_keys.forEach((key) => {
    key.dataset.code =
      key.dataset.code.slice(0, key.dataset.code.length - 1) +
      (octave_base + 1);
  });
  octave3_keys.forEach((key) => {
    key.dataset.code =
      key.dataset.code.slice(0, key.dataset.code.length - 1) +
      (octave_base + 2);
  });
  octave4_keys.forEach((key) => {
    key.dataset.code =
      key.dataset.code.slice(0, key.dataset.code.length - 1) +
      (octave_base + 3);
  });
}

// Octave 조절
const OctaveSlider = document.querySelector('#octave-bar');
OctaveSlider.addEventListener(
  'input',
  function () {
    octave_base = parseInt(this.value);
    octave_set(octave_base);
  },
  false
);

/*
// Mouse Clickable
const MouseClickRadioBtn = document.querySelector('#clickableBtn');
MouseClickRadioBtn.addEventListener(
  'input',
  function(){
    if(MouseClickRadioBtn.checked){
      console.log("click available");
    }
  },
  false
);
*/

// Sound Generator
let playing = 0; // 현재 연주 중인 키의 개수
let audioCtx;
let keys = document.querySelectorAll('.key'); // 모든 건반 요소

const playing_keys = {}; // 현재 연주중인 키 저장(중복 입력 방지)
const oscillatorNodes = {}; // oscillatorNode 임시 저장 객체
const gainNodes = {}; // gainNodes 임시 저장 객체


// 페이지 로드 시 AudioContext 객체 생성 및 초기 옥타브 설정
window.addEventListener('load', (event) => {
  audioCtx = new AudioContext();

  // 모든 키 옥타브 초기화
  octave_set(octave_base);
});

// 좌,우 방향키로 옥타브 조절
window.addEventListener('keydown', (event) => {
  // 만약 연주중인 키가 있다면 리턴
  if (playing) {
    return;
  }

  // 각 키보드의 data-code 값 조정
  // 옥타브 범위는 0~7 (이미 경계값일 경우 옥타브 조정 없이 리턴)
  // 가장 낮은 옥타브 값(octave_base)의 범위는 0~(7 - 옥타브 최대 차이)
  if (event.key === 'ArrowLeft' && octave_base > 0) {
    octave_base--;
    OctaveSlider.value = octave_base;
  } else if (event.key === 'ArrowRight' && octave_base < 7 - 3) {
    octave_base++;
    OctaveSlider.value = octave_base;
  } else {
    return;
  }

  // 모든 키 옥타브 조정
  octave_set(octave_base);
});

// Sound Methods
function startSound(event, key){
    //  연주 중으로 상태 표시 (+키 중복 입력 방지)
    playing += 1;
    playing_keys[event.key] = true;

    // startEffect(event, key);

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

}

function stopSound(event, key){
    // 이미 만들어진, key에 해당하는 oscillatorNode와 gainNode 할당
    o = oscillatorNodes[key.dataset.code];
    g = gainNodes[key.dataset.code];
    // 서서히 소리가 작아지는 효과
    g.gain.exponentialRampToValueAtTime(0.000001, audioCtx.currentTime + pedal);
    // 아래 코드는 뚝 끊긴다.
    // o.stop(audioCtx.currentTime + pedal);
    // 키를 뗀 후에는 다시 'keydown' 이벤트를 받을 수 있도록 상태 변경
    playing_keys[event.key] = false;
    playing -= 1;
}

// Effect Methods
function startEffect(event, key){
    // 아래 효과 줄 요소 (light 클래스를 가진 요소 중 현재 선택된 key와 data-key 값이 같은 요소 선택)
    let effect = document.querySelector(
      `.light[data-key="${key.dataset.key}"]`
    );

    // 해당 키 노드에 'active_key' class 추가하여 활성 상태 시각화
    key.classList.add('active_key');

    if (effect) {
      // 키 아래 효과주기 위해 클래스 추가
      effect.classList.remove('animate__fadeOut');
      effect.classList.add('animate__animated');
      effect.classList.add('animate__fadeIn');
      effect.classList.add('active_key');
    }

}

function stopEffect(event, key){
  // 해당 키 노드에서 'active_key' class 제거하여 시각화 효과 제거
  key.classList.remove('active_key');

  // 아래 효과 뺄 요소 (light 클래스를 가진 요소 중 현재 선택된 key와 data-key 값이 같은 요소 선택)
  let effect = document.querySelector(
    `.light[data-key="${key.dataset.key}"]`
  );

  if (effect) {
    // 아래 효과 빼기 위해 클래스 제거 및 추가
    effect.classList.remove('animate__fadeIn');
    effect.classList.add('animate__fadeOut');
    // effect.classList.remove('active_key');
  }


}


// 키보드로 키를 누르면 키에 해당하는 소리가 남
window.addEventListener('keydown', (event) => {
  
  // 속성이 data-key, 값이 event.key인 요소
  // event.code 프로퍼티가 Backslash(\), Quote('), Quote(")인 경우
  // 예외로 data - key의 값이 event.code인 요소를 선택
  let key;
  console.log("code : "+event.code);
  console.log("key : "+event.key);
  if (event.code === 'Backslash' || event.code === 'Quote') {
    key = document.querySelector(`.key[data-key="${event.code}"]`);
  } else {
    key = document.querySelector(`.key[data-key="${event.key}"]`);
  }

  // 해당 키가 존재하지않거나, 이미 연주중인 키라면 return
  if (!key || playing_keys[event.key]) {
    return;
  }

  startSound(event, key);
  startEffect(event, key);
});

// 키보드 키를 떼면 잠시 후 소리가 점점 감소하다가 멈춤
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

  stopSound(event, key);
  stopEffect(event, key);
});

/* 마우스 클릭으로 연주하기

// 마우스로 키를 누르는 동안 키에 해당하는 소리가 남
keys.forEach((keyElement) => {
  keyElement.addEventListener('mousedown', (event) => {
    console.log("key clicked");
    // 마우스가 클릭한 key에 해당하는 li 요소 선택
    // (li 요소 일부 위치 위에 다른 요소가 존재하기 때문에 currentTarget을 통해 이벤트 버블링 활용)
    let key = event.currentTarget;

    // 해당 키가 이미 연주중인 키라면 return
    if (playing_keys[event.key]) {
      return;
    }
    startSound(event, key);
    startEffect(event, key);
  });
});

// 마우스를 키에서 떼면 소리가 점점 감소하다가 멈춤
keys.forEach((keyElement) => {
  keyElement.addEventListener('mouseup', (event) => {
    // 마우스를 뗀 key에 해당하는 li 요소 선택
    // (li 요소 일부 위치 위에 다른 요소가 존재하기 때문에 currentTarget을 통해 이벤트 버블링 활용)
    let key = event.currentTarget;

    // 연주 중이 아닌 경우 바로 리턴
    if (!playing_keys[event.key]) {
      return;
    }

    stopSound(event, key);
    stopEffect(event, key);
  });
});

// 마우스를 키 밖으로 이동하면 소리가 점점 감소하다가 멈춤
keys.forEach((keyElement) => {
  keyElement.addEventListener('mouseleave', (event) => {
    // 마우스를 뗀 key에 해당하는 li 요소 선택
    // (li 요소 일부 위치 위에 다른 요소가 존재하기 때문에 currentTarget을 통해 이벤트 버블링 활용)
    let key = event.currentTarget;

    // 연주 중이 아닌 경우 바로 리턴
    if (!playing_keys[event.key]) {
      return;
    }

    stopSound(event, key);
    stopEffect(event, key);
  });
});
*/





/**
 * 내용이 길어서 아래에 몰아놓은 값들
 * 키보드 배치
 * 각 음의 주파수
 */
// 키보드 위 2줄
const upperkeys = `
  <div data-key="x" data-code="A2" class="octave1 key">
    <span class="keyboard">X</span>
  </div>
  <div data-key="d" data-code="A#2" class="octave1 key sharp">
    <span class="keyboard">D</span>
  </div>
  <div data-key="c" data-code="B2" class="octave1 key">
    <span class="keyboard">C</span>
  </div>
  <div data-key="v" data-code="C3" class="octave2 key">
    <span class="keyboard">V</span>
  </div>
  <div data-key="g" data-code="C#3" class="octave2 key sharp"> 
    <span class="keyboard">G</span>
  </div>
  <div data-key="b" data-code="D3" class="octave2 key">
    <span class="keyboard">B</span>
  </div>
  <div data-key="h" data-code="D#3" class="octave2 key sharp">
    <span class="keyboard">H</span>
  </div>
  <div data-key="n" data-code="E3" class="octave2 key">
    <span class="keyboard">N</span>
  </div>
  <div data-key="m" data-code="F3" class="octave2 key">
    <span class="keyboard">M</span>
  </div>
  <div data-key="k" data-code="F#3" class="octave2 key sharp">
    <span class="keyboard">K</span>
  </div>
  <div data-key="," data-code="G3" class="octave2 key">
    <span class="keyboard">,</span>
  </div>
  <div data-key="l" data-code="G#3" class="octave2 key sharp">
    <span class="keyboard">L</span>
  </div>
  <div data-key="." data-code="A3" class="octave2 key">
    <span class="keyboard">.</span>
  </div>
  <div data-key=";" data-code="A#3" class="octave2 key sharp">
    <span class="keyboard">;</span>
  </div>
  <div data-key="/" data-code="B3" class="octave2 key">
    <span class="keyboard">/</span>
  </div>
`

// 키보드 아래 2줄
const lowerkeys = `
  <div data-key="q" data-code="C4" class="octave3 key">
    <span class="keyboard">Q</span>
  </div>
  <div data-key="2" data-code="C#4" class="octave3 key sharp">
    <span class="keyboard">2</span>
  </div>
  <div data-key="w" data-code="D4" class="octave3 key">
    <span class="keyboard">W</span>
  </div>
  <div data-key="3" data-code="D#4" class="octave3 key sharp">
    <span class="keyboard">3</span>
  </div>
  <div data-key="e" data-code="E4" class="octave3 key">
    <span class="keyboard">E</span>
  </div>
  <div data-key="r" data-code="F4" class="octave3 key">
    <span class="keyboard">R</span>
  </div>
  <div data-key="5" data-code="F#4" class="octave3 key sharp">
    <span class="keyboard">5</span>
  </div>
  <div data-key="t" data-code="G4" class="octave3 key">
    <span class="keyboard">T</span>
  </div>
  <div data-key="6" data-code="G#4" class="octave3 key sharp">
    <span class="keyboard">6</span>
  </div>
  <div data-key="y" data-code="A4" class="octave3 key">
    <span class="keyboard">Y</span>
  </div>
  <div data-key="7" data-code="A#4" class="octave3 key sharp">
    <span class="keyboard">7</span>
  </div>
  <div data-key="u" data-code="B4" class="octave3 key">
    <span class="keyboard">U</span>
  </div>
  <div data-key="i" data-code="C5" class="octave4 key">
    <span class="keyboard">I</span>
  </div>
  <div data-key="9" data-code="C#5" class="octave4 key sharp">
    <span class="keyboard">9</span>
  </div>
  <div data-key="o" data-code="D5" class="octave4 key">
    <span class="keyboard">O</span>
  </div>
  <div data-key="0" data-code="D#5" class="octave4 key sharp">
    <span class="keyboard">0</span>
  </div>
  <div data-key="p" data-code="E5" class="octave4 key">
    <span class="keyboard">P</span>
  </div>
  <div data-key="[" data-code="F5" class="octave4 key">
    <span class="keyboard">[</span>
  </div>
  <div data-key="=" data-code="F#5" class="octave4 key sharp">
    <span class="keyboard">=</span>
  </div>
  <div data-key="]" data-code="G5" class="octave4 key">
    <span class="keyboard">]</span>
  </div>
`

// 1줄 배치
const oneLine = `<div class="keys">` + upperkeys + lowerkeys + `</div>`

// 2줄 배치
const twoLines = `<div class="keys">` + lowerkeys + `</div><div class="keys">` + upperkeys + `</div>`

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
