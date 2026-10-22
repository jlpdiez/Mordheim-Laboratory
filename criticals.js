'use strict';
const criticalModes={basic:'Críticos básicos',none:'Sin críticos',optional:'Críticos opcionales',advanced:'Críticos opcionales avanzados'};
// Entries describe the ORIGINAL target only. Movement, other targets and later turns are not simulated.
const criticalTables={
  blade:{name:'Armas de filo',rows:[['1–2','Herida leve','Una herida sin armadura.'],['3–4','Herida grave','Dos heridas; salvación separada para cada una.'],['5–6','¡Rebanado!','Dos heridas sin armadura y +2 en lesiones.']]},
  blunt:{name:'Armas contundentes',rows:[['1–2','Martillado','Herida normal; impide combatir este turno si aún no lo ha hecho.'],['3–4','Cachiporrazo','Una herida; ignora armadura y casco.'],['5','Barrido','Desarma. Tirada para herir y salvación normales.'],['6','Aplastado','Si falla armadura, fuera de combate automático, aunque le queden heridas.']]},
  pole:{name:'Armas de asta',rows:[['1–2','Rasguño','Una herida con armadura normal y +1 en lesiones.'],['3–4','Ensartado','Herida normal y derribo.'],['5–6','Empalado','Una herida sin armadura y +2 en lesiones. Puede desplazar al objetivo y causar un impacto de F3 a otra miniatura si choca con ella. Estos efectos posicionales no se simulan.']]},
  unarmed:{name:'Combate sin armas',rows:[['1–2','Fuerte golpe','Herida normal y un ataque inmediato adicional: impactar, herir y salvar.'],['3–4','Golpe poderoso','Una herida con armadura normal y +1 en lesiones.'],['5–6','Golpe demoledor','Una herida sin armadura y +2 en lesiones.']]},
  missile:{name:'Armas de proyectiles',rows:[['1–2','Hueco','Una herida sin armadura.'],['3–4','Rebote','Herida normal; otro enemigo próximo también recibe un impacto.'],['5–6','Tiro maestro','Dos heridas sin armadura.']]},
  flexible:{name:'Armas flexibles',advancedOnly:true,rows:[['1–2','Atrapado','Herida normal y posible derribo por chequeo de Fuerza.'],['3–4','Latigazo','Dos heridas con armadura normal.'],['5','Desarmado','Desarma. Tirada para herir y salvación normales.'],['6','¡Ahogado!','Dos heridas sin armadura y +2 en lesiones.']]},
  falling:{name:'Caídas',advancedOnly:true,referenceOnly:true,rows:[['1–2','Aterrizaje con las piernas','−3 cm al Movimiento durante el resto de la batalla.'],['3–4','Aterrizaje de brazos','−2 HA durante el resto de la batalla.'],['5–6','Estrellado','Una herida adicional y +2 en lesiones.']]},
  explosion:{name:'Explosiones',advancedOnly:true,referenceOnly:true,rows:[['1–2','Volar por los aires','Desplazamiento de 3D6 cm y derribo.'],['3–4','Engullido por el fuego','El objetivo prende fuego.'],['5–6','Metralla','1D6 impactos adicionales de F2.']]},
  trample:{name:'Atropellos',advancedOnly:true,referenceOnly:true,rows:[['1–2','Lanzado a un lado','Desplazamiento de 1D6+1 cm y aturdimiento.'],['3–4','Arrastrado','Queda enganchado; chequeos de Iniciativa en turnos posteriores.'],['5–6','Triturado','Impacto adicional de F6 sin armadura y +2 en lesiones.']]}
};
function criticalFamilyAvailable(family,mode) {
  return mode==='basic'||mode==='none'||(!!criticalTables[family] && (!criticalTables[family].advancedOnly||mode==='advanced'));
}
function criticalOutcomes(group,mode) {
  const saved=group.saved;
  const outcomes=[];
  const add=(amount,p,bonus=0,forced=false)=>{if(p) outcomes.push({amount,p,bonus,forced});};
  const save=(p,amount=1,bonus=0,s=saved,forced=false)=>{
    add(0,p*s);add(amount,p*(1-s),bonus,forced);
  };
  const retest=p=>{
    // Barrido / Desarmado explicitly instruct a wound roll; the critical is already used.
    const success=Math.max(0,(7-group.wound)/6);
    add(0,p*(1-success));save(p*success);
  };
  if(mode==='basic') {
    save(1/3,2);add(2,1/3);add(2,1/3,2);
    return outcomes;
  }
  switch(group.family) {
    case 'blade':
      add(1,1/3);
      add(0,saved**2/3);add(1,2*saved*(1-saved)/3);add(2,(1-saved)**2/3);
      add(2,1/3,2);break;
    case 'blunt':
      save(1/3);add(1,1/3);retest(1/6);save(1/6,1,0,saved,true);break;
    case 'pole':
      save(1/3,1,1);save(1/3);add(1,1/3,2);break;
    case 'unarmed': {
      const normal=1-saved;
      const extra=(group.hitChance??(7-group.hit)/6)*Math.max(0,(7-group.wound)/6)*(1-saved);
      add(0,(1-normal)*(1-extra)/3);
      add(1,(normal*(1-extra)+(1-normal)*extra)/3);
      add(2,normal*extra/3);
      save(1/3,1,1);add(1,1/3,2);break;
    }
    case 'missile':
      add(1,1/3);save(1/3);add(2,1/3);break;
    case 'flexible':
      save(1/3);save(1/3,2);retest(1/6);add(2,1/6,2);break;
    default: throw new Error('No hay tabla de críticos para '+group.family);
  }
  return outcomes;
}
