export const labels={A:'Amendment',C:'Contract',SOSA:'Standing offer or supply arrangement'};
export function filter(rows,{vendor='',year='',dept='',instrument='',query=''}) {
 const needle=query.trim().toLowerCase();
 return rows.filter(r=>(!vendor||r[1]===vendor)&&(!year||r[0].startsWith(year))&&(!dept||r[2]===dept)&&(!instrument||r[3]===instrument)&&(!needle||[r[1],r[7],r[8],r[9],r[10]].some(s=>s?.toLowerCase().includes(needle))));
}
export function totals(rows){
 let original=0,change=0,awards=0,amendments=0,missing=0;
 for(const r of rows){
   if(r[3]==='C'){awards++;if(r[4]===null)missing++;else original+=r[4];}
   if(r[3]==='A'){amendments++;if(r[5]===null)missing++;else change+=r[5];}
 }
 return {original,change,awards,amendments,missing};
}
