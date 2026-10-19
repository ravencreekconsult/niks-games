// Ghost presence tracker for private-room co-presence.
// Local pose is rate-limited and broadcast; remote peers are tracked with
// staleness, fade-out, and teleport snapping for large jumps.
export class GhostPresence{
  constructor({rateHz=5,heartbeatMs=10000,staleMs=15000,fadeMs=1000,teleportDistance=8,send}={}){
    this.sendIntervalMs=1000/Math.max(1,rateHz);
    this.heartbeatMs=heartbeatMs;
    this.staleMs=staleMs;
    this.fadeMs=fadeMs;
    this.teleportDistance=teleportDistance;
    this.send=typeof send==='function'?send:()=>{};
    this.local=null;
    this.lastSentAt=0;
    this.lastHeartbeatAt=0;
    this.peers=new Map(); // connection -> {name,area,pose,from,at,opacity,gone}
    this.destroyed=false;
  }
  updateLocal({name,area,pose}={}){
    this.local={name:name||'Keeper',area,pose:{x:pose?.x||0,y:pose?.y||0,facing:pose?.facing||'down',action:pose?.action||'idle'}};
  }
  tick(now=performance.now()){
    if(this.destroyed||!this.local)return;
    if(now-this.lastSentAt>=this.sendIntervalMs){
      this.lastSentAt=now;
      try{this.send({kind:'pose',name:this.local.name,area:this.local.area,pose:this.local.pose,at:Date.now()})}catch{}
    }
    if(now-this.lastHeartbeatAt>=this.heartbeatMs){
      this.lastHeartbeatAt=now;
      try{this.send({kind:'heartbeat',at:Date.now()})}catch{}
    }
    for(const [conn,peer] of this.peers){
      const age=now-peer.at;
      if(peer.gone){peer.opacity=Math.max(0,1-(now-peer.gone)/this.fadeMs);if(peer.opacity<=0)this.peers.delete(conn);continue}
      if(age>this.staleMs+this.fadeMs){this.peers.delete(conn);continue}
      peer.opacity=age>this.staleMs?Math.max(0,1-(age-this.staleMs)/this.fadeMs):1;
    }
  }
  receive(connection,packet){
    if(this.destroyed||!packet||typeof packet!=='object')return;
    if(packet.kind==='heartbeat'){const p=this.peers.get(connection);if(p)p.at=performance.now();return}
    if(packet.kind!=='pose'||!packet.pose)return;
    const now=performance.now(),prev=this.peers.get(connection),pose={x:+packet.pose.x||0,y:+packet.pose.y||0,facing:packet.pose.facing||'down',action:packet.pose.action||'idle'};
    let from=pose;
    if(prev&&prev.area===packet.area){
      const jumped=Math.hypot(pose.x-prev.pose.x,pose.y-prev.pose.y)>this.teleportDistance;
      from=jumped?pose:prev.pose;
    }
    this.peers.set(connection,{name:packet.name||'Keeper',area:packet.area,pose,from,at:now,opacity:1,gone:0});
  }
  disconnect(connection){
    const p=this.peers.get(connection);
    if(p)p.gone=performance.now();
  }
  forget(connection){this.peers.delete(connection)}
  ghosts(area){
    const out=[],now=performance.now();
    for(const peer of this.peers.values()){
      if(peer.area!==area||peer.opacity<=0)continue;
      const t=peer.from===peer.pose?1:Math.min(1,(now-peer.at)/Math.max(1,this.sendIntervalMs));
      out.push({name:peer.name,opacity:peer.opacity,pose:{x:peer.from.x+(peer.pose.x-peer.from.x)*t,y:peer.from.y+(peer.pose.y-peer.from.y)*t,facing:peer.pose.facing,action:peer.pose.action}});
    }
    return out;
  }
  diagnostics(){
    return {peers:this.peers.size,local:!!this.local,lastSentAt:this.lastSentAt};
  }
  destroy(){this.destroyed=true;this.peers.clear();this.local=null}
}
