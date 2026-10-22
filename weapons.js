'use strict';
// Families refer to the source critical tables, not to custom damage bonuses.
const weapons = {
  hand: {name:'Arma de filo · genérica',family:'blade',note:'Sin reglas especiales.'},
  sword: {name:'Espada',family:'blade',parry:true,note:'Parada.'},
  dagger: {name:'Daga · +1 salvación rival (automático)',family:'blade',armour:-1,note:'+1 a la salvación enemiga; sin armadura, salva a 6+ antes de modificadores de Fuerza.'},
  axe: {name:'Hacha · −1 salvación rival (automático)',family:'blade',armour:1,note:'Filo cortante: −1 adicional a la armadura enemiga.'},
  club: {name:'Martillo / maza / garrote',family:'blunt',note:'Conmoción: cambia derribado por aturdido en un 2; no cambia el umbral de fuera de combate.'},
  spear: {name:'Lanza · +1 F cargando montado (manual)',family:'pole',note:'F del usuario. Con las reglas opcionales de monturas: +1 F al cargar montado, solo ese turno; introdúcelo manualmente arriba. Ataca primero en el primer turno de combate (no se simula). No permite segunda arma ni rodela; sí escudo.'},
  halberd: {name:'Alabarda · +1 F (manual)',family:'pole',twoHands:true,note:'+1 Fuerza: introdúcelo manualmente en F; no se suma automáticamente. Requiere ambas manos.'},
  great: {name:'Espada / hacha a dos manos · +2 F (manual)',family:'blade',twoHands:true,note:'+2 Fuerza: introdúcelo manualmente en F; no se suma automáticamente. Requiere ambas manos. Atacar último no se simula.'},
  greatclub: {name:'Martillo a dos manos · +2 F (manual)',family:'blunt',twoHands:true,note:'+2 Fuerza: introdúcelo manualmente en F; no se suma automáticamente. Conmoción y ambas manos. Atacar último no se simula.'},
  natural: {name:'Ataques naturales · sin armas',family:'unarmed',natural:true,note:'Perfil de criatura sin armas, no puños humanos. F del perfil; sin arma secundaria.'},
  flexible: {name:'Arma flexible · perfil genérico',family:'flexible',note:'Solo tabla avanzada. F del perfil, sin reglas adicionales de un arma concreta.'},
  buckler: {name:'Rodela',family:null,parry:true,noAttack:true,note:'Parada. No añade ataques ni armadura.'},
  shield: {name:'Escudo · +1 armadura (manual)',family:'blunt',note:'+1 armadura: inclúyelo manualmente en tu salvación final (5+ pasa a 4+; sin armadura pasa a 6+). No se suma automáticamente. En campaña, parada y un ataque secundario con Conmoción.'},
  none: {name:'Ninguna',family:null,noAttack:true,note:''}
};
function equipmentOf(p) {
  // Old-style profiles are supported by the analytical regression tests.
  if(!p.primary) return {sword:!!p.sword,buckler:!!p.buckler,shield:!!p.shield,parries:Number(!!p.sword)+Number(!!p.buckler)};
  const secondary=validSecondary(p.primary,p.secondary||'none');
  const ids=[p.primary,secondary];
  return {sword:ids.includes('sword'),buckler:ids.includes('buckler'),shield:ids.includes('shield'),parries:ids.filter(id=>weapons[id].parry).length};
}
function validSecondary(primary,secondary) {
  if(weapons[primary].twoHands || weapons[primary].natural) return 'none';
  if(primary==='spear' && !['none','shield'].includes(secondary)) return 'none';
  return secondary;
}
function hitDieDistribution(target,hatred=false) {
  const failed=(target-1)/6;
  // Retain final die faces: classical parry depends on the highest successful result.
  return Array.from({length:6},(_,i)=>[i+1,hatred?(i+1>=target?(1+failed)/6:failed/6):1/6]);
}
function attackGroups(a,b,config) {
  const primary=a.primary||'hand';
  const secondary=validSecondary(primary,a.secondary||'none');
  const make=(id,count)=>{
    const weapon=weapons[id];
    const strength=a.s; // The profile contains the final, manually adjusted Strength.
    const wound=woundTarget({s:strength},b);
    const armour=Math.max(2,b.save); // Final armour, including any manually entered shield bonus.
    const save=armour===7 && id!=='dagger'?7:Math.max(2,armour+Math.max(0,strength-3)+(weapon.armour||0));
    const saved=save>6?0:(7-save)/6;
    const woundChance=Math.max(0,(7-wound)/6);
    const critical=config.critical!=='none' && wound<6?1/6:0;
    const hit=hitTarget(a,b);
    const hitDice=hitDieDistribution(hit,a.hatred);
    const hitChance=hitDice.reduce((sum,[die,p])=>sum+(die>=hit?p:0),0);
    const group={id,name:weapon.name,family:weapon.family,count,strength,hit,hitDice,hitChance,wound,save,saved};
    const critExpected=critical && criticalFamilyAvailable(group.family,config.critical)?criticalOutcomes(group,config.critical).reduce((sum,o)=>sum+o.p*o.amount,0):0;
    group.expected=(woundChance-critical)*(1-saved)+critical*critExpected;
    return group;
  };
  const groups=[make(primary,a.a)];
  if(primary!=='spear' && !weapons[secondary].noAttack && (secondary!=='shield'||config.equipment==='campaign')) groups.push(make(secondary,1));
  return groups;
}
function calculateWeaponCombat(a,b,config) {
  const groups=attackGroups(a,b,config);
  const unavailable=groups.find(g=>!criticalFamilyAvailable(g.family,config.critical));
  if(unavailable) return {unsupported:`${unavailable.name}: no tiene tabla en «${criticalModes[config.critical]}». Selecciona críticos avanzados, básicos o sin críticos, o cambia de arma.`,groups};
  const main=groups[0],off=groups[1];
  // Enumerate the successful main-hand count + highest main die, then the off-hand die.
  let hits=new Map([['0,0',1]]);
  for(let i=0;i<main.count;i++) {
    const next=new Map();
    for(const [key,p] of hits) {
      const [n,max]=key.split(',').map(Number);
      for(const [die,dieProbability] of main.hitDice) {
        const k=die>=main.hit?`${n+1},${Math.max(max,die)}`:key;
        next.set(k,(next.get(k)||0)+p*dieProbability);
      }
    }
    hits=next;
  }
  let parryChance=0,hitChance=0;
  const combinations=new Map();
  const addCounts=(n,m,p)=>{const k=`${n},${m}`;combinations.set(k,(combinations.get(k)||0)+p);};
  for(const [key,p] of hits) {
    const [n,max]=key.split(',').map(Number);
    for(const [die,dieProbability] of off?off.hitDice:[[0,1]]) {
      const m=off && die>=off.hit?1:0;
      let candidates=[];
      if(n) candidates.push({slot:0,die:max,group:main});
      if(m) candidates.push({slot:1,die,group:off});
      if(config.parry==='classic') {
        const highest=Math.max(0,...candidates.map(c=>c.die));
        candidates=candidates.filter(c=>c.die===highest);
      }
      candidates=candidates.filter(c=>c.group.strength<2*b.s);
      // Optional rule allows choosing any successful hit: prevent greatest expected damage.
      candidates.sort((x,y)=>y.group.expected-x.group.expected || x.slot-y.slot);
      const choice=candidates[0];
      const chance=choice?parryProbability({...a,s:choice.group.strength},b,choice.die,config.parry,config.equipment):0;
      const probability=p*dieProbability;
      if(n+m>0) hitChance+=probability;
      parryChance+=probability*chance;
      addCounts(n,m,probability*(1-chance));
      if(chance) addCounts(n-(choice.slot===0?1:0),m-(choice.slot===1?1:0),probability*chance);
    }
  }
  const total=main.count+(off?1:0);
  const distribution=Array(total*2+1).fill(0);
  let outOfAction=0;
  for(const [counts,hitProbability] of combinations) {
    if(!hitProbability) continue;
    const [n,m]=counts.split(',').map(Number);
    const sequence=[...Array(n).fill(main),...Array(m).fill(off)];
    let outcomes=new Map([['0,0,0',1]]);
    for(const group of sequence) {
      const next=new Map();
      const store=(damage,used,dead,p)=>{
        if(!p) return;
        const k=`${damage},${used},${dead}`;next.set(k,(next.get(k)||0)+p);
      };
      for(const [key,p] of outcomes) {
        const [damage,used,dead]=key.split(',').map(Number);
        const add=(amount,newUsed,probability,bonus=0,forced=false)=>{
          const rolls=Math.max(0,damage+amount-b.w+1)-Math.max(0,damage-b.w+1);
          const fatal=dead||forced?1:1-(1-injuryProbability(b.hardToKill,bonus))**rolls;
          store(damage+amount,newUsed,1,probability*fatal);
          store(damage+amount,newUsed,0,probability*(1-fatal));
        };
        for(let die=1;die<=6;die++) {
          if(die<group.wound) {add(0,used,p/6);continue;}
          if(config.critical!=='none' && die===6 && group.wound<6 && !used) {
            for(const effect of criticalOutcomes(group,config.critical)) add(effect.amount,1,p/6*effect.p,effect.bonus,effect.forced);
          } else {
            add(0,used,p/6*group.saved);
            add(1,used,p/6*(1-group.saved));
          }
        }
      }
      outcomes=next;
    }
    for(const [key,p] of outcomes) {
      const [damage,,dead]=key.split(',').map(Number);
      distribution[damage]+=p*hitProbability;
      if(dead) outOfAction+=p*hitProbability;
    }
  }
  const canParry=parryObjects(b,config.equipment)>0 && groups.some(g=>g.strength<2*b.s);
  return {...main,groups,total,canParry,distribution,outOfAction,parryChance,hitChance,parryGivenHit:hitChance>0?parryChance/hitChance:0,
    expected:distribution.reduce((sum,p,i)=>sum+p*i,0),chance:1-distribution[0],
    deplete:distribution.reduce((sum,p,i)=>sum+(i>=b.w?p:0),0)};
}
