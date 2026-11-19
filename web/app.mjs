import {$,el,select,link,stats,bars,data,download,toCsv,number} from './ui.mjs';
import {labels,filter,totals} from './model.mjs';
const fmt=n=>n===null?'Unavailable':Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD',maximumFractionDigits:2}).format(n/100);
const uniq=vals=>[...new Set(vals)].sort();
let book,list=[],limit=25;
function showRows(){
 $('rows').replaceChildren(...list.slice(0,limit).map(r=>{
  const article=el('article',undefined,'record');
  article.append(el('span',r[0]+' · '+(labels[r[3]]||r[3]),'pill'),el('h3',r[9]),el('p',book.departments[r[2]]+' · '+r[10]));
  const info=el('details'),summary=el('summary','Inspect amounts and identifiers');
  const url=new URL('https://search.open.canada.ca/contracts/');url.searchParams.set('search_text',r[7]||r[8]);
  info.append(summary,el('p','Original value '+fmt(r[4])+' · Amendment '+fmt(r[5])+' · Contract value at disclosure '+fmt(r[6])),
    el('p','Procurement ID '+(r[8]||'unavailable')+' · Contract date '+(r[11]||'unavailable')),link('Find reference '+(r[7]||r[8])+' in federal disclosures ↗',url));article.append(info);return article;
 }));
 $('more').hidden=limit>=list.length;
}
function render(){
 list=filter(book.rows,{vendor:$('vendor').value,year:$('period').value,dept:$('dept').value,instrument:$('instrument').value,query:$('query').value});limit=25;
 const t=totals(list);
 stats([['Original values on '+number(t.awards)+' contract rows',fmt(t.original)],['Signed changes on '+number(t.amendments)+' amendment rows',fmt(t.change)],['Matching disclosure rows',number(list.length)]]);
 const byVendor=new Map();for(const r of list)byVendor.set(r[1],(byVendor.get(r[1])||0)+1);
 bars('bars',[...byVendor].sort((a,b)=>b[1]-a[1]),n=>number(n)+' rows');
 $('count').textContent=number(list.length)+' disclosure rows. '+(t.missing?number(t.missing)+' missing amounts are excluded from their respective sums.':'Newest reporting quarters appear first.');
 showRows();
}
async function start(){
 book=await data('./data/contracts.json');
 $('edition').textContent=number(book.count)+' disclosures · '+book.firstPeriod+' through '+book.latestPeriod+' · Retrieved '+book.retrieved;
 select('vendor',[['','All suppliers'],...uniq(book.rows.map(r=>r[1])).map(v=>[v,v])]);
 select('period',[['','All fiscal years'],...uniq(book.rows.map(r=>r[0].slice(0,9))).reverse().map(v=>[v,v])]);
 select('dept',[['','All departments'],...Object.entries(book.departments).sort((a,b)=>a[1].localeCompare(b[1]))]);
 select('instrument',[['','All instruments'],...Object.entries(labels)]);
 const params=new URLSearchParams(location.search); for(const id of ['vendor','period','dept','instrument'])if([...$(id).options].some(o=>o.value===params.get(id)))$(id).value=params.get(id);
 for(const id of ['vendor','period','dept','instrument','query'])$(id).addEventListener('input',render);
 $('more').onclick=()=>{limit+=50;showRows();};
 $('export').onclick=()=>download('federal-contract-disclosures.csv',toCsv([book.fields,...list]));render();
}
start().catch(()=>{$('edition').textContent='The disclosure edition could not be loaded. Reload the page or open the federal source below.';});
