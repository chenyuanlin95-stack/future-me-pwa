export const CONFIG = {
  totalDays: 21,
  reward: { total: 300, min: 8, max: 22 },
  draw: { singlePrice: 1, tenPrice: 9, weights: { R: .80, S: .17, SSR: .03 }, pity: 50 },
  initialLeaveTickets: 2,
  recallStreak: 5,
  maxCheckinVideoSeconds: 60,
  defaultRestWeekdays: [],
};

export function generateRewardPool(random = Math.random) {
  const { total, min, max } = CONFIG.reward;
  const pool = Array(CONFIG.totalDays).fill(min);
  let remaining = total - min * pool.length;
  while (remaining > 0) {
    const candidates = pool.map((v, i) => v < max ? i : -1).filter(i => i >= 0);
    const i = candidates[Math.floor(random() * candidates.length)];
    const add = Math.min(remaining, 1 + Math.floor(random() * Math.min(5, max - pool[i])));
    pool[i] += add; remaining -= add;
  }
  for (let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  return pool;
}

const questions = ['如果可以给未来的自己写一封信，你最想说什么？','你希望这 21 个训练日带给你什么？','最近哪件小事让你感到快乐？','你最喜欢自己的哪一个特点？','你想留出更多时间给什么？','什么时候，你最能感受到自己的力量？','有什么事，你想对自己说声谢谢？','你理想中的普通一天是什么样子？','你想慢慢放下哪一种负担？','谁让你感到被理解？','最近你勇敢做了什么？','你想培养的一个小习惯是什么？','你会怎样安慰疲惫的自己？','哪一段回忆让你感到温暖？','什么事情值得你坚持？','你希望未来的家是什么样子？','你想和谁分享这段小小的成长？','你正在学着接纳自己的哪一面？','这段时间，你发现了什么变化？','你想把哪一句话送给明天的自己？','完成这 21 天后，你想怎样继续照顾自己？'];
const planRows = [
 ['肩背启动日 🌷',[['肩背抗阻训练',25],['核心强化',15],['肩颈胸背拉伸',5]]],['胸肩力量日 🎀',[['胸部/推力训练',20],['肩部塑形训练',15],['核心强化',15]]],['马甲线重点日 ✨',[['核心强化',25],['肩背辅助训练',20]]],['肩背进阶日 🌸',[['肩背抗阻训练',30],['核心强化',15]]],['全身力量日 🍑',[['全身力量训练',35],['核心短练',10]]],['胸肩进阶日 🎀',[['胸部/推力训练',20],['肩部塑形训练',15],['核心强化',15]]],['第一阶段完成 🌟',[['肩背抗阻训练',30],['核心强化',15],['拉伸',5],['Day 7 对比照',1]]],['马甲线进阶 ✨',[['核心强化',25],['肩背辅助训练',20]]],['肩背强化 🌷',[['肩背抗阻训练',30],['核心强化',15]]],['胸肩强化 🎀',[['胸部/推力训练',20],['肩部塑形训练',15],['核心强化',15]]],['全身力量 II 🌼',[['全身力量训练',35],['核心短练',10],['拉伸',5]]],['马甲线强化 ✨',[['核心强化',25],['肩背辅助训练',20]]],['肩背强化 II 🌸',[['肩背抗阻训练',30],['核心强化',15]]],['胸肩强化 II 🎀',[['胸部/推力训练',20],['肩部塑形训练',15],['核心强化',15],['Day 14 对比照',1]]],['核心进阶 ✨',[['核心强化',25],['肩背辅助训练',20]]],['肩背冲刺 🌷',[['肩背抗阻训练',30],['核心强化',15],['拉伸',5]]],['全身力量 III 🌼',[['全身力量训练',35],['核心短练',10]]],['胸肩冲刺 🎀',[['胸部/推力训练',20],['肩部塑形训练',15],['核心强化',15]]],['马甲线冲刺 ✨',[['核心强化',25],['肩背辅助训练',20]]],['肩背 Final 🌸',[['肩背抗阻训练',30],['核心强化',15],['拉伸',5]]],['FUTURE ME 💗',[['全身力量',30],['肩背强化',15],['核心强化',15],['能力复测',5]]]
];
const slug=name=>name.toLowerCase().replace(/[\s/]+/g,'-').replace(/[^\w\u4e00-\u9fff-]/g,'');
export const PLANS=planRows.map(([title,rows],i)=>({day:i+1,title,question:questions[i],placeholder:false,tasks:rows.map(([name,minutes],j)=>({id:`d${i+1}-${j+1}-${slug(name)}`,sourceKey:slug(name.replace(/Day \d+ /i,'')),name,minutes,description:`完成 ${name}，动作以稳定和可控为主。`,encouragement:'不用做到完美，把今天认真完成就很好。'}))}));
const names=['雪球','布丁','奶盖','橘子','芝士','糯米','黑糖','团子','云朵','小花','豆豆','可可','桃桃','抹茶','蓝莓','樱花','栗子','奶霜','星星','泡芙','月光','草莓牛奶','天使','魔法师'];
export const CATS=names.map((name,i)=>({id:i,name,rarity:i<12?'R':i<20?'S':'SSR',crop:i<12?[18+(i%6)*104,i<6?263:411,102,112]:i<20?[675+((i-12)%4)*119,i<16?261:409,112,121]:[1184+((i-20)%2)*172,i<22?256:413,160,137]}));
export const ART={hero:[13,53,242,140],cheer:[268,31,160,166],today:[435,23,166,173],cuddle:[847,29,223,162],avatar:[1101,54,112,118],camera:[770,650,122,112],lock:[902,651,116,112],empty:[1025,665,112,98],away:[142,645,143,118],packet:[460,642,119,135],opened:[600,608,129,170],unknown:[299,641,117,129]};
