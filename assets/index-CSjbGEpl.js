const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/raw-in9isEBO.js","assets/basedecoder-B2c5_Eok.js","assets/lzw-_aCqfs4w.js","assets/jpeg-vtRboCKw.js","assets/deflate-B9JhHpvg.js","assets/pako.esm-Cram60i4.js","assets/packbits-DDWKfGV_.js","assets/lerc-k0H8Yv_y.js","assets/_commonjsHelpers-CE1G-McA.js","assets/index-CBj4SiQI.js","assets/utils-D2Kkhs6D.js","assets/I18N-DlIXJTel.js","assets/index-D_1FImt7.css","assets/MapView-BQD1iWHp.js","assets/TerrainControl-B5pp5Ki3.js","assets/BFormRadioGroup.vue_vue_type_script_setup_true_lang-DaMHx4U3-BvPMDxF_.js","assets/ConditionalWrapper.vue_vue_type_script_lang-IX_NpHH--B-nonVY_.js","assets/useStateClass-BGbSLWFN-DdASCUct.js","assets/TerrainControl-itlxzoCH.css","assets/MapView-D97R3-YG.css","assets/__vite-browser-external-B1O5LaIO.js","assets/webgl-device-9Qb6u2-L.js","assets/webgl-developer-tools-Df1O7IQi.js","assets/webimage-DBgUwIbt.js","assets/decoder-5LfjGLzu.js"])))=>i.map(i=>d[i]);
import{p as zt}from"./MapView-BQD1iWHp.js";import{g as ps}from"./_commonjsHelpers-CE1G-McA.js";import{bp as Et,cz as Ia}from"./index-CBj4SiQI.js";import xi from"./__vite-browser-external-B1O5LaIO.js";import{R as ae,S as Ma,a as xt,g as Oa,r as Ra,b as za,n as Ba,T as Fa,c as ka,d as Da,W as _i}from"./webgl-device-9Qb6u2-L.js";import{u as Na,a4 as Ua,a5 as Ga,a6 as Ks,a7 as nt,a8 as ja,a9 as Bo,aa as Va,ab as $a,ac as Xe,ad as Wa,ae as qa,af as Ha,ag as Fo,ah as Ka,ai as Ya,aj as Za,ak as Xa,al as Ys,am as Ja,an as vi,ao as Qa,ap as tl,aq as el,ar as il,as as sl,at as nl,au as ol,av as rl,aw as al,ax as Zs,ay as ll,c as D,Q as J,p as cl,az as ul,aA as fl,aB as hl,aC as dl,N as Ui,aD as pl,aE as gl,aF as ko,aG as ml,O as it,aH as Do,S as yl,aI as Gi,_ as Je,aJ as bi,d as K,C as yt,aK as xl,A as gs,o as No,aL as _l,w as at,E as vl,aM as St,z as _e,aN as Qe,aO as Bt,aP as Tt,aQ as Ci,aR as Vt,L as bl,aS as Cl,v as ji,y as Uo,aT as de,V as O,aU as wl,aV as Vi,B as Ve,G as Go,K as ti,M as Nt,J as Pl}from"./webgl-developer-tools-Df1O7IQi.js";const Tl="Queued Requests",Ll="Active Requests",Sl="Cancelled Requests",Al="Queued Requests Ever",El="Active Requests Ever",Il={id:"request-scheduler",throttleRequests:!0,maxRequests:6,debounceTime:0};class Ml{props;stats;activeRequestCount=0;requestQueue=[];requestMap=new Map;updateTimer=null;constructor(t={}){this.props={...Il,...t},this.stats=new Na({id:this.props.id}),this.stats.get(Tl),this.stats.get(Ll),this.stats.get(Sl),this.stats.get(Al),this.stats.get(El)}setProps(t){t.throttleRequests!==void 0&&(this.props.throttleRequests=t.throttleRequests),t.maxRequests!==void 0&&(this.props.maxRequests=t.maxRequests),t.debounceTime!==void 0&&(this.props.debounceTime=t.debounceTime)}scheduleRequest(t,e=()=>0){if(!this.props.throttleRequests)return Promise.resolve({done:()=>{}});if(this.requestMap.has(t))return this.requestMap.get(t);const i={handle:t,priority:0,getPriority:e},n=new Promise(o=>(i.resolve=o,i));return this.requestQueue.push(i),this.requestMap.set(t,n),this._issueNewRequests(),n}_issueRequest(t){const{handle:e,resolve:i}=t;let n=!1;const o=()=>{n||(n=!0,this.requestMap.delete(e),this.activeRequestCount--,this._issueNewRequests())};return this.activeRequestCount++,i?i({done:o}):Promise.resolve({done:o})}_issueNewRequests(){this.updateTimer!==null&&clearTimeout(this.updateTimer),this.updateTimer=setTimeout(()=>this._issueNewRequestsAsync(),this.props.debounceTime)}_issueNewRequestsAsync(){this.updateTimer!==null&&clearTimeout(this.updateTimer),this.updateTimer=null;const t=Math.max(this.props.maxRequests-this.activeRequestCount,0);if(t!==0){this._updateAllRequests();for(let e=0;e<t;++e){const i=this.requestQueue.shift();i&&this._issueRequest(i)}}}_updateAllRequests(){const t=this.requestQueue;for(let e=0;e<t.length;++e){const i=t[e];this._updateRequest(i)||(t.splice(e,1),this.requestMap.delete(i.handle),e--)}t.sort((e,i)=>e.priority-i.priority)}_updateRequest(t){return t.priority=t.getPriority(t.handle),t.priority<0?(t.resolve(null),!1):!0}}function Ol(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function Rl(s){return Array.isArray(s)?s.length===0||typeof s[0]=="number":!1}function zl(s){return Ol(s)||Rl(s)}const Bl=`out vec4 transform_output;
void main() {
  transform_output = vec4(0);
}`,Fl=`#version 300 es
${Bl}`;function kl(s){const{input:t,inputChannels:e,output:i}={};if(!t)return Fl;if(!e)throw new Error("inputChannels");const n=Dl(e),o=Nl(t,e);return`#version 300 es
in ${n} ${t};
out vec4 ${i};
void main() {
  ${i} = ${o};
}`}function Dl(s){switch(s){case 1:return"float";case 2:return"vec2";case 3:return"vec3";case 4:return"vec4";default:throw new Error(`invalid channels: ${s}`)}}function Nl(s,t){switch(t){case 1:return`vec4(${s}, 0.0, 0.0, 1.0)`;case 2:return`vec4(${s}, 0.0, 1.0)`;case 3:return`vec4(${s}, 1.0)`;case 4:return s;default:throw new Error(`invalid channels: ${t}`)}}let ve;class ms extends Ua{static get ZERO(){return ve||(ve=new ms(0,0,0,0),Object.freeze(ve)),ve}constructor(t=0,e=0,i=0,n=0){super(-0,-0,-0,-0),Ga(t)&&arguments.length===1?this.copy(t):(Ks.debug&&(nt(t),nt(e),nt(i),nt(n)),this[0]=t,this[1]=e,this[2]=i,this[3]=n)}set(t,e,i,n){return this[0]=t,this[1]=e,this[2]=i,this[3]=n,this.check()}copy(t){return this[0]=t[0],this[1]=t[1],this[2]=t[2],this[3]=t[3],this.check()}fromObject(t){return Ks.debug&&(nt(t.x),nt(t.y),nt(t.z),nt(t.w)),this[0]=t.x,this[1]=t.y,this[2]=t.z,this[3]=t.w,this}toObject(t){return t.x=this[0],t.y=this[1],t.z=this[2],t.w=this[3],t}get ELEMENTS(){return 4}get z(){return this[2]}set z(t){this[2]=nt(t)}get w(){return this[3]}set w(t){this[3]=nt(t)}transform(t){return ja(this,this,t),this.check()}transformByMatrix3(t){return Bo(this,this,t),this.check()}transformByMatrix2(t){return Va(this,this,t),this.check()}transformByQuaternion(t){return $a(this,this,t),this.check()}applyMatrix4(t){return t.transform(this,this),this}}function Ul(){const s=new Xe(9);return Xe!=Float32Array&&(s[1]=0,s[2]=0,s[3]=0,s[5]=0,s[6]=0,s[7]=0),s[0]=1,s[4]=1,s[8]=1,s}function Gl(s,t){if(s===t){const e=t[1],i=t[2],n=t[5];s[1]=t[3],s[2]=t[6],s[3]=e,s[5]=t[7],s[6]=i,s[7]=n}else s[0]=t[0],s[1]=t[3],s[2]=t[6],s[3]=t[1],s[4]=t[4],s[5]=t[7],s[6]=t[2],s[7]=t[5],s[8]=t[8];return s}function jl(s,t){const e=t[0],i=t[1],n=t[2],o=t[3],r=t[4],a=t[5],l=t[6],c=t[7],u=t[8],f=u*r-a*c,h=-u*o+a*l,d=c*o-r*l;let p=e*f+i*h+n*d;return p?(p=1/p,s[0]=f*p,s[1]=(-u*i+n*c)*p,s[2]=(a*i-n*r)*p,s[3]=h*p,s[4]=(u*e-n*l)*p,s[5]=(-a*e+n*o)*p,s[6]=d*p,s[7]=(-c*e+i*l)*p,s[8]=(r*e-i*o)*p,s):null}function Vl(s){const t=s[0],e=s[1],i=s[2],n=s[3],o=s[4],r=s[5],a=s[6],l=s[7],c=s[8];return t*(c*o-r*l)+e*(-c*n+r*a)+i*(l*n-o*a)}function Xs(s,t,e){const i=t[0],n=t[1],o=t[2],r=t[3],a=t[4],l=t[5],c=t[6],u=t[7],f=t[8],h=e[0],d=e[1],p=e[2],g=e[3],y=e[4],v=e[5],_=e[6],C=e[7],w=e[8];return s[0]=h*i+d*r+p*c,s[1]=h*n+d*a+p*u,s[2]=h*o+d*l+p*f,s[3]=g*i+y*r+v*c,s[4]=g*n+y*a+v*u,s[5]=g*o+y*l+v*f,s[6]=_*i+C*r+w*c,s[7]=_*n+C*a+w*u,s[8]=_*o+C*l+w*f,s}function $l(s,t,e){const i=t[0],n=t[1],o=t[2],r=t[3],a=t[4],l=t[5],c=t[6],u=t[7],f=t[8],h=e[0],d=e[1];return s[0]=i,s[1]=n,s[2]=o,s[3]=r,s[4]=a,s[5]=l,s[6]=h*i+d*r+c,s[7]=h*n+d*a+u,s[8]=h*o+d*l+f,s}function Wl(s,t,e){const i=t[0],n=t[1],o=t[2],r=t[3],a=t[4],l=t[5],c=t[6],u=t[7],f=t[8],h=Math.sin(e),d=Math.cos(e);return s[0]=d*i+h*r,s[1]=d*n+h*a,s[2]=d*o+h*l,s[3]=d*r-h*i,s[4]=d*a-h*n,s[5]=d*l-h*o,s[6]=c,s[7]=u,s[8]=f,s}function Js(s,t,e){const i=e[0],n=e[1];return s[0]=i*t[0],s[1]=i*t[1],s[2]=i*t[2],s[3]=n*t[3],s[4]=n*t[4],s[5]=n*t[5],s[6]=t[6],s[7]=t[7],s[8]=t[8],s}function ql(s,t){const e=t[0],i=t[1],n=t[2],o=t[3],r=e+e,a=i+i,l=n+n,c=e*r,u=i*r,f=i*a,h=n*r,d=n*a,p=n*l,g=o*r,y=o*a,v=o*l;return s[0]=1-f-p,s[3]=u-v,s[6]=h+y,s[1]=u+v,s[4]=1-c-p,s[7]=d-g,s[2]=h-y,s[5]=d+g,s[8]=1-c-f,s}var $i;(function(s){s[s.COL0ROW0=0]="COL0ROW0",s[s.COL0ROW1=1]="COL0ROW1",s[s.COL0ROW2=2]="COL0ROW2",s[s.COL1ROW0=3]="COL1ROW0",s[s.COL1ROW1=4]="COL1ROW1",s[s.COL1ROW2=5]="COL1ROW2",s[s.COL2ROW0=6]="COL2ROW0",s[s.COL2ROW1=7]="COL2ROW1",s[s.COL2ROW2=8]="COL2ROW2"})($i||($i={}));const Hl=Object.freeze([1,0,0,0,1,0,0,0,1]);class Q extends Wa{static get IDENTITY(){return Yl()}static get ZERO(){return Kl()}get ELEMENTS(){return 9}get RANK(){return 3}get INDICES(){return $i}constructor(t,...e){super(-0,-0,-0,-0,-0,-0,-0,-0,-0),arguments.length===1&&Array.isArray(t)?this.copy(t):e.length>0?this.copy([t,...e]):this.identity()}copy(t){return this[0]=t[0],this[1]=t[1],this[2]=t[2],this[3]=t[3],this[4]=t[4],this[5]=t[5],this[6]=t[6],this[7]=t[7],this[8]=t[8],this.check()}identity(){return this.copy(Hl)}fromObject(t){return this.check()}fromQuaternion(t){return ql(this,t),this.check()}set(t,e,i,n,o,r,a,l,c){return this[0]=t,this[1]=e,this[2]=i,this[3]=n,this[4]=o,this[5]=r,this[6]=a,this[7]=l,this[8]=c,this.check()}setRowMajor(t,e,i,n,o,r,a,l,c){return this[0]=t,this[1]=n,this[2]=a,this[3]=e,this[4]=o,this[5]=l,this[6]=i,this[7]=r,this[8]=c,this.check()}determinant(){return Vl(this)}transpose(){return Gl(this,this),this.check()}invert(){return jl(this,this),this.check()}multiplyLeft(t){return Xs(this,t,this),this.check()}multiplyRight(t){return Xs(this,this,t),this.check()}rotate(t){return Wl(this,this,t),this.check()}scale(t){return Array.isArray(t)?Js(this,this,t):Js(this,this,[t,t]),this.check()}translate(t){return $l(this,this,t),this.check()}transform(t,e){let i;switch(t.length){case 2:i=Ha(e||[-0,-0],t,this);break;case 3:i=qa(e||[-0,-0,-0],t,this);break;case 4:i=Bo(e||[-0,-0,-0,-0],t,this);break;default:throw new Error("Illegal vector")}return Fo(i,t.length),i}transformVector(t,e){return this.transform(t,e)}transformVector2(t,e){return this.transform(t,e)}transformVector3(t,e){return this.transform(t,e)}}let be,Ce=null;function Kl(){return be||(be=new Q([0,0,0,0,0,0,0,0,0]),Object.freeze(be)),be}function Yl(){return Ce||(Ce=new Q,Object.freeze(Ce)),Ce}function Qs(){const s=new Xe(4);return Xe!=Float32Array&&(s[0]=0,s[1]=0,s[2]=0),s[3]=1,s}function Zl(s){return s[0]=0,s[1]=0,s[2]=0,s[3]=1,s}function jo(s,t,e){e=e*.5;const i=Math.sin(e);return s[0]=i*t[0],s[1]=i*t[1],s[2]=i*t[2],s[3]=Math.cos(e),s}function tn(s,t,e){const i=t[0],n=t[1],o=t[2],r=t[3],a=e[0],l=e[1],c=e[2],u=e[3];return s[0]=i*u+r*a+n*c-o*l,s[1]=n*u+r*l+o*a-i*c,s[2]=o*u+r*c+i*l-n*a,s[3]=r*u-i*a-n*l-o*c,s}function Xl(s,t,e){e*=.5;const i=t[0],n=t[1],o=t[2],r=t[3],a=Math.sin(e),l=Math.cos(e);return s[0]=i*l+r*a,s[1]=n*l+o*a,s[2]=o*l-n*a,s[3]=r*l-i*a,s}function Jl(s,t,e){e*=.5;const i=t[0],n=t[1],o=t[2],r=t[3],a=Math.sin(e),l=Math.cos(e);return s[0]=i*l-o*a,s[1]=n*l+r*a,s[2]=o*l+i*a,s[3]=r*l-n*a,s}function Ql(s,t,e){e*=.5;const i=t[0],n=t[1],o=t[2],r=t[3],a=Math.sin(e),l=Math.cos(e);return s[0]=i*l+n*a,s[1]=n*l-i*a,s[2]=o*l+r*a,s[3]=r*l-o*a,s}function tc(s,t){const e=t[0],i=t[1],n=t[2];return s[0]=e,s[1]=i,s[2]=n,s[3]=Math.sqrt(Math.abs(1-e*e-i*i-n*n)),s}function $e(s,t,e,i){const n=t[0],o=t[1],r=t[2],a=t[3];let l=e[0],c=e[1],u=e[2],f=e[3],h,d,p,g,y;return h=n*l+o*c+r*u+a*f,h<0&&(h=-h,l=-l,c=-c,u=-u,f=-f),1-h>ol?(d=Math.acos(h),y=Math.sin(d),p=Math.sin((1-i)*d)/y,g=Math.sin(i*d)/y):(p=1-i,g=i),s[0]=p*n+g*l,s[1]=p*o+g*c,s[2]=p*r+g*u,s[3]=p*a+g*f,s}function ec(s,t){const e=t[0],i=t[1],n=t[2],o=t[3],r=e*e+i*i+n*n+o*o,a=r?1/r:0;return s[0]=-e*a,s[1]=-i*a,s[2]=-n*a,s[3]=o*a,s}function ic(s,t){return s[0]=-t[0],s[1]=-t[1],s[2]=-t[2],s[3]=t[3],s}function Vo(s,t){const e=t[0]+t[4]+t[8];let i;if(e>0)i=Math.sqrt(e+1),s[3]=.5*i,i=.5/i,s[0]=(t[5]-t[7])*i,s[1]=(t[6]-t[2])*i,s[2]=(t[1]-t[3])*i;else{let n=0;t[4]>t[0]&&(n=1),t[8]>t[n*3+n]&&(n=2);const o=(n+1)%3,r=(n+2)%3;i=Math.sqrt(t[n*3+n]-t[o*3+o]-t[r*3+r]+1),s[n]=.5*i,i=.5/i,s[3]=(t[o*3+r]-t[r*3+o])*i,s[o]=(t[o*3+n]+t[n*3+o])*i,s[r]=(t[r*3+n]+t[n*3+r])*i}return s}const sc=el,nc=sl,oc=Za,rc=il,ac=Ka,lc=Ya,$o=nl,cc=(function(){const s=Xa(),t=Ys(1,0,0),e=Ys(0,1,0);return function(i,n,o){const r=Ja(n,o);return r<-.999999?(vi(s,t,n),Qa(s)<1e-6&&vi(s,e,n),tl(s,s),jo(i,s,Math.PI),i):r>.999999?(i[0]=0,i[1]=0,i[2]=0,i[3]=1,i):(vi(s,n,o),i[0]=s[0],i[1]=s[1],i[2]=s[2],i[3]=1+r,$o(i,i))}})();(function(){const s=Qs(),t=Qs();return function(e,i,n,o,r,a){return $e(s,i,r,a),$e(t,n,o,a),$e(e,s,t,2*a*(1-a)),e}})();(function(){const s=Ul();return function(t,e,i,n){return s[0]=i[0],s[3]=i[1],s[6]=i[2],s[1]=n[0],s[4]=n[1],s[7]=n[2],s[2]=-e[0],s[5]=-e[1],s[8]=-e[2],$o(t,Vo(t,s))}})();const uc=[0,0,0,1];class en extends rl{constructor(t=0,e=0,i=0,n=1){super(-0,-0,-0,-0),Array.isArray(t)&&arguments.length===1?this.copy(t):this.set(t,e,i,n)}copy(t){return this[0]=t[0],this[1]=t[1],this[2]=t[2],this[3]=t[3],this.check()}set(t,e,i,n){return this[0]=t,this[1]=e,this[2]=i,this[3]=n,this.check()}fromObject(t){return this[0]=t.x,this[1]=t.y,this[2]=t.z,this[3]=t.w,this.check()}fromMatrix3(t){return Vo(this,t),this.check()}fromAxisRotation(t,e){return jo(this,t,e),this.check()}identity(){return Zl(this),this.check()}setAxisAngle(t,e){return this.fromAxisRotation(t,e)}get ELEMENTS(){return 4}get x(){return this[0]}set x(t){this[0]=nt(t)}get y(){return this[1]}set y(t){this[1]=nt(t)}get z(){return this[2]}set z(t){this[2]=nt(t)}get w(){return this[3]}set w(t){this[3]=nt(t)}len(){return ac(this)}lengthSquared(){return lc(this)}dot(t){return oc(this,t)}rotationTo(t,e){return cc(this,t,e),this.check()}add(t){return sc(this,this,t),this.check()}calculateW(){return tc(this,this),this.check()}conjugate(){return ic(this,this),this.check()}invert(){return ec(this,this),this.check()}lerp(t,e,i){return i===void 0?this.lerp(this,t,e):(rc(this,t,e,i),this.check())}multiplyRight(t){return tn(this,this,t),this.check()}multiplyLeft(t){return tn(this,t,this),this.check()}normalize(){const t=this.len(),e=t>0?1/t:0;return this[0]=this[0]*e,this[1]=this[1]*e,this[2]=this[2]*e,this[3]=this[3]*e,t===0&&(this[3]=1),this.check()}rotateX(t){return Xl(this,this,t),this.check()}rotateY(t){return Jl(this,this,t),this.check()}rotateZ(t){return Ql(this,this,t),this.check()}scale(t){return nc(this,this,t),this.check()}slerp(t,e,i){let n,o,r;switch(arguments.length){case 1:({start:n=uc,target:o,ratio:r}=t);break;case 2:n=this,o=t,r=e;break;default:n=t,o=e,r=i}return $e(this,n,o,r),this.check()}transformVector4(t,e=new ms){return al(e,t,this),Fo(e,4)}lengthSq(){return this.lengthSquared()}setFromAxisAngle(t,e){return this.setAxisAngle(t,e)}premultiply(t){return this.multiplyLeft(t)}multiply(t){return this.multiplyRight(t)}}const fc=1e-15,hc=1e-20;function Wo(s,t=[],e=0){const i=Math.fround(s),n=s-i;return t[e]=i,t[e+1]=n,t}function dc(s){return s-Math.fround(s)}function pc(s){const t=new Float32Array(32);for(let e=0;e<4;++e)for(let i=0;i<4;++i){const n=e*4+i;Wo(s[i*4+e],t,n*2)}return t}function qo(s,t=!0){return s??t}function Ho(s=[0,0,0],t=!0){return t?s.map(e=>e/255):[...s]}function gc(s,t=!0){const e=Ho(s.slice(0,3),t),i=Number.isFinite(s[3]),n=i?s[3]:1;return[e[0],e[1],e[2],t&&i?n/255:n]}const sn=`
layout(std140) uniform fp64arithmeticUniforms {
  uniform float ONE;
  uniform float SPLIT;
} fp64;

/*
About LUMA_FP64_CODE_ELIMINATION_WORKAROUND

The purpose of this workaround is to prevent shader compilers from
optimizing away necessary arithmetic operations by swapping their sequences
or transform the equation to some 'equivalent' form.

These helpers implement Dekker/Veltkamp-style error tracking. If the compiler
folds constants or reassociates the arithmetic, the high/low split can stop
tracking the rounding error correctly. That failure mode tends to look fine in
simple coordinate setup, but then breaks down inside iterative arithmetic such
as fp64 Mandelbrot loops.

The method is to multiply an artifical variable, ONE, which will be known to
the compiler to be 1 only at runtime. The whole expression is then represented
as a polynomial with respective to ONE. In the coefficients of all terms, only one a
and one b should appear

err = (a + b) * ONE^6 - a * ONE^5 - (a + b) * ONE^4 + a * ONE^3 - b - (a + b) * ONE^2 + a * ONE
*/

float prevent_fp64_optimization(float value) {
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  return value + fp64.ONE * 0.0;
#else
  return value;
#endif
}

// Divide float number to high and low floats to extend fraction bits
vec2 split(float a) {
  // Keep SPLIT as a runtime uniform so the compiler cannot fold the Dekker
  // split into a constant expression and reassociate the recovery steps.
  float split = prevent_fp64_optimization(fp64.SPLIT);
  float t = prevent_fp64_optimization(a * split);
  float temp = t - a;
  float a_hi = t - temp;
  float a_lo = a - a_hi;
  return vec2(a_hi, a_lo);
}

// Divide float number again when high float uses too many fraction bits
vec2 split2(vec2 a) {
  vec2 b = split(a.x);
  b.y += a.y;
  return b;
}

// Special sum operation when a > b
vec2 quickTwoSum(float a, float b) {
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  float sum = (a + b) * fp64.ONE;
  float err = b - (sum - a) * fp64.ONE;
#else
  float sum = a + b;
  float err = b - (sum - a);
#endif
  return vec2(sum, err);
}

// General sum operation
vec2 twoSum(float a, float b) {
  float s = (a + b);
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  float v = (s * fp64.ONE - a) * fp64.ONE;
  float err = (a - (s - v) * fp64.ONE) * fp64.ONE * fp64.ONE * fp64.ONE + (b - v);
#else
  float v = s - a;
  float err = (a - (s - v)) + (b - v);
#endif
  return vec2(s, err);
}

vec2 twoSub(float a, float b) {
  float s = (a - b);
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  float v = (s * fp64.ONE - a) * fp64.ONE;
  float err = (a - (s - v) * fp64.ONE) * fp64.ONE * fp64.ONE * fp64.ONE - (b + v);
#else
  float v = s - a;
  float err = (a - (s - v)) - (b + v);
#endif
  return vec2(s, err);
}

vec2 twoSqr(float a) {
  float prod = a * a;
  vec2 a_fp64 = split(a);
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  float err = ((a_fp64.x * a_fp64.x - prod) * fp64.ONE + 2.0 * a_fp64.x *
    a_fp64.y * fp64.ONE * fp64.ONE) + a_fp64.y * a_fp64.y * fp64.ONE * fp64.ONE * fp64.ONE;
#else
  float err = ((a_fp64.x * a_fp64.x - prod) + 2.0 * a_fp64.x * a_fp64.y) + a_fp64.y * a_fp64.y;
#endif
  return vec2(prod, err);
}

vec2 twoProd(float a, float b) {
  float prod = a * b;
  vec2 a_fp64 = split(a);
  vec2 b_fp64 = split(b);
  // twoProd is especially sensitive because mul_fp64 and div_fp64 both depend
  // on the split terms and cross terms staying in the original evaluation
  // order. If the compiler folds or reassociates them, the low part tends to
  // collapse to zero or NaN on some drivers.
  float highProduct = prevent_fp64_optimization(a_fp64.x * b_fp64.x);
  float crossProduct1 = prevent_fp64_optimization(a_fp64.x * b_fp64.y);
  float crossProduct2 = prevent_fp64_optimization(a_fp64.y * b_fp64.x);
  float lowProduct = prevent_fp64_optimization(a_fp64.y * b_fp64.y);
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  float err1 = (highProduct - prod) * fp64.ONE;
  float err2 = crossProduct1 * fp64.ONE * fp64.ONE;
  float err3 = crossProduct2 * fp64.ONE * fp64.ONE * fp64.ONE;
  float err4 = lowProduct * fp64.ONE * fp64.ONE * fp64.ONE * fp64.ONE;
#else
  float err1 = highProduct - prod;
  float err2 = crossProduct1;
  float err3 = crossProduct2;
  float err4 = lowProduct;
#endif
  float err = ((err1 + err2) + err3) + err4;
  return vec2(prod, err);
}

vec2 sum_fp64(vec2 a, vec2 b) {
  vec2 s, t;
  s = twoSum(a.x, b.x);
  t = twoSum(a.y, b.y);
  s.y += t.x;
  s = quickTwoSum(s.x, s.y);
  s.y += t.y;
  s = quickTwoSum(s.x, s.y);
  return s;
}

vec2 sub_fp64(vec2 a, vec2 b) {
  vec2 s, t;
  s = twoSub(a.x, b.x);
  t = twoSub(a.y, b.y);
  s.y += t.x;
  s = quickTwoSum(s.x, s.y);
  s.y += t.y;
  s = quickTwoSum(s.x, s.y);
  return s;
}

vec2 mul_fp64(vec2 a, vec2 b) {
  vec2 prod = twoProd(a.x, b.x);
  // y component is for the error
  prod.y += a.x * b.y;
#if defined(LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND)
  prod = split2(prod);
#endif
  prod = quickTwoSum(prod.x, prod.y);
  prod.y += a.y * b.x;
#if defined(LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND)
  prod = split2(prod);
#endif
  prod = quickTwoSum(prod.x, prod.y);
  return prod;
}

vec2 div_fp64(vec2 a, vec2 b) {
  float xn = 1.0 / b.x;
#if defined(LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND)
  vec2 yn = mul_fp64(a, vec2(xn, 0));
#else
  vec2 yn = a * xn;
#endif
  float diff = (sub_fp64(a, mul_fp64(b, yn))).x;
  vec2 prod = twoProd(xn, diff);
  return sum_fp64(yn, prod);
}

vec2 sqrt_fp64(vec2 a) {
  if (a.x == 0.0 && a.y == 0.0) return vec2(0.0, 0.0);
  if (a.x < 0.0) return vec2(0.0 / 0.0, 0.0 / 0.0);

  float x = 1.0 / sqrt(a.x);
  float yn = a.x * x;
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  vec2 yn_sqr = twoSqr(yn) * fp64.ONE;
#else
  vec2 yn_sqr = twoSqr(yn);
#endif
  float diff = sub_fp64(a, yn_sqr).x;
  vec2 prod = twoProd(x * 0.5, diff);
#if defined(LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND)
  return sum_fp64(split(yn), prod);
#else
  return sum_fp64(vec2(yn, 0.0), prod);
#endif
}
`,mc=`struct Fp64ArithmeticUniforms {
  ONE: f32,
  SPLIT: f32,
};

@group(0) @binding(auto) var<uniform> fp64arithmetic : Fp64ArithmeticUniforms;

fn fp64_nan(seed: f32) -> f32 {
  let nanBits = 0x7fc00000u | select(0u, 1u, seed < 0.0);
  return bitcast<f32>(nanBits);
}

fn fp64_runtime_zero() -> f32 {
  return fp64arithmetic.ONE * 0.0;
}

fn prevent_fp64_optimization(value: f32) -> f32 {
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  return value + fp64_runtime_zero();
#else
  return value;
#endif
}

fn split(a: f32) -> vec2f {
  let splitValue = prevent_fp64_optimization(fp64arithmetic.SPLIT + fp64_runtime_zero());
  let t = prevent_fp64_optimization(a * splitValue);
  let temp = prevent_fp64_optimization(t - a);
  let aHi = prevent_fp64_optimization(t - temp);
  let aLo = prevent_fp64_optimization(a - aHi);
  return vec2f(aHi, aLo);
}

fn split2(a: vec2f) -> vec2f {
  var b = split(a.x);
  b.y = b.y + a.y;
  return b;
}

fn quickTwoSum(a: f32, b: f32) -> vec2f {
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  let sum = prevent_fp64_optimization((a + b) * fp64arithmetic.ONE);
  let err = prevent_fp64_optimization(b - (sum - a) * fp64arithmetic.ONE);
#else
  let sum = prevent_fp64_optimization(a + b);
  let err = prevent_fp64_optimization(b - (sum - a));
#endif
  return vec2f(sum, err);
}

fn twoSum(a: f32, b: f32) -> vec2f {
  let s = prevent_fp64_optimization(a + b);
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  let v = prevent_fp64_optimization((s * fp64arithmetic.ONE - a) * fp64arithmetic.ONE);
  let err =
    prevent_fp64_optimization((a - (s - v) * fp64arithmetic.ONE) *
      fp64arithmetic.ONE *
      fp64arithmetic.ONE *
      fp64arithmetic.ONE) +
    prevent_fp64_optimization(b - v);
#else
  let v = prevent_fp64_optimization(s - a);
  let err = prevent_fp64_optimization(a - (s - v)) + prevent_fp64_optimization(b - v);
#endif
  return vec2f(s, err);
}

fn twoSub(a: f32, b: f32) -> vec2f {
  let s = prevent_fp64_optimization(a - b);
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  let v = prevent_fp64_optimization((s * fp64arithmetic.ONE - a) * fp64arithmetic.ONE);
  let err =
    prevent_fp64_optimization((a - (s - v) * fp64arithmetic.ONE) *
      fp64arithmetic.ONE *
      fp64arithmetic.ONE *
      fp64arithmetic.ONE) -
    prevent_fp64_optimization(b + v);
#else
  let v = prevent_fp64_optimization(s - a);
  let err = prevent_fp64_optimization(a - (s - v)) - prevent_fp64_optimization(b + v);
#endif
  return vec2f(s, err);
}

fn twoSqr(a: f32) -> vec2f {
  let prod = prevent_fp64_optimization(a * a);
  let aFp64 = split(a);
  let highProduct = prevent_fp64_optimization(aFp64.x * aFp64.x);
  let crossProduct = prevent_fp64_optimization(2.0 * aFp64.x * aFp64.y);
  let lowProduct = prevent_fp64_optimization(aFp64.y * aFp64.y);
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  let err =
    (prevent_fp64_optimization(highProduct - prod) * fp64arithmetic.ONE +
      crossProduct * fp64arithmetic.ONE * fp64arithmetic.ONE) +
    lowProduct * fp64arithmetic.ONE * fp64arithmetic.ONE * fp64arithmetic.ONE;
#else
  let err = ((prevent_fp64_optimization(highProduct - prod) + crossProduct) + lowProduct);
#endif
  return vec2f(prod, err);
}

fn twoProd(a: f32, b: f32) -> vec2f {
  let prod = prevent_fp64_optimization(a * b);
  let aFp64 = split(a);
  let bFp64 = split(b);
  let highProduct = prevent_fp64_optimization(aFp64.x * bFp64.x);
  let crossProduct1 = prevent_fp64_optimization(aFp64.x * bFp64.y);
  let crossProduct2 = prevent_fp64_optimization(aFp64.y * bFp64.x);
  let lowProduct = prevent_fp64_optimization(aFp64.y * bFp64.y);
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  let err1 = (highProduct - prod) * fp64arithmetic.ONE;
  let err2 = crossProduct1 * fp64arithmetic.ONE * fp64arithmetic.ONE;
  let err3 = crossProduct2 * fp64arithmetic.ONE * fp64arithmetic.ONE * fp64arithmetic.ONE;
  let err4 =
    lowProduct *
    fp64arithmetic.ONE *
    fp64arithmetic.ONE *
    fp64arithmetic.ONE *
    fp64arithmetic.ONE;
#else
  let err1 = highProduct - prod;
  let err2 = crossProduct1;
  let err3 = crossProduct2;
  let err4 = lowProduct;
#endif
  let err12InputA = prevent_fp64_optimization(err1);
  let err12InputB = prevent_fp64_optimization(err2);
  let err12 = prevent_fp64_optimization(err12InputA + err12InputB);
  let err123InputA = prevent_fp64_optimization(err12);
  let err123InputB = prevent_fp64_optimization(err3);
  let err123 = prevent_fp64_optimization(err123InputA + err123InputB);
  let err1234InputA = prevent_fp64_optimization(err123);
  let err1234InputB = prevent_fp64_optimization(err4);
  let err = prevent_fp64_optimization(err1234InputA + err1234InputB);
  return vec2f(prod, err);
}

fn sum_fp64(a: vec2f, b: vec2f) -> vec2f {
  var s = twoSum(a.x, b.x);
  let t = twoSum(a.y, b.y);
  s.y = prevent_fp64_optimization(s.y + t.x);
  s = quickTwoSum(s.x, s.y);
  s.y = prevent_fp64_optimization(s.y + t.y);
  s = quickTwoSum(s.x, s.y);
  return s;
}

fn sub_fp64(a: vec2f, b: vec2f) -> vec2f {
  var s = twoSub(a.x, b.x);
  let t = twoSub(a.y, b.y);
  s.y = prevent_fp64_optimization(s.y + t.x);
  s = quickTwoSum(s.x, s.y);
  s.y = prevent_fp64_optimization(s.y + t.y);
  s = quickTwoSum(s.x, s.y);
  return s;
}

fn mul_fp64(a: vec2f, b: vec2f) -> vec2f {
  var prod = twoProd(a.x, b.x);
  let crossProduct1 = prevent_fp64_optimization(a.x * b.y);
  prod.y = prevent_fp64_optimization(prod.y + crossProduct1);
#ifdef LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND
  prod = split2(prod);
#endif
  prod = quickTwoSum(prod.x, prod.y);
  let crossProduct2 = prevent_fp64_optimization(a.y * b.x);
  prod.y = prevent_fp64_optimization(prod.y + crossProduct2);
#ifdef LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND
  prod = split2(prod);
#endif
  prod = quickTwoSum(prod.x, prod.y);
  return prod;
}

fn div_fp64(a: vec2f, b: vec2f) -> vec2f {
  let xn = prevent_fp64_optimization(1.0 / b.x);
  let yn = mul_fp64(a, vec2f(xn, fp64_runtime_zero()));
  let diff = prevent_fp64_optimization(sub_fp64(a, mul_fp64(b, yn)).x);
  let prod = twoProd(xn, diff);
  return sum_fp64(yn, prod);
}

fn sqrt_fp64(a: vec2f) -> vec2f {
  if (a.x == 0.0 && a.y == 0.0) {
    return vec2f(0.0, 0.0);
  }
  if (a.x < 0.0) {
    let nanValue = fp64_nan(a.x);
    return vec2f(nanValue, nanValue);
  }

  let x = prevent_fp64_optimization(1.0 / sqrt(a.x));
  let yn = prevent_fp64_optimization(a.x * x);
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  let ynSqr = twoSqr(yn) * fp64arithmetic.ONE;
#else
  let ynSqr = twoSqr(yn);
#endif
  let diff = prevent_fp64_optimization(sub_fp64(a, ynSqr).x);
  let prod = twoProd(prevent_fp64_optimization(x * 0.5), diff);
#ifdef LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND
  return sum_fp64(split(yn), prod);
#else
  return sum_fp64(vec2f(yn, 0.0), prod);
#endif
}
`,yc={ONE:1,SPLIT:4097},xc={name:"fp64arithmetic",source:mc,fs:sn,vs:sn,defaultUniforms:yc,uniformTypes:{ONE:"f32",SPLIT:"f32"},fp64ify:Wo,fp64LowPart:dc,fp64ifyMatrix4:pc},nn=`layout(std140) uniform floatColorsUniforms {
  float useByteColors;
} floatColors;

vec3 floatColors_normalize(vec3 inputColor) {
  return floatColors.useByteColors > 0.5 ? inputColor / 255.0 : inputColor;
}

vec4 floatColors_normalize(vec4 inputColor) {
  return floatColors.useByteColors > 0.5 ? inputColor / 255.0 : inputColor;
}

vec4 floatColors_premultiplyAlpha(vec4 inputColor) {
  return vec4(inputColor.rgb * inputColor.a, inputColor.a);
}

vec4 floatColors_unpremultiplyAlpha(vec4 inputColor) {
  return inputColor.a > 0.0 ? vec4(inputColor.rgb / inputColor.a, inputColor.a) : vec4(0.0);
}

vec4 floatColors_premultiply_alpha(vec4 inputColor) {
  return floatColors_premultiplyAlpha(inputColor);
}

vec4 floatColors_unpremultiply_alpha(vec4 inputColor) {
  return floatColors_unpremultiplyAlpha(inputColor);
}
`,_c=`struct floatColorsUniforms {
  useByteColors: f32
};

@group(0) @binding(auto) var<uniform> floatColors : floatColorsUniforms;

fn floatColors_normalize(inputColor: vec3<f32>) -> vec3<f32> {
  return select(inputColor, inputColor / 255.0, floatColors.useByteColors > 0.5);
}

fn floatColors_normalize4(inputColor: vec4<f32>) -> vec4<f32> {
  return select(inputColor, inputColor / 255.0, floatColors.useByteColors > 0.5);
}

fn floatColors_premultiplyAlpha(inputColor: vec4<f32>) -> vec4<f32> {
  return vec4<f32>(inputColor.rgb * inputColor.a, inputColor.a);
}

fn floatColors_unpremultiplyAlpha(inputColor: vec4<f32>) -> vec4<f32> {
  return select(
    vec4<f32>(0.0),
    vec4<f32>(inputColor.rgb / inputColor.a, inputColor.a),
    inputColor.a > 0.0
  );
}

fn floatColors_premultiply_alpha(inputColor: vec4<f32>) -> vec4<f32> {
  return floatColors_premultiplyAlpha(inputColor);
}

fn floatColors_unpremultiply_alpha(inputColor: vec4<f32>) -> vec4<f32> {
  return floatColors_unpremultiplyAlpha(inputColor);
}
`,Ko={name:"floatColors",props:{},uniforms:{},vs:nn,fs:nn,source:_c,uniformTypes:{useByteColors:"f32"},defaultUniforms:{useByteColors:!0}},vc=[0,1,1,1],bc=`layout(std140) uniform pickingUniforms {
  float isActive;
  float isAttribute;
  float isHighlightActive;
  float useByteColors;
  vec3 highlightedObjectColor;
  vec4 highlightColor;
} picking;

out vec4 picking_vRGBcolor_Avalid;

// Normalize unsigned byte color to 0-1 range
vec3 picking_normalizeColor(vec3 color) {
  return picking.useByteColors > 0.5 ? color / 255.0 : color;
}

// Normalize unsigned byte color to 0-1 range
vec4 picking_normalizeColor(vec4 color) {
  return picking.useByteColors > 0.5 ? color / 255.0 : color;
}

bool picking_isColorZero(vec3 color) {
  return dot(color, vec3(1.0)) < 0.00001;
}

bool picking_isColorValid(vec3 color) {
  return dot(color, vec3(1.0)) > 0.00001;
}

// Check if this vertex is highlighted 
bool isVertexHighlighted(vec3 vertexColor) {
  vec3 highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
  return
    bool(picking.isHighlightActive) && picking_isColorZero(abs(vertexColor - highlightedObjectColor));
}

// Set the current picking color
void picking_setPickingColor(vec3 pickingColor) {
  pickingColor = picking_normalizeColor(pickingColor);

  if (bool(picking.isActive)) {
    // Use alpha as the validity flag. If pickingColor is [0, 0, 0] fragment is non-pickable
    picking_vRGBcolor_Avalid.a = float(picking_isColorValid(pickingColor));

    if (!bool(picking.isAttribute)) {
      // Stores the picking color so that the fragment shader can render it during picking
      picking_vRGBcolor_Avalid.rgb = pickingColor;
    }
  } else {
    // Do the comparison with selected item color in vertex shader as it should mean fewer compares
    picking_vRGBcolor_Avalid.a = float(isVertexHighlighted(pickingColor));
  }
}

void picking_setPickingAttribute(float value) {
  if (bool(picking.isAttribute)) {
    picking_vRGBcolor_Avalid.r = value;
  }
}

void picking_setPickingAttribute(vec2 value) {
  if (bool(picking.isAttribute)) {
    picking_vRGBcolor_Avalid.rg = value;
  }
}

void picking_setPickingAttribute(vec3 value) {
  if (bool(picking.isAttribute)) {
    picking_vRGBcolor_Avalid.rgb = value;
  }
}
`,Cc=`layout(std140) uniform pickingUniforms {
  float isActive;
  float isAttribute;
  float isHighlightActive;
  float useByteColors;
  vec3 highlightedObjectColor;
  vec4 highlightColor;
} picking;

in vec4 picking_vRGBcolor_Avalid;

/*
 * Returns highlight color if this item is selected.
 */
vec4 picking_filterHighlightColor(vec4 color) {
  // If we are still picking, we don't highlight
  if (picking.isActive > 0.5) {
    return color;
  }

  bool selected = bool(picking_vRGBcolor_Avalid.a);

  if (selected) {
    // Blend in highlight color based on its alpha value
    float highLightAlpha = picking.highlightColor.a;
    float blendedAlpha = highLightAlpha + color.a * (1.0 - highLightAlpha);
    float highLightRatio = highLightAlpha / blendedAlpha;

    vec3 blendedRGB = mix(color.rgb, picking.highlightColor.rgb, highLightRatio);
    return vec4(blendedRGB, blendedAlpha);
  } else {
    return color;
  }
}

/*
 * Returns picking color if picking enabled else unmodified argument.
 */
vec4 picking_filterPickingColor(vec4 color) {
  if (bool(picking.isActive)) {
    if (picking_vRGBcolor_Avalid.a == 0.0) {
      discard;
    }
    return picking_vRGBcolor_Avalid;
  }
  return color;
}

/*
 * Returns picking color if picking is enabled if not
 * highlight color if this item is selected, otherwise unmodified argument.
 */
vec4 picking_filterColor(vec4 color) {
  vec4 highlightColor = picking_filterHighlightColor(color);
  return picking_filterPickingColor(highlightColor);
}
`,on={props:{},uniforms:{},name:"picking",uniformTypes:{isActive:"f32",isAttribute:"f32",isHighlightActive:"f32",useByteColors:"f32",highlightedObjectColor:"vec3<f32>",highlightColor:"vec4<f32>"},defaultUniforms:{isActive:!1,isAttribute:!1,isHighlightActive:!1,useByteColors:!0,highlightedObjectColor:[0,0,0],highlightColor:vc},vs:bc,fs:Cc,getUniforms:wc};function wc(s={},t){const e={},i=qo(s.useByteColors,!0);if(s.highlightedObjectColor!==void 0)if(s.highlightedObjectColor===null)e.isHighlightActive=!1;else{e.isHighlightActive=!0;const n=s.highlightedObjectColor.slice(0,3);e.highlightedObjectColor=n}return s.highlightColor&&(e.highlightColor=gc(s.highlightColor,i)),s.isActive!==void 0&&(e.isActive=!!s.isActive,e.isAttribute=!!s.isAttribute),s.useByteColors!==void 0&&(e.useByteColors=!!s.useByteColors),e}class ei extends Zs{get[Symbol.toStringTag](){return"ComputePipeline"}hash="";shaderLayout;constructor(t,e){super(t,e,ei.defaultProps),this.shaderLayout=e.shaderLayout}static defaultProps={...Zs.defaultProps,shader:void 0,entryPoint:void 0,constants:{},shaderLayout:void 0}}class ys{static defaultProps={...ae.defaultProps};static getDefaultPipelineFactory(t){const e=t.getModuleData("@luma.gl/core");return e.defaultPipelineFactory||=new ys(t),e.defaultPipelineFactory}device;_hashCounter=0;_hashes={};_renderPipelineCache={};_computePipelineCache={};_sharedRenderPipelineCache={};get[Symbol.toStringTag](){return"PipelineFactory"}toString(){return`PipelineFactory(${this.device.id})`}constructor(t){this.device=t}createRenderPipeline(t){if(!this.device.props._cachePipelines)return this.device.createRenderPipeline(t);const e={...ae.defaultProps,...t},i=this._renderPipelineCache,n=this._hashRenderPipeline(e);let o=i[n]?.resource;if(o)i[n].useCount++,this.device.props.debugFactories&&D.log(3,`${this}: ${i[n].resource} reused, count=${i[n].useCount}, (id=${t.id})`)();else{const r=this.device.type==="webgl"&&this.device.props._sharePipelines?this.createSharedRenderPipeline(e):void 0;o=this.device.createRenderPipeline({...e,id:e.id?`${e.id}-cached`:ll("unnamed-cached"),_sharedRenderPipeline:r}),o.hash=n,i[n]={resource:o,useCount:1},this.device.props.debugFactories&&D.log(3,`${this}: ${o} created, count=${i[n].useCount}`)()}return o}createComputePipeline(t){if(!this.device.props._cachePipelines)return this.device.createComputePipeline(t);const e={...ei.defaultProps,...t},i=this._computePipelineCache,n=this._hashComputePipeline(e);let o=i[n]?.resource;return o?(i[n].useCount++,this.device.props.debugFactories&&D.log(3,`${this}: ${i[n].resource} reused, count=${i[n].useCount}, (id=${t.id})`)()):(o=this.device.createComputePipeline({...e,id:e.id?`${e.id}-cached`:void 0}),o.hash=n,i[n]={resource:o,useCount:1},this.device.props.debugFactories&&D.log(3,`${this}: ${o} created, count=${i[n].useCount}`)()),o}release(t){if(!this.device.props._cachePipelines){t.destroy();return}const e=this._getCache(t),i=t.hash;e[i].useCount--,e[i].useCount===0?(this._destroyPipeline(t),this.device.props.debugFactories&&D.log(3,`${this}: ${t} released and destroyed`)()):e[i].useCount<0?(D.error(`${this}: ${t} released, useCount < 0, resetting`)(),e[i].useCount=0):this.device.props.debugFactories&&D.log(3,`${this}: ${t} released, count=${e[i].useCount}`)()}createSharedRenderPipeline(t){const e=this._hashSharedRenderPipeline(t);let i=this._sharedRenderPipelineCache[e];return i||(i={resource:this.device._createSharedRenderPipelineWebGL(t),useCount:0},this._sharedRenderPipelineCache[e]=i),i.useCount++,i.resource}releaseSharedRenderPipeline(t){if(!t.sharedRenderPipeline)return;const e=this._hashSharedRenderPipeline(t.sharedRenderPipeline.props),i=this._sharedRenderPipelineCache[e];i&&(i.useCount--,i.useCount===0&&(i.resource.destroy(),delete this._sharedRenderPipelineCache[e]))}_destroyPipeline(t){const e=this._getCache(t);return this.device.props._destroyPipelines?(delete e[t.hash],t.destroy(),t instanceof ae&&this.releaseSharedRenderPipeline(t),!0):!1}_getCache(t){let e;if(t instanceof ei&&(e=this._computePipelineCache),t instanceof ae&&(e=this._renderPipelineCache),!e)throw new Error(`${this}`);if(!e[t.hash])throw new Error(`${this}: ${t} matched incorrect entry`);return e}_hashComputePipeline(t){const{type:e}=this.device,i=this._getHash(t.shader.source),n=this._getHash(JSON.stringify(t.shaderLayout));return`${e}/C/${i}SL${n}`}_hashRenderPipeline(t){const e=t.vs?this._getHash(t.vs.source):0,i=t.fs?this._getHash(t.fs.source):0,n=this._getWebGLVaryingHash(t),o=this._getHash(JSON.stringify(t.shaderLayout)),r=this._getHash(JSON.stringify(t.bufferLayout)),{type:a}=this.device;if(a==="webgl"){const l=this._getHash(JSON.stringify(t.parameters));return`${a}/R/${e}/${i}V${n}T${t.topology}P${l}SL${o}BL${r}`}else{const c=this._getHash(JSON.stringify({vertexEntryPoint:t.vertexEntryPoint,fragmentEntryPoint:t.fragmentEntryPoint})),u=this._getHash(JSON.stringify(t.parameters)),f=this._getWebGPUAttachmentHash(t);return`${a}/R/${e}/${i}V${n}T${t.topology}EP${c}P${u}SL${o}BL${r}A${f}`}}_hashSharedRenderPipeline(t){const e=t.vs?this._getHash(t.vs.source):0,i=t.fs?this._getHash(t.fs.source):0,n=this._getWebGLVaryingHash(t);return`webgl/S/${e}/${i}V${n}`}_getHash(t){return this._hashes[t]===void 0&&(this._hashes[t]=this._hashCounter++),this._hashes[t]}_getWebGLVaryingHash(t){const{varyings:e=[],bufferMode:i=null}=t;return this._getHash(JSON.stringify({varyings:e,bufferMode:i}))}_getWebGPUAttachmentHash(t){const e=t.colorAttachmentFormats??[this.device.preferredColorFormat],i=t.parameters?.depthWriteEnabled?t.depthStencilAttachmentFormat||this.device.preferredDepthFormat:null;return this._getHash(JSON.stringify({colorAttachmentFormats:e,depthStencilAttachmentFormat:i}))}}class xs{static defaultProps={...Ma.defaultProps};static getDefaultShaderFactory(t){const e=t.getModuleData("@luma.gl/core");return e.defaultShaderFactory||=new xs(t),e.defaultShaderFactory}device;_cache={};get[Symbol.toStringTag](){return"ShaderFactory"}toString(){return`${this[Symbol.toStringTag]}(${this.device.id})`}constructor(t){this.device=t}createShader(t){if(!this.device.props._cacheShaders)return this.device.createShader(t);const e=this._hashShader(t);let i=this._cache[e];if(i)i.useCount++,this.device.props.debugFactories&&D.log(3,`${this}: Reusing shader ${i.resource.id} count=${i.useCount}`)();else{const n=this.device.createShader({...t,id:t.id?`${t.id}-cached`:void 0});this._cache[e]=i={resource:n,useCount:1},this.device.props.debugFactories&&D.log(3,`${this}: Created new shader ${n.id}`)()}return i.resource}release(t){if(!this.device.props._cacheShaders){t.destroy();return}const e=this._hashShader(t),i=this._cache[e];if(i)if(i.useCount--,i.useCount===0)this.device.props._destroyShaders&&(delete this._cache[e],i.resource.destroy(),this.device.props.debugFactories&&D.log(3,`${this}: Releasing shader ${t.id}, destroyed`)());else{if(i.useCount<0)throw new Error(`ShaderFactory: Shader ${t.id} released too many times`);this.device.props.debugFactories&&D.log(3,`${this}: Releasing shader ${t.id} count=${i.useCount}`)()}}_hashShader(t){return`${t.stage}:${t.source}`}}function Pc(s,t={}){const e={...s},i=t.layout??"std140",n={};let o=0;for(const[r,a]of Object.entries(e))o=Wi(n,r,a,o,i);return o=xt(o,At(e,i)),{layout:i,byteLength:o*4,uniformTypes:e,fields:n}}function ai(s,t){const e=Ra(s),i=Oa(e),n=/^mat(\d)x(\d)<.+>$/.exec(e);if(n){const r=Number(n[1]),a=Number(n[2]),l=rn(a,e,i.type),c=Lc(l.size,l.alignment,t);return{alignment:l.alignment,size:r*c,components:r*a,columns:r,rows:a,columnStride:c,shaderType:e,type:i.type}}const o=/^vec(\d)<.+>$/.exec(e);return o?rn(Number(o[1]),e,i.type):{alignment:1,size:1,components:1,columns:1,rows:1,columnStride:1,shaderType:e,type:i.type}}function Yo(s){return!!s&&typeof s=="object"&&!Array.isArray(s)}function Wi(s,t,e,i,n){if(typeof e=="string"){const o=ai(e,n),r=xt(i,o.alignment);return s[t]={offset:r,...o},r+o.size}if(Array.isArray(e)){if(Array.isArray(e[0]))throw new Error(`Nested arrays are not supported for ${t}`);const o=e[0],r=e[1],a=Xo(o,n),l=xt(i,At(e,n));for(let c=0;c<r;c++)Wi(s,`${t}[${c}]`,o,l+c*a,n);return l+a*r}if(Yo(e)){const o=At(e,n);let r=xt(i,o);for(const[a,l]of Object.entries(e))r=Wi(s,`${t}.${a}`,l,r,n);return xt(r,o)}throw new Error(`Unsupported CompositeShaderType for ${t}`)}function Zo(s,t){if(typeof s=="string")return ai(s,t).size;if(Array.isArray(s)){const i=s[0],n=s[1];if(Array.isArray(i))throw new Error("Nested arrays are not supported");return Xo(i,t)*n}let e=0;for(const i of Object.values(s)){const n=i;e=xt(e,At(n,t)),e+=Zo(n,t)}return xt(e,At(s,t))}function At(s,t){if(typeof s=="string")return ai(s,t).alignment;if(Array.isArray(s)){const i=s[0],n=At(i,t);return Jo(t)?Math.max(n,4):n}let e=1;for(const i of Object.values(s)){const n=At(i,t);e=Math.max(e,n)}return Sc(t)?Math.max(e,4):e}function rn(s,t,e,i){return{alignment:s===2?2:4,size:s===3?3:s,components:s,columns:1,rows:s,columnStride:s===3?3:s,shaderType:t,type:e}}function Xo(s,t){const e=Zo(s,t),i=At(s,t);return Tc(e,i,t)}function Tc(s,t,e){return xt(s,Jo(e)?4:t)}function Lc(s,t,e){return e==="std140"?4:xt(s,t)}function Jo(s){return s==="std140"||s==="wgsl-uniform"}function Sc(s){return s==="std140"||s==="wgsl-uniform"}function Ac(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function ii(s){return Array.isArray(s)?s.length===0||typeof s[0]=="number":Ac(s)}class Ec{layout;constructor(t){this.layout=t}has(t){return!!this.layout.fields[t]}get(t){const e=this.layout.fields[t];return e?{offset:e.offset,size:e.size}:void 0}getFlatUniformValues(t){const e={};for(const[i,n]of Object.entries(t)){const o=this.layout.uniformTypes[i];o?this._flattenCompositeValue(e,i,o,n):this.layout.fields[i]&&(e[i]=n)}return e}getData(t){const e=za(this.layout.byteLength);new Uint8Array(e,0,this.layout.byteLength).fill(0);const i={i32:new Int32Array(e),u32:new Uint32Array(e),f32:new Float32Array(e),f16:new Uint16Array(e)},n=this.getFlatUniformValues(t);for(const[o,r]of Object.entries(n))this._writeLeafValue(i,o,r);return new Uint8Array(e,0,this.layout.byteLength)}_flattenCompositeValue(t,e,i,n){if(n!==void 0){if(typeof i=="string"||this.layout.fields[e]){t[e]=n;return}if(Array.isArray(i)){const o=i[0],r=i[1];if(Array.isArray(o))throw new Error(`Nested arrays are not supported for ${e}`);if(typeof o=="string"&&ii(n)){this._flattenPackedArray(t,e,o,r,n);return}if(!Array.isArray(n)){D.warn(`Unsupported uniform array value for ${e}:`,n)();return}for(let a=0;a<Math.min(n.length,r);a++){const l=n[a];l!==void 0&&this._flattenCompositeValue(t,`${e}[${a}]`,o,l)}return}if(Yo(i)&&Ic(n)){for(const[o,r]of Object.entries(n)){if(r===void 0)continue;const a=`${e}.${o}`;this._flattenCompositeValue(t,a,i[o],r)}return}D.warn(`Unsupported uniform value for ${e}:`,n)()}}_flattenPackedArray(t,e,i,n,o){const r=o,l=ai(i,this.layout.layout).components;for(let c=0;c<n;c++){const u=c*l;if(u>=r.length)break;l===1?t[`${e}[${c}]`]=Number(r[u]):t[`${e}[${c}]`]=Mc(o,u,u+l)}}_writeLeafValue(t,e,i){const n=this.layout.fields[e];if(!n){D.warn(`Uniform ${e} not found in layout`)();return}const{type:o,components:r,columns:a,rows:l,offset:c,columnStride:u}=n,f=t[o];if(r===1){f[c]=Number(i);return}const h=i;if(a===1){for(let p=0;p<r;p++)f[c+p]=Number(h[p]??0);return}let d=0;for(let p=0;p<a;p++){const g=c+p*u;for(let y=0;y<l;y++)f[g+y]=Number(h[d++]??0)}}}function Ic(s){return!!s&&typeof s=="object"&&!Array.isArray(s)&&!ArrayBuffer.isView(s)}function Mc(s,t,e){return Array.prototype.slice.call(s,t,e)}const Oc=128;function Rc(s,t,e=16){if(s===t)return!0;const i=s,n=t;if(!ii(i)||!ii(n)||i.length!==n.length)return!1;const o=Math.min(e,Oc);if(i.length>o)return!1;for(let r=0;r<i.length;++r)if(n[r]!==i[r])return!1;return!0}function zc(s){return ii(s)?s.slice():s}class Bc{name;uniforms={};modifiedUniforms={};modified=!0;bindingLayout={};needsRedraw="initialized";constructor(t){if(this.name=t?.name||"unnamed",t?.name&&t?.shaderLayout){const e=t?.shaderLayout.bindings?.find(n=>n.type==="uniform"&&n.name===t?.name);if(!e)throw new Error(t?.name);const i=e;for(const n of i.uniforms||[])this.bindingLayout[n.name]=n}}setUniforms(t){for(const[e,i]of Object.entries(t))this._setUniform(e,i),this.needsRedraw||this.setNeedsRedraw(`${this.name}.${e}=${i}`)}setNeedsRedraw(t){this.needsRedraw=this.needsRedraw||t}getAllUniforms(){return this.modifiedUniforms={},this.needsRedraw=!1,this.uniforms||{}}_setUniform(t,e){Rc(this.uniforms[t],e)||(this.uniforms[t]=zc(e),this.modifiedUniforms[t]=!0,this.modified=!0)}}const Fc=1024;class kc{device;uniformBlocks=new Map;shaderBlockLayouts=new Map;shaderBlockWriters=new Map;uniformBuffers=new Map;constructor(t,e){this.device=t;for(const[i,n]of Object.entries(e)){const o=i,r=Pc(n.uniformTypes??{},{layout:n.layout??Dc(t)}),a=new Ec(r);this.shaderBlockLayouts.set(o,r),this.shaderBlockWriters.set(o,a);const l=new Bc({name:i});l.setUniforms(a.getFlatUniformValues(n.defaultUniforms||{})),this.uniformBlocks.set(o,l)}}destroy(){for(const t of this.uniformBuffers.values())t.destroy()}setUniforms(t){for(const[e,i]of Object.entries(t)){const n=e,r=this.shaderBlockWriters.get(n)?.getFlatUniformValues(i||{});this.uniformBlocks.get(n)?.setUniforms(r||{})}this.updateUniformBuffers()}getUniformBufferByteLength(t){const e=this.shaderBlockLayouts.get(t)?.byteLength||0;return Math.max(e,Fc)}getUniformBufferData(t){const e=this.uniformBlocks.get(t)?.getAllUniforms()||{};return this.shaderBlockWriters.get(t)?.getData(e)||new Uint8Array(0)}createUniformBuffer(t,e){e&&this.setUniforms(e);const i=this.getUniformBufferByteLength(t),n=this.device.createBuffer({usage:J.UNIFORM|J.COPY_DST,byteLength:i}),o=this.getUniformBufferData(t);return n.write(o),n}getManagedUniformBuffer(t){if(!this.uniformBuffers.get(t)){const e=this.getUniformBufferByteLength(t),i=this.device.createBuffer({usage:J.UNIFORM|J.COPY_DST,byteLength:e});this.uniformBuffers.set(t,i)}return this.uniformBuffers.get(t)}updateUniformBuffers(){let t=!1;for(const e of this.uniformBlocks.keys()){const i=this.updateUniformBuffer(e);t||=i}return t&&D.log(3,`UniformStore.updateUniformBuffers(): ${t}`)(),t}updateUniformBuffer(t){const e=this.uniformBlocks.get(t);let i=this.uniformBuffers.get(t),n=!1;if(i&&e?.needsRedraw){n||=e.needsRedraw;const o=this.getUniformBufferData(t);i=this.uniformBuffers.get(t),i?.write(o);const r=this.uniformBlocks.get(t)?.getAllUniforms();D.log(4,`Writing to uniform buffer ${String(t)}`,o,r)()}return n}}function Dc(s){return s.type==="webgpu"?"wgsl-uniform":"std140"}const an=`precision highp int;

// #if (defined(SHADER_TYPE_FRAGMENT) && defined(LIGHTING_FRAGMENT)) || (defined(SHADER_TYPE_VERTEX) && defined(LIGHTING_VERTEX))
struct AmbientLight {
  vec3 color;
};

struct PointLight {
  vec3 color;
  vec3 position;
  vec3 attenuation; // 2nd order x:Constant-y:Linear-z:Exponential
};

struct SpotLight {
  vec3 color;
  vec3 position;
  vec3 direction;
  vec3 attenuation;
  vec2 coneCos;
};

struct DirectionalLight {
  vec3 color;
  vec3 direction;
};

struct UniformLight {
  vec3 color;
  vec3 position;
  vec3 direction;
  vec3 attenuation;
  vec2 coneCos;
};

layout(std140) uniform lightingUniforms {
  int enabled;
  int directionalLightCount;
  int pointLightCount;
  int spotLightCount;
  vec3 ambientColor;
  UniformLight lights[5];
} lighting;

PointLight lighting_getPointLight(int index) {
  UniformLight light = lighting.lights[index];
  return PointLight(light.color, light.position, light.attenuation);
}

SpotLight lighting_getSpotLight(int index) {
  UniformLight light = lighting.lights[lighting.pointLightCount + index];
  return SpotLight(light.color, light.position, light.direction, light.attenuation, light.coneCos);
}

DirectionalLight lighting_getDirectionalLight(int index) {
  UniformLight light =
    lighting.lights[lighting.pointLightCount + lighting.spotLightCount + index];
  return DirectionalLight(light.color, light.direction);
}

float getPointLightAttenuation(PointLight pointLight, float distance) {
  return pointLight.attenuation.x
       + pointLight.attenuation.y * distance
       + pointLight.attenuation.z * distance * distance;
}

float getSpotLightAttenuation(SpotLight spotLight, vec3 positionWorldspace) {
  vec3 light_direction = normalize(positionWorldspace - spotLight.position);
  float coneFactor = smoothstep(
    spotLight.coneCos.y,
    spotLight.coneCos.x,
    dot(normalize(spotLight.direction), light_direction)
  );
  float distanceAttenuation = getPointLightAttenuation(
    PointLight(spotLight.color, spotLight.position, spotLight.attenuation),
    distance(spotLight.position, positionWorldspace)
  );
  return distanceAttenuation / max(coneFactor, 0.0001);
}

// #endif
`,Nc=`// #if (defined(SHADER_TYPE_FRAGMENT) && defined(LIGHTING_FRAGMENT)) || (defined(SHADER_TYPE_VERTEX) && defined(LIGHTING_VERTEX))
const MAX_LIGHTS: i32 = 5;

struct AmbientLight {
  color: vec3<f32>,
};

struct PointLight {
  color: vec3<f32>,
  position: vec3<f32>,
  attenuation: vec3<f32>, // 2nd order x:Constant-y:Linear-z:Exponential
};

struct SpotLight {
  color: vec3<f32>,
  position: vec3<f32>,
  direction: vec3<f32>,
  attenuation: vec3<f32>,
  coneCos: vec2<f32>,
};

struct DirectionalLight {
  color: vec3<f32>,
  direction: vec3<f32>,
};

struct UniformLight {
  color: vec3<f32>,
  position: vec3<f32>,
  direction: vec3<f32>,
  attenuation: vec3<f32>,
  coneCos: vec2<f32>,
};

struct lightingUniforms {
  enabled: i32,
  directionalLightCount: i32,
  pointLightCount: i32,
  spotLightCount: i32,
  ambientColor: vec3<f32>,
  lights: array<UniformLight, 5>,
};

@group(2) @binding(auto) var<uniform> lighting : lightingUniforms;

fn lighting_getPointLight(index: i32) -> PointLight {
  let light = lighting.lights[index];
  return PointLight(light.color, light.position, light.attenuation);
}

fn lighting_getSpotLight(index: i32) -> SpotLight {
  let light = lighting.lights[lighting.pointLightCount + index];
  return SpotLight(light.color, light.position, light.direction, light.attenuation, light.coneCos);
}

fn lighting_getDirectionalLight(index: i32) -> DirectionalLight {
  let light = lighting.lights[lighting.pointLightCount + lighting.spotLightCount + index];
  return DirectionalLight(light.color, light.direction);
}

fn getPointLightAttenuation(pointLight: PointLight, distance: f32) -> f32 {
  return pointLight.attenuation.x
       + pointLight.attenuation.y * distance
       + pointLight.attenuation.z * distance * distance;
}

fn getSpotLightAttenuation(spotLight: SpotLight, positionWorldspace: vec3<f32>) -> f32 {
  let lightDirection = normalize(positionWorldspace - spotLight.position);
  let coneFactor = smoothstep(
    spotLight.coneCos.y,
    spotLight.coneCos.x,
    dot(normalize(spotLight.direction), lightDirection)
  );
  let distanceAttenuation = getPointLightAttenuation(
    PointLight(spotLight.color, spotLight.position, spotLight.attenuation),
    distance(spotLight.position, positionWorldspace)
  );
  return distanceAttenuation / max(coneFactor, 0.0001);
}
`,Ot=5,Uc={color:"vec3<f32>",position:"vec3<f32>",direction:"vec3<f32>",attenuation:"vec3<f32>",coneCos:"vec2<f32>"},Qo={props:{},uniforms:{},name:"lighting",defines:{},uniformTypes:{enabled:"i32",directionalLightCount:"i32",pointLightCount:"i32",spotLightCount:"i32",ambientColor:"vec3<f32>",lights:[Uc,Ot]},defaultUniforms:We(),bindingLayout:[{name:"lighting",group:2}],firstBindingSlot:0,source:Nc,vs:an,fs:an,getUniforms:Gc};function Gc(s,t={}){if(s=s&&{...s},!s)return We();s.lights&&(s={...s,...Vc(s.lights),lights:void 0});const{useByteColors:e,ambientLight:i,pointLights:n,spotLights:o,directionalLights:r}=s||{};if(!(i||n&&n.length>0||o&&o.length>0||r&&r.length>0))return{...We(),enabled:0};const l={...We(),...jc({useByteColors:e,ambientLight:i,pointLights:n,spotLights:o,directionalLights:r})};return s.enabled!==void 0&&(l.enabled=s.enabled?1:0),l}function jc({useByteColors:s,ambientLight:t,pointLights:e=[],spotLights:i=[],directionalLights:n=[]}){const o=tr();let r=0,a=0,l=0,c=0;for(const u of e){if(r>=Ot)break;o[r]={...o[r],color:we(u,s),position:u.position,attenuation:u.attenuation||[1,0,0]},r++,a++}for(const u of i){if(r>=Ot)break;o[r]={...o[r],color:we(u,s),position:u.position,direction:u.direction,attenuation:u.attenuation||[1,0,0],coneCos:Wc(u)},r++,l++}for(const u of n){if(r>=Ot)break;o[r]={...o[r],color:we(u,s),direction:u.direction},r++,c++}return e.length+i.length+n.length>Ot&&D.warn(`MAX_LIGHTS exceeded, truncating to ${Ot}`)(),{ambientColor:we(t,s),directionalLightCount:c,pointLightCount:a,spotLightCount:l,lights:o}}function Vc(s){const t={pointLights:[],spotLights:[],directionalLights:[]};for(const e of s||[])switch(e.type){case"ambient":t.ambientLight=e;break;case"directional":t.directionalLights?.push(e);break;case"point":t.pointLights?.push(e);break;case"spot":t.spotLights?.push(e);break}return t}function we(s={},t){const{color:e=[0,0,0],intensity:i=1}=s;return Ho(e,qo(t,!0)).map(o=>o*i)}function We(){return{enabled:1,directionalLightCount:0,pointLightCount:0,spotLightCount:0,ambientColor:[.1,.1,.1],lights:tr()}}function tr(){return Array.from({length:Ot},()=>$c())}function $c(){return{color:[1,1,1],position:[1,1,2],direction:[1,1,1],attenuation:[1,0,0],coneCos:[1,0]}}function Wc(s){const t=s.innerConeAngle??0,e=s.outerConeAngle??Math.PI/4;return[Math.cos(t),Math.cos(e)]}const er=`layout(std140) uniform phongMaterialUniforms {
  uniform bool unlit;
  uniform float ambient;
  uniform float diffuse;
  uniform float shininess;
  uniform vec3  specularColor;
} material;
`,ir=`layout(std140) uniform phongMaterialUniforms {
  uniform bool unlit;
  uniform float ambient;
  uniform float diffuse;
  uniform float shininess;
  uniform vec3  specularColor;
} material;

vec3 lighting_getLightColor(vec3 surfaceColor, vec3 light_direction, vec3 view_direction, vec3 normal_worldspace, vec3 color) {
  vec3 halfway_direction = normalize(light_direction + view_direction);
  float lambertian = dot(light_direction, normal_worldspace);
  float specular = 0.0;
  if (lambertian > 0.0) {
    float specular_angle = max(dot(normal_worldspace, halfway_direction), 0.0);
    specular = pow(specular_angle, material.shininess);
  }
  lambertian = max(lambertian, 0.0);
  return (lambertian * material.diffuse * surfaceColor + specular * floatColors_normalize(material.specularColor)) * color;
}

vec3 lighting_getLightColor(vec3 surfaceColor, vec3 cameraPosition, vec3 position_worldspace, vec3 normal_worldspace) {
  vec3 lightColor = surfaceColor;

  if (material.unlit) {
    return surfaceColor;
  }

  if (lighting.enabled == 0) {
    return lightColor;
  }

  vec3 view_direction = normalize(cameraPosition - position_worldspace);
  lightColor = material.ambient * surfaceColor * lighting.ambientColor;

  for (int i = 0; i < lighting.pointLightCount; i++) {
    PointLight pointLight = lighting_getPointLight(i);
    vec3 light_position_worldspace = pointLight.position;
    vec3 light_direction = normalize(light_position_worldspace - position_worldspace);
    float light_attenuation = getPointLightAttenuation(pointLight, distance(light_position_worldspace, position_worldspace));
    lightColor += lighting_getLightColor(surfaceColor, light_direction, view_direction, normal_worldspace, pointLight.color / light_attenuation);
  }

  for (int i = 0; i < lighting.spotLightCount; i++) {
    SpotLight spotLight = lighting_getSpotLight(i);
    vec3 light_position_worldspace = spotLight.position;
    vec3 light_direction = normalize(light_position_worldspace - position_worldspace);
    float light_attenuation = getSpotLightAttenuation(spotLight, position_worldspace);
    lightColor += lighting_getLightColor(surfaceColor, light_direction, view_direction, normal_worldspace, spotLight.color / light_attenuation);
  }

  for (int i = 0; i < lighting.directionalLightCount; i++) {
    DirectionalLight directionalLight = lighting_getDirectionalLight(i);
    lightColor += lighting_getLightColor(surfaceColor, -directionalLight.direction, view_direction, normal_worldspace, directionalLight.color);
  }
  
  return lightColor;
}
`,sr=`struct phongMaterialUniforms {
  unlit: u32,
  ambient: f32,
  diffuse: f32,
  shininess: f32,
  specularColor: vec3<f32>,
};

@group(3) @binding(auto) var<uniform> phongMaterial : phongMaterialUniforms;

fn lighting_getLightColor(surfaceColor: vec3<f32>, light_direction: vec3<f32>, view_direction: vec3<f32>, normal_worldspace: vec3<f32>, color: vec3<f32>) -> vec3<f32> {
  let halfway_direction: vec3<f32> = normalize(light_direction + view_direction);
  var lambertian: f32 = dot(light_direction, normal_worldspace);
  var specular: f32 = 0.0;
  if (lambertian > 0.0) {
    let specular_angle = max(dot(normal_worldspace, halfway_direction), 0.0);
    specular = pow(specular_angle, phongMaterial.shininess);
  }
  lambertian = max(lambertian, 0.0);
  return (
    lambertian * phongMaterial.diffuse * surfaceColor +
    specular * floatColors_normalize(phongMaterial.specularColor)
  ) * color;
}

fn lighting_getLightColor2(surfaceColor: vec3<f32>, cameraPosition: vec3<f32>, position_worldspace: vec3<f32>, normal_worldspace: vec3<f32>) -> vec3<f32> {
  var lightColor: vec3<f32> = surfaceColor;

  if (phongMaterial.unlit != 0u) {
    return surfaceColor;
  }

  if (lighting.enabled == 0) {
    return lightColor;
  }

  let view_direction: vec3<f32> = normalize(cameraPosition - position_worldspace);
  lightColor = phongMaterial.ambient * surfaceColor * lighting.ambientColor;

  for (var i: i32 = 0; i < lighting.pointLightCount; i++) {
    let pointLight: PointLight = lighting_getPointLight(i);
    let light_position_worldspace: vec3<f32> = pointLight.position;
    let light_direction: vec3<f32> = normalize(light_position_worldspace - position_worldspace);
    let light_attenuation = getPointLightAttenuation(
      pointLight,
      distance(light_position_worldspace, position_worldspace)
    );
    lightColor += lighting_getLightColor(
      surfaceColor,
      light_direction,
      view_direction,
      normal_worldspace,
      pointLight.color / light_attenuation
    );
  }

  for (var i: i32 = 0; i < lighting.spotLightCount; i++) {
    let spotLight: SpotLight = lighting_getSpotLight(i);
    let light_position_worldspace: vec3<f32> = spotLight.position;
    let light_direction: vec3<f32> = normalize(light_position_worldspace - position_worldspace);
    let light_attenuation = getSpotLightAttenuation(spotLight, position_worldspace);
    lightColor += lighting_getLightColor(
      surfaceColor,
      light_direction,
      view_direction,
      normal_worldspace,
      spotLight.color / light_attenuation
    );
  }

  for (var i: i32 = 0; i < lighting.directionalLightCount; i++) {
    let directionalLight: DirectionalLight = lighting_getDirectionalLight(i);
    lightColor += lighting_getLightColor(surfaceColor, -directionalLight.direction, view_direction, normal_worldspace, directionalLight.color);
  }  
  
  return lightColor;
}

fn lighting_getSpecularLightColor(cameraPosition: vec3<f32>, position_worldspace: vec3<f32>, normal_worldspace: vec3<f32>) -> vec3<f32>{
  var lightColor = vec3<f32>(0, 0, 0);
  let surfaceColor = vec3<f32>(0, 0, 0);

  if (lighting.enabled != 0) {
    let view_direction = normalize(cameraPosition - position_worldspace);

    for (var i: i32 = 0; i < lighting.pointLightCount; i++) {
      let pointLight: PointLight = lighting_getPointLight(i);
      let light_position_worldspace: vec3<f32> = pointLight.position;
      let light_direction: vec3<f32> = normalize(light_position_worldspace - position_worldspace);
      let light_attenuation = getPointLightAttenuation(
        pointLight,
        distance(light_position_worldspace, position_worldspace)
      );
      lightColor += lighting_getLightColor(
        surfaceColor,
        light_direction,
        view_direction,
        normal_worldspace,
        pointLight.color / light_attenuation
      );
    }

    for (var i: i32 = 0; i < lighting.spotLightCount; i++) {
      let spotLight: SpotLight = lighting_getSpotLight(i);
      let light_position_worldspace: vec3<f32> = spotLight.position;
      let light_direction: vec3<f32> = normalize(light_position_worldspace - position_worldspace);
      let light_attenuation = getSpotLightAttenuation(spotLight, position_worldspace);
      lightColor += lighting_getLightColor(
        surfaceColor,
        light_direction,
        view_direction,
        normal_worldspace,
        spotLight.color / light_attenuation
      );
    }

    for (var i: i32 = 0; i < lighting.directionalLightCount; i++) {
        let directionalLight: DirectionalLight = lighting_getDirectionalLight(i);
        lightColor += lighting_getLightColor(surfaceColor, -directionalLight.direction, view_direction, normal_worldspace, directionalLight.color);
    }
  }
  return lightColor;
}
`,qc=[38.25,38.25,38.25],nr={props:{},name:"gouraudMaterial",bindingLayout:[{name:"gouraudMaterial",group:3}],vs:ir.replace("phongMaterial","gouraudMaterial"),fs:er.replace("phongMaterial","gouraudMaterial"),source:sr.replaceAll("phongMaterial","gouraudMaterial"),defines:{LIGHTING_VERTEX:!0},dependencies:[Qo,Ko],uniformTypes:{unlit:"i32",ambient:"f32",diffuse:"f32",shininess:"f32",specularColor:"vec3<f32>"},defaultUniforms:{unlit:!1,ambient:.35,diffuse:.6,shininess:32,specularColor:qc},getUniforms(s){return{...nr.defaultUniforms,...s}}},Hc=[38.25,38.25,38.25],or={name:"phongMaterial",firstBindingSlot:0,bindingLayout:[{name:"phongMaterial",group:3}],dependencies:[Qo,Ko],source:sr,vs:er,fs:ir,defines:{LIGHTING_FRAGMENT:!0},uniformTypes:{unlit:"i32",ambient:"f32",diffuse:"f32",shininess:"f32",specularColor:"vec3<f32>"},defaultUniforms:{unlit:!1,ambient:.35,diffuse:.6,shininess:32,specularColor:Hc},getUniforms(s){return{...or.defaultUniforms,...s}}},Kc=`

@must_use
fn deckgl_premultiplied_alpha(fragColor: vec4<f32>) -> vec4<f32> {
    return vec4(fragColor.rgb * fragColor.a, fragColor.a); 
};
`,rr={name:"color",dependencies:[],source:Kc,getUniforms:s=>({})},Yc=`// Define a structure to hold both the clip-space position and the common position.
struct ProjectResult {
  clipPosition: vec4<f32>,
  commonPosition: vec4<f32>,
};

// This function mimics the GLSL version with the 'out' parameter by returning both values.
fn project_position_to_clipspace_and_commonspace(
    position: vec3<f32>,
    position64Low: vec3<f32>,
    offset: vec3<f32>
) -> ProjectResult {
  // Compute the projected position.
  let projectedPosition: vec3<f32> = project_position_vec3_f64(position, position64Low);

  // Start with the provided offset.
  var finalOffset: vec3<f32> = offset;

  // Get whether a rotation is needed and the rotation matrix.
  let rotationResult = project_needs_rotation(projectedPosition);

  // If rotation is needed, update the offset.
  if (rotationResult.needsRotation) {
    finalOffset = rotationResult.transform * offset;
  }

  // Compute the common position.
  let commonPosition: vec4<f32> = vec4<f32>(projectedPosition + finalOffset, 1.0);

  // Convert to clip-space.
  let clipPosition: vec4<f32> = project_common_position_to_clipspace(commonPosition);

  return ProjectResult(clipPosition, commonPosition);
}

// A convenience overload that returns only the clip-space position.
fn project_position_to_clipspace(
    position: vec3<f32>,
    position64Low: vec3<f32>,
    offset: vec3<f32>
) -> vec4<f32> {
  return project_position_to_clipspace_and_commonspace(position, position64Low, offset).clipPosition;
}
`,Zc=`vec4 project_position_to_clipspace(
  vec3 position, vec3 position64Low, vec3 offset, out vec4 commonPosition
) {
  vec3 projectedPosition = project_position(position, position64Low);
  mat3 rotation;
  if (project_needs_rotation(projectedPosition, rotation)) {
    // offset is specified as ENU
    // when in globe projection, rotate offset so that the ground alighs with the surface of the globe
    offset = rotation * offset;
  }
  commonPosition = vec4(projectedPosition + offset, 1.0);
  return project_common_position_to_clipspace(commonPosition);
}

vec4 project_position_to_clipspace(
  vec3 position, vec3 position64Low, vec3 offset
) {
  vec4 commonPosition;
  return project_position_to_clipspace(position, position64Low, offset, commonPosition);
}
`,Kt={name:"project32",dependencies:[cl],source:Yc,vs:Zc},Xc=`struct pickingUniforms {
  isActive: f32,
  isAttribute: f32,
  isHighlightActive: f32,
  useByteColors: f32,
  highlightedObjectColor: vec3<f32>,
  highlightColor: vec4<f32>,
};

@group(0) @binding(auto) var<uniform> picking: pickingUniforms;

fn picking_normalizeColor(color: vec3<f32>) -> vec3<f32> {
  return select(color, color / 255.0, picking.useByteColors > 0.5);
}

fn picking_normalizeColor4(color: vec4<f32>) -> vec4<f32> {
  return select(color, color / 255.0, picking.useByteColors > 0.5);
}

fn picking_isColorZero(color: vec3<f32>) -> bool {
  return dot(color, vec3<f32>(1.0)) < 0.00001;
}

fn picking_isColorValid(color: vec3<f32>) -> bool {
  return dot(color, vec3<f32>(1.0)) > 0.00001;
}
`,Yt={...on,source:Xc,defaultUniforms:{...on.defaultUniforms,useByteColors:!0},inject:{"vs:DECKGL_FILTER_GL_POSITION":`
    // for picking depth values
    picking_setPickingAttribute(position.z / position.w);
  `,"vs:DECKGL_FILTER_COLOR":`
  picking_setPickingColor(geometry.pickingColor);
  `,"fs:DECKGL_FILTER_COLOR":{order:99,injection:`
  // use highlight color if this fragment belongs to the selected object.
  color = picking_filterHighlightColor(color);

  // use picking color if rendering to picking FBO.
  color = picking_filterPickingColor(color);
    `}}},ln=[0,0,0];function wi(s,t,e=!1){const i=t.projectPosition(s);if(e&&t instanceof Ui){const[n,o,r=0]=s,a=t.getDistanceScales([n,o]);i[2]=r*a.unitsPerMeter[2]}return i}function Jc(s){const{viewport:t,modelMatrix:e,coordinateOrigin:i}=s;let{coordinateSystem:n,fromCoordinateSystem:o,fromCoordinateOrigin:r}=s;return n==="default"&&(n=t.isGeospatial?"lnglat":"cartesian"),o===void 0?o=n:o==="default"&&(o=t.isGeospatial?"lnglat":"cartesian"),r===void 0&&(r=i),{viewport:t,coordinateSystem:n,coordinateOrigin:i,modelMatrix:e,fromCoordinateSystem:o,fromCoordinateOrigin:r}}function _s(s,{viewport:t,modelMatrix:e,coordinateSystem:i,coordinateOrigin:n,offsetMode:o}){let[r,a,l=0]=s;switch(e&&([r,a,l]=ul([],[r,a,l,1],e)),i){case"default":return _s(s,{viewport:t,modelMatrix:e,coordinateSystem:t.isGeospatial?"lnglat":"cartesian",coordinateOrigin:n,offsetMode:o});case"lnglat":return wi([r,a,l],t,o);case"lnglat-offsets":return wi([r+n[0],a+n[1],l+(n[2]||0)],t,o);case"meter-offsets":return wi(fl(n,[r,a,l]),t,o);case"cartesian":return t.isGeospatial?[r+n[0],a+n[1],l+n[2]]:t.projectPosition([r,a,l]);default:throw new Error(`Invalid coordinateSystem: ${i}`)}}function Qc(s,t){const{viewport:e,coordinateSystem:i,coordinateOrigin:n,modelMatrix:o,fromCoordinateSystem:r,fromCoordinateOrigin:a}=Jc(t),{autoOffset:l=!0}=t,{geospatialOrigin:c=ln,shaderCoordinateOrigin:u=ln,offsetMode:f=!1}=l?hl(e,i,n):{},h=_s(s,{viewport:e,modelMatrix:o,coordinateSystem:r,coordinateOrigin:a,offsetMode:f});if(f){const d=e.projectPosition(c||u);dl(h,h,d)}return h}const Pi={};function li(s="id"){Pi[s]=Pi[s]||1;const t=Pi[s]++;return`${s}-${t}`}class cn{id;userData={};topology;bufferLayout=[];vertexCount;indices;attributes;constructor(t){if(this.id=t.id||li("geometry"),this.topology=t.topology,this.indices=t.indices||null,this.attributes=t.attributes,this.vertexCount=t.vertexCount,this.bufferLayout=t.bufferLayout||[],this.indices&&!(this.indices.usage&J.INDEX))throw new Error("Index buffer must have INDEX usage")}destroy(){this.indices?.destroy();for(const t of Object.values(this.attributes))t.destroy()}getVertexCount(){return this.vertexCount}getAttributes(){return this.attributes}getIndexes(){return this.indices||null}_calculateVertexCount(t){return t.byteLength/12}}function tu(s,t){if(t instanceof cn)return t;const e=eu(s,t),{attributes:i,bufferLayout:n}=iu(s,t);return new cn({topology:t.topology||"triangle-list",bufferLayout:n,vertexCount:t.vertexCount,indices:e,attributes:i})}function eu(s,t){if(!t.indices)return;const e=t.indices.value;return s.createBuffer({usage:J.INDEX,data:e})}function iu(s,t){const e=[],i={};for(const[o,r]of Object.entries(t.attributes)){let a=o;switch(o){case"POSITION":a="positions";break;case"NORMAL":a="normals";break;case"TEXCOORD_0":a="texCoords";break;case"TEXCOORD_1":a="texCoords1";break;case"COLOR_0":a="colors";break}if(r){i[a]=s.createBuffer({data:r.value,id:`${o}-buffer`});const{value:l,size:c,normalized:u}=r;if(c===void 0)throw new Error(`Attribute ${o} is missing a size`);e.push({name:a,format:pl.getVertexFormatFromAttribute(l,c,u)})}}const n=t._calculateVertexCount(t.attributes,t.indices);return{attributes:i,bufferLayout:e,vertexCount:n}}function su(s,t){const e={},i="Values";if(s.attributes.length===0&&!s.varyings?.length)return{"No attributes or varyings":{[i]:"N/A"}};for(const n of s.attributes)if(n){const o=`${n.location} ${n.name}: ${n.type}`;e[`in ${o}`]={[i]:n.stepMode||"vertex"}}for(const n of s.varyings||[]){const o=`${n.location} ${n.name}`;e[`out ${o}`]={[i]:JSON.stringify(n)}}return e}const un="__debugFramebufferState",Ti=8;function nu(s,t,e){if(s.device.type!=="webgl")return;const i=au(s.device);if(!i.flushing){if(cu(s)){ou(s,e,i);return}t&&lu(t)&&t.handle!==null&&(i.queuedFramebuffers.includes(t)||i.queuedFramebuffers.push(t))}}function ou(s,t,e){if(e.queuedFramebuffers.length===0)return;const i=s.device,{gl:n}=i,o=n.getParameter(36010),r=n.getParameter(36006),[a,l]=s.device.getDefaultCanvasContext().getDrawingBufferSize();let c=fn(t.top,Ti);const u=fn(t.left,Ti);e.flushing=!0;try{for(const f of e.queuedFramebuffers){const[h,d,p,g,y]=ru({framebuffer:f,targetWidth:a,targetHeight:l,topPx:c,leftPx:u,minimap:t.minimap});n.bindFramebuffer(36008,f.handle),n.bindFramebuffer(36009,null),n.blitFramebuffer(0,0,f.width,f.height,h,d,p,g,16384,9728),c+=y+Ti}}finally{n.bindFramebuffer(36008,o),n.bindFramebuffer(36009,r),e.flushing=!1}}function ru(s){const{framebuffer:t,targetWidth:e,targetHeight:i,topPx:n,leftPx:o}=s,r=Math.max(Math.floor(e/4),1),a=Math.max(Math.floor(i/4),1),l=Math.min(r/t.width,a/t.height),c=Math.max(Math.floor(t.width*l),1),u=Math.max(Math.floor(t.height*l),1),f=o,h=Math.max(i-n-u,0),d=f+c,p=h+u;return[f,h,d,p,u]}function au(s){return s.userData[un]||={flushing:!1,queuedFramebuffers:[]},s.userData[un]}function lu(s){return"colorAttachments"in s}function cu(s){const t=s.props.framebuffer;return!t||t.handle===null}function fn(s,t){if(!s)return t;const e=Number.parseInt(s,10);return Number.isFinite(e)?e:t}function qi(s,t,e){if(s===t)return!0;if(!e||!s||!t)return!1;if(Array.isArray(s)){if(!Array.isArray(t)||s.length!==t.length)return!1;for(let i=0;i<s.length;i++)if(!qi(s[i],t[i],e-1))return!1;return!0}if(Array.isArray(t))return!1;if(typeof s=="object"&&typeof t=="object"){const i=Object.keys(s),n=Object.keys(t);if(i.length!==n.length)return!1;for(const o of i)if(!t.hasOwnProperty(o)||!qi(s[o],t[o],e-1))return!1;return!0}return!1}class Li{bufferLayouts;constructor(t){this.bufferLayouts=t}getBufferLayout(t){return this.bufferLayouts.find(e=>e.name===t)||null}getAttributeNamesForBuffer(t){return t.attributes?t.attributes?.map(e=>e.attribute):[t.name]}mergeBufferLayouts(t,e){const i=[...t];for(const n of e){const o=i.findIndex(r=>r.name===n.name);o<0?i.push(n):i[o]=n}return i}getBufferIndex(t){const e=this.bufferLayouts.findIndex(i=>i.name===t);return e===-1&&D.warn(`BufferLayout: Missing buffer for "${t}".`)(),e}}function hn(s,t){let e=1/0;for(const i of s){const n=t[i];n!==void 0&&(e=Math.min(e,n))}return e}function uu(s,t){const e=Object.fromEntries(s.attributes.map(n=>[n.name,n.location])),i=t.slice();return i.sort((n,o)=>{const r=n.attributes?n.attributes.map(u=>u.attribute):[n.name],a=o.attributes?o.attributes.map(u=>u.attribute):[o.name],l=hn(r,e),c=hn(a,e);return l-c}),i}function dn(s,t){if(!s||!t.some(i=>i.bindingLayout?.length))return s;const e={...s,bindings:s.bindings.map(i=>({...i}))};"attributes"in(s||{})&&(e.attributes=s?.attributes||[]);for(const i of t)for(const n of i.bindingLayout||[])for(const o of hu(n.name)){const r=e.bindings.find(a=>a.name===o);r?.group===0&&(r.group=n.group)}return e}function fu(s){return!!(s.uniformTypes&&!du(s.uniformTypes))}function hu(s){const t=new Set([s,`${s}Uniforms`]);return s.endsWith("Uniforms")||t.add(`${s}Sampler`),[...t]}function du(s){for(const t in s)return!1;return!0}function pu(s){return zl(s)||typeof s=="number"||typeof s=="boolean"}function gu(s,t={}){const e={bindings:{},uniforms:{}};return Object.keys(s).forEach(i=>{const n=s[i];Object.prototype.hasOwnProperty.call(t,i)||pu(n)?e.uniforms[i]=n:e.bindings[i]=n}),e}class mu{options={disableWarnings:!1};modules;moduleUniforms;moduleBindings;constructor(t,e){Object.assign(this.options,e);const i=gl(Object.values(t).filter(yu));for(const n of i)t[n.name]=n;D.log(1,"Creating ShaderInputs with modules",Object.keys(t))(),this.modules=t,this.moduleUniforms={},this.moduleBindings={};for(const[n,o]of Object.entries(t))o&&(this._addModule(o),o.name&&n!==o.name&&!this.options.disableWarnings&&D.warn(`Module name: ${n} vs ${o.name}`)())}destroy(){}setProps(t){for(const e of Object.keys(t)){const i=e,n=t[i]||{},o=this.modules[i];if(!o)this.options.disableWarnings||D.warn(`Module ${e} not found`)();else{const r=this.moduleUniforms[i],a=this.moduleBindings[i],l=o.getUniforms?.(n,r)||n,{uniforms:c,bindings:u}=gu(l,o.uniformTypes);this.moduleUniforms[i]=pn(r,c,o.uniformTypes),this.moduleBindings[i]={...a,...u}}}}getModules(){return Object.values(this.modules)}getUniformValues(){return this.moduleUniforms}getBindingValues(){const t={};for(const e of Object.values(this.moduleBindings))Object.assign(t,e);return t}getDebugTable(){const t={};for(const[e,i]of Object.entries(this.moduleUniforms))for(const[n,o]of Object.entries(i))t[`${e}.${n}`]={type:this.modules[e].uniformTypes?.[n],value:String(o)};return t}_addModule(t){const e=t.name;this.moduleUniforms[e]=pn({},t.defaultUniforms||{},t.uniformTypes),this.moduleBindings[e]={}}}function pn(s={},t={},e={}){const i={...s};for(const[n,o]of Object.entries(t))o!==void 0&&(i[n]=Hi(s[n],o,e[n]));return i}function Hi(s,t,e){if(!e||typeof e=="string")return ce(t);if(Array.isArray(e)){if(Ki(t)||!Array.isArray(t))return ce(t);const r=Array.isArray(s)&&!Ki(s)?[...s]:[],a=r.slice();for(let l=0;l<t.length;l++){const c=t[l];c!==void 0&&(a[l]=Hi(r[l],c,e[0]))}return a}if(!Yi(t))return ce(t);const i=e,n=Yi(s)?s:{},o={...n};for(const[r,a]of Object.entries(t))a!==void 0&&(o[r]=Hi(n[r],a,i[r]));return o}function ce(s){return ArrayBuffer.isView(s)?Array.prototype.slice.call(s):Array.isArray(s)?Ki(s)?s.slice():s.map(e=>e===void 0?void 0:ce(e)):Yi(s)?Object.fromEntries(Object.entries(s).map(([t,e])=>[t,e===void 0?void 0:ce(e)])):s}function Ki(s){return ArrayBuffer.isView(s)||Array.isArray(s)&&(s.length===0||typeof s[0]=="number")}function Yi(s){return!!s&&typeof s=="object"&&!Array.isArray(s)&&!ArrayBuffer.isView(s)}function yu(s){return!!s?.dependencies}const ar={"+X":0,"-X":1,"+Y":2,"-Y":3,"+Z":4,"-Z":5};function ie(s){return s?Array.isArray(s)?s[0]??null:s:null}function xu(s){const{dimension:t,data:e}=s;if(!e)return null;switch(t){case"1d":{const i=ie(e);if(!i)return null;const{width:n}=se(i);return{width:n,height:1}}case"2d":{const i=ie(e);return i?se(i):null}case"3d":case"2d-array":{if(!Array.isArray(e)||e.length===0)return null;const i=ie(e[0]);return i?se(i):null}case"cube":{const i=Object.keys(e)[0]??null;if(!i)return null;const n=e[i],o=ie(n);return o?se(o):null}case"cube-array":{if(!Array.isArray(e)||e.length===0)return null;const i=e[0],n=Object.keys(i)[0]??null;if(!n)return null;const o=ie(i[n]);return o?se(o):null}default:return null}}function se(s){if(ko(s))return ml(s);if(typeof s=="object"&&"width"in s&&"height"in s)return{width:s.width,height:s.height};throw new Error("Unsupported mip-level data")}function _u(s){return typeof s=="object"&&s!==null&&"data"in s&&"width"in s&&"height"in s}function vu(s){return ArrayBuffer.isView(s)}function lr(s){const{textureFormat:t,format:e}=s;if(t&&e&&t!==e)throw new Error(`Conflicting texture formats "${t}" and "${e}" provided for the same mip level`);return t??e}function cr(s){const t=ar[s];if(t===void 0)throw new Error(`Invalid cube face: ${s}`);return t}function bu(s,t){return 6*s+cr(t)}function ur(s){throw new Error("setTexture1DData not supported in WebGL.")}function Cu(s){return Array.isArray(s)?s:[s]}function Zt(s,t,e,i){const n=Cu(t),o=s,r=[];for(let a=0;a<n.length;a++){const l=n[a];if(ko(l))r.push({type:"external-image",image:l,z:o,mipLevel:a});else if(_u(l))r.push({type:"texture-data",data:l,textureFormat:lr(l),z:o,mipLevel:a});else if(vu(l)&&e)r.push({type:"texture-data",data:{data:l,width:Math.max(1,e.width>>a),height:Math.max(1,e.height>>a),...i?{format:i}:{}},textureFormat:i,z:o,mipLevel:a});else throw new Error("Unsupported 2D mip-level payload")}return r}function fr(s){const t=[];for(let e=0;e<s.length;e++)t.push(...Zt(e,s[e]));return t}function hr(s){const t=[];for(let e=0;e<s.length;e++)t.push(...Zt(e,s[e]));return t}function dr(s){const t=[];for(const[e,i]of Object.entries(s)){const n=cr(e);t.push(...Zt(n,i))}return t}function pr(s){const t=[];return s.forEach((e,i)=>{for(const[n,o]of Object.entries(e)){const r=bu(i,n);t.push(...Zt(r,o))}}),t}class Ut{device;id;props;_texture=null;_sampler=null;_view=null;ready;isReady=!1;destroyed=!1;resolveReady=()=>{};rejectReady=()=>{};get texture(){if(!this._texture)throw new Error("Texture not initialized yet");return this._texture}get sampler(){if(!this._sampler)throw new Error("Sampler not initialized yet");return this._sampler}get view(){if(!this._view)throw new Error("View not initialized yet");return this._view}get[Symbol.toStringTag](){return"DynamicTexture"}toString(){const t=this._texture?.width??this.props.width??"?",e=this._texture?.height??this.props.height??"?";return`DynamicTexture:"${this.id}":${t}x${e}px:(${this.isReady?"ready":"loading..."})`}constructor(t,e){this.device=t;const i=li("dynamic-texture"),n=e;this.props={...Ut.defaultProps,id:i,...e,data:null},this.id=this.props.id,this.ready=new Promise((o,r)=>{this.resolveReady=o,this.rejectReady=r}),this.initAsync(n)}async initAsync(t){try{const e=await this._loadAllData(t);this._checkNotDestroyed();const i=e.data?wu({...e,width:t.width,height:t.height,format:t.format}):[],n="format"in t&&t.format!==void 0,o="usage"in t&&t.usage!==void 0,a=(()=>{if(this.props.width&&this.props.height)return{width:this.props.width,height:this.props.height};const g=xu(e);return g||{width:this.props.width||1,height:this.props.height||1}})();if(!a||a.width<=0||a.height<=0)throw new Error(`${this} size could not be determined or was zero`);const l=Pu(this.device,i,a,{format:n?t.format:void 0}),c=l.format??this.props.format,u={...this.props,...a,format:c,mipLevels:1,data:void 0};this.device.isTextureFormatCompressed(c)&&!o&&(u.usage=it.SAMPLE|it.COPY_DST);const f=this.props.mipmaps&&!l.hasExplicitMipChain&&!this.device.isTextureFormatCompressed(c);if(this.device.type==="webgpu"&&f){const g=this.props.dimension==="3d"?it.SAMPLE|it.STORAGE|it.COPY_DST|it.COPY_SRC:it.SAMPLE|it.RENDER|it.COPY_DST|it.COPY_SRC;u.usage|=g}const h=this.device.getMipLevelCount(u.width,u.height),d=l.hasExplicitMipChain?l.mipLevels:this.props.mipLevels==="auto"?h:Math.max(1,Math.min(h,this.props.mipLevels??1)),p={...u,mipLevels:d};this._texture=this.device.createTexture(p),this._sampler=this.texture.sampler,this._view=this.texture.view,l.subresources.length&&this._setTextureSubresources(l.subresources),this.props.mipmaps&&!l.hasExplicitMipChain&&!f&&D.warn(`${this} skipping auto-generated mipmaps for compressed texture format`)(),f&&this.generateMipmaps(),this.isReady=!0,this.resolveReady(this.texture),D.info(0,`${this} created`)()}catch(e){const i=e instanceof Error?e:new Error(String(e));this.rejectReady(i)}}destroy(){this._texture&&(this._texture.destroy(),this._texture=null,this._sampler=null,this._view=null),this.destroyed=!0}generateMipmaps(){this.device.type==="webgl"?this.texture.generateMipmapsWebGL():this.device.type==="webgpu"?this.device.generateMipmapsWebGPU(this.texture):D.warn(`${this} mipmaps not supported on ${this.device.type}`)}setSampler(t={}){this._checkReady();const e=t instanceof Do?t:this.device.createSampler(t);this.texture.setSampler(e),this._sampler=e}async readBuffer(t={}){this.isReady||await this.ready;const e=t.width??this.texture.width,i=t.height??this.texture.height,n=t.depthOrArrayLayers??this.texture.depth,o=this.texture.computeMemoryLayout({width:e,height:i,depthOrArrayLayers:n}),r=this.device.createBuffer({byteLength:o.byteLength,usage:J.COPY_DST|J.MAP_READ});this.texture.readBuffer({...t,width:e,height:i,depthOrArrayLayers:n},r);const a=this.device.createFence();return await a.signaled,a.destroy(),r}async readAsync(t={}){this.isReady||await this.ready;const e=t.width??this.texture.width,i=t.height??this.texture.height,n=t.depthOrArrayLayers??this.texture.depth,o=this.texture.computeMemoryLayout({width:e,height:i,depthOrArrayLayers:n}),r=await this.readBuffer(t),a=await r.readAsync(0,o.byteLength);return r.destroy(),a.buffer}resize(t){if(this._checkReady(),t.width===this.texture.width&&t.height===this.texture.height)return!1;const e=this.texture;return this._texture=e.clone(t),this._sampler=this.texture.sampler,this._view=this.texture.view,e.destroy(),D.info(`${this} resized`),!0}getCubeFaceIndex(t){const e=ar[t];if(e===void 0)throw new Error(`Invalid cube face: ${t}`);return e}getCubeArrayFaceIndex(t,e){return 6*t+this.getCubeFaceIndex(e)}setTexture1DData(t){if(this._checkReady(),this.texture.props.dimension!=="1d")throw new Error(`${this} is not 1d`);const e=ur();this._setTextureSubresources(e)}setTexture2DData(t,e=0){if(this._checkReady(),this.texture.props.dimension!=="2d")throw new Error(`${this} is not 2d`);const i=Zt(e,t);this._setTextureSubresources(i)}setTexture3DData(t){if(this.texture.props.dimension!=="3d")throw new Error(`${this} is not 3d`);const e=fr(t);this._setTextureSubresources(e)}setTextureArrayData(t){if(this.texture.props.dimension!=="2d-array")throw new Error(`${this} is not 2d-array`);const e=hr(t);this._setTextureSubresources(e)}setTextureCubeData(t){if(this.texture.props.dimension!=="cube")throw new Error(`${this} is not cube`);const e=dr(t);this._setTextureSubresources(e)}setTextureCubeArrayData(t){if(this.texture.props.dimension!=="cube-array")throw new Error(`${this} is not cube-array`);const e=pr(t);this._setTextureSubresources(e)}_setTextureSubresources(t){for(const e of t){const{z:i,mipLevel:n}=e;switch(e.type){case"external-image":const{image:o,flipY:r}=e;this.texture.copyExternalImage({image:o,z:i,mipLevel:n,flipY:r});break;case"texture-data":const{data:a,textureFormat:l}=e;if(l&&l!==this.texture.format)throw new Error(`${this} mip level ${n} uses format "${l}" but texture format is "${this.texture.format}"`);this.texture.writeData(a.data,{x:0,y:0,z:i,width:a.width,height:a.height,depthOrArrayLayers:1,mipLevel:n});break;default:throw new Error("Unsupported 2D mip-level payload")}}}async _loadAllData(t){const e=await Zi(t.data);return{dimension:t.dimension??"2d",data:e??null}}_checkNotDestroyed(){this.destroyed&&D.warn(`${this} already destroyed`)}_checkReady(){this.isReady||D.warn(`${this} Cannot perform this operation before ready`)}static defaultProps={...it.defaultProps,dimension:"2d",data:null,mipmaps:!1}}function wu(s){if(!s.data)return[];const t=s.width&&s.height?{width:s.width,height:s.height}:void 0,e="format"in s?s.format:void 0;switch(s.dimension){case"1d":return ur();case"2d":return Zt(0,s.data,t,e);case"3d":return fr(s.data);case"2d-array":return hr(s.data);case"cube":return dr(s.data);case"cube-array":return pr(s.data);default:throw new Error(`Unhandled dimension ${s.dimension}`)}}function Pu(s,t,e,i){if(t.length===0)return{subresources:t,mipLevels:1,format:i.format,hasExplicitMipChain:!1};const n=new Map;for(const u of t){const f=n.get(u.z)??[];f.push(u),n.set(u.z,f)}const o=t.some(u=>u.mipLevel>0);let r=i.format,a=Number.POSITIVE_INFINITY;const l=[];for(const[u,f]of n){const h=[...f].sort((_,C)=>_.mipLevel-C.mipLevel),d=h[0];if(!d||d.mipLevel!==0)throw new Error(`DynamicTexture: slice ${u} is missing mip level 0`);const p=mn(s,d);if(p.width!==e.width||p.height!==e.height)throw new Error(`DynamicTexture: slice ${u} base level dimensions ${p.width}x${p.height} do not match expected ${e.width}x${e.height}`);const g=gn(d);if(g){if(r&&r!==g)throw new Error(`DynamicTexture: slice ${u} base level format "${g}" does not match texture format "${r}"`);r=g}const y=r&&s.isTextureFormatCompressed(r)?Tu(s,p.width,p.height,r):s.getMipLevelCount(p.width,p.height);let v=0;for(let _=0;_<h.length;_++){const C=h[_];if(!C||C.mipLevel!==_||_>=y)break;const w=mn(s,C),A=Math.max(1,p.width>>_),I=Math.max(1,p.height>>_);if(w.width!==A||w.height!==I)break;const z=gn(C);if(z&&(r||(r=z),z!==r))break;v++,l.push(C)}a=Math.min(a,v)}const c=Number.isFinite(a)?Math.max(1,a):1;return{subresources:l.filter(u=>u.mipLevel<c),mipLevels:c,format:r,hasExplicitMipChain:o}}function gn(s){if(s.type==="texture-data")return s.textureFormat??lr(s.data)}function mn(s,t){switch(t.type){case"external-image":return s.getExternalImageSize(t.image);case"texture-data":return{width:t.data.width,height:t.data.height};default:throw new Error("Unsupported texture subresource")}}function Tu(s,t,e,i){const{blockWidth:n=1,blockHeight:o=1}=s.getTextureFormatInfo(i);let r=1;for(let a=1;;a++){const l=Math.max(1,t>>a),c=Math.max(1,e>>a);if(l<n||c<o)break;r++}return r}async function Zi(s){if(s=await s,Array.isArray(s))return await Promise.all(s.map(Zi));if(s&&typeof s=="object"&&s.constructor===Object){const t=s,e=await Promise.all(Object.values(t).map(Zi)),i=Object.keys(t),n={};for(let o=0;o<i.length;o++)n[i[o]]=e[o];return n}return s}const Ct=2,Lu=1e4,yn="render pipeline initialization failed";class lt{static defaultProps={...ae.defaultProps,source:void 0,vs:null,fs:null,id:"unnamed",handle:void 0,userData:{},defines:{},modules:[],geometry:null,indexBuffer:null,attributes:{},constantAttributes:{},bindings:{},uniforms:{},varyings:[],isInstanced:void 0,instanceCount:0,vertexCount:0,shaderInputs:void 0,material:void 0,pipelineFactory:void 0,shaderFactory:void 0,transformFeedback:void 0,shaderAssembler:yl.getDefaultShaderAssembler(),debugShaders:void 0,disableWarnings:void 0};device;id;source;vs;fs;pipelineFactory;shaderFactory;userData={};parameters;topology;bufferLayout;isInstanced=void 0;instanceCount=0;vertexCount;indexBuffer=null;bufferAttributes={};constantAttributes={};bindings={};vertexArray;transformFeedback=null;pipeline;shaderInputs;material=null;_uniformStore;_attributeInfos={};_gpuGeometry=null;props;_pipelineNeedsUpdate="newly created";_needsRedraw="initializing";_destroyed=!1;_lastDrawTimestamp=-1;_bindingTable=[];get[Symbol.toStringTag](){return"Model"}toString(){return`Model(${this.id})`}constructor(t,e){this.props={...lt.defaultProps,...e},e=this.props,this.id=e.id||li("model"),this.device=t,Object.assign(this.userData,e.userData),this.material=e.material||null;const i=Object.fromEntries(this.props.modules?.map(l=>[l.name,l])||[]),n=e.shaderInputs||new mu(i,{disableWarnings:this.props.disableWarnings});this.setShaderInputs(n);const o=Su(t),r=(this.props.modules?.length>0?this.props.modules:this.shaderInputs?.getModules())||[];if(this.props.shaderLayout=dn(this.props.shaderLayout,r)||null,this.device.type==="webgpu"&&this.props.source){const{source:l,getUniforms:c,bindingTable:u}=this.props.shaderAssembler.assembleWGSLShader({platformInfo:o,...this.props,modules:r});this.source=l,this._getModuleUniforms=c,this._bindingTable=u;const f=t.getShaderLayout?.(this.source);this.props.shaderLayout=dn(this.props.shaderLayout||f||null,r)||null}else{const{vs:l,fs:c,getUniforms:u}=this.props.shaderAssembler.assembleGLSLShaderPair({platformInfo:o,...this.props,modules:r});this.vs=l,this.fs=c,this._getModuleUniforms=u,this._bindingTable=[]}this.vertexCount=this.props.vertexCount,this.instanceCount=this.props.instanceCount,this.topology=this.props.topology,this.bufferLayout=this.props.bufferLayout,this.parameters=this.props.parameters,e.geometry&&this.setGeometry(e.geometry),this.pipelineFactory=e.pipelineFactory||ys.getDefaultPipelineFactory(this.device),this.shaderFactory=e.shaderFactory||xs.getDefaultShaderFactory(this.device),this.pipeline=this._updatePipeline(),this.vertexArray=t.createVertexArray({shaderLayout:this.pipeline.shaderLayout,bufferLayout:this.pipeline.bufferLayout}),this._gpuGeometry&&this._setGeometryAttributes(this._gpuGeometry),"isInstanced"in e&&(this.isInstanced=e.isInstanced),e.instanceCount&&this.setInstanceCount(e.instanceCount),e.vertexCount&&this.setVertexCount(e.vertexCount),e.indexBuffer&&this.setIndexBuffer(e.indexBuffer),e.attributes&&this.setAttributes(e.attributes),e.constantAttributes&&this.setConstantAttributes(e.constantAttributes),e.bindings&&this.setBindings(e.bindings),e.transformFeedback&&(this.transformFeedback=e.transformFeedback)}destroy(){this._destroyed||(this.pipelineFactory.release(this.pipeline),this.shaderFactory.release(this.pipeline.vs),this.pipeline.fs&&this.pipeline.fs!==this.pipeline.vs&&this.shaderFactory.release(this.pipeline.fs),this._uniformStore.destroy(),this._gpuGeometry?.destroy(),this._destroyed=!0)}needsRedraw(){this._getBindingsUpdateTimestamp()>this._lastDrawTimestamp&&this.setNeedsRedraw("contents of bound textures or buffers updated");const t=this._needsRedraw;return this._needsRedraw=!1,t}setNeedsRedraw(t){this._needsRedraw||=t}getBindingDebugTable(){return this._bindingTable}predraw(){this.updateShaderInputs(),this.pipeline=this._updatePipeline()}draw(t){const e=this._areBindingsLoading();if(e)return D.info(Ct,`>>> DRAWING ABORTED ${this.id}: ${e} not loaded`)(),!1;try{t.pushDebugGroup(`${this}.predraw(${t})`),this.predraw()}finally{t.popDebugGroup()}let i,n=this.pipeline.isErrored;try{if(t.pushDebugGroup(`${this}.draw(${t})`),this._logDrawCallStart(),this.pipeline=this._updatePipeline(),n=this.pipeline.isErrored,n)D.info(Ct,`>>> DRAWING ABORTED ${this.id}: ${yn}`)(),i=!1;else{const o=this._getBindings(),r=this._getBindGroups(),{indexBuffer:a}=this.vertexArray,l=a?a.byteLength/(a.indexType==="uint32"?4:2):void 0;i=this.pipeline.draw({renderPass:t,vertexArray:this.vertexArray,isInstanced:this.isInstanced,vertexCount:this.vertexCount,instanceCount:this.instanceCount,indexCount:l,transformFeedback:this.transformFeedback||void 0,bindings:o,bindGroups:r,_bindGroupCacheKeys:this._getBindGroupCacheKeys(),uniforms:this.props.uniforms,parameters:this.parameters,topology:this.topology})}}finally{t.popDebugGroup(),this._logDrawCallEnd()}return this._logFramebuffer(t),i?(this._lastDrawTimestamp=this.device.timestamp,this._needsRedraw=!1):n?this._needsRedraw=yn:this._needsRedraw="waiting for resource initialization",i}setGeometry(t){this._gpuGeometry?.destroy();const e=t&&tu(this.device,t);if(e){this.setTopology(e.topology||"triangle-list");const i=new Li(this.bufferLayout);this.bufferLayout=i.mergeBufferLayouts(e.bufferLayout,this.bufferLayout),this.vertexArray&&this._setGeometryAttributes(e)}this._gpuGeometry=e}setTopology(t){t!==this.topology&&(this.topology=t,this._setPipelineNeedsUpdate("topology"))}setBufferLayout(t){const e=new Li(this.bufferLayout);this.bufferLayout=this._gpuGeometry?e.mergeBufferLayouts(t,this._gpuGeometry.bufferLayout):t,this._setPipelineNeedsUpdate("bufferLayout"),this.pipeline=this._updatePipeline(),this.vertexArray=this.device.createVertexArray({shaderLayout:this.pipeline.shaderLayout,bufferLayout:this.pipeline.bufferLayout}),this._gpuGeometry&&this._setGeometryAttributes(this._gpuGeometry)}setParameters(t){qi(t,this.parameters,2)||(this.parameters=t,this._setPipelineNeedsUpdate("parameters"))}setInstanceCount(t){this.instanceCount=t,this.isInstanced===void 0&&t>0&&(this.isInstanced=!0),this.setNeedsRedraw("instanceCount")}setVertexCount(t){this.vertexCount=t,this.setNeedsRedraw("vertexCount")}setShaderInputs(t){this.shaderInputs=t,this._uniformStore=new kc(this.device,this.shaderInputs.modules);for(const[e,i]of Object.entries(this.shaderInputs.modules))if(fu(i)&&!this.material?.ownsModule(e)){const n=this._uniformStore.getManagedUniformBuffer(e);this.bindings[`${e}Uniforms`]=n}this.setNeedsRedraw("shaderInputs")}setMaterial(t){this.material=t,this.setNeedsRedraw("material")}updateShaderInputs(){this._uniformStore.setUniforms(this.shaderInputs.getUniformValues()),this.setBindings(this._getNonMaterialBindings(this.shaderInputs.getBindingValues())),this.setNeedsRedraw("shaderInputs")}setBindings(t){Object.assign(this.bindings,t),this.setNeedsRedraw("bindings")}setTransformFeedback(t){this.transformFeedback=t,this.setNeedsRedraw("transformFeedback")}setIndexBuffer(t){this.vertexArray.setIndexBuffer(t),this.setNeedsRedraw("indexBuffer")}setAttributes(t,e){const i=e?.disableWarnings??this.props.disableWarnings;t.indices&&D.warn(`Model:${this.id} setAttributes() - indexBuffer should be set using setIndexBuffer()`)(),this.bufferLayout=uu(this.pipeline.shaderLayout,this.bufferLayout);const n=new Li(this.bufferLayout);for(const[o,r]of Object.entries(t)){const a=n.getBufferLayout(o);if(!a){i||D.warn(`Model(${this.id}): Missing layout for buffer "${o}".`)();continue}const l=n.getAttributeNamesForBuffer(a);let c=!1;for(const u of l){const f=this._attributeInfos[u];if(f){const h=this.device.type==="webgpu"?n.getBufferIndex(f.bufferName):f.location;this.vertexArray.setBuffer(h,r),c=!0}}!c&&!i&&D.warn(`Model(${this.id}): Ignoring buffer "${r.id}" for unknown attribute "${o}"`)()}this.setNeedsRedraw("attributes")}setConstantAttributes(t,e){for(const[i,n]of Object.entries(t)){const o=this._attributeInfos[i];o?this.vertexArray.setConstantWebGL(o.location,n):(e?.disableWarnings??this.props.disableWarnings)||D.warn(`Model "${this.id}: Ignoring constant supplied for unknown attribute "${i}"`)()}this.setNeedsRedraw("constants")}_areBindingsLoading(){for(const t of Object.values(this.bindings))if(t instanceof Ut&&!t.isReady)return t.id;for(const t of Object.values(this.material?.bindings||{}))if(t instanceof Ut&&!t.isReady)return t.id;return!1}_getBindings(){const t={};for(const[e,i]of Object.entries(this.bindings))i instanceof Ut?i.isReady&&(t[e]=i.texture):t[e]=i;return t}_getBindGroups(){const t=this.pipeline?.shaderLayout||this.props.shaderLayout||{bindings:[]},e=t.bindings.length?Ba(t,this._getBindings()):{0:this._getBindings()};if(!this.material)return e;for(const[i,n]of Object.entries(this.material.getBindingsByGroup())){const o=Number(i);e[o]={...e[o]||{},...n}}return e}_getBindGroupCacheKeys(){const t=this.material?.getBindGroupCacheKey(3);return t?{3:t}:{}}_getBindingsUpdateTimestamp(){let t=0;for(const e of Object.values(this.bindings))e instanceof Fa?t=Math.max(t,e.texture.updateTimestamp):e instanceof J||e instanceof it?t=Math.max(t,e.updateTimestamp):e instanceof Ut?t=e.texture?Math.max(t,e.texture.updateTimestamp):1/0:e instanceof Do||(t=Math.max(t,e.buffer.updateTimestamp));return Math.max(t,this.material?.getBindingsUpdateTimestamp()||0)}_setGeometryAttributes(t){const e={...t.attributes};for(const[i]of Object.entries(e))!this.pipeline.shaderLayout.attributes.find(n=>n.name===i)&&i!=="positions"&&delete e[i];this.vertexCount=t.vertexCount,this.setIndexBuffer(t.indices||null),this.setAttributes(t.attributes,{disableWarnings:!0}),this.setAttributes(e,{disableWarnings:this.props.disableWarnings}),this.setNeedsRedraw("geometry attributes")}_setPipelineNeedsUpdate(t){this._pipelineNeedsUpdate||=t,this.setNeedsRedraw(t)}_updatePipeline(){if(this._pipelineNeedsUpdate){let t=null,e=null;this.pipeline&&(D.log(1,`Model ${this.id}: Recreating pipeline because "${this._pipelineNeedsUpdate}".`)(),t=this.pipeline.vs,e=this.pipeline.fs),this._pipelineNeedsUpdate=!1;const i=this.shaderFactory.createShader({id:`${this.id}-vertex`,stage:"vertex",source:this.source||this.vs,debugShaders:this.props.debugShaders});let n=null;this.source?n=i:this.fs&&(n=this.shaderFactory.createShader({id:`${this.id}-fragment`,stage:"fragment",source:this.source||this.fs,debugShaders:this.props.debugShaders})),this.pipeline=this.pipelineFactory.createRenderPipeline({...this.props,bindings:void 0,bufferLayout:this.bufferLayout,topology:this.topology,parameters:this.parameters,bindGroups:this._getBindGroups(),vs:i,fs:n}),this._attributeInfos=ka(this.pipeline.shaderLayout,this.bufferLayout),t&&this.shaderFactory.release(t),e&&e!==t&&this.shaderFactory.release(e)}return this.pipeline}_lastLogTime=0;_logOpen=!1;_logDrawCallStart(){const t=D.level>3?0:Lu;D.level<2||Date.now()-this._lastLogTime<t||(this._lastLogTime=Date.now(),this._logOpen=!0,D.group(Ct,`>>> DRAWING MODEL ${this.id}`,{collapsed:D.level<=2})())}_logDrawCallEnd(){if(this._logOpen){const t=su(this.pipeline.shaderLayout,this.id);D.table(Ct,t)();const e=this.shaderInputs.getDebugTable();D.table(Ct,e)();const i=this._getAttributeDebugTable();D.table(Ct,this._attributeInfos)(),D.table(Ct,i)(),D.groupEnd(Ct)(),this._logOpen=!1}}_drawCount=0;_logFramebuffer(t){const e=this.device.props.debugFramebuffers;if(this._drawCount++,!e)return;const i=t.props.framebuffer;nu(t,i,{id:i?.id||`${this.id}-framebuffer`,minimap:!0})}_getAttributeDebugTable(){const t={};for(const[e,i]of Object.entries(this._attributeInfos)){const n=this.vertexArray.attributes[i.location];t[i.location]={name:e,type:i.shaderType,values:n?this._getBufferOrConstantValues(n,i.bufferDataType):"null"}}if(this.vertexArray.indexBuffer){const{indexBuffer:e}=this.vertexArray,i=e.indexType==="uint32"?new Uint32Array(e.debugData):new Uint16Array(e.debugData);t.indices={name:"indices",type:e.indexType,values:i.toString()}}return t}_getBufferOrConstantValues(t,e){const i=Gi.getTypedArrayConstructor(e);return(t instanceof J?new i(t.debugData):t).toString()}_getNonMaterialBindings(t){if(!this.material)return t;const e={};for(const[i,n]of Object.entries(t))this.material.ownsBinding(i)||(e[i]=n);return e}}function Su(s){return{type:s.type,shaderLanguage:s.info.shadingLanguage,shaderLanguageVersion:s.info.shadingLanguageVersion,gpu:s.info.gpu,features:s.features}}class qt{device;model;transformFeedback;static defaultProps={...lt.defaultProps,outputs:void 0,feedbackBuffers:void 0};static isSupported(t){return t?.info?.type==="webgl"}constructor(t,e=qt.defaultProps){if(!qt.isSupported(t))throw new Error("BufferTransform not yet implemented on WebGPU");this.device=t,this.model=new lt(this.device,{id:e.id||"buffer-transform-model",fs:e.fs||kl(),topology:e.topology||"point-list",varyings:e.outputs||e.varyings,...e}),this.transformFeedback=this.device.createTransformFeedback({layout:this.model.pipeline.shaderLayout,buffers:e.feedbackBuffers}),this.model.setTransformFeedback(this.transformFeedback),Object.seal(this)}destroy(){this.model&&this.model.destroy()}delete(){this.destroy()}run(t){t?.inputBuffers&&this.model.setAttributes(t.inputBuffers),t?.outputBuffers&&this.transformFeedback.setBuffers(t.outputBuffers);const e=this.device.beginRenderPass(t);this.model.draw(e),e.end()}getBuffer(t){return this.transformFeedback.getBuffer(t)}readAsync(t){const e=this.getBuffer(t);if(!e)throw new Error("BufferTransform#getBuffer");if(e instanceof J)return e.readAsync();const{buffer:i,byteOffset:n=0,byteLength:o=i.byteLength}=e;return i.readAsync(n,o)}}class _t{id;topology;vertexCount;indices;attributes;userData={};constructor(t){const{attributes:e={},indices:i=null,vertexCount:n=null}=t;this.id=t.id||li("geometry"),this.topology=t.topology,i&&(this.indices=ArrayBuffer.isView(i)?{value:i,size:1}:i),this.attributes={};for(const[o,r]of Object.entries(e)){const a=ArrayBuffer.isView(r)?{value:r}:r;if(!ArrayBuffer.isView(a.value))throw new Error(`${this._print(o)}: must be typed array or object with value as typed array`);if((o==="POSITION"||o==="positions")&&!a.size&&(a.size=3),o==="indices"){if(this.indices)throw new Error("Multiple indices detected");this.indices=a}else this.attributes[o]=a}this.indices&&this.indices.isIndexed!==void 0&&(this.indices=Object.assign({},this.indices),delete this.indices.isIndexed),this.vertexCount=n||this._calculateVertexCount(this.attributes,this.indices)}getVertexCount(){return this.vertexCount}getAttributes(){return this.indices?{indices:this.indices,...this.attributes}:this.attributes}_print(t){return`Geometry ${this.id} attribute ${t}`}_setAttributes(t,e){return this}_calculateVertexCount(t,e){if(e)return e.value.length;let i=1/0;for(const n of Object.values(t)){const{value:o,size:r,constant:a}=n;!a&&o&&r!==void 0&&r>=1&&(i=Math.min(i,o.length/r))}return i}}function Au(s){switch(s){case"float64":return Float64Array;case"uint8":case"unorm8":return Uint8ClampedArray;default:return Da(s)}}const Eu=Gi.getDataType.bind(Gi);function Pe(s,t,e){if(t.size>4)return null;const i=e==="webgpu"&&t.type==="uint8"?"unorm8":t.type;return{attribute:s,format:t.size>1?`${i}x${t.size}`:t.type,byteOffset:t.offset||0}}function Rt(s){return s.stride||s.size*s.bytesPerElement}function Iu(s,t){return s.type===t.type&&s.size===t.size&&Rt(s)===Rt(t)&&(s.offset||0)===(t.offset||0)}function Xi(s,t){t.offset&&K.removed("shaderAttribute.offset","vertexOffset, elementOffset")();const e=Rt(s),i=t.vertexOffset!==void 0?t.vertexOffset:s.vertexOffset||0,n=t.elementOffset||0,o=i*e+n*s.bytesPerElement+(s.offset||0);return{...t,offset:o,stride:e}}function Mu(s,t){const e=Xi(s,t);return{high:e,low:{...e,offset:e.offset+s.size*4}}}class Ou{constructor(t,e,i){this._buffer=null,this.device=t,this.id=e.id||"",this.size=e.size||1;const n=e.logicalType||e.type,o=n==="float64";let{defaultValue:r}=e;r=Number.isFinite(r)?[r]:r||new Array(this.size).fill(0);let a;o?a="float32":!n&&e.isIndexed?a="uint32":a=n||"float32";let l=Au(n||a);this.doublePrecision=o,o&&e.fp64===!1&&(l=Float32Array),this.value=null,this.settings={...e,defaultType:l,defaultValue:r,logicalType:n,type:a,normalized:a.includes("norm"),size:this.size,bytesPerElement:l.BYTES_PER_ELEMENT},this.state={...i,externalBuffer:null,bufferAccessor:this.settings,allocatedValue:null,numInstances:0,bounds:null,constant:!1}}get isConstant(){return this.state.constant}get buffer(){return this._buffer}get byteOffset(){const t=this.getAccessor();return t.vertexOffset?t.vertexOffset*Rt(t):0}get numInstances(){return this.state.numInstances}set numInstances(t){this.state.numInstances=t}delete(){this._buffer&&(this._buffer.delete(),this._buffer=null),Je.release(this.state.allocatedValue)}getBuffer(){return this.state.constant?null:this.state.externalBuffer||this._buffer}getValue(t=this.id,e=null){const i={};if(this.state.constant){const n=this.value;if(e){const o=Xi(this.getAccessor(),e),r=o.offset/n.BYTES_PER_ELEMENT,a=o.size||this.size;i[t]=n.subarray(r,r+a)}else i[t]=n}else i[t]=this.getBuffer();return this.doublePrecision&&(this.value instanceof Float64Array?i[`${t}64Low`]=i[t]:i[`${t}64Low`]=new Float32Array(this.size)),i}_getBufferLayout(t=this.id,e=null){const i=this.getAccessor(),n=[],o={name:this.id,byteStride:Rt(i)};if(this.doublePrecision){const r=Mu(i,e||{});n.push(Pe(t,{...i,...r.high},this.device.type),Pe(`${t}64Low`,{...i,...r.low},this.device.type))}else if(e){const r=Xi(i,e);n.push(Pe(t,{...i,...r},this.device.type))}else n.push(Pe(t,i,this.device.type));return o.attributes=n.filter(Boolean),o}setAccessor(t){this.state.bufferAccessor=t}getAccessor(){return this.state.bufferAccessor}getBounds(){if(this.state.bounds)return this.state.bounds;let t=null;if(this.state.constant&&this.value){const e=Array.from(this.value);t=[e,e]}else{const{value:e,numInstances:i,size:n}=this,o=i*n;if(e&&o&&e.length>=o){const r=new Array(n).fill(1/0),a=new Array(n).fill(-1/0);for(let l=0;l<o;)for(let c=0;c<n;c++){const u=e[l++];u<r[c]&&(r[c]=u),u>a[c]&&(a[c]=u)}t=[r,a]}}return this.state.bounds=t,t}setData(t){const{state:e}=this;let i;ArrayBuffer.isView(t)?i={value:t}:t instanceof J?i={buffer:t}:i=t;const n={...this.settings,...i};if(ArrayBuffer.isView(i.value)){if(!i.type)if(this.doublePrecision&&i.value instanceof Float64Array)n.type="float32";else{const r=Eu(i.value);n.type=n.normalized?r.replace("int","norm"):r}n.bytesPerElement=i.value.BYTES_PER_ELEMENT,n.stride=Rt(n)}if(e.bounds=null,i.constant){let o=i.value;if(o=this._normalizeValue(o,[],0),this.settings.normalized&&(o=this.normalizeConstant(o)),!(!e.constant||!this._areValuesEqual(o,this.value)))return!1;e.externalBuffer=null,e.constant=!0,this.value=ArrayBuffer.isView(o)?o:new Float32Array(o)}else if(i.buffer){const o=i.buffer;e.externalBuffer=o,e.constant=!1,this.value=i.value||null}else if(i.value){this._checkExternalBuffer(i);let o=i.value;e.externalBuffer=null,e.constant=!1,this.value=o;let{buffer:r}=this;const a=Rt(n),l=(n.vertexOffset||0)*a;if(this.doublePrecision&&o instanceof Float64Array&&(o=bi(o,n)),this.settings.isIndexed){const u=this.settings.defaultType;o.constructor!==u&&(o=new u(o))}const c=o.byteLength+l+a*2;(!r||r.byteLength<c)&&(r=this._createBuffer(c)),r.write(o,l)}return this.setAccessor(n),!0}updateSubBuffer(t={}){this.state.bounds=null;const e=this.value,{startOffset:i=0,endOffset:n}=t;this.buffer.write(this.doublePrecision&&e instanceof Float64Array?bi(e,{size:this.size,startIndex:i,endIndex:n}):e.subarray(i,n),i*e.BYTES_PER_ELEMENT+this.byteOffset)}allocate(t,e=!1){const{state:i}=this,n=i.allocatedValue,o=Je.allocate(n,t+1,{size:this.size,type:this.settings.defaultType,copy:e});this.value=o;const{byteOffset:r}=this;let{buffer:a}=this;return(!a||a.byteLength<o.byteLength+r)&&(a=this._createBuffer(o.byteLength+r),e&&n&&a.write(n instanceof Float64Array?bi(n,this):n,r)),i.allocatedValue=o,i.constant=!1,i.externalBuffer=null,this.setAccessor(this.settings),!0}_checkExternalBuffer(t){const{value:e}=t;if(!ArrayBuffer.isView(e))throw new Error(`Attribute ${this.id} value is not TypedArray`);const i=this.settings.defaultType;let n=!1;if(this.doublePrecision&&(n=e.BYTES_PER_ELEMENT<4),n)throw new Error(`Attribute ${this.id} does not support ${e.constructor.name}`);!(e instanceof i)&&this.settings.normalized&&!("normalized"in t)&&K.warn(`Attribute ${this.id} is normalized`)()}normalizeConstant(t){switch(this.settings.type){case"snorm8":return new Float32Array(t).map(e=>(e+128)/255*2-1);case"snorm16":return new Float32Array(t).map(e=>(e+32768)/65535*2-1);case"unorm8":return new Float32Array(t).map(e=>e/255);case"unorm16":return new Float32Array(t).map(e=>e/65535);default:return t}}_normalizeValue(t,e,i){const{defaultValue:n,size:o}=this.settings;if(Number.isFinite(t))return e[i]=t,e;if(!t){let r=o;for(;--r>=0;)e[i+r]=n[r];return e}switch(o){case 4:e[i+3]=Number.isFinite(t[3])?t[3]:n[3];case 3:e[i+2]=Number.isFinite(t[2])?t[2]:n[2];case 2:e[i+1]=Number.isFinite(t[1])?t[1]:n[1];case 1:e[i+0]=Number.isFinite(t[0])?t[0]:n[0];break;default:let r=o;for(;--r>=0;)e[i+r]=Number.isFinite(t[r])?t[r]:n[r]}return e}_areValuesEqual(t,e){if(!t||!e)return!1;const{size:i}=this;for(let n=0;n<i;n++)if(t[n]!==e[n])return!1;return!0}_createBuffer(t){this._buffer&&this._buffer.destroy();const{isIndexed:e,type:i}=this.settings;return this._buffer=this.device.createBuffer({...this._buffer?.props,id:this.id,usage:(e?J.INDEX:J.VERTEX)|J.COPY_DST,indexType:e?i:void 0,byteLength:t}),this._buffer}}const xn=[],_n=[];function kt(s,t=0,e=1/0){let i=xn;const n={index:-1,data:s,target:[]};return s?typeof s[Symbol.iterator]=="function"?i=s:s.length>0&&(_n.length=s.length,i=_n):i=xn,(t>0||Number.isFinite(e))&&(i=(Array.isArray(i)?i:Array.from(i)).slice(t,e),n.index=t-1),{iterable:i,objectInfo:n}}function gr(s){return s&&s[Symbol.asyncIterator]}function mr(s,t){const{size:e,stride:i,offset:n,startIndices:o,nested:r}=t,a=s.BYTES_PER_ELEMENT,l=i?i/a:e,c=n?n/a:0,u=Math.floor((s.length-c)/l);return(f,{index:h,target:d})=>{if(!o){const v=h*l+c;for(let _=0;_<e;_++)d[_]=s[v+_];return d}const p=o[h],g=o[h+1]||u;let y;if(r){y=new Array(g-p);for(let v=p;v<g;v++){const _=v*l+c;d=new Array(e);for(let C=0;C<e;C++)d[C]=s[_+C];y[v-p]=d}}else if(l===e)y=s.subarray(p*e+c,g*e+c);else{y=new s.constructor((g-p)*e);let v=0;for(let _=p;_<g;_++){const C=_*l+c;for(let w=0;w<e;w++)y[v++]=s[C+w]}}return y}}const Ru=[],qe=[[0,1/0]];function zu(s,t){if(s===qe||(t[0]<0&&(t[0]=0),t[0]>=t[1]))return s;const e=[],i=s.length;let n=0;for(let o=0;o<i;o++){const r=s[o];r[1]<t[0]?(e.push(r),n=o+1):r[0]>t[1]?e.push(r):t=[Math.min(r[0],t[0]),Math.max(r[1],t[1])]}return e.splice(n,0,t),e}const Bu={interpolation:{duration:0,easing:s=>s},spring:{stiffness:.05,damping:.5}};function yr(s,t){if(!s)return null;Number.isFinite(s)&&(s={type:"interpolation",duration:s});const e=s.type||"interpolation";return{...Bu[e],...t,...s,type:e}}class xr extends Ou{constructor(t,e){super(t,e,{startIndices:null,lastExternalBuffer:null,binaryValue:null,binaryAccessor:null,needsUpdate:!0,needsRedraw:!1,layoutChanged:!1,updateRanges:qe}),this.constant=!1,this.settings.update=e.update||(e.accessor?this._autoUpdater:void 0),Object.seal(this.settings),Object.seal(this.state),this._validateAttributeUpdaters()}get startIndices(){return this.state.startIndices}set startIndices(t){this.state.startIndices=t}needsUpdate(){return this.state.needsUpdate}needsRedraw({clearChangedFlags:t=!1}={}){const e=this.state.needsRedraw;return this.state.needsRedraw=e&&!t,e}layoutChanged(){return this.state.layoutChanged}setAccessor(t){var e;(e=this.state).layoutChanged||(e.layoutChanged=!Iu(t,this.getAccessor())),super.setAccessor(t)}getUpdateTriggers(){const{accessor:t}=this.settings;return[this.id].concat(typeof t!="function"&&t||[])}supportsTransition(){return!!this.settings.transition}getTransitionSetting(t){if(!t||!this.supportsTransition())return null;const{accessor:e}=this.settings,i=this.settings.transition,n=Array.isArray(e)?t[e.find(o=>t[o])]:t[e];return yr(n,i)}setNeedsUpdate(t=this.id,e){if(this.state.needsUpdate=this.state.needsUpdate||t,this.setNeedsRedraw(t),e){const{startRow:i=0,endRow:n=1/0}=e;this.state.updateRanges=zu(this.state.updateRanges,[i,n])}else this.state.updateRanges=qe}clearNeedsUpdate(){this.state.needsUpdate=!1,this.state.updateRanges=Ru}setNeedsRedraw(t=this.id){this.state.needsRedraw=this.state.needsRedraw||t}allocate(t){const{state:e,settings:i}=this;return i.noAlloc?!1:i.update?(super.allocate(t,e.updateRanges!==qe),!0):!1}updateBuffer({numInstances:t,data:e,props:i,context:n}){if(!this.needsUpdate())return!1;const{state:{updateRanges:o},settings:{update:r,noAlloc:a}}=this;let l=!0;if(r){for(const[c,u]of o)r.call(n,this,{data:e,startRow:c,endRow:u,props:i,numInstances:t});if(this.value)if(this.constant||!this.buffer||this.buffer.byteLength<this.value.byteLength+this.byteOffset)this.constant?this.setConstantValue(n,this.value):this.setData({value:this.value,constant:this.constant}),this.constant=!1;else for(const[c,u]of o){const f=Number.isFinite(c)?this.getVertexOffset(c):0,h=Number.isFinite(u)?this.getVertexOffset(u):a||!Number.isFinite(t)?this.value.length:t*this.size;super.updateSubBuffer({startOffset:f,endOffset:h})}this._checkAttributeArray()}else l=!1;return this.clearNeedsUpdate(),this.setNeedsRedraw(),l}setConstantValue(t,e){if(e===void 0||typeof e=="function")return!1;const i=this.settings.transform&&t?this.settings.transform.call(t,e):e;return this.device.type==="webgpu"?this.setConstantBufferValue(i,this.numInstances):(this.setData({constant:!0,value:i})&&this.setNeedsRedraw(),this.clearNeedsUpdate(),!0)}setConstantBufferValue(t,e){const i=this.settings.defaultType,n=this._normalizeValue(t,new i(this.size),0);if(this._hasConstantBufferValue(n,e))return this.constant=!1,this.clearNeedsUpdate(),!1;const o=new i(Math.max(e,1)*this.size);for(let a=0;a<o.length;a+=this.size)o.set(n,a);const r=this.setData({value:o});return this.constant=!1,this.clearNeedsUpdate(),r&&this.setNeedsRedraw(),r}_hasConstantBufferValue(t,e){const i=this.value,n=Math.max(e,1)*this.size;if(!ArrayBuffer.isView(i)||i.length!==n||i.length%this.size!==0)return!1;for(let o=0;o<i.length;o+=this.size)for(let r=0;r<this.size;r++)if(i[o+r]!==t[r])return!1;return!0}setExternalBuffer(t){const{state:e}=this;return t?(this.clearNeedsUpdate(),e.lastExternalBuffer===t||(e.lastExternalBuffer=t,this.setNeedsRedraw(),this.setData(t)),!0):(e.lastExternalBuffer=null,!1)}setBinaryValue(t,e=null){const{state:i,settings:n}=this;if(!t)return i.binaryValue=null,i.binaryAccessor=null,!1;if(n.noAlloc)return!1;if(i.binaryValue===t)return this.clearNeedsUpdate(),!0;if(i.binaryValue=t,this.setNeedsRedraw(),n.transform||e!==this.startIndices){ArrayBuffer.isView(t)&&(t={value:t});const r=t;yt(ArrayBuffer.isView(r.value),`invalid ${n.accessor}`);const a=!!r.size&&r.size!==this.size;return i.binaryAccessor=mr(r.value,{size:r.size||this.size,stride:r.stride,offset:r.offset,startIndices:e,nested:a}),!1}return this.clearNeedsUpdate(),this.setData(t),!0}getVertexOffset(t){const{startIndices:e}=this;return(e?t<e.length?e[t]:this.numInstances:t)*this.size}getValue(){const t=this.settings.shaderAttributes,e=super.getValue();if(!t)return e;for(const i in t)Object.assign(e,super.getValue(i,t[i]));return e}getBufferLayout(t){this.state.layoutChanged=!1;const e=this.settings.shaderAttributes,i=super._getBufferLayout(),{stepMode:n}=this.settings;if(n==="dynamic"?i.stepMode=t?t.isInstanced?"instance":"vertex":"instance":i.stepMode=n??"vertex",!e)return i;for(const o in e){const r=super._getBufferLayout(o,e[o]);i.attributes.push(...r.attributes)}return i}_autoUpdater(t,{data:e,startRow:i,endRow:n,props:o,numInstances:r}){const{settings:a,state:l,value:c,size:u,startIndices:f}=t,{accessor:h,transform:d}=a,p=l.binaryAccessor||(typeof h=="function"?h:o[h]);yt(typeof p=="function",`accessor "${h}" is not a function`);let g=t.getVertexOffset(i);const{iterable:y,objectInfo:v}=kt(e,i,n);for(const _ of y){v.index++;let C=p(_,v);if(d&&(C=d.call(this,C)),f){const w=(v.index<f.length-1?f[v.index+1]:r)-f[v.index];if(C&&Array.isArray(C[0])){let A=g;for(const I of C)t._normalizeValue(I,c,A),A+=u}else C&&C.length>u?c.set(C,g):(t._normalizeValue(C,v.target,0),xl({target:c,source:v.target,start:g,count:w}));g+=w*u}else t._normalizeValue(C,c,g),g+=u}}_validateAttributeUpdaters(){const{settings:t}=this;if(!(t.noAlloc||typeof t.update=="function"))throw new Error(`Attribute ${this.id} missing update or accessor`)}_checkAttributeArray(){const{value:t}=this,e=Math.min(4,this.size);if(t&&t.length>=e){let i=!0;switch(e){case 4:i=i&&Number.isFinite(t[3]);case 3:i=i&&Number.isFinite(t[2]);case 2:i=i&&Number.isFinite(t[1]);case 1:i=i&&Number.isFinite(t[0]);break;default:i=!1}if(!i)throw new Error(`Illegal attribute generated for ${this.id}`)}}}function Si(s){const{source:t,target:e,start:i=0,size:n,getData:o}=s,r=s.end||e.length,a=t.length,l=r-i;if(a>l){e.set(t.subarray(0,l),i);return}if(e.set(t,i),!o)return;let c=a;for(;c<l;){const u=o(c,t);for(let f=0;f<n;f++)e[i+c]=u[f]||0,c++}}function Fu({source:s,target:t,size:e,getData:i,sourceStartIndices:n,targetStartIndices:o}){if(!n||!o)return Si({source:s,target:t,size:e,getData:i}),t;let r=0,a=0;const l=i&&((u,f)=>i(u+a,f)),c=Math.min(n.length,o.length);for(let u=1;u<c;u++){const f=n[u]*e,h=o[u]*e;Si({source:s.subarray(r,f),target:t,start:a,end:h,size:e,getData:l}),r=f,a=h}return a<t.length&&Si({source:[],target:t,start:a,size:e,getData:l}),t}function ku(s){const{device:t,settings:e,value:i}=s,n=new xr(t,e);return n.setData({value:i instanceof Float64Array?new Float64Array(0):new Float32Array(0),normalized:e.normalized}),n}function _r(s){switch(s){case 1:return"float";case 2:return"vec2";case 3:return"vec3";case 4:return"vec4";default:throw new Error(`No defined attribute type for size "${s}"`)}}function vr(s){switch(s){case 1:return"float32";case 2:return"float32x2";case 3:return"float32x3";case 4:return"float32x4";default:throw new Error("invalid type size")}}function br(s){s.push(s.shift())}function Du(s,t){const{doublePrecision:e,settings:i,value:n,size:o}=s,r=e&&n instanceof Float64Array?2:1;let a=0;const{shaderAttributes:l}=s.settings;if(l)for(const c of Object.values(l))a=Math.max(a,c.vertexOffset??0);return(i.noAlloc?n.length:(t+a)*o)*r}function Cr({device:s,source:t,target:e}){return(!e||e.byteLength<t.byteLength)&&(e?.destroy(),e=s.createBuffer({byteLength:t.byteLength,usage:t.usage})),e}function wr({device:s,buffer:t,attribute:e,fromLength:i,toLength:n,fromStartIndices:o,getData:r=a=>a}){const a=e.doublePrecision&&e.value instanceof Float64Array?2:1,l=e.size*a,c=e.byteOffset,u=e.settings.bytesPerElement<4?c/e.settings.bytesPerElement*4:c,f=e.startIndices,h=o&&f,d=e.isConstant;if(!h&&t&&i>=n)return t;const p=e.value instanceof Float64Array?Float32Array:e.value.constructor,g=d?e.value:new p(e.getBuffer().readSyncWebGL(c,n*p.BYTES_PER_ELEMENT).buffer);if(e.settings.normalized&&!d){const C=r;r=(w,A)=>e.normalizeConstant(C(w,A))}const y=d?(C,w)=>r(g,w):(C,w)=>r(g.subarray(C+c,C+c+l),w),v=t?new Float32Array(t.readSyncWebGL(u,i*4).buffer):new Float32Array(0),_=new Float32Array(n);return Fu({source:v,target:_,sourceStartIndices:o,targetStartIndices:f,size:l,getData:y}),(!t||t.byteLength<_.byteLength+u)&&(t?.destroy(),t=s.createBuffer({byteLength:_.byteLength+u,usage:35050})),t.write(_,u),t}class Pr{constructor({device:t,attribute:e,timeline:i}){this.buffers=[],this.currentLength=0,this.device=t,this.transition=new gs(i),this.attribute=e,this.attributeInTransition=ku(e),this.currentStartIndices=e.startIndices}get inProgress(){return this.transition.inProgress}start(t,e,i=1/0){this.settings=t,this.currentStartIndices=this.attribute.startIndices,this.currentLength=Du(this.attribute,e),this.transition.start({...t,duration:i})}update(){const t=this.transition.update();return t&&this.onUpdate(),t}setBuffer(t){this.attributeInTransition.setData({buffer:t,normalized:this.attribute.settings.normalized,value:this.attributeInTransition.value})}cancel(){this.transition.cancel()}delete(){this.cancel();for(const t of this.buffers)t.destroy();this.buffers.length=0}}class Nu extends Pr{constructor({device:t,attribute:e,timeline:i}){super({device:t,attribute:e,timeline:i}),this.type="interpolation",this.transform=Vu(t,e)}start(t,e){const i=this.currentLength,n=this.currentStartIndices;if(super.start(t,e,t.duration),t.duration<=0){this.transition.cancel();return}const{buffers:o,attribute:r}=this;br(o),o[0]=wr({device:this.device,buffer:o[0],attribute:r,fromLength:i,toLength:this.currentLength,fromStartIndices:n,getData:t.enter}),o[1]=Cr({device:this.device,source:o[0],target:o[1]}),this.setBuffer(o[1]);const{transform:a}=this,l=a.model;let c=Math.floor(this.currentLength/r.size);Tr(r)&&(c/=2),l.setVertexCount(c),r.isConstant?(l.setAttributes({aFrom:o[0]}),l.setConstantAttributes({aTo:r.value})):l.setAttributes({aFrom:o[0],aTo:r.getBuffer()}),a.transformFeedback.setBuffers({vCurrent:o[1]})}onUpdate(){const{duration:t,easing:e}=this.settings,{time:i}=this.transition;let n=i/t;e&&(n=e(n));const{model:o}=this.transform,r={time:n};o.shaderInputs.setProps({interpolation:r}),this.transform.run({discard:!0})}delete(){super.delete(),this.transform.destroy()}}const Uu=`layout(std140) uniform interpolationUniforms {
  float time;
} interpolation;
`,vn={name:"interpolation",vs:Uu,uniformTypes:{time:"f32"}},Gu=`#version 300 es
#define SHADER_NAME interpolation-transition-vertex-shader

in ATTRIBUTE_TYPE aFrom;
in ATTRIBUTE_TYPE aTo;
out ATTRIBUTE_TYPE vCurrent;

void main(void) {
  vCurrent = mix(aFrom, aTo, interpolation.time);
  gl_Position = vec4(0.0);
}
`,ju=`#version 300 es
#define SHADER_NAME interpolation-transition-vertex-shader

in ATTRIBUTE_TYPE aFrom;
in ATTRIBUTE_TYPE aFrom64Low;
in ATTRIBUTE_TYPE aTo;
in ATTRIBUTE_TYPE aTo64Low;
out ATTRIBUTE_TYPE vCurrent;
out ATTRIBUTE_TYPE vCurrent64Low;

vec2 mix_fp64(vec2 a, vec2 b, float x) {
  vec2 range = sub_fp64(b, a);
  return sum_fp64(a, mul_fp64(range, vec2(x, 0.0)));
}

void main(void) {
  for (int i=0; i<ATTRIBUTE_SIZE; i++) {
    vec2 value = mix_fp64(vec2(aFrom[i], aFrom64Low[i]), vec2(aTo[i], aTo64Low[i]), interpolation.time);
    vCurrent[i] = value.x;
    vCurrent64Low[i] = value.y;
  }
  gl_Position = vec4(0.0);
}
`;function Tr(s){return s.doublePrecision&&s.value instanceof Float64Array}function Vu(s,t){const e=t.size,i=_r(e),n=vr(e),o=t.getBufferLayout();return Tr(t)?new qt(s,{vs:ju,bufferLayout:[{name:"aFrom",byteStride:8*e,attributes:[{attribute:"aFrom",format:n,byteOffset:0},{attribute:"aFrom64Low",format:n,byteOffset:4*e}]},{name:"aTo",byteStride:8*e,attributes:[{attribute:"aTo",format:n,byteOffset:0},{attribute:"aTo64Low",format:n,byteOffset:4*e}]}],modules:[xc,vn],defines:{ATTRIBUTE_TYPE:i,ATTRIBUTE_SIZE:e},moduleSettings:{},varyings:["vCurrent","vCurrent64Low"],bufferMode:35980,disableWarnings:!0}):new qt(s,{vs:Gu,bufferLayout:[{name:"aFrom",format:n},{name:"aTo",format:o.attributes[0].format}],modules:[vn],defines:{ATTRIBUTE_TYPE:i},varyings:["vCurrent"],disableWarnings:!0})}class $u extends Pr{constructor({device:t,attribute:e,timeline:i}){super({device:t,attribute:e,timeline:i}),this.type="spring",this.texture=Zu(t),this.framebuffer=Xu(t,this.texture),this.transform=Yu(t,e)}start(t,e){const i=this.currentLength,n=this.currentStartIndices;super.start(t,e);const{buffers:o,attribute:r}=this;for(let l=0;l<2;l++)o[l]=wr({device:this.device,buffer:o[l],attribute:r,fromLength:i,toLength:this.currentLength,fromStartIndices:n,getData:t.enter});o[2]=Cr({device:this.device,source:o[0],target:o[2]}),this.setBuffer(o[1]);const{model:a}=this.transform;a.setVertexCount(Math.floor(this.currentLength/r.size)),r.isConstant?a.setConstantAttributes({aTo:r.value}):a.setAttributes({aTo:r.getBuffer()})}onUpdate(){const{buffers:t,transform:e,framebuffer:i,transition:n}=this,o=this.settings;e.model.setAttributes({aPrev:t[0],aCur:t[1]}),e.transformFeedback.setBuffers({vNext:t[2]});const r={stiffness:o.stiffness,damping:o.damping};e.model.shaderInputs.setProps({spring:r}),e.run({framebuffer:i,discard:!1,parameters:{viewport:[0,0,1,1]},clearColor:[0,0,0,0]}),br(t),this.setBuffer(t[1]),this.device.readPixelsToArrayWebGL(i)[0]>0||n.end()}delete(){super.delete(),this.transform.destroy(),this.texture.destroy(),this.framebuffer.destroy()}}const Wu=`layout(std140) uniform springUniforms {
  float damping;
  float stiffness;
} spring;
`,qu={name:"spring",vs:Wu,uniformTypes:{damping:"f32",stiffness:"f32"}},Hu=`#version 300 es
#define SHADER_NAME spring-transition-vertex-shader

#define EPSILON 0.00001

in ATTRIBUTE_TYPE aPrev;
in ATTRIBUTE_TYPE aCur;
in ATTRIBUTE_TYPE aTo;
out ATTRIBUTE_TYPE vNext;
out float vIsTransitioningFlag;

ATTRIBUTE_TYPE getNextValue(ATTRIBUTE_TYPE cur, ATTRIBUTE_TYPE prev, ATTRIBUTE_TYPE dest) {
  ATTRIBUTE_TYPE velocity = cur - prev;
  ATTRIBUTE_TYPE delta = dest - cur;
  ATTRIBUTE_TYPE force = delta * spring.stiffness;
  ATTRIBUTE_TYPE resistance = velocity * spring.damping;
  return force - resistance + velocity + cur;
}

void main(void) {
  bool isTransitioning = length(aCur - aPrev) > EPSILON || length(aTo - aCur) > EPSILON;
  vIsTransitioningFlag = isTransitioning ? 1.0 : 0.0;

  vNext = getNextValue(aCur, aPrev, aTo);
  gl_Position = vec4(0, 0, 0, 1);
  gl_PointSize = 100.0;
}
`,Ku=`#version 300 es
#define SHADER_NAME spring-transition-is-transitioning-fragment-shader

in float vIsTransitioningFlag;

out vec4 fragColor;

void main(void) {
  if (vIsTransitioningFlag == 0.0) {
    discard;
  }
  fragColor = vec4(1.0);
}`;function Yu(s,t){const e=_r(t.size),i=vr(t.size);return new qt(s,{vs:Hu,fs:Ku,bufferLayout:[{name:"aPrev",format:i},{name:"aCur",format:i},{name:"aTo",format:t.getBufferLayout().attributes[0].format}],varyings:["vNext"],modules:[qu],defines:{ATTRIBUTE_TYPE:e},parameters:{depthCompare:"always",blendColorOperation:"max",blendColorSrcFactor:"one",blendColorDstFactor:"one",blendAlphaOperation:"max",blendAlphaSrcFactor:"one",blendAlphaDstFactor:"one"}})}function Zu(s){return s.createTexture({data:new Uint8Array(4),format:"rgba8unorm",width:1,height:1})}function Xu(s,t){return s.createFramebuffer({id:"spring-transition-is-transitioning-framebuffer",width:1,height:1,colorAttachments:[t]})}const Ju={interpolation:Nu,spring:$u};class Qu{constructor(t,{id:e,timeline:i}){if(!t)throw new Error("AttributeTransitionManager is constructed without device");this.id=e,this.device=t,this.timeline=i,this.transitions={},this.needsRedraw=!1,this.numInstances=1}finalize(){for(const t in this.transitions)this._removeTransition(t)}update({attributes:t,transitions:e,numInstances:i}){this.numInstances=i||1;for(const n in t){const o=t[n],r=o.getTransitionSetting(e);r&&this._updateAttribute(n,o,r)}for(const n in this.transitions){const o=t[n];(!o||!o.getTransitionSetting(e))&&this._removeTransition(n)}}hasAttribute(t){const e=this.transitions[t];return e&&e.inProgress}getAttributes(){const t={};for(const e in this.transitions){const i=this.transitions[e];i.inProgress&&(t[e]=i.attributeInTransition)}return t}run(){if(this.numInstances===0)return!1;for(const e in this.transitions)this.transitions[e].update()&&(this.needsRedraw=!0);const t=this.needsRedraw;return this.needsRedraw=!1,t}_removeTransition(t){this.transitions[t].delete(),delete this.transitions[t]}_updateAttribute(t,e,i){const n=this.transitions[t];let o=!n||n.type!==i.type;if(o){n&&this._removeTransition(t);const r=Ju[i.type];r?this.transitions[t]=new r({attribute:e,timeline:this.timeline,device:this.device}):(K.error(`unsupported transition type '${i.type}'`)(),o=!1)}(o||e.needsRedraw())&&(this.needsRedraw=!0,this.transitions[t].start(i,this.numInstances))}}const bn="attributeManager.invalidate",tf="attributeManager.updateStart",ef="attributeManager.updateEnd",sf="attribute.updateStart",nf="attribute.allocate",of="attribute.updateEnd";class rf{constructor(t,{id:e="attribute-manager",stats:i,timeline:n}={}){this.mergeBoundsMemoized=No(_l),this.id=e,this.device=t,this.attributes={},this.updateTriggers={},this.needsRedraw=!0,this.userData={},this.stats=i,this.attributeTransitionManager=new Qu(t,{id:`${e}-transitions`,timeline:n}),Object.seal(this)}finalize(){for(const t in this.attributes)this.attributes[t].delete();this.attributeTransitionManager.finalize()}getNeedsRedraw(t={clearRedrawFlags:!1}){const e=this.needsRedraw;return this.needsRedraw=this.needsRedraw&&!t.clearRedrawFlags,e&&this.id}setNeedsRedraw(){this.needsRedraw=!0}add(t){this._add(t)}addInstanced(t){this._add(t,{stepMode:"instance"})}remove(t){for(const e of t)this.attributes[e]!==void 0&&(this.attributes[e].delete(),delete this.attributes[e])}invalidate(t,e){const i=this._invalidateTrigger(t,e);at(bn,this,t,i)}invalidateAll(t){for(const e in this.attributes)this.attributes[e].setNeedsUpdate(e,t);at(bn,this,"all")}update({data:t,numInstances:e,startIndices:i=null,transitions:n,props:o={},buffers:r={},context:a={}}){let l=!1;at(tf,this),this.stats&&this.stats.get("Update Attributes").timeStart();for(const c in this.attributes){const u=this.attributes[c],f=u.settings.accessor;u.startIndices=i,u.numInstances=e,o[c]&&K.removed(`props.${c}`,`data.attributes.${c}`)(),u.setExternalBuffer(r[c])||u.setBinaryValue(typeof f=="string"?r[f]:void 0,t.startIndices)||typeof f=="string"&&!r[f]&&u.setConstantValue(a,o[f])||u.needsUpdate()&&(l=!0,this._updateAttribute({attribute:u,numInstances:e,data:t,props:o,context:a})),this.needsRedraw=this.needsRedraw||u.needsRedraw()}l&&at(ef,this,e),this.stats&&(this.stats.get("Update Attributes").timeEnd(),l&&this.stats.get("Attributes updated").incrementCount()),this.attributeTransitionManager.update({attributes:this.attributes,numInstances:e,transitions:n})}updateTransition(){const{attributeTransitionManager:t}=this,e=t.run();return this.needsRedraw=this.needsRedraw||e,e}getAttributes(){return{...this.attributes,...this.attributeTransitionManager.getAttributes()}}getBounds(t){const e=t.map(i=>this.attributes[i]?.getBounds());return this.mergeBoundsMemoized(e)}getChangedAttributes(t={clearChangedFlags:!1}){const{attributes:e,attributeTransitionManager:i}=this,n={...i.getAttributes()};for(const o in e){const r=e[o];r.needsRedraw(t)&&!i.hasAttribute(o)&&(n[o]=r)}return n}getBufferLayouts(t){return Object.values(this.getAttributes()).map(e=>e.getBufferLayout(t))}_add(t,e){for(const i in t){const n=t[i],o={...n,id:i,size:n.isIndexed&&1||n.size||1,...e};this.attributes[i]=new xr(this.device,o)}this._mapUpdateTriggersToAttributes()}_mapUpdateTriggersToAttributes(){const t={};for(const e in this.attributes)this.attributes[e].getUpdateTriggers().forEach(n=>{t[n]||(t[n]=[]),t[n].push(e)});this.updateTriggers=t}_invalidateTrigger(t,e){const{attributes:i,updateTriggers:n}=this,o=n[t];return o&&o.forEach(r=>{const a=i[r];a&&a.setNeedsUpdate(a.id,e)}),o}_updateAttribute(t){const{attribute:e,numInstances:i}=t;if(at(sf,e),e.constant){e.setConstantValue(t.context,e.value);return}e.allocate(i)&&at(nf,e,i),e.updateBuffer(t)&&(this.needsRedraw=!0,at(of,e,i))}}class af extends gs{get value(){return this._value}_onUpdate(){const{time:t,settings:{fromValue:e,toValue:i,duration:n,easing:o}}=this,r=o(t/n);this._value=vl(e,i,r)}}const Cn=1e-5;function wn(s,t,e,i,n){const o=t-s,a=(e-t)*n,l=-o*i;return a+l+o+t}function lf(s,t,e,i,n){if(Array.isArray(e)){const o=[];for(let r=0;r<e.length;r++)o[r]=wn(s[r],t[r],e[r],i,n);return o}return wn(s,t,e,i,n)}function Pn(s,t){if(Array.isArray(s)){let e=0;for(let i=0;i<s.length;i++){const n=s[i]-t[i];e+=n*n}return Math.sqrt(e)}return Math.abs(s-t)}class cf extends gs{get value(){return this._currValue}_onUpdate(){const{fromValue:t,toValue:e,damping:i,stiffness:n}=this.settings,{_prevValue:o=t,_currValue:r=t}=this;let a=lf(o,r,e,i,n);const l=Pn(a,e),c=Pn(a,r);l<Cn&&c<Cn&&(a=e,this.end()),this._prevValue=r,this._currValue=a}}const uf={interpolation:af,spring:cf};class ff{constructor(t){this.transitions=new Map,this.timeline=t}get active(){return this.transitions.size>0}add(t,e,i,n){const{transitions:o}=this;if(o.has(t)){const l=o.get(t),{value:c=l.settings.fromValue}=l;e=c,this.remove(t)}if(n=yr(n),!n)return;const r=uf[n.type];if(!r){K.error(`unsupported transition type '${n.type}'`)();return}const a=new r(this.timeline);a.start({...n,fromValue:e,toValue:i}),o.set(t,a)}remove(t){const{transitions:e}=this;e.has(t)&&(e.get(t).cancel(),e.delete(t))}update(){const t={};for(const[e,i]of this.transitions)i.update(),t[e]=i.value,i.inProgress||this.remove(e);return t}clear(){for(const t of this.transitions.keys())this.remove(t)}}function hf(s){const t=s[St];for(const e in t){const i=t[e],{validate:n}=i;if(n&&!n(s[e],i))throw new Error(`Invalid prop ${e}: ${s[e]}`)}}function df(s,t){const e=Lr({newProps:s,oldProps:t,propTypes:s[St],ignoreProps:{data:null,updateTriggers:null,extensions:null,transitions:null}}),i=gf(s,t);let n=!1;return i||(n=mf(s,t)),{dataChanged:i,propsChanged:e,updateTriggersChanged:n,extensionsChanged:yf(s,t),transitionsChanged:pf(s,t)}}function pf(s,t){if(!s.transitions)return!1;const e={},i=s[St];let n=!1;for(const o in s.transitions){const r=i[o],a=r&&r.type;(a==="number"||a==="color"||a==="array")&&Ji(s[o],t[o],r)&&(e[o]=!0,n=!0)}return n?e:!1}function Lr({newProps:s,oldProps:t,ignoreProps:e={},propTypes:i={},triggerName:n="props"}){if(t===s)return!1;if(typeof s!="object"||s===null)return`${n} changed shallowly`;if(typeof t!="object"||t===null)return`${n} changed shallowly`;for(const o of Object.keys(s))if(!(o in e)){if(!(o in t))return`${n}.${o} added`;const r=Ji(s[o],t[o],i[o]);if(r)return`${n}.${o} ${r}`}for(const o of Object.keys(t))if(!(o in e)){if(!(o in s))return`${n}.${o} dropped`;if(!Object.hasOwnProperty.call(s,o)){const r=Ji(s[o],t[o],i[o]);if(r)return`${n}.${o} ${r}`}}return!1}function Ji(s,t,e){let i=e&&e.equal;return i&&!i(s,t,e)||!i&&(i=s&&t&&s.equals,i&&!i.call(s,t))?"changed deeply":!i&&t!==s?"changed shallowly":null}function gf(s,t){if(t===null)return"oldProps is null, initial diff";let e=!1;const{dataComparator:i,_dataDiff:n}=s;return i?i(s.data,t.data)||(e="Data comparator detected a change"):s.data!==t.data&&(e="A new data container was supplied"),e&&n&&(e=n(s.data,t.data)||e),e}function mf(s,t){if(t===null)return{all:!0};if("all"in s.updateTriggers&&Tn(s,t,"all"))return{all:!0};const e={};let i=!1;for(const n in s.updateTriggers)n!=="all"&&Tn(s,t,n)&&(e[n]=!0,i=!0);return i?e:!1}function yf(s,t){if(t===null)return!0;const e=t.extensions,{extensions:i}=s;if(i===e)return!1;if(!e||!i||i.length!==e.length)return!0;for(let n=0;n<i.length;n++)if(!i[n].equals(e[n]))return!0;return!1}function Tn(s,t,e){let i=s.updateTriggers[e];i=i??{};let n=t.updateTriggers[e];return n=n??{},Lr({oldProps:n,newProps:i,triggerName:e})}const xf="count(): argument not an object",_f="count(): argument not a container";function vf(s){if(!Cf(s))throw new Error(xf);if(typeof s.count=="function")return s.count();if(Number.isFinite(s.size))return s.size;if(Number.isFinite(s.length))return s.length;if(bf(s))return Object.keys(s).length;throw new Error(_f)}function bf(s){return s!==null&&typeof s=="object"&&s.constructor===Object}function Cf(s){return s!==null&&typeof s=="object"}function Ln(s,t){if(!t)return s;const e={...s,...t};if("defines"in t&&(e.defines={...s.defines,...t.defines}),"modules"in t&&(e.modules=(s.modules||[]).concat(t.modules),t.modules.some(i=>i.name==="project64"))){const i=e.modules.findIndex(n=>n.name==="project32");i>=0&&e.modules.splice(i,1)}if("inject"in t)if(!s.inject)e.inject=t.inject;else{const i={...s.inject};for(const n in t.inject)i[n]=(i[n]||"")+t.inject[n];e.inject=i}return e}const wf={minFilter:"linear",mipmapFilter:"linear",magFilter:"linear",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge"},Qi={};function Pf(s,t,e,i){if(e instanceof it)return e;e.constructor&&e.constructor.name!=="Object"&&(e={data:e});let n=null;e.compressed&&(n={minFilter:"linear",mipmapFilter:e.data.length>1?"nearest":"linear"});const{width:o,height:r}=e.data,a=t.createTexture({...e,sampler:{...wf,...n,...i},mipLevels:t.getMipLevelCount(o,r)});return t.type==="webgl"?a.generateMipmapsWebGL():t.type==="webgpu"&&t.generateMipmapsWebGPU(a),Qi[a.id]=s,a}function Tf(s,t){!t||!(t instanceof it)||Qi[t.id]===s&&(t.delete(),delete Qi[t.id])}const Lf={boolean:{validate(s,t){return!0},equal(s,t,e){return!!s==!!t}},number:{validate(s,t){return Number.isFinite(s)&&(!("max"in t)||s<=t.max)&&(!("min"in t)||s>=t.min)}},color:{validate(s,t){return t.optional&&!s||ts(s)&&(s.length===3||s.length===4)},equal(s,t,e){return _e(s,t,1)}},accessor:{validate(s,t){const e=si(s);return e==="function"||e===si(t.value)},equal(s,t,e){return typeof t=="function"?!0:_e(s,t,1)}},array:{validate(s,t){return t.optional&&!s||ts(s)},equal(s,t,e){const{compare:i}=e,n=Number.isInteger(i)?i:i?1:0;return i?_e(s,t,n):s===t}},object:{equal(s,t,e){if(e.ignore)return!0;const{compare:i}=e,n=Number.isInteger(i)?i:i?1:0;return i?_e(s,t,n):s===t}},function:{validate(s,t){return t.optional&&!s||typeof s=="function"},equal(s,t,e){return!e.compare&&e.ignore!==!1||s===t}},data:{transform:(s,t,e)=>{if(!s)return s;const{dataTransform:i}=e.props;return i?i(s):typeof s.shape=="string"&&s.shape.endsWith("-table")&&Array.isArray(s.data)?s.data:s}},image:{transform:(s,t,e)=>{const i=e.context;return!i||!i.device?null:Pf(e.id,i.device,s,{...t.parameters,...e.props.textureParameters})},release:(s,t,e)=>{Tf(e.id,s)}}};function Sf(s){const t={},e={},i={};for(const[n,o]of Object.entries(s)){const r=o?.deprecatedFor;if(r)i[n]=Array.isArray(r)?r:[r];else{const a=Af(n,o);t[n]=a,e[n]=a.value}}return{propTypes:t,defaultProps:e,deprecatedProps:i}}function Af(s,t){switch(si(t)){case"object":return ne(s,t);case"array":return ne(s,{type:"array",value:t,compare:!1});case"boolean":return ne(s,{type:"boolean",value:t});case"number":return ne(s,{type:"number",value:t});case"function":return ne(s,{type:"function",value:t,compare:!0});default:return{name:s,type:"unknown",value:t}}}function ne(s,t){return"type"in t?{name:s,...Lf[t.type],...t}:"value"in t?{name:s,type:si(t.value),...t}:{name:s,type:"object",value:t}}function ts(s){return Array.isArray(s)||ArrayBuffer.isView(s)}function si(s){return ts(s)?"array":s===null?"null":typeof s}function Ef(s,t){let e;for(let o=t.length-1;o>=0;o--){const r=t[o];"extensions"in r&&(e=r.extensions)}const i=es(s.constructor,e),n=Object.create(i);n[Qe]=s,n[Bt]={},n[Tt]={};for(let o=0;o<t.length;++o){const r=t[o];for(const a in r)n[a]=r[a]}return Object.freeze(n),n}const If="_mergedDefaultProps";function es(s,t){if(!(s instanceof ci.constructor))return{};let e=If;if(t)for(const n of t){const o=n.constructor;o&&(e+=`:${o.extensionName||o.name}`)}const i=Sr(s,e);return i||(s[e]=Mf(s,t||[]))}function Mf(s,t){if(!s.prototype)return null;const i=Object.getPrototypeOf(s),n=es(i),o=Sr(s,"defaultProps")||{},r=Sf(o),a=Object.assign(Object.create(null),n,r.defaultProps),l=Object.assign(Object.create(null),n?.[St],r.propTypes),c=Object.assign(Object.create(null),n?.[Ci],r.deprecatedProps);for(const u of t){const f=es(u.constructor);f&&(Object.assign(a,f),Object.assign(l,f[St]),Object.assign(c,f[Ci]))}return Of(a,s),zf(a,l),Rf(a,c),a[St]=l,a[Ci]=c,t.length===0&&!vs(s,"_propTypes")&&(s._propTypes=l),a}function Of(s,t){const e=Ff(t);Object.defineProperties(s,{id:{writable:!0,value:e}})}function Rf(s,t){for(const e in t)Object.defineProperty(s,e,{enumerable:!1,set(i){const n=`${this.id}: ${e}`;for(const o of t[e])vs(this,o)||(this[o]=i);K.deprecated(n,t[e].join("/"))()}})}function zf(s,t){const e={},i={};for(const n in t){const o=t[n],{name:r,value:a}=o;o.async&&(e[r]=a,i[r]=Bf(r))}s[Vt]=e,s[Bt]={},Object.defineProperties(s,i)}function Bf(s){return{enumerable:!0,set(t){typeof t=="string"||t instanceof Promise||gr(t)?this[Bt][s]=t:this[Tt][s]=t},get(){if(this[Tt]){if(s in this[Tt])return this[Tt][s]||this[Vt][s];if(s in this[Bt]){const t=this[Qe]&&this[Qe].internalState;if(t&&t.hasAsyncProp(s))return t.getAsyncProp(s)||this[Vt][s]}}return this[Vt][s]}}}function vs(s,t){return Object.prototype.hasOwnProperty.call(s,t)}function Sr(s,t){return vs(s,t)&&s[t]}function Ff(s){const t=s.componentName;return t||K.warn(`${s.name}.componentName not specified`)(),t||s.name}let kf=0;class ci{constructor(...t){this.props=Ef(this,t),this.id=this.props.id,this.count=kf++}clone(t){const{props:e}=this,i={};for(const n in e[Vt])n in e[Tt]?i[n]=e[Tt][n]:n in e[Bt]&&(i[n]=e[Bt][n]);return new this.constructor({...e,...i,...t})}}ci.componentName="Component";ci.defaultProps={};const Df=Object.freeze({});class Nf{constructor(t){this.component=t,this.asyncProps={},this.onAsyncPropUpdated=()=>{},this.oldProps=null,this.oldAsyncProps=null}finalize(){for(const t in this.asyncProps){const e=this.asyncProps[t];e&&e.type&&e.type.release&&e.type.release(e.resolvedValue,e.type,this.component)}this.asyncProps={},this.component=null,this.resetOldProps()}getOldProps(){return this.oldAsyncProps||this.oldProps||Df}resetOldProps(){this.oldAsyncProps=null,this.oldProps=this.component?this.component.props:null}hasAsyncProp(t){return t in this.asyncProps}getAsyncProp(t){const e=this.asyncProps[t];return e&&e.resolvedValue}isAsyncPropLoading(t){if(t){const e=this.asyncProps[t];return!!(e&&e.pendingLoadCount>0&&e.pendingLoadCount!==e.resolvedLoadCount)}for(const e in this.asyncProps)if(this.isAsyncPropLoading(e))return!0;return!1}reloadAsyncProp(t,e){this._watchPromise(t,Promise.resolve(e))}setAsyncProps(t){this.component=t[Qe]||this.component;const e=t[Tt]||{},i=t[Bt]||t,n=t[Vt]||{};for(const o in e){const r=e[o];this._createAsyncPropData(o,n[o]),this._updateAsyncProp(o,r),e[o]=this.getAsyncProp(o)}for(const o in i){const r=i[o];this._createAsyncPropData(o,n[o]),this._updateAsyncProp(o,r)}}_fetch(t,e){return null}_onResolve(t,e){}_onError(t,e){}_updateAsyncProp(t,e){if(this._didAsyncInputValueChange(t,e)){if(typeof e=="string"&&(e=this._fetch(t,e)),e instanceof Promise){this._watchPromise(t,e);return}if(gr(e)){this._resolveAsyncIterable(t,e);return}this._setPropValue(t,e)}}_freezeAsyncOldProps(){if(!this.oldAsyncProps&&this.oldProps){this.oldAsyncProps=Object.create(this.oldProps);for(const t in this.asyncProps)Object.defineProperty(this.oldAsyncProps,t,{enumerable:!0,value:this.oldProps[t]})}}_didAsyncInputValueChange(t,e){const i=this.asyncProps[t];return e===i.resolvedValue||e===i.lastValue?!1:(i.lastValue=e,!0)}_setPropValue(t,e){this._freezeAsyncOldProps();const i=this.asyncProps[t];i&&(e=this._postProcessValue(i,e),i.resolvedValue=e,i.pendingLoadCount++,i.resolvedLoadCount=i.pendingLoadCount)}_setAsyncPropValue(t,e,i){const n=this.asyncProps[t];n&&i>=n.resolvedLoadCount&&e!==void 0&&(this._freezeAsyncOldProps(),n.resolvedValue=e,n.resolvedLoadCount=i,this.onAsyncPropUpdated(t,e))}_watchPromise(t,e){const i=this.asyncProps[t];if(i){i.pendingLoadCount++;const n=i.pendingLoadCount;e.then(o=>{this.component&&(o=this._postProcessValue(i,o),this._setAsyncPropValue(t,o,n),this._onResolve(t,o))}).catch(o=>{this._onError(t,o)})}}async _resolveAsyncIterable(t,e){if(t!=="data"){this._setPropValue(t,e);return}const i=this.asyncProps[t];if(!i)return;i.pendingLoadCount++;const n=i.pendingLoadCount;let o=[],r=0;for await(const a of e){if(!this.component)return;const{dataTransform:l}=this.component.props;l?o=l(a,o):o=o.concat(a),Object.defineProperty(o,"__diff",{enumerable:!1,value:[{startRow:r,endRow:o.length}]}),r=o.length,this._setAsyncPropValue(t,o,n)}this._onResolve(t,o)}_postProcessValue(t,e){const i=t.type;return i&&this.component&&(i.release&&i.release(t.resolvedValue,i,this.component),i.transform)?i.transform(e,i,this.component):e}_createAsyncPropData(t,e){if(!this.asyncProps[t]){const n=this.component&&this.component.props[St];this.asyncProps[t]={type:n&&n[t],lastValue:null,resolvedValue:e,pendingLoadCount:0,resolvedLoadCount:0}}}}class Uf extends Nf{constructor({attributeManager:t,layer:e}){super(e),this.attributeManager=t,this.needsRedraw=!0,this.needsUpdate=!0,this.subLayers=null,this.usesPickingColorCache=!1}get layer(){return this.component}_fetch(t,e){const i=this.layer,n=i?.props.fetch;return n?n(e,{propName:t,layer:i}):super._fetch(t,e)}_onResolve(t,e){const i=this.layer;if(i){const n=i.props.onDataLoad;t==="data"&&n&&n(e,{propName:t,layer:i})}}_onError(t,e){const i=this.layer;i&&i.raiseError(e,`loading ${t} of ${this.layer}`)}}const Gf="layer.changeFlag",jf="layer.initialize",Vf="layer.update",$f="layer.finalize",Wf="layer.matched",Sn=2**24-1,qf=Object.freeze([]),Hf=No(({oldViewport:s,viewport:t})=>s.equals(t));let ct=new Uint8ClampedArray(0);const Kf={data:{type:"data",value:qf,async:!0},dataComparator:{type:"function",value:null,optional:!0},_dataDiff:{type:"function",value:s=>s&&s.__diff,optional:!0},dataTransform:{type:"function",value:null,optional:!0},onDataLoad:{type:"function",value:null,optional:!0},onError:{type:"function",value:null,optional:!0},fetch:{type:"function",value:(s,{propName:t,layer:e,loaders:i,loadOptions:n,signal:o})=>{const{resourceManager:r}=e.context;n=n||e.getLoadOptions(),i=i||e.props.loaders,o&&(n={...n,core:{...n?.core,fetch:{...n?.core?.fetch,signal:o}}});let a=r.contains(s);return!a&&!n&&(r.add({resourceId:s,data:ji(s,i),persistent:!1}),a=!0),a?r.subscribe({resourceId:s,onChange:l=>e.internalState?.reloadAsyncProp(t,l),consumerId:e.id,requestId:t}):ji(s,i,n)}},updateTriggers:{},visible:!0,pickable:!1,opacity:{type:"number",min:0,max:1,value:1},operation:"draw",onHover:{type:"function",value:null,optional:!0},onClick:{type:"function",value:null,optional:!0},onDragStart:{type:"function",value:null,optional:!0},onDrag:{type:"function",value:null,optional:!0},onDragEnd:{type:"function",value:null,optional:!0},coordinateSystem:"default",coordinateOrigin:{type:"array",value:[0,0,0],compare:!0},modelMatrix:{type:"array",value:null,compare:!0,optional:!0},wrapLongitude:!1,positionFormat:"XYZ",colorFormat:"RGBA",parameters:{type:"object",value:{},optional:!0,compare:2},loadOptions:{type:"object",value:null,optional:!0,ignore:!0},transitions:null,extensions:[],loaders:{type:"array",value:[],optional:!0,ignore:!0},getPolygonOffset:{type:"function",value:({layerIndex:s})=>[0,-s*100]},highlightedObjectIndex:null,autoHighlight:!1,highlightColor:{type:"accessor",value:[0,0,128,128]}};class bt extends ci{constructor(){super(...arguments),this.internalState=null,this.lifecycle=bl.NO_STATE,this.parent=null}static get componentName(){return Object.prototype.hasOwnProperty.call(this,"layerName")?this.layerName:""}get root(){let t=this;for(;t.parent;)t=t.parent;return t}toString(){return`${this.constructor.layerName||this.constructor.name}({id: '${this.props.id}'})`}project(t){yt(this.internalState);const e=this.internalState.viewport||this.context.viewport,i=_s(t,{viewport:e,modelMatrix:this.props.modelMatrix,coordinateOrigin:this.props.coordinateOrigin,coordinateSystem:this.props.coordinateSystem}),[n,o,r]=Cl(i,e.pixelProjectionMatrix);return t.length===2?[n,o]:[n,o,r]}unproject(t){return yt(this.internalState),(this.internalState.viewport||this.context.viewport).unproject(t)}projectPosition(t,e){yt(this.internalState);const i=this.internalState.viewport||this.context.viewport;return Qc(t,{viewport:i,modelMatrix:this.props.modelMatrix,coordinateOrigin:this.props.coordinateOrigin,coordinateSystem:this.props.coordinateSystem,...e})}get isComposite(){return!1}get isDrawable(){return!0}setState(t){this.setChangeFlags({stateChanged:!0}),Object.assign(this.state,t),this.setNeedsRedraw()}setNeedsRedraw(){this.internalState&&(this.internalState.needsRedraw=!0)}setNeedsUpdate(){this.internalState&&(this.context.layerManager.setNeedsUpdate(String(this)),this.internalState.needsUpdate=!0)}get isLoaded(){return this.internalState?!this.internalState.isAsyncPropLoading():!1}get wrapLongitude(){return this.props.wrapLongitude}isPickable(){return this.props.pickable&&this.props.visible}getModels(){const t=this.state;return t&&(t.models||t.model&&[t.model])||[]}setShaderModuleProps(...t){for(const e of this.getModels())e.shaderInputs.setProps(...t)}getAttributeManager(){return this.internalState&&this.internalState.attributeManager}getCurrentLayer(){return this.internalState&&this.internalState.layer}getLoadOptions(){return this.props.loadOptions}use64bitPositions(){const{coordinateSystem:t}=this.props;return t==="default"||t==="lnglat"||t==="cartesian"}onHover(t,e){return this.props.onHover&&this.props.onHover(t,e)||!1}onClick(t,e){return this.props.onClick&&this.props.onClick(t,e)||!1}nullPickingColor(){return[0,0,0]}encodePickingColor(t,e=[]){return e[0]=t+1&255,e[1]=t+1>>8&255,e[2]=t+1>>8>>8&255,e}decodePickingColor(t){yt(t instanceof Uint8Array);const[e,i,n]=t;return e+i*256+n*65536-1}getNumInstances(){return Number.isFinite(this.props.numInstances)?this.props.numInstances:this.state&&this.state.numInstances!==void 0?this.state.numInstances:vf(this.props.data)}getStartIndices(){return this.props.startIndices?this.props.startIndices:this.state&&this.state.startIndices?this.state.startIndices:null}getBounds(){return this.getAttributeManager()?.getBounds(["positions","instancePositions"])}getShaders(t){t=Ln(t,{disableWarnings:!0,modules:this.context.defaultShaderModules});for(const e of this.props.extensions)t=Ln(t,e.getShaders.call(this,e));return t}shouldUpdateState(t){return t.changeFlags.propsOrDataChanged}updateState(t){const e=this.getAttributeManager(),{dataChanged:i}=t.changeFlags;if(i&&e)if(Array.isArray(i))for(const n of i)e.invalidateAll(n);else e.invalidateAll();if(e){const{props:n}=t,o=this.internalState.hasPickingBuffer,r=Number.isInteger(n.highlightedObjectIndex)||!!n.pickable||n.extensions.some(a=>a.getNeedsPickingBuffer.call(this,a));if(o!==r){this.internalState.hasPickingBuffer=r;const{pickingColors:a,instancePickingColors:l}=e.attributes,c=a||l;c&&(r&&c.constant&&(c.constant=!1,e.invalidate(c.id)),!c.value&&!r&&(c.constant=!0,c.value=[0,0,0]))}}}finalizeState(t){for(const i of this.getModels())i.destroy();const e=this.getAttributeManager();e&&e.finalize(),this.context&&this.context.resourceManager.unsubscribe({consumerId:this.id}),this.internalState&&(this.internalState.uniformTransitions.clear(),this.internalState.finalize())}draw(t){for(const e of this.getModels())e.draw(t.renderPass)}getPickingInfo({info:t,mode:e,sourceLayer:i}){const{index:n}=t;return n>=0&&Array.isArray(this.props.data)&&(t.object=this.props.data[n]),t}raiseError(t,e){e&&(t=new Error(`${e}: ${t.message}`,{cause:t})),this.props.onError?.(t)||this.context?.onError?.(t,this)}getNeedsRedraw(t={clearRedrawFlags:!1}){return this._getNeedsRedraw(t)}needsUpdate(){return this.internalState?this.internalState.needsUpdate||this.hasUniformTransition()||this.shouldUpdateState(this._getUpdateParams()):!1}hasUniformTransition(){return this.internalState?.uniformTransitions.active||!1}activateViewport(t){if(!this.internalState)return;const e=this.internalState.viewport;this.internalState.viewport=t,(!e||!Hf({oldViewport:e,viewport:t}))&&(this.setChangeFlags({viewportChanged:!0}),this.isComposite?this.needsUpdate()&&this.setNeedsUpdate():this._update())}invalidateAttribute(t="all"){const e=this.getAttributeManager();e&&(t==="all"?e.invalidateAll():e.invalidate(t))}updateAttributes(t){let e=!1;for(const i in t)t[i].layoutChanged()&&(e=!0);for(const i of this.getModels())this._setModelAttributes(i,t,e)}_updateAttributes(){const t=this.getAttributeManager();if(!t)return;const e=this.props,i=this.getNumInstances(),n=this.getStartIndices();t.update({data:e.data,numInstances:i,startIndices:n,props:e,transitions:e.transitions,buffers:e.data.attributes,context:this});const o=t.getChangedAttributes({clearChangedFlags:!0});this.updateAttributes(o)}_updateAttributeTransition(){const t=this.getAttributeManager();t&&t.updateTransition()}_updateUniformTransition(){const{uniformTransitions:t}=this.internalState;if(t.active){const e=t.update(),i=Object.create(this.props);for(const n in e)Object.defineProperty(i,n,{value:e[n]});return i}return this.props}calculateInstancePickingColors(t,{numInstances:e}){if(t.constant)return;const i=Math.floor(ct.length/4);if(this.internalState.usesPickingColorCache=!0,i<e){e>Sn&&K.warn("Layer has too many data objects. Picking might not be able to distinguish all objects.")(),ct=Je.allocate(ct,e,{size:4,copy:!0,maxCount:Math.max(e,Sn)});const n=Math.floor(ct.length/4),o=[0,0,0];for(let r=i;r<n;r++)this.encodePickingColor(r,o),ct[r*4+0]=o[0],ct[r*4+1]=o[1],ct[r*4+2]=o[2],ct[r*4+3]=0}t.value=ct.subarray(0,e*4)}_setModelAttributes(t,e,i=!1){if(!Object.keys(e).length)return;if(i){const a=this.getAttributeManager();t.setBufferLayout(a.getBufferLayouts(t)),e=a.getAttributes()}const n=t.userData?.excludeAttributes||{},o={},r={};for(const a in e){if(n[a])continue;const l=e[a].getValue();for(const c in l){const u=l[c];u instanceof J?e[a].settings.isIndexed?t.setIndexBuffer(u):o[c]=u:u&&(r[c]=u)}}t.setAttributes(o),t.setConstantAttributes(r)}disablePickingIndex(t){const e=this.props.data;if(!("attributes"in e)){this._disablePickingIndex(t);return}const{pickingColors:i,instancePickingColors:n}=this.getAttributeManager().attributes,o=i||n,r=o&&e.attributes&&e.attributes[o.id];if(r&&r.value){const a=r.value,l=this.encodePickingColor(t);for(let c=0;c<e.length;c++){const u=o.getVertexOffset(c);a[u]===l[0]&&a[u+1]===l[1]&&a[u+2]===l[2]&&this._disablePickingIndex(c)}}else this._disablePickingIndex(t)}_disablePickingIndex(t){const{pickingColors:e,instancePickingColors:i}=this.getAttributeManager().attributes,n=e||i;if(!n)return;const o=n.getVertexOffset(t),r=n.getVertexOffset(t+1);n.buffer.write(new Uint8Array(r-o),o)}restorePickingColors(){const{pickingColors:t,instancePickingColors:e}=this.getAttributeManager().attributes,i=t||e;i&&(this.internalState.usesPickingColorCache&&i.value.buffer!==ct.buffer&&(i.value=ct.subarray(0,i.value.length)),i.updateSubBuffer({startOffset:0}))}_initialize(){yt(!this.internalState),at(jf,this);const t=this._getAttributeManager();t&&t.addInstanced({instancePickingColors:{type:"uint8",size:4,noAlloc:!0,update:this.calculateInstancePickingColors}}),this.internalState=new Uf({attributeManager:t,layer:this}),this._clearChangeFlags(),this.state={},Object.defineProperty(this.state,"attributeManager",{get:()=>(K.deprecated("layer.state.attributeManager","layer.getAttributeManager()")(),t)}),this.internalState.uniformTransitions=new ff(this.context.timeline),this.internalState.onAsyncPropUpdated=this._onAsyncPropUpdated.bind(this),this.internalState.setAsyncProps(this.props),this.initializeState(this.context);for(const e of this.props.extensions)e.initializeState.call(this,this.context,e);this.setChangeFlags({dataChanged:"init",propsChanged:"init",viewportChanged:!0,extensionsChanged:!0}),this._update()}_transferState(t){at(Wf,this,this===t);const{state:e,internalState:i}=t;this!==t&&(this.internalState=i,this.state=e,this.internalState.setAsyncProps(this.props),this._diffProps(this.props,this.internalState.getOldProps()))}_update(){const t=this.needsUpdate();if(at(Vf,this,t),!t)return;this.context.stats.get("Layer updates").incrementCount();const e=this.props,i=this.context,n=this.internalState,o=i.viewport,r=this._updateUniformTransition();n.propsInTransition=r,i.viewport=n.viewport||o,this.props=r;try{const a=this._getUpdateParams(),l=this.getModels();if(i.device)this.updateState(a);else try{this.updateState(a)}catch{}for(const u of this.props.extensions)u.updateState.call(this,a,u);this.setNeedsRedraw(),this._updateAttributes();const c=this.getModels()[0]!==l[0];this._postUpdate(a,c)}finally{i.viewport=o,this.props=e,this._clearChangeFlags(),n.needsUpdate=!1,n.resetOldProps()}}_finalize(){at($f,this),this.finalizeState(this.context);for(const t of this.props.extensions)t.finalizeState.call(this,this.context,t)}_drawLayer({renderPass:t,shaderModuleProps:e=null,uniforms:i={},parameters:n={}}){this._updateAttributeTransition();const o=this.props,r=this.context;this.props=this.internalState.propsInTransition||o;try{e&&this.setShaderModuleProps(e);const{getPolygonOffset:a}=this.props,l=a&&a(i)||[0,0];r.device instanceof _i&&r.device.setParametersWebGL({polygonOffset:l});const c=r.device instanceof _i?null:Yf(n);if(Zf(this.getModels(),t,n,c),r.device instanceof _i)r.device.withParametersWebGL(n,()=>{const u={renderPass:t,shaderModuleProps:e,uniforms:i,parameters:n,context:r};for(const f of this.props.extensions)f.draw.call(this,u,f);this.draw(u)});else{c?.renderPassParameters&&t.setParameters(c.renderPassParameters);const u={renderPass:t,shaderModuleProps:e,uniforms:i,parameters:n,context:r};for(const f of this.props.extensions)f.draw.call(this,u,f);this.draw(u)}}finally{this.props=o}}getChangeFlags(){return this.internalState?.changeFlags}setChangeFlags(t){if(!this.internalState)return;const{changeFlags:e}=this.internalState;for(const n in t)if(t[n]){let o=!1;switch(n){case"dataChanged":const r=t[n],a=e[n];r&&Array.isArray(a)&&(e.dataChanged=Array.isArray(r)?a.concat(r):r,o=!0);default:e[n]||(e[n]=t[n],o=!0)}o&&at(Gf,this,n,t)}const i=!!(e.dataChanged||e.updateTriggersChanged||e.propsChanged||e.extensionsChanged);e.propsOrDataChanged=i,e.somethingChanged=i||e.viewportChanged||e.stateChanged}_clearChangeFlags(){this.internalState.changeFlags={dataChanged:!1,propsChanged:!1,updateTriggersChanged:!1,viewportChanged:!1,stateChanged:!1,extensionsChanged:!1,propsOrDataChanged:!1,somethingChanged:!1}}_diffProps(t,e){const i=df(t,e);if(i.updateTriggersChanged)for(const n in i.updateTriggersChanged)i.updateTriggersChanged[n]&&this.invalidateAttribute(n);if(i.transitionsChanged)for(const n in i.transitionsChanged)this.internalState.uniformTransitions.add(n,e[n],t[n],t.transitions?.[n]);return this.setChangeFlags(i)}validateProps(){hf(this.props)}updateAutoHighlight(t){this.props.autoHighlight&&!Number.isInteger(this.props.highlightedObjectIndex)&&this._updateAutoHighlight(t)}_updateAutoHighlight(t){const e={highlightedObjectColor:t.picked?t.color:null},{highlightColor:i}=this.props;t.picked&&typeof i=="function"&&(e.highlightColor=i(t)),this.setShaderModuleProps({picking:e}),this.setNeedsRedraw()}_getAttributeManager(){const t=this.context;return new rf(t.device,{id:this.props.id,stats:t.stats,timeline:t.timeline})}_postUpdate(t,e){const{props:i,oldProps:n}=t,o=this.state.model;o?.isInstanced&&o.setInstanceCount(this.getNumInstances());const{autoHighlight:r,highlightedObjectIndex:a,highlightColor:l}=i;if(e||n.autoHighlight!==r||n.highlightedObjectIndex!==a||n.highlightColor!==l){const c={};Array.isArray(l)&&(c.highlightColor=l),(e||n.autoHighlight!==r||a!==n.highlightedObjectIndex)&&(c.highlightedObjectColor=Number.isFinite(a)&&a>=0?this.encodePickingColor(a):null),this.setShaderModuleProps({picking:c})}}_getUpdateParams(){return{props:this.props,oldProps:this.internalState.getOldProps(),context:this.context,changeFlags:this.internalState.changeFlags}}_getNeedsRedraw(t){if(!this.internalState)return!1;let e=!1;e=e||this.internalState.needsRedraw&&this.id;const i=this.getAttributeManager(),n=i?i.getNeedsRedraw(t):!1;if(e=e||n,e)for(const o of this.props.extensions)o.onNeedsRedraw.call(this,o);return this.internalState.needsRedraw=this.internalState.needsRedraw&&!t.clearRedrawFlags,e}_onAsyncPropUpdated(){this._diffProps(this.props,this.internalState.getOldProps()),this.setNeedsUpdate()}}bt.defaultProps=Kf;bt.layerName="Layer";function Yf(s){const{blendConstant:t,...e}=s;return t?{pipelineParameters:e,renderPassParameters:{blendConstant:t}}:{pipelineParameters:e}}function Zf(s,t,e,i){for(const n of s)n.device.type==="webgpu"?(Xf(n,t),n.setParameters({...n.parameters,...i?.pipelineParameters})):n.setParameters(e)}function Xf(s,t){const e=t.props.framebuffer||(t.framebuffer??null);if(!e)return;const i=e.colorAttachments.map(r=>r?.texture?.format??null),n=e.depthStencilAttachment?.texture?.format,o=s;(!Jf(o.props.colorAttachmentFormats,i)||o.props.depthStencilAttachmentFormat!==n)&&(o.props.colorAttachmentFormats=i,o.props.depthStencilAttachmentFormat=n,o._setPipelineNeedsUpdate("attachment formats"))}function Jf(s,t){if(s===t)return!0;if(!s||!t||s.length!==t.length)return!1;for(let e=0;e<s.length;e++)if(s[e]!==t[e])return!1;return!0}const Qf="compositeLayer.renderLayers";class It extends bt{get isComposite(){return!0}get isDrawable(){return!1}get isLoaded(){return super.isLoaded&&this.getSubLayers().every(t=>t.isLoaded)}getSubLayers(){return this.internalState&&this.internalState.subLayers||[]}initializeState(t){}setState(t){super.setState(t),this.setNeedsUpdate()}getPickingInfo({info:t}){const{object:e}=t;return e&&e.__source&&e.__source.parent&&e.__source.parent.id===this.id&&(t.object=e.__source.object,t.index=e.__source.index),t}filterSubLayer(t){return!0}shouldRenderSubLayer(t,e){return e&&e.length}getSubLayerClass(t,e){const{_subLayerProps:i}=this.props;return i&&i[t]&&i[t].type||e}getSubLayerRow(t,e,i){return t.__source={parent:this,object:e,index:i},t}getSubLayerAccessor(t){if(typeof t=="function"){const e={index:-1,data:this.props.data,target:[]};return(i,n)=>i&&i.__source?(e.index=i.__source.index,t(i.__source.object,e)):t(i,n)}return t}getSubLayerProps(t={}){const{opacity:e,pickable:i,visible:n,parameters:o,getPolygonOffset:r,highlightedObjectIndex:a,autoHighlight:l,highlightColor:c,coordinateSystem:u,coordinateOrigin:f,wrapLongitude:h,positionFormat:d,modelMatrix:p,extensions:g,fetch:y,operation:v,_subLayerProps:_}=this.props,C={id:"",updateTriggers:{},opacity:e,pickable:i,visible:n,parameters:o,getPolygonOffset:r,highlightedObjectIndex:a,autoHighlight:l,highlightColor:c,coordinateSystem:u,coordinateOrigin:f,wrapLongitude:h,positionFormat:d,modelMatrix:p,extensions:g,fetch:y,operation:v},w=_&&t.id&&_[t.id],A=w&&w.updateTriggers,I=t.id||"sublayer";if(w){const z=this.props[St],F=t.type?t.type._propTypes:{};for(const M in w){const k=F[M]||z[M];k&&k.type==="accessor"&&(w[M]=this.getSubLayerAccessor(w[M]))}}Object.assign(C,t,w),C.id=`${this.props.id}-${I}`,C.updateTriggers={all:this.props.updateTriggers?.all,...t.updateTriggers,...A};for(const z of g){const F=z.getSubLayerProps.call(this,z);F&&Object.assign(C,F,{updateTriggers:Object.assign(C.updateTriggers,F.updateTriggers)})}return C}_updateAutoHighlight(t){for(const e of this.getSubLayers())e.updateAutoHighlight(t)}_getAttributeManager(){return null}_postUpdate(t,e){let i=this.internalState.subLayers;const n=!i||this.needsUpdate();if(n){const o=this.renderLayers();i=Uo(o,Boolean),this.internalState.subLayers=i}at(Qf,this,n,i);for(const o of i)o.parent=this}}It.layerName="CompositeLayer";class Ar{constructor(t){this.indexStarts=[0],this.vertexStarts=[0],this.vertexCount=0,this.instanceCount=0;const{attributes:e={}}=t;this.typedArrayManager=Je,this.attributes={},this._attributeDefs=e,this.opts=t,this.updateGeometry(t)}updateGeometry(t){Object.assign(this.opts,t);const{data:e,buffers:i={},getGeometry:n,geometryBuffer:o,positionFormat:r,dataChanged:a,normalize:l=!0}=this.opts;if(this.data=e,this.getGeometry=n,this.positionSize=o&&o.size||(r==="XY"?2:3),this.buffers=i,this.normalize=l,o&&(yt(e.startIndices),this.getGeometry=this.getGeometryFromBuffer(o),l||(i.vertexPositions=o)),this.geometryBuffer=i.vertexPositions,Array.isArray(a))for(const c of a)this._rebuildGeometry(c);else this._rebuildGeometry()}updatePartialGeometry({startRow:t,endRow:e}){this._rebuildGeometry({startRow:t,endRow:e})}getGeometryFromBuffer(t){const e=t.value||t;return ArrayBuffer.isView(e)?mr(e,{size:this.positionSize,offset:t.offset,stride:t.stride,startIndices:this.data.startIndices}):null}_allocate(t,e){const{attributes:i,buffers:n,_attributeDefs:o,typedArrayManager:r}=this;for(const a in o)if(a in n)r.release(i[a]),i[a]=null;else{const l=o[a];l.copy=e,i[a]=r.allocate(i[a],t,l)}}_forEachGeometry(t,e,i){const{data:n,getGeometry:o}=this,{iterable:r,objectInfo:a}=kt(n,e,i);for(const l of r){a.index++;const c=o?o(l,a):null;t(c,a.index)}}_rebuildGeometry(t){if(!this.data)return;let{indexStarts:e,vertexStarts:i,instanceCount:n}=this;const{data:o,geometryBuffer:r}=this,{startRow:a=0,endRow:l=1/0}=t||{},c={};if(t||(e=[0],i=[0]),this.normalize||!r)this._forEachGeometry((f,h)=>{const d=f&&this.normalizeGeometry(f);c[h]=d,i[h+1]=i[h]+(d?this.getGeometrySize(d):0)},a,l),n=i[i.length-1];else if(i=o.startIndices,n=i[o.length]||0,ArrayBuffer.isView(r))n=n||r.length/this.positionSize;else if(r instanceof J){const f=this.positionSize*4;n=n||r.byteLength/f}else if(r.buffer){const f=r.stride||this.positionSize*4;n=n||r.buffer.byteLength/f}else if(r.value){const f=r.value,h=r.stride/f.BYTES_PER_ELEMENT||this.positionSize;n=n||f.length/h}this._allocate(n,!!t),this.indexStarts=e,this.vertexStarts=i,this.instanceCount=n;const u={};this._forEachGeometry((f,h)=>{const d=c[h]||f;u.vertexStart=i[h],u.indexStart=e[h];const p=h<i.length-1?i[h+1]:n;u.geometrySize=p-i[h],u.geometryIndex=h,this.updateGeometryAttributes(d,u)},a,l),this.vertexCount=e[e.length-1]}}const An=`layout(std140) uniform iconUniforms {
  float sizeScale;
  vec2 iconsTextureDim;
  float sizeBasis;
  float sizeMinPixels;
  float sizeMaxPixels;
  bool billboard;
  highp int sizeUnits;
  float alphaCutoff;
} icon;
`,th={name:"icon",vs:An,fs:An,uniformTypes:{sizeScale:"f32",iconsTextureDim:"vec2<f32>",sizeBasis:"f32",sizeMinPixels:"f32",sizeMaxPixels:"f32",billboard:"f32",sizeUnits:"i32",alphaCutoff:"f32"}},eh=`#version 300 es
#define SHADER_NAME icon-layer-vertex-shader
in vec2 positions;
in vec3 instancePositions;
in vec3 instancePositions64Low;
in float instanceSizes;
in float instanceAngles;
in vec4 instanceColors;
in vec3 instancePickingColors;
in vec4 instanceIconFrames;
in float instanceColorModes;
in vec2 instanceOffsets;
in vec2 instancePixelOffset;
out float vColorMode;
out vec4 vColor;
out vec2 vTextureCoords;
out vec2 uv;
vec2 rotate_by_angle(vec2 vertex, float angle) {
float angle_radian = angle * PI / 180.0;
float cos_angle = cos(angle_radian);
float sin_angle = sin(angle_radian);
mat2 rotationMatrix = mat2(cos_angle, -sin_angle, sin_angle, cos_angle);
return rotationMatrix * vertex;
}
void main(void) {
geometry.worldPosition = instancePositions;
geometry.uv = positions;
geometry.pickingColor = instancePickingColors;
uv = positions;
vec2 iconSize = instanceIconFrames.zw;
float sizePixels = clamp(
project_size_to_pixel(instanceSizes * icon.sizeScale, icon.sizeUnits),
icon.sizeMinPixels, icon.sizeMaxPixels
);
float iconConstraint = icon.sizeBasis == 0.0 ? iconSize.x : iconSize.y;
float instanceScale = iconConstraint == 0.0 ? 0.0 : sizePixels / iconConstraint;
vec2 pixelOffset = positions / 2.0 * iconSize + instanceOffsets;
pixelOffset = rotate_by_angle(pixelOffset, instanceAngles) * instanceScale;
pixelOffset += instancePixelOffset;
pixelOffset.y *= -1.0;
if (icon.billboard)  {
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0), geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
vec3 offset = vec3(pixelOffset, 0.0);
DECKGL_FILTER_SIZE(offset, geometry);
gl_Position.xy += project_pixel_size_to_clipspace(offset.xy);
} else {
vec3 offset_common = vec3(project_pixel_size(pixelOffset), 0.0);
DECKGL_FILTER_SIZE(offset_common, geometry);
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset_common, geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
}
vTextureCoords = mix(
instanceIconFrames.xy,
instanceIconFrames.xy + iconSize,
(positions.xy + 1.0) / 2.0
) / icon.iconsTextureDim;
vColor = instanceColors;
DECKGL_FILTER_COLOR(vColor, geometry);
vColorMode = instanceColorModes;
}
`,ih=`#version 300 es
#define SHADER_NAME icon-layer-fragment-shader
precision highp float;
uniform sampler2D iconsTexture;
in float vColorMode;
in vec4 vColor;
in vec2 vTextureCoords;
in vec2 uv;
out vec4 fragColor;
void main(void) {
geometry.uv = uv;
vec4 texColor = texture(iconsTexture, vTextureCoords);
vec3 color = mix(texColor.rgb, vColor.rgb, vColorMode);
float a = texColor.a * layer.opacity * vColor.a;
if (a < icon.alphaCutoff) {
discard;
}
fragColor = vec4(color, a);
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`,sh=`struct IconUniforms {
  sizeScale: f32,
  iconsTextureDim: vec2<f32>,
  sizeBasis: f32,
  sizeMinPixels: f32,
  sizeMaxPixels: f32,
  billboard: i32,
  sizeUnits: i32,
  alphaCutoff: f32
};

@group(0) @binding(auto) var<uniform> icon: IconUniforms;
@group(0) @binding(auto) var iconsTexture : texture_2d<f32>;
@group(0) @binding(auto) var iconsTextureSampler : sampler;

fn rotate_by_angle(vertex: vec2<f32>, angle_deg: f32) -> vec2<f32> {
  let angle_radian = angle_deg * PI / 180.0;
  let c = cos(angle_radian);
  let s = sin(angle_radian);
  let rotation = mat2x2<f32>(vec2<f32>(c, s), vec2<f32>(-s, c));
  return rotation * vertex;
}

struct Attributes {
  @location(0) positions: vec2<f32>,

  @location(1) instancePositions: vec3<f32>,
  @location(2) instancePositions64Low: vec3<f32>,
  @location(3) instanceSizes: f32,
  @location(4) instanceAngles: f32,
  @location(5) instanceColors: vec4<f32>,
  @location(6) instancePickingColors: vec3<f32>,
  @location(7) instanceIconFrames: vec4<f32>,
  @location(8) instanceColorModes: f32,
  @location(9) instanceOffsets: vec2<f32>,
  @location(10) instancePixelOffset: vec2<f32>,
};

struct Varyings {
  @builtin(position) position: vec4<f32>,

  @location(0) vColorMode: f32,
  @location(1) vColor: vec4<f32>,
  @location(2) vTextureCoords: vec2<f32>,
  @location(3) uv: vec2<f32>,
  @location(4) pickingColor: vec3<f32>,
};

@vertex
fn vertexMain(inp: Attributes) -> Varyings {
  // write geometry fields used by filters + FS
  geometry.worldPosition = inp.instancePositions;
  geometry.uv = inp.positions;
  geometry.pickingColor = inp.instancePickingColors;

  var outp: Varyings;
  outp.uv = inp.positions;

  let iconSize = inp.instanceIconFrames.zw;

  // convert size in meters to pixels, then clamp
  let sizePixels = clamp(
    project_unit_size_to_pixel(inp.instanceSizes * icon.sizeScale, icon.sizeUnits),
    icon.sizeMinPixels, icon.sizeMaxPixels
  );

  // scale icon height to match instanceSize
  let iconConstraint = select(iconSize.y, iconSize.x, icon.sizeBasis == 0.0);
  let instanceScale = select(sizePixels / iconConstraint, 0.0, iconConstraint == 0.0);

  // scale and rotate vertex in "pixel" units; then add per-instance pixel offset
  var pixelOffset = inp.positions / 2.0 * iconSize + inp.instanceOffsets;
  pixelOffset = rotate_by_angle(pixelOffset, inp.instanceAngles) * instanceScale;
  pixelOffset = pixelOffset + inp.instancePixelOffset;
  pixelOffset.y = pixelOffset.y * -1.0;

  if (icon.billboard != 0) {
    var pos = project_position_to_clipspace(inp.instancePositions, inp.instancePositions64Low, vec3<f32>(0.0)); // TODO, &geometry.position);
    // DECKGL_FILTER_GL_POSITION(pos, geometry);

    var offset = vec3<f32>(pixelOffset, 0.0);
    // DECKGL_FILTER_SIZE(offset, geometry);
    let clipOffset = project_pixel_size_to_clipspace(offset.xy);
    pos = vec4<f32>(pos.x + clipOffset.x, pos.y + clipOffset.y, pos.z, pos.w);
    outp.position = pos;
  } else {
    var offset_common = vec3<f32>(project_pixel_size_vec2(pixelOffset), 0.0);
    // DECKGL_FILTER_SIZE(offset_common, geometry);
    var pos = project_position_to_clipspace(inp.instancePositions, inp.instancePositions64Low, offset_common); // TODO, &geometry.position);
    // DECKGL_FILTER_GL_POSITION(pos, geometry);
    outp.position = pos;
  }

  let uvMix = (inp.positions.xy + vec2<f32>(1.0, 1.0)) * 0.5;
  outp.vTextureCoords = mix(inp.instanceIconFrames.xy, inp.instanceIconFrames.xy + iconSize, uvMix) / icon.iconsTextureDim;

  outp.vColor = inp.instanceColors;
  // DECKGL_FILTER_COLOR(outp.vColor, geometry);

  outp.vColorMode = inp.instanceColorModes;
  outp.pickingColor = inp.instancePickingColors;

  return outp;
}

@fragment
fn fragmentMain(inp: Varyings) -> @location(0) vec4<f32> {
  // expose to deck.gl filter hooks
  geometry.uv = inp.uv;

  let texColor = textureSample(iconsTexture, iconsTextureSampler, inp.vTextureCoords);

  // if colorMode == 0, use pixel color from the texture
  // if colorMode == 1 (or picking), use texture as transparency mask
  let rgb = mix(texColor.rgb, inp.vColor.rgb, inp.vColorMode);
  let a = texColor.a * layer.opacity * inp.vColor.a;

  if (a < icon.alphaCutoff) {
    discard;
  }

  if (picking.isActive > 0.5) {
    if (!picking_isColorValid(inp.pickingColor)) {
      discard;
    }
    return vec4<f32>(inp.pickingColor, 1.0);
  }

  var fragColor = deckgl_premultiplied_alpha(vec4<f32>(rgb, a));

  if (picking.isHighlightActive > 0.5) {
    let highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
    if (picking_isColorZero(abs(inp.pickingColor - highlightedObjectColor))) {
      let highLightAlpha = picking.highlightColor.a;
      let blendedAlpha = highLightAlpha + fragColor.a * (1.0 - highLightAlpha);
      if (blendedAlpha > 0.0) {
        let highLightRatio = highLightAlpha / blendedAlpha;
        fragColor = vec4<f32>(
          mix(fragColor.rgb, picking.highlightColor.rgb, highLightRatio),
          blendedAlpha
        );
      } else {
        fragColor = vec4<f32>(fragColor.rgb, 0.0);
      }
    }
  }

  return fragColor;
}
`,nh=1024,oh=4,En=()=>{},In={minFilter:"linear",mipmapFilter:"linear",magFilter:"linear",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge"},rh={x:0,y:0,width:0,height:0};function ah(s){return Math.pow(2,Math.ceil(Math.log2(s)))}function lh(s,t,e,i){const n=Math.min(e/t.width,i/t.height),o=Math.floor(t.width*n),r=Math.floor(t.height*n);return n===1?{image:t,width:o,height:r}:(s.canvas.height=r,s.canvas.width=o,s.clearRect(0,0,o,r),s.drawImage(t,0,0,t.width,t.height,0,0,o,r),{image:s.canvas,width:o,height:r})}function pe(s){return s&&(s.id||s.url)}function Er(s){const{device:t}=s;t.type==="webgl"?s.generateMipmapsWebGL():t.type==="webgpu"&&t.generateMipmapsWebGPU(s)}function ch(s,t,e,i){const{width:n,height:o,device:r}=s,a=r.createTexture({format:"rgba8unorm",width:t,height:e,sampler:i,mipLevels:r.getMipLevelCount(t,e)}),l=r.createCommandEncoder();l.copyTextureToTexture({sourceTexture:s,destinationTexture:a,width:n,height:o});const c=l.finish();return r.submit(c),Er(a),s.destroy(),a}function Mn(s,t,e){for(let i=0;i<t.length;i++){const{icon:n,xOffset:o}=t[i],r=pe(n);s[r]={...n,x:o,y:e}}}function uh({icons:s,buffer:t,mapping:e={},xOffset:i=0,yOffset:n=0,rowHeight:o=0,canvasWidth:r}){let a=[];for(let l=0;l<s.length;l++){const c=s[l],u=pe(c);if(!e[u]){const{height:f,width:h}=c;i+h+t>r&&(Mn(e,a,n),i=0,n=o+n+t,o=0,a=[]),a.push({icon:c,xOffset:i}),i=i+h+t,o=Math.max(o,f)}}return a.length>0&&Mn(e,a,n),{mapping:e,rowHeight:o,xOffset:i,yOffset:n,canvasWidth:r,canvasHeight:ah(o+n+t)}}function fh(s,t,e){if(!s||!t)return null;e=e||{};const i={},{iterable:n,objectInfo:o}=kt(s);for(const r of n){o.index++;const a=t(r,o),l=pe(a);if(!a)throw new Error("Icon is missing.");if(!a.url)throw new Error("Icon url is missing.");!i[l]&&(!e[l]||a.url!==e[l].url)&&(i[l]={...a,source:r,sourceIndex:o.index})}return i}class hh{constructor(t,{onUpdate:e=En,onError:i=En}){this._loadOptions=null,this._texture=null,this._externalTexture=null,this._mapping={},this._samplerParameters=null,this._pendingCount=0,this._autoPacking=!1,this._xOffset=0,this._yOffset=0,this._rowHeight=0,this._buffer=oh,this._canvasWidth=nh,this._canvasHeight=0,this._canvas=null,this.device=t,this.onUpdate=e,this.onError=i}finalize(){this._texture?.delete()}getTexture(){return this._texture||this._externalTexture}getIconMapping(t){const e=this._autoPacking?pe(t):t;return this._mapping[e]||rh}setProps({loadOptions:t,autoPacking:e,iconAtlas:i,iconMapping:n,textureParameters:o}){t&&(this._loadOptions=t),e!==void 0&&(this._autoPacking=e),n&&(this._mapping=n),i&&(this._texture?.delete(),this._texture=null,this._externalTexture=i),o&&(this._samplerParameters=o)}get isLoaded(){return this._pendingCount===0}packIcons(t,e){if(!this._autoPacking||typeof document>"u")return;const i=Object.values(fh(t,e,this._mapping)||{});if(i.length>0){const{mapping:n,xOffset:o,yOffset:r,rowHeight:a,canvasHeight:l}=uh({icons:i,buffer:this._buffer,canvasWidth:this._canvasWidth,mapping:this._mapping,rowHeight:this._rowHeight,xOffset:this._xOffset,yOffset:this._yOffset});this._rowHeight=a,this._mapping=n,this._xOffset=o,this._yOffset=r,this._canvasHeight=l,this._texture||(this._texture=this.device.createTexture({format:"rgba8unorm",data:null,width:this._canvasWidth,height:this._canvasHeight,sampler:this._samplerParameters||In,mipLevels:this.device.getMipLevelCount(this._canvasWidth,this._canvasHeight)})),this._texture.height!==this._canvasHeight&&(this._texture=ch(this._texture,this._canvasWidth,this._canvasHeight,this._samplerParameters||In)),this.onUpdate(!0),this._canvas=this._canvas||document.createElement("canvas"),this._loadIcons(i)}}_loadIcons(t){const e=this._canvas.getContext("2d",{willReadFrequently:!0});for(const i of t)this._pendingCount++,ji(i.url,this._loadOptions).then(n=>{const o=pe(i),r=this._mapping[o],{x:a,y:l,width:c,height:u}=r,{image:f,width:h,height:d}=lh(e,n,c,u),p=a+(c-h)/2,g=l+(u-d)/2;this._texture?.copyExternalImage({image:f,x:p,y:g,width:h,height:d}),r.x=p,r.y=g,r.width=h,r.height=d,this._texture&&Er(this._texture),this.onUpdate(h!==c||d!==u)}).catch(n=>{this.onError({url:i.url,source:i.source,sourceIndex:i.sourceIndex,loadOptions:this._loadOptions,error:n})}).finally(()=>{this._pendingCount--})}}const Ir=[0,0,0,255],dh={iconAtlas:{type:"image",value:null,async:!0},iconMapping:{type:"object",value:{},async:!0},sizeScale:{type:"number",value:1,min:0},billboard:!0,sizeUnits:"pixels",sizeBasis:"height",sizeMinPixels:{type:"number",min:0,value:0},sizeMaxPixels:{type:"number",min:0,value:Number.MAX_SAFE_INTEGER},alphaCutoff:{type:"number",value:.05,min:0,max:1},getPosition:{type:"accessor",value:s=>s.position},getIcon:{type:"accessor",value:s=>s.icon},getColor:{type:"accessor",value:Ir},getSize:{type:"accessor",value:1},getAngle:{type:"accessor",value:0},getPixelOffset:{type:"accessor",value:[0,0]},onIconError:{type:"function",value:null,optional:!0},textureParameters:{type:"object",ignore:!0,value:null}};class ui extends bt{getShaders(){return super.getShaders({vs:eh,fs:ih,source:sh,modules:[Kt,rr,Yt,th]})}initializeState(){this.state={iconManager:new hh(this.context.device,{onUpdate:this._onUpdate.bind(this),onError:this._onError.bind(this)})},this.getAttributeManager().addInstanced({instancePositions:{size:3,type:"float64",fp64:this.use64bitPositions(),transition:!0,accessor:"getPosition"},instanceSizes:{size:1,transition:!0,accessor:"getSize",defaultValue:1},instanceIconDefs:{size:7,accessor:"getIcon",transform:this.getInstanceIconDef,shaderAttributes:{instanceOffsets:{size:2,elementOffset:0},instanceIconFrames:{size:4,elementOffset:2},instanceColorModes:{size:1,elementOffset:6}}},instanceColors:{size:this.props.colorFormat.length,type:"unorm8",transition:!0,accessor:"getColor",defaultValue:Ir},instanceAngles:{size:1,transition:!0,accessor:"getAngle"},instancePixelOffset:{size:2,transition:!0,accessor:"getPixelOffset"}})}updateState(t){super.updateState(t);const{props:e,oldProps:i,changeFlags:n}=t,o=this.getAttributeManager(),{iconAtlas:r,iconMapping:a,data:l,getIcon:c,textureParameters:u}=e,{iconManager:f}=this.state;if(typeof r=="string")return;const h=r||this.internalState.isAsyncPropLoading("iconAtlas");f.setProps({loadOptions:e.loadOptions,autoPacking:!h,iconAtlas:r,iconMapping:h?a:null,textureParameters:u}),h?i.iconMapping!==e.iconMapping&&o.invalidate("getIcon"):(n.dataChanged||n.updateTriggersChanged&&(n.updateTriggersChanged.all||n.updateTriggersChanged.getIcon))&&f.packIcons(l,c),n.extensionsChanged&&(this.state.model?.destroy(),this.state.model=this._getModel(),o.invalidateAll())}get isLoaded(){return super.isLoaded&&this.state.iconManager.isLoaded}finalizeState(t){super.finalizeState(t),this.state.iconManager.finalize()}draw({uniforms:t}){const{sizeScale:e,sizeBasis:i,sizeMinPixels:n,sizeMaxPixels:o,sizeUnits:r,billboard:a,alphaCutoff:l}=this.props,{iconManager:c}=this.state,u=c.getTexture();if(u){const f=this.state.model,h={iconsTexture:u,iconsTextureDim:[u.width,u.height],sizeUnits:de[r],sizeScale:e,sizeBasis:i==="height"?1:0,sizeMinPixels:n,sizeMaxPixels:o,billboard:a,alphaCutoff:l};f.shaderInputs.setProps({icon:h}),f.draw(this.context.renderPass)}}_getModel(){const t=[-1,-1,1,-1,-1,1,1,1];return new lt(this.context.device,{...this.getShaders(),id:this.props.id,bufferLayout:this.getAttributeManager().getBufferLayouts(),geometry:new _t({topology:"triangle-strip",attributes:{positions:{size:2,value:new Float32Array(t)}}}),isInstanced:!0})}_onUpdate(t){t?(this.getAttributeManager()?.invalidate("getIcon"),this.setNeedsUpdate()):this.setNeedsRedraw()}_onError(t){const e=this.getCurrentLayer()?.props.onIconError;e?e(t):K.error(t.error.message)()}getInstanceIconDef(t){const{x:e,y:i,width:n,height:o,mask:r,anchorX:a=n/2,anchorY:l=o/2}=this.state.iconManager.getIconMapping(t);return[n/2-a,o/2-l,e,i,n,o,r?1:0]}}ui.defaultProps=dh;ui.layerName="IconLayer";const On=`layout(std140) uniform scatterplotUniforms {
  float radiusScale;
  float radiusMinPixels;
  float radiusMaxPixels;
  float lineWidthScale;
  float lineWidthMinPixels;
  float lineWidthMaxPixels;
  float stroked;
  float filled;
  bool antialiasing;
  bool billboard;
  highp int radiusUnits;
  highp int lineWidthUnits;
} scatterplot;
`,ph={name:"scatterplot",vs:On,fs:On,source:"",uniformTypes:{radiusScale:"f32",radiusMinPixels:"f32",radiusMaxPixels:"f32",lineWidthScale:"f32",lineWidthMinPixels:"f32",lineWidthMaxPixels:"f32",stroked:"f32",filled:"f32",antialiasing:"f32",billboard:"f32",radiusUnits:"i32",lineWidthUnits:"i32"}},gh=`#version 300 es
#define SHADER_NAME scatterplot-layer-vertex-shader
in vec3 positions;
in vec3 instancePositions;
in vec3 instancePositions64Low;
in float instanceRadius;
in float instanceLineWidths;
in vec4 instanceFillColors;
in vec4 instanceLineColors;
in vec3 instancePickingColors;
out vec4 vFillColor;
out vec4 vLineColor;
out vec2 unitPosition;
out float innerUnitRadius;
out float outerRadiusPixels;
void main(void) {
geometry.worldPosition = instancePositions;
outerRadiusPixels = clamp(
project_size_to_pixel(scatterplot.radiusScale * instanceRadius, scatterplot.radiusUnits),
scatterplot.radiusMinPixels, scatterplot.radiusMaxPixels
);
float lineWidthPixels = clamp(
project_size_to_pixel(scatterplot.lineWidthScale * instanceLineWidths, scatterplot.lineWidthUnits),
scatterplot.lineWidthMinPixels, scatterplot.lineWidthMaxPixels
);
outerRadiusPixels += scatterplot.stroked * lineWidthPixels / 2.0;
float edgePadding = scatterplot.antialiasing ? (outerRadiusPixels + SMOOTH_EDGE_RADIUS) / outerRadiusPixels : 1.0;
unitPosition = edgePadding * positions.xy;
geometry.uv = unitPosition;
geometry.pickingColor = instancePickingColors;
innerUnitRadius = 1.0 - scatterplot.stroked * lineWidthPixels / outerRadiusPixels;
if (scatterplot.billboard) {
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0), geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
vec3 offset = edgePadding * positions * outerRadiusPixels;
DECKGL_FILTER_SIZE(offset, geometry);
gl_Position.xy += project_pixel_size_to_clipspace(offset.xy);
} else {
vec3 offset = edgePadding * positions * project_pixel_size(outerRadiusPixels);
DECKGL_FILTER_SIZE(offset, geometry);
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset, geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
}
vFillColor = vec4(instanceFillColors.rgb, instanceFillColors.a * layer.opacity);
DECKGL_FILTER_COLOR(vFillColor, geometry);
vLineColor = vec4(instanceLineColors.rgb, instanceLineColors.a * layer.opacity);
DECKGL_FILTER_COLOR(vLineColor, geometry);
}
`,mh=`#version 300 es
#define SHADER_NAME scatterplot-layer-fragment-shader
precision highp float;
in vec4 vFillColor;
in vec4 vLineColor;
in vec2 unitPosition;
in float innerUnitRadius;
in float outerRadiusPixels;
out vec4 fragColor;
void main(void) {
geometry.uv = unitPosition;
float distToCenter = length(unitPosition) * outerRadiusPixels;
float inCircle = scatterplot.antialiasing ?
smoothedge(distToCenter, outerRadiusPixels) :
step(distToCenter, outerRadiusPixels);
if (inCircle == 0.0) {
discard;
}
if (scatterplot.stroked > 0.5) {
float isLine = scatterplot.antialiasing ?
smoothedge(innerUnitRadius * outerRadiusPixels, distToCenter) :
step(innerUnitRadius * outerRadiusPixels, distToCenter);
if (scatterplot.filled > 0.5) {
fragColor = mix(vFillColor, vLineColor, isLine);
} else {
if (isLine == 0.0) {
discard;
}
fragColor = vec4(vLineColor.rgb, vLineColor.a * isLine);
}
} else if (scatterplot.filled < 0.5) {
discard;
} else {
fragColor = vFillColor;
}
fragColor.a *= inCircle;
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`,yh=`// Main shaders

struct ScatterplotUniforms {
  radiusScale: f32,
  radiusMinPixels: f32,
  radiusMaxPixels: f32,
  lineWidthScale: f32,
  lineWidthMinPixels: f32,
  lineWidthMaxPixels: f32,
  stroked: f32,
  filled: i32,
  antialiasing: i32,
  billboard: i32,
  radiusUnits: i32,
  lineWidthUnits: i32,
};

struct ConstantAttributeUniforms {
 instancePositions: vec3<f32>,
 instancePositions64Low: vec3<f32>,
 instanceRadius: f32,
 instanceLineWidths: f32,
 instanceFillColors: vec4<f32>,
 instanceLineColors: vec4<f32>,
 instancePickingColors: vec3<f32>,

 instancePositionsConstant: i32,
 instancePositions64LowConstant: i32,
 instanceRadiusConstant: i32,
 instanceLineWidthsConstant: i32,
 instanceFillColorsConstant: i32,
 instanceLineColorsConstant: i32,
 instancePickingColorsConstant: i32
};

@group(0) @binding(0) var<uniform> scatterplot: ScatterplotUniforms;

struct ConstantAttributes {
  instancePositions: vec3<f32>,
  instancePositions64Low: vec3<f32>,
  instanceRadius: f32,
  instanceLineWidths: f32,
  instanceFillColors: vec4<f32>,
  instanceLineColors: vec4<f32>,
  instancePickingColors: vec3<f32>
};

const constants = ConstantAttributes(
  vec3<f32>(0.0),
  vec3<f32>(0.0),
  0.0,
  0.0,
  vec4<f32>(0.0, 0.0, 0.0, 1.0),
  vec4<f32>(0.0, 0.0, 0.0, 1.0),
  vec3<f32>(0.0)
);

struct Attributes {
  @builtin(instance_index) instanceIndex : u32,
  @builtin(vertex_index) vertexIndex : u32,
  @location(0) positions: vec3<f32>,
  @location(1) instancePositions: vec3<f32>,
  @location(2) instancePositions64Low: vec3<f32>,
  @location(3) instanceRadius: f32,
  @location(4) instanceLineWidths: f32,
  @location(5) instanceFillColors: vec4<f32>,
  @location(6) instanceLineColors: vec4<f32>,
  @location(7) instancePickingColors: vec3<f32>,
};

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) vFillColor: vec4<f32>,
  @location(1) vLineColor: vec4<f32>,
  @location(2) unitPosition: vec2<f32>,
  @location(3) innerUnitRadius: f32,
  @location(4) outerRadiusPixels: f32,
  @location(5) pickingColor: vec3<f32>,
};

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
  var varyings: Varyings;

  // Draw an inline geometry constant array clip space triangle to verify that rendering works.
  // var positions = array<vec2<f32>, 3>(vec2(0.0, 0.5), vec2(-0.5, -0.5), vec2(0.5, -0.5));
  // if (attributes.instanceIndex == 0) {
  //   varyings.position = vec4<f32>(positions[attributes.vertexIndex], 0.0, 1.0);
  //   return varyings;
  // }

  geometry.worldPosition = attributes.instancePositions;

  // Multiply out radius and clamp to limits
  varyings.outerRadiusPixels = clamp(
    project_unit_size_to_pixel(scatterplot.radiusScale * attributes.instanceRadius, scatterplot.radiusUnits),
    scatterplot.radiusMinPixels, scatterplot.radiusMaxPixels
  );

  // Multiply out line width and clamp to limits
  let lineWidthPixels = clamp(
    project_unit_size_to_pixel(scatterplot.lineWidthScale * attributes.instanceLineWidths, scatterplot.lineWidthUnits),
    scatterplot.lineWidthMinPixels, scatterplot.lineWidthMaxPixels
  );

  // outer radius needs to offset by half stroke width
  varyings.outerRadiusPixels += scatterplot.stroked * lineWidthPixels / 2.0;
  // Expand geometry to accommodate edge smoothing
  let edgePadding = select(
    (varyings.outerRadiusPixels + SMOOTH_EDGE_RADIUS) / varyings.outerRadiusPixels,
    1.0,
    scatterplot.antialiasing != 0
  );

  // position on the containing square in [-1, 1] space
  varyings.unitPosition = edgePadding * attributes.positions.xy;
  geometry.uv = varyings.unitPosition;
  geometry.pickingColor = attributes.instancePickingColors;

  varyings.innerUnitRadius = 1.0 - scatterplot.stroked * lineWidthPixels / varyings.outerRadiusPixels;

  if (scatterplot.billboard != 0) {
    varyings.position = project_position_to_clipspace(attributes.instancePositions, attributes.instancePositions64Low, vec3<f32>(0.0)); // TODO , geometry.position);
    // DECKGL_FILTER_GL_POSITION(varyings.position, geometry);
    let offset = attributes.positions; // * edgePadding * varyings.outerRadiusPixels;
    // DECKGL_FILTER_SIZE(offset, geometry);
    let clipPixels = project_pixel_size_to_clipspace(offset.xy);
    varyings.position.x = clipPixels.x;
    varyings.position.y = clipPixels.y;
  } else {
    let offset = edgePadding * attributes.positions * project_pixel_size_float(varyings.outerRadiusPixels);
    // DECKGL_FILTER_SIZE(offset, geometry);
    varyings.position = project_position_to_clipspace(attributes.instancePositions, attributes.instancePositions64Low, offset); // TODO , geometry.position);
    // DECKGL_FILTER_GL_POSITION(varyings.position, geometry);
  }

  // Apply opacity to instance color, or return instance picking color
  varyings.vFillColor = vec4<f32>(attributes.instanceFillColors.rgb, attributes.instanceFillColors.a * layer.opacity);
  // DECKGL_FILTER_COLOR(varyings.vFillColor, geometry);
  varyings.vLineColor = vec4<f32>(attributes.instanceLineColors.rgb, attributes.instanceLineColors.a * layer.opacity);
  // DECKGL_FILTER_COLOR(varyings.vLineColor, geometry);
  varyings.pickingColor = attributes.instancePickingColors;

  return varyings;
}

@fragment
fn fragmentMain(varyings: Varyings) -> @location(0) vec4<f32> {
  // var geometry: Geometry;
  // geometry.uv = unitPosition;

  let distToCenter = length(varyings.unitPosition) * varyings.outerRadiusPixels;
  let inCircle = select(
    smoothedge(distToCenter, varyings.outerRadiusPixels),
    step(distToCenter, varyings.outerRadiusPixels),
    scatterplot.antialiasing != 0
  );

  if (inCircle == 0.0) {
    discard;
  }

  var fragColor: vec4<f32>;

  if (scatterplot.stroked != 0) {
    let isLine = select(
      smoothedge(varyings.innerUnitRadius * varyings.outerRadiusPixels, distToCenter),
      step(varyings.innerUnitRadius * varyings.outerRadiusPixels, distToCenter),
      scatterplot.antialiasing != 0
    );

    if (scatterplot.filled != 0) {
      fragColor = mix(varyings.vFillColor, varyings.vLineColor, isLine);
    } else {
      if (isLine == 0.0) {
        discard;
      }
      fragColor = vec4<f32>(varyings.vLineColor.rgb, varyings.vLineColor.a * isLine);
    }
  } else if (scatterplot.filled == 0) {
    discard;
  } else {
    fragColor = varyings.vFillColor;
  }

  fragColor.a *= inCircle;

  if (picking.isActive > 0.5) {
    if (!picking_isColorValid(varyings.pickingColor)) {
      discard;
    }
    return vec4<f32>(varyings.pickingColor, 1.0);
  }

  if (picking.isHighlightActive > 0.5) {
    let highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
    if (picking_isColorZero(abs(varyings.pickingColor - highlightedObjectColor))) {
      let highLightAlpha = picking.highlightColor.a;
      let blendedAlpha = highLightAlpha + fragColor.a * (1.0 - highLightAlpha);
      if (blendedAlpha > 0.0) {
        let highLightRatio = highLightAlpha / blendedAlpha;
        fragColor = vec4<f32>(
          mix(fragColor.rgb, picking.highlightColor.rgb, highLightRatio),
          blendedAlpha
        );
      } else {
        fragColor = vec4<f32>(fragColor.rgb, 0.0);
      }
    }
  }

  // Apply premultiplied alpha as required by transparent canvas
  fragColor = deckgl_premultiplied_alpha(fragColor);

  return fragColor;
  // return vec4<f32>(0, 0, 1, 1);
}
`,Rn=[0,0,0,255],xh={radiusUnits:"meters",radiusScale:{type:"number",min:0,value:1},radiusMinPixels:{type:"number",min:0,value:0},radiusMaxPixels:{type:"number",min:0,value:Number.MAX_SAFE_INTEGER},lineWidthUnits:"meters",lineWidthScale:{type:"number",min:0,value:1},lineWidthMinPixels:{type:"number",min:0,value:0},lineWidthMaxPixels:{type:"number",min:0,value:Number.MAX_SAFE_INTEGER},stroked:!1,filled:!0,billboard:!1,antialiasing:!0,getPosition:{type:"accessor",value:s=>s.position},getRadius:{type:"accessor",value:1},getFillColor:{type:"accessor",value:Rn},getLineColor:{type:"accessor",value:Rn},getLineWidth:{type:"accessor",value:1},strokeWidth:{deprecatedFor:"getLineWidth"},outline:{deprecatedFor:"stroked"},getColor:{deprecatedFor:["getFillColor","getLineColor"]}};class bs extends bt{getShaders(){return super.getShaders({vs:gh,fs:mh,source:yh,modules:[Kt,rr,Yt,ph]})}initializeState(){this.getAttributeManager().addInstanced({instancePositions:{size:3,type:"float64",fp64:this.use64bitPositions(),transition:!0,accessor:"getPosition"},instanceRadius:{size:1,transition:!0,accessor:"getRadius",defaultValue:1},instanceFillColors:{size:this.props.colorFormat.length,transition:!0,type:"unorm8",accessor:"getFillColor",defaultValue:[0,0,0,255]},instanceLineColors:{size:this.props.colorFormat.length,transition:!0,type:"unorm8",accessor:"getLineColor",defaultValue:[0,0,0,255]},instanceLineWidths:{size:1,transition:!0,accessor:"getLineWidth",defaultValue:1}})}updateState(t){super.updateState(t),t.changeFlags.extensionsChanged&&(this.state.model?.destroy(),this.state.model=this._getModel(),this.getAttributeManager().invalidateAll())}draw({uniforms:t}){const{radiusUnits:e,radiusScale:i,radiusMinPixels:n,radiusMaxPixels:o,stroked:r,filled:a,billboard:l,antialiasing:c,lineWidthUnits:u,lineWidthScale:f,lineWidthMinPixels:h,lineWidthMaxPixels:d}=this.props,p={stroked:r,filled:a,billboard:l,antialiasing:c,radiusUnits:de[e],radiusScale:i,radiusMinPixels:n,radiusMaxPixels:o,lineWidthUnits:de[u],lineWidthScale:f,lineWidthMinPixels:h,lineWidthMaxPixels:d},g=this.state.model;g.shaderInputs.setProps({scatterplot:p}),g.draw(this.context.renderPass)}_getModel(){const t=[-1,-1,0,1,-1,0,-1,1,0,1,1,0];return new lt(this.context.device,{...this.getShaders(),id:this.props.id,bufferLayout:this.getAttributeManager().getBufferLayouts(),geometry:new _t({topology:"triangle-strip",attributes:{positions:{size:3,value:new Float32Array(t)}}}),isInstanced:!0})}}bs.defaultProps=xh;bs.layerName="ScatterplotLayer";const Mr={CLOCKWISE:1,COUNTER_CLOCKWISE:-1};function Or(s,t,e={}){return _h(s,e)!==t?(bh(s,e),!0):!1}function _h(s,t={}){return Math.sign(vh(s,t))}const zn={x:0,y:1,z:2};function vh(s,t={}){const{start:e=0,end:i=s.length,plane:n="xy"}=t,o=t.size||2;let r=0;const a=zn[n[0]],l=zn[n[1]];for(let c=e,u=i-o;c<i;c+=o)r+=(s[c+a]-s[u+a])*(s[c+l]+s[u+l]),u=c;return r/2}function bh(s,t){const{start:e=0,end:i=s.length,size:n=2}=t,o=(i-e)/n,r=Math.floor(o/2);for(let a=0;a<r;++a){const l=e+a*n,c=e+(o-1-a)*n;for(let u=0;u<n;++u){const f=s[l+u];s[l+u]=s[c+u],s[c+u]=f}}}function ut(s,t){const e=t.length,i=s.length;if(i>0){let n=!0;for(let o=0;o<e;o++)if(s[i-e+o]!==t[o]){n=!1;break}if(n)return!1}for(let n=0;n<e;n++)s[i+n]=t[n];return!0}function is(s,t){const e=t.length;for(let i=0;i<e;i++)s[i]=t[i]}function ge(s,t,e,i,n=[]){const o=i+t*e;for(let r=0;r<e;r++)n[r]=s[o+r];return n}function ss(s,t,e,i,n=[]){let o,r;if(e&8)o=(i[3]-s[1])/(t[1]-s[1]),r=3;else if(e&4)o=(i[1]-s[1])/(t[1]-s[1]),r=1;else if(e&2)o=(i[2]-s[0])/(t[0]-s[0]),r=2;else if(e&1)o=(i[0]-s[0])/(t[0]-s[0]),r=0;else return null;for(let a=0;a<s.length;a++)n[a]=(r&1)===a?i[r]:o*(t[a]-s[a])+s[a];return n}function He(s,t){let e=0;return s[0]<t[0]?e|=1:s[0]>t[2]&&(e|=2),s[1]<t[1]?e|=4:s[1]>t[3]&&(e|=8),e}function Rr(s,t){const{size:e=2,broken:i=!1,gridResolution:n=10,gridOffset:o=[0,0],startIndex:r=0,endIndex:a=s.length}=t||{},l=(a-r)/e;let c=[];const u=[c],f=ge(s,0,e,r);let h,d;const p=Br(f,n,o,[]),g=[];ut(c,f);for(let y=1;y<l;y++){for(h=ge(s,y,e,r,h),d=He(h,p);d;){ss(f,h,d,p,g);const v=He(g,p);v&&(ss(f,g,v,p,g),d=v),ut(c,g),is(f,g),wh(p,n,d),i&&c.length>e&&(c=[],u.push(c),ut(c,f)),d=He(h,p)}ut(c,h),is(f,h)}return i?u:u[0]}const Bn=0,Ch=1;function zr(s,t=null,e){if(!s.length)return[];const{size:i=2,gridResolution:n=10,gridOffset:o=[0,0],edgeTypes:r=!1}=e||{},a=[],l=[{pos:s,types:r?new Array(s.length/i).fill(Ch):null,holes:t||[]}],c=[[],[]];let u=[];for(;l.length;){const{pos:f,types:h,holes:d}=l.shift();Ph(f,i,d[0]||f.length,c),u=Br(c[0],n,o,u);const p=He(c[1],u);if(p){let g=Fn(f,h,i,0,d[0]||f.length,u,p);const y={pos:g[0].pos,types:g[0].types,holes:[]},v={pos:g[1].pos,types:g[1].types,holes:[]};l.push(y,v);for(let _=0;_<d.length;_++)g=Fn(f,h,i,d[_],d[_+1]||f.length,u,p),g[0]&&(y.holes.push(y.pos.length),y.pos=Te(y.pos,g[0].pos),r&&(y.types=Te(y.types,g[0].types))),g[1]&&(v.holes.push(v.pos.length),v.pos=Te(v.pos,g[1].pos),r&&(v.types=Te(v.types,g[1].types)))}else{const g={positions:f};r&&(g.edgeTypes=h),d.length&&(g.holeIndices=d),a.push(g)}}return a}function Fn(s,t,e,i,n,o,r){const a=(n-i)/e,l=[],c=[],u=[],f=[],h=[];let d,p,g;const y=ge(s,a-1,e,i);let v=Math.sign(r&8?y[1]-o[3]:y[0]-o[2]),_=t&&t[a-1],C=0,w=0;for(let A=0;A<a;A++)d=ge(s,A,e,i,d),p=Math.sign(r&8?d[1]-o[3]:d[0]-o[2]),g=t&&t[i/e+A],p&&v&&v!==p&&(ss(y,d,r,o,h),ut(l,h)&&u.push(_),ut(c,h)&&f.push(_)),p<=0?(ut(l,d)&&u.push(g),C-=p):u.length&&(u[u.length-1]=Bn),p>=0?(ut(c,d)&&f.push(g),w+=p):f.length&&(f[f.length-1]=Bn),is(y,d),v=p,_=g;return[C?{pos:l,types:t&&u}:null,w?{pos:c,types:t&&f}:null]}function Br(s,t,e,i){const n=Math.floor((s[0]-e[0])/t)*t+e[0],o=Math.floor((s[1]-e[1])/t)*t+e[1];return i[0]=n,i[1]=o,i[2]=n+t,i[3]=o+t,i}function wh(s,t,e){e&8?(s[1]+=t,s[3]+=t):e&4?(s[1]-=t,s[3]-=t):e&2?(s[0]+=t,s[2]+=t):e&1&&(s[0]-=t,s[2]-=t)}function Ph(s,t,e,i){let n=1/0,o=-1/0,r=1/0,a=-1/0;for(let l=0;l<e;l+=t){const c=s[l],u=s[l+1];n=c<n?c:n,o=c>o?c:o,r=u<r?u:r,a=u>a?u:a}return i[0][0]=n,i[0][1]=r,i[1][0]=o,i[1][1]=a,i}function Te(s,t){for(let e=0;e<t.length;e++)s.push(t[e]);return s}const Th=85.051129;function Lh(s,t){const{size:e=2,startIndex:i=0,endIndex:n=s.length,normalize:o=!0}=t||{},r=s.slice(i,n);Fr(r,e,0,n-i);const a=Rr(r,{size:e,broken:!0,gridResolution:360,gridOffset:[-180,-180]});if(o)for(const l of a)kr(l,e);return a}function Sh(s,t=null,e){const{size:i=2,normalize:n=!0,edgeTypes:o=!1}=e||{};t=t||[];const r=[],a=[];let l=0,c=0;for(let f=0;f<=t.length;f++){const h=t[f]||s.length,d=c,p=Ah(s,i,l,h);for(let g=p;g<h;g++)r[c++]=s[g];for(let g=l;g<p;g++)r[c++]=s[g];Fr(r,i,d,c),Eh(r,i,d,c,e?.maxLatitude),l=h,a[f]=c}a.pop();const u=zr(r,a,{size:i,gridResolution:360,gridOffset:[-180,-180],edgeTypes:o});if(n)for(const f of u)kr(f.positions,i);return u}function Ah(s,t,e,i){let n=-1,o=-1;for(let r=e+1;r<i;r+=t){const a=Math.abs(s[r]);a>n&&(n=a,o=r-1)}return o}function Eh(s,t,e,i,n=Th){const o=s[e],r=s[i-t];if(Math.abs(o-r)>180){const a=ge(s,0,t,e);a[0]+=Math.round((r-o)/360)*360,ut(s,a),a[1]=Math.sign(a[1])*n,ut(s,a),a[0]=o,ut(s,a)}}function Fr(s,t,e,i){let n=s[0],o;for(let r=e;r<i;r+=t){o=s[r];const a=o-n;(a>180||a<-180)&&(o-=Math.round(a/360)*360),s[r]=n=o}}function kr(s,t){let e;const i=s.length/t;for(let o=0;o<i&&(e=s[o*t],(e+180)%360===0);o++);const n=-Math.round(e/360)*360;if(n!==0)for(let o=0;o<i;o++)s[o*t]+=n}function Ih(s,t,e,i){let n;if(Array.isArray(s[0])){const o=s.length*t;n=new Array(o);for(let r=0;r<s.length;r++)for(let a=0;a<t;a++)n[r*t+a]=s[r][a]||0}else n=s;return e?Rr(n,{size:t,gridResolution:e}):i?Lh(n,{size:t}):n}const Mh=1,Oh=2,Ai=4;class Rh extends Ar{constructor(t){super({...t,attributes:{positions:{size:3,padding:18,initialize:!0,type:t.fp64?Float64Array:Float32Array},segmentTypes:{size:1,type:Uint8ClampedArray}}})}get(t){return this.attributes[t]}getGeometryFromBuffer(t){return this.normalize?super.getGeometryFromBuffer(t):null}normalizeGeometry(t){return this.normalize?Ih(t,this.positionSize,this.opts.resolution,this.opts.wrapLongitude):t}getGeometrySize(t){if(kn(t)){let i=0;for(const n of t)i+=this.getGeometrySize(n);return i}const e=this.getPathLength(t);return e<2?0:this.isClosed(t)?e<3?0:e+2:e}updateGeometryAttributes(t,e){if(e.geometrySize!==0)if(t&&kn(t))for(const i of t){const n=this.getGeometrySize(i);e.geometrySize=n,this.updateGeometryAttributes(i,e),e.vertexStart+=n}else this._updateSegmentTypes(t,e),this._updatePositions(t,e)}_updateSegmentTypes(t,e){const i=this.attributes.segmentTypes,n=t?this.isClosed(t):!1,{vertexStart:o,geometrySize:r}=e;i.fill(0,o,o+r),n?(i[o]=Ai,i[o+r-2]=Ai):(i[o]+=Mh,i[o+r-2]+=Oh),i[o+r-1]=Ai}_updatePositions(t,e){const{positions:i}=this.attributes;if(!i||!t)return;const{vertexStart:n,geometrySize:o}=e,r=new Array(3);for(let a=n,l=0;l<o;a++,l++)this.getPointOnPath(t,l,r),i[a*3]=r[0],i[a*3+1]=r[1],i[a*3+2]=r[2]}getPathLength(t){return t.length/this.positionSize}getPointOnPath(t,e,i=[]){const{positionSize:n}=this;e*n>=t.length&&(e+=1-t.length/n);const o=e*n;return i[0]=t[o],i[1]=t[o+1],i[2]=n===3&&t[o+2]||0,i}isClosed(t){if(!this.normalize)return!!this.opts.loop;const{positionSize:e}=this,i=t.length-e;return t[0]===t[i]&&t[1]===t[i+1]&&(e===2||t[2]===t[i+2])}}function kn(s){return Array.isArray(s[0])}const Dn=`layout(std140) uniform pathUniforms {
  float widthScale;
  float widthMinPixels;
  float widthMaxPixels;
  float jointType;
  float capType;
  float miterLimit;
  bool billboard;
  highp int widthUnits;
} path;
`,zh={name:"path",vs:Dn,fs:Dn,uniformTypes:{widthScale:"f32",widthMinPixels:"f32",widthMaxPixels:"f32",jointType:"f32",capType:"f32",miterLimit:"f32",billboard:"f32",widthUnits:"i32"}},Bh=`#version 300 es
#define SHADER_NAME path-layer-vertex-shader
in vec2 positions;
in float instanceTypes;
in vec3 instanceStartPositions;
in vec3 instanceEndPositions;
in vec3 instanceLeftPositions;
in vec3 instanceRightPositions;
in vec3 instanceLeftPositions64Low;
in vec3 instanceStartPositions64Low;
in vec3 instanceEndPositions64Low;
in vec3 instanceRightPositions64Low;
in float instanceStrokeWidths;
in vec4 instanceColors;
in vec3 instancePickingColors;
uniform float opacity;
out vec4 vColor;
out vec2 vCornerOffset;
out float vMiterLength;
out vec2 vPathPosition;
out float vPathLength;
out float vJointType;
const float EPSILON = 0.001;
const vec3 ZERO_OFFSET = vec3(0.0);
float flipIfTrue(bool flag) {
return -(float(flag) * 2. - 1.);
}
vec3 getLineJoinOffset(
vec3 prevPoint, vec3 currPoint, vec3 nextPoint,
vec2 width
) {
bool isEnd = positions.x > 0.0;
float sideOfPath = positions.y;
float isJoint = float(sideOfPath == 0.0);
vec3 deltaA3 = (currPoint - prevPoint);
vec3 deltaB3 = (nextPoint - currPoint);
mat3 rotationMatrix;
bool needsRotation = !path.billboard && project_needs_rotation(currPoint, rotationMatrix);
if (needsRotation) {
deltaA3 = deltaA3 * rotationMatrix;
deltaB3 = deltaB3 * rotationMatrix;
}
vec2 deltaA = deltaA3.xy / width;
vec2 deltaB = deltaB3.xy / width;
float lenA = length(deltaA);
float lenB = length(deltaB);
vec2 dirA = lenA > 0. ? normalize(deltaA) : vec2(0.0, 0.0);
vec2 dirB = lenB > 0. ? normalize(deltaB) : vec2(0.0, 0.0);
vec2 perpA = vec2(-dirA.y, dirA.x);
vec2 perpB = vec2(-dirB.y, dirB.x);
vec2 tangent = dirA + dirB;
tangent = length(tangent) > 0. ? normalize(tangent) : perpA;
vec2 miterVec = vec2(-tangent.y, tangent.x);
vec2 dir = isEnd ? dirA : dirB;
vec2 perp = isEnd ? perpA : perpB;
float L = isEnd ? lenA : lenB;
float sinHalfA = abs(dot(miterVec, perp));
float cosHalfA = abs(dot(dirA, miterVec));
float turnDirection = flipIfTrue(dirA.x * dirB.y >= dirA.y * dirB.x);
float cornerPosition = sideOfPath * turnDirection;
float miterSize = 1.0 / max(sinHalfA, EPSILON);
miterSize = mix(
min(miterSize, max(lenA, lenB) / max(cosHalfA, EPSILON)),
miterSize,
step(0.0, cornerPosition)
);
vec2 offsetVec = mix(miterVec * miterSize, perp, step(0.5, cornerPosition))
* (sideOfPath + isJoint * turnDirection);
bool isStartCap = lenA == 0.0 || (!isEnd && (instanceTypes == 1.0 || instanceTypes == 3.0));
bool isEndCap = lenB == 0.0 || (isEnd && (instanceTypes == 2.0 || instanceTypes == 3.0));
bool isCap = isStartCap || isEndCap;
if (isCap) {
offsetVec = mix(perp * sideOfPath, dir * path.capType * 4.0 * flipIfTrue(isStartCap), isJoint);
vJointType = path.capType;
} else {
vJointType = path.jointType;
}
vPathLength = L;
vCornerOffset = offsetVec;
vMiterLength = dot(vCornerOffset, miterVec * turnDirection);
vMiterLength = isCap ? isJoint : vMiterLength;
vec2 offsetFromStartOfPath = vCornerOffset + deltaA * float(isEnd);
vPathPosition = vec2(
dot(offsetFromStartOfPath, perp),
dot(offsetFromStartOfPath, dir)
);
geometry.uv = vPathPosition;
float isValid = step(instanceTypes, 3.5);
vec3 offset = vec3(offsetVec * width * isValid, 0.0);
if (needsRotation) {
offset = rotationMatrix * offset;
}
return offset;
}
void clipLine(inout vec4 position, vec4 refPosition) {
if (position.w < EPSILON) {
float r = (EPSILON - refPosition.w) / (position.w - refPosition.w);
position = refPosition + (position - refPosition) * r;
}
}
void main() {
geometry.pickingColor = instancePickingColors;
vColor = vec4(instanceColors.rgb, instanceColors.a * layer.opacity);
float isEnd = positions.x;
vec3 prevPosition = mix(instanceLeftPositions, instanceStartPositions, isEnd);
vec3 prevPosition64Low = mix(instanceLeftPositions64Low, instanceStartPositions64Low, isEnd);
vec3 currPosition = mix(instanceStartPositions, instanceEndPositions, isEnd);
vec3 currPosition64Low = mix(instanceStartPositions64Low, instanceEndPositions64Low, isEnd);
vec3 nextPosition = mix(instanceEndPositions, instanceRightPositions, isEnd);
vec3 nextPosition64Low = mix(instanceEndPositions64Low, instanceRightPositions64Low, isEnd);
geometry.worldPosition = currPosition;
vec2 widthPixels = vec2(clamp(
project_size_to_pixel(instanceStrokeWidths * path.widthScale, path.widthUnits),
path.widthMinPixels, path.widthMaxPixels) / 2.0);
vec3 width;
if (path.billboard) {
vec4 prevPositionScreen = project_position_to_clipspace(prevPosition, prevPosition64Low, ZERO_OFFSET);
vec4 currPositionScreen = project_position_to_clipspace(currPosition, currPosition64Low, ZERO_OFFSET, geometry.position);
vec4 nextPositionScreen = project_position_to_clipspace(nextPosition, nextPosition64Low, ZERO_OFFSET);
clipLine(prevPositionScreen, currPositionScreen);
clipLine(nextPositionScreen, currPositionScreen);
clipLine(currPositionScreen, mix(nextPositionScreen, prevPositionScreen, isEnd));
width = vec3(widthPixels, 0.0);
DECKGL_FILTER_SIZE(width, geometry);
vec3 offset = getLineJoinOffset(
prevPositionScreen.xyz / prevPositionScreen.w,
currPositionScreen.xyz / currPositionScreen.w,
nextPositionScreen.xyz / nextPositionScreen.w,
project_pixel_size_to_clipspace(width.xy)
);
DECKGL_FILTER_GL_POSITION(currPositionScreen, geometry);
gl_Position = vec4(currPositionScreen.xyz + offset * currPositionScreen.w, currPositionScreen.w);
} else {
prevPosition = project_position(prevPosition, prevPosition64Low);
currPosition = project_position(currPosition, currPosition64Low);
nextPosition = project_position(nextPosition, nextPosition64Low);
width = vec3(project_pixel_size(widthPixels), 0.0);
DECKGL_FILTER_SIZE(width, geometry);
vec3 offset = getLineJoinOffset(prevPosition, currPosition, nextPosition, width.xy);
geometry.position = vec4(currPosition + offset, 1.0);
gl_Position = project_common_position_to_clipspace(geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
}
DECKGL_FILTER_COLOR(vColor, geometry);
}
`,Fh=`#version 300 es
#define SHADER_NAME path-layer-fragment-shader
precision highp float;
in vec4 vColor;
in vec2 vCornerOffset;
in float vMiterLength;
in vec2 vPathPosition;
in float vPathLength;
in float vJointType;
out vec4 fragColor;
void main(void) {
geometry.uv = vPathPosition;
if (vPathPosition.y < 0.0 || vPathPosition.y > vPathLength) {
if (vJointType > 0.5 && length(vCornerOffset) > 1.0) {
discard;
}
if (vJointType < 0.5 && vMiterLength > path.miterLimit + 1.0) {
discard;
}
}
fragColor = vColor;
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`,Dr=[0,0,0,255],kh={widthUnits:"meters",widthScale:{type:"number",min:0,value:1},widthMinPixels:{type:"number",min:0,value:0},widthMaxPixels:{type:"number",min:0,value:Number.MAX_SAFE_INTEGER},jointRounded:!1,capRounded:!1,miterLimit:{type:"number",min:0,value:4},billboard:!1,_pathType:null,getPath:{type:"accessor",value:s=>s.path},getColor:{type:"accessor",value:Dr},getWidth:{type:"accessor",value:1},rounded:{deprecatedFor:["jointRounded","capRounded"]}},Ei={enter:(s,t)=>t.length?t.subarray(t.length-s.length):s};class ye extends bt{getShaders(){return super.getShaders({vs:Bh,fs:Fh,modules:[Kt,Yt,zh]})}get wrapLongitude(){return!1}getBounds(){return this.getAttributeManager()?.getBounds(["vertexPositions"])}initializeState(){this.getAttributeManager().addInstanced({vertexPositions:{size:3,vertexOffset:1,type:"float64",fp64:this.use64bitPositions(),transition:Ei,accessor:"getPath",update:this.calculatePositions,noAlloc:!0,shaderAttributes:{instanceLeftPositions:{vertexOffset:0},instanceStartPositions:{vertexOffset:1},instanceEndPositions:{vertexOffset:2},instanceRightPositions:{vertexOffset:3}}},instanceTypes:{size:1,type:"uint8",update:this.calculateSegmentTypes,noAlloc:!0},instanceStrokeWidths:{size:1,accessor:"getWidth",transition:Ei,defaultValue:1},instanceColors:{size:this.props.colorFormat.length,type:"unorm8",accessor:"getColor",transition:Ei,defaultValue:Dr},instancePickingColors:{size:4,type:"uint8",accessor:(i,{index:n,target:o})=>this.encodePickingColor(i&&i.__source?i.__source.index:n,o)}}),this.setState({pathTesselator:new Rh({fp64:this.use64bitPositions()})})}updateState(t){super.updateState(t);const{props:e,changeFlags:i}=t,n=this.getAttributeManager();if(i.dataChanged||i.updateTriggersChanged&&(i.updateTriggersChanged.all||i.updateTriggersChanged.getPath)){const{pathTesselator:r}=this.state,a=e.data.attributes||{};r.updateGeometry({data:e.data,geometryBuffer:a.getPath,buffers:a,normalize:!e._pathType,loop:e._pathType==="loop",getGeometry:e.getPath,positionFormat:e.positionFormat,wrapLongitude:e.wrapLongitude,resolution:this.context.viewport.resolution,dataChanged:i.dataChanged}),this.setState({numInstances:r.instanceCount,startIndices:r.vertexStarts}),i.dataChanged||n.invalidateAll()}i.extensionsChanged&&(this.state.model?.destroy(),this.state.model=this._getModel(),n.invalidateAll())}getPickingInfo(t){const e=super.getPickingInfo(t),{index:i}=e,n=this.props.data;return n[0]&&n[0].__source&&(e.object=n.find(o=>o.__source.index===i)),e}disablePickingIndex(t){const e=this.props.data;if(e[0]&&e[0].__source)for(let i=0;i<e.length;i++)e[i].__source.index===t&&this._disablePickingIndex(i);else super.disablePickingIndex(t)}draw({uniforms:t}){const{jointRounded:e,capRounded:i,billboard:n,miterLimit:o,widthUnits:r,widthScale:a,widthMinPixels:l,widthMaxPixels:c}=this.props,u=this.state.model,f={jointType:Number(e),capType:Number(i),billboard:n,widthUnits:de[r],widthScale:a,miterLimit:o,widthMinPixels:l,widthMaxPixels:c};u.shaderInputs.setProps({path:f}),u.draw(this.context.renderPass)}_getModel(){const t=[0,1,2,1,4,2,1,3,4,3,5,4],e=[0,0,0,-1,0,1,1,-1,1,1,1,0];return new lt(this.context.device,{...this.getShaders(),id:this.props.id,bufferLayout:this.getAttributeManager().getBufferLayouts(),geometry:new _t({topology:"triangle-list",attributes:{indices:new Uint16Array(t),positions:{value:new Float32Array(e),size:2}}}),isInstanced:!0})}calculatePositions(t){const{pathTesselator:e}=this.state;t.startIndices=e.vertexStarts,t.value=e.get("positions")}calculateSegmentTypes(t){const{pathTesselator:e}=this.state;t.startIndices=e.vertexStarts,t.value=e.get("segmentTypes")}}ye.defaultProps=kh;ye.layerName="PathLayer";var Le={exports:{}},Nn;function Dh(){if(Nn)return Le.exports;Nn=1,Le.exports=s,Le.exports.default=s;function s(m,b,x){x=x||2;var P=b&&b.length,T=P?b[0]*x:m.length,L=t(m,0,T,x,!0),S=[];if(!L||L.next===L.prev)return S;var E,B,R,W,U,G,Z;if(P&&(L=l(m,b,L,x)),m.length>80*x){E=R=m[0],B=W=m[1];for(var j=x;j<T;j+=x)U=m[j],G=m[j+1],U<E&&(E=U),G<B&&(B=G),U>R&&(R=U),G>W&&(W=G);Z=Math.max(R-E,W-B),Z=Z!==0?32767/Z:0}return i(L,S,x,E,B,Z,0),S}function t(m,b,x,P,T){var L,S;if(T===X(m,b,x,P)>0)for(L=b;L<x;L+=P)S=H(L,m[L],m[L+1],S);else for(L=x-P;L>=b;L-=P)S=H(L,m[L],m[L+1],S);return S&&w(S,S.next)&&(Y(S),S=S.next),S}function e(m,b){if(!m)return m;b||(b=m);var x=m,P;do if(P=!1,!x.steiner&&(w(x,x.next)||C(x.prev,x,x.next)===0)){if(Y(x),x=b=x.prev,x===x.next)break;P=!0}else x=x.next;while(P||x!==b);return b}function i(m,b,x,P,T,L,S){if(m){!S&&L&&d(m,P,T,L);for(var E=m,B,R;m.prev!==m.next;){if(B=m.prev,R=m.next,L?o(m,P,T,L):n(m)){b.push(B.i/x|0),b.push(m.i/x|0),b.push(R.i/x|0),Y(m),m=R.next,E=R.next;continue}if(m=R,m===E){S?S===1?(m=r(e(m),b,x),i(m,b,x,P,T,L,2)):S===2&&a(m,b,x,P,T,L):i(e(m),b,x,P,T,L,1);break}}}}function n(m){var b=m.prev,x=m,P=m.next;if(C(b,x,P)>=0)return!1;for(var T=b.x,L=x.x,S=P.x,E=b.y,B=x.y,R=P.y,W=T<L?T<S?T:S:L<S?L:S,U=E<B?E<R?E:R:B<R?B:R,G=T>L?T>S?T:S:L>S?L:S,Z=E>B?E>R?E:R:B>R?B:R,j=P.next;j!==b;){if(j.x>=W&&j.x<=G&&j.y>=U&&j.y<=Z&&v(T,E,L,B,S,R,j.x,j.y)&&C(j.prev,j,j.next)>=0)return!1;j=j.next}return!0}function o(m,b,x,P){var T=m.prev,L=m,S=m.next;if(C(T,L,S)>=0)return!1;for(var E=T.x,B=L.x,R=S.x,W=T.y,U=L.y,G=S.y,Z=E<B?E<R?E:R:B<R?B:R,j=W<U?W<G?W:G:U<G?U:G,te=E>B?E>R?E:R:B>R?B:R,ee=W>U?W>G?W:G:U>G?U:G,qs=g(Z,j,b,x,P),Hs=g(te,ee,b,x,P),V=m.prevZ,$=m.nextZ;V&&V.z>=qs&&$&&$.z<=Hs;){if(V.x>=Z&&V.x<=te&&V.y>=j&&V.y<=ee&&V!==T&&V!==S&&v(E,W,B,U,R,G,V.x,V.y)&&C(V.prev,V,V.next)>=0||(V=V.prevZ,$.x>=Z&&$.x<=te&&$.y>=j&&$.y<=ee&&$!==T&&$!==S&&v(E,W,B,U,R,G,$.x,$.y)&&C($.prev,$,$.next)>=0))return!1;$=$.nextZ}for(;V&&V.z>=qs;){if(V.x>=Z&&V.x<=te&&V.y>=j&&V.y<=ee&&V!==T&&V!==S&&v(E,W,B,U,R,G,V.x,V.y)&&C(V.prev,V,V.next)>=0)return!1;V=V.prevZ}for(;$&&$.z<=Hs;){if($.x>=Z&&$.x<=te&&$.y>=j&&$.y<=ee&&$!==T&&$!==S&&v(E,W,B,U,R,G,$.x,$.y)&&C($.prev,$,$.next)>=0)return!1;$=$.nextZ}return!0}function r(m,b,x){var P=m;do{var T=P.prev,L=P.next.next;!w(T,L)&&A(T,P,P.next,L)&&M(T,L)&&M(L,T)&&(b.push(T.i/x|0),b.push(P.i/x|0),b.push(L.i/x|0),Y(P),Y(P.next),P=m=L),P=P.next}while(P!==m);return e(P)}function a(m,b,x,P,T,L){var S=m;do{for(var E=S.next.next;E!==S.prev;){if(S.i!==E.i&&_(S,E)){var B=q(S,E);S=e(S,S.next),B=e(B,B.next),i(S,b,x,P,T,L,0),i(B,b,x,P,T,L,0);return}E=E.next}S=S.next}while(S!==m)}function l(m,b,x,P){var T=[],L,S,E,B,R;for(L=0,S=b.length;L<S;L++)E=b[L]*P,B=L<S-1?b[L+1]*P:m.length,R=t(m,E,B,P,!1),R===R.next&&(R.steiner=!0),T.push(y(R));for(T.sort(c),L=0;L<T.length;L++)x=u(T[L],x);return x}function c(m,b){return m.x-b.x}function u(m,b){var x=f(m,b);if(!x)return b;var P=q(x,m);return e(P,P.next),e(x,x.next)}function f(m,b){var x=b,P=m.x,T=m.y,L=-1/0,S;do{if(T<=x.y&&T>=x.next.y&&x.next.y!==x.y){var E=x.x+(T-x.y)*(x.next.x-x.x)/(x.next.y-x.y);if(E<=P&&E>L&&(L=E,S=x.x<x.next.x?x:x.next,E===P))return S}x=x.next}while(x!==b);if(!S)return null;var B=S,R=S.x,W=S.y,U=1/0,G;x=S;do P>=x.x&&x.x>=R&&P!==x.x&&v(T<W?P:L,T,R,W,T<W?L:P,T,x.x,x.y)&&(G=Math.abs(T-x.y)/(P-x.x),M(x,m)&&(G<U||G===U&&(x.x>S.x||x.x===S.x&&h(S,x)))&&(S=x,U=G)),x=x.next;while(x!==B);return S}function h(m,b){return C(m.prev,m,b.prev)<0&&C(b.next,m,m.next)<0}function d(m,b,x,P){var T=m;do T.z===0&&(T.z=g(T.x,T.y,b,x,P)),T.prevZ=T.prev,T.nextZ=T.next,T=T.next;while(T!==m);T.prevZ.nextZ=null,T.prevZ=null,p(T)}function p(m){var b,x,P,T,L,S,E,B,R=1;do{for(x=m,m=null,L=null,S=0;x;){for(S++,P=x,E=0,b=0;b<R&&(E++,P=P.nextZ,!!P);b++);for(B=R;E>0||B>0&&P;)E!==0&&(B===0||!P||x.z<=P.z)?(T=x,x=x.nextZ,E--):(T=P,P=P.nextZ,B--),L?L.nextZ=T:m=T,T.prevZ=L,L=T;x=P}L.nextZ=null,R*=2}while(S>1);return m}function g(m,b,x,P,T){return m=(m-x)*T|0,b=(b-P)*T|0,m=(m|m<<8)&16711935,m=(m|m<<4)&252645135,m=(m|m<<2)&858993459,m=(m|m<<1)&1431655765,b=(b|b<<8)&16711935,b=(b|b<<4)&252645135,b=(b|b<<2)&858993459,b=(b|b<<1)&1431655765,m|b<<1}function y(m){var b=m,x=m;do(b.x<x.x||b.x===x.x&&b.y<x.y)&&(x=b),b=b.next;while(b!==m);return x}function v(m,b,x,P,T,L,S,E){return(T-S)*(b-E)>=(m-S)*(L-E)&&(m-S)*(P-E)>=(x-S)*(b-E)&&(x-S)*(L-E)>=(T-S)*(P-E)}function _(m,b){return m.next.i!==b.i&&m.prev.i!==b.i&&!F(m,b)&&(M(m,b)&&M(b,m)&&k(m,b)&&(C(m.prev,m,b.prev)||C(m,b.prev,b))||w(m,b)&&C(m.prev,m,m.next)>0&&C(b.prev,b,b.next)>0)}function C(m,b,x){return(b.y-m.y)*(x.x-b.x)-(b.x-m.x)*(x.y-b.y)}function w(m,b){return m.x===b.x&&m.y===b.y}function A(m,b,x,P){var T=z(C(m,b,x)),L=z(C(m,b,P)),S=z(C(x,P,m)),E=z(C(x,P,b));return!!(T!==L&&S!==E||T===0&&I(m,x,b)||L===0&&I(m,P,b)||S===0&&I(x,m,P)||E===0&&I(x,b,P))}function I(m,b,x){return b.x<=Math.max(m.x,x.x)&&b.x>=Math.min(m.x,x.x)&&b.y<=Math.max(m.y,x.y)&&b.y>=Math.min(m.y,x.y)}function z(m){return m>0?1:m<0?-1:0}function F(m,b){var x=m;do{if(x.i!==m.i&&x.next.i!==m.i&&x.i!==b.i&&x.next.i!==b.i&&A(x,x.next,m,b))return!0;x=x.next}while(x!==m);return!1}function M(m,b){return C(m.prev,m,m.next)<0?C(m,b,m.next)>=0&&C(m,m.prev,b)>=0:C(m,b,m.prev)<0||C(m,m.next,b)<0}function k(m,b){var x=m,P=!1,T=(m.x+b.x)/2,L=(m.y+b.y)/2;do x.y>L!=x.next.y>L&&x.next.y!==x.y&&T<(x.next.x-x.x)*(L-x.y)/(x.next.y-x.y)+x.x&&(P=!P),x=x.next;while(x!==m);return P}function q(m,b){var x=new ot(m.i,m.x,m.y),P=new ot(b.i,b.x,b.y),T=m.next,L=b.prev;return m.next=b,b.prev=m,x.next=T,T.prev=x,P.next=x,x.prev=P,L.next=P,P.prev=L,P}function H(m,b,x,P){var T=new ot(m,b,x);return P?(T.next=P.next,T.prev=P,P.next.prev=T,P.next=T):(T.prev=T,T.next=T),T}function Y(m){m.next.prev=m.prev,m.prev.next=m.next,m.prevZ&&(m.prevZ.nextZ=m.nextZ),m.nextZ&&(m.nextZ.prevZ=m.prevZ)}function ot(m,b,x){this.i=m,this.x=b,this.y=x,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}s.deviation=function(m,b,x,P){var T=b&&b.length,L=T?b[0]*x:m.length,S=Math.abs(X(m,0,L,x));if(T)for(var E=0,B=b.length;E<B;E++){var R=b[E]*x,W=E<B-1?b[E+1]*x:m.length;S-=Math.abs(X(m,R,W,x))}var U=0;for(E=0;E<P.length;E+=3){var G=P[E]*x,Z=P[E+1]*x,j=P[E+2]*x;U+=Math.abs((m[G]-m[j])*(m[Z+1]-m[G+1])-(m[G]-m[Z])*(m[j+1]-m[G+1]))}return S===0&&U===0?0:Math.abs((U-S)/S)};function X(m,b,x,P){for(var T=0,L=b,S=x-P;L<x;L+=P)T+=(m[S]-m[L])*(m[L+1]+m[S+1]),S=L;return T}return s.flatten=function(m){for(var b=m[0][0].length,x={vertices:[],holes:[],dimensions:b},P=0,T=0;T<m.length;T++){for(var L=0;L<m[T].length;L++)for(var S=0;S<b;S++)x.vertices.push(m[T][L][S]);T>0&&(P+=m[T-1].length,x.holes.push(P))}return x},Le.exports}var Nh=Dh();const Uh=ps(Nh),Se=Mr.CLOCKWISE,Un=Mr.COUNTER_CLOCKWISE,Lt={};function Gh(s){if(s=s&&s.positions||s,!Array.isArray(s)&&!ArrayBuffer.isView(s))throw new Error("invalid polygon")}function le(s){return"positions"in s?s.positions:s}function Ke(s){return"holeIndices"in s?s.holeIndices:null}function jh(s){return Array.isArray(s[0])}function Vh(s){return s.length>=1&&s[0].length>=2&&Number.isFinite(s[0][0])}function $h(s){const t=s[0],e=s[s.length-1];return t[0]===e[0]&&t[1]===e[1]&&t[2]===e[2]}function Wh(s,t,e,i){for(let n=0;n<t;n++)if(s[e+n]!==s[i-t+n])return!1;return!0}function Gn(s,t,e,i,n){let o=t;const r=e.length;for(let a=0;a<r;a++)for(let l=0;l<i;l++)s[o++]=e[a][l]||0;if(!$h(e))for(let a=0;a<i;a++)s[o++]=e[0][a]||0;return Lt.start=t,Lt.end=o,Lt.size=i,Or(s,n,Lt),o}function jn(s,t,e,i,n=0,o,r){o=o||e.length;const a=o-n;if(a<=0)return t;let l=t;for(let c=0;c<a;c++)s[l++]=e[n+c];if(!Wh(e,i,n,o))for(let c=0;c<i;c++)s[l++]=e[n+c];return Lt.start=t,Lt.end=l,Lt.size=i,Or(s,r,Lt),l}function Nr(s,t){Gh(s);const e=[],i=[];if("positions"in s){const{positions:n,holeIndices:o}=s;if(o){let r=0;for(let a=0;a<=o.length;a++)r=jn(e,r,n,t,o[a-1],o[a],a===0?Se:Un),i.push(r);return i.pop(),{positions:e,holeIndices:i}}s=n}if(!jh(s))return jn(e,0,s,t,0,e.length,Se),e;if(!Vh(s)){let n=0;for(const[o,r]of s.entries())n=Gn(e,n,r,t,o===0?Se:Un),i.push(n);return i.pop(),{positions:e,holeIndices:i}}return Gn(e,0,s,t,Se),e}function Ii(s,t,e){const i=s.length/3;let n=0;for(let o=0;o<i;o++){const r=(o+1)%i;n+=s[o*3+t]*s[r*3+e],n-=s[r*3+t]*s[o*3+e]}return Math.abs(n/2)}function Vn(s,t,e,i){const n=s.length/3;for(let o=0;o<n;o++){const r=o*3,a=s[r+0],l=s[r+1],c=s[r+2];s[r+t]=a,s[r+e]=l,s[r+i]=c}}function qh(s,t,e,i){let n=Ke(s);n&&(n=n.map(a=>a/t));let o=le(s);const r=i&&t===3;if(e){const a=o.length;o=o.slice();const l=[];for(let c=0;c<a;c+=t){l[0]=o[c],l[1]=o[c+1],r&&(l[2]=o[c+2]);const u=e(l);o[c]=u[0],o[c+1]=u[1],r&&(o[c+2]=u[2])}}if(r){const a=Ii(o,0,1),l=Ii(o,0,2),c=Ii(o,1,2);if(!a&&!l&&!c)return[];a>l&&a>c||(l>c?(e||(o=o.slice()),Vn(o,0,2,1)):(e||(o=o.slice()),Vn(o,2,0,1)))}return Uh(o,n,t)}class Hh extends Ar{constructor(t){const{fp64:e,IndexType:i=Uint32Array}=t;super({...t,attributes:{positions:{size:3,type:e?Float64Array:Float32Array},vertexValid:{type:Uint16Array,size:1},indices:{type:i,size:1}}})}get(t){const{attributes:e}=this;return t==="indices"?e.indices&&e.indices.subarray(0,this.vertexCount):e[t]}updateGeometry(t){super.updateGeometry(t);const e=this.buffers.indices;if(e)this.vertexCount=(e.value||e).length;else if(this.data&&!this.getGeometry)throw new Error("missing indices buffer")}normalizeGeometry(t){if(this.normalize){const e=Nr(t,this.positionSize);return this.opts.resolution?zr(le(e),Ke(e),{size:this.positionSize,gridResolution:this.opts.resolution,edgeTypes:!0}):this.opts.wrapLongitude?Sh(le(e),Ke(e),{size:this.positionSize,maxLatitude:86,edgeTypes:!0}):e}return t}getGeometrySize(t){if($n(t)){let e=0;for(const i of t)e+=this.getGeometrySize(i);return e}return le(t).length/this.positionSize}getGeometryFromBuffer(t){return this.normalize||!this.buffers.indices?super.getGeometryFromBuffer(t):null}updateGeometryAttributes(t,e){if(t&&$n(t))for(const i of t){const n=this.getGeometrySize(i);e.geometrySize=n,this.updateGeometryAttributes(i,e),e.vertexStart+=n,e.indexStart=this.indexStarts[e.geometryIndex+1]}else{const i=t;this._updateIndices(i,e),this._updatePositions(i,e),this._updateVertexValid(i,e)}}_updateIndices(t,{geometryIndex:e,vertexStart:i,indexStart:n}){const{attributes:o,indexStarts:r,typedArrayManager:a}=this;let l=o.indices;if(!l||!t)return;let c=n;const u=qh(t,this.positionSize,this.opts.preproject,this.opts.full3d);l=a.allocate(l,n+u.length,{copy:!0});for(let f=0;f<u.length;f++)l[c++]=u[f]+i;r[e+1]=n+u.length,o.indices=l}_updatePositions(t,{vertexStart:e,geometrySize:i}){const{attributes:{positions:n},positionSize:o}=this;if(!n||!t)return;const r=le(t);for(let a=e,l=0;l<i;a++,l++){const c=r[l*o],u=r[l*o+1],f=o>2?r[l*o+2]:0;n[a*3]=c,n[a*3+1]=u,n[a*3+2]=f}}_updateVertexValid(t,{vertexStart:e,geometrySize:i}){const{positionSize:n}=this,o=this.attributes.vertexValid,r=t&&Ke(t);if(t&&t.edgeTypes?o.set(t.edgeTypes,e):o.fill(1,e,e+i),r)for(let a=0;a<r.length;a++)o[e+r[a]/n-1]=0;o[e+i-1]=0}}function $n(s){return Array.isArray(s)&&s.length>0&&!Number.isFinite(s[0])}const Wn=`layout(std140) uniform solidPolygonUniforms {
  bool extruded;
  bool isWireframe;
  float elevationScale;
} solidPolygon;
`,Kh={name:"solidPolygon",vs:Wn,fs:Wn,uniformTypes:{extruded:"f32",isWireframe:"f32",elevationScale:"f32"}},Ur=`in vec4 fillColors;
in vec4 lineColors;
in vec3 pickingColors;
out vec4 vColor;
struct PolygonProps {
vec3 positions;
vec3 positions64Low;
vec3 normal;
float elevations;
};
vec3 project_offset_normal(vec3 vector) {
if (project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT ||
project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT_OFFSETS) {
return normalize(vector * project.commonUnitsPerWorldUnit);
}
return project_normal(vector);
}
void calculatePosition(PolygonProps props) {
vec3 pos = props.positions;
vec3 pos64Low = props.positions64Low;
vec3 normal = props.normal;
vec4 colors = solidPolygon.isWireframe ? lineColors : fillColors;
geometry.worldPosition = props.positions;
geometry.pickingColor = pickingColors;
if (solidPolygon.extruded) {
pos.z += props.elevations * solidPolygon.elevationScale;
}
gl_Position = project_position_to_clipspace(pos, pos64Low, vec3(0.), geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
if (solidPolygon.extruded) {
#ifdef IS_SIDE_VERTEX
normal = project_offset_normal(normal);
#else
normal = project_normal(normal);
#endif
geometry.normal = normal;
vec3 lightColor = lighting_getLightColor(colors.rgb, project.cameraPosition, geometry.position.xyz, geometry.normal);
vColor = vec4(lightColor, colors.a * layer.opacity);
} else {
vColor = vec4(colors.rgb, colors.a * layer.opacity);
}
DECKGL_FILTER_COLOR(vColor, geometry);
}
`,Yh=`#version 300 es
#define SHADER_NAME solid-polygon-layer-vertex-shader
in vec3 vertexPositions;
in vec3 vertexPositions64Low;
in float elevations;
${Ur}
void main(void) {
PolygonProps props;
props.positions = vertexPositions;
props.positions64Low = vertexPositions64Low;
props.elevations = elevations;
props.normal = vec3(0.0, 0.0, 1.0);
calculatePosition(props);
}
`,Zh=`#version 300 es
#define SHADER_NAME solid-polygon-layer-vertex-shader-side
#define IS_SIDE_VERTEX
in vec2 positions;
in vec3 vertexPositions;
in vec3 nextVertexPositions;
in vec3 vertexPositions64Low;
in vec3 nextVertexPositions64Low;
in float elevations;
in float instanceVertexValid;
${Ur}
void main(void) {
if(instanceVertexValid < 0.5){
gl_Position = vec4(0.);
return;
}
PolygonProps props;
vec3 pos;
vec3 pos64Low;
vec3 nextPos;
vec3 nextPos64Low;
#if RING_WINDING_ORDER_CW == 1
pos = vertexPositions;
pos64Low = vertexPositions64Low;
nextPos = nextVertexPositions;
nextPos64Low = nextVertexPositions64Low;
#else
pos = nextVertexPositions;
pos64Low = nextVertexPositions64Low;
nextPos = vertexPositions;
nextPos64Low = vertexPositions64Low;
#endif
props.positions = mix(pos, nextPos, positions.x);
props.positions64Low = mix(pos64Low, nextPos64Low, positions.x);
props.normal = vec3(
pos.y - nextPos.y + (pos64Low.y - nextPos64Low.y),
nextPos.x - pos.x + (nextPos64Low.x - pos64Low.x),
0.0);
props.elevations = elevations * positions.y;
calculatePosition(props);
}
`,Xh=`#version 300 es
#define SHADER_NAME solid-polygon-layer-fragment-shader
precision highp float;
in vec4 vColor;
out vec4 fragColor;
void main(void) {
fragColor = vColor;
geometry.uv = vec2(0.);
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`,ni=[0,0,0,255],Jh={filled:!0,extruded:!1,wireframe:!1,_normalize:!0,_windingOrder:"CW",_full3d:!1,elevationScale:{type:"number",min:0,value:1},getPolygon:{type:"accessor",value:s=>s.polygon},getElevation:{type:"accessor",value:1e3},getFillColor:{type:"accessor",value:ni},getLineColor:{type:"accessor",value:ni},material:!0},Ae={enter:(s,t)=>t.length?t.subarray(t.length-s.length):s};class fi extends bt{getShaders(t){return super.getShaders({vs:t==="top"?Yh:Zh,fs:Xh,defines:{RING_WINDING_ORDER_CW:!this.props._normalize&&this.props._windingOrder==="CCW"?0:1},modules:[Kt,nr,Yt,Kh]})}get wrapLongitude(){return!1}getBounds(){return this.getAttributeManager()?.getBounds(["vertexPositions"])}initializeState(){const{viewport:t}=this.context;let{coordinateSystem:e}=this.props;const{_full3d:i}=this.props;t.isGeospatial&&e==="default"&&(e="lnglat");let n;e==="lnglat"&&(i?n=t.projectPosition.bind(t):n=t.projectFlat.bind(t)),this.setState({numInstances:0,polygonTesselator:new Hh({preproject:n,fp64:this.use64bitPositions(),IndexType:Uint32Array})});const o=this.getAttributeManager(),r=!0;o.remove(["instancePickingColors"]),o.add({indices:{size:1,isIndexed:!0,update:this.calculateIndices,noAlloc:r},vertexPositions:{size:3,type:"float64",stepMode:"dynamic",fp64:this.use64bitPositions(),transition:Ae,accessor:"getPolygon",update:this.calculatePositions,noAlloc:r,shaderAttributes:{nextVertexPositions:{vertexOffset:1}}},instanceVertexValid:{size:1,type:"uint16",stepMode:"instance",update:this.calculateVertexValid,noAlloc:r},elevations:{size:1,stepMode:"dynamic",transition:Ae,accessor:"getElevation"},fillColors:{size:this.props.colorFormat.length,type:"unorm8",stepMode:"dynamic",transition:Ae,accessor:"getFillColor",defaultValue:ni},lineColors:{size:this.props.colorFormat.length,type:"unorm8",stepMode:"dynamic",transition:Ae,accessor:"getLineColor",defaultValue:ni},pickingColors:{size:4,type:"uint8",stepMode:"dynamic",accessor:(a,{index:l,target:c})=>this.encodePickingColor(a&&a.__source?a.__source.index:l,c)}})}getPickingInfo(t){const e=super.getPickingInfo(t),{index:i}=e,n=this.props.data;return n[0]&&n[0].__source&&(e.object=n.find(o=>o.__source.index===i)),e}disablePickingIndex(t){const e=this.props.data;if(e[0]&&e[0].__source)for(let i=0;i<e.length;i++)e[i].__source.index===t&&this._disablePickingIndex(i);else super.disablePickingIndex(t)}draw({uniforms:t}){const{extruded:e,filled:i,wireframe:n,elevationScale:o}=this.props,{topModel:r,sideModel:a,wireframeModel:l,polygonTesselator:c}=this.state,u={extruded:!!e,elevationScale:o,isWireframe:!1};l&&n&&(l.setInstanceCount(c.instanceCount-1),l.shaderInputs.setProps({solidPolygon:{...u,isWireframe:!0}}),l.draw(this.context.renderPass)),a&&i&&(a.setInstanceCount(c.instanceCount-1),a.shaderInputs.setProps({solidPolygon:u}),a.draw(this.context.renderPass)),r&&i&&(r.setVertexCount(c.vertexCount),r.shaderInputs.setProps({solidPolygon:u}),r.draw(this.context.renderPass))}updateState(t){super.updateState(t),this.updateGeometry(t);const{props:e,oldProps:i,changeFlags:n}=t,o=this.getAttributeManager();(n.extensionsChanged||e.filled!==i.filled||e.extruded!==i.extruded)&&(this.state.models?.forEach(a=>a.destroy()),this.setState(this._getModels()),o.invalidateAll())}updateGeometry({props:t,oldProps:e,changeFlags:i}){if(i.dataChanged||i.updateTriggersChanged&&(i.updateTriggersChanged.all||i.updateTriggersChanged.getPolygon)){const{polygonTesselator:o}=this.state,r=t.data.attributes||{};o.updateGeometry({data:t.data,normalize:t._normalize,geometryBuffer:r.getPolygon,buffers:r,getGeometry:t.getPolygon,positionFormat:t.positionFormat,wrapLongitude:t.wrapLongitude,resolution:this.context.viewport.resolution,fp64:this.use64bitPositions(),dataChanged:i.dataChanged,full3d:t._full3d}),this.setState({numInstances:o.instanceCount,startIndices:o.vertexStarts}),i.dataChanged||this.getAttributeManager().invalidateAll()}}_getModels(){const{id:t,filled:e,extruded:i}=this.props;let n,o,r;if(e){const a=this.getShaders("top");a.defines.NON_INSTANCED_MODEL=1;const l=this.getAttributeManager().getBufferLayouts({isInstanced:!1});n=new lt(this.context.device,{...a,id:`${t}-top`,topology:"triangle-list",bufferLayout:l,isIndexed:!0,userData:{excludeAttributes:{instanceVertexValid:!0}}})}if(i){const a=this.getAttributeManager().getBufferLayouts({isInstanced:!0});o=new lt(this.context.device,{...this.getShaders("side"),id:`${t}-side`,bufferLayout:a,geometry:new _t({topology:"triangle-strip",attributes:{positions:{size:2,value:new Float32Array([1,0,0,0,1,1,0,1])}}}),isInstanced:!0,userData:{excludeAttributes:{indices:!0}}}),r=new lt(this.context.device,{...this.getShaders("side"),id:`${t}-wireframe`,bufferLayout:a,geometry:new _t({topology:"line-strip",attributes:{positions:{size:2,value:new Float32Array([1,0,0,0,0,1,1,1])}}}),isInstanced:!0,userData:{excludeAttributes:{indices:!0}}})}return{models:[o,r,n].filter(Boolean),topModel:n,sideModel:o,wireframeModel:r}}calculateIndices(t){const{polygonTesselator:e}=this.state;t.startIndices=e.indexStarts,t.value=e.get("indices")}calculatePositions(t){const{polygonTesselator:e}=this.state;t.startIndices=e.vertexStarts,t.value=e.get("positions")}calculateVertexValid(t){t.value=this.state.polygonTesselator.get("vertexValid")}}fi.defaultProps=Jh;fi.layerName="SolidPolygonLayer";function Gr({data:s,getIndex:t,dataRange:e,replace:i}){const{startRow:n=0,endRow:o=1/0}=e,r=s.length;let a=r,l=r;for(let h=0;h<r;h++){const d=t(s[h]);if(a>h&&d>=n&&(a=h),d>=o){l=h;break}}let c=a;const f=l-a!==i.length?s.slice(l):void 0;for(let h=0;h<i.length;h++)s[c++]=i[h];if(f){for(let h=0;h<f.length;h++)s[c++]=f[h];s.length=c}return{startRow:a,endRow:a+i.length}}const jr=[0,0,0,255],Qh=[0,0,0,255],td={stroked:!0,filled:!0,extruded:!1,elevationScale:1,wireframe:!1,_normalize:!0,_windingOrder:"CW",lineWidthUnits:"meters",lineWidthScale:1,lineWidthMinPixels:0,lineWidthMaxPixels:Number.MAX_SAFE_INTEGER,lineJointRounded:!1,lineMiterLimit:4,getPolygon:{type:"accessor",value:s=>s.polygon},getFillColor:{type:"accessor",value:Qh},getLineColor:{type:"accessor",value:jr},getLineWidth:{type:"accessor",value:1},getElevation:{type:"accessor",value:1e3},material:!0};class Cs extends It{initializeState(){this.state={paths:[],pathsDiff:null},this.props.getLineDashArray&&K.removed("getLineDashArray","PathStyleExtension")()}updateState({changeFlags:t}){const e=t.dataChanged||t.updateTriggersChanged&&(t.updateTriggersChanged.all||t.updateTriggersChanged.getPolygon);if(e&&Array.isArray(t.dataChanged)){const i=this.state.paths.slice(),n=t.dataChanged.map(o=>Gr({data:i,getIndex:r=>r.__source.index,dataRange:o,replace:this._getPaths(o)}));this.setState({paths:i,pathsDiff:n})}else e&&this.setState({paths:this._getPaths(),pathsDiff:null})}_getPaths(t={}){const{data:e,getPolygon:i,positionFormat:n,_normalize:o}=this.props,r=[],a=n==="XY"?2:3,{startRow:l,endRow:c}=t,{iterable:u,objectInfo:f}=kt(e,l,c);for(const h of u){f.index++;let d=i(h,f);o&&(d=Nr(d,a));const{holeIndices:p}=d,g=d.positions||d;if(p)for(let y=0;y<=p.length;y++){const v=g.slice(p[y-1]||0,p[y]||g.length);r.push(this.getSubLayerRow({path:v},h,f.index))}else r.push(this.getSubLayerRow({path:g},h,f.index))}return r}renderLayers(){const{data:t,_dataDiff:e,stroked:i,filled:n,extruded:o,wireframe:r,_normalize:a,_windingOrder:l,elevationScale:c,transitions:u,positionFormat:f}=this.props,{lineWidthUnits:h,lineWidthScale:d,lineWidthMinPixels:p,lineWidthMaxPixels:g,lineJointRounded:y,lineMiterLimit:v,lineDashJustified:_}=this.props,{getFillColor:C,getLineColor:w,getLineWidth:A,getLineDashArray:I,getElevation:z,getPolygon:F,updateTriggers:M,material:k}=this.props,{paths:q,pathsDiff:H}=this.state,Y=this.getSubLayerClass("fill",fi),ot=this.getSubLayerClass("stroke",ye),X=this.shouldRenderSubLayer("fill",q)&&new Y({_dataDiff:e,extruded:o,elevationScale:c,filled:n,wireframe:r,_normalize:a,_windingOrder:l,getElevation:z,getFillColor:C,getLineColor:o&&r?w:jr,material:k,transitions:u},this.getSubLayerProps({id:"fill",updateTriggers:M&&{getPolygon:M.getPolygon,getElevation:M.getElevation,getFillColor:M.getFillColor,lineColors:o&&r,getLineColor:M.getLineColor}}),{data:t,positionFormat:f,getPolygon:F}),m=!o&&i&&this.shouldRenderSubLayer("stroke",q)&&new ot({_dataDiff:H&&(()=>H),widthUnits:h,widthScale:d,widthMinPixels:p,widthMaxPixels:g,jointRounded:y,miterLimit:v,dashJustified:_,_pathType:"loop",transitions:u&&{getWidth:u.getLineWidth,getColor:u.getLineColor,getPath:u.getPolygon},getColor:this.getSubLayerAccessor(w),getWidth:this.getSubLayerAccessor(A),getDashArray:this.getSubLayerAccessor(I)},this.getSubLayerProps({id:"stroke",updateTriggers:M&&{getWidth:M.getLineWidth,getColor:M.getLineColor,getDashArray:M.getLineDashArray}}),{data:q,positionFormat:f,getPath:b=>b.path});return[!o&&X,m,o&&X]}}Cs.layerName="PolygonLayer";Cs.defaultProps=td;function ed(s,t){if(!s)return null;const e="startIndices"in s?s.startIndices[t]:t,i=s.featureIds.value[e];return e!==-1?id(s,i,e):null}function id(s,t,e){const i={properties:{...s.properties[t]}};for(const n in s.numericProps)i.properties[n]=s.numericProps[n].value[e];return i}function sd(s,t){const e={points:null,lines:null,polygons:null};for(const i in e){const n=s[i].globalFeatureIds.value;e[i]=new Uint8ClampedArray(n.length*4);const o=[];for(let r=0;r<n.length;r++)t(n[r],o),e[i][r*4+0]=o[0],e[i][r*4+1]=o[1],e[i][r*4+2]=o[2],e[i][r*4+3]=255}return e}const qn=`layout(std140) uniform sdfUniforms {
  float gamma;
  bool enabled;
  float buffer;
  float outlineBuffer;
  vec4 outlineColor;
} sdf;
`,nd={name:"sdf",vs:qn,fs:qn,uniformTypes:{gamma:"f32",enabled:"f32",buffer:"f32",outlineBuffer:"f32",outlineColor:"vec4<f32>"}},ue={none:0,start:1,center:2,end:3},od=`layout(std140) uniform textUniforms {
  highp vec2 cutoffPixels;
  highp ivec2 align;
  highp float fontSize;
  bool flipY;
} text;

#define ALIGN_MODE_START ${ue.start}
#define ALIGN_MODE_CENTER ${ue.center}
#define ALIGN_MODE_END ${ue.end}
`,Vr={name:"text",vs:od,getUniforms:({contentCutoffPixels:s=[0,0],contentAlignHorizontal:t="none",contentAlignVertical:e="none",fontSize:i,viewport:n})=>({cutoffPixels:s,align:[ue[t],ue[e]],fontSize:i,flipY:n?.flipY??!1}),uniformTypes:{cutoffPixels:"vec2<f32>",align:"vec2<i32>",fontSize:"f32",flipY:"f32"}},rd=`#version 300 es
#define SHADER_NAME multi-icon-layer-vertex-shader
in vec2 positions;
in vec3 instancePositions;
in vec3 instancePositions64Low;
in float instanceSizes;
in float instanceAngles;
in vec4 instanceColors;
in vec3 instancePickingColors;
in vec4 instanceIconFrames;
in float instanceColorModes;
in vec2 instanceOffsets;
in vec2 instancePixelOffset;
in vec4 instanceClipRect;
out float vColorMode;
out vec4 vColor;
out vec2 vTextureCoords;
out vec2 uv;
vec2 rotate_by_angle(vec2 vertex, float angle) {
float angle_radian = angle * PI / 180.0;
float cos_angle = cos(angle_radian);
float sin_angle = sin(angle_radian);
mat2 rotationMatrix = mat2(cos_angle, -sin_angle, sin_angle, cos_angle);
return rotationMatrix * vertex;
}
float getPixelOffsetFromAlignment(float anchor, float extent, float clipStart, float clipEnd, int mode) {
if (clipEnd < clipStart) return 0.0;
if (mode == ALIGN_MODE_START) {
return max(- (anchor + clipStart), 0.0);
}
if (mode == ALIGN_MODE_CENTER) {
float _min = max(0., anchor + clipStart);
float _max = min(extent, anchor + clipEnd);
return _min < _max ? (_min + _max) / 2.0 - anchor : 0.0;
}
if (mode == ALIGN_MODE_END) {
return min(extent - (anchor + clipEnd), 0.);
}
return 0.0;
}
void main(void) {
geometry.worldPosition = instancePositions;
geometry.uv = positions;
geometry.pickingColor = instancePickingColors;
uv = positions;
vec2 iconSize = instanceIconFrames.zw;
float sizePixels = clamp(
project_size_to_pixel(instanceSizes * icon.sizeScale, icon.sizeUnits),
icon.sizeMinPixels, icon.sizeMaxPixels
);
float instanceScale = sizePixels / text.fontSize;
vec2 pixelOffset = positions / 2.0 * iconSize + instanceOffsets;
pixelOffset = rotate_by_angle(pixelOffset, instanceAngles) * instanceScale;
pixelOffset += instancePixelOffset;
pixelOffset.y *= -1.0;
vec2 anchorPosScreen;
if (icon.billboard)  {
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0), geometry.position);
anchorPosScreen = gl_Position.xy / gl_Position.w;
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
vec3 offset = vec3(pixelOffset, 0.0);
DECKGL_FILTER_SIZE(offset, geometry);
gl_Position.xy += project_pixel_size_to_clipspace(offset.xy);
} else {
vec3 offset_common = vec3(project_pixel_size(pixelOffset), 0.0);
if (text.flipY) {
offset_common.y *= -1.;
}
DECKGL_FILTER_SIZE(offset_common, geometry);
vec4 anchorPos = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0));
anchorPosScreen = anchorPos.xy / anchorPos.w;
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset_common, geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
}
anchorPosScreen = vec2(anchorPosScreen.x + 1.0, 1.0 - anchorPosScreen.y) / 2.0 * project.viewportSize / project.devicePixelRatio;
vec2 xy = project_size_to_pixel(instanceClipRect.xy);
vec2 wh = project_size_to_pixel(instanceClipRect.zw);
if (text.flipY) {
xy.y = -xy.y - wh.y;
}
if (text.align.x > 0 || text.align.y > 0) {
vec2 viewportPixels = project.viewportSize / project.devicePixelRatio;
vec2 scrollPixels = vec2(
getPixelOffsetFromAlignment(anchorPosScreen.x, viewportPixels.x, xy.x, xy.x + wh.x, text.align.x),
-getPixelOffsetFromAlignment(anchorPosScreen.y, viewportPixels.y, -xy.y - wh.y, -xy.y, text.align.y)
);
pixelOffset += scrollPixels;
gl_Position.xy += project_pixel_size_to_clipspace(scrollPixels);
}
if (instanceClipRect.z >= 0.) {
if (pixelOffset.x < xy.x || pixelOffset.x > xy.x + wh.x) {
gl_Position = vec4(0.0);
}
else if (text.cutoffPixels.x > 0.) {
float vpWidth = project.viewportSize.x / project.devicePixelRatio;
float l = max(anchorPosScreen.x + xy.x, 0.0);
float r = min(anchorPosScreen.x + xy.x + wh.x, vpWidth);
if (r - l < text.cutoffPixels.x) {
gl_Position = vec4(0.0);
}
}
}
if (instanceClipRect.w >= 0.) {
if (pixelOffset.y < xy.y || pixelOffset.y > xy.y + wh.y) {
gl_Position = vec4(0.0);
}
else if (text.cutoffPixels.y > 0.) {
float vpHeight = project.viewportSize.y / project.devicePixelRatio;
float t = max(anchorPosScreen.y - xy.y - wh.y, 0.0);
float b = min(anchorPosScreen.y - xy.y, vpHeight);
if (b - t < text.cutoffPixels.y) {
gl_Position = vec4(0.0);
}
}
}
vTextureCoords = mix(
instanceIconFrames.xy,
instanceIconFrames.xy + iconSize,
(positions.xy + 1.0) / 2.0
) / icon.iconsTextureDim;
vColor = instanceColors;
DECKGL_FILTER_COLOR(vColor, geometry);
vColorMode = instanceColorModes;
}
`,ad=`#version 300 es
#define SHADER_NAME multi-icon-layer-fragment-shader
precision highp float;
uniform sampler2D iconsTexture;
in vec4 vColor;
in vec2 vTextureCoords;
in vec2 uv;
out vec4 fragColor;
void main(void) {
geometry.uv = uv;
if (!bool(picking.isActive)) {
float alpha = texture(iconsTexture, vTextureCoords).a;
vec4 color = vColor;
if (sdf.enabled) {
float distance = alpha;
alpha = smoothstep(sdf.buffer - sdf.gamma, sdf.buffer + sdf.gamma, distance);
if (sdf.outlineBuffer > 0.0) {
float inFill = alpha;
float inBorder = smoothstep(sdf.outlineBuffer - sdf.gamma, sdf.outlineBuffer + sdf.gamma, distance);
color = mix(sdf.outlineColor, vColor, inFill);
alpha = inBorder;
}
}
float a = alpha * color.a;
if (a < icon.alphaCutoff) {
discard;
}
fragColor = vec4(color.rgb, a * layer.opacity);
}
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`,Mi=192/256,ld={getIconOffsets:{type:"accessor",value:s=>s.offsets},getContentBox:{type:"accessor",value:[0,0,-1,-1]},fontSize:1,alphaCutoff:.001,smoothing:.1,outlineWidth:0,outlineColor:{type:"color",value:[0,0,0,255]},contentCutoffPixels:{type:"array",value:[0,0]},contentAlignHorizontal:"none",contentAlignVertical:"none"};class ws extends ui{getShaders(){const t=super.getShaders();return{...t,modules:[...t.modules,Vr,nd],vs:rd,fs:ad}}initializeState(){super.initializeState();const t=this.getAttributeManager(),e=t.attributes.instanceIconDefs;e.settings.update=this.calculateInstanceIconDefs,t.addInstanced({instancePickingColors:{type:"uint8",size:4,accessor:(i,{index:n,target:o})=>this.encodePickingColor(n,o)},instanceClipRect:{size:4,accessor:"getContentBox",defaultValue:[0,0,-1,-1]}})}updateState(t){super.updateState(t);const{props:e,oldProps:i,changeFlags:n}=t,{outlineColor:o}=e;if(n.updateTriggersChanged&&(n.updateTriggersChanged.getIcon||n.updateTriggersChanged.getIconOffsets)&&this.getAttributeManager().invalidate("instanceIconDefs"),o!==i.outlineColor){const r=[o[0]/255,o[1]/255,o[2]/255,(o[3]??255)/255];this.setState({outlineColor:r})}!e.sdf&&e.outlineWidth&&K.warn(`${this.id}: fontSettings.sdf is required to render outline`)()}draw(t){const{sdf:e,smoothing:i,fontSize:n,outlineWidth:o,contentCutoffPixels:r,contentAlignHorizontal:a,contentAlignVertical:l}=this.props,{outlineColor:c}=this.state,u=o?Math.max(i,Mi*(1-o)):-1,f=this.state.model,h={buffer:Mi,outlineBuffer:u,gamma:i,enabled:!!e,outlineColor:c},d={contentCutoffPixels:r,contentAlignHorizontal:a,contentAlignVertical:l,fontSize:n,viewport:this.context.viewport};if(f.shaderInputs.setProps({sdf:h,text:d}),super.draw(t),e&&o){const{iconManager:p}=this.state;p.getTexture()&&(f.shaderInputs.setProps({sdf:{...h,outlineBuffer:Mi}}),f.draw(this.context.renderPass))}}calculateInstanceIconDefs(t,{startRow:e,endRow:i}){const{data:n,getIcon:o,getIconOffsets:r}=this.props;let a=t.getVertexOffset(e);const l=t.value,{iterable:c,objectInfo:u}=kt(n,e,i);for(const f of c){u.index++;const h=o(f,u),d=r(f,u);if(h){let p=0;for(const g of Array.from(h)){const y=super.getInstanceIconDef(g);y[0]=d[p*2],y[1]+=d[p*2+1],y[6]=1,l.set(y,a),a+=t.size,p++}}}}}ws.defaultProps=ld;ws.layerName="MultiIconLayer";const fe=1e20,Ps=new Float64Array(256);for(let s=0;s<256;s++){const t=.5-Math.pow(s/255,.45454545454545453);Ps[s]=t*Math.abs(t)}Ps[255]=-fe;class cd{constructor({fontSize:t=24,buffer:e=3,radius:i=8,cutoff:n=.25,fontFamily:o="sans-serif",fontWeight:r="normal",fontStyle:a="normal",lang:l=null}={}){this.buffer=e,this.radius=i,this.cutoff=n,this.lang=l;const c=this.size=t+e*4,u=this._createCanvas(c),f=this.ctx=u.getContext("2d",{willReadFrequently:!0});f.font=`${a} ${r} ${t}px ${o}`,f.textBaseline="alphabetic",f.textAlign="left",f.fillStyle="black",this.gridOuter=new Float64Array(c*c),this.gridInner=new Float64Array(c*c),this.f=new Float64Array(c),this.z=new Float64Array(c+1),this.v=new Uint16Array(c)}_createCanvas(t){if(typeof OffscreenCanvas<"u")return new OffscreenCanvas(t,t);const e=document.createElement("canvas");return e.width=e.height=t,e}draw(t){const{width:e,actualBoundingBoxAscent:i,actualBoundingBoxDescent:n,actualBoundingBoxLeft:o,actualBoundingBoxRight:r}=this.ctx.measureText(t),a=Math.ceil(i),l=Math.floor(-o),c=Math.max(0,Math.min(this.size-this.buffer,Math.ceil(r)-l)),u=Math.max(0,Math.min(this.size-this.buffer,a+Math.ceil(n))),f=c+2*this.buffer,h=u+2*this.buffer,d=Math.max(f*h,0),p=new Uint8ClampedArray(d),g={data:p,width:f,height:h,glyphWidth:c,glyphHeight:u,glyphTop:a,glyphLeft:l,glyphAdvance:e};if(c===0||u===0)return g;const{ctx:y,buffer:v,gridInner:_,gridOuter:C}=this;this.lang&&(y.lang=this.lang),y.clearRect(v,v,c,u),y.fillText(t,v-l,v+a);const w=y.getImageData(v,v,c,u);C.fill(fe,0,d),_.fill(0,0,d);let A=3;for(let M=0;M<u;M++){let k=(M+v)*f+v;for(let q=0;q<c;q++,A+=4,k++){const H=w.data[A];if(H===0)continue;const Y=Ps[H];C[k]=Math.max(0,Y),_[k]=Math.max(0,-Y)}}Hn(C,0,0,f,h,f,this.f,this.v,this.z);const I=Math.min(v,1);Hn(_,v-I,v-I,c+2*I,u+2*I,f,this.f,this.v,this.z);const z=255/this.radius,F=255*(1-this.cutoff);for(let M=0;M<d;M++){const k=Math.sqrt(C[M])-Math.sqrt(_[M]);p[M]=Math.round(F-z*k)}return g}}function Hn(s,t,e,i,n,o,r,a,l){for(let c=t;c<t+i;c++)Kn(s,e*o+c,o,n,r,a,l);for(let c=e;c<e+n;c++)Kn(s,c*o+t,1,i,r,a,l)}function Kn(s,t,e,i,n,o,r){o[0]=0,r[0]=-fe,r[1]=fe,n[0]=s[t];for(let a=1,l=0,c=0;a<i;a++){n[a]=s[t+a*e];const u=a*a;do{const f=o[l];c=(n[a]-n[f]+u-f*f)/(a-f)/2}while(c<=r[l]&&--l>-1);l++,o[l]=a,r[l]=c,r[l+1]=fe}for(let a=0,l=0;a<i;a++){for(;r[l+1]<a;)l++;const c=o[l],u=a-c;s[t+a*e]=n[c]+u*u}}const ud=32,fd=[];function hd(s){return Math.pow(2,Math.ceil(Math.log2(s)))}function dd({characterSet:s,measureText:t,buffer:e,maxCanvasWidth:i,mapping:n={},xOffset:o=0,yOffsetMin:r=0,yOffsetMax:a=0}){let l=o,c=r,u=a;for(const f of s)if(!n[f]){const{advance:h,width:d,ascent:p,descent:g}=t(f),y=p+g;l+d+e*2>i&&(l=0,c=u),n[f]={x:l+e,y:c+e,width:d,height:y,advance:h,anchorX:d/2,anchorY:p},l+=d+e*2,u=Math.max(u,c+y+e*2)}return{mapping:n,xOffset:l,yOffsetMin:c,yOffsetMax:u,canvasHeight:hd(u)}}function $r(s,t,e,i){let n=0;for(let o=t;o<e;o++){const r=s[o];n+=i[r]?.advance||0}return n}function Wr(s,t,e,i,n,o){let r=t,a=0;for(let l=t;l<e;l++){const c=$r(s,l,l+1,n);a+c>i&&(r<l&&o.push(l),r=l,a=0),a+=c}return a}function pd(s,t,e,i,n,o){let r=t,a=t,l=t,c=0;for(let u=t;u<e;u++)if((s[u]===" "||s[u+1]===" "||u+1===e)&&(l=u+1),l>a){let f=$r(s,a,l,n);c+f>i&&(r<a&&(o.push(a),r=a,c=0),f>i&&(f=Wr(s,a,l,i,n,o),r=o[o.length-1])),a=l,c+=f}return c}function gd(s,t,e,i,n=0,o){o===void 0&&(o=s.length);const r=[];return t==="break-all"?Wr(s,n,o,e,i,r):pd(s,n,o,e,i,r),r}function md(s,t,e,i,n,o){let r=0,a=0;for(let l=t;l<e;l++){const c=s[l],u=i[c];u&&(a=Math.max(a,u.height))}for(let l=t;l<e;l++){const c=s[l],u=i[c];u?(n[l]=r+u.anchorX,r+=u.advance):(K.warn(`Missing character: ${c} (${c.codePointAt(0)})`)(),n[l]=r,r+=ud)}o[0]=r,o[1]=a}function yd(s,t,e,i,n,o){const r=Array.from(s),a=r.length,l=new Array(a),c=new Array(a),u=new Array(a),f=(i==="break-word"||i==="break-all")&&isFinite(n)&&n>0,h=[0,0],d=[0,0];let p=0,g=t+e/2,y=0,v=0;for(let _=0;_<=a;_++){const C=r[_];if((C===`
`||_===a)&&(v=_),v>y){const w=f?gd(r,i,n,o,y,v):fd;for(let A=0;A<=w.length;A++){const I=A===0?y:w[A-1],z=A<w.length?w[A]:v;md(r,I,z,o,l,d);for(let F=I;F<z;F++)c[F]=g,u[F]=d[0];p++,g+=e,h[0]=Math.max(h[0],d[0])}y=v}C===`
`&&(l[y]=0,c[y]=0,u[y]=0,y++)}return h[1]=p*e,{x:l,y:c,rowWidth:u,size:h}}function xd({value:s,length:t,stride:e,offset:i,startIndices:n,characterSet:o}){const r=s.BYTES_PER_ELEMENT,a=e?e/r:1,l=i?i/r:0,c=n[t]||Math.ceil((s.length-l)/a),u=o&&new Set,f=new Array(t);let h=s;if(a>1||l>0){const d=s.constructor;h=new d(c);for(let p=0;p<c;p++)h[p]=s[p*a+l]}for(let d=0;d<t;d++){const p=n[d],g=n[d+1]||c,y=h.subarray(p,g);f[d]=String.fromCodePoint.apply(null,y),u&&y.forEach(u.add,u)}if(u)for(const d of u)o.add(String.fromCodePoint(d));return{texts:f,characterCount:c}}class qr{constructor(t=5){this._cache={},this._order=[],this.limit=t}get(t){const e=this._cache[t];return e&&(this._deleteOrder(t),this._appendOrder(t)),e}set(t,e){this._cache[t]?(this.delete(t),this._cache[t]=e,this._appendOrder(t)):(Object.keys(this._cache).length===this.limit&&this.delete(this._order[0]),this._cache[t]=e,this._appendOrder(t))}delete(t){this._cache[t]&&(delete this._cache[t],this._deleteOrder(t))}_deleteOrder(t){const e=this._order.indexOf(t);e>=0&&this._order.splice(e,1)}_appendOrder(t){this._order.push(t)}}function _d(){const s=[];for(let t=32;t<128;t++)s.push(String.fromCharCode(t));return s}const $t={fontFamily:"Monaco, monospace",fontWeight:"normal",characterSet:_d(),fontSize:64,buffer:4,sdf:!1,cutoff:.25,radius:12,smoothing:.1},Yn=1024,Zn=.9,Xn=.3,Hr=3;let oi=new qr(Hr);function vd(s,t){let e;typeof t=="string"?e=new Set(Array.from(t)):e=new Set(t);const i=oi.get(s);if(!i)return e;for(const n in i.mapping)e.has(n)&&e.delete(n);return e}function bd(s,t){for(let e=0;e<s.length;e++)t.data[4*e+3]=s[e]}function Jn(s,t,e,i){s.font=`${i} ${e}px ${t}`,s.fillStyle="#000",s.textBaseline="alphabetic",s.textAlign="left"}function Cd(s,t,e){if(e===void 0){const n=s.measureText("A");return n.fontBoundingBoxAscent?{advance:0,width:0,ascent:Math.ceil(n.fontBoundingBoxAscent),descent:Math.ceil(n.fontBoundingBoxDescent)}:{advance:0,width:0,ascent:t*Zn,descent:t*Xn}}const i=s.measureText(e);return i.actualBoundingBoxAscent?{advance:i.width,width:Math.ceil(i.actualBoundingBoxRight-i.actualBoundingBoxLeft),ascent:Math.ceil(i.actualBoundingBoxAscent),descent:Math.ceil(i.actualBoundingBoxDescent)}:{advance:i.width,width:i.width,ascent:t*Zn,descent:t*Xn}}function wd(s){K.assert(Number.isFinite(s)&&s>=Hr,"Invalid cache limit"),oi=new qr(s)}class Pd{constructor(){this.props={...$t}}get atlas(){return this._atlas}get mapping(){return this._atlas&&this._atlas.mapping}setProps(t={}){Object.assign(this.props,t),t._getFontRenderer&&(this._getFontRenderer=t._getFontRenderer),this._key=this._getKey();const e=vd(this._key,this.props.characterSet),i=oi.get(this._key);if(i&&e.size===0){this._atlas!==i&&(this._atlas=i);return}const n=this._generateFontAtlas(e,i);this._atlas=n,oi.set(this._key,n)}_generateFontAtlas(t,e){const{fontFamily:i,fontWeight:n,fontSize:o,buffer:r,sdf:a,radius:l,cutoff:c}=this.props;let u=e&&e.data;u||(u=document.createElement("canvas"),u.width=Yn);const f=u.getContext("2d",{willReadFrequently:!0});Jn(f,i,o,n);const h=w=>Cd(f,o,w);let d;this._getFontRenderer?d=this._getFontRenderer(this.props):a&&(d={measure:h,draw:Td(this.props)});const{mapping:p,canvasHeight:g,xOffset:y,yOffsetMin:v,yOffsetMax:_}=dd({measureText:w=>d?d.measure(w):h(w),buffer:r,characterSet:t,maxCanvasWidth:Yn,...e&&{mapping:e.mapping,xOffset:e.xOffset,yOffsetMin:e.yOffsetMin,yOffsetMax:e.yOffsetMax}});if(u.height!==g){const w=u.height>0?f.getImageData(0,0,u.width,u.height):null;u.height=g,w&&f.putImageData(w,0,0)}if(Jn(f,i,o,n),d)for(const w of t){const A=p[w],{data:I,left:z=0,top:F=0}=d.draw(w),M=A.x-z,k=A.y-F,q=Math.max(0,Math.round(M)),H=Math.max(0,Math.round(k)),Y=Math.min(I.width,u.width-q),ot=Math.min(I.height,u.height-H);f.putImageData(I,q,H,0,0,Y,ot),A.x+=q-M,A.y+=H-k}else for(const w of t){const A=p[w];f.fillText(w,A.x,A.y+A.anchorY)}const C=d?d.measure():h();return{baselineOffset:(C.ascent-C.descent)/2,xOffset:y,yOffsetMin:v,yOffsetMax:_,mapping:p,data:u,width:u.width,height:u.height}}_getKey(){const{fontFamily:t,fontWeight:e,fontSize:i,buffer:n,sdf:o,radius:r,cutoff:a}=this.props;return o?`${t} ${e} ${i} ${n} ${r} ${a}`:`${t} ${e} ${i} ${n}`}}function Td({fontSize:s,buffer:t,radius:e,cutoff:i,fontFamily:n,fontWeight:o}){const r=new cd({fontSize:s,buffer:t,radius:e,cutoff:i,fontFamily:n,fontWeight:`${o}`});return a=>{const{data:l,width:c,height:u}=r.draw(a),f=new ImageData(c,u);return bd(l,f),{data:f,left:t,top:t}}}const Qn=`layout(std140) uniform textBackgroundUniforms {
  bool billboard;
  float sizeScale;
  float sizeMinPixels;
  float sizeMaxPixels;
  vec4 borderRadius;
  vec4 padding;
  highp int sizeUnits;
  bool stroked;
} textBackground;
`,Ld={name:"textBackground",vs:Qn,fs:Qn,uniformTypes:{billboard:"f32",sizeScale:"f32",sizeMinPixels:"f32",sizeMaxPixels:"f32",borderRadius:"vec4<f32>",padding:"vec4<f32>",sizeUnits:"i32",stroked:"f32"}},Sd=`#version 300 es
#define SHADER_NAME text-background-layer-vertex-shader
in vec2 positions;
in vec3 instancePositions;
in vec3 instancePositions64Low;
in vec4 instanceRects;
in vec4 instanceClipRect;
in float instanceSizes;
in float instanceAngles;
in vec2 instancePixelOffsets;
in float instanceLineWidths;
in vec4 instanceFillColors;
in vec4 instanceLineColors;
in vec3 instancePickingColors;
out vec4 vFillColor;
out vec4 vLineColor;
out float vLineWidth;
out vec2 uv;
out vec2 dimensions;
vec2 rotate_by_angle(vec2 vertex, float angle) {
float angle_radian = radians(angle);
float cos_angle = cos(angle_radian);
float sin_angle = sin(angle_radian);
mat2 rotationMatrix = mat2(cos_angle, -sin_angle, sin_angle, cos_angle);
return rotationMatrix * vertex;
}
void main(void) {
geometry.worldPosition = instancePositions;
geometry.uv = positions;
geometry.pickingColor = instancePickingColors;
uv = positions;
vLineWidth = instanceLineWidths;
float sizePixels = clamp(
project_size_to_pixel(instanceSizes * textBackground.sizeScale, textBackground.sizeUnits),
textBackground.sizeMinPixels, textBackground.sizeMaxPixels
);
float instanceScale = sizePixels / text.fontSize;
dimensions = instanceRects.zw * instanceScale + textBackground.padding.xy + textBackground.padding.zw;
vec2 pixelOffset = (positions * instanceRects.zw + instanceRects.xy) * instanceScale + mix(-textBackground.padding.xy, textBackground.padding.zw, positions);
pixelOffset = rotate_by_angle(pixelOffset, instanceAngles);
pixelOffset += instancePixelOffsets;
pixelOffset.y *= -1.0;
vec2 xy = project_size_to_pixel(instanceClipRect.xy);
vec2 wh = project_size_to_pixel(instanceClipRect.zw);
if (text.flipY) {
xy.y = -xy.y - wh.y;
}
if (instanceClipRect.z >= 0.0) {
dimensions.x = wh.x;
pixelOffset.x = xy.x + uv.x * wh.x + mix(-textBackground.padding.x, textBackground.padding.z, uv.x);
}
if (instanceClipRect.w >= 0.0) {
dimensions.y = wh.y;
pixelOffset.y = xy.y + uv.y * wh.y + mix(-textBackground.padding.y, textBackground.padding.w, uv.y);
}
if (textBackground.billboard)  {
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0), geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
vec3 offset = vec3(pixelOffset, 0.0);
DECKGL_FILTER_SIZE(offset, geometry);
gl_Position.xy += project_pixel_size_to_clipspace(offset.xy);
} else {
vec3 offset_common = vec3(project_pixel_size(pixelOffset), 0.0);
if (text.flipY) {
offset_common.y *= -1.;
}
DECKGL_FILTER_SIZE(offset_common, geometry);
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset_common, geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
}
vFillColor = vec4(instanceFillColors.rgb, instanceFillColors.a * layer.opacity);
DECKGL_FILTER_COLOR(vFillColor, geometry);
vLineColor = vec4(instanceLineColors.rgb, instanceLineColors.a * layer.opacity);
DECKGL_FILTER_COLOR(vLineColor, geometry);
}
`,Ad=`#version 300 es
#define SHADER_NAME text-background-layer-fragment-shader
precision highp float;
in vec4 vFillColor;
in vec4 vLineColor;
in float vLineWidth;
in vec2 uv;
in vec2 dimensions;
out vec4 fragColor;
float round_rect(vec2 p, vec2 size, vec4 radii) {
vec2 pixelPositionCB = (p - 0.5) * size;
vec2 sizeCB = size * 0.5;
float maxBorderRadius = min(size.x, size.y) * 0.5;
vec4 borderRadius = vec4(min(radii, maxBorderRadius));
borderRadius.xy =
(pixelPositionCB.x > 0.0) ? borderRadius.xy : borderRadius.zw;
borderRadius.x = (pixelPositionCB.y > 0.0) ? borderRadius.x : borderRadius.y;
vec2 q = abs(pixelPositionCB) - sizeCB + borderRadius.x;
return -(min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - borderRadius.x);
}
float rect(vec2 p, vec2 size) {
vec2 pixelPosition = p * size;
return min(min(pixelPosition.x, size.x - pixelPosition.x),
min(pixelPosition.y, size.y - pixelPosition.y));
}
vec4 get_stroked_fragColor(float dist) {
float isBorder = smoothedge(dist, vLineWidth);
return mix(vFillColor, vLineColor, isBorder);
}
void main(void) {
geometry.uv = uv;
if (textBackground.borderRadius != vec4(0.0)) {
float distToEdge = round_rect(uv, dimensions, textBackground.borderRadius);
float shapeAlpha = smoothedge(-distToEdge, 0.0);
if (shapeAlpha == 0.0) {
discard;
}
if (textBackground.stroked) {
fragColor = get_stroked_fragColor(distToEdge);
} else {
fragColor = vFillColor;
}
fragColor.a *= shapeAlpha;
} else {
if (textBackground.stroked) {
float distToEdge = rect(uv, dimensions);
fragColor = get_stroked_fragColor(distToEdge);
} else {
fragColor = vFillColor;
}
}
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`,Ed={billboard:!0,sizeScale:1,sizeUnits:"pixels",sizeMinPixels:0,sizeMaxPixels:Number.MAX_SAFE_INTEGER,fontSize:1,borderRadius:{type:"object",value:0},padding:{type:"array",value:[0,0,0,0]},getPosition:{type:"accessor",value:s=>s.position},getSize:{type:"accessor",value:1},getAngle:{type:"accessor",value:0},getPixelOffset:{type:"accessor",value:[0,0]},getBoundingRect:{type:"accessor",value:[0,0,0,0]},getClipRect:{type:"accessor",value:[0,0,-1,-1]},getFillColor:{type:"accessor",value:[0,0,0,255]},getLineColor:{type:"accessor",value:[0,0,0,255]},getLineWidth:{type:"accessor",value:1}};class Ts extends bt{getShaders(){return super.getShaders({vs:Sd,fs:Ad,modules:[Kt,Yt,Ld,Vr]})}initializeState(){this.getAttributeManager().addInstanced({instancePositions:{size:3,type:"float64",fp64:this.use64bitPositions(),transition:!0,accessor:"getPosition"},instanceSizes:{size:1,transition:!0,accessor:"getSize",defaultValue:1},instanceAngles:{size:1,transition:!0,accessor:"getAngle"},instanceRects:{size:4,accessor:"getBoundingRect"},instanceClipRect:{size:4,accessor:"getClipRect",defaultValue:[0,0,-1,-1]},instancePixelOffsets:{size:2,transition:!0,accessor:"getPixelOffset"},instanceFillColors:{size:4,transition:!0,type:"unorm8",accessor:"getFillColor",defaultValue:[0,0,0,255]},instanceLineColors:{size:4,transition:!0,type:"unorm8",accessor:"getLineColor",defaultValue:[0,0,0,255]},instanceLineWidths:{size:1,transition:!0,accessor:"getLineWidth",defaultValue:1}})}updateState(t){super.updateState(t);const{changeFlags:e}=t;e.extensionsChanged&&(this.state.model?.destroy(),this.state.model=this._getModel(),this.getAttributeManager().invalidateAll())}draw({uniforms:t}){const{billboard:e,sizeScale:i,sizeUnits:n,sizeMinPixels:o,sizeMaxPixels:r,getLineWidth:a,fontSize:l}=this.props;let{padding:c,borderRadius:u}=this.props;c.length<4&&(c=[c[0],c[1],c[0],c[1]]),Array.isArray(u)||(u=[u,u,u,u]);const f=this.state.model,h={billboard:e,stroked:!!a,borderRadius:u,padding:c,sizeUnits:de[n],sizeScale:i,sizeMinPixels:o,sizeMaxPixels:r},d={fontSize:l,viewport:this.context.viewport};f.shaderInputs.setProps({textBackground:h,text:d}),f.draw(this.context.renderPass)}_getModel(){const t=[0,0,1,0,0,1,1,1];return new lt(this.context.device,{...this.getShaders(),id:this.props.id,bufferLayout:this.getAttributeManager().getBufferLayouts(),geometry:new _t({topology:"triangle-strip",vertexCount:4,attributes:{positions:{size:2,value:new Float32Array(t)}}}),isInstanced:!0})}}Ts.defaultProps=Ed;Ts.layerName="TextBackgroundLayer";const to={start:1,middle:0,end:-1},eo={top:1,center:0,bottom:-1},Oi=[0,0,0,255],Id=1,Md={billboard:!0,sizeScale:1,sizeUnits:"pixels",sizeMinPixels:0,sizeMaxPixels:Number.MAX_SAFE_INTEGER,background:!1,getBackgroundColor:{type:"accessor",value:[255,255,255,255]},getBorderColor:{type:"accessor",value:Oi},getBorderWidth:{type:"accessor",value:0},backgroundBorderRadius:{type:"object",value:0},backgroundPadding:{type:"array",value:[0,0,0,0]},characterSet:{type:"object",value:$t.characterSet},fontFamily:$t.fontFamily,fontWeight:$t.fontWeight,lineHeight:Id,outlineWidth:{type:"number",value:0,min:0},outlineColor:{type:"color",value:Oi},fontSettings:{type:"object",value:{},compare:1},wordBreak:"break-word",maxWidth:{type:"number",value:-1},contentCutoffPixels:{type:"array",value:[0,0]},contentAlignHorizontal:"none",contentAlignVertical:"none",getText:{type:"accessor",value:s=>s.text},getPosition:{type:"accessor",value:s=>s.position},getColor:{type:"accessor",value:Oi},getSize:{type:"accessor",value:32},getAngle:{type:"accessor",value:0},getTextAnchor:{type:"accessor",value:"middle"},getAlignmentBaseline:{type:"accessor",value:"center"},getPixelOffset:{type:"accessor",value:[0,0]},getContentBox:{type:"accessor",value:[0,0,-1,-1]},backgroundColor:{deprecatedFor:["background","getBackgroundColor"]}};class Ls extends It{constructor(){super(...arguments),this.getBoundingRect=(t,e)=>{const{size:[i,n]}=this.transformParagraph(t,e),{getTextAnchor:o,getAlignmentBaseline:r}=this.props,a=to[typeof o=="function"?o(t,e):o],l=eo[typeof r=="function"?r(t,e):r];return[(a-1)*i/2,(l-1)*n/2,i,n]},this.getIconOffsets=(t,e)=>{const{getTextAnchor:i,getAlignmentBaseline:n}=this.props,{x:o,y:r,rowWidth:a,size:[,l]}=this.transformParagraph(t,e),c=to[typeof i=="function"?i(t,e):i],u=eo[typeof n=="function"?n(t,e):n],f=o.length,h=new Array(f*2);let d=0;for(let p=0;p<f;p++)h[d++]=(c-1)*a[p]/2+o[p],h[d++]=(u-1)*l/2+r[p];return h}}initializeState(){this.state={styleVersion:0,fontAtlasManager:new Pd},this.props.maxWidth>0&&K.once(1,"v8.9 breaking change: TextLayer maxWidth is now relative to text size")()}updateState(t){const{props:e,oldProps:i,changeFlags:n}=t;(n.dataChanged||n.updateTriggersChanged&&(n.updateTriggersChanged.all||n.updateTriggersChanged.getText))&&this._updateText(),(this._updateFontAtlas()||e.lineHeight!==i.lineHeight||e.wordBreak!==i.wordBreak||e.maxWidth!==i.maxWidth)&&this.setState({styleVersion:this.state.styleVersion+1})}getPickingInfo({info:t}){return t.object=t.index>=0?this.props.data[t.index]:null,t}_updateFontAtlas(){const{fontSettings:t,fontFamily:e,fontWeight:i,_getFontRenderer:n}=this.props,{fontAtlasManager:o,characterSet:r}=this.state,a={...t,characterSet:r,fontFamily:e,fontWeight:i,_getFontRenderer:n};if(!o.mapping)return o.setProps(a),!0;for(const l in a)if(a[l]!==o.props[l])return o.setProps(a),!0;return!1}_updateText(){const{data:t,characterSet:e}=this.props,i=t.attributes?.getText;let{getText:n}=this.props,o=t.startIndices,r;const a=e==="auto"&&new Set;if(i&&o){const{texts:l,characterCount:c}=xd({...ArrayBuffer.isView(i)?{value:i}:i,length:t.length,startIndices:o,characterSet:a});r=c,n=(u,{index:f})=>l[f]}else{const{iterable:l,objectInfo:c}=kt(t);o=[0],r=0;for(const u of l){c.index++;const f=Array.from(n(u,c)||"");a&&f.forEach(a.add,a),r+=f.length,o.push(r)}}this.setState({getText:n,startIndices:o,numInstances:r,characterSet:a||e})}transformParagraph(t,e){const{fontAtlasManager:i}=this.state,n=i.mapping,{baselineOffset:o}=i.atlas,{fontSize:r}=i.props,a=this.state.getText,{wordBreak:l,lineHeight:c,maxWidth:u}=this.props,f=a(t,e)||"";return yd(f,o,c*r,l,u*r,n)}renderLayers(){const{startIndices:t,numInstances:e,getText:i,fontAtlasManager:{atlas:n,mapping:o},styleVersion:r}=this.state,{data:a,_dataDiff:l,getPosition:c,getColor:u,getSize:f,getAngle:h,getPixelOffset:d,getBackgroundColor:p,getBorderColor:g,getBorderWidth:y,getContentBox:v,backgroundBorderRadius:_,backgroundPadding:C,background:w,billboard:A,fontSettings:I,outlineWidth:z,outlineColor:F,sizeScale:M,sizeUnits:k,sizeMinPixels:q,sizeMaxPixels:H,contentCutoffPixels:Y,contentAlignHorizontal:ot,contentAlignVertical:X,transitions:m,updateTriggers:b}=this.props,x=this.getSubLayerClass("characters",ws),P=this.getSubLayerClass("background",Ts),{fontSize:T}=this.state.fontAtlasManager.props;return[w&&new P({getFillColor:p,getLineColor:g,getLineWidth:y,borderRadius:_,padding:C,getPosition:c,getSize:f,getAngle:h,getPixelOffset:d,getClipRect:v,billboard:A,sizeScale:M,sizeUnits:k,sizeMinPixels:q,sizeMaxPixels:H,fontSize:T,transitions:m&&{getPosition:m.getPosition,getAngle:m.getAngle,getSize:m.getSize,getFillColor:m.getBackgroundColor,getLineColor:m.getBorderColor,getLineWidth:m.getBorderWidth,getPixelOffset:m.getPixelOffset}},this.getSubLayerProps({id:"background",updateTriggers:{getPosition:b.getPosition,getAngle:b.getAngle,getSize:b.getSize,getFillColor:b.getBackgroundColor,getLineColor:b.getBorderColor,getLineWidth:b.getBorderWidth,getPixelOffset:b.getPixelOffset,getBoundingRect:{getText:b.getText,getTextAnchor:b.getTextAnchor,getAlignmentBaseline:b.getAlignmentBaseline,styleVersion:r}}}),{data:a.attributes&&a.attributes.background?{length:a.length,attributes:a.attributes.background}:a,_dataDiff:l,autoHighlight:!1,getBoundingRect:this.getBoundingRect}),new x({sdf:I.sdf,smoothing:Number.isFinite(I.smoothing)?I.smoothing:$t.smoothing,outlineWidth:z/(I.radius||$t.radius),outlineColor:F,iconAtlas:n,iconMapping:o,getPosition:c,getColor:u,getSize:f,getAngle:h,getPixelOffset:d,getContentBox:v,billboard:A,sizeScale:M,sizeUnits:k,sizeMinPixels:q,sizeMaxPixels:H,fontSize:T,contentCutoffPixels:Y,contentAlignHorizontal:ot,contentAlignVertical:X,transitions:m&&{getPosition:m.getPosition,getAngle:m.getAngle,getColor:m.getColor,getSize:m.getSize,getPixelOffset:m.getPixelOffset,getContentBox:m.getContentBox}},this.getSubLayerProps({id:"characters",updateTriggers:{all:b.getText,getPosition:b.getPosition,getAngle:b.getAngle,getColor:b.getColor,getSize:b.getSize,getPixelOffset:b.getPixelOffset,getContentBox:b.getContentBox,getIconOffsets:{getTextAnchor:b.getTextAnchor,getAlignmentBaseline:b.getAlignmentBaseline,styleVersion:r}}}),{data:a,_dataDiff:l,startIndices:t,numInstances:e,getIconOffsets:this.getIconOffsets,getIcon:i})]}static set fontAtlasCacheLimit(t){wd(t)}}Ls.defaultProps=Md;Ls.layerName="TextLayer";const Ye={circle:{type:bs,props:{filled:"filled",stroked:"stroked",lineWidthMaxPixels:"lineWidthMaxPixels",lineWidthMinPixels:"lineWidthMinPixels",lineWidthScale:"lineWidthScale",lineWidthUnits:"lineWidthUnits",pointRadiusMaxPixels:"radiusMaxPixels",pointRadiusMinPixels:"radiusMinPixels",pointRadiusScale:"radiusScale",pointRadiusUnits:"radiusUnits",pointAntialiasing:"antialiasing",pointBillboard:"billboard",getFillColor:"getFillColor",getLineColor:"getLineColor",getLineWidth:"getLineWidth",getPointRadius:"getRadius"}},icon:{type:ui,props:{iconAtlas:"iconAtlas",iconMapping:"iconMapping",iconSizeMaxPixels:"sizeMaxPixels",iconSizeMinPixels:"sizeMinPixels",iconSizeScale:"sizeScale",iconSizeUnits:"sizeUnits",iconAlphaCutoff:"alphaCutoff",iconBillboard:"billboard",getIcon:"getIcon",getIconAngle:"getAngle",getIconColor:"getColor",getIconPixelOffset:"getPixelOffset",getIconSize:"getSize"}},text:{type:Ls,props:{textSizeMaxPixels:"sizeMaxPixels",textSizeMinPixels:"sizeMinPixels",textSizeScale:"sizeScale",textSizeUnits:"sizeUnits",textBackground:"background",textBackgroundPadding:"backgroundPadding",textFontFamily:"fontFamily",textFontWeight:"fontWeight",textLineHeight:"lineHeight",textMaxWidth:"maxWidth",textOutlineColor:"outlineColor",textOutlineWidth:"outlineWidth",textWordBreak:"wordBreak",textCharacterSet:"characterSet",textBillboard:"billboard",textFontSettings:"fontSettings",getText:"getText",getTextAngle:"getAngle",getTextColor:"getColor",getTextPixelOffset:"getPixelOffset",getTextSize:"getSize",getTextAnchor:"getTextAnchor",getTextAlignmentBaseline:"getAlignmentBaseline",getTextBackgroundColor:"getBackgroundColor",getTextBorderColor:"getBorderColor",getTextBorderWidth:"getBorderWidth"}}},Ze={type:ye,props:{lineWidthUnits:"widthUnits",lineWidthScale:"widthScale",lineWidthMinPixels:"widthMinPixels",lineWidthMaxPixels:"widthMaxPixels",lineJointRounded:"jointRounded",lineCapRounded:"capRounded",lineMiterLimit:"miterLimit",lineBillboard:"billboard",getLineColor:"getColor",getLineWidth:"getWidth"}},ns={type:fi,props:{extruded:"extruded",filled:"filled",wireframe:"wireframe",elevationScale:"elevationScale",material:"material",_full3d:"_full3d",getElevation:"getElevation",getFillColor:"getFillColor",getLineColor:"getLineColor"}};function oe({type:s,props:t}){const e={};for(const i in t)e[i]=s.defaultProps[t[i]];return e}function Ri(s,t){const{transitions:e,updateTriggers:i}=s.props,n={updateTriggers:{},transitions:e&&{getPosition:e.geometry}};for(const o in t){const r=t[o];let a=s.props[o];o.startsWith("get")&&(a=s.getSubLayerAccessor(a),n.updateTriggers[r]=i[o],e&&(n.transitions[r]=e[o])),n[r]=a}return n}function Od(s){if(Array.isArray(s))return s;switch(K.assert(s.type,"GeoJSON does not have type"),s.type){case"Feature":return[s];case"FeatureCollection":return K.assert(Array.isArray(s.features),"GeoJSON does not have features array"),s.features;default:return[{geometry:s}]}}function io(s,t,e={}){const i={pointFeatures:[],lineFeatures:[],polygonFeatures:[],polygonOutlineFeatures:[]},{startRow:n=0,endRow:o=s.length}=e;for(let r=n;r<o;r++){const a=s[r],{geometry:l}=a;if(l)if(l.type==="GeometryCollection"){K.assert(Array.isArray(l.geometries),"GeoJSON does not have geometries array");const{geometries:c}=l;for(let u=0;u<c.length;u++){const f=c[u];so(f,i,t,a,r)}}else so(l,i,t,a,r)}return i}function so(s,t,e,i,n){const{type:o,coordinates:r}=s,{pointFeatures:a,lineFeatures:l,polygonFeatures:c,polygonOutlineFeatures:u}=t;if(!zd(o,r)){K.warn(`${o} coordinates are malformed`)();return}switch(o){case"Point":a.push(e({geometry:s},i,n));break;case"MultiPoint":r.forEach(f=>{a.push(e({geometry:{type:"Point",coordinates:f}},i,n))});break;case"LineString":l.push(e({geometry:s},i,n));break;case"MultiLineString":r.forEach(f=>{l.push(e({geometry:{type:"LineString",coordinates:f}},i,n))});break;case"Polygon":c.push(e({geometry:s},i,n)),r.forEach(f=>{u.push(e({geometry:{type:"LineString",coordinates:f}},i,n))});break;case"MultiPolygon":r.forEach(f=>{c.push(e({geometry:{type:"Polygon",coordinates:f}},i,n)),f.forEach(h=>{u.push(e({geometry:{type:"LineString",coordinates:h}},i,n))})});break}}const Rd={Point:1,MultiPoint:2,LineString:2,MultiLineString:3,Polygon:3,MultiPolygon:4};function zd(s,t){let e=Rd[s];for(K.assert(e,`Unknown GeoJSON type ${s}`);t&&--e>0;)t=t[0];return t&&Number.isFinite(t[0])}function Kr(){return{points:{},lines:{},polygons:{},polygonsOutline:{}}}function Ee(s){return s.geometry.coordinates}function Bd(s,t){const e=Kr(),{pointFeatures:i,lineFeatures:n,polygonFeatures:o,polygonOutlineFeatures:r}=s;return e.points.data=i,e.points._dataDiff=t.pointFeatures&&(()=>t.pointFeatures),e.points.getPosition=Ee,e.lines.data=n,e.lines._dataDiff=t.lineFeatures&&(()=>t.lineFeatures),e.lines.getPath=Ee,e.polygons.data=o,e.polygons._dataDiff=t.polygonFeatures&&(()=>t.polygonFeatures),e.polygons.getPolygon=Ee,e.polygonsOutline.data=r,e.polygonsOutline._dataDiff=t.polygonOutlineFeatures&&(()=>t.polygonOutlineFeatures),e.polygonsOutline.getPath=Ee,e}function Fd(s,t){const e=Kr(),{points:i,lines:n,polygons:o}=s,r=sd(s,t);e.points.data={length:i.positions.value.length/i.positions.size,attributes:{...i.attributes,getPosition:i.positions,instancePickingColors:{size:4,value:r.points}},properties:i.properties,numericProps:i.numericProps,featureIds:i.featureIds},e.lines.data={length:n.pathIndices.value.length-1,startIndices:n.pathIndices.value,attributes:{...n.attributes,getPath:n.positions,instancePickingColors:{size:4,value:r.lines}},properties:n.properties,numericProps:n.numericProps,featureIds:n.featureIds},e.lines._pathType="open";const a=o.positions.value.length/o.positions.size,l=Array(a).fill(1);for(const c of o.primitivePolygonIndices.value)l[c-1]=0;return e.polygons.data={length:o.polygonIndices.value.length-1,startIndices:o.polygonIndices.value,attributes:{...o.attributes,getPolygon:o.positions,instanceVertexValid:{size:1,value:new Uint16Array(l)},pickingColors:{size:4,value:r.polygons}},properties:o.properties,numericProps:o.numericProps,featureIds:o.featureIds},e.polygons._normalize=!1,o.triangles&&(e.polygons.data.attributes.indices=o.triangles.value),e.polygonsOutline.data={length:o.primitivePolygonIndices.value.length-1,startIndices:o.primitivePolygonIndices.value,attributes:{...o.attributes,getPath:o.positions,instancePickingColors:{size:4,value:r.polygons}},properties:o.properties,numericProps:o.numericProps,featureIds:o.featureIds},e.polygonsOutline._pathType="open",e}const kd=["points","linestrings","polygons"],Dd={...oe(Ye.circle),...oe(Ye.icon),...oe(Ye.text),...oe(Ze),...oe(ns),stroked:!0,filled:!0,extruded:!1,wireframe:!1,_full3d:!1,iconAtlas:{type:"object",value:null},iconMapping:{type:"object",value:{}},getIcon:{type:"accessor",value:s=>s.properties.icon},getText:{type:"accessor",value:s=>s.properties.text},pointType:"circle",getRadius:{deprecatedFor:"getPointRadius"}};class Ss extends It{initializeState(){this.state={layerProps:{},features:{},featuresDiff:{}}}updateState({props:t,changeFlags:e}){if(!e.dataChanged)return;const{data:i}=this.props,n=i&&"points"in i&&"polygons"in i&&"lines"in i;this.setState({binary:n}),n?this._updateStateBinary({props:t,changeFlags:e}):this._updateStateJSON({props:t,changeFlags:e})}_updateStateBinary({props:t,changeFlags:e}){const i=Fd(t.data,this.encodePickingColor);this.setState({layerProps:i})}_updateStateJSON({props:t,changeFlags:e}){const i=Od(t.data),n=this.getSubLayerRow.bind(this);let o={};const r={};if(Array.isArray(e.dataChanged)){const l=this.state.features;for(const c in l)o[c]=l[c].slice(),r[c]=[];for(const c of e.dataChanged){const u=io(i,n,c);for(const f in l)r[f].push(Gr({data:o[f],getIndex:h=>h.__source.index,dataRange:c,replace:u[f]}))}}else o=io(i,n);const a=Bd(o,r);this.setState({features:o,featuresDiff:r,layerProps:a})}getPickingInfo(t){const e=super.getPickingInfo(t),{index:i,sourceLayer:n}=e;return e.featureType=kd.find(o=>n.id.startsWith(`${this.id}-${o}-`)),i>=0&&n.id.startsWith(`${this.id}-points-text`)&&this.state.binary&&(e.index=this.props.data.points.globalFeatureIds.value[i]),e}_updateAutoHighlight(t){const e=`${this.id}-points-`,i=t.featureType==="points";for(const n of this.getSubLayers())n.id.startsWith(e)===i&&n.updateAutoHighlight(t)}_renderPolygonLayer(){const{extruded:t,wireframe:e}=this.props,{layerProps:i}=this.state,n="polygons-fill",o=this.shouldRenderSubLayer(n,i.polygons?.data)&&this.getSubLayerClass(n,ns.type);if(o){const r=Ri(this,ns.props),a=t&&e;return a||delete r.getLineColor,r.updateTriggers.lineColors=a,new o(r,this.getSubLayerProps({id:n,updateTriggers:r.updateTriggers}),i.polygons)}return null}_renderLineLayers(){const{extruded:t,stroked:e}=this.props,{layerProps:i}=this.state,n="polygons-stroke",o="linestrings",r=!t&&e&&this.shouldRenderSubLayer(n,i.polygonsOutline?.data)&&this.getSubLayerClass(n,Ze.type),a=this.shouldRenderSubLayer(o,i.lines?.data)&&this.getSubLayerClass(o,Ze.type);if(r||a){const l=Ri(this,Ze.props);return[r&&new r(l,this.getSubLayerProps({id:n,updateTriggers:l.updateTriggers}),i.polygonsOutline),a&&new a(l,this.getSubLayerProps({id:o,updateTriggers:l.updateTriggers}),i.lines)]}return null}_renderPointLayers(){const{pointType:t}=this.props,{layerProps:e,binary:i}=this.state;let{highlightedObjectIndex:n}=this.props;!i&&Number.isFinite(n)&&(n=e.points.data.findIndex(a=>a.__source.index===n));const o=new Set(t.split("+")),r=[];for(const a of o){const l=`points-${a}`,c=Ye[a],u=c&&this.shouldRenderSubLayer(l,e.points?.data)&&this.getSubLayerClass(l,c.type);if(u){const f=Ri(this,c.props);let h=e.points;if(a==="text"&&i){const{instancePickingColors:d,...p}=h.data.attributes;h={...h,data:{...h.data,attributes:p}}}r.push(new u(f,this.getSubLayerProps({id:l,updateTriggers:f.updateTriggers,highlightedObjectIndex:n}),h))}}return r}renderLayers(){const{extruded:t}=this.props,e=this._renderPolygonLayer(),i=this._renderLineLayers(),n=this._renderPointLayers();return[!t&&e,i,n,t&&e]}getSubLayerAccessor(t){const{binary:e}=this.state;return!e||typeof t!="function"?super.getSubLayerAccessor(t):(i,n)=>{const{data:o,index:r}=n,a=ed(o,r);return t(a,n)}}}Ss.layerName="GeoJsonLayer";Ss.defaultProps=Dd;class Nd{constructor(t){this.index=t,this.isVisible=!1,this.isSelected=!1,this.parent=null,this.children=[],this.content=null,this._loader=void 0,this._abortController=null,this._loaderId=0,this._isLoaded=!1,this._isCancelled=!1,this._needsReload=!1}get bbox(){return this._bbox}set bbox(t){this._bbox||(this._bbox=t,"west"in t?this.boundingBox=[[t.west,t.south],[t.east,t.north]]:this.boundingBox=[[t.left,t.top],[t.right,t.bottom]])}get data(){return this.isLoading&&this._loader?this._loader.then(()=>this.data):this.content}get isLoaded(){return this._isLoaded&&!this._needsReload}get isLoading(){return!!this._loader&&!this._isCancelled}get needsReload(){return this._needsReload||this._isCancelled}get byteLength(){const t=this.content?this.content.byteLength:0;return Number.isFinite(t)||console.error("byteLength not defined in tile data"),t}async _loadData({getData:t,requestScheduler:e,onLoad:i,onError:n}){const{index:o,id:r,bbox:a,userData:l,zoom:c}=this,u=this._loaderId;this._abortController=new AbortController;const{signal:f}=this._abortController,h=await e.scheduleRequest(this,g=>g.isSelected?1:-1);if(!h){this._isCancelled=!0;return}if(this._isCancelled){h.done();return}let d=null,p;try{d=await t({index:o,id:r,bbox:a,userData:l,zoom:c,signal:f})}catch(g){p=g||!0}finally{h.done()}if(u===this._loaderId){if(this._loader=void 0,this.content=d,this._isCancelled&&!d){this._isLoaded=!1;return}this._isLoaded=!0,this._isCancelled=!1,p?n(p,this):i(this)}}loadData(t){return this._isLoaded=!1,this._isCancelled=!1,this._needsReload=!1,this._loaderId++,this._loader=this._loadData(t),this._loader}setNeedsReload(){this.isLoading&&(this.abort(),this._loader=void 0),this._needsReload=!0}abort(){this.isLoaded||(this._isCancelled=!0,this._abortController?.abort())}}const et={OUTSIDE:-1,INTERSECTING:0,INSIDE:1},no=new O,Ud=new O;class As{constructor(t=[0,0,0],e=[0,0,0],i){i=i||no.copy(t).add(e).scale(.5),this.center=new O(i),this.halfDiagonal=new O(e).subtract(this.center),this.minimum=new O(t),this.maximum=new O(e)}clone(){return new As(this.minimum,this.maximum,this.center)}equals(t){return this===t||!!t&&this.minimum.equals(t.minimum)&&this.maximum.equals(t.maximum)}transform(t){return this.center.transformAsPoint(t),this.halfDiagonal.transform(t),this.minimum.transform(t),this.maximum.transform(t),this}intersectPlane(t){const{halfDiagonal:e}=this,i=Ud.from(t.normal),n=e.x*Math.abs(i.x)+e.y*Math.abs(i.y)+e.z*Math.abs(i.z),o=this.center.dot(i)+t.distance;return o-n>0?et.INSIDE:o+n<0?et.OUTSIDE:et.INTERSECTING}distanceTo(t){return Math.sqrt(this.distanceSquaredTo(t))}distanceSquaredTo(t){const e=no.from(t).subtract(this.center),{halfDiagonal:i}=this;let n=0,o;return o=Math.abs(e.x)-i.x,o>0&&(n+=o*o),o=Math.abs(e.y)-i.y,o>0&&(n+=o*o),o=Math.abs(e.z)-i.z,o>0&&(n+=o*o),n}}const re=new O,oo=new O;class Es{constructor(t=[0,0,0],e=0){this.radius=-0,this.center=new O,this.fromCenterRadius(t,e)}fromCenterRadius(t,e){return this.center.from(t),this.radius=e,this}fromCornerPoints(t,e){return e=re.from(e),this.center=new O().from(t).add(e).scale(.5),this.radius=this.center.distance(e),this}equals(t){return this===t||!!t&&this.center.equals(t.center)&&this.radius===t.radius}clone(){return new Es(this.center,this.radius)}union(t){const e=this.center,i=this.radius,n=t.center,o=t.radius,r=re.copy(n).subtract(e),a=r.magnitude();if(i>=a+o)return this.clone();if(o>=a+i)return t.clone();const l=(i+a+o)*.5;return oo.copy(r).scale((-i+l)/a).add(e),this.center.copy(oo),this.radius=l,this}expand(t){const i=re.from(t).subtract(this.center).magnitude();return i>this.radius&&(this.radius=i),this}transform(t){this.center.transform(t);const e=wl(re,t);return this.radius=Math.max(e[0],Math.max(e[1],e[2]))*this.radius,this}distanceSquaredTo(t){const e=this.distanceTo(t);return e*e}distanceTo(t){const i=re.from(t).subtract(this.center);return Math.max(0,i.len()-this.radius)}intersectPlane(t){const e=this.center,i=this.radius,o=t.normal.dot(e)+t.distance;return o<-i?et.OUTSIDE:o<i?et.INTERSECTING:et.INSIDE}}const Gd=new O,jd=new O,Ie=new O,Me=new O,Oe=new O,Vd=new O,$d=new O,mt={COLUMN0ROW0:0,COLUMN0ROW1:1,COLUMN0ROW2:2,COLUMN1ROW0:3,COLUMN1ROW1:4,COLUMN1ROW2:5,COLUMN2ROW0:6,COLUMN2ROW1:7,COLUMN2ROW2:8};class Is{constructor(t=[0,0,0],e=[0,0,0,0,0,0,0,0,0]){this.center=new O().from(t),this.halfAxes=new Q(e)}get halfSize(){const t=this.halfAxes.getColumn(0),e=this.halfAxes.getColumn(1),i=this.halfAxes.getColumn(2);return[new O(t).len(),new O(e).len(),new O(i).len()]}get quaternion(){const t=this.halfAxes.getColumn(0),e=this.halfAxes.getColumn(1),i=this.halfAxes.getColumn(2),n=new O(t).normalize(),o=new O(e).normalize(),r=new O(i).normalize();return new en().fromMatrix3(new Q([...n,...o,...r]))}fromCenterHalfSizeQuaternion(t,e,i){const n=new en(i),o=new Q().fromQuaternion(n);return o[0]=o[0]*e[0],o[1]=o[1]*e[0],o[2]=o[2]*e[0],o[3]=o[3]*e[1],o[4]=o[4]*e[1],o[5]=o[5]*e[1],o[6]=o[6]*e[2],o[7]=o[7]*e[2],o[8]=o[8]*e[2],this.center=new O().from(t),this.halfAxes=o,this}clone(){return new Is(this.center,this.halfAxes)}equals(t){return this===t||!!t&&this.center.equals(t.center)&&this.halfAxes.equals(t.halfAxes)}getBoundingSphere(t=new Es){const e=this.halfAxes,i=e.getColumn(0,Ie),n=e.getColumn(1,Me),o=e.getColumn(2,Oe),r=Gd.copy(i).add(n).add(o);return t.center.copy(this.center),t.radius=r.magnitude(),t}intersectPlane(t){const e=this.center,i=t.normal,n=this.halfAxes,o=i.x,r=i.y,a=i.z,l=Math.abs(o*n[mt.COLUMN0ROW0]+r*n[mt.COLUMN0ROW1]+a*n[mt.COLUMN0ROW2])+Math.abs(o*n[mt.COLUMN1ROW0]+r*n[mt.COLUMN1ROW1]+a*n[mt.COLUMN1ROW2])+Math.abs(o*n[mt.COLUMN2ROW0]+r*n[mt.COLUMN2ROW1]+a*n[mt.COLUMN2ROW2]),c=i.dot(e)+t.distance;return c<=-l?et.OUTSIDE:c>=l?et.INSIDE:et.INTERSECTING}distanceTo(t){return Math.sqrt(this.distanceSquaredTo(t))}distanceSquaredTo(t){const e=jd.from(t).subtract(this.center),i=this.halfAxes,n=i.getColumn(0,Ie),o=i.getColumn(1,Me),r=i.getColumn(2,Oe),a=n.magnitude(),l=o.magnitude(),c=r.magnitude();n.normalize(),o.normalize(),r.normalize();let u=0,f;return f=Math.abs(e.dot(n))-a,f>0&&(u+=f*f),f=Math.abs(e.dot(o))-l,f>0&&(u+=f*f),f=Math.abs(e.dot(r))-c,f>0&&(u+=f*f),u}computePlaneDistances(t,e,i=[-0,-0]){let n=Number.POSITIVE_INFINITY,o=Number.NEGATIVE_INFINITY;const r=this.center,a=this.halfAxes,l=a.getColumn(0,Ie),c=a.getColumn(1,Me),u=a.getColumn(2,Oe),f=Vd.copy(l).add(c).add(u).add(r),h=$d.copy(f).subtract(t);let d=e.dot(h);return n=Math.min(d,n),o=Math.max(d,o),f.copy(r).add(l).add(c).subtract(u),h.copy(f).subtract(t),d=e.dot(h),n=Math.min(d,n),o=Math.max(d,o),f.copy(r).add(l).subtract(c).add(u),h.copy(f).subtract(t),d=e.dot(h),n=Math.min(d,n),o=Math.max(d,o),f.copy(r).add(l).subtract(c).subtract(u),h.copy(f).subtract(t),d=e.dot(h),n=Math.min(d,n),o=Math.max(d,o),r.copy(f).subtract(l).add(c).add(u),h.copy(f).subtract(t),d=e.dot(h),n=Math.min(d,n),o=Math.max(d,o),r.copy(f).subtract(l).add(c).subtract(u),h.copy(f).subtract(t),d=e.dot(h),n=Math.min(d,n),o=Math.max(d,o),r.copy(f).subtract(l).subtract(c).add(u),h.copy(f).subtract(t),d=e.dot(h),n=Math.min(d,n),o=Math.max(d,o),r.copy(f).subtract(l).subtract(c).subtract(u),h.copy(f).subtract(t),d=e.dot(h),n=Math.min(d,n),o=Math.max(d,o),i[0]=n,i[1]=o,i}transform(t){this.center.transformAsPoint(t);const e=this.halfAxes.getColumn(0,Ie);e.transformAsPoint(t);const i=this.halfAxes.getColumn(1,Me);i.transformAsPoint(t);const n=this.halfAxes.getColumn(2,Oe);return n.transformAsPoint(t),this.halfAxes=new Q([...e,...i,...n]),this}getTransform(){throw new Error("not implemented")}}const ro=new O,ao=new O;class Ht{constructor(t=[0,0,1],e=0){this.normal=new O,this.distance=-0,this.fromNormalDistance(t,e)}fromNormalDistance(t,e){return Vi(Number.isFinite(e)),this.normal.from(t).normalize(),this.distance=e,this}fromPointNormal(t,e){t=ro.from(t),this.normal.from(e).normalize();const i=-this.normal.dot(t);return this.distance=i,this}fromCoefficients(t,e,i,n){return this.normal.set(t,e,i),Vi(Ve(this.normal.len(),1)),this.distance=n,this}clone(){return new Ht(this.normal,this.distance)}equals(t){return Ve(this.distance,t.distance)&&Ve(this.normal,t.normal)}getPointDistance(t){return this.normal.dot(t)+this.distance}transform(t){const e=ao.copy(this.normal).transformAsVector(t).normalize(),i=this.normal.scale(-this.distance).transform(t);return this.fromPointNormal(i,e)}projectPointOntoPlane(t,e=[0,0,0]){const i=ro.from(t),n=this.getPointDistance(i),o=ao.copy(this.normal).scale(n);return i.subtract(o).to(e)}}const lo=[new O([1,0,0]),new O([0,1,0]),new O([0,0,1])],co=new O,Wd=new O;class gt{constructor(t=[]){this.planes=t}fromBoundingSphere(t){this.planes.length=2*lo.length;const e=t.center,i=t.radius;let n=0;for(const o of lo){let r=this.planes[n],a=this.planes[n+1];r||(r=this.planes[n]=new Ht),a||(a=this.planes[n+1]=new Ht);const l=co.copy(o).scale(-i).add(e);r.fromPointNormal(l,o);const c=co.copy(o).scale(i).add(e),u=Wd.copy(o).negate();a.fromPointNormal(c,u),n+=2}return this}computeVisibility(t){let e=et.INSIDE;for(const i of this.planes)switch(t.intersectPlane(i)){case et.OUTSIDE:return et.OUTSIDE;case et.INTERSECTING:e=et.INTERSECTING;break}return e}computeVisibilityWithPlaneMask(t,e){if(Vi(Number.isFinite(e),"parentPlaneMask is required."),e===gt.MASK_OUTSIDE||e===gt.MASK_INSIDE)return e;let i=gt.MASK_INSIDE;const n=this.planes;for(let o=0;o<this.planes.length;++o){const r=o<31?1<<o:0;if(o<31&&(e&r)===0)continue;const a=n[o],l=t.intersectPlane(a);if(l===et.OUTSIDE)return gt.MASK_OUTSIDE;l===et.INTERSECTING&&(i|=r)}return i}}gt.MASK_OUTSIDE=4294967295;gt.MASK_INSIDE=0;gt.MASK_INDETERMINATE=2147483647;new O;new O;new O;new O;new O;new O;new O;new O;new O;new O;new O;new O;new O;new O;new O;new O;new O;const dt=new Q,qd=new Q,Hd=new Q,Re=new Q,uo=new Q;function Kd(s,t={}){const e=hc,i=10;let n=0,o=0;const r=qd,a=Hd;r.identity(),a.copy(s);const l=e*Yd(a);for(;o<i&&Zd(a)>l;)Xd(a,Re),uo.copy(Re).transpose(),a.multiplyRight(Re),a.multiplyLeft(uo),r.multiplyRight(Re),++n>2&&(++o,n=0);return t.unitary=r.toTarget(t.unitary),t.diagonal=a.toTarget(t.diagonal),t}function Yd(s){let t=0;for(let e=0;e<9;++e){const i=s[e];t+=i*i}return Math.sqrt(t)}const os=[1,0,0],rs=[2,2,1];function Zd(s){let t=0;for(let e=0;e<3;++e){const i=s[dt.getElementIndex(rs[e],os[e])];t+=2*i*i}return Math.sqrt(t)}function Xd(s,t){const e=fc;let i=0,n=1;for(let c=0;c<3;++c){const u=Math.abs(s[dt.getElementIndex(rs[c],os[c])]);u>i&&(n=c,i=u)}const o=os[n],r=rs[n];let a=1,l=0;if(Math.abs(s[dt.getElementIndex(r,o)])>e){const c=s[dt.getElementIndex(r,r)],u=s[dt.getElementIndex(o,o)],f=s[dt.getElementIndex(r,o)],h=(c-u)/2/f;let d;h<0?d=-1/(-h+Math.sqrt(1+h*h)):d=1/(h+Math.sqrt(1+h*h)),a=1/Math.sqrt(1+d*d),l=d*a}return Q.IDENTITY.to(t),t[dt.getElementIndex(o,o)]=t[dt.getElementIndex(r,r)]=a,t[dt.getElementIndex(r,o)]=l,t[dt.getElementIndex(o,r)]=-l,t}const wt=new O,Jd=new O,Qd=new O,tp=new O,ep=new O,ip=new Q,sp={diagonal:new Q,unitary:new Q};function Yr(s,t=new Is){if(!s||s.length===0)return t.halfAxes=new Q([0,0,0,0,0,0,0,0,0]),t.center=new O,t;const e=s.length,i=new O(0,0,0);for(const M of s)i.add(M);const n=1/e;i.multiplyByScalar(n);let o=0,r=0,a=0,l=0,c=0,u=0;for(const M of s){const k=wt.copy(M).subtract(i);o+=k.x*k.x,r+=k.x*k.y,a+=k.x*k.z,l+=k.y*k.y,c+=k.y*k.z,u+=k.z*k.z}o*=n,r*=n,a*=n,l*=n,c*=n,u*=n;const f=ip;f[0]=o,f[1]=r,f[2]=a,f[3]=r,f[4]=l,f[5]=c,f[6]=a,f[7]=c,f[8]=u;const{unitary:h}=Kd(f,sp),d=t.halfAxes.copy(h);let p=d.getColumn(0,Qd),g=d.getColumn(1,tp),y=d.getColumn(2,ep),v=-Number.MAX_VALUE,_=-Number.MAX_VALUE,C=-Number.MAX_VALUE,w=Number.MAX_VALUE,A=Number.MAX_VALUE,I=Number.MAX_VALUE;for(const M of s)wt.copy(M),v=Math.max(wt.dot(p),v),_=Math.max(wt.dot(g),_),C=Math.max(wt.dot(y),C),w=Math.min(wt.dot(p),w),A=Math.min(wt.dot(g),A),I=Math.min(wt.dot(y),I);p=p.multiplyByScalar(.5*(w+v)),g=g.multiplyByScalar(.5*(A+_)),y=y.multiplyByScalar(.5*(I+C)),t.center.copy(p).add(g).add(y);const z=Jd.set(v-w,_-A,C-I).multiplyByScalar(.5),F=new Q([z[0],0,0,0,z[1],0,0,0,z[2]]);return t.halfAxes.multiplyRight(F),t}const Gt=512,fo=3,Zr=[[.5,.5],[0,0],[0,1],[1,0],[1,1]],Xr=Zr.concat([[0,.5],[.5,0],[1,.5],[.5,1]]),np=Xr.concat([[.25,.5],[.75,.5]]);class jt{constructor(t,e,i){this.x=t,this.y=e,this.z=i}get children(){if(!this._children){const t=this.x*2,e=this.y*2,i=this.z+1;this._children=[new jt(t,e,i),new jt(t,e+1,i),new jt(t+1,e,i),new jt(t+1,e+1,i)]}return this._children}update(t){const{viewport:e,cullingVolume:i,elevationBounds:n,minZ:o,maxZ:r,bounds:a,offset:l,project:c}=t,u=this.getBoundingVolume(n,l,c);if(a&&!this.insideBounds(a)||i.computeVisibility(u)<0)return!1;if(!this.childVisible){let{z:h}=this;if(h<r&&h>=o){const d=u.distanceTo(e.cameraPosition)*e.scale/e.height;h+=Math.floor(Math.log2(d))}if(h>=r)return this.selected=!0,!0}this.selected=!1,this.childVisible=!0;for(const h of this.children)h.update(t);return!0}getSelected(t=[]){if(this.selected&&t.push(this),this._children)for(const e of this._children)e.getSelected(t);return t}insideBounds([t,e,i,n]){const o=Math.pow(2,this.z),r=Gt/o;return this.x*r<i&&this.y*r<n&&(this.x+1)*r>t&&(this.y+1)*r>e}getBoundingVolume(t,e,i){if(i){const l=this.z<1?np:this.z<2?Xr:Zr,c=[];for(const u of l){const f=ls(this.x+u[0],this.y+u[1],this.z);f[2]=t[0],c.push(i(f)),t[0]!==t[1]&&(f[2]=t[1],c.push(i(f)))}return Yr(c)}const n=Math.pow(2,this.z),o=Gt/n,r=this.x*o+e*Gt,a=Gt-(this.y+1)*o;return new As([r,a,t[0]],[r+o,a+o,t[1]])}}function op(s,t,e,i){const n=s instanceof Go&&s.resolution?s.projectPosition:null,o=Object.values(s.getFrustumPlanes()).map(({normal:d,distance:p})=>new Ht(d.clone().negate(),p)),r=new gt(o),a=s.distanceScales.unitsPerMeter[2],l=e&&e[0]*a||0,c=e&&e[1]*a||0,u=s instanceof Ui&&s.pitch<=60?t:0;if(i){const[d,p,g,y]=i,v=ti([d,y]),_=ti([g,p]);i=[v[0],Gt-v[1],_[0],Gt-_[1]]}const f=new jt(0,0,0),h={viewport:s,project:n,cullingVolume:r,elevationBounds:[l,c],minZ:u,maxZ:t,bounds:i,offset:0};if(f.update(h),s instanceof Ui&&s.subViewports&&s.subViewports.length>1){for(h.offset=-1;f.update(h)&&!(--h.offset<-fo););for(h.offset=1;f.update(h)&&!(++h.offset>fo););}return f.getSelected()}const vt=512,rp=[-1/0,-1/0,1/0,1/0],ap={equal:(s,t)=>{if(s===t)return!0;if(!Array.isArray(s)||!Array.isArray(t))return!1;const e=s.length;if(e!==t.length)return!1;for(let i=0;i<e;i++)if(s[i]!==t[i])return!1;return!0}};function Ms(s,t){const e=[t.transformAsPoint([s[0],s[1]]),t.transformAsPoint([s[2],s[1]]),t.transformAsPoint([s[0],s[3]]),t.transformAsPoint([s[2],s[3]])];return[Math.min(...e.map(n=>n[0])),Math.min(...e.map(n=>n[1])),Math.max(...e.map(n=>n[0])),Math.max(...e.map(n=>n[1]))]}function lp(s){return Math.abs(s.split("").reduce((t,e)=>(t<<5)-t+e.charCodeAt(0)|0,0))}function cp(s,t){if(!s||!s.length)return null;const{index:e,id:i}=t;if(Array.isArray(s)){const o=lp(i)%s.length;s=s[o]}let n=s;for(const o of Object.keys(e)){const r=new RegExp(`{${o}}`,"g");n=n.replace(r,String(e[o]))}return Number.isInteger(e.y)&&Number.isInteger(e.z)&&(n=n.replace(/\{-y\}/g,String(Math.pow(2,e.z)-e.y-1))),n}function up(s,t,e){let i;return i=s.getBounds(),s.isGeospatial?[Math.max(i[0],e[0]),Math.max(i[1],e[1]),Math.min(i[2],e[2]),Math.min(i[3],e[3])]:[Math.max(Math.min(i[0],e[2]),e[0]),Math.max(Math.min(i[1],e[3]),e[1]),Math.min(Math.max(i[2],e[0]),e[2]),Math.min(Math.max(i[3],e[1]),e[3])]}function fp({viewport:s,z:t,cullRect:e}){return(s.subViewports||[s]).map(n=>as(n,t||0,e))}function as(s,t,e){if(!Array.isArray(t)){const o=e.x-s.x,r=e.y-s.y,{width:a,height:l}=e,c={targetZ:t},u=s.unproject([o,r],c),f=s.unproject([o+a,r],c),h=s.unproject([o,r+l],c),d=s.unproject([o+a,r+l],c);return[Math.min(u[0],f[0],h[0],d[0]),Math.min(u[1],f[1],h[1],d[1]),Math.max(u[0],f[0],h[0],d[0]),Math.max(u[1],f[1],h[1],d[1])]}const i=as(s,t[0],e),n=as(s,t[1],e);return[Math.min(i[0],n[0]),Math.min(i[1],n[1]),Math.max(i[2],n[2]),Math.max(i[3],n[3])]}function hp(s,t,e){return e?Ms(s,e).map(n=>n*t/vt):s.map(i=>i*t/vt)}function Os(s,t){return Math.pow(2,s)*vt/t}function ls(s,t,e){const i=Os(e,vt),n=s/i*360-180,o=Math.PI-2*Math.PI*t/i,r=180/Math.PI*Math.atan(.5*(Math.exp(o)-Math.exp(-o)));return[n,r]}function ho(s,t,e,i){const n=Os(e,i);return[s/n*vt,t/n*vt]}function dp(s,t,e,i,n=vt){if(s.isGeospatial){const[c,u]=ls(t,e,i),[f,h]=ls(t+1,e+1,i);return{west:c,north:u,east:f,south:h}}const[o,r]=ho(t,e,i,n),[a,l]=ho(t+1,e+1,i,n);return{left:o,top:r,right:a,bottom:l}}function pp(s,t,e,i,n){const o=up(s,null,i),r=Os(t,e),[a,l,c,u]=hp(o,r,n),f=[];for(let h=Math.floor(a);h<c;h++)for(let d=Math.floor(l);d<u;d++)f.push({x:h,y:d,z:t});return f}function gp({viewport:s,maxZoom:t,minZoom:e,zRange:i,extent:n,tileSize:o=vt,modelMatrix:r,modelMatrixInverse:a,zoomOffset:l=0,visibleMinZoom:c,visibleMaxZoom:u}){let f=s.isGeospatial?Math.round(s.zoom+Math.log2(vt/o)+l):Math.ceil(s.zoom+l);if(typeof e=="number"&&Number.isFinite(e)&&f<e){if(!n)return[];f=e}if(typeof t=="number"&&Number.isFinite(t)&&f>t&&(f=t),c!=null&&s.zoom<c)return[];if(u!=null&&s.zoom>u)return[];let h=n;return r&&a&&n&&!s.isGeospatial&&(h=Ms(n,r)),s.isGeospatial?op(s,f,i,n):pp(s,f,o,h||rp,a)}function mp(s){let t={},e;return i=>{for(const n in i)if(!yp(i[n],t[n])){e=s(i),t=i;break}return e}}function yp(s,t){if(s===t)return!0;if(Array.isArray(s)){const e=s.length;if(!t||t.length!==e)return!1;for(let i=0;i<e;i++)if(s[i]!==t[i])return!1;return!0}return!1}const po=1,hi=2,xp="never",_p="no-overlap",Rs="best-available",vp=5,bp={[Rs]:wp,[_p]:Pp,[xp]:()=>{}},Cp={extent:null,tileSize:512,maxZoom:null,minZoom:null,maxCacheSize:null,maxCacheByteSize:null,refinementStrategy:"best-available",zRange:null,maxRequests:6,debounceTime:0,zoomOffset:0,visibleMinZoom:null,visibleMaxZoom:null,onTileLoad:()=>{},onTileUnload:()=>{},onTileError:()=>{}};class Jr{constructor(t){this._getCullBounds=mp(fp),this.opts={...Cp,...t},this.setOptions(this.opts),this.onTileLoad=e=>{this.opts.onTileLoad?.(e),this.opts.maxCacheByteSize!==null&&(this._cacheByteSize+=e.byteLength,this._resizeCache())},this._requestScheduler=new Ml({throttleRequests:this.opts.maxRequests>0||this.opts.debounceTime>0,maxRequests:this.opts.maxRequests,debounceTime:this.opts.debounceTime}),this._cache=new Map,this._tiles=[],this._dirty=!1,this._cacheByteSize=0,this._viewport=null,this._zRange=null,this._selectedTiles=null,this._frameNumber=0,this._modelMatrix=new Nt,this._modelMatrixInverse=new Nt}get tiles(){return this._tiles}get selectedTiles(){return this._selectedTiles}get isLoaded(){return this._selectedTiles!==null&&this._selectedTiles.every(t=>t.isLoaded)}get needsReload(){return this._selectedTiles!==null&&this._selectedTiles.some(t=>t.needsReload)}setOptions(t){Object.assign(this.opts,t),Number.isFinite(t.maxZoom)&&(this._maxZoom=Math.floor(t.maxZoom)),Number.isFinite(t.minZoom)&&(this._minZoom=Math.ceil(t.minZoom)),this._viewport=null}finalize(){for(const t of this._cache.values())t.isLoading&&t.abort();this._cache.clear(),this._tiles=[],this._selectedTiles=null}reloadAll(){for(const t of this._cache.keys()){const e=this._cache.get(t);!this._selectedTiles||!this._selectedTiles.includes(e)?this._cache.delete(t):e.setNeedsReload()}}update(t,{zRange:e,modelMatrix:i}={zRange:null,modelMatrix:null}){const n=i?new Nt(i):new Nt,o=!n.equals(this._modelMatrix);if(!this._viewport||!t.equals(this._viewport)||!Ve(this._zRange,e)||o){o&&(this._modelMatrixInverse=n.clone().invert(),this._modelMatrix=n),this._viewport=t,this._zRange=e;const a=this.getTileIndices({viewport:t,maxZoom:this._maxZoom,minZoom:this._minZoom,zRange:e,modelMatrix:this._modelMatrix,modelMatrixInverse:this._modelMatrixInverse});this._selectedTiles=a.map(l=>this._getTile(l,!0)),this._dirty&&this._rebuildTree()}else this.needsReload&&(this._selectedTiles=this._selectedTiles.map(a=>this._getTile(a.index,!0)));const r=this.updateTileStates();return this._pruneRequests(),this._dirty&&this._resizeCache(),r&&this._frameNumber++,this._frameNumber}isTileVisible(t,e,i){if(!t.isVisible)return!1;if(e&&this._viewport){const n=this._getCullBounds({viewport:this._viewport,z:this._zRange,cullRect:e});let{bbox:o}=t;for(const[r,a,l,c]of n){let u;if("west"in o)u=o.west<l&&o.east>r&&o.south<c&&o.north>a;else{if(i&&!Nt.IDENTITY.equals(i)){const[d,p,g,y]=Ms([o.left,o.top,o.right,o.bottom],i);o={left:d,top:p,right:g,bottom:y}}const f=Math.min(o.top,o.bottom),h=Math.max(o.top,o.bottom);u=o.left<l&&o.right>r&&f<c&&h>a}if(u)return!0}return!1}return!0}getTileIndices({viewport:t,maxZoom:e,minZoom:i,zRange:n,modelMatrix:o,modelMatrixInverse:r}){const{tileSize:a,extent:l,zoomOffset:c,visibleMinZoom:u,visibleMaxZoom:f}=this.opts;return gp({viewport:t,maxZoom:e,minZoom:i,zRange:n,tileSize:a,extent:l,modelMatrix:o,modelMatrixInverse:r,zoomOffset:c,visibleMinZoom:u,visibleMaxZoom:f})}getTileId(t){return`${t.x}-${t.y}-${t.z}`}getTileZoom(t){return t.z}getTileMetadata(t){const{tileSize:e}=this.opts;return{bbox:dp(this._viewport,t.x,t.y,t.z,e)}}getParentIndex(t){const e=Math.floor(t.x/2),i=Math.floor(t.y/2),n=t.z-1;return{x:e,y:i,z:n}}updateTileStates(){const t=this.opts.refinementStrategy||Rs,e=new Array(this._cache.size);let i=0;for(const n of this._cache.values())e[i++]=n.isVisible,n.isSelected=!1,n.isVisible=!1;for(const n of this._selectedTiles)n.isSelected=!0,n.isVisible=!0;(typeof t=="function"?t:bp[t])(Array.from(this._cache.values())),i=0;for(const n of this._cache.values())if(e[i++]!==n.isVisible)return!0;return!1}_pruneRequests(){const{maxRequests:t=0}=this.opts,e=[];let i=0;for(const n of this._cache.values())n.isLoading&&(i++,!n.isSelected&&!n.isVisible&&e.push(n));for(;t>0&&i>t&&e.length>0;)e.shift().abort(),i--}_rebuildTree(){const{_cache:t}=this;for(const e of t.values())e.parent=null,e.children&&(e.children.length=0);for(const e of t.values()){const i=this._getNearestAncestor(e);e.parent=i,i?.children&&i.children.push(e)}}_resizeCache(){const{_cache:t,opts:e}=this,i=e.maxCacheSize??(e.maxCacheByteSize!==null?1/0:vp*this.selectedTiles.length),n=e.maxCacheByteSize??1/0;if(t.size>i||this._cacheByteSize>n){for(const[r,a]of t)if(!a.isVisible&&!a.isSelected&&(this._cacheByteSize-=e.maxCacheByteSize!==null?a.byteLength:0,t.delete(r),this.opts.onTileUnload?.(a)),t.size<=i&&this._cacheByteSize<=n)break;this._rebuildTree(),this._dirty=!0}this._dirty&&(this._tiles=Array.from(this._cache.values()).sort((r,a)=>r.zoom-a.zoom),this._dirty=!1)}_getTile(t,e){const i=this.getTileId(t);let n=this._cache.get(i),o=!1;return!n&&e?(n=new Nd(t),Object.assign(n,this.getTileMetadata(n.index)),Object.assign(n,{id:i,zoom:this.getTileZoom(n.index)}),o=!0,this._cache.set(i,n),this._dirty=!0):n&&n.needsReload&&(o=!0),n&&o&&n.loadData({getData:this.opts.getTileData,requestScheduler:this._requestScheduler,onLoad:this.onTileLoad,onError:this.opts.onTileError}),n}_getNearestAncestor(t){const{_minZoom:e=0}=this;let i=t.index;for(;this.getTileZoom(i)>e;){i=this.getParentIndex(i);const n=this._getTile(i);if(n)return n}return null}}function wp(s){for(const t of s)t.state=0;for(const t of s)t.isSelected&&!Qr(t)&&zs(t);for(const t of s)t.isVisible=!!(t.state&hi)}function Pp(s){for(const e of s)e.state=0;for(const e of s)e.isSelected&&Qr(e);const t=Array.from(s).sort((e,i)=>e.zoom-i.zoom);for(const e of t)if(e.isVisible=!!(e.state&hi),e.children&&(e.isVisible||e.state&po))for(const i of e.children)i.state=po;else e.isSelected&&zs(e)}function Qr(s){let t=s;for(;t;){if(t.isLoaded||t.content)return t.state|=hi,!0;t=t.parent}return!1}function zs(s){for(const t of s.children)t.isLoaded||t.content?t.state|=hi:zs(t)}const Tp={TilesetClass:Jr,data:{type:"data",value:[]},dataComparator:ap.equal,renderSubLayers:{type:"function",value:s=>new Ss(s)},getTileData:{type:"function",optional:!0,value:null},onViewportLoad:{type:"function",optional:!0,value:null},onTileLoad:{type:"function",value:s=>{}},onTileUnload:{type:"function",value:s=>{}},onTileError:{type:"function",value:s=>console.error(s)},extent:{type:"array",optional:!0,value:null,compare:!0},tileSize:512,maxZoom:null,minZoom:0,maxCacheSize:null,maxCacheByteSize:null,refinementStrategy:Rs,zRange:null,maxRequests:6,debounceTime:0,zoomOffset:0,visibleMinZoom:null,visibleMaxZoom:null};class Bs extends It{initializeState(){this.state={tileset:null,isLoaded:!1}}finalizeState(){this.state?.tileset?.finalize()}get isLoaded(){return!!this.state?.tileset?.selectedTiles?.every(t=>t.isLoaded&&(!t.content||!t.layers||t.layers.every(e=>e.isLoaded)))}shouldUpdateState({changeFlags:t}){return t.somethingChanged}updateState({changeFlags:t}){let{tileset:e}=this.state;const i=t.propsOrDataChanged||t.updateTriggersChanged,n=t.dataChanged||t.updateTriggersChanged&&(t.updateTriggersChanged.all||t.updateTriggersChanged.getTileData);e?i&&(e.setOptions(this._getTilesetOptions()),n?e.reloadAll():e.tiles.forEach(o=>{o.layers=null})):(e=new this.props.TilesetClass(this._getTilesetOptions()),this.setState({tileset:e})),this._updateTileset()}_getTilesetOptions(){const{tileSize:t,maxCacheSize:e,maxCacheByteSize:i,refinementStrategy:n,extent:o,maxZoom:r,minZoom:a,maxRequests:l,debounceTime:c,zoomOffset:u,visibleMinZoom:f,visibleMaxZoom:h}=this.props;return{maxCacheSize:e,maxCacheByteSize:i,maxZoom:r,minZoom:a,tileSize:t,refinementStrategy:n,extent:o,maxRequests:l,debounceTime:c,zoomOffset:u,visibleMinZoom:f,visibleMaxZoom:h,getTileData:this.getTileData.bind(this),onTileLoad:this._onTileLoad.bind(this),onTileError:this._onTileError.bind(this),onTileUnload:this._onTileUnload.bind(this)}}_updateTileset(){const t=this.state.tileset,{zRange:e,modelMatrix:i}=this.props,n=t.update(this.context.viewport,{zRange:e,modelMatrix:i}),{isLoaded:o}=t,r=this.state.isLoaded!==o,a=this.state.frameNumber!==n;o&&(r||a)&&this._onViewportLoad(),a&&this.setState({frameNumber:n}),this.state.isLoaded=o}_onViewportLoad(){const{tileset:t}=this.state,{onViewportLoad:e}=this.props;e&&e(t.selectedTiles)}_onTileLoad(t){this.props.onTileLoad(t),t.layers=null,this.setNeedsUpdate()}_onTileError(t,e){this.props.onTileError(t),e.layers=null,this.setNeedsUpdate()}_onTileUnload(t){this.props.onTileUnload(t)}getTileData(t){const{data:e,getTileData:i,fetch:n}=this.props,{signal:o}=t;return t.url=typeof e=="string"||Array.isArray(e)?cp(e,t):null,i?i(t):n&&t.url?n(t.url,{propName:"data",layer:this,signal:o}):null}renderSubLayers(t){return this.props.renderSubLayers(t)}getSubLayerPropsByTile(t){return null}getPickingInfo(t){const e=t.sourceLayer,i=e.props.tile,n=t.info;return n.picked&&(n.tile=i),n.sourceTile=i,n.sourceTileSubLayer=e,n}_updateAutoHighlight(t){t.sourceTileSubLayer.updateAutoHighlight(t)}renderLayers(){const{visibleMinZoom:t,visibleMaxZoom:e,minZoom:i,extent:n}=this.props,o=this.context.viewport.zoom;if(t!=null&&o<t||e!=null&&o>e||i!=null&&!n&&o<i){for(const a of this.state.tileset.tiles)a.layers=null;return[]}return this.state.tileset.tiles.map(a=>{const l=this.getSubLayerPropsByTile(a);if(!(!a.isLoaded&&!a.content))if(a.layers)l&&a.layers[0]&&Object.keys(l).some(c=>a.layers[0].props[c]!==l[c])&&(a.layers=a.layers.map(c=>c.clone(l)));else{const c=this.renderSubLayers({...this.props,...this.getSubLayerProps({id:a.id,updateTriggers:this.props.updateTriggers}),data:a.content,_offset:0,tile:a});a.layers=Uo(c,Boolean).map(u=>u.clone({tile:a,...l}))}return a.layers})}filterSubLayer({layer:t,cullRect:e}){const{tile:i}=t.props,{modelMatrix:n}=this.props;return this.state.tileset.isTileVisible(i,e,n?new Nt(n):null)}}Bs.defaultProps=Tp;Bs.layerName="TileLayer";const zi=Math.PI/180,ze=new Float32Array(16),go=new Float32Array(12);function mo(s,t,e){const i=t[0]*zi,n=t[1]*zi,o=t[2]*zi,r=Math.sin(o),a=Math.sin(i),l=Math.sin(n),c=Math.cos(o),u=Math.cos(i),f=Math.cos(n),h=e[0],d=e[1],p=e[2];s[0]=h*f*u,s[1]=h*l*u,s[2]=h*-a,s[3]=d*(-l*c+f*a*r),s[4]=d*(f*c+l*a*r),s[5]=d*u*r,s[6]=p*(l*r+f*a*c),s[7]=p*(-f*r+l*a*c),s[8]=p*u*c}function yo(s){return s[0]=s[0],s[1]=s[1],s[2]=s[2],s[3]=s[4],s[4]=s[5],s[5]=s[6],s[6]=s[8],s[7]=s[9],s[8]=s[10],s[9]=s[12],s[10]=s[13],s[11]=s[14],s.subarray(0,12)}const Lp={size:12,accessor:["getOrientation","getScale","getTranslation","getTransformMatrix"],shaderAttributes:{instanceModelMatrixCol0:{size:3,elementOffset:0},instanceModelMatrixCol1:{size:3,elementOffset:3},instanceModelMatrixCol2:{size:3,elementOffset:6},instanceTranslation:{size:3,elementOffset:9}},update(s,{startRow:t,endRow:e}){const{data:i,getOrientation:n,getScale:o,getTranslation:r,getTransformMatrix:a}=this.props,l=Array.isArray(a),c=l&&a.length===16,u=Array.isArray(o),f=Array.isArray(n),h=Array.isArray(r),d=c||!l&&!!a(i[0]);d?s.constant=c:s.constant=f&&u&&h;const p=s.value;if(s.constant){let g;d?(ze.set(a),g=yo(ze)):(g=go,mo(g,n,o),g.set(r,9)),s.value=new Float32Array(g)}else{let g=t*s.size;const{iterable:y,objectInfo:v}=kt(i,t,e);for(const _ of y){v.index++;let C;if(d)ze.set(c?a:a(_,v)),C=yo(ze);else{C=go;const w=f?n:n(_,v),A=u?o:o(_,v);mo(C,w,A),C.set(h?r:r(_,v),9)}p[g++]=C[0],p[g++]=C[1],p[g++]=C[2],p[g++]=C[3],p[g++]=C[4],p[g++]=C[5],p[g++]=C[6],p[g++]=C[7],p[g++]=C[8],p[g++]=C[9],p[g++]=C[10],p[g++]=C[11]}}}};function Sp(s,t){return t==="cartesian"||t==="meter-offsets"||t==="default"&&!s.isGeospatial}const xo=`layout(std140) uniform simpleMeshUniforms {
  float sizeScale;
  bool composeModelMatrix;
  bool hasTexture;
  bool flatShading;
} simpleMesh;
`,Ap={name:"simpleMesh",vs:xo,fs:xo,uniformTypes:{sizeScale:"f32",composeModelMatrix:"f32",hasTexture:"f32",flatShading:"f32"}},Ep=`#version 300 es
#define SHADER_NAME simple-mesh-layer-vs
in vec3 positions;
in vec3 normals;
in vec3 colors;
in vec2 texCoords;
in vec3 instancePositions;
in vec3 instancePositions64Low;
in vec4 instanceColors;
in vec3 instancePickingColors;
in vec3 instanceModelMatrixCol0;
in vec3 instanceModelMatrixCol1;
in vec3 instanceModelMatrixCol2;
in vec3 instanceTranslation;
out vec2 vTexCoord;
out vec3 cameraPosition;
out vec3 normals_commonspace;
out vec4 position_commonspace;
out vec4 vColor;
void main(void) {
geometry.worldPosition = instancePositions;
geometry.uv = texCoords;
geometry.pickingColor = instancePickingColors;
vTexCoord = texCoords;
cameraPosition = project.cameraPosition;
vColor = vec4(colors * instanceColors.rgb, instanceColors.a);
mat3 instanceModelMatrix = mat3(instanceModelMatrixCol0, instanceModelMatrixCol1, instanceModelMatrixCol2);
vec3 pos = (instanceModelMatrix * positions) * simpleMesh.sizeScale + instanceTranslation;
if (simpleMesh.composeModelMatrix) {
DECKGL_FILTER_SIZE(pos, geometry);
normals_commonspace = project_normal(instanceModelMatrix * normals);
geometry.worldPosition += pos;
gl_Position = project_position_to_clipspace(pos + instancePositions, instancePositions64Low, vec3(0.0), position_commonspace);
geometry.position = position_commonspace;
}
else {
pos = project_size(pos);
DECKGL_FILTER_SIZE(pos, geometry);
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, pos, position_commonspace);
geometry.position = position_commonspace;
normals_commonspace = project_normal(instanceModelMatrix * normals);
}
geometry.normal = normals_commonspace;
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
DECKGL_FILTER_COLOR(vColor, geometry);
}
`,Ip=`#version 300 es
#define SHADER_NAME simple-mesh-layer-fs
precision highp float;
uniform sampler2D sampler;
in vec2 vTexCoord;
in vec3 cameraPosition;
in vec3 normals_commonspace;
in vec4 position_commonspace;
in vec4 vColor;
out vec4 fragColor;
void main(void) {
geometry.uv = vTexCoord;
vec3 normal;
if (simpleMesh.flatShading) {
normal = normalize(cross(dFdx(position_commonspace.xyz), dFdy(position_commonspace.xyz)));
} else {
normal = normals_commonspace;
}
vec4 color = simpleMesh.hasTexture ? texture(sampler, vTexCoord) : vColor;
DECKGL_FILTER_COLOR(color, geometry);
vec3 lightColor = lighting_getLightColor(color.rgb, cameraPosition, position_commonspace.xyz, normal);
fragColor = vec4(lightColor, color.a * layer.opacity);
}
`;function Mp(s){let t=1/0,e=1/0,i=1/0,n=-1/0,o=-1/0,r=-1/0;const a=s.POSITION?s.POSITION.value:[],l=a&&a.length;for(let c=0;c<l;c+=3){const u=a[c],f=a[c+1],h=a[c+2];t=u<t?u:t,e=f<e?f:e,i=h<i?h:i,n=u>n?u:n,o=f>o?f:o,r=h>r?h:r}return[[t,e,i],[n,o,r]]}function Bi(s){const t=s.positions||s.POSITION;K.assert(t,'no "postions" or "POSITION" attribute in mesh');const e=t.value.length/t.size;let i=s.COLOR_0||s.colors;i||(i={size:3,value:new Float32Array(e*3).fill(1)});let n=s.NORMAL||s.normals;n||(n={size:3,value:new Float32Array(e*3).fill(0)});let o=s.TEXCOORD_0||s.texCoords;return o||(o={size:2,value:new Float32Array(e*2).fill(0)}),{positions:t,colors:i,normals:n,texCoords:o}}function _o(s){return s instanceof _t?(s.attributes=Bi(s.attributes),s):s.attributes?new _t({...s,topology:"triangle-list",attributes:Bi(s.attributes)}):new _t({topology:"triangle-list",attributes:Bi(s)})}const Op=[0,0,0,255],Rp={mesh:{type:"object",value:null,async:!0},texture:{type:"image",value:null,async:!0},sizeScale:{type:"number",value:1,min:0},_instanced:!0,wireframe:!1,material:!0,getPosition:{type:"accessor",value:s=>s.position},getColor:{type:"accessor",value:Op},getOrientation:{type:"accessor",value:[0,0,0]},getScale:{type:"accessor",value:[1,1,1]},getTranslation:{type:"accessor",value:[0,0,0]},getTransformMatrix:{type:"accessor",value:[]},textureParameters:{type:"object",ignore:!0,value:null}};class ri extends bt{getShaders(){return super.getShaders({vs:Ep,fs:Ip,modules:[Kt,or,Yt,Ap]})}getBounds(){if(this.props._instanced)return super.getBounds();let t=this.state.positionBounds;if(t)return t;const{mesh:e}=this.props;if(!e)return null;if(t=e.header?.boundingBox,!t){const{attributes:i}=_o(e);i.POSITION=i.POSITION||i.positions,t=Mp(i)}return this.state.positionBounds=t,t}initializeState(){this.getAttributeManager().addInstanced({instancePositions:{transition:!0,type:"float64",fp64:this.use64bitPositions(),size:3,accessor:"getPosition"},instanceColors:{type:"unorm8",transition:!0,size:this.props.colorFormat.length,accessor:"getColor",defaultValue:[0,0,0,255]},instanceModelMatrix:Lp}),this.setState({emptyTexture:this.context.device.createTexture({data:new Uint8Array(4),width:1,height:1})})}updateState(t){super.updateState(t);const{props:e,oldProps:i,changeFlags:n}=t;if(e.mesh!==i.mesh||n.extensionsChanged){if(this.state.positionBounds=null,this.state.model?.destroy(),e.mesh){this.state.model=this.getModel(e.mesh);const o=e.mesh.attributes||e.mesh;this.setState({hasNormals:!!(o.NORMAL||o.normals)})}this.getAttributeManager().invalidateAll()}e.texture!==i.texture&&e.texture instanceof it&&this.setTexture(e.texture),this.state.model&&this.state.model.setTopology(this.props.wireframe?"line-strip":"triangle-list")}finalizeState(t){super.finalizeState(t),this.state.emptyTexture.delete()}draw({uniforms:t}){const{model:e}=this.state;if(!e)return;const{viewport:i,renderPass:n}=this.context,{sizeScale:o,coordinateSystem:r,_instanced:a}=this.props,l={sizeScale:o,composeModelMatrix:!a||Sp(i,r),flatShading:!this.state.hasNormals};e.shaderInputs.setProps({simpleMesh:l}),e.draw(n)}get isLoaded(){return!!(this.state?.model&&super.isLoaded)}getModel(t){const e=new lt(this.context.device,{...this.getShaders(),id:this.props.id,bufferLayout:this.getAttributeManager().getBufferLayouts(),geometry:_o(t),isInstanced:!0}),{texture:i}=this.props,{emptyTexture:n}=this.state,o={sampler:i||n,hasTexture:!!i};return e.shaderInputs.setProps({simpleMesh:o}),e}setTexture(t){const{emptyTexture:e,model:i}=this.state;if(i){const n={sampler:t||e,hasTexture:!!t};i.shaderInputs.setProps({simpleMesh:n})}}}ri.defaultProps=Rp;ri.layerName="SimpleMeshLayer";const zp=[[1/3,1/3,1/3],[.5,.5,0],[.5,0,.5],[0,.5,.5]],Bp=.125;class Fp{reprojectors;width;height;uvs;exactOutputPositions;triangles;_halfedges;_candidatesUV;_queueIndices;_queue;_errors;_pending;_pendingLen;constructor(t,e,i=e){this.reprojectors=t,this.width=e,this.height=i,this.uvs=[],this.exactOutputPositions=[],this.triangles=[],this._halfedges=[],this._candidatesUV=[],this._queueIndices=[],this._queue=[],this._errors=[],this._pending=[],this._pendingLen=0;const n=1,o=1,r=this._addPoint(0,0),a=this._addPoint(n,0),l=this._addPoint(0,o),c=this._addPoint(n,o),u=this._addTriangle(c,r,l,-1,-1,-1);this._addTriangle(r,c,a,u,-1,-1),this._flush()}run(t=Bp){if(t<=0)throw new Error("maxError must be positive");for(;this.getMaxError()>t;)this.refine()}refine(){this._step(),this._flush()}getMaxError(){return this._errors[0]}_flush(){for(let t=0;t<this._pendingLen;t++){const e=this._pending[t];this._findReprojectionCandidate(e)}this._pendingLen=0}_findReprojectionCandidate(t){const e=2*this.triangles[t*3+0],i=2*this.triangles[t*3+1],n=2*this.triangles[t*3+2],o=this.uvs[e],r=this.uvs[e+1],a=this.uvs[i],l=this.uvs[i+1],c=this.uvs[n],u=this.uvs[n+1],f=this.exactOutputPositions[e],h=this.exactOutputPositions[e+1],d=this.exactOutputPositions[i],p=this.exactOutputPositions[i+1],g=this.exactOutputPositions[n],y=this.exactOutputPositions[n+1];let v=0,_=0,C=0;for(const w of zp){const A=Be(o,a,c,w[0],w[1],w[2]),I=Be(r,l,u,w[0],w[1],w[2]),z=Be(f,d,g,w[0],w[1],w[2]),F=Be(h,p,y,w[0],w[1],w[2]),M=A*(this.width-1),k=I*(this.height-1),q=this.reprojectors.inverseReproject(z,F),H=this.reprojectors.inverseTransform(q[0],q[1]),Y=M-H[0],ot=k-H[1],X=Math.hypot(Y,ot);X>v&&(v=X,_=A,C=I)}(_===o&&C===r||_===a&&C===l||_===c&&C===u)&&(v=0),this._candidatesUV[2*t]=_,this._candidatesUV[2*t+1]=C,this._queuePush(t,v)}_step(){const t=this._queuePop(),e=t*3+0,i=t*3+1,n=t*3+2,o=this.triangles[e],r=this.triangles[i],a=this.triangles[n],l=this.uvs[2*o],c=this.uvs[2*o+1],u=this.uvs[2*r],f=this.uvs[2*r+1],h=this.uvs[2*a],d=this.uvs[2*a+1],p=this._candidatesUV[2*t],g=this._candidatesUV[2*t+1],y=this._addPoint(p,g);if(Fi(l,c,u,f,p,g)===0)this._handleCollinear(y,e);else if(Fi(u,f,h,d,p,g)===0)this._handleCollinear(y,i);else if(Fi(h,d,l,c,p,g)===0)this._handleCollinear(y,n);else{const v=this._halfedges[e],_=this._halfedges[i],C=this._halfedges[n],w=this._addTriangle(o,r,y,v,-1,-1,e),A=this._addTriangle(r,a,y,_,-1,w+1),I=this._addTriangle(a,o,y,C,w+2,A+1);this._legalize(w),this._legalize(A),this._legalize(I)}}_addPoint(t,e){const i=this.uvs.length>>1;this.uvs.push(t,e);const n=t*(this.width-1),o=e*(this.height-1),r=this.reprojectors.forwardTransform(n,o),a=this.reprojectors.forwardReproject(r[0],r[1]);return this.exactOutputPositions.push(a[0],a[1]),i}_addTriangle(t,e,i,n,o,r,a=this.triangles.length){const l=a/3;return this.triangles[a+0]=t,this.triangles[a+1]=e,this.triangles[a+2]=i,this._halfedges[a+0]=n,this._halfedges[a+1]=o,this._halfedges[a+2]=r,n>=0&&(this._halfedges[n]=a+0),o>=0&&(this._halfedges[o]=a+1),r>=0&&(this._halfedges[r]=a+2),this._candidatesUV[2*l+0]=0,this._candidatesUV[2*l+1]=0,this._queueIndices[l]=-1,this._pending[this._pendingLen++]=l,a}_legalize(t){const e=this._halfedges[t];if(e<0)return;const i=t-t%3,n=e-e%3,o=i+(t+1)%3,r=i+(t+2)%3,a=n+(e+2)%3,l=n+(e+1)%3,c=this.triangles[r],u=this.triangles[t],f=this.triangles[o],h=this.triangles[a],d=this.uvs;if(!kp(d[2*c],d[2*c+1],d[2*u],d[2*u+1],d[2*f],d[2*f+1],d[2*h],d[2*h+1]))return;const p=this._halfedges[o],g=this._halfedges[r],y=this._halfedges[a],v=this._halfedges[l];this._queueRemove(i/3),this._queueRemove(n/3);const _=this._addTriangle(c,h,f,-1,y,p,i),C=this._addTriangle(h,c,u,_,g,v,n);this._legalize(_+1),this._legalize(C+2)}_handleCollinear(t,e){const i=e-e%3,n=i+(e+1)%3,o=i+(e+2)%3,r=this.triangles[o],a=this.triangles[e],l=this.triangles[n],c=this._halfedges[n],u=this._halfedges[o],f=this._halfedges[e];if(f<0){const I=this._addTriangle(t,r,a,-1,u,-1,i),z=this._addTriangle(r,t,l,I,-1,c);this._legalize(I+1),this._legalize(z+2);return}const h=f-f%3,d=h+(f+2)%3,p=h+(f+1)%3,g=this.triangles[d],y=this._halfedges[d],v=this._halfedges[p];this._queueRemove(h/3);const _=this._addTriangle(r,a,t,u,-1,-1,i),C=this._addTriangle(a,g,t,v,-1,_+1,h),w=this._addTriangle(g,l,t,y,-1,C+1),A=this._addTriangle(l,r,t,c,_+2,w+1);this._legalize(_),this._legalize(C),this._legalize(w),this._legalize(A)}_queuePush(t,e){const i=this._queue.length;this._queueIndices[t]=i,this._queue.push(t),this._errors.push(e),this._queueUp(i)}_queuePop(){const t=this._queue.length-1;return this._queueSwap(0,t),this._queueDown(0,t),this._queuePopBack()}_queuePopBack(){const t=this._queue.pop();return this._errors.pop(),this._queueIndices[t]=-1,t}_queueRemove(t){const e=this._queueIndices[t];if(e<0){const n=this._pending.indexOf(t);if(n!==-1)this._pending[n]=this._pending[--this._pendingLen];else throw new Error("Broken triangulation (something went wrong).");return}const i=this._queue.length-1;i!==e&&(this._queueSwap(e,i),this._queueDown(e,i)||this._queueUp(e)),this._queuePopBack()}_queueLess(t,e){return this._errors[t]>this._errors[e]}_queueSwap(t,e){const i=this._queue[t],n=this._queue[e];this._queue[t]=n,this._queue[e]=i,this._queueIndices[i]=e,this._queueIndices[n]=t;const o=this._errors[t];this._errors[t]=this._errors[e],this._errors[e]=o}_queueUp(t){let e=t;for(;;){const i=e-1>>1;if(i===e||!this._queueLess(e,i))break;this._queueSwap(i,e),e=i}}_queueDown(t,e){let i=t;for(;;){const n=2*i+1;if(n>=e||n<0)break;const o=n+1;let r=n;if(o<e&&this._queueLess(o,n)&&(r=o),!this._queueLess(r,i))break;this._queueSwap(i,r),i=r}return i>t}}function Fi(s,t,e,i,n,o){return(e-n)*(t-o)-(i-o)*(s-n)}function kp(s,t,e,i,n,o,r,a){const l=s-r,c=t-a,u=e-r,f=i-a,h=n-r,d=o-a,p=l*l+c*c,g=u*u+f*f,y=h*h+d*d;return l*(f*y-g*d)-c*(u*y-g*h)+p*(u*d-f*h)<0}function Be(s,t,e,i,n,o){return i*s+n*t+o*e}const ta={name:"create-texture-unorm",inject:{"fs:#decl":"uniform sampler2D textureName;","fs:DECKGL_FILTER_COLOR":`
      color = texture(textureName, geometry.uv);
    `},getUniforms:s=>({textureName:s.textureName})},Dp=`#version 300 es
#define SHADER_NAME simple-mesh-layer-fs

precision highp float;

in vec2 vTexCoord;
in vec3 cameraPosition;
in vec3 normals_commonspace;
in vec4 position_commonspace;
in vec4 vColor;

out vec4 fragColor;

void main(void) {
  geometry.uv = vTexCoord;

  vec3 normal;
  if (simpleMesh.flatShading) {

  normal = normalize(cross(dFdx(position_commonspace.xyz), dFdy(position_commonspace.xyz)));
  } else {
    normal = normals_commonspace;
  }

  // We initialize color here before passing into DECKGL_FILTER_COLOR
  vec4 color;
  DECKGL_FILTER_COLOR(color, geometry);

  vec3 lightColor = lighting_getLightColor(color.rgb, cameraPosition, position_commonspace.xyz, normal);
  fragColor = vec4(lightColor, color.a * layer.opacity);
}
`;class Np extends ri{static layerName="mesh-texture-layer";static defaultProps=ri.defaultProps;getShaders(){const t=super.getShaders(),e=t.modules;for(const i of this.props.renderPipeline)e.push(i.module);return{...t,fs:Dp,modules:e}}draw(t){const e={};for(const i of this.props.renderPipeline)e[i.module.name]=i.props||{};for(const i of super.getModels())i.shaderInputs.setProps(e);super.draw(t)}}const Up=.125,vo=[[252,73,163],[255,51,204],[204,102,255],[153,51,255],[102,204,255],[51,153,255],[102,255,204],[51,255,170],[0,255,0],[51,204,51],[255,204,102],[255,179,71],[255,102,102],[255,80,80],[255,0,0],[204,0,0],[255,128,0],[255,153,51],[255,255,102],[255,255,51],[0,255,255],[0,204,255]],Gp={debug:!1,debugOpacity:.5};class ea extends It{static layerName="RasterLayer";static defaultProps=Gp;initializeState(){this.setState({})}updateState(t){super.updateState(t);const{props:e,oldProps:i,changeFlags:n}=t;(n.dataChanged||e.width!==i.width||e.height!==i.height||e.reprojectionFns!==i.reprojectionFns||e.maxError!==i.maxError)&&this._generateMesh()}_generateMesh(){const{width:t,height:e,reprojectionFns:i,maxError:n=Up}=this.props,o=new Fp(i,t+1,e+1);o.run(n);const{indices:r,positions:a,texCoords:l}=jp(o);this.setState({reprojector:o,mesh:{positions:a,indices:r,texCoords:l}})}renderDebugLayer(){const{reprojector:t}=this.state,{debugOpacity:e}=this.props;return t?new Cs(this.getSubLayerProps({id:"polygon",data:{reprojector:t,length:t.triangles.length/3},getPolygon:(i,{index:n,data:o})=>{const r=o.reprojector.triangles,a=t.exactOutputPositions,l=r[n*3],c=r[n*3+1],u=r[n*3+2];return[[a[l*2],a[l*2+1]],[a[c*2],a[c*2+1]],[a[u*2],a[u*2+1]],[a[l*2],a[l*2+1]]]},getFillColor:(i,{index:n,target:o})=>{const r=vo[n%vo.length];return o[0]=r[0],o[1]=r[1],o[2]=r[2],o[3]=255,o},getLineColor:[0,0,0],getLineWidth:1,lineWidthUnits:"pixels",opacity:e!==void 0&&Number.isFinite(e)?Math.max(0,Math.min(1,e)):1,pickable:!1})):null}_createRenderPipeline(){if(this.props.renderPipeline instanceof ImageData){const t=this.props.renderPipeline,e=this.context.device.createTexture({format:"rgba8unorm",width:t.width,height:t.height,data:t.data});return[{module:ta,props:{textureName:e}}]}else return this.props.renderPipeline}renderLayers(){const{mesh:t}=this.state,{debug:e}=this.props;if(!t)return null;const{indices:i,positions:n,texCoords:o}=t,a=[new Np(this.getSubLayerProps({id:"raster",renderPipeline:this._createRenderPipeline(),data:[1],mesh:{indices:{value:i,size:1},attributes:{POSITION:{value:n,size:3},TEXCOORD_0:{value:o,size:2}}},_instanced:!1,getPosition:[0,0,0],getColor:[255,255,255]}))];if(e){const l=this.renderDebugLayer();l&&a.push(l)}return a}}function jp(s){const t=s.uvs.length/2,e=new Float32Array(t*3),i=new Float32Array(s.uvs);for(let o=0;o<t;o++)e[o*3]=s.exactOutputPositions[o*2],e[o*3+1]=s.exactOutputPositions[o*2+1],e[o*3+2]=0;return{indices:new Uint32Array(s.triangles),positions:e,texCoords:i}}const bo=512,Vp=[[.5,.5],[0,0],[0,1],[1,0],[1,1]],$p=Vp.concat([[0,.5],[.5,0],[1,.5],[.5,1]]),Wp=6378137,cs=2*Math.PI*Wp,Co=cs/2,qp=28e-5;class Fs{x;y;z;metadata;childVisible;selected;_children;constructor(t,e,i,n){this.x=t,this.y=e,this.z=i,this.metadata=n}get tileMatrix(){return this.metadata.tileMatrices[this.z]}get children(){if(!this._children){const t=this.metadata.tileMatrices.length-1;if(this.z>=t)return this._children=null,null;const e=this.tileMatrix,i=this.z+1,n=this.metadata.tileMatrices[i],o=wo({x:this.x,y:this.y,transform:e.geotransform,tileWidth:e.tileWidth,tileHeight:e.tileHeight}),{minCol:r,maxCol:a,minRow:l,maxRow:c}=Yp(o,n),u=[];for(let f=l;f<=c;f++)for(let h=r;h<=a;h++)u.push(new Fs(h,f,i,this.metadata));this._children=u.length>0?u:null}return this._children}update(t){this.childVisible=!1,this.selected=!1;const{viewport:e,cullingVolume:i,elevationBounds:n,minZ:o,maxZ:r=this.metadata.tileMatrices.length-1,project:a,bounds:l}=t,{boundingVolume:c,commonSpaceBounds:u}=this.getBoundingVolume(n,a);if(l&&!this.insideBounds(l,u)||i.computeVisibility(c)<0)return!1;const h=this.children;if(!this.childVisible&&this.z>=o){const d=Jp(c,e.zoom);if(this.tileMatrix.scaleDenominator*qp<=d||this.z>=r||h===null&&this.z>=o)return this.selected=!0,!0}if(h&&h.length>0){this.selected=!1;let d=!1;for(const p of h)p.update(t)&&(d=!0);return this.childVisible=d,d}return!0}getSelected(t=[]){if(this.selected&&t.push(this),this._children)for(const e of this._children)e.getSelected(t);return t}insideBounds(t,e){const[i,n,o,r]=t,[a,l,c,u]=e;return a<o&&c>i&&l<r&&u>n}getBoundingVolume(t,e){return e&&yt(!1,"TODO: implement getBoundingVolume in Globe view"),this._getGenericBoundingVolume(t)}_getGenericBoundingVolume(t){const e=this.tileMatrix,{tileWidth:i,tileHeight:n,geotransform:o}=e,[r,a]=t,l=wo({x:this.x,y:this.y,transform:o,tileWidth:i,tileHeight:n}),u=Hp($p,l,this.metadata.projectTo3857).map(v=>Kp(v)),f=[];for(const v of u)f.push([v[0],v[1],r]),r!==a&&f.push([v[0],v[1],a]);let h=Number.POSITIVE_INFINITY,d=Number.POSITIVE_INFINITY,p=Number.NEGATIVE_INFINITY,g=Number.NEGATIVE_INFINITY;for(const[v,_]of u)v<h&&(h=v),_<d&&(d=_),v>p&&(p=v),_>g&&(g=_);const y=[h,d,p,g];return{boundingVolume:Yr(f),commonSpaceBounds:y}}}function wo({x:s,y:t,transform:e,tileWidth:i,tileHeight:n}){const[o,r,a,l,c,u]=e;if(r!==0||l!==0)throw new Error(`Rotated/skewed geotransforms not yet supported (b=${r}, d=${l}). Only north-up, non-rotated rasters are currently supported.`);const f=s*i,h=t*n,d=(s+1)*i,p=(t+1)*n,g=o*f+r*h+a,y=l*f+c*h+u,v=o*d+r*p+a,_=l*d+c*p+u;return[Math.min(g,v),Math.min(y,_),Math.max(g,v),Math.max(y,_)]}function Hp(s,t,e){const[i,n,o,r]=t,a=[];for(const[l,c]of s){const u=i+l*(o-i),f=n+c*(r-n),h=e([u,f]);a.push(h)}return a}function Kp([s,t]){const e=Math.max(-Co,Math.min(Co,t));return[(s/cs+.5)*bo,(e/cs+.5)*bo]}function Yp(s,t){const[e,i,n,o]=s,{tileWidth:r,tileHeight:a,cellSize:l,matrixWidth:c,matrixHeight:u,pointOfOrigin:f}=t,h=r*l,d=a*l,p=f[0],g=f[1];let y=Math.floor((e-p)/h),v=Math.floor((n-p)/h),_=Math.floor((g-o)/d),C=Math.floor((g-i)/d);return y=Math.max(0,Math.min(c-1,y)),v=Math.max(0,Math.min(c-1,v)),_=Math.max(0,Math.min(u-1,_)),C=Math.max(0,Math.min(u-1,C)),{minCol:y,maxCol:v,minRow:_,maxRow:C}}function Zp(s,t){const{viewport:e,maxZ:i,zRange:n}=t,o=e instanceof Go&&e.resolution?e.projectPosition:null,r=Object.values(e.getFrustumPlanes()).map(({normal:M,distance:k})=>new Ht(M.clone().negate(),k)),a=new gt(r),l=e.distanceScales.unitsPerMeter[2],c=n&&n[0]*l||0,u=n&&n[1]*l||0,f=0,{lowerLeft:h,upperRight:d}=s.wgsBounds,[p,g]=h,[y,v]=d,_=ti([p,g]),C=ti([y,v]),w=[_[0],_[1],C[0],C[1]],A=s.tileMatrices[0],I=[];for(let M=0;M<A.matrixHeight;M++)for(let k=0;k<A.matrixWidth;k++)I.push(new Fs(k,M,0,s));const z={viewport:e,project:o,cullingVolume:a,elevationBounds:[c,u],minZ:f,maxZ:i,bounds:w};for(const M of I)M.update(z);const F=[];for(const M of I)M.getSelected(F);return F}function Xp(s,t){return 40075016686e-3*Math.cos(s*Math.PI/180)/2**(t+8)}function Jp(s,t){const[e,i]=Pl(s.center);return Xp(i,t)}class Qp extends Jr{metadata;constructor(t,e){super(e),this.metadata=t}getTileIndices(t){const e=this.metadata.tileMatrices.length-1,i=typeof t.maxZoom=="number"?Math.min(t.maxZoom,e):e;return Zp(this.metadata,{viewport:t.viewport,maxZ:i,zRange:t.zRange??null})}getTileId(t){return`${t.x}-${t.y}-${t.z}`}getParentIndex(t){if(t.z===0)return t;const e=this.metadata.tileMatrices[t.z],i=this.metadata.tileMatrices[t.z-1],n=e.cellSize/i.cellSize;return{x:Math.floor(t.x/n),y:Math.floor(t.y/n),z:t.z-1}}getTileZoom(t){return t.z}getTileMetadata(t){const{x:e,y:i,z:n}=t,{tileMatrices:o}=this.metadata,r=o[n],{geotransform:a,tileHeight:l,tileWidth:c}=r,[u,f,h,d,p,g]=a,y=e*c,v=i*l,_=(e+1)*c,C=(i+1)*l,w=[u*y+f*v+h,d*y+p*v+g],A=[u*_+f*v+h,d*_+p*v+g],I=[u*y+f*C+h,d*y+p*C+g],z=[u*_+f*C+h,d*_+p*C+g],F={topLeft:w,topRight:A,bottomLeft:I,bottomRight:z};return{bounds:[Math.min(w[0],A[0],I[0],z[0]),Math.min(w[1],A[1],I[1],z[1]),Math.max(w[0],A[0],I[0],z[0]),Math.max(w[1],A[1],I[1],z[1])],projectedBounds:F,tileWidth:c,tileHeight:l,tileMatrix:r}}}const tg={MERIT:{a:6378137},SGS85:{a:6378136},GRS80:{a:6378137},IAU76:{a:6378140},airy:{a:6377563396e-3,b:635625691e-2},APL4:{a:6378137},NWL9D:{a:6378145},mod_airy:{a:6377340189e-3,b:6356034446e-3},andrae:{a:637710443e-2},aust_SA:{a:6378160},GRS67:{a:6378160},bessel:{a:6377397155e-3},bess_nam:{a:6377483865e-3},clrk66:{a:63782064e-1,b:63565838e-1},clrk80:{a:6378249145e-3},clrk80ign:{a:63782492e-1,b:6356515},clrk58:{a:6378293645208759e-9},CPM:{a:63757387e-1},delmbr:{a:6376428},engelis:{a:637813605e-2},evrst30:{a:6377276345e-3},evrst48:{a:6377304063e-3},evrst56:{a:6377301243e-3},evrst69:{a:6377295664e-3},evrstSS:{a:6377298556e-3},fschr60:{a:6378166},fschr60m:{a:6378155},fschr68:{a:6378150},helmert:{a:6378200},hough:{a:6378270},intl:{a:6378388},kaula:{a:6378163},lerch:{a:6378139},mprts:{a:6397300},new_intl:{a:63781575e-1,b:63567722e-1},plessis:{a:6376523},krass:{a:6378245},SEasia:{a:6378155,b:63567733205e-4},walbeck:{a:6376896,b:63558348467e-4},WGS60:{a:6378165},WGS66:{a:6378145},WGS7:{a:6378135},WGS84:{a:6378137},sphere:{a:6370997,b:6370997}};function eg(s){if(ig(s))throw new Error("Cannot invert degenerate transform");const t=1/ia(s),[e,i,n,o,r,a]=s,l=r*t,c=-i*t,u=-o*t,f=e*t;return[l,c,-n*l-a*c,u,f,-n*u-a*f]}function ig(s){return ia(s)===0}function ia(s){const[t,e,i,n,o,r]=s;return t*o-e*n}function Po(s,t,e){const[i,n,o,r,a,l]=e;return[i*s+n*t+o,r*s+a*t+l]}const sg={$schema:"https://proj.org/schemas/v0.7/projjson.schema.json",type:"GeographicCRS",name:"WGS 84 (CRS84)",datum_ensemble:{name:"World Geodetic System 1984 ensemble",members:[{name:"World Geodetic System 1984 (Transit)",id:{authority:"EPSG",code:1166}},{name:"World Geodetic System 1984 (G730)",id:{authority:"EPSG",code:1152}},{name:"World Geodetic System 1984 (G873)",id:{authority:"EPSG",code:1153}},{name:"World Geodetic System 1984 (G1150)",id:{authority:"EPSG",code:1154}},{name:"World Geodetic System 1984 (G1674)",id:{authority:"EPSG",code:1155}},{name:"World Geodetic System 1984 (G1762)",id:{authority:"EPSG",code:1156}},{name:"World Geodetic System 1984 (G2139)",id:{authority:"EPSG",code:1309}}],ellipsoid:{name:"WGS 84",semi_major_axis:6378137,inverse_flattening:298.257223563},accuracy:"2.0",id:{authority:"EPSG",code:6326}},coordinate_system:{subtype:"ellipsoidal",axis:[{name:"Geodetic longitude",abbreviation:"Lon",direction:"east",unit:"degree"},{name:"Geodetic latitude",abbreviation:"Lat",direction:"north",unit:"degree"}]},scope:"Not known.",area:"World.",bbox:{south_latitude:-90,west_longitude:-180,north_latitude:90,east_longitude:180},id:{authority:"OGC",code:"CRS84"}};async function sa(s,t,e=sg){const i=await s.getImage(),n=na(i),o=zt(t,e),{forwardTransform:r,inverseTransform:a}=ks(n);return{forwardTransform:r,inverseTransform:a,forwardReproject:(l,c)=>o.forward([l,c],!1),inverseReproject:(l,c)=>o.inverse([l,c],!1)}}function ks(s){const t=eg(s);return{forwardTransform:(e,i)=>Po(e,i,s),inverseTransform:(e,i)=>Po(e,i,t)}}function na(s){const t=s.getOrigin(),e=s.getResolution(),n=s.getFileDirectory().ModelTransformation;let o=0,r=0;return n&&n.length>=16&&(o=n[1],r=n[4]),[e[0],o,t[0],r,e[1],t[1]]}const oa=28e-5;async function ra(s,t){const e=await s.getImage();if(!e.isTiled)throw new Error("COG TileMatrixSet requires a tiled GeoTIFF");const i=await s.getImageCount(),n=e.getBoundingBox(),o=e.getWidth(),r=e.getHeight(),a=await t(e.getGeoKeys());if(a===null)throw new Error("Could not determine coordinate reference system from GeoTIFF geo keys");const l=zt(a.def,"EPSG:4326").forward,c=zt(a.def,"EPSG:3857").forward,u={lowerLeft:[n[0],n[1]],upperRight:[n[2],n[3]]},f=na(e);if(f[1]!==0||f[3]!==0)throw new Error("COG TileMatrixSet with rotation/skewed geotransform is not supported");const h=Math.abs(f[0]),d=e.getTileWidth(),p=e.getTileHeight(),g=[{id:String(i-1),scaleDenominator:h*aa(a.parsed,a.coordinatesUnits)/oa,cellSize:h,pointOfOrigin:[f[2],f[5]],tileWidth:e.getTileWidth(),tileHeight:e.getTileHeight(),matrixWidth:Math.ceil(o/d),matrixHeight:Math.ceil(r/p),geotransform:f}];for(let y=1;y<i;y++){const v=await s.getImage(y);if(!v.isTiled)throw new Error("COG TileMatrixSet requires a tiled GeoTIFF");const _=ng({id:String(i-1-y),image:v,fullWidth:o,baseTransform:f,crs:a});g.push(_)}return g.reverse(),{crs:a,boundingBox:u,wgsBounds:og(u,l),tileMatrices:g,projectToWgs84:l,projectTo3857:c}}function aa(s,t){const e=t||s.units;switch(e){case"metre":case"meter":case"meters":return 1;case"foot":return .3048;case"US survey foot":return 1200/3937}if(e==="degree"){const{a:i}=tg[s.ellps];return 2*Math.PI*i/360}throw new Error(`Unsupported CRS units: ${e}`)}function ng({id:s,image:t,fullWidth:e,baseTransform:i,crs:n}){const o=t.getWidth(),r=t.getHeight(),l=e/o,c=[i[0]*l,i[1]*l,i[2],i[3]*l,i[4]*l,i[5]],u=Math.abs(c[0]),f=t.getTileWidth(),h=t.getTileHeight();return{id:s,scaleDenominator:u*aa(n.parsed,n.coordinatesUnits)/oa,cellSize:u,pointOfOrigin:[c[2],c[5]],tileWidth:f,tileHeight:h,matrixWidth:Math.ceil(o/f),matrixHeight:Math.ceil(r/h),geotransform:c}}function og(s,t){const e=t(s.lowerLeft),i=t([s.upperRight[0],s.lowerLeft[1]]),n=t(s.upperRight),o=t([s.lowerLeft[0],s.upperRight[1]]),r=Math.min(e[0],i[0],n[0],o[0]),a=Math.max(e[0],i[0],n[0],o[0]),l=Math.min(e[1],i[1],n[1],o[1]),c=Math.max(e[1],i[1],n[1],o[1]);return{lowerLeft:[r,l],upperRight:[a,c]}}function tt(s){return(t,...e)=>rg(s,t,e)}function Xt(s,t){return tt(la(s,t).get)}const{apply:rg,getOwnPropertyDescriptor:la,getPrototypeOf:Ds,ownKeys:ag}=Reflect,{iterator:xe,toStringTag:lg}=Symbol,cg=Object,{create:Ns,defineProperty:ug}=cg,fg=Array,hg=fg.prototype,ca=hg[xe],dg=tt(ca),ua=ArrayBuffer,pg=ua.prototype;Xt(pg,"byteLength");const To=typeof SharedArrayBuffer<"u"?SharedArrayBuffer:null;To&&Xt(To.prototype,"byteLength");const fa=Ds(Uint8Array);fa.from;const st=fa.prototype;st[xe];tt(st.keys);tt(st.values);tt(st.entries);tt(st.set);tt(st.reverse);tt(st.fill);tt(st.copyWithin);tt(st.sort);tt(st.slice);tt(st.subarray);Xt(st,"buffer");Xt(st,"byteOffset");Xt(st,"length");Xt(st,lg);const gg=Uint8Array,ha=Uint16Array,Us=Uint32Array,mg=Float32Array,me=Ds([][xe]()),da=tt(me.next),yg=tt((function*(){})().next),xg=Ds(me),_g=DataView.prototype,vg=tt(_g.getUint16),Gs=WeakMap,pa=Gs.prototype,ga=tt(pa.get),bg=tt(pa.set),ma=new Gs,Cg=Ns(null,{next:{value:function(){const t=ga(ma,this);return da(t)}},[xe]:{value:function(){return this}}});function wg(s){if(s[xe]===ca&&me.next===da)return s;const t=Ns(Cg);return bg(ma,t,dg(s)),t}const Pg=new Gs,Tg=Ns(xg,{next:{value:function(){const t=ga(Pg,this);return yg(t)},writable:!0,configurable:!0}});for(const s of ag(me))s!=="next"&&ug(Tg,s,la(me,s));const ya=new ua(4),Lg=new mg(ya),Sg=new Us(ya),ft=new ha(512),ht=new gg(512);for(let s=0;s<256;++s){const t=s-127;t<-24?(ft[s]=0,ft[s|256]=32768,ht[s]=24,ht[s|256]=24):t<-14?(ft[s]=1024>>-t-14,ft[s|256]=1024>>-t-14|32768,ht[s]=-t-1,ht[s|256]=-t-1):t<=15?(ft[s]=t+15<<10,ft[s|256]=t+15<<10|32768,ht[s]=13,ht[s|256]=13):t<128?(ft[s]=31744,ft[s|256]=64512,ht[s]=24,ht[s|256]=24):(ft[s]=31744,ft[s|256]=64512,ht[s]=13,ht[s|256]=13)}const js=new Us(2048);for(let s=1;s<1024;++s){let t=s<<13,e=0;for(;(t&8388608)===0;)t<<=1,e-=8388608;t&=-8388609,e+=947912704,js[s]=t|e}for(let s=1024;s<2048;++s)js[s]=939524096+(s-1024<<13);const Jt=new Us(64);for(let s=1;s<31;++s)Jt[s]=s<<23;Jt[31]=1199570944;Jt[32]=2147483648;for(let s=33;s<63;++s)Jt[s]=2147483648+(s-32<<23);Jt[63]=3347054592;const xa=new ha(64);for(let s=1;s<64;++s)s!==32&&(xa[s]=1024);function Ag(s){const t=s>>10;return Sg[0]=js[xa[t]+(s&1023)]+Jt[t],Lg[0]}function _a(s,t,...e){return Ag(vg(s,t,...wg(e)))}var Fe={exports:{}},Lo;function Eg(){if(Lo)return Fe.exports;Lo=1;function s(t,e,i){const n=i&&i.debug||!1;n&&console.log("[xml-utils] getting "+e+" in "+t);const o=typeof t=="object"?t.outer:t,r=o.slice(0,o.indexOf(">")+1),a=['"',"'"];for(let l=0;l<a.length;l++){const c=a[l],u=e+"\\="+c+"([^"+c+"]*)"+c;n&&console.log("[xml-utils] pattern:",u);const h=new RegExp(u).exec(r);if(n&&console.log("[xml-utils] match:",h),h)return h[1]}}return Fe.exports=s,Fe.exports.default=s,Fe.exports}var Ig=Eg();const ki=ps(Ig);var ke={exports:{}},De={exports:{}},Ne={exports:{}},So;function Mg(){if(So)return Ne.exports;So=1;function s(t,e,i){const o=new RegExp(e).exec(t.slice(i));return o?i+o.index:-1}return Ne.exports=s,Ne.exports.default=s,Ne.exports}var Ue={exports:{}},Ao;function Og(){if(Ao)return Ue.exports;Ao=1;function s(t,e,i){const o=new RegExp(e).exec(t.slice(i));return o?i+o.index+o[0].length-1:-1}return Ue.exports=s,Ue.exports.default=s,Ue.exports}var Ge={exports:{}},Eo;function Rg(){if(Eo)return Ge.exports;Eo=1;function s(t,e){const i=new RegExp(e,"g"),n=t.match(i);return n?n.length:0}return Ge.exports=s,Ge.exports.default=s,Ge.exports}var Io;function zg(){if(Io)return De.exports;Io=1;const s=Mg(),t=Og(),e=Rg();function i(n,o,r){const a=r&&r.debug||!1,l=!(r&&typeof r.nested===!1),c=r&&r.startIndex||0;a&&console.log("[xml-utils] starting findTagByName with",o," and ",r);const u=s(n,`<${o}[ 
>/]`,c);if(a&&console.log("[xml-utils] start:",u),u===-1)return;const f=n.slice(u+o.length);let h=t(f,"^[^<]*[ /]>",0);const d=h!==-1&&f[h-1]==="/";if(a&&console.log("[xml-utils] selfClosing:",d),d===!1)if(l){let v=0,_=1,C=0;for(;(h=t(f,"[ /]"+o+">",v))!==-1;){const w=f.substring(v,h+1);if(_+=e(w,"<"+o+`[ 
	>]`),C+=e(w,"</"+o+">"),C>=_)break;v=h}}else h=t(f,"[ /]"+o+">",0);const p=u+o.length+h+1;if(a&&console.log("[xml-utils] end:",p),p===-1)return;const g=n.slice(u,p);let y;return d?y=null:y=g.slice(g.indexOf(">")+1,g.lastIndexOf("<")),{inner:y,outer:g,start:u,end:p}}return De.exports=i,De.exports.default=i,De.exports}var Mo;function Bg(){if(Mo)return ke.exports;Mo=1;const s=zg();function t(e,i,n){const o=[],r=n&&n.debug||!1,a=n&&typeof n.nested=="boolean"?n.nested:!0;let l=n&&n.startIndex||0,c;for(;c=s(e,i,{debug:r,startIndex:l});)a?l=c.start+1+i.length:l=c.end,o.push(c);return r&&console.log("findTagsByName found",o.length,"tags"),o}return ke.exports=t,ke.exports.default=t,ke.exports}var Fg=Bg();const kg=ps(Fg),he={315:"Artist",258:"BitsPerSample",265:"CellLength",264:"CellWidth",320:"ColorMap",259:"Compression",33432:"Copyright",306:"DateTime",338:"ExtraSamples",266:"FillOrder",289:"FreeByteCounts",288:"FreeOffsets",291:"GrayResponseCurve",290:"GrayResponseUnit",316:"HostComputer",270:"ImageDescription",257:"ImageLength",256:"ImageWidth",271:"Make",281:"MaxSampleValue",280:"MinSampleValue",272:"Model",254:"NewSubfileType",274:"Orientation",262:"PhotometricInterpretation",284:"PlanarConfiguration",296:"ResolutionUnit",278:"RowsPerStrip",277:"SamplesPerPixel",305:"Software",279:"StripByteCounts",273:"StripOffsets",255:"SubfileType",263:"Threshholding",282:"XResolution",283:"YResolution",326:"BadFaxLines",327:"CleanFaxData",343:"ClipPath",328:"ConsecutiveBadFaxLines",433:"Decode",434:"DefaultImageColor",269:"DocumentName",336:"DotRange",321:"HalftoneHints",346:"Indexed",347:"JPEGTables",285:"PageName",297:"PageNumber",317:"Predictor",319:"PrimaryChromaticities",532:"ReferenceBlackWhite",339:"SampleFormat",340:"SMinSampleValue",341:"SMaxSampleValue",559:"StripRowCounts",330:"SubIFDs",292:"T4Options",293:"T6Options",325:"TileByteCounts",323:"TileLength",324:"TileOffsets",322:"TileWidth",301:"TransferFunction",318:"WhitePoint",344:"XClipPathUnits",286:"XPosition",529:"YCbCrCoefficients",531:"YCbCrPositioning",530:"YCbCrSubSampling",345:"YClipPathUnits",287:"YPosition",37378:"ApertureValue",40961:"ColorSpace",36868:"DateTimeDigitized",36867:"DateTimeOriginal",34665:"Exif IFD",36864:"ExifVersion",33434:"ExposureTime",41728:"FileSource",37385:"Flash",40960:"FlashpixVersion",33437:"FNumber",42016:"ImageUniqueID",37384:"LightSource",37500:"MakerNote",37377:"ShutterSpeedValue",37510:"UserComment",33723:"IPTC",34675:"ICC Profile",700:"XMP",42112:"GDAL_METADATA",42113:"GDAL_NODATA",34377:"Photoshop",33550:"ModelPixelScale",33922:"ModelTiepoint",34264:"ModelTransformation",34735:"GeoKeyDirectory",34736:"GeoDoubleParams",34737:"GeoAsciiParams",50674:"LercParameters"},pt={};for(const s in he)he.hasOwnProperty(s)&&(pt[he[s]]=parseInt(s,10));const Dg=[pt.BitsPerSample,pt.ExtraSamples,pt.SampleFormat,pt.StripByteCounts,pt.StripOffsets,pt.StripRowCounts,pt.TileByteCounts,pt.TileOffsets,pt.SubIFDs],Di={1:"BYTE",2:"ASCII",3:"SHORT",4:"LONG",5:"RATIONAL",6:"SBYTE",7:"UNDEFINED",8:"SSHORT",9:"SLONG",10:"SRATIONAL",11:"FLOAT",12:"DOUBLE",13:"IFD",16:"LONG8",17:"SLONG8",18:"IFD8"},N={};for(const s in Di)Di.hasOwnProperty(s)&&(N[Di[s]]=parseInt(s,10));const rt={WhiteIsZero:0,BlackIsZero:1,RGB:2,Palette:3,CMYK:5,YCbCr:6,CIELab:8},Ng={Unspecified:0},by={AddCompression:1},Cy={None:0,Deflate:1,Zstandard:2},Ug={1024:"GTModelTypeGeoKey",1025:"GTRasterTypeGeoKey",1026:"GTCitationGeoKey",2048:"GeographicTypeGeoKey",2049:"GeogCitationGeoKey",2050:"GeogGeodeticDatumGeoKey",2051:"GeogPrimeMeridianGeoKey",2052:"GeogLinearUnitsGeoKey",2053:"GeogLinearUnitSizeGeoKey",2054:"GeogAngularUnitsGeoKey",2055:"GeogAngularUnitSizeGeoKey",2056:"GeogEllipsoidGeoKey",2057:"GeogSemiMajorAxisGeoKey",2058:"GeogSemiMinorAxisGeoKey",2059:"GeogInvFlatteningGeoKey",2060:"GeogAzimuthUnitsGeoKey",2061:"GeogPrimeMeridianLongGeoKey",2062:"GeogTOWGS84GeoKey",3072:"ProjectedCSTypeGeoKey",3073:"PCSCitationGeoKey",3074:"ProjectionGeoKey",3075:"ProjCoordTransGeoKey",3076:"ProjLinearUnitsGeoKey",3077:"ProjLinearUnitSizeGeoKey",3078:"ProjStdParallel1GeoKey",3079:"ProjStdParallel2GeoKey",3080:"ProjNatOriginLongGeoKey",3081:"ProjNatOriginLatGeoKey",3082:"ProjFalseEastingGeoKey",3083:"ProjFalseNorthingGeoKey",3084:"ProjFalseOriginLongGeoKey",3085:"ProjFalseOriginLatGeoKey",3086:"ProjFalseOriginEastingGeoKey",3087:"ProjFalseOriginNorthingGeoKey",3088:"ProjCenterLongGeoKey",3089:"ProjCenterLatGeoKey",3090:"ProjCenterEastingGeoKey",3091:"ProjCenterNorthingGeoKey",3092:"ProjScaleAtNatOriginGeoKey",3093:"ProjScaleAtCenterGeoKey",3094:"ProjAzimuthAngleGeoKey",3095:"ProjStraightVertPoleLongGeoKey",3096:"ProjRectifiedGridAngleGeoKey",4096:"VerticalCSTypeGeoKey",4097:"VerticalCitationGeoKey",4098:"VerticalDatumGeoKey",4099:"VerticalUnitsGeoKey"};function Gg(s,t){const{width:e,height:i}=s,n=new Uint8Array(e*i*3);let o;for(let r=0,a=0;r<s.length;++r,a+=3)o=256-s[r]/t*256,n[a]=o,n[a+1]=o,n[a+2]=o;return n}function jg(s,t){const{width:e,height:i}=s,n=new Uint8Array(e*i*3);let o;for(let r=0,a=0;r<s.length;++r,a+=3)o=s[r]/t*256,n[a]=o,n[a+1]=o,n[a+2]=o;return n}function Vg(s,t){const{width:e,height:i}=s,n=new Uint8Array(e*i*3),o=t.length/3,r=t.length/3*2;for(let a=0,l=0;a<s.length;++a,l+=3){const c=s[a];n[l]=t[c]/65536*256,n[l+1]=t[c+o]/65536*256,n[l+2]=t[c+r]/65536*256}return n}function $g(s){const{width:t,height:e}=s,i=new Uint8Array(t*e*3);for(let n=0,o=0;n<s.length;n+=4,o+=3){const r=s[n],a=s[n+1],l=s[n+2],c=s[n+3];i[o]=255*((255-r)/256)*((255-c)/256),i[o+1]=255*((255-a)/256)*((255-c)/256),i[o+2]=255*((255-l)/256)*((255-c)/256)}return i}function Wg(s){const{width:t,height:e}=s,i=new Uint8ClampedArray(t*e*3);for(let n=0,o=0;n<s.length;n+=3,o+=3){const r=s[n],a=s[n+1],l=s[n+2];i[o]=r+1.402*(l-128),i[o+1]=r-.34414*(a-128)-.71414*(l-128),i[o+2]=r+1.772*(a-128)}return i}const qg=.95047,Hg=1,Kg=1.08883;function Yg(s){const{width:t,height:e}=s,i=new Uint8Array(t*e*3);for(let n=0,o=0;n<s.length;n+=3,o+=3){const r=s[n+0],a=s[n+1]<<24>>24,l=s[n+2]<<24>>24;let c=(r+16)/116,u=a/500+c,f=c-l/200,h,d,p;u=qg*(u*u*u>.008856?u*u*u:(u-16/116)/7.787),c=Hg*(c*c*c>.008856?c*c*c:(c-16/116)/7.787),f=Kg*(f*f*f>.008856?f*f*f:(f-16/116)/7.787),h=u*3.2406+c*-1.5372+f*-.4986,d=u*-.9689+c*1.8758+f*.0415,p=u*.0557+c*-.204+f*1.057,h=h>.0031308?1.055*h**(1/2.4)-.055:12.92*h,d=d>.0031308?1.055*d**(1/2.4)-.055:12.92*d,p=p>.0031308?1.055*p**(1/2.4)-.055:12.92*p,i[o]=Math.max(0,Math.min(1,h))*255,i[o+1]=Math.max(0,Math.min(1,d))*255,i[o+2]=Math.max(0,Math.min(1,p))*255}return i}const va=new Map;function Mt(s,t){Array.isArray(s)||(s=[s]),s.forEach(e=>va.set(e,t))}async function ba(s){const t=va.get(s.Compression);if(!t)throw new Error(`Unknown compression method identifier: ${s.Compression}`);const e=await t();return new e(s)}Mt([void 0,1],()=>Et(()=>import("./raw-in9isEBO.js"),__vite__mapDeps([0,1])).then(s=>s.default));Mt(5,()=>Et(()=>import("./lzw-_aCqfs4w.js"),__vite__mapDeps([2,1])).then(s=>s.default));Mt(6,()=>{throw new Error("old style JPEG compression is not supported.")});Mt(7,()=>Et(()=>import("./jpeg-vtRboCKw.js"),__vite__mapDeps([3,1])).then(s=>s.default));Mt([8,32946],()=>Et(()=>import("./deflate-B9JhHpvg.js"),__vite__mapDeps([4,5,1])).then(s=>s.default));Mt(32773,()=>Et(()=>import("./packbits-DDWKfGV_.js"),__vite__mapDeps([6,1])).then(s=>s.default));Mt(34887,()=>Et(()=>import("./lerc-k0H8Yv_y.js"),__vite__mapDeps([7,5,8,9,10,11,12,1,13,14,15,16,17,18,19,20,21,22])).then(async s=>(await s.zstd.init(),s)).then(s=>s.default));Mt(50001,()=>Et(()=>import("./webimage-DBgUwIbt.js"),__vite__mapDeps([23,1])).then(s=>s.default));function di(s,t,e,i=1){return new(Object.getPrototypeOf(s)).constructor(t*e*i)}function Zg(s,t,e,i,n){const o=t/i,r=e/n;return s.map(a=>{const l=di(a,i,n);for(let c=0;c<n;++c){const u=Math.min(Math.round(r*c),e-1);for(let f=0;f<i;++f){const h=Math.min(Math.round(o*f),t-1),d=a[u*t+h];l[c*i+f]=d}}return l})}function Wt(s,t,e){return(1-e)*s+e*t}function Xg(s,t,e,i,n){const o=t/i,r=e/n;return s.map(a=>{const l=di(a,i,n);for(let c=0;c<n;++c){const u=r*c,f=Math.floor(u),h=Math.min(Math.ceil(u),e-1);for(let d=0;d<i;++d){const p=o*d,g=p%1,y=Math.floor(p),v=Math.min(Math.ceil(p),t-1),_=a[f*t+y],C=a[f*t+v],w=a[h*t+y],A=a[h*t+v],I=Wt(Wt(_,C,g),Wt(w,A,g),u%1);l[c*i+d]=I}}return l})}function Jg(s,t,e,i,n,o="nearest"){switch(o.toLowerCase()){case"nearest":return Zg(s,t,e,i,n);case"bilinear":case"linear":return Xg(s,t,e,i,n);default:throw new Error(`Unsupported resampling method: '${o}'`)}}function Qg(s,t,e,i,n,o){const r=t/i,a=e/n,l=di(s,i,n,o);for(let c=0;c<n;++c){const u=Math.min(Math.round(a*c),e-1);for(let f=0;f<i;++f){const h=Math.min(Math.round(r*f),t-1);for(let d=0;d<o;++d){const p=s[u*t*o+h*o+d];l[c*i*o+f*o+d]=p}}}return l}function tm(s,t,e,i,n,o){const r=t/i,a=e/n,l=di(s,i,n,o);for(let c=0;c<n;++c){const u=a*c,f=Math.floor(u),h=Math.min(Math.ceil(u),e-1);for(let d=0;d<i;++d){const p=r*d,g=p%1,y=Math.floor(p),v=Math.min(Math.ceil(p),t-1);for(let _=0;_<o;++_){const C=s[f*t*o+y*o+_],w=s[f*t*o+v*o+_],A=s[h*t*o+y*o+_],I=s[h*t*o+v*o+_],z=Wt(Wt(C,w,g),Wt(A,I,g),u%1);l[c*i*o+d*o+_]=z}}}return l}function em(s,t,e,i,n,o,r="nearest"){switch(r.toLowerCase()){case"nearest":return Qg(s,t,e,i,n,o);case"bilinear":case"linear":return tm(s,t,e,i,n,o);default:throw new Error(`Unsupported resampling method: '${r}'`)}}function im(s,t,e){let i=0;for(let n=t;n<e;++n)i+=s[n];return i}function us(s,t,e){switch(s){case 1:if(t<=8)return new Uint8Array(e);if(t<=16)return new Uint16Array(e);if(t<=32)return new Uint32Array(e);break;case 2:if(t===8)return new Int8Array(e);if(t===16)return new Int16Array(e);if(t===32)return new Int32Array(e);break;case 3:switch(t){case 16:case 32:return new Float32Array(e);case 64:return new Float64Array(e)}break}throw Error("Unsupported data format/bitsPerSample")}function sm(s,t){return(s===1||s===2)&&t<=32&&t%8===0?!1:!(s===3&&(t===16||t===32||t===64))}function nm(s,t,e,i,n,o,r){const a=new DataView(s),l=e===2?r*o:r*o*i,c=e===2?1:i,u=us(t,n,l),f=parseInt("1".repeat(n),2);if(t===1){let h;e===1?h=i*n:h=n;let d=o*h;(d&7)!==0&&(d=d+7&-8);for(let p=0;p<r;++p){const g=p*d;for(let y=0;y<o;++y){const v=g+y*c*n;for(let _=0;_<c;++_){const C=v+_*n,w=(p*o+y)*c+_,A=Math.floor(C/8),I=C%8;if(I+n<=8)u[w]=a.getUint8(A)>>8-n-I&f;else if(I+n<=16)u[w]=a.getUint16(A)>>16-n-I&f;else if(I+n<=24){const z=a.getUint16(A)<<8|a.getUint8(A+2);u[w]=z>>24-n-I&f}else u[w]=a.getUint32(A)>>32-n-I&f}}}}return u.buffer}class om{constructor(t,e,i,n,o,r){this.fileDirectory=t,this.geoKeys=e,this.dataView=i,this.littleEndian=n,this.tiles=o?{}:null,this.isTiled=!t.StripOffsets;const a=t.PlanarConfiguration;if(this.planarConfiguration=typeof a>"u"?1:a,this.planarConfiguration!==1&&this.planarConfiguration!==2)throw new Error("Invalid planar configuration.");this.source=r}getFileDirectory(){return this.fileDirectory}getGeoKeys(){return this.geoKeys}getWidth(){return this.fileDirectory.ImageWidth}getHeight(){return this.fileDirectory.ImageLength}getSamplesPerPixel(){return typeof this.fileDirectory.SamplesPerPixel<"u"?this.fileDirectory.SamplesPerPixel:1}getTileWidth(){return this.isTiled?this.fileDirectory.TileWidth:this.getWidth()}getTileHeight(){return this.isTiled?this.fileDirectory.TileLength:typeof this.fileDirectory.RowsPerStrip<"u"?Math.min(this.fileDirectory.RowsPerStrip,this.getHeight()):this.getHeight()}getBlockWidth(){return this.getTileWidth()}getBlockHeight(t){return this.isTiled||(t+1)*this.getTileHeight()<=this.getHeight()?this.getTileHeight():this.getHeight()-t*this.getTileHeight()}getBytesPerPixel(){let t=0;for(let e=0;e<this.fileDirectory.BitsPerSample.length;++e)t+=this.getSampleByteSize(e);return t}getSampleByteSize(t){if(t>=this.fileDirectory.BitsPerSample.length)throw new RangeError(`Sample index ${t} is out of range.`);return Math.ceil(this.fileDirectory.BitsPerSample[t]/8)}getReaderForSample(t){const e=this.fileDirectory.SampleFormat?this.fileDirectory.SampleFormat[t]:1,i=this.fileDirectory.BitsPerSample[t];switch(e){case 1:if(i<=8)return DataView.prototype.getUint8;if(i<=16)return DataView.prototype.getUint16;if(i<=32)return DataView.prototype.getUint32;break;case 2:if(i<=8)return DataView.prototype.getInt8;if(i<=16)return DataView.prototype.getInt16;if(i<=32)return DataView.prototype.getInt32;break;case 3:switch(i){case 16:return function(n,o){return _a(this,n,o)};case 32:return DataView.prototype.getFloat32;case 64:return DataView.prototype.getFloat64}break}throw Error("Unsupported data format/bitsPerSample")}getSampleFormat(t=0){return this.fileDirectory.SampleFormat?this.fileDirectory.SampleFormat[t]:1}getBitsPerSample(t=0){return this.fileDirectory.BitsPerSample[t]}getArrayForSample(t,e){const i=this.getSampleFormat(t),n=this.getBitsPerSample(t);return us(i,n,e)}async getTileOrStrip(t,e,i,n,o){const r=Math.ceil(this.getWidth()/this.getTileWidth()),a=Math.ceil(this.getHeight()/this.getTileHeight());let l;const{tiles:c}=this;this.planarConfiguration===1?l=e*r+t:this.planarConfiguration===2&&(l=i*r*a+e*r+t);let u,f;this.isTiled?(u=this.fileDirectory.TileOffsets[l],f=this.fileDirectory.TileByteCounts[l]):(u=this.fileDirectory.StripOffsets[l],f=this.fileDirectory.StripByteCounts[l]);const h=(await this.source.fetch([{offset:u,length:f}],o))[0];let d;return c===null||!c[l]?(d=(async()=>{let p=await n.decode(this.fileDirectory,h);const g=this.getSampleFormat(),y=this.getBitsPerSample();return sm(g,y)&&(p=nm(p,g,this.planarConfiguration,this.getSamplesPerPixel(),y,this.getTileWidth(),this.getBlockHeight(e))),p})(),c!==null&&(c[l]=d)):d=c[l],{x:t,y:e,sample:i,data:await d}}async _readRaster(t,e,i,n,o,r,a,l,c){const u=this.getTileWidth(),f=this.getTileHeight(),h=this.getWidth(),d=this.getHeight(),p=Math.max(Math.floor(t[0]/u),0),g=Math.min(Math.ceil(t[2]/u),Math.ceil(h/u)),y=Math.max(Math.floor(t[1]/f),0),v=Math.min(Math.ceil(t[3]/f),Math.ceil(d/f)),_=t[2]-t[0];let C=this.getBytesPerPixel();const w=[],A=[];for(let F=0;F<e.length;++F)this.planarConfiguration===1?w.push(im(this.fileDirectory.BitsPerSample,0,e[F])/8):w.push(0),A.push(this.getReaderForSample(e[F]));const I=[],{littleEndian:z}=this;for(let F=y;F<v;++F)for(let M=p;M<g;++M){let k;this.planarConfiguration===1&&(k=this.getTileOrStrip(M,F,0,o,c));for(let q=0;q<e.length;++q){const H=q,Y=e[q];this.planarConfiguration===2&&(C=this.getSampleByteSize(Y),k=this.getTileOrStrip(M,F,Y,o,c));const ot=k.then(X=>{const m=X.data,b=new DataView(m),x=this.getBlockHeight(X.y),P=X.y*f,T=X.x*u,L=P+x,S=(X.x+1)*u,E=A[H],B=Math.min(x,x-(L-t[3]),d-P),R=Math.min(u,u-(S-t[2]),h-T);for(let W=Math.max(0,t[1]-P);W<B;++W)for(let U=Math.max(0,t[0]-T);U<R;++U){const G=(W*u+U)*C,Z=E.call(b,G+w[H],z);let j;n?(j=(W+P-t[1])*_*e.length+(U+T-t[0])*e.length+H,i[j]=Z):(j=(W+P-t[1])*_+U+T-t[0],i[H][j]=Z)}});I.push(ot)}}if(await Promise.all(I),r&&t[2]-t[0]!==r||a&&t[3]-t[1]!==a){let F;return n?F=em(i,t[2]-t[0],t[3]-t[1],r,a,e.length,l):F=Jg(i,t[2]-t[0],t[3]-t[1],r,a,l),F.width=r,F.height=a,F}return i.width=r||t[2]-t[0],i.height=a||t[3]-t[1],i}async readRasters({window:t,samples:e=[],interleave:i,pool:n=null,width:o,height:r,resampleMethod:a,fillValue:l,signal:c}={}){const u=t||[0,0,this.getWidth(),this.getHeight()];if(u[0]>u[2]||u[1]>u[3])throw new Error("Invalid subsets");const f=u[2]-u[0],h=u[3]-u[1],d=f*h,p=this.getSamplesPerPixel();if(!e||!e.length)for(let _=0;_<p;++_)e.push(_);else for(let _=0;_<e.length;++_)if(e[_]>=p)return Promise.reject(new RangeError(`Invalid sample index '${e[_]}'.`));let g;if(i){const _=this.fileDirectory.SampleFormat?Math.max.apply(null,this.fileDirectory.SampleFormat):1,C=Math.max.apply(null,this.fileDirectory.BitsPerSample);g=us(_,C,d*e.length),l&&g.fill(l)}else{g=[];for(let _=0;_<e.length;++_){const C=this.getArrayForSample(e[_],d);Array.isArray(l)&&_<l.length?C.fill(l[_]):l&&!Array.isArray(l)&&C.fill(l),g.push(C)}}const y=n||await ba(this.fileDirectory);return await this._readRaster(u,e,g,i,y,o,r,a,c)}async readRGB({window:t,interleave:e=!0,pool:i=null,width:n,height:o,resampleMethod:r,enableAlpha:a=!1,signal:l}={}){const c=t||[0,0,this.getWidth(),this.getHeight()];if(c[0]>c[2]||c[1]>c[3])throw new Error("Invalid subsets");const u=this.fileDirectory.PhotometricInterpretation;if(u===rt.RGB){let v=[0,1,2];if(this.fileDirectory.ExtraSamples!==Ng.Unspecified&&a){v=[];for(let _=0;_<this.fileDirectory.BitsPerSample.length;_+=1)v.push(_)}return this.readRasters({window:t,interleave:e,samples:v,pool:i,width:n,height:o,resampleMethod:r,signal:l})}let f;switch(u){case rt.WhiteIsZero:case rt.BlackIsZero:case rt.Palette:f=[0];break;case rt.CMYK:f=[0,1,2,3];break;case rt.YCbCr:case rt.CIELab:f=[0,1,2];break;default:throw new Error("Invalid or unsupported photometric interpretation.")}const h={window:c,interleave:!0,samples:f,pool:i,width:n,height:o,resampleMethod:r,signal:l},{fileDirectory:d}=this,p=await this.readRasters(h),g=2**this.fileDirectory.BitsPerSample[0];let y;switch(u){case rt.WhiteIsZero:y=Gg(p,g);break;case rt.BlackIsZero:y=jg(p,g);break;case rt.Palette:y=Vg(p,d.ColorMap);break;case rt.CMYK:y=$g(p);break;case rt.YCbCr:y=Wg(p);break;case rt.CIELab:y=Yg(p);break;default:throw new Error("Unsupported photometric interpretation.")}if(!e){const v=new Uint8Array(y.length/3),_=new Uint8Array(y.length/3),C=new Uint8Array(y.length/3);for(let w=0,A=0;w<y.length;w+=3,++A)v[A]=y[w],_[A]=y[w+1],C[A]=y[w+2];y=[v,_,C]}return y.width=p.width,y.height=p.height,y}getTiePoints(){if(!this.fileDirectory.ModelTiepoint)return[];const t=[];for(let e=0;e<this.fileDirectory.ModelTiepoint.length;e+=6)t.push({i:this.fileDirectory.ModelTiepoint[e],j:this.fileDirectory.ModelTiepoint[e+1],k:this.fileDirectory.ModelTiepoint[e+2],x:this.fileDirectory.ModelTiepoint[e+3],y:this.fileDirectory.ModelTiepoint[e+4],z:this.fileDirectory.ModelTiepoint[e+5]});return t}getGDALMetadata(t=null){const e={};if(!this.fileDirectory.GDAL_METADATA)return null;const i=this.fileDirectory.GDAL_METADATA;let n=kg(i,"Item");t===null?n=n.filter(o=>ki(o,"sample")===void 0):n=n.filter(o=>Number(ki(o,"sample"))===t);for(let o=0;o<n.length;++o){const r=n[o];e[ki(r,"name")]=r.inner}return e}getGDALNoData(){if(!this.fileDirectory.GDAL_NODATA)return null;const t=this.fileDirectory.GDAL_NODATA;return Number(t.substring(0,t.length-1))}getOrigin(){const t=this.fileDirectory.ModelTiepoint,e=this.fileDirectory.ModelTransformation;if(t&&t.length===6)return[t[3],t[4],t[5]];if(e)return[e[3],e[7],e[11]];throw new Error("The image does not have an affine transformation.")}getResolution(t=null){const e=this.fileDirectory.ModelPixelScale,i=this.fileDirectory.ModelTransformation;if(e)return[e[0],-e[1],e[2]];if(i)return i[1]===0&&i[4]===0?[i[0],-i[5],i[10]]:[Math.sqrt(i[0]*i[0]+i[4]*i[4]),-Math.sqrt(i[1]*i[1]+i[5]*i[5]),i[10]];if(t){const[n,o,r]=t.getResolution();return[n*t.getWidth()/this.getWidth(),o*t.getHeight()/this.getHeight(),r*t.getWidth()/this.getWidth()]}throw new Error("The image does not have an affine transformation.")}pixelIsArea(){return this.geoKeys.GTRasterTypeGeoKey===1}getBoundingBox(t=!1){const e=this.getHeight(),i=this.getWidth();if(this.fileDirectory.ModelTransformation&&!t){const[n,o,r,a,l,c,u,f]=this.fileDirectory.ModelTransformation,d=[[0,0],[0,e],[i,0],[i,e]].map(([y,v])=>[a+n*y+o*v,f+l*y+c*v]),p=d.map(y=>y[0]),g=d.map(y=>y[1]);return[Math.min(...p),Math.min(...g),Math.max(...p),Math.max(...g)]}else{const n=this.getOrigin(),o=this.getResolution(),r=n[0],a=n[1],l=r+o[0]*i,c=a+o[1]*e;return[Math.min(r,l),Math.min(a,c),Math.max(r,l),Math.max(a,c)]}}}class rm{constructor(t){this._dataView=new DataView(t)}get buffer(){return this._dataView.buffer}getUint64(t,e){const i=this.getUint32(t,e),n=this.getUint32(t+4,e);let o;if(e){if(o=i+2**32*n,!Number.isSafeInteger(o))throw new Error(`${o} exceeds MAX_SAFE_INTEGER. Precision may be lost. Please report if you get this message to https://github.com/geotiffjs/geotiff.js/issues`);return o}if(o=2**32*i+n,!Number.isSafeInteger(o))throw new Error(`${o} exceeds MAX_SAFE_INTEGER. Precision may be lost. Please report if you get this message to https://github.com/geotiffjs/geotiff.js/issues`);return o}getInt64(t,e){let i=0;const n=(this._dataView.getUint8(t+(e?7:0))&128)>0;let o=!0;for(let r=0;r<8;r++){let a=this._dataView.getUint8(t+(e?r:7-r));n&&(o?a!==0&&(a=~(a-1)&255,o=!1):a=~a&255),i+=a*256**r}return n&&(i=-i),i}getUint8(t,e){return this._dataView.getUint8(t,e)}getInt8(t,e){return this._dataView.getInt8(t,e)}getUint16(t,e){return this._dataView.getUint16(t,e)}getInt16(t,e){return this._dataView.getInt16(t,e)}getUint32(t,e){return this._dataView.getUint32(t,e)}getInt32(t,e){return this._dataView.getInt32(t,e)}getFloat16(t,e){return _a(this._dataView,t,e)}getFloat32(t,e){return this._dataView.getFloat32(t,e)}getFloat64(t,e){return this._dataView.getFloat64(t,e)}}class am{constructor(t,e,i,n){this._dataView=new DataView(t),this._sliceOffset=e,this._littleEndian=i,this._bigTiff=n}get sliceOffset(){return this._sliceOffset}get sliceTop(){return this._sliceOffset+this.buffer.byteLength}get littleEndian(){return this._littleEndian}get bigTiff(){return this._bigTiff}get buffer(){return this._dataView.buffer}covers(t,e){return this.sliceOffset<=t&&this.sliceTop>=t+e}readUint8(t){return this._dataView.getUint8(t-this._sliceOffset,this._littleEndian)}readInt8(t){return this._dataView.getInt8(t-this._sliceOffset,this._littleEndian)}readUint16(t){return this._dataView.getUint16(t-this._sliceOffset,this._littleEndian)}readInt16(t){return this._dataView.getInt16(t-this._sliceOffset,this._littleEndian)}readUint32(t){return this._dataView.getUint32(t-this._sliceOffset,this._littleEndian)}readInt32(t){return this._dataView.getInt32(t-this._sliceOffset,this._littleEndian)}readFloat32(t){return this._dataView.getFloat32(t-this._sliceOffset,this._littleEndian)}readFloat64(t){return this._dataView.getFloat64(t-this._sliceOffset,this._littleEndian)}readUint64(t){const e=this.readUint32(t),i=this.readUint32(t+4);let n;if(this._littleEndian){if(n=e+2**32*i,!Number.isSafeInteger(n))throw new Error(`${n} exceeds MAX_SAFE_INTEGER. Precision may be lost. Please report if you get this message to https://github.com/geotiffjs/geotiff.js/issues`);return n}if(n=2**32*e+i,!Number.isSafeInteger(n))throw new Error(`${n} exceeds MAX_SAFE_INTEGER. Precision may be lost. Please report if you get this message to https://github.com/geotiffjs/geotiff.js/issues`);return n}readInt64(t){let e=0;const i=(this._dataView.getUint8(t+(this._littleEndian?7:0))&128)>0;let n=!0;for(let o=0;o<8;o++){let r=this._dataView.getUint8(t+(this._littleEndian?o:7-o));i&&(n?r!==0&&(r=~(r-1)&255,n=!1):r=~r&255),e+=r*256**o}return i&&(e=-e),e}readOffset(t){return this._bigTiff?this.readUint64(t):this.readUint32(t)}}const lm=typeof navigator<"u"&&navigator.hardwareConcurrency||2;class cm{constructor(t=lm,e){this.workers=null,this._awaitingDecoder=null,this.size=t,this.messageId=0,t&&(this._awaitingDecoder=e?Promise.resolve(e):new Promise(i=>{Et(()=>import("./decoder-5LfjGLzu.js"),__vite__mapDeps([24,9,10,8,11,12])).then(n=>{i(n.create)})}),this._awaitingDecoder.then(i=>{this._awaitingDecoder=null,this.workers=[];for(let n=0;n<t;n++)this.workers.push({worker:i(),idle:!0})}))}async decode(t,e){return this._awaitingDecoder&&await this._awaitingDecoder,this.size===0?ba(t).then(i=>i.decode(t,e)):new Promise(i=>{const n=this.workers.find(a=>a.idle)||this.workers[Math.floor(Math.random()*this.size)];n.idle=!1;const o=this.messageId++,r=a=>{a.data.id===o&&(n.idle=!0,i(a.data.decoded),n.worker.removeEventListener("message",r))};n.worker.addEventListener("message",r),n.worker.postMessage({fileDirectory:t,buffer:e,id:o},[e])})}destroy(){this.workers&&(this.workers.forEach(t=>{t.worker.terminate()}),this.workers=null)}}const Oo=`\r
\r
`;function Ca(s){if(typeof Object.fromEntries<"u")return Object.fromEntries(s);const t={};for(const[e,i]of s)t[e.toLowerCase()]=i;return t}function um(s){const t=s.split(`\r
`).map(e=>{const i=e.split(":").map(n=>n.trim());return i[0]=i[0].toLowerCase(),i});return Ca(t)}function fm(s){const[t,...e]=s.split(";").map(n=>n.trim()),i=e.map(n=>n.split("="));return{type:t,params:Ca(i)}}function fs(s){let t,e,i;return s&&([,t,e,i]=s.match(/bytes (\d+)-(\d+)\/(\d+)/),t=parseInt(t,10),e=parseInt(e,10),i=parseInt(i,10)),{start:t,end:e,total:i}}function hm(s,t){let e=null;const i=new TextDecoder("ascii"),n=[],o=`--${t}`,r=`${o}--`;for(let a=0;a<10;++a)i.decode(new Uint8Array(s,a,o.length))===o&&(e=a);if(e===null)throw new Error("Could not find initial boundary");for(;e<s.byteLength;){const a=i.decode(new Uint8Array(s,e,Math.min(o.length+1024,s.byteLength-e)));if(a.length===0||a.startsWith(r))break;if(!a.startsWith(o))throw new Error("Part does not start with boundary");const l=a.substr(o.length+2);if(l.length===0)break;const c=l.indexOf(Oo),u=um(l.substr(0,c)),{start:f,end:h,total:d}=fs(u["content-range"]),p=e+o.length+c+Oo.length,g=parseInt(h,10)+1-parseInt(f,10);n.push({headers:u,data:s.slice(p,p+g),offset:f,length:g,fileSize:d}),e=p+g+4}return n}class pi{async fetch(t,e=void 0){return Promise.all(t.map(i=>this.fetchSlice(i,e)))}async fetchSlice(t){throw new Error(`fetching of slice ${t} not possible, not implemented`)}get fileSize(){return null}async close(){}}class dm extends Map{constructor(t={}){if(super(),!(t.maxSize&&t.maxSize>0))throw new TypeError("`maxSize` must be a number greater than 0");if(typeof t.maxAge=="number"&&t.maxAge===0)throw new TypeError("`maxAge` must be a number greater than 0");this.maxSize=t.maxSize,this.maxAge=t.maxAge||Number.POSITIVE_INFINITY,this.onEviction=t.onEviction,this.cache=new Map,this.oldCache=new Map,this._size=0}_emitEvictions(t){if(typeof this.onEviction=="function")for(const[e,i]of t)this.onEviction(e,i.value)}_deleteIfExpired(t,e){return typeof e.expiry=="number"&&e.expiry<=Date.now()?(typeof this.onEviction=="function"&&this.onEviction(t,e.value),this.delete(t)):!1}_getOrDeleteIfExpired(t,e){if(this._deleteIfExpired(t,e)===!1)return e.value}_getItemValue(t,e){return e.expiry?this._getOrDeleteIfExpired(t,e):e.value}_peek(t,e){const i=e.get(t);return this._getItemValue(t,i)}_set(t,e){this.cache.set(t,e),this._size++,this._size>=this.maxSize&&(this._size=0,this._emitEvictions(this.oldCache),this.oldCache=this.cache,this.cache=new Map)}_moveToRecent(t,e){this.oldCache.delete(t),this._set(t,e)}*_entriesAscending(){for(const t of this.oldCache){const[e,i]=t;this.cache.has(e)||this._deleteIfExpired(e,i)===!1&&(yield t)}for(const t of this.cache){const[e,i]=t;this._deleteIfExpired(e,i)===!1&&(yield t)}}get(t){if(this.cache.has(t)){const e=this.cache.get(t);return this._getItemValue(t,e)}if(this.oldCache.has(t)){const e=this.oldCache.get(t);if(this._deleteIfExpired(t,e)===!1)return this._moveToRecent(t,e),e.value}}set(t,e,{maxAge:i=this.maxAge}={}){const n=typeof i=="number"&&i!==Number.POSITIVE_INFINITY?Date.now()+i:void 0;return this.cache.has(t)?this.cache.set(t,{value:e,expiry:n}):this._set(t,{value:e,expiry:n}),this}has(t){return this.cache.has(t)?!this._deleteIfExpired(t,this.cache.get(t)):this.oldCache.has(t)?!this._deleteIfExpired(t,this.oldCache.get(t)):!1}peek(t){if(this.cache.has(t))return this._peek(t,this.cache);if(this.oldCache.has(t))return this._peek(t,this.oldCache)}delete(t){const e=this.cache.delete(t);return e&&this._size--,this.oldCache.delete(t)||e}clear(){this.cache.clear(),this.oldCache.clear(),this._size=0}resize(t){if(!(t&&t>0))throw new TypeError("`maxSize` must be a number greater than 0");const e=[...this._entriesAscending()],i=e.length-t;i<0?(this.cache=new Map(e),this.oldCache=new Map,this._size=e.length):(i>0&&this._emitEvictions(e.slice(0,i)),this.oldCache=new Map(e.slice(i)),this.cache=new Map,this._size=0),this.maxSize=t}*keys(){for(const[t]of this)yield t}*values(){for(const[,t]of this)yield t}*[Symbol.iterator](){for(const t of this.cache){const[e,i]=t;this._deleteIfExpired(e,i)===!1&&(yield[e,i.value])}for(const t of this.oldCache){const[e,i]=t;this.cache.has(e)||this._deleteIfExpired(e,i)===!1&&(yield[e,i.value])}}*entriesDescending(){let t=[...this.cache];for(let e=t.length-1;e>=0;--e){const i=t[e],[n,o]=i;this._deleteIfExpired(n,o)===!1&&(yield[n,o.value])}t=[...this.oldCache];for(let e=t.length-1;e>=0;--e){const i=t[e],[n,o]=i;this.cache.has(n)||this._deleteIfExpired(n,o)===!1&&(yield[n,o.value])}}*entriesAscending(){for(const[t,e]of this._entriesAscending())yield[t,e.value]}get size(){if(!this._size)return this.oldCache.size;let t=0;for(const e of this.oldCache.keys())this.cache.has(e)||t++;return Math.min(this._size+t,this.maxSize)}entries(){return this.entriesAscending()}forEach(t,e=this){for(const[i,n]of this.entriesAscending())t.call(e,n,i,this)}get[Symbol.toStringTag](){return JSON.stringify([...this.entriesAscending()])}}async function pm(s){return new Promise(t=>setTimeout(t,s))}function gm(s,t){const e=Array.isArray(s)?s:Array.from(s),i=Array.isArray(t)?t:Array.from(t);return e.map((n,o)=>[n,i[o]])}class Ft extends Error{constructor(t){super(t),Error.captureStackTrace&&Error.captureStackTrace(this,Ft),this.name="AbortError"}}class mm extends Error{constructor(t,e){super(e),this.errors=t,this.message=e,this.name="AggregateError"}}const ym=mm;class xm{constructor(t,e,i=null){this.offset=t,this.length=e,this.data=i}get top(){return this.offset+this.length}}class Ro{constructor(t,e,i){this.offset=t,this.length=e,this.blockIds=i}}class _m extends pi{constructor(t,{blockSize:e=65536,cacheSize:i=100}={}){super(),this.source=t,this.blockSize=e,this.blockCache=new dm({maxSize:i,onEviction:(n,o)=>{this.evictedBlocks.set(n,o)}}),this.evictedBlocks=new Map,this.blockRequests=new Map,this.blockIdsToFetch=new Set,this.abortedBlockIds=new Set}get fileSize(){return this.source.fileSize}async fetch(t,e){const i=[],n=[],o=[];this.evictedBlocks.clear();for(const{offset:h,length:d}of t){let p=h+d;const{fileSize:g}=this;g!==null&&(p=Math.min(p,g));const y=Math.floor(h/this.blockSize)*this.blockSize;for(let v=y;v<p;v+=this.blockSize){const _=Math.floor(v/this.blockSize);!this.blockCache.has(_)&&!this.blockRequests.has(_)&&(this.blockIdsToFetch.add(_),n.push(_)),this.blockRequests.has(_)&&i.push(this.blockRequests.get(_)),o.push(_)}}await pm(),this.fetchBlocks(e);const r=[];for(const h of n)this.blockRequests.has(h)&&r.push(this.blockRequests.get(h));await Promise.allSettled(i),await Promise.allSettled(r);const a=[],l=o.filter(h=>this.abortedBlockIds.has(h)||!this.blockCache.has(h));if(l.forEach(h=>this.blockIdsToFetch.add(h)),l.length>0&&e&&!e.aborted){this.fetchBlocks(null);for(const h of l){const d=this.blockRequests.get(h);if(!d)throw new Error(`Block ${h} is not in the block requests`);a.push(d)}await Promise.allSettled(a)}if(e&&e.aborted)throw new Ft("Request was aborted");const c=o.map(h=>this.blockCache.get(h)||this.evictedBlocks.get(h)),u=c.filter(h=>!h);if(u.length)throw new ym(u,"Request failed");const f=new Map(gm(o,c));return this.readSliceData(t,f)}fetchBlocks(t){if(this.blockIdsToFetch.size>0){const e=this.groupBlocks(this.blockIdsToFetch),i=this.source.fetch(e,t);for(let n=0;n<e.length;++n){const o=e[n];for(const r of o.blockIds)this.blockRequests.set(r,(async()=>{try{const a=(await i)[n],l=r*this.blockSize,c=l-a.offset,u=Math.min(c+this.blockSize,a.data.byteLength),f=a.data.slice(c,u),h=new xm(l,f.byteLength,f,r);this.blockCache.set(r,h),this.abortedBlockIds.delete(r)}catch(a){if(a.name==="AbortError")a.signal=t,this.blockCache.delete(r),this.abortedBlockIds.add(r);else throw a}finally{this.blockRequests.delete(r)}})())}this.blockIdsToFetch.clear()}}groupBlocks(t){const e=Array.from(t).sort((r,a)=>r-a);if(e.length===0)return[];let i=[],n=null;const o=[];for(const r of e)n===null||n+1===r?(i.push(r),n=r):(o.push(new Ro(i[0]*this.blockSize,i.length*this.blockSize,i)),i=[r],n=r);return o.push(new Ro(i[0]*this.blockSize,i.length*this.blockSize,i)),o}readSliceData(t,e){return t.map(i=>{let n=i.offset+i.length;this.fileSize!==null&&(n=Math.min(this.fileSize,n));const o=Math.floor(i.offset/this.blockSize),r=Math.floor(n/this.blockSize),a=new ArrayBuffer(i.length),l=new Uint8Array(a);for(let c=o;c<=r;++c){const u=e.get(c),f=u.offset-i.offset,h=u.top-n;let d=0,p=0,g;f<0?d=-f:f>0&&(p=f),h<0?g=u.length-d:g=n-u.offset-d;const y=new Uint8Array(u.data,d,g);l.set(y,p)}return a})}}class Vs{get ok(){return this.status>=200&&this.status<=299}get status(){throw new Error("not implemented")}getHeader(t){throw new Error("not implemented")}async getData(){throw new Error("not implemented")}}class gi{constructor(t){this.url=t}async request({headers:t,signal:e}={}){throw new Error("request is not implemented")}}class vm extends Vs{constructor(t){super(),this.response=t}get status(){return this.response.status}getHeader(t){return this.response.headers.get(t)}async getData(){return this.response.arrayBuffer?await this.response.arrayBuffer():(await this.response.buffer()).buffer}}class bm extends gi{constructor(t,e){super(t),this.credentials=e}async request({headers:t,signal:e}={}){const i=await fetch(this.url,{headers:t,credentials:this.credentials,signal:e});return new vm(i)}}class Cm extends Vs{constructor(t,e){super(),this.xhr=t,this.data=e}get status(){return this.xhr.status}getHeader(t){return this.xhr.getResponseHeader(t)}async getData(){return this.data}}class wm extends gi{constructRequest(t,e){return new Promise((i,n)=>{const o=new XMLHttpRequest;o.open("GET",this.url),o.responseType="arraybuffer";for(const[r,a]of Object.entries(t))o.setRequestHeader(r,a);o.onload=()=>{const r=o.response;i(new Cm(o,r))},o.onerror=n,o.onabort=()=>n(new Ft("Request aborted")),o.send(),e&&(e.aborted&&o.abort(),e.addEventListener("abort",()=>o.abort()))})}async request({headers:t,signal:e}={}){return await this.constructRequest(t,e)}}class Pm extends Vs{constructor(t,e){super(),this.response=t,this.dataPromise=e}get status(){return this.response.statusCode}getHeader(t){return this.response.headers[t]}async getData(){return await this.dataPromise}}class Tm extends gi{constructor(t){super(t),this.parsedUrl=xi.parse(this.url),this.httpApi=this.parsedUrl.protocol==="http:"?xi:xi}constructRequest(t,e){return new Promise((i,n)=>{const o=this.httpApi.get({...this.parsedUrl,headers:t},r=>{const a=new Promise(l=>{const c=[];r.on("data",u=>{c.push(u)}),r.on("end",()=>{const u=Ia.concat(c).buffer;l(u)}),r.on("error",n)});i(new Pm(r,a))});o.on("error",n),e&&(e.aborted&&o.destroy(new Ft("Request aborted")),e.addEventListener("abort",()=>o.destroy(new Ft("Request aborted"))))})}async request({headers:t,signal:e}={}){return await this.constructRequest(t,e)}}class mi extends pi{constructor(t,e,i,n){super(),this.client=t,this.headers=e,this.maxRanges=i,this.allowFullFile=n,this._fileSize=null}async fetch(t,e){return this.maxRanges>=t.length?this.fetchSlices(t,e):(this.maxRanges>0&&t.length>1,Promise.all(t.map(i=>this.fetchSlice(i,e))))}async fetchSlices(t,e){const i=await this.client.request({headers:{...this.headers,Range:`bytes=${t.map(({offset:n,length:o})=>`${n}-${n+o}`).join(",")}`},signal:e});if(i.ok)if(i.status===206){const{type:n,params:o}=fm(i.getHeader("content-type"));if(n==="multipart/byteranges"){const f=hm(await i.getData(),o.boundary);return this._fileSize=f[0].fileSize||null,f}const r=await i.getData(),{start:a,end:l,total:c}=fs(i.getHeader("content-range"));this._fileSize=c||null;const u=[{data:r,offset:a,length:l-a}];if(t.length>1){const f=await Promise.all(t.slice(1).map(h=>this.fetchSlice(h,e)));return u.concat(f)}return u}else{if(!this.allowFullFile)throw new Error("Server responded with full file");const n=await i.getData();return this._fileSize=n.byteLength,[{data:n,offset:0,length:n.byteLength}]}else throw new Error("Error fetching data.")}async fetchSlice(t,e){const{offset:i,length:n}=t,o=await this.client.request({headers:{...this.headers,Range:`bytes=${i}-${i+n}`},signal:e});if(o.ok)if(o.status===206){const r=await o.getData(),{total:a}=fs(o.getHeader("content-range"));return this._fileSize=a||null,{data:r,offset:i,length:n}}else{if(!this.allowFullFile)throw new Error("Server responded with full file");const r=await o.getData();return this._fileSize=r.byteLength,{data:r,offset:0,length:r.byteLength}}else throw new Error("Error fetching data.")}get fileSize(){return this._fileSize}}function yi(s,{blockSize:t,cacheSize:e}){return t===null?s:new _m(s,{blockSize:t,cacheSize:e})}function Lm(s,{headers:t={},credentials:e,maxRanges:i=0,allowFullFile:n=!1,...o}={}){const r=new bm(s,e),a=new mi(r,t,i,n);return yi(a,o)}function Sm(s,{headers:t={},maxRanges:e=0,allowFullFile:i=!1,...n}={}){const o=new wm(s),r=new mi(o,t,e,i);return yi(r,n)}function Am(s,{headers:t={},maxRanges:e=0,allowFullFile:i=!1,...n}={}){const o=new Tm(s),r=new mi(o,t,e,i);return yi(r,n)}function Em(s,{headers:t={},maxRanges:e=0,allowFullFile:i=!1,...n}={}){const o=new mi(s,t,e,i);return yi(o,n)}function Im(s,{forceXHR:t=!1,...e}={}){return typeof fetch=="function"&&!t?Lm(s,e):typeof XMLHttpRequest<"u"?Sm(s,e):Am(s,e)}class Mm extends pi{constructor(t){super(),this.arrayBuffer=t}fetchSlice(t,e){if(e&&e.aborted)throw new Ft("Request aborted");return this.arrayBuffer.slice(t.offset,t.offset+t.length)}}function Om(s){return new Mm(s)}class Rm extends pi{constructor(t){super(),this.file=t}async fetchSlice(t,e){return new Promise((i,n)=>{const o=this.file.slice(t.offset,t.offset+t.length),r=new FileReader;r.onload=a=>i(a.target.result),r.onerror=n,r.onabort=n,r.readAsArrayBuffer(o),e&&e.addEventListener("abort",()=>r.abort())})}}function zm(s){return new Rm(s)}function hs(s){switch(s){case N.BYTE:case N.ASCII:case N.SBYTE:case N.UNDEFINED:return 1;case N.SHORT:case N.SSHORT:return 2;case N.LONG:case N.SLONG:case N.FLOAT:case N.IFD:return 4;case N.RATIONAL:case N.SRATIONAL:case N.DOUBLE:case N.LONG8:case N.SLONG8:case N.IFD8:return 8;default:throw new RangeError(`Invalid field type: ${s}`)}}function Bm(s){const t=s.GeoKeyDirectory;if(!t)return null;const e={};for(let i=4;i<=t[3]*4;i+=4){const n=Ug[t[i]],o=t[i+1]?he[t[i+1]]:null,r=t[i+2],a=t[i+3];let l=null;if(!o)l=a;else{if(l=s[o],typeof l>"u"||l===null)throw new Error(`Could not get value of geoKey '${n}'.`);typeof l=="string"?l=l.substring(a,a+r-1):l.subarray&&(l=l.subarray(a,a+r),r===1&&(l=l[0]))}e[n]=l}return e}function Dt(s,t,e,i){let n=null,o=null;const r=hs(t);switch(t){case N.BYTE:case N.ASCII:case N.UNDEFINED:n=new Uint8Array(e),o=s.readUint8;break;case N.SBYTE:n=new Int8Array(e),o=s.readInt8;break;case N.SHORT:n=new Uint16Array(e),o=s.readUint16;break;case N.SSHORT:n=new Int16Array(e),o=s.readInt16;break;case N.LONG:case N.IFD:n=new Uint32Array(e),o=s.readUint32;break;case N.SLONG:n=new Int32Array(e),o=s.readInt32;break;case N.LONG8:case N.IFD8:n=new Array(e),o=s.readUint64;break;case N.SLONG8:n=new Array(e),o=s.readInt64;break;case N.RATIONAL:n=new Uint32Array(e*2),o=s.readUint32;break;case N.SRATIONAL:n=new Int32Array(e*2),o=s.readInt32;break;case N.FLOAT:n=new Float32Array(e),o=s.readFloat32;break;case N.DOUBLE:n=new Float64Array(e),o=s.readFloat64;break;default:throw new RangeError(`Invalid field type: ${t}`)}if(t===N.RATIONAL||t===N.SRATIONAL)for(let a=0;a<e;a+=2)n[a]=o.call(s,i+a*r),n[a+1]=o.call(s,i+(a*r+4));else for(let a=0;a<e;++a)n[a]=o.call(s,i+a*r);return t===N.ASCII?new TextDecoder("utf-8").decode(n):n}class Fm{constructor(t,e,i){this.fileDirectory=t,this.geoKeyDirectory=e,this.nextIFDByteOffset=i}}class je extends Error{constructor(t){super(`No image at index ${t}`),this.index=t}}class km{async readRasters(t={}){const{window:e,width:i,height:n}=t;let{resX:o,resY:r,bbox:a}=t;const l=await this.getImage();let c=l;const u=await this.getImageCount(),f=l.getBoundingBox();if(e&&a)throw new Error('Both "bbox" and "window" passed.');if(i||n){if(e){const[p,g]=l.getOrigin(),[y,v]=l.getResolution();a=[p+e[0]*y,g+e[1]*v,p+e[2]*y,g+e[3]*v]}const d=a||f;if(i){if(o)throw new Error("Both width and resX passed");o=(d[2]-d[0])/i}if(n){if(r)throw new Error("Both width and resY passed");r=(d[3]-d[1])/n}}if(o||r){const d=[];for(let p=0;p<u;++p){const g=await this.getImage(p),{SubfileType:y,NewSubfileType:v}=g.fileDirectory;(p===0||y===2||v&1)&&d.push(g)}d.sort((p,g)=>p.getWidth()-g.getWidth());for(let p=0;p<d.length;++p){const g=d[p],y=(f[2]-f[0])/g.getWidth(),v=(f[3]-f[1])/g.getHeight();if(c=g,o&&o>y||r&&r>v)break}}let h=e;if(a){const[d,p]=l.getOrigin(),[g,y]=c.getResolution(l);h=[Math.round((a[0]-d)/g),Math.round((a[1]-p)/y),Math.round((a[2]-d)/g),Math.round((a[3]-p)/y)],h=[Math.min(h[0],h[2]),Math.min(h[1],h[3]),Math.max(h[0],h[2]),Math.max(h[1],h[3])]}return c.readRasters({...t,window:h})}}class Qt extends km{constructor(t,e,i,n,o={}){super(),this.source=t,this.littleEndian=e,this.bigTiff=i,this.firstIFDOffset=n,this.cache=o.cache||!1,this.ifdRequests=[],this.ghostValues=null}async getSlice(t,e){const i=this.bigTiff?4048:1024;return new am((await this.source.fetch([{offset:t,length:typeof e<"u"?e:i}]))[0],t,this.littleEndian,this.bigTiff)}async parseFileDirectoryAt(t){const e=this.bigTiff?20:12,i=this.bigTiff?8:2;let n=await this.getSlice(t);const o=this.bigTiff?n.readUint64(t):n.readUint16(t),r=o*e+(this.bigTiff?16:6);n.covers(t,r)||(n=await this.getSlice(t,r));const a={};let l=t+(this.bigTiff?8:2);for(let f=0;f<o;l+=e,++f){const h=n.readUint16(l),d=n.readUint16(l+2),p=this.bigTiff?n.readUint64(l+4):n.readUint32(l+4);let g,y;const v=hs(d),_=l+(this.bigTiff?12:8);if(v*p<=(this.bigTiff?8:4))g=Dt(n,d,p,_);else{const C=n.readOffset(_),w=hs(d)*p;if(n.covers(C,w))g=Dt(n,d,p,C);else{const A=await this.getSlice(C,w);g=Dt(A,d,p,C)}}p===1&&Dg.indexOf(h)===-1&&!(d===N.RATIONAL||d===N.SRATIONAL)?y=g[0]:y=g,a[he[h]]=y}const c=Bm(a),u=n.readOffset(t+i+e*o);return new Fm(a,c,u)}async requestIFD(t){if(this.ifdRequests[t])return this.ifdRequests[t];if(t===0)return this.ifdRequests[t]=this.parseFileDirectoryAt(this.firstIFDOffset),this.ifdRequests[t];if(!this.ifdRequests[t-1])try{this.ifdRequests[t-1]=this.requestIFD(t-1)}catch(e){throw e instanceof je?new je(t):e}return this.ifdRequests[t]=(async()=>{const e=await this.ifdRequests[t-1];if(e.nextIFDByteOffset===0)throw new je(t);return this.parseFileDirectoryAt(e.nextIFDByteOffset)})(),this.ifdRequests[t]}async getImage(t=0){const e=await this.requestIFD(t);return new om(e.fileDirectory,e.geoKeyDirectory,this.dataView,this.littleEndian,this.cache,this.source)}async getImageCount(){let t=0,e=!0;for(;e;)try{await this.requestIFD(t),++t}catch(i){if(i instanceof je)e=!1;else throw i}return t}async getGhostValues(){const t=this.bigTiff?16:8;if(this.ghostValues)return this.ghostValues;const e="GDAL_STRUCTURAL_METADATA_SIZE=",i=e.length+100;let n=await this.getSlice(t,i);if(e===Dt(n,N.ASCII,e.length,t)){const r=Dt(n,N.ASCII,i,t).split(`
`)[0],a=Number(r.split("=")[1].split(" ")[0])+r.length;a>i&&(n=await this.getSlice(t,a));const l=Dt(n,N.ASCII,a,t);this.ghostValues={},l.split(`
`).filter(c=>c.length>0).map(c=>c.split("=")).forEach(([c,u])=>{this.ghostValues[c]=u})}return this.ghostValues}static async fromSource(t,e,i){const n=(await t.fetch([{offset:0,length:1024}],i))[0],o=new rm(n),r=o.getUint16(0,0);let a;if(r===18761)a=!0;else if(r===19789)a=!1;else throw new TypeError("Invalid byte order value.");const l=o.getUint16(2,a);let c;if(l===42)c=!1;else if(l===43){if(c=!0,o.getUint16(4,a)!==8)throw new Error("Unsupported offset byte-size.")}else throw new TypeError("Invalid magic number.");const u=c?o.getUint64(8,a):o.getUint32(4,a);return new Qt(t,a,c,u,e)}close(){return typeof this.source.close=="function"?this.source.close():!1}}async function Dm(s,t={},e){return Qt.fromSource(Im(s,t),e)}async function Nm(s,t={},e){return Qt.fromSource(Em(s,t),e)}async function Um(s,t){return Qt.fromSource(Om(s),t)}async function Gm(s,t){return Qt.fromSource(zm(s),t)}let Ni=null;function wa(){return Ni===null&&(Ni=new cm),Ni}async function Pa(s,t){const e={...t,interleave:!0,enableAlpha:!0},i=await s.readRGB(e);return{texture:Ta(i),height:i.height,width:i.width}}function Ta(s){const{height:t,width:e}=s;if(s.length===t*e*4)return new ImageData(new Uint8ClampedArray(s),e,t);if(s.length===t*e*3){const i=s.length/3*4,n=new Uint8ClampedArray(i);for(let o=0;o<s.length/3;++o)n[o*4]=s[o*3],n[o*4+1]=s[o*3+1],n[o*4+2]=s[o*3+2],n[o*4+3]=255;return new ImageData(n,e,t)}else throw new Error(`Unexpected number of channels in raster data: ${s.length/(t*e)}`)}function La(s){const t=s.length/3,e=new Uint8ClampedArray(t*4),i=0,n=t,o=t*2;for(let r=0;r<t;r++)e[4*r+0]=s[i+r]>>8,e[4*r+1]=s[n+r]>>8,e[4*r+2]=s[o+r]>>8,e[4*r+3]=255;return new ImageData(e,t,1)}async function Sa(s){return typeof s=="string"?Dm(s):s instanceof ArrayBuffer?Um(s):s instanceof Blob?Gm(s):s instanceof gi?Nm(s):s}function Aa(s,t){const e=s.getBoundingBox(),[i,n,o,r]=e,a=[t.forward([i,n]),t.forward([o,n]),t.forward([o,r]),t.forward([i,r])],l=a.map(p=>p[0]),c=a.map(p=>p[1]),u=Math.min(...l),f=Math.min(...c),h=Math.max(...l),d=Math.max(...c);return{west:u,south:f,east:h,north:d}}function jm(s){if(!s)return null;const t=s?.[s?.length-1]==="\0"?s.slice(0,-1):s;return t?.length>0?parseFloat(t):null}const Vm=`
  const vec3 D65 = vec3(
      0.95047, // Xn
      1.00000, // Yn
      1.08883 // Zn
  );

  vec3 cielabToRgb(vec3 labTex) {
    // labTex in [0,1] from RGB8 texture
    float L = labTex.r * 255.0;
    float a = (labTex.g - 0.5) * 255.0;
    float b = (labTex.b - 0.5) * 255.0;

    float y = (L + 16.0) / 116.0;
    float x = (a / 500.0) + y;
    float z = y - (b / 200.0);

    vec3 xyz;
    vec3 v = vec3(x, y, z);
    vec3 v3 = v * v * v;

    xyz = D65 * mix(
      (v - 16.0 / 116.0) / 7.787,
      v3,
      step(0.008856, v3)
    );

    vec3 rgb = mat3(
      3.2406, -1.5372, -0.4986,
      -0.9689, 1.8758, 0.0415,
      0.0557, -0.2040, 1.0570
    ) * xyz;

    // sRGB gamma
    rgb = mix(
      12.92 * rgb,
      1.055 * pow(rgb, vec3(1.0 / 2.4)) - 0.055,
      step(0.0031308, rgb)
    );

    return clamp(rgb, 0.0, 1.0);
  }
`,$m={name:"cielab-to-rgb",inject:{"fs:#decl":Vm,"fs:DECKGL_FILTER_COLOR":`
      color.rgb = cielabToRgb(color);
    `}},Wm=`
  vec3 cmykToRgb(vec4 cmyk) {
    // cmyk in [0.0, 1.0]
    float invK = 1.0 - cmyk.a;

    return vec3(
        (1.0 - cmyk.r) * invK,
        (1.0 - cmyk.g) * invK,
        (1.0 - cmyk.b) * invK
    );
  }
`,qm={name:"cmyk-to-rgb",inject:{"fs:#decl":Wm,"fs:DECKGL_FILTER_COLOR":`
      color.rgb = cmykToRgb(color);
    `}},Hm=`
  vec3 ycbcrToRgb(vec3 ycbcr) {
    // ycbcr in [0.0, 1.0]
    float y = ycbcr.r;
    float cb = ycbcr.g - 0.5;
    float cr = ycbcr.b - 0.5;

    return vec3(
        y + 1.40200 * cr,
        y - 0.34414 * cb - 0.71414 * cr,
        y + 1.77200 * cb
    );
  }
`,Km={name:"ycbcr-to-rgb",inject:{"fs:#decl":Hm,"fs:DECKGL_FILTER_COLOR":`
      color.rgb = ycbcrToRgb(color.rgb);
    `}},Ym={name:"colormap",inject:{"fs:#decl":"uniform sampler2D colormapTexture;","fs:DECKGL_FILTER_COLOR":`
      color = texture(colormapTexture, vec2(color.r, 0.));
    `},getUniforms:s=>({colormapTexture:s.colormapTexture})},ds="nodata",Zm=`uniform ${ds}Uniforms {
  float value;
} ${ds};
`,Xm={name:ds,fs:Zm,inject:{"fs:DECKGL_FILTER_COLOR":`
    if (color.r == nodata.value) {
      discard;
    }
    `},uniformTypes:{value:"f32"},getUniforms:s=>({value:s.value})};function Jm(s,t,e){const i=s.getFileDirectory(),n=i.SamplesPerPixel,o=$s(n,i.BitsPerSample,i.SampleFormat);return{data:t,format:o,width:e.width,height:e.height}}function $s(s,t,e){const i=Qm(s),n=ty(t),o=ey(e),r=`${i}:${o}:${n}`,a=iy[r];if(!a)throw new Error(`Unsupported texture format for SamplesPerPixel=${s}, BitsPerSample=${t}, SampleFormat=${e}`);return a}function Qm(s){if(s===1||s===2||s===3||s===4)return s;throw new Error(`Unsupported SamplesPerPixel ${s}. Only 1, 2, 3, or 4 are supported.`)}function ty(s){const t=s[0];for(let e=1;e<s.length;e++)if(s[e]!==t)throw new Error(`Unsupported varying BitsPerSample ${s}. All samples must have the same bit width.`);if(t!==8&&t!==16&&t!==32)throw new Error(`Unsupported BitsPerSample ${t}. Only 8, 16, or 32 are supported.`);return t}function ey(s){const t=s[0];for(let e=1;e<s.length;e++)if(s[e]!==t)throw new Error(`Unsupported varying SampleFormat ${s}. All samples must have the same format.`);switch(t){case 1:return"unorm";case 2:return"sint";case 3:return"float";default:throw new Error(`Unsupported SampleFormat ${s}`)}}const iy={"1:sint:8":"r8sint","1:uint:8":"r8uint","1:unorm:8":"r8unorm","1:float:16":"r16float","1:sint:16":"r16sint","1:uint:16":"r16uint","1:unorm:16":"r16unorm","2:sint:8":"rg8sint","2:uint:8":"rg8uint","2:unorm:8":"rg8unorm","1:float:32":"r32float","1:sint:32":"r32sint","1:uint:32":"r32uint","2:float:16":"rg16float","2:sint:16":"rg16sint","2:uint:16":"rg16uint","2:unorm:16":"rg16unorm","4:sint:8":"rgba8sint","4:uint:8":"rgba8uint","4:unorm:8":"rgba8unorm","3:uint:16":"rgb16unorm-webgl","2:float:32":"rg32float","2:sint:32":"rg32sint","2:uint:32":"rg32uint","4:float:16":"rgba16float","4:sint:16":"rgba16sint","4:uint:16":"rgba16uint","4:unorm:16":"rgba16unorm","3:float:32":"rgb32float-webgl","4:float:32":"rgba32float","4:sint:32":"rgba32sint","4:uint:32":"rgba32uint"},sy=Object.freeze(Object.defineProperty({__proto__:null,createTextureProps:Jm,inferTextureFormat:$s},Symbol.toStringTag,{value:"Module"}));var Pt;(function(s){s[s.WhiteIsZero=0]="WhiteIsZero",s[s.BlackIsZero=1]="BlackIsZero",s[s.RGB=2]="RGB",s[s.Palette=3]="Palette",s[s.TransparencyMask=4]="TransparencyMask",s[s.CMYK=5]="CMYK",s[s.YCbCr=6]="YCbCr",s[s.CIELab=8]="CIELab",s[s.ICCLab=9]="ICCLab"})(Pt||(Pt={}));var zo;(function(s){s[s.Chunky=1]="Chunky",s[s.Planar=2]="Planar"})(zo||(zo={}));function ny(s,t){const{SampleFormat:e}=s;if(e[0]===1)return oy(s,t);throw new Error(`Inferring render pipeline for non-unsigned integers not yet supported. Found SampleFormat: ${e}`)}function oy(s,t){const{BitsPerSample:e,ColorMap:i,GDAL_NODATA:n,PhotometricInterpretation:o,SampleFormat:r,SamplesPerPixel:a}=s,l=[{module:ta,props:{textureName:p=>p.texture}}],c=jm(n);if(c!==null){const p=c/255;l.push({module:Xm,props:{value:p}})}const u=ry(o,t,i);u&&l.push(u);const f=o===Pt.Palette?{magFilter:"nearest",minFilter:"nearest"}:{magFilter:"linear",minFilter:"linear"};return{getTileData:async(p,g)=>{const{device:y}=g,v={...g,interleave:!0};let _=await p.readRasters(v),C=a;a===3&&(_=Ta(_),C=4);const w=$s(C,e,r);return{texture:y.createTexture({data:_,format:w,width:_.width,height:_.height,sampler:f}),height:_.height,width:_.width}},renderTile:p=>l.map((g,y)=>ay(g,p))}}function ry(s,t,e){switch(s){case Pt.RGB:return null;case Pt.Palette:{if(!e)throw new Error("ColorMap is required for PhotometricInterpretation Palette");const{data:i,width:n,height:o}=La(e),r=t.createTexture({data:i,format:"rgba8unorm",width:n,height:o,sampler:{minFilter:"nearest",magFilter:"nearest",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge"}});return{module:Ym,props:{colormapTexture:r}}}case Pt.CMYK:return{module:qm};case Pt.YCbCr:return{module:Km};case Pt.CIELab:return{module:$m};default:throw new Error(`Unsupported PhotometricInterpretation ${s}`)}}function ay(s,t){const{module:e,props:i}=s;if(!i)return{module:e};const n={};for(const[o,r]of Object.entries(i)){const a=typeof r=="function"?r(t):r;a!==void 0&&(n[o]=a)}return{module:e,props:n}}async function Ws(s){const t=s.ProjectedCSTypeGeoKey||s.GeographicTypeGeoKey||null,e=await ly(t);if(!e)return null;const i=Ea(e);return{def:e,parsed:i,coordinatesUnits:i.units}}async function ly(s){if(s===null)return null;const t=`https://epsg.io/${s}.json`,e=await fetch(t);if(!e.ok)throw new Error(`Failed to fetch projection data from ${t}`);return await e.json()}function Ea(s){const t="__deck.gl-geotiff-internal__";return zt.defs(t,s),zt.defs(t)}const cy=Object.freeze(Object.defineProperty({__proto__:null,epsgIoGeoKeyParser:Ws,parseCrs:Ea},Symbol.toStringTag,{value:"Module"})),uy={geoKeysParser:Ws,debug:!1,debugOpacity:.5};class fy extends It{static layerName="COGLayer";static defaultProps=uy;initializeState(){this.setState({})}updateState(t){super.updateState(t);const{props:e,oldProps:i,changeFlags:n}=t;(n.dataChanged||e.geotiff!==i.geotiff)&&this._parseGeoTIFF()}async _parseGeoTIFF(){const t=await Sa(this.props.geotiff),e=this.props.geoKeysParser,i=await ra(t,e),n=await t.getImage(),o=await t.getImageCount(),r=[];for(let d=0;d<o;d++)r.push(await t.getImage(d));const a=await e(n.getGeoKeys());if(!a)throw new Error("Could not determine source projection from GeoTIFF geo keys");const l=zt(a.def,"EPSG:4326"),c=(d,p)=>l.forward([d,p],!1),u=(d,p)=>l.inverse([d,p],!1);if(this.props.onGeoTIFFLoad){const d=Aa(n,l);this.props.onGeoTIFFLoad(t,{projection:a,geographicBounds:d})}const{getTileData:f,renderTile:h}=ny(n.fileDirectory,this.context.device);this.setState({metadata:i,forwardReproject:c,inverseReproject:u,images:r,defaultGetTileData:f,defaultRenderTile:h})}async _getTileData(t,e,i){const{signal:n}=t,{x:o,y:r,z:a}=t.index,l=e[e.length-1-a],c=l.getHeight(),u=l.getWidth(),f=i.tileMatrices[a],{tileWidth:h,tileHeight:d}=f,p=hy(o,r,f),{forwardTransform:g,inverseTransform:y}=ks(p),v=[o*h,r*d,Math.min((o+1)*h,u),Math.min((r+1)*d,c)];return{data:await(this.props.getTileData||this.state.defaultGetTileData)(l,{device:this.context.device,window:v,signal:n,pool:this.props.pool||wa()}),forwardTransform:g,inverseTransform:y}}_renderSubLayers(t,e,i,n){const{maxError:o,debug:r,debugOpacity:a}=this.props,{tile:l}=t;if(!t.data)return null;const{data:c,forwardTransform:u,inverseTransform:f}=t.data,h=[];if(c){const{height:d,width:p}=c,g=this.props.renderTile||this.state.defaultRenderTile;h.push(new ea({id:`${t.id}-raster`,width:p,height:d,renderPipeline:g(c),maxError:o,reprojectionFns:{forwardTransform:u,inverseTransform:f,forwardReproject:i,inverseReproject:n},debug:r,debugOpacity:a}))}if(r){const d=l?.projectedBounds;if(!d||!e)return[];const{topLeft:p,topRight:g,bottomLeft:y,bottomRight:v}=d,_=e.projectToWgs84(p),C=e.projectToWgs84(g),w=e.projectToWgs84(v),A=e.projectToWgs84(y),I=[_,C,w,A,_];h.push(new ye({id:`${l.id}-bounds`,data:[{path:I}],getPath:z=>z.path,getColor:[255,0,0,255],getWidth:2,widthUnits:"pixels",pickable:!1}))}return h}renderTileLayer(t,e,i,n){class o extends Qp{constructor(a){super(t,a)}}return new Bs({id:`cog-tile-layer-${this.id}`,TilesetClass:o,getTileData:async r=>this._getTileData(r,n,t),renderSubLayers:r=>this._renderSubLayers(r,t,e,i)})}renderLayers(){const{forwardReproject:t,inverseReproject:e,metadata:i,images:n}=this.state;return!t||!e||!i||!n?null:this.renderTileLayer(i,t,e,n)}}function hy(s,t,e){const{tileWidth:i,tileHeight:n}=e,o=s*i,r=t*n,[a,l,c,u,f,h]=e.geotransform,d=a*o+l*r+c,p=u*o+f*r+h;return[a,l,d,u,f,p]}const dy={geoKeysParser:Ws};class py extends It{static layerName="GeoTIFFLayer";static defaultProps=dy;initializeState(){this.setState({})}updateState(t){super.updateState(t);const{props:e,oldProps:i,changeFlags:n}=t;(n.dataChanged||e.geotiff!==i.geotiff||e.maxError!==i.maxError)&&this._parseGeoTIFF()}async _parseGeoTIFF(){const t=await Sa(this.props.geotiff),e=await t.getImage(),i=this.props.geoKeysParser,n=await i(e.getGeoKeys());if(!n)throw new Error("Could not determine source projection from GeoTIFF geo keys");const o=zt(n.def,"EPSG:4326");if(this.props.onGeoTIFFLoad){const u=Aa(e,o);this.props.onGeoTIFFLoad(t,{projection:n,geographicBounds:u})}const r=await sa(t,n.def),{texture:a,height:l,width:c}=await Pa(e,{pool:this.props.pool||wa()});this.setState({reprojectionFns:r,imageData:a,height:l,width:c})}renderLayers(){const{reprojectionFns:t,imageData:e,height:i,width:n}=this.state;if(!t||!e||!i||!n)return null;const{maxError:o,debug:r,debugOpacity:a}=this.props;return new ea(this.getSubLayerProps({id:"raster",width:n,height:i,reprojectionFns:t,maxError:o,texture:e,debug:r,debugOpacity:a}))}}const wy=Object.freeze(Object.defineProperty({__proto__:null,COGLayer:fy,GeoTIFFLayer:py,extractGeotiffReprojectors:sa,fromGeoTransform:ks,loadRgbImage:Pa,parseCOGTileMatrixSet:ra,parseColormap:La,proj:cy,texture:sy},Symbol.toStringTag,{value:"Module"}));export{by as L,Cy as a,wy as i};
//# sourceMappingURL=index-CSjbGEpl.js.map
