const cars = document.querySelectorAll('.car');
const result = document.getElementById('result');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const resetScoresBtn = document.getElementById('resetScoresBtn');
const timerEl = document.getElementById('timer');

const scoreEls = [
  document.getElementById('score1'),
  document.getElementById('score2'),
  document.getElementById('score3'),
  document.getElementById('score4')
];

const moneyEls = [
  document.getElementById('money1'),
  document.getElementById('money2'),
  document.getElementById('money3'),
  document.getElementById('money4')
];

let scores = [0,0,0,0];
let money = [0,0,0,0];

let raceInterval;
let isRacing = false;
let startTime;

// Katılımcı seçimleri
const participants = document.querySelectorAll('.car-choice');
const participantSelections = [null,null,null,null];

participants.forEach((td,rowIndex)=>{
  const buttons = td.querySelectorAll('button');
  buttons.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      // Diğerlerini temizle
      buttons.forEach(b=>b.classList.remove('selected'));
      btn.classList.add('selected');
      participantSelections[rowIndex] = parseInt(btn.dataset.car);
    });
  });
});

function updateScores(){
  scoreEls.forEach((el,i)=>el.textContent=scores[i]);
  moneyEls.forEach((el,i)=>el.textContent=money[i]);
}

// Skor & Para sıfırlama
resetScoresBtn.addEventListener('click',()=>{
  scores=[0,0,0,0];
  money=[0,0,0,0];
  updateScores();
});

// Sayaç
function startTimer(){
  startTime = Date.now();
  timerEl.textContent = '⏱️ Süre: 0.0 saniye';
  const timerInterval = setInterval(()=>{
    if(!isRacing){ clearInterval(timerInterval); return; }
    const elapsed = ((Date.now()-startTime)/1000).toFixed(1);
    timerEl.textContent = `⏱️ Süre: ${elapsed} saniye`;
  },100);
}

// Boost ve çamur
function generateBoostAndMud(trackWidth){
  let areas=[];
  for(let i=0;i<5;i++){
    const start = 100 + Math.random()*(trackWidth-200);
    const type = Math.random()<0.5 ? 'boost' : 'mud';
    areas.push({start,type});
  }
  return areas;
}

function getSpeedMultiplier(x,areas){
  for(let area of areas){
    if(x>=area.start && x<=area.start+50) return area.type==='boost'?2:0.5;
  }
  return 1;
}

// Konfeti
function showConfetti(){
  const confetti = document.createElement('div');
  confetti.className='confetti';
  confetti.style.position='fixed';
  confetti.style.top='0px';
  confetti.style.left = Math.random()*90 + 'vw';
  confetti.style.width='10px';
  confetti.style.height='10px';
  confetti.style.background = ['#ff0','#f00','#0f0','#0ff','#f0f'][Math.floor(Math.random()*5)];
  confetti.style.opacity=1;
  document.body.appendChild(confetti);
  let top=0;
  const fall = setInterval(()=>{
    top+=5;
    confetti.style.top=top+'px';
    if(top>window.innerHeight){ clearInterval(fall); confetti.remove(); }
  },20);
}

// Yarışı başlat
startBtn.addEventListener('click', ()=>{
  if(isRacing) return;
  isRacing=true;
  result.textContent='';
  startTimer();

  let positions=[60,60,60,60];
  const trackWidth = document.querySelector('.track').offsetWidth;
  const finish = trackWidth-100;
  const targetTime = 15+Math.random()*5;
  const intervalTime = 100;
  const steps = targetTime*1000/intervalTime;
  let baseSpeeds = [
    (finish-60)/steps*(0.9+Math.random()*0.2),
    (finish-60)/steps*(0.9+Math.random()*0.2),
    (finish-60)/steps*(0.9+Math.random()*0.2),
    (finish-60)/steps*(0.9+Math.random()*0.2)
  ];

  const areas = generateBoostAndMud(trackWidth);

  raceInterval = setInterval(()=>{
    for(let i=0;i<cars.length;i++){
      const multiplier = getSpeedMultiplier(positions[i],areas);
      positions[i] += baseSpeeds[i]*multiplier;
      if(positions[i]>finish) positions[i]=finish;
      cars[i].style.left=positions[i]+'px';
    }

    const finishedCars = positions.map(pos=>pos>=finish);
    if(finishedCars.includes(true)){
      clearInterval(raceInterval);
      isRacing=false;

      const winnerIndex = positions.indexOf(Math.max(...positions));
      const winner = cars[winnerIndex].textContent;
      const elapsed = ((Date.now()-startTime)/1000).toFixed(1);
      result.textContent=`🏆 ${winner} kazandı! Süre: ${elapsed} saniye`;

      scores[winnerIndex]++;
      updateScores();

      for(let i=0;i<50;i++) setTimeout(showConfetti,i*50);

      // Katılımcı kazanan bahisleri
      participantSelections.forEach((carIndex,i)=>{
        if(carIndex===winnerIndex){
          money[carIndex]+=10; // kazanan bahis
        }
      });
      updateScores();
    }
  },intervalTime);
});

// Reset
resetBtn.addEventListener('click', ()=>{
  clearInterval(raceInterval);
  cars.forEach(car=>car.style.left='60px');
  result.textContent='';
  timerEl.textContent='⏱️ Süre: 0.0 saniye';
  isRacing=false;
});