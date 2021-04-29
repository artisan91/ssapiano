/*
1. 버튼을 누를 때마다 button 태그 안의 이모티콘 바꿔주기
2. 변수를 통해(metronomeOn) 메트로놈을 on/off 제어
3. setInterval의 실행 함수가 동작할 때 마다 카운트하여 비트 조절
*/


// metronome on off를 알려줄 변수
let metronomeOn = false
const base = 60000
// 합칠 때 빼기(하나만 있어도 됨)
let audioCtx = new AudioContext()

const submitElement = document.querySelector('#metronome-control')
submitElement.addEventListener('click', function(event) {
  event.preventDefault()
  let cnt = -1
  if (!metronomeOn) {
    metronomeOn = true
  } else {
    metronomeOn = false
  }
  const metronomeBeatElement = document.querySelector('#beat')
  const metronomeBeat = metronomeBeatElement.value
  let interval = base/metronomeBeat
  let metronome = setInterval(function() {
    cnt++
    if (!metronomeOn) {
      b = audioCtx.createOscillator()
      g = audioCtx.createGain()
      b.frequency.value = 293.66
      b.type = 'triangle'
      b.connect(g)
      g.gain.setValueAtTime(0.3, audioCtx.currentTime)
      g.connect(audioCtx.destination)
      b.start(audioCtx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.000001, audioCtx.currentTime+1)
    } else {
      clearInterval(metronome)
    }
  }, interval)
})

// function metronome(beat) {
// }