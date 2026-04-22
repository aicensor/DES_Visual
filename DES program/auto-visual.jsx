import { useState, useEffect, useRef, useCallback } from "react";
const T={bg:"#0B0E14",panel:"#131720",card:"#1A1F2E",border:"rgba(255,255,255,0.06)",text:"#E2E8F0",sub:"#8892A8",dim:"#4A5568",blue:"#60A5FA",blueDim:"rgba(96,165,250,0.15)",green:"#34D399",greenDim:"rgba(52,211,153,0.12)",amber:"#FBBF24",amberDim:"rgba(251,191,36,0.12)",red:"#F87171",redDim:"rgba(248,113,113,0.12)",teal:"#2DD4BF",purple:"#A78BFA"};
function Panel({children,glow,style}){return <div style={{background:T.card,border:`1px solid ${glow||T.border}`,borderRadius:12,padding:14,boxShadow:glow?`0 0 20px ${glow}`:"none",transition:"all 0.3s",...style}}>{children}</div>}
function Badge({children,color}){return <span style={{display:"inline-block",fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:6,background:(color||T.blue)+"18",color:color||T.blue}}>{children}</span>}
function Bar({value,max,color,h}){return <div style={{height:h||6,background:T.panel,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:Math.min(100,Math.max(0,(value/(max||1))*100))+"%",background:color||T.blue,borderRadius:99,transition:"width 0.4s"}}/></div>}
function Num({value,label,icon,color}){return <div style={{textAlign:"center"}}><div style={{fontSize:10,color:T.dim,marginBottom:2}}>{icon} {label}</div><div style={{fontSize:22,fontWeight:700,color:color||T.text,lineHeight:1}}>{value}</div></div>}
function Btn({children,onClick,on,color,big}){return <button onClick={onClick} style={{background:on?(color||T.blue)+"22":"transparent",border:`1px solid ${on?(color||T.blue)+"55":T.border}`,borderRadius:8,padding:big?"8px 20px":"6px 12px",fontSize:big?13:11,fontWeight:500,color:on?(color||T.blue):T.sub,cursor:"pointer",transition:"all 0.2s",fontFamily:"inherit"}}>{children}</button>}
function Log({items}){const ref=useRef(null);useEffect(()=>{if(ref.current)ref.current.scrollTop=ref.current.scrollHeight},[items]);return <div ref={ref} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 12px",maxHeight:160,overflowY:"auto",fontSize:11,lineHeight:1.8,marginTop:10,fontFamily:"'SF Mono',Consolas,monospace"}}>{items.length===0&&<span style={{color:T.dim}}>Waiting...</span>}{items.slice(-20).map((e,i)=><div key={i}><span style={{color:T.dim,opacity:.5}}>[{e.t}]</span>{" "}<span style={{color:e.c||T.sub}}>{e.m}</span></div>)}</div>}
function Tip({children}){return <div style={{background:T.blueDim,border:"1px solid rgba(96,165,250,0.15)",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:12.5,lineHeight:1.6,color:"#93C5FD"}}>{children}</div>}

function Elevator(){
  const [state,setState]=useState("idle");const [sup,setSup]=useState(true);
  const [clk,setClk]=useState(0);const [log,setLog]=useState([]);const [on,setOn]=useState(false);const [danger,setDanger]=useState(false);const ir=useRef(null);
  const icons={idle:"🛗💤",open:"🛗🚪",moving:"🛗⬆️",arrived:"🛗✅",danger:"🛗💥"};
  const step=useCallback(()=>{setClk(c=>c+1);const t=clk+1;const ev=[];
    if(state==="idle"){const r=Math.random();if(r<0.4){setState("open");ev.push({t:t+"",m:"🚪 Door opened (elevator stopped — safe)",c:T.green})}else if(r<0.8){setState("moving");ev.push({t:t+"",m:"⬆️ Elevator moving to next floor",c:T.blue})}}
    else if(state==="open"){setState("idle");ev.push({t:t+"",m:"🚪 Door closed",c:T.teal})}
    else if(state==="moving"){if(Math.random()<0.15&&!sup){setState("danger");setDanger(true);setOn(false);ev.push({t:t+"",m:"💥 DANGER! Door opened while moving! (no supervisor)",c:T.red})}
      else if(Math.random()<0.4){setState("arrived");ev.push({t:t+"",m:"✅ Arrived at floor (door can now open)",c:T.green})}
      else{ev.push({t:t+"",m:"⬆️ Still moving... (door LOCKED by supervisor)",c:T.amber})}}
    else if(state==="arrived"){if(Math.random()<0.5){setState("open");ev.push({t:t+"",m:"🚪 Door opened at floor (safe — elevator stopped)",c:T.green})}else{setState("moving");ev.push({t:t+"",m:"⬆️ Continuing to next floor",c:T.blue})}}
    if(ev.length)setLog(l=>[...l,...ev].slice(-40));
  },[clk,state,sup]);
  useEffect(()=>{if(on)ir.current=setInterval(step,800);else clearInterval(ir.current);return()=>clearInterval(ir.current)},[on,step]);
  const reset=()=>{setOn(false);setClk(0);setLog([]);setState("idle");setDanger(false)};
  const stColor=state==="danger"?T.red:state==="moving"?T.amber:state==="open"?T.green:T.dim;

  return <div>
    <Tip><strong>How it works:</strong> An elevator must NEVER open its door while moving (people could fall!). The supervisor blocks the "open door" command when the elevator is in motion. Try disabling the supervisor to see what happens!</Tip>
    {danger&&<div style={{background:T.redDim,border:`1px solid ${T.red}40`,borderRadius:10,padding:"10px 14px",marginBottom:14,color:T.red,fontSize:12}}>💥 <strong>SAFETY VIOLATION!</strong> Door opened during movement! The supervisor would have prevented this.</div>}
    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="⏱" label="Time" value={clk}/></Panel>
      <Panel style={{flex:1,padding:10,textAlign:"center"}} glow={stColor+"20"}><div style={{fontSize:36}}>{icons[state]}</div><div style={{fontSize:11,fontWeight:600,color:stColor,marginTop:4}}>{state.toUpperCase()}</div></Panel>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="🛡️" label="Supervisor" value={sup?"ON":"OFF"} color={sup?T.green:T.red}/></Panel>
    </div>
    {/* State diagram */}
    <Panel style={{marginBottom:14,padding:16}}>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center"}}>
        {[{s:"idle",l:"Idle",i:"💤",d:"Stopped, closed"},{s:"open",l:"Door Open",i:"🚪",d:"Stopped, open"},{s:"moving",l:"Moving",i:"⬆️",d:"In motion"},{s:"arrived",l:"Arrived",i:"✅",d:"At floor"}].map(x=>
          <div key={x.s} style={{flex:"1 1 80px",maxWidth:120,textAlign:"center",padding:10,borderRadius:10,
            background:state===x.s?T.amberDim:T.panel,border:`1.5px solid ${state===x.s?T.amber+"60":T.border}`,
            boxShadow:state===x.s?`0 0 15px ${T.amber}15`:"none",transition:"all 0.3s"}}>
            <div style={{fontSize:24}}>{x.i}</div>
            <div style={{fontSize:10,fontWeight:600,color:state===x.s?T.amber:T.sub,marginTop:2}}>{x.l}</div>
            <div style={{fontSize:8,color:T.dim}}>{x.d}</div>
          </div>
        )}
      </div>
      {state==="moving"&&sup&&<div style={{textAlign:"center",marginTop:8,fontSize:11,color:T.purple}}>🔒 Door LOCKED by supervisor (elevator moving)</div>}
    </Panel>
    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
      <Btn onClick={()=>{setSup(s=>!s);reset()}} on color={sup?T.green:T.red}>{sup?"🛡️ Supervisor ON":"⚠️ Supervisor OFF"}</Btn>
      <Btn onClick={()=>setOn(!on)} on={on} color={on?T.amber:T.green} big>{on?"⏸ Pause":"▶ Run"}</Btn>
      <Btn onClick={step}>⏭</Btn><Btn onClick={reset}>🔄</Btn>
    </div>
    <Log items={log}/>
  </div>;
}

function CNC(){
  const [s1,setS1]=useState("idle");const [s2,setS2]=useState("idle");const [magHolder,setMagHolder]=useState(null);
  const [clk,setClk]=useState(0);const [log,setLog]=useState([]);const [on,setOn]=useState(false);const [j1,setJ1]=useState(0);const [j2,setJ2]=useState(0);const ir=useRef(null);
  const step=useCallback(()=>{setClk(c=>c+1);const t=clk+1;const ev=[];
    if(s1==="idle"&&Math.random()<0.4){setS1("waiting");ev.push({t:t+"",m:"🔵 Spindle 1 needs tool change",c:T.blue})}
    if(s2==="idle"&&Math.random()<0.4){setS2("waiting");ev.push({t:t+"",m:"🟠 Spindle 2 needs tool change",c:T.amber})}
    if(s1==="waiting"&&!magHolder){setS1("active");setMagHolder("s1");ev.push({t:t+"",m:"🔵 Spindle 1 acquired magazine",c:T.green})}
    if(s2==="waiting"&&!magHolder){setS2("active");setMagHolder("s2");ev.push({t:t+"",m:"🟠 Spindle 2 acquired magazine",c:T.green})}
    if(s2==="waiting"&&magHolder==="s1"){ev.push({t:t+"",m:"🟠 Spindle 2 BLOCKED (magazine held by S1)",c:T.red})}
    if(s1==="waiting"&&magHolder==="s2"){ev.push({t:t+"",m:"🔵 Spindle 1 BLOCKED (magazine held by S2)",c:T.red})}
    if(s1==="active"&&Math.random()<0.3){setS1("idle");setMagHolder(null);setJ1(j=>j+1);ev.push({t:t+"",m:"✅ Spindle 1 released magazine (job done!)",c:T.green})}
    if(s2==="active"&&Math.random()<0.3){setS2("idle");setMagHolder(null);setJ2(j=>j+1);ev.push({t:t+"",m:"✅ Spindle 2 released magazine (job done!)",c:T.green})}
    if(ev.length)setLog(l=>[...l,...ev].slice(-40));
  },[clk,s1,s2,magHolder]);
  useEffect(()=>{if(on)ir.current=setInterval(step,700);else clearInterval(ir.current);return()=>clearInterval(ir.current)},[on,step]);
  const reset=()=>{setOn(false);setClk(0);setLog([]);setS1("idle");setS2("idle");setMagHolder(null);setJ1(0);setJ2(0)};

  return <div>
    <Tip><strong>How it works:</strong> Two spindles share ONE tool magazine. Only one spindle can use the magazine at a time. If both need it, one must wait. The supervisor ensures they never access it simultaneously (which would cause a crash).</Tip>
    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="⏱" label="Time" value={clk}/></Panel>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="🔵" label="S1 Jobs" value={j1} color={T.blue}/></Panel>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="🟠" label="S2 Jobs" value={j2} color={T.amber}/></Panel>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="📦" label="Magazine" value={magHolder?"S"+(magHolder==="s1"?"1":"2"):"Free"} color={magHolder?T.amber:T.green}/></Panel>
    </div>
    <Panel style={{marginBottom:14,padding:16}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:12,alignItems:"center"}}>
        <div style={{textAlign:"center",padding:12,borderRadius:10,background:s1==="active"?T.amberDim:s1==="waiting"?T.redDim:T.panel,border:`1px solid ${s1==="active"?T.amber+"40":T.border}`}}>
          <div style={{fontSize:28}}>🔵</div><div style={{fontSize:11,fontWeight:600,color:T.text}}>Spindle 1</div>
          <Badge color={s1==="active"?T.amber:s1==="waiting"?T.red:T.dim}>{s1==="active"?"Using magazine":s1==="waiting"?"Waiting...":"Idle"}</Badge>
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:32}}>📦</div><div style={{fontSize:10,color:magHolder?T.amber:T.green,fontWeight:600}}>Magazine</div>
          <div style={{fontSize:9,color:T.dim}}>{magHolder?"🔒 Locked":"✅ Free"}</div>
        </div>
        <div style={{textAlign:"center",padding:12,borderRadius:10,background:s2==="active"?T.amberDim:s2==="waiting"?T.redDim:T.panel,border:`1px solid ${s2==="active"?T.amber+"40":T.border}`}}>
          <div style={{fontSize:28}}>🟠</div><div style={{fontSize:11,fontWeight:600,color:T.text}}>Spindle 2</div>
          <Badge color={s2==="active"?T.amber:s2==="waiting"?T.red:T.dim}>{s2==="active"?"Using magazine":s2==="waiting"?"Waiting...":"Idle"}</Badge>
        </div>
      </div>
    </Panel>
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      <Btn onClick={()=>setOn(!on)} on={on} color={on?T.amber:T.green} big>{on?"⏸ Pause":"▶ Run"}</Btn>
      <Btn onClick={step}>⏭</Btn><Btn onClick={reset}>🔄</Btn>
    </div>
    <Log items={log}/>
  </div>;
}

function Conveyor(){
  const [binA,setBinA]=useState(0);const [binB,setBinB]=useState(0);const CAP=5;
  const [clk,setClk]=useState(0);const [log,setLog]=useState([]);const [on,setOn]=useState(false);const [lost,setLost]=useState(0);const [sorted,setSorted]=useState(0);const ir=useRef(null);
  const step=useCallback(()=>{setClk(c=>c+1);const t=clk+1;const ev=[];
    if(Math.random()<0.5){
      if(binA<CAP&&binA<=binB){setBinA(a=>a+1);setSorted(s=>s+1);ev.push({t:t+"",m:"📦 Item → Bin A ("+((binA+1))+"/"+CAP+")",c:T.blue})}
      else if(binB<CAP){setBinB(b=>b+1);setSorted(s=>s+1);ev.push({t:t+"",m:"📦 Item → Bin B ("+((binB+1))+"/"+CAP+")",c:T.purple})}
      else{setLost(l=>l+1);ev.push({t:t+"",m:"🔴 OVERFLOW! Both bins full — item lost!",c:T.red})}
    }
    if(binA>=CAP&&Math.random()<0.3){setBinA(0);ev.push({t:t+"",m:"🔄 Bin A emptied (flushed downstream)",c:T.green})}
    if(binB>=CAP&&Math.random()<0.3){setBinB(0);ev.push({t:t+"",m:"🔄 Bin B emptied",c:T.green})}
    if(ev.length)setLog(l=>[...l,...ev].slice(-40));
  },[clk,binA,binB]);
  useEffect(()=>{if(on)ir.current=setInterval(step,500);else clearInterval(ir.current);return()=>clearInterval(ir.current)},[on,step]);
  const reset=()=>{setOn(false);setClk(0);setLog([]);setBinA(0);setBinB(0);setLost(0);setSorted(0)};

  return <div>
    <Tip><strong>How it works:</strong> Items arrive on a conveyor belt and must be sorted into two bins. The supervisor routes each item to whichever bin has more space. But items arrive faster than bins can empty — when BOTH bins are full, items overflow and are lost! This shows the limit of control.</Tip>
    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="⏱" label="Time" value={clk}/></Panel>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="✅" label="Sorted" value={sorted} color={T.green}/></Panel>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="🔴" label="Lost" value={lost} color={lost>0?T.red:T.dim}/></Panel>
    </div>
    <Panel style={{marginBottom:14,padding:16}}>
      <div style={{display:"flex",gap:16,justifyContent:"center",alignItems:"flex-end"}}>
        {[["Bin A",binA,T.blue],["Bin B",binB,T.purple]].map(([name,count,color])=>
          <div key={name} style={{textAlign:"center",flex:1,maxWidth:120}}>
            <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:6}}>{name}</div>
            <div style={{height:100,background:T.panel,borderRadius:10,border:`1px solid ${count>=CAP?T.red+"60":T.border}`,display:"flex",flexDirection:"column",justifyContent:"flex-end",overflow:"hidden"}}>
              <div style={{height:(count/CAP*100)+"%",background:count>=CAP?T.red+"60":color+"40",transition:"height 0.3s",borderRadius:"0 0 8px 8px"}}/>
            </div>
            <div style={{fontSize:18,fontWeight:700,color:count>=CAP?T.red:color,marginTop:4}}>{count}/{CAP}</div>
            {count>=CAP&&<Badge color={T.red}>FULL!</Badge>}
          </div>
        )}
      </div>
    </Panel>
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      <Btn onClick={()=>setOn(!on)} on={on} color={on?T.amber:T.green} big>{on?"⏸ Pause":"▶ Run"}</Btn>
      <Btn onClick={step}>⏭</Btn><Btn onClick={reset}>🔄</Btn>
    </div>
    <Log items={log}/>
  </div>;
}

function WaterTreatment(){
  const stages=["Empty","Filling","Dosing","Mixing","Draining"];const icons=["🪣","🚰","💊","🌀","🚿"];
  const [stage,setStage]=useState(0);const [alarm,setAlarm]=useState(false);
  const [clk,setClk]=useState(0);const [log,setLog]=useState([]);const [on,setOn]=useState(false);const [batches,setBatches]=useState(0);const [alarms,setAlarms]=useState(0);const ir=useRef(null);
  const step=useCallback(()=>{setClk(c=>c+1);const t=clk+1;const ev=[];
    if(alarm){setAlarm(false);setStage(0);ev.push({t:t+"",m:"🚿 Emergency drain complete — system safe",c:T.green})}
    else if((stage===2||stage===3)&&Math.random()<0.08){setAlarm(true);setAlarms(a=>a+1);ev.push({t:t+"",m:"🚨 CHEMICAL ALARM! Emergency drain activated!",c:T.red})}
    else{const next=(stage+1)%5;setStage(next);if(next===0){setBatches(b=>b+1);ev.push({t:t+"",m:"✅ Batch complete! Clean water produced.",c:T.green})}
      else{ev.push({t:t+"",m:`${icons[next]} Stage → ${stages[next]}`,c:T.amber})}}
    if(ev.length)setLog(l=>[...l,...ev].slice(-40));
  },[clk,stage,alarm]);
  useEffect(()=>{if(on)ir.current=setInterval(step,900);else clearInterval(ir.current);return()=>clearInterval(ir.current)},[on,step]);
  const reset=()=>{setOn(false);setClk(0);setLog([]);setStage(0);setBatches(0);setAlarms(0);setAlarm(false)};

  return <div>
    <Tip><strong>How it works:</strong> Water treatment follows a strict sequence: Fill → Dose chemicals → Mix → Drain. If a chemical fault is detected (alarm!), the supervisor forces an emergency drain immediately — skipping all other steps. This prevents contaminated water from being released.</Tip>
    {alarm&&<div style={{background:T.redDim,border:`1px solid ${T.red}40`,borderRadius:10,padding:10,marginBottom:14,color:T.red,fontSize:12}}>🚨 <strong>ALARM!</strong> Chemical fault detected — emergency drain in progress!</div>}
    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="⏱" label="Time" value={clk}/></Panel>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="✅" label="Batches" value={batches} color={T.green}/></Panel>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="🚨" label="Alarms" value={alarms} color={alarms>0?T.red:T.dim}/></Panel>
    </div>
    <Panel style={{marginBottom:14,padding:16}}>
      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
        {stages.map((s,i)=>{const active=stage===i&&!alarm;return <div key={i} style={{flex:"1 1 55px",textAlign:"center",padding:"10px 4px",borderRadius:10,background:active?T.amberDim:alarm&&i===4?T.redDim:T.panel,border:`1px solid ${active?T.amber+"50":T.border}`,transition:"all 0.3s"}}>
          <div style={{fontSize:22}}>{icons[i]}</div><div style={{fontSize:9,fontWeight:600,color:active?T.amber:T.dim,marginTop:2}}>{s}</div>
          {active&&<Badge color={T.amber}>Active</Badge>}
        </div>})}
      </div>
      <Bar value={alarm?5:stage} max={5} color={alarm?T.red:T.amber} h={4}/>
    </Panel>
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      <Btn onClick={()=>setOn(!on)} on={on} color={on?T.amber:T.green} big>{on?"⏸ Pause":"▶ Run"}</Btn>
      <Btn onClick={step}>⏭</Btn><Btn onClick={reset}>🔄</Btn>
    </div>
    <Log items={log}/>
  </div>;
}

function PowerGrid(){
  const [gen,setGen]=useState(3);const [load,setLoad]=useState(2);
  const [clk,setClk]=useState(0);const [log,setLog]=useState([]);const [on,setOn]=useState(false);const [sheds,setSheds]=useState(0);const ir=useRef(null);
  const margin=gen-load;
  const step=useCallback(()=>{setClk(c=>c+1);const t=clk+1;const ev=[];
    if(Math.random()<0.25){const d=Math.random()<0.5?1:-1;const ng=Math.max(1,Math.min(5,gen+d));if(ng!==gen){setGen(ng);ev.push({t:t+"",m:d>0?"☀️ Generation UP → "+ng:"🌥️ Generation DOWN → "+ng,c:d>0?T.green:T.red})}}
    if(gen<load){setLoad(l=>Math.max(1,l-2));setSheds(s=>s+1);ev.push({t:t+"",m:"⚡ EMERGENCY SHED! Load reduced (generation too low)",c:T.red})}
    else if(Math.random()<0.3){const s1ok=load+1<=gen+1;const s2ok=load+1<=4;
      if(s1ok&&s2ok&&load<5){setLoad(l=>l+1);ev.push({t:t+"",m:"✅ Load connected (both supervisors agree: S1✓ S2✓)",c:T.green})}
      else if(load<5){ev.push({t:t+"",m:`🚫 Load BLOCKED (${!s1ok?"S1:freq limit":""}${!s1ok&&!s2ok?" + ":""}${!s2ok?"S2:volt limit":""})`,c:T.amber})}}
    if(ev.length)setLog(l=>[...l,...ev].slice(-40));
  },[clk,gen,load]);
  useEffect(()=>{if(on)ir.current=setInterval(step,600);else clearInterval(ir.current);return()=>clearInterval(ir.current)},[on,step]);
  const reset=()=>{setOn(false);setClk(0);setLog([]);setGen(3);setLoad(2);setSheds(0)};

  return <div>
    <Tip><strong>How it works:</strong> A power grid has 2 safety supervisors: S1 checks if there's enough generation (frequency), S2 checks voltage limits. BOTH must agree before connecting more load. If generation drops, load is automatically shed to prevent blackout. Generation changes (sun/wind) are uncontrollable!</Tip>
    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="⏱" label="Time" value={clk}/></Panel>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="⚡" label="Margin" value={(margin>=0?"+":"")+margin} color={margin>=0?T.green:T.red}/></Panel>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="🔴" label="Sheds" value={sheds} color={sheds>0?T.red:T.dim}/></Panel>
    </div>
    <Panel style={{marginBottom:14,padding:16}}>
      <div style={{display:"flex",gap:16,justifyContent:"center",alignItems:"flex-end"}}>
        <div style={{flex:1,textAlign:"center"}}>
          <div style={{fontSize:11,color:T.sub,marginBottom:4}}>⚡ Generation</div>
          <div style={{display:"flex",gap:3,justifyContent:"center",alignItems:"flex-end"}}>{Array.from({length:5}).map((_,i)=><div key={i} style={{width:20,height:14+i*8,borderRadius:3,background:i<gen?T.green+"80":T.panel,border:`1px solid ${i<gen?T.green+"40":T.border}`,transition:"all 0.3s"}}/>)}</div>
          <div style={{fontSize:18,fontWeight:700,color:T.green,marginTop:4}}>{gen}/5</div>
        </div>
        <div style={{fontSize:20,color:margin>=0?T.green:T.red,fontWeight:700}}>{margin>=0?"✅":"⚠️"}</div>
        <div style={{flex:1,textAlign:"center"}}>
          <div style={{fontSize:11,color:T.sub,marginBottom:4}}>🏢 Load</div>
          <div style={{display:"flex",gap:3,justifyContent:"center",alignItems:"flex-end"}}>{Array.from({length:5}).map((_,i)=><div key={i} style={{width:20,height:14+i*8,borderRadius:3,background:i<load?T.blue+"80":T.panel,border:`1px solid ${i<load?T.blue+"40":T.border}`,transition:"all 0.3s"}}/>)}</div>
          <div style={{fontSize:18,fontWeight:700,color:T.blue,marginTop:4}}>{load}/5</div>
        </div>
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:12}}>
        <Badge color={load<=gen+1?T.green:T.red}>S1 freq: {load<=gen+1?"✓":"✗"}</Badge>
        <Badge color={load<=4?T.green:T.red}>S2 volt: {load<=4?"✓":"✗"}</Badge>
      </div>
    </Panel>
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      <Btn onClick={()=>setOn(!on)} on={on} color={on?T.amber:T.green} big>{on?"⏸ Pause":"▶ Run"}</Btn>
      <Btn onClick={step}>⏭</Btn><Btn onClick={reset}>🔄</Btn>
    </div>
    <Log items={log}/>
  </div>;
}

const TABS=[{k:"elev",t:"🛗 Elevator",c:Elevator},{k:"cnc",t:"⚙️ CNC",c:CNC},{k:"conv",t:"📦 Conveyor",c:Conveyor},{k:"water",t:"💧 Water",c:WaterTreatment},{k:"grid",t:"⚡ Grid",c:PowerGrid}];
export default function App(){const[tab,setTab]=useState("elev");const S=TABS.find(t=>t.k===tab);const C=S.c;
return <div style={{background:T.bg,minHeight:"100vh",padding:"16px 12px",fontFamily:"'DM Sans',system-ui,sans-serif",color:T.text}}>
<div style={{maxWidth:760,margin:"0 auto"}}><div style={{textAlign:"center",marginBottom:16}}><h1 style={{fontSize:20,fontWeight:700,margin:0}}>🔒 Automata Supervisor Simulator</h1><p style={{fontSize:12,color:T.sub,margin:"4px 0 0"}}>See how supervisors keep systems safe by controlling events</p></div>
<div style={{display:"flex",gap:0,marginBottom:18,background:T.panel,borderRadius:10,padding:3,border:"1px solid "+T.border}}>{TABS.map(t=><button key={t.k} onClick={()=>setTab(t.k)} style={{flex:"1 1 0",padding:"8px 4px",fontSize:12,fontWeight:tab===t.k?600:400,background:tab===t.k?T.card:"transparent",color:tab===t.k?T.text:T.dim,border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s",minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.t}</button>)}</div>
<C/></div></div>}
