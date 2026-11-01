/* UI del tres en raya: Q-learning real y evaluaciones independientes. */
(()=>{'use strict';
const E=window.ZubiriTicTacToe,$=id=>document.getElementById(id),levels=[['random','Principiante'],['intermediate','Intermedio'],['expert','Experto']];
const blue='#277ab3',gold='#d39547',red='#c74d5b';
let agent=new E.Agent(42),game=Array(9).fill('.'),finished=false,robotPending=null,visitor={games:0,wins:0,draws:0,losses:0},timeline=[],training=false,moveNotes=[];
function pct(n,d){return d?Math.round(100*n/d):0}
function fmt(n){return Number(n).toLocaleString('es-ES')}
function levelLabel(){return agent.games<100?'Sin entrenamiento':agent.games<900?'Principiante':agent.games<3000?'En progreso':'Estrategia avanzada'}
function winLine(board){const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];return lines.find(l=>board[l[0]]!=='.'&&board[l[0]]===board[l[1]]&&board[l[1]]===board[l[2]])||[]}
function paintMoves(){$('moveLog').textContent=moveNotes.length?'Jugadas: '+moveNotes.join(' · '):'Todavía no hay jugadas.'}
function paintBoard(){const result=E.result(game),highlight=result==='X'||result==='O'?winLine(game):[];$('ticboard').innerHTML=game.map((v,i)=>`<button type="button" class="ttt-cell ${v==='X'?'x':v==='O'?'o':''} ${highlight.includes(i)?'win':''}" data-cell="${i}" ${v!=='.'||finished||training?'disabled':''} aria-label="Fila ${Math.floor(i/3)+1}, columna ${i%3+1}: ${v==='.'?'casilla vacía':v==='X'?'X humana':'O del robot'}">${v==='.'?'':v==='X'?'✕':'◯'}</button>`).join('');$('robotLevel').textContent=levelLabel();paintRobotIllustration()}
function paintRobotIllustration(){let s='<svg viewBox="0 0 380 185" xmlns="http://www.w3.org/2000/svg">';s+='<text x="10" y="17" fill="#597389" font-size="12">TABLERO COMPARTIDO · SIMULACIÓN ESQUEMÁTICA</text>';for(let i=0;i<9;i++){const x=104+(i%3)*52,y=28+Math.floor(i/3)*48;s+=`<rect x="${x}" y="${y}" width="47" height="43" rx="6" fill="${game[i]==='O'?'#fff2e5':game[i]==='X'?'#e7f6fc':'#f4f8fc'}" stroke="#bbd4e4"/>`;if(game[i]!=='.')s+=`<text x="${x+23.5}" y="${y+30}" font-size="29" text-anchor="middle" font-weight="700" fill="${game[i]==='O'?'#b97a3d':'#257ba7'}">${game[i]==='O'?'◯':'✕'}</text>`}s+='<path d="M18 89L40 89L64 62L93 62" fill="none" stroke="#5f87a6" stroke-width="11" stroke-linecap="round"/><circle cx="40" cy="89" r="11" fill="#8fb1c8"/><circle cx="64" cy="62" r="10" fill="#8fb1c8"/><path d="M93 62l8 14m-8-14l11-10" stroke="#517b98" stroke-width="5"/>';s+='</svg>';$('robotBoard').innerHTML=s;}
function status(msg){$('gameStatus').textContent=msg}
function registerHuman(result){visitor.games++;if(result==='X')visitor.wins++;else if(result==='O')visitor.losses++;else visitor.draws++;$('humanGames').textContent=fmt(visitor.games);$('humanWins').textContent=fmt(visitor.wins);$('humanDraws').textContent=fmt(visitor.draws);robotPending=null;finished=true;paintBoard();const evals=makeSnapshot("humana");benchBars(evals);paintChart();paintMetrics();paintQ();}
function robotMove(){const before=game.slice(),a=agent.pick(game,0);if(a<0)return;const qval=agent.value(before,a);game[a]='O';moveNotes.push(`O→${Math.floor(a/3)+1},${a%3+1} (Q=${qval.toFixed(2)})`);paintMoves();const end=E.result(game);if(end){agent.update(before,a,end==='O'?1:.28,game,true);registerHuman(end);status(end==='O'?'El robot ha ganado. Ha aprendido de esta partida.':'¡Empate! El robot ha aprendido de esta partida.');}else{robotPending={state:before,action:a};status(`El robot ha colocado O en la fila ${Math.floor(a/3)+1}, columna ${a%3+1}. Ahora te toca a ti.`);paintBoard()}}
function humanMove(i){if(finished||training||game[i]!=='.')return;game[i]='X';moveNotes.push(`X→${Math.floor(i/3)+1},${i%3+1}`);paintMoves();const end=E.result(game);
 if(robotPending){agent.update(robotPending.state,robotPending.action,end?(end==='X'?-1:.28):-.012,game,!!end);robotPending=null}
 if(end){registerHuman(end);status(end==='X'?'¡Has ganado! El robot incorpora el resultado a sus valores Q.':'¡Empate! Ninguno ha podido completar tres casillas.');return}
 robotMove();}
function newGame(){game=Array(9).fill('.');finished=false;robotPending=null;moveNotes=[];paintMoves();paintBoard();status('Tu turno: pulsa una casilla vacía para colocar una X. El robot responderá con una O.');}
function bench(){const all={};for(const [key] of levels)all[key]=agent.evaluate(key,180,21102026);return all}
function makeSnapshot(source="simulada"){let b=bench(),point={games:agent.games+visitor.games,source};for(const [key] of levels)point[key]=pct(b[key].loss,180);if(timeline.length&&timeline[timeline.length-1].games===point.games)timeline[timeline.length-1]=point;else timeline.push(point);return b}
function benchBars(b){$('benchmarks').innerHTML=levels.map(([key,label])=>{const v=b[key],win=pct(v.win,180),draw=pct(v.draw,180),loss=pct(v.loss,180);return `<div class="benchrow"><span class="label">${label}</span><div class="stack" role="img" aria-label="${label}: ${v.win} victorias, ${v.draw} empates, ${v.loss} derrotas en 180 partidas"><span style="width:${win}%;background:#087e72"></span><span style="width:${draw}%;background:#e3a547"></span><span style="width:${loss}%;background:#c74d5b"></span></div><span style="text-align:right;color:#a1424a" title="Porcentaje de derrotas">${loss}% ↓</span><small class="benchdetails">O gana ${v.win} · Empate ${v.draw} · O pierde ${v.loss}</small></div>`}).join('')}
function paintChart(){const width=700,height=210,padL=48,padR=20,padT=22,padB=33;const x=g=>padL+(g/(Math.max(1000,agent.games+visitor.games)))*(width-padL-padR),y=p=>height-padB-p/100*(height-padT-padB);
 let svg=`<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
 for(const v of [0,25,50,75,100])svg+=`<line x1="${padL}" y1="${y(v)}" x2="${width-padR}" y2="${y(v)}" stroke="#e0e9f1"/><text x="${padL-9}" y="${y(v)+4}" fill="#567087" font-size="11" text-anchor="end">${v}%</text>`;
 const labs=[0,.25,.5,.75,1];for(const q of labs){const g=q*Math.max(1000,agent.games+visitor.games);svg+=`<text x="${x(g)}" y="${height-8}" fill="#567087" font-size="11" text-anchor="middle">${Math.round(g).toLocaleString('es-ES')}</text>`}
 svg+=`<text x="${(width+padL-padR)/2}" y="12" fill="#647c90" font-size="12" text-anchor="middle">Derrotas (%) en 180 partidas de evaluación por rival</text>`;
 for(const [key,label,color] of [['random','Principiante',blue],['intermediate','Intermedio',gold],['expert','Experto',red]]){
  const path=timeline.map((p,i)=>`${i===0?'M':'L'}${x(p.games).toFixed(1)} ${y(p[key]).toFixed(1)}`).join(' ');svg+=`<path d="${path}" fill="none" stroke="${color}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`;
  for(const p of timeline)svg+=`<circle cx="${x(p.games)}" cy="${y(p[key])}" r="${p.source==='humana'?5:3.5}" fill="${color}" stroke="${p.source==='humana'?'#17324d':'white'}" stroke-width="${p.source==='humana'?2:1}"><title>${label}: ${p[key]}% derrotas tras ${p.games} experiencias (${p.source})</title></circle>`;
 }
 svg+='</svg>';
 $('learningChart').innerHTML=svg;
}
function paintMetrics(){const eps=Math.max(.055,.82*Math.exp(-agent.games/3900));$('trained').textContent=fmt(agent.games);$('states').textContent=fmt(agent.q.size);$('exploration').textContent=eps.toFixed(2).replace('.',',');$('robotLevel').textContent=levelLabel();}
function setTraining(flag){training=flag;for(const id of ['train200','train1000','train5000','agentReset','newGame'])$(id).disabled=flag;paintBoard()}
function trainRounds(n){
 if(training)return;
 setTraining(true);
 $('trainStatus').textContent=`Entrenando ${fmt(n)} partidas en el navegador…`;
 let remaining=n, lastBench=null;
 function chunk(){
  const count=Math.min(200,remaining);agent.train(count);remaining-=count;
  const processed=n-remaining;
  const evaluateNow=remaining===0||n<=1000||processed%1000===0;
  paintMetrics();paintQ();
  if(evaluateNow){lastBench=makeSnapshot();benchBars(lastBench);paintChart();}
  if(remaining){
   $('trainStatus').textContent=`Entrenadas ${fmt(processed)} de ${fmt(n)} partidas; evaluaciones ${n<=1000?'cada 200':'cada 1.000'} partidas y al finalizar…`;
   setTimeout(chunk,0);
  } else {
   setTraining(false);newGame();
   const l=pct(lastBench.expert.loss,180);
   $('trainStatus').textContent=`Entrenadas ${fmt(agent.games)} partidas simuladas. Frente al experto, el robot pierde en ${l}% de las 180 partidas de evaluación. Prueba a jugar contra él.`;
  }
 }
 setTimeout(chunk,0);
}
$('ticboard').addEventListener('click',e=>{const b=e.target.closest('button[data-cell]');if(b)humanMove(Number(b.dataset.cell))});
$('train200').addEventListener('click',()=>trainRounds(200));$('train1000').addEventListener('click',()=>trainRounds(1000));$('train5000').addEventListener('click',()=>trainRounds(5000));
$('newGame').addEventListener('click',newGame);
$('agentReset').addEventListener('click',resetAgent);

function paintQ(){const u=agent.lastUpdate;const box=$('qBoard'),det=$('qDetails');$('qCount').textContent=fmt(agent.updates)+' actualizaciones';if(!u){box.innerHTML='<div class="q-empty">Sin estado todavía</div>';det.textContent='Aún no hay actualizaciones Q. En la evaluación inicial no se crean estados aprendidos.';return}box.innerHTML=u.board.map((v,i)=>`<div class="q-square ${i===u.action?'chosen':''}" title="Casilla ${i+1}">${v==='.'?'·':v==='O'?'◯':'✕'}${i===u.action?'<small>acción</small>':''}</div>`).join('');const fmtQ=x=>x.toFixed(3).replace('.',',');det.innerHTML=`<div class="q-numbers"><div><span>Q anterior</span><strong>${fmtQ(u.old)}</strong></div><div><span>Objetivo</span><strong>${fmtQ(u.target)}</strong></div><div><span>Q nuevo</span><strong>${fmtQ(u.next)}</strong></div></div><p>Recompensa observada: <b>${fmtQ(u.reward)}</b> · ${u.done?'fin de partida':'la partida continúa'} · casilla elegida: <b>${u.action+1}</b>.</p><p class="mini">Los valores pueden subir o bajar: aprender significa actualizar la estimación, no aumentar siempre Q.</p>`}
function resetAgent(){agent=new E.Agent(42);visitor={games:0,wins:0,draws:0,losses:0};timeline=[];$('humanGames').textContent='0';$('humanWins').textContent='0';$('humanDraws').textContent='0';const b=makeSnapshot();benchBars(b);paintChart();paintMetrics();paintQ();newGame();$('trainStatus').textContent='Aprendizaje reiniciado: vuelve a jugar o entrena al agente.';}
$('guideBefore').addEventListener('click',()=>{if(training)return;resetAgent();$('guideNote').textContent='ANTES: el agente no ha recibido actualizaciones Q. Juega una partida y observa su estrategia inicial.'});
$('guideDuring').addEventListener('click',()=>{if(training)return;$('guideNote').textContent='DURANTE: entrenamiento real de 200 partidas. Se actualiza la tabla Q y el dashboard.';trainRounds(200)});
$('guideAfter').addEventListener('click',()=>{if(training)return;$('guideNote').textContent='DESPUÉS: entrenamiento real de 5.000 partidas adicionales. Observa el porcentaje de derrotas y vuelve a jugar.';trainRounds(5000)});
const initial=makeSnapshot();benchBars(initial);paintChart();paintMetrics();paintQ();newGame();
})();
