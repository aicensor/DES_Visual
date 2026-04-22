import { useState, useEffect, useRef, useCallback } from "react";
const T={bg:"#0B0E14",panel:"#131720",card:"#1A1F2E",cardHi:"#222839",border:"rgba(255,255,255,0.06)",text:"#E2E8F0",sub:"#8892A8",dim:"#4A5568",blue:"#60A5FA",blueDim:"rgba(96,165,250,0.15)",green:"#34D399",greenDim:"rgba(52,211,153,0.12)",amber:"#FBBF24",amberDim:"rgba(251,191,36,0.12)",red:"#F87171",redDim:"rgba(248,113,113,0.12)",teal:"#2DD4BF",purple:"#A78BFA"};
function Panel({children,glow,style}){return <div style={{background:T.card,border:`1px solid ${glow||T.border}`,borderRadius:12,padding:14,boxShadow:glow?`0 0 20px ${glow}`:"none",transition:"all 0.3s",...style}}>{children}</div>}
function Badge({children,color}){return <span style={{display:"inline-block",fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:6,background:(color||T.blue)+"18",color:color||T.blue}}>{children}</span>}
function Bar({value,max,color,h}){return <div style={{height:h||6,background:T.panel,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:Math.min(100,Math.max(0,(value/(max||1))*100))+"%",background:color||T.blue,borderRadius:99,transition:"width 0.4s"}}/></div>}
function Num({value,label,icon,color,unit}){return <div style={{textAlign:"center"}}><div style={{fontSize:10,color:T.dim,marginBottom:2}}>{icon} {label}</div><div style={{fontSize:22,fontWeight:700,color:color||T.text,lineHeight:1}}>{value}{unit&&<span style={{fontSize:10,fontWeight:400,color:T.dim,marginLeft:2}}>{unit}</span>}</div></div>}
function Btn({children,onClick,on,color,big}){return <button onClick={onClick} style={{background:on?(color||T.blue)+"22":"transparent",border:`1px solid ${on?(color||T.blue)+"55":T.border}`,borderRadius:8,padding:big?"8px 20px":"6px 12px",fontSize:big?13:11,fontWeight:500,color:on?(color||T.blue):T.sub,cursor:"pointer",transition:"all 0.2s",fontFamily:"inherit"}}>{children}</button>}
function Log({items}){const ref=useRef(null);useEffect(()=>{if(ref.current)ref.current.scrollTop=ref.current.scrollHeight},[items]);return <div ref={ref} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 12px",maxHeight:160,overflowY:"auto",fontSize:11,lineHeight:1.8,marginTop:10,fontFamily:"'SF Mono',Consolas,monospace"}}>{items.length===0&&<span style={{color:T.dim}}>Waiting for events...</span>}{items.slice(-20).map((e,i)=><div key={i}><span style={{color:T.dim,opacity:.5}}>[{e.t}]</span>{" "}<span style={{color:e.c||T.sub}}>{e.m}</span></div>)}</div>}
function Tip({children}){return <div style={{background:T.blueDim,border:"1px solid rgba(96,165,250,0.15)",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:12.5,lineHeight:1.6,color:"#93C5FD"}}>{children}</div>}

function Place({name,tokens,sup,active,icon}){
  const bg=sup?T.greenDim:active?T.amberDim:T.panel;const brd=sup?T.green+"40":active?T.amber+"40":T.border;
  return <div style={{background:bg,border:`1.5px solid ${brd}`,borderRadius:10,padding:"8px 6px",textAlign:"center",minWidth:60,transition:"all 0.3s",boxShadow:active?`0 0 12px ${T.amber}15`:"none"}}>
    <div style={{fontSize:16}}>{icon||"⚫"}</div>
    <div style={{fontSize:9,fontWeight:600,color:sup?T.green:T.text,marginTop:2}}>{name}</div>
    <div style={{fontSize:18,fontWeight:700,color:tokens>0?(sup?T.green:T.amber):T.dim,marginTop:2}}>{tokens}</div>
    <div style={{fontSize:8,color:T.dim}}>tokens</div>
  </div>;
}

// ═══ Sample 1: FMS Deadlock Avoidance ═══
function FMS(){
  const initM={p1:1,p2:0,p3:0,p4:1,p5:0,p6:0,pR:1,Ps:1};
  const [m,setM]=useState(initM);const [clk,setClk]=useState(0);const [log,setLog]=useState([]);
  const [on,setOn]=useState(false);const [sup,setSup]=useState(true);const [dead,setDead]=useState(false);const ir=useRef(null);
  const tDefs=[
    {id:"t1",label:"M1 start",pre:{p1:1},post:{p2:1},ic:"⚙️"},
    {id:"t2",label:"M1 use robot",pre:{p2:1,pR:1},post:{p3:1},ic:"🤖"},
    {id:"t3",label:"M1 release",pre:{p3:1},post:{p1:1,pR:1},ic:"✅"},
    {id:"t4",label:"M2 start",pre:{p4:1},post:{p5:1},ic:"⚙️"},
    {id:"t5",label:"M2 use robot",pre:sup?{p5:1,pR:1,Ps:1}:{p5:1,pR:1},post:sup?{p6:1}:{p6:1},ic:"🤖"},
    {id:"t6",label:"M2 release",pre:{p6:1},post:sup?{p4:1,pR:1,Ps:1}:{p4:1,pR:1},ic:"✅"},
  ];
  const canFire=(td)=>{for(const[p,w] of Object.entries(td.pre)){if((m[p]||0)<w)return false}return true};
  const fire=(td)=>{setM(prev=>{const nm={...prev};for(const[p,w] of Object.entries(td.pre))nm[p]=(nm[p]||0)-w;for(const[p,w] of Object.entries(td.post))nm[p]=(nm[p]||0)+w;return nm});setClk(c=>c+1);};
  const step=useCallback(()=>{
    const enabled=tDefs.filter(canFire);
    if(enabled.length===0){setDead(true);setOn(false);setLog(l=>[...l,{t:(clk+1)+"",m:"🔴 DEADLOCK! Both machines stuck — no transitions can fire!",c:T.red}]);return;}
    const td=enabled[Math.floor(Math.random()*enabled.length)];fire(td);
    setLog(l=>[...l,{t:(clk+1)+"",m:`${td.ic} ${td.label} (fire ${td.id})`,c:T.green}].slice(-40));
  },[m,clk,sup]);
  useEffect(()=>{if(on)ir.current=setInterval(step,800);else clearInterval(ir.current);return()=>clearInterval(ir.current)},[on,step]);
  const reset=()=>{setOn(false);setClk(0);setLog([]);setM(initM);setDead(false)};

  return <div>
    <Tip><strong>How it works:</strong> Two machines (M1 and M2) share one robot 🤖. Each machine needs the robot during its work cycle. Without a supervisor, both machines can grab partial resources and get stuck forever (deadlock). The supervisor token prevents this by limiting who can use the robot.</Tip>
    {dead&&<div style={{background:T.redDim,border:`1px solid ${T.red}40`,borderRadius:10,padding:"10px 14px",marginBottom:14,color:T.red,fontSize:12}}>🚨 <strong>DEADLOCK!</strong> Both machines are stuck waiting for the robot. Neither can proceed. {sup?"":"Enable the supervisor to prevent this!"}</div>}
    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="⏱" label="Steps" value={clk}/></Panel>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="🛡️" label="Supervisor" value={sup?"ON":"OFF"} color={sup?T.green:T.red}/></Panel>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="🤖" label="Robot" value={m.pR>0?"Free":"In Use"} color={m.pR>0?T.green:T.amber}/></Panel>
    </div>
    {/* Visual token state */}
    <Panel style={{marginBottom:14,padding:16}}>
      <div style={{fontSize:11,color:T.sub,marginBottom:10}}>Token State (each circle = resource or machine state)</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(70px,1fr))",gap:8}}>
        <Place name="M1 idle" tokens={m.p1} icon="💤" active={m.p1>0}/>
        <Place name="M1 working" tokens={m.p2} icon="⚙️" active={m.p2>0}/>
        <Place name="M1 + robot" tokens={m.p3} icon="🤖" active={m.p3>0}/>
        <Place name="M2 idle" tokens={m.p4} icon="💤" active={m.p4>0}/>
        <Place name="M2 working" tokens={m.p5} icon="⚙️" active={m.p5>0}/>
        <Place name="M2 + robot" tokens={m.p6} icon="🤖" active={m.p6>0}/>
        <Place name="Robot" tokens={m.pR} icon="🤖" active={m.pR>0}/>
        {sup&&<Place name="Supervisor" tokens={m.Ps} icon="🛡️" sup active={m.Ps>0}/>}
      </div>
    </Panel>
    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
      <Btn onClick={()=>{setSup(s=>!s);reset()}} on color={sup?T.green:T.red}>{sup?"🛡️ Supervisor ON":"⚠️ Supervisor OFF"}</Btn>
      <Btn onClick={()=>setOn(!on)} on={on} color={on?T.amber:T.green} big>{on?"⏸ Pause":"▶ Run"}</Btn>
      <Btn onClick={step}>⏭</Btn><Btn onClick={reset}>🔄</Btn>
    </div>
    <Log items={log}/>
  </div>;
}

// ═══ Sample 2: Chemical Batch ═══
function Chemical(){
  const stages=["Idle","Filling","Heating","Reacting","Cooling","Draining"];const icons=["💤","🚰","🔥","⚗️","❄️","🚿"];
  const [stage,setStage]=useState(0);const [clk,setClk]=useState(0);const [log,setLog]=useState([]);
  const [on,setOn]=useState(false);const [batches,setBatches]=useState(0);const ir=useRef(null);
  const step=useCallback(()=>{setClk(c=>c+1);const t=clk+1;
    setStage(prev=>{const next=(prev+1)%6;const ev=[];
      if(next===0){setBatches(b=>b+1);ev.push({t:t+"",m:"✅ Batch complete! Product discharged safely.",c:T.green})}
      else{ev.push({t:t+"",m:`${icons[next]} Stage → ${stages[next]}`,c:next===2?T.red:next===4?T.teal:T.amber})}
      if(ev.length)setLog(l=>[...l,...ev].slice(-40));return next;});
  },[clk]);
  useEffect(()=>{if(on)ir.current=setInterval(step,1000);else clearInterval(ir.current);return()=>clearInterval(ir.current)},[on,step]);
  const reset=()=>{setOn(false);setClk(0);setLog([]);setStage(0);setBatches(0)};

  return <div>
    <Tip><strong>How it works:</strong> A chemical reactor runs a fixed sequence: Fill tank → Heat → React → Cool → Drain. The supervisor ensures heating and draining NEVER happen at the same time (explosion risk!). Each step must complete before the next begins.</Tip>
    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="⏱" label="Time" value={clk}/></Panel>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="✅" label="Batches" value={batches} color={T.green}/></Panel>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon={icons[stage]} label="Current" value={stages[stage]} color={stage===2?T.red:stage===4?T.teal:T.amber}/></Panel>
    </div>
    {/* Visual pipeline */}
    <Panel style={{marginBottom:14,padding:16}}>
      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
        {stages.map((s,i)=>{const active=stage===i;const done=stage>i||(stage===0&&i===0&&batches>0);
          return <div key={i} style={{flex:"1 1 60px",textAlign:"center",padding:"12px 4px",borderRadius:10,
            background:active?T.amberDim:T.panel,border:`1px solid ${active?T.amber+"50":T.border}`,
            boxShadow:active?`0 0 15px ${T.amber}15`:"none",transition:"all 0.3s"}}>
            <div style={{fontSize:24}}>{icons[i]}</div>
            <div style={{fontSize:10,fontWeight:600,color:active?T.amber:done?T.green:T.dim,marginTop:4}}>{s}</div>
            {active&&<Badge color={T.amber}>Active</Badge>}
          </div>;
        })}
      </div>
      <div style={{marginTop:10}}><Bar value={stage} max={5} color={T.amber} h={4}/></div>
      <div style={{fontSize:10,color:T.dim,textAlign:"center",marginTop:4}}>Stage {stage+1} of 6</div>
    </Panel>
    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
      <Btn onClick={()=>setOn(!on)} on={on} color={on?T.amber:T.green} big>{on?"⏸ Pause":"▶ Run"}</Btn>
      <Btn onClick={step}>⏭</Btn><Btn onClick={reset}>🔄</Btn>
    </div>
    <Log items={log}/>
  </div>;
}

// ═══ Sample 3: AGV Zone Control ═══
function AGV(){
  const [aPos,setAPos]=useState("home");const [bPos,setBPos]=useState("home");
  const [clk,setClk]=useState(0);const [log,setLog]=useState([]);const [on,setOn]=useState(false);const ir=useRef(null);
  const [aC,setAC]=useState(0);const [bC,setBC]=useState(0);
  const zoneOccupied=aPos==="zone"||bPos==="zone";
  const step=useCallback(()=>{setClk(c=>c+1);const t=clk+1;const ev=[];
    // AGV-A logic
    if(aPos==="home"){if(!zoneOccupied&&Math.random()<0.4){setAPos("zone");ev.push({t:t+"",m:"🟢 AGV-A enters shared zone",c:T.green});}
    }else if(aPos==="zone"){if(Math.random()<0.3){setAPos("exit");ev.push({t:t+"",m:"🟢 AGV-A exits zone → delivery",c:T.teal});}
    }else{setAPos("home");setAC(c=>c+1);ev.push({t:t+"",m:"🟢 AGV-A returned home (cycle done)",c:T.green});}
    // AGV-B logic
    const zoneNow=aPos==="zone"||(aPos==="home"&&ev.some(e=>e.m.includes("enters")));
    if(bPos==="home"){if(!(aPos==="zone")&&Math.random()<0.4){setBPos("zone");ev.push({t:t+"",m:"🔵 AGV-B enters shared zone",c:T.blue});}
      else if(aPos==="zone"){ev.push({t:t+"",m:"🔵 AGV-B waiting (zone occupied by A)",c:T.amber});}
    }else if(bPos==="zone"){if(Math.random()<0.3){setBPos("exit");ev.push({t:t+"",m:"🔵 AGV-B exits zone → delivery",c:T.teal});}
    }else{setBPos("home");setBC(c=>c+1);ev.push({t:t+"",m:"🔵 AGV-B returned home",c:T.blue});}
    if(ev.length)setLog(l=>[...l,...ev].slice(-40));
  },[clk,aPos,bPos]);
  useEffect(()=>{if(on)ir.current=setInterval(step,700);else clearInterval(ir.current);return()=>clearInterval(ir.current)},[on,step]);
  const reset=()=>{setOn(false);setClk(0);setLog([]);setAPos("home");setBPos("home");setAC(0);setBC(0)};

  return <div>
    <Tip><strong>How it works:</strong> Two robots (AGV-A and AGV-B) drive around a warehouse. There's one narrow zone they both need to pass through, but only ONE can be in it at a time (or they'd crash!). A supervisor token controls access — when one robot is in the zone, the other must wait.</Tip>
    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="⏱" label="Time" value={clk}/></Panel>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="🟢" label="A trips" value={aC} color={T.green}/></Panel>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="🔵" label="B trips" value={bC} color={T.blue}/></Panel>
    </div>
    {/* Visual warehouse map */}
    <Panel style={{marginBottom:14,padding:16}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,textAlign:"center"}}>
        <div style={{background:aPos==="home"?T.greenDim:T.panel,border:`1px solid ${aPos==="home"?T.green+"40":T.border}`,borderRadius:10,padding:14}}>
          <div style={{fontSize:9,color:T.dim}}>🏠 HOME A</div>
          {aPos==="home"&&<div style={{fontSize:28,marginTop:4}}>🟢</div>}
        </div>
        <div style={{background:zoneOccupied?T.redDim:T.greenDim,border:`1px solid ${zoneOccupied?T.red+"40":T.green+"40"}`,borderRadius:10,padding:14}}>
          <div style={{fontSize:9,color:zoneOccupied?T.red:T.green}}>⚠️ SHARED ZONE</div>
          {aPos==="zone"&&<div style={{fontSize:28,marginTop:4}}>🟢</div>}
          {bPos==="zone"&&<div style={{fontSize:28,marginTop:4}}>🔵</div>}
          {!zoneOccupied&&<div style={{fontSize:9,color:T.green,marginTop:8}}>✅ Clear</div>}
          {zoneOccupied&&<div style={{fontSize:9,color:T.red,marginTop:4}}>🔒 Occupied</div>}
        </div>
        <div style={{background:bPos==="home"?T.blueDim:T.panel,border:`1px solid ${bPos==="home"?T.blue+"40":T.border}`,borderRadius:10,padding:14}}>
          <div style={{fontSize:9,color:T.dim}}>🏠 HOME B</div>
          {bPos==="home"&&<div style={{fontSize:28,marginTop:4}}>🔵</div>}
        </div>
        <div style={{background:aPos==="exit"?T.greenDim:T.panel,border:`1px solid ${T.border}`,borderRadius:10,padding:10}}>
          <div style={{fontSize:9,color:T.dim}}>📦 Exit A</div>
          {aPos==="exit"&&<div style={{fontSize:20}}>🟢</div>}
        </div>
        <div style={{fontSize:10,color:T.dim,display:"flex",alignItems:"center",justifyContent:"center"}}>← Zone →</div>
        <div style={{background:bPos==="exit"?T.blueDim:T.panel,border:`1px solid ${T.border}`,borderRadius:10,padding:10}}>
          <div style={{fontSize:9,color:T.dim}}>📦 Exit B</div>
          {bPos==="exit"&&<div style={{fontSize:20}}>🔵</div>}
        </div>
      </div>
    </Panel>
    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
      <Btn onClick={()=>setOn(!on)} on={on} color={on?T.amber:T.green} big>{on?"⏸ Pause":"▶ Run"}</Btn>
      <Btn onClick={step}>⏭</Btn><Btn onClick={reset}>🔄</Btn>
    </div>
    <Log items={log}/>
  </div>;
}

// ═══ Sample 4: Railway Interlocking ═══
function Railway(){
  const [aState,setAState]=useState("waiting");const [bState,setBState]=useState("waiting");
  const [clk,setClk]=useState(0);const [log,setLog]=useState([]);const [on,setOn]=useState(false);
  const [aTrips,setATrips]=useState(0);const [bTrips,setBTrips]=useState(0);const ir=useRef(null);
  const trackBusy=aState==="onTrack"||bState==="onTrack";
  const step=useCallback(()=>{setClk(c=>c+1);const t=clk+1;const ev=[];
    if(aState==="waiting"&&!trackBusy&&Math.random()<0.5){setAState("onTrack");ev.push({t:t+"",m:"🟢 Train A enters track section (signal green)",c:T.green})}
    else if(aState==="onTrack"&&Math.random()<0.3){setAState("clearing");ev.push({t:t+"",m:"🟢 Train A exiting track (clearing)",c:T.teal})}
    else if(aState==="clearing"){setAState("waiting");setATrips(c=>c+1);ev.push({t:t+"",m:"🟢 Train A cleared! Track free.",c:T.green})}
    if(bState==="waiting"){if(!trackBusy&&aState!=="onTrack"&&Math.random()<0.5){setBState("onTrack");ev.push({t:t+"",m:"🔵 Train B enters track (signal green)",c:T.blue})}
      else if(trackBusy){ev.push({t:t+"",m:"🔵 Train B waiting (track occupied)",c:T.amber})}}
    else if(bState==="onTrack"&&Math.random()<0.3){setBState("clearing");ev.push({t:t+"",m:"🔵 Train B exiting track",c:T.teal})}
    else if(bState==="clearing"){setBState("waiting");setBTrips(c=>c+1);ev.push({t:t+"",m:"🔵 Train B cleared!",c:T.blue})}
    if(ev.length)setLog(l=>[...l,...ev].slice(-40));
  },[clk,aState,bState]);
  useEffect(()=>{if(on)ir.current=setInterval(step,700);else clearInterval(ir.current);return()=>clearInterval(ir.current)},[on,step]);
  const reset=()=>{setOn(false);setClk(0);setLog([]);setAState("waiting");setBState("waiting");setATrips(0);setBTrips(0)};

  return <div>
    <Tip><strong>How it works:</strong> Two trains share a single track section. Only ONE train can be on the track at a time (otherwise they'd collide!). The interlocking system controls signals — a train can only enter when the signal is green (track clear). After passing, it must fully clear before the other train gets green.</Tip>
    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="⏱" label="Time" value={clk}/></Panel>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="🟢" label="A trips" value={aTrips} color={T.green}/></Panel>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="🔵" label="B trips" value={bTrips} color={T.blue}/></Panel>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="🚦" label="Track" value={trackBusy?"BUSY":"FREE"} color={trackBusy?T.red:T.green}/></Panel>
    </div>
    {/* Visual railway */}
    <Panel style={{marginBottom:14,padding:16}}>
      <div style={{display:"flex",alignItems:"center",gap:4}}>
        <div style={{flex:1,textAlign:"center",padding:10,background:aState!=="waiting"?T.panel:T.greenDim,borderRadius:10,border:`1px solid ${T.border}`}}>
          <div style={{fontSize:9,color:T.dim}}>🟢 Train A</div>
          {aState==="waiting"&&<div style={{fontSize:24,marginTop:4}}>🚂</div>}
          {aState==="waiting"&&<div style={{fontSize:9,color:T.amber,marginTop:2}}>Waiting</div>}
        </div>
        <div style={{fontSize:14,color:T.dim}}>→</div>
        <div style={{flex:2,textAlign:"center",padding:12,background:trackBusy?T.redDim:T.greenDim,borderRadius:10,border:`1px solid ${trackBusy?T.red+"40":T.green+"40"}`}}>
          <div style={{fontSize:9,color:trackBusy?T.red:T.green}}>🛤️ SHARED TRACK SECTION</div>
          {aState==="onTrack"&&<div style={{fontSize:24,marginTop:4}}>🚂🟢</div>}
          {aState==="clearing"&&<div style={{fontSize:20,marginTop:4,color:T.teal}}>🟢→</div>}
          {bState==="onTrack"&&<div style={{fontSize:24,marginTop:4}}>🔵🚂</div>}
          {bState==="clearing"&&<div style={{fontSize:20,marginTop:4,color:T.teal}}>←🔵</div>}
          {!trackBusy&&<div style={{fontSize:11,color:T.green,marginTop:6}}>✅ Track clear</div>}
        </div>
        <div style={{fontSize:14,color:T.dim}}>←</div>
        <div style={{flex:1,textAlign:"center",padding:10,background:bState!=="waiting"?T.panel:T.blueDim,borderRadius:10,border:`1px solid ${T.border}`}}>
          <div style={{fontSize:9,color:T.dim}}>🔵 Train B</div>
          {bState==="waiting"&&<div style={{fontSize:24,marginTop:4}}>🚂</div>}
          {bState==="waiting"&&<div style={{fontSize:9,color:T.amber,marginTop:2}}>Waiting</div>}
        </div>
      </div>
    </Panel>
    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
      <Btn onClick={()=>setOn(!on)} on={on} color={on?T.amber:T.green} big>{on?"⏸ Pause":"▶ Run"}</Btn>
      <Btn onClick={step}>⏭</Btn><Btn onClick={reset}>🔄</Btn>
    </div>
    <Log items={log}/>
  </div>;
}

// ═══ Sample 5: Microgrid ═══
function Microgrid(){
  const [solar,setSolar]=useState(false);const [batCap,setBatCap]=useState(3);
  const [batState,setBatState]=useState("idle");const [gridOn,setGridOn]=useState(false);
  const [clk,setClk]=useState(0);const [log,setLog]=useState([]);const [on,setOn]=useState(false);const [served,setServed]=useState(0);const ir=useRef(null);

  const step=useCallback(()=>{setClk(c=>c+1);const t=clk+1;const ev=[];
    // Solar (uncontrollable)
    if(Math.random()<0.15){const ns=!solar;setSolar(ns);ev.push({t:t+"",m:ns?"☀️ Solar ON (sun came out)":"🌥️ Solar OFF (clouds)",c:ns?T.amber:T.dim})}
    // Battery charge when solar on
    if(solar&&batState==="idle"&&batCap<5&&Math.random()<0.3){setBatState("charging");ev.push({t:t+"",m:"🔋 Battery charging from solar",c:T.green})}
    if(batState==="charging"){setBatCap(c=>{if(c>=5){setBatState("idle");ev.push({t:t+"",m:"🔋 Battery full!",c:T.green});return 5}return c+1});if(batCap<5)ev.push({t:t+"",m:`🔋 Charging... ${batCap+1}/5`,c:T.teal})}
    // Discharge (serve load) — only if grid not importing
    if(batState==="idle"&&batCap>0&&!gridOn&&Math.random()<0.25){setBatState("discharging");ev.push({t:t+"",m:"⚡ Battery discharging to serve load",c:T.amber})}
    if(batState==="discharging"){setBatCap(c=>Math.max(0,c-1));setServed(s=>s+1);setBatState("idle");ev.push({t:t+"",m:"✅ Load served from battery",c:T.green})}
    // Grid import — only if battery not discharging
    if(!gridOn&&batState!=="discharging"&&Math.random()<0.15){setGridOn(true);ev.push({t:t+"",m:"🔌 Grid import started",c:T.blue})}
    if(gridOn&&Math.random()<0.3){setGridOn(false);setServed(s=>s+1);ev.push({t:t+"",m:"✅ Load served from grid",c:T.green})}
    // Supervisor prevents concurrent discharge + grid
    if(gridOn&&batState==="idle"&&batCap>0){ev.push({t:t+"",m:"🛡️ Supervisor blocks battery discharge (grid active)",c:T.purple})}
    if(ev.length)setLog(l=>[...l,...ev].slice(-40));
  },[clk,solar,batCap,batState,gridOn]);
  useEffect(()=>{if(on)ir.current=setInterval(step,600);else clearInterval(ir.current);return()=>clearInterval(ir.current)},[on,step]);
  const reset=()=>{setOn(false);setClk(0);setLog([]);setSolar(false);setBatCap(3);setBatState("idle");setGridOn(false);setServed(0)};

  return <div>
    <Tip><strong>How it works:</strong> A building gets power from 3 sources: solar panels ☀️, batteries 🔋, and the power grid 🔌. The supervisor ensures the battery and grid NEVER supply power at the same time (prevents dangerous reverse power flow). Solar charges the battery; the battery or grid serves the building's load.</Tip>
    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="⏱" label="Time" value={clk}/></Panel>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="✅" label="Served" value={served} color={T.green}/></Panel>
      <Panel style={{flex:1,padding:10,textAlign:"center"}}><Num icon="🔋" label="Battery" value={batCap+"/5"} color={batCap>2?T.green:batCap>0?T.amber:T.red}/></Panel>
    </div>
    {/* Visual power flow */}
    <Panel style={{marginBottom:14,padding:16}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 40px 1fr",gap:8,alignItems:"center"}}>
        {/* Sources */}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <div style={{background:solar?T.amberDim:T.panel,border:`1px solid ${solar?T.amber+"40":T.border}`,borderRadius:10,padding:10,textAlign:"center"}}>
            <div style={{fontSize:24}}>{solar?"☀️":"🌥️"}</div>
            <div style={{fontSize:10,fontWeight:600,color:solar?T.amber:T.dim}}>Solar {solar?"ON":"OFF"}</div>
          </div>
          <div style={{background:batCap>0?T.greenDim:T.panel,border:`1px solid ${T.border}`,borderRadius:10,padding:10,textAlign:"center"}}>
            <div style={{fontSize:24}}>🔋</div>
            <div style={{fontSize:10,fontWeight:600,color:batCap>0?T.green:T.red}}>Battery {batCap}/5</div>
            <Bar value={batCap} max={5} color={batCap>2?T.green:T.amber} h={4}/>
            {batState!=="idle"&&<Badge color={batState==="charging"?T.teal:T.amber}>{batState}</Badge>}
          </div>
          <div style={{background:gridOn?T.blueDim:T.panel,border:`1px solid ${gridOn?T.blue+"40":T.border}`,borderRadius:10,padding:10,textAlign:"center"}}>
            <div style={{fontSize:24}}>🔌</div>
            <div style={{fontSize:10,fontWeight:600,color:gridOn?T.blue:T.dim}}>Grid {gridOn?"ON":"OFF"}</div>
          </div>
        </div>
        {/* Arrow */}
        <div style={{textAlign:"center",fontSize:18,color:T.dim}}>→</div>
        {/* Load */}
        <div style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:10,padding:16,textAlign:"center"}}>
          <div style={{fontSize:32}}>🏢</div>
          <div style={{fontSize:12,fontWeight:600,color:T.text,marginTop:4}}>Building Load</div>
          <div style={{fontSize:10,color:T.sub,marginTop:4}}>✅ {served} units served</div>
          <div style={{marginTop:8,padding:"4px 8px",background:T.purple+"18",borderRadius:6,fontSize:9,color:T.purple}}>🛡️ Supervisor prevents simultaneous battery + grid</div>
        </div>
      </div>
    </Panel>
    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
      <Btn onClick={()=>setOn(!on)} on={on} color={on?T.amber:T.green} big>{on?"⏸ Pause":"▶ Run"}</Btn>
      <Btn onClick={step}>⏭</Btn><Btn onClick={reset}>🔄</Btn>
    </div>
    <Log items={log}/>
  </div>;
}

const TABS=[{k:"fms",t:"🏭 FMS",c:FMS},{k:"chem",t:"⚗️ Chemical",c:Chemical},{k:"agv",t:"🤖 AGV",c:AGV},{k:"rail",t:"🚂 Railway",c:Railway},{k:"grid",t:"⚡ Microgrid",c:Microgrid}];
export default function App(){const[tab,setTab]=useState("fms");const S=TABS.find(t=>t.k===tab);const C=S.c;
return <div style={{background:T.bg,minHeight:"100vh",padding:"16px 12px",fontFamily:"'DM Sans',system-ui,sans-serif",color:T.text}}>
<div style={{maxWidth:760,margin:"0 auto"}}><div style={{textAlign:"center",marginBottom:16}}><h1 style={{fontSize:20,fontWeight:700,margin:0}}>🔗 Petri Net Supervisor Simulator</h1><p style={{fontSize:12,color:T.sub,margin:"4px 0 0"}}>See how safety supervisors prevent deadlocks, collisions, and hazards</p></div>
<div style={{display:"flex",gap:0,marginBottom:18,background:T.panel,borderRadius:10,padding:3,border:"1px solid "+T.border}}>{TABS.map(t=><button key={t.k} onClick={()=>setTab(t.k)} style={{flex:"1 1 0",padding:"8px 4px",fontSize:12,fontWeight:tab===t.k?600:400,background:tab===t.k?T.card:"transparent",color:tab===t.k?T.text:T.dim,border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s",minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.t}</button>)}</div>
<C/></div></div>}
