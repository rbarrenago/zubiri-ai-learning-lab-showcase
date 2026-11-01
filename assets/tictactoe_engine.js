/* ZUBIRI AI Learning Lab v2.2 — Q-learning tabular para tres en raya, sin dependencias. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ZubiriTicTacToe = api;
})(typeof window === 'undefined' ? null : window, function () {
  'use strict';
  const TRANSFORMS=[];
  for(let flip=0;flip<2;flip++) for(let rot=0;rot<4;rot++){
    const m=[];
    for(let i=0;i<9;i++){
      let r=Math.floor(i/3),c=i%3;
      if(flip)c=2-c;
      for(let k=0;k<rot;k++){const rr=c,cc=2-r;r=rr;c=cc}
      m.push(r*3+c);
    }
    TRANSFORMS.push(m);
  }
  const LINES=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const moves=board=>board.map((v,i)=>v==='.'?i:-1).filter(i=>i!==-1);
  function result(board){for(const line of LINES){const a=board[line[0]];if(a!=='.'&&a===board[line[1]]&&a===board[line[2]])return a}return moves(board).length?null:'E'}
  function canon(board){let best=null,bm=null;for(const t of TRANSFORMS){let b=Array(9);for(let i=0;i<9;i++)b[t[i]]=board[i];const key=b.join('');if(best===null||key<best){best=key;bm=t}}return {key:best,transform:bm}}
  function seeded(seed){let x=seed>>>0;return ()=>{x+=0x6D2B79F5;let t=x;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296}}
  function choose(arr,rng){return arr[Math.floor(rng()*arr.length)]}
  const minimaxMemo=new Map();
  function minimaxScore(board,turn){const r=result(board);if(r==='X')return 1;if(r==='O')return -1;if(r==='E')return 0;const key=board.join('')+turn;if(minimaxMemo.has(key))return minimaxMemo.get(key);const scores=moves(board).map(i=>{board[i]=turn;const s=minimaxScore(board,turn==='X'?'O':'X');board[i]='.';return s});const score=turn==='X'?Math.max(...scores):Math.min(...scores);minimaxMemo.set(key,score);return score}
  function expertX(board,rng){let scored=moves(board).map(i=>{board[i]='X';const score=minimaxScore(board,'O');board[i]='.';return {i,score}});return choose(scored.filter(o=>o.score===Math.max(...scored.map(p=>p.score))),rng).i}
  function intermediateX(board,rng){const avail=moves(board);if(rng()<.12)return choose(avail,rng);for(const player of ['X','O'])for(const i of avail){board[i]=player;const win=result(board)===player;board[i]='.';if(win)return i}if(board[4]==='.')return 4;const corners=[0,2,6,8].filter(i=>board[i]==='.');return corners.length?choose(corners,rng):choose(avail,rng)}
  function opponentMove(board,skill,rng){if(skill==='expert')return expertX(board,rng);if(skill==='intermediate')return intermediateX(board,rng);return choose(moves(board),rng)}
  class Agent{
    constructor(seed=42){this.seed=seed;this.rng=seeded(seed);this.q=new Map();this.games=0;this.totals={win:0,draw:0,loss:0};this.history=[];this.updates=0;this.lastUpdate=null;}
    state(board,create=false){const c=canon(board);if(create&&!this.q.has(c.key))this.q.set(c.key,new Float64Array(9));return {q:this.q.get(c.key)||new Float64Array(9),t:c.transform}}
    value(board,action){const s=this.state(board);return s.q[s.t[action]]}
    pick(board,epsilon=0,rng=this.rng){const valid=moves(board);if(!valid.length)return -1;if(rng()<epsilon)return choose(valid,rng);let max=-Infinity,best=[];for(const a of valid){const v=this.value(board,a);if(v>max+1e-9){max=v;best=[a]}else if(Math.abs(v-max)<1e-9)best.push(a)}return choose(best,rng)}
    maxValue(board){return Math.max(...moves(board).map(a=>this.value(board,a)))}
    update(board,action,reward,nextBoard,done){const s=this.state(board,true);const ai=s.t[action];const old=s.q[ai];const target=reward+(done?0:.95*this.maxValue(nextBoard));const next=old+.28*(target-old);s.q[ai]=next;this.updates++;this.lastUpdate={board:board.slice(),action,reward,old,target,next,done,step:this.updates};return this.lastUpdate}
    trainOne(){const board=Array(9).fill('.'),e=Math.max(.055,.82*Math.exp(-this.games/3900));let skill;const p=this.rng();if(p<.35)skill='random';else if(p<.67)skill='intermediate';else skill='expert';let finish=null;
      // El contrario X empieza: el agente O aprende a contestar a jugadores de varios niveles.
      while(!finish){const x=opponentMove(board,skill,this.rng);board[x]='X';finish=result(board);if(finish)break;
        const state=board.slice(),a=this.pick(board,e,this.rng);board[a]='O';finish=result(board);
        if(finish){this.update(state,a,finish==='O'?1:.28,board,true);break}
        const x2=opponentMove(board,skill,this.rng);board[x2]='X';finish=result(board);
        if(finish){this.update(state,a,finish==='X'?-1:.28,board,true);break}
        this.update(state,a,-.012,board,false);
        // La siguiente iteración ya debe empezar por O, pues X acaba de mover.
        while(!finish){const s2=board.slice(),a2=this.pick(board,e,this.rng);board[a2]='O';finish=result(board);
          if(finish){this.update(s2,a2,finish==='O'?1:.28,board,true);break}
          const xx=opponentMove(board,skill,this.rng);board[xx]='X';finish=result(board);
          if(finish){this.update(s2,a2,finish==='X'?-1:.28,board,true);break}
          this.update(s2,a2,-.012,board,false);
        }
      }
      const outcome=finish==='O'?'win':finish==='X'?'loss':'draw';this.games++;this.totals[outcome]++;
      this.history.push(outcome);return outcome;
    }
    train(n){const out={win:0,draw:0,loss:0};for(let i=0;i<n;i++)out[this.trainOne()]++;return out}
    evaluate(skill,n=160,seed=20271031){const rng=seeded(seed),out={win:0,draw:0,loss:0};for(let j=0;j<n;j++){const board=Array(9).fill('.');let finish=null;while(!finish){let x=opponentMove(board,skill,rng);board[x]='X';finish=result(board);if(finish)break;const a=this.pick(board,0,rng);board[a]='O';finish=result(board)}out[finish==='O'?'win':finish==='X'?'loss':'draw']++}return out}
  }
  return {Agent,moves,result,opponentMove,seeded,canon};
});
