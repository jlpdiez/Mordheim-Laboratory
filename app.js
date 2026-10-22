'use strict';
const defaults = () => ({ a: { ws: 3, s: 3, t: 3, a: 1, w: 1, save: 7, primary:'hand', secondary:'none', hardToKill: false, hatred:false }, b: { ws: 3, s: 3, t: 3, a: 1, w: 1, save: 6, primary:'hand', secondary:'none', hardToKill: false, hatred:false } });
let state = defaults();
const rules = { parry: 'classic', critical: 'basic', equipment: 'standard' };
function parryObjects(p,equipment=rules.equipment) {
  const loadout=equipmentOf(p);
  return loadout.parries+Number(loadout.shield && equipment==='campaign');
}
function optionalParryTarget(a,b,equipment=rules.equipment) {
  return (parryObjects(b,equipment)>=2?5:6)-(b.ws>a.ws?1:0);
}
function parryProbability(a,b,highest,mode=rules.parry,equipment=rules.equipment) {
  const objects=parryObjects(b,equipment);
  if(!objects || a.s>=2*b.s) return 0;
  if(mode==='campaign') {
    const target=optionalParryTarget(a,b,equipment);
    return (7-target)/6;
  }
  const chance=(6-highest)/6;
  return equipmentOf(b).buckler && objects>=2?1-(1-chance)**2:chance;
}
const $ = id => document.getElementById(id);
const pct = n => new Intl.NumberFormat('es', { style: 'percent', maximumFractionDigits: 1 }).format(n);
const num = n => n.toLocaleString('es', { maximumFractionDigits: 3 });
function renderFighter(key) {
  const p = state[key];
  const fields = [['ws','HA','Habilidad de armas',1,10],['s','F','Fuerza final: incluye manualmente los bonos del arma o de la ronda',1,10],['t','R','Resistencia',1,10],['a','A','Ataques con el arma principal',1,6],['w','H','Heridas restantes',1,6]];
  $('fighter-' + key).innerHTML = `<div class="fighter-top"><span class="fighter-letter ${key}">${key.toUpperCase()}</span><div><h3>${key === 'a' ? 'Atacante' : 'Defensor'}</h3><span>${key === 'a' ? 'Perfil a mejorar' : 'Perfil de referencia'}</span></div><span class="profile-tag">${key === 'a' ? 'ATACANTE' : 'DEFENSOR'}</span></div><div class="stats">${fields.map(([id,label,title,min,max]) => `<label title="${title}"><span>${label}</span><input type="number" aria-label="${title}, combatiente ${key.toUpperCase()}" data-key="${key}" data-field="${id}" min="${min}" max="${max}" value="${p[id]}"></label>`).join('')}</div>${weaponControls(key,p)}<label class="trait-check"><input type="checkbox" data-key="${key}" data-field="hatred" ${p.hatred?'checked':''}> Odio activo <small>Repite fallos al impactar · solo 1ª ronda contra este rival</small></label><label class="trait-check"><input type="checkbox" data-key="${key}" data-field="hardToKill" ${p.hardToKill?'checked':''}> Duro de matar <small>Fuera de combate solo a 6+${key==='a'?' · defensa en el comparador':''}</small></label>`;
}
function weaponControls(key,p) {
  const options=(secondary=false)=>Object.entries(weapons).filter(([id,w])=>secondary?!w.twoHands && !w.natural && id!=='spear':!['none','buckler','shield'].includes(id)).sort(([a],[b])=>secondary?Number(b==='none')-Number(a==='none'):0).map(([id,w])=>`<option value="${id}" ${(secondary?p.secondary:p.primary)===id?'selected':''} ${secondary && validSecondary(p.primary,id)!==id?'disabled':''}>${w.name}</option>`).join('');
  const groups=attackGroups(p,state[key==='a'?'b':'a'],rules);
  const attacks=groups.reduce((n,g)=>n+g.count,0);
  return `<div class="weapon-selectors"><label>Arma principal<select data-key="${key}" data-field="primary">${options()}</select></label><label>Arma secundaria<select data-key="${key}" data-field="secondary" ${weapons[p.primary].twoHands || weapons[p.primary].natural?'disabled':''}>${options(true)}</select></label></div><p class="loadout-note">${weapons[p.primary].note} ${p.primary==='spear' && p.secondary==='shield'?'Escudo solo defensivo: +1 armadura manual (inclúyelo en la salvación final) y, con equipo de campaña, parada.':weapons[p.secondary].note}</p><div class="equipment"><label class="save-label">Armadura (manual)<select data-key="${key}" data-field="save">${[7,6,5,4,3,2].map(n=>`<option value="${n}" ${p.save===n?'selected':''}>${n===7?'Sin armadura':n+'+'}</option>`).join('')}</select></label><span class="attack-count"><strong>${attacks}</strong> ataques totales<br>${p.a} principal${groups.length>1?' + 1 secundaria':''}</span></div>`;
}
function injuryProbability(hardToKill=false,bonus=0) {
  return Math.min(5,Math.max(0,7-(hardToKill?6:5)+bonus))/6;
}
function hitTarget(a,b) { return a.ws > b.ws ? 3 : b.ws > 2*a.ws ? 5 : 4; }
function woundTarget(a,b) { const d=b.t-a.s; return d>=4 ? 7 : d>=2 ? 6 : Math.max(2,4+d); }
function calculate(a,b,config=rules) {
  return calculateWeaponCombat(a,b,config);
}
function update() {
  const r=calculate(state.a,state.b);
  if(r.unsupported) {
    for(const id of ['damage-chance','expected','deplete','out-of-action']) $(id).textContent='—';
    $('pipeline').innerHTML='';$('distribution').innerHTML='';$('injury-note').textContent='';
    $('result-note').textContent=r.unsupported;renderComparison();return;
  }
  const parryNote=!parryObjects(state.b,rules.equipment)?'El defensor no lleva ningún objeto con parada.':!r.canParry?'No puede parar: la Fuerza atacante es al menos el doble de la suya.':`Probabilidad de anular un impacto en toda la fase, incluyendo fases sin impactos. Si A logra algún impacto: ${pct(r.parryGivenHit)}. Ya descontado del daño; máximo una parada entre ambas armas.`;
  const parryValue=!r.canParry?'—':rules.parry==='campaign'?`${optionalParryTarget(state.a,state.b)}+`:'Variable';
  const parryRow=`<div class="pipeline-row enemy-parry" title="${parryNote}"><span class="step-number">02</span><span>Parada del defensor<div class="mini-track"><i style="width:${r.parryChance*100}%"></i></div></span><strong>${parryValue}</strong><small>${pct(r.parryChance)}</small></div>`;
  $('damage-chance').textContent=pct(r.chance);
  $('expected').textContent=num(r.expected);
  $('deplete').textContent=pct(r.deplete);
  $('out-of-action').textContent=pct(r.outOfAction);
  $('injury-note').textContent=`Fuera de combate con ${state.b.hardToKill?'6+ (Duro de matar)':'5+'} en lesiones. Incluye dados múltiples y los modificadores de lesiones de la tabla activa, también con Duro de matar. Aplastado puede causar fuera de combate automático. No equivale a muerte pospartida.`;
  $('wounds-label').textContent=`Agotar ${state.b.w} ${state.b.w===1?'herida':'heridas'} del rival`;
  $('pipeline').innerHTML=r.groups.map((g,i)=>{
    const rows=[['01','Impactar',`${g.hit}+`,g.hitChance],['03','Herir',g.wound>6?'Imposible':`${g.wound}+`,Math.max(0,(7-g.wound)/6)],['04','Salvar',g.save>6?'Sin salvación':`${g.save}+`,g.saved]];
    return `<div class="weapon-result-heading">${i?'Secundaria':'Principal'} · ${g.name}<small>${g.count} ${g.count===1?'ataque':'ataques'} · F${g.strength}${['optional','advanced'].includes(rules.critical)?' · '+criticalTables[g.family].name:''}</small></div>`+rows.map(([n,label,value,p])=>`<div class="pipeline-row${n==='04'?' enemy-parry':''}"><span class="step-number">${n}</span><span>${label}<div class="mini-track"><i style="width:${p*100}%"></i></div></span><strong>${value}</strong><small>${pct(p)}</small></div>${i===0 && n==='01'?parryRow:''}`).join('');
  }).join('');
  $('result-note').textContent=`${rules.critical==='none'?'Críticos desactivados.':r.groups.some(g=>g.wound<6)?`✦ ${criticalModes[rules.critical]} · máximo uno por fase.`:'Críticos no disponibles con esta Fuerza / Resistencia.'} ${r.canParry?`${rules.parry==='campaign'?'Reglas opcionales de parada':'Parada clásica'} del rival incluidas en el cálculo.`:''} ${r.total} ataques en total; principal antes que secundaria.${state.a.hatred?' Odio activo: fallos al impactar repetidos una vez. Desmárcalo después de la primera ronda.':''}`;
  const max=Math.max(...r.distribution);
  $('distribution').innerHTML=r.distribution.map((p,i)=>`<div class="dist-col"><strong>${pct(p)}</strong><div class="bar-space"><div class="dist-bar ${i===0?'zero':''}" style="height:${p/max*100}%"></div></div><span>${i} ${i===1?'herida':'heridas'}</span></div>`).join('');
  renderComparison();
}
const labels={ws:'+1 HA',sword:'Espada',strength:'+1 Fuerza',attack:'+1 Ataque',shield:'Escudo',buckler:'Rodela'};
function improve(p,option) {
  const q={...p};
  if(option==='ws') q.ws=Math.min(10,q.ws+1);
  if(option==='strength') q.s=Math.min(10,q.s+1);
  if(option==='attack') q.a+=1;
  if(q.primary) {
    if(option==='sword') q.primary='sword';
    if(['buckler','shield'].includes(option)) q.secondary=validSecondary(q.primary,option);
    q.secondary=validSecondary(q.primary,q.secondary);
  } else {
    if(option==='sword') q.sword=true;
    if(option==='buckler') q.buckler=true;
    if(option==='shield') q.shield=true;
  }
  // Counterfactual equipment changes adjust the final save on the copy, never on the editor profile.
  const shieldDelta=Number(equipmentOf(q).shield)-Number(equipmentOf(p).shield);
  q.save=Math.min(7,Math.max(2,q.save-shieldDelta));
  return q;
}
function renderComparison() {
  const baseOut=calculate(state.a,state.b),baseIn=calculate(state.b,state.a);
  const options=[$('option-one').value,$('option-two').value];
  const results=options.map(o=>{const a=improve(state.a,o);return {option:o,out:calculate(a,state.b),incoming:calculate(state.b,a)};});
  if([baseOut,baseIn,...results.flatMap(r=>[r.out,r.incoming])].some(r=>r.unsupported)) {
    $('comparison').innerHTML='<div class="card insight">No se puede comparar: alguna arma no tiene tabla en el modo de críticos elegido. Selecciona críticos avanzados o cambia el arma flexible.</div>';return;
  }
  const delta=(v,base)=>{const d=v-base;return `${d>0?'+':''}${num(d)}`;};
  $('comparison').innerHTML=`<div class="compare-grid">${[{option:'base',out:baseOut,incoming:baseIn},...results].map(r=>`<section class="card comparison-card ${r.option==='base'?'baseline':''}"><div class="eyebrow">${r.option==='base'?'PUNTO DE PARTIDA':'MEJORA INDEPENDIENTE'}</div><h3>${labels[r.option]||'Sin cambios'}</h3><div class="compare-main">${pct(r.out.chance)}<span>de causar alguna herida</span></div><div class="comparison-row"><span>Heridas causadas / fase</span><strong>${num(r.out.expected)}</strong></div><div class="comparison-row"><span>Heridas recibidas / fase</span><strong>${num(r.incoming.expected)}</strong></div><div class="comparison-row"><span>Prob. de recibir heridas</span><strong>${pct(r.incoming.chance)}</strong></div><div class="comparison-row"><span>Fuera de combate del rival</span><strong>${pct(r.out.outOfAction)}</strong></div><div class="comparison-row"><span>Quedar fuera de combate</span><strong>${pct(r.incoming.outOfAction)}</strong></div><div class="comparison-delta">${r.option==='base'?'Referencia para ambas opciones':`${delta(r.out.expected,baseOut.expected)} causadas · ${delta(r.incoming.expected,baseIn.expected)} recibidas`}</div></section>`).join('')}</div><div class="insight"><span>✦</span><div><h3>La ventaja depende de lo que necesites</h3><p>${results.map(r=>`<strong>${labels[r.option]}</strong>: ${Math.abs(r.out.expected-baseOut.expected)<1e-10?'no cambia el daño ofensivo':`cambia las heridas causadas en ${delta(r.out.expected,baseOut.expected)} por fase`}; ${Math.abs(r.incoming.expected-baseIn.expected)<1e-10?'no cambia el daño recibido':`cambia las recibidas en ${delta(r.incoming.expected,baseIn.expected)} por fase`}.`).join(' ')} Una mejora ya presente o que no cruza un umbral puede no aportar beneficio.</p></div></div>`;
}
function showTab(id) {
  document.querySelectorAll('.tab-panel').forEach(p=>p.hidden=p.id!==id);
  document.querySelectorAll('.tab').forEach(b=>{b.classList.toggle('active',b.dataset.tab===id);b.setAttribute('aria-current',b.dataset.tab===id?'page':'false');});
}
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.tab)));
function updateRuleSummary() {
  document.querySelectorAll('option[value="shield"]').forEach(option=>{
    option.textContent=rules.equipment==='campaign'?'Escudo · +1 armadura y parada':'Escudo · +1 armadura';
  });
  const summary=`${rules.parry==='campaign'?'Reglas opcionales de parada':'Parada clásica'} · ${criticalModes[rules.critical]} · ${rules.equipment==='campaign'?'equipo de campaña':'equipo básico'}`;
  $('active-rules').textContent=summary;
  $('critical-active-description').textContent=rules.critical==='none'?'Sin impactos críticos.':rules.critical==='basic'?'Tabla básica: dos heridas por crítico, con distintos efectos de armadura y lesiones.':`${criticalModes[rules.critical]}. Tabla según el arma que hiere. Se calculan heridas, armadura, modificadores de lesiones, ataque extra sin armas y fuera de combate automático. Desarmes, impedir respuestas, derribos, desplazamientos y daños a terceros no alteran el cálculo de estas fases independientes.`;
  $('rules-badge').textContent=rules.parry==='classic' && rules.critical==='basic' && rules.equipment==='standard'?'REGLAS CLÁSICAS ▾':'REGLAS PERSONALIZADAS ▾';
  $('parry-active-description').textContent=rules.parry==='campaign'?'Reglas opcionales de parada activas: 6+ con un objeto, 5+ con dos; +1 al dado si la HA del defensor es mayor. Un intento por turno de combate, sin repetición; puedes elegir cualquier impacto, incluidos los 6. No se permite si la Fuerza atacante es al menos el doble de la Fuerza defensora.':'Parada clásica activa: supera el mayor impacto exitoso; un 6 no se puede parar. Espada y rodela permiten repetir el intento fallido. No se permite si la Fuerza atacante es al menos el doble de la Fuerza defensora.';
}
$('rules-badge').addEventListener('click',()=>{ $('rule-settings').open=!$('rule-settings').open; if($('rule-settings').open) $('rule-settings').scrollIntoView({behavior:'smooth',block:'start'}); });
for(const field of ['parry','critical','equipment']) $('rule-'+field).addEventListener('change',e=>{
  rules[field]=e.target.value;updateRuleSummary();renderFighter('a');renderFighter('b');update();
});
$('go-compare').addEventListener('click',()=>{showTab('compare');document.querySelector('.tabs').scrollIntoView({behavior:'smooth'});});
$('rules-link').addEventListener('click',e=>{e.preventDefault();showTab('rules');document.querySelector('.tabs').scrollIntoView({behavior:'smooth'});});
document.addEventListener('change',e=>{
  const el=e.target;
  if(el.dataset.key) {
    if(el.type!=='checkbox' && el.tagName==='INPUT') el.value=Math.min(Number(el.max),Math.max(Number(el.min),Math.round(Number(el.value)||Number(el.min))));
    const p=state[el.dataset.key];
    p[el.dataset.field]=el.type==='checkbox'?el.checked:['primary','secondary'].includes(el.dataset.field)?el.value:Number(el.value);
    p.secondary=validSecondary(p.primary,p.secondary);
    renderFighter(el.dataset.key);update();
  }
});
$('option-one').addEventListener('change',renderComparison);
$('option-two').addEventListener('change',renderComparison);
$('reset').addEventListener('click',()=>{state=defaults();renderFighter('a');renderFighter('b');update();});
function swapFighters() {
  [state.a,state.b]=[state.b,state.a];
  renderFighter('a');renderFighter('b');update();
}
$('swap').addEventListener('click',swapFighters);
function probabilityCell(target, {critical=false, title=''}={}) {
  const probability=target>6?0:(7-Math.max(2,target))/6;
  const hue=probability*120;
  const label=target>6?'—':Math.max(2,target)+'+';
  return `<td class="probability-cell" style="--probability-hue:${hue}" title="${title}${target>6?'imposible':label} · ${pct(probability)}${critical?'; crítico con un 6 natural':''}"><span>${label}${critical?'<sup aria-label="Crítico con un 6">✦</sup>':''}</span></td>`;
}
function shootingTarget(hp,modifier=0) { return Math.max(2,7-hp-modifier); }
function renderReferenceTables() {
  $('critical-reference-tables').innerHTML=Object.values(criticalTables).map(table=>`<article class="critical-table"><h3>${table.name}</h3><p class="eyebrow">${table.advancedOnly?'Solo avanzados':'Opcionales y avanzados'}${table.referenceOnly||table.name==='Armas de proyectiles'?' · Solo referencia':''}</p><div class="table-scroll"><table class="text-table"><thead><tr><th scope="col">D6</th><th scope="col">Efecto</th></tr></thead><tbody>${table.rows.map(([die,name,text])=>`<tr><th scope="row">${die}</th><td><strong>${name}.</strong> ${text}</td></tr>`).join('')}</tbody></table></div></article>`).join('');
  document.querySelectorAll('.table-color-key').forEach(legend=>{
    legend.innerHTML=`<strong>Probabilidad</strong>${[2,3,4,5,6,7].map(target=>{
      const p=target>6?0:(7-target)/6;
      return `<span><i style="--probability-hue:${p*120}" aria-hidden="true"></i>${pct(p)}</span>`;
    }).join('')}`;
  });
  const values=Array.from({length:10},(_,i)=>i+1);
  for(const type of ['hit','wound']) {
    const isHit=type==='hit';
    const rowLabel=isHit?'HA atacante':'Fuerza';
    const colLabel=isHit?'HA defensor':'Resistencia';
    $(type+'-table').innerHTML=`<table class="matrix-table"><caption>${isHit?'Tabla para impactar':'Tabla para herir'}: ${rowLabel} frente a ${colLabel}</caption><thead><tr><th scope="col">${isHit?'HA / HA':'F / R'}</th>${values.map(n=>`<th scope="col" title="${colLabel} ${n}">${n}</th>`).join('')}</tr></thead><tbody>${values.map(row=>`<tr><th scope="row" title="${rowLabel} ${row}">${row}</th>${values.map(col=>{
      const target=isHit?hitTarget({ws:row},{ws:col}):woundTarget({s:row},{t:col});
      const critical=!isHit && target<6;
      return probabilityCell(target,{critical,title:`${rowLabel} ${row}, ${colLabel} ${col}: `});
    }).join('')}</tr>`).join('')}</tbody></table>`;
  }
  $('shooting-table').innerHTML=`<table class="matrix-table"><caption>Tirada básica para impactar con disparos según Habilidad de Proyectiles, sin modificadores</caption><thead><tr><th scope="col">HP</th>${values.map(hp=>`<th scope="col">${hp}</th>`).join('')}</tr></thead><tbody><tr><th scope="row">Impactar</th>${values.map(hp=>probabilityCell(shootingTarget(hp),{title:`HP ${hp}, sin modificadores: `})).join('')}</tr></tbody></table>`;
}
updateRuleSummary();
renderReferenceTables();
renderFighter('a');renderFighter('b');update();
