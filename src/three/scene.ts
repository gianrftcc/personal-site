// @ts-nocheck

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * Scena 3D "desk": scrivania, stickman, lupo, pila di loghi.
 * Opzioni: { canvas, screen, main, hint, bubble, models: { man, wolf, wolfTex } }
 * `models` sono URL (in Vite: import x from './models/file.glb?url'). Se mancano o falliscono
 * restano lo stickman e il lupo costruiti a mano. Restituisce dispose().
 */

export function mountScene({ canvas, screen: sEl, main: mEl, hint: hEl, bubble: bEl, models = {} }) {

/* posizione di un vertice dopo lo skinning (indipendente dalla versione di three) */

  var _sm = new THREE.Matrix4(),
    _sb = new THREE.Vector3(),
    _ss = new THREE.Vector3(),
    _si = new THREE.Vector4(),
    _sw = new THREE.Vector4();

  function skin(mesh, i, target) {

    var g = mesh.geometry, sk = mesh.skeleton;
    _si.fromBufferAttribute(g.attributes.skinIndex, i);
    _sw.fromBufferAttribute(g.attributes.skinWeight, i);
    _sb.fromBufferAttribute(g.attributes.position, i).applyMatrix4(mesh.bindMatrix);
    target.set(0, 0, 0);

    for (var k = 0; k < 4; k++) {

      var w = _sw.getComponent(k);

      if (w) {
        var bi = _si.getComponent(k);
        _sm.multiplyMatrices(sk.bones[bi].matrixWorld, sk.boneInverses[bi]);
        target.addScaledVector(_ss.copy(_sb).applyMatrix4(_sm), w);
      }

    }

    return target.applyMatrix4(mesh.bindMatrixInverse);
  }

  var renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,alpha:true});

  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));

  /* three recente: mantieni la resa colori/luci della r128 */

  if(THREE.ColorManagement)THREE.ColorManagement.enabled=false;
  if('outputColorSpace' in renderer)renderer.outputColorSpace=THREE.LinearSRGBColorSpace;

  var scene=new THREE.Scene(),room=new THREE.Group();room.rotation.y=0.45;scene.add(room);
  scene.fog=new THREE.Fog(0x050505,500,590);

  var EL=THREE.MathUtils.degToRad(28);

  var cam=new THREE.OrthographicCamera(-1,1,1,-1,1,1100);
  scene.add(new THREE.AmbientLight(0xffffff,0.56));

  var sun=new THREE.DirectionalLight(0xffffff,1.1);sun.position.set(-150,300,250);scene.add(sun);
  var glow=new THREE.PointLight(0xffffff,2.1,120);glow.position.set(8,24,2);room.add(glow);
  var px=0;
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  function gy(c){var k=new THREE.Color(c),l=k.r*.3+k.g*.59+k.b*.11;return new THREE.Color(l,l,l)}
  function M(c){return new THREE.MeshLambertMaterial({color:gy(c)})}
  function box(w,h,d,mat,x,y,z,parent){var m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);(parent||room).add(m);return m}
  function cyl(r,l,mat,parent){var m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,l,10),mat);parent.add(m);return m}
  function shadow(sx,sz,op,x,z){var m=new THREE.Mesh(new THREE.CircleGeometry(1,24),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:op,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(x,0.15,z);m.scale.set(sx,sz,1);room.add(m);return m}

  /* ---------- pavimento ---------- */

  var floor=new THREE.Mesh(new THREE.PlaneGeometry(700,700),M(0x0a0a0a));floor.rotation.x=-Math.PI/2;room.add(floor);
  var grid=new THREE.GridHelper(700,70,0x2a2a2a,0x1a1a1a);grid.position.y=0.05;room.add(grid);

  /* ---------- scrivania ---------- */

  var ink=M(0xe6dcc8);
  var frame=M(0x4a4540);
  var wood=M(0x2a2624);

  box(66,1.4,24,M(0x3a3531),0,16.3,0);

  [-31,31].forEach( function(x){ box(1.6,16,23,wood,x,8,0) } );

  box(64,11,1,wood,0,10.5,-11.5);
  box(18,11,1.4,frame,8,24,-3);
  box(2,5,2,frame,8,19.6,-3.2);
  box(8,0.6,5,frame,8,17.3,-3);
  box(11,0.6,3.6,frame,8,17.3,3.5);
  box(2,0.6,3.2,frame,16,17.3,4);
  shadow(36,15,0.5,0,0);

  /* ---------- accenti di colore ---------- */

  function bm(c){
    return new THREE.MeshBasicMaterial(
      {color:gy(c),fog:false}
    )
  }

  box(46,0.25,36,M(0x0e0e0e),4,0.12,13);
  var mug=cyl(1.6,2.8,M(0x6b5f52),room);
  mug.position.set(-18,18.4,3);
  
  var pot=cyl(2.2,4,M(0x4a4540),room);
  pot.position.set(-24,19,-3);

  [[0,0,0,2.6],[-1.4,-.6,1,2],[1.5,-.5,.8,2]].forEach(
    function(a){
      var l=new THREE.Mesh(new THREE.SphereGeometry(a[3],10,8),M(0x8a7760));
      l.position.set(-24+a[0],22.5+a[1],-3+a[2]);
      room.add(l)
    }
  );

  var lb=cyl(2.5,0.6,frame,room);
  lb.position.set(-28,17.3,-7);
  box(0.6,9,0.6,frame,-28,22,-7);

  var lh=new THREE.Mesh(new THREE.ConeGeometry(2.6,3,14),M(0xa8967c));
  lh.rotation.x=Math.PI;
  lh.position.set(-28,27,-7);room.add(lh);

  var bulb=new THREE.Mesh(new THREE.SphereGeometry(0.9,8,6),bm(0xffe2b0));
  bulb.position.set(-28,25.4,-7);room.add(bulb);
  
  var warm=new THREE.PointLight(0xffffff,0.6,70);
  warm.position.set(-28,24,-5);room.add(warm);

  /* schermo con codice che scorre */

  var sc=document.createElement('canvas');
  sc.width=sc.height=512;
  var sx=sc.getContext('2d');
  sx.fillStyle='#0a0a0a';sx.fillRect(0,0,512,512);

  var cols=['#9a9a9a','#bdbdbd','#777','#d6d6d6','#5a5a5a','#888'];
  for(var y=8;y<512;y+=16){var x0=16+Math.floor(Math.random()*4)*24;
    while(x0<440){var w=20+Math.random()*90;sx.fillStyle=cols[Math.floor(Math.random()*cols.length)];sx.fillRect(x0,y,w,8);x0+=w+10;if(Math.random()<0.18)break}}
  var tex=new THREE.CanvasTexture(sc);tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(1,0.5625);
  var scr=new THREE.Mesh(new THREE.PlaneGeometry(16,9),new THREE.MeshBasicMaterial({map:tex,fog:false}));
  scr.position.set(8,24,-2.2);room.add(scr);

  /* sedia */

  box(11,1.2,11,frame,8,11.4,20);
  box(11,8,1.2,frame,8,16,25.5);
  var col=new THREE.Mesh(new THREE.CylinderGeometry(0.8,0.8,10,10),frame);
  col.position.set(8,5.5,20);room.add(col);
  var cb=new THREE.Mesh(new THREE.CylinderGeometry(5,5,0.8,16),frame);
  cb.position.set(8,0.4,20);room.add(cb);

  /* ---------- omino (di spalle) ---------- */

  function seg(len,r){var m=cyl(r,len,ink,new THREE.Group());m.position.y=-len/2;return m}

  function limb(u,l,r,x,y){
    var root=new THREE.Group();root.position.set(x,y,0);root.add(seg(u,r));
    var j=new THREE.Group();j.position.y=-u;j.add(seg(l,r));
    j.add(new THREE.Mesh(new THREE.SphereGeometry(r,10,8),ink));root.add(j);return {root:root,joint:j};
  }

  var man=new THREE.Group(),body=new THREE.Group();man.add(body);
  var torso=cyl(1.4,14,ink,body);torso.position.y=29;
  var head=new THREE.Mesh(new THREE.SphereGeometry(5.2,16,12),ink);head.position.y=41.8;body.add(head);
  var legL=limb(11,11,1.3,-1.8,22),legR=limb(11,11,1.3,1.8,22);
  var armL=limb(7,7,1.1,-1.6,34),armR=limb(7,7,1.1,1.6,34);
  [legL,legR,armL,armR].forEach(function(l){body.add(l.root)});

  man.position.set(8,0,19);man.rotation.y=Math.PI;room.add(man);
  var poseFn=null,hbone=null;
  function initMan(g){
    var holder=new THREE.Group();
    try{
      var model=g.scene;holder.add(model);man.add(holder);
      var mat=new THREE.MeshLambertMaterial({color:gy(0xe6dcc8)});
      model.traverse(function(o){if(o.isMesh){o.material=mat;o.frustumCulled=false}});
      function F(re){var r=null;model.traverse(function(o){if(!r&&o.isBone&&re.test(o.name.replace(/[^A-Za-z0-9]/g,'')))r=o});return r}
      var B={hp:F(/^Hips/),sp:F(/^Spine/),ch:F(/^Chest/),nk:F(/^Neck/),hd:F(/^Head\d/),he:F(/^Headend/),
        uaL:F(/^UpperArmL/),laL:F(/^LowerArmL/),haL:F(/^HandL/),fiL:F(/^Fingers01L/),
        uaR:F(/^UpperArmR/),laR:F(/^LowerArmR/),haR:F(/^HandR/),fiR:F(/^Fingers01R/),
        thL:F(/^Thumb02L\d/),thR:F(/^Thumb02R\d/),ulL:F(/^UpperLegL/),llL:F(/^LowerLegL/),ftL:F(/^FootL/),tsL:F(/^ToesL\d/),
        ulR:F(/^UpperLegR/),llR:F(/^LowerLegR/),ftR:F(/^FootR/),tsR:F(/^ToesR\d/)};
      for(var k in B)if(!B[k])throw new Error('bone '+k);
      var V=THREE.Vector3,Q=THREE.Quaternion,hq=new Q(),pq=new Q(),wq=new Q(),dq=new Q(),a=new V(),b2=new V();
      function P(o){return holder.worldToLocal(new V().setFromMatrixPosition(o.matrixWorld))}
      function aim(b,c,x,y,z){
        b.updateWorldMatrix(true,true);holder.getWorldQuaternion(hq);
        a.setFromMatrixPosition(b.matrixWorld);b2.setFromMatrixPosition(c.matrixWorld);b2.sub(a).normalize();
        dq.setFromUnitVectors(b2,new V(x,y,z).normalize().applyQuaternion(hq));
        b.getWorldQuaternion(wq);b.parent.getWorldQuaternion(pq);
        b.quaternion.copy(pq.invert()).multiply(dq).multiply(wq);b.updateMatrixWorld(true);
      }
      room.updateMatrixWorld(true);
      var f=P(B.tsL).sub(P(B.ftL)).add(P(B.tsR).sub(P(B.ftR)));f.y=0;
      model.rotation.y=f.lengthSq()>1e-8?-Math.atan2(f.x,f.z):0;holder.updateMatrixWorld(true);
      var sx=P(B.uaL).x>P(B.uaR).x?1:-1,s=26.5/P(B.he).distanceTo(P(B.hp));
      holder.scale.setScalar(s);holder.updateMatrixWorld(true);
      aim(B.hp,B.sp,0,1,0.1);
      [[B.ulL,B.llL,B.ftL,B.tsL,sx],[B.ulR,B.llR,B.ftR,B.tsR,-sx]].forEach(function(l){
        aim(l[0],l[1],l[4]*0.1,-0.12,1);aim(l[1],l[2],l[4]*0.02,-1,-0.08);aim(l[2],l[3],0,-0.1,1)});
      var sm=null;model.traverse(function(o){if(o.isSkinnedMesh)sm=o});
      var nl=[null,null],fl=[false,false],inw=[-sx,sx];
      function palm(h){
        model.updateMatrixWorld(true);var bs=sm.skeleton.bones,set={};
        h.traverse(function(o){var k=bs.indexOf(o);if(k>=0)set[k]=1});
        var si=sm.geometry.attributes.skinIndex,sw=sm.geometry.attributes.skinWeight,inv=new THREE.Matrix4().copy(h.matrixWorld).invert(),pts=[];
        for(var i=0;i<si.count;i++){
          var ix=[si.getX(i),si.getY(i),si.getZ(i),si.getW(i)],wt=[sw.getX(i),sw.getY(i),sw.getZ(i),sw.getW(i)],m=0;
          for(var j=1;j<4;j++)if(wt[j]>wt[m])m=j;
          if(set[ix[m]]&&wt[m]>0.5)pts.push(skin(sm,i,new V()).applyMatrix4(sm.matrixWorld).applyMatrix4(inv))}
        if(pts.length<6)return new V(0,0,1);
        var mx=0,mz=0,cxx=0,czz=0,cxz=0,n=pts.length;
        pts.forEach(function(p){mx+=p.x/n;mz+=p.z/n});
        pts.forEach(function(p){var x=p.x-mx,z=p.z-mz;cxx+=x*x;czz+=z*z;cxz+=x*z});
        var th=0.5*Math.atan2(2*cxz,cxx-czz);return new V(-Math.sin(th),0,Math.cos(th));
      }
      function roll(h,f,i){
        if(!nl[i])return;
        h.updateWorldMatrix(true,true);holder.getWorldQuaternion(hq);h.getWorldQuaternion(wq);h.parent.getWorldQuaternion(pq);
        var w=new V().setFromMatrixPosition(f.matrixWorld).sub(new V().setFromMatrixPosition(h.matrixWorld)).normalize(),
            n=nl[i].clone().multiplyScalar(fl[i]?-1:1).applyQuaternion(wq),u=new V(0,1,0).applyQuaternion(hq);
        n.addScaledVector(w,-n.dot(w)).normalize();u.addScaledVector(w,-u.dot(w)).normalize();
        dq.setFromAxisAngle(w,Math.atan2(w.dot(new V().crossVectors(n,u)),n.dot(u)));
        h.quaternion.copy(pq.invert()).multiply(dq).multiply(wq);h.updateMatrixWorld(true);
      }
      function up(tt){
        aim(B.sp,B.ch,0,1,0.18+Math.sin(tt*1.6)*0.04);aim(B.ch,B.nk,0,1,0.08);aim(B.nk,B.hd,0,1,0.22);aim(B.hd,B.he,0,1,0.12);
        [[B.uaL,B.laL,B.haL,B.fiL,sx,0,0],[B.uaR,B.laR,B.haR,B.fiR,-sx,2,1]].forEach(function(r){
          var ph=r[5],env=Math.min(1,Math.max(0,0.55+Math.sin(tt*0.8)*0.5+Math.sin(tt*2.3)*0.25)),
              o=(Math.sin(tt*23*sp+ph)*Math.sin(tt*14.3*sp+ph*1.7)+Math.sin(tt*31*sp+ph*2.3))*0.5*env,
              ox=Math.sin(tt*5.1*sp+ph)*0.04*env;
          aim(r[0],r[1],0,-0.7,0.3);aim(r[1],r[2],-r[4]*0.2+ox,-0.4+o*0.025,1);aim(r[2],r[3],0,-0.1+o*0.05,1);roll(r[2],r[3],r[6])});
      }
      up(0);nl[0]=palm(B.haL);nl[1]=palm(B.haR);up(0);
      [[B.haL,B.thL],[B.haR,B.thR]].forEach(function(q,i){if((P(q[1]).x-P(q[0]).x)*inw[i]<=0)fl[i]=true});up(0);
      var h=P(B.hp);holder.position.set(-s*h.x,13.6-s*h.y,1.2-s*h.z);
      body.visible=false;hbone=B.he;poseFn=up;
    }catch(e){console.warn('GLB pose failed',e);man.remove(holder);body.visible=true;poseFn=null;hbone=null}
  }

  shadow(9,7,0.35,8,20);

/* ---------- lupo che dorme sotto la scrivania (muso verso di noi) ---------- */
var wolf=new THREE.Group(),wblack=M(0x111114),wdark=M(0x2f2b29),wpink=M(0xb98a80);
/* ellissoide con sfumatura di pelo: colore alto -> colore basso */
function gel(sx,sy,sz,x,y,z,top,bot,rz,parent){
  var g=new THREE.SphereGeometry(1,16,12),pos=g.attributes.position,cs=[],a=gy(top),b=gy(bot),c=new THREE.Color();
  for(var i=0;i<pos.count;i++){var k=Math.min(1,Math.max(0,(pos.getY(i)+1)/2));k=k*k*(3-2*k);c.copy(b).lerp(a,k);cs.push(c.r,c.g,c.b)}
  g.setAttribute('color',new THREE.Float32BufferAttribute(cs,3));
  var m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true}));
  m.scale.set(sx,sy,sz);m.position.set(x,y,z);if(rz)m.rotation.z=rz;(parent||wolf).add(m);return m}
var CR=0xe6dcc8,lay=[];
gel(5.6,5,10,0,5,-2,0x4a4540,0xb8a58c);
gel(4.6,3,8.5,0,7.3,-2.5,0x2e2a28,0x6b5f52);
gel(3.9,3.9,4,0,4,5.5,0x9a8870,CR);
gel(3.3,3.3,4.6,-4,3.3,-6,0x5a534b,0xa8967c);gel(3.3,3.3,4.6,4,3.3,-6,0x5a534b,0xa8967c);
[-1,1].forEach(function(sd){
  lay.push(gel(1.8,1.7,6,sd*2.6,1.8,11,0x8a7760,0xc7b69c));
  lay.push(gel(1.9,1.5,2.4,sd*2.6,1.3,16.2,0xcbbda3,0xe0d4bd));
  lay.push(gel(1.8,2.2,2.4,sd*3.2,4,13,0x9d8a72,CR));
  var e=new THREE.Mesh(new THREE.ConeGeometry(2.1,5.8,4),wdark);e.position.set(sd*2.5,9.4,12.8);e.rotation.z=-sd*0.22;e.rotation.y=Math.PI/4;wolf.add(e);
  var ei=new THREE.Mesh(new THREE.ConeGeometry(1.1,4,4),wpink);ei.position.set(sd*2.5,9,13.5);ei.rotation.z=-sd*0.22;ei.rotation.y=Math.PI/4;wolf.add(ei);
  var ey=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),wblack);ey.scale.set(1.2,0.22,0.5);ey.position.set(sd*1.9,6.3,17.2);ey.rotation.z=sd*0.25;wolf.add(ey);
});
gel(3.7,3.5,4.3,0,5.2,14,0x4a4540,0xa08c74);
gel(2,1.8,4.2,0,4.3,18.8,0x8a7760,CR);
gel(1.2,0.8,3.4,0,5.5,19.2,0x34302d,0x5b5249);
var nose=new THREE.Mesh(new THREE.SphereGeometry(1,10,8),wblack);nose.scale.set(1,0.9,1);nose.position.set(0,4.6,22.6);wolf.add(nose);
var wcol=new THREE.Mesh(new THREE.TorusGeometry(3.3,0.5,8,16),M(0x6b5f52));wcol.position.set(0,4.8,10);wolf.add(wcol);
var tag=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),M(0xc7b69c));tag.scale.set(0.7,0.7,0.3);tag.position.set(0,1.9,13.2);wolf.add(tag);
var tail=new THREE.Group();tail.position.set(0,3,-10);wolf.add(tail);
[[0,0,-1,2.4,2.4,3.2,0x6b5f52,0xa8967c],[-2.8,-.4,-3,2.3,2.3,3,0x4a4540,0x9a8870],[-6,-.6,-3,2.2,2.2,3,0x4a4540,0x8a7760],[-8.6,-.6,-.5,2.2,2.2,3,0x3a3531,0x6b5f52],[-9.6,-.6,2.5,1.8,1.8,2.4,0x1f1c1b,0x2f2b29]].forEach(function(a){
  gel(a[3],a[4],a[5],a[0],a[1],a[2],a[6],a[7],0,tail)});
var wb=new THREE.Group();wolf.children.slice().forEach(function(c){wb.add(c)});wolf.add(wb);
var lg=[];[[-2.6,7.5,0],[2.6,7.5,Math.PI],[-3.2,-6.5,Math.PI],[3.2,-6.5,0]].forEach(function(a){
  var pv=new THREE.Group();pv.position.set(a[0],0,a[1]);pv.visible=false;pv.userData.ph=a[2];
  gel(1.3,4.2,1.5,0,-3.8,0,0x6b5f52,0xe0d4bd,0,pv);wolf.add(pv);lg.push(pv)});
wolf.scale.setScalar(0.75);wolf.position.set(-12,0,1.5);room.add(wolf);
var wolfNew=false,wApply=null,wc=new THREE.Vector3(0,5,6),zx0=-12,zy0=12,zz0=16,wRunV=70,hsl=0,wx0=-12,wz0=-3;
function initWolf(g,wtx){
  var hd=new THREE.Group();
  try{
    var V=THREE.Vector3,Q=THREE.Quaternion,model=g.scene,sm=null,N={};
    hd.add(model);wolf.add(hd);
    model.traverse(function(o){
      if(o.isBone)N[o.name]=o;
      if(o.isSkinnedMesh){sm=o;o.frustumCulled=false;o.raycast=function(){};var mp=wtx||null;if(mp){mp.flipY=false;mp.wrapS=mp.wrapT=THREE.RepeatWrapping;if('colorSpace' in mp)mp.colorSpace=THREE.NoColorSpace;else mp.encoding=3000}
        o.material=new THREE.MeshLambertMaterial({map:mp,color:0xffffff})}});
    function b(n){var r=N['Wolf_bones_her'+n];if(!r)throw new Error('bone '+n);return r}
    var pel=b('Pelvis_01'),s1=b('Spine1_012'),s2=b('Spine2_00'),s3=b('Spine3_014'),rib=b('Ribcage_013'),n1=b('Neck1_028'),n2=b('Neck2_027'),n3=b('Neck3_029'),hb=b('Head_030'),
      T=[b('Tail1_037'),b('Tail2_038'),b('Tail3_039'),b('Tail4_040')],
      RL=[b('LLeg1_03'),b('LLeg2_02'),b('LLegPalm_04'),b('LLegDigit01_05'),b('LLegDigit02_07')],
      RR=[b('RLeg1_06'),b('RLeg2_08'),b('RLegPalm_09'),b('RLegDigit01_010'),b('RLegDigit02_011')],
      FL=[b('LLegShoulderblade_016'),b('LLeg1_015'),b('LLeg2_017'),b('LLegPalm_018'),b('LLegDigit01_019'),b('LLegDigit02_020')],
      FR=[b('RLegShoulderblade_022'),b('RLeg1_021'),b('RLeg2_023'),b('RLegPalm_024'),b('RLegDigit01_025'),b('RLegDigit02_026')];
    var hq=new Q(),pq=new Q(),wq=new Q(),dq=new Q(),a=new V(),b2=new V(),mix=new THREE.AnimationMixer(model),dur=g.animations[0].duration;
    var rb=sm.skeleton.bones,RQ=rb.map(function(o){return o.quaternion.clone()}),RP=rb.map(function(o){return o.position.clone()});
    function toRest(){for(var i=0;i<rb.length;i++){rb[i].quaternion.copy(RQ[i]);rb[i].position.copy(RP[i])}model.updateMatrixWorld(true)}
    var HB=N['bones_HeadBone011_041'],REL=new THREE.Matrix4(),fm=new THREE.Matrix4(),fp=new V(),fq=new Q(),fs=new V(),p0=new V(),q0=new Q();
    if(HB){toRest();hb.updateWorldMatrix(true,false);HB.updateWorldMatrix(true,false);REL.copy(hb.matrixWorld).invert().multiply(HB.matrixWorld)}
    mix.clipAction(g.animations[0]).play();mix.update(0);
    function P(o){return wolf.worldToLocal(new V().setFromMatrixPosition(o.matrixWorld))}
    function aim(bn,c,x,y,z){
      bn.updateWorldMatrix(true,true);hd.getWorldQuaternion(hq);
      a.setFromMatrixPosition(bn.matrixWorld);b2.setFromMatrixPosition(c.matrixWorld);b2.sub(a).normalize();
      dq.setFromUnitVectors(b2,new V(x,y,z).normalize().applyQuaternion(hq));
      bn.getWorldQuaternion(wq);bn.parent.getWorldQuaternion(pq);
      bn.quaternion.copy(pq.invert()).multiply(dq).multiply(wq);bn.updateMatrixWorld(true);
    }
    room.updateMatrixWorld(true);
    var f=P(hb).sub(P(pel));f.y=0;model.rotation.y=-Math.atan2(f.x,f.z);hd.updateMatrixWorld(true);
    var sL=P(FL[1]).x>P(FR[1]).x?1:-1,s=19/P(hb).distanceTo(P(pel))/0.75;
    hd.scale.setScalar(s);room.updateMatrixWorld(true);
    /* misura del passo (run) per la velocita' */
    var run=[],ts0=[0,1,2,3,4,5,6,7].map(function(){return 0}),zmin=1e9,zmax=-1e9,fw=new V(0,0,1);
    for(var k=0;k<8;k++){mix.setTime(dur*k/8);room.updateMatrixWorld(true);
      var pp=P(pel);[FL[3],FR[3],RL[2],RR[2]].forEach(function(o){var z=P(o).z-pp.z;zmin=Math.min(zmin,z);zmax=Math.max(zmax,z)})}
    wRunV=Math.max(25,(zmax-zmin)/(0.45*dur));
    function minY(){var v=new V(),m=1e9,n=sm.geometry.attributes.position.count;sm.updateMatrixWorld(true);
      for(var i=0;i<n;i+=3){skin(sm,i,v).applyMatrix4(sm.matrixWorld);m=Math.min(m,wolf.worldToLocal(v).y)}return m}
    var gr=1e9;for(k=0;k<4;k++){mix.setTime(dur*k/4);room.updateMatrixWorld(true);gr=Math.min(gr,minY()+hd.position.y)}
    gr=-gr;
    var allB=sm.skeleton.bones,tq=new Q(),tv=new V();
    function snap(){return allB.map(function(o){return o.quaternion.clone()})}
    function rollZ(bn,ang){bn.updateWorldMatrix(true,true);hd.getWorldQuaternion(hq);bn.getWorldQuaternion(wq);bn.parent.getWorldQuaternion(pq);
      dq.setFromAxisAngle(new V(0,0,1).applyQuaternion(hq),ang);bn.quaternion.copy(pq.invert()).multiply(dq).multiply(wq);bn.updateMatrixWorld(true)}
    var S=sL;
    function aimV(bn,ld,x,y,z){
      bn.updateWorldMatrix(true,true);hd.getWorldQuaternion(hq);bn.getWorldQuaternion(wq);
      b2.copy(ld).applyQuaternion(wq).normalize();dq.setFromUnitVectors(b2,new V(x,y,z).normalize().applyQuaternion(hq));
      bn.parent.getWorldQuaternion(pq);bn.quaternion.copy(pq.invert()).multiply(dq).multiply(wq);bn.updateMatrixWorld(true)}
    /* direzione del muso nel sistema locale della testa (da posa di riposo) */
    toRest();sm.updateMatrixWorld(true);
    var hs={},sk=sm.geometry.attributes.skinIndex,sw2=sm.geometry.attributes.skinWeight,tip=null,tz=-1e9,vv=new V();
    hb.traverse(function(o){var k=rb.indexOf(o);if(k>=0)hs[k]=1});if(HB)HB.traverse(function(o){var k=rb.indexOf(o);if(k>=0)hs[k]=1});
    for(var vi=0;vi<sk.count;vi++){var ix=[sk.getX(vi),sk.getY(vi),sk.getZ(vi),sk.getW(vi)],wt=[sw2.getX(vi),sw2.getY(vi),sw2.getZ(vi),sw2.getW(vi)],mj=0;
      for(var j=1;j<4;j++)if(wt[j]>wt[mj])mj=j;
      if(hs[ix[mj]]&&wt[mj]>0.5){skin(sm,vi,vv).applyMatrix4(sm.matrixWorld);var zl=wolf.worldToLocal(vv.clone()).z;if(zl>tz){tz=zl;tip=vv.clone()}}}
    var nl=new V().setFromMatrixPosition(hb.matrixWorld);nl=tip.sub(nl).normalize();hb.getWorldQuaternion(wq);nl.applyQuaternion(wq.invert());
    /* posa B: a sfinge */
    toRest();
    aim(s1,s2,0,0.03,1);aim(s2,s3,0,0.05,1);aim(s3,rib,0,0.06,1);
    aim(rib,n2,0,0,1);aim(n1,n2,0,-0.45,1);aim(n2,n3,0,-0.75,1);aim(n3,hb,0,-0.75,1);aimV(hb,nl,0,-0.02,1);
    aim(T[0],T[1],S*0.3,-0.6,-1);aim(T[1],T[2],S*0.9,-0.5,-0.6);aim(T[2],T[3],S,-0.3,0.1);
    [[RL,S],[RR,-S]].forEach(function(l){var c=l[0],x=l[1];
      aim(c[0],c[1],x*0.25,-0.5,0.7);aim(c[1],c[2],x*0.05,-0.15,-1);aim(c[2],c[3],0,-0.05,1);aim(c[3],c[4],0,-0.1,1)});
    [[FL,S],[FR,-S]].forEach(function(l){var c=l[0],x=l[1];
      aim(c[0],c[1],x*0.15,-0.5,0.3);aim(c[1],c[2],x*0.05,-0.85,-0.3);aim(c[2],c[3],-x*0.12,-0.05,1);aim(c[3],c[4],0,-0.05,1);aim(c[4],c[5],0,-0.1,1)});
    var gB=-minY(),QB=snap(),SPB=pel.position.clone();
    /* posa A: su un fianco (dorso verso la camera) */
    toRest();
    rollZ(pel,-Math.PI/2);
    aim(s1,s2,0,0,1);aim(s2,s3,0,0,1);aim(s3,rib,0,0,1);aim(rib,n2,0,0,1);aim(n1,n2,0,0,1);aim(n2,n3,0,-0.15,1);aim(n3,hb,0,-0.3,1);
    aim(T[0],T[1],-0.2,-0.2,-1);aim(T[1],T[2],-0.3,-0.2,-1);aim(T[2],T[3],-0.4,-0.1,-0.8);
    var fT=P(FL[1]).y>P(FR[1]).y?FL:FR,rT=P(RL[0]).y>P(RR[0]).y?RL:RR;
    [FL,FR].forEach(function(c){var top=c===fT;
      aim(c[0],c[1],-0.5,top?-0.3:-0.1,0.6);aim(c[1],c[2],-0.3,top?-0.4:-0.05,0.8);aim(c[2],c[3],-0.1,top?-0.3:-0.05,1);aim(c[3],c[4],0,-0.05,1);aim(c[4],c[5],0,-0.1,1)});
    [RL,RR].forEach(function(c){var top=c===rT;
      aim(c[0],c[1],-0.5,top?-0.3:-0.1,0.5);aim(c[1],c[2],-0.3,top?-0.35:-0.05,-1);aim(c[2],c[3],-0.1,-0.05,1);aim(c[3],c[4],0,-0.1,1)});
    var gA=-minY(),QA=snap(),SPA=pel.position.clone();
    wApply=function(lie,dt,ts){
      var wT=Math.min(1,lie),mA=Math.max(0,lie-1);
      if(HB){p0.copy(HB.position);q0.copy(HB.quaternion)}
      if(wT<1)mix.update(dt*ts);
      if(wT>0){for(var i=0;i<allB.length;i++){tq.copy(QB[i]).slerp(QA[i],mA);allB[i].quaternion.slerp(tq,wT)}
        pel.position.lerp(tv.copy(SPB).lerp(SPA,mA),wT)}
      if(HB&&wT>0){hb.updateWorldMatrix(true,false);HB.parent.updateWorldMatrix(true,false);
        fm.copy(HB.parent.matrixWorld).invert().multiply(hb.matrixWorld).multiply(REL).decompose(fp,fq,fs);
        HB.position.copy(p0).lerp(fp,wT);HB.quaternion.copy(q0).slerp(fq,wT);HB.scale.copy(fs)}
      var gp=gB+(gA-gB)*mA;hd.position.y=gr+(gp-gr)*wT;
    };
    hsl=0;wolf.position.set(wx0,0,wz0);wolf.rotation.y=hsl;wApply(1,0,0);room.updateMatrixWorld(true);
    var bb=new THREE.Box3(),v=new V();sm.updateMatrixWorld(true);
    for(var i=0;i<sm.geometry.attributes.position.count;i+=4){skin(sm,i,v).applyMatrix4(sm.matrixWorld);bb.expandByPoint(wolf.worldToLocal(v))}
    bb.getCenter(wc);
    var hp=room.worldToLocal(new V().setFromMatrixPosition(hb.matrixWorld));zx0=hp.x;zy0=hp.y+3;zz0=hp.z+3;
    if(typeof wsh!=='undefined'&&wsh){wsh.scale.set(7,13,1);wsh.rotation.z=hsl;wsh.position.set(wx0,0.15,wz0+4)}
    wb.visible=false;lg.forEach(function(p){p.visible=false});wolfNew=true;
  }catch(e){console.warn('WOLF failed',e);wolf.remove(hd);wb.visible=true;wolfNew=false}
}
var wsh=shadow(9,14,0.5,-12,3);
/* "z z z" sopra la testa */
var zc=document.createElement('canvas');zc.width=zc.height=64;var zx=zc.getContext('2d');
zx.fillStyle='#ececec';zx.font='italic bold 52px Georgia,serif';zx.textAlign='center';zx.textBaseline='middle';zx.fillText('z',32,34);
var zt=new THREE.CanvasTexture(zc),zs=[0,1,2].map(function(){var sp=new THREE.Sprite(new THREE.SpriteMaterial({map:zt,transparent:true,depthWrite:false,fog:false}));room.add(sp);return sp});

  /* ---------- pila di loghi ---------- */

  var stack = new THREE.Group();
  var S = 13;

  function tile(id, name, bg, fg, lc) {
    var c = document.createElement('canvas');
    c.width = c.height = 256;

    var x = c.getContext('2d');

    x.fillStyle = bg;
    x.fillRect(0, 0, 256, 256);

    x.fillStyle = x.strokeStyle = fg;
    x.lineCap = x.lineJoin = 'round';

    x.save();
    x.translate(128, 106);

    if (id === 'react') {
      x.lineWidth = 9;

      for (var i = 0; i < 3; i++) {
        x.beginPath();
        x.ellipse(0, 0, 78, 30, i * Math.PI / 3, 0, 7);
        x.stroke();
      }

      x.beginPath();
      x.arc(0, 0, 12, 0, 7);
      x.fill();

    } else if (id === 'vue') {
      x.beginPath();
      x.moveTo(-72, -62);
      x.lineTo(0, 62);
      x.lineTo(72, -62);
      x.lineTo(42, -62);
      x.lineTo(0, 10);
      x.lineTo(-42, -62);
      x.closePath();
      x.fill();

      x.fillStyle = '#35495e';

      x.beginPath();
      x.moveTo(-42, -62);
      x.lineTo(0, 10);
      x.lineTo(42, -62);
      x.lineTo(22, -62);
      x.lineTo(0, -24);
      x.lineTo(-22, -62);
      x.closePath();
      x.fill();

    } else if (id === 'next') {
      x.beginPath();
      x.arc(0, 0, 72, 0, 7);
      x.fill();

      x.fillStyle = bg;
      x.font = 'bold 92px Arial,sans-serif';
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.fillText('N', 0, 6);

    } else if (id === 'tw') {
      x.lineWidth = 17;

      [-26, 26].forEach(function(y) {
        x.beginPath();
        x.moveTo(-82, y + 10);
        x.bezierCurveTo(-55, y - 30, -25, y - 30, 0, y + 4);
        x.bezierCurveTo(25, y + 38, 55, y + 38, 82, y - 10);
        x.stroke();
      });

    } else if (id === 'shad') {
      x.lineWidth = 17;

      x.beginPath();
      x.moveTo(40, -66);
      x.lineTo(-66, 40);
      x.moveTo(66, -40);
      x.lineTo(-40, 66);
      x.stroke();

    } else {
      x.font = 'bold 150px Arial,sans-serif';
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.fillText('L', 0, 4);
    }

    x.restore();

    x.fillStyle = lc;
    x.font = 'bold 34px Arial,sans-serif';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText(name, 128, 226);

    return new THREE.MeshLambertMaterial({
      map: new THREE.CanvasTexture(c)
    });
  }

  var TL = [
    ['lara', 'Laravel', '#ff2d20', '#ffffff', '#ffffff'],
    ['vue', 'Vue.js', '#e9ecf1', '#42b883', '#35495e'],
    ['tw', 'Tailwind', '#e9ecf1', '#06b6d4', '#0f172a'],
    ['react', 'React', '#61dafb', '#10242c', '#10242c'],
    ['shad', 'shadcn/ui', '#0a0a0a', '#ffffff', '#ffffff'],
    ['next', 'Next.js', '#e9ecf1', '#0a0a0a', '#0a0a0a']
  ];

  var bi = 0;

  [3, 2, 1].forEach(function(n, r) {
    for (var i = 0; i < n; i++) {
      var d = TL[bi++];

      var m = tile(d[0], d[1], d[2], d[3], d[4]);
      var pl = M(d[2]);

      var b = new THREE.Mesh(
        new THREE.BoxGeometry(S, S, S),
        [m, m, m, pl, m, m]
      );

      var u = b.userData;

      u.y = S / 2 + r * S;
      u.vy = 0;
      u.d = reduce ? 0 : 0.5 + bi * 0.35;

      b.position.set(
        (i - (n - 1) / 2) * (S + 0.8) + (Math.random() - 0.5) * 0.8,
        reduce ? u.y : 300 + r * 80,
        (Math.random() - 0.5) * 1.5
      );

      b.rotation.y = (Math.random() - 0.5) * 0.2;

      stack.add(b);
    }
  });

  stack.position.set(58, 0, -2);
  stack.rotation.y = -0.45;

  room.add(stack);

  shadow(26, 18, 0.4, 58, -2);

  /* ---------- camera ---------- */

  var W, H, zb, zt, btx, bty;
  var pp = 0, pt = 0;
  var sv = new THREE.Vector3();

  function sm(x) {
    return x * x * (3 - 2 * x);
  }

  function cl(x) {
    return Math.min(1, Math.max(0, x));
  }

  function view() {
    var e = sm(cl(pp / 0.7));

    room.rotation.y += (
      (reduce ? 0.45 : 0.45 + px * 0.18 * (1 - e)) * (1 - e)
      - room.rotation.y
    ) * 0.08;

    room.updateMatrixWorld(true);
    scr.getWorldPosition(sv);

    var tx = btx + (sv.x - btx) * e;
    var ty = bty + (sv.y - bty) * e;
    var el = EL * (1 - e);

    cam.position.set(
      tx,
      ty + 500 * Math.sin(el),
      500 * Math.cos(el)
    );

    cam.lookAt(tx, ty, 0);

    cam.zoom = Math.exp(Math.log(zt / zb) * e);
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();

    mEl.style.opacity = cl(1 - pp * 4);
    hEl.style.opacity = cl(1 - pp * 10);

    var q = sm(cl((pp - 0.6) / 0.4));
    var o = cl((pp - 0.55) / 0.12);

    if (o <= 0) {
      sEl.style.opacity = 0;
      sEl.style.pointerEvents = 'none';
      return;
    }

    var cz = zb * cam.zoom;
    var rw = 16 * cz;
    var rh = 9 * cz;

    var v = sv.clone().project(cam);
    var cx = (v.x + 1) / 2 * W;
    var cy = (1 - v.y) / 2 * H;

    var st = sEl.style;

    st.left = (cx - rw / 2) * (1 - q) + 'px';
    st.top = (cy - rh / 2) * (1 - q) + 'px';

    st.width = (rw + (W - rw) * q) + 'px';
    st.height = (rh + (H - rh) * q) + 'px';

    st.opacity = o;
    st.borderRadius = (4 * (1 - q)) + 'px';

    st.setProperty(
      '--fs',
      (
        rw * 0.022 * (1 - q) +
        Math.max(13, Math.min(18, W * 0.014)) * q
      ).toFixed(1) + 'px'
    );

    st.pointerEvents = q > 0.98 ? 'auto' : 'none';
  }

  function resize() {
    W = innerWidth;
    H = innerHeight;

    renderer.setSize(W, H, false);

    var mob = W < 640;

    zb = mob
      ? W / 105
      : Math.min(W / 115, H / 72);

    cam.left = -W / 2 / zb;
    cam.right = W / 2 / zb;
    cam.top = H / 2 / zb;
    cam.bottom = -H / 2 / zb;

    zt = Math.min(
      W * (mob ? 0.9 : 0.62) / 16,
      H * 0.62 / 9
    );

    btx = 22;
    bty = 14 + H / zb * (mob ? 0.23 : 0.11);

    view();
  }

  function onS() {
    var m = document.documentElement.scrollHeight - innerHeight;
    pt = m > 0 ? cl(scrollY / m) : 0;
  }

  addEventListener('scroll', onS, { passive: true });
  addEventListener('resize', resize);

  onS();
  pp = pt;

  resize();


  /* ---------- wolf interaction ---------- */

  var ws = 'sleep',
      wt = 0,
      hd = 0,
      rc = new THREE.Raycaster(),
      wv = new THREE.Vector3(),
      mv = new THREE.Vector3();

  function hitWolf(cx, cy) {
    if (ws !== 'sleep' || pp > 0.3) return false;

    rc.setFromCamera(
      new THREE.Vector2(cx / W * 2 - 1, -(cy / H * 2 - 1)),
      cam
    );

    if (rc.intersectObject(wolf, true).length) return true;

    wv.copy(wc);
    wolf.localToWorld(wv);
    wv.project(cam);

    return Math.hypot(
      (wv.x + 1) / 2 * W - cx,
      (1 - wv.y) / 2 * H - cy
    ) < Math.max(26, 9 * zb * cam.zoom);
  }

  function onClick(e) {
    if (hitWolf(e.clientX, e.clientY)) {
      ws = 'wake';
      wt = 0;
    }
  }

  addEventListener('click', onClick);

  function onMove(e) {
    px = e.clientX / innerWidth - 0.5;
    document.body.style.cursor = hitWolf(e.clientX, e.clientY) ? 'pointer' : '';
  }

  addEventListener('pointermove', onMove);


  /* ---------- procedural wolf animation ---------- */

  var stand = 0;

  function wolfStep(dt) {
    if (ws === 'sleep') return;

    if (wolfNew) {
      wolfStepN(dt);
      return;
    }

    wt += dt;

    var gait = 0;
    var tgt = 1;

    zs.forEach(function(z) {
      z.material.opacity = 0;
    });

    if (ws === 'wake') {
      var k = cl(wt / 0.4);

      wolf.scale.set(
        0.75,
        0.75 * (1 + Math.sin(k * Math.PI) * 0.25),
        0.75
      );

      tgt = wt < 0.4 ? 0 : 1;
      tail.rotation.y = Math.sin(t * 26) * 0.35;

      if (wt >= 0.9) {
        ws = 'out1';
        wt = 0;
      }
    } else {
      wolf.scale.setScalar(0.75);

      if (ws === 'out1') {
        hd = 0;
        wolf.position.z += (wolfNew ? wRunV * 1.2 : 40) * dt;
        gait = 22;

        if (wolf.position.z >= 17) {
          ws = 'out2';
          wt = 0;
        }
      } else if (ws === 'out2') {
        hd = -Math.PI / 2;
        wolf.position.x -= (wolfNew ? wRunV * 1.2 : 70) * dt;
        gait = 22;

        if (wolf.position.x <= -80) {
          ws = 'away';
          wt = 0;
          wolf.visible = wsh.visible = false;
        }
      } else if (ws === 'away') {
        if (wt >= 8) {
          ws = 'in1';
          wt = 0;
          wolf.position.set(-80, 0, 17);
          wolf.rotation.y = hd = Math.PI / 2;
          wolf.visible = wsh.visible = true;
        }
      } else if (ws === 'in1') {
        hd = Math.PI / 2;
        wolf.position.x += (wolfNew ? wRunV * 0.6 : 34) * dt;
        gait = 14;

        if (wolf.position.x >= -12) {
          ws = 'in2';
          wt = 0;
        }
      } else if (ws === 'in2') {
        hd = Math.PI;
        wolf.position.z -= (wolfNew ? wRunV * 0.6 : 30) * dt;
        gait = 14;

        if (wolf.position.z <= 1.5) {
          wolf.position.z = 1.5;
          ws = 'settle';
          wt = 0;
        }
      } else if (ws === 'settle') {
        hd = 0;
        tgt = 0;

        if (stand < 0.03 && wt > 0.6) {
          ws = 'sleep';
          wt = 0;
          stand = 0;

          wolf.rotation.set(0, 0, 0);
          wolf.position.set(-12, 0, 1.5);

          wb.position.y = 0;
          wb.rotation.x = 0;
        }
      }
    }

    stand += (tgt - stand) * Math.min(1, dt * 7);
    wolf.rotation.y += (hd - wolf.rotation.y) * Math.min(1, dt * 9);

    if (wolfNew) {
      wApply(
        1 - Math.min(1, stand),
        dt,
        gait ? (gait > 20 ? 1.2 : 0.6) : 0
      );
    } else {
      wb.position.y =
        6.5 * stand +
        (gait ? Math.abs(Math.cos(t * gait)) * 1.1 * stand : 0);

      wb.rotation.x = gait ? -0.05 * stand : 0;
      wolf.rotation.z = gait ? Math.sin(t * gait) * 0.03 : 0;

      if (gait) {
        tail.rotation.y = Math.sin(t * gait * 0.7) * 0.25;
      }

      lg.forEach(function(pv) {
        pv.visible = stand > 0.02;
        pv.position.y = 8 * stand;
        pv.scale.y = Math.max(stand, 0.01);

        pv.rotation.x = gait
          ? Math.sin(t * gait + pv.userData.ph) * 0.9 * stand
          : 0;
      });

      lay.forEach(function(m) {
        m.visible = stand < 0.02;
      });
    }

    wsh.position.set(
      wolf.position.x,
      0.15,
      wolf.position.z + 1.5
    );

    wsh.rotation.z = wolf.rotation.y;
  }

  /* ---------- GLB wolf animation ---------- */

  var wsp = 0.35;

  function ease(x) {
    x = cl(x);
    return x * x * (3 - 2 * x);
  }

  function wolfStepN(dt) {
    if (ws === 'sleep') return;

    wt += dt;

    var lie = 0;
    var ts = 0;
    var tspd = 0;
    var PI = Math.PI;

    zs.forEach(function(z) {
      z.material.opacity = 0;
    });

    wolf.scale.setScalar(0.75);

    if (ws === 'wake') {
      hd = 0;

      var kk = ease((wt - 0.5) / 1.0);

      lie = 1 - kk;
      wolf.position.z = wz0 + 8 * kk;

      ts = wt > 0.8 ? 0.3 : 0;

      if (wt >= 1.7) {
        ws = 'out1';
        wt = 0;
        wsp = 0.3;
      }
    } else if (ws === 'out1') {
      hd = wolf.position.z > 12 ? -PI / 2 : 0;
      ts = wsp;
      tspd = 1.2;

      wolf.position.z += wRunV * wsp * dt;

      if (wolf.position.z >= 17) {
        ws = 'out2';
        wt = 0;
      }
    } else if (ws === 'out1') {
      hd = 0;
      ts = wsp;
      tspd = 0.75;

      wolf.position.z += wRunV * wsp * dt;

      if (wolf.position.z >= 17) {
        ws = 'out2';
        wt = 0;
      }
    } else if (ws === 'out2') {
      hd = -PI / 2;
      ts = wsp;
      tspd = 0.75;

      wolf.position.x -= wRunV * wsp * dt;

      if (wolf.position.x <= -80) {
        ws = 'away';
        wt = 0;
        wolf.visible = wsh.visible = false;
      }
    } else if (ws === 'away') {
      if (wt >= 8) {
        ws = 'in1';
        wt = 0;
        wsp = 0.45;

        wolf.position.set(-80, 0, 17);
        wolf.rotation.y = hd = PI / 2;
        wolf.visible = wsh.visible = true;
      }
    } else if (ws === 'in1') {
      hd = PI / 2;
      ts = wsp;
      tspd = wolf.position.x < wx0 - 14 ? 0.45 : 0.12;

      wolf.position.x += wRunV * wsp * dt;

      if (wolf.position.x >= wx0) {
        wolf.position.x = wx0;
        ws = 'in2';
        wt = 0;
      }
    } else if (ws === 'in2') {
      hd = 0;
      ts = wsp * 0.5;
      tspd = 0.1;

      if (wt > 0.8 && Math.abs(wolf.rotation.y) < 0.15) {
        ws = 'settle';
        wt = 0;
      }
    } else if (ws === 'settle') {
      hd = 0;

      var kb = ease(wt / 2.0);

      wolf.position.z = 17 + (wz0 - 17) * kb;

      lie = wt < 0.6
        ? 0.9 * ease(wt / 0.6)
        : 0.9 + 0.1 * ease((wt - 0.6) / 1.4);

      ts = wt < 1.6 ? -0.22 : 0;

      if (wt >= 2.0) {
        ws = 'sleep';
        wt = 0;

        wolf.rotation.set(0, hsl, 0);
        wolf.position.set(wx0, 0, wz0);

        wApply(1, 0, 0);
        return;
      }
    }

    // Velocità di movimento
    wsp += (tspd - wsp) * Math.min(1, dt * 1.8);

    // Rotazione verso la direzione desiderata
    var df = hd - wolf.rotation.y;

    df = Math.atan2(Math.sin(df), Math.cos(df));

    wolf.rotation.y += df * Math.min(
      1,
      dt * (
        (ws === 'wake' || ws === 'settle') ? 4 :
        (ws === 'out1' || ws === 'out2') ? 6 : 9
      )
    );

    // Aggiornamento posa e animazione
    wApply(lie, dt, ts);

    // Aggiornamento ombra
    wsh.position.set(
      wolf.position.x + Math.sin(wolf.rotation.y) * 5,
      0.15,
      wolf.position.z + Math.cos(wolf.rotation.y) * 5
    );

    wsh.rotation.z = wolf.rotation.y;
  }

  /* ---------- speech bubble ---------- */

  function bubble() {
    var on = ws === 'away' && wt > 0.4 && wt < 6.5 && pp < 0.25;

    bEl.classList.toggle('on', on);

    if (!on) return;

    (hbone || head).getWorldPosition(mv);

    mv.y += hbone ? 4 : 7;
    mv.project(cam);

    var hx = (mv.x + 1) / 2 * W;
    var hy = (1 - mv.y) / 2 * H;

    var bw = bEl.offsetWidth;

    var l = Math.min(
      W - bw / 2 - 10,
      Math.max(bw / 2 + 10, hx)
    );

    bEl.style.left = l + 'px';
    bEl.style.top = hy + 'px';

    bEl.style.setProperty(
      '--tx',
      Math.min(
        bw - 16,
        Math.max(16, hx - l + bw / 2)
      ) + 'px'
    );
  }

  /* ---------- animazione ---------- */

var gl=new GLTFLoader(),pm=[];

if(models.man)pm.push(gl.loadAsync(models.man).then(function(g){if(!off)initMan(g)}).catch(function(e){console.warn('walk_cycle',e)}));
if(models.wolf)pm.push(Promise.all([gl.loadAsync(models.wolf),models.wolfTex?new THREE.TextureLoader().loadAsync(models.wolfTex):null]).then(function(r){if(!off)initWolf(r[0],r[1])}).catch(function(e){console.warn('wolf',e)}));
var raf=0,off=false,live=false,tr=0,t=0,last=performance.now(),sp=reduce?0.3:1;
function loop(now){
  if(off)return;
  var dt=Math.min((now-last)/1000,0.05);last=now;t+=dt;if(live)tr+=dt;
  if(poseFn)poseFn(t);
  /* omino che scrive */
  legL.root.rotation.x=legR.root.rotation.x=-1.5;legL.joint.rotation.x=legR.joint.rotation.x=1.5;
  armL.root.rotation.x=armR.root.rotation.x=-0.9;
  armL.joint.rotation.x=-0.9+Math.sin(t*17*sp)*0.12;armR.joint.rotation.x=-0.9+Math.sin(t*17*sp+2)*0.12;
  body.rotation.x=0.1+Math.sin(t*1.6)*0.012;body.rotation.y=Math.sin(t*0.4)*0.06;body.position.y=-9;
  /* schermo */
  tex.offset.y=(t*0.04*sp)%1;pp+=(pt-pp)*(reduce?1:Math.min(1,dt*6));view();glow.intensity=0.95+Math.sin(t*3)*0.1;
  /* lupo che respira e scodinzola piano */
  wolf.scale.set(0.75,0.75*(1+Math.sin(t*1.8)*0.025),0.75);
  tail.rotation.y=Math.sin(t*2*sp)*0.12;
  zs.forEach(function(z,i){var ph=(t*0.3*sp+i/3)%1;z.position.set(zx0+ph*4,zy0+ph*9,zz0);z.scale.set(2+ph*2.4,2+ph*2.4,1);z.material.opacity=Math.sin(ph*Math.PI)*0.85});
  wolfStep(dt);bubble();
  /* blocchi che cadono */
  stack.children.forEach(function(b){var u=b.userData;if(tr<u.d)return;
    if(b.position.y>u.y||u.vy>0){u.vy-=900*dt;b.position.y+=u.vy*dt;
      if(b.position.y<=u.y){b.position.y=u.y;u.vy=Math.abs(u.vy)>60?-u.vy*0.3:0}}});
  renderer.render(scene,cam);raf=requestAnimationFrame(loop);
}
raf=requestAnimationFrame(loop);
var fr=document.fonts&&document.fonts.load?document.fonts.load('500 1em "JetBrains Mono"'):0;
Promise.race([Promise.all([fr,window.__noise].concat(pm)).catch(function(){}),new Promise(function(r){setTimeout(r,2500)})]).then(function(){
  requestAnimationFrame(function(){requestAnimationFrame(function(){if(off)return;live=true;document.documentElement.classList.add('ready')})})});

return function dispose(){
  off=true;cancelAnimationFrame(raf);
  removeEventListener('pointermove',onMove);removeEventListener('click',onClick);removeEventListener('scroll',onS);removeEventListener('resize',resize);
  document.body.style.cursor='';document.documentElement.classList.remove('ready');bEl.classList.remove('on');
  scene.traverse(function(o){
    if(o.geometry)o.geometry.dispose();
    [].concat(o.material||[]).forEach(function(m){if(m.map)m.map.dispose();m.dispose()});
  });
  renderer.dispose();
};

}