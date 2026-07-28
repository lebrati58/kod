const {creerCarrousel,pairesDe,repartirEnCoins,ajouterArrivants,prochainePaires}=require('./carrousel');
const cle=([a,b])=>a<b?`${a}-${b}`:`${b}-${a}`;
let ko=0;
const ok=(cond,msg)=>{console.log((cond?'✓':'✗')+' '+msg); if(!cond)ko++;};

// --- 1. pair : zéro répétition sur N-1 rotations ---
{
  const n=66, c=creerCarrousel([...Array(n)].map((_,i)=>i+1));
  const vues=new Set(); let doublons=0, total=0;
  for(let r=0;r<c.tours;r++){
    const {paires}=pairesDe(c,r);
    paires.forEach(p=>{total++; if(vues.has(cle(p)))doublons++; vues.add(cle(p));});
  }
  ok(doublons===0, `66 personnes · ${c.tours} rotations · ${total} paires · ${doublons} répétition`);
  ok(total===n/2*(n-1), `toutes les paires possibles sont couvertes (${total})`);
}

// --- 2. impair : personne ne se repose deux fois ---
{
  const n=67, c=creerCarrousel([...Array(n)].map((_,i)=>i+1));
  const repos=[];
  for(let r=0;r<c.tours;r++) repos.push(pairesDe(c,r).repos);
  ok(repos.every(x=>x!==null), 'impair : quelqu\'un se repose à chaque tour');
  ok(new Set(repos).size===repos.length, `impair : ${repos.length} tours, jamais deux fois la même personne au repos`);
}

// --- 3. chacun est apparié une fois par tour ---
{
  const c=creerCarrousel([...Array(20)].map((_,i)=>i+1));
  let bad=0;
  for(let r=0;r<c.tours;r++){
    const {paires}=pairesDe(c,r);
    const gens=paires.flat();
    if(new Set(gens).size!==gens.length) bad++;
    if(gens.length!==20) bad++;
  }
  ok(bad===0,'personne n\'apparaît deux fois dans le même tour');
}

// --- 4. répartition en coins ---
{
  const c=creerCarrousel([...Array(66)].map((_,i)=>i+1));
  const {paires}=pairesDe(c,0);
  const rep=repartirEnCoins(paires);
  const compte={};
  rep.forEach(x=>compte[x.coin]=(compte[x.coin]||0)+1);
  const v=Object.values(compte);
  ok(Math.max(...v)-Math.min(...v)<=1, `coins équilibrés : ${JSON.stringify(compte)}`);
}

// --- 5. arrivées tardives ---
{
  let c=creerCarrousel([...Array(66)].map((_,i)=>i+1));
  const vues=new Set();
  for(let r=0;r<6;r++) pairesDe(c,r).paires.forEach(p=>vues.add(cle(p)));
  const avant=vues.size;
  const res=ajouterArrivants(c,[...Array(20)].map((_,i)=>100+i),6);
  c=res.carrousel;
  ok(c.taille===86,`après arrivée : ${c.taille} places dans le carrousel`);
  let doublons=0, tours=0;
  let rot=0;
  for(let i=0;i<8;i++){
    const {paires,rotation}=prochainePaires(c,rot,vues);
    paires.forEach(p=>{ if(vues.has(cle(p)))doublons++; vues.add(cle(p)); });
    rot=rotation+1; tours++;
  }
  ok(doublons===0,`8 tours après les arrivées : ${doublons} répétition (${avant} paires déjà jouées évitées)`);
}

// --- 6. petits effectifs ---
{
  [4,5,8,9].forEach(n=>{
    const c=creerCarrousel([...Array(n)].map((_,i)=>i+1));
    const vues=new Set(); let d=0;
    for(let r=0;r<c.tours;r++) pairesDe(c,r).paires.forEach(p=>{if(vues.has(cle(p)))d++; vues.add(cle(p));});
    ok(d===0,`${n} personnes : ${c.tours} tours sans répétition`);
  });
}

console.log(ko===0?'\nTOUT PASSE':`\n${ko} ÉCHEC(S)`);
