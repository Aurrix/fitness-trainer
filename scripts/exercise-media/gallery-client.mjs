let data,limit=24,enabled=!matchMedia('(prefers-reduced-motion: reduce)').matches,speed=1
const grid=document.querySelector('#grid'),count=document.querySelector('#count'),search=document.querySelector('#search'),load=document.querySelector('#load'),visible=new Set(),manual=new WeakSet(),automatic=new WeakSet()
const stop=v=>{if(!v.paused){automatic.add(v);v.pause()}}
const observer=new IntersectionObserver(entries=>{for(const e of entries){const v=e.target;if(e.isIntersecting&&e.intersectionRatio>=.5){visible.add(v);if(enabled&&!document.hidden&&!manual.has(v))v.play().catch(()=>{})}else{visible.delete(v);stop(v)}}},{threshold:[0,.5,1]})
const label=m=>m.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/-/g,' ')
function matches(){const terms=search.value.toLowerCase().split(/\s+/).filter(Boolean);return data.entries.filter(e=>terms.every(t=>e.search.includes(t)))}
function card(e){
 const article=document.createElement('article'),heading=document.createElement('h2'),v=document.createElement('video');heading.textContent=e.order+'. '+e.name
 v.controls=true;v.muted=true;v.loop=true;v.playsInline=true;v.preload='none';v.poster=e.poster;v.src=e.video;v.playbackRate=speed;v.setAttribute('aria-label',e.name+' draft demonstration')
 v.addEventListener('pause',()=>{if(automatic.has(v)){automatic.delete(v);return}if(enabled&&visible.has(v)&&!document.hidden)manual.add(v)});v.addEventListener('play',()=>manual.delete(v))
 const failed=document.createElement('p');failed.hidden=true;failed.textContent='This draft could not load. Its muscle labels remain available.';v.addEventListener('error',()=>{failed.hidden=false})
 const status=document.createElement('p');status.textContent=e.reviewStatus==='revision-required'?'Needs revision — motion defects found':'Draft — movement and muscle placement unapproved';status.style.color=e.reviewStatus==='revision-required'?'#a22d18':'#695e50'
 article.append(heading,status,v,failed)
 if(e.demonstratedVariant){const variant=document.createElement('p');variant.textContent='This preview demonstrates: '+e.demonstratedVariant+'. Muscle labels below describe the combined catalog entry.';article.append(variant)}
 for(const [name,groups,cls] of [['Primary',e.primary,'primary'],['Secondary',e.secondary,'secondary']]){const p=document.createElement('p');p.className=cls;p.textContent=name+': '+([...new Set(groups.map(m=>label(m.muscleGroup)))].join(', ')||'None listed');article.append(p)}
 const details=document.createElement('details'),summary=document.createElement('summary'),review=document.createElement('a');summary.textContent='Source poses and review';review.href=e.review;review.textContent='Review notes';details.append(summary,review);details.addEventListener('toggle',()=>{if(details.open&&!details.querySelector('img')){const img=document.createElement('img');img.src=e.sourceSheet??e.id+'/video-v1/source-sheet.png';img.alt=e.name+' sixteen source poses';details.append(img)}})
 article.append(details);grid.append(article);observer.observe(v)
}
function render(reset=true){
 const results=matches()
 if(reset){observer.disconnect();grid.querySelectorAll('video').forEach(stop);visible.clear();grid.replaceChildren();limit=24}
 const present=grid.querySelectorAll('article').length
 results.slice(present,limit).forEach(card)
 count.textContent=`${Math.min(limit,results.length)} of ${results.length} matching clips · ${data.completed}/${data.requested} new MP4s exported · ${data.missingReferences.length} awaiting references`
 load.hidden=limit>=results.length
 if(!results.length){const p=document.createElement('p');p.textContent='No matching generated exercises.';grid.append(p)}
}
async function refresh(){const response=await fetch('./video-summary.json',{cache:'no-store'});if(!response.ok)throw Error('Could not load media inventory');data=await response.json();data.entries.forEach(e=>e.search=(e.name+' '+e.id+' '+e.primary.map(m=>label(m.muscleGroup)).join(' ')+' '+e.secondary.map(m=>label(m.muscleGroup)).join(' ')).toLowerCase());render()}
search.oninput=()=>render();load.onclick=()=>{limit+=24;render(false)}
new IntersectionObserver(([e])=>{if(e.isIntersecting&&!load.hidden){limit+=24;render(false)}},{rootMargin:'300px'}).observe(load)
document.querySelector('#pause').onclick=()=>{enabled=false;grid.querySelectorAll('video').forEach(stop)}
document.querySelector('#resume').onclick=()=>{enabled=true;visible.forEach(v=>{manual.delete(v);v.play().catch(()=>{})})}
document.querySelector('#speed').onchange=e=>{speed=Number(e.target.value);grid.querySelectorAll('video').forEach(v=>v.playbackRate=speed)}
document.querySelector('#refresh').onclick=()=>refresh().catch(e=>count.textContent=e.message)
document.addEventListener('visibilitychange',()=>{if(document.hidden)grid.querySelectorAll('video').forEach(stop);else if(enabled)visible.forEach(v=>{if(!manual.has(v))v.play().catch(()=>{})})})
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{if(e.matches){enabled=false;grid.querySelectorAll('video').forEach(stop)}})
refresh().catch(e=>count.textContent=e.message)
