import { CONFIG, PLANS, CATS } from './config.js';
export function dateKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
export function plusDate(key,n) {const d=new Date(key+'T12:00:00'); d.setDate(d.getDate()+n);return dateKey(d);}
export function initialState(today=dateKey()) {return {version:1,name:'邵邵',startDate:today,lastEvaluated:plusDate(today,-1),coins:0,records:{},cats:[],answers:{},restWeekdays:[...CONFIG.defaultRestWeekdays],restDates:[],pendingLoss:null};}
export const completed = s => Object.values(s.records).filter(r=>r.completed);
export const activeCats = s => s.cats.filter(c=>c.status==='home');
export const isRest = (s,key) => s.restDates.includes(key)||s.restWeekdays.includes(new Date(key+'T12:00:00').getDay());
export function current(s,today=dateKey()) {return s.records[today]||{date:today,day:Math.min(completed(s).length+1,CONFIG.totalDays),tasks:[],media:{},completed:false,reward:null};}
export function ensureRecord(s,today=dateKey()) {return s.records[today] ||= current(s,today);}
export function reconcile(s,today=dateKey(),random=Math.random) {
  const yesterday=plusDate(today,-1); let missed=[];
  if(s.lastEvaluated>=yesterday)return;
  if(completed(s).length<CONFIG.totalDays) {
    for(let key=plusDate(s.lastEvaluated,1);key<today;key=plusDate(key,1)) {
      if(key>=s.startDate&&!isRest(s,key)&&!s.records[key]?.completed)missed.push(key);
    }
    const pool=activeCats(s);
    // 一个连续离开期间只触发一次。先保存抽中的实例，揭晓时才切换状态。
    if(missed.length&&pool.length&&!s.pendingLoss)s.pendingLoss={instanceId:pool[Math.floor(random()*pool.length)].instanceId,missed};
  }
  s.lastEvaluated=yesterday;
}
export function finishTask(s,id,today=dateKey()) {
  const r=ensureRecord(s,today);
  if(!r.media.front)throw Error('先完成今天的正面照打卡。');
  if(completed(s).length>=21&&!r.completed)throw Error('21 个训练日已经完成啦。');
  const plan=PLANS[r.day-1];
  if(!plan.tasks.some(t=>t.id===id))throw Error('找不到这个任务。');
  if(!r.tasks.includes(id))r.tasks.push(id);
  r.completed=plan.tasks.every(t=>r.tasks.includes(t.id));
  return r.completed;
}
export function claim(s,key,random=Math.random) {
  const r=s.records[key]; if(!r?.completed||r.reward!==null) return null;
  const amount=CONFIG.reward.min+Math.floor(random()*(CONFIG.reward.max-CONFIG.reward.min+1));
  r.reward=amount;s.coins+=amount;return amount;
}
export function draw(s,count,random=Math.random) {
  if(![1,10].includes(count))throw Error('请选择单抽或十连。');
  const cost=count*CONFIG.draw.price;if(s.coins<cost)throw Error('金币还差一点，完成训练就能领取红包啦。');
  s.coins-=cost;
  return Array.from({length:count},()=>{
    const roll=random(),w=CONFIG.draw.weights,total=w.R+w.S+w.SSR;
    const rarity=roll<w.R/total?'R':roll<(w.R+w.S)/total?'S':'SSR';
    const pool=CATS.filter(c=>c.rarity===rarity), cat=pool[Math.floor(random()*pool.length)];
    const instanceId=globalThis.crypto?.randomUUID?.()||Array.from(globalThis.crypto.getRandomValues(new Uint32Array(4)),x=>x.toString(16)).join('-');
    const instance={instanceId,catId:cat.id,status:'home',obtainedAt:Date.now()};s.cats.push(instance);return cat;
  });
}
export function revealLoss(s) {
  if(!s.pendingLoss)return null;
  const cat=s.cats.find(c=>c.instanceId===s.pendingLoss.instanceId);
  if(cat){cat.status='away';cat.leftAt=Date.now();}
  s.pendingLoss=null;return cat ? CATS[cat.catId] : null;
}
