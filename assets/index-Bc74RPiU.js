import{w as Er,p as Ie}from"./crs-D0ihW-CS.js";import{i as ms,a as Ir,e as Or,b as st,t as Rr,c as zr,G as ys,S as Ce,P as xt,p as Br,d as eo,f as Fr}from"./index-CYD72MNp.js";import{L as Nr,ah as kr,ai as Ur,aj as _s,ak as nt,al as Dr,am as io,an as $r,ao as jr,ap as Oe,aq as Gr,ar as Vr,as as Wr,at as so,au as Hr,av as qr,aw as Yr,ax as Kr,ay as xs,az as Zr,aA as Ze,aB as Xr,aC as Jr,aD as Qr,aE as ta,aF as ea,aG as ia,aH as sa,aI as na,aJ as oa,R as vs,u as ra,l as k,B as Z,C as aa,aK as ca,aL as la,aM as ua,aN as fa,a6 as yi,v as ha,aO as da,aP as no,aQ as pa,T as it,S as oo,K as ga,d as _i,ab as Re,aR as Xe,j as K,$ as ht,aS as ma,Z as Wi,G as ro,aT as ya,O as ot,a1 as _a,aU as Ct,Y as oe,aV as ze,aW as At,aX as vt,aY as Je,aZ as zt,X as xa,a_ as va,N as xi,U as ao,a$ as ee,V as R,b0 as ba,b1 as vi,_ as Pe,a0 as co,a5 as Be,M as Et,a4 as Ca}from"./webgl-developer-tools-D1H981MZ.js";import{R as Zt,S as Pa,a as dt,g as wa,r as La,b as Ta,n as Aa,T as Sa,c as Ma,d as Ea,W as Qe}from"./webgl-device-CjKpv7Qt.js";import{g as Ia}from"./_commonjsHelpers-CE1G-McA.js";import"./index-B3WOwwRH.js";import"./utils-BFUSjNrH.js";import"./I18N-BC6F-L_M.js";const Oa="Queued Requests",Ra="Active Requests",za="Cancelled Requests",Ba="Queued Requests Ever",Fa="Active Requests Ever",Na={id:"request-scheduler",throttleRequests:!0,maxRequests:6,debounceTime:0};class ka{props;stats;activeRequestCount=0;requestQueue=[];requestMap=new Map;updateTimer=null;constructor(t={}){this.props={...Na,...t},this.stats=new Nr({id:this.props.id}),this.stats.get(Oa),this.stats.get(Ra),this.stats.get(za),this.stats.get(Ba),this.stats.get(Fa)}setProps(t){t.throttleRequests!==void 0&&(this.props.throttleRequests=t.throttleRequests),t.maxRequests!==void 0&&(this.props.maxRequests=t.maxRequests),t.debounceTime!==void 0&&(this.props.debounceTime=t.debounceTime)}scheduleRequest(t,e=()=>0){if(!this.props.throttleRequests)return Promise.resolve({done:()=>{}});if(this.requestMap.has(t))return this.requestMap.get(t);const i={handle:t,priority:0,getPriority:e},n=new Promise(o=>(i.resolve=o,i));return this.requestQueue.push(i),this.requestMap.set(t,n),this._issueNewRequests(),n}_issueRequest(t){const{handle:e,resolve:i}=t;let n=!1;const o=()=>{n||(n=!0,this.requestMap.delete(e),this.activeRequestCount--,this._issueNewRequests())};return this.activeRequestCount++,i?i({done:o}):Promise.resolve({done:o})}_issueNewRequests(){this.updateTimer!==null&&clearTimeout(this.updateTimer),this.updateTimer=setTimeout(()=>this._issueNewRequestsAsync(),this.props.debounceTime)}_issueNewRequestsAsync(){this.updateTimer!==null&&clearTimeout(this.updateTimer),this.updateTimer=null;const t=Math.max(this.props.maxRequests-this.activeRequestCount,0);if(t!==0){this._updateAllRequests();for(let e=0;e<t;++e){const i=this.requestQueue.shift();i&&this._issueRequest(i)}}}_updateAllRequests(){const t=this.requestQueue;for(let e=0;e<t.length;++e){const i=t[e];this._updateRequest(i)||(t.splice(e,1),this.requestMap.delete(i.handle),e--)}t.sort((e,i)=>e.priority-i.priority)}_updateRequest(t){return t.priority=t.getPriority(t.handle),t.priority<0?(t.resolve(null),!1):!0}}function Ua(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function Da(s){return Array.isArray(s)?s.length===0||typeof s[0]=="number":!1}function $a(s){return Ua(s)||Da(s)}const ja=`out vec4 transform_output;
void main() {
  transform_output = vec4(0);
}`,Ga=`#version 300 es
${ja}`;function Va(s){const{input:t,inputChannels:e,output:i}={};if(!t)return Ga;if(!e)throw new Error("inputChannels");const n=Wa(e),o=Ha(t,e);return`#version 300 es
in ${n} ${t};
out vec4 ${i};
void main() {
  ${i} = ${o};
}`}function Wa(s){switch(s){case 1:return"float";case 2:return"vec2";case 3:return"vec3";case 4:return"vec4";default:throw new Error(`invalid channels: ${s}`)}}function Ha(s,t){switch(t){case 1:return`vec4(${s}, 0.0, 0.0, 1.0)`;case 2:return`vec4(${s}, 0.0, 1.0)`;case 3:return`vec4(${s}, 1.0)`;case 4:return s;default:throw new Error(`invalid channels: ${t}`)}}let re;class Hi extends kr{static get ZERO(){return re||(re=new Hi(0,0,0,0),Object.freeze(re)),re}constructor(t=0,e=0,i=0,n=0){super(-0,-0,-0,-0),Ur(t)&&arguments.length===1?this.copy(t):(_s.debug&&(nt(t),nt(e),nt(i),nt(n)),this[0]=t,this[1]=e,this[2]=i,this[3]=n)}set(t,e,i,n){return this[0]=t,this[1]=e,this[2]=i,this[3]=n,this.check()}copy(t){return this[0]=t[0],this[1]=t[1],this[2]=t[2],this[3]=t[3],this.check()}fromObject(t){return _s.debug&&(nt(t.x),nt(t.y),nt(t.z),nt(t.w)),this[0]=t.x,this[1]=t.y,this[2]=t.z,this[3]=t.w,this}toObject(t){return t.x=this[0],t.y=this[1],t.z=this[2],t.w=this[3],t}get ELEMENTS(){return 4}get z(){return this[2]}set z(t){this[2]=nt(t)}get w(){return this[3]}set w(t){this[3]=nt(t)}transform(t){return Dr(this,this,t),this.check()}transformByMatrix3(t){return io(this,this,t),this.check()}transformByMatrix2(t){return $r(this,this,t),this.check()}transformByQuaternion(t){return jr(this,this,t),this.check()}applyMatrix4(t){return t.transform(this,this),this}}function qa(){const s=new Oe(9);return Oe!=Float32Array&&(s[1]=0,s[2]=0,s[3]=0,s[5]=0,s[6]=0,s[7]=0),s[0]=1,s[4]=1,s[8]=1,s}function Ya(s,t){if(s===t){const e=t[1],i=t[2],n=t[5];s[1]=t[3],s[2]=t[6],s[3]=e,s[5]=t[7],s[6]=i,s[7]=n}else s[0]=t[0],s[1]=t[3],s[2]=t[6],s[3]=t[1],s[4]=t[4],s[5]=t[7],s[6]=t[2],s[7]=t[5],s[8]=t[8];return s}function Ka(s,t){const e=t[0],i=t[1],n=t[2],o=t[3],r=t[4],a=t[5],c=t[6],l=t[7],u=t[8],f=u*r-a*l,d=-u*o+a*c,h=l*o-r*c;let p=e*f+i*d+n*h;return p?(p=1/p,s[0]=f*p,s[1]=(-u*i+n*l)*p,s[2]=(a*i-n*r)*p,s[3]=d*p,s[4]=(u*e-n*c)*p,s[5]=(-a*e+n*o)*p,s[6]=h*p,s[7]=(-l*e+i*c)*p,s[8]=(r*e-i*o)*p,s):null}function Za(s){const t=s[0],e=s[1],i=s[2],n=s[3],o=s[4],r=s[5],a=s[6],c=s[7],l=s[8];return t*(l*o-r*c)+e*(-l*n+r*a)+i*(c*n-o*a)}function bs(s,t,e){const i=t[0],n=t[1],o=t[2],r=t[3],a=t[4],c=t[5],l=t[6],u=t[7],f=t[8],d=e[0],h=e[1],p=e[2],g=e[3],y=e[4],v=e[5],C=e[6],b=e[7],P=e[8];return s[0]=d*i+h*r+p*l,s[1]=d*n+h*a+p*u,s[2]=d*o+h*c+p*f,s[3]=g*i+y*r+v*l,s[4]=g*n+y*a+v*u,s[5]=g*o+y*c+v*f,s[6]=C*i+b*r+P*l,s[7]=C*n+b*a+P*u,s[8]=C*o+b*c+P*f,s}function Xa(s,t,e){const i=t[0],n=t[1],o=t[2],r=t[3],a=t[4],c=t[5],l=t[6],u=t[7],f=t[8],d=e[0],h=e[1];return s[0]=i,s[1]=n,s[2]=o,s[3]=r,s[4]=a,s[5]=c,s[6]=d*i+h*r+l,s[7]=d*n+h*a+u,s[8]=d*o+h*c+f,s}function Ja(s,t,e){const i=t[0],n=t[1],o=t[2],r=t[3],a=t[4],c=t[5],l=t[6],u=t[7],f=t[8],d=Math.sin(e),h=Math.cos(e);return s[0]=h*i+d*r,s[1]=h*n+d*a,s[2]=h*o+d*c,s[3]=h*r-d*i,s[4]=h*a-d*n,s[5]=h*c-d*o,s[6]=l,s[7]=u,s[8]=f,s}function Cs(s,t,e){const i=e[0],n=e[1];return s[0]=i*t[0],s[1]=i*t[1],s[2]=i*t[2],s[3]=n*t[3],s[4]=n*t[4],s[5]=n*t[5],s[6]=t[6],s[7]=t[7],s[8]=t[8],s}function Qa(s,t){const e=t[0],i=t[1],n=t[2],o=t[3],r=e+e,a=i+i,c=n+n,l=e*r,u=i*r,f=i*a,d=n*r,h=n*a,p=n*c,g=o*r,y=o*a,v=o*c;return s[0]=1-f-p,s[3]=u-v,s[6]=d+y,s[1]=u+v,s[4]=1-l-p,s[7]=h-g,s[2]=d-y,s[5]=h+g,s[8]=1-l-f,s}var bi;(function(s){s[s.COL0ROW0=0]="COL0ROW0",s[s.COL0ROW1=1]="COL0ROW1",s[s.COL0ROW2=2]="COL0ROW2",s[s.COL1ROW0=3]="COL1ROW0",s[s.COL1ROW1=4]="COL1ROW1",s[s.COL1ROW2=5]="COL1ROW2",s[s.COL2ROW0=6]="COL2ROW0",s[s.COL2ROW1=7]="COL2ROW1",s[s.COL2ROW2=8]="COL2ROW2"})(bi||(bi={}));const tc=Object.freeze([1,0,0,0,1,0,0,0,1]);class X extends Gr{static get IDENTITY(){return ic()}static get ZERO(){return ec()}get ELEMENTS(){return 9}get RANK(){return 3}get INDICES(){return bi}constructor(t,...e){super(-0,-0,-0,-0,-0,-0,-0,-0,-0),arguments.length===1&&Array.isArray(t)?this.copy(t):e.length>0?this.copy([t,...e]):this.identity()}copy(t){return this[0]=t[0],this[1]=t[1],this[2]=t[2],this[3]=t[3],this[4]=t[4],this[5]=t[5],this[6]=t[6],this[7]=t[7],this[8]=t[8],this.check()}identity(){return this.copy(tc)}fromObject(t){return this.check()}fromQuaternion(t){return Qa(this,t),this.check()}set(t,e,i,n,o,r,a,c,l){return this[0]=t,this[1]=e,this[2]=i,this[3]=n,this[4]=o,this[5]=r,this[6]=a,this[7]=c,this[8]=l,this.check()}setRowMajor(t,e,i,n,o,r,a,c,l){return this[0]=t,this[1]=n,this[2]=a,this[3]=e,this[4]=o,this[5]=c,this[6]=i,this[7]=r,this[8]=l,this.check()}determinant(){return Za(this)}transpose(){return Ya(this,this),this.check()}invert(){return Ka(this,this),this.check()}multiplyLeft(t){return bs(this,t,this),this.check()}multiplyRight(t){return bs(this,this,t),this.check()}rotate(t){return Ja(this,this,t),this.check()}scale(t){return Array.isArray(t)?Cs(this,this,t):Cs(this,this,[t,t]),this.check()}translate(t){return Xa(this,this,t),this.check()}transform(t,e){let i;switch(t.length){case 2:i=Wr(e||[-0,-0],t,this);break;case 3:i=Vr(e||[-0,-0,-0],t,this);break;case 4:i=io(e||[-0,-0,-0,-0],t,this);break;default:throw new Error("Illegal vector")}return so(i,t.length),i}transformVector(t,e){return this.transform(t,e)}transformVector2(t,e){return this.transform(t,e)}transformVector3(t,e){return this.transform(t,e)}}let ae,ce=null;function ec(){return ae||(ae=new X([0,0,0,0,0,0,0,0,0]),Object.freeze(ae)),ae}function ic(){return ce||(ce=new X,Object.freeze(ce)),ce}function Ps(){const s=new Oe(4);return Oe!=Float32Array&&(s[0]=0,s[1]=0,s[2]=0),s[3]=1,s}function sc(s){return s[0]=0,s[1]=0,s[2]=0,s[3]=1,s}function lo(s,t,e){e=e*.5;const i=Math.sin(e);return s[0]=i*t[0],s[1]=i*t[1],s[2]=i*t[2],s[3]=Math.cos(e),s}function ws(s,t,e){const i=t[0],n=t[1],o=t[2],r=t[3],a=e[0],c=e[1],l=e[2],u=e[3];return s[0]=i*u+r*a+n*l-o*c,s[1]=n*u+r*c+o*a-i*l,s[2]=o*u+r*l+i*c-n*a,s[3]=r*u-i*a-n*c-o*l,s}function nc(s,t,e){e*=.5;const i=t[0],n=t[1],o=t[2],r=t[3],a=Math.sin(e),c=Math.cos(e);return s[0]=i*c+r*a,s[1]=n*c+o*a,s[2]=o*c-n*a,s[3]=r*c-i*a,s}function oc(s,t,e){e*=.5;const i=t[0],n=t[1],o=t[2],r=t[3],a=Math.sin(e),c=Math.cos(e);return s[0]=i*c-o*a,s[1]=n*c+r*a,s[2]=o*c+i*a,s[3]=r*c-n*a,s}function rc(s,t,e){e*=.5;const i=t[0],n=t[1],o=t[2],r=t[3],a=Math.sin(e),c=Math.cos(e);return s[0]=i*c+n*a,s[1]=n*c-i*a,s[2]=o*c+r*a,s[3]=r*c-o*a,s}function ac(s,t){const e=t[0],i=t[1],n=t[2];return s[0]=e,s[1]=i,s[2]=n,s[3]=Math.sqrt(Math.abs(1-e*e-i*i-n*n)),s}function we(s,t,e,i){const n=t[0],o=t[1],r=t[2],a=t[3];let c=e[0],l=e[1],u=e[2],f=e[3],d,h,p,g,y;return d=n*c+o*l+r*u+a*f,d<0&&(d=-d,c=-c,l=-l,u=-u,f=-f),1-d>sa?(h=Math.acos(d),y=Math.sin(h),p=Math.sin((1-i)*h)/y,g=Math.sin(i*h)/y):(p=1-i,g=i),s[0]=p*n+g*c,s[1]=p*o+g*l,s[2]=p*r+g*u,s[3]=p*a+g*f,s}function cc(s,t){const e=t[0],i=t[1],n=t[2],o=t[3],r=e*e+i*i+n*n+o*o,a=r?1/r:0;return s[0]=-e*a,s[1]=-i*a,s[2]=-n*a,s[3]=o*a,s}function lc(s,t){return s[0]=-t[0],s[1]=-t[1],s[2]=-t[2],s[3]=t[3],s}function uo(s,t){const e=t[0]+t[4]+t[8];let i;if(e>0)i=Math.sqrt(e+1),s[3]=.5*i,i=.5/i,s[0]=(t[5]-t[7])*i,s[1]=(t[6]-t[2])*i,s[2]=(t[1]-t[3])*i;else{let n=0;t[4]>t[0]&&(n=1),t[8]>t[n*3+n]&&(n=2);const o=(n+1)%3,r=(n+2)%3;i=Math.sqrt(t[n*3+n]-t[o*3+o]-t[r*3+r]+1),s[n]=.5*i,i=.5/i,s[3]=(t[o*3+r]-t[r*3+o])*i,s[o]=(t[o*3+n]+t[n*3+o])*i,s[r]=(t[r*3+n]+t[n*3+r])*i}return s}const uc=Qr,fc=ea,hc=Yr,dc=ta,pc=Hr,gc=qr,fo=ia,mc=(function(){const s=Kr(),t=xs(1,0,0),e=xs(0,1,0);return function(i,n,o){const r=Zr(n,o);return r<-.999999?(Ze(s,t,n),Xr(s)<1e-6&&Ze(s,e,n),Jr(s,s),lo(i,s,Math.PI),i):r>.999999?(i[0]=0,i[1]=0,i[2]=0,i[3]=1,i):(Ze(s,n,o),i[0]=s[0],i[1]=s[1],i[2]=s[2],i[3]=1+r,fo(i,i))}})();(function(){const s=Ps(),t=Ps();return function(e,i,n,o,r,a){return we(s,i,r,a),we(t,n,o,a),we(e,s,t,2*a*(1-a)),e}})();(function(){const s=qa();return function(t,e,i,n){return s[0]=i[0],s[3]=i[1],s[6]=i[2],s[1]=n[0],s[4]=n[1],s[7]=n[2],s[2]=-e[0],s[5]=-e[1],s[8]=-e[2],fo(t,uo(t,s))}})();const yc=[0,0,0,1];class Ls extends na{constructor(t=0,e=0,i=0,n=1){super(-0,-0,-0,-0),Array.isArray(t)&&arguments.length===1?this.copy(t):this.set(t,e,i,n)}copy(t){return this[0]=t[0],this[1]=t[1],this[2]=t[2],this[3]=t[3],this.check()}set(t,e,i,n){return this[0]=t,this[1]=e,this[2]=i,this[3]=n,this.check()}fromObject(t){return this[0]=t.x,this[1]=t.y,this[2]=t.z,this[3]=t.w,this.check()}fromMatrix3(t){return uo(this,t),this.check()}fromAxisRotation(t,e){return lo(this,t,e),this.check()}identity(){return sc(this),this.check()}setAxisAngle(t,e){return this.fromAxisRotation(t,e)}get ELEMENTS(){return 4}get x(){return this[0]}set x(t){this[0]=nt(t)}get y(){return this[1]}set y(t){this[1]=nt(t)}get z(){return this[2]}set z(t){this[2]=nt(t)}get w(){return this[3]}set w(t){this[3]=nt(t)}len(){return pc(this)}lengthSquared(){return gc(this)}dot(t){return hc(this,t)}rotationTo(t,e){return mc(this,t,e),this.check()}add(t){return uc(this,this,t),this.check()}calculateW(){return ac(this,this),this.check()}conjugate(){return lc(this,this),this.check()}invert(){return cc(this,this),this.check()}lerp(t,e,i){return i===void 0?this.lerp(this,t,e):(dc(this,t,e,i),this.check())}multiplyRight(t){return ws(this,this,t),this.check()}multiplyLeft(t){return ws(this,t,this),this.check()}normalize(){const t=this.len(),e=t>0?1/t:0;return this[0]=this[0]*e,this[1]=this[1]*e,this[2]=this[2]*e,this[3]=this[3]*e,t===0&&(this[3]=1),this.check()}rotateX(t){return nc(this,this,t),this.check()}rotateY(t){return oc(this,this,t),this.check()}rotateZ(t){return rc(this,this,t),this.check()}scale(t){return fc(this,this,t),this.check()}slerp(t,e,i){let n,o,r;switch(arguments.length){case 1:({start:n=yc,target:o,ratio:r}=t);break;case 2:n=this,o=t,r=e;break;default:n=t,o=e,r=i}return we(this,n,o,r),this.check()}transformVector4(t,e=new Hi){return oa(e,t,this),so(e,4)}lengthSq(){return this.lengthSquared()}setFromAxisAngle(t,e){return this.setAxisAngle(t,e)}premultiply(t){return this.multiplyLeft(t)}multiply(t){return this.multiplyRight(t)}}const _c=1e-15,xc=1e-20;function ho(s,t=[],e=0){const i=Math.fround(s),n=s-i;return t[e]=i,t[e+1]=n,t}function vc(s){return s-Math.fround(s)}function bc(s){const t=new Float32Array(32);for(let e=0;e<4;++e)for(let i=0;i<4;++i){const n=e*4+i;ho(s[i*4+e],t,n*2)}return t}function po(s,t=!0){return s??t}function go(s=[0,0,0],t=!0){return t?s.map(e=>e/255):[...s]}function Cc(s,t=!0){const e=go(s.slice(0,3),t),i=Number.isFinite(s[3]),n=i?s[3]:1;return[e[0],e[1],e[2],t&&i?n/255:n]}const Ts=`
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
`,Pc=`struct Fp64ArithmeticUniforms {
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
`,wc={ONE:1,SPLIT:4097},Lc={name:"fp64arithmetic",source:Pc,fs:Ts,vs:Ts,defaultUniforms:wc,uniformTypes:{ONE:"f32",SPLIT:"f32"},fp64ify:ho,fp64LowPart:vc,fp64ifyMatrix4:bc},As=`layout(std140) uniform floatColorsUniforms {
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
`,Tc=`struct floatColorsUniforms {
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
`,mo={name:"floatColors",props:{},uniforms:{},vs:As,fs:As,source:Tc,uniformTypes:{useByteColors:"f32"},defaultUniforms:{useByteColors:!0}},Ac=[0,1,1,1],Sc=`layout(std140) uniform pickingUniforms {
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
`,Mc=`layout(std140) uniform pickingUniforms {
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
`,Ss={props:{},uniforms:{},name:"picking",uniformTypes:{isActive:"f32",isAttribute:"f32",isHighlightActive:"f32",useByteColors:"f32",highlightedObjectColor:"vec3<f32>",highlightColor:"vec4<f32>"},defaultUniforms:{isActive:!1,isAttribute:!1,isHighlightActive:!1,useByteColors:!0,highlightedObjectColor:[0,0,0],highlightColor:Ac},vs:Sc,fs:Mc,getUniforms:Ec};function Ec(s={},t){const e={},i=po(s.useByteColors,!0);if(s.highlightedObjectColor!==void 0)if(s.highlightedObjectColor===null)e.isHighlightActive=!1;else{e.isHighlightActive=!0;const n=s.highlightedObjectColor.slice(0,3);e.highlightedObjectColor=n}return s.highlightColor&&(e.highlightColor=Cc(s.highlightColor,i)),s.isActive!==void 0&&(e.isActive=!!s.isActive,e.isAttribute=!!s.isAttribute),s.useByteColors!==void 0&&(e.useByteColors=!!s.useByteColors),e}class Fe extends vs{get[Symbol.toStringTag](){return"ComputePipeline"}hash="";shaderLayout;constructor(t,e){super(t,e,Fe.defaultProps),this.shaderLayout=e.shaderLayout}static defaultProps={...vs.defaultProps,shader:void 0,entryPoint:void 0,constants:{},shaderLayout:void 0}}class qi{static defaultProps={...Zt.defaultProps};static getDefaultPipelineFactory(t){const e=t.getModuleData("@luma.gl/core");return e.defaultPipelineFactory||=new qi(t),e.defaultPipelineFactory}device;_hashCounter=0;_hashes={};_renderPipelineCache={};_computePipelineCache={};_sharedRenderPipelineCache={};get[Symbol.toStringTag](){return"PipelineFactory"}toString(){return`PipelineFactory(${this.device.id})`}constructor(t){this.device=t}createRenderPipeline(t){if(!this.device.props._cachePipelines)return this.device.createRenderPipeline(t);const e={...Zt.defaultProps,...t},i=this._renderPipelineCache,n=this._hashRenderPipeline(e);let o=i[n]?.resource;if(o)i[n].useCount++,this.device.props.debugFactories&&k.log(3,`${this}: ${i[n].resource} reused, count=${i[n].useCount}, (id=${t.id})`)();else{const r=this.device.type==="webgl"&&this.device.props._sharePipelines?this.createSharedRenderPipeline(e):void 0;o=this.device.createRenderPipeline({...e,id:e.id?`${e.id}-cached`:ra("unnamed-cached"),_sharedRenderPipeline:r}),o.hash=n,i[n]={resource:o,useCount:1},this.device.props.debugFactories&&k.log(3,`${this}: ${o} created, count=${i[n].useCount}`)()}return o}createComputePipeline(t){if(!this.device.props._cachePipelines)return this.device.createComputePipeline(t);const e={...Fe.defaultProps,...t},i=this._computePipelineCache,n=this._hashComputePipeline(e);let o=i[n]?.resource;return o?(i[n].useCount++,this.device.props.debugFactories&&k.log(3,`${this}: ${i[n].resource} reused, count=${i[n].useCount}, (id=${t.id})`)()):(o=this.device.createComputePipeline({...e,id:e.id?`${e.id}-cached`:void 0}),o.hash=n,i[n]={resource:o,useCount:1},this.device.props.debugFactories&&k.log(3,`${this}: ${o} created, count=${i[n].useCount}`)()),o}release(t){if(!this.device.props._cachePipelines){t.destroy();return}const e=this._getCache(t),i=t.hash;e[i].useCount--,e[i].useCount===0?(this._destroyPipeline(t),this.device.props.debugFactories&&k.log(3,`${this}: ${t} released and destroyed`)()):e[i].useCount<0?(k.error(`${this}: ${t} released, useCount < 0, resetting`)(),e[i].useCount=0):this.device.props.debugFactories&&k.log(3,`${this}: ${t} released, count=${e[i].useCount}`)()}createSharedRenderPipeline(t){const e=this._hashSharedRenderPipeline(t);let i=this._sharedRenderPipelineCache[e];return i||(i={resource:this.device._createSharedRenderPipelineWebGL(t),useCount:0},this._sharedRenderPipelineCache[e]=i),i.useCount++,i.resource}releaseSharedRenderPipeline(t){if(!t.sharedRenderPipeline)return;const e=this._hashSharedRenderPipeline(t.sharedRenderPipeline.props),i=this._sharedRenderPipelineCache[e];i&&(i.useCount--,i.useCount===0&&(i.resource.destroy(),delete this._sharedRenderPipelineCache[e]))}_destroyPipeline(t){const e=this._getCache(t);return this.device.props._destroyPipelines?(delete e[t.hash],t.destroy(),t instanceof Zt&&this.releaseSharedRenderPipeline(t),!0):!1}_getCache(t){let e;if(t instanceof Fe&&(e=this._computePipelineCache),t instanceof Zt&&(e=this._renderPipelineCache),!e)throw new Error(`${this}`);if(!e[t.hash])throw new Error(`${this}: ${t} matched incorrect entry`);return e}_hashComputePipeline(t){const{type:e}=this.device,i=this._getHash(t.shader.source),n=this._getHash(JSON.stringify(t.shaderLayout));return`${e}/C/${i}SL${n}`}_hashRenderPipeline(t){const e=t.vs?this._getHash(t.vs.source):0,i=t.fs?this._getHash(t.fs.source):0,n=this._getWebGLVaryingHash(t),o=this._getHash(JSON.stringify(t.shaderLayout)),r=this._getHash(JSON.stringify(t.bufferLayout)),{type:a}=this.device;if(a==="webgl"){const c=this._getHash(JSON.stringify(t.parameters));return`${a}/R/${e}/${i}V${n}T${t.topology}P${c}SL${o}BL${r}`}else{const l=this._getHash(JSON.stringify({vertexEntryPoint:t.vertexEntryPoint,fragmentEntryPoint:t.fragmentEntryPoint})),u=this._getHash(JSON.stringify(t.parameters)),f=this._getWebGPUAttachmentHash(t);return`${a}/R/${e}/${i}V${n}T${t.topology}EP${l}P${u}SL${o}BL${r}A${f}`}}_hashSharedRenderPipeline(t){const e=t.vs?this._getHash(t.vs.source):0,i=t.fs?this._getHash(t.fs.source):0,n=this._getWebGLVaryingHash(t);return`webgl/S/${e}/${i}V${n}`}_getHash(t){return this._hashes[t]===void 0&&(this._hashes[t]=this._hashCounter++),this._hashes[t]}_getWebGLVaryingHash(t){const{varyings:e=[],bufferMode:i=null}=t;return this._getHash(JSON.stringify({varyings:e,bufferMode:i}))}_getWebGPUAttachmentHash(t){const e=t.colorAttachmentFormats??[this.device.preferredColorFormat],i=t.parameters?.depthWriteEnabled?t.depthStencilAttachmentFormat||this.device.preferredDepthFormat:null;return this._getHash(JSON.stringify({colorAttachmentFormats:e,depthStencilAttachmentFormat:i}))}}class Yi{static defaultProps={...Pa.defaultProps};static getDefaultShaderFactory(t){const e=t.getModuleData("@luma.gl/core");return e.defaultShaderFactory||=new Yi(t),e.defaultShaderFactory}device;_cache={};get[Symbol.toStringTag](){return"ShaderFactory"}toString(){return`${this[Symbol.toStringTag]}(${this.device.id})`}constructor(t){this.device=t}createShader(t){if(!this.device.props._cacheShaders)return this.device.createShader(t);const e=this._hashShader(t);let i=this._cache[e];if(i)i.useCount++,this.device.props.debugFactories&&k.log(3,`${this}: Reusing shader ${i.resource.id} count=${i.useCount}`)();else{const n=this.device.createShader({...t,id:t.id?`${t.id}-cached`:void 0});this._cache[e]=i={resource:n,useCount:1},this.device.props.debugFactories&&k.log(3,`${this}: Created new shader ${n.id}`)()}return i.resource}release(t){if(!this.device.props._cacheShaders){t.destroy();return}const e=this._hashShader(t),i=this._cache[e];if(i)if(i.useCount--,i.useCount===0)this.device.props._destroyShaders&&(delete this._cache[e],i.resource.destroy(),this.device.props.debugFactories&&k.log(3,`${this}: Releasing shader ${t.id}, destroyed`)());else{if(i.useCount<0)throw new Error(`ShaderFactory: Shader ${t.id} released too many times`);this.device.props.debugFactories&&k.log(3,`${this}: Releasing shader ${t.id} count=${i.useCount}`)()}}_hashShader(t){return`${t.stage}:${t.source}`}}function Ic(s,t={}){const e={...s},i=t.layout??"std140",n={};let o=0;for(const[r,a]of Object.entries(e))o=Ci(n,r,a,o,i);return o=dt(o,Pt(e,i)),{layout:i,byteLength:o*4,uniformTypes:e,fields:n}}function Ge(s,t){const e=La(s),i=wa(e),n=/^mat(\d)x(\d)<.+>$/.exec(e);if(n){const r=Number(n[1]),a=Number(n[2]),c=Ms(a,e,i.type),l=Rc(c.size,c.alignment,t);return{alignment:c.alignment,size:r*l,components:r*a,columns:r,rows:a,columnStride:l,shaderType:e,type:i.type}}const o=/^vec(\d)<.+>$/.exec(e);return o?Ms(Number(o[1]),e,i.type):{alignment:1,size:1,components:1,columns:1,rows:1,columnStride:1,shaderType:e,type:i.type}}function yo(s){return!!s&&typeof s=="object"&&!Array.isArray(s)}function Ci(s,t,e,i,n){if(typeof e=="string"){const o=Ge(e,n),r=dt(i,o.alignment);return s[t]={offset:r,...o},r+o.size}if(Array.isArray(e)){if(Array.isArray(e[0]))throw new Error(`Nested arrays are not supported for ${t}`);const o=e[0],r=e[1],a=xo(o,n),c=dt(i,Pt(e,n));for(let l=0;l<r;l++)Ci(s,`${t}[${l}]`,o,c+l*a,n);return c+a*r}if(yo(e)){const o=Pt(e,n);let r=dt(i,o);for(const[a,c]of Object.entries(e))r=Ci(s,`${t}.${a}`,c,r,n);return dt(r,o)}throw new Error(`Unsupported CompositeShaderType for ${t}`)}function _o(s,t){if(typeof s=="string")return Ge(s,t).size;if(Array.isArray(s)){const i=s[0],n=s[1];if(Array.isArray(i))throw new Error("Nested arrays are not supported");return xo(i,t)*n}let e=0;for(const i of Object.values(s)){const n=i;e=dt(e,Pt(n,t)),e+=_o(n,t)}return dt(e,Pt(s,t))}function Pt(s,t){if(typeof s=="string")return Ge(s,t).alignment;if(Array.isArray(s)){const i=s[0],n=Pt(i,t);return vo(t)?Math.max(n,4):n}let e=1;for(const i of Object.values(s)){const n=Pt(i,t);e=Math.max(e,n)}return zc(t)?Math.max(e,4):e}function Ms(s,t,e,i){return{alignment:s===2?2:4,size:s===3?3:s,components:s,columns:1,rows:s,columnStride:s===3?3:s,shaderType:t,type:e}}function xo(s,t){const e=_o(s,t),i=Pt(s,t);return Oc(e,i,t)}function Oc(s,t,e){return dt(s,vo(e)?4:t)}function Rc(s,t,e){return e==="std140"?4:dt(s,t)}function vo(s){return s==="std140"||s==="wgsl-uniform"}function zc(s){return s==="std140"||s==="wgsl-uniform"}function Bc(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function Ne(s){return Array.isArray(s)?s.length===0||typeof s[0]=="number":Bc(s)}class Fc{layout;constructor(t){this.layout=t}has(t){return!!this.layout.fields[t]}get(t){const e=this.layout.fields[t];return e?{offset:e.offset,size:e.size}:void 0}getFlatUniformValues(t){const e={};for(const[i,n]of Object.entries(t)){const o=this.layout.uniformTypes[i];o?this._flattenCompositeValue(e,i,o,n):this.layout.fields[i]&&(e[i]=n)}return e}getData(t){const e=Ta(this.layout.byteLength);new Uint8Array(e,0,this.layout.byteLength).fill(0);const i={i32:new Int32Array(e),u32:new Uint32Array(e),f32:new Float32Array(e),f16:new Uint16Array(e)},n=this.getFlatUniformValues(t);for(const[o,r]of Object.entries(n))this._writeLeafValue(i,o,r);return new Uint8Array(e,0,this.layout.byteLength)}_flattenCompositeValue(t,e,i,n){if(n!==void 0){if(typeof i=="string"||this.layout.fields[e]){t[e]=n;return}if(Array.isArray(i)){const o=i[0],r=i[1];if(Array.isArray(o))throw new Error(`Nested arrays are not supported for ${e}`);if(typeof o=="string"&&Ne(n)){this._flattenPackedArray(t,e,o,r,n);return}if(!Array.isArray(n)){k.warn(`Unsupported uniform array value for ${e}:`,n)();return}for(let a=0;a<Math.min(n.length,r);a++){const c=n[a];c!==void 0&&this._flattenCompositeValue(t,`${e}[${a}]`,o,c)}return}if(yo(i)&&Nc(n)){for(const[o,r]of Object.entries(n)){if(r===void 0)continue;const a=`${e}.${o}`;this._flattenCompositeValue(t,a,i[o],r)}return}k.warn(`Unsupported uniform value for ${e}:`,n)()}}_flattenPackedArray(t,e,i,n,o){const r=o,c=Ge(i,this.layout.layout).components;for(let l=0;l<n;l++){const u=l*c;if(u>=r.length)break;c===1?t[`${e}[${l}]`]=Number(r[u]):t[`${e}[${l}]`]=kc(o,u,u+c)}}_writeLeafValue(t,e,i){const n=this.layout.fields[e];if(!n){k.warn(`Uniform ${e} not found in layout`)();return}const{type:o,components:r,columns:a,rows:c,offset:l,columnStride:u}=n,f=t[o];if(r===1){f[l]=Number(i);return}const d=i;if(a===1){for(let p=0;p<r;p++)f[l+p]=Number(d[p]??0);return}let h=0;for(let p=0;p<a;p++){const g=l+p*u;for(let y=0;y<c;y++)f[g+y]=Number(d[h++]??0)}}}function Nc(s){return!!s&&typeof s=="object"&&!Array.isArray(s)&&!ArrayBuffer.isView(s)}function kc(s,t,e){return Array.prototype.slice.call(s,t,e)}const Uc=128;function Dc(s,t,e=16){if(s===t)return!0;const i=s,n=t;if(!Ne(i)||!Ne(n)||i.length!==n.length)return!1;const o=Math.min(e,Uc);if(i.length>o)return!1;for(let r=0;r<i.length;++r)if(n[r]!==i[r])return!1;return!0}function $c(s){return Ne(s)?s.slice():s}class jc{name;uniforms={};modifiedUniforms={};modified=!0;bindingLayout={};needsRedraw="initialized";constructor(t){if(this.name=t?.name||"unnamed",t?.name&&t?.shaderLayout){const e=t?.shaderLayout.bindings?.find(n=>n.type==="uniform"&&n.name===t?.name);if(!e)throw new Error(t?.name);const i=e;for(const n of i.uniforms||[])this.bindingLayout[n.name]=n}}setUniforms(t){for(const[e,i]of Object.entries(t))this._setUniform(e,i),this.needsRedraw||this.setNeedsRedraw(`${this.name}.${e}=${i}`)}setNeedsRedraw(t){this.needsRedraw=this.needsRedraw||t}getAllUniforms(){return this.modifiedUniforms={},this.needsRedraw=!1,this.uniforms||{}}_setUniform(t,e){Dc(this.uniforms[t],e)||(this.uniforms[t]=$c(e),this.modifiedUniforms[t]=!0,this.modified=!0)}}const Gc=1024;class Vc{device;uniformBlocks=new Map;shaderBlockLayouts=new Map;shaderBlockWriters=new Map;uniformBuffers=new Map;constructor(t,e){this.device=t;for(const[i,n]of Object.entries(e)){const o=i,r=Ic(n.uniformTypes??{},{layout:n.layout??Wc(t)}),a=new Fc(r);this.shaderBlockLayouts.set(o,r),this.shaderBlockWriters.set(o,a);const c=new jc({name:i});c.setUniforms(a.getFlatUniformValues(n.defaultUniforms||{})),this.uniformBlocks.set(o,c)}}destroy(){for(const t of this.uniformBuffers.values())t.destroy()}setUniforms(t){for(const[e,i]of Object.entries(t)){const n=e,r=this.shaderBlockWriters.get(n)?.getFlatUniformValues(i||{});this.uniformBlocks.get(n)?.setUniforms(r||{})}this.updateUniformBuffers()}getUniformBufferByteLength(t){const e=this.shaderBlockLayouts.get(t)?.byteLength||0;return Math.max(e,Gc)}getUniformBufferData(t){const e=this.uniformBlocks.get(t)?.getAllUniforms()||{};return this.shaderBlockWriters.get(t)?.getData(e)||new Uint8Array(0)}createUniformBuffer(t,e){e&&this.setUniforms(e);const i=this.getUniformBufferByteLength(t),n=this.device.createBuffer({usage:Z.UNIFORM|Z.COPY_DST,byteLength:i}),o=this.getUniformBufferData(t);return n.write(o),n}getManagedUniformBuffer(t){if(!this.uniformBuffers.get(t)){const e=this.getUniformBufferByteLength(t),i=this.device.createBuffer({usage:Z.UNIFORM|Z.COPY_DST,byteLength:e});this.uniformBuffers.set(t,i)}return this.uniformBuffers.get(t)}updateUniformBuffers(){let t=!1;for(const e of this.uniformBlocks.keys()){const i=this.updateUniformBuffer(e);t||=i}return t&&k.log(3,`UniformStore.updateUniformBuffers(): ${t}`)(),t}updateUniformBuffer(t){const e=this.uniformBlocks.get(t);let i=this.uniformBuffers.get(t),n=!1;if(i&&e?.needsRedraw){n||=e.needsRedraw;const o=this.getUniformBufferData(t);i=this.uniformBuffers.get(t),i?.write(o);const r=this.uniformBlocks.get(t)?.getAllUniforms();k.log(4,`Writing to uniform buffer ${String(t)}`,o,r)()}return n}}function Wc(s){return s.type==="webgpu"?"wgsl-uniform":"std140"}const Es=`precision highp int;

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
`,Hc=`// #if (defined(SHADER_TYPE_FRAGMENT) && defined(LIGHTING_FRAGMENT)) || (defined(SHADER_TYPE_VERTEX) && defined(LIGHTING_VERTEX))
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
`,Lt=5,qc={color:"vec3<f32>",position:"vec3<f32>",direction:"vec3<f32>",attenuation:"vec3<f32>",coneCos:"vec2<f32>"},bo={props:{},uniforms:{},name:"lighting",defines:{},uniformTypes:{enabled:"i32",directionalLightCount:"i32",pointLightCount:"i32",spotLightCount:"i32",ambientColor:"vec3<f32>",lights:[qc,Lt]},defaultUniforms:Le(),bindingLayout:[{name:"lighting",group:2}],firstBindingSlot:0,source:Hc,vs:Es,fs:Es,getUniforms:Yc};function Yc(s,t={}){if(s=s&&{...s},!s)return Le();s.lights&&(s={...s,...Zc(s.lights),lights:void 0});const{useByteColors:e,ambientLight:i,pointLights:n,spotLights:o,directionalLights:r}=s||{};if(!(i||n&&n.length>0||o&&o.length>0||r&&r.length>0))return{...Le(),enabled:0};const c={...Le(),...Kc({useByteColors:e,ambientLight:i,pointLights:n,spotLights:o,directionalLights:r})};return s.enabled!==void 0&&(c.enabled=s.enabled?1:0),c}function Kc({useByteColors:s,ambientLight:t,pointLights:e=[],spotLights:i=[],directionalLights:n=[]}){const o=Co();let r=0,a=0,c=0,l=0;for(const u of e){if(r>=Lt)break;o[r]={...o[r],color:le(u,s),position:u.position,attenuation:u.attenuation||[1,0,0]},r++,a++}for(const u of i){if(r>=Lt)break;o[r]={...o[r],color:le(u,s),position:u.position,direction:u.direction,attenuation:u.attenuation||[1,0,0],coneCos:Jc(u)},r++,c++}for(const u of n){if(r>=Lt)break;o[r]={...o[r],color:le(u,s),direction:u.direction},r++,l++}return e.length+i.length+n.length>Lt&&k.warn(`MAX_LIGHTS exceeded, truncating to ${Lt}`)(),{ambientColor:le(t,s),directionalLightCount:l,pointLightCount:a,spotLightCount:c,lights:o}}function Zc(s){const t={pointLights:[],spotLights:[],directionalLights:[]};for(const e of s||[])switch(e.type){case"ambient":t.ambientLight=e;break;case"directional":t.directionalLights?.push(e);break;case"point":t.pointLights?.push(e);break;case"spot":t.spotLights?.push(e);break}return t}function le(s={},t){const{color:e=[0,0,0],intensity:i=1}=s;return go(e,po(t,!0)).map(o=>o*i)}function Le(){return{enabled:1,directionalLightCount:0,pointLightCount:0,spotLightCount:0,ambientColor:[.1,.1,.1],lights:Co()}}function Co(){return Array.from({length:Lt},()=>Xc())}function Xc(){return{color:[1,1,1],position:[1,1,2],direction:[1,1,1],attenuation:[1,0,0],coneCos:[1,0]}}function Jc(s){const t=s.innerConeAngle??0,e=s.outerConeAngle??Math.PI/4;return[Math.cos(t),Math.cos(e)]}const Po=`layout(std140) uniform phongMaterialUniforms {
  uniform bool unlit;
  uniform float ambient;
  uniform float diffuse;
  uniform float shininess;
  uniform vec3  specularColor;
} material;
`,wo=`layout(std140) uniform phongMaterialUniforms {
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
`,Lo=`struct phongMaterialUniforms {
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
`,Qc=[38.25,38.25,38.25],To={props:{},name:"gouraudMaterial",bindingLayout:[{name:"gouraudMaterial",group:3}],vs:wo.replace("phongMaterial","gouraudMaterial"),fs:Po.replace("phongMaterial","gouraudMaterial"),source:Lo.replaceAll("phongMaterial","gouraudMaterial"),defines:{LIGHTING_VERTEX:!0},dependencies:[bo,mo],uniformTypes:{unlit:"i32",ambient:"f32",diffuse:"f32",shininess:"f32",specularColor:"vec3<f32>"},defaultUniforms:{unlit:!1,ambient:.35,diffuse:.6,shininess:32,specularColor:Qc},getUniforms(s){return{...To.defaultUniforms,...s}}},tl=[38.25,38.25,38.25],Ao={name:"phongMaterial",firstBindingSlot:0,bindingLayout:[{name:"phongMaterial",group:3}],dependencies:[bo,mo],source:Lo,vs:Po,fs:wo,defines:{LIGHTING_FRAGMENT:!0},uniformTypes:{unlit:"i32",ambient:"f32",diffuse:"f32",shininess:"f32",specularColor:"vec3<f32>"},defaultUniforms:{unlit:!1,ambient:.35,diffuse:.6,shininess:32,specularColor:tl},getUniforms(s){return{...Ao.defaultUniforms,...s}}},el=`

@must_use
fn deckgl_premultiplied_alpha(fragColor: vec4<f32>) -> vec4<f32> {
    return vec4(fragColor.rgb * fragColor.a, fragColor.a); 
};
`,So={name:"color",dependencies:[],source:el,getUniforms:s=>({})},il=`// Define a structure to hold both the clip-space position and the common position.
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
`,sl=`vec4 project_position_to_clipspace(
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
`,Ut={name:"project32",dependencies:[aa],source:il,vs:sl},nl=`struct pickingUniforms {
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
`,Dt={...Ss,source:nl,defaultUniforms:{...Ss.defaultUniforms,useByteColors:!0},inject:{"vs:DECKGL_FILTER_GL_POSITION":`
    // for picking depth values
    picking_setPickingAttribute(position.z / position.w);
  `,"vs:DECKGL_FILTER_COLOR":`
  picking_setPickingColor(geometry.pickingColor);
  `,"fs:DECKGL_FILTER_COLOR":{order:99,injection:`
  // use highlight color if this fragment belongs to the selected object.
  color = picking_filterHighlightColor(color);

  // use picking color if rendering to picking FBO.
  color = picking_filterPickingColor(color);
    `}}},Is=[0,0,0];function ti(s,t,e=!1){const i=t.projectPosition(s);if(e&&t instanceof yi){const[n,o,r=0]=s,a=t.getDistanceScales([n,o]);i[2]=r*a.unitsPerMeter[2]}return i}function ol(s){const{viewport:t,modelMatrix:e,coordinateOrigin:i}=s;let{coordinateSystem:n,fromCoordinateSystem:o,fromCoordinateOrigin:r}=s;return n==="default"&&(n=t.isGeospatial?"lnglat":"cartesian"),o===void 0?o=n:o==="default"&&(o=t.isGeospatial?"lnglat":"cartesian"),r===void 0&&(r=i),{viewport:t,coordinateSystem:n,coordinateOrigin:i,modelMatrix:e,fromCoordinateSystem:o,fromCoordinateOrigin:r}}function Ki(s,{viewport:t,modelMatrix:e,coordinateSystem:i,coordinateOrigin:n,offsetMode:o}){let[r,a,c=0]=s;switch(e&&([r,a,c]=ca([],[r,a,c,1],e)),i){case"default":return Ki(s,{viewport:t,modelMatrix:e,coordinateSystem:t.isGeospatial?"lnglat":"cartesian",coordinateOrigin:n,offsetMode:o});case"lnglat":return ti([r,a,c],t,o);case"lnglat-offsets":return ti([r+n[0],a+n[1],c+(n[2]||0)],t,o);case"meter-offsets":return ti(la(n,[r,a,c]),t,o);case"cartesian":return t.isGeospatial?[r+n[0],a+n[1],c+n[2]]:t.projectPosition([r,a,c]);default:throw new Error(`Invalid coordinateSystem: ${i}`)}}function rl(s,t){const{viewport:e,coordinateSystem:i,coordinateOrigin:n,modelMatrix:o,fromCoordinateSystem:r,fromCoordinateOrigin:a}=ol(t),{autoOffset:c=!0}=t,{geospatialOrigin:l=Is,shaderCoordinateOrigin:u=Is,offsetMode:f=!1}=c?ua(e,i,n):{},d=Ki(s,{viewport:e,modelMatrix:o,coordinateSystem:r,coordinateOrigin:a,offsetMode:f});if(f){const h=e.projectPosition(l||u);fa(d,d,h)}return d}const ei={};function Ve(s="id"){ei[s]=ei[s]||1;const t=ei[s]++;return`${s}-${t}`}class Os{id;userData={};topology;bufferLayout=[];vertexCount;indices;attributes;constructor(t){if(this.id=t.id||Ve("geometry"),this.topology=t.topology,this.indices=t.indices||null,this.attributes=t.attributes,this.vertexCount=t.vertexCount,this.bufferLayout=t.bufferLayout||[],this.indices&&!(this.indices.usage&Z.INDEX))throw new Error("Index buffer must have INDEX usage")}destroy(){this.indices?.destroy();for(const t of Object.values(this.attributes))t.destroy()}getVertexCount(){return this.vertexCount}getAttributes(){return this.attributes}getIndexes(){return this.indices||null}_calculateVertexCount(t){return t.byteLength/12}}function al(s,t){if(t instanceof Os)return t;const e=cl(s,t),{attributes:i,bufferLayout:n}=ll(s,t);return new Os({topology:t.topology||"triangle-list",bufferLayout:n,vertexCount:t.vertexCount,indices:e,attributes:i})}function cl(s,t){if(!t.indices)return;const e=t.indices.value;return s.createBuffer({usage:Z.INDEX,data:e})}function ll(s,t){const e=[],i={};for(const[o,r]of Object.entries(t.attributes)){let a=o;switch(o){case"POSITION":a="positions";break;case"NORMAL":a="normals";break;case"TEXCOORD_0":a="texCoords";break;case"TEXCOORD_1":a="texCoords1";break;case"COLOR_0":a="colors";break}if(r){i[a]=s.createBuffer({data:r.value,id:`${o}-buffer`});const{value:c,size:l,normalized:u}=r;if(l===void 0)throw new Error(`Attribute ${o} is missing a size`);e.push({name:a,format:ha.getVertexFormatFromAttribute(c,l,u)})}}const n=t._calculateVertexCount(t.attributes,t.indices);return{attributes:i,bufferLayout:e,vertexCount:n}}function ul(s,t){const e={},i="Values";if(s.attributes.length===0&&!s.varyings?.length)return{"No attributes or varyings":{[i]:"N/A"}};for(const n of s.attributes)if(n){const o=`${n.location} ${n.name}: ${n.type}`;e[`in ${o}`]={[i]:n.stepMode||"vertex"}}for(const n of s.varyings||[]){const o=`${n.location} ${n.name}`;e[`out ${o}`]={[i]:JSON.stringify(n)}}return e}const Rs="__debugFramebufferState",ii=8;function fl(s,t,e){if(s.device.type!=="webgl")return;const i=pl(s.device);if(!i.flushing){if(ml(s)){hl(s,e,i);return}t&&gl(t)&&t.handle!==null&&(i.queuedFramebuffers.includes(t)||i.queuedFramebuffers.push(t))}}function hl(s,t,e){if(e.queuedFramebuffers.length===0)return;const i=s.device,{gl:n}=i,o=n.getParameter(36010),r=n.getParameter(36006),[a,c]=s.device.getDefaultCanvasContext().getDrawingBufferSize();let l=zs(t.top,ii);const u=zs(t.left,ii);e.flushing=!0;try{for(const f of e.queuedFramebuffers){const[d,h,p,g,y]=dl({framebuffer:f,targetWidth:a,targetHeight:c,topPx:l,leftPx:u,minimap:t.minimap});n.bindFramebuffer(36008,f.handle),n.bindFramebuffer(36009,null),n.blitFramebuffer(0,0,f.width,f.height,d,h,p,g,16384,9728),l+=y+ii}}finally{n.bindFramebuffer(36008,o),n.bindFramebuffer(36009,r),e.flushing=!1}}function dl(s){const{framebuffer:t,targetWidth:e,targetHeight:i,topPx:n,leftPx:o}=s,r=Math.max(Math.floor(e/4),1),a=Math.max(Math.floor(i/4),1),c=Math.min(r/t.width,a/t.height),l=Math.max(Math.floor(t.width*c),1),u=Math.max(Math.floor(t.height*c),1),f=o,d=Math.max(i-n-u,0),h=f+l,p=d+u;return[f,d,h,p,u]}function pl(s){return s.userData[Rs]||={flushing:!1,queuedFramebuffers:[]},s.userData[Rs]}function gl(s){return"colorAttachments"in s}function ml(s){const t=s.props.framebuffer;return!t||t.handle===null}function zs(s,t){if(!s)return t;const e=Number.parseInt(s,10);return Number.isFinite(e)?e:t}function Pi(s,t,e){if(s===t)return!0;if(!e||!s||!t)return!1;if(Array.isArray(s)){if(!Array.isArray(t)||s.length!==t.length)return!1;for(let i=0;i<s.length;i++)if(!Pi(s[i],t[i],e-1))return!1;return!0}if(Array.isArray(t))return!1;if(typeof s=="object"&&typeof t=="object"){const i=Object.keys(s),n=Object.keys(t);if(i.length!==n.length)return!1;for(const o of i)if(!t.hasOwnProperty(o)||!Pi(s[o],t[o],e-1))return!1;return!0}return!1}class si{bufferLayouts;constructor(t){this.bufferLayouts=t}getBufferLayout(t){return this.bufferLayouts.find(e=>e.name===t)||null}getAttributeNamesForBuffer(t){return t.attributes?t.attributes?.map(e=>e.attribute):[t.name]}mergeBufferLayouts(t,e){const i=[...t];for(const n of e){const o=i.findIndex(r=>r.name===n.name);o<0?i.push(n):i[o]=n}return i}getBufferIndex(t){const e=this.bufferLayouts.findIndex(i=>i.name===t);return e===-1&&k.warn(`BufferLayout: Missing buffer for "${t}".`)(),e}}function Bs(s,t){let e=1/0;for(const i of s){const n=t[i];n!==void 0&&(e=Math.min(e,n))}return e}function yl(s,t){const e=Object.fromEntries(s.attributes.map(n=>[n.name,n.location])),i=t.slice();return i.sort((n,o)=>{const r=n.attributes?n.attributes.map(u=>u.attribute):[n.name],a=o.attributes?o.attributes.map(u=>u.attribute):[o.name],c=Bs(r,e),l=Bs(a,e);return c-l}),i}function Fs(s,t){if(!s||!t.some(i=>i.bindingLayout?.length))return s;const e={...s,bindings:s.bindings.map(i=>({...i}))};"attributes"in(s||{})&&(e.attributes=s?.attributes||[]);for(const i of t)for(const n of i.bindingLayout||[])for(const o of xl(n.name)){const r=e.bindings.find(a=>a.name===o);r?.group===0&&(r.group=n.group)}return e}function _l(s){return!!(s.uniformTypes&&!vl(s.uniformTypes))}function xl(s){const t=new Set([s,`${s}Uniforms`]);return s.endsWith("Uniforms")||t.add(`${s}Sampler`),[...t]}function vl(s){for(const t in s)return!1;return!0}function bl(s){return $a(s)||typeof s=="number"||typeof s=="boolean"}function Cl(s,t={}){const e={bindings:{},uniforms:{}};return Object.keys(s).forEach(i=>{const n=s[i];Object.prototype.hasOwnProperty.call(t,i)||bl(n)?e.uniforms[i]=n:e.bindings[i]=n}),e}class Pl{options={disableWarnings:!1};modules;moduleUniforms;moduleBindings;constructor(t,e){Object.assign(this.options,e);const i=da(Object.values(t).filter(wl));for(const n of i)t[n.name]=n;k.log(1,"Creating ShaderInputs with modules",Object.keys(t))(),this.modules=t,this.moduleUniforms={},this.moduleBindings={};for(const[n,o]of Object.entries(t))o&&(this._addModule(o),o.name&&n!==o.name&&!this.options.disableWarnings&&k.warn(`Module name: ${n} vs ${o.name}`)())}destroy(){}setProps(t){for(const e of Object.keys(t)){const i=e,n=t[i]||{},o=this.modules[i];if(!o)this.options.disableWarnings||k.warn(`Module ${e} not found`)();else{const r=this.moduleUniforms[i],a=this.moduleBindings[i],c=o.getUniforms?.(n,r)||n,{uniforms:l,bindings:u}=Cl(c,o.uniformTypes);this.moduleUniforms[i]=Ns(r,l,o.uniformTypes),this.moduleBindings[i]={...a,...u}}}}getModules(){return Object.values(this.modules)}getUniformValues(){return this.moduleUniforms}getBindingValues(){const t={};for(const e of Object.values(this.moduleBindings))Object.assign(t,e);return t}getDebugTable(){const t={};for(const[e,i]of Object.entries(this.moduleUniforms))for(const[n,o]of Object.entries(i))t[`${e}.${n}`]={type:this.modules[e].uniformTypes?.[n],value:String(o)};return t}_addModule(t){const e=t.name;this.moduleUniforms[e]=Ns({},t.defaultUniforms||{},t.uniformTypes),this.moduleBindings[e]={}}}function Ns(s={},t={},e={}){const i={...s};for(const[n,o]of Object.entries(t))o!==void 0&&(i[n]=wi(s[n],o,e[n]));return i}function wi(s,t,e){if(!e||typeof e=="string")return Jt(t);if(Array.isArray(e)){if(Li(t)||!Array.isArray(t))return Jt(t);const r=Array.isArray(s)&&!Li(s)?[...s]:[],a=r.slice();for(let c=0;c<t.length;c++){const l=t[c];l!==void 0&&(a[c]=wi(r[c],l,e[0]))}return a}if(!Ti(t))return Jt(t);const i=e,n=Ti(s)?s:{},o={...n};for(const[r,a]of Object.entries(t))a!==void 0&&(o[r]=wi(n[r],a,i[r]));return o}function Jt(s){return ArrayBuffer.isView(s)?Array.prototype.slice.call(s):Array.isArray(s)?Li(s)?s.slice():s.map(e=>e===void 0?void 0:Jt(e)):Ti(s)?Object.fromEntries(Object.entries(s).map(([t,e])=>[t,e===void 0?void 0:Jt(e)])):s}function Li(s){return ArrayBuffer.isView(s)||Array.isArray(s)&&(s.length===0||typeof s[0]=="number")}function Ti(s){return!!s&&typeof s=="object"&&!Array.isArray(s)&&!ArrayBuffer.isView(s)}function wl(s){return!!s?.dependencies}const Mo={"+X":0,"-X":1,"+Y":2,"-Y":3,"+Z":4,"-Z":5};function Vt(s){return s?Array.isArray(s)?s[0]??null:s:null}function Ll(s){const{dimension:t,data:e}=s;if(!e)return null;switch(t){case"1d":{const i=Vt(e);if(!i)return null;const{width:n}=Wt(i);return{width:n,height:1}}case"2d":{const i=Vt(e);return i?Wt(i):null}case"3d":case"2d-array":{if(!Array.isArray(e)||e.length===0)return null;const i=Vt(e[0]);return i?Wt(i):null}case"cube":{const i=Object.keys(e)[0]??null;if(!i)return null;const n=e[i],o=Vt(n);return o?Wt(o):null}case"cube-array":{if(!Array.isArray(e)||e.length===0)return null;const i=e[0],n=Object.keys(i)[0]??null;if(!n)return null;const o=Vt(i[n]);return o?Wt(o):null}default:return null}}function Wt(s){if(no(s))return pa(s);if(typeof s=="object"&&"width"in s&&"height"in s)return{width:s.width,height:s.height};throw new Error("Unsupported mip-level data")}function Tl(s){return typeof s=="object"&&s!==null&&"data"in s&&"width"in s&&"height"in s}function Al(s){return ArrayBuffer.isView(s)}function Eo(s){const{textureFormat:t,format:e}=s;if(t&&e&&t!==e)throw new Error(`Conflicting texture formats "${t}" and "${e}" provided for the same mip level`);return t??e}function Io(s){const t=Mo[s];if(t===void 0)throw new Error(`Invalid cube face: ${s}`);return t}function Sl(s,t){return 6*s+Io(t)}function Oo(s){throw new Error("setTexture1DData not supported in WebGL.")}function Ml(s){return Array.isArray(s)?s:[s]}function $t(s,t,e,i){const n=Ml(t),o=s,r=[];for(let a=0;a<n.length;a++){const c=n[a];if(no(c))r.push({type:"external-image",image:c,z:o,mipLevel:a});else if(Tl(c))r.push({type:"texture-data",data:c,textureFormat:Eo(c),z:o,mipLevel:a});else if(Al(c)&&e)r.push({type:"texture-data",data:{data:c,width:Math.max(1,e.width>>a),height:Math.max(1,e.height>>a),...i?{format:i}:{}},textureFormat:i,z:o,mipLevel:a});else throw new Error("Unsupported 2D mip-level payload")}return r}function Ro(s){const t=[];for(let e=0;e<s.length;e++)t.push(...$t(e,s[e]));return t}function zo(s){const t=[];for(let e=0;e<s.length;e++)t.push(...$t(e,s[e]));return t}function Bo(s){const t=[];for(const[e,i]of Object.entries(s)){const n=Io(e);t.push(...$t(n,i))}return t}function Fo(s){const t=[];return s.forEach((e,i)=>{for(const[n,o]of Object.entries(e)){const r=Sl(i,n);t.push(...$t(r,o))}}),t}class It{device;id;props;_texture=null;_sampler=null;_view=null;ready;isReady=!1;destroyed=!1;resolveReady=()=>{};rejectReady=()=>{};get texture(){if(!this._texture)throw new Error("Texture not initialized yet");return this._texture}get sampler(){if(!this._sampler)throw new Error("Sampler not initialized yet");return this._sampler}get view(){if(!this._view)throw new Error("View not initialized yet");return this._view}get[Symbol.toStringTag](){return"DynamicTexture"}toString(){const t=this._texture?.width??this.props.width??"?",e=this._texture?.height??this.props.height??"?";return`DynamicTexture:"${this.id}":${t}x${e}px:(${this.isReady?"ready":"loading..."})`}constructor(t,e){this.device=t;const i=Ve("dynamic-texture"),n=e;this.props={...It.defaultProps,id:i,...e,data:null},this.id=this.props.id,this.ready=new Promise((o,r)=>{this.resolveReady=o,this.rejectReady=r}),this.initAsync(n)}async initAsync(t){try{const e=await this._loadAllData(t);this._checkNotDestroyed();const i=e.data?El({...e,width:t.width,height:t.height,format:t.format}):[],n="format"in t&&t.format!==void 0,o="usage"in t&&t.usage!==void 0,a=(()=>{if(this.props.width&&this.props.height)return{width:this.props.width,height:this.props.height};const g=Ll(e);return g||{width:this.props.width||1,height:this.props.height||1}})();if(!a||a.width<=0||a.height<=0)throw new Error(`${this} size could not be determined or was zero`);const c=Il(this.device,i,a,{format:n?t.format:void 0}),l=c.format??this.props.format,u={...this.props,...a,format:l,mipLevels:1,data:void 0};this.device.isTextureFormatCompressed(l)&&!o&&(u.usage=it.SAMPLE|it.COPY_DST);const f=this.props.mipmaps&&!c.hasExplicitMipChain&&!this.device.isTextureFormatCompressed(l);if(this.device.type==="webgpu"&&f){const g=this.props.dimension==="3d"?it.SAMPLE|it.STORAGE|it.COPY_DST|it.COPY_SRC:it.SAMPLE|it.RENDER|it.COPY_DST|it.COPY_SRC;u.usage|=g}const d=this.device.getMipLevelCount(u.width,u.height),h=c.hasExplicitMipChain?c.mipLevels:this.props.mipLevels==="auto"?d:Math.max(1,Math.min(d,this.props.mipLevels??1)),p={...u,mipLevels:h};this._texture=this.device.createTexture(p),this._sampler=this.texture.sampler,this._view=this.texture.view,c.subresources.length&&this._setTextureSubresources(c.subresources),this.props.mipmaps&&!c.hasExplicitMipChain&&!f&&k.warn(`${this} skipping auto-generated mipmaps for compressed texture format`)(),f&&this.generateMipmaps(),this.isReady=!0,this.resolveReady(this.texture),k.info(0,`${this} created`)()}catch(e){const i=e instanceof Error?e:new Error(String(e));this.rejectReady(i)}}destroy(){this._texture&&(this._texture.destroy(),this._texture=null,this._sampler=null,this._view=null),this.destroyed=!0}generateMipmaps(){this.device.type==="webgl"?this.texture.generateMipmapsWebGL():this.device.type==="webgpu"?this.device.generateMipmapsWebGPU(this.texture):k.warn(`${this} mipmaps not supported on ${this.device.type}`)}setSampler(t={}){this._checkReady();const e=t instanceof oo?t:this.device.createSampler(t);this.texture.setSampler(e),this._sampler=e}async readBuffer(t={}){this.isReady||await this.ready;const e=t.width??this.texture.width,i=t.height??this.texture.height,n=t.depthOrArrayLayers??this.texture.depth,o=this.texture.computeMemoryLayout({width:e,height:i,depthOrArrayLayers:n}),r=this.device.createBuffer({byteLength:o.byteLength,usage:Z.COPY_DST|Z.MAP_READ});this.texture.readBuffer({...t,width:e,height:i,depthOrArrayLayers:n},r);const a=this.device.createFence();return await a.signaled,a.destroy(),r}async readAsync(t={}){this.isReady||await this.ready;const e=t.width??this.texture.width,i=t.height??this.texture.height,n=t.depthOrArrayLayers??this.texture.depth,o=this.texture.computeMemoryLayout({width:e,height:i,depthOrArrayLayers:n}),r=await this.readBuffer(t),a=await r.readAsync(0,o.byteLength);return r.destroy(),a.buffer}resize(t){if(this._checkReady(),t.width===this.texture.width&&t.height===this.texture.height)return!1;const e=this.texture;return this._texture=e.clone(t),this._sampler=this.texture.sampler,this._view=this.texture.view,e.destroy(),k.info(`${this} resized`),!0}getCubeFaceIndex(t){const e=Mo[t];if(e===void 0)throw new Error(`Invalid cube face: ${t}`);return e}getCubeArrayFaceIndex(t,e){return 6*t+this.getCubeFaceIndex(e)}setTexture1DData(t){if(this._checkReady(),this.texture.props.dimension!=="1d")throw new Error(`${this} is not 1d`);const e=Oo();this._setTextureSubresources(e)}setTexture2DData(t,e=0){if(this._checkReady(),this.texture.props.dimension!=="2d")throw new Error(`${this} is not 2d`);const i=$t(e,t);this._setTextureSubresources(i)}setTexture3DData(t){if(this.texture.props.dimension!=="3d")throw new Error(`${this} is not 3d`);const e=Ro(t);this._setTextureSubresources(e)}setTextureArrayData(t){if(this.texture.props.dimension!=="2d-array")throw new Error(`${this} is not 2d-array`);const e=zo(t);this._setTextureSubresources(e)}setTextureCubeData(t){if(this.texture.props.dimension!=="cube")throw new Error(`${this} is not cube`);const e=Bo(t);this._setTextureSubresources(e)}setTextureCubeArrayData(t){if(this.texture.props.dimension!=="cube-array")throw new Error(`${this} is not cube-array`);const e=Fo(t);this._setTextureSubresources(e)}_setTextureSubresources(t){for(const e of t){const{z:i,mipLevel:n}=e;switch(e.type){case"external-image":const{image:o,flipY:r}=e;this.texture.copyExternalImage({image:o,z:i,mipLevel:n,flipY:r});break;case"texture-data":const{data:a,textureFormat:c}=e;if(c&&c!==this.texture.format)throw new Error(`${this} mip level ${n} uses format "${c}" but texture format is "${this.texture.format}"`);this.texture.writeData(a.data,{x:0,y:0,z:i,width:a.width,height:a.height,depthOrArrayLayers:1,mipLevel:n});break;default:throw new Error("Unsupported 2D mip-level payload")}}}async _loadAllData(t){const e=await Ai(t.data);return{dimension:t.dimension??"2d",data:e??null}}_checkNotDestroyed(){this.destroyed&&k.warn(`${this} already destroyed`)}_checkReady(){this.isReady||k.warn(`${this} Cannot perform this operation before ready`)}static defaultProps={...it.defaultProps,dimension:"2d",data:null,mipmaps:!1}}function El(s){if(!s.data)return[];const t=s.width&&s.height?{width:s.width,height:s.height}:void 0,e="format"in s?s.format:void 0;switch(s.dimension){case"1d":return Oo();case"2d":return $t(0,s.data,t,e);case"3d":return Ro(s.data);case"2d-array":return zo(s.data);case"cube":return Bo(s.data);case"cube-array":return Fo(s.data);default:throw new Error(`Unhandled dimension ${s.dimension}`)}}function Il(s,t,e,i){if(t.length===0)return{subresources:t,mipLevels:1,format:i.format,hasExplicitMipChain:!1};const n=new Map;for(const u of t){const f=n.get(u.z)??[];f.push(u),n.set(u.z,f)}const o=t.some(u=>u.mipLevel>0);let r=i.format,a=Number.POSITIVE_INFINITY;const c=[];for(const[u,f]of n){const d=[...f].sort((C,b)=>C.mipLevel-b.mipLevel),h=d[0];if(!h||h.mipLevel!==0)throw new Error(`DynamicTexture: slice ${u} is missing mip level 0`);const p=Us(s,h);if(p.width!==e.width||p.height!==e.height)throw new Error(`DynamicTexture: slice ${u} base level dimensions ${p.width}x${p.height} do not match expected ${e.width}x${e.height}`);const g=ks(h);if(g){if(r&&r!==g)throw new Error(`DynamicTexture: slice ${u} base level format "${g}" does not match texture format "${r}"`);r=g}const y=r&&s.isTextureFormatCompressed(r)?Ol(s,p.width,p.height,r):s.getMipLevelCount(p.width,p.height);let v=0;for(let C=0;C<d.length;C++){const b=d[C];if(!b||b.mipLevel!==C||C>=y)break;const P=Us(s,b),w=Math.max(1,p.width>>C),M=Math.max(1,p.height>>C);if(P.width!==w||P.height!==M)break;const I=ks(b);if(I&&(r||(r=I),I!==r))break;v++,c.push(b)}a=Math.min(a,v)}const l=Number.isFinite(a)?Math.max(1,a):1;return{subresources:c.filter(u=>u.mipLevel<l),mipLevels:l,format:r,hasExplicitMipChain:o}}function ks(s){if(s.type==="texture-data")return s.textureFormat??Eo(s.data)}function Us(s,t){switch(t.type){case"external-image":return s.getExternalImageSize(t.image);case"texture-data":return{width:t.data.width,height:t.data.height};default:throw new Error("Unsupported texture subresource")}}function Ol(s,t,e,i){const{blockWidth:n=1,blockHeight:o=1}=s.getTextureFormatInfo(i);let r=1;for(let a=1;;a++){const c=Math.max(1,t>>a),l=Math.max(1,e>>a);if(c<n||l<o)break;r++}return r}async function Ai(s){if(s=await s,Array.isArray(s))return await Promise.all(s.map(Ai));if(s&&typeof s=="object"&&s.constructor===Object){const t=s,e=await Promise.all(Object.values(t).map(Ai)),i=Object.keys(t),n={};for(let o=0;o<i.length;o++)n[i[o]]=e[o];return n}return s}const yt=2,Rl=1e4,Ds="render pipeline initialization failed";class rt{static defaultProps={...Zt.defaultProps,source:void 0,vs:null,fs:null,id:"unnamed",handle:void 0,userData:{},defines:{},modules:[],geometry:null,indexBuffer:null,attributes:{},constantAttributes:{},bindings:{},uniforms:{},varyings:[],isInstanced:void 0,instanceCount:0,vertexCount:0,shaderInputs:void 0,material:void 0,pipelineFactory:void 0,shaderFactory:void 0,transformFeedback:void 0,shaderAssembler:ga.getDefaultShaderAssembler(),debugShaders:void 0,disableWarnings:void 0};device;id;source;vs;fs;pipelineFactory;shaderFactory;userData={};parameters;topology;bufferLayout;isInstanced=void 0;instanceCount=0;vertexCount;indexBuffer=null;bufferAttributes={};constantAttributes={};bindings={};vertexArray;transformFeedback=null;pipeline;shaderInputs;material=null;_uniformStore;_attributeInfos={};_gpuGeometry=null;props;_pipelineNeedsUpdate="newly created";_needsRedraw="initializing";_destroyed=!1;_lastDrawTimestamp=-1;_bindingTable=[];get[Symbol.toStringTag](){return"Model"}toString(){return`Model(${this.id})`}constructor(t,e){this.props={...rt.defaultProps,...e},e=this.props,this.id=e.id||Ve("model"),this.device=t,Object.assign(this.userData,e.userData),this.material=e.material||null;const i=Object.fromEntries(this.props.modules?.map(c=>[c.name,c])||[]),n=e.shaderInputs||new Pl(i,{disableWarnings:this.props.disableWarnings});this.setShaderInputs(n);const o=zl(t),r=(this.props.modules?.length>0?this.props.modules:this.shaderInputs?.getModules())||[];if(this.props.shaderLayout=Fs(this.props.shaderLayout,r)||null,this.device.type==="webgpu"&&this.props.source){const{source:c,getUniforms:l,bindingTable:u}=this.props.shaderAssembler.assembleWGSLShader({platformInfo:o,...this.props,modules:r});this.source=c,this._getModuleUniforms=l,this._bindingTable=u;const f=t.getShaderLayout?.(this.source);this.props.shaderLayout=Fs(this.props.shaderLayout||f||null,r)||null}else{const{vs:c,fs:l,getUniforms:u}=this.props.shaderAssembler.assembleGLSLShaderPair({platformInfo:o,...this.props,modules:r});this.vs=c,this.fs=l,this._getModuleUniforms=u,this._bindingTable=[]}this.vertexCount=this.props.vertexCount,this.instanceCount=this.props.instanceCount,this.topology=this.props.topology,this.bufferLayout=this.props.bufferLayout,this.parameters=this.props.parameters,e.geometry&&this.setGeometry(e.geometry),this.pipelineFactory=e.pipelineFactory||qi.getDefaultPipelineFactory(this.device),this.shaderFactory=e.shaderFactory||Yi.getDefaultShaderFactory(this.device),this.pipeline=this._updatePipeline(),this.vertexArray=t.createVertexArray({shaderLayout:this.pipeline.shaderLayout,bufferLayout:this.pipeline.bufferLayout}),this._gpuGeometry&&this._setGeometryAttributes(this._gpuGeometry),"isInstanced"in e&&(this.isInstanced=e.isInstanced),e.instanceCount&&this.setInstanceCount(e.instanceCount),e.vertexCount&&this.setVertexCount(e.vertexCount),e.indexBuffer&&this.setIndexBuffer(e.indexBuffer),e.attributes&&this.setAttributes(e.attributes),e.constantAttributes&&this.setConstantAttributes(e.constantAttributes),e.bindings&&this.setBindings(e.bindings),e.transformFeedback&&(this.transformFeedback=e.transformFeedback)}destroy(){this._destroyed||(this.pipelineFactory.release(this.pipeline),this.shaderFactory.release(this.pipeline.vs),this.pipeline.fs&&this.pipeline.fs!==this.pipeline.vs&&this.shaderFactory.release(this.pipeline.fs),this._uniformStore.destroy(),this._gpuGeometry?.destroy(),this._destroyed=!0)}needsRedraw(){this._getBindingsUpdateTimestamp()>this._lastDrawTimestamp&&this.setNeedsRedraw("contents of bound textures or buffers updated");const t=this._needsRedraw;return this._needsRedraw=!1,t}setNeedsRedraw(t){this._needsRedraw||=t}getBindingDebugTable(){return this._bindingTable}predraw(){this.updateShaderInputs(),this.pipeline=this._updatePipeline()}draw(t){const e=this._areBindingsLoading();if(e)return k.info(yt,`>>> DRAWING ABORTED ${this.id}: ${e} not loaded`)(),!1;try{t.pushDebugGroup(`${this}.predraw(${t})`),this.predraw()}finally{t.popDebugGroup()}let i,n=this.pipeline.isErrored;try{if(t.pushDebugGroup(`${this}.draw(${t})`),this._logDrawCallStart(),this.pipeline=this._updatePipeline(),n=this.pipeline.isErrored,n)k.info(yt,`>>> DRAWING ABORTED ${this.id}: ${Ds}`)(),i=!1;else{const o=this._getBindings(),r=this._getBindGroups(),{indexBuffer:a}=this.vertexArray,c=a?a.byteLength/(a.indexType==="uint32"?4:2):void 0;i=this.pipeline.draw({renderPass:t,vertexArray:this.vertexArray,isInstanced:this.isInstanced,vertexCount:this.vertexCount,instanceCount:this.instanceCount,indexCount:c,transformFeedback:this.transformFeedback||void 0,bindings:o,bindGroups:r,_bindGroupCacheKeys:this._getBindGroupCacheKeys(),uniforms:this.props.uniforms,parameters:this.parameters,topology:this.topology})}}finally{t.popDebugGroup(),this._logDrawCallEnd()}return this._logFramebuffer(t),i?(this._lastDrawTimestamp=this.device.timestamp,this._needsRedraw=!1):n?this._needsRedraw=Ds:this._needsRedraw="waiting for resource initialization",i}setGeometry(t){this._gpuGeometry?.destroy();const e=t&&al(this.device,t);if(e){this.setTopology(e.topology||"triangle-list");const i=new si(this.bufferLayout);this.bufferLayout=i.mergeBufferLayouts(e.bufferLayout,this.bufferLayout),this.vertexArray&&this._setGeometryAttributes(e)}this._gpuGeometry=e}setTopology(t){t!==this.topology&&(this.topology=t,this._setPipelineNeedsUpdate("topology"))}setBufferLayout(t){const e=new si(this.bufferLayout);this.bufferLayout=this._gpuGeometry?e.mergeBufferLayouts(t,this._gpuGeometry.bufferLayout):t,this._setPipelineNeedsUpdate("bufferLayout"),this.pipeline=this._updatePipeline(),this.vertexArray=this.device.createVertexArray({shaderLayout:this.pipeline.shaderLayout,bufferLayout:this.pipeline.bufferLayout}),this._gpuGeometry&&this._setGeometryAttributes(this._gpuGeometry)}setParameters(t){Pi(t,this.parameters,2)||(this.parameters=t,this._setPipelineNeedsUpdate("parameters"))}setInstanceCount(t){this.instanceCount=t,this.isInstanced===void 0&&t>0&&(this.isInstanced=!0),this.setNeedsRedraw("instanceCount")}setVertexCount(t){this.vertexCount=t,this.setNeedsRedraw("vertexCount")}setShaderInputs(t){this.shaderInputs=t,this._uniformStore=new Vc(this.device,this.shaderInputs.modules);for(const[e,i]of Object.entries(this.shaderInputs.modules))if(_l(i)&&!this.material?.ownsModule(e)){const n=this._uniformStore.getManagedUniformBuffer(e);this.bindings[`${e}Uniforms`]=n}this.setNeedsRedraw("shaderInputs")}setMaterial(t){this.material=t,this.setNeedsRedraw("material")}updateShaderInputs(){this._uniformStore.setUniforms(this.shaderInputs.getUniformValues()),this.setBindings(this._getNonMaterialBindings(this.shaderInputs.getBindingValues())),this.setNeedsRedraw("shaderInputs")}setBindings(t){Object.assign(this.bindings,t),this.setNeedsRedraw("bindings")}setTransformFeedback(t){this.transformFeedback=t,this.setNeedsRedraw("transformFeedback")}setIndexBuffer(t){this.vertexArray.setIndexBuffer(t),this.setNeedsRedraw("indexBuffer")}setAttributes(t,e){const i=e?.disableWarnings??this.props.disableWarnings;t.indices&&k.warn(`Model:${this.id} setAttributes() - indexBuffer should be set using setIndexBuffer()`)(),this.bufferLayout=yl(this.pipeline.shaderLayout,this.bufferLayout);const n=new si(this.bufferLayout);for(const[o,r]of Object.entries(t)){const a=n.getBufferLayout(o);if(!a){i||k.warn(`Model(${this.id}): Missing layout for buffer "${o}".`)();continue}const c=n.getAttributeNamesForBuffer(a);let l=!1;for(const u of c){const f=this._attributeInfos[u];if(f){const d=this.device.type==="webgpu"?n.getBufferIndex(f.bufferName):f.location;this.vertexArray.setBuffer(d,r),l=!0}}!l&&!i&&k.warn(`Model(${this.id}): Ignoring buffer "${r.id}" for unknown attribute "${o}"`)()}this.setNeedsRedraw("attributes")}setConstantAttributes(t,e){for(const[i,n]of Object.entries(t)){const o=this._attributeInfos[i];o?this.vertexArray.setConstantWebGL(o.location,n):(e?.disableWarnings??this.props.disableWarnings)||k.warn(`Model "${this.id}: Ignoring constant supplied for unknown attribute "${i}"`)()}this.setNeedsRedraw("constants")}_areBindingsLoading(){for(const t of Object.values(this.bindings))if(t instanceof It&&!t.isReady)return t.id;for(const t of Object.values(this.material?.bindings||{}))if(t instanceof It&&!t.isReady)return t.id;return!1}_getBindings(){const t={};for(const[e,i]of Object.entries(this.bindings))i instanceof It?i.isReady&&(t[e]=i.texture):t[e]=i;return t}_getBindGroups(){const t=this.pipeline?.shaderLayout||this.props.shaderLayout||{bindings:[]},e=t.bindings.length?Aa(t,this._getBindings()):{0:this._getBindings()};if(!this.material)return e;for(const[i,n]of Object.entries(this.material.getBindingsByGroup())){const o=Number(i);e[o]={...e[o]||{},...n}}return e}_getBindGroupCacheKeys(){const t=this.material?.getBindGroupCacheKey(3);return t?{3:t}:{}}_getBindingsUpdateTimestamp(){let t=0;for(const e of Object.values(this.bindings))e instanceof Sa?t=Math.max(t,e.texture.updateTimestamp):e instanceof Z||e instanceof it?t=Math.max(t,e.updateTimestamp):e instanceof It?t=e.texture?Math.max(t,e.texture.updateTimestamp):1/0:e instanceof oo||(t=Math.max(t,e.buffer.updateTimestamp));return Math.max(t,this.material?.getBindingsUpdateTimestamp()||0)}_setGeometryAttributes(t){const e={...t.attributes};for(const[i]of Object.entries(e))!this.pipeline.shaderLayout.attributes.find(n=>n.name===i)&&i!=="positions"&&delete e[i];this.vertexCount=t.vertexCount,this.setIndexBuffer(t.indices||null),this.setAttributes(t.attributes,{disableWarnings:!0}),this.setAttributes(e,{disableWarnings:this.props.disableWarnings}),this.setNeedsRedraw("geometry attributes")}_setPipelineNeedsUpdate(t){this._pipelineNeedsUpdate||=t,this.setNeedsRedraw(t)}_updatePipeline(){if(this._pipelineNeedsUpdate){let t=null,e=null;this.pipeline&&(k.log(1,`Model ${this.id}: Recreating pipeline because "${this._pipelineNeedsUpdate}".`)(),t=this.pipeline.vs,e=this.pipeline.fs),this._pipelineNeedsUpdate=!1;const i=this.shaderFactory.createShader({id:`${this.id}-vertex`,stage:"vertex",source:this.source||this.vs,debugShaders:this.props.debugShaders});let n=null;this.source?n=i:this.fs&&(n=this.shaderFactory.createShader({id:`${this.id}-fragment`,stage:"fragment",source:this.source||this.fs,debugShaders:this.props.debugShaders})),this.pipeline=this.pipelineFactory.createRenderPipeline({...this.props,bindings:void 0,bufferLayout:this.bufferLayout,topology:this.topology,parameters:this.parameters,bindGroups:this._getBindGroups(),vs:i,fs:n}),this._attributeInfos=Ma(this.pipeline.shaderLayout,this.bufferLayout),t&&this.shaderFactory.release(t),e&&e!==t&&this.shaderFactory.release(e)}return this.pipeline}_lastLogTime=0;_logOpen=!1;_logDrawCallStart(){const t=k.level>3?0:Rl;k.level<2||Date.now()-this._lastLogTime<t||(this._lastLogTime=Date.now(),this._logOpen=!0,k.group(yt,`>>> DRAWING MODEL ${this.id}`,{collapsed:k.level<=2})())}_logDrawCallEnd(){if(this._logOpen){const t=ul(this.pipeline.shaderLayout,this.id);k.table(yt,t)();const e=this.shaderInputs.getDebugTable();k.table(yt,e)();const i=this._getAttributeDebugTable();k.table(yt,this._attributeInfos)(),k.table(yt,i)(),k.groupEnd(yt)(),this._logOpen=!1}}_drawCount=0;_logFramebuffer(t){const e=this.device.props.debugFramebuffers;if(this._drawCount++,!e)return;const i=t.props.framebuffer;fl(t,i,{id:i?.id||`${this.id}-framebuffer`,minimap:!0})}_getAttributeDebugTable(){const t={};for(const[e,i]of Object.entries(this._attributeInfos)){const n=this.vertexArray.attributes[i.location];t[i.location]={name:e,type:i.shaderType,values:n?this._getBufferOrConstantValues(n,i.bufferDataType):"null"}}if(this.vertexArray.indexBuffer){const{indexBuffer:e}=this.vertexArray,i=e.indexType==="uint32"?new Uint32Array(e.debugData):new Uint16Array(e.debugData);t.indices={name:"indices",type:e.indexType,values:i.toString()}}return t}_getBufferOrConstantValues(t,e){const i=_i.getTypedArrayConstructor(e);return(t instanceof Z?new i(t.debugData):t).toString()}_getNonMaterialBindings(t){if(!this.material)return t;const e={};for(const[i,n]of Object.entries(t))this.material.ownsBinding(i)||(e[i]=n);return e}}function zl(s){return{type:s.type,shaderLanguage:s.info.shadingLanguage,shaderLanguageVersion:s.info.shadingLanguageVersion,gpu:s.info.gpu,features:s.features}}class Ft{device;model;transformFeedback;static defaultProps={...rt.defaultProps,outputs:void 0,feedbackBuffers:void 0};static isSupported(t){return t?.info?.type==="webgl"}constructor(t,e=Ft.defaultProps){if(!Ft.isSupported(t))throw new Error("BufferTransform not yet implemented on WebGPU");this.device=t,this.model=new rt(this.device,{id:e.id||"buffer-transform-model",fs:e.fs||Va(),topology:e.topology||"point-list",varyings:e.outputs||e.varyings,...e}),this.transformFeedback=this.device.createTransformFeedback({layout:this.model.pipeline.shaderLayout,buffers:e.feedbackBuffers}),this.model.setTransformFeedback(this.transformFeedback),Object.seal(this)}destroy(){this.model&&this.model.destroy()}delete(){this.destroy()}run(t){t?.inputBuffers&&this.model.setAttributes(t.inputBuffers),t?.outputBuffers&&this.transformFeedback.setBuffers(t.outputBuffers);const e=this.device.beginRenderPass(t);this.model.draw(e),e.end()}getBuffer(t){return this.transformFeedback.getBuffer(t)}readAsync(t){const e=this.getBuffer(t);if(!e)throw new Error("BufferTransform#getBuffer");if(e instanceof Z)return e.readAsync();const{buffer:i,byteOffset:n=0,byteLength:o=i.byteLength}=e;return i.readAsync(n,o)}}class pt{id;topology;vertexCount;indices;attributes;userData={};constructor(t){const{attributes:e={},indices:i=null,vertexCount:n=null}=t;this.id=t.id||Ve("geometry"),this.topology=t.topology,i&&(this.indices=ArrayBuffer.isView(i)?{value:i,size:1}:i),this.attributes={};for(const[o,r]of Object.entries(e)){const a=ArrayBuffer.isView(r)?{value:r}:r;if(!ArrayBuffer.isView(a.value))throw new Error(`${this._print(o)}: must be typed array or object with value as typed array`);if((o==="POSITION"||o==="positions")&&!a.size&&(a.size=3),o==="indices"){if(this.indices)throw new Error("Multiple indices detected");this.indices=a}else this.attributes[o]=a}this.indices&&this.indices.isIndexed!==void 0&&(this.indices=Object.assign({},this.indices),delete this.indices.isIndexed),this.vertexCount=n||this._calculateVertexCount(this.attributes,this.indices)}getVertexCount(){return this.vertexCount}getAttributes(){return this.indices?{indices:this.indices,...this.attributes}:this.attributes}_print(t){return`Geometry ${this.id} attribute ${t}`}_setAttributes(t,e){return this}_calculateVertexCount(t,e){if(e)return e.value.length;let i=1/0;for(const n of Object.values(t)){const{value:o,size:r,constant:a}=n;!a&&o&&r!==void 0&&r>=1&&(i=Math.min(i,o.length/r))}return i}}function Bl(s){switch(s){case"float64":return Float64Array;case"uint8":case"unorm8":return Uint8ClampedArray;default:return Ea(s)}}const Fl=_i.getDataType.bind(_i);function ue(s,t,e){if(t.size>4)return null;const i=e==="webgpu"&&t.type==="uint8"?"unorm8":t.type;return{attribute:s,format:t.size>1?`${i}x${t.size}`:t.type,byteOffset:t.offset||0}}function Tt(s){return s.stride||s.size*s.bytesPerElement}function Nl(s,t){return s.type===t.type&&s.size===t.size&&Tt(s)===Tt(t)&&(s.offset||0)===(t.offset||0)}function Si(s,t){t.offset&&K.removed("shaderAttribute.offset","vertexOffset, elementOffset")();const e=Tt(s),i=t.vertexOffset!==void 0?t.vertexOffset:s.vertexOffset||0,n=t.elementOffset||0,o=i*e+n*s.bytesPerElement+(s.offset||0);return{...t,offset:o,stride:e}}function kl(s,t){const e=Si(s,t);return{high:e,low:{...e,offset:e.offset+s.size*4}}}class Ul{constructor(t,e,i){this._buffer=null,this.device=t,this.id=e.id||"",this.size=e.size||1;const n=e.logicalType||e.type,o=n==="float64";let{defaultValue:r}=e;r=Number.isFinite(r)?[r]:r||new Array(this.size).fill(0);let a;o?a="float32":!n&&e.isIndexed?a="uint32":a=n||"float32";let c=Bl(n||a);this.doublePrecision=o,o&&e.fp64===!1&&(c=Float32Array),this.value=null,this.settings={...e,defaultType:c,defaultValue:r,logicalType:n,type:a,normalized:a.includes("norm"),size:this.size,bytesPerElement:c.BYTES_PER_ELEMENT},this.state={...i,externalBuffer:null,bufferAccessor:this.settings,allocatedValue:null,numInstances:0,bounds:null,constant:!1}}get isConstant(){return this.state.constant}get buffer(){return this._buffer}get byteOffset(){const t=this.getAccessor();return t.vertexOffset?t.vertexOffset*Tt(t):0}get numInstances(){return this.state.numInstances}set numInstances(t){this.state.numInstances=t}delete(){this._buffer&&(this._buffer.delete(),this._buffer=null),Re.release(this.state.allocatedValue)}getBuffer(){return this.state.constant?null:this.state.externalBuffer||this._buffer}getValue(t=this.id,e=null){const i={};if(this.state.constant){const n=this.value;if(e){const o=Si(this.getAccessor(),e),r=o.offset/n.BYTES_PER_ELEMENT,a=o.size||this.size;i[t]=n.subarray(r,r+a)}else i[t]=n}else i[t]=this.getBuffer();return this.doublePrecision&&(this.value instanceof Float64Array?i[`${t}64Low`]=i[t]:i[`${t}64Low`]=new Float32Array(this.size)),i}_getBufferLayout(t=this.id,e=null){const i=this.getAccessor(),n=[],o={name:this.id,byteStride:Tt(i)};if(this.doublePrecision){const r=kl(i,e||{});n.push(ue(t,{...i,...r.high},this.device.type),ue(`${t}64Low`,{...i,...r.low},this.device.type))}else if(e){const r=Si(i,e);n.push(ue(t,{...i,...r},this.device.type))}else n.push(ue(t,i,this.device.type));return o.attributes=n.filter(Boolean),o}setAccessor(t){this.state.bufferAccessor=t}getAccessor(){return this.state.bufferAccessor}getBounds(){if(this.state.bounds)return this.state.bounds;let t=null;if(this.state.constant&&this.value){const e=Array.from(this.value);t=[e,e]}else{const{value:e,numInstances:i,size:n}=this,o=i*n;if(e&&o&&e.length>=o){const r=new Array(n).fill(1/0),a=new Array(n).fill(-1/0);for(let c=0;c<o;)for(let l=0;l<n;l++){const u=e[c++];u<r[l]&&(r[l]=u),u>a[l]&&(a[l]=u)}t=[r,a]}}return this.state.bounds=t,t}setData(t){const{state:e}=this;let i;ArrayBuffer.isView(t)?i={value:t}:t instanceof Z?i={buffer:t}:i=t;const n={...this.settings,...i};if(ArrayBuffer.isView(i.value)){if(!i.type)if(this.doublePrecision&&i.value instanceof Float64Array)n.type="float32";else{const r=Fl(i.value);n.type=n.normalized?r.replace("int","norm"):r}n.bytesPerElement=i.value.BYTES_PER_ELEMENT,n.stride=Tt(n)}if(e.bounds=null,i.constant){let o=i.value;if(o=this._normalizeValue(o,[],0),this.settings.normalized&&(o=this.normalizeConstant(o)),!(!e.constant||!this._areValuesEqual(o,this.value)))return!1;e.externalBuffer=null,e.constant=!0,this.value=ArrayBuffer.isView(o)?o:new Float32Array(o)}else if(i.buffer){const o=i.buffer;e.externalBuffer=o,e.constant=!1,this.value=i.value||null}else if(i.value){this._checkExternalBuffer(i);let o=i.value;e.externalBuffer=null,e.constant=!1,this.value=o;let{buffer:r}=this;const a=Tt(n),c=(n.vertexOffset||0)*a;if(this.doublePrecision&&o instanceof Float64Array&&(o=Xe(o,n)),this.settings.isIndexed){const u=this.settings.defaultType;o.constructor!==u&&(o=new u(o))}const l=o.byteLength+c+a*2;(!r||r.byteLength<l)&&(r=this._createBuffer(l)),r.write(o,c)}return this.setAccessor(n),!0}updateSubBuffer(t={}){this.state.bounds=null;const e=this.value,{startOffset:i=0,endOffset:n}=t;this.buffer.write(this.doublePrecision&&e instanceof Float64Array?Xe(e,{size:this.size,startIndex:i,endIndex:n}):e.subarray(i,n),i*e.BYTES_PER_ELEMENT+this.byteOffset)}allocate(t,e=!1){const{state:i}=this,n=i.allocatedValue,o=Re.allocate(n,t+1,{size:this.size,type:this.settings.defaultType,copy:e});this.value=o;const{byteOffset:r}=this;let{buffer:a}=this;return(!a||a.byteLength<o.byteLength+r)&&(a=this._createBuffer(o.byteLength+r),e&&n&&a.write(n instanceof Float64Array?Xe(n,this):n,r)),i.allocatedValue=o,i.constant=!1,i.externalBuffer=null,this.setAccessor(this.settings),!0}_checkExternalBuffer(t){const{value:e}=t;if(!ArrayBuffer.isView(e))throw new Error(`Attribute ${this.id} value is not TypedArray`);const i=this.settings.defaultType;let n=!1;if(this.doublePrecision&&(n=e.BYTES_PER_ELEMENT<4),n)throw new Error(`Attribute ${this.id} does not support ${e.constructor.name}`);!(e instanceof i)&&this.settings.normalized&&!("normalized"in t)&&K.warn(`Attribute ${this.id} is normalized`)()}normalizeConstant(t){switch(this.settings.type){case"snorm8":return new Float32Array(t).map(e=>(e+128)/255*2-1);case"snorm16":return new Float32Array(t).map(e=>(e+32768)/65535*2-1);case"unorm8":return new Float32Array(t).map(e=>e/255);case"unorm16":return new Float32Array(t).map(e=>e/65535);default:return t}}_normalizeValue(t,e,i){const{defaultValue:n,size:o}=this.settings;if(Number.isFinite(t))return e[i]=t,e;if(!t){let r=o;for(;--r>=0;)e[i+r]=n[r];return e}switch(o){case 4:e[i+3]=Number.isFinite(t[3])?t[3]:n[3];case 3:e[i+2]=Number.isFinite(t[2])?t[2]:n[2];case 2:e[i+1]=Number.isFinite(t[1])?t[1]:n[1];case 1:e[i+0]=Number.isFinite(t[0])?t[0]:n[0];break;default:let r=o;for(;--r>=0;)e[i+r]=Number.isFinite(t[r])?t[r]:n[r]}return e}_areValuesEqual(t,e){if(!t||!e)return!1;const{size:i}=this;for(let n=0;n<i;n++)if(t[n]!==e[n])return!1;return!0}_createBuffer(t){this._buffer&&this._buffer.destroy();const{isIndexed:e,type:i}=this.settings;return this._buffer=this.device.createBuffer({...this._buffer?.props,id:this.id,usage:(e?Z.INDEX:Z.VERTEX)|Z.COPY_DST,indexType:e?i:void 0,byteLength:t}),this._buffer}}const $s=[],js=[];function Mt(s,t=0,e=1/0){let i=$s;const n={index:-1,data:s,target:[]};return s?typeof s[Symbol.iterator]=="function"?i=s:s.length>0&&(js.length=s.length,i=js):i=$s,(t>0||Number.isFinite(e))&&(i=(Array.isArray(i)?i:Array.from(i)).slice(t,e),n.index=t-1),{iterable:i,objectInfo:n}}function No(s){return s&&s[Symbol.asyncIterator]}function ko(s,t){const{size:e,stride:i,offset:n,startIndices:o,nested:r}=t,a=s.BYTES_PER_ELEMENT,c=i?i/a:e,l=n?n/a:0,u=Math.floor((s.length-l)/c);return(f,{index:d,target:h})=>{if(!o){const v=d*c+l;for(let C=0;C<e;C++)h[C]=s[v+C];return h}const p=o[d],g=o[d+1]||u;let y;if(r){y=new Array(g-p);for(let v=p;v<g;v++){const C=v*c+l;h=new Array(e);for(let b=0;b<e;b++)h[b]=s[C+b];y[v-p]=h}}else if(c===e)y=s.subarray(p*e+l,g*e+l);else{y=new s.constructor((g-p)*e);let v=0;for(let C=p;C<g;C++){const b=C*c+l;for(let P=0;P<e;P++)y[v++]=s[b+P]}}return y}}const Dl=[],Te=[[0,1/0]];function $l(s,t){if(s===Te||(t[0]<0&&(t[0]=0),t[0]>=t[1]))return s;const e=[],i=s.length;let n=0;for(let o=0;o<i;o++){const r=s[o];r[1]<t[0]?(e.push(r),n=o+1):r[0]>t[1]?e.push(r):t=[Math.min(r[0],t[0]),Math.max(r[1],t[1])]}return e.splice(n,0,t),e}const jl={interpolation:{duration:0,easing:s=>s},spring:{stiffness:.05,damping:.5}};function Uo(s,t){if(!s)return null;Number.isFinite(s)&&(s={type:"interpolation",duration:s});const e=s.type||"interpolation";return{...jl[e],...t,...s,type:e}}class Do extends Ul{constructor(t,e){super(t,e,{startIndices:null,lastExternalBuffer:null,binaryValue:null,binaryAccessor:null,needsUpdate:!0,needsRedraw:!1,layoutChanged:!1,updateRanges:Te}),this.constant=!1,this.settings.update=e.update||(e.accessor?this._autoUpdater:void 0),Object.seal(this.settings),Object.seal(this.state),this._validateAttributeUpdaters()}get startIndices(){return this.state.startIndices}set startIndices(t){this.state.startIndices=t}needsUpdate(){return this.state.needsUpdate}needsRedraw({clearChangedFlags:t=!1}={}){const e=this.state.needsRedraw;return this.state.needsRedraw=e&&!t,e}layoutChanged(){return this.state.layoutChanged}setAccessor(t){var e;(e=this.state).layoutChanged||(e.layoutChanged=!Nl(t,this.getAccessor())),super.setAccessor(t)}getUpdateTriggers(){const{accessor:t}=this.settings;return[this.id].concat(typeof t!="function"&&t||[])}supportsTransition(){return!!this.settings.transition}getTransitionSetting(t){if(!t||!this.supportsTransition())return null;const{accessor:e}=this.settings,i=this.settings.transition,n=Array.isArray(e)?t[e.find(o=>t[o])]:t[e];return Uo(n,i)}setNeedsUpdate(t=this.id,e){if(this.state.needsUpdate=this.state.needsUpdate||t,this.setNeedsRedraw(t),e){const{startRow:i=0,endRow:n=1/0}=e;this.state.updateRanges=$l(this.state.updateRanges,[i,n])}else this.state.updateRanges=Te}clearNeedsUpdate(){this.state.needsUpdate=!1,this.state.updateRanges=Dl}setNeedsRedraw(t=this.id){this.state.needsRedraw=this.state.needsRedraw||t}allocate(t){const{state:e,settings:i}=this;return i.noAlloc?!1:i.update?(super.allocate(t,e.updateRanges!==Te),!0):!1}updateBuffer({numInstances:t,data:e,props:i,context:n}){if(!this.needsUpdate())return!1;const{state:{updateRanges:o},settings:{update:r,noAlloc:a}}=this;let c=!0;if(r){for(const[l,u]of o)r.call(n,this,{data:e,startRow:l,endRow:u,props:i,numInstances:t});if(this.value)if(this.constant||!this.buffer||this.buffer.byteLength<this.value.byteLength+this.byteOffset)this.constant?this.setConstantValue(n,this.value):this.setData({value:this.value,constant:this.constant}),this.constant=!1;else for(const[l,u]of o){const f=Number.isFinite(l)?this.getVertexOffset(l):0,d=Number.isFinite(u)?this.getVertexOffset(u):a||!Number.isFinite(t)?this.value.length:t*this.size;super.updateSubBuffer({startOffset:f,endOffset:d})}this._checkAttributeArray()}else c=!1;return this.clearNeedsUpdate(),this.setNeedsRedraw(),c}setConstantValue(t,e){if(e===void 0||typeof e=="function")return!1;const i=this.settings.transform&&t?this.settings.transform.call(t,e):e;return this.device.type==="webgpu"?this.setConstantBufferValue(i,this.numInstances):(this.setData({constant:!0,value:i})&&this.setNeedsRedraw(),this.clearNeedsUpdate(),!0)}setConstantBufferValue(t,e){const i=this.settings.defaultType,n=this._normalizeValue(t,new i(this.size),0);if(this._hasConstantBufferValue(n,e))return this.constant=!1,this.clearNeedsUpdate(),!1;const o=new i(Math.max(e,1)*this.size);for(let a=0;a<o.length;a+=this.size)o.set(n,a);const r=this.setData({value:o});return this.constant=!1,this.clearNeedsUpdate(),r&&this.setNeedsRedraw(),r}_hasConstantBufferValue(t,e){const i=this.value,n=Math.max(e,1)*this.size;if(!ArrayBuffer.isView(i)||i.length!==n||i.length%this.size!==0)return!1;for(let o=0;o<i.length;o+=this.size)for(let r=0;r<this.size;r++)if(i[o+r]!==t[r])return!1;return!0}setExternalBuffer(t){const{state:e}=this;return t?(this.clearNeedsUpdate(),e.lastExternalBuffer===t||(e.lastExternalBuffer=t,this.setNeedsRedraw(),this.setData(t)),!0):(e.lastExternalBuffer=null,!1)}setBinaryValue(t,e=null){const{state:i,settings:n}=this;if(!t)return i.binaryValue=null,i.binaryAccessor=null,!1;if(n.noAlloc)return!1;if(i.binaryValue===t)return this.clearNeedsUpdate(),!0;if(i.binaryValue=t,this.setNeedsRedraw(),n.transform||e!==this.startIndices){ArrayBuffer.isView(t)&&(t={value:t});const r=t;ht(ArrayBuffer.isView(r.value),`invalid ${n.accessor}`);const a=!!r.size&&r.size!==this.size;return i.binaryAccessor=ko(r.value,{size:r.size||this.size,stride:r.stride,offset:r.offset,startIndices:e,nested:a}),!1}return this.clearNeedsUpdate(),this.setData(t),!0}getVertexOffset(t){const{startIndices:e}=this;return(e?t<e.length?e[t]:this.numInstances:t)*this.size}getValue(){const t=this.settings.shaderAttributes,e=super.getValue();if(!t)return e;for(const i in t)Object.assign(e,super.getValue(i,t[i]));return e}getBufferLayout(t){this.state.layoutChanged=!1;const e=this.settings.shaderAttributes,i=super._getBufferLayout(),{stepMode:n}=this.settings;if(n==="dynamic"?i.stepMode=t?t.isInstanced?"instance":"vertex":"instance":i.stepMode=n??"vertex",!e)return i;for(const o in e){const r=super._getBufferLayout(o,e[o]);i.attributes.push(...r.attributes)}return i}_autoUpdater(t,{data:e,startRow:i,endRow:n,props:o,numInstances:r}){const{settings:a,state:c,value:l,size:u,startIndices:f}=t,{accessor:d,transform:h}=a,p=c.binaryAccessor||(typeof d=="function"?d:o[d]);ht(typeof p=="function",`accessor "${d}" is not a function`);let g=t.getVertexOffset(i);const{iterable:y,objectInfo:v}=Mt(e,i,n);for(const C of y){v.index++;let b=p(C,v);if(h&&(b=h.call(this,b)),f){const P=(v.index<f.length-1?f[v.index+1]:r)-f[v.index];if(b&&Array.isArray(b[0])){let w=g;for(const M of b)t._normalizeValue(M,l,w),w+=u}else b&&b.length>u?l.set(b,g):(t._normalizeValue(b,v.target,0),ma({target:l,source:v.target,start:g,count:P}));g+=P*u}else t._normalizeValue(b,l,g),g+=u}}_validateAttributeUpdaters(){const{settings:t}=this;if(!(t.noAlloc||typeof t.update=="function"))throw new Error(`Attribute ${this.id} missing update or accessor`)}_checkAttributeArray(){const{value:t}=this,e=Math.min(4,this.size);if(t&&t.length>=e){let i=!0;switch(e){case 4:i=i&&Number.isFinite(t[3]);case 3:i=i&&Number.isFinite(t[2]);case 2:i=i&&Number.isFinite(t[1]);case 1:i=i&&Number.isFinite(t[0]);break;default:i=!1}if(!i)throw new Error(`Illegal attribute generated for ${this.id}`)}}}function ni(s){const{source:t,target:e,start:i=0,size:n,getData:o}=s,r=s.end||e.length,a=t.length,c=r-i;if(a>c){e.set(t.subarray(0,c),i);return}if(e.set(t,i),!o)return;let l=a;for(;l<c;){const u=o(l,t);for(let f=0;f<n;f++)e[i+l]=u[f]||0,l++}}function Gl({source:s,target:t,size:e,getData:i,sourceStartIndices:n,targetStartIndices:o}){if(!n||!o)return ni({source:s,target:t,size:e,getData:i}),t;let r=0,a=0;const c=i&&((u,f)=>i(u+a,f)),l=Math.min(n.length,o.length);for(let u=1;u<l;u++){const f=n[u]*e,d=o[u]*e;ni({source:s.subarray(r,f),target:t,start:a,end:d,size:e,getData:c}),r=f,a=d}return a<t.length&&ni({source:[],target:t,start:a,size:e,getData:c}),t}function Vl(s){const{device:t,settings:e,value:i}=s,n=new Do(t,e);return n.setData({value:i instanceof Float64Array?new Float64Array(0):new Float32Array(0),normalized:e.normalized}),n}function $o(s){switch(s){case 1:return"float";case 2:return"vec2";case 3:return"vec3";case 4:return"vec4";default:throw new Error(`No defined attribute type for size "${s}"`)}}function jo(s){switch(s){case 1:return"float32";case 2:return"float32x2";case 3:return"float32x3";case 4:return"float32x4";default:throw new Error("invalid type size")}}function Go(s){s.push(s.shift())}function Wl(s,t){const{doublePrecision:e,settings:i,value:n,size:o}=s,r=e&&n instanceof Float64Array?2:1;let a=0;const{shaderAttributes:c}=s.settings;if(c)for(const l of Object.values(c))a=Math.max(a,l.vertexOffset??0);return(i.noAlloc?n.length:(t+a)*o)*r}function Vo({device:s,source:t,target:e}){return(!e||e.byteLength<t.byteLength)&&(e?.destroy(),e=s.createBuffer({byteLength:t.byteLength,usage:t.usage})),e}function Wo({device:s,buffer:t,attribute:e,fromLength:i,toLength:n,fromStartIndices:o,getData:r=a=>a}){const a=e.doublePrecision&&e.value instanceof Float64Array?2:1,c=e.size*a,l=e.byteOffset,u=e.settings.bytesPerElement<4?l/e.settings.bytesPerElement*4:l,f=e.startIndices,d=o&&f,h=e.isConstant;if(!d&&t&&i>=n)return t;const p=e.value instanceof Float64Array?Float32Array:e.value.constructor,g=h?e.value:new p(e.getBuffer().readSyncWebGL(l,n*p.BYTES_PER_ELEMENT).buffer);if(e.settings.normalized&&!h){const b=r;r=(P,w)=>e.normalizeConstant(b(P,w))}const y=h?(b,P)=>r(g,P):(b,P)=>r(g.subarray(b+l,b+l+c),P),v=t?new Float32Array(t.readSyncWebGL(u,i*4).buffer):new Float32Array(0),C=new Float32Array(n);return Gl({source:v,target:C,sourceStartIndices:o,targetStartIndices:f,size:c,getData:y}),(!t||t.byteLength<C.byteLength+u)&&(t?.destroy(),t=s.createBuffer({byteLength:C.byteLength+u,usage:35050})),t.write(C,u),t}class Ho{constructor({device:t,attribute:e,timeline:i}){this.buffers=[],this.currentLength=0,this.device=t,this.transition=new Wi(i),this.attribute=e,this.attributeInTransition=Vl(e),this.currentStartIndices=e.startIndices}get inProgress(){return this.transition.inProgress}start(t,e,i=1/0){this.settings=t,this.currentStartIndices=this.attribute.startIndices,this.currentLength=Wl(this.attribute,e),this.transition.start({...t,duration:i})}update(){const t=this.transition.update();return t&&this.onUpdate(),t}setBuffer(t){this.attributeInTransition.setData({buffer:t,normalized:this.attribute.settings.normalized,value:this.attributeInTransition.value})}cancel(){this.transition.cancel()}delete(){this.cancel();for(const t of this.buffers)t.destroy();this.buffers.length=0}}class Hl extends Ho{constructor({device:t,attribute:e,timeline:i}){super({device:t,attribute:e,timeline:i}),this.type="interpolation",this.transform=Zl(t,e)}start(t,e){const i=this.currentLength,n=this.currentStartIndices;if(super.start(t,e,t.duration),t.duration<=0){this.transition.cancel();return}const{buffers:o,attribute:r}=this;Go(o),o[0]=Wo({device:this.device,buffer:o[0],attribute:r,fromLength:i,toLength:this.currentLength,fromStartIndices:n,getData:t.enter}),o[1]=Vo({device:this.device,source:o[0],target:o[1]}),this.setBuffer(o[1]);const{transform:a}=this,c=a.model;let l=Math.floor(this.currentLength/r.size);qo(r)&&(l/=2),c.setVertexCount(l),r.isConstant?(c.setAttributes({aFrom:o[0]}),c.setConstantAttributes({aTo:r.value})):c.setAttributes({aFrom:o[0],aTo:r.getBuffer()}),a.transformFeedback.setBuffers({vCurrent:o[1]})}onUpdate(){const{duration:t,easing:e}=this.settings,{time:i}=this.transition;let n=i/t;e&&(n=e(n));const{model:o}=this.transform,r={time:n};o.shaderInputs.setProps({interpolation:r}),this.transform.run({discard:!0})}delete(){super.delete(),this.transform.destroy()}}const ql=`layout(std140) uniform interpolationUniforms {
  float time;
} interpolation;
`,Gs={name:"interpolation",vs:ql,uniformTypes:{time:"f32"}},Yl=`#version 300 es
#define SHADER_NAME interpolation-transition-vertex-shader

in ATTRIBUTE_TYPE aFrom;
in ATTRIBUTE_TYPE aTo;
out ATTRIBUTE_TYPE vCurrent;

void main(void) {
  vCurrent = mix(aFrom, aTo, interpolation.time);
  gl_Position = vec4(0.0);
}
`,Kl=`#version 300 es
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
`;function qo(s){return s.doublePrecision&&s.value instanceof Float64Array}function Zl(s,t){const e=t.size,i=$o(e),n=jo(e),o=t.getBufferLayout();return qo(t)?new Ft(s,{vs:Kl,bufferLayout:[{name:"aFrom",byteStride:8*e,attributes:[{attribute:"aFrom",format:n,byteOffset:0},{attribute:"aFrom64Low",format:n,byteOffset:4*e}]},{name:"aTo",byteStride:8*e,attributes:[{attribute:"aTo",format:n,byteOffset:0},{attribute:"aTo64Low",format:n,byteOffset:4*e}]}],modules:[Lc,Gs],defines:{ATTRIBUTE_TYPE:i,ATTRIBUTE_SIZE:e},moduleSettings:{},varyings:["vCurrent","vCurrent64Low"],bufferMode:35980,disableWarnings:!0}):new Ft(s,{vs:Yl,bufferLayout:[{name:"aFrom",format:n},{name:"aTo",format:o.attributes[0].format}],modules:[Gs],defines:{ATTRIBUTE_TYPE:i},varyings:["vCurrent"],disableWarnings:!0})}class Xl extends Ho{constructor({device:t,attribute:e,timeline:i}){super({device:t,attribute:e,timeline:i}),this.type="spring",this.texture=su(t),this.framebuffer=nu(t,this.texture),this.transform=iu(t,e)}start(t,e){const i=this.currentLength,n=this.currentStartIndices;super.start(t,e);const{buffers:o,attribute:r}=this;for(let c=0;c<2;c++)o[c]=Wo({device:this.device,buffer:o[c],attribute:r,fromLength:i,toLength:this.currentLength,fromStartIndices:n,getData:t.enter});o[2]=Vo({device:this.device,source:o[0],target:o[2]}),this.setBuffer(o[1]);const{model:a}=this.transform;a.setVertexCount(Math.floor(this.currentLength/r.size)),r.isConstant?a.setConstantAttributes({aTo:r.value}):a.setAttributes({aTo:r.getBuffer()})}onUpdate(){const{buffers:t,transform:e,framebuffer:i,transition:n}=this,o=this.settings;e.model.setAttributes({aPrev:t[0],aCur:t[1]}),e.transformFeedback.setBuffers({vNext:t[2]});const r={stiffness:o.stiffness,damping:o.damping};e.model.shaderInputs.setProps({spring:r}),e.run({framebuffer:i,discard:!1,parameters:{viewport:[0,0,1,1]},clearColor:[0,0,0,0]}),Go(t),this.setBuffer(t[1]),this.device.readPixelsToArrayWebGL(i)[0]>0||n.end()}delete(){super.delete(),this.transform.destroy(),this.texture.destroy(),this.framebuffer.destroy()}}const Jl=`layout(std140) uniform springUniforms {
  float damping;
  float stiffness;
} spring;
`,Ql={name:"spring",vs:Jl,uniformTypes:{damping:"f32",stiffness:"f32"}},tu=`#version 300 es
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
`,eu=`#version 300 es
#define SHADER_NAME spring-transition-is-transitioning-fragment-shader

in float vIsTransitioningFlag;

out vec4 fragColor;

void main(void) {
  if (vIsTransitioningFlag == 0.0) {
    discard;
  }
  fragColor = vec4(1.0);
}`;function iu(s,t){const e=$o(t.size),i=jo(t.size);return new Ft(s,{vs:tu,fs:eu,bufferLayout:[{name:"aPrev",format:i},{name:"aCur",format:i},{name:"aTo",format:t.getBufferLayout().attributes[0].format}],varyings:["vNext"],modules:[Ql],defines:{ATTRIBUTE_TYPE:e},parameters:{depthCompare:"always",blendColorOperation:"max",blendColorSrcFactor:"one",blendColorDstFactor:"one",blendAlphaOperation:"max",blendAlphaSrcFactor:"one",blendAlphaDstFactor:"one"}})}function su(s){return s.createTexture({data:new Uint8Array(4),format:"rgba8unorm",width:1,height:1})}function nu(s,t){return s.createFramebuffer({id:"spring-transition-is-transitioning-framebuffer",width:1,height:1,colorAttachments:[t]})}const ou={interpolation:Hl,spring:Xl};class ru{constructor(t,{id:e,timeline:i}){if(!t)throw new Error("AttributeTransitionManager is constructed without device");this.id=e,this.device=t,this.timeline=i,this.transitions={},this.needsRedraw=!1,this.numInstances=1}finalize(){for(const t in this.transitions)this._removeTransition(t)}update({attributes:t,transitions:e,numInstances:i}){this.numInstances=i||1;for(const n in t){const o=t[n],r=o.getTransitionSetting(e);r&&this._updateAttribute(n,o,r)}for(const n in this.transitions){const o=t[n];(!o||!o.getTransitionSetting(e))&&this._removeTransition(n)}}hasAttribute(t){const e=this.transitions[t];return e&&e.inProgress}getAttributes(){const t={};for(const e in this.transitions){const i=this.transitions[e];i.inProgress&&(t[e]=i.attributeInTransition)}return t}run(){if(this.numInstances===0)return!1;for(const e in this.transitions)this.transitions[e].update()&&(this.needsRedraw=!0);const t=this.needsRedraw;return this.needsRedraw=!1,t}_removeTransition(t){this.transitions[t].delete(),delete this.transitions[t]}_updateAttribute(t,e,i){const n=this.transitions[t];let o=!n||n.type!==i.type;if(o){n&&this._removeTransition(t);const r=ou[i.type];r?this.transitions[t]=new r({attribute:e,timeline:this.timeline,device:this.device}):(K.error(`unsupported transition type '${i.type}'`)(),o=!1)}(o||e.needsRedraw())&&(this.needsRedraw=!0,this.transitions[t].start(i,this.numInstances))}}const Vs="attributeManager.invalidate",au="attributeManager.updateStart",cu="attributeManager.updateEnd",lu="attribute.updateStart",uu="attribute.allocate",fu="attribute.updateEnd";class hu{constructor(t,{id:e="attribute-manager",stats:i,timeline:n}={}){this.mergeBoundsMemoized=ro(ya),this.id=e,this.device=t,this.attributes={},this.updateTriggers={},this.needsRedraw=!0,this.userData={},this.stats=i,this.attributeTransitionManager=new ru(t,{id:`${e}-transitions`,timeline:n}),Object.seal(this)}finalize(){for(const t in this.attributes)this.attributes[t].delete();this.attributeTransitionManager.finalize()}getNeedsRedraw(t={clearRedrawFlags:!1}){const e=this.needsRedraw;return this.needsRedraw=this.needsRedraw&&!t.clearRedrawFlags,e&&this.id}setNeedsRedraw(){this.needsRedraw=!0}add(t){this._add(t)}addInstanced(t){this._add(t,{stepMode:"instance"})}remove(t){for(const e of t)this.attributes[e]!==void 0&&(this.attributes[e].delete(),delete this.attributes[e])}invalidate(t,e){const i=this._invalidateTrigger(t,e);ot(Vs,this,t,i)}invalidateAll(t){for(const e in this.attributes)this.attributes[e].setNeedsUpdate(e,t);ot(Vs,this,"all")}update({data:t,numInstances:e,startIndices:i=null,transitions:n,props:o={},buffers:r={},context:a={}}){let c=!1;ot(au,this),this.stats&&this.stats.get("Update Attributes").timeStart();for(const l in this.attributes){const u=this.attributes[l],f=u.settings.accessor;u.startIndices=i,u.numInstances=e,o[l]&&K.removed(`props.${l}`,`data.attributes.${l}`)(),u.setExternalBuffer(r[l])||u.setBinaryValue(typeof f=="string"?r[f]:void 0,t.startIndices)||typeof f=="string"&&!r[f]&&u.setConstantValue(a,o[f])||u.needsUpdate()&&(c=!0,this._updateAttribute({attribute:u,numInstances:e,data:t,props:o,context:a})),this.needsRedraw=this.needsRedraw||u.needsRedraw()}c&&ot(cu,this,e),this.stats&&(this.stats.get("Update Attributes").timeEnd(),c&&this.stats.get("Attributes updated").incrementCount()),this.attributeTransitionManager.update({attributes:this.attributes,numInstances:e,transitions:n})}updateTransition(){const{attributeTransitionManager:t}=this,e=t.run();return this.needsRedraw=this.needsRedraw||e,e}getAttributes(){return{...this.attributes,...this.attributeTransitionManager.getAttributes()}}getBounds(t){const e=t.map(i=>this.attributes[i]?.getBounds());return this.mergeBoundsMemoized(e)}getChangedAttributes(t={clearChangedFlags:!1}){const{attributes:e,attributeTransitionManager:i}=this,n={...i.getAttributes()};for(const o in e){const r=e[o];r.needsRedraw(t)&&!i.hasAttribute(o)&&(n[o]=r)}return n}getBufferLayouts(t){return Object.values(this.getAttributes()).map(e=>e.getBufferLayout(t))}_add(t,e){for(const i in t){const n=t[i],o={...n,id:i,size:n.isIndexed&&1||n.size||1,...e};this.attributes[i]=new Do(this.device,o)}this._mapUpdateTriggersToAttributes()}_mapUpdateTriggersToAttributes(){const t={};for(const e in this.attributes)this.attributes[e].getUpdateTriggers().forEach(n=>{t[n]||(t[n]=[]),t[n].push(e)});this.updateTriggers=t}_invalidateTrigger(t,e){const{attributes:i,updateTriggers:n}=this,o=n[t];return o&&o.forEach(r=>{const a=i[r];a&&a.setNeedsUpdate(a.id,e)}),o}_updateAttribute(t){const{attribute:e,numInstances:i}=t;if(ot(lu,e),e.constant){e.setConstantValue(t.context,e.value);return}e.allocate(i)&&ot(uu,e,i),e.updateBuffer(t)&&(this.needsRedraw=!0,ot(fu,e,i))}}class du extends Wi{get value(){return this._value}_onUpdate(){const{time:t,settings:{fromValue:e,toValue:i,duration:n,easing:o}}=this,r=o(t/n);this._value=_a(e,i,r)}}const Ws=1e-5;function Hs(s,t,e,i,n){const o=t-s,a=(e-t)*n,c=-o*i;return a+c+o+t}function pu(s,t,e,i,n){if(Array.isArray(e)){const o=[];for(let r=0;r<e.length;r++)o[r]=Hs(s[r],t[r],e[r],i,n);return o}return Hs(s,t,e,i,n)}function qs(s,t){if(Array.isArray(s)){let e=0;for(let i=0;i<s.length;i++){const n=s[i]-t[i];e+=n*n}return Math.sqrt(e)}return Math.abs(s-t)}class gu extends Wi{get value(){return this._currValue}_onUpdate(){const{fromValue:t,toValue:e,damping:i,stiffness:n}=this.settings,{_prevValue:o=t,_currValue:r=t}=this;let a=pu(o,r,e,i,n);const c=qs(a,e),l=qs(a,r);c<Ws&&l<Ws&&(a=e,this.end()),this._prevValue=r,this._currValue=a}}const mu={interpolation:du,spring:gu};class yu{constructor(t){this.transitions=new Map,this.timeline=t}get active(){return this.transitions.size>0}add(t,e,i,n){const{transitions:o}=this;if(o.has(t)){const c=o.get(t),{value:l=c.settings.fromValue}=c;e=l,this.remove(t)}if(n=Uo(n),!n)return;const r=mu[n.type];if(!r){K.error(`unsupported transition type '${n.type}'`)();return}const a=new r(this.timeline);a.start({...n,fromValue:e,toValue:i}),o.set(t,a)}remove(t){const{transitions:e}=this;e.has(t)&&(e.get(t).cancel(),e.delete(t))}update(){const t={};for(const[e,i]of this.transitions)i.update(),t[e]=i.value,i.inProgress||this.remove(e);return t}clear(){for(const t of this.transitions.keys())this.remove(t)}}function _u(s){const t=s[Ct];for(const e in t){const i=t[e],{validate:n}=i;if(n&&!n(s[e],i))throw new Error(`Invalid prop ${e}: ${s[e]}`)}}function xu(s,t){const e=Yo({newProps:s,oldProps:t,propTypes:s[Ct],ignoreProps:{data:null,updateTriggers:null,extensions:null,transitions:null}}),i=bu(s,t);let n=!1;return i||(n=Cu(s,t)),{dataChanged:i,propsChanged:e,updateTriggersChanged:n,extensionsChanged:Pu(s,t),transitionsChanged:vu(s,t)}}function vu(s,t){if(!s.transitions)return!1;const e={},i=s[Ct];let n=!1;for(const o in s.transitions){const r=i[o],a=r&&r.type;(a==="number"||a==="color"||a==="array")&&Mi(s[o],t[o],r)&&(e[o]=!0,n=!0)}return n?e:!1}function Yo({newProps:s,oldProps:t,ignoreProps:e={},propTypes:i={},triggerName:n="props"}){if(t===s)return!1;if(typeof s!="object"||s===null)return`${n} changed shallowly`;if(typeof t!="object"||t===null)return`${n} changed shallowly`;for(const o of Object.keys(s))if(!(o in e)){if(!(o in t))return`${n}.${o} added`;const r=Mi(s[o],t[o],i[o]);if(r)return`${n}.${o} ${r}`}for(const o of Object.keys(t))if(!(o in e)){if(!(o in s))return`${n}.${o} dropped`;if(!Object.hasOwnProperty.call(s,o)){const r=Mi(s[o],t[o],i[o]);if(r)return`${n}.${o} ${r}`}}return!1}function Mi(s,t,e){let i=e&&e.equal;return i&&!i(s,t,e)||!i&&(i=s&&t&&s.equals,i&&!i.call(s,t))?"changed deeply":!i&&t!==s?"changed shallowly":null}function bu(s,t){if(t===null)return"oldProps is null, initial diff";let e=!1;const{dataComparator:i,_dataDiff:n}=s;return i?i(s.data,t.data)||(e="Data comparator detected a change"):s.data!==t.data&&(e="A new data container was supplied"),e&&n&&(e=n(s.data,t.data)||e),e}function Cu(s,t){if(t===null)return{all:!0};if("all"in s.updateTriggers&&Ys(s,t,"all"))return{all:!0};const e={};let i=!1;for(const n in s.updateTriggers)n!=="all"&&Ys(s,t,n)&&(e[n]=!0,i=!0);return i?e:!1}function Pu(s,t){if(t===null)return!0;const e=t.extensions,{extensions:i}=s;if(i===e)return!1;if(!e||!i||i.length!==e.length)return!0;for(let n=0;n<i.length;n++)if(!i[n].equals(e[n]))return!0;return!1}function Ys(s,t,e){let i=s.updateTriggers[e];i=i??{};let n=t.updateTriggers[e];return n=n??{},Yo({oldProps:n,newProps:i,triggerName:e})}const wu="count(): argument not an object",Lu="count(): argument not a container";function Tu(s){if(!Su(s))throw new Error(wu);if(typeof s.count=="function")return s.count();if(Number.isFinite(s.size))return s.size;if(Number.isFinite(s.length))return s.length;if(Au(s))return Object.keys(s).length;throw new Error(Lu)}function Au(s){return s!==null&&typeof s=="object"&&s.constructor===Object}function Su(s){return s!==null&&typeof s=="object"}function Ks(s,t){if(!t)return s;const e={...s,...t};if("defines"in t&&(e.defines={...s.defines,...t.defines}),"modules"in t&&(e.modules=(s.modules||[]).concat(t.modules),t.modules.some(i=>i.name==="project64"))){const i=e.modules.findIndex(n=>n.name==="project32");i>=0&&e.modules.splice(i,1)}if("inject"in t)if(!s.inject)e.inject=t.inject;else{const i={...s.inject};for(const n in t.inject)i[n]=(i[n]||"")+t.inject[n];e.inject=i}return e}const Mu={minFilter:"linear",mipmapFilter:"linear",magFilter:"linear",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge"},Ei={};function Eu(s,t,e,i){if(e instanceof it)return e;e.constructor&&e.constructor.name!=="Object"&&(e={data:e});let n=null;e.compressed&&(n={minFilter:"linear",mipmapFilter:e.data.length>1?"nearest":"linear"});const{width:o,height:r}=e.data,a=t.createTexture({...e,sampler:{...Mu,...n,...i},mipLevels:t.getMipLevelCount(o,r)});return t.type==="webgl"?a.generateMipmapsWebGL():t.type==="webgpu"&&t.generateMipmapsWebGPU(a),Ei[a.id]=s,a}function Iu(s,t){!t||!(t instanceof it)||Ei[t.id]===s&&(t.delete(),delete Ei[t.id])}const Ou={boolean:{validate(s,t){return!0},equal(s,t,e){return!!s==!!t}},number:{validate(s,t){return Number.isFinite(s)&&(!("max"in t)||s<=t.max)&&(!("min"in t)||s>=t.min)}},color:{validate(s,t){return t.optional&&!s||Ii(s)&&(s.length===3||s.length===4)},equal(s,t,e){return oe(s,t,1)}},accessor:{validate(s,t){const e=ke(s);return e==="function"||e===ke(t.value)},equal(s,t,e){return typeof t=="function"?!0:oe(s,t,1)}},array:{validate(s,t){return t.optional&&!s||Ii(s)},equal(s,t,e){const{compare:i}=e,n=Number.isInteger(i)?i:i?1:0;return i?oe(s,t,n):s===t}},object:{equal(s,t,e){if(e.ignore)return!0;const{compare:i}=e,n=Number.isInteger(i)?i:i?1:0;return i?oe(s,t,n):s===t}},function:{validate(s,t){return t.optional&&!s||typeof s=="function"},equal(s,t,e){return!e.compare&&e.ignore!==!1||s===t}},data:{transform:(s,t,e)=>{if(!s)return s;const{dataTransform:i}=e.props;return i?i(s):typeof s.shape=="string"&&s.shape.endsWith("-table")&&Array.isArray(s.data)?s.data:s}},image:{transform:(s,t,e)=>{const i=e.context;return!i||!i.device?null:Eu(e.id,i.device,s,{...t.parameters,...e.props.textureParameters})},release:(s,t,e)=>{Iu(e.id,s)}}};function Ru(s){const t={},e={},i={};for(const[n,o]of Object.entries(s)){const r=o?.deprecatedFor;if(r)i[n]=Array.isArray(r)?r:[r];else{const a=zu(n,o);t[n]=a,e[n]=a.value}}return{propTypes:t,defaultProps:e,deprecatedProps:i}}function zu(s,t){switch(ke(t)){case"object":return Ht(s,t);case"array":return Ht(s,{type:"array",value:t,compare:!1});case"boolean":return Ht(s,{type:"boolean",value:t});case"number":return Ht(s,{type:"number",value:t});case"function":return Ht(s,{type:"function",value:t,compare:!0});default:return{name:s,type:"unknown",value:t}}}function Ht(s,t){return"type"in t?{name:s,...Ou[t.type],...t}:"value"in t?{name:s,type:ke(t.value),...t}:{name:s,type:"object",value:t}}function Ii(s){return Array.isArray(s)||ArrayBuffer.isView(s)}function ke(s){return Ii(s)?"array":s===null?"null":typeof s}function Bu(s,t){let e;for(let o=t.length-1;o>=0;o--){const r=t[o];"extensions"in r&&(e=r.extensions)}const i=Oi(s.constructor,e),n=Object.create(i);n[ze]=s,n[At]={},n[vt]={};for(let o=0;o<t.length;++o){const r=t[o];for(const a in r)n[a]=r[a]}return Object.freeze(n),n}const Fu="_mergedDefaultProps";function Oi(s,t){if(!(s instanceof We.constructor))return{};let e=Fu;if(t)for(const n of t){const o=n.constructor;o&&(e+=`:${o.extensionName||o.name}`)}const i=Ko(s,e);return i||(s[e]=Nu(s,t||[]))}function Nu(s,t){if(!s.prototype)return null;const i=Object.getPrototypeOf(s),n=Oi(i),o=Ko(s,"defaultProps")||{},r=Ru(o),a=Object.assign(Object.create(null),n,r.defaultProps),c=Object.assign(Object.create(null),n?.[Ct],r.propTypes),l=Object.assign(Object.create(null),n?.[Je],r.deprecatedProps);for(const u of t){const f=Oi(u.constructor);f&&(Object.assign(a,f),Object.assign(c,f[Ct]),Object.assign(l,f[Je]))}return ku(a,s),Du(a,c),Uu(a,l),a[Ct]=c,a[Je]=l,t.length===0&&!Zi(s,"_propTypes")&&(s._propTypes=c),a}function ku(s,t){const e=ju(t);Object.defineProperties(s,{id:{writable:!0,value:e}})}function Uu(s,t){for(const e in t)Object.defineProperty(s,e,{enumerable:!1,set(i){const n=`${this.id}: ${e}`;for(const o of t[e])Zi(this,o)||(this[o]=i);K.deprecated(n,t[e].join("/"))()}})}function Du(s,t){const e={},i={};for(const n in t){const o=t[n],{name:r,value:a}=o;o.async&&(e[r]=a,i[r]=$u(r))}s[zt]=e,s[At]={},Object.defineProperties(s,i)}function $u(s){return{enumerable:!0,set(t){typeof t=="string"||t instanceof Promise||No(t)?this[At][s]=t:this[vt][s]=t},get(){if(this[vt]){if(s in this[vt])return this[vt][s]||this[zt][s];if(s in this[At]){const t=this[ze]&&this[ze].internalState;if(t&&t.hasAsyncProp(s))return t.getAsyncProp(s)||this[zt][s]}}return this[zt][s]}}}function Zi(s,t){return Object.prototype.hasOwnProperty.call(s,t)}function Ko(s,t){return Zi(s,t)&&s[t]}function ju(s){const t=s.componentName;return t||K.warn(`${s.name}.componentName not specified`)(),t||s.name}let Gu=0;class We{constructor(...t){this.props=Bu(this,t),this.id=this.props.id,this.count=Gu++}clone(t){const{props:e}=this,i={};for(const n in e[zt])n in e[vt]?i[n]=e[vt][n]:n in e[At]&&(i[n]=e[At][n]);return new this.constructor({...e,...i,...t})}}We.componentName="Component";We.defaultProps={};const Vu=Object.freeze({});class Wu{constructor(t){this.component=t,this.asyncProps={},this.onAsyncPropUpdated=()=>{},this.oldProps=null,this.oldAsyncProps=null}finalize(){for(const t in this.asyncProps){const e=this.asyncProps[t];e&&e.type&&e.type.release&&e.type.release(e.resolvedValue,e.type,this.component)}this.asyncProps={},this.component=null,this.resetOldProps()}getOldProps(){return this.oldAsyncProps||this.oldProps||Vu}resetOldProps(){this.oldAsyncProps=null,this.oldProps=this.component?this.component.props:null}hasAsyncProp(t){return t in this.asyncProps}getAsyncProp(t){const e=this.asyncProps[t];return e&&e.resolvedValue}isAsyncPropLoading(t){if(t){const e=this.asyncProps[t];return!!(e&&e.pendingLoadCount>0&&e.pendingLoadCount!==e.resolvedLoadCount)}for(const e in this.asyncProps)if(this.isAsyncPropLoading(e))return!0;return!1}reloadAsyncProp(t,e){this._watchPromise(t,Promise.resolve(e))}setAsyncProps(t){this.component=t[ze]||this.component;const e=t[vt]||{},i=t[At]||t,n=t[zt]||{};for(const o in e){const r=e[o];this._createAsyncPropData(o,n[o]),this._updateAsyncProp(o,r),e[o]=this.getAsyncProp(o)}for(const o in i){const r=i[o];this._createAsyncPropData(o,n[o]),this._updateAsyncProp(o,r)}}_fetch(t,e){return null}_onResolve(t,e){}_onError(t,e){}_updateAsyncProp(t,e){if(this._didAsyncInputValueChange(t,e)){if(typeof e=="string"&&(e=this._fetch(t,e)),e instanceof Promise){this._watchPromise(t,e);return}if(No(e)){this._resolveAsyncIterable(t,e);return}this._setPropValue(t,e)}}_freezeAsyncOldProps(){if(!this.oldAsyncProps&&this.oldProps){this.oldAsyncProps=Object.create(this.oldProps);for(const t in this.asyncProps)Object.defineProperty(this.oldAsyncProps,t,{enumerable:!0,value:this.oldProps[t]})}}_didAsyncInputValueChange(t,e){const i=this.asyncProps[t];return e===i.resolvedValue||e===i.lastValue?!1:(i.lastValue=e,!0)}_setPropValue(t,e){this._freezeAsyncOldProps();const i=this.asyncProps[t];i&&(e=this._postProcessValue(i,e),i.resolvedValue=e,i.pendingLoadCount++,i.resolvedLoadCount=i.pendingLoadCount)}_setAsyncPropValue(t,e,i){const n=this.asyncProps[t];n&&i>=n.resolvedLoadCount&&e!==void 0&&(this._freezeAsyncOldProps(),n.resolvedValue=e,n.resolvedLoadCount=i,this.onAsyncPropUpdated(t,e))}_watchPromise(t,e){const i=this.asyncProps[t];if(i){i.pendingLoadCount++;const n=i.pendingLoadCount;e.then(o=>{this.component&&(o=this._postProcessValue(i,o),this._setAsyncPropValue(t,o,n),this._onResolve(t,o))}).catch(o=>{this._onError(t,o)})}}async _resolveAsyncIterable(t,e){if(t!=="data"){this._setPropValue(t,e);return}const i=this.asyncProps[t];if(!i)return;i.pendingLoadCount++;const n=i.pendingLoadCount;let o=[],r=0;for await(const a of e){if(!this.component)return;const{dataTransform:c}=this.component.props;c?o=c(a,o):o=o.concat(a),Object.defineProperty(o,"__diff",{enumerable:!1,value:[{startRow:r,endRow:o.length}]}),r=o.length,this._setAsyncPropValue(t,o,n)}this._onResolve(t,o)}_postProcessValue(t,e){const i=t.type;return i&&this.component&&(i.release&&i.release(t.resolvedValue,i,this.component),i.transform)?i.transform(e,i,this.component):e}_createAsyncPropData(t,e){if(!this.asyncProps[t]){const n=this.component&&this.component.props[Ct];this.asyncProps[t]={type:n&&n[t],lastValue:null,resolvedValue:e,pendingLoadCount:0,resolvedLoadCount:0}}}}class Hu extends Wu{constructor({attributeManager:t,layer:e}){super(e),this.attributeManager=t,this.needsRedraw=!0,this.needsUpdate=!0,this.subLayers=null,this.usesPickingColorCache=!1}get layer(){return this.component}_fetch(t,e){const i=this.layer,n=i?.props.fetch;return n?n(e,{propName:t,layer:i}):super._fetch(t,e)}_onResolve(t,e){const i=this.layer;if(i){const n=i.props.onDataLoad;t==="data"&&n&&n(e,{propName:t,layer:i})}}_onError(t,e){const i=this.layer;i&&i.raiseError(e,`loading ${t} of ${this.layer}`)}}const qu="layer.changeFlag",Yu="layer.initialize",Ku="layer.update",Zu="layer.finalize",Xu="layer.matched",Zs=2**24-1,Ju=Object.freeze([]),Qu=ro(({oldViewport:s,viewport:t})=>s.equals(t));let at=new Uint8ClampedArray(0);const tf={data:{type:"data",value:Ju,async:!0},dataComparator:{type:"function",value:null,optional:!0},_dataDiff:{type:"function",value:s=>s&&s.__diff,optional:!0},dataTransform:{type:"function",value:null,optional:!0},onDataLoad:{type:"function",value:null,optional:!0},onError:{type:"function",value:null,optional:!0},fetch:{type:"function",value:(s,{propName:t,layer:e,loaders:i,loadOptions:n,signal:o})=>{const{resourceManager:r}=e.context;n=n||e.getLoadOptions(),i=i||e.props.loaders,o&&(n={...n,core:{...n?.core,fetch:{...n?.core?.fetch,signal:o}}});let a=r.contains(s);return!a&&!n&&(r.add({resourceId:s,data:xi(s,i),persistent:!1}),a=!0),a?r.subscribe({resourceId:s,onChange:c=>e.internalState?.reloadAsyncProp(t,c),consumerId:e.id,requestId:t}):xi(s,i,n)}},updateTriggers:{},visible:!0,pickable:!1,opacity:{type:"number",min:0,max:1,value:1},operation:"draw",onHover:{type:"function",value:null,optional:!0},onClick:{type:"function",value:null,optional:!0},onDragStart:{type:"function",value:null,optional:!0},onDrag:{type:"function",value:null,optional:!0},onDragEnd:{type:"function",value:null,optional:!0},coordinateSystem:"default",coordinateOrigin:{type:"array",value:[0,0,0],compare:!0},modelMatrix:{type:"array",value:null,compare:!0,optional:!0},wrapLongitude:!1,positionFormat:"XYZ",colorFormat:"RGBA",parameters:{type:"object",value:{},optional:!0,compare:2},loadOptions:{type:"object",value:null,optional:!0,ignore:!0},transitions:null,extensions:[],loaders:{type:"array",value:[],optional:!0,ignore:!0},getPolygonOffset:{type:"function",value:({layerIndex:s})=>[0,-s*100]},highlightedObjectIndex:null,autoHighlight:!1,highlightColor:{type:"accessor",value:[0,0,128,128]}};class mt extends We{constructor(){super(...arguments),this.internalState=null,this.lifecycle=xa.NO_STATE,this.parent=null}static get componentName(){return Object.prototype.hasOwnProperty.call(this,"layerName")?this.layerName:""}get root(){let t=this;for(;t.parent;)t=t.parent;return t}toString(){return`${this.constructor.layerName||this.constructor.name}({id: '${this.props.id}'})`}project(t){ht(this.internalState);const e=this.internalState.viewport||this.context.viewport,i=Ki(t,{viewport:e,modelMatrix:this.props.modelMatrix,coordinateOrigin:this.props.coordinateOrigin,coordinateSystem:this.props.coordinateSystem}),[n,o,r]=va(i,e.pixelProjectionMatrix);return t.length===2?[n,o]:[n,o,r]}unproject(t){return ht(this.internalState),(this.internalState.viewport||this.context.viewport).unproject(t)}projectPosition(t,e){ht(this.internalState);const i=this.internalState.viewport||this.context.viewport;return rl(t,{viewport:i,modelMatrix:this.props.modelMatrix,coordinateOrigin:this.props.coordinateOrigin,coordinateSystem:this.props.coordinateSystem,...e})}get isComposite(){return!1}get isDrawable(){return!0}setState(t){this.setChangeFlags({stateChanged:!0}),Object.assign(this.state,t),this.setNeedsRedraw()}setNeedsRedraw(){this.internalState&&(this.internalState.needsRedraw=!0)}setNeedsUpdate(){this.internalState&&(this.context.layerManager.setNeedsUpdate(String(this)),this.internalState.needsUpdate=!0)}get isLoaded(){return this.internalState?!this.internalState.isAsyncPropLoading():!1}get wrapLongitude(){return this.props.wrapLongitude}isPickable(){return this.props.pickable&&this.props.visible}getModels(){const t=this.state;return t&&(t.models||t.model&&[t.model])||[]}setShaderModuleProps(...t){for(const e of this.getModels())e.shaderInputs.setProps(...t)}getAttributeManager(){return this.internalState&&this.internalState.attributeManager}getCurrentLayer(){return this.internalState&&this.internalState.layer}getLoadOptions(){return this.props.loadOptions}use64bitPositions(){const{coordinateSystem:t}=this.props;return t==="default"||t==="lnglat"||t==="cartesian"}onHover(t,e){return this.props.onHover&&this.props.onHover(t,e)||!1}onClick(t,e){return this.props.onClick&&this.props.onClick(t,e)||!1}nullPickingColor(){return[0,0,0]}encodePickingColor(t,e=[]){return e[0]=t+1&255,e[1]=t+1>>8&255,e[2]=t+1>>8>>8&255,e}decodePickingColor(t){ht(t instanceof Uint8Array);const[e,i,n]=t;return e+i*256+n*65536-1}getNumInstances(){return Number.isFinite(this.props.numInstances)?this.props.numInstances:this.state&&this.state.numInstances!==void 0?this.state.numInstances:Tu(this.props.data)}getStartIndices(){return this.props.startIndices?this.props.startIndices:this.state&&this.state.startIndices?this.state.startIndices:null}getBounds(){return this.getAttributeManager()?.getBounds(["positions","instancePositions"])}getShaders(t){t=Ks(t,{disableWarnings:!0,modules:this.context.defaultShaderModules});for(const e of this.props.extensions)t=Ks(t,e.getShaders.call(this,e));return t}shouldUpdateState(t){return t.changeFlags.propsOrDataChanged}updateState(t){const e=this.getAttributeManager(),{dataChanged:i}=t.changeFlags;if(i&&e)if(Array.isArray(i))for(const n of i)e.invalidateAll(n);else e.invalidateAll();if(e){const{props:n}=t,o=this.internalState.hasPickingBuffer,r=Number.isInteger(n.highlightedObjectIndex)||!!n.pickable||n.extensions.some(a=>a.getNeedsPickingBuffer.call(this,a));if(o!==r){this.internalState.hasPickingBuffer=r;const{pickingColors:a,instancePickingColors:c}=e.attributes,l=a||c;l&&(r&&l.constant&&(l.constant=!1,e.invalidate(l.id)),!l.value&&!r&&(l.constant=!0,l.value=[0,0,0]))}}}finalizeState(t){for(const i of this.getModels())i.destroy();const e=this.getAttributeManager();e&&e.finalize(),this.context&&this.context.resourceManager.unsubscribe({consumerId:this.id}),this.internalState&&(this.internalState.uniformTransitions.clear(),this.internalState.finalize())}draw(t){for(const e of this.getModels())e.draw(t.renderPass)}getPickingInfo({info:t,mode:e,sourceLayer:i}){const{index:n}=t;return n>=0&&Array.isArray(this.props.data)&&(t.object=this.props.data[n]),t}raiseError(t,e){e&&(t=new Error(`${e}: ${t.message}`,{cause:t})),this.props.onError?.(t)||this.context?.onError?.(t,this)}getNeedsRedraw(t={clearRedrawFlags:!1}){return this._getNeedsRedraw(t)}needsUpdate(){return this.internalState?this.internalState.needsUpdate||this.hasUniformTransition()||this.shouldUpdateState(this._getUpdateParams()):!1}hasUniformTransition(){return this.internalState?.uniformTransitions.active||!1}activateViewport(t){if(!this.internalState)return;const e=this.internalState.viewport;this.internalState.viewport=t,(!e||!Qu({oldViewport:e,viewport:t}))&&(this.setChangeFlags({viewportChanged:!0}),this.isComposite?this.needsUpdate()&&this.setNeedsUpdate():this._update())}invalidateAttribute(t="all"){const e=this.getAttributeManager();e&&(t==="all"?e.invalidateAll():e.invalidate(t))}updateAttributes(t){let e=!1;for(const i in t)t[i].layoutChanged()&&(e=!0);for(const i of this.getModels())this._setModelAttributes(i,t,e)}_updateAttributes(){const t=this.getAttributeManager();if(!t)return;const e=this.props,i=this.getNumInstances(),n=this.getStartIndices();t.update({data:e.data,numInstances:i,startIndices:n,props:e,transitions:e.transitions,buffers:e.data.attributes,context:this});const o=t.getChangedAttributes({clearChangedFlags:!0});this.updateAttributes(o)}_updateAttributeTransition(){const t=this.getAttributeManager();t&&t.updateTransition()}_updateUniformTransition(){const{uniformTransitions:t}=this.internalState;if(t.active){const e=t.update(),i=Object.create(this.props);for(const n in e)Object.defineProperty(i,n,{value:e[n]});return i}return this.props}calculateInstancePickingColors(t,{numInstances:e}){if(t.constant)return;const i=Math.floor(at.length/4);if(this.internalState.usesPickingColorCache=!0,i<e){e>Zs&&K.warn("Layer has too many data objects. Picking might not be able to distinguish all objects.")(),at=Re.allocate(at,e,{size:4,copy:!0,maxCount:Math.max(e,Zs)});const n=Math.floor(at.length/4),o=[0,0,0];for(let r=i;r<n;r++)this.encodePickingColor(r,o),at[r*4+0]=o[0],at[r*4+1]=o[1],at[r*4+2]=o[2],at[r*4+3]=0}t.value=at.subarray(0,e*4)}_setModelAttributes(t,e,i=!1){if(!Object.keys(e).length)return;if(i){const a=this.getAttributeManager();t.setBufferLayout(a.getBufferLayouts(t)),e=a.getAttributes()}const n=t.userData?.excludeAttributes||{},o={},r={};for(const a in e){if(n[a])continue;const c=e[a].getValue();for(const l in c){const u=c[l];u instanceof Z?e[a].settings.isIndexed?t.setIndexBuffer(u):o[l]=u:u&&(r[l]=u)}}t.setAttributes(o),t.setConstantAttributes(r)}disablePickingIndex(t){const e=this.props.data;if(!("attributes"in e)){this._disablePickingIndex(t);return}const{pickingColors:i,instancePickingColors:n}=this.getAttributeManager().attributes,o=i||n,r=o&&e.attributes&&e.attributes[o.id];if(r&&r.value){const a=r.value,c=this.encodePickingColor(t);for(let l=0;l<e.length;l++){const u=o.getVertexOffset(l);a[u]===c[0]&&a[u+1]===c[1]&&a[u+2]===c[2]&&this._disablePickingIndex(l)}}else this._disablePickingIndex(t)}_disablePickingIndex(t){const{pickingColors:e,instancePickingColors:i}=this.getAttributeManager().attributes,n=e||i;if(!n)return;const o=n.getVertexOffset(t),r=n.getVertexOffset(t+1);n.buffer.write(new Uint8Array(r-o),o)}restorePickingColors(){const{pickingColors:t,instancePickingColors:e}=this.getAttributeManager().attributes,i=t||e;i&&(this.internalState.usesPickingColorCache&&i.value.buffer!==at.buffer&&(i.value=at.subarray(0,i.value.length)),i.updateSubBuffer({startOffset:0}))}_initialize(){ht(!this.internalState),ot(Yu,this);const t=this._getAttributeManager();t&&t.addInstanced({instancePickingColors:{type:"uint8",size:4,noAlloc:!0,update:this.calculateInstancePickingColors}}),this.internalState=new Hu({attributeManager:t,layer:this}),this._clearChangeFlags(),this.state={},Object.defineProperty(this.state,"attributeManager",{get:()=>(K.deprecated("layer.state.attributeManager","layer.getAttributeManager()")(),t)}),this.internalState.uniformTransitions=new yu(this.context.timeline),this.internalState.onAsyncPropUpdated=this._onAsyncPropUpdated.bind(this),this.internalState.setAsyncProps(this.props),this.initializeState(this.context);for(const e of this.props.extensions)e.initializeState.call(this,this.context,e);this.setChangeFlags({dataChanged:"init",propsChanged:"init",viewportChanged:!0,extensionsChanged:!0}),this._update()}_transferState(t){ot(Xu,this,this===t);const{state:e,internalState:i}=t;this!==t&&(this.internalState=i,this.state=e,this.internalState.setAsyncProps(this.props),this._diffProps(this.props,this.internalState.getOldProps()))}_update(){const t=this.needsUpdate();if(ot(Ku,this,t),!t)return;this.context.stats.get("Layer updates").incrementCount();const e=this.props,i=this.context,n=this.internalState,o=i.viewport,r=this._updateUniformTransition();n.propsInTransition=r,i.viewport=n.viewport||o,this.props=r;try{const a=this._getUpdateParams(),c=this.getModels();if(i.device)this.updateState(a);else try{this.updateState(a)}catch{}for(const u of this.props.extensions)u.updateState.call(this,a,u);this.setNeedsRedraw(),this._updateAttributes();const l=this.getModels()[0]!==c[0];this._postUpdate(a,l)}finally{i.viewport=o,this.props=e,this._clearChangeFlags(),n.needsUpdate=!1,n.resetOldProps()}}_finalize(){ot(Zu,this),this.finalizeState(this.context);for(const t of this.props.extensions)t.finalizeState.call(this,this.context,t)}_drawLayer({renderPass:t,shaderModuleProps:e=null,uniforms:i={},parameters:n={}}){this._updateAttributeTransition();const o=this.props,r=this.context;this.props=this.internalState.propsInTransition||o;try{e&&this.setShaderModuleProps(e);const{getPolygonOffset:a}=this.props,c=a&&a(i)||[0,0];r.device instanceof Qe&&r.device.setParametersWebGL({polygonOffset:c});const l=r.device instanceof Qe?null:ef(n);if(sf(this.getModels(),t,n,l),r.device instanceof Qe)r.device.withParametersWebGL(n,()=>{const u={renderPass:t,shaderModuleProps:e,uniforms:i,parameters:n,context:r};for(const f of this.props.extensions)f.draw.call(this,u,f);this.draw(u)});else{l?.renderPassParameters&&t.setParameters(l.renderPassParameters);const u={renderPass:t,shaderModuleProps:e,uniforms:i,parameters:n,context:r};for(const f of this.props.extensions)f.draw.call(this,u,f);this.draw(u)}}finally{this.props=o}}getChangeFlags(){return this.internalState?.changeFlags}setChangeFlags(t){if(!this.internalState)return;const{changeFlags:e}=this.internalState;for(const n in t)if(t[n]){let o=!1;switch(n){case"dataChanged":const r=t[n],a=e[n];r&&Array.isArray(a)&&(e.dataChanged=Array.isArray(r)?a.concat(r):r,o=!0);default:e[n]||(e[n]=t[n],o=!0)}o&&ot(qu,this,n,t)}const i=!!(e.dataChanged||e.updateTriggersChanged||e.propsChanged||e.extensionsChanged);e.propsOrDataChanged=i,e.somethingChanged=i||e.viewportChanged||e.stateChanged}_clearChangeFlags(){this.internalState.changeFlags={dataChanged:!1,propsChanged:!1,updateTriggersChanged:!1,viewportChanged:!1,stateChanged:!1,extensionsChanged:!1,propsOrDataChanged:!1,somethingChanged:!1}}_diffProps(t,e){const i=xu(t,e);if(i.updateTriggersChanged)for(const n in i.updateTriggersChanged)i.updateTriggersChanged[n]&&this.invalidateAttribute(n);if(i.transitionsChanged)for(const n in i.transitionsChanged)this.internalState.uniformTransitions.add(n,e[n],t[n],t.transitions?.[n]);return this.setChangeFlags(i)}validateProps(){_u(this.props)}updateAutoHighlight(t){this.props.autoHighlight&&!Number.isInteger(this.props.highlightedObjectIndex)&&this._updateAutoHighlight(t)}_updateAutoHighlight(t){const e={highlightedObjectColor:t.picked?t.color:null},{highlightColor:i}=this.props;t.picked&&typeof i=="function"&&(e.highlightColor=i(t)),this.setShaderModuleProps({picking:e}),this.setNeedsRedraw()}_getAttributeManager(){const t=this.context;return new hu(t.device,{id:this.props.id,stats:t.stats,timeline:t.timeline})}_postUpdate(t,e){const{props:i,oldProps:n}=t,o=this.state.model;o?.isInstanced&&o.setInstanceCount(this.getNumInstances());const{autoHighlight:r,highlightedObjectIndex:a,highlightColor:c}=i;if(e||n.autoHighlight!==r||n.highlightedObjectIndex!==a||n.highlightColor!==c){const l={};Array.isArray(c)&&(l.highlightColor=c),(e||n.autoHighlight!==r||a!==n.highlightedObjectIndex)&&(l.highlightedObjectColor=Number.isFinite(a)&&a>=0?this.encodePickingColor(a):null),this.setShaderModuleProps({picking:l})}}_getUpdateParams(){return{props:this.props,oldProps:this.internalState.getOldProps(),context:this.context,changeFlags:this.internalState.changeFlags}}_getNeedsRedraw(t){if(!this.internalState)return!1;let e=!1;e=e||this.internalState.needsRedraw&&this.id;const i=this.getAttributeManager(),n=i?i.getNeedsRedraw(t):!1;if(e=e||n,e)for(const o of this.props.extensions)o.onNeedsRedraw.call(this,o);return this.internalState.needsRedraw=this.internalState.needsRedraw&&!t.clearRedrawFlags,e}_onAsyncPropUpdated(){this._diffProps(this.props,this.internalState.getOldProps()),this.setNeedsUpdate()}}mt.defaultProps=tf;mt.layerName="Layer";function ef(s){const{blendConstant:t,...e}=s;return t?{pipelineParameters:e,renderPassParameters:{blendConstant:t}}:{pipelineParameters:e}}function sf(s,t,e,i){for(const n of s)n.device.type==="webgpu"?(nf(n,t),n.setParameters({...n.parameters,...i?.pipelineParameters})):n.setParameters(e)}function nf(s,t){const e=t.props.framebuffer||(t.framebuffer??null);if(!e)return;const i=e.colorAttachments.map(r=>r?.texture?.format??null),n=e.depthStencilAttachment?.texture?.format,o=s;(!of(o.props.colorAttachmentFormats,i)||o.props.depthStencilAttachmentFormat!==n)&&(o.props.colorAttachmentFormats=i,o.props.depthStencilAttachmentFormat=n,o._setPipelineNeedsUpdate("attachment formats"))}function of(s,t){if(s===t)return!0;if(!s||!t||s.length!==t.length)return!1;for(let e=0;e<s.length;e++)if(s[e]!==t[e])return!1;return!0}const rf="compositeLayer.renderLayers";class wt extends mt{get isComposite(){return!0}get isDrawable(){return!1}get isLoaded(){return super.isLoaded&&this.getSubLayers().every(t=>t.isLoaded)}getSubLayers(){return this.internalState&&this.internalState.subLayers||[]}initializeState(t){}setState(t){super.setState(t),this.setNeedsUpdate()}getPickingInfo({info:t}){const{object:e}=t;return e&&e.__source&&e.__source.parent&&e.__source.parent.id===this.id&&(t.object=e.__source.object,t.index=e.__source.index),t}filterSubLayer(t){return!0}shouldRenderSubLayer(t,e){return e&&e.length}getSubLayerClass(t,e){const{_subLayerProps:i}=this.props;return i&&i[t]&&i[t].type||e}getSubLayerRow(t,e,i){return t.__source={parent:this,object:e,index:i},t}getSubLayerAccessor(t){if(typeof t=="function"){const e={index:-1,data:this.props.data,target:[]};return(i,n)=>i&&i.__source?(e.index=i.__source.index,t(i.__source.object,e)):t(i,n)}return t}getSubLayerProps(t={}){const{opacity:e,pickable:i,visible:n,parameters:o,getPolygonOffset:r,highlightedObjectIndex:a,autoHighlight:c,highlightColor:l,coordinateSystem:u,coordinateOrigin:f,wrapLongitude:d,positionFormat:h,modelMatrix:p,extensions:g,fetch:y,operation:v,_subLayerProps:C}=this.props,b={id:"",updateTriggers:{},opacity:e,pickable:i,visible:n,parameters:o,getPolygonOffset:r,highlightedObjectIndex:a,autoHighlight:c,highlightColor:l,coordinateSystem:u,coordinateOrigin:f,wrapLongitude:d,positionFormat:h,modelMatrix:p,extensions:g,fetch:y,operation:v},P=C&&t.id&&C[t.id],w=P&&P.updateTriggers,M=t.id||"sublayer";if(P){const I=this.props[Ct],B=t.type?t.type._propTypes:{};for(const O in P){const F=B[O]||I[O];F&&F.type==="accessor"&&(P[O]=this.getSubLayerAccessor(P[O]))}}Object.assign(b,t,P),b.id=`${this.props.id}-${M}`,b.updateTriggers={all:this.props.updateTriggers?.all,...t.updateTriggers,...w};for(const I of g){const B=I.getSubLayerProps.call(this,I);B&&Object.assign(b,B,{updateTriggers:Object.assign(b.updateTriggers,B.updateTriggers)})}return b}_updateAutoHighlight(t){for(const e of this.getSubLayers())e.updateAutoHighlight(t)}_getAttributeManager(){return null}_postUpdate(t,e){let i=this.internalState.subLayers;const n=!i||this.needsUpdate();if(n){const o=this.renderLayers();i=ao(o,Boolean),this.internalState.subLayers=i}ot(rf,this,n,i);for(const o of i)o.parent=this}}wt.layerName="CompositeLayer";class Zo{constructor(t){this.indexStarts=[0],this.vertexStarts=[0],this.vertexCount=0,this.instanceCount=0;const{attributes:e={}}=t;this.typedArrayManager=Re,this.attributes={},this._attributeDefs=e,this.opts=t,this.updateGeometry(t)}updateGeometry(t){Object.assign(this.opts,t);const{data:e,buffers:i={},getGeometry:n,geometryBuffer:o,positionFormat:r,dataChanged:a,normalize:c=!0}=this.opts;if(this.data=e,this.getGeometry=n,this.positionSize=o&&o.size||(r==="XY"?2:3),this.buffers=i,this.normalize=c,o&&(ht(e.startIndices),this.getGeometry=this.getGeometryFromBuffer(o),c||(i.vertexPositions=o)),this.geometryBuffer=i.vertexPositions,Array.isArray(a))for(const l of a)this._rebuildGeometry(l);else this._rebuildGeometry()}updatePartialGeometry({startRow:t,endRow:e}){this._rebuildGeometry({startRow:t,endRow:e})}getGeometryFromBuffer(t){const e=t.value||t;return ArrayBuffer.isView(e)?ko(e,{size:this.positionSize,offset:t.offset,stride:t.stride,startIndices:this.data.startIndices}):null}_allocate(t,e){const{attributes:i,buffers:n,_attributeDefs:o,typedArrayManager:r}=this;for(const a in o)if(a in n)r.release(i[a]),i[a]=null;else{const c=o[a];c.copy=e,i[a]=r.allocate(i[a],t,c)}}_forEachGeometry(t,e,i){const{data:n,getGeometry:o}=this,{iterable:r,objectInfo:a}=Mt(n,e,i);for(const c of r){a.index++;const l=o?o(c,a):null;t(l,a.index)}}_rebuildGeometry(t){if(!this.data)return;let{indexStarts:e,vertexStarts:i,instanceCount:n}=this;const{data:o,geometryBuffer:r}=this,{startRow:a=0,endRow:c=1/0}=t||{},l={};if(t||(e=[0],i=[0]),this.normalize||!r)this._forEachGeometry((f,d)=>{const h=f&&this.normalizeGeometry(f);l[d]=h,i[d+1]=i[d]+(h?this.getGeometrySize(h):0)},a,c),n=i[i.length-1];else if(i=o.startIndices,n=i[o.length]||0,ArrayBuffer.isView(r))n=n||r.length/this.positionSize;else if(r instanceof Z){const f=this.positionSize*4;n=n||r.byteLength/f}else if(r.buffer){const f=r.stride||this.positionSize*4;n=n||r.buffer.byteLength/f}else if(r.value){const f=r.value,d=r.stride/f.BYTES_PER_ELEMENT||this.positionSize;n=n||f.length/d}this._allocate(n,!!t),this.indexStarts=e,this.vertexStarts=i,this.instanceCount=n;const u={};this._forEachGeometry((f,d)=>{const h=l[d]||f;u.vertexStart=i[d],u.indexStart=e[d];const p=d<i.length-1?i[d+1]:n;u.geometrySize=p-i[d],u.geometryIndex=d,this.updateGeometryAttributes(h,u)},a,c),this.vertexCount=e[e.length-1]}}const Xs=`layout(std140) uniform iconUniforms {
  float sizeScale;
  vec2 iconsTextureDim;
  float sizeBasis;
  float sizeMinPixels;
  float sizeMaxPixels;
  bool billboard;
  highp int sizeUnits;
  float alphaCutoff;
} icon;
`,af={name:"icon",vs:Xs,fs:Xs,uniformTypes:{sizeScale:"f32",iconsTextureDim:"vec2<f32>",sizeBasis:"f32",sizeMinPixels:"f32",sizeMaxPixels:"f32",billboard:"f32",sizeUnits:"i32",alphaCutoff:"f32"}},cf=`#version 300 es
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
`,lf=`#version 300 es
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
`,uf=`struct IconUniforms {
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
`,ff=1024,hf=4,Js=()=>{},Qs={minFilter:"linear",mipmapFilter:"linear",magFilter:"linear",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge"},df={x:0,y:0,width:0,height:0};function pf(s){return Math.pow(2,Math.ceil(Math.log2(s)))}function gf(s,t,e,i){const n=Math.min(e/t.width,i/t.height),o=Math.floor(t.width*n),r=Math.floor(t.height*n);return n===1?{image:t,width:o,height:r}:(s.canvas.height=r,s.canvas.width=o,s.clearRect(0,0,o,r),s.drawImage(t,0,0,t.width,t.height,0,0,o,r),{image:s.canvas,width:o,height:r})}function ie(s){return s&&(s.id||s.url)}function Xo(s){const{device:t}=s;t.type==="webgl"?s.generateMipmapsWebGL():t.type==="webgpu"&&t.generateMipmapsWebGPU(s)}function mf(s,t,e,i){const{width:n,height:o,device:r}=s,a=r.createTexture({format:"rgba8unorm",width:t,height:e,sampler:i,mipLevels:r.getMipLevelCount(t,e)}),c=r.createCommandEncoder();c.copyTextureToTexture({sourceTexture:s,destinationTexture:a,width:n,height:o});const l=c.finish();return r.submit(l),Xo(a),s.destroy(),a}function tn(s,t,e){for(let i=0;i<t.length;i++){const{icon:n,xOffset:o}=t[i],r=ie(n);s[r]={...n,x:o,y:e}}}function yf({icons:s,buffer:t,mapping:e={},xOffset:i=0,yOffset:n=0,rowHeight:o=0,canvasWidth:r}){let a=[];for(let c=0;c<s.length;c++){const l=s[c],u=ie(l);if(!e[u]){const{height:f,width:d}=l;i+d+t>r&&(tn(e,a,n),i=0,n=o+n+t,o=0,a=[]),a.push({icon:l,xOffset:i}),i=i+d+t,o=Math.max(o,f)}}return a.length>0&&tn(e,a,n),{mapping:e,rowHeight:o,xOffset:i,yOffset:n,canvasWidth:r,canvasHeight:pf(o+n+t)}}function _f(s,t,e){if(!s||!t)return null;e=e||{};const i={},{iterable:n,objectInfo:o}=Mt(s);for(const r of n){o.index++;const a=t(r,o),c=ie(a);if(!a)throw new Error("Icon is missing.");if(!a.url)throw new Error("Icon url is missing.");!i[c]&&(!e[c]||a.url!==e[c].url)&&(i[c]={...a,source:r,sourceIndex:o.index})}return i}class xf{constructor(t,{onUpdate:e=Js,onError:i=Js}){this._loadOptions=null,this._texture=null,this._externalTexture=null,this._mapping={},this._samplerParameters=null,this._pendingCount=0,this._autoPacking=!1,this._xOffset=0,this._yOffset=0,this._rowHeight=0,this._buffer=hf,this._canvasWidth=ff,this._canvasHeight=0,this._canvas=null,this.device=t,this.onUpdate=e,this.onError=i}finalize(){this._texture?.delete()}getTexture(){return this._texture||this._externalTexture}getIconMapping(t){const e=this._autoPacking?ie(t):t;return this._mapping[e]||df}setProps({loadOptions:t,autoPacking:e,iconAtlas:i,iconMapping:n,textureParameters:o}){t&&(this._loadOptions=t),e!==void 0&&(this._autoPacking=e),n&&(this._mapping=n),i&&(this._texture?.delete(),this._texture=null,this._externalTexture=i),o&&(this._samplerParameters=o)}get isLoaded(){return this._pendingCount===0}packIcons(t,e){if(!this._autoPacking||typeof document>"u")return;const i=Object.values(_f(t,e,this._mapping)||{});if(i.length>0){const{mapping:n,xOffset:o,yOffset:r,rowHeight:a,canvasHeight:c}=yf({icons:i,buffer:this._buffer,canvasWidth:this._canvasWidth,mapping:this._mapping,rowHeight:this._rowHeight,xOffset:this._xOffset,yOffset:this._yOffset});this._rowHeight=a,this._mapping=n,this._xOffset=o,this._yOffset=r,this._canvasHeight=c,this._texture||(this._texture=this.device.createTexture({format:"rgba8unorm",data:null,width:this._canvasWidth,height:this._canvasHeight,sampler:this._samplerParameters||Qs,mipLevels:this.device.getMipLevelCount(this._canvasWidth,this._canvasHeight)})),this._texture.height!==this._canvasHeight&&(this._texture=mf(this._texture,this._canvasWidth,this._canvasHeight,this._samplerParameters||Qs)),this.onUpdate(!0),this._canvas=this._canvas||document.createElement("canvas"),this._loadIcons(i)}}_loadIcons(t){const e=this._canvas.getContext("2d",{willReadFrequently:!0});for(const i of t)this._pendingCount++,xi(i.url,this._loadOptions).then(n=>{const o=ie(i),r=this._mapping[o],{x:a,y:c,width:l,height:u}=r,{image:f,width:d,height:h}=gf(e,n,l,u),p=a+(l-d)/2,g=c+(u-h)/2;this._texture?.copyExternalImage({image:f,x:p,y:g,width:d,height:h}),r.x=p,r.y=g,r.width=d,r.height=h,this._texture&&Xo(this._texture),this.onUpdate(d!==l||h!==u)}).catch(n=>{this.onError({url:i.url,source:i.source,sourceIndex:i.sourceIndex,loadOptions:this._loadOptions,error:n})}).finally(()=>{this._pendingCount--})}}const Jo=[0,0,0,255],vf={iconAtlas:{type:"image",value:null,async:!0},iconMapping:{type:"object",value:{},async:!0},sizeScale:{type:"number",value:1,min:0},billboard:!0,sizeUnits:"pixels",sizeBasis:"height",sizeMinPixels:{type:"number",min:0,value:0},sizeMaxPixels:{type:"number",min:0,value:Number.MAX_SAFE_INTEGER},alphaCutoff:{type:"number",value:.05,min:0,max:1},getPosition:{type:"accessor",value:s=>s.position},getIcon:{type:"accessor",value:s=>s.icon},getColor:{type:"accessor",value:Jo},getSize:{type:"accessor",value:1},getAngle:{type:"accessor",value:0},getPixelOffset:{type:"accessor",value:[0,0]},onIconError:{type:"function",value:null,optional:!0},textureParameters:{type:"object",ignore:!0,value:null}};class He extends mt{getShaders(){return super.getShaders({vs:cf,fs:lf,source:uf,modules:[Ut,So,Dt,af]})}initializeState(){this.state={iconManager:new xf(this.context.device,{onUpdate:this._onUpdate.bind(this),onError:this._onError.bind(this)})},this.getAttributeManager().addInstanced({instancePositions:{size:3,type:"float64",fp64:this.use64bitPositions(),transition:!0,accessor:"getPosition"},instanceSizes:{size:1,transition:!0,accessor:"getSize",defaultValue:1},instanceIconDefs:{size:7,accessor:"getIcon",transform:this.getInstanceIconDef,shaderAttributes:{instanceOffsets:{size:2,elementOffset:0},instanceIconFrames:{size:4,elementOffset:2},instanceColorModes:{size:1,elementOffset:6}}},instanceColors:{size:this.props.colorFormat.length,type:"unorm8",transition:!0,accessor:"getColor",defaultValue:Jo},instanceAngles:{size:1,transition:!0,accessor:"getAngle"},instancePixelOffset:{size:2,transition:!0,accessor:"getPixelOffset"}})}updateState(t){super.updateState(t);const{props:e,oldProps:i,changeFlags:n}=t,o=this.getAttributeManager(),{iconAtlas:r,iconMapping:a,data:c,getIcon:l,textureParameters:u}=e,{iconManager:f}=this.state;if(typeof r=="string")return;const d=r||this.internalState.isAsyncPropLoading("iconAtlas");f.setProps({loadOptions:e.loadOptions,autoPacking:!d,iconAtlas:r,iconMapping:d?a:null,textureParameters:u}),d?i.iconMapping!==e.iconMapping&&o.invalidate("getIcon"):(n.dataChanged||n.updateTriggersChanged&&(n.updateTriggersChanged.all||n.updateTriggersChanged.getIcon))&&f.packIcons(c,l),n.extensionsChanged&&(this.state.model?.destroy(),this.state.model=this._getModel(),o.invalidateAll())}get isLoaded(){return super.isLoaded&&this.state.iconManager.isLoaded}finalizeState(t){super.finalizeState(t),this.state.iconManager.finalize()}draw({uniforms:t}){const{sizeScale:e,sizeBasis:i,sizeMinPixels:n,sizeMaxPixels:o,sizeUnits:r,billboard:a,alphaCutoff:c}=this.props,{iconManager:l}=this.state,u=l.getTexture();if(u){const f=this.state.model,d={iconsTexture:u,iconsTextureDim:[u.width,u.height],sizeUnits:ee[r],sizeScale:e,sizeBasis:i==="height"?1:0,sizeMinPixels:n,sizeMaxPixels:o,billboard:a,alphaCutoff:c};f.shaderInputs.setProps({icon:d}),f.draw(this.context.renderPass)}}_getModel(){const t=[-1,-1,1,-1,-1,1,1,1];return new rt(this.context.device,{...this.getShaders(),id:this.props.id,bufferLayout:this.getAttributeManager().getBufferLayouts(),geometry:new pt({topology:"triangle-strip",attributes:{positions:{size:2,value:new Float32Array(t)}}}),isInstanced:!0})}_onUpdate(t){t?(this.getAttributeManager()?.invalidate("getIcon"),this.setNeedsUpdate()):this.setNeedsRedraw()}_onError(t){const e=this.getCurrentLayer()?.props.onIconError;e?e(t):K.error(t.error.message)()}getInstanceIconDef(t){const{x:e,y:i,width:n,height:o,mask:r,anchorX:a=n/2,anchorY:c=o/2}=this.state.iconManager.getIconMapping(t);return[n/2-a,o/2-c,e,i,n,o,r?1:0]}}He.defaultProps=vf;He.layerName="IconLayer";const en=`layout(std140) uniform scatterplotUniforms {
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
`,bf={name:"scatterplot",vs:en,fs:en,source:"",uniformTypes:{radiusScale:"f32",radiusMinPixels:"f32",radiusMaxPixels:"f32",lineWidthScale:"f32",lineWidthMinPixels:"f32",lineWidthMaxPixels:"f32",stroked:"f32",filled:"f32",antialiasing:"f32",billboard:"f32",radiusUnits:"i32",lineWidthUnits:"i32"}},Cf=`#version 300 es
#define SHADER_NAME scatterplot-layer-vertex-shader
in vec3 positions;
in vec3 instancePositions;
in vec3 instancePositions64Low;
in float instanceRadius;
in float instanceLineWidths;
in vec4 instanceFillColors;
in vec4 instanceLineColors;
in vec3 instancePickingColors;
in vec2 instancePixelOffset;
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
offset.xy += instancePixelOffset;
DECKGL_FILTER_SIZE(offset, geometry);
gl_Position.xy += project_pixel_size_to_clipspace(offset.xy);
} else {
vec3 offset = edgePadding * positions * project_pixel_size(outerRadiusPixels);
offset.xy += project_pixel_size(instancePixelOffset);
DECKGL_FILTER_SIZE(offset, geometry);
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset, geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
}
vFillColor = vec4(instanceFillColors.rgb, instanceFillColors.a * layer.opacity);
DECKGL_FILTER_COLOR(vFillColor, geometry);
vLineColor = vec4(instanceLineColors.rgb, instanceLineColors.a * layer.opacity);
DECKGL_FILTER_COLOR(vLineColor, geometry);
}
`,Pf=`#version 300 es
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
`,wf=`// Main shaders

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
 instancePixelOffset: vec2<f32>,

 instancePositionsConstant: i32,
 instancePositions64LowConstant: i32,
 instanceRadiusConstant: i32,
 instanceLineWidthsConstant: i32,
 instanceFillColorsConstant: i32,
 instanceLineColorsConstant: i32,
 instancePickingColorsConstant: i32,
 instancePixelOffsetConstant: i32
};

@group(0) @binding(0) var<uniform> scatterplot: ScatterplotUniforms;

struct ConstantAttributes {
  instancePositions: vec3<f32>,
  instancePositions64Low: vec3<f32>,
  instanceRadius: f32,
  instanceLineWidths: f32,
  instanceFillColors: vec4<f32>,
  instanceLineColors: vec4<f32>,
  instancePickingColors: vec3<f32>,
  instancePixelOffset: vec2<f32>
};

const constants = ConstantAttributes(
  vec3<f32>(0.0),
  vec3<f32>(0.0),
  0.0,
  0.0,
  vec4<f32>(0.0, 0.0, 0.0, 1.0),
  vec4<f32>(0.0, 0.0, 0.0, 1.0),
  vec3<f32>(0.0),
  vec2<f32>(0.0)
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
  @location(8) instancePixelOffset: vec2<f32>
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
    var offset = edgePadding * attributes.positions * varyings.outerRadiusPixels;
    offset = vec3<f32>(offset.xy + attributes.instancePixelOffset, offset.z);
    // DECKGL_FILTER_SIZE(offset, geometry);
    let clipPixels = project_pixel_size_to_clipspace(offset.xy);
    varyings.position = vec4<f32>(varyings.position.x + clipPixels.x, varyings.position.y + clipPixels.y, varyings.position.z, varyings.position.w);
  } else {
    var offset = edgePadding * attributes.positions * project_pixel_size_float(varyings.outerRadiusPixels);
    offset = vec3<f32>(offset.xy + project_pixel_size_vec2(attributes.instancePixelOffset), offset.z);
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
`,sn=[0,0,0,255],Lf={radiusUnits:"meters",radiusScale:{type:"number",min:0,value:1},radiusMinPixels:{type:"number",min:0,value:0},radiusMaxPixels:{type:"number",min:0,value:Number.MAX_SAFE_INTEGER},lineWidthUnits:"meters",lineWidthScale:{type:"number",min:0,value:1},lineWidthMinPixels:{type:"number",min:0,value:0},lineWidthMaxPixels:{type:"number",min:0,value:Number.MAX_SAFE_INTEGER},stroked:!1,filled:!0,billboard:!1,antialiasing:!0,getPosition:{type:"accessor",value:s=>s.position},getRadius:{type:"accessor",value:1},getFillColor:{type:"accessor",value:sn},getLineColor:{type:"accessor",value:sn},getLineWidth:{type:"accessor",value:1},getPixelOffset:{type:"accessor",value:[0,0]},strokeWidth:{deprecatedFor:"getLineWidth"},outline:{deprecatedFor:"stroked"},getColor:{deprecatedFor:["getFillColor","getLineColor"]}};class Xi extends mt{getShaders(){return super.getShaders({vs:Cf,fs:Pf,source:wf,modules:[Ut,So,Dt,bf]})}initializeState(){this.getAttributeManager().addInstanced({instancePositions:{size:3,type:"float64",fp64:this.use64bitPositions(),transition:!0,accessor:"getPosition"},instanceRadius:{size:1,transition:!0,accessor:"getRadius",defaultValue:1},instanceFillColors:{size:this.props.colorFormat.length,transition:!0,type:"unorm8",accessor:"getFillColor",defaultValue:[0,0,0,255]},instanceLineColors:{size:this.props.colorFormat.length,transition:!0,type:"unorm8",accessor:"getLineColor",defaultValue:[0,0,0,255]},instanceLineWidths:{size:1,transition:!0,accessor:"getLineWidth",defaultValue:1},instancePixelOffset:{size:2,transition:!0,accessor:"getPixelOffset"}})}updateState(t){super.updateState(t),t.changeFlags.extensionsChanged&&(this.state.model?.destroy(),this.state.model=this._getModel(),this.getAttributeManager().invalidateAll())}draw({uniforms:t}){const{radiusUnits:e,radiusScale:i,radiusMinPixels:n,radiusMaxPixels:o,stroked:r,filled:a,billboard:c,antialiasing:l,lineWidthUnits:u,lineWidthScale:f,lineWidthMinPixels:d,lineWidthMaxPixels:h}=this.props,p={stroked:r,filled:a,billboard:c,antialiasing:l,radiusUnits:ee[e],radiusScale:i,radiusMinPixels:n,radiusMaxPixels:o,lineWidthUnits:ee[u],lineWidthScale:f,lineWidthMinPixels:d,lineWidthMaxPixels:h},g=this.state.model;g.shaderInputs.setProps({scatterplot:p}),g.draw(this.context.renderPass)}_getModel(){const t=[-1,-1,0,1,-1,0,-1,1,0,1,1,0];return new rt(this.context.device,{...this.getShaders(),id:this.props.id,bufferLayout:this.getAttributeManager().getBufferLayouts(),geometry:new pt({topology:"triangle-strip",attributes:{positions:{size:3,value:new Float32Array(t)}}}),isInstanced:!0})}}Xi.defaultProps=Lf;Xi.layerName="ScatterplotLayer";const Qo={CLOCKWISE:1,COUNTER_CLOCKWISE:-1};function tr(s,t,e={}){return Tf(s,e)!==t?(Sf(s,e),!0):!1}function Tf(s,t={}){return Math.sign(Af(s,t))}const nn={x:0,y:1,z:2};function Af(s,t={}){const{start:e=0,end:i=s.length,plane:n="xy"}=t,o=t.size||2;let r=0;const a=nn[n[0]],c=nn[n[1]];for(let l=e,u=i-o;l<i;l+=o)r+=(s[l+a]-s[u+a])*(s[l+c]+s[u+c]),u=l;return r/2}function Sf(s,t){const{start:e=0,end:i=s.length,size:n=2}=t,o=(i-e)/n,r=Math.floor(o/2);for(let a=0;a<r;++a){const c=e+a*n,l=e+(o-1-a)*n;for(let u=0;u<n;++u){const f=s[c+u];s[c+u]=s[l+u],s[l+u]=f}}}function ct(s,t){const e=t.length,i=s.length;if(i>0){let n=!0;for(let o=0;o<e;o++)if(s[i-e+o]!==t[o]){n=!1;break}if(n)return!1}for(let n=0;n<e;n++)s[i+n]=t[n];return!0}function Ri(s,t){const e=t.length;for(let i=0;i<e;i++)s[i]=t[i]}function se(s,t,e,i,n=[]){const o=i+t*e;for(let r=0;r<e;r++)n[r]=s[o+r];return n}function zi(s,t,e,i,n=[]){let o,r;if(e&8)o=(i[3]-s[1])/(t[1]-s[1]),r=3;else if(e&4)o=(i[1]-s[1])/(t[1]-s[1]),r=1;else if(e&2)o=(i[2]-s[0])/(t[0]-s[0]),r=2;else if(e&1)o=(i[0]-s[0])/(t[0]-s[0]),r=0;else return null;for(let a=0;a<s.length;a++)n[a]=(r&1)===a?i[r]:o*(t[a]-s[a])+s[a];return n}function Ae(s,t){let e=0;return s[0]<t[0]?e|=1:s[0]>t[2]&&(e|=2),s[1]<t[1]?e|=4:s[1]>t[3]&&(e|=8),e}function er(s,t){const{size:e=2,broken:i=!1,gridResolution:n=10,gridOffset:o=[0,0],startIndex:r=0,endIndex:a=s.length}=t||{},c=(a-r)/e;let l=[];const u=[l],f=se(s,0,e,r);let d,h;const p=sr(f,n,o,[]),g=[];ct(l,f);for(let y=1;y<c;y++){for(d=se(s,y,e,r,d),h=Ae(d,p);h;){zi(f,d,h,p,g);const v=Ae(g,p);v&&(zi(f,g,v,p,g),h=v),ct(l,g),Ri(f,g),Ef(p,n,h),i&&l.length>e&&(l=[],u.push(l),ct(l,f)),h=Ae(d,p)}ct(l,d),Ri(f,d)}return i?u:u[0]}const on=0,Mf=1;function ir(s,t=null,e){if(!s.length)return[];const{size:i=2,gridResolution:n=10,gridOffset:o=[0,0],edgeTypes:r=!1}=e||{},a=[],c=[{pos:s,types:r?new Array(s.length/i).fill(Mf):null,holes:t||[]}],l=[[],[]];let u=[];for(;c.length;){const{pos:f,types:d,holes:h}=c.shift();If(f,i,h[0]||f.length,l),u=sr(l[0],n,o,u);const p=Ae(l[1],u);if(p){let g=rn(f,d,i,0,h[0]||f.length,u,p);const y={pos:g[0].pos,types:g[0].types,holes:[]},v={pos:g[1].pos,types:g[1].types,holes:[]};c.push(y,v);for(let C=0;C<h.length;C++)g=rn(f,d,i,h[C],h[C+1]||f.length,u,p),g[0]&&(y.holes.push(y.pos.length),y.pos=fe(y.pos,g[0].pos),r&&(y.types=fe(y.types,g[0].types))),g[1]&&(v.holes.push(v.pos.length),v.pos=fe(v.pos,g[1].pos),r&&(v.types=fe(v.types,g[1].types)))}else{const g={positions:f};r&&(g.edgeTypes=d),h.length&&(g.holeIndices=h),a.push(g)}}return a}function rn(s,t,e,i,n,o,r){const a=(n-i)/e,c=[],l=[],u=[],f=[],d=[];let h,p,g;const y=se(s,a-1,e,i);let v=Math.sign(r&8?y[1]-o[3]:y[0]-o[2]),C=t&&t[a-1],b=0,P=0;for(let w=0;w<a;w++)h=se(s,w,e,i,h),p=Math.sign(r&8?h[1]-o[3]:h[0]-o[2]),g=t&&t[i/e+w],p&&v&&v!==p&&(zi(y,h,r,o,d),ct(c,d)&&u.push(C),ct(l,d)&&f.push(C)),p<=0?(ct(c,h)&&u.push(g),b-=p):u.length&&(u[u.length-1]=on),p>=0?(ct(l,h)&&f.push(g),P+=p):f.length&&(f[f.length-1]=on),Ri(y,h),v=p,C=g;return[b?{pos:c,types:t&&u}:null,P?{pos:l,types:t&&f}:null]}function sr(s,t,e,i){const n=Math.floor((s[0]-e[0])/t)*t+e[0],o=Math.floor((s[1]-e[1])/t)*t+e[1];return i[0]=n,i[1]=o,i[2]=n+t,i[3]=o+t,i}function Ef(s,t,e){e&8?(s[1]+=t,s[3]+=t):e&4?(s[1]-=t,s[3]-=t):e&2?(s[0]+=t,s[2]+=t):e&1&&(s[0]-=t,s[2]-=t)}function If(s,t,e,i){let n=1/0,o=-1/0,r=1/0,a=-1/0;for(let c=0;c<e;c+=t){const l=s[c],u=s[c+1];n=l<n?l:n,o=l>o?l:o,r=u<r?u:r,a=u>a?u:a}return i[0][0]=n,i[0][1]=r,i[1][0]=o,i[1][1]=a,i}function fe(s,t){for(let e=0;e<t.length;e++)s.push(t[e]);return s}const Of=85.051129;function Rf(s,t){const{size:e=2,startIndex:i=0,endIndex:n=s.length,normalize:o=!0}=t||{},r=s.slice(i,n);nr(r,e,0,n-i);const a=er(r,{size:e,broken:!0,gridResolution:360,gridOffset:[-180,-180]});if(o)for(const c of a)or(c,e);return a}function zf(s,t=null,e){const{size:i=2,normalize:n=!0,edgeTypes:o=!1}=e||{};t=t||[];const r=[],a=[];let c=0,l=0;for(let f=0;f<=t.length;f++){const d=t[f]||s.length,h=l,p=Bf(s,i,c,d);for(let g=p;g<d;g++)r[l++]=s[g];for(let g=c;g<p;g++)r[l++]=s[g];nr(r,i,h,l),Ff(r,i,h,l,e?.maxLatitude),c=d,a[f]=l}a.pop();const u=ir(r,a,{size:i,gridResolution:360,gridOffset:[-180,-180],edgeTypes:o});if(n)for(const f of u)or(f.positions,i);return u}function Bf(s,t,e,i){let n=-1,o=-1;for(let r=e+1;r<i;r+=t){const a=Math.abs(s[r]);a>n&&(n=a,o=r-1)}return o}function Ff(s,t,e,i,n=Of){const o=s[e],r=s[i-t];if(Math.abs(o-r)>180){const a=se(s,0,t,e);a[0]+=Math.round((r-o)/360)*360,ct(s,a),a[1]=Math.sign(a[1])*n,ct(s,a),a[0]=o,ct(s,a)}}function nr(s,t,e,i){let n=s[0],o;for(let r=e;r<i;r+=t){o=s[r];const a=o-n;(a>180||a<-180)&&(o-=Math.round(a/360)*360),s[r]=n=o}}function or(s,t){let e;const i=s.length/t;for(let o=0;o<i&&(e=s[o*t],(e+180)%360===0);o++);const n=-Math.round(e/360)*360;if(n!==0)for(let o=0;o<i;o++)s[o*t]+=n}function Nf(s,t,e,i){let n;if(Array.isArray(s[0])){const o=s.length*t;n=new Array(o);for(let r=0;r<s.length;r++)for(let a=0;a<t;a++)n[r*t+a]=s[r][a]||0}else n=s;return e?er(n,{size:t,gridResolution:e}):i?Rf(n,{size:t}):n}const kf=1,Uf=2,oi=4;class Df extends Zo{constructor(t){super({...t,attributes:{positions:{size:3,padding:18,initialize:!0,type:t.fp64?Float64Array:Float32Array},segmentTypes:{size:1,type:Uint8ClampedArray}}})}get(t){return this.attributes[t]}getGeometryFromBuffer(t){return this.normalize?super.getGeometryFromBuffer(t):null}normalizeGeometry(t){return this.normalize?Nf(t,this.positionSize,this.opts.resolution,this.opts.wrapLongitude):t}getGeometrySize(t){if(an(t)){let i=0;for(const n of t)i+=this.getGeometrySize(n);return i}const e=this.getPathLength(t);return e<2?0:this.isClosed(t)?e<3?0:e+2:e}updateGeometryAttributes(t,e){if(e.geometrySize!==0)if(t&&an(t))for(const i of t){const n=this.getGeometrySize(i);e.geometrySize=n,this.updateGeometryAttributes(i,e),e.vertexStart+=n}else this._updateSegmentTypes(t,e),this._updatePositions(t,e)}_updateSegmentTypes(t,e){const i=this.attributes.segmentTypes,n=t?this.isClosed(t):!1,{vertexStart:o,geometrySize:r}=e;i.fill(0,o,o+r),n?(i[o]=oi,i[o+r-2]=oi):(i[o]+=kf,i[o+r-2]+=Uf),i[o+r-1]=oi}_updatePositions(t,e){const{positions:i}=this.attributes;if(!i||!t)return;const{vertexStart:n,geometrySize:o}=e,r=new Array(3);for(let a=n,c=0;c<o;a++,c++)this.getPointOnPath(t,c,r),i[a*3]=r[0],i[a*3+1]=r[1],i[a*3+2]=r[2]}getPathLength(t){return t.length/this.positionSize}getPointOnPath(t,e,i=[]){const{positionSize:n}=this;e*n>=t.length&&(e+=1-t.length/n);const o=e*n;return i[0]=t[o],i[1]=t[o+1],i[2]=n===3&&t[o+2]||0,i}isClosed(t){if(!this.normalize)return!!this.opts.loop;const{positionSize:e}=this,i=t.length-e;return t[0]===t[i]&&t[1]===t[i+1]&&(e===2||t[2]===t[i+2])}}function an(s){return Array.isArray(s[0])}const cn=`layout(std140) uniform pathUniforms {
  float widthScale;
  float widthMinPixels;
  float widthMaxPixels;
  float jointType;
  float capType;
  float miterLimit;
  bool billboard;
  highp int widthUnits;
} path;
`,$f={name:"path",vs:cn,fs:cn,uniformTypes:{widthScale:"f32",widthMinPixels:"f32",widthMaxPixels:"f32",jointType:"f32",capType:"f32",miterLimit:"f32",billboard:"f32",widthUnits:"i32"}},jf=`#version 300 es
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
`,Gf=`#version 300 es
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
`,rr=[0,0,0,255],Vf={widthUnits:"meters",widthScale:{type:"number",min:0,value:1},widthMinPixels:{type:"number",min:0,value:0},widthMaxPixels:{type:"number",min:0,value:Number.MAX_SAFE_INTEGER},jointRounded:!1,capRounded:!1,miterLimit:{type:"number",min:0,value:4},billboard:!1,_pathType:null,getPath:{type:"accessor",value:s=>s.path},getColor:{type:"accessor",value:rr},getWidth:{type:"accessor",value:1},rounded:{deprecatedFor:["jointRounded","capRounded"]}},ri={enter:(s,t)=>t.length?t.subarray(t.length-s.length):s};class St extends mt{getShaders(){return super.getShaders({vs:jf,fs:Gf,modules:[Ut,Dt,$f]})}get wrapLongitude(){return!1}getBounds(){return this.getAttributeManager()?.getBounds(["vertexPositions"])}initializeState(){this.getAttributeManager().addInstanced({vertexPositions:{size:3,vertexOffset:1,type:"float64",fp64:this.use64bitPositions(),transition:ri,accessor:"getPath",update:this.calculatePositions,noAlloc:!0,shaderAttributes:{instanceLeftPositions:{vertexOffset:0},instanceStartPositions:{vertexOffset:1},instanceEndPositions:{vertexOffset:2},instanceRightPositions:{vertexOffset:3}}},instanceTypes:{size:1,type:"uint8",update:this.calculateSegmentTypes,noAlloc:!0},instanceStrokeWidths:{size:1,accessor:"getWidth",transition:ri,defaultValue:1},instanceColors:{size:this.props.colorFormat.length,type:"unorm8",accessor:"getColor",transition:ri,defaultValue:rr},instancePickingColors:{size:4,type:"uint8",accessor:(i,{index:n,target:o})=>this.encodePickingColor(i&&i.__source?i.__source.index:n,o)}}),this.setState({pathTesselator:new Df({fp64:this.use64bitPositions()})})}updateState(t){super.updateState(t);const{props:e,changeFlags:i}=t,n=this.getAttributeManager();if(i.dataChanged||i.updateTriggersChanged&&(i.updateTriggersChanged.all||i.updateTriggersChanged.getPath)){const{pathTesselator:r}=this.state,a=e.data.attributes||{};r.updateGeometry({data:e.data,geometryBuffer:a.getPath,buffers:a,normalize:!e._pathType,loop:e._pathType==="loop",getGeometry:e.getPath,positionFormat:e.positionFormat,wrapLongitude:e.wrapLongitude,resolution:this.context.viewport.resolution,dataChanged:i.dataChanged}),this.setState({numInstances:r.instanceCount,startIndices:r.vertexStarts}),i.dataChanged||n.invalidateAll()}i.extensionsChanged&&(this.state.model?.destroy(),this.state.model=this._getModel(),n.invalidateAll())}getPickingInfo(t){const e=super.getPickingInfo(t),{index:i}=e,n=this.props.data;return n[0]&&n[0].__source&&(e.object=n.find(o=>o.__source.index===i)),e}disablePickingIndex(t){const e=this.props.data;if(e[0]&&e[0].__source)for(let i=0;i<e.length;i++)e[i].__source.index===t&&this._disablePickingIndex(i);else super.disablePickingIndex(t)}draw({uniforms:t}){const{jointRounded:e,capRounded:i,billboard:n,miterLimit:o,widthUnits:r,widthScale:a,widthMinPixels:c,widthMaxPixels:l}=this.props,u=this.state.model,f={jointType:Number(e),capType:Number(i),billboard:n,widthUnits:ee[r],widthScale:a,miterLimit:o,widthMinPixels:c,widthMaxPixels:l};u.shaderInputs.setProps({path:f}),u.draw(this.context.renderPass)}_getModel(){const t=[0,1,2,1,4,2,1,3,4,3,5,4],e=[0,0,0,-1,0,1,1,-1,1,1,1,0];return new rt(this.context.device,{...this.getShaders(),id:this.props.id,bufferLayout:this.getAttributeManager().getBufferLayouts(),geometry:new pt({topology:"triangle-list",attributes:{indices:new Uint16Array(t),positions:{value:new Float32Array(e),size:2}}}),isInstanced:!0})}calculatePositions(t){const{pathTesselator:e}=this.state;t.startIndices=e.vertexStarts,t.value=e.get("positions")}calculateSegmentTypes(t){const{pathTesselator:e}=this.state;t.startIndices=e.vertexStarts,t.value=e.get("segmentTypes")}}St.defaultProps=Vf;St.layerName="PathLayer";var he={exports:{}},ln;function Wf(){if(ln)return he.exports;ln=1,he.exports=s,he.exports.default=s;function s(m,x,_){_=_||2;var L=x&&x.length,T=L?x[0]*_:m.length,A=t(m,0,T,_,!0),S=[];if(!A||A.next===A.prev)return S;var E,N,z,Y,W,D,J;if(L&&(A=c(m,x,A,_)),m.length>80*_){E=z=m[0],N=Y=m[1];for(var H=_;H<T;H+=_)W=m[H],D=m[H+1],W<E&&(E=W),D<N&&(N=D),W>z&&(z=W),D>Y&&(Y=D);J=Math.max(z-E,Y-N),J=J!==0?32767/J:0}return i(A,S,_,E,N,J,0),S}function t(m,x,_,L,T){var A,S;if(T===q(m,x,_,L)>0)for(A=x;A<_;A+=L)S=U(A,m[A],m[A+1],S);else for(A=_-L;A>=x;A-=L)S=U(A,m[A],m[A+1],S);return S&&P(S,S.next)&&(V(S),S=S.next),S}function e(m,x){if(!m)return m;x||(x=m);var _=m,L;do if(L=!1,!_.steiner&&(P(_,_.next)||b(_.prev,_,_.next)===0)){if(V(_),_=x=_.prev,_===_.next)break;L=!0}else _=_.next;while(L||_!==x);return x}function i(m,x,_,L,T,A,S){if(m){!S&&A&&h(m,L,T,A);for(var E=m,N,z;m.prev!==m.next;){if(N=m.prev,z=m.next,A?o(m,L,T,A):n(m)){x.push(N.i/_|0),x.push(m.i/_|0),x.push(z.i/_|0),V(m),m=z.next,E=z.next;continue}if(m=z,m===E){S?S===1?(m=r(e(m),x,_),i(m,x,_,L,T,A,2)):S===2&&a(m,x,_,L,T,A):i(e(m),x,_,L,T,A,1);break}}}}function n(m){var x=m.prev,_=m,L=m.next;if(b(x,_,L)>=0)return!1;for(var T=x.x,A=_.x,S=L.x,E=x.y,N=_.y,z=L.y,Y=T<A?T<S?T:S:A<S?A:S,W=E<N?E<z?E:z:N<z?N:z,D=T>A?T>S?T:S:A>S?A:S,J=E>N?E>z?E:z:N>z?N:z,H=L.next;H!==x;){if(H.x>=Y&&H.x<=D&&H.y>=W&&H.y<=J&&v(T,E,A,N,S,z,H.x,H.y)&&b(H.prev,H,H.next)>=0)return!1;H=H.next}return!0}function o(m,x,_,L){var T=m.prev,A=m,S=m.next;if(b(T,A,S)>=0)return!1;for(var E=T.x,N=A.x,z=S.x,Y=T.y,W=A.y,D=S.y,J=E<N?E<z?E:z:N<z?N:z,H=Y<W?Y<D?Y:D:W<D?W:D,jt=E>N?E>z?E:z:N>z?N:z,Gt=Y>W?Y>D?Y:D:W>D?W:D,ps=g(J,H,x,_,L),gs=g(jt,Gt,x,_,L),$=m.prevZ,j=m.nextZ;$&&$.z>=ps&&j&&j.z<=gs;){if($.x>=J&&$.x<=jt&&$.y>=H&&$.y<=Gt&&$!==T&&$!==S&&v(E,Y,N,W,z,D,$.x,$.y)&&b($.prev,$,$.next)>=0||($=$.prevZ,j.x>=J&&j.x<=jt&&j.y>=H&&j.y<=Gt&&j!==T&&j!==S&&v(E,Y,N,W,z,D,j.x,j.y)&&b(j.prev,j,j.next)>=0))return!1;j=j.nextZ}for(;$&&$.z>=ps;){if($.x>=J&&$.x<=jt&&$.y>=H&&$.y<=Gt&&$!==T&&$!==S&&v(E,Y,N,W,z,D,$.x,$.y)&&b($.prev,$,$.next)>=0)return!1;$=$.prevZ}for(;j&&j.z<=gs;){if(j.x>=J&&j.x<=jt&&j.y>=H&&j.y<=Gt&&j!==T&&j!==S&&v(E,Y,N,W,z,D,j.x,j.y)&&b(j.prev,j,j.next)>=0)return!1;j=j.nextZ}return!0}function r(m,x,_){var L=m;do{var T=L.prev,A=L.next.next;!P(T,A)&&w(T,L,L.next,A)&&O(T,A)&&O(A,T)&&(x.push(T.i/_|0),x.push(L.i/_|0),x.push(A.i/_|0),V(L),V(L.next),L=m=A),L=L.next}while(L!==m);return e(L)}function a(m,x,_,L,T,A){var S=m;do{for(var E=S.next.next;E!==S.prev;){if(S.i!==E.i&&C(S,E)){var N=G(S,E);S=e(S,S.next),N=e(N,N.next),i(S,x,_,L,T,A,0),i(N,x,_,L,T,A,0);return}E=E.next}S=S.next}while(S!==m)}function c(m,x,_,L){var T=[],A,S,E,N,z;for(A=0,S=x.length;A<S;A++)E=x[A]*L,N=A<S-1?x[A+1]*L:m.length,z=t(m,E,N,L,!1),z===z.next&&(z.steiner=!0),T.push(y(z));for(T.sort(l),A=0;A<T.length;A++)_=u(T[A],_);return _}function l(m,x){return m.x-x.x}function u(m,x){var _=f(m,x);if(!_)return x;var L=G(_,m);return e(L,L.next),e(_,_.next)}function f(m,x){var _=x,L=m.x,T=m.y,A=-1/0,S;do{if(T<=_.y&&T>=_.next.y&&_.next.y!==_.y){var E=_.x+(T-_.y)*(_.next.x-_.x)/(_.next.y-_.y);if(E<=L&&E>A&&(A=E,S=_.x<_.next.x?_:_.next,E===L))return S}_=_.next}while(_!==x);if(!S)return null;var N=S,z=S.x,Y=S.y,W=1/0,D;_=S;do L>=_.x&&_.x>=z&&L!==_.x&&v(T<Y?L:A,T,z,Y,T<Y?A:L,T,_.x,_.y)&&(D=Math.abs(T-_.y)/(L-_.x),O(_,m)&&(D<W||D===W&&(_.x>S.x||_.x===S.x&&d(S,_)))&&(S=_,W=D)),_=_.next;while(_!==N);return S}function d(m,x){return b(m.prev,m,x.prev)<0&&b(x.next,m,m.next)<0}function h(m,x,_,L){var T=m;do T.z===0&&(T.z=g(T.x,T.y,x,_,L)),T.prevZ=T.prev,T.nextZ=T.next,T=T.next;while(T!==m);T.prevZ.nextZ=null,T.prevZ=null,p(T)}function p(m){var x,_,L,T,A,S,E,N,z=1;do{for(_=m,m=null,A=null,S=0;_;){for(S++,L=_,E=0,x=0;x<z&&(E++,L=L.nextZ,!!L);x++);for(N=z;E>0||N>0&&L;)E!==0&&(N===0||!L||_.z<=L.z)?(T=_,_=_.nextZ,E--):(T=L,L=L.nextZ,N--),A?A.nextZ=T:m=T,T.prevZ=A,A=T;_=L}A.nextZ=null,z*=2}while(S>1);return m}function g(m,x,_,L,T){return m=(m-_)*T|0,x=(x-L)*T|0,m=(m|m<<8)&16711935,m=(m|m<<4)&252645135,m=(m|m<<2)&858993459,m=(m|m<<1)&1431655765,x=(x|x<<8)&16711935,x=(x|x<<4)&252645135,x=(x|x<<2)&858993459,x=(x|x<<1)&1431655765,m|x<<1}function y(m){var x=m,_=m;do(x.x<_.x||x.x===_.x&&x.y<_.y)&&(_=x),x=x.next;while(x!==m);return _}function v(m,x,_,L,T,A,S,E){return(T-S)*(x-E)>=(m-S)*(A-E)&&(m-S)*(L-E)>=(_-S)*(x-E)&&(_-S)*(A-E)>=(T-S)*(L-E)}function C(m,x){return m.next.i!==x.i&&m.prev.i!==x.i&&!B(m,x)&&(O(m,x)&&O(x,m)&&F(m,x)&&(b(m.prev,m,x.prev)||b(m,x.prev,x))||P(m,x)&&b(m.prev,m,m.next)>0&&b(x.prev,x,x.next)>0)}function b(m,x,_){return(x.y-m.y)*(_.x-x.x)-(x.x-m.x)*(_.y-x.y)}function P(m,x){return m.x===x.x&&m.y===x.y}function w(m,x,_,L){var T=I(b(m,x,_)),A=I(b(m,x,L)),S=I(b(_,L,m)),E=I(b(_,L,x));return!!(T!==A&&S!==E||T===0&&M(m,_,x)||A===0&&M(m,L,x)||S===0&&M(_,m,L)||E===0&&M(_,x,L))}function M(m,x,_){return x.x<=Math.max(m.x,_.x)&&x.x>=Math.min(m.x,_.x)&&x.y<=Math.max(m.y,_.y)&&x.y>=Math.min(m.y,_.y)}function I(m){return m>0?1:m<0?-1:0}function B(m,x){var _=m;do{if(_.i!==m.i&&_.next.i!==m.i&&_.i!==x.i&&_.next.i!==x.i&&w(_,_.next,m,x))return!0;_=_.next}while(_!==m);return!1}function O(m,x){return b(m.prev,m,m.next)<0?b(m,x,m.next)>=0&&b(m,m.prev,x)>=0:b(m,x,m.prev)<0||b(m,m.next,x)<0}function F(m,x){var _=m,L=!1,T=(m.x+x.x)/2,A=(m.y+x.y)/2;do _.y>A!=_.next.y>A&&_.next.y!==_.y&&T<(_.next.x-_.x)*(A-_.y)/(_.next.y-_.y)+_.x&&(L=!L),_=_.next;while(_!==m);return L}function G(m,x){var _=new tt(m.i,m.x,m.y),L=new tt(x.i,x.x,x.y),T=m.next,A=x.prev;return m.next=x,x.prev=m,_.next=T,T.prev=_,L.next=_,_.prev=L,A.next=L,L.prev=A,L}function U(m,x,_,L){var T=new tt(m,x,_);return L?(T.next=L.next,T.prev=L,L.next.prev=T,L.next=T):(T.prev=T,T.next=T),T}function V(m){m.next.prev=m.prev,m.prev.next=m.next,m.prevZ&&(m.prevZ.nextZ=m.nextZ),m.nextZ&&(m.nextZ.prevZ=m.prevZ)}function tt(m,x,_){this.i=m,this.x=x,this.y=_,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}s.deviation=function(m,x,_,L){var T=x&&x.length,A=T?x[0]*_:m.length,S=Math.abs(q(m,0,A,_));if(T)for(var E=0,N=x.length;E<N;E++){var z=x[E]*_,Y=E<N-1?x[E+1]*_:m.length;S-=Math.abs(q(m,z,Y,_))}var W=0;for(E=0;E<L.length;E+=3){var D=L[E]*_,J=L[E+1]*_,H=L[E+2]*_;W+=Math.abs((m[D]-m[H])*(m[J+1]-m[D+1])-(m[D]-m[J])*(m[H+1]-m[D+1]))}return S===0&&W===0?0:Math.abs((W-S)/S)};function q(m,x,_,L){for(var T=0,A=x,S=_-L;A<_;A+=L)T+=(m[S]-m[A])*(m[A+1]+m[S+1]),S=A;return T}return s.flatten=function(m){for(var x=m[0][0].length,_={vertices:[],holes:[],dimensions:x},L=0,T=0;T<m.length;T++){for(var A=0;A<m[T].length;A++)for(var S=0;S<x;S++)_.vertices.push(m[T][A][S]);T>0&&(L+=m[T-1].length,_.holes.push(L))}return _},he.exports}var Hf=Wf();const qf=Ia(Hf),de=Qo.CLOCKWISE,un=Qo.COUNTER_CLOCKWISE,bt={};function Yf(s){if(s=s&&s.positions||s,!Array.isArray(s)&&!ArrayBuffer.isView(s))throw new Error("invalid polygon")}function Xt(s){return"positions"in s?s.positions:s}function Se(s){return"holeIndices"in s?s.holeIndices:null}function Kf(s){return Array.isArray(s[0])}function Zf(s){return s.length>=1&&s[0].length>=2&&Number.isFinite(s[0][0])}function Xf(s){const t=s[0],e=s[s.length-1];return t[0]===e[0]&&t[1]===e[1]&&t[2]===e[2]}function Jf(s,t,e,i){for(let n=0;n<t;n++)if(s[e+n]!==s[i-t+n])return!1;return!0}function fn(s,t,e,i,n){let o=t;const r=e.length;for(let a=0;a<r;a++)for(let c=0;c<i;c++)s[o++]=e[a][c]||0;if(!Xf(e))for(let a=0;a<i;a++)s[o++]=e[0][a]||0;return bt.start=t,bt.end=o,bt.size=i,tr(s,n,bt),o}function hn(s,t,e,i,n=0,o,r){o=o||e.length;const a=o-n;if(a<=0)return t;let c=t;for(let l=0;l<a;l++)s[c++]=e[n+l];if(!Jf(e,i,n,o))for(let l=0;l<i;l++)s[c++]=e[n+l];return bt.start=t,bt.end=c,bt.size=i,tr(s,r,bt),c}function ar(s,t){Yf(s);const e=[],i=[];if("positions"in s){const{positions:n,holeIndices:o}=s;if(o){let r=0;for(let a=0;a<=o.length;a++)r=hn(e,r,n,t,o[a-1],o[a],a===0?de:un),i.push(r);return i.pop(),{positions:e,holeIndices:i}}s=n}if(!Kf(s))return hn(e,0,s,t,0,e.length,de),e;if(!Zf(s)){let n=0;for(const[o,r]of s.entries())n=fn(e,n,r,t,o===0?de:un),i.push(n);return i.pop(),{positions:e,holeIndices:i}}return fn(e,0,s,t,de),e}function ai(s,t,e){const i=s.length/3;let n=0;for(let o=0;o<i;o++){const r=(o+1)%i;n+=s[o*3+t]*s[r*3+e],n-=s[r*3+t]*s[o*3+e]}return Math.abs(n/2)}function dn(s,t,e,i){const n=s.length/3;for(let o=0;o<n;o++){const r=o*3,a=s[r+0],c=s[r+1],l=s[r+2];s[r+t]=a,s[r+e]=c,s[r+i]=l}}function Qf(s,t,e,i){let n=Se(s);n&&(n=n.map(a=>a/t));let o=Xt(s);const r=i&&t===3;if(e){const a=o.length;o=o.slice();const c=[];for(let l=0;l<a;l+=t){c[0]=o[l],c[1]=o[l+1],r&&(c[2]=o[l+2]);const u=e(c);o[l]=u[0],o[l+1]=u[1],r&&(o[l+2]=u[2])}}if(r){const a=ai(o,0,1),c=ai(o,0,2),l=ai(o,1,2);if(!a&&!c&&!l)return[];a>c&&a>l||(c>l?(e||(o=o.slice()),dn(o,0,2,1)):(e||(o=o.slice()),dn(o,2,0,1)))}return qf(o,n,t)}class th extends Zo{constructor(t){const{fp64:e,IndexType:i=Uint32Array}=t;super({...t,attributes:{positions:{size:3,type:e?Float64Array:Float32Array},vertexValid:{type:Uint16Array,size:1},indices:{type:i,size:1}}})}get(t){const{attributes:e}=this;return t==="indices"?e.indices&&e.indices.subarray(0,this.vertexCount):e[t]}updateGeometry(t){super.updateGeometry(t);const e=this.buffers.indices;if(e)this.vertexCount=(e.value||e).length;else if(this.data&&!this.getGeometry)throw new Error("missing indices buffer")}normalizeGeometry(t){if(this.normalize){const e=ar(t,this.positionSize);return this.opts.resolution?ir(Xt(e),Se(e),{size:this.positionSize,gridResolution:this.opts.resolution,edgeTypes:!0}):this.opts.wrapLongitude?zf(Xt(e),Se(e),{size:this.positionSize,maxLatitude:86,edgeTypes:!0}):e}return t}getGeometrySize(t){if(pn(t)){let e=0;for(const i of t)e+=this.getGeometrySize(i);return e}return Xt(t).length/this.positionSize}getGeometryFromBuffer(t){return this.normalize||!this.buffers.indices?super.getGeometryFromBuffer(t):null}updateGeometryAttributes(t,e){if(t&&pn(t))for(const i of t){const n=this.getGeometrySize(i);e.geometrySize=n,this.updateGeometryAttributes(i,e),e.vertexStart+=n,e.indexStart=this.indexStarts[e.geometryIndex+1]}else{const i=t;this._updateIndices(i,e),this._updatePositions(i,e),this._updateVertexValid(i,e)}}_updateIndices(t,{geometryIndex:e,vertexStart:i,indexStart:n}){const{attributes:o,indexStarts:r,typedArrayManager:a}=this;let c=o.indices;if(!c||!t)return;let l=n;const u=Qf(t,this.positionSize,this.opts.preproject,this.opts.full3d);c=a.allocate(c,n+u.length,{copy:!0});for(let f=0;f<u.length;f++)c[l++]=u[f]+i;r[e+1]=n+u.length,o.indices=c}_updatePositions(t,{vertexStart:e,geometrySize:i}){const{attributes:{positions:n},positionSize:o}=this;if(!n||!t)return;const r=Xt(t);for(let a=e,c=0;c<i;a++,c++){const l=r[c*o],u=r[c*o+1],f=o>2?r[c*o+2]:0;n[a*3]=l,n[a*3+1]=u,n[a*3+2]=f}}_updateVertexValid(t,{vertexStart:e,geometrySize:i}){const{positionSize:n}=this,o=this.attributes.vertexValid,r=t&&Se(t);if(t&&t.edgeTypes?o.set(t.edgeTypes,e):o.fill(1,e,e+i),r)for(let a=0;a<r.length;a++)o[e+r[a]/n-1]=0;o[e+i-1]=0}}function pn(s){return Array.isArray(s)&&s.length>0&&!Number.isFinite(s[0])}const gn=`layout(std140) uniform solidPolygonUniforms {
  bool extruded;
  bool isWireframe;
  float elevationScale;
} solidPolygon;
`,eh={name:"solidPolygon",vs:gn,fs:gn,uniformTypes:{extruded:"f32",isWireframe:"f32",elevationScale:"f32"}},cr=`in vec4 fillColors;
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
`,ih=`#version 300 es
#define SHADER_NAME solid-polygon-layer-vertex-shader
in vec3 vertexPositions;
in vec3 vertexPositions64Low;
in float elevations;
${cr}
void main(void) {
PolygonProps props;
props.positions = vertexPositions;
props.positions64Low = vertexPositions64Low;
props.elevations = elevations;
props.normal = vec3(0.0, 0.0, 1.0);
calculatePosition(props);
}
`,sh=`#version 300 es
#define SHADER_NAME solid-polygon-layer-vertex-shader-side
#define IS_SIDE_VERTEX
in vec2 positions;
in vec3 vertexPositions;
in vec3 nextVertexPositions;
in vec3 vertexPositions64Low;
in vec3 nextVertexPositions64Low;
in float elevations;
in float instanceVertexValid;
${cr}
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
`,nh=`#version 300 es
#define SHADER_NAME solid-polygon-layer-fragment-shader
precision highp float;
in vec4 vColor;
out vec4 fragColor;
void main(void) {
fragColor = vColor;
geometry.uv = vec2(0.);
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`,Ue=[0,0,0,255],oh={filled:!0,extruded:!1,wireframe:!1,_normalize:!0,_windingOrder:"CW",_full3d:!1,elevationScale:{type:"number",min:0,value:1},getPolygon:{type:"accessor",value:s=>s.polygon},getElevation:{type:"accessor",value:1e3},getFillColor:{type:"accessor",value:Ue},getLineColor:{type:"accessor",value:Ue},material:!0},pe={enter:(s,t)=>t.length?t.subarray(t.length-s.length):s};class qe extends mt{getShaders(t){return super.getShaders({vs:t==="top"?ih:sh,fs:nh,defines:{RING_WINDING_ORDER_CW:!this.props._normalize&&this.props._windingOrder==="CCW"?0:1},modules:[Ut,To,Dt,eh]})}get wrapLongitude(){return!1}getBounds(){return this.getAttributeManager()?.getBounds(["vertexPositions"])}initializeState(){const{viewport:t}=this.context;let{coordinateSystem:e}=this.props;const{_full3d:i}=this.props;t.isGeospatial&&e==="default"&&(e="lnglat");let n;e==="lnglat"&&(i?n=t.projectPosition.bind(t):n=t.projectFlat.bind(t)),this.setState({numInstances:0,polygonTesselator:new th({preproject:n,fp64:this.use64bitPositions(),IndexType:Uint32Array})});const o=this.getAttributeManager(),r=!0;o.remove(["instancePickingColors"]),o.add({indices:{size:1,isIndexed:!0,update:this.calculateIndices,noAlloc:r},vertexPositions:{size:3,type:"float64",stepMode:"dynamic",fp64:this.use64bitPositions(),transition:pe,accessor:"getPolygon",update:this.calculatePositions,noAlloc:r,shaderAttributes:{nextVertexPositions:{vertexOffset:1}}},instanceVertexValid:{size:1,type:"uint16",stepMode:"instance",update:this.calculateVertexValid,noAlloc:r},elevations:{size:1,stepMode:"dynamic",transition:pe,accessor:"getElevation"},fillColors:{size:this.props.colorFormat.length,type:"unorm8",stepMode:"dynamic",transition:pe,accessor:"getFillColor",defaultValue:Ue},lineColors:{size:this.props.colorFormat.length,type:"unorm8",stepMode:"dynamic",transition:pe,accessor:"getLineColor",defaultValue:Ue},pickingColors:{size:4,type:"uint8",stepMode:"dynamic",accessor:(a,{index:c,target:l})=>this.encodePickingColor(a&&a.__source?a.__source.index:c,l)}})}getPickingInfo(t){const e=super.getPickingInfo(t),{index:i}=e,n=this.props.data;return n[0]&&n[0].__source&&(e.object=n.find(o=>o.__source.index===i)),e}disablePickingIndex(t){const e=this.props.data;if(e[0]&&e[0].__source)for(let i=0;i<e.length;i++)e[i].__source.index===t&&this._disablePickingIndex(i);else super.disablePickingIndex(t)}draw({uniforms:t}){const{extruded:e,filled:i,wireframe:n,elevationScale:o}=this.props,{topModel:r,sideModel:a,wireframeModel:c,polygonTesselator:l}=this.state,u={extruded:!!e,elevationScale:o,isWireframe:!1};c&&n&&(c.setInstanceCount(l.instanceCount-1),c.shaderInputs.setProps({solidPolygon:{...u,isWireframe:!0}}),c.draw(this.context.renderPass)),a&&i&&(a.setInstanceCount(l.instanceCount-1),a.shaderInputs.setProps({solidPolygon:u}),a.draw(this.context.renderPass)),r&&i&&(r.setVertexCount(l.vertexCount),r.shaderInputs.setProps({solidPolygon:u}),r.draw(this.context.renderPass))}updateState(t){super.updateState(t),this.updateGeometry(t);const{props:e,oldProps:i,changeFlags:n}=t,o=this.getAttributeManager();(n.extensionsChanged||e.filled!==i.filled||e.extruded!==i.extruded)&&(this.state.models?.forEach(a=>a.destroy()),this.setState(this._getModels()),o.invalidateAll())}updateGeometry({props:t,oldProps:e,changeFlags:i}){if(i.dataChanged||i.updateTriggersChanged&&(i.updateTriggersChanged.all||i.updateTriggersChanged.getPolygon)){const{polygonTesselator:o}=this.state,r=t.data.attributes||{};o.updateGeometry({data:t.data,normalize:t._normalize,geometryBuffer:r.getPolygon,buffers:r,getGeometry:t.getPolygon,positionFormat:t.positionFormat,wrapLongitude:t.wrapLongitude,resolution:this.context.viewport.resolution,fp64:this.use64bitPositions(),dataChanged:i.dataChanged,full3d:t._full3d}),this.setState({numInstances:o.instanceCount,startIndices:o.vertexStarts}),i.dataChanged||this.getAttributeManager().invalidateAll()}}_getModels(){const{id:t,filled:e,extruded:i}=this.props;let n,o,r;if(e){const a=this.getShaders("top");a.defines.NON_INSTANCED_MODEL=1;const c=this.getAttributeManager().getBufferLayouts({isInstanced:!1});n=new rt(this.context.device,{...a,id:`${t}-top`,topology:"triangle-list",bufferLayout:c,isIndexed:!0,userData:{excludeAttributes:{instanceVertexValid:!0}}})}if(i){const a=this.getAttributeManager().getBufferLayouts({isInstanced:!0});o=new rt(this.context.device,{...this.getShaders("side"),id:`${t}-side`,bufferLayout:a,geometry:new pt({topology:"triangle-strip",attributes:{positions:{size:2,value:new Float32Array([1,0,0,0,1,1,0,1])}}}),isInstanced:!0,userData:{excludeAttributes:{indices:!0}}}),r=new rt(this.context.device,{...this.getShaders("side"),id:`${t}-wireframe`,bufferLayout:a,geometry:new pt({topology:"line-strip",attributes:{positions:{size:2,value:new Float32Array([1,0,0,0,0,1,1,1])}}}),isInstanced:!0,userData:{excludeAttributes:{indices:!0}}})}return{models:[o,r,n].filter(Boolean),topModel:n,sideModel:o,wireframeModel:r}}calculateIndices(t){const{polygonTesselator:e}=this.state;t.startIndices=e.indexStarts,t.value=e.get("indices")}calculatePositions(t){const{polygonTesselator:e}=this.state;t.startIndices=e.vertexStarts,t.value=e.get("positions")}calculateVertexValid(t){t.value=this.state.polygonTesselator.get("vertexValid")}}qe.defaultProps=oh;qe.layerName="SolidPolygonLayer";function lr({data:s,getIndex:t,dataRange:e,replace:i}){const{startRow:n=0,endRow:o=1/0}=e,r=s.length;let a=r,c=r;for(let d=0;d<r;d++){const h=t(s[d]);if(a>d&&h>=n&&(a=d),h>=o){c=d;break}}let l=a;const f=c-a!==i.length?s.slice(c):void 0;for(let d=0;d<i.length;d++)s[l++]=i[d];if(f){for(let d=0;d<f.length;d++)s[l++]=f[d];s.length=l}return{startRow:a,endRow:a+i.length}}const ur=[0,0,0,255],rh=[0,0,0,255],ah={stroked:!0,filled:!0,extruded:!1,elevationScale:1,wireframe:!1,_normalize:!0,_windingOrder:"CW",lineWidthUnits:"meters",lineWidthScale:1,lineWidthMinPixels:0,lineWidthMaxPixels:Number.MAX_SAFE_INTEGER,lineJointRounded:!1,lineMiterLimit:4,getPolygon:{type:"accessor",value:s=>s.polygon},getFillColor:{type:"accessor",value:rh},getLineColor:{type:"accessor",value:ur},getLineWidth:{type:"accessor",value:1},getElevation:{type:"accessor",value:1e3},material:!0};class Ji extends wt{initializeState(){this.state={paths:[],pathsDiff:null},this.props.getLineDashArray&&K.removed("getLineDashArray","PathStyleExtension")()}updateState({changeFlags:t}){const e=t.dataChanged||t.updateTriggersChanged&&(t.updateTriggersChanged.all||t.updateTriggersChanged.getPolygon);if(e&&Array.isArray(t.dataChanged)){const i=this.state.paths.slice(),n=t.dataChanged.map(o=>lr({data:i,getIndex:r=>r.__source.index,dataRange:o,replace:this._getPaths(o)}));this.setState({paths:i,pathsDiff:n})}else e&&this.setState({paths:this._getPaths(),pathsDiff:null})}_getPaths(t={}){const{data:e,getPolygon:i,positionFormat:n,_normalize:o}=this.props,r=[],a=n==="XY"?2:3,{startRow:c,endRow:l}=t,{iterable:u,objectInfo:f}=Mt(e,c,l);for(const d of u){f.index++;let h=i(d,f);o&&(h=ar(h,a));const{holeIndices:p}=h,g=h.positions||h;if(p)for(let y=0;y<=p.length;y++){const v=g.slice(p[y-1]||0,p[y]||g.length);r.push(this.getSubLayerRow({path:v},d,f.index))}else r.push(this.getSubLayerRow({path:g},d,f.index))}return r}renderLayers(){const{data:t,_dataDiff:e,stroked:i,filled:n,extruded:o,wireframe:r,_normalize:a,_windingOrder:c,elevationScale:l,transitions:u,positionFormat:f}=this.props,{lineWidthUnits:d,lineWidthScale:h,lineWidthMinPixels:p,lineWidthMaxPixels:g,lineJointRounded:y,lineMiterLimit:v,lineDashJustified:C}=this.props,{getFillColor:b,getLineColor:P,getLineWidth:w,getLineDashArray:M,getElevation:I,getPolygon:B,updateTriggers:O,material:F}=this.props,{paths:G,pathsDiff:U}=this.state,V=this.getSubLayerClass("fill",qe),tt=this.getSubLayerClass("stroke",St),q=this.shouldRenderSubLayer("fill",G)&&new V({_dataDiff:e,extruded:o,elevationScale:l,filled:n,wireframe:r,_normalize:a,_windingOrder:c,getElevation:I,getFillColor:b,getLineColor:o&&r?P:ur,material:F,transitions:u},this.getSubLayerProps({id:"fill",updateTriggers:O&&{getPolygon:O.getPolygon,getElevation:O.getElevation,getFillColor:O.getFillColor,lineColors:o&&r,getLineColor:O.getLineColor}}),{data:t,positionFormat:f,getPolygon:B}),m=!o&&i&&this.shouldRenderSubLayer("stroke",G)&&new tt({_dataDiff:U&&(()=>U),widthUnits:d,widthScale:h,widthMinPixels:p,widthMaxPixels:g,jointRounded:y,miterLimit:v,dashJustified:C,_pathType:"loop",transitions:u&&{getWidth:u.getLineWidth,getColor:u.getLineColor,getPath:u.getPolygon},getColor:this.getSubLayerAccessor(P),getWidth:this.getSubLayerAccessor(w),getDashArray:this.getSubLayerAccessor(M)},this.getSubLayerProps({id:"stroke",updateTriggers:O&&{getWidth:O.getLineWidth,getColor:O.getLineColor,getDashArray:O.getLineDashArray}}),{data:G,positionFormat:f,getPath:x=>x.path});return[!o&&q,m,o&&q]}}Ji.layerName="PolygonLayer";Ji.defaultProps=ah;function ch(s,t){if(!s)return null;const e="startIndices"in s?s.startIndices[t]:t,i=s.featureIds.value[e];return e!==-1?lh(s,i,e):null}function lh(s,t,e){const i={properties:{...s.properties[t]}};for(const n in s.numericProps)i.properties[n]=s.numericProps[n].value[e];return i}function uh(s,t){const e={points:null,lines:null,polygons:null};for(const i in e){const n=s[i].globalFeatureIds.value;e[i]=new Uint8ClampedArray(n.length*4);const o=[];for(let r=0;r<n.length;r++)t(n[r],o),e[i][r*4+0]=o[0],e[i][r*4+1]=o[1],e[i][r*4+2]=o[2],e[i][r*4+3]=255}return e}const mn=`layout(std140) uniform sdfUniforms {
  float gamma;
  bool enabled;
  float buffer;
  float outlineBuffer;
  vec4 outlineColor;
} sdf;
`,fh={name:"sdf",vs:mn,fs:mn,uniformTypes:{gamma:"f32",enabled:"f32",buffer:"f32",outlineBuffer:"f32",outlineColor:"vec4<f32>"}},Qt={none:0,start:1,center:2,end:3},hh=`layout(std140) uniform textUniforms {
  highp vec2 cutoffPixels;
  highp ivec2 align;
  highp float fontSize;
  bool flipY;
} text;

#define ALIGN_MODE_START ${Qt.start}
#define ALIGN_MODE_CENTER ${Qt.center}
#define ALIGN_MODE_END ${Qt.end}
`,fr={name:"text",vs:hh,getUniforms:({contentCutoffPixels:s=[0,0],contentAlignHorizontal:t="none",contentAlignVertical:e="none",fontSize:i,viewport:n})=>({cutoffPixels:s,align:[Qt[t],Qt[e]],fontSize:i,flipY:n?.flipY??!1}),uniformTypes:{cutoffPixels:"vec2<f32>",align:"vec2<i32>",fontSize:"f32",flipY:"f32"}},dh=`#version 300 es
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
`,ph=`#version 300 es
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
`,ci=192/256,gh={getIconOffsets:{type:"accessor",value:s=>s.offsets},getContentBox:{type:"accessor",value:[0,0,-1,-1]},fontSize:1,alphaCutoff:.001,smoothing:.1,outlineWidth:0,outlineColor:{type:"color",value:[0,0,0,255]},contentCutoffPixels:{type:"array",value:[0,0]},contentAlignHorizontal:"none",contentAlignVertical:"none"};class Qi extends He{getShaders(){const t=super.getShaders();return{...t,modules:[...t.modules,fr,fh],vs:dh,fs:ph}}initializeState(){super.initializeState();const t=this.getAttributeManager(),e=t.attributes.instanceIconDefs;e.settings.update=this.calculateInstanceIconDefs,t.addInstanced({instancePickingColors:{type:"uint8",size:4,accessor:(i,{index:n,target:o})=>this.encodePickingColor(n,o)},instanceClipRect:{size:4,accessor:"getContentBox",defaultValue:[0,0,-1,-1]}})}updateState(t){super.updateState(t);const{props:e,oldProps:i,changeFlags:n}=t,{outlineColor:o}=e;if(n.updateTriggersChanged&&(n.updateTriggersChanged.getIcon||n.updateTriggersChanged.getIconOffsets)&&this.getAttributeManager().invalidate("instanceIconDefs"),o!==i.outlineColor){const r=[o[0]/255,o[1]/255,o[2]/255,(o[3]??255)/255];this.setState({outlineColor:r})}!e.sdf&&e.outlineWidth&&K.warn(`${this.id}: fontSettings.sdf is required to render outline`)()}draw(t){const{sdf:e,smoothing:i,fontSize:n,outlineWidth:o,contentCutoffPixels:r,contentAlignHorizontal:a,contentAlignVertical:c}=this.props,{outlineColor:l}=this.state,u=o?Math.max(i,ci*(1-o)):-1,f=this.state.model,d={buffer:ci,outlineBuffer:u,gamma:i,enabled:!!e,outlineColor:l},h={contentCutoffPixels:r,contentAlignHorizontal:a,contentAlignVertical:c,fontSize:n,viewport:this.context.viewport};if(f.shaderInputs.setProps({sdf:d,text:h}),super.draw(t),e&&o){const{iconManager:p}=this.state;p.getTexture()&&(f.shaderInputs.setProps({sdf:{...d,outlineBuffer:ci}}),f.draw(this.context.renderPass))}}calculateInstanceIconDefs(t,{startRow:e,endRow:i}){const{data:n,getIcon:o,getIconOffsets:r}=this.props;let a=t.getVertexOffset(e);const c=t.value,{iterable:l,objectInfo:u}=Mt(n,e,i);for(const f of l){u.index++;const d=o(f,u),h=r(f,u);if(d){let p=0;for(const g of Array.from(d)){const y=super.getInstanceIconDef(g);y[0]=h[p*2],y[1]+=h[p*2+1],y[6]=1,c.set(y,a),a+=t.size,p++}}}}}Qi.defaultProps=gh;Qi.layerName="MultiIconLayer";const te=1e20,ts=new Float64Array(256);for(let s=0;s<256;s++){const t=.5-Math.pow(s/255,.45454545454545453);ts[s]=t*Math.abs(t)}ts[255]=-te;class mh{constructor({fontSize:t=24,buffer:e=3,radius:i=8,cutoff:n=.25,fontFamily:o="sans-serif",fontWeight:r="normal",fontStyle:a="normal",lang:c=null}={}){this.buffer=e,this.radius=i,this.cutoff=n,this.lang=c;const l=this.size=t+e*4,u=this._createCanvas(l),f=this.ctx=u.getContext("2d",{willReadFrequently:!0});f.font=`${a} ${r} ${t}px ${o}`,f.textBaseline="alphabetic",f.textAlign="left",f.fillStyle="black",this.gridOuter=new Float64Array(l*l),this.gridInner=new Float64Array(l*l),this.f=new Float64Array(l),this.z=new Float64Array(l+1),this.v=new Uint16Array(l)}_createCanvas(t){if(typeof OffscreenCanvas<"u")return new OffscreenCanvas(t,t);const e=document.createElement("canvas");return e.width=e.height=t,e}draw(t){const{width:e,actualBoundingBoxAscent:i,actualBoundingBoxDescent:n,actualBoundingBoxLeft:o,actualBoundingBoxRight:r}=this.ctx.measureText(t),a=Math.ceil(i),c=Math.floor(-o),l=Math.max(0,Math.min(this.size-this.buffer,Math.ceil(r)-c)),u=Math.max(0,Math.min(this.size-this.buffer,a+Math.ceil(n))),f=l+2*this.buffer,d=u+2*this.buffer,h=Math.max(f*d,0),p=new Uint8ClampedArray(h),g={data:p,width:f,height:d,glyphWidth:l,glyphHeight:u,glyphTop:a,glyphLeft:c,glyphAdvance:e};if(l===0||u===0)return g;const{ctx:y,buffer:v,gridInner:C,gridOuter:b}=this;this.lang&&(y.lang=this.lang),y.clearRect(v,v,l,u),y.fillText(t,v-c,v+a);const P=y.getImageData(v,v,l,u);b.fill(te,0,h),C.fill(0,0,h);let w=3;for(let O=0;O<u;O++){let F=(O+v)*f+v;for(let G=0;G<l;G++,w+=4,F++){const U=P.data[w];if(U===0)continue;const V=ts[U];b[F]=Math.max(0,V),C[F]=Math.max(0,-V)}}yn(b,0,0,f,d,f,this.f,this.v,this.z);const M=Math.min(v,1);yn(C,v-M,v-M,l+2*M,u+2*M,f,this.f,this.v,this.z);const I=255/this.radius,B=255*(1-this.cutoff);for(let O=0;O<h;O++){const F=Math.sqrt(b[O])-Math.sqrt(C[O]);p[O]=Math.round(B-I*F)}return g}}function yn(s,t,e,i,n,o,r,a,c){for(let l=t;l<t+i;l++)_n(s,e*o+l,o,n,r,a,c);for(let l=e;l<e+n;l++)_n(s,l*o+t,1,i,r,a,c)}function _n(s,t,e,i,n,o,r){o[0]=0,r[0]=-te,r[1]=te,n[0]=s[t];for(let a=1,c=0,l=0;a<i;a++){n[a]=s[t+a*e];const u=a*a;do{const f=o[c];l=(n[a]-n[f]+u-f*f)/(a-f)/2}while(l<=r[c]&&--c>-1);c++,o[c]=a,r[c]=l,r[c+1]=te}for(let a=0,c=0;a<i;a++){for(;r[c+1]<a;)c++;const l=o[c],u=a-l;s[t+a*e]=n[l]+u*u}}const yh=32,_h=[];function xh(s){return Math.pow(2,Math.ceil(Math.log2(s)))}function vh({characterSet:s,measureText:t,buffer:e,maxCanvasWidth:i,mapping:n={},xOffset:o=0,yOffsetMin:r=0,yOffsetMax:a=0}){let c=o,l=r,u=a;for(const f of s)if(!n[f]){const{advance:d,width:h,ascent:p,descent:g}=t(f),y=p+g;c+h+e*2>i&&(c=0,l=u),n[f]={x:c+e,y:l+e,width:h,height:y,advance:d,anchorX:h/2,anchorY:p},c+=h+e*2,u=Math.max(u,l+y+e*2)}return{mapping:n,xOffset:c,yOffsetMin:l,yOffsetMax:u,canvasHeight:xh(u)}}function hr(s,t,e,i){let n=0;for(let o=t;o<e;o++){const r=s[o];n+=i[r]?.advance||0}return n}function dr(s,t,e,i,n,o){let r=t,a=0;for(let c=t;c<e;c++){const l=hr(s,c,c+1,n);a+l>i&&(r<c&&o.push(c),r=c,a=0),a+=l}return a}function bh(s,t,e,i,n,o){let r=t,a=t,c=t,l=0;for(let u=t;u<e;u++)if((s[u]===" "||s[u+1]===" "||u+1===e)&&(c=u+1),c>a){let f=hr(s,a,c,n);l+f>i&&(r<a&&(o.push(a),r=a,l=0),f>i&&(f=dr(s,a,c,i,n,o),r=o[o.length-1])),a=c,l+=f}return l}function Ch(s,t,e,i,n=0,o){o===void 0&&(o=s.length);const r=[];return t==="break-all"?dr(s,n,o,e,i,r):bh(s,n,o,e,i,r),r}function Ph(s,t,e,i,n,o){let r=0,a=0;for(let c=t;c<e;c++){const l=s[c],u=i[l];u&&(a=Math.max(a,u.height))}for(let c=t;c<e;c++){const l=s[c],u=i[l];u?(n[c]=r+u.anchorX,r+=u.advance):(K.warn(`Missing character: ${l} (${l.codePointAt(0)})`)(),n[c]=r,r+=yh)}o[0]=r,o[1]=a}function wh(s,t,e,i,n,o){const r=Array.from(s),a=r.length,c=new Array(a),l=new Array(a),u=new Array(a),f=(i==="break-word"||i==="break-all")&&isFinite(n)&&n>0,d=[0,0],h=[0,0];let p=0,g=t+e/2,y=0,v=0;for(let C=0;C<=a;C++){const b=r[C];if((b===`
`||C===a)&&(v=C),v>y){const P=f?Ch(r,i,n,o,y,v):_h;for(let w=0;w<=P.length;w++){const M=w===0?y:P[w-1],I=w<P.length?P[w]:v;Ph(r,M,I,o,c,h);for(let B=M;B<I;B++)l[B]=g,u[B]=h[0];p++,g+=e,d[0]=Math.max(d[0],h[0])}y=v}b===`
`&&(c[y]=0,l[y]=0,u[y]=0,y++)}return d[1]=p*e,{x:c,y:l,rowWidth:u,size:d}}function Lh({value:s,length:t,stride:e,offset:i,startIndices:n,characterSet:o}){const r=s.BYTES_PER_ELEMENT,a=e?e/r:1,c=i?i/r:0,l=n[t]||Math.ceil((s.length-c)/a),u=o&&new Set,f=new Array(t);let d=s;if(a>1||c>0){const h=s.constructor;d=new h(l);for(let p=0;p<l;p++)d[p]=s[p*a+c]}for(let h=0;h<t;h++){const p=n[h],g=n[h+1]||l,y=d.subarray(p,g);f[h]=String.fromCodePoint.apply(null,y),u&&y.forEach(u.add,u)}if(u)for(const h of u)o.add(String.fromCodePoint(h));return{texts:f,characterCount:l}}class pr{constructor(t=5){this._cache={},this._order=[],this.limit=t}get(t){const e=this._cache[t];return e&&(this._deleteOrder(t),this._appendOrder(t)),e}set(t,e){this._cache[t]?(this.delete(t),this._cache[t]=e,this._appendOrder(t)):(Object.keys(this._cache).length===this.limit&&this.delete(this._order[0]),this._cache[t]=e,this._appendOrder(t))}delete(t){this._cache[t]&&(delete this._cache[t],this._deleteOrder(t))}_deleteOrder(t){const e=this._order.indexOf(t);e>=0&&this._order.splice(e,1)}_appendOrder(t){this._order.push(t)}}function Th(){const s=[];for(let t=32;t<128;t++)s.push(String.fromCharCode(t));return s}const Bt={fontFamily:"Monaco, monospace",fontWeight:"normal",characterSet:Th(),fontSize:64,buffer:4,sdf:!1,cutoff:.25,radius:12,smoothing:.1},xn=1024,vn=.9,bn=.3,gr=3;let De=new pr(gr);function Ah(s,t){let e;typeof t=="string"?e=new Set(Array.from(t)):e=new Set(t);const i=De.get(s);if(!i)return e;for(const n in i.mapping)e.has(n)&&e.delete(n);return e}function Sh(s,t){for(let e=0;e<s.length;e++)t.data[4*e+3]=s[e]}function Cn(s,t,e,i){s.font=`${i} ${e}px ${t}`,s.fillStyle="#000",s.textBaseline="alphabetic",s.textAlign="left"}function Mh(s,t,e){if(e===void 0){const n=s.measureText("A");return n.fontBoundingBoxAscent?{advance:0,width:0,ascent:Math.ceil(n.fontBoundingBoxAscent),descent:Math.ceil(n.fontBoundingBoxDescent)}:{advance:0,width:0,ascent:t*vn,descent:t*bn}}const i=s.measureText(e);return i.actualBoundingBoxAscent?{advance:i.width,width:Math.ceil(i.actualBoundingBoxRight-i.actualBoundingBoxLeft),ascent:Math.ceil(i.actualBoundingBoxAscent),descent:Math.ceil(i.actualBoundingBoxDescent)}:{advance:i.width,width:i.width,ascent:t*vn,descent:t*bn}}function Eh(s){K.assert(Number.isFinite(s)&&s>=gr,"Invalid cache limit"),De=new pr(s)}class Ih{constructor(){this.props={...Bt}}get atlas(){return this._atlas}get mapping(){return this._atlas&&this._atlas.mapping}setProps(t={}){Object.assign(this.props,t),t._getFontRenderer&&(this._getFontRenderer=t._getFontRenderer),this._key=this._getKey();const e=Ah(this._key,this.props.characterSet),i=De.get(this._key);if(i&&e.size===0){this._atlas!==i&&(this._atlas=i);return}const n=this._generateFontAtlas(e,i);this._atlas=n,De.set(this._key,n)}_generateFontAtlas(t,e){const{fontFamily:i,fontWeight:n,fontSize:o,buffer:r,sdf:a,radius:c,cutoff:l}=this.props;let u=e&&e.data;u||(u=document.createElement("canvas"),u.width=xn);const f=u.getContext("2d",{willReadFrequently:!0});Cn(f,i,o,n);const d=P=>Mh(f,o,P);let h;this._getFontRenderer?h=this._getFontRenderer(this.props):a&&(h={measure:d,draw:Oh(this.props)});const{mapping:p,canvasHeight:g,xOffset:y,yOffsetMin:v,yOffsetMax:C}=vh({measureText:P=>h?h.measure(P):d(P),buffer:r,characterSet:t,maxCanvasWidth:xn,...e&&{mapping:e.mapping,xOffset:e.xOffset,yOffsetMin:e.yOffsetMin,yOffsetMax:e.yOffsetMax}});if(u.height!==g){const P=u.height>0?f.getImageData(0,0,u.width,u.height):null;u.height=g,P&&f.putImageData(P,0,0)}if(Cn(f,i,o,n),h)for(const P of t){const w=p[P],{data:M,left:I=0,top:B=0}=h.draw(P),O=w.x-I,F=w.y-B,G=Math.max(0,Math.round(O)),U=Math.max(0,Math.round(F)),V=Math.min(M.width,u.width-G),tt=Math.min(M.height,u.height-U);f.putImageData(M,G,U,0,0,V,tt),w.x+=G-O,w.y+=U-F}else for(const P of t){const w=p[P];f.fillText(P,w.x,w.y+w.anchorY)}const b=h?h.measure():d();return{baselineOffset:(b.ascent-b.descent)/2,xOffset:y,yOffsetMin:v,yOffsetMax:C,mapping:p,data:u,width:u.width,height:u.height}}_getKey(){const{fontFamily:t,fontWeight:e,fontSize:i,buffer:n,sdf:o,radius:r,cutoff:a}=this.props;return o?`${t} ${e} ${i} ${n} ${r} ${a}`:`${t} ${e} ${i} ${n}`}}function Oh({fontSize:s,buffer:t,radius:e,cutoff:i,fontFamily:n,fontWeight:o}){const r=new mh({fontSize:s,buffer:t,radius:e,cutoff:i,fontFamily:n,fontWeight:`${o}`});return a=>{const{data:c,width:l,height:u}=r.draw(a),f=new ImageData(l,u);return Sh(c,f),{data:f,left:t,top:t}}}const Pn=`layout(std140) uniform textBackgroundUniforms {
  bool billboard;
  float sizeScale;
  float sizeMinPixels;
  float sizeMaxPixels;
  vec4 borderRadius;
  vec4 padding;
  highp int sizeUnits;
  bool stroked;
} textBackground;
`,Rh={name:"textBackground",vs:Pn,fs:Pn,uniformTypes:{billboard:"f32",sizeScale:"f32",sizeMinPixels:"f32",sizeMaxPixels:"f32",borderRadius:"vec4<f32>",padding:"vec4<f32>",sizeUnits:"i32",stroked:"f32"}},zh=`#version 300 es
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
`,Bh=`#version 300 es
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
`,Fh={billboard:!0,sizeScale:1,sizeUnits:"pixels",sizeMinPixels:0,sizeMaxPixels:Number.MAX_SAFE_INTEGER,fontSize:1,borderRadius:{type:"object",value:0},padding:{type:"array",value:[0,0,0,0]},getPosition:{type:"accessor",value:s=>s.position},getSize:{type:"accessor",value:1},getAngle:{type:"accessor",value:0},getPixelOffset:{type:"accessor",value:[0,0]},getBoundingRect:{type:"accessor",value:[0,0,0,0]},getClipRect:{type:"accessor",value:[0,0,-1,-1]},getFillColor:{type:"accessor",value:[0,0,0,255]},getLineColor:{type:"accessor",value:[0,0,0,255]},getLineWidth:{type:"accessor",value:1}};class es extends mt{getShaders(){return super.getShaders({vs:zh,fs:Bh,modules:[Ut,Dt,Rh,fr]})}initializeState(){this.getAttributeManager().addInstanced({instancePositions:{size:3,type:"float64",fp64:this.use64bitPositions(),transition:!0,accessor:"getPosition"},instanceSizes:{size:1,transition:!0,accessor:"getSize",defaultValue:1},instanceAngles:{size:1,transition:!0,accessor:"getAngle"},instanceRects:{size:4,accessor:"getBoundingRect"},instanceClipRect:{size:4,accessor:"getClipRect",defaultValue:[0,0,-1,-1]},instancePixelOffsets:{size:2,transition:!0,accessor:"getPixelOffset"},instanceFillColors:{size:4,transition:!0,type:"unorm8",accessor:"getFillColor",defaultValue:[0,0,0,255]},instanceLineColors:{size:4,transition:!0,type:"unorm8",accessor:"getLineColor",defaultValue:[0,0,0,255]},instanceLineWidths:{size:1,transition:!0,accessor:"getLineWidth",defaultValue:1}})}updateState(t){super.updateState(t);const{changeFlags:e}=t;e.extensionsChanged&&(this.state.model?.destroy(),this.state.model=this._getModel(),this.getAttributeManager().invalidateAll())}draw({uniforms:t}){const{billboard:e,sizeScale:i,sizeUnits:n,sizeMinPixels:o,sizeMaxPixels:r,getLineWidth:a,fontSize:c}=this.props;let{padding:l,borderRadius:u}=this.props;l.length<4&&(l=[l[0],l[1],l[0],l[1]]),Array.isArray(u)||(u=[u,u,u,u]);const f=this.state.model,d={billboard:e,stroked:!!a,borderRadius:u,padding:l,sizeUnits:ee[n],sizeScale:i,sizeMinPixels:o,sizeMaxPixels:r},h={fontSize:c,viewport:this.context.viewport};f.shaderInputs.setProps({textBackground:d,text:h}),f.draw(this.context.renderPass)}_getModel(){const t=[0,0,1,0,0,1,1,1];return new rt(this.context.device,{...this.getShaders(),id:this.props.id,bufferLayout:this.getAttributeManager().getBufferLayouts(),geometry:new pt({topology:"triangle-strip",vertexCount:4,attributes:{positions:{size:2,value:new Float32Array(t)}}}),isInstanced:!0})}}es.defaultProps=Fh;es.layerName="TextBackgroundLayer";const wn={start:1,middle:0,end:-1},Ln={top:1,center:0,bottom:-1},li=[0,0,0,255],Nh=1,kh={billboard:!0,sizeScale:1,sizeUnits:"pixels",sizeMinPixels:0,sizeMaxPixels:Number.MAX_SAFE_INTEGER,background:!1,getBackgroundColor:{type:"accessor",value:[255,255,255,255]},getBorderColor:{type:"accessor",value:li},getBorderWidth:{type:"accessor",value:0},backgroundBorderRadius:{type:"object",value:0},backgroundPadding:{type:"array",value:[0,0,0,0]},characterSet:{type:"object",value:Bt.characterSet},fontFamily:Bt.fontFamily,fontWeight:Bt.fontWeight,lineHeight:Nh,outlineWidth:{type:"number",value:0,min:0},outlineColor:{type:"color",value:li},fontSettings:{type:"object",value:{},compare:1},wordBreak:"break-word",maxWidth:{type:"number",value:-1},contentCutoffPixels:{type:"array",value:[0,0]},contentAlignHorizontal:"none",contentAlignVertical:"none",getText:{type:"accessor",value:s=>s.text},getPosition:{type:"accessor",value:s=>s.position},getColor:{type:"accessor",value:li},getSize:{type:"accessor",value:32},getAngle:{type:"accessor",value:0},getTextAnchor:{type:"accessor",value:"middle"},getAlignmentBaseline:{type:"accessor",value:"center"},getPixelOffset:{type:"accessor",value:[0,0]},getContentBox:{type:"accessor",value:[0,0,-1,-1]},backgroundColor:{deprecatedFor:["background","getBackgroundColor"]}};class Nt extends wt{constructor(){super(...arguments),this.getBoundingRect=(t,e)=>{const{size:[i,n]}=this.transformParagraph(t,e),{getTextAnchor:o,getAlignmentBaseline:r}=this.props,a=wn[typeof o=="function"?o(t,e):o],c=Ln[typeof r=="function"?r(t,e):r];return[(a-1)*i/2,(c-1)*n/2,i,n]},this.getIconOffsets=(t,e)=>{const{getTextAnchor:i,getAlignmentBaseline:n}=this.props,{x:o,y:r,rowWidth:a,size:[,c]}=this.transformParagraph(t,e),l=wn[typeof i=="function"?i(t,e):i],u=Ln[typeof n=="function"?n(t,e):n],f=o.length,d=new Array(f*2);let h=0;for(let p=0;p<f;p++)d[h++]=(l-1)*a[p]/2+o[p],d[h++]=(u-1)*c/2+r[p];return d}}initializeState(){this.state={styleVersion:0,fontAtlasManager:new Ih},this.props.maxWidth>0&&K.once(1,"v8.9 breaking change: TextLayer maxWidth is now relative to text size")()}updateState(t){const{props:e,oldProps:i,changeFlags:n}=t;(n.dataChanged||n.updateTriggersChanged&&(n.updateTriggersChanged.all||n.updateTriggersChanged.getText))&&this._updateText(),(this._updateFontAtlas()||e.lineHeight!==i.lineHeight||e.wordBreak!==i.wordBreak||e.maxWidth!==i.maxWidth)&&this.setState({styleVersion:this.state.styleVersion+1})}getPickingInfo({info:t}){return t.object=t.index>=0?this.props.data[t.index]:null,t}_updateFontAtlas(){const{fontSettings:t,fontFamily:e,fontWeight:i,_getFontRenderer:n}=this.props,{fontAtlasManager:o,characterSet:r}=this.state,a={...t,characterSet:r,fontFamily:e,fontWeight:i,_getFontRenderer:n};if(!o.mapping)return o.setProps(a),!0;for(const c in a)if(a[c]!==o.props[c])return o.setProps(a),!0;return!1}_updateText(){const{data:t,characterSet:e}=this.props,i=t.attributes?.getText;let{getText:n}=this.props,o=t.startIndices,r;const a=e==="auto"&&new Set;if(i&&o){const{texts:c,characterCount:l}=Lh({...ArrayBuffer.isView(i)?{value:i}:i,length:t.length,startIndices:o,characterSet:a});r=l,n=(u,{index:f})=>c[f]}else{const{iterable:c,objectInfo:l}=Mt(t);o=[0],r=0;for(const u of c){l.index++;const f=Array.from(n(u,l)||"");a&&f.forEach(a.add,a),r+=f.length,o.push(r)}}this.setState({getText:n,startIndices:o,numInstances:r,characterSet:a||e})}transformParagraph(t,e){const{fontAtlasManager:i}=this.state,n=i.mapping,{baselineOffset:o}=i.atlas,{fontSize:r}=i.props,a=this.state.getText,{wordBreak:c,lineHeight:l,maxWidth:u}=this.props,f=a(t,e)||"";return wh(f,o,l*r,c,u*r,n)}renderLayers(){const{startIndices:t,numInstances:e,getText:i,fontAtlasManager:{atlas:n,mapping:o},styleVersion:r}=this.state,{data:a,_dataDiff:c,getPosition:l,getColor:u,getSize:f,getAngle:d,getPixelOffset:h,getBackgroundColor:p,getBorderColor:g,getBorderWidth:y,getContentBox:v,backgroundBorderRadius:C,backgroundPadding:b,background:P,billboard:w,fontSettings:M,outlineWidth:I,outlineColor:B,sizeScale:O,sizeUnits:F,sizeMinPixels:G,sizeMaxPixels:U,contentCutoffPixels:V,contentAlignHorizontal:tt,contentAlignVertical:q,transitions:m,updateTriggers:x}=this.props,_=this.getSubLayerClass("characters",Qi),L=this.getSubLayerClass("background",es),{fontSize:T}=this.state.fontAtlasManager.props;return[P&&new L({getFillColor:p,getLineColor:g,getLineWidth:y,borderRadius:C,padding:b,getPosition:l,getSize:f,getAngle:d,getPixelOffset:h,getClipRect:v,billboard:w,sizeScale:O,sizeUnits:F,sizeMinPixels:G,sizeMaxPixels:U,fontSize:T,transitions:m&&{getPosition:m.getPosition,getAngle:m.getAngle,getSize:m.getSize,getFillColor:m.getBackgroundColor,getLineColor:m.getBorderColor,getLineWidth:m.getBorderWidth,getPixelOffset:m.getPixelOffset}},this.getSubLayerProps({id:"background",updateTriggers:{getPosition:x.getPosition,getAngle:x.getAngle,getSize:x.getSize,getFillColor:x.getBackgroundColor,getLineColor:x.getBorderColor,getLineWidth:x.getBorderWidth,getPixelOffset:x.getPixelOffset,getBoundingRect:{getText:x.getText,getTextAnchor:x.getTextAnchor,getAlignmentBaseline:x.getAlignmentBaseline,styleVersion:r}}}),{data:a.attributes&&a.attributes.background?{length:a.length,attributes:a.attributes.background}:a,_dataDiff:c,autoHighlight:!1,getBoundingRect:this.getBoundingRect}),new _({sdf:M.sdf,smoothing:Number.isFinite(M.smoothing)?M.smoothing:Bt.smoothing,outlineWidth:I/(M.radius||Bt.radius),outlineColor:B,iconAtlas:n,iconMapping:o,getPosition:l,getColor:u,getSize:f,getAngle:d,getPixelOffset:h,getContentBox:v,billboard:w,sizeScale:O,sizeUnits:F,sizeMinPixels:G,sizeMaxPixels:U,fontSize:T,contentCutoffPixels:V,contentAlignHorizontal:tt,contentAlignVertical:q,transitions:m&&{getPosition:m.getPosition,getAngle:m.getAngle,getColor:m.getColor,getSize:m.getSize,getPixelOffset:m.getPixelOffset,getContentBox:m.getContentBox}},this.getSubLayerProps({id:"characters",updateTriggers:{all:x.getText,getPosition:x.getPosition,getAngle:x.getAngle,getColor:x.getColor,getSize:x.getSize,getPixelOffset:x.getPixelOffset,getContentBox:x.getContentBox,getIconOffsets:{getTextAnchor:x.getTextAnchor,getAlignmentBaseline:x.getAlignmentBaseline,styleVersion:r}}}),{data:a,_dataDiff:c,startIndices:t,numInstances:e,getIconOffsets:this.getIconOffsets,getIcon:i})]}static set fontAtlasCacheLimit(t){Eh(t)}}Nt.defaultProps=kh;Nt.layerName="TextLayer";const Me={circle:{type:Xi,props:{filled:"filled",stroked:"stroked",lineWidthMaxPixels:"lineWidthMaxPixels",lineWidthMinPixels:"lineWidthMinPixels",lineWidthScale:"lineWidthScale",lineWidthUnits:"lineWidthUnits",pointRadiusMaxPixels:"radiusMaxPixels",pointRadiusMinPixels:"radiusMinPixels",pointRadiusScale:"radiusScale",pointRadiusUnits:"radiusUnits",pointAntialiasing:"antialiasing",pointBillboard:"billboard",getFillColor:"getFillColor",getLineColor:"getLineColor",getLineWidth:"getLineWidth",getPointRadius:"getRadius"}},icon:{type:He,props:{iconAtlas:"iconAtlas",iconMapping:"iconMapping",iconSizeMaxPixels:"sizeMaxPixels",iconSizeMinPixels:"sizeMinPixels",iconSizeScale:"sizeScale",iconSizeUnits:"sizeUnits",iconAlphaCutoff:"alphaCutoff",iconBillboard:"billboard",getIcon:"getIcon",getIconAngle:"getAngle",getIconColor:"getColor",getIconPixelOffset:"getPixelOffset",getIconSize:"getSize"}},text:{type:Nt,props:{textSizeMaxPixels:"sizeMaxPixels",textSizeMinPixels:"sizeMinPixels",textSizeScale:"sizeScale",textSizeUnits:"sizeUnits",textBackground:"background",textBackgroundPadding:"backgroundPadding",textFontFamily:"fontFamily",textFontWeight:"fontWeight",textLineHeight:"lineHeight",textMaxWidth:"maxWidth",textOutlineColor:"outlineColor",textOutlineWidth:"outlineWidth",textWordBreak:"wordBreak",textCharacterSet:"characterSet",textBillboard:"billboard",textFontSettings:"fontSettings",getText:"getText",getTextAngle:"getAngle",getTextColor:"getColor",getTextPixelOffset:"getPixelOffset",getTextSize:"getSize",getTextAnchor:"getTextAnchor",getTextAlignmentBaseline:"getAlignmentBaseline",getTextBackgroundColor:"getBackgroundColor",getTextBorderColor:"getBorderColor",getTextBorderWidth:"getBorderWidth"}}},Ee={type:St,props:{lineWidthUnits:"widthUnits",lineWidthScale:"widthScale",lineWidthMinPixels:"widthMinPixels",lineWidthMaxPixels:"widthMaxPixels",lineJointRounded:"jointRounded",lineCapRounded:"capRounded",lineMiterLimit:"miterLimit",lineBillboard:"billboard",getLineColor:"getColor",getLineWidth:"getWidth"}},Bi={type:qe,props:{extruded:"extruded",filled:"filled",wireframe:"wireframe",elevationScale:"elevationScale",material:"material",_full3d:"_full3d",getElevation:"getElevation",getFillColor:"getFillColor",getLineColor:"getLineColor"}};function qt({type:s,props:t}){const e={};for(const i in t)e[i]=s.defaultProps[t[i]];return e}function ui(s,t){const{transitions:e,updateTriggers:i}=s.props,n={updateTriggers:{},transitions:e&&{getPosition:e.geometry}};for(const o in t){const r=t[o];let a=s.props[o];o.startsWith("get")&&(a=s.getSubLayerAccessor(a),n.updateTriggers[r]=i[o],e&&(n.transitions[r]=e[o])),n[r]=a}return n}function Uh(s){if(Array.isArray(s))return s;switch(K.assert(s.type,"GeoJSON does not have type"),s.type){case"Feature":return[s];case"FeatureCollection":return K.assert(Array.isArray(s.features),"GeoJSON does not have features array"),s.features;default:return[{geometry:s}]}}function Tn(s,t,e={}){const i={pointFeatures:[],lineFeatures:[],polygonFeatures:[],polygonOutlineFeatures:[]},{startRow:n=0,endRow:o=s.length}=e;for(let r=n;r<o;r++){const a=s[r],{geometry:c}=a;if(c)if(c.type==="GeometryCollection"){K.assert(Array.isArray(c.geometries),"GeoJSON does not have geometries array");const{geometries:l}=c;for(let u=0;u<l.length;u++){const f=l[u];An(f,i,t,a,r)}}else An(c,i,t,a,r)}return i}function An(s,t,e,i,n){const{type:o,coordinates:r}=s,{pointFeatures:a,lineFeatures:c,polygonFeatures:l,polygonOutlineFeatures:u}=t;if(!$h(o,r)){K.warn(`${o} coordinates are malformed`)();return}switch(o){case"Point":a.push(e({geometry:s},i,n));break;case"MultiPoint":r.forEach(f=>{a.push(e({geometry:{type:"Point",coordinates:f}},i,n))});break;case"LineString":c.push(e({geometry:s},i,n));break;case"MultiLineString":r.forEach(f=>{c.push(e({geometry:{type:"LineString",coordinates:f}},i,n))});break;case"Polygon":l.push(e({geometry:s},i,n)),r.forEach(f=>{u.push(e({geometry:{type:"LineString",coordinates:f}},i,n))});break;case"MultiPolygon":r.forEach(f=>{l.push(e({geometry:{type:"Polygon",coordinates:f}},i,n)),f.forEach(d=>{u.push(e({geometry:{type:"LineString",coordinates:d}},i,n))})});break}}const Dh={Point:1,MultiPoint:2,LineString:2,MultiLineString:3,Polygon:3,MultiPolygon:4};function $h(s,t){let e=Dh[s];for(K.assert(e,`Unknown GeoJSON type ${s}`);t&&--e>0;)t=t[0];return t&&Number.isFinite(t[0])}function mr(){return{points:{},lines:{},polygons:{},polygonsOutline:{}}}function ge(s){return s.geometry.coordinates}function jh(s,t){const e=mr(),{pointFeatures:i,lineFeatures:n,polygonFeatures:o,polygonOutlineFeatures:r}=s;return e.points.data=i,e.points._dataDiff=t.pointFeatures&&(()=>t.pointFeatures),e.points.getPosition=ge,e.lines.data=n,e.lines._dataDiff=t.lineFeatures&&(()=>t.lineFeatures),e.lines.getPath=ge,e.polygons.data=o,e.polygons._dataDiff=t.polygonFeatures&&(()=>t.polygonFeatures),e.polygons.getPolygon=ge,e.polygonsOutline.data=r,e.polygonsOutline._dataDiff=t.polygonOutlineFeatures&&(()=>t.polygonOutlineFeatures),e.polygonsOutline.getPath=ge,e}function Gh(s,t){const e=mr(),{points:i,lines:n,polygons:o}=s,r=uh(s,t);e.points.data={length:i.positions.value.length/i.positions.size,attributes:{...i.attributes,getPosition:i.positions,instancePickingColors:{size:4,value:r.points}},properties:i.properties,numericProps:i.numericProps,featureIds:i.featureIds},e.lines.data={length:n.pathIndices.value.length-1,startIndices:n.pathIndices.value,attributes:{...n.attributes,getPath:n.positions,instancePickingColors:{size:4,value:r.lines}},properties:n.properties,numericProps:n.numericProps,featureIds:n.featureIds},e.lines._pathType="open";const a=o.positions.value.length/o.positions.size,c=Array(a).fill(1);for(const l of o.primitivePolygonIndices.value)c[l-1]=0;return e.polygons.data={length:o.polygonIndices.value.length-1,startIndices:o.polygonIndices.value,attributes:{...o.attributes,getPolygon:o.positions,instanceVertexValid:{size:1,value:new Uint16Array(c)},pickingColors:{size:4,value:r.polygons}},properties:o.properties,numericProps:o.numericProps,featureIds:o.featureIds},e.polygons._normalize=!1,o.triangles&&(e.polygons.data.attributes.indices=o.triangles.value),e.polygonsOutline.data={length:o.primitivePolygonIndices.value.length-1,startIndices:o.primitivePolygonIndices.value,attributes:{...o.attributes,getPath:o.positions,instancePickingColors:{size:4,value:r.polygons}},properties:o.properties,numericProps:o.numericProps,featureIds:o.featureIds},e.polygonsOutline._pathType="open",e}const Vh=["points","linestrings","polygons"],Wh={...qt(Me.circle),...qt(Me.icon),...qt(Me.text),...qt(Ee),...qt(Bi),stroked:!0,filled:!0,extruded:!1,wireframe:!1,_full3d:!1,iconAtlas:{type:"object",value:null},iconMapping:{type:"object",value:{}},getIcon:{type:"accessor",value:s=>s.properties.icon},getText:{type:"accessor",value:s=>s.properties.text},pointType:"circle",getRadius:{deprecatedFor:"getPointRadius"}};class is extends wt{initializeState(){this.state={layerProps:{},features:{},featuresDiff:{}}}updateState({props:t,changeFlags:e}){if(!e.dataChanged)return;const{data:i}=this.props,n=i&&"points"in i&&"polygons"in i&&"lines"in i;this.setState({binary:n}),n?this._updateStateBinary({props:t,changeFlags:e}):this._updateStateJSON({props:t,changeFlags:e})}_updateStateBinary({props:t,changeFlags:e}){const i=Gh(t.data,this.encodePickingColor);this.setState({layerProps:i})}_updateStateJSON({props:t,changeFlags:e}){const i=Uh(t.data),n=this.getSubLayerRow.bind(this);let o={};const r={};if(Array.isArray(e.dataChanged)){const c=this.state.features;for(const l in c)o[l]=c[l].slice(),r[l]=[];for(const l of e.dataChanged){const u=Tn(i,n,l);for(const f in c)r[f].push(lr({data:o[f],getIndex:d=>d.__source.index,dataRange:l,replace:u[f]}))}}else o=Tn(i,n);const a=jh(o,r);this.setState({features:o,featuresDiff:r,layerProps:a})}getPickingInfo(t){const e=super.getPickingInfo(t),{index:i,sourceLayer:n}=e;return e.featureType=Vh.find(o=>n.id.startsWith(`${this.id}-${o}-`)),i>=0&&n.id.startsWith(`${this.id}-points-text`)&&this.state.binary&&(e.index=this.props.data.points.globalFeatureIds.value[i]),e}_updateAutoHighlight(t){const e=`${this.id}-points-`,i=t.featureType==="points";for(const n of this.getSubLayers())n.id.startsWith(e)===i&&n.updateAutoHighlight(t)}_renderPolygonLayer(){const{extruded:t,wireframe:e}=this.props,{layerProps:i}=this.state,n="polygons-fill",o=this.shouldRenderSubLayer(n,i.polygons?.data)&&this.getSubLayerClass(n,Bi.type);if(o){const r=ui(this,Bi.props),a=t&&e;return a||delete r.getLineColor,r.updateTriggers.lineColors=a,new o(r,this.getSubLayerProps({id:n,updateTriggers:r.updateTriggers}),i.polygons)}return null}_renderLineLayers(){const{extruded:t,stroked:e}=this.props,{layerProps:i}=this.state,n="polygons-stroke",o="linestrings",r=!t&&e&&this.shouldRenderSubLayer(n,i.polygonsOutline?.data)&&this.getSubLayerClass(n,Ee.type),a=this.shouldRenderSubLayer(o,i.lines?.data)&&this.getSubLayerClass(o,Ee.type);if(r||a){const c=ui(this,Ee.props);return[r&&new r(c,this.getSubLayerProps({id:n,updateTriggers:c.updateTriggers}),i.polygonsOutline),a&&new a(c,this.getSubLayerProps({id:o,updateTriggers:c.updateTriggers}),i.lines)]}return null}_renderPointLayers(){const{pointType:t}=this.props,{layerProps:e,binary:i}=this.state;let{highlightedObjectIndex:n}=this.props;!i&&Number.isFinite(n)&&(n=e.points.data.findIndex(a=>a.__source.index===n));const o=new Set(t.split("+")),r=[];for(const a of o){const c=`points-${a}`,l=Me[a],u=l&&this.shouldRenderSubLayer(c,e.points?.data)&&this.getSubLayerClass(c,l.type);if(u){const f=ui(this,l.props);let d=e.points;if(a==="text"&&i){const{instancePickingColors:h,...p}=d.data.attributes;d={...d,data:{...d.data,attributes:p}}}r.push(new u(f,this.getSubLayerProps({id:c,updateTriggers:f.updateTriggers,highlightedObjectIndex:n}),d))}}return r}renderLayers(){const{extruded:t}=this.props,e=this._renderPolygonLayer(),i=this._renderLineLayers(),n=this._renderPointLayers();return[!t&&e,i,n,t&&e]}getSubLayerAccessor(t){const{binary:e}=this.state;return!e||typeof t!="function"?super.getSubLayerAccessor(t):(i,n)=>{const{data:o,index:r}=n,a=ch(o,r);return t(a,n)}}}is.layerName="GeoJsonLayer";is.defaultProps=Wh;function Hh(s,t,e){const{projectedCorners:i}=t,{topLeft:n,topRight:o,bottomRight:r,bottomLeft:a}=i,c=e(n[0],n[1]),l=e(o[0],o[1]),u=e(r[0],r[1]),f=e(a[0],a[1]),d=[c,l,u,f,c],h=[(c[0]+u[0])/2,(c[1]+u[1])/2],p=new Nt({id:`${s}-label`,data:[{position:h,text:`x=${t.index.x} y=${t.index.y} z=${t.index.z}`}],getColor:[255,255,255,255],getSize:24,sizeUnits:"pixels",outlineWidth:3,outlineColor:[0,0,0,255],fontSettings:{sdf:!0}});return[new St({id:s,data:[d],getPath:y=>y,getColor:[255,0,0,255],getWidth:2,widthUnits:"pixels",pickable:!1}),p]}function qh(s){if(s.size===0)throw new Error("At least one tileset is required");let t=null,e=Number.POSITIVE_INFINITY;for(const[o,r]of s){const a=r.levels[r.levels.length-1];a&&a.metersPerPixel<e&&(e=a.metersPerPixel,t=o)}const i=s.get(t),n=new Map;for(const[o,r]of s)o!==t&&n.set(o,r);return{primary:i,primaryKey:t,secondaries:n,bounds:i.projectedBounds,projectTo3857:i.projectTo3857,projectTo4326:i.projectTo4326}}function Yh(s,t,e="closest-finer"){if(e==="closest-finer"){let o=null;for(let r=0;r<s.length;r++)if(s[r].metersPerPixel<=t){o=s[r];break}return o??s[s.length-1]}let i=s[0],n=Math.abs(i.metersPerPixel-t);for(let o=1;o<s.length;o++){const r=Math.abs(s[o].metersPerPixel-t);r<n&&(n=r,i=s[o])}return i}function Kh(s,t){return s.matrixWidth===t.matrixWidth&&s.matrixHeight===t.matrixHeight&&s.tileWidth===t.tileWidth&&s.tileHeight===t.tileHeight&&s.metersPerPixel===t.metersPerPixel}function Zh(s,t,e,i,n){const o=s.projectedTileCorners(t,e),r=Math.min(o.topLeft[0],o.bottomLeft[0],o.topRight[0],o.bottomRight[0]),a=Math.max(o.topLeft[0],o.bottomLeft[0],o.topRight[0],o.bottomRight[0]),c=Math.min(o.topLeft[1],o.bottomLeft[1],o.topRight[1],o.bottomRight[1]),l=Math.max(o.topLeft[1],o.bottomLeft[1],o.topRight[1],o.bottomRight[1]),u=i.crsBoundsToTileRange(r,c,a,l),f=[];for(let q=u.minRow;q<=u.maxRow;q++)for(let m=u.minCol;m<=u.maxCol;m++)f.push({x:m,y:q});const d=i.projectedTileCorners(u.minCol,u.minRow),h=i.projectedTileCorners(u.maxCol,u.maxRow),p=[d.topLeft,d.topRight,d.bottomLeft,d.bottomRight,h.topLeft,h.topRight,h.bottomLeft,h.bottomRight],g=Math.min(...p.map(q=>q[0])),y=Math.max(...p.map(q=>q[0])),v=Math.min(...p.map(q=>q[1])),C=Math.max(...p.map(q=>q[1])),b=y-g,P=C-v,w=a-r,M=l-c,I=b>0?w/b:1,B=P>0?M/P:1,O=b>0?(r-g)/b:0,F=P>0?(C-l)/P:0,G=u.maxCol-u.minCol+1,U=u.maxRow-u.minRow+1,V=G*i.tileWidth,tt=U*i.tileHeight;return{tileIndices:f,uvTransform:[O,F,I,B],stitchedWidth:V,stitchedHeight:tt,minCol:u.minCol,minRow:u.minRow,z:n}}const Xh=[[1/3,1/3,1/3],[.5,.5,0],[.5,0,.5],[0,.5,.5]],Jh=.125;class Qh{reprojectors;width;height;uvs;exactOutputPositions;triangles;_halfedges;_candidatesUV;_queueIndices;_queue;_errors;_pending;_pendingLen;constructor(t,e,i=e){this.reprojectors=t,this.width=e,this.height=i,this.uvs=[],this.exactOutputPositions=[],this.triangles=[],this._halfedges=[],this._candidatesUV=[],this._queueIndices=[],this._queue=[],this._errors=[],this._pending=[],this._pendingLen=0;const n=1,o=1,r=this._addPoint(0,0),a=this._addPoint(n,0),c=this._addPoint(0,o),l=this._addPoint(n,o),u=this._addTriangle(l,r,c,-1,-1,-1);this._addTriangle(r,l,a,u,-1,-1),this._flush()}run(t=Jh,{maxIterations:e=1e4}={}){if(t<=0)throw new Error("maxError must be positive");let i=0;for(;this.getMaxError()>t;)if(this.refine(),++i>e){console.warn(`RasterReprojector: mesh refinement did not converge after ${i} iterations (maxError=${t}, currentError=${this.getMaxError()})`);break}}refine(){this._step(),this._flush()}getMaxError(){return this._errors[0]}_flush(){for(let t=0;t<this._pendingLen;t++){const e=this._pending[t];this._findReprojectionCandidate(e)}this._pendingLen=0}_findReprojectionCandidate(t){const e=2*this.triangles[t*3+0],i=2*this.triangles[t*3+1],n=2*this.triangles[t*3+2],o=this.uvs[e],r=this.uvs[e+1],a=this.uvs[i],c=this.uvs[i+1],l=this.uvs[n],u=this.uvs[n+1],f=this.exactOutputPositions[e],d=this.exactOutputPositions[e+1],h=this.exactOutputPositions[i],p=this.exactOutputPositions[i+1],g=this.exactOutputPositions[n],y=this.exactOutputPositions[n+1];let v=0,C=0,b=0;for(const P of Xh){const w=me(o,a,l,P[0],P[1],P[2]),M=me(r,c,u,P[0],P[1],P[2]),I=me(f,h,g,P[0],P[1],P[2]),B=me(d,p,y,P[0],P[1],P[2]),O=w*(this.width-1),F=M*(this.height-1),G=this.reprojectors.inverseReproject(I,B),U=this.reprojectors.inverseTransform(G[0],G[1]),V=O-U[0],tt=F-U[1],q=Math.hypot(V,tt);q>v&&(v=q,C=w,b=M)}(C===o&&b===r||C===a&&b===c||C===l&&b===u)&&(v=0),this._candidatesUV[2*t]=C,this._candidatesUV[2*t+1]=b,this._queuePush(t,v)}_step(){const t=this._queuePop(),e=t*3+0,i=t*3+1,n=t*3+2,o=this.triangles[e],r=this.triangles[i],a=this.triangles[n],c=this.uvs[2*o],l=this.uvs[2*o+1],u=this.uvs[2*r],f=this.uvs[2*r+1],d=this.uvs[2*a],h=this.uvs[2*a+1],p=this._candidatesUV[2*t],g=this._candidatesUV[2*t+1],y=this._addPoint(p,g);if(fi(c,l,u,f,p,g)===0)this._handleCollinear(y,e);else if(fi(u,f,d,h,p,g)===0)this._handleCollinear(y,i);else if(fi(d,h,c,l,p,g)===0)this._handleCollinear(y,n);else{const v=this._halfedges[e],C=this._halfedges[i],b=this._halfedges[n],P=this._addTriangle(o,r,y,v,-1,-1,e),w=this._addTriangle(r,a,y,C,-1,P+1),M=this._addTriangle(a,o,y,b,P+2,w+1);this._legalize(P),this._legalize(w),this._legalize(M)}}_addPoint(t,e){const i=this.uvs.length>>1;this.uvs.push(t,e);const n=t*(this.width-1),o=e*(this.height-1),r=this.reprojectors.forwardTransform(n,o),a=this.reprojectors.forwardReproject(r[0],r[1]);return this.exactOutputPositions.push(a[0],a[1]),i}_addTriangle(t,e,i,n,o,r,a=this.triangles.length){const c=a/3;return this.triangles[a+0]=t,this.triangles[a+1]=e,this.triangles[a+2]=i,this._halfedges[a+0]=n,this._halfedges[a+1]=o,this._halfedges[a+2]=r,n>=0&&(this._halfedges[n]=a+0),o>=0&&(this._halfedges[o]=a+1),r>=0&&(this._halfedges[r]=a+2),this._candidatesUV[2*c+0]=0,this._candidatesUV[2*c+1]=0,this._queueIndices[c]=-1,this._pending[this._pendingLen++]=c,a}_legalize(t){const e=this._halfedges[t];if(e<0)return;const i=t-t%3,n=e-e%3,o=i+(t+1)%3,r=i+(t+2)%3,a=n+(e+2)%3,c=n+(e+1)%3,l=this.triangles[r],u=this.triangles[t],f=this.triangles[o],d=this.triangles[a],h=this.uvs;if(!td(h[2*l],h[2*l+1],h[2*u],h[2*u+1],h[2*f],h[2*f+1],h[2*d],h[2*d+1]))return;const p=this._halfedges[o],g=this._halfedges[r],y=this._halfedges[a],v=this._halfedges[c];this._queueRemove(i/3),this._queueRemove(n/3);const C=this._addTriangle(l,d,f,-1,y,p,i),b=this._addTriangle(d,l,u,C,g,v,n);this._legalize(C+1),this._legalize(b+2)}_handleCollinear(t,e){const i=e-e%3,n=i+(e+1)%3,o=i+(e+2)%3,r=this.triangles[o],a=this.triangles[e],c=this.triangles[n],l=this._halfedges[n],u=this._halfedges[o],f=this._halfedges[e];if(f<0){const M=this._addTriangle(t,r,a,-1,u,-1,i),I=this._addTriangle(r,t,c,M,-1,l);this._legalize(M+1),this._legalize(I+2);return}const d=f-f%3,h=d+(f+2)%3,p=d+(f+1)%3,g=this.triangles[h],y=this._halfedges[h],v=this._halfedges[p];this._queueRemove(d/3);const C=this._addTriangle(r,a,t,u,-1,-1,i),b=this._addTriangle(a,g,t,v,-1,C+1,d),P=this._addTriangle(g,c,t,y,-1,b+1),w=this._addTriangle(c,r,t,l,C+2,P+1);this._legalize(C),this._legalize(b),this._legalize(P),this._legalize(w)}_queuePush(t,e){const i=this._queue.length;this._queueIndices[t]=i,this._queue.push(t),this._errors.push(e),this._queueUp(i)}_queuePop(){const t=this._queue.length-1;return this._queueSwap(0,t),this._queueDown(0,t),this._queuePopBack()}_queuePopBack(){const t=this._queue.pop();return this._errors.pop(),this._queueIndices[t]=-1,t}_queueRemove(t){const e=this._queueIndices[t];if(e<0){const n=this._pending.indexOf(t);if(n!==-1)this._pending[n]=this._pending[--this._pendingLen];else throw new Error("Broken triangulation (something went wrong).");return}const i=this._queue.length-1;i!==e&&(this._queueSwap(e,i),this._queueDown(e,i)||this._queueUp(e)),this._queuePopBack()}_queueLess(t,e){return this._errors[t]>this._errors[e]}_queueSwap(t,e){const i=this._queue[t],n=this._queue[e];this._queue[t]=n,this._queue[e]=i,this._queueIndices[i]=e,this._queueIndices[n]=t;const o=this._errors[t];this._errors[t]=this._errors[e],this._errors[e]=o}_queueUp(t){let e=t;for(;;){const i=e-1>>1;if(i===e||!this._queueLess(e,i))break;this._queueSwap(i,e),e=i}}_queueDown(t,e){let i=t;for(;;){const n=2*i+1;if(n>=e||n<0)break;const o=n+1;let r=n;if(o<e&&this._queueLess(o,n)&&(r=o),!this._queueLess(r,i))break;this._queueSwap(i,r),i=r}return i>t}}function fi(s,t,e,i,n,o){return(e-n)*(t-o)-(i-o)*(s-n)}function td(s,t,e,i,n,o,r,a){const c=s-r,l=t-a,u=e-r,f=i-a,d=n-r,h=o-a,p=c*c+l*l,g=u*u+f*f,y=d*d+h*h;return c*(f*y-g*h)-l*(u*y-g*d)+p*(u*h-f*d)<0}function me(s,t,e,i,n,o){return i*s+n*t+o*e}const hi=Math.PI/180,ye=new Float32Array(16),Sn=new Float32Array(12);function Mn(s,t,e){const i=t[0]*hi,n=t[1]*hi,o=t[2]*hi,r=Math.sin(o),a=Math.sin(i),c=Math.sin(n),l=Math.cos(o),u=Math.cos(i),f=Math.cos(n),d=e[0],h=e[1],p=e[2];s[0]=d*f*u,s[1]=d*c*u,s[2]=d*-a,s[3]=h*(-c*l+f*a*r),s[4]=h*(f*l+c*a*r),s[5]=h*u*r,s[6]=p*(c*r+f*a*l),s[7]=p*(-f*r+c*a*l),s[8]=p*u*l}function En(s){return s[0]=s[0],s[1]=s[1],s[2]=s[2],s[3]=s[4],s[4]=s[5],s[5]=s[6],s[6]=s[8],s[7]=s[9],s[8]=s[10],s[9]=s[12],s[10]=s[13],s[11]=s[14],s.subarray(0,12)}const ed={size:12,accessor:["getOrientation","getScale","getTranslation","getTransformMatrix"],shaderAttributes:{instanceModelMatrixCol0:{size:3,elementOffset:0},instanceModelMatrixCol1:{size:3,elementOffset:3},instanceModelMatrixCol2:{size:3,elementOffset:6},instanceTranslation:{size:3,elementOffset:9}},update(s,{startRow:t,endRow:e}){const{data:i,getOrientation:n,getScale:o,getTranslation:r,getTransformMatrix:a}=this.props,c=Array.isArray(a),l=c&&a.length===16,u=Array.isArray(o),f=Array.isArray(n),d=Array.isArray(r),h=l||!c&&!!a(i[0]);h?s.constant=l:s.constant=f&&u&&d;const p=s.value;if(s.constant){let g;h?(ye.set(a),g=En(ye)):(g=Sn,Mn(g,n,o),g.set(r,9)),s.value=new Float32Array(g)}else{let g=t*s.size;const{iterable:y,objectInfo:v}=Mt(i,t,e);for(const C of y){v.index++;let b;if(h)ye.set(l?a:a(C,v)),b=En(ye);else{b=Sn;const P=f?n:n(C,v),w=u?o:o(C,v);Mn(b,P,w),b.set(d?r:r(C,v),9)}p[g++]=b[0],p[g++]=b[1],p[g++]=b[2],p[g++]=b[3],p[g++]=b[4],p[g++]=b[5],p[g++]=b[6],p[g++]=b[7],p[g++]=b[8],p[g++]=b[9],p[g++]=b[10],p[g++]=b[11]}}}};function id(s,t){return t==="cartesian"||t==="meter-offsets"||t==="default"&&!s.isGeospatial}const In=`layout(std140) uniform simpleMeshUniforms {
  float sizeScale;
  bool composeModelMatrix;
  bool hasTexture;
  bool flatShading;
} simpleMesh;
`,sd={name:"simpleMesh",vs:In,fs:In,uniformTypes:{sizeScale:"f32",composeModelMatrix:"f32",hasTexture:"f32",flatShading:"f32"}},nd=`#version 300 es
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
`,od=`#version 300 es
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
`;function rd(s){let t=1/0,e=1/0,i=1/0,n=-1/0,o=-1/0,r=-1/0;const a=s.POSITION?s.POSITION.value:[],c=a&&a.length;for(let l=0;l<c;l+=3){const u=a[l],f=a[l+1],d=a[l+2];t=u<t?u:t,e=f<e?f:e,i=d<i?d:i,n=u>n?u:n,o=f>o?f:o,r=d>r?d:r}return[[t,e,i],[n,o,r]]}function di(s){const t=s.positions||s.POSITION;K.assert(t,'no "postions" or "POSITION" attribute in mesh');const e=t.value.length/t.size;let i=s.COLOR_0||s.colors;i||(i={size:3,value:new Float32Array(e*3).fill(1)});let n=s.NORMAL||s.normals;n||(n={size:3,value:new Float32Array(e*3).fill(0)});let o=s.TEXCOORD_0||s.texCoords;return o||(o={size:2,value:new Float32Array(e*2).fill(0)}),{positions:t,colors:i,normals:n,texCoords:o}}function On(s){return s instanceof pt?(s.attributes=di(s.attributes),s):s.attributes?new pt({...s,topology:"triangle-list",attributes:di(s.attributes)}):new pt({topology:"triangle-list",attributes:di(s)})}const ad=[0,0,0,255],cd={mesh:{type:"object",value:null,async:!0},texture:{type:"image",value:null,async:!0},sizeScale:{type:"number",value:1,min:0},_instanced:!0,wireframe:!1,material:!0,getPosition:{type:"accessor",value:s=>s.position},getColor:{type:"accessor",value:ad},getOrientation:{type:"accessor",value:[0,0,0]},getScale:{type:"accessor",value:[1,1,1]},getTranslation:{type:"accessor",value:[0,0,0]},getTransformMatrix:{type:"accessor",value:[]},textureParameters:{type:"object",ignore:!0,value:null}};class Ye extends mt{getShaders(){return super.getShaders({vs:nd,fs:od,modules:[Ut,Ao,Dt,sd]})}getBounds(){if(this.props._instanced)return super.getBounds();let t=this.state.positionBounds;if(t)return t;const{mesh:e}=this.props;if(!e)return null;if(t=e.header?.boundingBox,!t){const{attributes:i}=On(e);i.POSITION=i.POSITION||i.positions,t=rd(i)}return this.state.positionBounds=t,t}initializeState(){this.getAttributeManager().addInstanced({instancePositions:{transition:!0,type:"float64",fp64:this.use64bitPositions(),size:3,accessor:"getPosition"},instanceColors:{type:"unorm8",transition:!0,size:this.props.colorFormat.length,accessor:"getColor",defaultValue:[0,0,0,255]},instanceModelMatrix:ed}),this.setState({emptyTexture:this.context.device.createTexture({data:new Uint8Array(4),width:1,height:1})})}updateState(t){super.updateState(t);const{props:e,oldProps:i,changeFlags:n}=t;if(e.mesh!==i.mesh||n.extensionsChanged){if(this.state.positionBounds=null,this.state.model?.destroy(),e.mesh){this.state.model=this.getModel(e.mesh);const o=e.mesh.attributes||e.mesh;this.setState({hasNormals:!!(o.NORMAL||o.normals)})}this.getAttributeManager().invalidateAll()}e.texture!==i.texture&&e.texture instanceof it&&this.setTexture(e.texture),this.state.model&&this.state.model.setTopology(this.props.wireframe?"line-strip":"triangle-list")}finalizeState(t){super.finalizeState(t),this.state.emptyTexture.delete()}draw({uniforms:t}){const{model:e}=this.state;if(!e)return;const{viewport:i,renderPass:n}=this.context,{sizeScale:o,coordinateSystem:r,_instanced:a}=this.props,c={sizeScale:o,composeModelMatrix:!a||id(i,r),flatShading:!this.state.hasNormals};e.shaderInputs.setProps({simpleMesh:c}),e.draw(n)}get isLoaded(){return!!(this.state?.model&&super.isLoaded)}getModel(t){const e=new rt(this.context.device,{...this.getShaders(),id:this.props.id,bufferLayout:this.getAttributeManager().getBufferLayouts(),geometry:On(t),isInstanced:!0}),{texture:i}=this.props,{emptyTexture:n}=this.state,o={sampler:i||n,hasTexture:!!i};return e.shaderInputs.setProps({simpleMesh:o}),e}setTexture(t){const{emptyTexture:e,model:i}=this.state;if(i){const n={sampler:t||e,hasTexture:!!t};i.shaderInputs.setProps({simpleMesh:n})}}}Ye.defaultProps=cd;Ye.layerName="SimpleMeshLayer";const yr={name:"create-texture-unorm",inject:{"fs:#decl":"uniform sampler2D textureName;","fs:DECKGL_FILTER_COLOR":`
      color = texture(textureName, geometry.uv);
    `},getUniforms:s=>({textureName:s.textureName})},ld=`#version 300 es
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
`,ud={...Ye.defaultProps,renderPipeline:{type:"array",value:[],compare:!0},material:{ambient:1,diffuse:0,shininess:0,specularColor:[0,0,0]}};class fd extends Ye{static layerName="mesh-texture-layer";static defaultProps=ud;_resolveRenderPipeline(){const{image:t,renderPipeline:e}=this.props;return[...t?[{module:yr,props:{textureName:t}}]:[],...e??[]]}updateState(t){this.hasRenderPipelineChanged(t)&&(t.changeFlags.extensionsChanged=!0),super.updateState(t)}hasRenderPipelineChanged(t){const{oldProps:e,props:i}=t;if(!!e.image!=!!i.image)return!0;const n=e.renderPipeline??[],o=i.renderPipeline??[];if(n.length!==o.length)return!0;for(let r=0;r<n.length;r++)if(n[r]?.module.name!==o[r]?.module.name)return!0;return!1}getShaders(){const t=super.getShaders(),e=t.modules;for(const i of this._resolveRenderPipeline())e.push(i.module);return{...t,fs:ld,modules:e}}draw(t){const e={};for(const i of this._resolveRenderPipeline())e[i.module.name]=i.props||{};for(const i of super.getModels())i.shaderInputs.setProps(e);super.draw(t)}}const hd=.125,Rn=[[252,73,163],[255,51,204],[204,102,255],[153,51,255],[102,204,255],[51,153,255],[102,255,204],[51,255,170],[0,255,0],[51,204,51],[255,204,102],[255,179,71],[255,102,102],[255,80,80],[255,0,0],[204,0,0],[255,128,0],[255,153,51],[255,255,102],[255,255,51],[0,255,255],[0,204,255]],dd={image:{type:"image",value:null,async:!0},renderPipeline:{type:"array",value:[],compare:!0},debug:!1,debugOpacity:.5};class pd extends wt{static layerName="RasterLayer";static defaultProps=dd;initializeState(){this.setState({})}updateState(t){super.updateState(t);const{props:e,oldProps:i,changeFlags:n}=t,o=e.reprojectionFns.forwardTransform!==i.reprojectionFns?.forwardTransform||e.reprojectionFns.inverseTransform!==i.reprojectionFns?.inverseTransform||e.reprojectionFns.forwardReproject!==i.reprojectionFns?.forwardReproject||e.reprojectionFns.inverseReproject!==i.reprojectionFns?.inverseReproject;(n.dataChanged||e.width!==i.width||e.height!==i.height||o||e.maxError!==i.maxError)&&this._generateMesh()}_generateMesh(){const{width:t,height:e,reprojectionFns:i,maxError:n=hd}=this.props,o=new Qh(i,t+1,e+1);o.run(n);const{indices:r,positions:a,texCoords:c}=gd(o);this.setState({reprojector:o,mesh:{indices:{value:r,size:1},attributes:{POSITION:{value:a,size:3},TEXCOORD_0:{value:c,size:2}}}})}renderDebugLayer(){const{reprojector:t}=this.state,{debugOpacity:e}=this.props;return t?new Ji(this.getSubLayerProps({id:"polygon",data:{reprojector:t,length:t.triangles.length/3},getPolygon:(i,{index:n,data:o})=>{const r=o.reprojector.triangles,a=t.exactOutputPositions,c=r[n*3],l=r[n*3+1],u=r[n*3+2];return[[a[c*2],a[c*2+1]],[a[l*2],a[l*2+1]],[a[u*2],a[u*2+1]],[a[c*2],a[c*2+1]]]},getFillColor:(i,{index:n,target:o})=>{const r=Rn[n%Rn.length];return o[0]=r[0],o[1]=r[1],o[2]=r[2],o[3]=255,o},getLineColor:[0,0,0],getLineWidth:1,lineWidthUnits:"pixels",opacity:e!==void 0&&Number.isFinite(e)?Math.max(0,Math.min(1,e)):1,pickable:!1})):null}renderLayers(){const{mesh:t}=this.state,{debug:e,image:i,renderPipeline:n}=this.props;if(!t||!i&&(n?.length??0)===0)return null;const r=[new fd(this.getSubLayerProps({id:"raster",image:i,renderPipeline:n,data:[1],mesh:t,_instanced:!1,getPosition:[0,0,0],getColor:[255,255,255]}))];if(e){const a=this.renderDebugLayer();a&&r.push(a)}return r}}function gd(s){const t=s.uvs.length/2,e=new Float32Array(t*3),i=new Float32Array(s.uvs);for(let o=0;o<t;o++)e[o*3]=s.exactOutputPositions[o*2],e[o*3+1]=s.exactOutputPositions[o*2+1],e[o*3+2]=0;return{indices:new Uint32Array(s.triangles),positions:e,texCoords:i}}class md{constructor(t){this.index=t,this.isVisible=!1,this.isSelected=!1,this.parent=null,this.children=[],this.content=null,this._loader=void 0,this._abortController=null,this._loaderId=0,this._isLoaded=!1,this._isCancelled=!1,this._needsReload=!1}get bbox(){return this._bbox}set bbox(t){this._bbox||(this._bbox=t,"west"in t?this.boundingBox=[[t.west,t.south],[t.east,t.north]]:this.boundingBox=[[t.left,t.top],[t.right,t.bottom]])}get data(){return this.isLoading&&this._loader?this._loader.then(()=>this.data):this.content}get isLoaded(){return this._isLoaded&&!this._needsReload}get isLoading(){return!!this._loader&&!this._isCancelled}get needsReload(){return this._needsReload||this._isCancelled}get byteLength(){const t=this.content?this.content.byteLength:0;return Number.isFinite(t)||console.error("byteLength not defined in tile data"),t}async _loadData({getData:t,requestScheduler:e,onLoad:i,onError:n}){const{index:o,id:r,bbox:a,userData:c,zoom:l}=this,u=this._loaderId;this._abortController=new AbortController;const{signal:f}=this._abortController,d=await e.scheduleRequest(this,g=>g.isSelected?1:-1);if(!d){this._isCancelled=!0;return}if(this._isCancelled){d.done();return}let h=null,p;try{h=await t({index:o,id:r,bbox:a,userData:c,zoom:l,signal:f})}catch(g){p=g||!0}finally{d.done()}if(u===this._loaderId){if(this._loader=void 0,this.content=h,this._isCancelled&&!h){this._isLoaded=!1;return}this._isLoaded=!0,this._isCancelled=!1,p?n(p,this):i(this)}}loadData(t){return this._isLoaded=!1,this._isCancelled=!1,this._needsReload=!1,this._loaderId++,this._loader=this._loadData(t),this._loader}setNeedsReload(){this.isLoading&&(this.abort(),this._loader=void 0),this._needsReload=!0}abort(){this.isLoaded||(this._isCancelled=!0,this._abortController?.abort())}}const Q={OUTSIDE:-1,INTERSECTING:0,INSIDE:1},zn=new R,yd=new R;class ss{constructor(t=[0,0,0],e=[0,0,0],i){i=i||zn.copy(t).add(e).scale(.5),this.center=new R(i),this.halfDiagonal=new R(e).subtract(this.center),this.minimum=new R(t),this.maximum=new R(e)}clone(){return new ss(this.minimum,this.maximum,this.center)}equals(t){return this===t||!!t&&this.minimum.equals(t.minimum)&&this.maximum.equals(t.maximum)}transform(t){return this.center.transformAsPoint(t),this.halfDiagonal.transform(t),this.minimum.transform(t),this.maximum.transform(t),this}intersectPlane(t){const{halfDiagonal:e}=this,i=yd.from(t.normal),n=e.x*Math.abs(i.x)+e.y*Math.abs(i.y)+e.z*Math.abs(i.z),o=this.center.dot(i)+t.distance;return o-n>0?Q.INSIDE:o+n<0?Q.OUTSIDE:Q.INTERSECTING}distanceTo(t){return Math.sqrt(this.distanceSquaredTo(t))}distanceSquaredTo(t){const e=zn.from(t).subtract(this.center),{halfDiagonal:i}=this;let n=0,o;return o=Math.abs(e.x)-i.x,o>0&&(n+=o*o),o=Math.abs(e.y)-i.y,o>0&&(n+=o*o),o=Math.abs(e.z)-i.z,o>0&&(n+=o*o),n}}const Yt=new R,Bn=new R;class ns{constructor(t=[0,0,0],e=0){this.radius=-0,this.center=new R,this.fromCenterRadius(t,e)}fromCenterRadius(t,e){return this.center.from(t),this.radius=e,this}fromCornerPoints(t,e){return e=Yt.from(e),this.center=new R().from(t).add(e).scale(.5),this.radius=this.center.distance(e),this}equals(t){return this===t||!!t&&this.center.equals(t.center)&&this.radius===t.radius}clone(){return new ns(this.center,this.radius)}union(t){const e=this.center,i=this.radius,n=t.center,o=t.radius,r=Yt.copy(n).subtract(e),a=r.magnitude();if(i>=a+o)return this.clone();if(o>=a+i)return t.clone();const c=(i+a+o)*.5;return Bn.copy(r).scale((-i+c)/a).add(e),this.center.copy(Bn),this.radius=c,this}expand(t){const i=Yt.from(t).subtract(this.center).magnitude();return i>this.radius&&(this.radius=i),this}transform(t){this.center.transform(t);const e=ba(Yt,t);return this.radius=Math.max(e[0],Math.max(e[1],e[2]))*this.radius,this}distanceSquaredTo(t){const e=this.distanceTo(t);return e*e}distanceTo(t){const i=Yt.from(t).subtract(this.center);return Math.max(0,i.len()-this.radius)}intersectPlane(t){const e=this.center,i=this.radius,o=t.normal.dot(e)+t.distance;return o<-i?Q.OUTSIDE:o<i?Q.INTERSECTING:Q.INSIDE}}const _d=new R,xd=new R,_e=new R,xe=new R,ve=new R,vd=new R,bd=new R,ft={COLUMN0ROW0:0,COLUMN0ROW1:1,COLUMN0ROW2:2,COLUMN1ROW0:3,COLUMN1ROW1:4,COLUMN1ROW2:5,COLUMN2ROW0:6,COLUMN2ROW1:7,COLUMN2ROW2:8};class os{constructor(t=[0,0,0],e=[0,0,0,0,0,0,0,0,0]){this.center=new R().from(t),this.halfAxes=new X(e)}get halfSize(){const t=this.halfAxes.getColumn(0),e=this.halfAxes.getColumn(1),i=this.halfAxes.getColumn(2);return[new R(t).len(),new R(e).len(),new R(i).len()]}get quaternion(){const t=this.halfAxes.getColumn(0),e=this.halfAxes.getColumn(1),i=this.halfAxes.getColumn(2),n=new R(t).normalize(),o=new R(e).normalize(),r=new R(i).normalize();return new Ls().fromMatrix3(new X([...n,...o,...r]))}fromCenterHalfSizeQuaternion(t,e,i){const n=new Ls(i),o=new X().fromQuaternion(n);return o[0]=o[0]*e[0],o[1]=o[1]*e[0],o[2]=o[2]*e[0],o[3]=o[3]*e[1],o[4]=o[4]*e[1],o[5]=o[5]*e[1],o[6]=o[6]*e[2],o[7]=o[7]*e[2],o[8]=o[8]*e[2],this.center=new R().from(t),this.halfAxes=o,this}clone(){return new os(this.center,this.halfAxes)}equals(t){return this===t||!!t&&this.center.equals(t.center)&&this.halfAxes.equals(t.halfAxes)}getBoundingSphere(t=new ns){const e=this.halfAxes,i=e.getColumn(0,_e),n=e.getColumn(1,xe),o=e.getColumn(2,ve),r=_d.copy(i).add(n).add(o);return t.center.copy(this.center),t.radius=r.magnitude(),t}intersectPlane(t){const e=this.center,i=t.normal,n=this.halfAxes,o=i.x,r=i.y,a=i.z,c=Math.abs(o*n[ft.COLUMN0ROW0]+r*n[ft.COLUMN0ROW1]+a*n[ft.COLUMN0ROW2])+Math.abs(o*n[ft.COLUMN1ROW0]+r*n[ft.COLUMN1ROW1]+a*n[ft.COLUMN1ROW2])+Math.abs(o*n[ft.COLUMN2ROW0]+r*n[ft.COLUMN2ROW1]+a*n[ft.COLUMN2ROW2]),l=i.dot(e)+t.distance;return l<=-c?Q.OUTSIDE:l>=c?Q.INSIDE:Q.INTERSECTING}distanceTo(t){return Math.sqrt(this.distanceSquaredTo(t))}distanceSquaredTo(t){const e=xd.from(t).subtract(this.center),i=this.halfAxes,n=i.getColumn(0,_e),o=i.getColumn(1,xe),r=i.getColumn(2,ve),a=n.magnitude(),c=o.magnitude(),l=r.magnitude();n.normalize(),o.normalize(),r.normalize();let u=0,f;return f=Math.abs(e.dot(n))-a,f>0&&(u+=f*f),f=Math.abs(e.dot(o))-c,f>0&&(u+=f*f),f=Math.abs(e.dot(r))-l,f>0&&(u+=f*f),u}computePlaneDistances(t,e,i=[-0,-0]){let n=Number.POSITIVE_INFINITY,o=Number.NEGATIVE_INFINITY;const r=this.center,a=this.halfAxes,c=a.getColumn(0,_e),l=a.getColumn(1,xe),u=a.getColumn(2,ve),f=vd.copy(c).add(l).add(u).add(r),d=bd.copy(f).subtract(t);let h=e.dot(d);return n=Math.min(h,n),o=Math.max(h,o),f.copy(r).add(c).add(l).subtract(u),d.copy(f).subtract(t),h=e.dot(d),n=Math.min(h,n),o=Math.max(h,o),f.copy(r).add(c).subtract(l).add(u),d.copy(f).subtract(t),h=e.dot(d),n=Math.min(h,n),o=Math.max(h,o),f.copy(r).add(c).subtract(l).subtract(u),d.copy(f).subtract(t),h=e.dot(d),n=Math.min(h,n),o=Math.max(h,o),r.copy(f).subtract(c).add(l).add(u),d.copy(f).subtract(t),h=e.dot(d),n=Math.min(h,n),o=Math.max(h,o),r.copy(f).subtract(c).add(l).subtract(u),d.copy(f).subtract(t),h=e.dot(d),n=Math.min(h,n),o=Math.max(h,o),r.copy(f).subtract(c).subtract(l).add(u),d.copy(f).subtract(t),h=e.dot(d),n=Math.min(h,n),o=Math.max(h,o),r.copy(f).subtract(c).subtract(l).subtract(u),d.copy(f).subtract(t),h=e.dot(d),n=Math.min(h,n),o=Math.max(h,o),i[0]=n,i[1]=o,i}transform(t){this.center.transformAsPoint(t);const e=this.halfAxes.getColumn(0,_e);e.transformAsPoint(t);const i=this.halfAxes.getColumn(1,xe);i.transformAsPoint(t);const n=this.halfAxes.getColumn(2,ve);return n.transformAsPoint(t),this.halfAxes=new X([...e,...i,...n]),this}getTransform(){throw new Error("not implemented")}}const Fn=new R,Nn=new R;class kt{constructor(t=[0,0,1],e=0){this.normal=new R,this.distance=-0,this.fromNormalDistance(t,e)}fromNormalDistance(t,e){return vi(Number.isFinite(e)),this.normal.from(t).normalize(),this.distance=e,this}fromPointNormal(t,e){t=Fn.from(t),this.normal.from(e).normalize();const i=-this.normal.dot(t);return this.distance=i,this}fromCoefficients(t,e,i,n){return this.normal.set(t,e,i),vi(Pe(this.normal.len(),1)),this.distance=n,this}clone(){return new kt(this.normal,this.distance)}equals(t){return Pe(this.distance,t.distance)&&Pe(this.normal,t.normal)}getPointDistance(t){return this.normal.dot(t)+this.distance}transform(t){const e=Nn.copy(this.normal).transformAsVector(t).normalize(),i=this.normal.scale(-this.distance).transform(t);return this.fromPointNormal(i,e)}projectPointOntoPlane(t,e=[0,0,0]){const i=Fn.from(t),n=this.getPointDistance(i),o=Nn.copy(this.normal).scale(n);return i.subtract(o).to(e)}}const kn=[new R([1,0,0]),new R([0,1,0]),new R([0,0,1])],Un=new R,Cd=new R;class ut{constructor(t=[]){this.planes=t}fromBoundingSphere(t){this.planes.length=2*kn.length;const e=t.center,i=t.radius;let n=0;for(const o of kn){let r=this.planes[n],a=this.planes[n+1];r||(r=this.planes[n]=new kt),a||(a=this.planes[n+1]=new kt);const c=Un.copy(o).scale(-i).add(e);r.fromPointNormal(c,o);const l=Un.copy(o).scale(i).add(e),u=Cd.copy(o).negate();a.fromPointNormal(l,u),n+=2}return this}computeVisibility(t){let e=Q.INSIDE;for(const i of this.planes)switch(t.intersectPlane(i)){case Q.OUTSIDE:return Q.OUTSIDE;case Q.INTERSECTING:e=Q.INTERSECTING;break}return e}computeVisibilityWithPlaneMask(t,e){if(vi(Number.isFinite(e),"parentPlaneMask is required."),e===ut.MASK_OUTSIDE||e===ut.MASK_INSIDE)return e;let i=ut.MASK_INSIDE;const n=this.planes;for(let o=0;o<this.planes.length;++o){const r=o<31?1<<o:0;if(o<31&&(e&r)===0)continue;const a=n[o],c=t.intersectPlane(a);if(c===Q.OUTSIDE)return ut.MASK_OUTSIDE;c===Q.INTERSECTING&&(i|=r)}return i}}ut.MASK_OUTSIDE=4294967295;ut.MASK_INSIDE=0;ut.MASK_INDETERMINATE=2147483647;new R;new R;new R;new R;new R;new R;new R;new R;new R;new R;new R;new R;new R;new R;new R;new R;new R;const lt=new X,Pd=new X,wd=new X,be=new X,Dn=new X;function Ld(s,t={}){const e=xc,i=10;let n=0,o=0;const r=Pd,a=wd;r.identity(),a.copy(s);const c=e*Td(a);for(;o<i&&Ad(a)>c;)Sd(a,be),Dn.copy(be).transpose(),a.multiplyRight(be),a.multiplyLeft(Dn),r.multiplyRight(be),++n>2&&(++o,n=0);return t.unitary=r.toTarget(t.unitary),t.diagonal=a.toTarget(t.diagonal),t}function Td(s){let t=0;for(let e=0;e<9;++e){const i=s[e];t+=i*i}return Math.sqrt(t)}const Fi=[1,0,0],Ni=[2,2,1];function Ad(s){let t=0;for(let e=0;e<3;++e){const i=s[lt.getElementIndex(Ni[e],Fi[e])];t+=2*i*i}return Math.sqrt(t)}function Sd(s,t){const e=_c;let i=0,n=1;for(let l=0;l<3;++l){const u=Math.abs(s[lt.getElementIndex(Ni[l],Fi[l])]);u>i&&(n=l,i=u)}const o=Fi[n],r=Ni[n];let a=1,c=0;if(Math.abs(s[lt.getElementIndex(r,o)])>e){const l=s[lt.getElementIndex(r,r)],u=s[lt.getElementIndex(o,o)],f=s[lt.getElementIndex(r,o)],d=(l-u)/2/f;let h;d<0?h=-1/(-d+Math.sqrt(1+d*d)):h=1/(d+Math.sqrt(1+d*d)),a=1/Math.sqrt(1+h*h),c=h*a}return X.IDENTITY.to(t),t[lt.getElementIndex(o,o)]=t[lt.getElementIndex(r,r)]=a,t[lt.getElementIndex(r,o)]=c,t[lt.getElementIndex(o,r)]=-c,t}const _t=new R,Md=new R,Ed=new R,Id=new R,Od=new R,Rd=new X,zd={diagonal:new X,unitary:new X};function _r(s,t=new os){if(!s||s.length===0)return t.halfAxes=new X([0,0,0,0,0,0,0,0,0]),t.center=new R,t;const e=s.length,i=new R(0,0,0);for(const O of s)i.add(O);const n=1/e;i.multiplyByScalar(n);let o=0,r=0,a=0,c=0,l=0,u=0;for(const O of s){const F=_t.copy(O).subtract(i);o+=F.x*F.x,r+=F.x*F.y,a+=F.x*F.z,c+=F.y*F.y,l+=F.y*F.z,u+=F.z*F.z}o*=n,r*=n,a*=n,c*=n,l*=n,u*=n;const f=Rd;f[0]=o,f[1]=r,f[2]=a,f[3]=r,f[4]=c,f[5]=l,f[6]=a,f[7]=l,f[8]=u;const{unitary:d}=Ld(f,zd),h=t.halfAxes.copy(d);let p=h.getColumn(0,Ed),g=h.getColumn(1,Id),y=h.getColumn(2,Od),v=-Number.MAX_VALUE,C=-Number.MAX_VALUE,b=-Number.MAX_VALUE,P=Number.MAX_VALUE,w=Number.MAX_VALUE,M=Number.MAX_VALUE;for(const O of s)_t.copy(O),v=Math.max(_t.dot(p),v),C=Math.max(_t.dot(g),C),b=Math.max(_t.dot(y),b),P=Math.min(_t.dot(p),P),w=Math.min(_t.dot(g),w),M=Math.min(_t.dot(y),M);p=p.multiplyByScalar(.5*(P+v)),g=g.multiplyByScalar(.5*(w+C)),y=y.multiplyByScalar(.5*(M+b)),t.center.copy(p).add(g).add(y);const I=Md.set(v-P,C-w,b-M).multiplyByScalar(.5),B=new X([I[0],0,0,0,I[1],0,0,0,I[2]]);return t.halfAxes.multiplyRight(B),t}const Ot=512,$n=3,xr=[[.5,.5],[0,0],[0,1],[1,0],[1,1]],vr=xr.concat([[0,.5],[.5,0],[1,.5],[.5,1]]),Bd=vr.concat([[.25,.5],[.75,.5]]);class Rt{constructor(t,e,i){this.x=t,this.y=e,this.z=i}get children(){if(!this._children){const t=this.x*2,e=this.y*2,i=this.z+1;this._children=[new Rt(t,e,i),new Rt(t,e+1,i),new Rt(t+1,e,i),new Rt(t+1,e+1,i)]}return this._children}update(t){const{viewport:e,cullingVolume:i,elevationBounds:n,minZ:o,maxZ:r,bounds:a,offset:c,project:l}=t,u=this.getBoundingVolume(n,c,l);if(a&&!this.insideBounds(a)||i.computeVisibility(u)<0)return!1;if(!this.childVisible){let{z:d}=this;if(d<r&&d>=o){const h=u.distanceTo(e.cameraPosition)*e.scale/e.height;d+=Math.floor(Math.log2(h))}if(d>=r)return this.selected=!0,!0}this.selected=!1,this.childVisible=!0;for(const d of this.children)d.update(t);return!0}getSelected(t=[]){if(this.selected&&t.push(this),this._children)for(const e of this._children)e.getSelected(t);return t}insideBounds([t,e,i,n]){const o=Math.pow(2,this.z),r=Ot/o;return this.x*r<i&&this.y*r<n&&(this.x+1)*r>t&&(this.y+1)*r>e}getBoundingVolume(t,e,i){if(i){const c=this.z<1?Bd:this.z<2?vr:xr,l=[];for(const u of c){const f=Ui(this.x+u[0],this.y+u[1],this.z);f[2]=t[0],l.push(i(f)),t[0]!==t[1]&&(f[2]=t[1],l.push(i(f)))}return _r(l)}const n=Math.pow(2,this.z),o=Ot/n,r=this.x*o+e*Ot,a=Ot-(this.y+1)*o;return new ss([r,a,t[0]],[r+o,a+o,t[1]])}}function Fd(s,t,e,i){const n=s instanceof co&&s.resolution?s.projectPosition:null,o=Object.values(s.getFrustumPlanes()).map(({normal:h,distance:p})=>new kt(h.clone().negate(),p)),r=new ut(o),a=s.distanceScales.unitsPerMeter[2],c=e&&e[0]*a||0,l=e&&e[1]*a||0,u=s instanceof yi&&s.pitch<=60?t:0;if(i){const[h,p,g,y]=i,v=Be([h,y]),C=Be([g,p]);i=[v[0],Ot-v[1],C[0],Ot-C[1]]}const f=new Rt(0,0,0),d={viewport:s,project:n,cullingVolume:r,elevationBounds:[c,l],minZ:u,maxZ:t,bounds:i,offset:0};if(f.update(d),s instanceof yi&&s.subViewports&&s.subViewports.length>1){for(d.offset=-1;f.update(d)&&!(--d.offset<-$n););for(d.offset=1;f.update(d)&&!(++d.offset>$n););}return f.getSelected()}const gt=512,Nd=[-1/0,-1/0,1/0,1/0],kd={equal:(s,t)=>{if(s===t)return!0;if(!Array.isArray(s)||!Array.isArray(t))return!1;const e=s.length;if(e!==t.length)return!1;for(let i=0;i<e;i++)if(s[i]!==t[i])return!1;return!0}};function rs(s,t){const e=[t.transformAsPoint([s[0],s[1]]),t.transformAsPoint([s[2],s[1]]),t.transformAsPoint([s[0],s[3]]),t.transformAsPoint([s[2],s[3]])];return[Math.min(...e.map(n=>n[0])),Math.min(...e.map(n=>n[1])),Math.max(...e.map(n=>n[0])),Math.max(...e.map(n=>n[1]))]}function Ud(s){return Math.abs(s.split("").reduce((t,e)=>(t<<5)-t+e.charCodeAt(0)|0,0))}function Dd(s,t){if(!s||!s.length)return null;const{index:e,id:i}=t;if(Array.isArray(s)){const o=Ud(i)%s.length;s=s[o]}let n=s;for(const o of Object.keys(e)){const r=new RegExp(`{${o}}`,"g");n=n.replace(r,String(e[o]))}return Number.isInteger(e.y)&&Number.isInteger(e.z)&&(n=n.replace(/\{-y\}/g,String(Math.pow(2,e.z)-e.y-1))),n}function $d(s,t,e){let i;return i=s.getBounds(),s.isGeospatial?[Math.max(i[0],e[0]),Math.max(i[1],e[1]),Math.min(i[2],e[2]),Math.min(i[3],e[3])]:[Math.max(Math.min(i[0],e[2]),e[0]),Math.max(Math.min(i[1],e[3]),e[1]),Math.min(Math.max(i[2],e[0]),e[2]),Math.min(Math.max(i[3],e[1]),e[3])]}function jd({viewport:s,z:t,cullRect:e}){return(s.subViewports||[s]).map(n=>ki(n,t||0,e))}function ki(s,t,e){if(!Array.isArray(t)){const o=e.x-s.x,r=e.y-s.y,{width:a,height:c}=e,l={targetZ:t},u=s.unproject([o,r],l),f=s.unproject([o+a,r],l),d=s.unproject([o,r+c],l),h=s.unproject([o+a,r+c],l);return[Math.min(u[0],f[0],d[0],h[0]),Math.min(u[1],f[1],d[1],h[1]),Math.max(u[0],f[0],d[0],h[0]),Math.max(u[1],f[1],d[1],h[1])]}const i=ki(s,t[0],e),n=ki(s,t[1],e);return[Math.min(i[0],n[0]),Math.min(i[1],n[1]),Math.max(i[2],n[2]),Math.max(i[3],n[3])]}function Gd(s,t,e){return e?rs(s,e).map(n=>n*t/gt):s.map(i=>i*t/gt)}function as(s,t){return Math.pow(2,s)*gt/t}function Ui(s,t,e){const i=as(e,gt),n=s/i*360-180,o=Math.PI-2*Math.PI*t/i,r=180/Math.PI*Math.atan(.5*(Math.exp(o)-Math.exp(-o)));return[n,r]}function jn(s,t,e,i){const n=as(e,i);return[s/n*gt,t/n*gt]}function Vd(s,t,e,i,n=gt){if(s.isGeospatial){const[l,u]=Ui(t,e,i),[f,d]=Ui(t+1,e+1,i);return{west:l,north:u,east:f,south:d}}const[o,r]=jn(t,e,i,n),[a,c]=jn(t+1,e+1,i,n);return{left:o,top:r,right:a,bottom:c}}function Wd(s,t,e,i,n){const o=$d(s,null,i),r=as(t,e),[a,c,l,u]=Gd(o,r,n),f=[];for(let d=Math.floor(a);d<l;d++)for(let h=Math.floor(c);h<u;h++)f.push({x:d,y:h,z:t});return f}function Hd({viewport:s,maxZoom:t,minZoom:e,zRange:i,extent:n,tileSize:o=gt,modelMatrix:r,modelMatrixInverse:a,zoomOffset:c=0,visibleMinZoom:l,visibleMaxZoom:u}){let f=s.isGeospatial?Math.round(s.zoom+Math.log2(gt/o)+c):Math.ceil(s.zoom+c);if(typeof e=="number"&&Number.isFinite(e)&&f<e){if(!n)return[];f=e}if(typeof t=="number"&&Number.isFinite(t)&&f>t&&(f=t),l!=null&&s.zoom<l)return[];if(u!=null&&s.zoom>u)return[];let d=n;return r&&a&&n&&!s.isGeospatial&&(d=rs(n,r)),s.isGeospatial?Fd(s,f,i,n):Wd(s,f,o,d||Nd,a)}function qd(s){let t={},e;return i=>{for(const n in i)if(!Yd(i[n],t[n])){e=s(i),t=i;break}return e}}function Yd(s,t){if(s===t)return!0;if(Array.isArray(s)){const e=s.length;if(!t||t.length!==e)return!1;for(let i=0;i<e;i++)if(s[i]!==t[i])return!1;return!0}return!1}const Gn=1,Ke=2,Kd="never",Zd="no-overlap",cs="best-available",Xd=5,Jd={[cs]:tp,[Zd]:ep,[Kd]:()=>{}},Qd={extent:null,tileSize:512,maxZoom:null,minZoom:null,maxCacheSize:null,maxCacheByteSize:null,refinementStrategy:"best-available",zRange:null,maxRequests:6,debounceTime:0,zoomOffset:0,visibleMinZoom:null,visibleMaxZoom:null,onTileLoad:()=>{},onTileUnload:()=>{},onTileError:()=>{}};class ls{constructor(t){this._getCullBounds=qd(jd),this.opts={...Qd,...t},this.setOptions(this.opts),this.onTileLoad=e=>{this.opts.onTileLoad?.(e),this.opts.maxCacheByteSize!==null&&(this._cacheByteSize+=e.byteLength,this._resizeCache())},this._requestScheduler=new ka({throttleRequests:this.opts.maxRequests>0||this.opts.debounceTime>0,maxRequests:this.opts.maxRequests,debounceTime:this.opts.debounceTime}),this._cache=new Map,this._tiles=[],this._dirty=!1,this._cacheByteSize=0,this._viewport=null,this._zRange=null,this._selectedTiles=null,this._frameNumber=0,this._modelMatrix=new Et,this._modelMatrixInverse=new Et}get tiles(){return this._tiles}get selectedTiles(){return this._selectedTiles}get isLoaded(){return this._selectedTiles!==null&&this._selectedTiles.every(t=>t.isLoaded)}get needsReload(){return this._selectedTiles!==null&&this._selectedTiles.some(t=>t.needsReload)}setOptions(t){Object.assign(this.opts,t),Number.isFinite(t.maxZoom)&&(this._maxZoom=Math.floor(t.maxZoom)),Number.isFinite(t.minZoom)&&(this._minZoom=Math.ceil(t.minZoom)),this._viewport=null}finalize(){for(const t of this._cache.values())t.isLoading&&t.abort();this._cache.clear(),this._tiles=[],this._selectedTiles=null}reloadAll(){for(const t of this._cache.keys()){const e=this._cache.get(t);!this._selectedTiles||!this._selectedTiles.includes(e)?this._cache.delete(t):e.setNeedsReload()}}update(t,{zRange:e,modelMatrix:i}={zRange:null,modelMatrix:null}){const n=i?new Et(i):new Et,o=!n.equals(this._modelMatrix);if(!this._viewport||!t.equals(this._viewport)||!Pe(this._zRange,e)||o){o&&(this._modelMatrixInverse=n.clone().invert(),this._modelMatrix=n),this._viewport=t,this._zRange=e;const a=this.getTileIndices({viewport:t,maxZoom:this._maxZoom,minZoom:this._minZoom,zRange:e,modelMatrix:this._modelMatrix,modelMatrixInverse:this._modelMatrixInverse});this._selectedTiles=a.map(c=>this._getTile(c,!0)),this._dirty&&this._rebuildTree()}else this.needsReload&&(this._selectedTiles=this._selectedTiles.map(a=>this._getTile(a.index,!0)));const r=this.updateTileStates();return this._pruneRequests(),this._dirty&&this._resizeCache(),r&&this._frameNumber++,this._frameNumber}isTileVisible(t,e,i){if(!t.isVisible)return!1;if(e&&this._viewport){const n=this._getCullBounds({viewport:this._viewport,z:this._zRange,cullRect:e});let{bbox:o}=t;for(const[r,a,c,l]of n){let u;if("west"in o)u=o.west<c&&o.east>r&&o.south<l&&o.north>a;else{if(i&&!Et.IDENTITY.equals(i)){const[h,p,g,y]=rs([o.left,o.top,o.right,o.bottom],i);o={left:h,top:p,right:g,bottom:y}}const f=Math.min(o.top,o.bottom),d=Math.max(o.top,o.bottom);u=o.left<c&&o.right>r&&f<l&&d>a}if(u)return!0}return!1}return!0}getTileIndices({viewport:t,maxZoom:e,minZoom:i,zRange:n,modelMatrix:o,modelMatrixInverse:r}){const{tileSize:a,extent:c,zoomOffset:l,visibleMinZoom:u,visibleMaxZoom:f}=this.opts;return Hd({viewport:t,maxZoom:e,minZoom:i,zRange:n,tileSize:a,extent:c,modelMatrix:o,modelMatrixInverse:r,zoomOffset:l,visibleMinZoom:u,visibleMaxZoom:f})}getTileId(t){return`${t.x}-${t.y}-${t.z}`}getTileZoom(t){return t.z}getTileMetadata(t){const{tileSize:e}=this.opts;return{bbox:Vd(this._viewport,t.x,t.y,t.z,e)}}getParentIndex(t){const e=Math.floor(t.x/2),i=Math.floor(t.y/2),n=t.z-1;return{x:e,y:i,z:n}}updateTileStates(){const t=this.opts.refinementStrategy||cs,e=new Array(this._cache.size);let i=0;for(const n of this._cache.values())e[i++]=n.isVisible,n.isSelected=!1,n.isVisible=!1;for(const n of this._selectedTiles)n.isSelected=!0,n.isVisible=!0;(typeof t=="function"?t:Jd[t])(Array.from(this._cache.values())),i=0;for(const n of this._cache.values())if(e[i++]!==n.isVisible)return!0;return!1}_pruneRequests(){const{maxRequests:t=0}=this.opts,e=[];let i=0;for(const n of this._cache.values())n.isLoading&&(i++,!n.isSelected&&!n.isVisible&&e.push(n));for(;t>0&&i>t&&e.length>0;)e.shift().abort(),i--}_rebuildTree(){const{_cache:t}=this;for(const e of t.values())e.parent=null,e.children&&(e.children.length=0);for(const e of t.values()){const i=this._getNearestAncestor(e);e.parent=i,i?.children&&i.children.push(e)}}_resizeCache(){const{_cache:t,opts:e}=this,i=e.maxCacheSize??(e.maxCacheByteSize!==null?1/0:Xd*this.selectedTiles.length),n=e.maxCacheByteSize??1/0;if(t.size>i||this._cacheByteSize>n){for(const[r,a]of t)if(!a.isVisible&&!a.isSelected&&(this._cacheByteSize-=e.maxCacheByteSize!==null?a.byteLength:0,t.delete(r),this.opts.onTileUnload?.(a)),t.size<=i&&this._cacheByteSize<=n)break;this._rebuildTree(),this._dirty=!0}this._dirty&&(this._tiles=Array.from(this._cache.values()).sort((r,a)=>r.zoom-a.zoom),this._dirty=!1)}_getTile(t,e){const i=this.getTileId(t);let n=this._cache.get(i),o=!1;return!n&&e?(n=new md(t),Object.assign(n,this.getTileMetadata(n.index)),Object.assign(n,{id:i,zoom:this.getTileZoom(n.index)}),o=!0,this._cache.set(i,n),this._dirty=!0):n&&n.needsReload&&(o=!0),n&&o&&n.loadData({getData:this.opts.getTileData,requestScheduler:this._requestScheduler,onLoad:this.onTileLoad,onError:this.opts.onTileError}),n}_getNearestAncestor(t){const{_minZoom:e=0}=this;let i=t.index;for(;this.getTileZoom(i)>e;){i=this.getParentIndex(i);const n=this._getTile(i);if(n)return n}return null}}function tp(s){for(const t of s)t.state=0;for(const t of s)t.isSelected&&!br(t)&&us(t);for(const t of s)t.isVisible=!!(t.state&Ke)}function ep(s){for(const e of s)e.state=0;for(const e of s)e.isSelected&&br(e);const t=Array.from(s).sort((e,i)=>e.zoom-i.zoom);for(const e of t)if(e.isVisible=!!(e.state&Ke),e.children&&(e.isVisible||e.state&Gn))for(const i of e.children)i.state=Gn;else e.isSelected&&us(e)}function br(s){let t=s;for(;t;){if(t.isLoaded||t.content)return t.state|=Ke,!0;t=t.parent}return!1}function us(s){for(const t of s.children)t.isLoaded||t.content?t.state|=Ke:us(t)}const ip={TilesetClass:ls,data:{type:"data",value:[]},dataComparator:kd.equal,renderSubLayers:{type:"function",value:s=>new is(s)},getTileData:{type:"function",optional:!0,value:null},onViewportLoad:{type:"function",optional:!0,value:null},onTileLoad:{type:"function",value:s=>{}},onTileUnload:{type:"function",value:s=>{}},onTileError:{type:"function",value:s=>console.error(s)},extent:{type:"array",optional:!0,value:null,compare:!0},tileSize:512,maxZoom:null,minZoom:0,maxCacheSize:null,maxCacheByteSize:null,refinementStrategy:cs,zRange:null,maxRequests:6,debounceTime:0,zoomOffset:0,visibleMinZoom:null,visibleMaxZoom:null};class ne extends wt{initializeState(){this.state={tileset:null,isLoaded:!1}}finalizeState(){this.state?.tileset?.finalize()}get isLoaded(){return!!this.state?.tileset?.selectedTiles?.every(t=>t.isLoaded&&(!t.content||!t.layers||t.layers.every(e=>e.isLoaded)))}shouldUpdateState({changeFlags:t}){return t.somethingChanged}updateState({changeFlags:t}){let{tileset:e}=this.state;const i=t.propsOrDataChanged||t.updateTriggersChanged,n=t.dataChanged||t.updateTriggersChanged&&(t.updateTriggersChanged.all||t.updateTriggersChanged.getTileData);e?i&&(e.setOptions(this._getTilesetOptions()),n?e.reloadAll():e.tiles.forEach(o=>{o.layers=null})):(e=new this.props.TilesetClass(this._getTilesetOptions()),this.setState({tileset:e})),this._updateTileset()}_getTilesetOptions(){const{tileSize:t,maxCacheSize:e,maxCacheByteSize:i,refinementStrategy:n,extent:o,maxZoom:r,minZoom:a,maxRequests:c,debounceTime:l,zoomOffset:u,visibleMinZoom:f,visibleMaxZoom:d}=this.props;return{maxCacheSize:e,maxCacheByteSize:i,maxZoom:r,minZoom:a,tileSize:t,refinementStrategy:n,extent:o,maxRequests:c,debounceTime:l,zoomOffset:u,visibleMinZoom:f,visibleMaxZoom:d,getTileData:this.getTileData.bind(this),onTileLoad:this._onTileLoad.bind(this),onTileError:this._onTileError.bind(this),onTileUnload:this._onTileUnload.bind(this)}}_updateTileset(){const t=this.state.tileset,{zRange:e,modelMatrix:i}=this.props,n=t.update(this.context.viewport,{zRange:e,modelMatrix:i}),{isLoaded:o}=t,r=this.state.isLoaded!==o,a=this.state.frameNumber!==n;o&&(r||a)&&this._onViewportLoad(),a&&this.setState({frameNumber:n}),this.state.isLoaded=o}_onViewportLoad(){const{tileset:t}=this.state,{onViewportLoad:e}=this.props;e&&e(t.selectedTiles)}_onTileLoad(t){this.props.onTileLoad(t),t.layers=null,this.setNeedsUpdate()}_onTileError(t,e){this.props.onTileError(t),e.layers=null,this.setNeedsUpdate()}_onTileUnload(t){this.props.onTileUnload(t)}getTileData(t){const{data:e,getTileData:i,fetch:n}=this.props,{signal:o}=t;return t.url=typeof e=="string"||Array.isArray(e)?Dd(e,t):null,i?i(t):n&&t.url?n(t.url,{propName:"data",layer:this,signal:o}):null}renderSubLayers(t){return this.props.renderSubLayers(t)}getSubLayerPropsByTile(t){return null}getPickingInfo(t){const e=t.sourceLayer,i=e.props.tile,n=t.info;return n.picked&&(n.tile=i),n.sourceTile=i,n.sourceTileSubLayer=e,n}_updateAutoHighlight(t){t.sourceTileSubLayer.updateAutoHighlight(t)}renderLayers(){const{visibleMinZoom:t,visibleMaxZoom:e,minZoom:i,extent:n}=this.props,o=this.context.viewport.zoom;if(t!=null&&o<t||e!=null&&o>e||i!=null&&!n&&o<i){for(const a of this.state.tileset.tiles)a.layers=null;return[]}return this.state.tileset.tiles.map(a=>{const c=this.getSubLayerPropsByTile(a);if(!(!a.isLoaded&&!a.content))if(a.layers)c&&a.layers[0]&&Object.keys(c).some(l=>a.layers[0].props[l]!==c[l])&&(a.layers=a.layers.map(l=>l.clone(c)));else{const l=this.renderSubLayers({...this.props,...this.getSubLayerProps({id:a.id,updateTriggers:this.props.updateTriggers}),data:a.content,_offset:0,tile:a});a.layers=ao(l,Boolean).map(u=>u.clone({tile:a,...c}))}return a.layers})}filterSubLayer({layer:t,cullRect:e}){const{tile:i}=t.props,{modelMatrix:n}=this.props;return this.state.tileset.isTileVisible(i,e,n?new Et(n):null)}}ne.defaultProps=ip;ne.layerName="TileLayer";class sp{levels;projectTo3857;projectFrom3857;projectTo4326;projectFrom4326;projectedBounds;constructor(t){if(t.levels.length===0)throw new Error("AffineTileset requires at least one level");this.levels=t.levels,this.projectTo3857=t.projectTo3857,this.projectFrom3857=t.projectFrom3857,this.projectTo4326=t.projectTo4326,this.projectFrom4326=t.projectFrom4326,this.projectedBounds=t.levels[0].projectedBounds}}class np{tileWidth;tileHeight;matrixWidth;matrixHeight;metersPerPixel;projectedBounds;_affine;_invAffine;constructor(t){this._affine=t.affine,this._invAffine=ms(t.affine),this.tileWidth=t.tileWidth,this.tileHeight=t.tileHeight,this.matrixWidth=Math.ceil(t.arrayWidth/t.tileWidth),this.matrixHeight=Math.ceil(t.arrayHeight/t.tileHeight);const e=Ir(t.affine),i=Or(t.affine);this.metersPerPixel=Math.sqrt(Math.abs(e*i))*t.mpu;const n=[st(t.affine,0,0),st(t.affine,t.arrayWidth,0),st(t.affine,0,t.arrayHeight),st(t.affine,t.arrayWidth,t.arrayHeight)],o=n.map(([a])=>a),r=n.map(([,a])=>a);this.projectedBounds=[Math.min(...o),Math.min(...r),Math.max(...o),Math.max(...r)]}projectedTileCorners(t,e){const i=this.tileWidth,n=this.tileHeight,o=this._affine;return{topLeft:st(o,t*i,e*n),topRight:st(o,(t+1)*i,e*n),bottomLeft:st(o,t*i,(e+1)*n),bottomRight:st(o,(t+1)*i,(e+1)*n)}}tileTransform(t,e){const i=Rr(t*this.tileWidth,e*this.tileHeight),n=zr(this._affine,i),o=ms(n);return{forwardTransform:(r,a)=>st(n,r,a),inverseTransform:(r,a)=>st(o,r,a)}}crsBoundsToTileRange(t,e,i,n){const o=this._invAffine,r=[st(o,t,e),st(o,i,e),st(o,t,n),st(o,i,n)],a=r.map(([w])=>w),c=r.map(([,w])=>w),l=Math.min(...a),u=Math.max(...a),f=Math.min(...c),d=Math.max(...c),h=this.tileWidth,p=this.tileHeight,g=this.matrixWidth-1,y=this.matrixHeight-1,v=Math.max(0,Math.floor(l/h)),C=Math.min(g,Math.floor(u/h)),b=Math.max(0,Math.floor(f/p)),P=Math.min(y,Math.floor(d/p));return{minCol:v,maxCol:C,minRow:b,maxRow:P}}}function Cr(s,{semiMajorAxis:t}={}){switch(s=s.toLowerCase(),s){case"m":case"metre":case"meter":case"meters":return 1;case"foot":return .3048;case"us survey foot":return 1200/3937}if(s==="degree"){if(t===void 0)throw new Error("CRS with degrees unit requires ellipsoid semi-major-axis");return 2*Math.PI*t/360}throw new Error(`Unsupported CRS units: ${s} when computing metersPerUnit.`)}function fs(s){const t=Er(s);return t.projName==="longlat"&&(!t.units||t.units==="unknown")&&(t.units="degree",t.to_meter=void 0),t}const Vn=new Map;async function Pr(s){const t=`EPSG:${s}`,e=Vn.get(t);if(e!==void 0)return e;const i=await op(s),n=fs(i);return Vn.set(t,n),n}async function op(s){const t=`https://epsg.io/${s}.json`,e=await fetch(t);if(!e.ok)throw new Error(`Failed to fetch PROJJSON from ${t}`);return await e.json()}function Di(s,t,e,i,n,o={}){const{densifyPts:r=21}=o,a=[t,i,i,t],c=[e,e,n,n];let l=1/0,u=1/0,f=-1/0,d=-1/0;for(let h=0;h<4;h++){const p=a[h],g=c[h],y=a[(h+1)%4],v=c[(h+1)%4];for(let C=0;C<=r;C++){const b=C/(r+1),[P,w]=s(p+(y-p)*b,g+(v-g)*b);P<l&&(l=P),w<u&&(u=w),P>f&&(f=P),w>d&&(d=w)}}return[l,u,f,d]}const Wn=6378137,Hn=85.05112877980659;function rp(s,t){const e=s*Math.PI*Wn/180,i=t*Math.PI/180,n=Math.log(Math.tan(Math.PI/4+i/2))*Wn;return[e,n]}function wr(s,t){return(e,i)=>{const[n,o]=s(e,i);if(Number.isFinite(n)&&Number.isFinite(o))return[n,o];const[r,a]=t(e,i),c=Math.max(-Hn,Math.min(Hn,a));return rp(r,c)}}const ap=65536;class Lr{entries=new Map;maxEntries;constructor({maxEntries:t=ap}={}){this.maxEntries=Math.max(0,t)}get size(){return this.entries.size}get(t,e,i){const n=`${t}/${e}/${i}`,o=this.entries.get(n);if(o!==void 0)return this.entries.delete(n),this.entries.set(n,o),o}set(t,e,i,n){const o=`${t}/${e}/${i}`;this.entries.delete(o),this.entries.set(o,n)}sweep(){if(this.entries.size<=this.maxEntries)return;const t=Math.floor(this.maxEntries/2),e=this.entries.size-t,i=[];for(const n of this.entries.keys())if(i.push(n),i.length>=e)break;for(const n of i)this.entries.delete(n)}}const qn=512,cp=[[.5,.5],[0,0],[0,1],[1,0],[1,1]],lp=cp.concat([[0,.5],[.5,0],[1,.5],[.5,1]]),$i=6378137,ji=2*Math.PI*$i,Yn=ji/2,Kn=85.05112877980659;class $e{x;y;z;descriptor;childVisible;selected;_children;constructor(t,e,i,{descriptor:n}){this.x=t,this.y=e,this.z=i,this.descriptor=n}get level(){return this.descriptor.levels[this.z]}get children(){if(!this._children){const t=this.descriptor.levels.length-1;if(this.z>=t)return this._children=null,null;const e=this.z+1,i=this.descriptor.levels[e],n=this.level.projectedTileCorners(this.x,this.y),o=_p(n),{minCol:r,maxCol:a,minRow:c,maxRow:l}=i.crsBoundsToTileRange(...o),u=[],{descriptor:f}=this;for(let d=c;d<=l;d++)for(let h=r;h<=a;h++)u.push(new $e(h,d,e,{descriptor:f}));this._children=u.length>0?u:null}return this._children}update(t){this.childVisible=!1,this.selected=!1;const{viewport:e,cullingVolume:i,elevationBounds:n,minZ:o,maxZ:r=this.descriptor.levels.length-1,project:a,bounds:c,pixelRatio:l,boundingVolumeCache:u}=t,{boundingVolume:f,commonSpaceBounds:d}=this.getBoundingVolume(n,a,u);if(c&&!this.insideBounds(c,d)||i.computeVisibility(f)<0)return!1;const p=this.children;if(!this.childVisible&&this.z>=o){const g=yp(f,e.zoom);if(this.level.metersPerPixel*l/g<=1||this.z>=r||p===null&&this.z>=o)return this.selected=!0,!0}if(p&&p.length>0){this.selected=!1;let g=!1;for(const y of p)y.update(t)&&(g=!0);return this.childVisible=g,g}return!0}getSelected(t=[]){if(this.selected&&t.push(this),this._children)for(const e of this._children)e.getSelected(t);return t}insideBounds(t,e){const[i,n,o,r]=t,[a,c,l,u]=e;return a<o&&l>i&&c<r&&u>n}getBoundingVolume(t,e,i){const n=i.get(this.z,this.x,this.y);if(n&&n.zRange[0]===t[0]&&n.zRange[1]===t[1])return n;const o=this.computeBoundingVolume(t,e);return i.set(this.z,this.x,this.y,{zRange:t,...o}),o}computeBoundingVolume(t,e){return e&&ht(!1,"TODO: implement getBoundingVolume in Globe view"),this._getGenericBoundingVolume(t)}_getGenericBoundingVolume(t){const[e,i]=t,n=this.level.projectedTileCorners(this.x,this.y),r=fp(lp,n,this.descriptor.projectTo3857,this.descriptor.projectTo4326).map(h=>hp(h)),a=[];for(const h of r)a.push([h[0],h[1],e]),e!==i&&a.push([h[0],h[1],i]);let c=Number.POSITIVE_INFINITY,l=Number.POSITIVE_INFINITY,u=Number.NEGATIVE_INFINITY,f=Number.NEGATIVE_INFINITY;for(const[h,p]of r)h<c&&(c=h),p<l&&(l=p),h>u&&(u=h),p>f&&(f=p);const d=[c,l,u,f];return{boundingVolume:_r(a),commonSpaceBounds:d}}}function up(s,t){return(e,i)=>{const[n,o]=s(e,i);if(Number.isFinite(n)&&Number.isFinite(o))return[n,o];const[r,a]=t(e,i),l=Math.max(-Kn,Math.min(Kn,a))*Math.PI/180,u=r*Math.PI*$i/180,f=Math.log(Math.tan(Math.PI/4+l/2))*$i;return[u,f]}}function fp(s,t,e,i){const{topLeft:n,topRight:o,bottomLeft:r,bottomRight:a}=t,c=up(e,i),l=[];for(const[u,f]of s){const[d,h]=xp(n,o,r,a,u,f);l.push(c(d,h))}return l}function hp([s,t]){const e=Math.max(-Yn,Math.min(Yn,t));return[(s/ji+.5)*qn,(e/ji+.5)*qn]}const dp=100;function pp(s){const{descriptor:t,viewport:e,datasetWgs84Bounds:i}=s,n=t.levels[0],o=[];if(n.matrixWidth*n.matrixHeight<=dp){for(let p=0;p<n.matrixHeight;p++)for(let g=0;g<n.matrixWidth;g++)o.push(new $e(g,p,0,{descriptor:t}));return o}const a=e.getBounds(),c=[Math.max(i[0],a[0]),Math.max(i[1],a[1]),Math.min(i[2],a[2]),Math.min(i[3],a[3])];if(c[0]>c[2]||c[1]>c[3])return o;const[l,u,f,d]=Di(t.projectFrom4326,c[0],c[1],c[2],c[3]),h=n.crsBoundsToTileRange(l,u,f,d);for(let p=h.minRow;p<=h.maxRow;p++)for(let g=h.minCol;g<=h.maxCol;g++)o.push(new $e(g,p,0,{descriptor:t}));return o}function gp(s,t){const{viewport:e,maxZ:i,zRange:n,wgs84Bounds:o,pixelRatio:r=1}=t,a=t.boundingVolumeCache??new Lr;a.sweep();const c=e instanceof co&&e.resolution?e.projectPosition:null,l=Object.values(e.getFrustumPlanes()).map(({normal:O,distance:F})=>new kt(O.clone().negate(),F)),u=new ut(l),f=e.distanceScales.unitsPerMeter[2],d=n&&n[0]*f||0,h=n&&n[1]*f||0,p=0,[g,y,v,C]=o,b=Be([g,y]),P=Be([v,C]),w=[b[0],b[1],P[0],P[1]],M=pp({descriptor:s,viewport:e,datasetWgs84Bounds:o}),I={viewport:e,project:c,cullingVolume:u,elevationBounds:[d,h],minZ:p,maxZ:i,bounds:w,pixelRatio:r,boundingVolumeCache:a};for(const O of M)O.update(I);const B=[];for(const O of M)O.getSelected(B);return B}function mp(s,t){return 40075016686e-3*Math.cos(s*Math.PI/180)/2**(t+8)}function yp(s,t){const[e,i]=Ca(s.center);return mp(i,t)}function _p({topLeft:s,topRight:t,bottomLeft:e,bottomRight:i}){const n=[s[0],t[0],e[0],i[0]],o=[s[1],t[1],e[1],i[1]];return[Math.min(...n),Math.min(...o),Math.max(...n),Math.max(...o)]}function xp(s,t,e,i,n,o){const r=(1-n)*(1-o),a=n*(1-o),c=(1-n)*o,l=n*o;return[s[0]*r+t[0]*a+e[0]*c+i[0]*l,s[1]*r+t[1]*a+e[1]*c+i[1]*l]}function vp(s,t){const e=s.length;if(e<2)return s;const{getCenter:i,reference:n}=t,o=n[0],r=n[1],a=new Float64Array(e);for(let u=0;u<e;u++){const f=i(s[u]),d=f[0]-o,h=f[1]-r;a[u]=d*d+h*h}const c=new Uint32Array(e);for(let u=0;u<e;u++)c[u]=u;c.sort((u,f)=>a[u]-a[f]);const l=s.slice();for(let u=0;u<e;u++)s[u]=l[c[u]];return s}function Tr(s,t,e){const[i,n,o,r]=t.getBounds(),a=[(i+o)/2,(n+r)/2];return vp(s,{reference:a,getCenter:e})}class bp extends ls{descriptor;wgs84Bounds;getPixelRatio;boundingVolumeCache;constructor(t,e,{getPixelRatio:i,maxBoundingVolumeCacheSize:n}={}){super(t),this.descriptor=e,this.getPixelRatio=i??(()=>1),this.boundingVolumeCache=new Lr({maxEntries:n});const o=Di(this.descriptor.projectTo4326,...this.descriptor.projectedBounds),r=85.0511287798066;this.wgs84Bounds=[o[0],Math.max(o[1],-r),o[2],Math.min(o[3],r)]}getTileIndices(t){const{viewport:e,minZoom:i}=t;if(typeof i=="number"&&e.zoom<i)return[];const n=this.descriptor.levels.length-1,o=typeof t.maxZoom=="number"?Math.min(t.maxZoom,n):n,r=gp(this.descriptor,{viewport:e,maxZ:o,zRange:t.zRange??null,wgs84Bounds:this.wgs84Bounds,pixelRatio:this.getPixelRatio(),boundingVolumeCache:this.boundingVolumeCache});return this.sortTileIndicesByDistance(r,e)}sortTileIndicesByDistance(t,e){const{maxRequests:i}=this.opts;if(t.length<=i)return t;const n=this.descriptor;return Tr(t,e,o=>{const{x:r,y:a,z:c}=o,{topLeft:l,bottomRight:u}=n.levels[c].projectedTileCorners(r,a),f=[(l[0]+u[0])/2,(l[1]+u[1])/2];return n.projectTo4326(f[0],f[1])})}getTileId(t){return`${t.x}-${t.y}-${t.z}`}getParentIndex(t){if(t.z===0)return t;const e=this.descriptor.levels[t.z],i=this.descriptor.levels[t.z-1],n=i.metersPerPixel*i.tileWidth,o=i.metersPerPixel*i.tileHeight,r=e.metersPerPixel*e.tileWidth,a=e.metersPerPixel*e.tileHeight,c=n/r,l=o/a;return{x:Math.floor(t.x/c),y:Math.floor(t.y/l),z:t.z-1}}getTileZoom(t){return t.z}getTileMetadata(t){const{x:e,y:i,z:n}=t,o=this.descriptor.levels[n],{tileHeight:r,tileWidth:a}=o,{topLeft:c,topRight:l,bottomLeft:u,bottomRight:f}=o.projectedTileCorners(e,i),d={topLeft:c,topRight:l,bottomLeft:u,bottomRight:f},h=[Math.min(c[0],l[0],u[0],f[0]),Math.min(c[1],l[1],u[1],f[1]),Math.max(c[0],l[0],u[0],f[0]),Math.max(c[1],l[1],u[1],f[1])],[p,g,y,v]=Di(this.descriptor.projectTo4326,...h),{forwardTransform:C,inverseTransform:b}=o.tileTransform(e,i);return{bbox:{west:p,south:g,east:y,north:v},projectedBbox:{left:h[0],bottom:h[1],right:h[2],top:h[3]},projectedCorners:d,tileWidth:a,tileHeight:r,forwardTransform:C,inverseTransform:b}}}const Gi=512,Cp=40075016686e-3,Zn=Gi/Cp,Pp={...ne.defaultProps,maxError:.125,debug:!1,debugOpacity:.5};class je extends wt{static layerName="RasterTileLayer";static defaultProps=Pp;_tilesetDescriptor(){return this.props.tilesetDescriptor}_getTileDataCallback(){return this.props.getTileData}_renderTileCallback(){return this.props.renderTile}_renderDebug(t,e){const i=this._tilesetDescriptor();return i?Hh(`${this.id}-${t.id}-bounds`,t,i.projectTo4326):[]}renderLayers(){const t=this._tilesetDescriptor(),e=this._getTileDataCallback(),i=this._renderTileCallback();return!t||!e||!i?null:this._renderTileLayer(t,e,i)}_renderTileLayer(t,e,i){const n=this.context.device;class o extends bp{constructor(M){super(M,t,{getPixelRatio:()=>{const I=n.getDefaultCanvasContext(),[B]=I.getDrawingBufferSize(),[O]=I.getCSSSize();return O?B/O:1}})}}const{tileSize:r,zoomOffset:a,maxZoom:c,minZoom:l,extent:u,debounceTime:f,maxCacheSize:d,maxCacheByteSize:h,maxRequests:p,refinementStrategy:g,updateTriggers:y,onTileError:v,onTileLoad:C,onTileUnload:b,onViewportLoad:P}=this.props;return new ne({id:`raster-tile-layer-${this.id}`,TilesetClass:o,getTileData:w=>this._wrapGetTileData(w,e),renderSubLayers:w=>this._renderSubLayers(w,t,i),updateTriggers:{renderSubLayers:y?.renderTile},tileSize:r,zoomOffset:a,maxZoom:c,minZoom:l,extent:u,debounceTime:f,maxCacheSize:d,maxCacheByteSize:h,maxRequests:p,refinementStrategy:g,onTileError:v,onTileLoad:C,onTileUnload:b,onViewportLoad:P})}async _wrapGetTileData(t,e){const{signal:i}=t,n=this.props.signal,o=n&&i?AbortSignal.any([n,i]):n??i,r={device:this.context.device,signal:o};return e(t,r)}_renderSubLayers(t,e,i){const{maxError:n,debug:o,debugOpacity:r}=this.props,a=t.tile,c=o?this._renderDebug(a,t.data??null):[];if(!t.data)return c;const{forwardTransform:l,inverseTransform:u}=a,f=i(t.data);if(!f)return c;const{image:d,renderPipeline:h}=f,{width:p,height:g}=t.data,y=this.context.viewport.resolution!==void 0,v=y?{forwardTransform:l,inverseTransform:u,forwardReproject:e.projectTo4326,inverseReproject:e.projectFrom4326}:{forwardTransform:l,inverseTransform:u,forwardReproject:e.projectTo3857,inverseReproject:e.projectFrom3857},C=y?{}:{coordinateSystem:"cartesian",coordinateOrigin:[Gi/2,Gi/2,0],modelMatrix:[Zn,0,0,0,0,Zn,0,0,0,0,1,0,0,0,0,1]};return[new pd(this.getSubLayerProps({id:`${t.id}-raster`,width:p,height:g,...d!==void 0&&{image:d},renderPipeline:h,maxError:n,reprojectionFns:v,debug:o,debugOpacity:r,...C})),...c]}}function wp(s){const{height:t,width:e}=s;if(s.layout==="band-separate")throw new Error("Band-separate images not yet implemented.");if(s.data.length===t*e*4)return s;if(s.data.length===t*e*3){const i=s.data.length/3*4,n=s.data instanceof Uint16Array,o=n?new Uint16Array(i):new Uint8ClampedArray(i),r=n?65535:255;for(let a=0;a<s.data.length/3;++a)o[a*4]=s.data[a*3],o[a*4+1]=s.data[a*3+1],o[a*4+2]=s.data[a*3+2],o[a*4+3]=r;return{...s,count:4,data:o}}else throw new Error(`Unexpected number of channels in raster data: ${s.data.length/(t*e)}`)}async function Ar(s){return typeof s=="string"||s instanceof URL?await ys.fromUrl(s):s instanceof ArrayBuffer?await ys.fromArrayBuffer(s):s}function Sr(s,t){const[e,i,n,o]=s.bbox,r=[t.forward([e,i]),t.forward([n,i]),t.forward([n,o]),t.forward([e,o])],a=r.map(h=>h[0]),c=r.map(h=>h[1]),l=Math.min(...a),u=Math.min(...c),f=Math.max(...a),d=Math.max(...c);return{west:l,south:u,east:f,north:d}}const Lp=`
  vec3 black_zero_to_rgb(float value) {
    return vec3(value, value, value);
  }
`,Tp={name:"black-is-zero",inject:{"fs:#decl":Lp,"fs:DECKGL_FILTER_COLOR":`
      color.rgb = black_zero_to_rgb(color.r);
    `}},Ap=`
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
`,Sp={name:"cielab-to-rgb",inject:{"fs:#decl":Ap,"fs:DECKGL_FILTER_COLOR":`
      color.rgb = cielabToRgb(color);
    `}},Mp=`
  vec3 cmykToRgb(vec4 cmyk) {
    // cmyk in [0.0, 1.0]
    float invK = 1.0 - cmyk.a;

    return vec3(
        (1.0 - cmyk.r) * invK,
        (1.0 - cmyk.g) * invK,
        (1.0 - cmyk.b) * invK
    );
  }
`,Ep={name:"cmyk-to-rgb",inject:{"fs:#decl":Mp,"fs:DECKGL_FILTER_COLOR":`
      color.rgb = cmykToRgb(color);
    `}},Ip=`
  vec3 white_zero_to_rgb(float value) {
    return vec3(1.0 - value, 1.0 - value, 1.0 - value);
  }
`,Op={name:"white-is-zero",inject:{"fs:#decl":Ip,"fs:DECKGL_FILTER_COLOR":`
      color.rgb = white_zero_to_rgb(color.r);
    `}},Kt="colormap",Rp={name:Kt,fs:`uniform ${Kt}Uniforms {
  int colormapIndex;
  float reversed;
} ${Kt};
`,inject:{"fs:#decl":`precision highp sampler2DArray;
uniform sampler2DArray colormapTexture;
`,"fs:DECKGL_FILTER_COLOR":`
      float idx = mix(color.r, 1.0 - color.r, ${Kt}.reversed);
      color = texture(
        colormapTexture,
        vec3(idx, 0.5, float(${Kt}.colormapIndex))
      );
    `},uniformTypes:{colormapIndex:"i32",reversed:"f32"},getUniforms:s=>({colormapTexture:s.colormapTexture,colormapIndex:s.colormapIndex??0,reversed:s.reversed??!1})},pi=4,et="compositeBands",zp={name:et,inject:{"fs:#decl":`
uniform sampler2D band0;
uniform sampler2D band1;
uniform sampler2D band2;
uniform sampler2D band3;

vec2 compositeBands_applyUv(vec2 uv, vec4 transform) {
  return uv * transform.zw + transform.xy;
}

float compositeBands_sampleSlot(int slot, vec2 uv) {
  if (slot == 0) return texture(band0, compositeBands_applyUv(uv, ${et}.uvTransform0)).r;
  if (slot == 1) return texture(band1, compositeBands_applyUv(uv, ${et}.uvTransform1)).r;
  if (slot == 2) return texture(band2, compositeBands_applyUv(uv, ${et}.uvTransform2)).r;
  if (slot == 3) return texture(band3, compositeBands_applyUv(uv, ${et}.uvTransform3)).r;
  return 0.0;
}
`,"fs:DECKGL_FILTER_COLOR":`
  float r = ${et}.channelMap.r >= 0 ? compositeBands_sampleSlot(${et}.channelMap.r, geometry.uv) : 0.0;
  float g = ${et}.channelMap.g >= 0 ? compositeBands_sampleSlot(${et}.channelMap.g, geometry.uv) : 0.0;
  float b = ${et}.channelMap.b >= 0 ? compositeBands_sampleSlot(${et}.channelMap.b, geometry.uv) : 0.0;
  float a = ${et}.channelMap.a >= 0 ? compositeBands_sampleSlot(${et}.channelMap.a, geometry.uv) : 1.0;
  color = vec4(r, g, b, a);
`},fs:`uniform ${et}Uniforms {
  vec4 uvTransform0;
  vec4 uvTransform1;
  vec4 uvTransform2;
  vec4 uvTransform3;
  ivec4 channelMap;
} ${et};
`,uniformTypes:{uvTransform0:"vec4<f32>",uvTransform1:"vec4<f32>",uvTransform2:"vec4<f32>",uvTransform3:"vec4<f32>",channelMap:"vec4<i32>"},getUniforms:s=>({band0:s.band0,band1:s.band1,band2:s.band2,band3:s.band3,uvTransform0:s.uvTransform0??[0,0,1,1],uvTransform1:s.uvTransform1??[0,0,1,1],uvTransform2:s.uvTransform2??[0,0,1,1],uvTransform3:s.uvTransform3??[0,0,1,1],channelMap:s.channelMap??[0,1,2,-1]})};function Bp(s,t){const e=[],i=new Map;for(const c of[s.r,s.g,s.b,s.a])if(c&&!i.has(c)){if(e.length>=pi)throw new Error(`CompositeBands supports at most ${pi} band slots`);i.set(c,e.length),e.push(c)}function n(c){return c?i.get(c)??-1:-1}const o={channelMap:[n(s.r),n(s.g),n(s.b),n(s.a)]},r=e[0];if(!r)throw new Error("At least one band is required");const a=t.get(r).texture;for(const[c,l]of i){const u=t.get(c);if(!u)throw new Error(`Band "${c}" not found in fetched bands`);o[`band${l}`]=u.texture,o[`uvTransform${l}`]=u.uvTransform}for(let c=e.length;c<pi;c++)o[`band${c}`]=a;return o}const Vi="nodata",Fp=`uniform ${Vi}Uniforms {
  float value;
} ${Vi};
`,Np={name:Vi,fs:Fp,inject:{"fs:DECKGL_FILTER_COLOR":`
    if (color.r == nodata.value) {
      discard;
    }
    `},uniformTypes:{value:"f32"},getUniforms:s=>({value:s.value})},kp={name:"mask-texture",inject:{"fs:#decl":"uniform sampler2D maskTexture;","fs:DECKGL_FILTER_COLOR":`
      float maskValue = texture(maskTexture, geometry.uv).r;
      if (maskValue == 0.0) {
        discard;
      }
    `},getUniforms:s=>({maskTexture:s.maskTexture})};function Up(s,t,e){const{samplesPerPixel:i,bitsPerSample:n,sampleFormat:o}=s.cachedTags,r=hs(i,n,o);return{data:t,format:r,width:e.width,height:e.height}}function hs(s,t,e){const i=Dp(s),n=$p(t),o=jp(e),r=`${i}:${o}:${n}`,a=Gp[r];if(!a)throw new Error(`Unsupported texture format for SamplesPerPixel=${s}, BitsPerSample=${t}, SampleFormat=${e}`);return a}function Dp(s){if(s===1||s===2||s===3||s===4)return s;throw new Error(`Unsupported SamplesPerPixel ${s}. Only 1, 2, 3, or 4 are supported.`)}function $p(s){const t=s[0];for(let e=1;e<s.length;e++)if(s[e]!==t)throw new Error(`Unsupported varying BitsPerSample ${s}. All samples must have the same bit width.`);if(t!==8&&t!==16&&t!==32)throw new Error(`Unsupported BitsPerSample ${t}. Only 8, 16, or 32 are supported.`);return t}function jp(s){const t=s[0];for(let e=1;e<s.length;e++)if(s[e]!==t)throw new Error(`Unsupported varying SampleFormat ${s}. All samples must have the same format.`);switch(t){case Ce.Uint:return"unorm";case Ce.Int:return"sint";case Ce.Float:return"float";default:throw new Error(`Unsupported SampleFormat ${s}`)}}const Gp={"1:sint:8":"r8sint","1:uint:8":"r8uint","1:unorm:8":"r8unorm","1:float:16":"r16float","1:sint:16":"r16sint","1:uint:16":"r16uint","1:unorm:16":"r16unorm","2:sint:8":"rg8sint","2:uint:8":"rg8uint","2:unorm:8":"rg8unorm","1:float:32":"r32float","1:sint:32":"r32sint","1:uint:32":"r32uint","2:float:16":"rg16float","2:sint:16":"rg16sint","2:uint:16":"rg16uint","2:unorm:16":"rg16unorm","4:sint:8":"rgba8sint","4:uint:8":"rgba8uint","4:unorm:8":"rgba8unorm","3:uint:16":"rgb16unorm-webgl","2:float:32":"rg32float","2:sint:32":"rg32sint","2:uint:32":"rg32uint","4:float:16":"rgba16float","4:sint:16":"rgba16sint","4:uint:16":"rgba16uint","4:unorm:16":"rgba16unorm","3:float:32":"rgb32float-webgl","4:float:32":"rgba32float","4:sint:32":"rgba32sint","4:uint:32":"rgba32uint"},ug=Object.freeze(Object.defineProperty({__proto__:null,createTextureProps:Up,inferTextureFormat:hs},Symbol.toStringTag,{value:"Module"}));function Vp(s,t){const{sampleFormat:e}=s.cachedTags;if(e===null)throw new Error("SampleFormat tag is required to infer render pipeline");if(e[0]===Ce.Uint)return Wp(s,t);throw new Error(`Inferring render pipeline for non-unsigned integers not yet supported. Found SampleFormat: ${e}`)}function Wp(s,t){const{bitsPerSample:e,colorMap:i,photometric:n,sampleFormat:o,samplesPerPixel:r,nodata:a}=s.cachedTags,c=[{module:yr,props:{textureName:h=>h.texture}}];if(a!==null){const h=2**e[0]-1,p=a/h;c.push({module:Np,props:{value:p}})}s.maskImage!==null&&c.push({module:kp,props:{maskTexture:h=>h.mask}});const l=Hp({count:r,photometric:n,device:t,colorMap:i});l&&c.push(l);const u=n===xt.Palette?{magFilter:"nearest",minFilter:"nearest"}:{magFilter:"linear",minFilter:"linear"};return{getTileData:async(h,p)=>{const{device:g,x:y,y:v,signal:C,pool:b}=p,P=await h.fetchTile(y,v,{boundless:!1,pool:b,signal:C});let{array:w}=P;const{width:M,height:I,mask:B}=w;let O=r;if(r===3&&(w=wp(w),O=4),w.layout==="band-separate")throw new Error("Band-separate images not yet implemented.");const F=hs(O,e,o);let G=w.data.byteLength;const U=g.createTexture({data:w.data,format:F,width:M,height:I,sampler:u});let V;return B!==null&&(V=g.createTexture({data:B,format:"r8unorm",width:M,height:I,sampler:{minFilter:"nearest",magFilter:"nearest"}}),G+=B.byteLength),{texture:U,mask:V,byteLength:G,height:w.height,width:w.width}},renderTile:h=>({renderPipeline:c.map((p,g)=>qp(p,h))})}}function Hp({count:s,colorMap:t,device:e,photometric:i}){if(s===3||s===4)return null;switch(i){case xt.MinIsWhite:return{module:Op};case xt.MinIsBlack:return{module:Tp};case xt.Rgb:return null;case xt.Palette:{if(!t)throw new Error("ColorMap is required for PhotometricInterpretation Palette");const{data:n,width:o,height:r}=Br(t),a=e.createTexture({dimension:"2d-array",data:n,format:"rgba8unorm",width:o,height:r,depth:1,mipLevels:1,sampler:{minFilter:"nearest",magFilter:"nearest",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge",addressModeW:"clamp-to-edge"}});return{module:Rp,props:{colormapTexture:a}}}case xt.Separated:return{module:Ep};case xt.Ycbcr:return null;case xt.Cielab:return{module:Sp};default:throw new Error(`Unsupported PhotometricInterpretation ${i}`)}}function qp(s,t){const{module:e,props:i}=s;if(!i)return{module:e};const n={};for(const[o,r]of Object.entries(i)){const a=typeof r=="function"?r(t):r;a!==void 0&&(n[o]=a)}return{module:e,props:n}}function Mr(s,t){const i=[...[...s.overviews].reverse(),s].map(n=>new np({affine:n.transform,arrayWidth:n.width,arrayHeight:n.height,tileWidth:n.tileWidth,tileHeight:n.tileHeight,mpu:t.mpu}));return new sp({levels:i,projectTo3857:t.projectTo3857,projectFrom3857:t.projectFrom3857,projectTo4326:t.projectTo4326,projectFrom4326:t.projectFrom4326})}class fg extends je{static layerName="COGLayer";static defaultProps={...je.defaultProps,epsgResolver:Pr};initializeState(){this.setState({})}updateState(t){super.updateState(t);const{props:e,oldProps:i,changeFlags:n}=t;(n.dataChanged||e.geotiff!==i.geotiff)&&(this.clearState(),this._parseGeoTIFF())}clearState(){this.setState({geotiff:void 0,tilesetDescriptor:void 0,defaultGetTileData:void 0,defaultRenderTile:void 0})}async _parseGeoTIFF(){const t=await Ar(this.props.geotiff),e=t.crs,i=typeof e=="number"?await this.props.epsgResolver(e):fs(e),n=Ie(i,"EPSG:4326"),o=(g,y)=>n.forward([g,y],!1),r=(g,y)=>n.inverse([g,y],!1),a=Ie(i,"EPSG:3857"),c=wr((g,y)=>a.forward([g,y],!1),o),l=(g,y)=>a.inverse([g,y],!1),u=i.units;if(!u)throw new Error("Source projection is missing 'units' property, cannot compute meters per unit");const f=Cr(u,{semiMajorAxis:i.datum?.a??i.a}),d=Mr(t,{projectTo4326:o,projectFrom4326:r,projectTo3857:c,projectFrom3857:l,mpu:f});if(this.props.onGeoTIFFLoad){const g=Sr(t,n);this.props.onGeoTIFFLoad(t,{projection:i,geographicBounds:g})}let h,p;(!this.props.getTileData||!this.props.renderTile)&&({getTileData:h,renderTile:p}=Vp(t,this.context.device)),this.setState({geotiff:t,tilesetDescriptor:d,defaultGetTileData:h,defaultRenderTile:p})}_tilesetDescriptor(){return this.state.tilesetDescriptor}_getTileDataCallback(){const t=this.state.geotiff;if(!t)return;const e=this.props.getTileData??this.state.defaultGetTileData;return e?async(n,o)=>{const{x:r,y:a,z:c}=n.index,l=c===t.overviews.length?t:t.overviews[t.overviews.length-1-c];return e(l,{device:o.device,x:r,y:a,signal:o.signal,pool:this.props.pool??eo()})}:void 0}_renderTileCallback(){const t=this.props.renderTile??this.state.defaultRenderTile;if(t)return t}}class Yp{constructor(t=1/0,e=Float64Array,i=Uint32Array){const n=t!==1/0;this.ids=n?new i(t):[],this.values=n?new e(t):[],this.capacity=t,this.length=0}clear(){this.length=0}push(t,e){if(this.length===this.capacity)throw new RangeError("Queue is at capacity.");let i=this.length++;for(;i>0;){const n=i-1>>1,o=this.values[n];if(e>=o)break;this.ids[i]=this.ids[n],this.values[i]=o,i=n}this.ids[i]=t,this.values[i]=e}pop(){if(this.length===0)return;const t=this.ids,e=this.values,i=t[0],n=--this.length;if(n>0){const o=t[n],r=e[n];let a=0;const c=n>>1;for(;a<c;){const l=(a<<1)+1,u=l+1,f=l+(+(u<n)&+(e[u]<e[l]));if(e[f]>=r)break;t[a]=t[f],e[a]=e[f],a=f}t[a]=o,e[a]=r}return i}peek(){return this.length>0?this.ids[0]:void 0}peekValue(){return this.length>0?this.values[0]:void 0}shrink(){Array.isArray(this.ids)&&(this.ids.length=this.length),Array.isArray(this.values)&&(this.values.length=this.length)}}const Xn=[Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array],gi=3;class ds{static from(t,e=0){if(e%8!==0)throw new Error("byteOffset must be 8-byte aligned.");if(!t||t.byteLength===void 0||"buffer"in t)throw new Error("Data must be an instance of ArrayBuffer or SharedArrayBuffer.");const[i,n]=new Uint8Array(t,e+0,2);if(i!==251)throw new Error("Data does not appear to be in a Flatbush format.");const o=n>>4;if(o!==gi)throw new Error(`Got v${o} data when expected v${gi}.`);const r=Xn[n&15];if(!r)throw new Error("Unrecognized array type.");const[a]=new Uint16Array(t,e+2,1),[c]=new Uint32Array(t,e+4,1);return new ds(c,a,r,void 0,t,e)}constructor(t,e=16,i=Float64Array,n=ArrayBuffer,o,r=0){if(t===void 0)throw new Error("Missing required argument: numItems.");if(isNaN(t)||t<=0)throw new Error(`Unexpected numItems value: ${t}.`);this.numItems=+t,this.nodeSize=Math.min(Math.max(+e,2),65535),this.byteOffset=r;let a=t,c=a;this._levelBounds=[a*4];do a=Math.ceil(a/this.nodeSize),c+=a,this._levelBounds.push(c*4);while(a!==1);this.ArrayType=i,this.IndexArrayType=c<16384?Uint16Array:Uint32Array;const l=Xn.indexOf(i),u=c*4*i.BYTES_PER_ELEMENT;if(l<0)throw new Error(`Unexpected typed array class: ${i}.`);const f=i,d=this.IndexArrayType;if(o)this.data=o,this._boxes=new f(o,r+8,c*4),this._indices=new d(o,r+8+u,c),this._pos=c*4,this.minX=this._boxes[this._pos-4],this.minY=this._boxes[this._pos-3],this.maxX=this._boxes[this._pos-2],this.maxY=this._boxes[this._pos-1];else{const h=this.data=new n(8+u+c*this.IndexArrayType.BYTES_PER_ELEMENT);this._boxes=new f(h,8,c*4),this._indices=new d(h,8+u,c),this._pos=0,this.minX=1/0,this.minY=1/0,this.maxX=-1/0,this.maxY=-1/0,new Uint8Array(h,0,2).set([251,(gi<<4)+l]),new Uint16Array(h,2,1)[0]=e,new Uint32Array(h,4,1)[0]=t}this._queue=new Yp}add(t,e,i=t,n=e){const o=this._pos,r=o>>2,a=this._boxes;return this._indices[r]=r,a[o]=t,a[o+1]=e,a[o+2]=i,a[o+3]=n,this._pos=o+4,t<this.minX&&(this.minX=t),e<this.minY&&(this.minY=e),i>this.maxX&&(this.maxX=i),n>this.maxY&&(this.maxY=n),r}finish(){if(this._pos>>2!==this.numItems)throw new Error(`Added ${this._pos>>2} items when expected ${this.numItems}.`);const t=this._boxes;if(this.numItems<=this.nodeSize){t[this._pos++]=this.minX,t[this._pos++]=this.minY,t[this._pos++]=this.maxX,t[this._pos++]=this.maxY;return}const{numItems:e,minX:i,minY:n,nodeSize:o,_indices:r,_levelBounds:a}=this,c=this.maxX-i||1,l=this.maxY-n||1,u=new Int32Array(e),f=65535,d=f/c,h=f/l;for(let g=0,y=0;g<e;g++){const v=t[y++],C=t[y++],b=t[y++],P=t[y++],w=d*((v+b)/2-i)|0,M=h*((C+P)/2-n)|0;u[g]=Jp(w,M)}Zp(u,t,r,0,e-1,o);let p=e*4;for(let g=0,y=0;g<a.length-1;g++){const v=a[g];for(;y<v;){const C=y;let b=t[y++],P=t[y++],w=t[y++],M=t[y++];for(let I=1;I<o&&y<v;I++)b=Math.min(b,t[y++]),P=Math.min(P,t[y++]),w=Math.max(w,t[y++]),M=Math.max(M,t[y++]);r[p>>2]=C,t[p++]=b,t[p++]=P,t[p++]=w,t[p++]=M}}this._pos=p}search(t,e,i,n,o){if(this._pos!==this._boxes.length)throw new Error("Data not yet indexed - call index.finish().");const{_boxes:r,_levelBounds:a,_indices:c,nodeSize:l}=this,u=this.numItems*4;let f=r.length-4,d=a.length-1;const h=[],p=[];let g=!1;for(;f!==void 0;){const y=Math.min(f+l*4,a[d]),v=f>=u;if(g)this._collectContained(f,y,d,u,p,o);else for(let C=f;C<y;C+=4){const b=r[C];if(i<b)continue;const P=r[C+1];if(n<P)continue;const w=r[C+2];if(t>w)continue;const M=r[C+3];if(e>M)continue;const I=c[C>>2]|0;if(v){const B=+(t<=b&&e<=P&&i>=w&&n>=M);h.push(I|B,d-1)}else(o===void 0||o(I,b,P,w,M))&&p.push(I)}d=h.pop(),f=h.pop(),f!==void 0&&(g=(f&1)===1,f&=-2)}return p}_collectContained(t,e,i,n,o,r){const a=this._boxes,c=this._indices;let l=t;for(let f=i;f>0;f--)l=c[l>>2];const u=Math.min(l+(e-t)*this.nodeSize**i,n);if(r===void 0)for(;l<u;l+=4)o.push(c[l>>2]|0);else for(;l<u;l+=4){const f=c[l>>2]|0;r(f,a[l],a[l+1],a[l+2],a[l+3])&&o.push(f)}}neighbors(t,e,i=1/0,n=1/0,o){if(this._pos!==this._boxes.length)throw new Error("Data not yet indexed - call index.finish().");const{_boxes:r,_levelBounds:a,_indices:c,_queue:l,nodeSize:u}=this,f=this.numItems*4,d=u*4,h=[],p=n*n,g=i===1;let y=p;for(l.push(r.length-4<<1,0);l.length;){const v=l.ids[0];if(v&1){if(l.pop(),h.push(v>>1),h.length===i)break;continue}l.pop();const C=v>>1,b=C<f,P=Math.min(C+d,Kp(C,a));for(let w=C;w<P;w+=4){const M=r[w],I=r[w+1],B=r[w+2],O=r[w+3],F=Math.max(Math.max(M-t,t-B),0),G=Math.max(Math.max(I-e,e-O),0),U=F*F+G*G;if(U>y)continue;const V=c[w>>2]|0;b?(o===void 0||o(V))&&(l.push(V<<1|1,U),g&&U<y&&(y=U)):l.push(V<<1,U)}}return l.clear(),h}}function Kp(s,t){let e=0,i=t.length-1;for(;e<i;){const n=e+i>>1;t[n]>s?i=n:e=n+1}return t[e]}function Zp(s,t,e,i,n,o){const r=[i,n];for(;r.length;){const a=r.pop()||0,c=r.pop()||0;if(a-c<=o&&Math.floor(c/o)>=Math.floor(a/o))continue;const l=s[c],u=s[c+a>>1],f=s[a],d=l>u!=l>f?l:u<l!=u<f?u:f;let h=c-1,p=a+1;for(;;){do h++;while(s[h]<d);do p--;while(s[p]>d);if(h>=p)break;Xp(s,t,e,h,p)}r.push(c,p,p+1,a)}}function Xp(s,t,e,i,n){const o=s[i];s[i]=s[n],s[n]=o;const r=4*i,a=4*n,c=t[r],l=t[r+1],u=t[r+2],f=t[r+3];t[r]=t[a],t[r+1]=t[a+1],t[r+2]=t[a+2],t[r+3]=t[a+3],t[a]=c,t[a+1]=l,t[a+2]=u,t[a+3]=f;const d=e[i];e[i]=e[n],e[n]=d}function Jp(s,t){let e=s^t,i=65535^e,n=65535^(s|t),o=s&(t^65535),r=e|i>>1,a=e>>1^e,c=n^(n>>1^i&o>>1),l=o^(e&n>>1^o>>1);return e=r&r>>2^a&a>>2,i=r&a>>2^a&(r^a)>>2,n=c^(r&c>>2^a&l>>2),o=l^(a&c>>2^(r^a)&l>>2),r=e&e>>4^i&i>>4,a=e&i>>4^i&(e^i)>>4,c=n^(e&n>>4^i&o>>4),l=o^(i&n>>4^(e^i)&o>>4),n=c^(r&c>>8^a&l>>8),o=l^(a&c>>8^(r^a)&l>>8),n^=n>>1,o^=o>>1,e=s^t,i=o|65535^(e|n),e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,((i<<1|e)>>>0)-2147483648}class Qp extends ls{getSources;getIndex;constructor(t,e,i){super(i),this.getIndex=e,this.getSources=t}getTileId(t){return t.id}getTileZoom(t){return 0}getTileMetadata(t){const{id:e,bbox:i}=t;return{id:e,bbox:i}}getParentIndex(t){return t}getTileIndices({viewport:t,maxZoom:e,minZoom:i}){if(t.zoom<(i??-1/0))return[];if(t.zoom>(e??1/0))return[];const n=this.getIndex();if(!n)return[];const o=t.getBounds(),r=n.search(...o),a=this.getSources(),c=r.map(u=>{const f=a[u];return{x:0,y:0,z:0,...f,id:f.id??String(u)}}),{maxRequests:l}=this.opts;return c.length<=l?c:Tr(c,t,u=>{const[f,d,h,p]=u.bbox;return[(f+h)*.5,(d+p)*.5]})}}const tg={sources:[]};class hg extends wt{static layerName="MosaicLayer";static defaultProps=tg;initializeState(t){super.initializeState(t),this._buildSpatialIndex()}updateState(t){super.updateState(t);const{props:e,oldProps:i}=t;e.sources!==i.sources&&this._buildSpatialIndex()}_buildSpatialIndex(){const{sources:t}=this.props;if(t.length===0){this.setState({index:null});return}const e=new ds(t.length);for(const i of t)e.add(...i.bbox);e.finish(),this.setState({index:e})}renderTileLayer(t){const{id:e,minZoom:i,maxZoom:n,debounceTime:o,extent:r,maxCacheByteSize:a,maxCacheSize:c,maxRequests:l,onSourceLoad:u,onSourceError:f,onSourceUnload:d,onViewportLoad:h}=this.props,p=()=>this.props.sources,g=()=>this.state.index;class y extends Qp{constructor(C){super(p,g,C)}}return new ne({id:`mosaic-layer-${e}`,TilesetClass:y,minZoom:i,maxZoom:n,debounceTime:o,extent:r,...a!==void 0&&{maxCacheByteSize:a},maxCacheSize:c,maxRequests:l,getTileData:async v=>{const C=v.index,{signal:b}=v,P=this.props.getSource&&await this.props.getSource(C,{signal:b});return{source:C,data:P,signal:b}},renderSubLayers:v=>{const{data:C}=v,{source:b,signal:P,data:w}=C;return t(b,{data:w,signal:P})},...u&&{onTileLoad:v=>{const C=v.index;u(C,{data:v.content?.data})}},...f&&{onTileError:(v,C)=>{if(!C)return;const b=C.index;f(b,{error:v})}},...d&&{onTileUnload:v=>{const C=v.index;d(C,{data:v.content?.data})}},...h&&{onViewportLoad:v=>{h(v.map(C=>({source:C.index,data:C.content?.data})))}}})}renderLayers(){const{sources:t,renderSource:e}=this.props;return t?this.renderTileLayer(e):null}}const mi=[{outline:[255,0,0,255],text:[255,255,255,255]},{outline:[0,255,255,255],text:[0,255,255,255]},{outline:[255,255,0,255],text:[255,255,0,255]},{outline:[255,0,255,255],text:[255,0,255,255]},{outline:[0,255,128,255],text:[0,255,128,255]}],eg={...je.defaultProps,epsgResolver:{type:"accessor",value:Pr},debugLevel:{type:"number",value:1}};class dg extends je{static layerName="MultiCOGLayer";static defaultProps=eg;initializeState(){this.setState({sources:null,multiDescriptor:null})}updateState({changeFlags:t,props:e,oldProps:i}){(t.dataChanged||e.sources!==i.sources)&&(this.setState({sources:null,multiDescriptor:null}),this._parseAllSources())}async _parseAllSources(){const{sources:t}=this.props,e=Object.entries(t),i=await Promise.all(e.map(async([v,C])=>{const b=await Ar(C.url),P=b.crs,w=typeof P=="number"?await this.props.epsgResolver(P):fs(P);return{name:v,geotiff:b,sourceProjection:w}})),o=i[0].sourceProjection,r=Ie(o,"EPSG:4326"),a=(v,C)=>r.forward([v,C],!1),c=(v,C)=>r.inverse([v,C],!1),l=Ie(o,"EPSG:3857"),u=wr((v,C)=>l.forward([v,C],!1),a),f=(v,C)=>l.inverse([v,C],!1),d=o.units;if(!d)throw new Error("Source projection is missing 'units' property, cannot compute meters per unit");const h=Cr(d,{semiMajorAxis:o.datum?.a??o.a}),p=new Map,g=new Map;for(const v of i){const C=Mr(v.geotiff,{projectTo4326:a,projectFrom4326:c,projectTo3857:u,projectFrom3857:f,mpu:h});p.set(v.name,C),g.set(v.name,{geotiff:v.geotiff})}const y=qh(p);if(this.setState({sources:g,multiDescriptor:y}),this.props.onGeoTIFFLoad){const v=y.primaryKey,C=g.get(v).geotiff,b=Sr(C,r),P=new Map;for(const[w,M]of g)P.set(w,M.geotiff);this.props.onGeoTIFFLoad(P,{primaryKey:v,geographicBounds:b})}}async _getTileData(t,e){const{x:i,y:n,z:o}=t.index,{multiDescriptor:r,sources:a}=this.state,c=this.props.pool??eo(),{device:l,signal:u}=e,f=r.primaryKey,d=r.primary.levels[o],{forwardTransform:h,inverseTransform:p}=d.tileTransform(i,n),g=[];for(const[P,w]of a){const M=P===f?r.primary:r.secondaries.get(P);P===f||Kh(M.levels[o]??M.levels[0],d)?g.push(this._fetchPrimaryBand(P,w,{x:i,y:n,z:o,pool:c,signal:u,device:l})):g.push(this._fetchSecondaryBand(P,w,{descriptor:M,primaryLevel:d,primaryCol:i,primaryRow:n,primaryZ:o,pool:c,signal:u,device:l,debug:this.props.debug??!1}))}const y=await Promise.all(g),v=new Map(y.map(([P,w])=>[P,w]));let C;if(this.props.debug){const P=new Map;for(const[w,,M]of y)M&&P.set(w,M);C={bands:P}}const b=[...v.values()].reduce((P,w)=>P+w.byteLength,0);return{bands:v,forwardTransform:h,inverseTransform:p,width:d.tileWidth,height:d.tileHeight,byteLength:b,debugInfo:C}}_tilesetDescriptor(){return this.state.multiDescriptor?.primary}_getTileDataCallback(){if(!(!this.state.multiDescriptor||!this.state.sources))return(t,e)=>this._getTileData(t,e)}_renderTileCallback(){if(this.state.multiDescriptor)return t=>this._buildRenderResult(t)}_renderDebug(t,e){if(!e?.debugInfo)return super._renderDebug(t,e);const i=this.state.multiDescriptor?.primary.projectTo4326;return i?this._renderDebugLayers(`${this.id}-${t.id}`,t,e,i):super._renderDebug(t,e)}_buildRenderResult(t){const{bands:e}=t,i=this.props.composite??{r:[...e.keys()][0]};if([i.r,i.g,i.b,i.a].filter(a=>a!=null).some(a=>!e.has(a)))return null;const o=Bp(i,e);return{renderPipeline:[{module:zp,props:o},...this.props.renderPipeline??[]]}}async _fetchPrimaryBand(t,e,i){const{x:n,y:o,z:r,pool:a,signal:c,device:l}=i,f=await Jn(e.geotiff,r).fetchTile(n,o,{boundless:!0,pool:a,signal:c}),d=Qn(l,f.array),h=f.array,p=h.layout==="pixel-interleaved"?h.data.byteLength:h.bands.reduce((g,y)=>g+y.byteLength,0);return[t,{texture:d,uvTransform:[0,0,1,1],width:h.width,height:h.height,byteLength:p},null]}async _fetchSecondaryBand(t,e,i){const{descriptor:n,primaryLevel:o,primaryCol:r,primaryRow:a,primaryZ:c,pool:l,signal:u,device:f}=i,d=this.state.multiDescriptor.primary.levels[c].metersPerPixel,h=Yh(n.levels,d),p=n.levels.indexOf(h),g=Zh(o,r,a,h,p);let y=null;i.debug&&(y={secondaryTileCorners:g.tileIndices.map(B=>h.projectedTileCorners(B.x,B.y)),secondaryZ:p,uvTransform:g.uvTransform,stitchedWidth:g.stitchedWidth,stitchedHeight:g.stitchedHeight,tileCount:g.tileIndices.length,metersPerPixel:h.metersPerPixel});const v=Jn(e.geotiff,p),C=g.tileIndices.map(I=>[I.x,I.y]),b=await v.fetchTiles(C,{boundless:!0,pool:l,signal:u}),P=Fr(b,{width:g.stitchedWidth,height:g.stitchedHeight,tileWidth:h.tileWidth,tileHeight:h.tileHeight,minCol:g.minCol,minRow:g.minRow}),w=Qn(f,P),M=P.layout==="pixel-interleaved"?P.data.byteLength:P.bands.reduce((I,B)=>I+B.byteLength,0);return[t,{texture:w,uvTransform:g.uvTransform,width:P.width,height:P.height,byteLength:M},y]}_renderDebugLayers(t,e,i,n){const o=[],r=this.props.debugLevel??1,{multiDescriptor:a}=this.state;if(!a)return o;const{x:c,y:l,z:u}=e.index,f=a.primary.levels[u];if(!f)return o;const d=f.projectedTileCorners(c,l),{path:h,center:p}=to(d,n),g=mi[0];o.push(new St({id:`${t}-debug-primary-outline`,data:[h],getPath:M=>M,getColor:g.outline,getWidth:2,widthUnits:"pixels",pickable:!1}));let y=`x=${c} y=${l} z=${u}`;r>=2&&(y+=`  ${i.width}x${i.height}`),r>=3&&(y+=`  ${f.metersPerPixel.toFixed(1)}m/px`);const C=1+(i.debugInfo?[...i.debugInfo.bands.keys()]:[]).length,b=18,P=(C-1)*b/2;if(o.push(new Nt({id:`${t}-debug-primary-label`,data:[{position:p,text:y}],getColor:g.text,getSize:14,getPixelOffset:[0,-P],sizeUnits:"pixels",outlineWidth:3,outlineColor:[0,0,0,255],fontSettings:{sdf:!0}})),!i.debugInfo)return o;let w=0;for(const[M,I]of i.debugInfo.bands){const B=mi[1+w%(mi.length-1)];for(let U=0;U<I.secondaryTileCorners.length;U++){const{path:V}=to(I.secondaryTileCorners[U],n);o.push(new St({id:`${t}-debug-${M}-outline-${U}`,data:[V],getPath:tt=>tt,getColor:B.outline,getWidth:2,widthUnits:"pixels",pickable:!1}))}const O=I.metersPerPixel.toFixed(1);let F=`${M}: ${O}m z=${I.secondaryZ}`;if(r>=2){const U=I.uvTransform;F+=`  uv=[${U.map(V=>V.toFixed(2)).join(",")}]  ${I.tileCount} tiles`}r>=3&&(F+=`  stitch=${I.stitchedWidth}x${I.stitchedHeight}`);const G=-P+(1+w)*b;o.push(new Nt({id:`${t}-debug-${M}-label`,data:[{position:p,text:F}],getColor:B.text,getSize:12,getPixelOffset:[0,G],sizeUnits:"pixels",outlineWidth:2,outlineColor:[0,0,0,255],fontSettings:{sdf:!0}})),w++}return o}}function Jn(s,t){const e=[s,...s.overviews];return e[e.length-1-t]}function Qn(s,t){if(t.layout!=="pixel-interleaved")throw new Error("Band-separate layout not yet supported in MultiCOGLayer");const{data:e,width:i,height:n}=t;let o;if(e instanceof Uint8Array||e instanceof Uint8ClampedArray)o="r8unorm";else if(e instanceof Uint16Array)o="r16unorm";else throw new Error(`Unsupported typed array type: ${e.constructor.name}. Currently only Uint8Array and Uint16Array are supported.`);return s.createTexture({data:e,format:o,width:i,height:n,sampler:{minFilter:"linear",magFilter:"linear"}})}function to(s,t){const e=t(s.topLeft[0],s.topLeft[1]),i=t(s.topRight[0],s.topRight[1]),n=t(s.bottomRight[0],s.bottomRight[1]),o=t(s.bottomLeft[0],s.bottomLeft[1]);return{path:[e,i,n,o,e],center:[(e[0]+n[0])/2,(e[1]+n[1])/2]}}export{fg as COGLayer,hg as MosaicLayer,dg as MultiCOGLayer,wp as addAlphaChannel,ug as texture};
//# sourceMappingURL=index-Bc74RPiU.js.map
