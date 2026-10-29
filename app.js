(()=>{
const $=s=>document.querySelector(s);
let S={};try{S=JSON.parse(localStorage.getItem('wk1'))||{}}catch(e){}
S.log=S.log||{};S.warm=S.warm||{};
const save=()=>{try{localStorage.setItem('wk1',JSON.stringify(S))}catch(e){}};
const today=()=>new Date().toISOString().slice(0,10);
let view='train',tab='home',grp='all',openId=null;
const parse=s=>{const[n,tip,t,img]=s.split('|');return{name:n,tip,time:t==='t',img}};
const loadLabel=(cat,v)=>cat==='gym'?v+' кг':LV[cat][v];
const unit=e=>e.time?'сек':'повт';

function targets(e,cat,l){
  const inc=e.time?5:Math.max(1,Math.round(l.val*.1)),u=unit(e),r=[];
  r.push({t:`${l.val+inc} ${u} · ${loadLabel(cat,l.load)}`,v:l.val+inc,l:l.load});
  if(cat==='gym')r.push({t:`${l.val} ${u} · ${loadLabel(cat,l.load+2.5)}`,v:l.val,l:l.load+2.5});
  else if(l.load<3)r.push({t:`${l.val} ${u} · ${loadLabel(cat,l.load+1)}`,v:l.val,l:l.load+1});
  return r;
}

function card(e,id,cat,g,log){
  const l=log&&S.log[id];
  let h=`<details data-id="${id}"${openId===id?' open':''}><summary><span>${e.name}</span>${l?`<small>${l.val} ${unit(e)}</small>`:''}</summary><div class="body"><div class="tech">`;
  h+=e.img?`<img loading="lazy" src="${e.img}" alt="${e.name}">`:`<div class="ic">${IC[g]||'🤸'}</div>`;
  h+=`<div><p>${e.tip}</p><a target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${encodeURIComponent(e.name+' техника')}">▶ Смотреть технику</a></div></div>`;
  if(log){
    h+=`<div class="goal"><b>Следующая цель</b>`;
    if(l){h+=`<span>Прошлый раз: ${l.val} ${unit(e)} · ${loadLabel(cat,l.load)} (${l.date})</span>`+targets(e,cat,l).map(x=>`<button class="tg" data-v="${x.v}" data-l="${x.l}">${x.t}</button>`).join('')}
    else h+=`<span>Записей пока нет — сделай подход и сохрани результат.</span>`;
    h+=`</div><div class="form"><input class="v" type="number" inputmode="numeric" min="1" placeholder="${unit(e)}">`;
    h+=cat==='gym'?`<input class="l" type="number" inputmode="decimal" step="2.5" min="0" placeholder="кг">`:`<select class="l">${LV[cat].map((x,i)=>`<option value="${i}">${x}</option>`).join('')}</select>`;
    h+=`<button class="save">Сохранить</button></div>`;
  }
  return h+`</div></details>`;
}

function render(){
  const app=$('#app'),hd=$('header');
  document.querySelectorAll('.bottom button').forEach(b=>b.classList.toggle('on',b.dataset.view===view));
  hd.style.display=view==='train'?'':'none';
  if(view==='stretch'){
    app.innerHTML='<h2>Растяжка</h2>'+STRETCH.map((s,i)=>card(parse(s),'st'+i,'','back',false)).join('');return;
  }
  $('#tabs').innerHTML=Object.keys(CATS).map(k=>`<button data-tab="${k}"${k===tab?' class="on"':''}>${CATS[k]}</button>`).join('');
  const gs=Object.keys(DB[tab]);if(grp!=='all'&&!gs.includes(grp))grp='all';
  const done=S.warm[today()]||[];
  let h=`<details class="warm"><summary><span>Обязательная разминка</span><small>${done.length===WARM.length?'сделана':done.length+'/'+WARM.length}</small></summary><div class="body">`;
  h+=WARM.map((s,i)=>{const e=parse(s);return`<label class="chk"><input type="checkbox" class="wc" data-i="${i}"${done.includes(i)?' checked':''}><span>${e.name}</span><small>${e.tip}</small></label>`}).join('')+'</div></details>';
  h+=`<div class="chips"><button data-grp="all"${grp==='all'?' class="on"':''}>Все</button>${gs.map(g=>`<button data-grp="${g}"${g===grp?' class="on"':''}>${G[g]}</button>`).join('')}</div>`;
  gs.filter(g=>grp==='all'||g===grp).forEach(g=>{
    h+=`<h2>${G[g]}</h2>`+DB[tab][g].map((s,i)=>card(parse(s),`${tab}-${g}-${i}`,tab,g,true)).join('');
  });
  app.innerHTML=h;
}

document.addEventListener('click',ev=>{
  const t=ev.target,b=t.closest('button');if(!b)return;
  if(b.dataset.view){view=b.dataset.view;render();scrollTo(0,0)}
  else if(b.dataset.tab){tab=b.dataset.tab;grp='all';render()}
  else if(b.dataset.grp){grp=b.dataset.grp;render()}
  else if(b.classList.contains('tg')){const c=b.closest('.body');c.querySelector('.v').value=b.dataset.v;c.querySelector('.l').value=b.dataset.l}
  else if(b.classList.contains('save')){
    const d=b.closest('details'),v=+d.querySelector('.v').value;
    if(!v||v<1){d.querySelector('.v').focus();return}
    S.log[d.dataset.id]={val:v,load:+d.querySelector('.l').value||0,date:today()};
    openId=d.dataset.id;save();render();
  }
});
document.addEventListener('change',ev=>{
  if(!ev.target.classList.contains('wc'))return;
  const k=today(),i=+ev.target.dataset.i,a=S.warm[k]||[];
  S.warm={[k]:ev.target.checked?[...new Set([...a,i])]:a.filter(x=>x!==i)};
  save();
  const w=ev.target.closest('details');w.querySelector('summary small').textContent=S.warm[k].length===WARM.length?'сделана':S.warm[k].length+'/'+WARM.length;
});
render();
})();
