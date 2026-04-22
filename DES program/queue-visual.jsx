import { useState, useEffect, useRef, useCallback } from "react";
const T={bg:"#0B0E14",panel:"#131720",card:"#1A1F2E",border:"rgba(255,255,255,0.06)",text:"#E2E8F0",sub:"#8892A8",dim:"#4A5568",blue:"#60A5FA",blueDim:"rgba(96,165,250,0.15)",green:"#34D399",greenDim:"rgba(52,211,153,0.12)",amber:"#FBBF24",amberDim:"rgba(251,191,36,0.12)",red:"#F87171",redDim:"rgba(248,113,113,0.12)",teal:"#2DD4BF",purple:"#A78BFA"};
function Panel({children,glow,style}){return <div style={{background:T.card,border:`1px solid ${glow||T.border}`,borderRadius:12,padding:14,boxShadow:glow?`0 0 20px ${glow}`:"none",transition:"all 0.3s",...style}}>{children}</div>}
function Badge({children,color}){return <span style={{display:"inline-block",fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:6,background:(color||T.blue)+"18",color:color||T.blue}}>{children}</span>}
function Bar({value,max,color,h}){return <div style={{height:h||6,background:T.panel,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:Math.min(100,Math.max(0,(value/(max||1))*100))+"%",background:color||T.blue,borderRadius:99,transition:"width 0.4s"}}/></div>}
function Num({value,label,icon,color}){return <div style={{textAlign:"center"}}><div style={{fontSize:10,color:T.dim,marginBottom:2}}>{icon} {label}</div><div style={{fontSize:22,fontWeight:700,color:color||T.text,lineHeight:1}}>{value}</div></div>}
function Btn({children,onClick,on,color,big}){return <button onClick={onClick} style={{background:on?(color||T.blue)+"22":"transparent",border:`1px solid ${on?(color||T.blue)+"55":T.border}`,borderRadius:8,padding:big?"8px 20px":"6px 12px",fontSize:big?13:11,fontWeight:500,color:on?(color||T.blue):T.sub,cursor:"pointer",transition:"all 0.2s",fontFamily:"inherit"}}>{children}</button>}
function Log({items}){const ref=useRef(null);useEffect(()=>{if(ref.current)ref.current.scrollTop=ref.current.scrollHeight},[items]);return <div ref={ref} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 12px",maxHeight:160,overflowY:"auto",fontSize:11,lineHeight:1.8,marginTop:10,fontFamily:"'SF Mono',Consolas,monospace"}}>{items.length===0&&<span style={{color:T.dim}}>Waiting...</span>}{items.slice(-20).map((e,i)=><div key={i}><span style={{color:T.dim,opacity:.5}}>[{e.t}]</span>{" "}<span style={{color:e.c||T.sub}}>{e.m}</span></div>)}</div>}
function Tip({children}){return <div style={{background:T.blueDim,border:"1px solid rgba(96,165,250,0.15)",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:12.5,lineHeight:1.6,color:"#93C5FD"}}>{children}</div>}
function PersonQ({count,max,color}){return <div style={{display:"flex",gap:2,flexWrap:"wrap",minHeight:20}}>{Array.from({length:Math.min(count,max||15)}).map((_,i)=><div key={i} style={{fontSize:14,opacity:0.8}}>👤</div>)}{count>max&&<span style={{fontSize:10,color:T.dim}}>+{count-max}</span>}</div>}

function MM1(){
  const [q,setQ]=useState(0);const [busy,setBusy]=useState(false);const [clk,setClk]=useState(0);const [log,setLog]=useState([]);
  const [on,setOn]=useState(false);const [served,setServed]=useState(0);const [lost,setLost]=useState(0);
  const [lam,setLam]=useState(4);const [mu,setMu]=useState(5);const [K,setK]=useState(8);const ir=useRef(null);
  const step=useCallback(()=>{setClk(c=>c+1);const t=clk+1;const ev=[];
    if(Math.random()<lam/10){if(q<K){setQ(qq=>qq+1);ev.push({t:t+"",m:"👤 Customer arrived (queue: "+(q+1)+"/"+K+")",c:T.blue})}
      else{setLost(l=>l+1);ev.push({t:t+"",m:"🔴 Queue FULL! Customer turned away",c:T.red})}}
    if(busy&&Math.random()<mu/10){setBusy(false);setServed(s=>s+1);ev.push({t:t+"",m:"✅ Service complete! Customer leaves happy",c:T.green})}
    if(!busy&&q>0){setBusy(true);setQ(qq=>qq-1);ev.push({t:t+"",m:"🔔 Next customer → counter (queue: "+(q-1)+")",c:T.amber})}
    if(ev.length)setLog(l=>[...l,...ev].slice(-40));
  },[clk,q,busy,lam,mu,K]);
  useEffect(()=>{if(on)ir.current=setInterval(step,400);else clearInterval(ir.current);return()=>clearInterval(ir.current)},[on,step]);
  const reset=()=>{setOn(false);setClk(0);setLog([]);setQ(0);setBusy(false);setServed(0);setLost(0)};
  const rho=lam/mu;

  return <div>
    <Tip><strong>How it works:</strong> Like a store with ONE cashier 🧑‍💼. Customers arrive randomly and wait in line. The cashier serves one at a time. If the line is full ({K} max), new customers leave. Increase arrival rate to see the queue overflow!</Tip>
    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
      {[{ic:"⏱",l:"Time",v:clk},{ic:"✅",l:"Served",v:served,c:T.green},{ic:"🔴",l:"Lost",v:lost,c:lost>0?T.red:T.dim},{ic:"📊",l:"Load",v:Math.round(rho*100)+"%",c:rho>=1?T.red:T.amber}].map((m,i)=>
        <Panel key={i} style={{flex:"1 1 70px",padding:"10px 8px",textAlign:"center"}}><Num icon={m.ic} label={m.l} value={m.v} color={m.c}/></Panel>)}
    </div>
    <Panel style={{marginBottom:14,padding:16}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{flex:1}}>
          <div style={{fontSize:11,color:T.sub,marginBottom:6}}>👥 Waiting Line ({q}/{K})</div>
          <PersonQ count={q} max={12}/>
          <Bar value={q} max={K} color={q>=K?T.red:T.blue} h={4}/>
        </div>
        <div style={{fontSize:18,color:T.dim}}>→</div>
        <div style={{textAlign:"center",padding:12,borderRadius:10,background:busy?T.amberDim:T.greenDim,border:`1px solid ${busy?T.amber+"40":T.green+"40"}`,minWidth:70}}>
          <div style={{fontSize:24}}>{busy?"🧑‍💼":"😴"}</div>
          <div style={{fontSize:10,fontWeight:600,color:busy?T.amber:T.green}}>{busy?"Serving":"Free"}</div>
        </div>
        <div style={{fontSize:18,color:T.dim}}>→</div>
        <div style={{textAlign:"center"}}><div style={{fontSize:20}}>🚶</div><div style={{fontSize:12,fontWeight:700,color:T.green}}>{served}</div><div style={{fontSize:9,color:T.dim}}>served</div></div>
      </div>
    </Panel>
    <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:0}}>
      <span style={{fontSize:10,color:T.dim}}>λ</span><input type="range" min="1" max="9" value={lam} step="1" onChange={e=>setLam(+e.target.value)} style={{width:60,accentColor:T.blue}}/><span style={{fontSize:11,color:T.blue,fontWeight:600,minWidth:14}}>{lam}</span>
      <span style={{fontSize:10,color:T.dim}}>μ</span><input type="range" min="1" max="9" value={mu} step="1" onChange={e=>setMu(+e.target.value)} style={{width:60,accentColor:T.green}}/><span style={{fontSize:11,color:T.green,fontWeight:600,minWidth:14}}>{mu}</span>
      <span style={{fontSize:10,color:T.dim}}>K</span><input type="range" min="3" max="15" value={K} step="1" onChange={e=>setK(+e.target.value)} style={{width:60,accentColor:T.purple}}/><span style={{fontSize:11,color:T.purple,fontWeight:600,minWidth:14}}>{K}</span>
      <Btn onClick={()=>setOn(!on)} on={on} color={on?T.amber:T.green} big>{on?"⏸":"▶"}</Btn><Btn onClick={step}>⏭</Btn><Btn onClick={reset}>🔄</Btn>
    </div>
    <Log items={log}/>
  </div>;
}

function MMc(){
  const [q,setQ]=useState(0);const [svrs,setSvrs]=useState([false,false,false]);const c=3;
  const [clk,setClk]=useState(0);const [log,setLog]=useState([]);const [on,setOn]=useState(false);const [served,setServed]=useState(0);const ir=useRef(null);
  const step=useCallback(()=>{setClk(ck=>ck+1);const t=clk+1;const ev=[];
    if(Math.random()<0.6){setQ(qq=>qq+1);ev.push({t:t+"",m:"👤 Customer arrived (queue: "+(q+1)+")",c:T.blue})}
    setSvrs(prev=>{const ns=[...prev];
      for(let i=0;i<c;i++){if(ns[i]&&Math.random()<0.3){ns[i]=false;setServed(s=>s+1);ev.push({t:t+"",m:"✅ Counter "+(i+1)+" finished!",c:T.green})}}
      for(let i=0;i<c;i++){if(!ns[i]&&q>0){ns[i]=true;setQ(qq=>Math.max(0,qq-1));ev.push({t:t+"",m:"🔔 Counter "+(i+1)+" now serving",c:T.amber});break}}
      return ns;});
    if(ev.length)setLog(l=>[...l,...ev].slice(-40));
  },[clk,q]);
  useEffect(()=>{if(on)ir.current=setInterval(step,500);else clearInterval(ir.current);return()=>clearInterval(ir.current)},[on,step]);
  const reset=()=>{setOn(false);setClk(0);setLog([]);setQ(0);setSvrs([false,false,false]);setServed(0)};

  return <div>
    <Tip><strong>How it works:</strong> Like a bank with 3 teller windows 🧑‍💼🧑‍💼🧑‍💼. Customers wait in ONE line and go to the first free teller. Multiple customers can be served simultaneously! This is much faster than a single server.</Tip>
    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="⏱" label="Time" value={clk}/></Panel>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="✅" label="Served" value={served} color={T.green}/></Panel>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="👥" label="Queue" value={q} color={q>6?T.red:T.blue}/></Panel>
    </div>
    <Panel style={{marginBottom:14,padding:16}}>
      <div style={{fontSize:11,color:T.sub,marginBottom:8}}>👥 Waiting ({q})</div>
      <PersonQ count={q} max={12}/>
      <div style={{display:"flex",gap:8,marginTop:12,justifyContent:"center"}}>
        {svrs.map((busy,i)=><div key={i} style={{textAlign:"center",padding:10,borderRadius:10,flex:1,
          background:busy?T.amberDim:T.greenDim,border:`1px solid ${busy?T.amber+"40":T.green+"40"}`}}>
          <div style={{fontSize:24}}>{busy?"🧑‍💼":"😴"}</div>
          <div style={{fontSize:10,fontWeight:600,color:busy?T.amber:T.green}}>Counter {i+1}</div>
          <Badge color={busy?T.amber:T.green}>{busy?"Serving":"Free"}</Badge>
        </div>)}
      </div>
    </Panel>
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      <Btn onClick={()=>setOn(!on)} on={on} color={on?T.amber:T.green} big>{on?"⏸ Pause":"▶ Run"}</Btn>
      <Btn onClick={step}>⏭</Btn><Btn onClick={reset}>🔄</Btn>
    </div>
    <Log items={log}/>
  </div>;
}

function Tandem(){
  const init=[{n:"Station 1",q:0,busy:false,done:0},{n:"Station 2",q:0,busy:false,done:0},{n:"Station 3",q:0,busy:false,done:0}];
  const [sts,setSts]=useState(init);const [clk,setClk]=useState(0);const [log,setLog]=useState([]);
  const [on,setOn]=useState(false);const [done,setDone]=useState(0);const [blocked,setBlocked]=useState(0);const ir=useRef(null);
  const step=useCallback(()=>{setClk(c=>c+1);const t=clk+1;const ev=[];
    setSts(prev=>{const s=prev.map(x=>({...x}));
      for(let i=s.length-1;i>=0;i--){if(s[i].busy&&Math.random()<0.3){s[i].busy=false;s[i].done++;
        if(i<s.length-1){if(s[i+1].q<5){s[i+1].q++;ev.push({t:t+"",m:`✅ ${s[i].n} → ${s[i+1].n}`,c:T.green})}
          else{setBlocked(b=>b+1);ev.push({t:t+"",m:`🚫 ${s[i].n} BLOCKED (${s[i+1].n} full!)`,c:T.red})}}
        else{setDone(d=>d+1);ev.push({t:t+"",m:"🎉 Product complete!",c:T.teal})}}}
      for(let i=0;i<s.length;i++){if(!s[i].busy&&s[i].q>0){s[i].busy=true;s[i].q--;ev.push({t:t+"",m:`⚙️ ${s[i].n} processing`,c:T.amber})}}
      if(Math.random()<0.4){s[0].q++;ev.push({t:t+"",m:"📥 New item arrived",c:T.blue})}
      return s;});
    if(ev.length)setLog(l=>[...l,...ev].slice(-40));
  },[clk]);
  useEffect(()=>{if(on)ir.current=setInterval(step,500);else clearInterval(ir.current);return()=>clearInterval(ir.current)},[on,step]);
  const reset=()=>{setOn(false);setClk(0);setLog([]);setDone(0);setBlocked(0);setSts(init)};

  return <div>
    <Tip><strong>How it works:</strong> Items pass through 3 stations in sequence (like an assembly line). Each station has a small buffer. If a downstream station is full, the upstream one is BLOCKED and can't send items — causing a traffic jam!</Tip>
    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="⏱" label="Time" value={clk}/></Panel>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="🎉" label="Done" value={done} color={T.green}/></Panel>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="🚫" label="Blocked" value={blocked} color={blocked>0?T.red:T.dim}/></Panel>
    </div>
    <Panel style={{marginBottom:14,padding:16}}>
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        <div style={{textAlign:"center"}}><div style={{fontSize:18}}>📥</div><div style={{fontSize:8,color:T.dim}}>IN</div></div>
        {sts.map((s,i)=><div key={i} style={{flex:1,display:"flex",alignItems:"center",gap:4}}>
          <div style={{flex:1,textAlign:"center",padding:"10px 6px",borderRadius:10,background:s.busy?T.amberDim:T.panel,border:`1px solid ${s.busy?T.amber+"40":T.border}`,transition:"all 0.3s"}}>
            <div style={{fontSize:11,fontWeight:600,color:T.text}}>{s.n}</div>
            <div style={{fontSize:9,color:T.dim}}>🔄 {s.q}/5 · ✅ {s.done}</div>
            <Bar value={s.q} max={5} color={s.q>=5?T.red:T.blue} h={4}/>
            {s.busy?<Badge color={T.amber}>⚙️</Badge>:<Badge color={T.dim}>💤</Badge>}
          </div>
          {i<sts.length-1&&<div style={{color:T.dim}}>→</div>}
        </div>)}
        <div style={{textAlign:"center"}}><div style={{fontSize:18}}>🎉</div><div style={{fontSize:12,fontWeight:700,color:T.green}}>{done}</div></div>
      </div>
    </Panel>
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      <Btn onClick={()=>setOn(!on)} on={on} color={on?T.amber:T.green} big>{on?"⏸ Pause":"▶ Run"}</Btn>
      <Btn onClick={step}>⏭</Btn><Btn onClick={reset}>🔄</Btn>
    </div>
    <Log items={log}/>
  </div>;
}

function ForkJoin(){
  const [input,setInput]=useState(0);const [qA,setQA]=useState(0);const [qB,setQB]=useState(0);
  const [bA,setBA]=useState(false);const [bB,setBB]=useState(false);const [jA,setJA]=useState(0);const [jB,setJB]=useState(0);
  const [clk,setClk]=useState(0);const [log,setLog]=useState([]);const [on,setOn]=useState(false);const [done,setDone]=useState(0);const ir=useRef(null);
  const step=useCallback(()=>{setClk(c=>c+1);const t=clk+1;const ev=[];
    if(Math.random()<0.3){setInput(i=>i+1);ev.push({t:t+"",m:"📥 New job arrived",c:T.blue})}
    if(input>0){setInput(i=>i-1);setQA(a=>a+1);setQB(b=>b+1);ev.push({t:t+"",m:"🔀 Job SPLIT → Task A + Task B (in parallel!)",c:T.purple})}
    if(bA&&Math.random()<0.4){setBA(false);setJA(j=>j+1);ev.push({t:t+"",m:"✅ Task A complete → waiting at join",c:T.green})}
    if(bB&&Math.random()<0.3){setBB(false);setJB(j=>j+1);ev.push({t:t+"",m:"✅ Task B complete → waiting at join",c:T.green})}
    if(!bA&&qA>0){setBA(true);setQA(a=>a-1);ev.push({t:t+"",m:"⚙️ Worker A started",c:T.amber})}
    if(!bB&&qB>0){setBB(true);setQB(b=>b-1);ev.push({t:t+"",m:"⚙️ Worker B started",c:T.amber})}
    if(jA>0&&jB>0){setJA(j=>j-1);setJB(j=>j-1);setDone(d=>d+1);ev.push({t:t+"",m:"🎉 JOINED! Both tasks done → job complete!",c:T.teal})}
    if(ev.length)setLog(l=>[...l,...ev].slice(-40));
  },[clk,input,qA,qB,bA,bB,jA,jB]);
  useEffect(()=>{if(on)ir.current=setInterval(step,600);else clearInterval(ir.current);return()=>clearInterval(ir.current)},[on,step]);
  const reset=()=>{setOn(false);setClk(0);setLog([]);setInput(0);setQA(0);setQB(0);setBA(false);setBB(false);setJA(0);setJB(0);setDone(0)};

  return <div>
    <Tip><strong>How it works:</strong> Each job is SPLIT into 2 tasks (A and B) that run at the same time in parallel. The job is only done when BOTH tasks finish and rejoin. The slower task determines the total time — like waiting for the slowest person in a group!</Tip>
    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="⏱" label="Time" value={clk}/></Panel>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="🎉" label="Done" value={done} color={T.green}/></Panel>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="⏳" label="Waiting" value={Math.abs(jA-jB)} color={Math.abs(jA-jB)>2?T.red:T.dim}/></Panel>
    </div>
    <Panel style={{marginBottom:14,padding:16}}>
      <div style={{display:"grid",gridTemplateColumns:"60px 1fr 60px 1fr 60px",gap:6,alignItems:"center"}}>
        <div style={{textAlign:"center"}}><div style={{fontSize:18}}>📥</div><div style={{fontSize:9,color:T.dim}}>{input}</div></div>
        <div>
          <div style={{padding:8,borderRadius:8,background:bA?T.amberDim:T.panel,border:`1px solid ${T.border}`,textAlign:"center",marginBottom:4}}>
            <span style={{fontSize:14}}>👷 A</span>{bA?<Badge color={T.amber}>Working</Badge>:<Badge color={T.dim}>{qA} queued</Badge>}
          </div>
          <div style={{padding:8,borderRadius:8,background:bB?T.amberDim:T.panel,border:`1px solid ${T.border}`,textAlign:"center"}}>
            <span style={{fontSize:14}}>👷 B</span>{bB?<Badge color={T.amber}>Working</Badge>:<Badge color={T.dim}>{qB} queued</Badge>}
          </div>
        </div>
        <div style={{textAlign:"center",fontSize:11,color:T.dim}}>🔀<br/>SPLIT<br/>→<br/>JOIN<br/>🔗</div>
        <div style={{textAlign:"center",padding:10,borderRadius:10,background:T.panel,border:`1px solid ${T.border}`}}>
          <div style={{fontSize:10,color:T.sub}}>Join Buffer</div>
          <div style={{fontSize:10,color:T.green}}>A ready: {jA}</div>
          <div style={{fontSize:10,color:T.blue}}>B ready: {jB}</div>
          {jA>0&&jB>0&&<Badge color={T.teal}>✅ Match!</Badge>}
        </div>
        <div style={{textAlign:"center"}}><div style={{fontSize:18}}>🎉</div><div style={{fontSize:12,fontWeight:700,color:T.green}}>{done}</div></div>
      </div>
    </Panel>
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      <Btn onClick={()=>setOn(!on)} on={on} color={on?T.amber:T.green} big>{on?"⏸ Pause":"▶ Run"}</Btn>
      <Btn onClick={step}>⏭</Btn><Btn onClick={reset}>🔄</Btn>
    </div>
    <Log items={log}/>
  </div>;
}

function Priority(){
  const [hiQ,setHiQ]=useState(0);const [loQ,setLoQ]=useState(0);const [serving,setServing]=useState(null);
  const [clk,setClk]=useState(0);const [log,setLog]=useState([]);const [on,setOn]=useState(false);
  const [hiDone,setHiDone]=useState(0);const [loDone,setLoDone]=useState(0);const [preempts,setPreempts]=useState(0);
  const [preemptive,setPreemptive]=useState(true);const ir=useRef(null);

  const step=useCallback(()=>{setClk(c=>c+1);const t=clk+1;const ev=[];
    if(Math.random()<0.2){setHiQ(q=>q+1);ev.push({t:t+"",m:"🔴 VIP customer arrived!",c:T.red});
      if(preemptive&&serving==="lo"){setServing("hi");setHiQ(q=>Math.max(0,q));setLoQ(q=>q+1);setPreempts(p=>p+1);
        ev.push({t:t+"",m:"⚡ PREEMPT! Regular customer bumped — VIP served first!",c:T.red})}}
    if(Math.random()<0.4){setLoQ(q=>q+1);ev.push({t:t+"",m:"🔵 Regular customer arrived",c:T.blue})}
    if(serving&&Math.random()<0.4){if(serving==="hi"){setHiDone(d=>d+1);ev.push({t:t+"",m:"✅ VIP customer served!",c:T.green})}
      else{setLoDone(d=>d+1);ev.push({t:t+"",m:"✅ Regular customer served",c:T.green})}setServing(null)}
    if(!serving){if(hiQ>0){setServing("hi");setHiQ(q=>q-1);ev.push({t:t+"",m:"🔔 VIP customer → counter (priority!)",c:T.amber})}
      else if(loQ>0){setServing("lo");setLoQ(q=>q-1);ev.push({t:t+"",m:"🔔 Regular customer → counter",c:T.amber})}}
    if(ev.length)setLog(l=>[...l,...ev].slice(-40));
  },[clk,hiQ,loQ,serving,preemptive]);
  useEffect(()=>{if(on)ir.current=setInterval(step,600);else clearInterval(ir.current);return()=>clearInterval(ir.current)},[on,step]);
  const reset=()=>{setOn(false);setClk(0);setLog([]);setHiQ(0);setLoQ(0);setServing(null);setHiDone(0);setLoDone(0);setPreempts(0)};

  return <div>
    <Tip><strong>How it works:</strong> Two types of customers: 🔴 VIP (high priority) and 🔵 Regular (low priority). VIPs always get served first — even if regular customers arrived earlier! In preemptive mode, a VIP can even interrupt a regular customer's service.</Tip>
    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="⏱" label="Time" value={clk}/></Panel>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="🔴" label="VIP served" value={hiDone} color={T.red}/></Panel>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="🔵" label="Reg served" value={loDone} color={T.blue}/></Panel>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="⚡" label="Preempts" value={preempts} color={preempts>0?T.purple:T.dim}/></Panel>
    </div>
    <Panel style={{marginBottom:14,padding:16}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:12,alignItems:"center"}}>
        <div>
          <div style={{fontSize:11,color:T.red,fontWeight:600,marginBottom:4}}>🔴 VIP Queue ({hiQ})</div>
          <PersonQ count={hiQ} max={8} color={T.red}/>
          <div style={{fontSize:11,color:T.blue,fontWeight:600,marginTop:8,marginBottom:4}}>🔵 Regular Queue ({loQ})</div>
          <PersonQ count={loQ} max={8}/>
        </div>
        <div style={{fontSize:18,color:T.dim}}>→</div>
        <div style={{textAlign:"center",padding:14,borderRadius:12,
          background:serving==="hi"?T.redDim:serving==="lo"?T.blueDim:T.greenDim,
          border:`1px solid ${serving?T.amber+"40":T.green+"40"}`}}>
          <div style={{fontSize:28}}>{serving==="hi"?"🔴":serving==="lo"?"🔵":"😴"}</div>
          <div style={{fontSize:11,fontWeight:600,color:serving?T.amber:T.green,marginTop:4}}>
            {serving==="hi"?"Serving VIP":serving==="lo"?"Serving Regular":"Counter Free"}
          </div>
        </div>
      </div>
    </Panel>
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      <Btn onClick={()=>{setPreemptive(p=>!p);reset()}} on color={preemptive?T.purple:T.blue}>{preemptive?"⚡ Preemptive":"📋 Non-Preemptive"}</Btn>
      <Btn onClick={()=>setOn(!on)} on={on} color={on?T.amber:T.green} big>{on?"⏸ Pause":"▶ Run"}</Btn>
      <Btn onClick={step}>⏭</Btn><Btn onClick={reset}>🔄</Btn>
    </div>
    <Log items={log}/>
  </div>;
}

const TABS=[{k:"mm1",t:"🏪 Single Counter",c:MM1},{k:"mmc",t:"🏦 3 Counters",c:MMc},{k:"tandem",t:"🏭 Assembly Line",c:Tandem},{k:"fj",t:"🔀 Split & Join",c:ForkJoin},{k:"pri",t:"⭐ VIP Priority",c:Priority}];
export default function App(){const[tab,setTab]=useState("mm1");const S=TABS.find(t=>t.k===tab);const C=S.c;
return <div style={{background:T.bg,minHeight:"100vh",padding:"16px 12px",fontFamily:"'DM Sans',system-ui,sans-serif",color:T.text}}>
<div style={{maxWidth:760,margin:"0 auto"}}><div style={{textAlign:"center",marginBottom:16}}><h1 style={{fontSize:20,fontWeight:700,margin:0}}>👥 Queue Simulator</h1><p style={{fontSize:12,color:T.sub,margin:"4px 0 0"}}>See how waiting lines work — from simple queues to complex systems</p></div>
<div style={{display:"flex",gap:0,marginBottom:18,background:T.panel,borderRadius:10,padding:3,border:"1px solid "+T.border}}>{TABS.map(t=><button key={t.k} onClick={()=>setTab(t.k)} style={{flex:"1 1 0",padding:"8px 4px",fontSize:11,fontWeight:tab===t.k?600:400,background:tab===t.k?T.card:"transparent",color:tab===t.k?T.text:T.dim,border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s",minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.t}</button>)}</div>
<C/></div></div>}
