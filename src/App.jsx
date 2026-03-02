import { useState } from "react";

const T = {
  bg:'#0A0C0F', surface:'#111318', card:'#161A21', border:'#1E2430',
  borderHi:'#2A3347', gold:'#F0A500', goldDim:'#C07800',
  goldGlow:'rgba(240,165,0,0.15)', green:'#22C97A', red:'#F04F4F',
  blue:'#4F9EF0', purple:'#9B7EF0', text:'#E8ECF4', muted:'#6B7A99', faint:'#1E2430',
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html,body{background:#0A0C0F;color:#E8ECF4;font-family:'Plus Jakarta Sans',sans-serif;-webkit-font-smoothing:antialiased;}
  input,select,textarea{font-family:inherit;}
  ::-webkit-scrollbar{width:4px;height:4px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:#2A3347;border-radius:99px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
  @keyframes pop{0%{transform:scale(.85);opacity:0;}70%{transform:scale(1.04);}100%{transform:scale(1);opacity:1;}}
  .fade-up{animation:fadeUp .35s cubic-bezier(.22,.68,0,1.2) both;}
  .fade-up-2{animation:fadeUp .35s .07s cubic-bezier(.22,.68,0,1.2) both;}
  .fade-up-3{animation:fadeUp .35s .14s cubic-bezier(.22,.68,0,1.2) both;}
  .pop{animation:pop .3s cubic-bezier(.22,.68,0,1.2) both;}
`;

const INIT_APPTS = [
  {id:1,code:'1-1ch',type:'1 chambre',etage:1,description:'Appartement 1 chambre meublé'},
  {id:2,code:'2_1ch',type:'1 chambre',etage:1,description:'Appartement 1 chambre meublé'},
  {id:3,code:'3_1ch',type:'1 chambre',etage:1,description:'Appartement 1 chambre meublé'},
  {id:4,code:'4_1ch',type:'1 chambre',etage:1,description:'Appartement 1 chambre meublé'},
  {id:5,code:'5_1ch',type:'1 chambre',etage:1,description:'Appartement 1 chambre meublé'},
  {id:6,code:'11_3ch',type:'3 chambres',etage:2,description:'Appartement 3 chambres meublé'},
  {id:7,code:'12_1ch',type:'1 chambre',etage:2,description:'Appartement 1 chambre meublé'},
  {id:8,code:'14_2ch',type:'2 chambres',etage:2,description:'Appartement 2 chambres meublé'},
  {id:9,code:'21_3ch',type:'3 chambres',etage:3,description:'Appartement 3 chambres meublé'},
  {id:10,code:'22_1ch',type:'1 chambre',etage:3,description:'Appartement 1 chambre meublé'},
];
const INIT_CLIENTS = [
  {id:1,code:'CLT-0001',nom:'WALLA',prenom:'Abdullahi',genre:'Masculin',nationalite:'Somalien',appartement:'2_1ch',modalite:'Mois',dateEntree:'2025-05-05',dateSortie:'2025-06-18',montantJour:null,montantMois:450000,statut:'Sortie'},
  {id:2,code:'CLT-0002',nom:'ADEBOLA',prenom:'OLAYINKA',genre:'Féminin',nationalite:'Nigérian',appartement:'3_1ch',modalite:'Mois',dateEntree:'2025-05-10',dateSortie:'2025-12-27',montantJour:null,montantMois:400000,statut:'Séjour en cours'},
  {id:3,code:'CLT-0003',nom:'MARTIN',prenom:'Chabi Joseph',genre:'Masculin',nationalite:'Béninois',appartement:'11_3ch',modalite:'Mois',dateEntree:'2025-05-10',dateSortie:'2025-06-10',montantJour:null,montantMois:600000,statut:'Sortie'},
];
const INIT_PAIEMENTS = [
  {id:1,code:'PAY-00001',date:'2025-05-10',clientCode:'CLT-0001',clientNom:'WALLA',clientPrenom:'Abdullahi',objet:'Loyer Mai',montant:450000},
  {id:2,code:'PAY-00002',date:'2025-05-10',clientCode:'CLT-0002',clientNom:'ADEBOLA',clientPrenom:'OLAYINKA',objet:'Loyer Mai',montant:400000},
  {id:3,code:'PAY-00003',date:'2025-05-10',clientCode:'CLT-0003',clientNom:'MARTIN',clientPrenom:'Chabi Joseph',objet:'Loyer Mai',montant:600000},
];
const INIT_DEPENSES = [
  {id:1,date:'2025-05-10',libelle:'Achat savons et papiers toilettes',type:'Equipements-Fournitures',montant:5000},
  {id:2,date:'2025-05-12',libelle:'ACHAT 2 PAX, BLANCHISSEUR',type:'Equipements-Fournitures',montant:2000},
  {id:3,date:'2025-05-12',libelle:'Achat Gazoil + Déplacement',type:'Carburant',montant:135000},
];

const EXPENSE_TYPES=['Carburant','Paiement travailleurs','Maintenance','Electricite-Eau','Internet','Chaines TV','Equipements-Fournitures','Autres'];
const GENRES=['Masculin','Féminin'];
const MOIS_COURT=['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'];
const MOIS=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const APPT_TYPES=['1 chambre','2 chambres','3 chambres','Studio'];

const money=n=>n==null?'—':new Intl.NumberFormat('fr-FR').format(n)+' F';
const today=()=>new Date().toISOString().slice(0,10);
const genClient=arr=>`CLT-${String(arr.length+1).padStart(4,'0')}`;
const genPay=arr=>`PAY-${String(arr.length+1).padStart(5,'0')}`;

// Returns {total, months, days, breakdown} for full transparency
function calcDuDetail(c){
  if(!c.dateEntree||!c.dateSortie) return {total:0,months:0,days:0,breakdown:[]};
  const d1=new Date(c.dateEntree), d2=new Date(c.dateSortie);
  if(c.modalite==='Jour'){
    const days=Math.round((d2-d1)/86400000);
    const rate=c.montantJour||0;
    return {total:rate*days, days, months:0, rate, breakdown:[{label:`${days} jours × ${money(rate)}/jour`,value:rate*days}]};
  }
  // Month mode
  const months=(d2.getFullYear()-d1.getFullYear())*12+(d2.getMonth()-d1.getMonth());
  const rate=c.montantMois||0;
  // Build month-by-month breakdown
  const breakdown=[];
  for(let i=0;i<months;i++){
    const mn=new Date(d1.getFullYear(),d1.getMonth()+i,1);
    breakdown.push({label:`${MOIS_COURT[mn.getMonth()]} ${mn.getFullYear()}`,value:rate});
  }
  return {total:rate*(months||1), months:months||1, days:0, rate, breakdown};
}
function calcDu(c){return calcDuDetail(c).total;}

/* ─── BASE COMPONENTS ────────────────────────────────────────────────────── */
function GlassCard({children,style={},className='',onClick}){
  return <div className={className} onClick={onClick} style={{background:'linear-gradient(135deg,#161A21 0%,rgba(22,26,33,0.95) 100%)',border:'1px solid #1E2430',borderRadius:20,backdropFilter:'blur(12px)',overflow:'hidden',cursor:onClick?'pointer':'default',...style}}>{children}</div>;
}
function Chip({label,color='gold'}){
  const map={gold:{bg:'rgba(240,165,0,.12)',fg:'#F0A500',bd:'rgba(240,165,0,.25)'},green:{bg:'rgba(34,201,122,.12)',fg:'#22C97A',bd:'rgba(34,201,122,.25)'},red:{bg:'rgba(240,79,79,.12)',fg:'#F04F4F',bd:'rgba(240,79,79,.25)'},blue:{bg:'rgba(79,158,240,.12)',fg:'#4F9EF0',bd:'rgba(79,158,240,.25)'},purple:{bg:'rgba(155,126,240,.12)',fg:'#9B7EF0',bd:'rgba(155,126,240,.25)'},muted:{bg:'#1E2430',fg:'#6B7A99',bd:'#2A3347'}};
  const s=map[color]||map.muted;
  return <span style={{display:'inline-flex',alignItems:'center',gap:4,background:s.bg,color:s.fg,border:`1px solid ${s.bd}`,borderRadius:99,padding:'3px 10px',fontSize:11,fontWeight:700,letterSpacing:.4,whiteSpace:'nowrap'}}>{label}</span>;
}
function Input({label,type,...props}){
  const [focus,setFocus]=useState(false);
  const base={width:'100%',background:'#111318',border:`1.5px solid ${focus?'#F0A500':'#1E2430'}`,color:'#E8ECF4',borderRadius:12,padding:'12px 14px',fontSize:13,outline:'none',transition:'border .15s'};
  const el=type==='select'?<select {...props} style={{...base,appearance:'none',cursor:'pointer'}} onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}>{props.children}</select>
    :type==='textarea'?<textarea {...props} style={{...base,resize:'vertical',minHeight:80}} onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}/>
    :<input type={type||'text'} {...props} style={base} onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}/>;
  return label?<div><div style={{fontSize:11,color:'#6B7A99',marginBottom:6,fontWeight:600,letterSpacing:.8,textTransform:'uppercase'}}>{label}</div>{el}</div>:el;
}
function Btn({children,onClick,variant='gold',full=false,sm=false,disabled=false}){
  const [h,setH]=useState(false);
  const V={gold:{bg:h?'#C07800':'#F0A500',color:'#000',shadow:'0 4px 24px rgba(240,165,0,.3)'},ghost:{bg:h?'#1E2430':'transparent',color:'#6B7A99',shadow:'none',border:'1px solid #1E2430'},danger:{bg:h?'#B33A3A':'#F04F4F',color:'#fff',shadow:'0 4px 16px rgba(240,79,79,.3)'},green:{bg:h?'#1A9E61':'#22C97A',color:'#fff',shadow:'0 4px 16px rgba(34,201,122,.3)'},blue:{bg:h?'#3A7EC0':'#4F9EF0',color:'#fff',shadow:'0 4px 16px rgba(79,158,240,.3)'}};
  const v=V[variant]||V.gold;
  return <button onClick={onClick} disabled={disabled} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,background:v.bg,color:v.color,border:v.border||'none',borderRadius:12,padding:sm?'8px 14px':'13px 22px',fontSize:sm?12:14,fontWeight:700,fontFamily:'inherit',cursor:disabled?'not-allowed':'pointer',width:full?'100%':'auto',boxShadow:v.shadow,transition:'all .15s',opacity:disabled?.5:1,letterSpacing:.2,whiteSpace:'nowrap'}}>{children}</button>;
}
function PageTitle({icon,title,sub}){
  return <div className="fade-up" style={{marginBottom:24}}><div style={{display:'flex',alignItems:'center',gap:12}}><div style={{width:40,height:40,borderRadius:12,background:'rgba(240,165,0,0.15)',border:'1px solid rgba(240,165,0,.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{icon}</div><div><h1 style={{fontSize:22,fontWeight:800,color:'#E8ECF4',fontFamily:"'Playfair Display',serif",letterSpacing:-.5}}>{title}</h1>{sub&&<p style={{fontSize:12,color:'#6B7A99',marginTop:1}}>{sub}</p>}</div></div></div>;
}
function StatCard({icon,label,value,sub,accent,delay=0}){
  return <GlassCard className="fade-up" style={{padding:'18px 20px',animationDelay:`${delay}ms`,position:'relative',overflow:'hidden'}}><div style={{position:'absolute',top:-20,right:-20,width:80,height:80,borderRadius:'50%',background:accent,opacity:.06}}/><div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}><div><div style={{fontSize:11,color:'#6B7A99',fontWeight:600,letterSpacing:1,textTransform:'uppercase',marginBottom:8}}>{label}</div><div style={{fontSize:22,fontWeight:800,color:accent,letterSpacing:-1,lineHeight:1}}>{value}</div>{sub&&<div style={{fontSize:11,color:'#6B7A99',marginTop:4}}>{sub}</div>}</div><div style={{width:38,height:38,borderRadius:10,background:'rgba(0,0,0,.2)',border:'1px solid #1E2430',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17}}>{icon}</div></div></GlassCard>;
}
function ConfirmModal({msg,onConfirm,onCancel}){
  return <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',zIndex:999,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}><div className="pop" style={{background:'#161A21',border:'1px solid #1E2430',borderRadius:20,padding:28,maxWidth:340,width:'100%'}}><div style={{fontSize:32,textAlign:'center',marginBottom:12}}>⚠️</div><div style={{fontSize:15,fontWeight:700,color:'#E8ECF4',textAlign:'center',marginBottom:8}}>Confirmer la suppression</div><div style={{fontSize:13,color:'#6B7A99',textAlign:'center',marginBottom:24}}>{msg}</div><div style={{display:'flex',gap:10}}><Btn onClick={onCancel} variant="ghost" full>Annuler</Btn><Btn onClick={onConfirm} variant="danger" full>Supprimer</Btn></div></div></div>;
}
function EditClientModal({client,appts,onSave,onClose}){
  const [form,setForm]=useState({...client});
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  return <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.8)',zIndex:999,display:'flex',alignItems:'flex-end',justifyContent:'center'}}><div className="fade-up" style={{background:'#161A21',border:'1px solid #1E2430',borderRadius:'20px 20px 0 0',padding:24,width:'100%',maxWidth:480,maxHeight:'90vh',overflowY:'auto'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><div style={{fontWeight:800,fontSize:17,fontFamily:"'Playfair Display',serif",color:'#E8ECF4'}}>Modifier le client</div><button onClick={onClose} style={{background:'none',border:'none',color:'#6B7A99',fontSize:22,cursor:'pointer'}}>✕</button></div><div style={{display:'flex',flexDirection:'column',gap:14}}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}><Input label="Nom" value={form.nom} onChange={e=>f('nom',e.target.value)}/><Input label="Prénom" value={form.prenom} onChange={e=>f('prenom',e.target.value)}/></div><Input label="Nationalité" value={form.nationalite} onChange={e=>f('nationalite',e.target.value)}/><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}><Input label="Genre" type="select" value={form.genre} onChange={e=>f('genre',e.target.value)}>{GENRES.map(g=><option key={g}>{g}</option>)}</Input><Input label="Appartement" type="select" value={form.appartement} onChange={e=>f('appartement',e.target.value)}>{appts.map(a=><option key={a.id}>{a.code}</option>)}</Input></div><Input label="Modalité" type="select" value={form.modalite} onChange={e=>f('modalite',e.target.value)}>{['Jour','Mois'].map(m=><option key={m}>{m}</option>)}</Input><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}><Input label="Date entrée" type="date" value={form.dateEntree} onChange={e=>f('dateEntree',e.target.value)}/><Input label="Date sortie" type="date" value={form.dateSortie} onChange={e=>f('dateSortie',e.target.value)}/></div>{form.modalite==='Jour'?<Input label="Montant/Jour (FCFA)" type="number" value={form.montantJour||''} onChange={e=>f('montantJour',parseFloat(e.target.value)||null)}/>:<Input label="Montant/Mois (FCFA)" type="number" value={form.montantMois||''} onChange={e=>f('montantMois',parseFloat(e.target.value)||null)}/>}<Input label="Statut" type="select" value={form.statut} onChange={e=>f('statut',e.target.value)}>{['Séjour en cours','Sortie'].map(s=><option key={s}>{s}</option>)}</Input><div style={{display:'flex',gap:10,marginTop:4}}><Btn onClick={onClose} variant="ghost" full>Annuler</Btn><Btn onClick={()=>onSave(form)} full>Enregistrer</Btn></div></div></div></div>;
}

/* ─── AMOUNT DETAIL MODAL ────────────────────────────────────────────────── */
function AmountDetailModal({client,paiements,onClose}){
  const detail=calcDuDetail(client);
  const paid=paiements.filter(p=>p.clientCode===client.code).reduce((s,p)=>s+p.montant,0);
  const ecart=detail.total-paid;
  const clientPays=paiements.filter(p=>p.clientCode===client.code).sort((a,b)=>a.date.localeCompare(b.date));
  return <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.85)',zIndex:999,display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
    <div className="fade-up" style={{background:'#161A21',border:'1px solid #1E2430',borderRadius:'20px 20px 0 0',padding:24,width:'100%',maxWidth:480,maxHeight:'88vh',overflowY:'auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div>
          <div style={{fontWeight:800,fontSize:17,fontFamily:"'Playfair Display',serif",color:'#E8ECF4'}}>{client.nom} {client.prenom}</div>
          <div style={{fontSize:12,color:'#6B7A99',marginTop:2}}>{client.code} · {client.appartement}</div>
        </div>
        <button onClick={onClose} style={{background:'none',border:'none',color:'#6B7A99',fontSize:22,cursor:'pointer'}}>✕</button>
      </div>

      {/* How amount is calculated */}
      <div style={{background:'rgba(240,165,0,.06)',border:'1px solid rgba(240,165,0,.2)',borderRadius:14,padding:'16px',marginBottom:16}}>
        <div style={{fontSize:11,color:'#C07800',fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:10}}>📐 CALCUL DU MONTANT DÛ</div>
        <div style={{fontSize:13,color:'#E8ECF4',marginBottom:8}}>
          {client.modalite==='Mois'
            ? <>Modalité : <strong>Mensuelle</strong> · Tarif : <strong style={{color:'#F0A500'}}>{money(client.montantMois)}/mois</strong><br/><span style={{color:'#6B7A99',fontSize:12}}>Entrée: {client.dateEntree} → Sortie prévue: {client.dateSortie}</span><br/><span style={{color:'#6B7A99',fontSize:12}}>Durée : <strong style={{color:'#E8ECF4'}}>{detail.months} mois</strong></span></>
            : <>Modalité : <strong>Journalière</strong> · Tarif : <strong style={{color:'#F0A500'}}>{money(client.montantJour)}/jour</strong><br/><span style={{color:'#6B7A99',fontSize:12}}>Durée : <strong style={{color:'#E8ECF4'}}>{detail.days} jours</strong></span></>
          }
        </div>
        {/* Month by month breakdown */}
        {detail.breakdown.length>0&&<div style={{borderTop:'1px solid rgba(240,165,0,.15)',paddingTop:10,marginTop:10}}>
          <div style={{fontSize:10,color:'#C07800',fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:8}}>Détail par {client.modalite==='Mois'?'mois':'jour'}</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
            {detail.breakdown.map((b,i)=><div key={i} style={{background:'rgba(0,0,0,.3)',borderRadius:8,padding:'6px 8px',textAlign:'center'}}><div style={{fontSize:10,color:'#6B7A99'}}>{b.label}</div><div style={{fontSize:12,fontWeight:700,color:'#F0A500',marginTop:2}}>{money(b.value)}</div></div>)}
          </div>
        </div>}
        <div style={{marginTop:12,display:'flex',justifyContent:'space-between',alignItems:'center',borderTop:'1px solid rgba(240,165,0,.15)',paddingTop:10}}>
          <span style={{fontSize:12,color:'#6B7A99',fontWeight:600}}>TOTAL DÛ</span>
          <span style={{fontSize:18,fontWeight:800,color:'#F0A500'}}>{money(detail.total)}</span>
        </div>
      </div>

      {/* Payments received */}
      <div style={{background:'rgba(34,201,122,.06)',border:'1px solid rgba(34,201,122,.2)',borderRadius:14,padding:'16px',marginBottom:16}}>
        <div style={{fontSize:11,color:'#1A9E61',fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:10}}>💰 PAIEMENTS REÇUS</div>
        {clientPays.length===0?<div style={{fontSize:13,color:'#6B7A99',textAlign:'center',padding:'8px 0'}}>Aucun paiement enregistré</div>
          :clientPays.map(p=><div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid rgba(34,201,122,.1)'}}><div><div style={{fontSize:13,color:'#E8ECF4',fontWeight:600}}>{p.objet||'Paiement'}</div><div style={{fontSize:11,color:'#6B7A99'}}>{p.date} · <span style={{fontFamily:'monospace',color:'#22C97A'}}>{p.code}</span></div></div><div style={{fontWeight:700,color:'#22C97A',fontSize:14}}>{money(p.montant)}</div></div>)}
        <div style={{marginTop:10,display:'flex',justifyContent:'space-between',alignItems:'center',borderTop:'1px solid rgba(34,201,122,.15)',paddingTop:10}}>
          <span style={{fontSize:12,color:'#6B7A99',fontWeight:600}}>TOTAL PAYÉ</span>
          <span style={{fontSize:18,fontWeight:800,color:'#22C97A'}}>{money(paid)}</span>
        </div>
      </div>

      {/* Balance */}
      <div style={{background:ecart===0?'rgba(34,201,122,.08)':ecart>0?'rgba(240,79,79,.08)':'rgba(79,158,240,.08)',border:`1px solid ${ecart===0?'rgba(34,201,122,.3)':ecart>0?'rgba(240,79,79,.3)':'rgba(79,158,240,.3)'}`,borderRadius:14,padding:'16px',marginBottom:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontSize:11,color:'#6B7A99',fontWeight:700,letterSpacing:1,textTransform:'uppercase'}}>ÉCART (DÛ − PAYÉ)</div>
            <div style={{fontSize:22,fontWeight:800,color:ecart===0?'#22C97A':ecart>0?'#F04F4F':'#4F9EF0',marginTop:4}}>{money(ecart)}</div>
          </div>
          <div style={{fontSize:32}}>{ecart===0?'✅':ecart>0?'⚠️':'💰'}</div>
        </div>
        {ecart>0&&<div style={{fontSize:12,color:'#F04F4F',marginTop:8}}>Ce client a encore <strong>{money(ecart)}</strong> à payer.</div>}
        {ecart<0&&<div style={{fontSize:12,color:'#4F9EF0',marginTop:8}}>Ce client a payé <strong>{money(Math.abs(ecart))}</strong> de plus que prévu.</div>}
        {ecart===0&&<div style={{fontSize:12,color:'#22C97A',marginTop:8}}>Compte soldé. Aucun montant restant.</div>}
      </div>

      <Btn onClick={onClose} variant="ghost" full>Fermer</Btn>
    </div>
  </div>;
}

function Toast({toast}){
  if(!toast)return null;
  return <div className="pop" style={{position:'fixed',bottom:88,left:'50%',transform:'translateX(-50%)',background:toast.type==='error'?'#2A0F0F':'#0A1F14',color:toast.type==='error'?'#F04F4F':'#22C97A',border:`1px solid ${toast.type==='error'?'rgba(240,79,79,.4)':'rgba(34,201,122,.4)'}`,padding:'12px 20px',borderRadius:14,fontSize:13,fontWeight:700,zIndex:9999,whiteSpace:'nowrap',boxShadow:'0 8px 40px #0008',display:'flex',alignItems:'center',gap:8}}>{toast.type==='error'?'⚠️':'✅'} {toast.msg}</div>;
}

const NAV=[{id:'dashboard',icon:'🏠',label:'Accueil'},{id:'clients',icon:'👤',label:'Clients'},{id:'paiements',icon:'💳',label:'Paiements'},{id:'sorties',icon:'🚪',label:'Sorties'},{id:'depenses',icon:'💸',label:'Dépenses'},{id:'synthese',icon:'📊',label:'Synthèse'},{id:'bilan',icon:'📅',label:'Bilan'},{id:'chambres',icon:'🏢',label:'Chambres'}];

function BottomNav({page,setPage}){
  return <nav style={{position:'fixed',bottom:0,left:0,right:0,background:'rgba(17,19,24,0.97)',backdropFilter:'blur(20px)',borderTop:'1px solid #1E2430',display:'flex',padding:'8px 0 12px',zIndex:100}}>{NAV.map(n=>{const active=page===n.id;return <button key={n.id} onClick={()=>setPage(n.id)} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3,background:'none',border:'none',cursor:'pointer',padding:'6px 0',transition:'all .15s',minWidth:0,position:'relative'}}><div style={{fontSize:18,lineHeight:1,filter:active?'none':'grayscale(60%) opacity(0.5)',transform:active?'scale(1.15)':'scale(1)',transition:'all .2s'}}>{n.icon}</div><span style={{fontSize:9,fontWeight:active?700:500,color:active?'#F0A500':'#6B7A99',letterSpacing:.3,fontFamily:'inherit',transition:'color .15s',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:44}}>{n.label}</span>{active&&<div style={{width:4,height:4,borderRadius:2,background:'#F0A500',position:'absolute',bottom:2}}/>}</button>})}</nav>;
}

/* ─── DASHBOARD ──────────────────────────────────────────────────────────── */
function Dashboard({clients,paiements,depenses,appts,setPage}){
  const actifs=clients.filter(c=>c.statut==='Séjour en cours');
  const occupees=new Set(actifs.map(c=>c.appartement));
  const totalPaye=paiements.reduce((s,p)=>s+p.montant,0);
  const totalDep=depenses.reduce((s,d)=>s+d.montant,0);
  const recentPay=[...paiements].slice(-3).reverse();
  return <div>
    <div className="fade-up" style={{margin:'0 0 24px',padding:'24px 20px 20px',background:'linear-gradient(135deg,#1A1400 0%,#161A21 100%)',border:'1px solid rgba(240,165,0,.2)',borderRadius:24,position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:-40,right:-40,width:180,height:180,borderRadius:'50%',background:'#F0A500',opacity:.04}}/>
      <div style={{fontSize:11,color:'#C07800',fontWeight:700,letterSpacing:2,textTransform:'uppercase',marginBottom:6}}>BENIDO GESTION</div>
      <div style={{fontSize:28,fontWeight:800,fontFamily:"'Playfair Display',serif",color:'#FFF',lineHeight:1.1,marginBottom:4}}>Bonjour,<br/>Papa Benido 👋</div>
      <div style={{fontSize:12,color:'#6B7A99',marginTop:6}}>{new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
      <div style={{marginTop:16,display:'flex',gap:10}}>
        <div style={{background:'rgba(240,165,0,.1)',border:'1px solid rgba(240,165,0,.2)',borderRadius:10,padding:'8px 14px',flex:1}}><div style={{fontSize:10,color:'#C07800',fontWeight:700,letterSpacing:1}}>SOLDE NET</div><div style={{fontSize:18,fontWeight:800,color:'#F0A500',marginTop:2}}>{money(totalPaye-totalDep)}</div></div>
        <div style={{background:'rgba(34,201,122,.08)',border:'1px solid rgba(34,201,122,.2)',borderRadius:10,padding:'8px 14px',flex:1}}><div style={{fontSize:10,color:'#1A9E61',fontWeight:700,letterSpacing:1}}>CHAMBRES</div><div style={{fontSize:18,fontWeight:800,color:'#22C97A',marginTop:2}}>{occupees.size}/{appts.length}</div></div>
      </div>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:24}}>
      <StatCard icon="👥" label="Clients actifs" value={actifs.length} sub={`${clients.filter(c=>c.statut==='Sortie').length} sortis`} accent="#4F9EF0" delay={0}/>
      <StatCard icon="💰" label="Encaissé" value={money(totalPaye)} accent="#22C97A" delay={70}/>
      <StatCard icon="📉" label="Dépenses" value={money(totalDep)} accent="#F04F4F" delay={140}/>
      <StatCard icon="🏢" label="Appt libres" value={appts.length-occupees.size} accent="#9B7EF0" delay={210}/>
    </div>
    <GlassCard className="fade-up" style={{padding:'20px',marginBottom:20}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div style={{fontWeight:700,color:'#E8ECF4',fontSize:15}}>Paiements récents</div>
        <button onClick={()=>setPage('paiements')} style={{fontSize:11,color:'#F0A500',background:'none',border:'none',cursor:'pointer',fontFamily:'inherit',fontWeight:700}}>Voir tout →</button>
      </div>
      {recentPay.length===0?<div style={{color:'#6B7A99',fontSize:13,textAlign:'center',padding:20}}>Aucun paiement</div>:recentPay.map(p=><div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid #1E2430'}}><div style={{display:'flex',gap:12,alignItems:'center'}}><div style={{width:36,height:36,borderRadius:10,background:'rgba(240,165,0,0.15)',border:'1px solid rgba(240,165,0,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>💳</div><div><div style={{fontWeight:600,fontSize:13,color:'#E8ECF4'}}>{p.clientNom}</div><div style={{fontSize:11,color:'#6B7A99'}}>{p.date} · {p.objet||'Paiement'}</div></div></div><div style={{fontWeight:800,color:'#22C97A',fontSize:14}}>{money(p.montant)}</div></div>)}
    </GlassCard>
    <GlassCard className="fade-up" style={{padding:20}}>
      <div style={{fontWeight:700,color:'#E8ECF4',fontSize:15,marginBottom:14}}>Actions rapides</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {[['👤','Nouveau client','clients'],['💳','Paiement','paiements'],['🚪','Sortie','sorties'],['💸','Dépense','depenses'],['🏢','Chambres','chambres'],['📊','Synthèse','synthese']].map(([ic,lb,pg])=><button key={pg} onClick={()=>setPage(pg)} style={{display:'flex',alignItems:'center',gap:10,background:'#111318',border:'1px solid #1E2430',borderRadius:14,padding:'13px',cursor:'pointer',transition:'all .15s',fontFamily:'inherit'}} onMouseEnter={e=>{e.currentTarget.style.borderColor='#F0A500';e.currentTarget.style.background='rgba(240,165,0,0.15)';}} onMouseLeave={e=>{e.currentTarget.style.borderColor='#1E2430';e.currentTarget.style.background='#111318';}}><span style={{fontSize:20}}>{ic}</span><span style={{fontSize:12,fontWeight:600,color:'#E8ECF4'}}>{lb}</span></button>)}
      </div>
    </GlassCard>
  </div>;
}

/* ─── CLIENTS PAGE ───────────────────────────────────────────────────────── */
function ClientsPage({clients,setClients,appts,showToast}){
  const emptyForm={nom:'',prenom:'',genre:'Masculin',nationalite:'',appartement:appts[0]?.code||'',modalite:'Mois',dateEntree:today(),dateSortie:'',montantJour:'',montantMois:''};
  const [form,setForm]=useState(emptyForm);
  const [tab,setTab]=useState('liste');
  const [search,setSearch]=useState('');
  const [confirm,setConfirm]=useState(null);
  const [editing,setEditing]=useState(null);
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  function add(){
    if(!form.nom||!form.prenom||!form.dateEntree||!form.dateSortie){showToast('Champs obligatoires manquants','error');return;}
    if(!appts.length){showToast("Ajoutez d'abord un appartement",'error');return;}
    const c={...form,id:Date.now(),code:genClient(clients),statut:'Séjour en cours',montantJour:parseFloat(form.montantJour)||null,montantMois:parseFloat(form.montantMois)||null};
    setClients(p=>[...p,c]);setForm(emptyForm);setTab('liste');showToast(`Client ${c.code} enregistré !`);
  }
  function del(id){setClients(p=>p.filter(c=>c.id!==id));setConfirm(null);showToast('Client supprimé');}
  function saveEdit(updated){setClients(p=>p.map(c=>c.id===updated.id?updated:c));setEditing(null);showToast('Client mis à jour !');}
  const filtered=clients.filter(c=>!search||`${c.nom} ${c.prenom} ${c.code}`.toLowerCase().includes(search.toLowerCase()));
  return <div>
    <PageTitle icon="👤" title="Clients" sub={`${clients.length} locataires enregistrés`}/>
    <div style={{display:'flex',gap:8,marginBottom:20}}>
      {[['liste','📋 Liste'],['form','➕ Nouveau']].map(([id,lb])=><button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:'10px',borderRadius:12,border:`1.5px solid ${tab===id?'#F0A500':'#1E2430'}`,background:tab===id?'rgba(240,165,0,0.15)':'#111318',color:tab===id?'#F0A500':'#6B7A99',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}}>{lb}</button>)}
    </div>
    {tab==='form'&&<GlassCard className="fade-up" style={{padding:20}}>
      <div style={{fontWeight:700,color:'#E8ECF4',fontSize:16,marginBottom:18,fontFamily:"'Playfair Display',serif"}}>Nouveau locataire</div>
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}><Input label="Nom *" value={form.nom} onChange={e=>f('nom',e.target.value)} placeholder="Nom"/><Input label="Prénom *" value={form.prenom} onChange={e=>f('prenom',e.target.value)} placeholder="Prénom"/></div>
        <Input label="Nationalité" value={form.nationalite} onChange={e=>f('nationalite',e.target.value)} placeholder="Ex: Béninois"/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}><Input label="Genre" type="select" value={form.genre} onChange={e=>f('genre',e.target.value)}>{GENRES.map(g=><option key={g}>{g}</option>)}</Input><Input label="Appartement" type="select" value={form.appartement} onChange={e=>f('appartement',e.target.value)}>{appts.length===0?<option>Aucun</option>:appts.map(a=><option key={a.id}>{a.code}</option>)}</Input></div>
        <Input label="Modalité" type="select" value={form.modalite} onChange={e=>f('modalite',e.target.value)}>{['Jour','Mois'].map(m=><option key={m}>{m}</option>)}</Input>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}><Input label="Date entrée *" type="date" value={form.dateEntree} onChange={e=>f('dateEntree',e.target.value)}/><Input label="Date sortie *" type="date" value={form.dateSortie} onChange={e=>f('dateSortie',e.target.value)}/></div>
        {form.modalite==='Jour'?<Input label="Montant/Jour (FCFA)" type="number" value={form.montantJour} onChange={e=>f('montantJour',e.target.value)} placeholder="0"/>:<Input label="Montant/Mois (FCFA)" type="number" value={form.montantMois} onChange={e=>f('montantMois',e.target.value)} placeholder="0"/>}
        <Btn onClick={add} full>Enregistrer le client</Btn>
      </div>
    </GlassCard>}
    {tab==='liste'&&<div>
      <Input placeholder="🔍  Rechercher par nom ou code…" value={search} onChange={e=>setSearch(e.target.value)}/>
      <div style={{height:12}}/>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {filtered.length===0&&<div style={{textAlign:'center',color:'#6B7A99',padding:40,fontSize:13}}>Aucun client trouvé</div>}
        {filtered.map(c=><GlassCard key={c.id} className="fade-up" style={{padding:'16px 18px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
            <div style={{display:'flex',gap:12,alignItems:'center'}}>
              <div style={{width:44,height:44,borderRadius:14,background:c.genre==='Féminin'?'rgba(155,126,240,.15)':'rgba(240,165,0,0.15)',border:`1px solid ${c.genre==='Féminin'?'rgba(155,126,240,.3)':'rgba(240,165,0,.3)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{c.genre==='Féminin'?'👩':'👨'}</div>
              <div><div style={{fontWeight:700,color:'#E8ECF4',fontSize:14}}>{c.nom} {c.prenom}</div><div style={{fontSize:11,color:'#6B7A99',marginTop:1}}>{c.appartement} · {c.nationalite||'—'}</div><div style={{marginTop:4,display:'flex',gap:6,flexWrap:'wrap'}}><Chip label={c.code} color="gold"/><Chip label={c.modalite} color="blue"/></div></div>
            </div>
            <Chip label={c.statut==='Séjour en cours'?'✓ Actif':'Sorti'} color={c.statut==='Séjour en cours'?'green':'muted'}/>
          </div>
          <div style={{display:'flex',gap:8,borderTop:'1px solid #1E2430',paddingTop:12}}>
            <Btn onClick={()=>setEditing(c)} variant="ghost" sm full>✏️ Modifier</Btn>
            <Btn onClick={()=>setConfirm(c.id)} variant="danger" sm full>🗑️ Supprimer</Btn>
          </div>
        </GlassCard>)}
      </div>
    </div>}
    {confirm&&<ConfirmModal msg="Supprimer définitivement ce client ?" onConfirm={()=>del(confirm)} onCancel={()=>setConfirm(null)}/>}
    {editing&&<EditClientModal client={editing} appts={appts} onSave={saveEdit} onClose={()=>setEditing(null)}/>}
  </div>;
}

/* ─── PAIEMENTS PAGE ─────────────────────────────────────────────────────── */
function PaiementsPage({clients,paiements,setPaiements,showToast}){
  const [form,setForm]=useState({q:'',clientCode:'',clientNom:'',clientPrenom:'',date:today(),objet:'',montant:''});
  const [results,setResults]=useState([]);
  const [confirm,setConfirm]=useState(null);
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  function search(){const q=form.q.toLowerCase();setResults(clients.filter(c=>c.code.toLowerCase().includes(q)||c.nom.toLowerCase().includes(q)||c.prenom.toLowerCase().includes(q)));}
  function pick(c){setForm(p=>({...p,clientCode:c.code,clientNom:c.nom,clientPrenom:c.prenom,q:`${c.code} — ${c.nom} ${c.prenom}`}));setResults([]);}
  function add(){
    if(!form.clientCode||!form.date||!form.montant){showToast('Remplir tous les champs','error');return;}
    const p={id:Date.now(),code:genPay(paiements),date:form.date,clientCode:form.clientCode,clientNom:form.clientNom,clientPrenom:form.clientPrenom,objet:form.objet,montant:parseFloat(form.montant)};
    setPaiements(prev=>[...prev,p]);setForm({q:'',clientCode:'',clientNom:'',clientPrenom:'',date:today(),objet:'',montant:''});showToast(`Paiement ${p.code} enregistré !`);
  }
  function del(id){setPaiements(p=>p.filter(x=>x.id!==id));setConfirm(null);showToast('Paiement supprimé');}
  return <div>
    <PageTitle icon="💳" title="Paiements" sub="Enregistrement des versements"/>
    <GlassCard className="fade-up" style={{padding:20,marginBottom:20}}>
      <div style={{fontWeight:700,color:'#E8ECF4',fontSize:15,marginBottom:16,fontFamily:"'Playfair Display',serif"}}>Nouveau paiement</div>
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        <div style={{position:'relative'}}>
          <div style={{display:'flex',gap:8}}><Input label="Rechercher client" value={form.q} onChange={e=>f('q',e.target.value)} placeholder="Code ou nom" onKeyDown={e=>e.key==='Enter'&&search()}/><button onClick={search} style={{marginTop:23,background:'rgba(240,165,0,0.15)',border:'1px solid rgba(240,165,0,.3)',borderRadius:12,padding:'0 14px',cursor:'pointer',fontSize:16}}>🔍</button></div>
          {results.length>0&&<div style={{position:'absolute',top:'100%',left:0,right:0,background:'#161A21',border:'1px solid #1E2430',borderRadius:12,zIndex:50,overflow:'hidden',boxShadow:'0 16px 40px #0009',marginTop:4}}>{results.map(c=><div key={c.id} onClick={()=>pick(c)} style={{padding:'11px 14px',cursor:'pointer',borderBottom:'1px solid #1E2430',fontSize:13}} onMouseEnter={e=>e.currentTarget.style.background='#1E2430'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><span style={{color:'#F0A500',fontWeight:700}}>{c.code}</span> — {c.nom} {c.prenom} <span style={{color:'#6B7A99'}}>({c.appartement})</span></div>)}</div>}
        </div>
        {form.clientCode&&<div style={{background:'rgba(34,201,122,.08)',border:'1px solid rgba(34,201,122,.25)',borderRadius:12,padding:'10px 14px',fontSize:12,color:'#22C97A',fontWeight:600}}>✓ {form.clientCode} — {form.clientNom} {form.clientPrenom}</div>}
        <Input label="Date" type="date" value={form.date} onChange={e=>f('date',e.target.value)}/>
        <Input label="Objet" value={form.objet} onChange={e=>f('objet',e.target.value)} placeholder="Ex: Loyer Juin 2025"/>
        <Input label="Montant (FCFA)" type="number" value={form.montant} onChange={e=>f('montant',e.target.value)} placeholder="0"/>
        <Btn onClick={add} variant="green" full>Enregistrer le paiement</Btn>
      </div>
    </GlassCard>
    <GlassCard className="fade-up-2" style={{padding:20}}>
      <div style={{fontWeight:700,color:'#E8ECF4',fontSize:15,marginBottom:14}}>Historique ({paiements.length}) · <span style={{color:'#22C97A'}}>{money(paiements.reduce((s,p)=>s+p.montant,0))}</span></div>
      <div style={{display:'flex',flexDirection:'column',gap:0,maxHeight:500,overflowY:'auto'}}>
        {paiements.length===0&&<div style={{textAlign:'center',color:'#6B7A99',padding:30}}>Aucun paiement</div>}
        {[...paiements].reverse().map(p=><div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid #1E2430',gap:10}}>
          <div style={{flex:1,minWidth:0}}><div style={{fontWeight:600,fontSize:13}}>{p.clientNom} {p.clientPrenom}</div><div style={{fontSize:11,color:'#6B7A99',marginTop:1}}>{p.date} · <span style={{color:'#F0A500',fontFamily:'monospace'}}>{p.code}</span></div>{p.objet&&<div style={{fontSize:11,color:'#6B7A99'}}>{p.objet}</div>}</div>
          <div style={{fontWeight:800,color:'#22C97A',fontSize:14,whiteSpace:'nowrap'}}>{money(p.montant)}</div>
          <button onClick={()=>setConfirm(p.id)} style={{background:'rgba(240,79,79,.1)',border:'1px solid rgba(240,79,79,.2)',borderRadius:8,padding:'6px 10px',cursor:'pointer',fontSize:13,color:'#F04F4F',fontFamily:'inherit',fontWeight:700}}>🗑️</button>
        </div>)}
      </div>
    </GlassCard>
    {confirm&&<ConfirmModal msg="Supprimer ce paiement ?" onConfirm={()=>del(confirm)} onCancel={()=>setConfirm(null)}/>}
  </div>;
}

/* ─── SORTIES PAGE ───────────────────────────────────────────────────────── */
function SortiesPage({clients,setClients,showToast}){
  const [nameSearch,setNameSearch]=useState('');
  const [selectedCode,setSelectedCode]=useState('');
  const [date,setDate]=useState(today());
  const [showResults,setShowResults]=useState(false);
  const [dismissed,setDismissed]=useState(new Set()); // codes of dismissed "sortis"

  const actifs=clients.filter(c=>c.statut==='Séjour en cours');
  const searchResults=nameSearch.length>1
    ? actifs.filter(c=>`${c.nom} ${c.prenom} ${c.code}`.toLowerCase().includes(nameSearch.toLowerCase()))
    : [];
  const sel=clients.find(c=>c.code===selectedCode);

  function pick(c){setSelectedCode(c.code);setNameSearch(`${c.nom} ${c.prenom}`);setShowResults(false);}

  function doSortie(){
    if(!selectedCode||!date){showToast('Sélectionnez un client et une date','error');return;}
    setClients(prev=>prev.map(c=>c.code===selectedCode?{...c,statut:'Sortie',dateSortie:date}:c));
    setSelectedCode('');setNameSearch('');setDate(today());showToast('Sortie enregistrée !');
  }

  const sortis=clients.filter(c=>c.statut==='Sortie'&&!dismissed.has(c.code));

  return <div>
    <PageTitle icon="🚪" title="Sorties" sub="Clôturer un séjour"/>
    <GlassCard className="fade-up" style={{padding:20,marginBottom:20}}>
      <div style={{fontWeight:700,color:'#E8ECF4',fontSize:15,marginBottom:16,fontFamily:"'Playfair Display',serif"}}>Enregistrer une sortie</div>
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        {/* Name search */}
        <div style={{position:'relative'}}>
          <Input label="Rechercher par nom ou code" value={nameSearch}
            onChange={e=>{setNameSearch(e.target.value);setSelectedCode('');setShowResults(true);}}
            placeholder="Tapez le nom du client…"/>
          {showResults&&searchResults.length>0&&<div style={{position:'absolute',top:'100%',left:0,right:0,background:'#161A21',border:'1px solid #1E2430',borderRadius:12,zIndex:50,overflow:'hidden',boxShadow:'0 16px 40px #0009',marginTop:4}}>
            {searchResults.map(c=><div key={c.id} onClick={()=>pick(c)} style={{padding:'11px 14px',cursor:'pointer',borderBottom:'1px solid #1E2430',fontSize:13}} onMouseEnter={e=>e.currentTarget.style.background='#1E2430'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <span style={{color:'#F0A500',fontWeight:700}}>{c.code}</span> — {c.nom} {c.prenom} <span style={{color:'#6B7A99'}}>({c.appartement})</span>
            </div>)}
          </div>}
        </div>

        {sel&&sel.statut==='Séjour en cours'&&<div style={{background:'#111318',border:'1px solid #1E2430',borderRadius:14,padding:'14px 16px'}}>
          <div style={{fontSize:10,color:'#6B7A99',fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:6}}>Client sélectionné</div>
          <div style={{fontWeight:800,color:'#E8ECF4',fontSize:15}}>{sel.nom} {sel.prenom}</div>
          <div style={{fontSize:12,color:'#6B7A99',marginTop:2}}>Appt: {sel.appartement} · Entrée: {sel.dateEntree}</div>
          <div style={{marginTop:6}}><Chip label={sel.code} color="gold"/></div>
        </div>}

        <Input label="Date de sortie" type="date" value={date} onChange={e=>setDate(e.target.value)}/>
        <Btn onClick={doSortie} variant="danger" full disabled={!selectedCode}>Confirmer la sortie</Btn>
      </div>
    </GlassCard>

    {/* Clients actifs list */}
    {actifs.length>0&&<GlassCard className="fade-up-2" style={{padding:20,marginBottom:16}}>
      <div style={{fontWeight:700,color:'#E8ECF4',fontSize:15,marginBottom:14}}>Clients en séjour ({actifs.length})</div>
      <div style={{display:'flex',flexDirection:'column',gap:0}}>
        {actifs.map(c=><div key={c.id} onClick={()=>pick(c)} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid #1E2430',cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(240,165,0,.04)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
          <div><div style={{fontWeight:600,fontSize:13,color:'#E8ECF4'}}>{c.nom} {c.prenom}</div><div style={{fontSize:11,color:'#6B7A99'}}>{c.appartement} · Entrée: {c.dateEntree}</div></div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}><Chip label={c.code} color="gold"/><span style={{color:'#6B7A99',fontSize:18}}>→</span></div>
        </div>)}
      </div>
    </GlassCard>}

    {/* Sortis list with dismiss checkmarks */}
    <GlassCard className="fade-up-3" style={{padding:20}}>
      <div style={{fontWeight:700,color:'#E8ECF4',fontSize:15,marginBottom:14}}>
        Clients sortis ({clients.filter(c=>c.statut==='Sortie').length})
        {dismissed.size>0&&<span style={{fontSize:11,color:'#6B7A99',fontWeight:400,marginLeft:8}}>{dismissed.size} masqués</span>}
      </div>
      {sortis.length===0&&<div style={{textAlign:'center',color:'#6B7A99',padding:20,fontSize:13}}>{dismissed.size>0?'Tous les clients sortis sont masqués':'Aucun client sorti'}</div>}
      <div style={{display:'flex',flexDirection:'column',gap:0}}>
        {sortis.map(c=><div key={c.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid #1E2430'}}>
          <div><div style={{fontWeight:600,fontSize:13}}>{c.nom} {c.prenom}</div><div style={{fontSize:11,color:'#6B7A99'}}>{c.appartement} · Sortie: {c.dateSortie}</div></div>
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <Chip label={c.code} color="muted"/>
            {/* Dismiss checkmark */}
            <button onClick={()=>setDismissed(p=>{const n=new Set(p);n.add(c.code);return n;})}
              title="Masquer ce client"
              style={{width:32,height:32,borderRadius:'50%',background:'rgba(34,201,122,.1)',border:'1px solid rgba(34,201,122,.25)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,transition:'all .15s'}}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(34,201,122,.25)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(34,201,122,.1)';}}>
              ✓
            </button>
          </div>
        </div>)}
      </div>
      {dismissed.size>0&&<button onClick={()=>setDismissed(new Set())} style={{marginTop:12,width:'100%',padding:'8px',background:'none',border:'1px solid #1E2430',borderRadius:10,color:'#6B7A99',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>Réafficher tous les masqués</button>}
    </GlassCard>
  </div>;
}

/* ─── DEPENSES PAGE ──────────────────────────────────────────────────────── */
function DepensesPage({depenses,setDepenses,showToast}){
  const [form,setForm]=useState({date:today(),libelle:'',type:EXPENSE_TYPES[0],montant:''});
  const [confirm,setConfirm]=useState(null);
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  function add(){
    if(!form.libelle||!form.montant){showToast('Remplir tous les champs','error');return;}
    setDepenses(p=>[...p,{id:Date.now(),...form,montant:parseFloat(form.montant)}]);
    setForm({date:today(),libelle:'',type:EXPENSE_TYPES[0],montant:''});showToast('Dépense enregistrée !');
  }
  function del(id){setDepenses(p=>p.filter(x=>x.id!==id));setConfirm(null);showToast('Dépense supprimée');}
  const byType=EXPENSE_TYPES.map(t=>({t,v:depenses.filter(d=>d.type===t).reduce((s,d)=>s+d.montant,0)})).filter(x=>x.v>0);
  const maxVal=Math.max(...byType.map(x=>x.v),1);
  return <div>
    <PageTitle icon="💸" title="Dépenses" sub="Charges et frais"/>
    <GlassCard className="fade-up" style={{padding:20,marginBottom:20}}>
      <div style={{fontWeight:700,color:'#E8ECF4',fontSize:15,marginBottom:16,fontFamily:"'Playfair Display',serif"}}>Nouvelle dépense</div>
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        <Input label="Date" type="date" value={form.date} onChange={e=>f('date',e.target.value)}/>
        <Input label="Libellé" value={form.libelle} onChange={e=>f('libelle',e.target.value)} placeholder="Description"/>
        <Input label="Type" type="select" value={form.type} onChange={e=>f('type',e.target.value)}>{EXPENSE_TYPES.map(t=><option key={t}>{t}</option>)}</Input>
        <Input label="Montant (FCFA)" type="number" value={form.montant} onChange={e=>f('montant',e.target.value)} placeholder="0"/>
        <Btn onClick={add} variant="danger" full>Enregistrer la dépense</Btn>
      </div>
    </GlassCard>
    {byType.length>0&&<GlassCard className="fade-up-2" style={{padding:20,marginBottom:20}}>
      <div style={{fontWeight:700,color:'#E8ECF4',fontSize:15,marginBottom:16}}>Répartition</div>
      {byType.sort((a,b)=>b.v-a.v).map(({t,v})=><div key={t} style={{marginBottom:12}}><div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:5}}><span style={{color:'#E8ECF4',fontWeight:600}}>{t}</span><span style={{color:'#F04F4F',fontWeight:700}}>{money(v)}</span></div><div style={{background:'#1E2430',borderRadius:99,height:6,overflow:'hidden'}}><div style={{width:`${(v/maxVal)*100}%`,height:'100%',background:'linear-gradient(90deg,#F04F4F,#F0A500)',borderRadius:99}}/></div></div>)}
    </GlassCard>}
    <GlassCard className="fade-up-3" style={{padding:20}}>
      <div style={{fontWeight:700,color:'#E8ECF4',fontSize:15,marginBottom:14}}>Historique · <span style={{color:'#F04F4F'}}>{money(depenses.reduce((s,d)=>s+d.montant,0))}</span></div>
      <div style={{display:'flex',flexDirection:'column',gap:0,maxHeight:400,overflowY:'auto'}}>
        {depenses.length===0&&<div style={{textAlign:'center',color:'#6B7A99',padding:30}}>Aucune dépense</div>}
        {[...depenses].reverse().map(d=><div key={d.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid #1E2430',gap:10}}>
          <div style={{flex:1,minWidth:0}}><div style={{fontWeight:600,fontSize:13,color:'#E8ECF4'}}>{d.libelle}</div><div style={{fontSize:11,color:'#6B7A99',marginTop:1}}>{d.date}</div><div style={{marginTop:4}}><Chip label={d.type} color="red"/></div></div>
          <div style={{fontWeight:800,color:'#F04F4F',fontSize:14,whiteSpace:'nowrap'}}>{money(d.montant)}</div>
          <button onClick={()=>setConfirm(d.id)} style={{background:'rgba(240,79,79,.1)',border:'1px solid rgba(240,79,79,.2)',borderRadius:8,padding:'6px 10px',cursor:'pointer',fontSize:13,color:'#F04F4F',fontFamily:'inherit',fontWeight:700}}>🗑️</button>
        </div>)}
      </div>
    </GlassCard>
    {confirm&&<ConfirmModal msg="Supprimer cette dépense ?" onConfirm={()=>del(confirm)} onCancel={()=>setConfirm(null)}/>}
  </div>;
}

/* ─── SYNTHESE PAGE — with clickable amount detail ───────────────────────── */
function SynthesePage({clients,paiements}){
  const [detailClient,setDetailClient]=useState(null);
  const rows=clients.map(c=>{const paid=paiements.filter(p=>p.clientCode===c.code).reduce((s,p)=>s+p.montant,0);const du=calcDu(c);return{c,paid,du,ecart:du-paid};});
  return <div>
    <PageTitle icon="📊" title="Synthèse clients" sub="Cliquez sur un montant pour le détail"/>
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      {rows.length===0&&<div style={{textAlign:'center',color:'#6B7A99',padding:40}}>Aucun client</div>}
      {rows.map(({c,paid,du,ecart})=><GlassCard key={c.id} className="fade-up" style={{padding:'16px 18px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
          <div><div style={{fontWeight:700,fontSize:14,color:'#E8ECF4'}}>{c.nom} {c.prenom}</div><div style={{fontSize:11,color:'#6B7A99',marginTop:1}}>{c.appartement} · {c.modalite} · {c.dateEntree} → {c.dateSortie}</div></div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'flex-end'}}>{ecart===0?<Chip label="✓ Soldé" color="green"/>:ecart>0?<Chip label="Impayé" color="red"/>:<Chip label="Excédent" color="blue"/>}</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
          {/* Clickable "Montant dû" */}
          <div onClick={()=>setDetailClient(c)} style={{background:'rgba(240,165,0,.06)',borderRadius:10,padding:'10px 12px',border:'1px solid rgba(240,165,0,.2)',cursor:'pointer',transition:'background .15s'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(240,165,0,.12)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(240,165,0,.06)'}>
            <div style={{fontSize:9,color:'#C07800',fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:4}}>Montant dû 🔍</div>
            <div style={{fontSize:13,fontWeight:800,color:'#F0A500'}}>{money(du)}</div>
          </div>
          <div style={{background:'#111318',borderRadius:10,padding:'10px 12px',border:'1px solid #1E2430'}}><div style={{fontSize:9,color:'#6B7A99',fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:4}}>Payé</div><div style={{fontSize:13,fontWeight:800,color:'#22C97A'}}>{money(paid)}</div></div>
          <div onClick={()=>setDetailClient(c)} style={{background:ecart===0?'rgba(34,201,122,.06)':ecart>0?'rgba(240,79,79,.06)':'rgba(79,158,240,.06)',borderRadius:10,padding:'10px 12px',border:`1px solid ${ecart===0?'rgba(34,201,122,.2)':ecart>0?'rgba(240,79,79,.2)':'rgba(79,158,240,.2)'}`,cursor:'pointer',transition:'background .15s'}} onMouseEnter={e=>e.currentTarget.style.opacity='.8'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            <div style={{fontSize:9,color:'#6B7A99',fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:4}}>Écart 🔍</div>
            <div style={{fontSize:13,fontWeight:800,color:ecart===0?'#22C97A':ecart>0?'#F04F4F':'#4F9EF0'}}>{money(ecart)}</div>
          </div>
        </div>
      </GlassCard>)}
    </div>
    {detailClient&&<AmountDetailModal client={detailClient} paiements={paiements} onClose={()=>setDetailClient(null)}/>}
  </div>;
}

/* ─── BILAN PAGE ─────────────────────────────────────────────────────────── */
function BilanPage({paiements,depenses}){
  const data={};
  paiements.forEach(p=>{const[y,m]=p.date.split('-');const k=`${y}-${m}`;if(!data[k])data[k]={y,m,e:0,d:0};data[k].e+=p.montant;});
  depenses.forEach(d=>{const[y,m]=d.date.split('-');const k=`${y}-${m}`;if(!data[k])data[k]={y,m,e:0,d:0};data[k].d+=d.montant;});
  const rows=Object.entries(data).sort(([a],[b])=>a.localeCompare(b)).map(([,v])=>({...v,s:v.e-v.d}));
  const totE=rows.reduce((s,r)=>s+r.e,0);const totD=rows.reduce((s,r)=>s+r.d,0);
  return <div>
    <PageTitle icon="📅" title="Bilan mensuel" sub="Entrées, dépenses et solde"/>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:20}}>
      <div style={{background:'rgba(34,201,122,.08)',border:'1px solid rgba(34,201,122,.2)',borderRadius:14,padding:'12px 14px'}}><div style={{fontSize:9,color:'#22C97A',fontWeight:700,letterSpacing:1,textTransform:'uppercase'}}>ENTRÉES</div><div style={{fontSize:15,fontWeight:800,color:'#22C97A',marginTop:4}}>{money(totE)}</div></div>
      <div style={{background:'rgba(240,79,79,.08)',border:'1px solid rgba(240,79,79,.2)',borderRadius:14,padding:'12px 14px'}}><div style={{fontSize:9,color:'#F04F4F',fontWeight:700,letterSpacing:1,textTransform:'uppercase'}}>DÉPENSES</div><div style={{fontSize:15,fontWeight:800,color:'#F04F4F',marginTop:4}}>{money(totD)}</div></div>
      <div style={{background:'rgba(240,165,0,0.15)',border:'1px solid rgba(240,165,0,.2)',borderRadius:14,padding:'12px 14px'}}><div style={{fontSize:9,color:'#C07800',fontWeight:700,letterSpacing:1,textTransform:'uppercase'}}>SOLDE</div><div style={{fontSize:15,fontWeight:800,color:'#F0A500',marginTop:4}}>{money(totE-totD)}</div></div>
    </div>
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      {rows.length===0&&<div style={{textAlign:'center',color:'#6B7A99',padding:40}}>Aucune donnée</div>}
      {rows.map(r=><GlassCard key={`${r.y}-${r.m}`} className="fade-up" style={{padding:'16px 18px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}><div style={{fontWeight:800,color:'#E8ECF4',fontSize:15,fontFamily:"'Playfair Display',serif"}}>{MOIS[parseInt(r.m)-1]} {r.y}</div><div style={{fontWeight:800,color:r.s>=0?'#F0A500':'#F04F4F',fontSize:16}}>{money(r.s)}</div></div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          <div style={{background:'#111318',borderRadius:10,padding:'10px 12px'}}><div style={{fontSize:10,color:'#6B7A99',fontWeight:700,textTransform:'uppercase'}}>Entrées</div><div style={{fontSize:14,fontWeight:700,color:'#22C97A',marginTop:3}}>{money(r.e)}</div></div>
          <div style={{background:'#111318',borderRadius:10,padding:'10px 12px'}}><div style={{fontSize:10,color:'#6B7A99',fontWeight:700,textTransform:'uppercase'}}>Dépenses</div><div style={{fontSize:14,fontWeight:700,color:'#F04F4F',marginTop:3}}>{money(r.d)}</div></div>
        </div>
      </GlassCard>)}
    </div>
  </div>;
}

/* ─── COMBINED CHAMBRES + APPARTEMENTS PAGE ──────────────────────────────── */
function ChambresPage({clients,appts,setAppts,showToast}){
  const actifs=clients.filter(c=>c.statut==='Séjour en cours');
  const occ=new Set(actifs.map(c=>c.appartement));
  const [filtre,setFiltre]=useState('tous');
  const [selectedAppt,setSelectedAppt]=useState(null); // view rooms/details of an appt
  const [tab,setTab]=useState('vue'); // 'vue' | 'gerer'
  const [confirm,setConfirm]=useState(null);
  const [editing,setEditing]=useState(null);
  const [editForm,setEditForm]=useState(null);
  const [addForm,setAddForm]=useState({code:'',type:APPT_TYPES[0],etage:1,description:''});
  const [showAddForm,setShowAddForm]=useState(false);

  const ef=(k,v)=>setEditForm(p=>({...p,[k]:v}));
  const af=(k,v)=>setAddForm(p=>({...p,[k]:v}));

  function addAppt(){
    if(!addForm.code){showToast('Le code est obligatoire','error');return;}
    if(appts.find(a=>a.code===addForm.code)){showToast('Ce code existe déjà','error');return;}
    setAppts(p=>[...p,{...addForm,id:Date.now(),etage:parseInt(addForm.etage)||1}]);
    setAddForm({code:'',type:APPT_TYPES[0],etage:1,description:''});
    setShowAddForm(false);showToast('Appartement ajouté !');
  }
  function delAppt(id){
    const a=appts.find(x=>x.id===id);
    if(clients.some(c=>c.appartement===a?.code&&c.statut==='Séjour en cours')){showToast('Impossible : appartement occupé','error');setConfirm(null);return;}
    setAppts(p=>p.filter(x=>x.id!==id));setConfirm(null);showToast('Appartement supprimé');
  }
  function saveEdit(){
    if(!editForm.code){showToast('Code obligatoire','error');return;}
    setAppts(p=>p.map(a=>a.id===editing?{...editForm,id:editing,etage:parseInt(editForm.etage)||1}:a));
    setEditing(null);setEditForm(null);showToast('Mis à jour !');
  }

  const filteredAppts=appts.filter(a=>filtre==='tous'||(filtre==='occupe'?occ.has(a.code):!occ.has(a.code)));

  // Detail view for a single apartment
  if(selectedAppt){
    const a=appts.find(x=>x.id===selectedAppt);
    if(!a){setSelectedAppt(null);return null;}
    const tenant=actifs.find(c=>c.appartement===a.code);
    const isOcc=occ.has(a.code);
    const history=clients.filter(c=>c.appartement===a.code);
    return <div>
      <button onClick={()=>setSelectedAppt(null)} style={{display:'flex',alignItems:'center',gap:8,background:'none',border:'none',color:'#6B7A99',cursor:'pointer',fontFamily:'inherit',fontSize:13,fontWeight:600,marginBottom:20,padding:0}}>← Retour aux chambres</button>
      <GlassCard style={{padding:24,marginBottom:16,border:`2px solid ${isOcc?'rgba(240,79,79,.4)':'rgba(34,201,122,.35)'}`}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
          <div>
            <div style={{fontSize:28,fontWeight:800,color:'#E8ECF4',fontFamily:"'Playfair Display',serif",letterSpacing:-1}}>{a.code}</div>
            <div style={{fontSize:13,color:'#6B7A99',marginTop:2}}>{a.type} · Étage {a.etage}</div>
            {a.description&&<div style={{fontSize:12,color:'#6B7A99',marginTop:4,fontStyle:'italic'}}>{a.description}</div>}
          </div>
          <Chip label={isOcc?'● Occupé':'● Libre'} color={isOcc?'red':'green'}/>
        </div>
        {tenant?<div style={{background:'rgba(240,165,0,.06)',border:'1px solid rgba(240,165,0,.2)',borderRadius:12,padding:'14px'}}>
          <div style={{fontSize:10,color:'#C07800',fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:8}}>LOCATAIRE ACTUEL</div>
          <div style={{fontWeight:700,color:'#E8ECF4',fontSize:15}}>{tenant.nom} {tenant.prenom}</div>
          <div style={{fontSize:12,color:'#6B7A99',marginTop:2}}>{tenant.nationalite} · {tenant.modalite} · {money(tenant.montantMois||tenant.montantJour)}</div>
          <div style={{fontSize:12,color:'#6B7A99',marginTop:2}}>{tenant.dateEntree} → {tenant.dateSortie}</div>
          <div style={{marginTop:6}}><Chip label={tenant.code} color="gold"/></div>
        </div>:<div style={{background:'rgba(34,201,122,.06)',border:'1px solid rgba(34,201,122,.2)',borderRadius:12,padding:'14px',textAlign:'center',color:'#22C97A',fontWeight:600,fontSize:13}}>✓ Disponible — Aucun locataire actuel</div>}
      </GlassCard>

      {history.length>0&&<GlassCard style={{padding:20}}>
        <div style={{fontWeight:700,color:'#E8ECF4',fontSize:15,marginBottom:14}}>Historique des locataires ({history.length})</div>
        {history.map(c=><div key={c.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #1E2430'}}>
          <div><div style={{fontWeight:600,fontSize:13,color:'#E8ECF4'}}>{c.nom} {c.prenom}</div><div style={{fontSize:11,color:'#6B7A99'}}>{c.dateEntree} → {c.dateSortie}</div></div>
          <Chip label={c.statut==='Séjour en cours'?'Actif':'Sorti'} color={c.statut==='Séjour en cours'?'green':'muted'}/>
        </div>)}
      </GlassCard>}
    </div>;
  }

  return <div>
    <PageTitle icon="🏢" title="Chambres" sub={`${appts.length} appartements · ${occ.size} occupés`}/>

    {/* Tab switcher */}
    <div style={{display:'flex',gap:8,marginBottom:16}}>
      {[['vue','🏠 Vue d\'ensemble'],['gerer','🏗️ Gérer']].map(([id,lb])=><button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:'10px',borderRadius:12,border:`1.5px solid ${tab===id?'#F0A500':'#1E2430'}`,background:tab===id?'rgba(240,165,0,0.15)':'#111318',color:tab===id?'#F0A500':'#6B7A99',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}}>{lb}</button>)}
    </div>

    {tab==='vue'&&<>
      {/* Filter buttons */}
      <div style={{display:'flex',gap:10,marginBottom:16}}>
        {[['tous','Toutes','#F0A500'],['occupe','Occupées','#F04F4F'],['libre','Libres','#22C97A']].map(([v,l,col])=><button key={v} onClick={()=>setFiltre(v)} style={{flex:1,padding:'9px 0',borderRadius:12,border:`1.5px solid ${filtre===v?col:'#1E2430'}`,background:filtre===v?`${col}1A`:'transparent',color:filtre===v?col:'#6B7A99',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}}>{l}</button>)}
      </div>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:14,fontSize:13,color:'#6B7A99'}}>
        <span>🔴 <strong style={{color:'#F04F4F'}}>{occ.size}</strong> occupées</span>
        <span>🟢 <strong style={{color:'#22C97A'}}>{appts.length-occ.size}</strong> libres</span>
        <span>🏢 <strong style={{color:'#E8ECF4'}}>{appts.length}</strong> total</span>
      </div>
      {filteredAppts.length===0&&<div style={{textAlign:'center',color:'#6B7A99',padding:40}}>Aucun appartement</div>}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        {filteredAppts.map(a=>{
          const tenant=actifs.find(c=>c.appartement===a.code);const isOcc=occ.has(a.code);
          return <GlassCard key={a.id} className="fade-up" onClick={()=>setSelectedAppt(a.id)} style={{padding:'16px',border:`1.5px solid ${isOcc?'rgba(240,79,79,.3)':'rgba(34,201,122,.25)'}`,background:isOcc?'rgba(240,79,79,.04)':'rgba(34,201,122,.04)',position:'relative',overflow:'hidden',cursor:'pointer',transition:'transform .15s'}} onMouseEnter={e=>e.currentTarget.style.transform='scale(1.02)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
            <div style={{position:'absolute',top:-12,right:-12,width:50,height:50,borderRadius:'50%',background:isOcc?'#F04F4F':'#22C97A',opacity:.08}}/>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',color:isOcc?'#F04F4F':'#22C97A',marginBottom:4}}>{isOcc?'● Occupé':'● Libre'}</div>
            <div style={{fontSize:18,fontWeight:800,color:'#E8ECF4',letterSpacing:-.5,fontFamily:"'Playfair Display',serif"}}>{a.code}</div>
            <div style={{fontSize:11,color:'#6B7A99',marginTop:2}}>{a.type}</div>
            {tenant?<div style={{marginTop:10,borderTop:'1px solid #1E2430',paddingTop:8}}><div style={{fontSize:12,fontWeight:700,color:'#E8ECF4'}}>{tenant.nom} {tenant.prenom}</div><div style={{fontSize:10,color:'#6B7A99',marginTop:1}}>{tenant.dateEntree} → {tenant.dateSortie}</div></div>:<div style={{marginTop:8,fontSize:11,color:'#6B7A99',fontStyle:'italic'}}>Disponible — Cliquez pour détails</div>}
          </GlassCard>;
        })}
      </div>
    </>}

    {tab==='gerer'&&<>
      <button onClick={()=>setShowAddForm(p=>!p)} style={{display:'flex',alignItems:'center',gap:8,width:'100%',padding:'13px 16px',background:showAddForm?'rgba(240,165,0,0.15)':'#111318',border:`1.5px solid ${showAddForm?'#F0A500':'#1E2430'}`,borderRadius:14,cursor:'pointer',fontFamily:'inherit',color:showAddForm?'#F0A500':'#6B7A99',fontWeight:700,fontSize:13,marginBottom:14,transition:'all .15s'}}>
        <span style={{fontSize:18}}>{showAddForm?'✕':'➕'}</span> {showAddForm?'Fermer':'Ajouter un appartement'}
      </button>
      {showAddForm&&<GlassCard className="fade-up" style={{padding:20,marginBottom:16,border:'1px solid rgba(240,165,0,.3)'}}>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <Input label="Code / Numéro *" value={addForm.code} onChange={e=>af('code',e.target.value)} placeholder="Ex: 15_2ch"/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}><Input label="Type" type="select" value={addForm.type} onChange={e=>af('type',e.target.value)}>{APPT_TYPES.map(t=><option key={t}>{t}</option>)}</Input><Input label="Étage" type="number" value={addForm.etage} onChange={e=>af('etage',e.target.value)} min="0"/></div>
          <Input label="Description" type="textarea" value={addForm.description} onChange={e=>af('description',e.target.value)} placeholder="Notes…"/>
          <Btn onClick={addAppt} full>Ajouter l'appartement</Btn>
        </div>
      </GlassCard>}

      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {appts.length===0&&<div style={{textAlign:'center',color:'#6B7A99',padding:40}}>Aucun appartement</div>}
        {appts.map(a=>{
          const isOcc=occ.has(a.code);
          const tenant=actifs.find(c=>c.appartement===a.code);
          return editing===a.id?
            <GlassCard key={a.id} className="fade-up" style={{padding:20,border:'1px solid #F0A500'}}>
              <div style={{fontWeight:700,color:'#F0A500',marginBottom:14}}>Modifier {a.code}</div>
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                <Input label="Code *" value={editForm.code} onChange={e=>ef('code',e.target.value)}/>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}><Input label="Type" type="select" value={editForm.type} onChange={e=>ef('type',e.target.value)}>{APPT_TYPES.map(t=><option key={t}>{t}</option>)}</Input><Input label="Étage" type="number" value={editForm.etage} onChange={e=>ef('etage',e.target.value)}/></div>
                <Input label="Description" type="textarea" value={editForm.description} onChange={e=>ef('description',e.target.value)}/>
                <div style={{display:'flex',gap:8}}><Btn onClick={()=>{setEditing(null);setEditForm(null);}} variant="ghost" full>Annuler</Btn><Btn onClick={saveEdit} full>Enregistrer</Btn></div>
              </div>
            </GlassCard>
          :
            <GlassCard key={a.id} style={{padding:'16px 18px',border:`1px solid ${isOcc?'rgba(240,79,79,.25)':'rgba(34,201,122,.2)'}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:2}}><div style={{fontWeight:800,fontSize:16,color:'#E8ECF4',fontFamily:"'Playfair Display',serif"}}>{a.code}</div><Chip label={isOcc?'Occupé':'Libre'} color={isOcc?'red':'green'}/></div>
                  <div style={{fontSize:12,color:'#6B7A99'}}>{a.type} · Étage {a.etage}</div>
                  {a.description&&<div style={{fontSize:11,color:'#6B7A99',fontStyle:'italic',marginTop:1}}>{a.description}</div>}
                  {tenant&&<div style={{fontSize:12,color:'#4F9EF0',marginTop:4,fontWeight:600}}>👤 {tenant.nom} {tenant.prenom}</div>}
                </div>
              </div>
              <div style={{display:'flex',gap:8,borderTop:'1px solid #1E2430',paddingTop:12}}>
                <Btn onClick={()=>{setEditing(a.id);setEditForm({...a});}} variant="ghost" sm full>✏️ Modifier</Btn>
                <Btn onClick={()=>setConfirm(a.id)} variant="danger" sm full disabled={isOcc}>🗑️ Supprimer</Btn>
              </div>
              {isOcc&&<div style={{fontSize:10,color:'#6B7A99',marginTop:6,textAlign:'center'}}>Libérez l'appartement avant de le supprimer</div>}
            </GlassCard>;
        })}
      </div>
    </>}
    {confirm&&<ConfirmModal msg="Supprimer cet appartement ?" onConfirm={()=>delAppt(confirm)} onCancel={()=>setConfirm(null)}/>}
  </div>;
}

/* ─── ROOT APP ───────────────────────────────────────────────────────────── */
export default function App(){
  const [page,setPage]=useState('dashboard');
  const [clients,setClients]=useState(INIT_CLIENTS);
  const [paiements,setPaiements]=useState(INIT_PAIEMENTS);
  const [depenses,setDepenses]=useState(INIT_DEPENSES);
  const [appts,setAppts]=useState(INIT_APPTS);
  const [toast,setToast]=useState(null);
  function showToast(msg,type='success'){setToast({msg,type});setTimeout(()=>setToast(null),3200);}
  const PAGES={dashboard:Dashboard,clients:ClientsPage,paiements:PaiementsPage,sorties:SortiesPage,depenses:DepensesPage,synthese:SynthesePage,bilan:BilanPage,chambres:ChambresPage};
  const Page=PAGES[page]||Dashboard;
  return <>
    <style>{GLOBAL_CSS}</style>
    <div style={{maxWidth:480,margin:'0 auto',minHeight:'100vh',background:'#0A0C0F',paddingBottom:90}}>
      <div style={{height:12,background:'#0A0C0F'}}/>
      <div style={{padding:'8px 16px 0'}}>
        <Page key={page} clients={clients} setClients={setClients} paiements={paiements} setPaiements={setPaiements} depenses={depenses} setDepenses={setDepenses} appts={appts} setAppts={setAppts} showToast={showToast} setPage={setPage}/>
      </div>
      <BottomNav page={page} setPage={setPage}/>
      <Toast toast={toast}/>
    </div>
  </>;
}