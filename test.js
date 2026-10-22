// Run with: node test.js
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const elements = new Map();
const element = id => {
  if (!elements.has(id)) elements.set(id, { value: id === 'option-two' ? 'sword' : 'ws', addEventListener() {}, innerHTML: '', textContent: '' });
  return elements.get(id);
};
const context = vm.createContext({ console, Intl, document: { getElementById: element, querySelectorAll: () => [], addEventListener() {} } });
vm.runInContext(fs.readFileSync('criticals.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('weapons.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('app.js', 'utf8'), context);
const engine = vm.runInContext('calculate', context);
const calculate = (a,b) => engine(a,b,{parry:'classic',critical:'basic'});
const p = {ws:3,s:3,t:3,a:1,w:1,save:7,sword:false,buckler:false};
const close = (a,b) => assert.ok(Math.abs(a-b)<1e-10, `${a} != ${b}`);
close(calculate(p,p).chance,1/4);
close(calculate(p,p).expected,1/3);
close(calculate(p,{...p,sword:true}).chance,5/24);
close(calculate(p,{...p,sword:true,buckler:true}).chance,77/432);
close(calculate({...p,s:1},{...p,t:5}).chance,0);
close(calculate({...p,s:1},{...p,t:3}).expected,1/12);
close(calculate({...p,s:6},p).chance,calculate({...p,s:6},{...p,sword:true}).chance);
close(calculate(p,{...p,save:2}).expected,4/27);
for(let attacks=1;attacks<=6;attacks++) {
  for(let s=1;s<=10;s++) {
    const r=calculate({...p,a:attacks,s},{...p,t:5,save:4,sword:true,buckler:true});
    close(r.distribution.reduce((a,b)=>a+b,0),1);
    assert.ok(r.distribution.every(n=>n>=0));
    assert.ok(r.distribution.slice(attacks+2).every(n=>n===0), 'At most one double-wound critical per phase');
  }
}
const parry = vm.runInContext('parryProbability', context);
close(parry(p,{...p,sword:true},6,'campaign'),1/6);
close(parry(p,{...p,sword:true,ws:4},6,'campaign'),1/3);
close(parry(p,{...p,sword:true,buckler:true},6,'campaign'),1/3);
close(parry(p,{...p,sword:true,buckler:true,ws:4},6,'campaign'),1/2);
close(parry({...p,s:4},{...p,s:2,t:8,sword:true},4,'campaign'),0);
close(parry({...p,s:4},{...p,s:3,t:1,sword:true},4,'campaign'),1/6);
close(parry(p,{...p,sword:true},6,'classic'),0);
close(engine(p,{...p,sword:true},{parry:'campaign',critical:'basic'}).chance,5/24);
close(engine(p,p,{parry:'campaign',critical:'none'}).expected,1/4);
for(const mode of ['campaign','classic']) {
  const r=engine({...p,a:6},{...p,sword:true,buckler:true,ws:4},{parry:mode,critical:'basic'});
  close(r.distribution.reduce((sum,p)=>sum+p,0),1);
}
// Campaign shields: armour, one parry object, no extra attacks.
close(parry(p,{...p,shield:true},6,'campaign','campaign'),1/6);
close(parry(p,{...p,shield:true,sword:true},6,'campaign','campaign'),1/3);
close(parry(p,{...p,shield:true,sword:true,ws:4},6,'campaign','campaign'),1/2);
close(parry(p,{...p,shield:true},4,'campaign','standard'),0);
close(parry(p,{...p,buckler:true},6,'campaign','standard'),1/6);
const campaignConfig={parry:'campaign',critical:'basic',equipment:'campaign'};
const standardConfig={...campaignConfig,equipment:'standard'};
const shielded={...p,shield:true,save:6};
assert.equal(engine(p,shielded,campaignConfig).save,6);
assert.equal(engine(p,shielded,standardConfig).save,6);
assert.ok(engine(p,shielded,campaignConfig).expected<engine(p,shielded,standardConfig).expected);
close(engine(shielded,p,campaignConfig).expected,engine(p,p,campaignConfig).expected);
const improve=vm.runInContext('improve',context);
assert.equal(improve(p,'shield').shield,true);
assert.equal(improve(p,'shield').save,6);
close(engine(p,improve(shielded,'shield'),campaignConfig).expected,engine(p,shielded,campaignConfig).expected);
assert.equal(engine(p,{...p,buckler:true},campaignConfig).save,7);
assert.equal(engine(p,{...p,save:2,shield:true},campaignConfig).saved,5/6);
// Injury probabilities include each injury die, remaining wounds and critical modifiers.
const noCrit={...campaignConfig,critical:'none'};
close(engine(p,p,noCrit).outOfAction,1/12);
close(engine(p,{...p,hardToKill:true},noCrit).outOfAction,1/24);
close(engine({...p,a:2},p,noCrit).outOfAction,1-(1-1/12)**2);
close(engine({...p,a:2},{...p,w:2},noCrit).outOfAction,1/48);
close(engine(p,{...p,w:2},noCrit).outOfAction,0);
close(engine(p,p,campaignConfig).outOfAction,1/9);
close(engine(p,{...p,hardToKill:true},campaignConfig).outOfAction,85/1296);
close(engine(p,{...p,w:3},campaignConfig).outOfAction,0);
for(let attacks=1;attacks<=6;attacks++) {
  const normal=engine({...p,a:attacks},p,campaignConfig);
  const tough=engine({...p,a:attacks},{...p,hardToKill:true},campaignConfig);
  assert.ok(normal.outOfAction<=normal.deplete+1e-10);
  assert.ok(tough.outOfAction<=normal.outOfAction+1e-10);
  close(normal.expected,tough.expected);
}
const shootingTarget = vm.runInContext('shootingTarget', context);
assert.equal(shootingTarget(3,0),4);
assert.equal(shootingTarget(3,-2),6);
assert.equal(shootingTarget(3,-3),7);
assert.equal(shootingTarget(6,-1),2);
assert.equal(shootingTarget(10,1),2);
for (const id of ['hit-table','wound-table','shooting-table']) {
  assert.equal((element(id).innerHTML.match(/class="probability-cell"/g)||[]).length,id==='shooting-table'?10:100);
  assert.ok(element(id).innerHTML.includes('--probability-hue:'));
  assert.ok(!element(id).innerHTML.includes('<small>'), 'Cells show only the die target');
}
// Dual wielding audit: https://mordheimer.net/docs/rules/close-combat#fighting-with-two-weapons
// One extra attack, added after modifiers: A=1..6 gives A primary + 1 secondary.
const profile={...p,primary:'hand',secondary:'none'};
const dual={...profile,secondary:'sword'};
const auditedDualConfig={parry:'classic',critical:'none',equipment:'standard'};
for(let attacks=1;attacks<=6;attacks++) {
  const result=engine({...dual,a:attacks},profile,auditedDualConfig);
  assert.equal(result.total,attacks+1);
  assert.deepEqual(Array.from(result.groups,g=>[g.id,g.count]),[['hand',attacks],['sword',1]]);
  // Equal WS and S/T, no save or parry: each attack wounds with (3/6)*(3/6)=1/4.
  // Independent oracle: binomial distribution for n=A+1 attacks, not a second engine call.
  const n=attacks+1;
  let combinations=1;
  for(let wounds=0;wounds<=n;wounds++) {
    if(wounds) combinations=combinations*(n-wounds+1)/wounds;
    close(result.distribution[wounds],combinations*(1/4)**wounds*(3/4)**(n-wounds));
  }
  close(result.expected,n/4);
  close(result.chance,1-(3/4)**n);
}

const dualResult=engine(dual,profile,campaignConfig);
close(dualResult.expected,engine({...profile,a:2},profile,campaignConfig).expected);
close(dualResult.outOfAction,engine({...profile,a:2},profile,campaignConfig).outOfAction);
assert.equal(dualResult.total,2);
assert.equal(engine({...dual,a:4},profile,noCrit).total,5);
assert.equal(engine({...profile,secondary:'buckler'},profile,campaignConfig).total,1);
assert.equal(engine({...profile,secondary:'shield'},profile,campaignConfig).total,2);
assert.equal(engine({...profile,secondary:'shield'},profile,standardConfig).total,1);
const mixed=engine({...profile,primary:'axe',secondary:'dagger'},{...profile,save:5},noCrit);
assert.equal(mixed.groups[0].save,6);
assert.equal(mixed.groups[1].save,4);
close(mixed.expected,1/3);
assert.equal(engine({...profile,primary:'dagger'},profile,noCrit).save,6);
assert.equal(engine({...profile,primary:'halberd'},profile,noCrit).groups[0].strength,3);
for(const primary of ['spear','halberd','great','greatclub']) {
  assert.equal(engine({...profile,primary},profile,noCrit).groups[0].strength,profile.s);
  assert.equal(engine({...profile,primary,s:4},profile,noCrit).groups[0].strength,4);
}
close(engine({...profile,primary:'spear'},profile,noCrit).expected,engine(profile,profile,noCrit).expected);
assert.equal(engine({...profile,primary:'great',secondary:'sword'},profile,noCrit).total,1);
assert.equal(engine({...profile,primary:'spear',secondary:'shield'},profile,campaignConfig).total,1);
close(parry(profile,{...profile,primary:'sword',secondary:'sword'},6,'campaign','campaign'),1/3);
for(const primary of ['hand','axe','dagger','club','great','halberd','spear']) {
  for(const secondary of ['none','sword','dagger','buckler','shield']) {
    for(const mode of ['classic','campaign']) {
      const result=engine({...profile,primary,secondary,a:3},{...profile,primary:'sword',secondary:'shield',save:4},{...campaignConfig,parry:mode});
      close(result.distribution.reduce((sum,p)=>sum+p,0),1);
      assert.ok(result.outOfAction<=result.deplete+1e-10);
      assert.ok(result.distribution.slice(result.total+2).every(p=>p===0),'Shared critical limit across both weapons');
    }
  }
}
const before=vm.runInContext('JSON.stringify(state)',context);
const reversed=vm.runInContext('calculate(state.b,state.a).expected',context);
vm.runInContext('swapFighters()',context);
close(vm.runInContext('calculate(state.a,state.b).expected',context),reversed);
vm.runInContext('swapFighters()',context);
assert.equal(vm.runInContext('JSON.stringify(state)',context),before);
// Optional critical tables: shared families agree in both variants.
const criticalOutcomes=vm.runInContext('criticalOutcomes',context);
const optional={...campaignConfig,critical:'optional'};
const advanced={...campaignConfig,critical:'advanced'};
for(const primary of ['hand','sword','axe','club','spear','halberd','great','greatclub','natural']) {
  const optionalResult=engine({...profile,primary,a:3},{...profile,save:4},optional);
  const advancedResult=engine({...profile,primary,a:3},{...profile,save:4},advanced);
  close(optionalResult.expected,advancedResult.expected);
  close(optionalResult.outOfAction,advancedResult.outOfAction);
  close(optionalResult.distribution.reduce((sum,p)=>sum+p,0),1);
}
for(const family of ['blade','blunt','pole','unarmed','missile','flexible']) {
  const events=criticalOutcomes({family,saved:.5,hit:4,wound:4},'advanced');
  close(events.reduce((sum,o)=>sum+o.p,0),1);
}
const blade=criticalOutcomes({family:'blade',saved:.5,hit:4,wound:4},'optional');
close(blade.filter(o=>o.amount===1 && !o.bonus).reduce((sum,o)=>sum+o.p,0),.5);
close(blade.reduce((sum,o)=>sum+o.p*o.amount,0),4/3);
const auto=engine({...profile,primary:'club'},{...profile,w:10,save:4},optional);
close(auto.outOfAction,1/144);
close(auto.deplete,0);
close(engine({...profile,primary:'club'},{...profile,w:10,save:4,hardToKill:true},optional).outOfAction,1/144);
const natural=criticalOutcomes({family:'unarmed',saved:0,hit:4,wound:4},'optional');
close(natural.filter(o=>o.amount===2).reduce((sum,o)=>sum+o.p,0),1/12);
const flexible=engine({...profile,primary:'flexible'},profile,advanced);
close(flexible.distribution.reduce((sum,p)=>sum+p,0),1);
assert.ok(engine({...profile,primary:'flexible'},profile,optional).unsupported);
assert.equal(engine({...profile,secondary:'shield'},profile,standardConfig).total,1);
// The shield bonus is now entered in the final save, never applied by the engine.
assert.equal(engine(p,{...profile,secondary:'shield'},standardConfig).save,7);
assert.equal(engine(p,{...profile,secondary:'shield',save:5},standardConfig).save,5);
assert.equal(engine(p,{...profile,secondary:'shield',save:5},campaignConfig).save,5);
const boughtShield=improve(profile,'shield');
assert.equal(boughtShield.save,6);
assert.equal(engine(p,boughtShield,standardConfig).save,6);
assert.equal(improve(boughtShield,'shield').save,6);
assert.equal(improve(boughtShield,'buckler').save,7);
// Visible defender parry: unconditional chance in the phase, and conditional on any hit.
const classicConfig={...standardConfig,parry:'classic'};
const defenderSword={...profile,primary:'sword'};
const classicParry=engine(profile,defenderSword,classicConfig);
close(classicParry.parryChance,1/12);
close(classicParry.parryGivenHit,1/6);
close(classicParry.hitChance,1/2);
close(engine(profile,{...defenderSword,secondary:'buckler'},classicConfig).parryChance,31/216);
close(engine({...profile,a:2},defenderSword,campaignConfig).parryChance,1/8);
close(engine(profile,profile,campaignConfig).parryChance,0);
close(engine({...profile,s:6},defenderSword,campaignConfig).parryChance,0);
close(engine(profile,{...profile,secondary:'shield'},standardConfig).parryChance,0);
close(engine(profile,{...profile,secondary:'shield'},campaignConfig).parryChance,1/12);
vm.runInContext('state.a.secondary="dagger";update();',context);
const pipeline=element('pipeline').innerHTML;
assert.equal((pipeline.match(/Parada del defensor/g)||[]).length,1,'One shared defender parry row across both weapons');
assert.equal((pipeline.match(/class="pipeline-row enemy-parry"/g)||[]).length,3,'Parry and both armour saves use the defender style');
assert.ok(pipeline.indexOf('Impactar')<pipeline.indexOf('Parada del defensor'));
assert.ok(pipeline.indexOf('Parada del defensor')<pipeline.indexOf('Herir'));
assert.ok(!pipeline.includes('B → A'));
const parryUiState=vm.runInContext('JSON.stringify(state)',context);
vm.runInContext('state.b.primary="sword";state.b.secondary="none";state.b.ws=state.a.ws;rules.parry="campaign";update();',context);
assert.ok(element('pipeline').innerHTML.includes('<strong>6+</strong><small>'));
vm.runInContext('state.b.secondary="buckler";update();',context);
assert.ok(element('pipeline').innerHTML.includes('<strong>5+</strong><small>'));
vm.runInContext('state.b.ws=state.a.ws+1;update();',context);
assert.ok(element('pipeline').innerHTML.includes('<strong>4+</strong><small>'));
vm.runInContext('rules.parry="classic";update();',context);
assert.ok(element('pipeline').innerHTML.includes('<strong>Variable</strong>'));
vm.runInContext(`state=JSON.parse(${JSON.stringify(parryUiState)});`,context);
vm.runInContext('state.a.secondary="none";update();',context);
// Hatred audit: https://mordheimer.net/docs/rules/leadership-psychology#hatred
// One reroll of failed hit dice, preserving final faces for parry.
const hate={...profile,hatred:true};
close(engine(hate,profile,noCrit).chance,3/8);
close(engine(hate,profile,noCrit).outOfAction,1/8);
close(engine(hate,profile,campaignConfig).expected,1/2);
close(engine({...hate,a:2,secondary:'sword'},profile,noCrit).expected,9/8);
const hatefulParry=engine(hate,defenderSword,classicConfig);
close(hatefulParry.hitChance,3/4);
close(hatefulParry.parryChance,1/8);
close(hatefulParry.parryGivenHit,1/6);
const hitDice=vm.runInContext('hitDieDistribution',context);
for(const target of [3,4,5]) {
  const brute=Array(6).fill(0);
  for(let first=1;first<=6;first++) {
    if(first>=target) brute[first-1]+=1/6;
    else for(let second=1;second<=6;second++) brute[second-1]+=1/36;
  }
  const faces=hitDice(target,true);
  close(faces.reduce((sum,[,p])=>sum+p,0),1);
  faces.forEach(([die,p])=>close(p,brute[die-1]));
}
// Independent end-to-end check: p(hit with hatred)=p+(1-p)*p.
// Both weapons use the same rule; with S3/T3, no saves or parries, p(wound)=p(hit)/2.
for(const [ws,target] of [[2,5],[3,4],[6,3]]) {
  for(const hatred of [false,true]) {
    const attacker={...profile,ws,hatred,a:3,secondary:'sword'};
    const defender={...profile,ws:5};
    const hit=(7-target)/6;
    const perAttack=(hatred?hit+(1-hit)*hit:hit)/2;
    const result=engine(attacker,defender,{parry:'classic',critical:'none',equipment:'standard'});
    close(result.expected,4*perAttack);
    close(result.chance,1-(1-perAttack)**4);
    result.groups.forEach(group=>close(group.hitChance,hatred?hit+(1-hit)*hit:hit));
  }
}
const naturalHatred=criticalOutcomes({family:'unarmed',saved:0,hit:4,hitChance:3/4,wound:4},'advanced');
close(naturalHatred.filter(o=>o.amount===2).reduce((sum,o)=>sum+o.p,0),1/8);
for(const mode of ['classic','campaign']) for(const critMode of ['none','basic','optional','advanced']) {
  const result=engine({...hate,a:3,secondary:'dagger'},defenderSword,{...campaignConfig,parry:mode,critical:critMode});
  close(result.distribution.reduce((sum,p)=>sum+p,0),1);
}
const preHatred=vm.runInContext('JSON.stringify(state)',context);
vm.runInContext('state.a.hatred=true;renderFighter("a");update();',context);
assert.ok(element('fighter-a').innerHTML.includes('data-field="hatred" checked'));
assert.ok(element('result-note').textContent.includes('Odio activo'));
vm.runInContext('swapFighters()',context);
assert.equal(vm.runInContext('state.b.hatred',context),true);
vm.runInContext(`state=JSON.parse(${JSON.stringify(preHatred)});renderFighter('a');renderFighter('b');update();`,context);
console.log('All combat, hatred, critical table, weapon, swap and reference tests passed.');
