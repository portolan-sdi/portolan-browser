const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-CArDEnim.js","assets/expression-Bl_GL2tO.js","assets/globe-viewport-8znJLU_M.js","assets/index-aJ73QkZk.js","assets/utils-CzN9cXHb.js","assets/_commonjsHelpers-CE1G-McA.js","assets/I18N-BC6F-L_M.js","assets/index-BTedtIn5.css","assets/index-Bs8jG7z5.js","assets/index-B8-Cfmr6.js","assets/affine-Dq74FZIl.js","assets/webgl-device-BsZNrupj.js","assets/index-DSgLfjkz.js"])))=>i.map(i=>d[i]);
import jn from"./index-Bs8jG7z5.js";import oa from"./index-B8-Cfmr6.js";import{i as Gn,a as ra,e as aa,b as ne,t as ca,c as la}from"./affine-Dq74FZIl.js";import{a1 as ua,R as $t,u as fa,l as R,B as j,s as da,av as ha,aw as pa,ax as ga,ay as ma,az as ya,aA as $n,aB as _a,aC as Wn,aD as va,aE as ba,aF as xa,aG as Pa,aH as wa,Q as Bo,w as Y,aI as Ca,aJ as La,aK as Sa,aL as Aa,W as Wt,v as ge,aM as Ta,aN as Ea,aO as Hn,$ as Gi,T as oi,j as Ht,aP as Oo,h as Ia,ak as qt,aQ as Ot,aa as be,aR as Ma,aS as Rt,aT as Ba,a8 as _n,Y as Ro,aU as Oa,a3 as oe,ab as Ra,aV as we,a7 as pt,aW as Yt,aX as Se,aY as xe,aZ as yi,a_ as Oe,a6 as za,ac as Na,a2 as $i,a5 as zo,a$ as st,V as M,b0 as Fa,ap as qn,b1 as Wi,a9 as zt,a as ri,ag as ot,Z as Ie,af as Da}from"./globe-viewport-8znJLU_M.js";import{R as Ze,S as ka,g as Ua,i as Va,a as ja,m as No,b as Hi,c as Ga,d as Yn,e as $a,f as qi,n as Wa,T as Ha,h as qa,W as _i}from"./webgl-device-BsZNrupj.js";import{_ as Xn}from"./utils-CzN9cXHb.js";import{g as Ya}from"./_commonjsHelpers-CE1G-McA.js";import"./index-aJ73QkZk.js";const Xa="Queued Requests",Za="Active Requests",Ka="Cancelled Requests",Ja="Queued Requests Ever",Qa="Active Requests Ever",ec={id:"request-scheduler",throttleRequests:!0,maxRequests:6,debounceTime:0};class tc{props;stats;activeRequestCount=0;requestQueue=[];requestMap=new Map;updateTimer=null;constructor(e={}){this.props={...ec,...e},this.stats=new ua({id:this.props.id}),this.stats.get(Xa),this.stats.get(Za),this.stats.get(Ka),this.stats.get(Ja),this.stats.get(Qa)}setProps(e){e.throttleRequests!==void 0&&(this.props.throttleRequests=e.throttleRequests),e.maxRequests!==void 0&&(this.props.maxRequests=e.maxRequests),e.debounceTime!==void 0&&(this.props.debounceTime=e.debounceTime)}scheduleRequest(e,t=()=>0){if(!this.props.throttleRequests)return Promise.resolve({done:()=>{}});if(this.requestMap.has(e))return this.requestMap.get(e);const i={handle:e,priority:0,getPriority:t},s=new Promise(o=>(i.resolve=o,i));return this.requestQueue.push(i),this.requestMap.set(e,s),this._issueNewRequests(),s}_issueRequest(e){const{handle:t,resolve:i}=e;let s=!1;const o=()=>{s||(s=!0,this.requestMap.delete(t),this.activeRequestCount--,this.updateTimer===null&&(this.updateTimer=setTimeout(()=>this._issueNewRequestsAsync(),0)))};return this.activeRequestCount++,i?i({done:o}):Promise.resolve({done:o})}_issueNewRequests(){this.updateTimer!==null&&clearTimeout(this.updateTimer),this.updateTimer=setTimeout(()=>this._issueNewRequestsAsync(),this.props.debounceTime)}_issueNewRequestsAsync(){this.updateTimer!==null&&clearTimeout(this.updateTimer),this.updateTimer=null;const e=Math.max(this.props.maxRequests-this.activeRequestCount,0);if(e!==0){this._updateAllRequests();for(let t=0;t<e;++t){const i=this.requestQueue.shift();i&&this._issueRequest(i)}}}_updateAllRequests(){const e=this.requestQueue;for(let t=0;t<e.length;++t){const i=e[t];this._updateRequest(i)||(e.splice(t,1),this.requestMap.delete(i.handle),t--)}e.sort((t,i)=>t.priority-i.priority)}_updateRequest(e){return e.priority=e.getPriority(e.handle),e.priority<0?(e.resolve(null),!1):!0}}function ic(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}function nc(n){return Array.isArray(n)?n.length===0||typeof n[0]=="number":!1}function Fo(n){return ic(n)||nc(n)}class vn extends $t{width;height;updateTimestamp;get[Symbol.toStringTag](){return"ExternalTexture"}constructor(e,t){super(e,t,vn.defaultProps);const i=this.props.source?e.getExternalImageSize(this.props.source):null;this.width=this.props.width||i?.width||0,this.height=this.props.height||i?.height||0,this.updateTimestamp=e.incrementTimestamp()}static defaultProps={...$t.defaultProps,source:void 0,width:0,height:0,colorSpace:"srgb",sampler:{}}}class rt extends $t{get[Symbol.toStringTag](){return"ComputePipeline"}hash="";shaderLayout;constructor(e,t){super(e,t,rt.defaultProps),this.shaderLayout=t.shaderLayout}static defaultProps={...$t.defaultProps,shader:void 0,entryPoint:void 0,constants:{},shaderLayout:void 0}}class ai{static defaultProps={...Ze.defaultProps};static getDefaultPipelineFactory(e){const t=e.getModuleData("@luma.gl/core");return t.defaultPipelineFactory||=new ai(e),t.defaultPipelineFactory}device;_hashCounter=0;_hashes={};_renderPipelineCache={};_computePipelineCache={};_sharedRenderPipelineCache={};get[Symbol.toStringTag](){return"PipelineFactory"}toString(){return`PipelineFactory(${this.device.id})`}constructor(e){this.device=e}createRenderPipeline(e){if(!this.device.props._cachePipelines)return this.device.createRenderPipeline(e);const t={...Ze.defaultProps,...e},i=this._renderPipelineCache,s=this._hashRenderPipeline(t);let o=i[s]?.resource;if(o)i[s].useCount++,this.device.props.debugFactories&&R.log(3,`${this}: ${i[s].resource} reused, count=${i[s].useCount}, (id=${e.id})`)();else{const r=this.device.type==="webgl"&&this.device.props._sharePipelines?this.createSharedRenderPipeline(t):void 0;o=this.device.createRenderPipeline({...t,id:t.id?`${t.id}-cached`:fa("unnamed-cached"),_sharedRenderPipeline:r}),o.hash=s,i[s]={resource:o,useCount:1},this.device.props.debugFactories&&R.log(3,`${this}: ${o} created, count=${i[s].useCount}`)()}return o}createComputePipeline(e){if(!this.device.props._cachePipelines)return this.device.createComputePipeline(e);const t={...rt.defaultProps,...e},i=this._computePipelineCache,s=this._hashComputePipeline(t);let o=i[s]?.resource;return o?(i[s].useCount++,this.device.props.debugFactories&&R.log(3,`${this}: ${i[s].resource} reused, count=${i[s].useCount}, (id=${e.id})`)()):(o=this.device.createComputePipeline({...t,id:t.id?`${t.id}-cached`:void 0}),o.hash=s,i[s]={resource:o,useCount:1},this.device.props.debugFactories&&R.log(3,`${this}: ${o} created, count=${i[s].useCount}`)()),o}release(e){if(!this.device.props._cachePipelines){e.destroy();return}const t=this._getCache(e),i=e.hash;t[i].useCount--,t[i].useCount===0?(this._destroyPipeline(e),this.device.props.debugFactories&&R.log(3,`${this}: ${e} released and destroyed`)()):t[i].useCount<0?(R.error(`${this}: ${e} released, useCount < 0, resetting`)(),t[i].useCount=0):this.device.props.debugFactories&&R.log(3,`${this}: ${e} released, count=${t[i].useCount}`)()}createSharedRenderPipeline(e){const t=this._hashSharedRenderPipeline(e);let i=this._sharedRenderPipelineCache[t];return i||(i={resource:this.device._createSharedRenderPipelineWebGL(e),useCount:0},this._sharedRenderPipelineCache[t]=i),i.useCount++,i.resource}releaseSharedRenderPipeline(e){if(!e.sharedRenderPipeline)return;const t=this._hashSharedRenderPipeline(e.sharedRenderPipeline.props),i=this._sharedRenderPipelineCache[t];i&&(i.useCount--,i.useCount===0&&(i.resource.destroy(),delete this._sharedRenderPipelineCache[t]))}_destroyPipeline(e){const t=this._getCache(e);return this.device.props._destroyPipelines?(delete t[e.hash],e.destroy(),e instanceof Ze&&this.releaseSharedRenderPipeline(e),!0):!1}_getCache(e){let t;if(e instanceof rt&&(t=this._computePipelineCache),e instanceof Ze&&(t=this._renderPipelineCache),!t)throw new Error(`${this}`);if(!t[e.hash])throw new Error(`${this}: ${e} matched incorrect entry`);return t}_hashComputePipeline(e){const{type:t}=this.device,i=this._getHash(e.shader.source),s=this._getHash(JSON.stringify(e.shaderLayout));return`${t}/C/${i}SL${s}`}_hashRenderPipeline(e){const t=e.vs?this._getHash(e.vs.source):0,i=e.fs?this._getHash(e.fs.source):0,s=this._getWebGLVaryingHash(e),o=this._getHash(JSON.stringify(e.shaderLayout)),r=this._getHash(JSON.stringify(e._uniformBlockLayouts)),a=this._getHash(JSON.stringify(e.bufferLayout)),{type:c}=this.device;if(c==="webgl"){const l=this._getHash(JSON.stringify(e.parameters));return`${c}/R/${t}/${i}V${s}T${e.topology}P${l}SL${o}UBL${r}BL${a}`}else{const u=this._getHash(JSON.stringify({vertexEntryPoint:e.vertexEntryPoint,fragmentEntryPoint:e.fragmentEntryPoint})),f=this._getHash(JSON.stringify(e.parameters)),d=this._getWebGPUAttachmentHash(e);return`${c}/R/${t}/${i}V${s}T${e.topology}EP${u}P${f}SL${o}BL${a}A${d}`}}_hashSharedRenderPipeline(e){const t=e.vs?this._getHash(e.vs.source):0,i=e.fs?this._getHash(e.fs.source):0,s=this._getWebGLVaryingHash(e);return`webgl/S/${t}/${i}V${s}`}_getHash(e){return this._hashes[e]===void 0&&(this._hashes[e]=this._hashCounter++),this._hashes[e]}_getWebGLVaryingHash(e){const{varyings:t=[],bufferMode:i=null}=e;return this._getHash(JSON.stringify({varyings:t,bufferMode:i}))}_getWebGPUAttachmentHash(e){const t=e.colorAttachmentFormats??[this.device.preferredColorFormat],i=e.depthStencilAttachmentFormat??(e.parameters?.depthWriteEnabled?this.device.preferredDepthFormat:null);return this._getHash(JSON.stringify({colorAttachmentFormats:t,depthStencilAttachmentFormat:i}))}}class ci{static defaultProps={...ka.defaultProps};static getDefaultShaderFactory(e){const t=e.getModuleData("@luma.gl/core");return t.defaultShaderFactory||=new ci(e),t.defaultShaderFactory}device;_cache={};get[Symbol.toStringTag](){return"ShaderFactory"}toString(){return`${this[Symbol.toStringTag]}(${this.device.id})`}constructor(e){this.device=e}createShader(e){if(!this.device.props._cacheShaders)return this.device.createShader(e);const t=this._hashShader(e);let i=this._cache[t];if(i)i.useCount++,this.device.props.debugFactories&&R.log(3,`${this}: Reusing shader ${i.resource.id} count=${i.useCount}`)();else{const s=this.device.createShader({...e,id:e.id?`${e.id}-cached`:void 0});this._cache[t]=i={resource:s,useCount:1},this.device.props.debugFactories&&R.log(3,`${this}: Created new shader ${s.id}`)()}return i.resource}release(e){if(!this.device.props._cacheShaders){e.destroy();return}const t=this._hashShader(e),i=this._cache[t];if(i)if(i.useCount--,i.useCount===0)this.device.props._destroyShaders&&(delete this._cache[t],i.resource.destroy(),this.device.props.debugFactories&&R.log(3,`${this}: Releasing shader ${e.id}, destroyed`)());else{if(i.useCount<0)throw new Error(`ShaderFactory: Shader ${e.id} released too many times`);this.device.props.debugFactories&&R.log(3,`${this}: Releasing shader ${e.id} count=${i.useCount}`)()}}_hashShader(e){return`${e.stage}:${e.source}`}}function sc(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}function Xt(n){return Array.isArray(n)?n.length===0||typeof n[0]=="number":sc(n)}class oc{layout;constructor(e){this.layout=e}has(e){return!!this.layout.fields[e]}get(e){const t=this.layout.fields[e];return t?{offset:t.offset,size:t.size}:void 0}getFlatUniformValues(e){const t={};for(const[i,s]of Object.entries(e)){const o=this.layout.uniformTypes[i];o?this._flattenCompositeValue(t,i,o,s):this.layout.fields[i]&&(t[i]=s)}return t}getData(e){const t=Ua(this.layout.byteLength);new Uint8Array(t,0,this.layout.byteLength).fill(0);const i={i32:new Int32Array(t),u32:new Uint32Array(t),f32:new Float32Array(t),f16:new Uint16Array(t)},s=this.getFlatUniformValues(e);for(const[o,r]of Object.entries(s))this._writeLeafValue(i,o,r);return new Uint8Array(t,0,this.layout.byteLength)}_flattenCompositeValue(e,t,i,s){if(s!==void 0){if(typeof i=="string"||this.layout.fields[t]){e[t]=s;return}if(Array.isArray(i)){const o=i[0],r=i[1];if(Array.isArray(o))throw new Error(`Nested arrays are not supported for ${t}`);if(typeof o=="string"&&Xt(s)){this._flattenPackedArray(e,t,o,r,s);return}if(!Array.isArray(s)){R.warn(`Unsupported uniform array value for ${t}:`,s)();return}for(let a=0;a<Math.min(s.length,r);a++){const c=s[a];c!==void 0&&this._flattenCompositeValue(e,`${t}[${a}]`,o,c)}return}if(Va(i)&&rc(s)){for(const[o,r]of Object.entries(s)){if(r===void 0)continue;const a=`${t}.${o}`;this._flattenCompositeValue(e,a,i[o],r)}return}R.warn(`Unsupported uniform value for ${t}:`,s)()}}_flattenPackedArray(e,t,i,s,o){const r=o,c=ja(i,this.layout.layout).components;for(let l=0;l<s;l++){const u=l*c;if(u>=r.length)break;c===1?e[`${t}[${l}]`]=Number(r[u]):e[`${t}[${l}]`]=ac(o,u,u+c)}}_writeLeafValue(e,t,i){const s=this.layout.fields[t];if(!s){R.warn(`Uniform ${t} not found in layout`)();return}const{type:o,components:r,columns:a,rows:c,offset:l,columnStride:u}=s,f=e[o];if(r===1){f[l]=Number(i);return}const d=i;if(a===1){for(let p=0;p<r;p++)f[l+p]=Number(d[p]??0);return}let h=0;for(let p=0;p<a;p++){const g=l+p*u;for(let y=0;y<c;y++)f[g+y]=Number(d[h++]??0)}}}function rc(n){return!!n&&typeof n=="object"&&!Array.isArray(n)&&!ArrayBuffer.isView(n)}function ac(n,e,t){return Array.prototype.slice.call(n,e,t)}const cc=128;function lc(n,e,t=16){if(n===e)return!0;const i=n,s=e;if(!Xt(i)||!Xt(s)||i.length!==s.length)return!1;const o=Math.min(t,cc);if(i.length>o)return!1;for(let r=0;r<i.length;++r)if(s[r]!==i[r])return!1;return!0}function uc(n){return Xt(n)?n.slice():n}class fc{name;uniforms={};modifiedUniforms={};modified=!0;bindingLayout={};needsRedraw="initialized";constructor(e){if(this.name=e?.name||"unnamed",e?.name&&e?.shaderLayout){const t=e?.shaderLayout.bindings?.find(s=>s.type==="uniform"&&s.name===e?.name);if(!t)throw new Error(e?.name);const i=t;for(const s of i.uniforms||[])this.bindingLayout[s.name]=s}}setUniforms(e){for(const[t,i]of Object.entries(e))this._setUniform(t,i)&&!this.needsRedraw&&this.setNeedsRedraw(`${this.name}.${t}=${i}`)}setNeedsRedraw(e){this.needsRedraw=this.needsRedraw||e}getAllUniforms(){return this.modifiedUniforms={},this.needsRedraw=!1,this.uniforms||{}}_setUniform(e,t){return lc(this.uniforms[e],t)?!1:(this.uniforms[e]=uc(t),this.modifiedUniforms[e]=!0,this.modified=!0,!0)}}const dc=1024;class Do{device;uniformBlocks=new Map;shaderBlockLayouts=new Map;shaderBlockWriters=new Map;uniformBuffers=new Map;constructor(e,t){this.device=e;for(const[i,s]of Object.entries(t)){const o=i,r=No(s.uniformTypes??{},{layout:s.layout??hc(e)}),a=new oc(r);this.shaderBlockLayouts.set(o,r),this.shaderBlockWriters.set(o,a);const c=new fc({name:i});c.setUniforms(a.getFlatUniformValues(s.defaultUniforms||{})),this.uniformBlocks.set(o,c)}}destroy(){for(const e of this.uniformBuffers.values())e.destroy()}setUniforms(e,t){for(const[i,s]of Object.entries(e)){const o=i,a=this.shaderBlockWriters.get(o)?.getFlatUniformValues(s||{});this.uniformBlocks.get(o)?.setUniforms(a||{})}this.updateUniformBuffers(t)}getUniformBufferByteLength(e){const t=this.shaderBlockLayouts.get(e)?.byteLength||0;return Math.max(t,dc)}getUniformBufferData(e){const t=this.uniformBlocks.get(e)?.getAllUniforms()||{};return this.shaderBlockWriters.get(e)?.getData(t)||new Uint8Array(0)}createUniformBuffer(e,t){t&&this.setUniforms(t);const i=this.getUniformBufferByteLength(e),s=this.device.createBuffer({usage:j.UNIFORM|j.COPY_DST,byteLength:i}),o=this.getUniformBufferData(e);return s.write(o),s}getManagedUniformBuffer(e){if(!this.uniformBuffers.get(e)){const t=this.getUniformBufferByteLength(e),i=this.device.createBuffer({usage:j.UNIFORM|j.COPY_DST,byteLength:t});this.uniformBuffers.set(e,i)}return this.uniformBuffers.get(e)}updateUniformBuffers(e){let t=!1;for(const i of this.uniformBlocks.keys()){const s=this.updateUniformBuffer(i,e);t||=s}return t&&R.log(3,`UniformStore.updateUniformBuffers(): ${t}`)(),t}updateUniformBuffer(e,t){const i=this.uniformBlocks.get(e);let s=this.uniformBuffers.get(e),o=!1;if(s&&i?.needsRedraw){o||=i.needsRedraw;const r=this.getUniformBufferData(e);if(s=this.uniformBuffers.get(e),s&&(t?this.device.writeBufferViaCommandEncoder(t,s,r):s.write(r)),R.level>=4){const a=this.uniformBlocks.get(e)?.getAllUniforms();R.log(4,`Writing to uniform buffer ${String(e)}`,r,a)()}}return o}}function hc(n){return n.type==="webgpu"?"wgsl-uniform":"std140"}const pc=/^(vs|fs):(?:#(?:decl|main-start|main-end)|[A-Za-z_][\w-]*)$/;function ko(n=[],e){const t=[],i={},s={},o={},r={};for(const a of n)Zn({modules:t,defines:i,injections:s,vertexInputs:o,varyings:r},a),Zn({modules:t,defines:i,injections:s,vertexInputs:o,varyings:r},a[e]);for(const a of Object.keys(r))if(o[a])throw new Error(`ShaderPlugin name "${a}" cannot be both a vertex input and a varying`);return{modules:t,defines:i,injections:s,vertexInputs:o,varyings:r}}function Uo(n=[],e=[]){const t=[...n],i=new Set(t.map(s=>s.name));for(const s of e)i.has(s.name)||(t.push(s),i.add(s.name));return t}function Zn(n,e){if(e){e.modules?.length&&n.modules.push(...e.modules),e.defines&&Object.assign(n.defines,e.defines);for(const[t,i]of Object.entries(e.vertexInputs||{})){Kn(t,"vertex input");const s=n.vertexInputs[t];if(s&&s!==i)throw new Error(`ShaderPlugin vertex input "${t}" has conflicting types "${s}" and "${i}"`);n.vertexInputs[t]=i}for(const[t,i]of Object.entries(e.varyings||{})){Kn(t,"varying");const s=gc(t,i),o=n.varyings[t];if(o&&(o.type!==s.type||o.interpolation!==s.interpolation))throw new Error(`ShaderPlugin varying "${t}" has conflicting declarations "${o.type}/${o.interpolation}" and "${s.type}/${s.interpolation}"`);n.varyings[t]=s}for(const t of e.injections||[])mc(t.target),n.injections[t.target]||(n.injections[t.target]=[]),n.injections[t.target].push({injection:t.injection,order:t.order??0})}}function Kn(n,e){if(!/^[A-Za-z_][A-Za-z0-9_]*$/.test(n)||n.startsWith("_luma_"))throw new Error(`ShaderPlugin ${e} "${n}" must be a valid non-reserved identifier`)}function gc(n,e){const{primitiveType:t}=da.getAttributeShaderTypeInfo(e.type),i=t==="i32"||t==="u32",s=e.interpolation||(i?"flat":"smooth");if(i&&s==="smooth")throw new Error(`ShaderPlugin integer varying "${n}" must use flat interpolation`);return{type:e.type,interpolation:s}}function mc(n){if(!pc.test(n))throw new Error(`ShaderPlugin injection target "${n}" must be a named shader anchor or hook`)}const yc=`out vec4 transform_output;
void main() {
  transform_output = vec4(0);
}`,_c=`#version 300 es
${yc}`;function vc(n){const{input:e,inputChannels:t,output:i}={};if(!e)return _c;if(!t)throw new Error("inputChannels");const s=bc(t),o=xc(e,t);return`#version 300 es
in ${s} ${e};
out vec4 ${i};
void main() {
  ${i} = ${o};
}`}function bc(n){switch(n){case 1:return"float";case 2:return"vec2";case 3:return"vec3";case 4:return"vec4";default:throw new Error(`invalid channels: ${n}`)}}function xc(n,e){switch(e){case 1:return`vec4(${n}, 0.0, 0.0, 1.0)`;case 2:return`vec4(${n}, 0.0, 1.0)`;case 3:return`vec4(${n}, 1.0)`;case 4:return n;default:throw new Error(`invalid channels: ${e}`)}}var Yi;(function(n){n[n.COL0ROW0=0]="COL0ROW0",n[n.COL0ROW1=1]="COL0ROW1",n[n.COL0ROW2=2]="COL0ROW2",n[n.COL1ROW0=3]="COL1ROW0",n[n.COL1ROW1=4]="COL1ROW1",n[n.COL1ROW2=5]="COL1ROW2",n[n.COL2ROW0=6]="COL2ROW0",n[n.COL2ROW1=7]="COL2ROW1",n[n.COL2ROW2=8]="COL2ROW2"})(Yi||(Yi={}));const Pc=Object.freeze([1,0,0,0,1,0,0,0,1]);class K extends ha{static get IDENTITY(){return Cc()}static get ZERO(){return wc()}get ELEMENTS(){return 9}get RANK(){return 3}get INDICES(){return Yi}constructor(e,...t){super(-0,-0,-0,-0,-0,-0,-0,-0,-0),arguments.length===1&&Array.isArray(e)?this.copy(e):t.length>0?this.copy([e,...t]):this.identity()}copy(e){return this[0]=e[0],this[1]=e[1],this[2]=e[2],this[3]=e[3],this[4]=e[4],this[5]=e[5],this[6]=e[6],this[7]=e[7],this[8]=e[8],this.check()}identity(){return this.copy(Pc)}fromObject(e){return this.check()}fromQuaternion(e){return pa(this,e),this.check()}set(e,t,i,s,o,r,a,c,l){return this[0]=e,this[1]=t,this[2]=i,this[3]=s,this[4]=o,this[5]=r,this[6]=a,this[7]=c,this[8]=l,this.check()}setRowMajor(e,t,i,s,o,r,a,c,l){return this[0]=e,this[1]=s,this[2]=a,this[3]=t,this[4]=o,this[5]=c,this[6]=i,this[7]=r,this[8]=l,this.check()}determinant(){return ga(this)}transpose(){return ma(this,this),this.check()}invert(){return ya(this,this),this.check()}multiplyLeft(e){return $n(this,e,this),this.check()}multiplyRight(e){return $n(this,this,e),this.check()}rotate(e){return _a(this,this,e),this.check()}scale(e){return Array.isArray(e)?Wn(this,this,e):Wn(this,this,[e,e]),this.check()}translate(e){return va(this,this,e),this.check()}transform(e,t){let i;switch(e.length){case 2:i=Pa(t||[-0,-0],e,this);break;case 3:i=xa(t||[-0,-0,-0],e,this);break;case 4:i=ba(t||[-0,-0,-0,-0],e,this);break;default:throw new Error("Illegal vector")}return wa(i,e.length),i}transformVector(e,t){return this.transform(e,t)}transformVector2(e,t){return this.transform(e,t)}transformVector3(e,t){return this.transform(e,t)}}let gt,mt=null;function wc(){return gt||(gt=new K([0,0,0,0,0,0,0,0,0]),Object.freeze(gt)),gt}function Cc(){return mt||(mt=new K,Object.freeze(mt)),mt}const Lc=1e-15,Sc=1e-20;function Vo(n,e=[],t=0){const i=Math.fround(n),s=n-i;return e[t]=i,e[t+1]=s,e}function Ac(n){return n-Math.fround(n)}function Tc(n){const e=new Float32Array(32);for(let t=0;t<4;++t)for(let i=0;i<4;++i){const s=t*4+i;Vo(n[i*4+t],e,s*2)}return e}function jo(n,e=!0){return n??e}function Go(n=[0,0,0],e=!0){return e?n.map(t=>t/255):[...n]}function Ec(n,e=!0){const t=Go(n.slice(0,3),e),i=Number.isFinite(n[3]),s=i?n[3]:1;return[t[0],t[1],t[2],e&&i?s/255:s]}const Jn=`
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
`,Ic=`struct Fp64F32Bits {
  sign: u32,
  baseExponent: i32,
  significand: u32,
  isZero: bool,
  isInf: bool,
  isNan: bool,
};

// Decode an f32 as (-1)^sign * significand * 2^baseExponent.
fn fp64_decode_f32_bits(bits: u32) -> Fp64F32Bits {
  let sign = bits >> 31u;
  let exponentBits = (bits >> 23u) & 0xffu;
  let fraction = bits & 0x7fffffu;

  if (exponentBits == 0xffu) {
    return Fp64F32Bits(sign, 0, 0u, false, fraction == 0u, fraction != 0u);
  }
  if (exponentBits == 0u) {
    return Fp64F32Bits(sign, -149, fraction, fraction == 0u, false, false);
  }
  return Fp64F32Bits(sign, i32(exponentBits) - 150, 0x800000u | fraction, false, false, false);
}

fn fp64_f32_magnitude_compare(aBits: u32, bBits: u32) -> i32 {
  let aMagnitude = aBits & 0x7fffffffu;
  let bMagnitude = bBits & 0x7fffffffu;
  if (aMagnitude == bMagnitude) {
    return 0;
  }
  return select(-1, 1, aMagnitude > bMagnitude);
}

fn fp64_make_residual_f32_bits(
  exactSign: u32,
  exactMagnitude: vec2u,
  exactBaseExponent: i32,
  highBits: u32
) -> u32 {
  if (fp64_u64_is_zero(exactMagnitude)) {
    return 0u;
  }

  let high = fp64_decode_f32_bits(highBits);
  if (high.isInf || high.isNan) {
    return exactSign << 31u;
  }
  if (high.isZero) {
    return fp64_make_f32_bits_from_u64(exactSign, exactMagnitude, exactBaseExponent);
  }

  let commonBaseExponent = min(exactBaseExponent, high.baseExponent);
  let exactShift = exactBaseExponent - commonBaseExponent;
  let highShift = high.baseExponent - commonBaseExponent;

  // A normal two-sum/two-product residual never needs a shift this large.
  // This guard gives deterministic underflow behavior outside that contract.
  if (exactShift >= 64 || highShift >= 64) {
    return exactSign << 31u;
  }

  let exactAligned = fp64_u64_shift_left(exactMagnitude, u32(exactShift));
  let highAligned = fp64_u64_shift_left(vec2u(0u, high.significand), u32(highShift));
  let comparison = fp64_u64_compare(exactAligned, highAligned);
  if (comparison == 0) {
    return 0u;
  }

  var residualSign = exactSign;
  var residualMagnitude: vec2u;
  if (comparison > 0) {
    residualMagnitude = fp64_u64_sub(exactAligned, highAligned);
  } else {
    residualSign = exactSign ^ 1u;
    residualMagnitude = fp64_u64_sub(highAligned, exactAligned);
  }
  return fp64_make_f32_bits_from_u64(
    residualSign,
    residualMagnitude,
    commonBaseExponent
  );
}

fn fp64_split_accumulator_bits(
  sign: u32,
  magnitude: vec2u,
  baseExponent: i32
) -> vec2u {
  let highBits = fp64_make_f32_bits_from_u64(sign, magnitude, baseExponent);
  let lowBits = fp64_make_residual_f32_bits(sign, magnitude, baseExponent, highBits);
  return vec2u(highBits, lowBits);
}

fn fp64_two_sum_integer_bits(aBits: u32, bBits: u32) -> vec2u {
  let a = fp64_decode_f32_bits(aBits);
  let b = fp64_decode_f32_bits(bBits);

  if (a.isNan || b.isNan) {
    return vec2u(0x7fc00000u, 0u);
  }
  if (a.isInf || b.isInf) {
    if (a.isInf && b.isInf && a.sign != b.sign) {
      return vec2u(0x7fc00000u, 0u);
    }
    return select(vec2u(bBits, 0u), vec2u(aBits, 0u), a.isInf);
  }
  if (a.isZero && b.isZero) {
    return vec2u((a.sign & b.sign) << 31u, 0u);
  }
  if (a.isZero) {
    return vec2u(bBits, 0u);
  }
  if (b.isZero) {
    return vec2u(aBits, 0u);
  }

  let exponentDifference = select(
    b.baseExponent - a.baseExponent,
    a.baseExponent - b.baseExponent,
    a.baseExponent >= b.baseExponent
  );

  // Beyond half an ulp, rounding cannot change the larger operand. Returning
  // the smaller operand intact also avoids an unbounded integer alignment.
  // At a power-of-two boundary the spacing below the larger operand is half
  // the spacing above it, so an opposite-sign gap-25 operand can still change
  // the rounded high limb. Gap 26 is the first universally safe early-out.
  if (exponentDifference > 25) {
    if (fp64_f32_magnitude_compare(aBits, bBits) >= 0) {
      return vec2u(aBits, bBits);
    }
    return vec2u(bBits, aBits);
  }

  let commonBaseExponent = min(a.baseExponent, b.baseExponent);
  let aMagnitude = fp64_u64_shift_left(
    vec2u(0u, a.significand),
    u32(a.baseExponent - commonBaseExponent)
  );
  let bMagnitude = fp64_u64_shift_left(
    vec2u(0u, b.significand),
    u32(b.baseExponent - commonBaseExponent)
  );

  var resultSign = a.sign;
  var resultMagnitude: vec2u;
  if (a.sign == b.sign) {
    resultMagnitude = fp64_u64_add(aMagnitude, bMagnitude);
  } else {
    let comparison = fp64_u64_compare(aMagnitude, bMagnitude);
    if (comparison == 0) {
      return vec2u(0u, 0u);
    }
    if (comparison > 0) {
      resultMagnitude = fp64_u64_sub(aMagnitude, bMagnitude);
    } else {
      resultSign = b.sign;
      resultMagnitude = fp64_u64_sub(bMagnitude, aMagnitude);
    }
  }

  return fp64_split_accumulator_bits(resultSign, resultMagnitude, commonBaseExponent);
}

fn fp64_two_sum_integer(a: f32, b: f32) -> vec2f {
  let resultBits = fp64_two_sum_integer_bits(bitcast<u32>(a), bitcast<u32>(b));
  return vec2f(bitcast<f32>(resultBits.x), bitcast<f32>(resultBits.y));
}

fn fp64_multiply_significands(a: u32, b: u32) -> vec2u {
  let aLow = a & 0xffffu;
  let aHigh = a >> 16u;
  let bLow = b & 0xffffu;
  let bHigh = b >> 16u;
  let lowProduct = aLow * bLow;
  let crossProduct = aLow * bHigh + aHigh * bLow;
  let highProduct = aHigh * bHigh;

  var result = vec2u(0u, lowProduct);
  result = fp64_u64_add(
    result,
    fp64_u64_shift_left(vec2u(0u, crossProduct), 16u)
  );
  result = fp64_u64_add(result, vec2u(highProduct, 0u));
  return result;
}

fn fp64_two_prod_integer_bits(aBits: u32, bBits: u32) -> vec2u {
  let a = fp64_decode_f32_bits(aBits);
  let b = fp64_decode_f32_bits(bBits);
  let resultSign = a.sign ^ b.sign;

  if (a.isNan || b.isNan || ((a.isZero || b.isZero) && (a.isInf || b.isInf))) {
    return vec2u(0x7fc00000u, 0u);
  }
  if (a.isInf || b.isInf) {
    return vec2u((resultSign << 31u) | 0x7f800000u, resultSign << 31u);
  }
  if (a.isZero || b.isZero) {
    return vec2u(resultSign << 31u, resultSign << 31u);
  }

  let magnitude = fp64_multiply_significands(a.significand, b.significand);
  return fp64_split_accumulator_bits(
    resultSign,
    magnitude,
    a.baseExponent + b.baseExponent
  );
}

fn fp64_two_prod_integer(a: f32, b: f32) -> vec2f {
  let resultBits = fp64_two_prod_integer_bits(bitcast<u32>(a), bitcast<u32>(b));
  return vec2f(bitcast<f32>(resultBits.x), bitcast<f32>(resultBits.y));
}

fn fp64_round_add_integer(a: f32, b: f32) -> f32 {
  return fp64_two_sum_integer(a, b).x;
}

fn fp64_round_mul_integer(a: f32, b: f32) -> f32 {
  return fp64_two_prod_integer(a, b).x;
}

#ifndef LUMA_FP64_PREDICATE_ONLY
fn fp64_f32_finite_exponent(value: Fp64F32Bits) -> i32 {
  let mostSignificantBit = 31u - countLeadingZeros(value.significand);
  return value.baseExponent + i32(mostSignificantBit);
}

fn fp64_scale_f32_integer(value: f32, exponent: i32) -> f32 {
  let decoded = fp64_decode_f32_bits(bitcast<u32>(value));
  if (decoded.isZero || decoded.isInf || decoded.isNan) {
    return value;
  }
  let resultBits = fp64_make_f32_bits_from_u64(
    decoded.sign,
    vec2u(0u, decoded.significand),
    decoded.baseExponent + exponent
  );
  return bitcast<f32>(resultBits);
}

// Divide normalized significands so the hardware operation cannot overflow,
// underflow, or flush a subnormal result. Reapply the exponent with integer
// packing, which also produces subnormal correction limbs without relying on
// floating-point arithmetic to preserve them.
fn fp64_divide_f32_integer(aValue: f32, bValue: f32) -> f32 {
  let a = fp64_decode_f32_bits(bitcast<u32>(aValue));
  let b = fp64_decode_f32_bits(bitcast<u32>(bValue));
  if (a.isZero || b.isZero || a.isInf || b.isInf || a.isNan || b.isNan) {
    return aValue / bValue;
  }

  let aMostSignificantBit = 31u - countLeadingZeros(a.significand);
  let bMostSignificantBit = 31u - countLeadingZeros(b.significand);
  let normalizedABits = fp64_make_f32_bits_from_u64(
    a.sign,
    vec2u(0u, a.significand),
    -i32(aMostSignificantBit)
  );
  let normalizedBBits = fp64_make_f32_bits_from_u64(
    b.sign,
    vec2u(0u, b.significand),
    -i32(bMostSignificantBit)
  );
  let normalizedQuotient = bitcast<f32>(normalizedABits) / bitcast<f32>(normalizedBBits);
  let quotient = fp64_decode_f32_bits(bitcast<u32>(normalizedQuotient));
  let exponentShift =
    a.baseExponent + i32(aMostSignificantBit) -
    b.baseExponent - i32(bMostSignificantBit);
  let quotientBits = fp64_make_f32_bits_from_u64(
    quotient.sign,
    vec2u(0u, quotient.significand),
    quotient.baseExponent + exponentShift
  );
  return bitcast<f32>(quotientBits);
}
#endif

#ifndef LUMA_FP64_PREDICATE_ONLY
fn split(a: f32) -> vec2f {
  let aBits = bitcast<u32>(a);
  let decoded = fp64_decode_f32_bits(aBits);
  if (decoded.isZero || decoded.isInf || decoded.isNan) {
    return vec2f(a, 0.0);
  }

  var roundedHigh = decoded.significand >> 12u;
  let remainder = decoded.significand & 0xfffu;
  if (remainder > 0x800u || (remainder == 0x800u && (roundedHigh & 1u) == 1u)) {
    roundedHigh = roundedHigh + 1u;
  }
  var highMagnitude = vec2u(0u, roundedHigh << 12u);
  var highBits = fp64_make_f32_bits_from_u64(
    decoded.sign,
    highMagnitude,
    decoded.baseExponent
  );
  // Rounding the high limb of a maximum-exponent value can overflow even
  // though the original value is finite. Truncate only in that boundary case
  // so split remains an exact finite decomposition.
  if (fp64_decode_f32_bits(highBits).isInf) {
    roundedHigh = decoded.significand >> 12u;
    highMagnitude = vec2u(0u, roundedHigh << 12u);
    highBits = fp64_make_f32_bits_from_u64(
      decoded.sign,
      highMagnitude,
      decoded.baseExponent
    );
  }
  let lowBits = fp64_make_residual_f32_bits(
    decoded.sign,
    vec2u(0u, decoded.significand),
    decoded.baseExponent,
    highBits
  );
  return vec2f(bitcast<f32>(highBits), bitcast<f32>(lowBits));
}

fn split2(a: vec2f) -> vec2f {
  var result = split(a.x);
  result.y = fp64_round_add_integer(result.y, a.y);
  return result;
}
#endif

#ifndef LUMA_FP64_PREDICATE_ONLY
fn quickTwoSum(a: f32, b: f32) -> vec2f {
  return fp64_two_sum_integer(a, b);
}
#endif

fn twoSum(a: f32, b: f32) -> vec2f {
  return fp64_two_sum_integer(a, b);
}

fn twoSub(a: f32, b: f32) -> vec2f {
  let bBits = bitcast<u32>(b) ^ 0x80000000u;
  let resultBits = fp64_two_sum_integer_bits(bitcast<u32>(a), bBits);
  return vec2f(bitcast<f32>(resultBits.x), bitcast<f32>(resultBits.y));
}

#ifndef LUMA_FP64_PREDICATE_ONLY
fn twoSqr(a: f32) -> vec2f {
  return fp64_two_prod_integer(a, a);
}

fn twoProd(a: f32, b: f32) -> vec2f {
  return fp64_two_prod_integer(a, b);
}
#endif

fn sum_fp64(a: vec2f, b: vec2f) -> vec2f {
  var sum = fp64_two_sum_integer(a.x, b.x);
  let lowSum = fp64_two_sum_integer(a.y, b.y);
  sum.y = fp64_round_add_integer(sum.y, lowSum.x);
  sum = fp64_two_sum_integer(sum.x, sum.y);
  sum.y = fp64_round_add_integer(sum.y, lowSum.y);
  return fp64_two_sum_integer(sum.x, sum.y);
}

fn sub_fp64(a: vec2f, b: vec2f) -> vec2f {
  let negatedB = vec2f(
    bitcast<f32>(bitcast<u32>(b.x) ^ 0x80000000u),
    bitcast<f32>(bitcast<u32>(b.y) ^ 0x80000000u)
  );
  return sum_fp64(a, negatedB);
}

fn mul_fp64(a: vec2f, b: vec2f) -> vec2f {
  var product = fp64_two_prod_integer(a.x, b.x);
  let crossProduct1 = fp64_round_mul_integer(a.x, b.y);
  product.y = fp64_round_add_integer(product.y, crossProduct1);
  product = fp64_two_sum_integer(product.x, product.y);
  let crossProduct2 = fp64_round_mul_integer(a.y, b.x);
  product.y = fp64_round_add_integer(product.y, crossProduct2);
  return fp64_two_sum_integer(product.x, product.y);
}

#ifndef LUMA_FP64_PREDICATE_ONLY
fn fp64_scale_fp64_integer(value: vec2f, exponent: i32) -> vec2f {
  let high = fp64_scale_f32_integer(value.x, exponent);
  let low = fp64_scale_f32_integer(value.y, exponent);
  return sum_fp64(vec2f(high, 0.0), vec2f(low, 0.0));
}

fn fp64_div_fp64_normalized(a: vec2f, b: vec2f) -> vec2f {
  let quotientHigh = fp64_divide_f32_integer(a.x, b.x);
  var quotient = vec2f(quotientHigh, 0.0);

  let remainder = sub_fp64(a, mul_fp64(b, quotient));
  let quotientLow = fp64_divide_f32_integer(remainder.x, b.x);
  quotient = sum_fp64(quotient, vec2f(quotientLow, 0.0));

  let secondRemainder = sub_fp64(a, mul_fp64(b, quotient));
  let correction = fp64_divide_f32_integer(secondRemainder.x, b.x);
  return sum_fp64(quotient, vec2f(correction, 0.0));
}

fn div_fp64(a: vec2f, b: vec2f) -> vec2f {
  let decodedA = fp64_decode_f32_bits(bitcast<u32>(a.x));
  let decodedB = fp64_decode_f32_bits(bitcast<u32>(b.x));
  if (
    decodedA.isZero || decodedB.isZero ||
    decodedA.isInf || decodedB.isInf ||
    decodedA.isNan || decodedB.isNan
  ) {
    return fp64_div_fp64_normalized(a, b);
  }

  let exponentA = fp64_f32_finite_exponent(decodedA);
  let exponentB = fp64_f32_finite_exponent(decodedB);
  // Correct the quotient near unity so b * q and the remainder stay clear of
  // both f32 underflow and overflow. The exponent difference is applied once.
  let normalizedA = fp64_scale_fp64_integer(a, -exponentA);
  let normalizedB = fp64_scale_fp64_integer(b, -exponentB);
  let normalizedQuotient = fp64_div_fp64_normalized(normalizedA, normalizedB);
  return fp64_scale_fp64_integer(normalizedQuotient, exponentA - exponentB);
}

fn fp64_sqrt_fp64_normalized(a: vec2f) -> vec2f {
  let estimate = sqrt(a.x);
  let difference = sub_fp64(a, fp64_two_prod_integer(estimate, estimate)).x;
  let denominator = fp64_round_add_integer(estimate, estimate);
  let correction = fp64_divide_f32_integer(difference, denominator);
  return sum_fp64(vec2f(estimate, 0.0), vec2f(correction, 0.0));
}

fn sqrt_fp64(a: vec2f) -> vec2f {
  let decoded = fp64_decode_f32_bits(bitcast<u32>(a.x));
  let decodedLow = fp64_decode_f32_bits(bitcast<u32>(a.y));
  if (decoded.isZero && decodedLow.isZero) {
    return vec2f(0.0, 0.0);
  }
  if (decoded.sign == 1u) {
    let nanValue = fp64_nan(a.x);
    return vec2f(nanValue, nanValue);
  }

  if (decoded.isInf || decoded.isNan) {
    return fp64_sqrt_fp64_normalized(a);
  }
  let exponent = fp64_f32_finite_exponent(decoded);
  // An even scale lets the final square-root rescale use an integer exponent.
  let evenExponent = exponent - (exponent & 1);
  let normalizedA = fp64_scale_fp64_integer(a, -evenExponent);
  let normalizedRoot = fp64_sqrt_fp64_normalized(normalizedA);
  return fp64_scale_fp64_integer(normalizedRoot, evenExponent / 2);
}
#endif
`,Mc=`struct Fp64ArithmeticUniforms {
  ONE: f32,
  SPLIT: f32,
};

@group(0) @binding(auto) var<uniform> fp64arithmetic : Fp64ArithmeticUniforms;

#ifndef LUMA_FP64_F32_INPUT_ONLY
struct Fp64Bits {
  sign: u32,
  exponent: i32,
  significand: vec2u,
  isZero: bool,
  isInf: bool,
  isNan: bool,
};
#endif

#ifndef LUMA_FP64_PREDICATE_ONLY
fn fp64_nan(seed: f32) -> f32 {
  let nanBits = 0x7fc00000u | select(0u, 1u, seed < 0.0);
  return bitcast<f32>(nanBits);
}
#endif

fn fp64_u64_is_zero(value: vec2u) -> bool {
  return value.x == 0u && value.y == 0u;
}

fn fp64_u64_compare(a: vec2u, b: vec2u) -> i32 {
  if (a.x != b.x) {
    return select(-1, 1, a.x > b.x);
  }
  if (a.y != b.y) {
    return select(-1, 1, a.y > b.y);
  }
  return 0;
}

fn fp64_u64_add(a: vec2u, b: vec2u) -> vec2u {
  let low = a.y + b.y;
  let carry = select(0u, 1u, low < a.y);
  return vec2u(a.x + b.x + carry, low);
}

fn fp64_u64_sub(a: vec2u, b: vec2u) -> vec2u {
  let borrow = select(0u, 1u, a.y < b.y);
  return vec2u(a.x - b.x - borrow, a.y - b.y);
}

fn fp64_u64_shift_left(value: vec2u, shift: u32) -> vec2u {
  if (shift == 0u) {
    return value;
  }
  if (shift < 32u) {
    return vec2u((value.x << shift) | (value.y >> (32u - shift)), value.y << shift);
  }
  if (shift == 32u) {
    return vec2u(value.y, 0u);
  }
  if (shift < 64u) {
    return vec2u(value.y << (shift - 32u), 0u);
  }
  return vec2u(0u);
}

fn fp64_u64_shift_right(value: vec2u, shift: u32) -> vec2u {
  if (shift == 0u) {
    return value;
  }
  if (shift < 32u) {
    return vec2u(value.x >> shift, (value.y >> shift) | (value.x << (32u - shift)));
  }
  if (shift == 32u) {
    return vec2u(0u, value.x);
  }
  if (shift < 64u) {
    return vec2u(0u, value.x >> (shift - 32u));
  }
  return vec2u(0u);
}

fn fp64_u64_get_bit(value: vec2u, bitIndex: u32) -> bool {
  if (bitIndex >= 64u) {
    return false;
  }
  if (bitIndex >= 32u) {
    return ((value.x >> (bitIndex - 32u)) & 1u) != 0u;
  }
  return ((value.y >> bitIndex) & 1u) != 0u;
}

fn fp64_u64_has_bits_below(value: vec2u, bitCount: u32) -> bool {
  if (bitCount == 0u) {
    return false;
  }
  if (bitCount >= 64u) {
    return !fp64_u64_is_zero(value);
  }
  if (bitCount > 32u) {
    let highBitCount = bitCount - 32u;
    let highMask = (1u << highBitCount) - 1u;
    return value.y != 0u || (value.x & highMask) != 0u;
  }
  if (bitCount == 32u) {
    return value.y != 0u;
  }
  let lowMask = (1u << bitCount) - 1u;
  return (value.y & lowMask) != 0u;
}

#ifndef LUMA_FP64_F32_INPUT_ONLY
fn fp64_u64_shift_right_sticky(value: vec2u, shift: u32) -> vec2u {
  var shifted = fp64_u64_shift_right(value, shift);
  if (fp64_u64_has_bits_below(value, shift)) {
    shifted.y = shifted.y | 1u;
  }
  return shifted;
}
#endif

fn fp64_u64_count_leading_zeros(value: vec2u) -> u32 {
  if (value.x != 0u) {
    return countLeadingZeros(value.x);
  }
  return 32u + countLeadingZeros(value.y);
}

fn fp64_round_shift_right_to_u32(value: vec2u, shift: u32) -> u32 {
  if (shift == 0u) {
    return value.y;
  }

  let truncated = fp64_u64_shift_right(value, shift);
  var rounded = truncated.y;
  let guard = fp64_u64_get_bit(value, shift - 1u);
  let hasTrailingBits = fp64_u64_has_bits_below(value, shift - 1u);
  if (guard && (hasTrailingBits || (rounded & 1u) == 1u)) {
    rounded = rounded + 1u;
  }
  return rounded;
}

#ifndef LUMA_FP64_F32_INPUT_ONLY
fn fp64_round_shift_right(value: vec2u, shift: u32) -> vec2u {
  if (shift == 0u) {
    return value;
  }

  var rounded = fp64_u64_shift_right(value, shift);
  let guard = fp64_u64_get_bit(value, shift - 1u);
  let hasTrailingBits = fp64_u64_has_bits_below(value, shift - 1u);
  if (guard && (hasTrailingBits || (rounded.y & 1u) == 1u)) {
    rounded = fp64_u64_add(rounded, vec2u(0u, 1u));
  }
  return rounded;
}
#endif

fn fp64_make_f32_bits_from_u64(sign: u32, significand: vec2u, baseExponent: i32) -> u32 {
  if (fp64_u64_is_zero(significand)) {
    return sign << 31u;
  }

  let leadingZeros = fp64_u64_count_leading_zeros(significand);
  let mostSignificantBit = 63u - leadingZeros;
  var exponent = baseExponent + i32(mostSignificantBit);

  if (exponent > 127) {
    return (sign << 31u) | 0x7f800000u;
  }

  if (exponent >= -126) {
    let shift = i32(mostSignificantBit) - 23;
    var significand24: u32;
    if (shift > 0) {
      significand24 = fp64_round_shift_right_to_u32(significand, u32(shift));
    } else {
      significand24 = fp64_u64_shift_left(significand, u32(-shift)).y;
    }

    if (significand24 >= 0x1000000u) {
      significand24 = significand24 >> 1u;
      exponent = exponent + 1;
      if (exponent > 127) {
        return (sign << 31u) | 0x7f800000u;
      }
    }

    return (sign << 31u) | (u32(exponent + 127) << 23u) | (significand24 & 0x7fffffu);
  }

  let scaleExponent = baseExponent + 149;
  var mantissa: u32;
  if (scaleExponent >= 0) {
    mantissa = fp64_u64_shift_left(significand, u32(scaleExponent)).y;
  } else {
    mantissa = fp64_round_shift_right_to_u32(significand, u32(-scaleExponent));
  }

  if (mantissa >= 0x800000u) {
    return (sign << 31u) | 0x00800000u;
  }
  return (sign << 31u) | mantissa;
}

#ifndef LUMA_FP64_F32_INPUT_ONLY
fn fp64_decode_bits(bits: vec2u) -> Fp64Bits {
  let sign = bits.x >> 31u;
  let exponentBits = (bits.x >> 20u) & 0x7ffu;
  let fractionHigh = bits.x & 0xfffffu;
  let fractionLow = bits.y;
  let fraction = vec2u(fractionHigh, fractionLow);

  if (exponentBits == 0x7ffu) {
    let isInf = fp64_u64_is_zero(fraction);
    return Fp64Bits(sign, 0, vec2u(0u), false, isInf, !isInf);
  }

  if (exponentBits == 0u) {
    let isZero = fp64_u64_is_zero(fraction);
    return Fp64Bits(sign, -1022, fraction, isZero, false, false);
  }

  return Fp64Bits(sign, i32(exponentBits) - 1023, vec2u((1u << 20u) | fractionHigh, fractionLow), false, false, false);
}

fn fp64_finite_magnitude_compare(a: Fp64Bits, b: Fp64Bits) -> i32 {
  if (a.exponent != b.exponent) {
    return select(-1, 1, a.exponent > b.exponent);
  }
  return fp64_u64_compare(a.significand, b.significand);
}
#endif

#ifndef LUMA_FP64_F32_INPUT_ONLY
struct Fp64RawF32Bits {
  sign: u32,
  baseExponent: i32,
  significand: u32,
  isZero: bool,
  isInf: bool,
  isNan: bool,
};

// Decode an f32 as (-1)^sign * significand * 2^baseExponent. This shared
// integer representation lets normalization remain independent of the
// selected double-single arithmetic implementation.
fn fp64_decode_raw_f32_bits(bits: u32) -> Fp64RawF32Bits {
  let sign = bits >> 31u;
  let exponentBits = (bits >> 23u) & 0xffu;
  let fraction = bits & 0x7fffffu;

  if (exponentBits == 0xffu) {
    return Fp64RawF32Bits(sign, 0, 0u, false, fraction == 0u, fraction != 0u);
  }
  if (exponentBits == 0u) {
    return Fp64RawF32Bits(sign, -149, fraction, fraction == 0u, false, false);
  }
  return Fp64RawF32Bits(
    sign,
    i32(exponentBits) - 150,
    0x800000u | fraction,
    false,
    false,
    false
  );
}

fn fp64_raw_f32_magnitude_compare(aBits: u32, bBits: u32) -> i32 {
  let aMagnitude = aBits & 0x7fffffffu;
  let bMagnitude = bBits & 0x7fffffffu;
  if (aMagnitude == bMagnitude) {
    return 0;
  }
  return select(-1, 1, aMagnitude > bMagnitude);
}

fn fp64_make_raw_residual_f32_bits(
  exactSign: u32,
  exactMagnitude: vec2u,
  exactBaseExponent: i32,
  highBits: u32
) -> u32 {
  if (fp64_u64_is_zero(exactMagnitude)) {
    return 0u;
  }

  let high = fp64_decode_raw_f32_bits(highBits);
  if (high.isInf || high.isNan) {
    return 0u;
  }
  if (high.isZero) {
    return fp64_make_f32_bits_from_u64(exactSign, exactMagnitude, exactBaseExponent);
  }

  let commonBaseExponent = min(exactBaseExponent, high.baseExponent);
  let exactShift = exactBaseExponent - commonBaseExponent;
  let highShift = high.baseExponent - commonBaseExponent;
  if (exactShift >= 64 || highShift >= 64) {
    return 0u;
  }

  let exactAligned = fp64_u64_shift_left(exactMagnitude, u32(exactShift));
  let highAligned = fp64_u64_shift_left(vec2u(0u, high.significand), u32(highShift));
  let comparison = fp64_u64_compare(exactAligned, highAligned);
  if (comparison == 0) {
    return 0u;
  }

  var residualSign = exactSign;
  var residualMagnitude: vec2u;
  if (comparison > 0) {
    residualMagnitude = fp64_u64_sub(exactAligned, highAligned);
  } else {
    residualSign = exactSign ^ 1u;
    residualMagnitude = fp64_u64_sub(highAligned, exactAligned);
  }
  return fp64_make_f32_bits_from_u64(
    residualSign,
    residualMagnitude,
    commonBaseExponent
  );
}

fn fp64_split_raw_accumulator_bits(
  sign: u32,
  magnitude: vec2u,
  baseExponent: i32
) -> vec2u {
  if (fp64_u64_is_zero(magnitude)) {
    return vec2u(0u);
  }
  let highBits = fp64_make_f32_bits_from_u64(sign, magnitude, baseExponent);
  let rawLowBits = fp64_make_raw_residual_f32_bits(sign, magnitude, baseExponent, highBits);
  let lowBits = select(rawLowBits, 0u, (rawLowBits & 0x7fffffffu) == 0u);
  if ((highBits & 0x7fffffffu) == 0u && (lowBits & 0x7fffffffu) == 0u) {
    return vec2u(0u);
  }
  return vec2u(highBits, lowBits);
}
#endif

#ifndef LUMA_FP64_F32_INPUT_ONLY
// Round an arithmetic accumulator to binary64 before splitting it. The
// aligned add/subtract paths retain three guard bits plus a sticky bit, which
// is sufficient for round-to-nearest-even at the binary64 boundary.
fn fp64_split_binary64_accumulator_bits(
  sign: u32,
  magnitude: vec2u,
  baseExponent: i32
) -> vec2u {
  if (fp64_u64_is_zero(magnitude)) {
    return vec2u(0u);
  }

  let mostSignificantBit = 63u - fp64_u64_count_leading_zeros(magnitude);
  let exponent = baseExponent + i32(mostSignificantBit);
  if (exponent > 1023) {
    return vec2u((sign << 31u) | 0x7f800000u, 0u);
  }

  var roundedMagnitude = magnitude;
  var roundedBaseExponent = baseExponent;
  if (exponent >= -1022) {
    if (mostSignificantBit > 52u) {
      let shift = mostSignificantBit - 52u;
      roundedMagnitude = fp64_round_shift_right(magnitude, shift);
      roundedBaseExponent = baseExponent + i32(shift);
    }
  } else {
    let shift = -1074 - baseExponent;
    if (shift > 0) {
      roundedMagnitude = fp64_round_shift_right(magnitude, u32(shift));
      roundedBaseExponent = -1074;
    }
  }

  if (fp64_u64_is_zero(roundedMagnitude)) {
    return vec2u(0u);
  }
  return fp64_split_raw_accumulator_bits(sign, roundedMagnitude, roundedBaseExponent);
}
#endif

#ifndef LUMA_FP64_PREDICATE_ONLY
fn fp64_add_raw_f32_bits(aBits: u32, bBits: u32) -> vec2u {
  let a = fp64_decode_raw_f32_bits(aBits);
  let b = fp64_decode_raw_f32_bits(bBits);

  if (a.isNan || b.isNan) {
    return vec2u(0x7fc00000u, 0u);
  }
  if (a.isInf || b.isInf) {
    if (a.isInf && b.isInf && a.sign != b.sign) {
      return vec2u(0x7fc00000u, 0u);
    }
    return select(vec2u(bBits, 0u), vec2u(aBits, 0u), a.isInf);
  }
  if (a.isZero && b.isZero) {
    return vec2u(0u);
  }
  if (a.isZero) {
    return vec2u(bBits, 0u);
  }
  if (b.isZero) {
    return vec2u(aBits, 0u);
  }

  let exponentDifference = abs(a.baseExponent - b.baseExponent);
  if (exponentDifference > 25) {
    if (fp64_raw_f32_magnitude_compare(aBits, bBits) >= 0) {
      return vec2u(aBits, bBits);
    }
    return vec2u(bBits, aBits);
  }

  let commonBaseExponent = min(a.baseExponent, b.baseExponent);
  let aMagnitude = fp64_u64_shift_left(
    vec2u(0u, a.significand),
    u32(a.baseExponent - commonBaseExponent)
  );
  let bMagnitude = fp64_u64_shift_left(
    vec2u(0u, b.significand),
    u32(b.baseExponent - commonBaseExponent)
  );

  var resultSign = a.sign;
  var resultMagnitude: vec2u;
  if (a.sign == b.sign) {
    resultMagnitude = fp64_u64_add(aMagnitude, bMagnitude);
  } else {
    let comparison = fp64_u64_compare(aMagnitude, bMagnitude);
    if (comparison == 0) {
      return vec2u(0u);
    }
    if (comparison > 0) {
      resultMagnitude = fp64_u64_sub(aMagnitude, bMagnitude);
    } else {
      resultSign = b.sign;
      resultMagnitude = fp64_u64_sub(bMagnitude, aMagnitude);
    }
  }

  return fp64_split_raw_accumulator_bits(
    resultSign,
    resultMagnitude,
    commonBaseExponent
  );
}
#endif

#ifndef LUMA_FP64_F32_INPUT_ONLY
fn fp64_add_aligned_magnitudes_to_fp64_bits(
  sign: u32,
  larger: Fp64Bits,
  smaller: Fp64Bits
) -> vec2u {
  let largeSignificand = fp64_u64_shift_left(larger.significand, 3u);
  let smallSignificand = fp64_u64_shift_right_sticky(
    fp64_u64_shift_left(smaller.significand, 3u),
    u32(larger.exponent - smaller.exponent)
  );
  let resultSignificand = fp64_u64_add(largeSignificand, smallSignificand);
  return fp64_split_binary64_accumulator_bits(
    sign,
    resultSignificand,
    larger.exponent - 55
  );
}

fn fp64_sub_aligned_magnitudes_to_fp64_bits(
  sign: u32,
  larger: Fp64Bits,
  smaller: Fp64Bits
) -> vec2u {
  let largeSignificand = fp64_u64_shift_left(larger.significand, 3u);
  let smallSignificand = fp64_u64_shift_right_sticky(
    fp64_u64_shift_left(smaller.significand, 3u),
    u32(larger.exponent - smaller.exponent)
  );
  let resultSignificand = fp64_u64_sub(largeSignificand, smallSignificand);
  return fp64_split_binary64_accumulator_bits(
    sign,
    resultSignificand,
    larger.exponent - 55
  );
}

fn fp64_add_aligned_magnitudes_to_f32_bits(sign: u32, larger: Fp64Bits, smaller: Fp64Bits) -> u32 {
  let largeSignificand = fp64_u64_shift_left(larger.significand, 3u);
  let smallSignificand = fp64_u64_shift_right_sticky(
    fp64_u64_shift_left(smaller.significand, 3u),
    u32(larger.exponent - smaller.exponent)
  );
  let resultSignificand = fp64_u64_add(largeSignificand, smallSignificand);
  return fp64_make_f32_bits_from_u64(sign, resultSignificand, larger.exponent - 55);
}

fn fp64_sub_aligned_magnitudes_to_f32_bits(sign: u32, larger: Fp64Bits, smaller: Fp64Bits) -> u32 {
  let largeSignificand = fp64_u64_shift_left(larger.significand, 3u);
  let smallSignificand = fp64_u64_shift_right_sticky(
    fp64_u64_shift_left(smaller.significand, 3u),
    u32(larger.exponent - smaller.exponent)
  );
  let resultSignificand = fp64_u64_sub(largeSignificand, smallSignificand);
  return fp64_make_f32_bits_from_u64(sign, resultSignificand, larger.exponent - 55);
}

// Subtract two raw binary64 values and round the exact result once to f32.
// The input words are canonical high/low words: .x contains sign/exponent/high
// fraction bits, and .y contains the low 32 fraction bits.
fn sub_fp64u32_to_f32_bits(aBits: vec2u, bBits: vec2u) -> u32 {
  let a = fp64_decode_bits(aBits);
  let b = fp64_decode_bits(bBits);
  let bSubtractionSign = b.sign ^ 1u;

  if (a.isNan || b.isNan) {
    return 0x7fc00000u;
  }
  if (a.isInf && b.isInf) {
    if (a.sign == bSubtractionSign) {
      return (a.sign << 31u) | 0x7f800000u;
    }
    return 0x7fc00000u;
  }
  if (a.isInf) {
    return (a.sign << 31u) | 0x7f800000u;
  }
  if (b.isInf) {
    return (bSubtractionSign << 31u) | 0x7f800000u;
  }
  if (a.isZero && b.isZero) {
    return select(0u, 0x80000000u, a.sign == 1u && b.sign == 0u);
  }

  let magnitudeComparison = fp64_finite_magnitude_compare(a, b);
  if (a.sign == bSubtractionSign) {
    if (magnitudeComparison >= 0) {
      return fp64_add_aligned_magnitudes_to_f32_bits(a.sign, a, b);
    }
    return fp64_add_aligned_magnitudes_to_f32_bits(a.sign, b, a);
  }

  if (magnitudeComparison == 0) {
    return 0u;
  }
  if (magnitudeComparison > 0) {
    return fp64_sub_aligned_magnitudes_to_f32_bits(a.sign, a, b);
  }
  return fp64_sub_aligned_magnitudes_to_f32_bits(bSubtractionSign, b, a);
}

fn sub_fp64u32_to_f32(aBits: vec2u, bBits: vec2u) -> f32 {
  return bitcast<f32>(sub_fp64u32_to_f32_bits(aBits, bBits));
}

// Subtract two raw binary64 values, round once to binary64, then split the
// result into normalized f32 limbs. Finite results must fit within the f32
// exponent range; larger magnitudes map to infinity and smaller magnitudes
// map to zero. The input words use canonical high/low word order.
fn sub_fp64u32_to_fp64_bits(aBits: vec2u, bBits: vec2u) -> vec2u {
  let a = fp64_decode_bits(aBits);
  let b = fp64_decode_bits(bBits);
  let bSubtractionSign = b.sign ^ 1u;

  if (a.isNan || b.isNan) {
    return vec2u(0x7fc00000u, 0u);
  }
  if (a.isInf && b.isInf) {
    if (a.sign == bSubtractionSign) {
      return vec2u((a.sign << 31u) | 0x7f800000u, 0u);
    }
    return vec2u(0x7fc00000u, 0u);
  }
  if (a.isInf) {
    return vec2u((a.sign << 31u) | 0x7f800000u, 0u);
  }
  if (b.isInf) {
    return vec2u((bSubtractionSign << 31u) | 0x7f800000u, 0u);
  }
  if (a.isZero && b.isZero) {
    return vec2u(0u);
  }

  let magnitudeComparison = fp64_finite_magnitude_compare(a, b);
  if (a.sign == bSubtractionSign) {
    if (magnitudeComparison >= 0) {
      return fp64_add_aligned_magnitudes_to_fp64_bits(a.sign, a, b);
    }
    return fp64_add_aligned_magnitudes_to_fp64_bits(a.sign, b, a);
  }

  if (magnitudeComparison == 0) {
    return vec2u(0u);
  }
  if (magnitudeComparison > 0) {
    return fp64_sub_aligned_magnitudes_to_fp64_bits(a.sign, a, b);
  }
  return fp64_sub_aligned_magnitudes_to_fp64_bits(bSubtractionSign, b, a);
}

fn sub_fp64u32_to_fp64(aBits: vec2u, bBits: vec2u) -> vec2f {
  let resultBits = sub_fp64u32_to_fp64_bits(aBits, bBits);
  return vec2f(bitcast<f32>(resultBits.x), bitcast<f32>(resultBits.y));
}
#endif

#ifndef LUMA_FP64_PREDICATE_ONLY
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
#endif

#ifdef LUMA_FP64_INTEGER_ARITHMETIC
${Ic}
#else
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

#ifndef LUMA_FP64_PREDICATE_ONLY
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
#endif
#endif

#ifndef LUMA_FP64_PREDICATE_ONLY
fn fp64_f32_bits_is_nan(bits: u32) -> bool {
  return (bits & 0x7fffffffu) > 0x7f800000u;
}

fn fp64_f32_bits_is_inf(bits: u32) -> bool {
  return (bits & 0x7fffffffu) == 0x7f800000u;
}

fn fp64_compare_f32_bits(aBits: u32, bBits: u32) -> i32 {
  let aMagnitude = aBits & 0x7fffffffu;
  let bMagnitude = bBits & 0x7fffffffu;
  if (aMagnitude == 0u && bMagnitude == 0u) {
    return 0;
  }
  let aSign = aBits >> 31u;
  let bSign = bBits >> 31u;
  if (aSign != bSign) {
    return select(1, -1, aSign == 1u);
  }
  if (aMagnitude == bMagnitude) {
    return 0;
  }
  let magnitudeComparison = select(-1, 1, aMagnitude > bMagnitude);
  return select(magnitudeComparison, -magnitudeComparison, aSign == 1u);
}

// Normalize an arbitrary pair of finite f32 limbs with integer accumulation.
// This is independent of LUMA_FP64_INTEGER_ARITHMETIC and canonicalizes every
// representation of zero to vec2f(+0.0, +0.0).
fn normalize_fp64(value: vec2f) -> vec2f {
  let resultBits = fp64_add_raw_f32_bits(bitcast<u32>(value.x), bitcast<u32>(value.y));
  return vec2f(bitcast<f32>(resultBits.x), bitcast<f32>(resultBits.y));
}

fn is_nan_fp64(value: vec2f) -> bool {
  let normalized = normalize_fp64(value);
  return fp64_f32_bits_is_nan(bitcast<u32>(normalized.x)) ||
    fp64_f32_bits_is_nan(bitcast<u32>(normalized.y));
}

fn is_finite_fp64(value: vec2f) -> bool {
  let normalized = normalize_fp64(value);
  let highBits = bitcast<u32>(normalized.x);
  let lowBits = bitcast<u32>(normalized.y);
  return !fp64_f32_bits_is_nan(highBits) && !fp64_f32_bits_is_nan(lowBits) &&
    !fp64_f32_bits_is_inf(highBits) && !fp64_f32_bits_is_inf(lowBits);
}

// Returns -1, 0, or 1. NaN is unordered and returns 0; call is_nan_fp64 or
// is_finite_fp64 first when 0 must mean a finite zero.
fn sign_fp64(value: vec2f) -> i32 {
  let normalized = normalize_fp64(value);
  let highBits = bitcast<u32>(normalized.x);
  let lowBits = bitcast<u32>(normalized.y);
  if (fp64_f32_bits_is_nan(highBits) || fp64_f32_bits_is_nan(lowBits)) {
    return 0;
  }
  if ((highBits & 0x7fffffffu) != 0u) {
    return select(1, -1, (highBits >> 31u) == 1u);
  }
  if ((lowBits & 0x7fffffffu) != 0u) {
    return select(1, -1, (lowBits >> 31u) == 1u);
  }
  return 0;
}

// Compares double-single values and returns -1, 0, or 1. NaN is unordered
// and returns 0; callers that require equality semantics must first check
// is_nan_fp64 or is_finite_fp64.
fn compare_fp64(a: vec2f, b: vec2f) -> i32 {
  let normalizedA = normalize_fp64(a);
  let normalizedB = normalize_fp64(b);
  let aHighBits = bitcast<u32>(normalizedA.x);
  let aLowBits = bitcast<u32>(normalizedA.y);
  let bHighBits = bitcast<u32>(normalizedB.x);
  let bLowBits = bitcast<u32>(normalizedB.y);
  if (fp64_f32_bits_is_nan(aHighBits) || fp64_f32_bits_is_nan(aLowBits) ||
      fp64_f32_bits_is_nan(bHighBits) || fp64_f32_bits_is_nan(bLowBits)) {
    return 0;
  }
  let highComparison = fp64_compare_f32_bits(aHighBits, bHighBits);
  if (highComparison != 0) {
    return highComparison;
  }
  return fp64_compare_f32_bits(aLowBits, bLowBits);
}
#endif
`,Bc={ONE:1,SPLIT:4097},Oc={name:"fp64arithmetic",source:Mc,fs:Jn,vs:Jn,defaultUniforms:Bc,uniformTypes:{ONE:"f32",SPLIT:"f32"},fp64ify:Vo,fp64LowPart:Ac,fp64ifyMatrix4:Tc},Rc={useByteColors:"f32"},zc={useByteColors:!0},Qn=Fc("floatColors"),Nc=Dc("floatColors");function Fc(n){return`layout(std140) uniform ${n}Uniforms {
  float useByteColors;
} ${n};

vec3 ${n}_normalize(vec3 inputColor) {
  return ${n}.useByteColors > 0.5 ? inputColor / 255.0 : inputColor;
}

vec4 ${n}_normalize(vec4 inputColor) {
  return ${n}.useByteColors > 0.5 ? inputColor / 255.0 : inputColor;
}

vec4 ${n}_premultiplyAlpha(vec4 inputColor) {
  return vec4(inputColor.rgb * inputColor.a, inputColor.a);
}

vec4 ${n}_unpremultiplyAlpha(vec4 inputColor) {
  return inputColor.a > 0.0 ? vec4(inputColor.rgb / inputColor.a, inputColor.a) : vec4(0.0);
}

vec4 ${n}_premultiply_alpha(vec4 inputColor) {
  return ${n}_premultiplyAlpha(inputColor);
}

vec4 ${n}_unpremultiply_alpha(vec4 inputColor) {
  return ${n}_unpremultiplyAlpha(inputColor);
}
`}function Dc(n){return`struct ${n}Uniforms {
  useByteColors: f32
};

@group(0) @binding(auto) var<uniform> ${n} : ${n}Uniforms;

fn ${n}_normalize(inputColor: vec3<f32>) -> vec3<f32> {
  return select(inputColor, inputColor / 255.0, ${n}.useByteColors > 0.5);
}

fn ${n}_normalize4(inputColor: vec4<f32>) -> vec4<f32> {
  return select(inputColor, inputColor / 255.0, ${n}.useByteColors > 0.5);
}

fn ${n}_premultiplyAlpha(inputColor: vec4<f32>) -> vec4<f32> {
  return vec4<f32>(inputColor.rgb * inputColor.a, inputColor.a);
}

fn ${n}_unpremultiplyAlpha(inputColor: vec4<f32>) -> vec4<f32> {
  return select(
    vec4<f32>(0.0),
    vec4<f32>(inputColor.rgb / inputColor.a, inputColor.a),
    inputColor.a > 0.0
  );
}

fn ${n}_premultiply_alpha(inputColor: vec4<f32>) -> vec4<f32> {
  return ${n}_premultiplyAlpha(inputColor);
}

fn ${n}_unpremultiply_alpha(inputColor: vec4<f32>) -> vec4<f32> {
  return ${n}_unpremultiplyAlpha(inputColor);
}
`}const $o={name:"floatColors",props:{},uniforms:{},vs:Qn,fs:Qn,source:Nc,uniformTypes:Rc,defaultUniforms:zc},kc=[0,1,1,1],Uc=`layout(std140) uniform pickingUniforms {
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
`,Vc=`layout(std140) uniform pickingUniforms {
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
`,Ee={props:{},uniforms:{},name:"picking",uniformTypes:{isActive:"f32",isAttribute:"f32",isHighlightActive:"f32",useByteColors:"f32",highlightedObjectColor:"vec3<f32>",highlightColor:"vec4<f32>"},defaultUniforms:{isActive:!1,isAttribute:!1,isHighlightActive:!1,useByteColors:!0,highlightedObjectColor:[0,0,0],highlightColor:kc},vs:Uc,fs:Vc,getUniforms:jc};function jc(n={},e){const t={},i=jo(n.useByteColors,!0);if(n.highlightedObjectColor!==void 0)if(n.highlightedObjectColor===null)t.isHighlightActive=!1;else{t.isHighlightActive=!0;const s=n.highlightedObjectColor.slice(0,3);t.highlightedObjectColor=s}return n.highlightColor&&(t.highlightColor=Ec(n.highlightColor,i)),n.isActive!==void 0&&(t.isActive=!!n.isActive,t.isAttribute=!!n.isAttribute),n.useByteColors!==void 0&&(t.useByteColors=!!n.useByteColors),t}const es=`precision highp int;

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
`,Gc=`// #if (defined(SHADER_TYPE_FRAGMENT) && defined(LIGHTING_FRAGMENT)) || (defined(SHADER_TYPE_VERTEX) && defined(LIGHTING_VERTEX))
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
`,Le=5,$c={color:"vec3<f32>",position:"vec3<f32>",direction:"vec3<f32>",attenuation:"vec3<f32>",coneCos:"vec2<f32>"},Wo={props:{},uniforms:{},name:"lighting",defines:{},uniformTypes:{enabled:"i32",directionalLightCount:"i32",pointLightCount:"i32",spotLightCount:"i32",ambientColor:"vec3<f32>",lights:[$c,Le]},defaultUniforms:Nt(),bindingLayout:[{name:"lighting",group:2}],firstBindingSlot:0,source:Gc,vs:es,fs:es,getUniforms:Wc};function Wc(n,e={}){if(n=n&&{...n},!n)return Nt();n.lights&&(n={...n,...qc(n.lights),lights:void 0});const{useByteColors:t,ambientLight:i,pointLights:s,spotLights:o,directionalLights:r}=n||{};if(!(i||s&&s.length>0||o&&o.length>0||r&&r.length>0))return{...Nt(),enabled:0};const c={...Nt(),...Hc({useByteColors:t,ambientLight:i,pointLights:s,spotLights:o,directionalLights:r})};return n.enabled!==void 0&&(c.enabled=n.enabled?1:0),c}function Hc({useByteColors:n,ambientLight:e,pointLights:t=[],spotLights:i=[],directionalLights:s=[]}){const o=Ho();let r=0,a=0,c=0,l=0;for(const u of t){if(r>=Le)break;o[r]={...o[r],color:yt(u,n),position:u.position,attenuation:u.attenuation||[1,0,0]},r++,a++}for(const u of i){if(r>=Le)break;o[r]={...o[r],color:yt(u,n),position:u.position,direction:u.direction,attenuation:u.attenuation||[1,0,0],coneCos:Xc(u)},r++,c++}for(const u of s){if(r>=Le)break;o[r]={...o[r],color:yt(u,n),direction:u.direction},r++,l++}return t.length+i.length+s.length>Le&&R.warn(`MAX_LIGHTS exceeded, truncating to ${Le}`)(),{ambientColor:yt(e,n),directionalLightCount:l,pointLightCount:a,spotLightCount:c,lights:o}}function qc(n){const e={pointLights:[],spotLights:[],directionalLights:[]};for(const t of n||[])switch(t.type){case"ambient":e.ambientLight=t;break;case"directional":e.directionalLights?.push(t);break;case"point":e.pointLights?.push(t);break;case"spot":e.spotLights?.push(t);break}return e}function yt(n={},e){const{color:t=[0,0,0],intensity:i=1}=n;return Go(t,jo(e,!0)).map(o=>o*i)}function Nt(){return{enabled:1,directionalLightCount:0,pointLightCount:0,spotLightCount:0,ambientColor:[.1,.1,.1],lights:Ho()}}function Ho(){return Array.from({length:Le},()=>Yc())}function Yc(){return{color:[1,1,1],position:[1,1,2],direction:[1,1,1],attenuation:[1,0,0],coneCos:[1,0]}}function Xc(n){const e=n.innerConeAngle??0,t=n.outerConeAngle??Math.PI/4;return[Math.cos(e),Math.cos(t)]}const qo=`layout(std140) uniform phongMaterialUniforms {
  uniform bool unlit;
  uniform float ambient;
  uniform float diffuse;
  uniform float shininess;
  uniform vec3  specularColor;
} material;
`,Yo=`layout(std140) uniform phongMaterialUniforms {
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
`,Xo=`struct phongMaterialUniforms {
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
`,Zc=[38.25,38.25,38.25],Zo={props:{},name:"gouraudMaterial",bindingLayout:[{name:"gouraudMaterial",group:3}],vs:Yo.replace("phongMaterial","gouraudMaterial"),fs:qo.replace("phongMaterial","gouraudMaterial"),source:Xo.replaceAll("phongMaterial","gouraudMaterial"),defines:{LIGHTING_VERTEX:!0},dependencies:[Wo,$o],uniformTypes:{unlit:"i32",ambient:"f32",diffuse:"f32",shininess:"f32",specularColor:"vec3<f32>"},defaultUniforms:{unlit:!1,ambient:.35,diffuse:.6,shininess:32,specularColor:Zc},getUniforms(n){return{...Zo.defaultUniforms,...n}}},Kc=[38.25,38.25,38.25],Ko={name:"phongMaterial",firstBindingSlot:0,bindingLayout:[{name:"phongMaterial",group:3}],dependencies:[Wo,$o],source:Xo,vs:qo,fs:Yo,defines:{LIGHTING_FRAGMENT:!0},uniformTypes:{unlit:"i32",ambient:"f32",diffuse:"f32",shininess:"f32",specularColor:"vec3<f32>"},defaultUniforms:{unlit:!1,ambient:.35,diffuse:.6,shininess:32,specularColor:Kc},getUniforms(n){return{...Ko.defaultUniforms,...n}}},Jc=`

@must_use
fn deckgl_premultiplied_alpha(fragColor: vec4<f32>) -> vec4<f32> {
    return vec4(fragColor.rgb * fragColor.a, fragColor.a); 
};
`,ke={name:"color",dependencies:[],source:Jc,getUniforms:n=>({})},Qc=`// Define a structure to hold both the clip-space position and the common position.
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
`,el=`vec4 project_position_to_clipspace(
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
`,Ue={name:"project32",dependencies:[Bo],source:Qc,vs:el},Zt=10,Kt=16777215;function tl(n,e){n.length===Zt?Y.warn(`pickMultipleObjects can only exclude ${Zt} previously picked objects for layers without picking buffers`)():n.push(e)}const il=`  float disabledPickingIndexCount;
  vec4 disabledPickingIndices0;
  vec4 disabledPickingIndices1;
  vec4 disabledPickingIndices2;
`;function ts(n){return n.replace(`  vec4 highlightColor;
} picking;`,`  vec4 highlightColor;
${il}} picking;`)}function vi(n,e){return[n[e]||0,n[e+1]||0,n[e+2]||0,n[e+3]||0]}const nl=`vec3 picking_getPickingColorFromIndex(float objectIndex) {
  if (objectIndex < 0.0 || objectIndex >= ${Kt}.0) {
    return vec3(0.0);
  }

  for (int i = 0; i < ${Zt}; i++) {
    if (float(i) >= picking.disabledPickingIndexCount) {
      break;
    }
    vec4 disabledIndices = i < 4
      ? picking.disabledPickingIndices0
      : (i < 8 ? picking.disabledPickingIndices1 : picking.disabledPickingIndices2);
    float disabledIndex = disabledIndices[i - (i / 4) * 4];
    if (disabledIndex == objectIndex) {
      return vec3(0.0);
    }
  }

  float encodedIndex = objectIndex + 1.0;
  return vec3(
    mod(encodedIndex, 256.0),
    mod(floor(encodedIndex / 256.0), 256.0),
    mod(floor(encodedIndex / 65536.0), 256.0)
  );
}

vec3 picking_getPickingColorFromIndex(uint objectIndex) {
  return picking_getPickingColorFromIndex(float(objectIndex));
}

vec3 picking_getPickingColorFromInstanceID() {
  return picking_getPickingColorFromIndex(float(gl_InstanceID));
}

void picking_setPickingColorFromInstanceID() {
  picking_setPickingColor(picking_getPickingColorFromInstanceID());
}
`,sl=`struct pickingUniforms {
  isActive: f32,
  isAttribute: f32,
  isHighlightActive: f32,
  useByteColors: f32,
  highlightedObjectColor: vec3<f32>,
  highlightColor: vec4<f32>,
  disabledPickingIndexCount: f32,
  disabledPickingIndices0: vec4<f32>,
  disabledPickingIndices1: vec4<f32>,
  disabledPickingIndices2: vec4<f32>,
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

fn picking_getPickingColorFromIndex(objectIndex: u32) -> vec3<f32> {
  if (objectIndex >= ${Kt}u) {
    return vec3<f32>(0.0);
  }

  for (var i = 0; i < ${Zt}; i = i + 1) {
    if (f32(i) >= picking.disabledPickingIndexCount) {
      break;
    }
    let disabledIndices = select(
      picking.disabledPickingIndices2,
      select(picking.disabledPickingIndices1, picking.disabledPickingIndices0, i < 4),
      i < 8
    );
    let disabledIndex = disabledIndices[i % 4];
    if (disabledIndex == f32(objectIndex)) {
      return vec3<f32>(0.0);
    }
  }

  let encodedIndex = objectIndex + 1u;
  return vec3<f32>(
    f32(encodedIndex % 256u),
    f32((encodedIndex / 256u) % 256u),
    f32((encodedIndex / 65536u) % 256u)
  ) / 255.0;
}
`,Ve={...Ee,vs:`${ts(Ee.vs)}
${nl}`,fs:ts(Ee.fs),source:sl,uniformTypes:{...Ee.uniformTypes,disabledPickingIndexCount:"f32",disabledPickingIndices0:"vec4<f32>",disabledPickingIndices1:"vec4<f32>",disabledPickingIndices2:"vec4<f32>"},defaultUniforms:{...Ee.defaultUniforms,useByteColors:!0,disabledPickingIndexCount:0,disabledPickingIndices0:[0,0,0,0],disabledPickingIndices1:[0,0,0,0],disabledPickingIndices2:[0,0,0,0]},getUniforms(n,e){const t=Ee.getUniforms(n,e),i=n.disabledPickingIndices||[];return t.disabledPickingIndexCount=i.length,t.disabledPickingIndices0=vi(i,0),t.disabledPickingIndices1=vi(i,4),t.disabledPickingIndices2=vi(i,8),t},inject:{"vs:DECKGL_FILTER_GL_POSITION":`
    // for picking depth values
    picking_setPickingAttribute(position.z / position.w);
  `,"vs:DECKGL_FILTER_COLOR":`
  picking_setPickingColor(geometry.pickingColor);
  `,"fs:DECKGL_FILTER_COLOR":{order:99,injection:`
  // use highlight color if this fragment belongs to the selected object.
  color = picking_filterHighlightColor(color);

  // use picking color if rendering to picking FBO.
  color = picking_filterPickingColor(color);
    `}}},is=[0,0,0];function bi(n,e,t=!1){const i=e.projectPosition(n);if(t&&e instanceof Wt){const[s,o,r=0]=n,a=e.getDistanceScales([s,o]);i[2]=r*a.unitsPerMeter[2]}return i}function ol(n){const{viewport:e,modelMatrix:t,coordinateOrigin:i}=n;let{coordinateSystem:s,fromCoordinateSystem:o,fromCoordinateOrigin:r}=n;return s==="default"&&(s=e.isGeospatial?"lnglat":"cartesian"),o===void 0?o=s:o==="default"&&(o=e.isGeospatial?"lnglat":"cartesian"),r===void 0&&(r=i),{viewport:e,coordinateSystem:s,coordinateOrigin:i,modelMatrix:t,fromCoordinateSystem:o,fromCoordinateOrigin:r}}function bn(n,{viewport:e,modelMatrix:t,coordinateSystem:i,coordinateOrigin:s,offsetMode:o}){let[r,a,c=0]=n;switch(t&&([r,a,c]=Ca([],[r,a,c,1],t)),i){case"default":return bn(n,{viewport:e,modelMatrix:t,coordinateSystem:e.isGeospatial?"lnglat":"cartesian",coordinateOrigin:s,offsetMode:o});case"lnglat":return bi([r,a,c],e,o);case"lnglat-offsets":return bi([r+s[0],a+s[1],c+(s[2]||0)],e,o);case"meter-offsets":return bi(La(s,[r,a,c]),e,o);case"cartesian":return e.isGeospatial?[r+s[0],a+s[1],c+s[2]]:e.projectPosition([r,a,c]);default:throw new Error(`Invalid coordinateSystem: ${i}`)}}function rl(n,e){const{viewport:t,coordinateSystem:i,coordinateOrigin:s,modelMatrix:o,fromCoordinateSystem:r,fromCoordinateOrigin:a}=ol(e),{autoOffset:c=!0}=e,{geospatialOrigin:l=is,shaderCoordinateOrigin:u=is,offsetMode:f=!1}=c?Sa(t,i,s):{},d=bn(n,{viewport:t,modelMatrix:o,coordinateSystem:r,coordinateOrigin:a,offsetMode:f});if(f){const h=t.projectPosition(l||u);Aa(d,d,h)}return d}const xi={};function ft(n="id"){xi[n]=xi[n]||1;const e=xi[n]++;return`${n}-${e}`}class pe{id;topology;vertexCount;indices;attributes;bufferLayout;userData={};constructor(e){const{attributes:t={},indices:i=null,vertexCount:s=null}=e;this.id=e.id||ft("geometry"),this.topology=e.topology,i&&(this.indices=ArrayBuffer.isView(i)?{value:i,size:1}:i),this.attributes={};for(const[o,r]of Object.entries(t)){const a=ArrayBuffer.isView(r)?{value:r}:r;if(!ArrayBuffer.isView(a.value))throw new Error(`${this._print(o)}: must be typed array or object with value as typed array`);if((o==="POSITION"||o==="positions")&&!a.size&&(a.size=3),o==="indices"){if(this.indices)throw new Error("Multiple indices detected");this.indices=a}else{const c=at(o),l=Object.keys(this.attributes).find(u=>at(u)===c);l&&delete this.attributes[l],this.attributes[o]=a}}this.indices&&this.indices.isIndexed!==void 0&&(this.indices=Object.assign({},this.indices),delete this.indices.isIndexed),this.vertexCount=s||this._calculateVertexCount(this.attributes,this.indices),this.bufferLayout=e.bufferLayout||al(this.attributes)}getVertexCount(){return this.vertexCount}getAttributes(){return this.indices?{indices:this.indices,...this.attributes}:this.attributes}_print(e){return`Geometry ${this.id} attribute ${e}`}_setAttributes(e,t){return this}_calculateVertexCount(e,t){if(t)return t.value.length;let i=1/0;for(const s of Object.values(e)){if(!s)continue;const{value:o,size:r,constant:a}=s;!a&&o&&r!==void 0&&r>=1&&(i=Math.min(i,o.length/r))}return i}}function at(n){switch(n){case"POSITION":return"positions";case"NORMAL":return"normals";case"TEXCOORD_0":return"texCoords";case"TEXCOORD_1":return"texCoords1";case"COLOR_0":return"colors";default:return n}}function al(n){const e=[];for(const[t,i]of Object.entries(n)){if(!i)continue;const{value:s,size:o,normalized:r}=i;if(o===void 0)throw new Error(`Attribute ${t} is missing a size`);e.push({name:at(t),format:ge.getVertexFormatFromAttribute(s,o,r)})}return e}function cl(n,e={}){const t=e.bufferName||"geometry";if(ll(n,t))return n;const i=e.minAttributeAlignment||4,s=ul(n,e.attributes),o=[];let r=0,a=1/0;for(const[u,f]of s){if(!f)continue;if(f.constant)throw new Error(`Attribute ${u} is constant`);const{value:d,size:h,normalized:p}=f;if(!ArrayBuffer.isView(d))throw new Error(`Attribute ${u} is missing typed array data`);if(h===void 0)throw new Error(`Attribute ${u} is missing a size`);const g=ge.getVertexFormatFromAttribute(d,h,p),y=ge.getVertexFormatInfo(g);r=ns(r,i),o.push({sourceName:u,attributeName:at(u),value:d,size:h,format:g,byteOffset:r,byteLength:y.byteLength}),r+=y.byteLength;const b=d.length/h;if(!Number.isInteger(b))throw new Error(`Attribute ${u} length is not divisible by size`);a=Math.min(a,b)}if(o.length===0||!Number.isFinite(a))throw new Error(`Geometry ${n.id} has no interleavable attributes`);const c=ns(r,i),l=new ArrayBuffer(a*c);for(const u of o)fl(l,a,c,u);return new pe({id:n.id,topology:n.topology||"triangle-list",vertexCount:n.vertexCount,indices:n.indices,attributes:{[t]:{value:new Uint8Array(l),size:c,byteStride:c}},bufferLayout:[{name:t,stepMode:"vertex",byteStride:c,attributes:o.map(u=>({attribute:u.attributeName,format:u.format,byteOffset:u.byteOffset}))}]})}function ll(n,e){if(n.bufferLayout.length!==1)return!1;const t=n.bufferLayout[0];return t.name===e&&!!t.attributes?.length&&!!n.attributes[e]}function ul(n,e){return e?e.map(t=>[t,n.attributes[t]]):Object.entries(n.attributes)}function fl(n,e,t,i){const s=i.value.constructor,o=s.BYTES_PER_ELEMENT;if(i.byteOffset%o!==0||t%o!==0)throw new Error(`Attribute ${i.sourceName} is not aligned to its component type`);const r=new s(n),a=i.value,c=i.byteOffset/o,l=t/o;for(let u=0;u<e;u++){const f=u*i.size,d=u*l+c;for(let h=0;h<i.size;h++)r[d+h]=a[f+h]}}function ns(n,e){return Math.ceil(n/e)*e}class ss{id;userData={};topology;bufferLayout=[];vertexCount;indices;attributes;constructor(e){if(this.id=e.id||ft("geometry"),this.topology=e.topology,this.indices=e.indices||null,this.attributes=e.attributes,this.vertexCount=e.vertexCount,this.bufferLayout=e.bufferLayout||[],this.indices&&!(this.indices.usage&j.INDEX))throw new Error("Index buffer must have INDEX usage")}destroy(){this.indices?.destroy();for(const e of Object.values(this.attributes))e.destroy()}getVertexCount(){return this.vertexCount}getAttributes(){return this.attributes}getIndexes(){return this.indices||null}_calculateVertexCount(e){return e.byteLength/12}}function dl(n,e){if(e instanceof ss)return e;const t=cl(e),i=hl(n,t),{attributes:s,bufferLayout:o}=pl(n,t);return new ss({topology:t.topology||"triangle-list",bufferLayout:o,vertexCount:t.vertexCount,indices:i,attributes:s})}function hl(n,e){if(!e.indices)return;const t=e.indices.value;return n.createBuffer({usage:j.INDEX,data:t})}function pl(n,e){const t={};for(const[i,s]of Object.entries(e.attributes)){const o=e.bufferLayout.find(r=>r.name===i)?.name||at(i);s&&(t[o]=n.createBuffer({data:s.value,id:`${i}-buffer`}))}return{attributes:t,bufferLayout:e.bufferLayout,vertexCount:e.vertexCount}}function gl(n,e){const t={},i="Values";if(n.attributes.length===0&&!n.varyings?.length)return{"No attributes or varyings":{[i]:"N/A"}};for(const s of n.attributes)if(s){const o=`${s.location} ${s.name}: ${s.type}`;t[`in ${o}`]={[i]:s.stepMode||"vertex"}}for(const s of n.varyings||[]){const o=`${s.location} ${s.name}`;t[`out ${o}`]={[i]:JSON.stringify(s)}}return t}const os="__debugFramebufferState",Pi=8;function ml(n,e,t){if(n.device.type!=="webgl")return;const i=vl(n.device);if(!i.flushing){if(xl(n)){yl(n,t,i);return}e&&bl(e)&&e.handle!==null&&(i.queuedFramebuffers.includes(e)||i.queuedFramebuffers.push(e))}}function yl(n,e,t){if(t.queuedFramebuffers.length===0)return;const i=n.device,{gl:s}=i,o=s.getParameter(36010),r=s.getParameter(36006),[a,c]=n.device.getDefaultCanvasContext().getDrawingBufferSize();let l=rs(e.top,Pi);const u=rs(e.left,Pi);t.flushing=!0;try{for(const f of t.queuedFramebuffers){const[d,h,p,g,y]=_l({framebuffer:f,targetWidth:a,targetHeight:c,topPx:l,leftPx:u,minimap:e.minimap});s.bindFramebuffer(36008,f.handle),s.bindFramebuffer(36009,null),s.blitFramebuffer(0,0,f.width,f.height,d,h,p,g,16384,9728),l+=y+Pi}}finally{s.bindFramebuffer(36008,o),s.bindFramebuffer(36009,r),t.flushing=!1}}function _l(n){const{framebuffer:e,targetWidth:t,targetHeight:i,topPx:s,leftPx:o}=n,r=Math.max(Math.floor(t/4),1),a=Math.max(Math.floor(i/4),1),c=Math.min(r/e.width,a/e.height),l=Math.max(Math.floor(e.width*c),1),u=Math.max(Math.floor(e.height*c),1),f=o,d=Math.max(i-s-u,0),h=f+l,p=d+u;return[f,d,h,p,u]}function vl(n){return n.userData[os]||={flushing:!1,queuedFramebuffers:[]},n.userData[os]}function bl(n){return"colorAttachments"in n}function xl(n){const e=n.props.framebuffer;return!e||e.handle===null}function rs(n,e){if(!n)return e;const t=Number.parseInt(n,10);return Number.isFinite(t)?t:e}function Je(n,e,t){if(n===e)return!0;if(!t||!n||!e)return!1;if(Array.isArray(n)){if(!Array.isArray(e)||n.length!==e.length)return!1;for(let i=0;i<n.length;i++)if(!Je(n[i],e[i],t-1))return!1;return!0}if(Array.isArray(e))return!1;if(typeof n=="object"&&typeof e=="object"){const i=Object.keys(n),s=Object.keys(e);if(i.length!==s.length)return!1;for(const o of i)if(!e.hasOwnProperty(o)||!Je(n[o],e[o],t-1))return!1;return!0}return!1}class wi{bufferLayouts;constructor(e){this.bufferLayouts=e}getBufferLayout(e){return this.bufferLayouts.find(t=>t.name===e)||null}getAttributeNamesForBuffer(e){return Hi(e)}mergeBufferLayouts(e,t){const i=[...e];for(const s of t){const o=i.findIndex(r=>r.name===s.name);o<0?i.push(s):i[o]=s}return i}}function Pl(n,e){const t=Ga(n),i=e.slice();return i.sort((s,o)=>{const r=Yn(Hi(s).map(c=>t[c])),a=Yn(Hi(o).map(c=>t[c]));return r-a}),i}function Jt(n,e){if(!n||!e.some(i=>i.bindingLayout?.length))return n;const t={...n,bindings:n.bindings.map(i=>({...i}))};"attributes"in(n||{})&&(t.attributes=n?.attributes||[]);for(const i of e)for(const s of i.bindingLayout||[])for(const o of Ll(s.name)){const r=t.bindings.find(a=>a.name===o);r?.group===0&&(r.group=s.group),r&&s.visibility!==void 0&&(r.visibility=s.visibility)}return t}function wl(n,e,t=[]){return n?e?{...n,attributes:n.attributes.length?Tl(n.attributes,e.attributes.filter(i=>t.includes(i.name))):e.attributes,bindings:Al(n.bindings,e.bindings)}:n:e}function xn(n){return!!(n.uniformTypes&&!Sl(n.uniformTypes))}function Cl(n){const e=[];for(const t of n){const i=Ta(t),s=new Set([t.vs,t.fs].flatMap(r=>r?Ea(r).filter(a=>a.isStd140).map(a=>a.blockName):[])),o=s.has(i)?i:s.size===1?s.values().next().value:void 0;xn(t)&&o&&e.push({name:o,uniformTypes:t.uniformTypes})}return e}function Jo(n,e){const t=[],i=new Set;for(const s of[...n||[],...e||[]])i.has(s.name)||(i.add(s.name),t.push(s));return t}function Ll(n){const e=new Set([n,`${n}Uniforms`]);return n.endsWith("Uniforms")||e.add(`${n}Sampler`),[...e]}function Sl(n){for(const e in n)return!1;return!0}function Al(n,e){const t=n.map(o=>({...o})),i=new Set(n.map(o=>o.name)),s=new Set(n.map(o=>`${o.group}:${o.location}`));for(const o of e){const r=`${o.group}:${o.location}`;!i.has(o.name)&&!s.has(r)&&t.push({...o})}return t}function Tl(n,e){const t=n.map(o=>({...o})),i=new Map(n.map(o=>[o.name,o])),s=new Map(n.map(o=>[o.location,o]));for(const o of e){const r=i.get(o.name);if(r){if(r.type!==o.type||r.location!==o.location)throw new Error(`Shader attribute "${o.name}" conflicts with its inferred type or location`);continue}const a=s.get(o.location);if(a)throw new Error(`Shader attributes "${a.name}" and "${o.name}" both use location ${o.location}`);t.push({...o})}return t}function El(n){return Fo(n)||typeof n=="number"||typeof n=="boolean"}function Il(n,e={}){const t={bindings:{},uniforms:{}};return Object.keys(n).forEach(i=>{const s=n[i];Object.prototype.hasOwnProperty.call(e,i)||El(s)?t.uniforms[i]=s:t.bindings[i]=s}),t}class Qo{options={disableWarnings:!1};modules;moduleUniforms;moduleBindings;directBindings={};constructor(e,t){Object.assign(this.options,t);const i=Hn(Object.values(e).filter(Ml));for(const s of i)e[s.name]=s;R.log(1,"Creating ShaderInputs with modules",Object.keys(e))(),this.modules=e,this.moduleUniforms={},this.moduleBindings={};for(const[s,o]of Object.entries(e))o&&(this._addModule(o),o.name&&s!==o.name&&!this.options.disableWarnings&&R.warn(`Module name: ${s} vs ${o.name}`)())}destroy(){}setProps(e){e.bindings&&Object.assign(this.directBindings,e.bindings);for(const t of Object.keys(e)){if(t==="bindings")continue;const i=t,s=e[i]||{},o=this.modules[i];if(!o)this.options.disableWarnings||R.warn(`Module ${t} not found`)();else{const r=this.moduleUniforms[i],a=this.moduleBindings[i],c=o.getUniforms?.(s,r)||s,{uniforms:l,bindings:u}=Il(c,o.uniformTypes);this.moduleUniforms[i]=as(r,l,o.uniformTypes),this.moduleBindings[i]={...a,...u}}}}getModules(){return Object.values(this.modules)}addModules(e){const t=Hn(e);for(const i of t){const s=i.name;this.modules[s]||(this.modules[s]=i,this._addModule(i))}}getUniformValues(){return this.moduleUniforms}getBindingValues(){const e={};for(const t of Object.values(this.moduleBindings))Object.assign(e,t);return Object.assign(e,this.directBindings),e}getModuleBindingValues(e){const t=this.moduleBindings[e];return t?{...t}:{}}getDebugTable(){const e={};for(const[t,i]of Object.entries(this.moduleUniforms))for(const[s,o]of Object.entries(i))e[`${t}.${s}`]={type:this.modules[t].uniformTypes?.[s],value:String(o)};return e}_addModule(e){const t=e.name;this.moduleUniforms[t]=as({},e.defaultUniforms||{},e.uniformTypes),this.moduleBindings[t]={}}}function as(n={},e={},t={}){const i={...n};for(const[s,o]of Object.entries(e))o!==void 0&&(i[s]=Xi(n[s],o,t[s]));return i}function Xi(n,e,t){if(!t||typeof t=="string")return Qe(e);if(Array.isArray(t)){if(Zi(e)||!Array.isArray(e))return Qe(e);const r=Array.isArray(n)&&!Zi(n)?[...n]:[],a=r.slice();for(let c=0;c<e.length;c++){const l=e[c];l!==void 0&&(a[c]=Xi(r[c],l,t[0]))}return a}if(!Ki(e))return Qe(e);const i=t,s=Ki(n)?n:{},o={...s};for(const[r,a]of Object.entries(e))a!==void 0&&(o[r]=Xi(s[r],a,i[r]));return o}function Qe(n){return ArrayBuffer.isView(n)?Array.prototype.slice.call(n):Array.isArray(n)?Zi(n)?n.slice():n.map(t=>t===void 0?void 0:Qe(t)):Ki(n)?Object.fromEntries(Object.entries(n).map(([e,t])=>[e,t===void 0?void 0:Qe(t)])):n}function Zi(n){return ArrayBuffer.isView(n)||Array.isArray(n)&&(n.length===0||typeof n[0]=="number")}function Ki(n){return!!n&&typeof n=="object"&&!Array.isArray(n)&&!ArrayBuffer.isView(n)}function Ml(n){return!!n?.dependencies}const Bl=j.DEBUG_DATA_MAX_LENGTH;class fe{device;id;ready;usage;props;isReady=!0;destroyed=!1;generation=0;updateTimestamp;debugData=new ArrayBuffer(0);_debugDataEnabled;_maxDebugDataByteLength;_ownsBuffer;_buffer;get buffer(){return this._buffer}get byteLength(){return this._buffer.byteLength}get[Symbol.toStringTag](){return"DynamicBuffer"}toString(){return`DynamicBuffer:"${this.id}":${this.byteLength}B`}toJSON(){return this.toString()}constructor(e,t){const{debugData:i=!1,buffer:s,ownsBuffer:o=!0,...r}=t;if(s&&s.device!==e)throw new Error("DynamicBuffer adopted buffers must belong to the supplied device");if(s&&(r.byteLength!==void 0||r.data!==void 0))throw new Error("DynamicBuffer cannot combine an adopted buffer with byteLength or data");const a=t.id||s?.id||ft("dynamic-buffer"),c={...r,id:a,usage:r.usage??s?.usage,indexType:r.indexType??s?.indexType};(c.usage||0)&j.INDEX&&!c.indexType&&(r.data instanceof Uint32Array?c.indexType="uint32":r.data instanceof Uint16Array?c.indexType="uint16":r.data instanceof Uint8Array&&(c.indexType="uint8")),delete c.data,delete c.byteOffset,this.device=e,this.id=a,this.props=c,this.usage=c.usage||0,this._debugDataEnabled=!!i,this._maxDebugDataByteLength=typeof i=="object"&&i.maxByteLength!==void 0?i.maxByteLength:Bl,this._ownsBuffer=o,this._buffer=s??this.device.createBuffer({...r,id:a}),this.ready=Promise.resolve(this._buffer),this.updateTimestamp=this._buffer.updateTimestamp,this._resetDebugData(this._buffer.byteLength),r.data&&this._writeDebugData(r.data,r.byteOffset||0)}write(e,t=0){this._buffer.write(e,t),this._touch(),this._writeDebugData(e,t)}async mapAndWriteAsync(e,t=0,i=this.byteLength-t){let s=null;await this._buffer.mapAndWriteAsync(async(o,r)=>{await e(o,r),s=new Uint8Array(o.slice(0,i))},t,i),this._touch(),s&&this._writeDebugData(s,t)}async readAsync(e=0,t=this.byteLength-e){const i=await this._buffer.readAsync(e,t);return this._writeDebugData(i,e)&&this._touch(),i}async mapAndReadAsync(e,t=0,i=this.byteLength-t){let s=null;const o=await this._buffer.mapAndReadAsync(async(r,a)=>(s=new Uint8Array(r.slice(0)),await e(r,a)),t,i);return s&&this._writeDebugData(s,t)&&this._touch(),o}resize(e){const{byteLength:t,preserveData:i=!1}=e;if(t===this.byteLength)return!1;const s=Math.min(e.copyByteLength??Math.min(this.byteLength,t),this.byteLength,t),o=this._buffer,r=this.debugData.slice(0),{data:a,byteOffset:c,...l}=this.props,u=this.device.createBuffer({...l,byteLength:t});return i&&s>0&&this._copyBufferContents(o,u,s),this._buffer=u,this._resetDebugData(t),i&&r.byteLength>0&&this._writeDebugData(r,0),this._ownsBuffer&&o.destroy(),this._ownsBuffer=!0,this.generation++,this._touch(),!0}ensureSize(e,t){return e<=this.byteLength?!1:this.resize({byteLength:e,preserveData:t?.preserveData})}getBinding(e){return e?.offset===void 0&&e?.size===void 0?this._buffer:{buffer:this._buffer,offset:e?.offset,size:e?.size}}destroy(){this.destroyed||(this._ownsBuffer&&this._buffer.destroy(),this.destroyed=!0,this.debugData=new ArrayBuffer(0))}_copyBufferContents(e,t,i){const s=this.device.type==="webgpu"?Math.ceil(i/4)*4:i,o=this.device.createCommandEncoder();o.copyBufferToBuffer({sourceBuffer:e,destinationBuffer:t,size:s}),this.device.submit(o.finish())}_touch(){this.updateTimestamp=this.device.incrementTimestamp()}_resetDebugData(e){if(!this._debugDataEnabled){this.debugData=new ArrayBuffer(0);return}this.debugData=new ArrayBuffer(Math.min(e,this._maxDebugDataByteLength))}_writeDebugData(e,t){if(!this._debugDataEnabled||this.debugData.byteLength===0||t>=this.debugData.byteLength)return!1;const i=ArrayBuffer.isView(e)?new Uint8Array(e.buffer,e.byteOffset,e.byteLength):new Uint8Array(e),s=new Uint8Array(this.debugData),o=Math.min(i.byteLength,s.byteLength-t);return s.set(i.subarray(0,o),t),o>0}}function er(n){return n!==null&&typeof n=="object"&&"buffer"in n}function Ol(n){return n instanceof fe?n.buffer:n}function Rl(n){return{buffer:Ol(n.buffer),offset:n.offset,size:n.size}}function Ft(n){return n!==null&&typeof n=="object"&&"resolveTextureBinding"in n&&typeof n.resolveTextureBinding=="function"}function zl(n){return n?.type==="texture"||n?.type==="external-texture"}function Nl(n,e,t){const i=$a(n,e,{ignoreWarnings:!0});return zl(i)?i:n.bindings.length===0&&t?.fallbackGroup!==void 0?{type:"texture",name:e,group:t.fallbackGroup,location:0}:null}const le=2,Fl=1e4,Ci="render pipeline initialization failed",Dl=["stencil8","depth16unorm","depth24plus","depth24plus-stencil8","depth32float","depth32float-stencil8"];class re{static defaultProps={...Ze.defaultProps,source:void 0,vs:null,fs:null,id:"unnamed",handle:void 0,userData:{},defines:{},modules:[],plugins:[],geometry:null,indexBuffer:null,indexCount:void 0,firstVertex:0,firstIndex:0,attributes:{},constantAttributes:{},bindings:{},uniforms:{},varyings:[],isInstanced:void 0,instanceCount:0,vertexCount:0,shaderInputs:void 0,material:void 0,pipelineFactory:void 0,shaderFactory:void 0,transformFeedback:void 0,shaderAssembler:Gi.getDefaultShaderAssembler("glsl"),debugShaders:void 0,disableWarnings:void 0};device;id;source;vs;fs;pipelineFactory;shaderFactory;userData={};parameters;topology;bufferLayout;isInstanced=void 0;instanceCount=0;vertexCount;indexCount;firstVertex;firstIndex;indexBuffer=null;bufferAttributes={};constantAttributes={};bindings={};vertexArray;transformFeedback=null;pipeline;shaderInputs;material=null;_uniformStore;_attributeInfos={};_gpuGeometry=null;props;_dynamicIndexBufferSource=null;_dynamicAttributeBufferSources={};_colorAttachmentFormats;_depthStencilAttachmentFormat;_pipelineNeedsUpdate="newly created";_needsRedraw="initializing";_drawBlockedReason=!1;_destroyed=!1;_vertexCountSet=!1;_lastDrawTimestamp=-1;_bindingTable=[];get[Symbol.toStringTag](){return"Model"}toString(){return`Model(${this.id})`}constructor(e,t){const i=re.defaultProps.shaderAssembler,s=t.vertexCount!==void 0;this.props={...re.defaultProps,...t,shaderAssembler:t.shaderAssembler??(Li(i,e.info.shadingLanguage)?i:Gi.getDefaultShaderAssembler(e.info.shadingLanguage))},this._vertexCountSet=s,t=this.props,this.id=t.id||ft("model"),this.device=e,Object.assign(this.userData,t.userData),this.material=t.material||null;const o=Gl(e),r=ko(this.props.plugins,o.shaderLanguage),a=Uo(this.props.modules,r.modules),c=Object.fromEntries(a.map(h=>[h.name,h])),l=t.shaderInputs||new Qo(c,{disableWarnings:this.props.disableWarnings});t.shaderInputs&&r.modules.length>0&&l.addModules(r.modules),this.setShaderInputs(l);const u=Jo(this.props.modules,l.getModules()),f={...r.defines,...this.props.defines};if(this.device.type==="webgl"&&(this.props._uniformBlockLayouts=Cl(u)),this.props.shaderLayout=Jt(this.props.shaderLayout,u)||null,this.device.type==="webgpu"&&this.props.source){const h=this.props.shaderAssembler;qi(Li(h,"wgsl"));const{source:p,getUniforms:g,bindingTable:y,shaderLayout:b}=h.assembleWGSLShader({platformInfo:o,...this.props,modules:u,defines:f,pluginInjections:r.injections,pluginVertexInputs:r.vertexInputs,pluginVaryings:r.varyings});this.source=p,this._getModuleUniforms=g,this._bindingTable=y;const P=b??e.getShaderLayout?.(this.source),x=kl(P,r.vertexInputs),w=wl(this.props.shaderLayout,x,Object.keys(r.vertexInputs));this.props.shaderLayout=Jt(w||null,u)||null}else{const h=this.props.shaderAssembler;qi(Li(h,"glsl"));const{vs:p,fs:g,getUniforms:y}=h.assembleGLSLShaderPair({platformInfo:o,...this.props,modules:u,defines:f,pluginInjections:r.injections,pluginVertexInputs:r.vertexInputs,pluginVaryings:r.varyings});this.vs=p,this.fs=g,this._getModuleUniforms=y,this._bindingTable=[]}this.vertexCount=this.props.vertexCount,this.indexCount=this.props.indexCount,this.firstVertex=this.props.firstVertex,this.firstIndex=this.props.firstIndex,this.instanceCount=this.props.instanceCount,this.topology=this.props.topology,this.bufferLayout=this.props.bufferLayout,this.parameters=this.props.parameters,this._colorAttachmentFormats=this.props.colorAttachmentFormats,this._depthStencilAttachmentFormat=this.props.depthStencilAttachmentFormat,t.geometry&&this.setGeometry(t.geometry),this.pipelineFactory=t.pipelineFactory||ai.getDefaultPipelineFactory(this.device),this.shaderFactory=t.shaderFactory||ci.getDefaultShaderFactory(this.device),this.pipeline=this._updatePipeline(),this.vertexArray=e.createVertexArray({shaderLayout:this.pipeline.shaderLayout,bufferLayout:this.pipeline.bufferLayout}),this._gpuGeometry&&this._setGeometryAttributes(this._gpuGeometry),"isInstanced"in t&&(this.isInstanced=t.isInstanced),t.instanceCount&&this.setInstanceCount(t.instanceCount),t.vertexCount&&this.setVertexCount(t.vertexCount),t.indexBuffer&&this.setIndexBuffer(t.indexBuffer),t.attributes&&this.setAttributes(t.attributes),t.constantAttributes&&this.setConstantAttributes(t.constantAttributes),t.bindings&&this.setBindings(t.bindings),t.transformFeedback&&(this.transformFeedback=t.transformFeedback)}destroy(){this._destroyed||(this.pipelineFactory.release(this.pipeline),this.shaderFactory.release(this.pipeline.vs),this.pipeline.fs&&this.pipeline.fs!==this.pipeline.vs&&this.shaderFactory.release(this.pipeline.fs),this._uniformStore.destroy(),this._gpuGeometry?.destroy(),this._destroyed=!0)}needsRedraw(){this._getBindingsUpdateTimestamp()>this._lastDrawTimestamp&&this.setNeedsRedraw("contents of bound textures or buffers updated");const e=this._needsRedraw;return this._needsRedraw=!1,e}setNeedsRedraw(e){this._needsRedraw||=e}getBindingDebugTable(){return this._bindingTable}predraw(e){this._syncDynamicBuffers(),this.updateShaderInputs(e),this.material?.updateShaderInputs(e),this.pipeline=this._updatePipeline()}draw(e){if(this._drawBlockedReason&&!this._pipelineNeedsUpdate)return R.info(le,`>>> DRAWING ABORTED ${this.id}: ${this._drawBlockedReason}`)(),!1;const t=this._areBindingsLoading();if(t)return R.info(le,`>>> DRAWING ABORTED ${this.id}: ${t} not loaded`)(),!1;this._syncAttachmentFormats(e);try{e.pushDebugGroup(`${this}.predraw(${e})`),this.device.type==="webgpu"?(this.updateShaderInputs(),this.material?.updateShaderInputs(),this._syncDynamicBuffers(),this.pipeline=this._updatePipeline()):this.predraw(this.device.commandEncoder)}finally{e.popDebugGroup()}let i,s=this.pipeline.isErrored;try{if(e.pushDebugGroup(`${this}.draw(${e})`),this._logDrawCallStart(),this.pipeline=this._updatePipeline(),s=this.pipeline.isErrored,s)R.info(le,`>>> DRAWING ABORTED ${this.id}: ${Ci}`)(),i=!1;else{const o=this.vertexArray.getDrawValidationError();if(o)R.info(le,`>>> DRAWING ABORTED ${this.id}: ${o}`)(),this._drawBlockedReason=o,i=!1;else{const r=this._getCurrentShaderLayout(),a=this._getBindings(r),c=this._getBindGroups(r,a),{indexBuffer:l}=this.vertexArray,u=l?this.indexCount??(this._vertexCountSet?this.vertexCount:l.byteLength/(l.indexType==="uint32"?4:2)):void 0;e.setPipeline(this.pipeline),e.setBindings(c,{_bindGroupCacheKeys:this._getBindGroupCacheKeys()}),e.setVertexArray(this.vertexArray),i=this.isInstanced===!0&&this.instanceCount===0?!0:e.draw({isInstanced:this.isInstanced,vertexCount:this.vertexCount,instanceCount:this.isInstanced?this.instanceCount:void 0,indexCount:u,firstVertex:this.firstVertex,firstIndex:this.firstIndex,transformFeedback:this.transformFeedback||void 0,uniforms:this.props.uniforms,parameters:this.parameters,topology:this.topology})}}}finally{e.popDebugGroup(),this._logDrawCallEnd()}return this._logFramebuffer(e),i?(this._lastDrawTimestamp=this.device.timestamp,this._needsRedraw=!1):s?(this._needsRedraw=Ci,this._drawBlockedReason=Ci):this._drawBlockedReason?this._needsRedraw=this._drawBlockedReason:this._needsRedraw="waiting for resource initialization",i}setGeometry(e){this._gpuGeometry?.destroy();const t=e&&dl(this.device,e);if(t){this.setTopology(t.topology||"triangle-list");const i=new wi(this.bufferLayout);this.bufferLayout=i.mergeBufferLayouts(t.bufferLayout,this.bufferLayout),this.vertexArray&&this._setGeometryAttributes(t)}this._gpuGeometry=t}setTopology(e){e!==this.topology&&(this.topology=e,this._setPipelineNeedsUpdate("topology"))}setBufferLayout(e){const t=new wi(this.bufferLayout),i=this._gpuGeometry?t.mergeBufferLayouts(e,this._gpuGeometry.bufferLayout):e;Je(i,this.bufferLayout,-1)||(this.bufferLayout=i,this._setPipelineNeedsUpdate("bufferLayout"),this.pipeline=this._updatePipeline(),this.vertexArray=this.device.createVertexArray({shaderLayout:this.pipeline.shaderLayout,bufferLayout:this.pipeline.bufferLayout}),this._gpuGeometry&&this._setGeometryAttributes(this._gpuGeometry))}setParameters(e){Je(e,this.parameters,2)||(this.parameters=e,this._setPipelineNeedsUpdate("parameters"))}setInstanceCount(e){this.instanceCount=e,this.isInstanced===void 0&&e>0&&(this.isInstanced=!0),this.setNeedsRedraw("instanceCount")}setVertexCount(e){this.vertexCount=e,this._vertexCountSet=!0,this.setNeedsRedraw("vertexCount")}setIndexCount(e){this.indexCount=e,this.setNeedsRedraw("indexCount")}setDrawOffsets({firstVertex:e,firstIndex:t}){this.firstVertex=e,this.firstIndex=t,this.setNeedsRedraw("drawOffsets")}setShaderInputs(e){this.shaderInputs=e,this._uniformStore=new Do(this.device,this.shaderInputs.modules);for(const[t,i]of Object.entries(this.shaderInputs.modules))if(xn(i)&&!this.material?.ownsModule(t)){const s=this._uniformStore.getManagedUniformBuffer(t);this.bindings[`${t}Uniforms`]=s}this.setNeedsRedraw("shaderInputs")}setMaterial(e){this.material=e,this.setNeedsRedraw("material")}updateShaderInputs(e){this._uniformStore.setUniforms(this.shaderInputs.getUniformValues(),e),this.setBindings(this._getNonMaterialBindings(this.shaderInputs.getBindingValues())),this.setNeedsRedraw("shaderInputs")}setBindings(e){Object.assign(this.bindings,e),this.setNeedsRedraw("bindings")}setTransformFeedback(e){this.transformFeedback=e,this.setNeedsRedraw("transformFeedback")}setIndexBuffer(e){const t=e instanceof fe?e.buffer:e;this.indexBuffer=t,this._dynamicIndexBufferSource=e instanceof fe?{source:e,generation:e.generation}:null,this.vertexArray.setIndexBuffer(t),this.setNeedsRedraw("indexBuffer")}setAttributes(e,t){this._drawBlockedReason=!1;const i=t?.disableWarnings??this.props.disableWarnings;e.indices&&R.warn(`Model:${this.id} setAttributes() - indexBuffer should be set using setIndexBuffer()`)(),this.bufferLayout=Pl(this.pipeline.shaderLayout,this.bufferLayout);const s=new wi(this.bufferLayout);for(const[o,r]of Object.entries(e)){const a=r instanceof fe?r.buffer:r,c=s.getBufferLayout(o);if(!c){i||R.warn(`Model(${this.id}): Missing layout for buffer "${o}".`)();continue}const l=s.getAttributeNamesForBuffer(c);let u=!1;for(const f of l){const d=this._attributeInfos[f];if(d){const h=this.device.type==="webgpu"?this.vertexArray.getBufferSlot(d.bufferName):d.location;if(h===null){i||R.warn(`Model(${this.id}): Missing vertex array slot for buffer "${d.bufferName}".`)();continue}this.vertexArray.setBuffer(h,a),r instanceof fe?this._dynamicAttributeBufferSources[h]={source:r,generation:r.generation}:delete this._dynamicAttributeBufferSources[h],u=!0}}!u&&!i&&R.warn(`Model(${this.id}): Ignoring buffer "${a.id}" for unknown attribute "${o}"`)()}this.setNeedsRedraw("attributes")}setConstantAttributes(e,t){for(const[i,s]of Object.entries(e)){const o=this._attributeInfos[i];o?this.vertexArray.setConstantWebGL(o.location,s):(t?.disableWarnings??this.props.disableWarnings)||R.warn(`Model "${this.id}: Ignoring constant supplied for unknown attribute "${i}"`)()}this.setNeedsRedraw("constants")}_areBindingsLoading(){for(const e of Object.values(this.bindings))if(Ft(e)&&!e.isReady)return e.id;for(const e of Object.values(this.material?.bindings||{}))if(Ft(e)&&!e.isReady)return e.id;return!1}_getBindings(e=this._getCurrentShaderLayout()){const t={};for(const[i,s]of Object.entries(this.bindings)){const o=Ul(i,s,e);o&&(t[i]=o)}return t}_getBindGroups(e=this._getCurrentShaderLayout(),t=this._getBindings(e)){const i=e.bindings.length?Wa(e,t):{0:t};if(!this.material)return i;for(const[s,o]of Object.entries(this.material.getBindingsByGroup(e))){const r=Number(s);i[r]={...i[r]||{},...o}}return i}_getBindGroupCacheKeys(){const e=this.material?.getBindGroupCacheKey(3);return e?{3:e}:{}}_getBindingsUpdateTimestamp(){let e=0;this._dynamicIndexBufferSource&&(e=Math.max(e,this._dynamicIndexBufferSource.source.updateTimestamp));for(const t of Object.values(this._dynamicAttributeBufferSources))e=Math.max(e,t.source.updateTimestamp);for(const t of Object.values(this.bindings))t instanceof Ha?e=Math.max(e,t.texture.updateTimestamp):t instanceof j||t instanceof oi||t instanceof vn||t instanceof fe?e=Math.max(e,t.updateTimestamp):Ft(t)?e=t.isReady?Math.max(e,t.updateTimestamp):1/0:er(t)&&(e=Math.max(e,(t.buffer instanceof fe,t.buffer.updateTimestamp)));return Math.max(e,this.material?.getBindingsUpdateTimestamp()||0)}_setGeometryAttributes(e){const t={...e.attributes};for(const[i]of Object.entries(t))!this.pipeline.shaderLayout.attributes.find(s=>s.name===i)&&i!=="positions"&&delete t[i];this.vertexCount=e.vertexCount,this._vertexCountSet=!0,this.setIndexBuffer(e.indices||null),this.setAttributes(e.attributes,{disableWarnings:!0}),this.setAttributes(t,{disableWarnings:this.props.disableWarnings}),this.setNeedsRedraw("geometry attributes")}_setPipelineNeedsUpdate(e){this._pipelineNeedsUpdate||=e,this._drawBlockedReason=!1,this.setNeedsRedraw(e)}_updatePipeline(){if(this._pipelineNeedsUpdate){let e=null,t=null;this.pipeline&&(R.log(1,`Model ${this.id}: Recreating pipeline because "${this._pipelineNeedsUpdate}".`)(),e=this.pipeline.vs,t=this.pipeline.fs),this._pipelineNeedsUpdate=!1;const i=this.shaderFactory.createShader({id:`${this.id}-vertex`,stage:"vertex",source:this.source||this.vs,debugShaders:this.props.debugShaders});let s=null;this.source?s=i:this.fs&&(s=this.shaderFactory.createShader({id:`${this.id}-fragment`,stage:"fragment",source:this.source||this.fs,debugShaders:this.props.debugShaders})),this.pipeline=this.pipelineFactory.createRenderPipeline({...this.props,bindings:void 0,bufferLayout:this.bufferLayout,colorAttachmentFormats:this._colorAttachmentFormats,depthStencilAttachmentFormat:this._depthStencilAttachmentFormat,topology:this.topology,parameters:this.parameters,bindGroups:void 0,vs:i,fs:s}),this._attributeInfos=qa(this.pipeline.shaderLayout,this.bufferLayout),e&&this.shaderFactory.release(e),t&&t!==e&&this.shaderFactory.release(t)}return this.pipeline}_lastLogTime=0;_logOpen=!1;_logDrawCallStart(){const e=R.level>3?0:Fl;R.level<2||Date.now()-this._lastLogTime<e||(this._lastLogTime=Date.now(),this._logOpen=!0,R.group(le,`>>> DRAWING MODEL ${this.id}`,{collapsed:R.level<=2})())}_logDrawCallEnd(){if(this._logOpen){const e=gl(this.pipeline.shaderLayout,this.id);R.table(le,e)();const t=this.shaderInputs.getDebugTable();R.table(le,t)();const i=this._getAttributeDebugTable();R.table(le,this._attributeInfos)(),R.table(le,i)(),R.groupEnd(le)(),this._logOpen=!1}}_drawCount=0;_logFramebuffer(e){const t=this.device.props.debugFramebuffers;if(this._drawCount++,!t)return;const i=e.props.framebuffer;ml(e,i,{id:i?.id||`${this.id}-framebuffer`,minimap:!0})}_getAttributeDebugTable(){const e={};for(const[t,i]of Object.entries(this._attributeInfos)){const s=this.vertexArray.attributes[i.location];e[i.location]={name:t,type:i.shaderType,values:s?this._getBufferOrConstantValues(s,i.bufferDataType):"null"}}if(this.vertexArray.indexBuffer){const{indexBuffer:t}=this.vertexArray,i=t.indexType==="uint32"?new Uint32Array(t.debugData):new Uint16Array(t.debugData);e.indices={name:"indices",type:t.indexType,values:i.toString()}}return e}_getBufferOrConstantValues(e,t){const i=Ht.getTypedArrayConstructor(t);return(e instanceof j?new i(e.debugData):e).toString()}_getNonMaterialBindings(e){if(!this.material)return e;const t={};for(const[i,s]of Object.entries(e))this.material.ownsBinding(i)||(t[i]=s);return t}_getCurrentShaderLayout(){return this.pipeline?.shaderLayout||this.props.shaderLayout||{bindings:[]}}_syncDynamicBuffers(){if(this._dynamicIndexBufferSource&&this._dynamicIndexBufferSource.generation!==this._dynamicIndexBufferSource.source.generation){const e=this._dynamicIndexBufferSource.source.buffer;this.indexBuffer=e,this.vertexArray.setIndexBuffer(e),this._dynamicIndexBufferSource.generation=this._dynamicIndexBufferSource.source.generation,this.setNeedsRedraw("dynamic index buffer")}for(const[e,t]of Object.entries(this._dynamicAttributeBufferSources))t.generation!==t.source.generation&&(this.vertexArray.setBuffer(Number(e),t.source.buffer),t.generation=t.source.generation,this.setNeedsRedraw("dynamic attribute buffer"))}_syncAttachmentFormats(e){if(this.device.type!=="webgpu")return;const t=e.framebuffer||e.props.framebuffer,i=e.props,s=i.colorAttachmentFormats??t?.colorAttachments?.map(r=>Vl(r?.texture?.format)),o=i.depthStencilAttachmentFormat===!1?void 0:i.depthStencilAttachmentFormat??jl(t?.depthStencilAttachment?.texture?.format);(!Je(this._colorAttachmentFormats,s,1)||this._depthStencilAttachmentFormat!==o)&&(this._colorAttachmentFormats=s,this._depthStencilAttachmentFormat=o,this._setPipelineNeedsUpdate("attachment formats"))}}function Li(n,e){return n.shaderLanguage!==void 0&&n.shaderLanguage!==e?!1:e==="glsl"?"assembleGLSLShaderPair"in n&&typeof n.assembleGLSLShaderPair=="function":"assembleWGSLShader"in n&&typeof n.assembleWGSLShader=="function"}function kl(n,e){return!n||Object.keys(e).length===0?n:{...n,attributes:n.attributes.map(t=>{const i=t.name.startsWith("_luma_")?t.name.slice(6):null;return i&&e[i]?{...t,name:i}:t})}}function Ul(n,e,t){if(Ft(e)){const i=Nl(t,n,{fallbackGroup:0});return i?e.resolveTextureBinding(i):null}return e instanceof fe?e.buffer:er(e)?Rl(e):e}function Vl(n){return n&&!tr(n)?n:null}function jl(n){return n&&tr(n)?n:void 0}function tr(n){return Dl.includes(n)}function Gl(n){return{type:n.type,shaderLanguage:n.info.shadingLanguage,shaderLanguageVersion:n.info.shadingLanguageVersion,gpu:n.info.gpu,limits:n.limits,features:n.features}}const $l=35980,Wl=35981;class Ne{device;model;transformFeedback;static defaultProps={...re.defaultProps,feedbackBufferMode:"separate",outputs:void 0,feedbackBuffers:void 0};static isSupported(e){return e?.info?.type==="webgl"}constructor(e,t=Ne.defaultProps){if(!Ne.isSupported(e))throw new Error("BufferTransform not yet implemented on WebGPU");this.device=e,this.model=new re(this.device,{id:t.id||"buffer-transform-model",fs:t.fs||vc(),topology:t.topology||"point-list",varyings:t.outputs||t.varyings,...t,bufferMode:t.bufferMode||(t.feedbackBufferMode==="interleaved"?$l:Wl)}),this.transformFeedback=this.device.createTransformFeedback({layout:this.model.pipeline.shaderLayout,buffers:t.feedbackBuffers}),this.model.setTransformFeedback(this.transformFeedback)}destroy(){this.model&&this.model.destroy()}delete(){this.destroy()}run(e){e?.inputBuffers&&this.model.setAttributes(e.inputBuffers),e?.outputBuffers&&this.transformFeedback.setBuffers(e.outputBuffers);const t=this.device.beginRenderPass({discard:!0,...e});this.model.draw(t),t.end()}getBuffer(e){return this.transformFeedback.getBuffer(e)}readAsync(e){const t=this.getBuffer(e);if(!t)throw new Error("BufferTransform#getBuffer");if(t instanceof j)return t.readAsync();const{buffer:i,byteOffset:s=0,byteLength:o=i.byteLength}=t;return i.readAsync(s,o)}}const Si=2,Hl=1e4;class Pn{static defaultProps={...rt.defaultProps,id:"unnamed",handle:void 0,userData:{},source:"",modules:[],defines:{},plugins:[],bindings:void 0,shaderInputs:void 0,pipelineFactory:void 0,shaderFactory:void 0,shaderAssembler:Gi.getDefaultShaderAssembler("wgsl"),debugShaders:void 0};device;id;pipelineFactory;shaderFactory;userData={};bindings={};pipeline;source;shader;shaderInputs;_uniformStore;_pipelineNeedsUpdate="newly created";_getModuleUniforms;props;_destroyed=!1;constructor(e,t){if(e.type!=="webgpu")throw new Error("Computation is only supported in WebGPU");this.props={...Pn.defaultProps,...t},t=this.props,this.id=t.id||ft("model"),this.device=e,Object.assign(this.userData,t.userData);const i=ql(e),s=ko(this.props.plugins,i.shaderLanguage);if(Object.keys(s.vertexInputs).length>0||Object.keys(s.varyings).length>0)throw new Error("Computation does not support ShaderPlugin vertex inputs or varyings");const o=Uo(this.props.modules,s.modules),r=Object.fromEntries(o.map(p=>[p.name,p]));this.shaderInputs=t.shaderInputs||new Qo(r),t.shaderInputs&&s.modules.length>0&&this.shaderInputs.addModules(s.modules),this.setShaderInputs(this.shaderInputs);const a=Jo(this.props.modules,this.shaderInputs?.getModules()),c={...s.defines,...this.props.defines};this.props.shaderLayout=Jt(this.props.shaderLayout,a)||null,this.pipelineFactory=t.pipelineFactory||ai.getDefaultPipelineFactory(this.device),this.shaderFactory=t.shaderFactory||ci.getDefaultShaderFactory(this.device);const l=this.props.shaderAssembler;qi(l instanceof Oo);const{source:u,getUniforms:f,shaderLayout:d}=l.assembleWGSLShader({platformInfo:i,...this.props,modules:a,defines:c,scanVertexAttributes:!1,pluginInjections:s.injections});this.source=u,this._getModuleUniforms=f;const h=d??e.getShaderLayout?.(this.source,{scanVertexAttributes:!1});this.props.shaderLayout=Jt(this.props.shaderLayout||h||null,a)||null,this.pipeline=this._updatePipeline(),t.bindings&&this.setBindings(t.bindings)}destroy(){this._destroyed||(this.pipelineFactory.release(this.pipeline),this.shaderFactory.release(this.shader),this._uniformStore.destroy(),this._destroyed=!0)}predraw(e){this.updateShaderInputs(e)}dispatch(e,t,i,s){try{this._logDrawCallStart(),this._setPipeline(e),e.dispatch(t,i,s)}finally{this._logDrawCallEnd()}}dispatchIndirect(e,t,i=0){try{this._logDrawCallStart(),this._setPipeline(e),e.dispatchIndirect(t,i)}finally{this._logDrawCallEnd()}}_setPipeline(e){this.pipeline=this._updatePipeline(),this.pipeline.setBindings(this.bindings),e.setPipeline(this.pipeline),e.setBindings({})}setVertexCount(e){}setInstanceCount(e){}setShaderInputs(e){this.shaderInputs=e,this._uniformStore=new Do(this.device,this.shaderInputs.modules);for(const[t,i]of Object.entries(this.shaderInputs.modules))if(xn(i)){const s=this._uniformStore.getManagedUniformBuffer(t);this.bindings[`${t}Uniforms`]=s}}setShaderModuleProps(e){const t=this._getModuleUniforms(e),i=Object.keys(t).filter(s=>{const o=t[s];return!Fo(o)&&typeof o!="number"&&typeof o!="boolean"});for(const s of i)t[s],delete t[s]}updateShaderInputs(e){this._uniformStore.setUniforms(this.shaderInputs.getUniformValues(),e)}setBindings(e){Object.assign(this.bindings,e)}_setPipelineNeedsUpdate(e){this._pipelineNeedsUpdate=this._pipelineNeedsUpdate||e}_updatePipeline(){if(this._pipelineNeedsUpdate){let e=null;this.pipeline&&(R.log(1,`Model ${this.id}: Recreating pipeline because "${this._pipelineNeedsUpdate}".`)(),e=this.shader),this._pipelineNeedsUpdate=!1,this.shader=this.shaderFactory.createShader({id:`${this.id}-fragment`,stage:"compute",source:this.source,debugShaders:this.props.debugShaders}),this.pipeline=this.pipelineFactory.createComputePipeline({...this.props,shader:this.shader}),e&&this.shaderFactory.release(e)}return this.pipeline}_lastLogTime=0;_logOpen=!1;_logDrawCallStart(){const e=R.level>3?0:Hl;R.level<2||Date.now()-this._lastLogTime<e||(this._lastLogTime=Date.now(),this._logOpen=!0,R.group(Si,`>>> DRAWING MODEL ${this.id}`,{collapsed:R.level<=2})())}_logDrawCallEnd(){if(this._logOpen){const e=this.shaderInputs.getDebugTable();R.table(Si,e)(),R.groupEnd(Si)(),this._logOpen=!1}}_drawCount=0;_getBufferOrConstantValues(e,t){const i=Ht.getTypedArrayConstructor(t);return(e instanceof j?new i(e.debugData):e).toString()}}function ql(n){return{type:n.type,shaderLanguage:n.info.shadingLanguage,shaderLanguageVersion:n.info.shadingLanguageVersion,gpu:n.info.gpu,limits:n.limits,features:n.features}}function Yl(n){switch(n){case"float64":return Float64Array;case"uint8":case"unorm8":return Uint8ClampedArray;default:return Ia(n)}}const Xl=Ht.getDataType.bind(Ht);function _t(n,e,t){if(e.size>4)return null;const i=t==="webgpu"&&e.type==="uint8"?"unorm8":e.type,s=e.size,o=!!(t!=="webgpu"&&s===3&&i&&["uint8","sint8","unorm8","snorm8","uint16","sint16","unorm16","snorm16"].includes(i));return{attribute:n,format:s>1?`${i}x${s}${o?"-webgl":""}`:e.type,byteOffset:e.offset||0}}function de(n){return n.stride||n.size*n.bytesPerElement}function Zl(n,e){return n.type===e.type&&n.size===e.size&&de(n)===de(e)&&(n.offset||0)===(e.offset||0)}function Ji(n,e){e.offset&&Y.removed("shaderAttribute.offset","vertexOffset, elementOffset")();const t=de(n),i=e.vertexOffset!==void 0?e.vertexOffset:n.vertexOffset||0,s=e.elementOffset||0,o=i*t+s*n.bytesPerElement+(n.offset||0);return{...e,offset:o,stride:t}}function Kl(n,e){const t=Ji(n,e);return{high:t,low:{...t,offset:t.offset+n.size*4}}}class Jl{constructor(e,t,i){this._buffer=null,this.device=e,this.id=t.id||"",this.size=t.size||1;const s=t.logicalType||t.type,o=s==="float64";let{defaultValue:r}=t;r=Number.isFinite(r)?[r]:r||new Array(this.size).fill(0);let a;o?a="float32":!s&&t.isIndexed?a="uint32":a=s||"float32";let c=Yl(s||a);this.doublePrecision=o,o&&t.fp64===!1&&(c=Float32Array),this.value=null,this.settings={...t,defaultType:c,defaultValue:r,logicalType:s,type:a,normalized:a.includes("norm"),size:this.size,bytesPerElement:c.BYTES_PER_ELEMENT},this.state={...i,externalBuffer:null,bufferAccessor:this.settings,allocatedValue:null,numInstances:0,bounds:null,constant:!1}}get isConstant(){return this.state.constant}get buffer(){return this._buffer}get byteOffset(){const e=this.getAccessor();return e.vertexOffset?e.vertexOffset*de(e):0}get numInstances(){return this.state.numInstances}set numInstances(e){this.state.numInstances=e}get isDoublePrecisionBuffer(){return this._shouldSplitDoublePrecisionValue(this.value)}delete(){this._buffer&&(this._buffer.delete(),this._buffer=null),qt.release(this.state.allocatedValue),this.state.allocatedValue=null}getBuffer(){return this.state.constant&&this.device.type!=="webgpu"?null:this.state.externalBuffer||this._buffer}getValue(e=this.id,t=null){const i={};if(this.state.constant){const s=this.value;if(this.device.type==="webgpu"&&this._buffer)i[e]=this._buffer;else if(t){const o=Ji(this.getAccessor(),t),r=o.offset/s.BYTES_PER_ELEMENT,a=o.size||this.size;i[e]=s.subarray(r,r+a)}else i[e]=s}else i[e]=this.getBuffer();return this.doublePrecision&&(this.isDoublePrecisionBuffer?i[`${e}64Low`]=i[e]:i[`${e}64Low`]=new Float32Array(this.size)),i}_getBufferLayout(e=this.id,t=null){const i=this.getAccessor(),s=[],o={name:this.id,byteStride:this.device.type==="webgpu"&&this.state.constant?0:de(i)};if(this.doublePrecision){const r=Kl(i,t||{});s.push(_t(e,{...i,...r.high},this.device.type),_t(`${e}64Low`,{...i,...r.low},this.device.type))}else if(t){const r=Ji(i,t);s.push(_t(e,{...i,...r},this.device.type))}else s.push(_t(e,i,this.device.type));return o.attributes=s.filter(Boolean),o}setAccessor(e){this.state.bufferAccessor=e}getAccessor(){return this.state.bufferAccessor}getBounds(){if(this.state.bounds)return this.state.bounds;let e=null;if(this.state.constant&&this.value){const t=Array.from(this.value);e=[t,t]}else{const{value:t,numInstances:i,size:s}=this,o=i*s;if(t&&o&&t.length>=o){const r=new Array(s).fill(1/0),a=new Array(s).fill(-1/0);for(let c=0;c<o;)for(let l=0;l<s;l++){const u=t[c++];u<r[l]&&(r[l]=u),u>a[l]&&(a[l]=u)}e=[r,a]}}return this.state.bounds=e,e}setData(e){const{state:t}=this;let i;ArrayBuffer.isView(e)?i={value:e}:e instanceof j?i={buffer:e}:i=e;const s={...this.settings,...i};if(ArrayBuffer.isView(i.value)){if(!i.type)if(this.doublePrecision&&i.value instanceof Float64Array)s.type="float32";else{const r=Xl(i.value);s.type=s.normalized?r.replace("int","norm"):r}s.bytesPerElement=i.value.BYTES_PER_ELEMENT,s.stride=de(s)}if(t.bounds=null,i.constant){let o=i.value;if(o=this._normalizeValue(o,[],0),this.settings.normalized&&(o=this.normalizeConstant(o)),!(!t.constant||!this._areValuesEqual(o,this.value)))return!1;t.externalBuffer=null,t.constant=!0,this.value=ArrayBuffer.isView(o)?o:new Float32Array(o)}else if(i.buffer){const o=i.buffer;t.externalBuffer=o,t.constant=!1,this.value=i.value||null}else if(i.value){this._checkExternalBuffer(i);const o=i.value;let r=o;t.externalBuffer=null,t.constant=!1,this.value=o,this._shouldSplitDoublePrecisionValue(r)&&(r=Ot(r,s),o instanceof Float32Array&&(s.stride=s.size*2*Float32Array.BYTES_PER_ELEMENT));let{buffer:a}=this;const c=de(s),l=(s.vertexOffset||0)*c;if(this.settings.isIndexed){const f=this.settings.defaultType;r.constructor!==f&&(r=new f(r))}const u=r.byteLength+l+c*2;(!a||a.byteLength<u)&&(a=this._createBuffer(u)),a.write(r,l)}return this.setAccessor(s),!0}updateSubBuffer(e={}){this.state.bounds=null;const t=this.value,{startOffset:i=0,endOffset:s}=e,o=this._shouldSplitDoublePrecisionValue(t);this.buffer.write(o?Ot(t,{size:this.size,startIndex:i,endIndex:s}):t.subarray(i,s),i*(o?8:t.BYTES_PER_ELEMENT)+this.byteOffset)}allocate(e,t=!1){const{state:i}=this,s=i.allocatedValue,o=qt.allocate(s,e+1,{size:this.size,type:this.settings.defaultType,copy:t});this.value=o;const r=this._shouldSplitDoublePrecisionValue(o),a=r&&o instanceof Float32Array?{...this.settings,stride:this.size*2*Float32Array.BYTES_PER_ELEMENT}:this.settings;this.setAccessor(a);const{byteOffset:c}=this;let{buffer:l}=this;const u=o.byteLength*(r&&o instanceof Float32Array?2:1);return(!l||l.byteLength<u+c)&&(l=this._createBuffer(u+c),t&&s&&l.write(this._shouldSplitDoublePrecisionValue(s)?Ot(s,this):s,c)),i.allocatedValue=o,i.constant=!1,i.externalBuffer=null,!0}_shouldSplitDoublePrecisionValue(e){return!!(this.doublePrecision&&(e instanceof Float64Array||this.device.type==="webgpu"&&e instanceof Float32Array))}_checkExternalBuffer(e){const{value:t}=e;if(!ArrayBuffer.isView(t))throw new Error(`Attribute ${this.id} value is not TypedArray`);const i=this.settings.defaultType;let s=!1;if(this.doublePrecision&&(s=t.BYTES_PER_ELEMENT<4),s)throw new Error(`Attribute ${this.id} does not support ${t.constructor.name}`);!(t instanceof i)&&this.settings.normalized&&!("normalized"in e)&&Y.warn(`Attribute ${this.id} is normalized`)()}normalizeConstant(e){switch(this.settings.type){case"snorm8":return new Float32Array(e).map(t=>(t+128)/255*2-1);case"snorm16":return new Float32Array(e).map(t=>(t+32768)/65535*2-1);case"unorm8":return new Float32Array(e).map(t=>t/255);case"unorm16":return new Float32Array(e).map(t=>t/65535);default:return e}}_normalizeValue(e,t,i){const{defaultValue:s,size:o}=this.settings;if(Number.isFinite(e))return t[i]=e,t;if(!e){let r=o;for(;--r>=0;)t[i+r]=s[r];return t}switch(o){case 4:t[i+3]=Number.isFinite(e[3])?e[3]:s[3];case 3:t[i+2]=Number.isFinite(e[2])?e[2]:s[2];case 2:t[i+1]=Number.isFinite(e[1])?e[1]:s[1];case 1:t[i+0]=Number.isFinite(e[0])?e[0]:s[0];break;default:let r=o;for(;--r>=0;)t[i+r]=Number.isFinite(e[r])?e[r]:s[r]}return t}_areValuesEqual(e,t){if(!e||!t)return!1;const{size:i}=this;for(let s=0;s<i;s++)if(e[s]!==t[s])return!1;return!0}_createBuffer(e){this._buffer&&this._buffer.destroy();const{isIndexed:t,type:i}=this.settings,s=this.device.type==="webgpu"&&!t?j.VERTEX|j.STORAGE|j.COPY_DST|j.COPY_SRC:(t?j.INDEX:j.VERTEX)|j.COPY_DST;return this._buffer=this.device.createBuffer({...this._buffer?.props,id:this.id,usage:s,indexType:t?i:void 0,byteLength:e}),this._buffer}}const cs=[],ls=[];function Ae(n,e=0,t=1/0){let i=cs;const s={index:-1,data:n,target:[]};return n?typeof n[Symbol.iterator]=="function"?i=n:n.length>0&&(ls.length=n.length,i=ls):i=cs,(e>0||Number.isFinite(t))&&(i=(Array.isArray(i)?i:Array.from(i)).slice(e,t),s.index=e-1),{iterable:i,objectInfo:s}}function ir(n){return n&&n[Symbol.asyncIterator]}function nr(n,e){const{size:t,stride:i,offset:s,startIndices:o,nested:r}=e,a=n.BYTES_PER_ELEMENT,c=i?i/a:t,l=s?s/a:0,u=Math.floor((n.length-l)/c);return(f,{index:d,target:h})=>{if(!o){const b=d*c+l;for(let P=0;P<t;P++)h[P]=n[b+P];return h}const p=o[d],g=o[d+1]||u;let y;if(r){y=new Array(g-p);for(let b=p;b<g;b++){const P=b*c+l;h=new Array(t);for(let x=0;x<t;x++)h[x]=n[P+x];y[b-p]=h}}else if(c===t)y=n.subarray(p*t+l,g*t+l);else{y=new n.constructor((g-p)*t);let b=0;for(let P=p;P<g;P++){const x=P*c+l;for(let w=0;w<t;w++)y[b++]=n[x+w]}}return y}}const Ql=[],Dt=[[0,1/0]];function eu(n,e){if(n===Dt||(e[0]<0&&(e[0]=0),e[0]>=e[1]))return n;const t=[],i=n.length;let s=0;for(let o=0;o<i;o++){const r=n[o];r[1]<e[0]?(t.push(r),s=o+1):r[0]>e[1]?t.push(r):e=[Math.min(r[0],e[0]),Math.max(r[1],e[1])]}return t.splice(s,0,e),t}const tu={interpolation:{duration:0,easing:n=>n},spring:{stiffness:.05,damping:.5}};function sr(n,e){if(!n)return null;Number.isFinite(n)&&(n={type:"interpolation",duration:n});const t=n.type||"interpolation";return{...tu[t],...e,...n,type:t}}class or extends Jl{constructor(e,t){super(e,t,{startIndices:null,constantValue:null,lastExternalBuffer:null,binaryValue:null,binaryAccessor:null,needsUpdate:!0,needsRedraw:!1,layoutChanged:!1,updateRanges:Dt}),this.constant=!1,this.settings.update=t.update||(t.accessor?this._autoUpdater:void 0),Object.seal(this.settings),Object.seal(this.state),this._validateAttributeUpdaters()}get startIndices(){return this.state.startIndices}set startIndices(e){this.state.startIndices=e}needsUpdate(){return this.state.needsUpdate}needsRedraw({clearChangedFlags:e=!1}={}){const t=this.state.needsRedraw;return this.state.needsRedraw=t&&!e,t}layoutChanged(){return this.state.layoutChanged}setAccessor(e){var t;(t=this.state).layoutChanged||(t.layoutChanged=!Zl(e,this.getAccessor())),super.setAccessor(e)}getUpdateTriggers(){const{accessor:e}=this.settings;return[this.id].concat(typeof e!="function"&&e||[])}supportsTransition(){return!!this.settings.transition}getTransitionSetting(e){if(!e||!this.supportsTransition())return null;const{accessor:t}=this.settings,i=this.settings.transition,s=Array.isArray(t)?e[t.find(o=>e[o])]:e[t];return sr(s,i)}setNeedsUpdate(e=this.id,t){if(this.state.needsUpdate=this.state.needsUpdate||e,this.setNeedsRedraw(e),t){const{startRow:i=0,endRow:s=1/0}=t;this.state.updateRanges=eu(this.state.updateRanges,[i,s])}else this.state.updateRanges=Dt}clearNeedsUpdate(){this.state.needsUpdate=!1,this.state.updateRanges=Ql}setNeedsRedraw(e=this.id){this.state.needsRedraw=this.state.needsRedraw||e}allocate(e){const{state:t,settings:i}=this;if(i.noAlloc)return!1;if(i.update){const s=this.isConstant;return super.allocate(e,t.updateRanges!==Dt),t.layoutChanged||(t.layoutChanged=s&&this.device.type==="webgpu"),!0}return!1}updateBuffer({numInstances:e,data:t,props:i,context:s}){if(!this.needsUpdate())return!1;const{state:{updateRanges:o},settings:{update:r,noAlloc:a}}=this;let c=!0;if(r){for(const[l,u]of o)r.call(s,this,{data:t,startRow:l,endRow:u,props:i,numInstances:e});if(this.value)if(this.constant||!this.buffer||this.buffer.byteLength<this.value.byteLength+this.byteOffset){if(this.constant){const l=this.value;this.value=null,this.setConstantValue(s,l)}else this.setData({value:this.value,constant:this.constant});this.constant=!1}else for(const[l,u]of o){const f=Number.isFinite(l)?this.getVertexOffset(l):0,d=Number.isFinite(u)?this.getVertexOffset(u):a||!Number.isFinite(e)?this.value.length:e*this.size;super.updateSubBuffer({startOffset:f,endOffset:d})}this._checkAttributeArray()}else c=!1;return this.clearNeedsUpdate(),this.setNeedsRedraw(),c}setConstantValue(e,t){var i;if(t===void 0||typeof t=="function")return!1;const s=this.isConstant,o=this.settings.transform&&e?this.settings.transform.call(e,t):t,r=this.settings.defaultType;this.state.constantValue=this._normalizeValue(o,new r(this.size),0);const a=this.setData({constant:!0,value:o});if(this.device.type==="webgpu"){let c=this.state.constantValue;this.doublePrecision&&(c instanceof Float32Array||c instanceof Float64Array)&&(c=Ot(c,{size:this.size}),this.setAccessor({...this.getAccessor(),stride:this.size*2*Float32Array.BYTES_PER_ELEMENT}));let l=this._buffer;(!l||l.byteLength<c.byteLength)&&(l=this._createBuffer(c.byteLength)),l.write(c),(i=this.state).layoutChanged||(i.layoutChanged=!s),this.constant=!1}return a&&this.setNeedsRedraw(),this.clearNeedsUpdate(),!0}getConstantValue(){return this.isConstant?this.state.constantValue:null}setExternalBuffer(e){const{state:t}=this;return e?(this.clearNeedsUpdate(),t.lastExternalBuffer===e||(t.lastExternalBuffer=e,this.setNeedsRedraw(),this.setData(e)),!0):(t.lastExternalBuffer=null,!1)}setBinaryValue(e,t=null){const{state:i,settings:s}=this;if(!e)return i.binaryValue=null,i.binaryAccessor=null,!1;if(s.noAlloc)return!1;if(i.binaryValue===e)return this.clearNeedsUpdate(),!0;if(i.binaryValue=e,this.setNeedsRedraw(),s.transform||t!==this.startIndices){ArrayBuffer.isView(e)&&(e={value:e});const r=e;be(ArrayBuffer.isView(r.value),`invalid ${s.accessor}`);const a=!!r.size&&r.size!==this.size;return i.binaryAccessor=nr(r.value,{size:r.size||this.size,stride:r.stride,offset:r.offset,startIndices:t,nested:a}),!1}return this.clearNeedsUpdate(),this.setData(e),!0}getVertexOffset(e){const{startIndices:t}=this;return(t?e<t.length?t[e]:this.numInstances:e)*this.size}getValue(){const e=this.settings.shaderAttributes,t=super.getValue();if(!e)return t;for(const i in e)Object.assign(t,super.getValue(i,e[i]));return t}getBufferLayout(e){this.state.layoutChanged=!1;const t=this.settings.shaderAttributes,i=super._getBufferLayout(),{stepMode:s}=this.settings;if(s==="dynamic"?i.stepMode=e?e.isInstanced?"instance":"vertex":"instance":i.stepMode=s??"vertex",!t)return i;for(const o in t){const r=super._getBufferLayout(o,t[o]);i.attributes.push(...r.attributes)}return i}_autoUpdater(e,{data:t,startRow:i,endRow:s,props:o,numInstances:r}){const{settings:a,state:c,value:l,size:u,startIndices:f}=e,{accessor:d,transform:h}=a,p=c.binaryAccessor||(typeof d=="function"?d:o[d]);be(typeof p=="function",`accessor "${d}" is not a function`);let g=e.getVertexOffset(i);const{iterable:y,objectInfo:b}=Ae(t,i,s);for(const P of y){b.index++;let x=p(P,b);if(h&&(x=h.call(this,x)),f){const w=(b.index<f.length-1?f[b.index+1]:r)-f[b.index];if(x&&Array.isArray(x[0])){let T=g;for(const E of x)e._normalizeValue(E,l,T),T+=u}else x&&x.length>u?l.set(x,g):(e._normalizeValue(x,b.target,0),Ma({target:l,source:b.target,start:g,count:w}));g+=w*u}else e._normalizeValue(x,l,g),g+=u}}_validateAttributeUpdaters(){const{settings:e}=this;if(!(e.noAlloc||typeof e.update=="function"))throw new Error(`Attribute ${this.id} missing update or accessor`)}_checkAttributeArray(){const{value:e}=this,t=Math.min(4,this.size);if(e&&e.length>=t){let i=!0;switch(t){case 4:i=i&&Number.isFinite(e[3]);case 3:i=i&&Number.isFinite(e[2]);case 2:i=i&&Number.isFinite(e[1]);case 1:i=i&&Number.isFinite(e[0]);break;default:i=!1}if(!i)throw new Error(`Illegal attribute generated for ${this.id}`)}}}const rr=/^vertex-list<([^<>]+)>$/,ar=/^value-list<([^<>]+)>$/;function cr(n){return rr.test(n)}function lr(n){return ar.test(n)}function iu(n){const e=rr.exec(n),t=ar.exec(n),i=e?.[1]??t?.[1]??n;try{ge.getVertexFormatInfo(i)}catch{throw new Error(`Unsupported GPUVector format ${n}`)}return i}function dt(n){const e=iu(n),t=cr(n),i=lr(n),s=ge.getVertexFormatInfo(e),o=s.type,r=s.normalized,a=nu(o,r);return{format:n,elementFormat:e,vertexList:t,valueList:i,type:o,signedDataType:su(e,o),primitiveType:a,components:s.components,byteLength:s.byteLength,integer:s.integer,signed:s.signed,normalized:r,...s.webglOnly?{webglOnly:!0}:{}}}function nu(n,e){if(e)return"f32";switch(n){case"float32":return"f32";case"float16":return"f16";case"uint8":case"uint16":case"uint32":return"u32";case"sint8":case"sint16":case"sint32":return"i32";default:throw new Error(`Unsupported GPUVector component type ${n}`)}}function su(n,e){if(n==="unorm10-10-10-2")return"uint32";switch(e){case"unorm8":return"uint8";case"snorm8":return"sint8";case"unorm16":return"uint16";case"snorm16":return"sint16";default:return e}}class Qt{buffer;format;length;byteOffset;byteStride;constructor(e){const t=ge.getVertexFormatInfo(e.format).byteLength,i=e.byteOffset??0,s=e.byteStride??t;if(Ai(e.length,"GPUDataView length"),Ai(i,"GPUDataView byteOffset"),Ai(s,"GPUDataView byteStride"),s<t)throw new Error(`GPUDataView byteStride ${s} is smaller than ${e.format} byte length ${t}`);const o=e.length===0?0:(e.length-1)*s+t,r=i+o;if(!Number.isSafeInteger(o)||!Number.isSafeInteger(r))throw new Error("GPUDataView byte range must use safe integers");if(r>e.buffer.byteLength)throw new Error("GPUDataView exceeds its backing buffer byte length");this.buffer=e.buffer,this.format=e.format,this.length=e.length,this.byteOffset=i,this.byteStride=s}get elementByteLength(){return ge.getVertexFormatInfo(this.format).byteLength}get byteLength(){return this.length===0?0:(this.length-1)*this.byteStride+this.elementByteLength}}function Ai(n,e){if(!Number.isSafeInteger(n)||n<0)throw new Error(`${e} must be a non-negative safe integer`)}function Ti(n){return!!(n&&typeof n=="object"&&n.type==="struct")}function ou(n,e){const t=Object.entries(n);if(t.length===0)throw new Error("GPUData struct format must declare at least one field");return e==="packed"?ru(t):au(t)}function ru(n){const e=[];let t=0,i=0;for(const[s,o]of n){const r=ge.getVertexFormatInfo(o);if(r.webglOnly)throw new Error(`Packed GPUData struct field "${s}" uses WebGL-only format ${o}`);t=us(t,Math.min(4,r.byteLength)),e.push([s,Object.freeze({format:o,byteOffset:t,byteLength:r.byteLength})]),t+=r.byteLength,i+=r.components}return Object.freeze({type:"struct",layout:"packed",fields:Object.freeze(Object.fromEntries(e)),components:i,byteStride:us(t,4),rowByteLength:t})}function au(n){const e=Object.fromEntries(n.map(([r,a])=>[r,cu(a)])),t=No(e,{layout:"wgsl-storage"}),i=[];let s=0,o=0;for(const[r,a]of n){const c=ge.getVertexFormatInfo(a),l=t.fields[r].offset*4;i.push([r,Object.freeze({format:a,byteOffset:l,byteLength:c.byteLength})]),s=Math.max(s,l+c.byteLength),o+=c.components}return Object.freeze({type:"struct",layout:"wgsl-storage",fields:Object.freeze(Object.fromEntries(i)),components:o,byteStride:t.byteLength,rowByteLength:s})}function cu(n){const e=ge.getVertexFormatInfo(n);switch(e.type){case"float32":return vt("f32",e.components);case"sint32":return vt("i32",e.components);case"uint32":return vt("u32",e.components);default:{const t=Math.ceil(e.byteLength/4);return vt("u32",t)}}}function vt(n,e){return e===1?n:`vec${e}<${n}>`}function us(n,e){return Math.ceil(n/e)*e}class lu{buffer;ownsDataBuffer;constructor(e,t){this.buffer=e,this.ownsDataBuffer=t}get ownsBuffer(){return this.ownsDataBuffer}transferBufferOwnership(e){if(e.buffer!==this.buffer)throw new Error("GPUData ownership can only be transferred to the same buffer");e.ownsDataBuffer=this.ownsDataBuffer,this.ownsDataBuffer=!1}destroy(){this.ownsDataBuffer&&(this.buffer.destroy(),this.ownsDataBuffer=!1)}}class uu extends lu{dataType;format;length;valueLength;stride;byteOffset;byteStride;rowByteLength;readbackMetadata;valueOffsets;nullBitmap;valueByteLength;constructor(e){const{buffer:t,format:i,length:s,valueLength:o,stride:r,byteOffset:a=0,byteStride:c,rowByteLength:l,ownsBuffer:u=!1,readbackMetadata:f,valueOffsets:d,nullBitmap:h,valueByteLength:p,dataType:g}=e;super(t,u);let y;i?typeof i=="string"?y=i:y=ou(i,e.layout??"wgsl-storage"):y=void 0;const b=Ti(y)?y:void 0,P=typeof y=="string"?dt(y):void 0;if(this.dataType=g,this.format=y,this.length=s,this.valueLength=o??s,this.stride=r??P?.components??b?.components??c??l??1,this.byteOffset=a,this.rowByteLength=l??b?.rowByteLength??P?.byteLength??c??this.stride,this.byteStride=c??b?.byteStride??this.rowByteLength,b){if(this.rowByteLength<b.rowByteLength)throw new Error(`GPUData rowByteLength ${this.rowByteLength} is smaller than struct format row byte length ${b.rowByteLength}`);if(this.byteStride<Math.max(b.byteStride,this.rowByteLength))throw new Error(`GPUData byteStride ${this.byteStride} is smaller than its struct row layout`)}this.readbackMetadata=f,this.valueOffsets=d,this.nullBitmap=h,this.valueByteLength=p}getChild(e){if(!Ti(this.format))return null;const t=this.format.fields[e];return t?new Qt({buffer:this.buffer,format:t.format,length:this.length,byteOffset:this.byteOffset+t.byteOffset,byteStride:this.byteStride}):null}getChildAt(e){if(!Ti(this.format))return null;const t=Object.values(this.format.fields)[e];return t?new Qt({buffer:this.buffer,format:t.format,length:this.length,byteOffset:this.byteOffset+t.byteOffset,byteStride:this.byteStride}):null}}const Qi=uu;class et{name;dataType;format;length;valueLength;stride;byteOffset;byteStride;rowByteLength;bufferLayout;data=[];device;bufferProps;isAppendable=!1;ownsDataChunks=!0;ownedVectors=[];appendableByteLength=0;constructor(e){switch(e.type){case"buffer":{const{name:t,buffer:i,format:s,length:o,valueLength:r=o,byteOffset:a=0,ownsBuffer:c=!1}=e,{stride:l,byteStride:u,rowByteLength:f}=fs(e);this.name=t,this.dataType=e.dataType,this.format=s,this.length=o,this.valueLength=r,this.stride=l,this.byteOffset=a,this.byteStride=u,this.rowByteLength=f,this.data.push(new Qi({buffer:i,format:s,length:o,valueLength:r,stride:l,byteOffset:a,byteStride:u,rowByteLength:f,ownsBuffer:c,dataType:e.dataType}));return}case"interleaved":{const{name:t,buffer:i,format:s,length:o,valueLength:r=o,byteOffset:a=0,byteStride:c,attributes:l,ownsBuffer:u=!1}=e;this.name=t,this.dataType=e.dataType,this.format=s,this.length=o,this.valueLength=r,this.stride=c,this.byteOffset=a,this.byteStride=c,this.rowByteLength=c,this.bufferLayout={name:t,byteStride:c,attributes:l},this.data.push(new Qi({buffer:i,format:s,length:o,valueLength:r,stride:c,byteOffset:a,byteStride:c,rowByteLength:c,ownsBuffer:u,dataType:e.dataType}));return}case"data":{const t=e.format??fu(e.data),i=t?dt(t):void 0,{name:s,data:o,stride:r=o[0]?.stride??i?.components??1,valueLength:a=o.reduce((d,h)=>d+h.valueLength,0),byteStride:c=o[0]?.byteStride??i?.byteLength,rowByteLength:l=o[0]?.rowByteLength??i?.byteLength,bufferLayout:u,ownsData:f=!1}=e;if(c===void 0||l===void 0)throw new Error("GPUVector requires format or explicit byte layout metadata");t&&du(o,t),this.name=s,this.dataType=e.dataType,this.format=t,this.length=o.reduce((d,h)=>d+h.length,0),this.valueLength=a,this.stride=r,this.byteOffset=o.length===1?o[0].byteOffset:0,this.byteStride=c,this.rowByteLength=l,this.bufferLayout=u,this.ownsDataChunks=f,this.data.push(...o);return}case"appendable":{const{name:t,device:i,format:s,valueLength:o=0,bufferProps:r}=e,{stride:a,byteStride:c,rowByteLength:l}=fs(e);this.name=t,this.dataType=e.dataType,this.format=s,this.length=0,this.valueLength=o,this.stride=a,this.byteOffset=0,this.byteStride=c,this.rowByteLength=l,this.device=i,this.bufferProps=r,this.isAppendable=!0;return}}}get ownsBuffer(){return this.ownsDataChunks&&this.data.some(e=>e.ownsBuffer)||this.ownedVectors.some(e=>e.ownsBuffer)}get capacityRows(){return this.isAppendable?this.length:void 0}get appendedByteLength(){return this.appendableByteLength}addData(e){if(this.format&&e.format!==this.format)throw new Error("GPUVector.addData() requires matching formats");if(e.byteStride!==this.byteStride)throw new Error("GPUVector.addData() requires matching byteStride");if(e.rowByteLength!==this.rowByteLength)throw new Error("GPUVector.addData() requires matching rowByteLength");return this.data.push(e),this.length+=e.length,this.valueLength+=e.valueLength,this}appendDataChunk(e,t=this.appendableByteLength+e.buffer.byteLength){if(!this.isAppendable)throw new Error("GPUVector.appendDataChunk() requires appendable vector storage");if(this.format&&e.format!==this.format)throw new Error("GPUVector.appendDataChunk() requires matching formats");if(e.byteStride!==this.byteStride||e.rowByteLength!==this.rowByteLength)throw new Error("GPUVector.appendDataChunk() requires matching byte layout metadata");return this.data.push(e),this.length+=e.length,this.valueLength+=e.valueLength,this.appendableByteLength=t,this}resetLastBatch(){if(!this.isAppendable)throw new Error("GPUVector.resetLastBatch() requires appendable vector storage");for(const e of this.data.splice(0))e.destroy();return this.length=0,this.valueLength=0,this.appendableByteLength=0,this}retainOwnedVectors(e){return this.ownedVectors.push(...e),this}transferBufferOwnership(e){const t=this.data[0],i=e.data[0];if(!t||!i||t.buffer!==i.buffer)throw new Error("GPUVector ownership can only be transferred to the same buffer");t.transferBufferOwnership(i)}destroy(){if(this.ownsDataChunks)for(const e of this.data)e.destroy();for(const e of this.ownedVectors.splice(0))e.destroy()}}function fs(n){const e=n.format?dt(n.format):void 0,t=n.rowByteLength??n.byteStride??e?.byteLength;if(t===void 0)throw new Error("GPUVector requires format or explicit rowByteLength");return{stride:n.stride??e?.components??1,byteStride:n.byteStride??t,rowByteLength:t}}function fu(n){return n[0]?.format}function du(n,e){if(n.find(i=>i.format!==e))throw new Error("GPUVector data chunks must share the declared format")}class hu{poolSize=20;bufferPools;constructor(){this.bufferPools=new Map}createOrReuse(e,t){if(t>e.limits.maxBufferSize)throw new Error(`Buffer pool cannot allocate ${t} bytes: device.limits.maxBufferSize is ${e.limits.maxBufferSize}`);const i=this.bufferPools.get(e),s=i?i.findIndex(r=>r.byteLength>=t):-1;if(s<0)return e.createBuffer({usage:j.VERTEX|j.STORAGE|j.COPY_DST|j.COPY_SRC,byteLength:t});const[o]=i.splice(s,1);return o}recycle(e){const t=e.device;this.bufferPools.has(t)||this.bufferPools.set(t,[]);const i=this.bufferPools.get(t),s=i.findIndex(o=>o.byteLength>e.byteLength);s<0?i.push(e):i.splice(s,0,e),this.purge()}purge(){for(const[e,t]of this.bufferPools){const i=e.isLost?0:this.poolSize;for(;t.length>i;)t.shift().destroy();t.length===0&&this.bufferPools.delete(e)}}}const $e=new hu;class W{static get bufferPoolSize(){return $e.poolSize}static set bufferPoolSize(e){if(!Number.isSafeInteger(e)||e<0)throw new Error("GPUDataEvaluator.bufferPoolSize must be a non-negative safe integer");$e.poolSize=e,$e.purge()}type;size;get offset(){return this._offset}get stride(){return this._stride}normalized;isConstant;length;get byteLength(){return this._byteLength}ValueType;source=null;format;_id;_destroyed=!1;_value;_offset;_stride;_byteLength;_gpuVector;_bufferOwnership="owned";_targetBuffer;static fromArray(e,{type:t,size:i=1,offset:s=0,stride:o=0,normalized:r=!1}){let a=t,c;if(Array.isArray(e)){a=a||"float32";const u=Rt(a);c=new u(e)}else e instanceof Float64Array?(a="uint32",i*=2,s*=2,o*=2,c=new Uint32Array(e.buffer,e.byteOffset,e.byteLength/4)):(a=a||Ba(e),c=e);const l=`<${a} * ${i}>`;return new W({id:l,type:a,size:i,offset:s,stride:o,normalized:r,value:c})}static fromConstant(e,t="float32"){const i=Rt(t);let s;return Array.isArray(e)?s=`[${e.join(",")}]`:(s=String(e),e=[e]),new W({id:s,isConstant:!0,type:t,size:e.length,value:new i(e)})}static fromGPUData(e,t={}){gu(e);const i=new Qt({buffer:e.buffer,format:e.format,length:e.length,byteOffset:e.byteOffset,byteStride:e.byteStride});return new W({...hs(i),id:t.id,gpuData:e})}static fromGPUDataView(e,t={}){return new W({...hs(e),id:t.id,buffer:e.buffer})}constructor(e){const{id:t,value:i,buffer:s,gpuData:o,format:r,source:a=null,isConstant:c=!1}=e;if(!a&&!i&&!s&&!o)throw new Error("GPUDataEvaluator must have a value source");let{type:l,size:u,offset:f,stride:d,normalized:h,length:p}=e;if(a instanceof W?(l=l??a.type,u=u??a.size,f=f??a.offset,d=d??a.stride,h=h??a.normalized,p=p??a.length):(u=u??1,f=f??0,h=h??!1,p=c?1:p),!l)throw new Error("GPUDataEvaluator: type not defined");if(this._id=t,this.type=l,this.size=u,this.ValueType=Rt(this.type),this._offset=f,this._stride=d||this.ValueType.BYTES_PER_ELEMENT*u,this.normalized=h,this.source=a,this.format=r,p===void 0)if(c)p=1;else{if(!i)throw new Error("GPUDataEvaluator: length not defined");p=Math.ceil(i.byteLength/this.stride)}this.isConstant=c,this.length=p;const g=this.ValueType.BYTES_PER_ELEMENT*this.size;this._byteLength=p===0?0:(p-1)*this.stride+g,this._value=i,this._bufferOwnership=a instanceof W||s||o?"borrowed":"owned",o?this._gpuVector=new et({type:"data",name:this._id??"data",format:o.format,data:[o],stride:o.stride,byteStride:o.byteStride,rowByteLength:o.rowByteLength}):s&&(this._gpuVector=this.createGPUVectorView({buffer:s,name:this._id,format:this.format}))}get value(){return this._value||(this.source instanceof W?this.source.value:void 0)}get evaluated(){return!!this._gpuVector}get id(){return this._id}get gpuVector(){if(!this._gpuVector)throw new Error(`${this} not evaluated`);return this._gpuVector}get buffer(){return bt(this.gpuVector)}setTargetBuffer({buffer:e,byteOffset:t=0,byteStride:i=this.stride}){if(this._destroyed)throw new Error(`GPUDataEvaluator ${this} already destroyed`);if(this._gpuVector)throw new Error(`GPUDataEvaluator ${this} already evaluated`);if(!this.source||this.source instanceof W)throw new Error("GPUDataEvaluator target buffers require a deferred operation source");this._targetBuffer={buffer:e,byteOffset:t,byteStride:i}}async evaluate(e,t={}){if(this._destroyed)throw new Error(`GPUDataEvaluator ${this} already destroyed`);if(this._gpuVector)return this._gpuVector;let i;if(this.source instanceof W){const s=await this.source.evaluate(e);return this._gpuVector=this.createGPUVectorView({...t,buffer:bt(s)}),this._gpuVector}if(i=this._getEvaluationBuffer(e),this._value)i.write(this._value);else{const s=await this.source.execute(e,i);if(!s.success)throw s.error||new Error(`${this.source} evaluation failed`);s.value&&(this._value=s.value)}return this._gpuVector=this.createGPUVectorView({...t,buffer:i}),this._gpuVector}evaluateSync(e,t={}){if(this._destroyed)throw new Error(`GPUDataEvaluator ${this} already destroyed`);if(this._gpuVector)return this._gpuVector;let i;if(this.source instanceof W){const s=this.source.evaluateSync(e);return this._gpuVector=this.createGPUVectorView({...t,buffer:bt(s)}),this._gpuVector}if(i=this._getEvaluationBuffer(e),this._value)i.write(this._value);else{const s=this.source.executeSync(e,i);if(!s.success)throw s.error||new Error(`${this.source} evaluation failed`);s.value&&(this._value=s.value)}return this._gpuVector=this.createGPUVectorView({...t,buffer:i}),this._gpuVector}createGPUVectorView(e){const t=e.name??this._id??"vector",i=e.format??this.format??_u(this.type,this.size,this.normalized);if(e.interleaved){const s=typeof e.interleaved=="object"&&e.interleaved.attributes?e.interleaved.attributes:yu(this);return new et({type:"interleaved",name:t,buffer:e.buffer,format:e.format??this.format,length:this.length,byteOffset:this.offset,byteStride:this.stride,attributes:s,ownsBuffer:!1})}return new et({type:"buffer",name:t,buffer:e.buffer,format:i,length:this.length,stride:this.size,byteOffset:this.offset,byteStride:this.stride,rowByteLength:this.ValueType.BYTES_PER_ELEMENT*this.size,ownsBuffer:!1})}_getEvaluationBuffer(e){const t=this._targetBuffer;if(!t)return $e.createOrReuse(e,this.byteLength);if(t.buffer.device!==e)throw new Error("GPUDataEvaluator target buffer belongs to a different device");const i=this.ValueType.BYTES_PER_ELEMENT*this.size,s=this.length===0?0:(this.length-1)*t.byteStride+i;if(t.byteOffset+s>t.buffer.byteLength)throw new Error("GPUDataEvaluator target buffer is too small for the output layout");return this._offset=t.byteOffset,this._stride=t.byteStride,this._byteLength=s,this._bufferOwnership="borrowed",this._targetBuffer=void 0,t.buffer}async readValue(e=0,t){const{ValueType:i}=this,{size:s,offset:o,stride:r,length:a}=this,c=i.BYTES_PER_ELEMENT*s;if(t=t??a,e=Math.max(0,Math.min(a,e)),t=Math.max(e,Math.min(a,t)),this._value)return pu(this,this._value,e,t);const l=t-e;if(l===0)return new i(0);const u=o+e*r,f=r===c?l*c:(l-1)*r+c,d=await this.buffer.readAsync(u,f),h=new i(d.buffer,d.byteOffset,d.byteLength/i.BYTES_PER_ELEMENT);if(r===c)return h;const p=new Uint8Array(c*l);for(let g=0;g<l;g++){const y=g*r;p.set(d.subarray(y,y+c),g*c)}return new i(p.buffer)}async ensureCPUValue(){const e=this.value;if(e)return e;const t=await this.buffer.readAsync(0,this.offset+this.byteLength);if(t.byteLength%this.ValueType.BYTES_PER_ELEMENT!==0)throw new Error(`${this} backing buffer byte length is not aligned to its scalar type`);const i=t.slice();return this._value=new this.ValueType(i.buffer,i.byteOffset,i.byteLength/this.ValueType.BYTES_PER_ELEMENT),this._value}ensureCPUValueSync(){const e=this.value;if(e)return e;throw new Error(`${this} CPU value is not available for synchronous evaluation`)}toString(){return this._id??this.source?.toString()??this.constructor.name}destroy(){this._gpuVector&&(this._bufferOwnership==="owned"&&$e.recycle(bt(this._gpuVector)),this._gpuVector=void 0),this._targetBuffer=void 0,this._destroyed=!0}}function pu(n,e,t,i){const{ValueType:s,size:o,offset:r,stride:a}=n,c=a/s.BYTES_PER_ELEMENT,l=r/s.BYTES_PER_ELEMENT,u=i-t;if(c===o){const d=l+t*c;return e.subarray(d,d+u*o)}const f=new s(u*o);for(let d=0;d<u;d++){const h=l+(t+d)*c;f.set(e.subarray(h,h+o),d*o)}return f}function ds(n){if(n instanceof W)return n;if(typeof n=="number"||Array.isArray(n))return W.fromConstant(n);if(n instanceof Qi)return W.fromGPUData(n);if(n instanceof Qt)return W.fromGPUDataView(n);throw new Error("getGPUDataEvaluator() requires GPUDataEvaluator, GPUData, GPUDataView, number, or number[]")}function gu(n){if(!n.format)throw new Error("GPUDataEvaluator.fromGPUData() requires GPUData format metadata");if(cr(n.format)||lr(n.format))throw new Error("GPUDataEvaluator.fromGPUData() does not support variable-length input");const t=dt(n.format).byteLength;if(n.rowByteLength!==t)throw new Error(`GPUDataEvaluator.fromGPUData() requires rowByteLength ${t} for GPUData`)}function hs(n){const e=dt(n.format),t=Rt(e.signedDataType),i=t.BYTES_PER_ELEMENT*e.components;if(e.byteLength!==i)throw new Error(`GPUDataEvaluator does not support packed vertex format ${n.format}: ${e.byteLength} physical bytes cannot expose ${e.components} ${e.signedDataType} components`);if(n.byteOffset%t.BYTES_PER_ELEMENT!==0||n.byteStride%t.BYTES_PER_ELEMENT!==0)throw new Error(`GPUDataEvaluator requires ${n.format} offset and stride aligned to ${t.BYTES_PER_ELEMENT} bytes`);return{type:e.signedDataType,size:e.components,offset:n.byteOffset,stride:n.byteStride,normalized:e.normalized,length:n.length,format:n.format}}function bt(n){const e=mu(n).buffer;return e instanceof fe?e.buffer:e}function mu(n){const[e,...t]=n.data;if(!e||t.length>0)throw new Error(`GPUDataEvaluator requires exactly one GPUData chunk for "${n.name}"`);return e}function yu(n){const e=[];return ur(n,e,{byteOffset:0}),e}function ur(n,e,t){const i=n.source;if(i&&!(i instanceof W)&&i.name==="interleave"){for(const s of Object.values(i.inputs))s instanceof W&&ur(s,e,t);return}e.push({attribute:n.id??n.toString(),format:fr(n.type,n.size,n.normalized),byteOffset:t.byteOffset}),t.byteOffset+=n.ValueType.BYTES_PER_ELEMENT*n.size}function fr(n,e,t=!1){if(e<1||e>4)throw new Error(`Cannot synthesize a GPUVector vertex format with ${e} components`);let i=n;if(t)switch(n){case"uint8":i="unorm8";break;case"sint8":i="snorm8";break;case"uint16":i="unorm16";break;case"sint16":i="snorm16";break;case"float32":i="float32";break;default:throw new Error(`Unsupported normalized vertex format for ${n}`)}return(i==="uint8"||i==="sint8"||i==="uint16"||i==="sint16"||i==="unorm8"||i==="snorm8"||i==="unorm16"||i==="snorm16")&&e===3?`${i}x3-webgl`:`${i}${e===1?"":`x${e}`}`}function _u(n,e,t=!1){return e>=1&&e<=4?fr(n,e,t):void 0}class Re{gpuDataEvaluators;format;length;id;_gpuVector;_ownsGPUDataEvaluators;_destroyed=!1;static fromGPUVector(e){if(e.bufferLayout)throw new Error(`GPUVectorEvaluator.fromGPUVector() does not accept interleaved vector "${e.name}"`);if(e.data.length===0)throw new Error(`GPUVectorEvaluator.fromGPUVector() requires GPUData for "${e.name}"`);return new Re({id:e.name,gpuDataEvaluators:e.data.map(t=>W.fromGPUData(t,{id:e.name})),gpuVector:e,format:e.format})}static fromGPUDataEvaluators(e,t={}){return new Re({id:t.id,gpuDataEvaluators:e,format:t.format})}constructor({id:e,gpuDataEvaluators:t,gpuVector:i,format:s}){if(t.length===0)throw new Error("GPUVectorEvaluator requires at least one GPUData evaluator");vu(t),this.id=e,this.gpuDataEvaluators=t,this.format=s??t[0].format,this.length=t.reduce((o,r)=>o+r.length,0),this._gpuVector=i,this._ownsGPUDataEvaluators=!i}get evaluated(){return!!this._gpuVector}get gpuVector(){if(!this._gpuVector)throw new Error(`${this} not evaluated`);return this._gpuVector}mapGPUData(e){return Re.fromGPUDataEvaluators(this.gpuDataEvaluators.map((t,i)=>e(t,i)),{id:this.id})}async evaluate(e,t={}){if(this._destroyed)throw new Error(`GPUVectorEvaluator ${this} already destroyed`);if(this._gpuVector)return this._gpuVector;const i=await Promise.all(this.gpuDataEvaluators.map(a=>a.evaluate(e,t))),s=i[0],o=i.map(ps),r=t.format??this.format??s.format;return this._gpuVector=new et({type:"data",name:t.name??this.id??"vector",format:r,data:o,stride:s.stride,byteStride:s.byteStride,rowByteLength:s.rowByteLength,bufferLayout:s.bufferLayout}),this._gpuVector}evaluateSync(e,t={}){if(this._destroyed)throw new Error(`GPUVectorEvaluator ${this} already destroyed`);if(this._gpuVector)return this._gpuVector;const i=this.gpuDataEvaluators.map(a=>a.evaluateSync(e,t)),s=i[0],o=i.map(ps),r=t.format??this.format??s.format;return this._gpuVector=new et({type:"data",name:t.name??this.id??"vector",format:r,data:o,stride:s.stride,byteStride:s.byteStride,rowByteLength:s.rowByteLength,bufferLayout:s.bufferLayout}),this._gpuVector}destroy(){if(this._ownsGPUDataEvaluators)for(const e of this.gpuDataEvaluators)e.destroy();this._gpuVector=void 0,this._destroyed=!0}toString(){return this.id??this.constructor.name}}function vu(n){const e=n[0];for(const t of n.slice(1))if(t.type!==e.type||t.size!==e.size||t.normalized!==e.normalized||t.format!==e.format)throw new Error("GPUVectorEvaluator requires matching GPUData evaluator layouts")}function ps(n){const[e,...t]=n.data;if(!e||t.length>0)throw new Error(`GPUVectorEvaluator requires one GPUData chunk for "${n.name}"`);return e}const bu={add:{arity:2,symbol:"arithmetic_add"},subtract:{arity:2,symbol:"arithmetic_subtract"},multiply:{arity:2,symbol:"arithmetic_multiply"},divide:{arity:2,symbol:"arithmetic_divide"},pow:{arity:2,symbol:"pow"},sqrt:{arity:1,symbol:"sqrt"},abs:{arity:1,symbol:"abs"},sin:{arity:1,symbol:"sin"},cos:{arity:1,symbol:"cos"},tan:{arity:1,symbol:"arithmetic_tan"},exp:{arity:1,symbol:"exp"},log:{arity:1,symbol:"log"}};function wn({elementWise:n,func:e,inputs:t,output:i,outputBuffer:s}){const o=Array.isArray(t)?t:Object.values(t);for(const p of o)if(!p.value)throw new Error(`${p} does not have CPU value`);const r=i.length,a=i.size,c=new i.ValueType(r*a);for(let p=0;p<r;p++){const g=o.map(y=>se(y,p));if(n)for(let y=0;y<a;y++)c[p*a+y]=e.apply(null,g.map(b=>b[y]));else e.call(null,c.subarray(p*a,p*a+a),...g)}const l=i.ValueType.BYTES_PER_ELEMENT,u=i.offset/l,f=i.stride/l,d=a;let h=c;if(u!==0||f!==d){h=new i.ValueType(u+i.byteLength/l);for(let p=0;p<r;p++){const g=p*d,y=u+p*f,b=c.subarray(g,g+a);h.set(b,y),s.write(b,y*l)}}else s.write(c);return{success:!0,value:h}}function se(n,e){const t=n.value,i=n.size,s=n.offset/n.ValueType.BYTES_PER_ELEMENT,o=n.stride/n.ValueType.BYTES_PER_ELEMENT,r=n.isConstant?0:e,a=s+r*o,c=t.slice(a,a+i);if(!n.normalized)return c;const l=new Float32Array(i);for(let u=0;u<i;u++)l[u]=xu(c[u],n.type);return l}function xu(n,e){switch(e){case"uint8":return n/255;case"uint16":return n/65535;case"uint32":return n/4294967295;case"sint8":return Math.max(n/127,-1);case"sint16":return Math.max(n/32767,-1);case"sint32":return Math.max(n/2147483647,-1);case"float32":return n;default:throw new Error(`Unsupported normalized source type ${e}`)}}const Pu=({inputs:n,output:e,target:t})=>{for(const s of Object.values(n.namedInputs))if(!s.value)throw new Error(`${s} does not have CPU value`);const i=new e.ValueType(e.length*e.size);for(let s=0;s<e.length;s++){const o=Object.fromEntries(Object.entries(n.namedInputs).map(([r,a])=>[r,se(a,s)]));for(let r=0;r<e.size;r++)i[s*e.size+r]=dr(n.expression,o,r)}return t.write(i),{success:!0,value:i}};function dr(n,e,t){switch(n.kind){case"input":{const i=e[n.name];return t<i.length?i[t]:i.length===1?i[0]:0}case"literal":return Array.isArray(n.value)?n.value[t]??0:n.value;case"call":{wu(n.op,n.args.length);const i=n.args.map(s=>dr(s,e,t));switch(n.op){case"add":return i[0]+i[1];case"subtract":return i[0]-i[1];case"multiply":return i[0]*i[1];case"divide":return i[0]/i[1];case"pow":return Math.pow(i[0],i[1]);case"sqrt":return Math.sqrt(i[0]);case"abs":return Math.abs(i[0]);case"sin":return Math.sin(i[0]);case"cos":return Math.cos(i[0]);case"tan":return Math.tan(i[0]);case"exp":return Math.exp(i[0]);case"log":return Math.log(i[0]);default:{const s=n.op;throw new Error(`Unsupported arithmetic op ${s}`)}}}default:{const i=n;throw new Error(`Unsupported expression node ${i.kind}`)}}}function wu(n,e){const t=bu[n].arity;if(e!==t)throw new Error(`Arithmetic op '${n}' expects ${t} args, got ${e}`)}const Cu=({inputs:n,output:e,target:t})=>{const{sourceValues:i}=n;if(!i.value)throw new Error(`${i} does not have CPU value`);const o=new e.ValueType(e.length*e.size);if(i.length===0)return{success:!1,error:new Error(`${i} is empty`)};for(let r=0;r<i.size;r++){const a=se(i,0)[r],c=r*e.size,l=c+1;o[c]=a,o[l]=a;for(let u=1;u<i.length;u++){const f=se(i,u)[r];f<o[c]&&(o[c]=f),f>o[l]&&(o[l]=f)}}return t.write(o),{success:!0,value:o}},Lu=({inputs:n,output:e,target:t})=>wn({func:(i,s)=>{const o=i.length/2,r=new Float64Array(s.buffer);for(let a=0;a<o;a++){const c=r[a];i[a]=Math.fround(c),i[a+o]=c-i[a]}return i},inputs:n,output:e,outputBuffer:t}),Su=async({inputs:n,output:e,target:t})=>{const{ids:i,sourceValues:s}=n,o=i.value,r=s.value;if(!o)throw new Error(`${i} does not have CPU value`);if(!r)throw new Error(`${s} does not have CPU value`);const a=new e.ValueType(e.length*e.size),c=new Array(e.size).fill(0);for(let l=0;l<e.length;l++){const u=se(i,l),f=Number(u[0]),d=Au(f,s.length)?se(s,f):c;a.set(d,l*e.size)}return t.write(a),{success:!0,value:a}};function Au(n,e){return Number.isInteger(n)&&n>=0&&n<e}const Tu=({inputs:n,output:e,target:t})=>wn({func:(i,...s)=>{let o=0;for(const r of s)i.set(r,o),o+=r.length},inputs:n,output:e,outputBuffer:t}),Eu=({inputs:n,output:e,target:t})=>{const{x:i,y:s}=n,o=new e.ValueType(e.length);for(let r=0;r<e.length;r++){const a=se(i,r),c=se(s,r);let l=0;for(let u=0;u<i.size;u++)l+=a[u]*c[u];o[r]=l}return t.write(o),{success:!0,value:o}},Iu=({inputs:n,output:e,target:t})=>{const{x:i,y:s}=n,o=new e.ValueType(e.length);for(let r=0;r<e.length;r++){const a=se(i,r),c=se(s,r);let l=1;for(let u=0;u<i.size;u++)if(a[u]!==c[u]){l=0;break}o[r]=l}return t.write(o),{success:!0,value:o}},Mu=({inputs:n,output:e,target:t})=>{const{x:i}=n,s=new e.ValueType(e.length);for(let o=0;o<e.length;o++){const r=se(i,o);let a=0;for(let c=0;c<i.size;c++)a+=r[c]*r[c];s[o]=Math.sqrt(a)}return t.write(s),{success:!0,value:s}},Bu=async({inputs:n,output:e,target:t})=>{const{segments:i,vertexCount:s}=n,o=i.value;if(!o)throw new Error(`${i} does not have CPU value`);Ou(o,i,s);const r=new e.ValueType(e.length*e.size);let a=0;for(let c=0;c<s;c++){for(;a+1<i.length&&o[en(i,a+1)]<=c;)a++;const l=o[en(i,a)],u=c*e.size;r[u]=a,r[u+1]=c-l}return t.write(r),{success:!0,value:r}};function Ou(n,e,t){if(e.length<1)throw new Error("segmentedMap segments must contain at least one segment start");let i=0;for(let s=0;s<e.length;s++){const o=n[en(e,s)];if(s===0&&o!==0)throw new Error(`segmentedMap segments must start at 0, got ${o}`);if(s>0&&o<i)throw new Error(`segmentedMap segments must be non-decreasing, got ${o} after ${i}`);i=o}if(i>t)throw new Error(`segmentedMap last segment start must be <= vertexCount, got ${i} > ${t}`)}function en(n,e){return n.offset/n.ValueType.BYTES_PER_ELEMENT+e*(n.stride/n.ValueType.BYTES_PER_ELEMENT)}const Ru=async({inputs:n,output:e,target:t})=>{const{condition:i,whenTrue:s,whenFalse:o}=n,r=new e.ValueType(e.length*e.size);for(let a=0;a<e.length;a++){const c=se(i,a),l=se(s,a),u=se(o,a);for(let f=0;f<e.size;f++){const d=Ei(c,i.size,f);r[a*e.size+f]=d!==0?Ei(l,s.size,f):Ei(u,o.size,f)}}return t.write(r),{success:!0,value:r}};function Ei(n,e,t){return t<e?n[t]:e===1?n[0]:0}const zu=({inputs:n,output:e,target:t})=>{const i=new e.ValueType(e.length);for(let s=0;s<e.length;s++)i[s]=n.start+s*n.step;return t.write(i),{success:!0,value:i}},Nu=({inputs:n,output:e,target:t})=>{const{columns:i}=n;return wn({func:(s,o)=>{for(let r=0;r<i.length;r++)s[r]=o[i[r]]},inputs:{x:n.x},output:e,outputBuffer:t})},Fu=Object.freeze(Object.defineProperty({__proto__:null,arithmetic:Pu,dot:Eu,equalAll:Iu,extent:Cu,fround:Lu,gather:Su,interleave:Tu,length:Mu,segmentedMap:Bu,select:Ru,sequence:zu,swizzle:Nu},Symbol.toStringTag,{value:"Module"}));class Du{_modules={cpu:Fu};add(e,t){const i=this._modules[e];if(typeof t.then=="function"){const o=Promise.all([Promise.resolve(i||{}),t]).then(([r,a])=>({...r,...a}));return this._modules[e]=o,o.then(r=>{this._modules[e]=r}).catch(r=>{R.error(`Failed to register ${e} backend: ${r}`)()}),o}if(i&&typeof i.then=="function"){const o=Promise.resolve(i).then(r=>({...r,...t})).then(r=>(this._modules[e]=r,r)).catch(r=>{throw R.error(`Failed to register ${e} backend: ${r}`)(),r});return this._modules[e]=o,o}const s={...i||{},...t};return this._modules[e]=s,Promise.resolve(s)}async get(e,t){let i=this._modules[e];if(!i)if(e==="webgl")i=this.add("webgl",Xn(()=>import("./index-CArDEnim.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11])));else if(e==="webgpu")i=this.add("webgpu",Xn(()=>import("./index-DSgLfjkz.js"),__vite__mapDeps([12,1,2,3,4,5,6,7,8,9,10,11])));else throw new Error(`${e} backend not registered`);const o=(await i)[t];if(typeof o!="function")throw new Error(`${e} backend does not implement ${t}`);return o}getSync(e,t){const i=this._modules[e];if(!i)throw new Error(`${e} backend not registered`);if(typeof i.then=="function")throw new Error(`${e} backend is not loaded yet`);const o=i[t];if(typeof o!="function")throw new Error(`${e} backend does not implement ${t}`);return o}clear(){this._modules={}}}const tn=new Du;class ku{inputs;dependencies;constructor(e){this.inputs=e,this.dependencies=Array.from(e instanceof Array?e:Object.values(e)).filter(t=>t instanceof W)}async execute(e,t){return await this._resolveDependencies(e),await this._executeWithHandler(await tn.get(this._getHandlerRegistry(e),this.name),t)}executeSync(e,t){this._resolveDependenciesSync(e);const i=this._executeWithHandler(tn.getSync(this._getHandlerRegistry(e),this.name),t);if(Uu(i))throw new Error(`${this.name} returned a Promise in executeSync()`);return i}shouldExecuteOnCPU(){return this.output.length<=1&&Array.from(this.dependencies).every(e=>!!e.value)}_getHandlerRegistry(e){return this.shouldExecuteOnCPU()?"cpu":e.type}async _resolveDependencies(e){for(const i of this.dependencies)await i.evaluate(e);if(this._getHandlerRegistry(e)==="cpu"||e.type==="null")for(const i of this.dependencies)await i.ensureCPUValue()}_resolveDependenciesSync(e){for(const i of this.dependencies)i.evaluateSync(e);if(this._getHandlerRegistry(e)==="cpu"||e.type==="null")for(const i of this.dependencies)i.ensureCPUValueSync()}_executeWithHandler(e,t){return e({device:t.device,inputs:this.inputs,output:this.output,target:t})}}function Uu(n){return typeof n?.then=="function"}function Vu(...n){let e=ju(n.map(t=>t.type));return e[0]!=="f"&&n.some(t=>t.normalized)&&(e="float32"),{isConstant:n.every(t=>t.isConstant),type:e,size:n.reduce((t,i)=>Math.max(t,i.size),0),length:n.reduce((t,i)=>Math.max(t,i.length),0)}}function ju(n){let e=0,t=0;for(const i of n){if(i[0]==="f")return"float32";const s=i.endsWith("8")?8:i.endsWith("6")?16:32;i[0]==="u"?e=Math.max(e,s):t=Math.max(t,s)}return e&&!t?`uint${e}`:t&&e<32?`sint${Math.max(t,e*2)}`:"float32"}class Gu extends ku{name="interleave";output;constructor(e){super(e);const{isConstant:t,type:i,length:s}=Vu(...e);this.output=new W({isConstant:t,type:i,size:e.reduce((o,r)=>o+r.size,0),length:s,source:this})}toString(){return`_${this.inputs.join("_")}_`}}function $u(...n){if(n.length===0)throw new Error("interleave() requires at least one input");return n.length===1?ds(n[0]):new Gu(n.map(ds)).output}function Wu(n,e){const t=qu(e);for(const i of t)i.evaluateSync(n);return Hu(t),e}function Hu(n){const e=new Set(n.flatMap(Xu)),t=new Set;for(const i of n)kt(i,t);for(const i of t)i.evaluated&&!e.has(i.buffer)&&i.destroy()}function qu(n){const e=new Set;return nn(n,e,new Set),Array.from(e)}function nn(n,e,t){if(Zu(n)){e.add(n);return}if(!(!n||typeof n!="object"||t.has(n))){if(t.add(n),Array.isArray(n)){for(const i of n)nn(i,e,t);return}if(Yu(n))for(const i of Object.values(n))nn(i,e,t)}}function Yu(n){const e=Object.getPrototypeOf(n);return e===Object.prototype||e===null}function kt(n,e){if(n instanceof Re){for(const i of n.gpuDataEvaluators)kt(i,e);return}const t=n.source;if(t){if(t instanceof W){e.has(t)||(e.add(t),kt(t,e));return}for(const i of t.dependencies)e.has(i)||(e.add(i),kt(i,e))}}function Xu(n){return n instanceof W?[n.buffer]:n.gpuVector.data.map(e=>e.buffer instanceof fe?e.buffer.buffer:e.buffer)}function Zu(n){return n instanceof W||n instanceof Re}const Ku=65535;function Ju(n,e){const t=tf(e),i=Math.max(1,Math.ceil(n)),s=Math.min(i,t),o=Math.min(Math.ceil(i/s),t),r=Math.ceil(i/s/o);if(r>t)throw new Error(`WebGPU dispatch requires ${i} workgroups, exceeding the 3D dispatch limit of ${t} per dimension`);return{x:s,y:o,z:r}}function Qu(n,e="workgroupId"){return`((${e}.z * ${n.y}u + ${e}.y) * ${n.x}u + ${e}.x)`}function ef(n,e,t="workgroupId",i="localId"){return`(${Qu(n,t)} * ${e}u + ${i}.x)`}function tf(n){return Number.isFinite(n)&&n>0?Math.floor(n):Ku}function sn(n,e){switch(n){case"u32":return`${e}u`;case"f32":return Number.isInteger(e)?`${e}.0`:`${e}`;default:return`${e}`}}function zm(n,e){switch(n){case"uint32":return sn("u32",Math.trunc(e));case"sint32":return`${Math.trunc(e)}`;case"float32":return sn("f32",e);default:throw new Error(`WebGPU operations only support 32-bit output types, got ${n}`)}}function nf(n){switch(n){case"uint32":return"0u";case"sint32":return"0";case"float32":return"0.0";default:throw new Error(`WebGPU operations only support 32-bit output types, got ${n}`)}}function Ce(n){switch(n){case"uint32":return"u32";case"sint32":return"i32";case"float32":return"f32";default:throw new Error(`WebGPU operations only support 32-bit storage types, got ${n}`)}}const Ii=64,sf="GPGPU Operation Counts",of="Computation Runs",rf=new Oo;function af({module:n,elementWise:e=!1,expression:t,inputs:i,output:s,operationType:o=s.type,outputBuffer:r}){if(!n.source)throw new Error(`WebGPU computation ${n.name} requires WGSL source`);const a=hf(i),c=a.map(([P,x])=>({name:P,input:x})),l=c.filter(({input:P})=>!P.isConstant).map((P,x)=>({...P,index:x})),u=Ce(o),f=Ce(s.type),d={TYPE:u,RESULT_LEN:s.size.toString()},h=Ju(Math.ceil(s.length/Ii),r.device.limits.maxComputeWorkgroupsPerDimension);for(const[P,x]of a)d[`${P.toUpperCase()}_LEN`]=x.size.toString();const p=`
${gf(n.source,d)}
${l.map(({name:P,input:x,index:w})=>cf(P,x,w)).join(`
`)}
${c.map(({name:P,input:x})=>lf(P,x,o)).join(`
`)}
${uf(s,l.length)}
${ff(s)}

@compute @workgroup_size(${Ii}) fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_id) localId: vec3<u32>
) {
  let rowIndex = ${ef(h,Ii)};
  if (rowIndex >= ${s.length}u) {
    return;
  }

${c.map(({name:P})=>`  let ${P} = read_${P}(rowIndex);`).join(`
`)}
  var result: array<${f}, ${s.size}>;
${df(n.name,a,s,e,t)}
  write_result(rowIndex, result);
}
`,g=new Pn(r.device,{source:p,modules:n.dependencies,shaderAssembler:rf,shaderLayout:{bindings:[...l.map(({name:P},x)=>({name:P,type:"storage",group:0,location:x})),{name:"result",type:"storage",group:0,location:l.length}]}}),y=Object.fromEntries(l.map(({name:P,input:x})=>[P,x.buffer]));y.result=r,g.setBindings(y);const b=r.device.beginComputePass({});r.device.statsManager.getStats(sf).get(of).incrementCount(),g.dispatch(b,h.x,h.y,h.z),b.end(),r.device.submit(),g.destroy()}function cf(n,e,t){if(e.isConstant)return"";const i=Ce(e.type);return`@group(0) @binding(${t}) var<storage, read> ${n}: array<${i}>;`}function lf(n,e,t){const i=Ce(t),s=e.type===t?"":i,o=e.stride/e.ValueType.BYTES_PER_ELEMENT,r=e.offset/e.ValueType.BYTES_PER_ELEMENT;return e.isConstant?`fn read_${n}(_rowIndex: u32) -> array<${i}, ${e.size}> {
  return array<${i}, ${e.size}>(${pf(e,s)});
}`:`fn read_${n}(rowIndex: u32) -> array<${i}, ${e.size}> {
  var value: array<${i}, ${e.size}>;
  let rowOffset = ${r}u + rowIndex * ${o}u;
${Array.from({length:e.size},(a,c)=>s?`  value[${c}] = ${s}(${n}[rowOffset + ${c}u]);`:`  value[${c}] = ${n}[rowOffset + ${c}u];`).join(`
`)}
  return value;
}`}function uf(n,e){const t=Ce(n.type);return`@group(0) @binding(${e}) var<storage, read_write> result: array<${t}>;`}function ff(n){const e=n.stride/n.ValueType.BYTES_PER_ELEMENT,t=n.offset/n.ValueType.BYTES_PER_ELEMENT;return`fn write_result(rowIndex: u32, value: array<${Ce(n.type)}, ${n.size}>) {
  let rowOffset = ${t}u + rowIndex * ${e}u;
${Array.from({length:n.size},(s,o)=>`  result[rowOffset + ${o}u] = value[${o}];`).join(`
`)}
}`}function df(n,e,t,i,s){let o="";if(s)for(let r=0;r<t.size;r++)o+=`  result[${r}] = ${s(r)};
`;else if(i){const r=nf(t.type),a=Ce(t.type);for(let c=0;c<t.size;c++){const l=e.map(([u,f])=>c<f.size?Ce(f.type)===a?`${u}[${c}]`:`${a}(${u}[${c}])`:r);o+=`  result[${c}] = ${n}(${l.join(", ")});
`}}else o+=`result = ${n}(${e.map(([r])=>r).join(", ")});`;return o.trimEnd()}function hf(n){return Array.isArray(n)?n.map((e,t)=>[`x${t}`,e]):Object.entries(n)}function pf(n,e){const t=n.value;if(!t)throw new Error(`Constant input ${n} is missing CPU values`);return Array.from({length:n.size},(i,s)=>sn(e,t[s]??0)).join(", ")}function gf(n,e){for(const t in e)n=n.replaceAll(`{${t}}`,e[t]);return n}const mf=({inputs:n,output:e,target:t})=>{const i=n.map((c,l)=>[`x${l}`,c]);yf(t.device.limits,i);const s=i.map(([c,l])=>`${c}: array<{TYPE}, ${l.size}>`).join(", ");let o=0;const r=i.map(([c,l])=>{const u=Array.from({length:l.size},(f,d)=>`  out[${o+d}] = ${c}[${d}];`).join(`
`);return o+=l.size,u}).join(`
`),a=`fn interleave(${s}) -> array<{TYPE}, {RESULT_LEN}> {
  var out: array<{TYPE}, {RESULT_LEN}>;
${r}
  return out;
}
`;return af({module:{name:"interleave",source:a},inputs:n,output:e,outputBuffer:t}),{success:!0}};function yf(n,e){const i=e.filter(([,s])=>!s.isConstant).length+1;if(i>n.maxStorageBuffersPerShaderStage)throw new Error(`interleave() requires ${i} storage buffers, exceeding device limit ${n.maxStorageBuffersPerShaderStage}`);if(i>n.maxBindingsPerBindGroup)throw new Error(`interleave() requires ${i} bindings, exceeding bind group limit ${n.maxBindingsPerBindGroup}`)}class _f{constructor(e,{id:t,isTransitionAttribute:i}){this.packedBuffers={},this.device=e,this.id=t,this.isTransitionAttribute=i,this.device.type==="webgpu"&&tn.add("webgpu",{interleave:mf})}hasGroups(e){return this.device.type==="webgpu"&&Object.values(e).some(t=>!!t.settings.bufferGroup)}finalize(){for(const e of Object.values(this.packedBuffers))e.packed.destroy();this.packedBuffers={}}getBufferLayouts(e,t){const i=this._getPackedGroups(e,t,{requireValues:!1,excludeAttributes:{}});return this._getBufferLayouts(e,i,t)}getBindings(e,t,i,s){const o=this._getPackedGroups(e,i,{requireValues:!0,excludeAttributes:s}),r={},a=new Set;for(const c of o.values()){const l=!this.packedBuffers[c.id]||c.attributes.some(u=>!!t[u.id]);r[c.id]=this._getPackedBuffer(c,l);for(const u of c.attributes)a.add(u.id)}return{bufferLayouts:this._getBufferLayouts(e,o,i).filter(c=>!s[c.name]&&!e[c.name]?.settings.isIndexed),buffers:r,groupedAttributeIds:a}}_getPackedGroups(e,t,{requireValues:i,excludeAttributes:s}){const o=new Map;for(const a of Object.values(e)){const c=a.settings.bufferGroup;if(!c)continue;const l=o.get(c)||[];l.push(a),o.set(c,l)}const r=new Map;for(const[a,c]of o){const l=this._getPackedGroup(a,c,t,i,s);l&&r.set(a,l)}return r}_getPackedGroup(e,t,i,s,o){if(t.length<2)return null;const r=t.map(h=>h.getBufferLayout(i)),a=r[0].stepMode,c=Math.max(1,t[0].numInstances),l=s&&t.every(h=>h.isConstant);for(let h=0;h<t.length;h++){const p=t[h],g=p.getAccessor(),y=g.size*g.bytesPerElement;if(o[p.id]||p.settings.isIndexed||p.settings.noAlloc||p.doublePrecision||this.isTransitionAttribute(p.id)||r[h].stepMode!==a||p.numInstances!==t[0].numInstances||(g.offset||0)!==0||(g.vertexOffset||0)!==0||de(g)!==y||s&&(p.isConstant?!p.getConstantValue()||p.getConstantValue().byteLength<y:!ArrayBuffer.isView(p.value)||p.value.byteLength<c*y))return null}const u={},f=[];let d=0;for(let h=0;h<t.length;h++){const p=t[h];d=gs(d),u[p.id]=d;for(const g of r[h].attributes||[])f.push({...g,byteOffset:d+(g.byteOffset||0)});d+=de(p.getAccessor())}return d=gs(d),{id:e,attributes:t,byteStride:d,byteOffsets:u,rowCount:c,layout:{name:e,byteStride:l?0:d,stepMode:a,attributes:f}}}_getBufferLayouts(e,t,i){const s=[],o=new Set,r=new Set;for(const a of t.values())for(const c of a.attributes)r.add(c.id);for(const a of Object.values(e)){const c=a.settings.bufferGroup,l=c&&t.get(c);l&&r.has(a.id)?o.has(l.id)||(s.push(l.layout),o.add(l.id)):s.push(a.getBufferLayout(i))}return s}_getPackedBuffer(e,t){const i=JSON.stringify({byteStride:e.layout.byteStride,attributes:e.layout.attributes}),s=this.packedBuffers[e.id];if((!s||s.layoutKey!==i)&&(t=!0),t){s&&(s.packed.destroy(),delete this.packedBuffers[e.id]);const o=this._interleavePackedGroup(e);return this.packedBuffers[e.id]={packed:o,layoutKey:i},o.buffer}if(!s)throw new Error(`Attribute buffer group ${e.id} has no packed buffer`);return s.packed.buffer}_interleavePackedGroup(e){const t=e.attributes.map(s=>this._getInterleaveInput(e,s)),i=$u(...t);return Wu(this.device,i),i}_getInterleaveInput(e,t){const i=de(t.getAccessor()),s=e.byteOffsets[t.id];if(We(`${e.id}.${t.id} rowByteLength`,i),We(`${e.id}.${t.id} groupByteOffset`,s),t.isConstant){const c=t.getConstantValue();if(!c)throw new Error(`Attribute group ${e.id} is missing constant value ${t.id}`);return We(`${e.id}.${t.id} constant byteOffset`,c.byteOffset),new W({id:t.id,type:"uint32",size:i/4,isConstant:!0,value:new Uint32Array(c.buffer,c.byteOffset,i/Uint32Array.BYTES_PER_ELEMENT)})}const o=t.getBuffer(),r=t.byteOffset,a=t.getAccessor().stride||i;if(We(`${e.id}.${t.id} byteOffset`,r),We(`${e.id}.${t.id} stride`,a),!o)throw new Error(`Attribute group ${e.id} cannot interleave missing buffer ${t.id}`);return new W({id:t.id,type:"uint32",size:i/4,offset:r,stride:a,length:e.rowCount,buffer:o})}}function gs(n){return Math.ceil(n/4)*4}function We(n,e){if(e%4!==0)throw new Error(`Attribute buffer groups require 32-bit alignment: ${n}=${e}`)}function Mi(n){const{source:e,target:t,start:i=0,size:s,getData:o}=n,r=n.end||t.length,a=e.length,c=r-i;if(a>c){t.set(e.subarray(0,c),i);return}if(t.set(e,i),!o)return;let l=a;for(;l<c;){const u=o(l,e);for(let f=0;f<s;f++)t[i+l]=u[f]||0,l++}}function vf({source:n,target:e,size:t,getData:i,sourceStartIndices:s,targetStartIndices:o}){if(!s||!o)return Mi({source:n,target:e,size:t,getData:i}),e;let r=0,a=0;const c=i&&((u,f)=>i(u+a,f)),l=Math.min(s.length,o.length);for(let u=1;u<l;u++){const f=s[u]*t,d=o[u]*t;Mi({source:n.subarray(r,f),target:e,start:a,end:d,size:t,getData:c}),r=f,a=d}return a<e.length&&Mi({source:[],target:e,start:a,size:t,getData:c}),e}function bf(n){const{device:e,settings:t,value:i}=n,s=new or(e,t);return s.setData({value:i instanceof Float64Array?new Float64Array(0):new Float32Array(0),normalized:t.normalized}),s}function hr(n){switch(n){case 1:return"float";case 2:return"vec2";case 3:return"vec3";case 4:return"vec4";default:throw new Error(`No defined attribute type for size "${n}"`)}}function pr(n){switch(n){case 1:return"float32";case 2:return"float32x2";case 3:return"float32x3";case 4:return"float32x4";default:throw new Error("invalid type size")}}function gr(n){n.push(n.shift())}function xf(n,e){const{settings:t,value:i,size:s}=n,o=n.isDoublePrecisionBuffer?2:1;let r=0;const{shaderAttributes:a}=n.settings;if(a)for(const c of Object.values(a))r=Math.max(r,c.vertexOffset??0);return(t.noAlloc?i.length:(e+r)*s)*o}function mr({device:n,source:e,target:t}){return(!t||t.byteLength<e.byteLength)&&(t?.destroy(),t=n.createBuffer({byteLength:e.byteLength,usage:e.usage})),t}function yr({device:n,buffer:e,attribute:t,fromLength:i,toLength:s,fromStartIndices:o,getData:r=a=>a}){const a=t.isDoublePrecisionBuffer?2:1,c=t.size*a,l=t.byteOffset,u=t.settings.bytesPerElement<4?l/t.settings.bytesPerElement*4:l,f=t.startIndices,d=o&&f,h=t.isConstant;if(!d&&e&&i>=s)return e;const p=t.value instanceof Float64Array?Float32Array:t.value.constructor,g=h?t.value:new p(t.getBuffer().readSyncWebGL(l,s*p.BYTES_PER_ELEMENT).buffer);if(t.settings.normalized&&!h){const x=r;r=(w,T)=>t.normalizeConstant(x(w,T))}const y=h?(x,w)=>r(g,w):(x,w)=>r(g.subarray(x,x+c),w),b=e?new Float32Array(e.readSyncWebGL(u,i*4).buffer):new Float32Array(0),P=new Float32Array(s);return vf({source:b,target:P,sourceStartIndices:o,targetStartIndices:f,size:c,getData:y}),(!e||e.byteLength<P.byteLength+u)&&(e?.destroy(),e=n.createBuffer({byteLength:P.byteLength+u,usage:35050})),e.write(P,u),e}class _r{constructor({device:e,attribute:t,timeline:i}){this.buffers=[],this.currentLength=0,this.device=e,this.transition=new _n(i),this.attribute=t,this.attributeInTransition=bf(t),this.currentStartIndices=t.startIndices}get inProgress(){return this.transition.inProgress}start(e,t,i=1/0){this.settings=e,this.currentStartIndices=this.attribute.startIndices,this.currentLength=xf(this.attribute,t),this.transition.start({...e,duration:i})}update(){const e=this.transition.update();return e&&this.onUpdate(),e}setBuffer(e){const{stride:t}=this.attributeInTransition.getAccessor();this.attributeInTransition.setData({buffer:e,normalized:this.attribute.settings.normalized,value:this.attributeInTransition.value,stride:t})}cancel(){this.transition.cancel()}delete(){this.cancel();for(const e of this.buffers)e.destroy();this.buffers.length=0}}class Pf extends _r{constructor({device:e,attribute:t,timeline:i}){super({device:e,attribute:t,timeline:i}),this.type="interpolation",this.hasUpdated=!1,this.transform=Sf(e,t)}start(e,t){const i=this.currentLength,s=this.currentStartIndices;if(super.start(e,t,e.duration),e.duration<=0){this.transition.cancel();return}const{buffers:o,attribute:r}=this;this.hasUpdated&&gr(o),this.hasUpdated=!1,o[0]=yr({device:this.device,buffer:o[0],attribute:r,fromLength:i,toLength:this.currentLength,fromStartIndices:s,getData:e.enter}),o[1]=mr({device:this.device,source:o[0],target:o[1]}),this.setBuffer(o[1]);const{transform:a}=this,c=a.model;let l=Math.floor(this.currentLength/r.size);vr(r)&&(l/=2),c.setVertexCount(l),r.isConstant?(c.setAttributes({aFrom:o[0]}),c.setConstantAttributes({aTo:r.value})):c.setAttributes({aFrom:o[0],aTo:r.getBuffer()}),a.transformFeedback.setBuffers({vCurrent:o[1]})}onUpdate(){const{duration:e,easing:t}=this.settings,{time:i}=this.transition;let s=i/e;t&&(s=t(s));const{model:o}=this.transform,r={time:s};o.shaderInputs.setProps({interpolation:r}),this.transform.run({discard:!0}),this.hasUpdated=!0}delete(){super.delete(),this.transform.destroy()}}const wf=`layout(std140) uniform interpolationUniforms {
  float time;
} interpolation;
`,ms={name:"interpolation",vs:wf,uniformTypes:{time:"f32"}},Cf=`#version 300 es
#define SHADER_NAME interpolation-transition-vertex-shader

in ATTRIBUTE_TYPE aFrom;
in ATTRIBUTE_TYPE aTo;
out ATTRIBUTE_TYPE vCurrent;

void main(void) {
  vCurrent = mix(aFrom, aTo, interpolation.time);
  gl_Position = vec4(0.0);
}
`,Lf=`#version 300 es
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
`;function vr(n){return n.isDoublePrecisionBuffer}function Sf(n,e){const t=e.size,i=hr(t),s=pr(t),o=e.getBufferLayout();return vr(e)?new Ne(n,{vs:Lf,bufferLayout:[{name:"aFrom",byteStride:8*t,attributes:[{attribute:"aFrom",format:s,byteOffset:0},{attribute:"aFrom64Low",format:s,byteOffset:4*t}]},{name:"aTo",byteStride:8*t,attributes:[{attribute:"aTo",format:s,byteOffset:0},{attribute:"aTo64Low",format:s,byteOffset:4*t}]}],modules:[Oc,ms],defines:{ATTRIBUTE_TYPE:i,ATTRIBUTE_SIZE:t},moduleSettings:{},varyings:["vCurrent","vCurrent64Low"],bufferMode:35980,disableWarnings:!0}):new Ne(n,{vs:Cf,bufferLayout:[{name:"aFrom",format:s},{name:"aTo",format:o.attributes[0].format}],modules:[ms],defines:{ATTRIBUTE_TYPE:i},varyings:["vCurrent"],disableWarnings:!0})}class Af extends _r{constructor({device:e,attribute:t,timeline:i}){super({device:e,attribute:t,timeline:i}),this.type="spring",this.texture=Of(e),this.framebuffer=Rf(e,this.texture),this.transform=Bf(e,t)}start(e,t){const i=this.currentLength,s=this.currentStartIndices;super.start(e,t);const{buffers:o,attribute:r}=this;for(let c=0;c<2;c++)o[c]=yr({device:this.device,buffer:o[c],attribute:r,fromLength:i,toLength:this.currentLength,fromStartIndices:s,getData:e.enter});o[2]=mr({device:this.device,source:o[0],target:o[2]}),this.setBuffer(o[1]);const{model:a}=this.transform;a.setVertexCount(Math.floor(this.currentLength/r.size)),r.isConstant?a.setConstantAttributes({aTo:r.value}):a.setAttributes({aTo:r.getBuffer()})}onUpdate(){const{buffers:e,transform:t,framebuffer:i,transition:s}=this,o=this.settings;t.model.setAttributes({aPrev:e[0],aCur:e[1]}),t.transformFeedback.setBuffers({vNext:e[2]});const r={stiffness:o.stiffness,damping:o.damping};t.model.shaderInputs.setProps({spring:r}),t.run({framebuffer:i,discard:!1,parameters:{viewport:[0,0,1,1]},clearColor:[0,0,0,0]}),gr(e),this.setBuffer(e[1]),this.device.readPixelsToArrayWebGL(i)[0]>0||s.end()}delete(){super.delete(),this.transform.destroy(),this.texture.destroy(),this.framebuffer.destroy()}}const Tf=`layout(std140) uniform springUniforms {
  float damping;
  float stiffness;
} spring;
`,Ef={name:"spring",vs:Tf,uniformTypes:{damping:"f32",stiffness:"f32"}},If=`#version 300 es
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
`,Mf=`#version 300 es
#define SHADER_NAME spring-transition-is-transitioning-fragment-shader

in float vIsTransitioningFlag;

out vec4 fragColor;

void main(void) {
  if (vIsTransitioningFlag == 0.0) {
    discard;
  }
  fragColor = vec4(1.0);
}`;function Bf(n,e){const t=hr(e.size),i=pr(e.size);return new Ne(n,{vs:If,fs:Mf,bufferLayout:[{name:"aPrev",format:i},{name:"aCur",format:i},{name:"aTo",format:e.getBufferLayout().attributes[0].format}],varyings:["vNext"],modules:[Ef],defines:{ATTRIBUTE_TYPE:t},parameters:{depthCompare:"always",blendColorOperation:"max",blendColorSrcFactor:"one",blendColorDstFactor:"one",blendAlphaOperation:"max",blendAlphaSrcFactor:"one",blendAlphaDstFactor:"one"}})}function Of(n){return n.createTexture({data:new Uint8Array(4),format:"rgba8unorm",width:1,height:1})}function Rf(n,e){return n.createFramebuffer({id:"spring-transition-is-transitioning-framebuffer",width:1,height:1,colorAttachments:[e]})}const zf={interpolation:Pf,spring:Af};class Nf{constructor(e,{id:t,timeline:i}){if(!e)throw new Error("AttributeTransitionManager is constructed without device");this.id=t,this.device=e,this.timeline=i,this.transitions={},this.needsRedraw=!1,this.numInstances=1}finalize(){for(const e in this.transitions)this._removeTransition(e)}update({attributes:e,transitions:t,numInstances:i}){this.numInstances=i||1;for(const s in e){const o=e[s],r=o.getTransitionSetting(t);r&&this._updateAttribute(s,o,r)}for(const s in this.transitions){const o=e[s];(!o||!o.getTransitionSetting(t))&&this._removeTransition(s)}}hasAttribute(e){const t=this.transitions[e];return t&&t.inProgress}getAttributes(){const e={};for(const t in this.transitions){const i=this.transitions[t];i.inProgress&&(e[t]=i.attributeInTransition)}return e}run(){if(this.numInstances===0)return!1;for(const t in this.transitions)this.transitions[t].update()&&(this.needsRedraw=!0);const e=this.needsRedraw;return this.needsRedraw=!1,e}_removeTransition(e){this.transitions[e].delete(),delete this.transitions[e]}_updateAttribute(e,t,i){const s=this.transitions[e];let o=!s||s.type!==i.type;if(o){s&&this._removeTransition(e);const r=zf[i.type];r?this.transitions[e]=new r({attribute:t,timeline:this.timeline,device:this.device}):(Y.error(`unsupported transition type '${i.type}'`)(),o=!1)}(o||t.needsRedraw())&&(this.needsRedraw=!0,this.transitions[e].start(i,this.numInstances))}}const ys="attributeManager.invalidate",Ff="attributeManager.updateStart",Df="attributeManager.updateEnd",kf="attribute.updateStart",Uf="attribute.allocate",Vf="attribute.updateEnd";class jf{constructor(e,{id:t="attribute-manager",stats:i,timeline:s}={}){this.mergeBoundsMemoized=Ro(Oa),this.id=t,this.device=e,this.attributes={},this.updateTriggers={},this.needsRedraw=!0,this.userData={},this.stats=i,this.attributeTransitionManager=new Nf(e,{id:`${t}-transitions`,timeline:s}),this.attributeBufferGroups=e.type==="webgpu"?new _f(e,{id:t,isTransitionAttribute:o=>this.attributeTransitionManager.hasAttribute(o)}):null,Object.seal(this)}finalize(){this.attributeBufferGroups?.finalize();for(const e in this.attributes)this.attributes[e].delete();this.attributeTransitionManager.finalize()}getNeedsRedraw(e={clearRedrawFlags:!1}){const t=this.needsRedraw;return this.needsRedraw=this.needsRedraw&&!e.clearRedrawFlags,t&&this.id}setNeedsRedraw(){this.needsRedraw=!0}add(e){this._add(e)}addInstanced(e){this._add(e,{stepMode:"instance"})}remove(e){for(const t of e)this.attributes[t]!==void 0&&(this.attributes[t].delete(),delete this.attributes[t])}invalidate(e,t){const i=this._invalidateTrigger(e,t);oe(ys,this,e,i)}invalidateAll(e){for(const t in this.attributes)this.attributes[t].setNeedsUpdate(t,e);oe(ys,this,"all")}update({data:e,numInstances:t,startIndices:i=null,transitions:s,props:o={},buffers:r={},context:a={}}){let c=!1;oe(Ff,this),this.stats&&this.stats.get("Update Attributes").timeStart();for(const l in this.attributes){const u=this.attributes[l],f=u.settings.accessor;u.startIndices=i,u.numInstances=t,o[l]&&Y.removed(`props.${l}`,`data.attributes.${l}`)(),u.setExternalBuffer(r[l])||u.setBinaryValue(typeof f=="string"?r[f]:void 0,e.startIndices)||typeof f=="string"&&!r[f]&&u.setConstantValue(a,o[f])||u.needsUpdate()&&(c=!0,this._updateAttribute({attribute:u,numInstances:t,data:e,props:o,context:a})),this.needsRedraw=this.needsRedraw||u.needsRedraw()}c&&oe(Df,this,t),this.stats&&(this.stats.get("Update Attributes").timeEnd(),c&&this.stats.get("Attributes updated").incrementCount()),this.attributeTransitionManager.update({attributes:this.attributes,numInstances:t,transitions:s})}updateTransition(){const{attributeTransitionManager:e}=this,t=e.run();return this.needsRedraw=this.needsRedraw||t,t}getAttributes(){return{...this.attributes,...this.attributeTransitionManager.getAttributes()}}getBounds(e){const t=e.map(i=>this.attributes[i]?.getBounds());return this.mergeBoundsMemoized(t)}getChangedAttributes(e={clearChangedFlags:!1}){const{attributes:t,attributeTransitionManager:i}=this,s={...i.getAttributes()};for(const o in t){const r=t[o];r.needsRedraw(e)&&!i.hasAttribute(o)&&(s[o]=r)}return s}getBufferLayouts(e){return this.hasBufferGroups()?this.attributeBufferGroups.getBufferLayouts(this.getAttributes(),e):Object.values(this.getAttributes()).map(t=>t.getBufferLayout(e))}hasBufferGroups(){return!!this.attributeBufferGroups?.hasGroups(this.attributes)}getBufferGroupBindings(e,t,i={}){return this.attributeBufferGroups?this.attributeBufferGroups.getBindings(this.getAttributes(),e,t,i):{bufferLayouts:this.getBufferLayouts(t),buffers:{},groupedAttributeIds:new Set}}_add(e,t){for(const i in e){const s=e[i],o={...s,id:i,size:s.isIndexed&&1||s.size||1,...t};this.attributes[i]=new or(this.device,o)}this._mapUpdateTriggersToAttributes()}_mapUpdateTriggersToAttributes(){const e={};for(const t in this.attributes)this.attributes[t].getUpdateTriggers().forEach(s=>{e[s]||(e[s]=[]),e[s].push(t)});this.updateTriggers=e}_invalidateTrigger(e,t){const{attributes:i,updateTriggers:s}=this,o=s[e];return o&&o.forEach(r=>{const a=i[r];a&&a.setNeedsUpdate(a.id,t)}),o}_updateAttribute(e){const{attribute:t,numInstances:i}=e;if(oe(kf,t),t.constant){t.setConstantValue(e.context,t.value);return}t.allocate(i)&&oe(Uf,t,i),t.updateBuffer(e)&&(this.needsRedraw=!0,oe(Vf,t,i))}}class Gf extends _n{get value(){return this._value}_onUpdate(){const{time:e,settings:{fromValue:t,toValue:i,duration:s,easing:o}}=this,r=o(e/s);this._value=Ra(t,i,r)}}const _s=1e-5;function vs(n,e,t,i,s){const o=e-n,a=(t-e)*s,c=-o*i;return a+c+o+e}function $f(n,e,t,i,s){if(Array.isArray(t)){const o=[];for(let r=0;r<t.length;r++)o[r]=vs(n[r],e[r],t[r],i,s);return o}return vs(n,e,t,i,s)}function bs(n,e){if(Array.isArray(n)){let t=0;for(let i=0;i<n.length;i++){const s=n[i]-e[i];t+=s*s}return Math.sqrt(t)}return Math.abs(n-e)}class Wf extends _n{get value(){return this._currValue}_onUpdate(){const{fromValue:e,toValue:t,damping:i,stiffness:s}=this.settings,{_prevValue:o=e,_currValue:r=e}=this;let a=$f(o,r,t,i,s);const c=bs(a,t),l=bs(a,r);c<_s&&l<_s&&(a=t,this.end()),this._prevValue=r,this._currValue=a}}const Hf={interpolation:Gf,spring:Wf};class qf{constructor(e){this.transitions=new Map,this.timeline=e}get active(){return this.transitions.size>0}add(e,t,i,s){const{transitions:o}=this;if(o.has(e)){const c=o.get(e),{value:l=c.settings.fromValue}=c;t=l,this.remove(e)}if(s=sr(s),!s)return;const r=Hf[s.type];if(!r){Y.error(`unsupported transition type '${s.type}'`)();return}const a=new r(this.timeline);a.start({...s,fromValue:t,toValue:i}),o.set(e,a)}remove(e){const{transitions:t}=this;t.has(e)&&(t.get(e).cancel(),t.delete(e))}update(){const e={};for(const[t,i]of this.transitions)i.update(),e[t]=i.value,i.inProgress||this.remove(t);return e}clear(){for(const e of this.transitions.keys())this.remove(e)}}function Yf(n){const e=n[we];for(const t in e){const i=e[t],{validate:s}=i;if(s&&!s(n[t],i))throw new Error(`Invalid prop ${t}: ${n[t]}`)}}function Xf(n,e){const t=br({newProps:n,oldProps:e,propTypes:n[we],ignoreProps:{data:null,updateTriggers:null,extensions:null,transitions:null}}),i=Kf(n,e);let s=!1;return i||(s=Jf(n,e)),{dataChanged:i,propsChanged:t,updateTriggersChanged:s,extensionsChanged:Qf(n,e),transitionsChanged:Zf(n,e)}}function Zf(n,e){if(!n.transitions)return!1;const t={},i=n[we];let s=!1;for(const o in n.transitions){const r=i[o],a=r&&r.type;(a==="number"||a==="color"||a==="array")&&on(n[o],e[o],r)&&(t[o]=!0,s=!0)}return s?t:!1}function br({newProps:n,oldProps:e,ignoreProps:t={},propTypes:i={},triggerName:s="props"}){if(e===n)return!1;if(typeof n!="object"||n===null)return`${s} changed shallowly`;if(typeof e!="object"||e===null)return`${s} changed shallowly`;for(const o of Object.keys(n))if(!(o in t)){if(!(o in e))return`${s}.${o} added`;const r=on(n[o],e[o],i[o]);if(r)return`${s}.${o} ${r}`}for(const o of Object.keys(e))if(!(o in t)){if(!(o in n))return`${s}.${o} dropped`;if(!Object.hasOwnProperty.call(n,o)){const r=on(n[o],e[o],i[o]);if(r)return`${s}.${o} ${r}`}}return!1}function on(n,e,t){let i=t&&t.equal;return i&&!i(n,e,t)||!i&&(i=n&&e&&n.equals,i&&!i.call(n,e))?"changed deeply":!i&&e!==n?"changed shallowly":null}function Kf(n,e){if(e===null)return"oldProps is null, initial diff";let t=!1;const{dataComparator:i,_dataDiff:s}=n;return i?i(n.data,e.data)||(t="Data comparator detected a change"):n.data!==e.data&&(t="A new data container was supplied"),t&&s&&(t=s(n.data,e.data)||t),t}function Jf(n,e){if(e===null)return{all:!0};if("all"in n.updateTriggers&&xs(n,e,"all"))return{all:!0};const t={};let i=!1;for(const s in n.updateTriggers)s!=="all"&&xs(n,e,s)&&(t[s]=!0,i=!0);return i?t:!1}function Qf(n,e){if(e===null)return!0;const t=e.extensions,{extensions:i}=n;if(i===t)return!1;if(!t||!i||i.length!==t.length)return!0;for(let s=0;s<i.length;s++)if(!i[s].equals(t[s]))return!0;return!1}function xs(n,e,t){let i=n.updateTriggers[t];i=i??{};let s=e.updateTriggers[t];return s=s??{},br({oldProps:s,newProps:i,triggerName:t})}const ed="count(): argument not an object",td="count(): argument not a container";function id(n){if(!sd(n))throw new Error(ed);if(typeof n.count=="function")return n.count();if(Number.isFinite(n.size))return n.size;if(Number.isFinite(n.length))return n.length;if(nd(n))return Object.keys(n).length;throw new Error(td)}function nd(n){return n!==null&&typeof n=="object"&&n.constructor===Object}function sd(n){return n!==null&&typeof n=="object"}function Ps(n,e){if(!e)return n;const t={...n,...e};if("defines"in e&&(t.defines={...n.defines,...e.defines}),"modules"in e&&(t.modules=(n.modules||[]).concat(e.modules),e.modules.some(i=>i.name==="project64"))){const i=t.modules.findIndex(s=>s.name==="project32");i>=0&&t.modules.splice(i,1)}if("inject"in e)if(!n.inject)t.inject=e.inject;else{const i={...n.inject};for(const s in e.inject)i[s]=(i[s]||"")+e.inject[s];t.inject=i}return t}const od={minFilter:"linear",mipmapFilter:"linear",magFilter:"linear",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge"},rn={};function rd(n,e,t,i){if(t instanceof oi)return t;t.constructor&&t.constructor.name!=="Object"&&(t={data:t});let s=null;t.compressed&&(s={minFilter:"linear",mipmapFilter:t.data.length>1?"nearest":"linear"});const{width:o,height:r}=t.data,a=e.createTexture({...t,sampler:{...od,...s,...i},mipLevels:e.getMipLevelCount(o,r)});return e.type==="webgl"?a.generateMipmapsWebGL():e.type==="webgpu"&&e.generateMipmapsWebGPU(a),rn[a.id]=n,a}function ad(n,e){!e||!(e instanceof oi)||rn[e.id]===n&&(e.delete(),delete rn[e.id])}const cd={boolean:{validate(n,e){return!0},equal(n,e,t){return!!n==!!e}},number:{validate(n,e){return Number.isFinite(n)&&(!("max"in e)||n<=e.max)&&(!("min"in e)||n>=e.min)}},color:{validate(n,e){return e.optional&&!n||an(n)&&(n.length===3||n.length===4)},equal(n,e,t){return pt(n,e,1)}},accessor:{validate(n,e){const t=ei(n);return t==="function"||t===ei(e.value)},equal(n,e,t){return typeof e=="function"?!0:pt(n,e,1)}},array:{validate(n,e){return e.optional&&!n||an(n)},equal(n,e,t){const{compare:i}=t,s=Number.isInteger(i)?i:i?1:0;return i?pt(n,e,s):n===e}},object:{equal(n,e,t){if(t.ignore)return!0;const{compare:i}=t,s=Number.isInteger(i)?i:i?1:0;return i?pt(n,e,s):n===e}},function:{validate(n,e){return e.optional&&!n||typeof n=="function"},equal(n,e,t){return!t.compare&&t.ignore!==!1||n===e}},data:{transform:(n,e,t)=>{if(!n)return n;const{dataTransform:i}=t.props;return i?i(n):typeof n.shape=="string"&&n.shape.endsWith("-table")&&Array.isArray(n.data)?n.data:n}},image:{transform:(n,e,t)=>{const i=t.context;return!i||!i.device?null:rd(t.id,i.device,n,{...e.parameters,...t.props.textureParameters})},release:(n,e,t)=>{ad(t.id,n)}}};function ld(n){const e={},t={},i={};for(const[s,o]of Object.entries(n)){const r=o?.deprecatedFor;if(r)i[s]=Array.isArray(r)?r:[r];else{const a=ud(s,o);e[s]=a,t[s]=a.value}}return{propTypes:e,defaultProps:t,deprecatedProps:i}}function ud(n,e){switch(ei(e)){case"object":return He(n,e);case"array":return He(n,{type:"array",value:e,compare:!1});case"boolean":return He(n,{type:"boolean",value:e});case"number":return He(n,{type:"number",value:e});case"function":return He(n,{type:"function",value:e,compare:!0});default:return{name:n,type:"unknown",value:e}}}function He(n,e){return"type"in e?{name:n,...cd[e.type],...e}:"value"in e?{name:n,type:ei(e.value),...e}:{name:n,type:"object",value:e}}function an(n){return Array.isArray(n)||ArrayBuffer.isView(n)}function ei(n){return an(n)?"array":n===null?"null":typeof n}function fd(n,e){let t;for(let o=e.length-1;o>=0;o--){const r=e[o];"extensions"in r&&(t=r.extensions)}const i=cn(n.constructor,t),s=Object.create(i);s[Yt]=n,s[Se]={},s[xe]={};for(let o=0;o<e.length;++o){const r=e[o];for(const a in r)s[a]=r[a]}return Object.freeze(s),s}const dd="_mergedDefaultProps";function cn(n,e){if(!(n instanceof li.constructor))return{};let t=dd;if(e)for(const s of e){const o=s.constructor;o&&(t+=`:${o.extensionName||o.name}`)}const i=xr(n,t);return i||(n[t]=hd(n,e||[]))}function hd(n,e){if(!n.prototype)return null;const i=Object.getPrototypeOf(n),s=cn(i),o=xr(n,"defaultProps")||{},r=ld(o),a=Object.assign(Object.create(null),s,r.defaultProps),c=Object.assign(Object.create(null),s?.[we],r.propTypes),l=Object.assign(Object.create(null),s?.[yi],r.deprecatedProps);for(const u of e){const f=cn(u.constructor);f&&(Object.assign(a,f),Object.assign(c,f[we]),Object.assign(l,f[yi]))}return pd(a,n),md(a,c),gd(a,l),a[we]=c,a[yi]=l,e.length===0&&!Cn(n,"_propTypes")&&(n._propTypes=c),a}function pd(n,e){const t=_d(e);Object.defineProperties(n,{id:{writable:!0,value:t}})}function gd(n,e){for(const t in e)Object.defineProperty(n,t,{enumerable:!1,set(i){const s=`${this.id}: ${t}`;for(const o of e[t])Cn(this,o)||(this[o]=i);Y.deprecated(s,e[t].join("/"))()}})}function md(n,e){const t={},i={};for(const s in e){const o=e[s],{name:r,value:a}=o;o.async&&(t[r]=a,i[r]=yd(r))}n[Oe]=t,n[Se]={},Object.defineProperties(n,i)}function yd(n){return{enumerable:!0,set(e){typeof e=="string"||e instanceof Promise||ir(e)?this[Se][n]=e:this[xe][n]=e},get(){if(this[xe]){if(n in this[xe])return this[xe][n]||this[Oe][n];if(n in this[Se]){const e=this[Yt]&&this[Yt].internalState;if(e&&e.hasAsyncProp(n))return e.getAsyncProp(n)||this[Oe][n]}}return this[Oe][n]}}}function Cn(n,e){return Object.prototype.hasOwnProperty.call(n,e)}function xr(n,e){return Cn(n,e)&&n[e]}function _d(n){const e=n.componentName;return e||Y.warn(`${n.name}.componentName not specified`)(),e||n.name}let vd=0;class li{constructor(...e){this.props=fd(this,e),this.id=this.props.id,this.count=vd++}clone(e){const{props:t}=this,i={};for(const s in t[Oe])s in t[xe]?i[s]=t[xe][s]:s in t[Se]&&(i[s]=t[Se][s]);return new this.constructor({...t,...i,...e})}}li.componentName="Component";li.defaultProps={};const bd=Object.freeze({});class xd{constructor(e){this.component=e,this.asyncProps={},this.onAsyncPropUpdated=()=>{},this.oldProps=null,this.oldAsyncProps=null}finalize(){for(const e in this.asyncProps){const t=this.asyncProps[e];t&&t.type&&t.type.release&&t.type.release(t.resolvedValue,t.type,this.component)}this.asyncProps={},this.component=null,this.resetOldProps()}getOldProps(){return this.oldAsyncProps||this.oldProps||bd}resetOldProps(){this.oldAsyncProps=null,this.oldProps=this.component?this.component.props:null}hasAsyncProp(e){return e in this.asyncProps}getAsyncProp(e){const t=this.asyncProps[e];return t&&t.resolvedValue}isAsyncPropLoading(e){if(e){const t=this.asyncProps[e];return!!(t&&t.pendingLoadCount>0&&t.pendingLoadCount!==t.resolvedLoadCount)}for(const t in this.asyncProps)if(this.isAsyncPropLoading(t))return!0;return!1}reloadAsyncProp(e,t){this._watchPromise(e,Promise.resolve(t))}setAsyncProps(e){this.component=e[Yt]||this.component;const t=e[xe]||{},i=e[Se]||e,s=e[Oe]||{};for(const o in t){const r=t[o];this._createAsyncPropData(o,s[o]),this._updateAsyncProp(o,r),t[o]=this.getAsyncProp(o)}for(const o in i){const r=i[o];this._createAsyncPropData(o,s[o]),this._updateAsyncProp(o,r)}}_fetch(e,t){return null}_onResolve(e,t){}_onError(e,t){}_updateAsyncProp(e,t){if(this._didAsyncInputValueChange(e,t)){if(typeof t=="string"&&(t=this._fetch(e,t)),t instanceof Promise){this._watchPromise(e,t);return}if(ir(t)){this._resolveAsyncIterable(e,t);return}this._setPropValue(e,t)}}_freezeAsyncOldProps(){if(!this.oldAsyncProps&&this.oldProps){this.oldAsyncProps=Object.create(this.oldProps);for(const e in this.asyncProps)Object.defineProperty(this.oldAsyncProps,e,{enumerable:!0,value:this.oldProps[e]})}}_didAsyncInputValueChange(e,t){const i=this.asyncProps[e];return t===i.resolvedValue||t===i.lastValue?!1:(i.lastValue=t,!0)}_setPropValue(e,t){this._freezeAsyncOldProps();const i=this.asyncProps[e];i&&(t=this._postProcessValue(i,t),i.resolvedValue=t,i.pendingLoadCount++,i.resolvedLoadCount=i.pendingLoadCount)}_setAsyncPropValue(e,t,i){const s=this.asyncProps[e];s&&i>=s.resolvedLoadCount&&t!==void 0&&(this._freezeAsyncOldProps(),s.resolvedValue=t,s.resolvedLoadCount=i,this.onAsyncPropUpdated(e,t))}_watchPromise(e,t){const i=this.asyncProps[e];if(i){i.pendingLoadCount++;const s=i.pendingLoadCount;t.then(o=>{this.component&&(o=this._postProcessValue(i,o),this._setAsyncPropValue(e,o,s),this._onResolve(e,o))}).catch(o=>{this._onError(e,o)})}}async _resolveAsyncIterable(e,t){if(e!=="data"){this._setPropValue(e,t);return}const i=this.asyncProps[e];if(!i)return;i.pendingLoadCount++;const s=i.pendingLoadCount;let o=[],r=0;for await(const a of t){if(!this.component)return;const{dataTransform:c}=this.component.props;c?o=c(a,o):o=o.concat(a),Object.defineProperty(o,"__diff",{enumerable:!1,value:[{startRow:r,endRow:o.length}]}),r=o.length,this._setAsyncPropValue(e,o,s)}this._onResolve(e,o)}_postProcessValue(e,t){const i=e.type;return i&&this.component&&(i.release&&i.release(e.resolvedValue,i,this.component),i.transform)?i.transform(t,i,this.component):t}_createAsyncPropData(e,t){if(!this.asyncProps[e]){const s=this.component&&this.component.props[we];this.asyncProps[e]={type:s&&s[e],lastValue:null,resolvedValue:t,pendingLoadCount:0,resolvedLoadCount:0}}}}class Pd extends xd{constructor({attributeManager:e,layer:t}){super(t),this.attributeManager=e,this.needsRedraw=!0,this.needsUpdate=!0,this.subLayers=null,this.usesPickingColorCache=!1,this.disabledPickingIndices=[]}get layer(){return this.component}_fetch(e,t){const i=this.layer,s=i?.props.fetch;return s?s(t,{propName:e,layer:i}):super._fetch(e,t)}_onResolve(e,t){const i=this.layer;if(i){const s=i.props.onDataLoad;e==="data"&&s&&s(t,{propName:e,layer:i})}}_onError(e,t){const i=this.layer;i&&i.raiseError(t,`loading ${e} of ${this.layer}`)}}const wd="layer.changeFlag",Cd="layer.initialize",Ld="layer.update",Sd="layer.finalize",Ad="layer.matched",ws=2**24-1,Td=Object.freeze([]),Ed=Ro(({oldViewport:n,viewport:e})=>n.equals(e));let ae=new Uint8ClampedArray(0);function Cs(n){return n.rowIndexes||n.pickingColors||n.instancePickingColors}function Bi(n){return n.rowIndexes}function Oi(n){return n.pickingColors||n.instancePickingColors}const Id={data:{type:"data",value:Td,async:!0},dataComparator:{type:"function",value:null,optional:!0},_dataDiff:{type:"function",value:n=>n&&n.__diff,optional:!0},dataTransform:{type:"function",value:null,optional:!0},onDataLoad:{type:"function",value:null,optional:!0},onError:{type:"function",value:null,optional:!0},fetch:{type:"function",value:(n,{propName:e,layer:t,loaders:i,loadOptions:s,signal:o})=>{const{resourceManager:r}=t.context;s=s||t.getLoadOptions(),i=i||t.props.loaders,o&&(s={...s,core:{...s?.core,fetch:{...s?.core?.fetch,signal:o}}});let a=r.contains(n);return!a&&!s&&(r.add({resourceId:n,data:$i(n,i),persistent:!1}),a=!0),a?r.subscribe({resourceId:n,onChange:c=>t.internalState?.reloadAsyncProp(e,c),consumerId:t.id,requestId:e}):$i(n,i,s)}},updateTriggers:{},visible:!0,pickable:!1,opacity:{type:"number",min:0,max:1,value:1},operation:"draw",onHover:{type:"function",value:null,optional:!0},onClick:{type:"function",value:null,optional:!0},onDragStart:{type:"function",value:null,optional:!0},onDrag:{type:"function",value:null,optional:!0},onDragEnd:{type:"function",value:null,optional:!0},coordinateSystem:"default",coordinateOrigin:{type:"array",value:[0,0,0],compare:!0},modelMatrix:{type:"array",value:null,compare:!0,optional:!0},wrapLongitude:!1,positionFormat:"XYZ",colorFormat:"RGBA",parameters:{type:"object",value:{},optional:!0,compare:2},loadOptions:{type:"object",value:null,optional:!0,ignore:!0},transitions:null,extensions:[],loaders:{type:"array",value:[],optional:!0,ignore:!0},getPolygonOffset:{type:"function",value:({layerIndex:n})=>[0,-n*100]},highlightedObjectIndex:null,autoHighlight:!1,highlightColor:{type:"accessor",value:[0,0,128,128]}};class _e extends li{constructor(){super(...arguments),this.internalState=null,this.lifecycle=za.NO_STATE,this.parent=null}static get componentName(){return Object.prototype.hasOwnProperty.call(this,"layerName")?this.layerName:""}get root(){let e=this;for(;e.parent;)e=e.parent;return e}toString(){return`${this.constructor.layerName||this.constructor.name}({id: '${this.props.id}'})`}project(e){be(this.internalState);const t=this.internalState.viewport||this.context.viewport,i=bn(e,{viewport:t,modelMatrix:this.props.modelMatrix,coordinateOrigin:this.props.coordinateOrigin,coordinateSystem:this.props.coordinateSystem}),[s,o,r]=Na(i,t.pixelProjectionMatrix);return e.length===2?[s,o]:[s,o,r]}unproject(e){return be(this.internalState),(this.internalState.viewport||this.context.viewport).unproject(e)}projectPosition(e,t){be(this.internalState);const i=this.internalState.viewport||this.context.viewport;return rl(e,{viewport:i,modelMatrix:this.props.modelMatrix,coordinateOrigin:this.props.coordinateOrigin,coordinateSystem:this.props.coordinateSystem,...t})}get isComposite(){return!1}get isDrawable(){return!0}setState(e){this.setChangeFlags({stateChanged:!0}),Object.assign(this.state,e),this.setNeedsRedraw()}setNeedsRedraw(){this.internalState&&(this.internalState.needsRedraw=!0)}setNeedsUpdate(){this.internalState&&(this.context.layerManager.setNeedsUpdate(String(this)),this.internalState.needsUpdate=!0)}get isLoaded(){return this.internalState?!this.internalState.isAsyncPropLoading():!1}get wrapLongitude(){return this.props.wrapLongitude}isPickable(){return this.props.pickable&&this.props.visible}getModels(){const e=this.state;return e&&(e.models||e.model&&[e.model])||[]}setShaderModuleProps(...e){for(const t of this.getModels())t.shaderInputs.setProps(...e)}getAttributeManager(){return this.internalState&&this.internalState.attributeManager}getCurrentLayer(){return this.internalState&&this.internalState.layer}getLoadOptions(){return this.props.loadOptions}use64bitPositions(){const{coordinateSystem:e}=this.props;return e==="default"||e==="lnglat"||e==="cartesian"}onHover(e,t){return this.props.onHover&&this.props.onHover(e,t)||!1}onClick(e,t){return this.props.onClick&&this.props.onClick(e,t)||!1}nullPickingColor(){return[0,0,0]}encodePickingColor(e,t=[]){return t[0]=e+1&255,t[1]=e+1>>8&255,t[2]=e+1>>8>>8&255,t}decodePickingColor(e){be(e instanceof Uint8Array);const[t,i,s]=e;return t+i*256+s*65536-1}getNumInstances(){return Number.isFinite(this.props.numInstances)?this.props.numInstances:this.state&&this.state.numInstances!==void 0?this.state.numInstances:id(this.props.data)}getStartIndices(){return this.props.startIndices?this.props.startIndices:this.state&&this.state.startIndices?this.state.startIndices:null}getBounds(){return this.getAttributeManager()?.getBounds(["positions","instancePositions"])}getShaders(e){e=Ps(e,{disableWarnings:!0,modules:this.context.defaultShaderModules});for(const t of this.props.extensions)e=Ps(e,t.getShaders.call(this,t));return e}shouldUpdateState(e){return e.changeFlags.propsOrDataChanged}updateState(e){const t=this.getAttributeManager(),{dataChanged:i}=e.changeFlags;if(i&&t)if(Array.isArray(i))for(const s of i)t.invalidateAll(s);else t.invalidateAll();if(t){const{props:s}=e,o=this.internalState.hasPickingBuffer,r=Number.isInteger(s.highlightedObjectIndex)||!!s.pickable||s.extensions.some(a=>a.getNeedsPickingBuffer.call(this,a));if(o!==r){this.internalState.hasPickingBuffer=r;const a=Cs(t.attributes);a&&(r&&a.constant&&(a.constant=!1,t.invalidate(a.id)),!a.value&&!r&&(a.constant=!0,a.value=Bi(t.attributes)?[Kt]:[0,0,0]))}}}finalizeState(e){for(const i of this.getModels())i.destroy();const t=this.getAttributeManager();t&&t.finalize(),this.context&&this.context.resourceManager.unsubscribe({consumerId:this.id}),this.internalState&&(this.internalState.uniformTransitions.clear(),this.internalState.finalize())}draw(e){for(const t of this.getModels())t.draw(e.renderPass)}getPickingInfo({info:e,mode:t,sourceLayer:i}){const{index:s}=e;return s>=0&&Array.isArray(this.props.data)&&(e.object=this.props.data[s]),e}raiseError(e,t){t&&(e=new Error(`${t}: ${e.message}`,{cause:e})),this.props.onError?.(e)||this.context?.onError?.(e,this)}getNeedsRedraw(e={clearRedrawFlags:!1}){return this._getNeedsRedraw(e)}needsUpdate(){return this.internalState?this.internalState.needsUpdate||this.hasUniformTransition()||this.shouldUpdateState(this._getUpdateParams()):!1}hasUniformTransition(){return this.internalState?.uniformTransitions.active||!1}activateViewport(e){if(!this.internalState)return;const t=this.internalState.viewport;this.internalState.viewport=e,(!t||!Ed({oldViewport:t,viewport:e}))&&(this.setChangeFlags({viewportChanged:!0}),this.isComposite?this.needsUpdate()&&this.setNeedsUpdate():this._update())}invalidateAttribute(e="all"){const t=this.getAttributeManager();t&&(e==="all"?t.invalidateAll():t.invalidate(e))}updateAttributes(e){let t=!1;for(const i in e)e[i].layoutChanged()&&(t=!0);for(const i of this.getModels())this._setModelAttributes(i,e,t)}_updateAttributes(){const e=this.getAttributeManager();if(!e)return;const t=this.props,i=this.getNumInstances(),s=this.getStartIndices();e.update({data:t.data,numInstances:i,startIndices:s,props:t,transitions:t.transitions,buffers:t.data.attributes,context:this});const o=e.getChangedAttributes({clearChangedFlags:!0});this.updateAttributes(o)}_updateAttributeTransition(){const e=this.getAttributeManager();e&&e.updateTransition()}_updateUniformTransition(){const{uniformTransitions:e}=this.internalState;if(e.active){const t=e.update(),i=Object.create(this.props);for(const s in t)Object.defineProperty(i,s,{value:t[s]});return i}return this.props}calculateInstancePickingColors(e,{numInstances:t}){if(e.constant)return;const i=Math.floor(ae.length/4);this.internalState.usesPickingColorCache=!0;const s=t>0&&ae[0]===0;if(i<t||s){t>ws&&Y.warn("Layer has too many data objects. Picking might not be able to distinguish all objects.")(),ae=qt.allocate(ae,t,{size:4,copy:!0,maxCount:Math.max(t,ws)});const o=Math.floor(ae.length/4),r=[0,0,0],a=s?0:i;for(let c=a;c<o;c++)this.encodePickingColor(c,r),ae[c*4+0]=r[0],ae[c*4+1]=r[1],ae[c*4+2]=r[2],ae[c*4+3]=0}e.value=ae.subarray(0,t*4)}_setModelAttributes(e,t,i=!1){if(!Object.keys(t).length)return;const s=this.getAttributeManager();if(s?.hasBufferGroups()){this._setGroupedModelAttributes(e,s,t);return}if(i){const c=this.getAttributeManager();e.setBufferLayout(c.getBufferLayouts(e)),t=c.getAttributes()}const o=e.userData?.excludeAttributes||{},r={},a={};for(const c in t){if(o[c])continue;const l=t[c].getValue();for(const u in l){const f=l[u];f instanceof j?t[c].settings.isIndexed?e.setIndexBuffer(f):r[u]=f:f&&(a[u]=f)}}e.setAttributes(r),e.setConstantAttributes(a)}_setGroupedModelAttributes(e,t,i){const s=e.userData?.excludeAttributes||{},o=t.getBufferGroupBindings(i,e,s);e.setBufferLayout(o.bufferLayouts);const r={...o.buffers},a={},c=t.getAttributes();for(const l in c){if(s[l]||o.groupedAttributeIds.has(l))continue;const u=c[l],f=u.getValue();for(const d in f){const h=f[d];h instanceof j?u.settings.isIndexed?e.setIndexBuffer(h):r[d]=h:h&&(a[d]=h)}}e.setAttributes(r),e.setConstantAttributes(a)}disablePickingIndex(e){const t=this.props.data;if(!("attributes"in t)){this._disablePickingIndex(e);return}const i=this.getAttributeManager().attributes,s=Bi(i),o=Oi(i),r=s&&t.attributes&&t.attributes[s.id];if(r&&r.value){const c=r.value;for(let l=0;l<t.length;l++){const u=s.getVertexOffset(l);c[u]===e&&this._disablePickingIndex(l)}return}const a=o&&t.attributes&&t.attributes[o.id];if(a&&a.value){const c=a.value,l=this.encodePickingColor(e);for(let u=0;u<t.length;u++){const f=o.getVertexOffset(u);c[f]===l[0]&&c[f+1]===l[1]&&c[f+2]===l[2]&&this._disablePickingIndex(u)}}else this._disablePickingIndex(e)}_disablePickingIndex(e){const t=this.getAttributeManager().attributes,i=Bi(t);if(i){const a=i.getVertexOffset(e),c=i.getVertexOffset(e+1),l=new Uint32Array(c-a);l.fill(Kt),i.buffer.write(l,a*l.BYTES_PER_ELEMENT);return}const s=Oi(t);if(!s){this.internalState&&tl(this.internalState.disabledPickingIndices,e);return}const o=s.getVertexOffset(e),r=s.getVertexOffset(e+1);s.buffer.write(new Uint8Array(r-o),o)}restorePickingColors(){const e=this.getAttributeManager().attributes,t=Cs(e);if(!t){this.internalState&&(this.internalState.disabledPickingIndices.length=0);return}const i=Oi(e);this.internalState.usesPickingColorCache&&i&&i.value.buffer!==ae.buffer&&(i.value=ae.subarray(0,i.value.length)),t.updateSubBuffer({startOffset:0})}_initialize(){be(!this.internalState),oe(Cd,this);const e=this._getAttributeManager();this.internalState=new Pd({attributeManager:e,layer:this}),this._clearChangeFlags(),this.state={},Object.defineProperty(this.state,"attributeManager",{get:()=>(Y.deprecated("layer.state.attributeManager","layer.getAttributeManager()")(),e)}),this.internalState.uniformTransitions=new qf(this.context.timeline),this.internalState.onAsyncPropUpdated=this._onAsyncPropUpdated.bind(this),this.internalState.setAsyncProps(this.props),this.initializeState(this.context);for(const t of this.props.extensions)t.initializeState.call(this,this.context,t);this.setChangeFlags({dataChanged:"init",propsChanged:"init",viewportChanged:!0,extensionsChanged:!0}),this._update()}_transferState(e){oe(Ad,this,this===e);const{state:t,internalState:i}=e;this!==e&&(this.internalState=i,this.state=t,this.internalState.setAsyncProps(this.props),this._diffProps(this.props,this.internalState.getOldProps()))}_update(){const e=this.needsUpdate();if(oe(Ld,this,e),!e)return;this.context.stats.get("Layer updates").incrementCount();const t=this.props,i=this.context,s=this.internalState,o=i.viewport,r=this._updateUniformTransition();s.propsInTransition=r,i.viewport=s.viewport||o,this.props=r;try{const a=this._getUpdateParams(),c=this.getModels();if(i.device)this.updateState(a);else try{this.updateState(a)}catch{}for(const u of this.props.extensions)u.updateState.call(this,a,u);this.setNeedsRedraw(),this._updateAttributes();const l=this.getModels()[0]!==c[0];this._postUpdate(a,l)}finally{i.viewport=o,this.props=t,this._clearChangeFlags(),s.needsUpdate=!1,s.resetOldProps()}}_finalize(){oe(Sd,this),this.finalizeState(this.context);for(const e of this.props.extensions)e.finalizeState.call(this,this.context,e)}_drawLayer({renderPass:e,shaderModuleProps:t=null,uniforms:i={},parameters:s={}}){this._updateAttributeTransition();const o=this.props,r=this.context;this.props=this.internalState.propsInTransition||o;try{t&&this.setShaderModuleProps(t);const{getPolygonOffset:a}=this.props,c=a&&a(i)||[0,0];r.device instanceof _i&&r.device.setParametersWebGL({polygonOffset:c});const l=r.device instanceof _i?null:Md(s);if(Bd(this.getModels(),e,s,l),r.device instanceof _i)r.device.withParametersWebGL(s,()=>{const u={renderPass:e,shaderModuleProps:t,uniforms:i,parameters:s,context:r};for(const f of this.props.extensions)f.draw.call(this,u,f);this.draw(u)});else{l?.renderPassParameters&&e.setParameters(l.renderPassParameters);const u={renderPass:e,shaderModuleProps:t,uniforms:i,parameters:s,context:r};for(const f of this.props.extensions)f.draw.call(this,u,f);this.draw(u)}}finally{this.props=o}}getChangeFlags(){return this.internalState?.changeFlags}setChangeFlags(e){if(!this.internalState)return;const{changeFlags:t}=this.internalState;for(const s in e)if(e[s]){let o=!1;switch(s){case"dataChanged":const r=e[s],a=t[s];r&&Array.isArray(a)&&(t.dataChanged=Array.isArray(r)?a.concat(r):r,o=!0);default:t[s]||(t[s]=e[s],o=!0)}o&&oe(wd,this,s,e)}const i=!!(t.dataChanged||t.updateTriggersChanged||t.propsChanged||t.extensionsChanged);t.propsOrDataChanged=i,t.somethingChanged=i||t.viewportChanged||t.stateChanged}_clearChangeFlags(){this.internalState.changeFlags={dataChanged:!1,propsChanged:!1,updateTriggersChanged:!1,viewportChanged:!1,stateChanged:!1,extensionsChanged:!1,propsOrDataChanged:!1,somethingChanged:!1}}_diffProps(e,t){const i=Xf(e,t);if(i.updateTriggersChanged)for(const s in i.updateTriggersChanged)i.updateTriggersChanged[s]&&this.invalidateAttribute(s);if(i.transitionsChanged)for(const s in i.transitionsChanged)this.internalState.uniformTransitions.add(s,t[s],e[s],e.transitions?.[s]);return this.setChangeFlags(i)}validateProps(){Yf(this.props)}updateAutoHighlight(e){this.props.autoHighlight&&!Number.isInteger(this.props.highlightedObjectIndex)&&this._updateAutoHighlight(e)}_updateAutoHighlight(e){const t={highlightedObjectColor:e.picked?e.color:null},{highlightColor:i}=this.props;e.picked&&typeof i=="function"&&(t.highlightColor=i(e)),this.setShaderModuleProps({picking:t}),this.setNeedsRedraw()}_getAttributeManager(){const e=this.context;return new jf(e.device,{id:this.props.id,stats:e.stats,timeline:e.timeline})}_postUpdate(e,t){const{props:i,oldProps:s}=e,o=this.state.model;o?.isInstanced&&o.setInstanceCount(this.getNumInstances());const{autoHighlight:r,highlightedObjectIndex:a,highlightColor:c}=i;if(t||s.autoHighlight!==r||s.highlightedObjectIndex!==a||s.highlightColor!==c){const l={};Array.isArray(c)&&(l.highlightColor=c),(t||s.autoHighlight!==r||a!==s.highlightedObjectIndex)&&(l.highlightedObjectColor=Number.isFinite(a)&&a>=0?this.encodePickingColor(a):null),this.setShaderModuleProps({picking:l})}}_getUpdateParams(){return{props:this.props,oldProps:this.internalState.getOldProps(),context:this.context,changeFlags:this.internalState.changeFlags}}_getNeedsRedraw(e){if(!this.internalState)return!1;let t=!1;t=t||this.internalState.needsRedraw&&this.id;const i=this.getAttributeManager(),s=i?i.getNeedsRedraw(e):!1;if(t=t||s,t)for(const o of this.props.extensions)o.onNeedsRedraw.call(this,o);return this.internalState.needsRedraw=this.internalState.needsRedraw&&!e.clearRedrawFlags,t}_onAsyncPropUpdated(){this._diffProps(this.props,this.internalState.getOldProps()),this.setNeedsUpdate()}}_e.defaultProps=Id;_e.layerName="Layer";function Md(n){const{blendConstant:e,...t}=n;return e?{pipelineParameters:t,renderPassParameters:{blendConstant:e}}:{pipelineParameters:t}}function Bd(n,e,t,i){for(const s of n)s.device.type==="webgpu"?(Od(s,e),s.setParameters({...s.parameters,...i?.pipelineParameters})):s.setParameters(t)}function Od(n,e){const t=e.props.framebuffer||(e.framebuffer??null);if(!t)return;const i=t.colorAttachments.map(r=>r?.texture?.format??null),s=t.depthStencilAttachment?.texture?.format,o=n;(!Rd(o.props.colorAttachmentFormats,i)||o.props.depthStencilAttachmentFormat!==s)&&(o.props.colorAttachmentFormats=i,o.props.depthStencilAttachmentFormat=s,o._setPipelineNeedsUpdate("attachment formats"))}function Rd(n,e){if(n===e)return!0;if(!n||!e||n.length!==e.length)return!1;for(let t=0;t<n.length;t++)if(n[t]!==e[t])return!1;return!0}const zd="compositeLayer.renderLayers";class Te extends _e{get isComposite(){return!0}get isDrawable(){return!1}get isLoaded(){return super.isLoaded&&this.getSubLayers().every(e=>e.isLoaded)}getSubLayers(){return this.internalState&&this.internalState.subLayers||[]}initializeState(e){}setState(e){super.setState(e),this.setNeedsUpdate()}getPickingInfo({info:e}){const{object:t}=e;return t&&t.__source&&t.__source.parent&&t.__source.parent.id===this.id&&(e.object=t.__source.object,e.index=t.__source.index),e}filterSubLayer(e){return!0}shouldRenderSubLayer(e,t){return t&&t.length}getSubLayerClass(e,t){const{_subLayerProps:i}=this.props;return i&&i[e]&&i[e].type||t}getSubLayerRow(e,t,i){return e.__source={parent:this,object:t,index:i},e}getSubLayerAccessor(e){if(typeof e=="function"){const t={index:-1,data:this.props.data,target:[]};return(i,s)=>i&&i.__source?(t.index=i.__source.index,e(i.__source.object,t)):e(i,s)}return e}getSubLayerProps(e={}){const{opacity:t,pickable:i,visible:s,parameters:o,getPolygonOffset:r,highlightedObjectIndex:a,autoHighlight:c,highlightColor:l,coordinateSystem:u,coordinateOrigin:f,wrapLongitude:d,positionFormat:h,modelMatrix:p,extensions:g,fetch:y,operation:b,_subLayerProps:P}=this.props,x={id:"",updateTriggers:{},opacity:t,pickable:i,visible:s,parameters:o,getPolygonOffset:r,highlightedObjectIndex:a,autoHighlight:c,highlightColor:l,coordinateSystem:u,coordinateOrigin:f,wrapLongitude:d,positionFormat:h,modelMatrix:p,extensions:g,fetch:y,operation:b},w=P&&e.id&&P[e.id],T=w&&w.updateTriggers,E=e.id||"sublayer";if(w){const F=this.props[we],D=e.type?e.type._propTypes:{};for(const O in w){const B=D[O]||F[O];B&&B.type==="accessor"&&(w[O]=this.getSubLayerAccessor(w[O]))}}Object.assign(x,e,w),x.id=`${this.props.id}-${E}`,x.updateTriggers={all:this.props.updateTriggers?.all,...e.updateTriggers,...T};for(const F of g){const D=F.getSubLayerProps.call(this,F);D&&Object.assign(x,D,{updateTriggers:Object.assign(x.updateTriggers,D.updateTriggers)})}return x}_updateAutoHighlight(e){for(const t of this.getSubLayers())t.updateAutoHighlight(e)}_getAttributeManager(){return null}_postUpdate(e,t){let i=this.internalState.subLayers;const s=!i||this.needsUpdate();if(s){const o=this.renderLayers();i=zo(o,Boolean),this.internalState.subLayers=i}oe(zd,this,s,i);for(const o of i)o.parent=this}}Te.layerName="CompositeLayer";class Pr{constructor(e){this.indexStarts=[0],this.vertexStarts=[0],this.vertexCount=0,this.instanceCount=0;const{attributes:t={}}=e;this.typedArrayManager=qt,this.attributes={},this._attributeDefs=t,this.opts=e,this.updateGeometry(e)}updateGeometry(e){Object.assign(this.opts,e);const{data:t,buffers:i={},getGeometry:s,geometryBuffer:o,positionFormat:r,dataChanged:a,normalize:c=!0}=this.opts;if(this.data=t,this.getGeometry=s,this.positionSize=o&&o.size||(r==="XY"?2:3),this.buffers=i,this.normalize=c,o&&(be(t.startIndices),this.getGeometry=this.getGeometryFromBuffer(o),c||(i.vertexPositions=o)),this.geometryBuffer=i.vertexPositions,Array.isArray(a))for(const l of a)this._rebuildGeometry(l);else this._rebuildGeometry()}updatePartialGeometry({startRow:e,endRow:t}){this._rebuildGeometry({startRow:e,endRow:t})}getGeometryFromBuffer(e){const t=e.value||e;return ArrayBuffer.isView(t)?nr(t,{size:this.positionSize,offset:e.offset,stride:e.stride,startIndices:this.data.startIndices}):null}_allocate(e,t){const{attributes:i,buffers:s,_attributeDefs:o,typedArrayManager:r}=this;for(const a in o)if(a in s)r.release(i[a]),i[a]=null;else{const c=o[a];c.copy=t,i[a]=r.allocate(i[a],e,c)}}_forEachGeometry(e,t,i){const{data:s,getGeometry:o}=this,{iterable:r,objectInfo:a}=Ae(s,t,i);for(const c of r){a.index++;const l=o?o(c,a):null;e(l,a.index)}}_rebuildGeometry(e){if(!this.data)return;let{indexStarts:t,vertexStarts:i,instanceCount:s}=this;const{data:o,geometryBuffer:r}=this,{startRow:a=0,endRow:c=1/0}=e||{},l={};if(e||(t=[0],i=[0]),this.normalize||!r)this._forEachGeometry((f,d)=>{const h=f&&this.normalizeGeometry(f);l[d]=h,i[d+1]=i[d]+(h?this.getGeometrySize(h):0)},a,c),s=i[i.length-1];else if(i=o.startIndices,s=i[o.length]||0,ArrayBuffer.isView(r))s=s||r.length/this.positionSize;else if(r instanceof j){const f=this.positionSize*4;s=s||r.byteLength/f}else if(r.buffer){const f=r.stride||this.positionSize*4;s=s||r.buffer.byteLength/f}else if(r.value){const f=r.value,d=r.stride/f.BYTES_PER_ELEMENT||this.positionSize;s=s||f.length/d}this._allocate(s,!!e),this.indexStarts=t,this.vertexStarts=i,this.instanceCount=s;const u={};this._forEachGeometry((f,d)=>{const h=l[d]||f;u.vertexStart=i[d],u.indexStart=t[d];const p=d<i.length-1?i[d+1]:s;u.geometrySize=p-i[d],u.geometryIndex=d,this.updateGeometryAttributes(h,u)},a,c),this.vertexCount=t[t.length-1]}}const Ls=`layout(std140) uniform iconUniforms {
  float sizeScale;
  vec2 iconsTextureDim;
  float sizeBasis;
  float sizeMinPixels;
  float sizeMaxPixels;
  bool billboard;
  highp int sizeUnits;
  float alphaCutoff;
} icon;
`,Nd={name:"icon",vs:Ls,fs:Ls,uniformTypes:{sizeScale:"f32",iconsTextureDim:"vec2<f32>",sizeBasis:"f32",sizeMinPixels:"f32",sizeMaxPixels:"f32",billboard:"f32",sizeUnits:"i32",alphaCutoff:"f32"}},Fd=`#version 300 es
#define SHADER_NAME icon-layer-vertex-shader
in vec2 positions;
in vec3 instancePositions;
in vec3 instancePositions64Low;
in float instanceSizes;
in float instanceAngles;
in vec4 instanceColors;
#ifdef USE_ROW_INDEXES
in float rowIndexes;
#endif
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
#ifdef USE_ROW_INDEXES
geometry.pickingColor = picking_getPickingColorFromIndex(rowIndexes);
#else
geometry.pickingColor = picking_getPickingColorFromInstanceID();
#endif
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
`,Dd=`#version 300 es
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
`,kd=`struct IconUniforms {
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
  @builtin(instance_index) instanceIndex : u32,
  @location(0) positions: vec2<f32>,

  @location(1) instancePositions: vec3<f32>,
  @location(2) instancePositions64Low: vec3<f32>,
  @location(3) instanceSizes: f32,
  @location(4) instanceAngles: f32,
  @location(5) instanceColors: vec4<f32>,
  @location(6) instanceIconFrames: vec4<f32>,
  @location(7) instanceColorModes: f32,
  @location(8) instanceOffsets: vec2<f32>,
  @location(9) instancePixelOffset: vec2<f32>,
  PICKING_COLOR_ATTRIBUTE
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
  geometry.pickingColor = PICKING_COLOR_VALUE;

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
  outp.pickingColor = geometry.pickingColor;

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
`;function Ud(n){return kd.replace("PICKING_COLOR_ATTRIBUTE",n?"@location(10) rowIndexes: u32,":"").replace("PICKING_COLOR_VALUE",n?"picking_getPickingColorFromIndex(inp.rowIndexes)":"picking_getPickingColorFromIndex(inp.instanceIndex)")}const Vd=1024,jd=4,Ss=()=>{},As={minFilter:"linear",mipmapFilter:"linear",magFilter:"linear",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge"},Gd={x:0,y:0,width:0,height:0};function $d(n){return Math.pow(2,Math.ceil(Math.log2(n)))}function Wd(n,e,t,i){const s=Math.min(t/e.width,i/e.height),o=Math.floor(e.width*s),r=Math.floor(e.height*s);return s===1?{image:e,width:o,height:r}:(n.canvas.height=r,n.canvas.width=o,n.clearRect(0,0,o,r),n.drawImage(e,0,0,e.width,e.height,0,0,o,r),{image:n.canvas,width:o,height:r})}function ct(n){return n&&(n.id||n.url)}function wr(n){const{device:e}=n;e.type==="webgl"?n.generateMipmapsWebGL():e.type==="webgpu"&&e.generateMipmapsWebGPU(n)}function Hd(n,e,t,i){const{width:s,height:o,device:r}=n,a=r.createTexture({format:"rgba8unorm",width:e,height:t,sampler:i,mipLevels:r.getMipLevelCount(e,t)}),c=r.createCommandEncoder();c.copyTextureToTexture({sourceTexture:n,destinationTexture:a,width:s,height:o});const l=c.finish();return r.submit(l),wr(a),n.destroy(),a}function Ts(n,e,t){for(let i=0;i<e.length;i++){const{icon:s,xOffset:o}=e[i],r=ct(s);n[r]={...s,x:o,y:t}}}function qd({icons:n,buffer:e,mapping:t={},xOffset:i=0,yOffset:s=0,rowHeight:o=0,canvasWidth:r}){let a=[];for(let c=0;c<n.length;c++){const l=n[c],u=ct(l);if(!t[u]){const{height:f,width:d}=l;i+d+e>r&&(Ts(t,a,s),i=0,s=o+s+e,o=0,a=[]),a.push({icon:l,xOffset:i}),i=i+d+e,o=Math.max(o,f)}}return a.length>0&&Ts(t,a,s),{mapping:t,rowHeight:o,xOffset:i,yOffset:s,canvasWidth:r,canvasHeight:$d(o+s+e)}}function Yd(n,e,t){if(!n||!e)return null;t=t||{};const i={},{iterable:s,objectInfo:o}=Ae(n);for(const r of s){o.index++;const a=e(r,o),c=ct(a);if(!a)throw new Error("Icon is missing.");if(!a.url)throw new Error("Icon url is missing.");!i[c]&&(!t[c]||a.url!==t[c].url)&&(i[c]={...a,source:r,sourceIndex:o.index})}return i}class Xd{constructor(e,{onUpdate:t=Ss,onError:i=Ss}){this._loadOptions=null,this._texture=null,this._externalTexture=null,this._mapping={},this._samplerParameters=null,this._pendingCount=0,this._autoPacking=!1,this._xOffset=0,this._yOffset=0,this._rowHeight=0,this._buffer=jd,this._canvasWidth=Vd,this._canvasHeight=0,this._canvas=null,this.device=e,this.onUpdate=t,this.onError=i}finalize(){this._texture?.delete()}getTexture(){return this._texture||this._externalTexture}getIconMapping(e){const t=this._autoPacking?ct(e):e;return this._mapping[t]||Gd}setProps({loadOptions:e,autoPacking:t,iconAtlas:i,iconMapping:s,textureParameters:o}){e&&(this._loadOptions=e),t!==void 0&&(this._autoPacking=t),s&&(this._mapping=s),i&&(this._texture?.delete(),this._texture=null,this._externalTexture=i),o&&(this._samplerParameters=o)}get isLoaded(){return this._pendingCount===0}packIcons(e,t){if(!this._autoPacking||typeof document>"u")return;const i=Object.values(Yd(e,t,this._mapping)||{});if(i.length>0){const{mapping:s,xOffset:o,yOffset:r,rowHeight:a,canvasHeight:c}=qd({icons:i,buffer:this._buffer,canvasWidth:this._canvasWidth,mapping:this._mapping,rowHeight:this._rowHeight,xOffset:this._xOffset,yOffset:this._yOffset});this._rowHeight=a,this._mapping=s,this._xOffset=o,this._yOffset=r,this._canvasHeight=c,this._texture||(this._texture=this.device.createTexture({format:"rgba8unorm",data:null,width:this._canvasWidth,height:this._canvasHeight,sampler:this._samplerParameters||As,mipLevels:this.device.getMipLevelCount(this._canvasWidth,this._canvasHeight)})),this._texture.height!==this._canvasHeight&&(this._texture=Hd(this._texture,this._canvasWidth,this._canvasHeight,this._samplerParameters||As)),this.onUpdate(!0),this._canvas=this._canvas||document.createElement("canvas"),this._loadIcons(i)}}_loadIcons(e){const t=this._canvas.getContext("2d",{willReadFrequently:!0});for(const i of e)this._pendingCount++,$i(i.url,this._loadOptions).then(s=>{const o=ct(i),r=this._mapping[o],{x:a,y:c,width:l,height:u}=r,{image:f,width:d,height:h}=Wd(t,s,l,u),p=a+(l-d)/2,g=c+(u-h)/2;this._texture?.copyExternalImage({image:f,x:p,y:g,width:d,height:h}),r.x=p,r.y=g,r.width=d,r.height=h,this._texture&&wr(this._texture),this.onUpdate(d!==l||h!==u)}).catch(s=>{this.onError({url:i.url,source:i.source,sourceIndex:i.sourceIndex,loadOptions:this._loadOptions,error:s})}).finally(()=>{this._pendingCount--})}}const Cr=[0,0,0,255],Zd={iconAtlas:{type:"image",value:null,async:!0},iconMapping:{type:"object",value:{},async:!0},sizeScale:{type:"number",value:1,min:0},billboard:!0,sizeUnits:"pixels",sizeBasis:"height",sizeMinPixels:{type:"number",min:0,value:0},sizeMaxPixels:{type:"number",min:0,value:Number.MAX_SAFE_INTEGER},alphaCutoff:{type:"number",value:.05,min:0,max:1},getPosition:{type:"accessor",value:n=>n.position},getIcon:{type:"accessor",value:n=>n.icon},getColor:{type:"accessor",value:Cr},getSize:{type:"accessor",value:1},getAngle:{type:"accessor",value:0},getPixelOffset:{type:"accessor",value:[0,0]},onIconError:{type:"function",value:null,optional:!0},textureParameters:{type:"object",ignore:!0,value:null}};class ui extends _e{getShaders(){const e=!!this.props.data?.attributes?.rowIndexes;return super.getShaders({vs:Fd,fs:Dd,source:Ud(e),defines:e?{USE_ROW_INDEXES:!0}:{},modules:[Ue,ke,Ve,Nd]})}initializeState(){this.state={iconManager:new Xd(this.context.device,{onUpdate:this._onUpdate.bind(this),onError:this._onError.bind(this)})},this.getAttributeManager().addInstanced({instancePositions:{size:3,type:"float64",fp64:this.use64bitPositions(),transition:!0,accessor:"getPosition"},instanceSizes:{size:1,transition:!0,bufferGroup:"icon-instance-data",accessor:"getSize",defaultValue:1},instanceIconDefs:{size:7,bufferGroup:"icon-instance-data",accessor:"getIcon",transform:this.getInstanceIconDef,shaderAttributes:{instanceOffsets:{size:2,elementOffset:0},instanceIconFrames:{size:4,elementOffset:2},instanceColorModes:{size:1,elementOffset:6}}},instanceColors:{size:this.props.colorFormat.length,type:"unorm8",transition:!0,bufferGroup:"icon-instance-data",accessor:"getColor",defaultValue:Cr},instanceAngles:{size:1,transition:!0,bufferGroup:"icon-instance-data",accessor:"getAngle"},instancePixelOffset:{size:2,transition:!0,bufferGroup:"icon-instance-data",accessor:"getPixelOffset"},...this.props.data?.attributes?.rowIndexes?{rowIndexes:{size:1,type:"uint32",noAlloc:!0}}:{}})}updateState(e){super.updateState(e);const{props:t,oldProps:i,changeFlags:s}=e,o=this.getAttributeManager(),{iconAtlas:r,iconMapping:a,data:c,getIcon:l,textureParameters:u}=t,{iconManager:f}=this.state;if(typeof r=="string")return;const d=r||this.internalState.isAsyncPropLoading("iconAtlas");f.setProps({loadOptions:t.loadOptions,autoPacking:!d,iconAtlas:r,iconMapping:d?a:null,textureParameters:u}),d?i.iconMapping!==t.iconMapping&&o.invalidate("getIcon"):(s.dataChanged||s.updateTriggersChanged&&(s.updateTriggersChanged.all||s.updateTriggersChanged.getIcon))&&f.packIcons(c,l),s.extensionsChanged&&(this.state.model?.destroy(),this.state.model=this._getModel(),o.invalidateAll())}get isLoaded(){return super.isLoaded&&this.state.iconManager.isLoaded}finalizeState(e){super.finalizeState(e),this.state.iconManager.finalize()}draw({uniforms:e}){this._drawModel(this.state.model)}_drawModel(e){const{sizeScale:t,sizeBasis:i,sizeMinPixels:s,sizeMaxPixels:o,sizeUnits:r,billboard:a,alphaCutoff:c}=this.props,{iconManager:l}=this.state,u=l.getTexture();if(u){const f={iconsTexture:u,iconsTextureDim:[u.width,u.height],sizeUnits:st[r],sizeScale:t,sizeBasis:i==="height"?1:0,sizeMinPixels:s,sizeMaxPixels:o,billboard:a,alphaCutoff:c};e.shaderInputs.setProps({icon:f}),e.draw(this.context.renderPass)}}_getModel(e=this.props.id){const t=[-1,-1,1,-1,-1,1,1,1];return new re(this.context.device,{...this.getShaders(),id:e,bufferLayout:this.getAttributeManager().getBufferLayouts(),geometry:new pe({topology:"triangle-strip",attributes:{positions:{size:2,value:new Float32Array(t)}}}),isInstanced:!0})}_onUpdate(e){e?(this.getAttributeManager()?.invalidate("getIcon"),this.setNeedsUpdate()):this.setNeedsRedraw()}_onError(e){const t=this.getCurrentLayer()?.props.onIconError;t?t(e):Y.error(e.error.message)()}getInstanceIconDef(e){const{x:t,y:i,width:s,height:o,mask:r,anchorX:a=s/2,anchorY:c=o/2}=this.state.iconManager.getIconMapping(e);return[s/2-a,o/2-c,t,i,s,o,r?1:0]}}ui.defaultProps=Zd;ui.layerName="IconLayer";const Es=`layout(std140) uniform scatterplotUniforms {
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
`,Kd={name:"scatterplot",vs:Es,fs:Es,source:"",uniformTypes:{radiusScale:"f32",radiusMinPixels:"f32",radiusMaxPixels:"f32",lineWidthScale:"f32",lineWidthMinPixels:"f32",lineWidthMaxPixels:"f32",stroked:"f32",filled:"f32",antialiasing:"f32",billboard:"f32",radiusUnits:"i32",lineWidthUnits:"i32"}},Jd=`#version 300 es
#define SHADER_NAME scatterplot-layer-vertex-shader
in vec3 positions;
in vec3 instancePositions;
in vec3 instancePositions64Low;
in float instanceRadius;
in float instanceLineWidths;
in vec4 instanceFillColors;
in vec4 instanceLineColors;
#ifdef USE_ROW_INDEXES
in float rowIndexes;
#endif
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
#ifdef USE_ROW_INDEXES
geometry.pickingColor = picking_getPickingColorFromIndex(rowIndexes);
#else
geometry.pickingColor = picking_getPickingColorFromInstanceID();
#endif
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
`,Qd=`#version 300 es
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
`,eh=`// Main shaders

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

@group(0) @binding(0) var<uniform> scatterplot: ScatterplotUniforms;

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
  @location(7) instancePixelOffset: vec2<f32>,
  PICKING_COLOR_ATTRIBUTE
};

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) vFillColor: vec4<f32>,
  @location(1) vLineColor: vec4<f32>,
  @location(2) unitPosition: vec2<f32>,
  @location(3) innerUnitRadius: f32,
  @location(4) outerRadiusPixels: f32,
  @location(5) pickingColor: vec3<f32>,
  @location(6) clipCoordinates: vec2<f32>,
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
  // WGSL selects the second value when the condition is true, so keep the antialiased path second.
  let edgePadding = select(
    1.0,
    (varyings.outerRadiusPixels + SMOOTH_EDGE_RADIUS) / varyings.outerRadiusPixels,
    scatterplot.antialiasing != 0
  );

  // position on the containing square in [-1, 1] space
  varyings.unitPosition = edgePadding * attributes.positions.xy;
  geometry.uv = varyings.unitPosition;
  geometry.pickingColor = PICKING_COLOR_VALUE;

  varyings.innerUnitRadius = 1.0 - scatterplot.stroked * lineWidthPixels / varyings.outerRadiusPixels;

  if (scatterplot.billboard != 0) {
    let projectedPosition = project_position_to_clipspace_and_commonspace(
      attributes.instancePositions,
      attributes.instancePositions64Low,
      vec3<f32>(0.0)
    );
    geometry.position = projectedPosition.commonPosition;
    varyings.position = projectedPosition.clipPosition;
    // DECKGL_FILTER_GL_POSITION(varyings.position, geometry);
    var offset = edgePadding * attributes.positions * varyings.outerRadiusPixels;
    offset = vec3<f32>(offset.xy + attributes.instancePixelOffset, offset.z);
    // DECKGL_FILTER_SIZE(offset, geometry);
    let clipPixels = project_pixel_size_to_clipspace(offset.xy);
    varyings.position = vec4<f32>(varyings.position.x + clipPixels.x, varyings.position.y + clipPixels.y, varyings.position.z, varyings.position.w);
    geometry.position = vec4<f32>(
      geometry.position.xy + project_pixel_size_vec2(offset.xy),
      geometry.position.zw
    );
  } else {
    var offset = edgePadding * attributes.positions * project_pixel_size_float(varyings.outerRadiusPixels);
    offset = vec3<f32>(offset.xy + project_pixel_size_vec2(attributes.instancePixelOffset), offset.z);
    // DECKGL_FILTER_SIZE(offset, geometry);
    let projectedPosition = project_position_to_clipspace_and_commonspace(
      attributes.instancePositions,
      attributes.instancePositions64Low,
      offset
    );
    geometry.position = projectedPosition.commonPosition;
    varyings.position = projectedPosition.clipPosition;
    // DECKGL_FILTER_GL_POSITION(varyings.position, geometry);
  }

  varyings.clipCoordinates = geometry.position.xy;
  clip_filterPosition(&varyings.position, geometry.worldPosition.xy);

  // Apply opacity to instance color, or return instance picking color
  varyings.vFillColor = vec4<f32>(attributes.instanceFillColors.rgb, attributes.instanceFillColors.a * layer.opacity);
  // DECKGL_FILTER_COLOR(varyings.vFillColor, geometry);
  varyings.vLineColor = vec4<f32>(attributes.instanceLineColors.rgb, attributes.instanceLineColors.a * layer.opacity);
  // DECKGL_FILTER_COLOR(varyings.vLineColor, geometry);
  varyings.pickingColor = geometry.pickingColor;

  return varyings;
}

@fragment
fn fragmentMain(varyings: Varyings) -> @location(0) vec4<f32> {
  // var geometry: Geometry;
  // geometry.uv = unitPosition;

  let distToCenter = length(varyings.unitPosition) * varyings.outerRadiusPixels;
  let inCircle = select(
    step(distToCenter, varyings.outerRadiusPixels),
    smoothedge(distToCenter, varyings.outerRadiusPixels),
    scatterplot.antialiasing != 0
  );

  if (inCircle == 0.0) {
    discard;
  }

  var fragColor: vec4<f32>;

  if (scatterplot.stroked != 0) {
    let isLine = select(
      step(varyings.innerUnitRadius * varyings.outerRadiusPixels, distToCenter),
      smoothedge(varyings.innerUnitRadius * varyings.outerRadiusPixels, distToCenter),
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

  clip_filterColor(varyings.clipCoordinates);

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
`;function th(n){return eh.replace("PICKING_COLOR_ATTRIBUTE",n?"@location(8) rowIndexes: u32,":"").replace("PICKING_COLOR_VALUE",n?"picking_getPickingColorFromIndex(attributes.rowIndexes)":"picking_getPickingColorFromIndex(attributes.instanceIndex)")}const ln=0,Lr=1,ih=`struct ClipUniforms {
  enabled: i32,
  mode: i32,
  bounds: vec4<f32>,
};

@group(2) @binding(auto) var<uniform> clipUniforms: ClipUniforms;

fn clip_isInBounds(coordinates: vec2<f32>) -> bool {
  return coordinates.x >= clipUniforms.bounds.x &&
    coordinates.y >= clipUniforms.bounds.y &&
    coordinates.x < clipUniforms.bounds.z &&
    coordinates.y < clipUniforms.bounds.w;
}

fn clip_filterPosition(position: ptr<function, vec4<f32>>, instanceCoordinates: vec2<f32>) {
  if (
    clipUniforms.enabled != 0 &&
    clipUniforms.mode == ${Lr} &&
    !clip_isInBounds(instanceCoordinates)
  ) {
    *position = vec4<f32>(2.0, 2.0, 2.0, 1.0);
  }
}

fn clip_filterColor(geometryCoordinates: vec2<f32>) {
  if (
    clipUniforms.enabled != 0 &&
    clipUniforms.mode == ${ln} &&
    !clip_isInBounds(geometryCoordinates)
  ) {
    discard;
  }
}
`,Ln={name:"clip",source:ih,props:{},uniforms:{},bindingLayout:[{name:"clip",group:2}],uniformTypes:{enabled:"i32",mode:"i32",bounds:"vec4<f32>"},defaultUniforms:{enabled:0,mode:ln,bounds:[0,0,1,1]},getUniforms(n={}){const e={};return n.enabled!==void 0&&(e.enabled=n.enabled?1:0),n.mode!==void 0&&(e.mode=n.mode==="instance"?Lr:ln),n.bounds!==void 0&&(e.bounds=n.bounds),e}},Is=[0,0,0,255],nh={radiusUnits:"meters",radiusScale:{type:"number",min:0,value:1},radiusMinPixels:{type:"number",min:0,value:0},radiusMaxPixels:{type:"number",min:0,value:Number.MAX_SAFE_INTEGER},lineWidthUnits:"meters",lineWidthScale:{type:"number",min:0,value:1},lineWidthMinPixels:{type:"number",min:0,value:0},lineWidthMaxPixels:{type:"number",min:0,value:Number.MAX_SAFE_INTEGER},stroked:!1,filled:!0,billboard:!1,antialiasing:!0,getPosition:{type:"accessor",value:n=>n.position},getRadius:{type:"accessor",value:1},getFillColor:{type:"accessor",value:Is},getLineColor:{type:"accessor",value:Is},getLineWidth:{type:"accessor",value:1},getPixelOffset:{type:"accessor",value:[0,0]},strokeWidth:{deprecatedFor:"getLineWidth"},outline:{deprecatedFor:"stroked"},getColor:{deprecatedFor:["getFillColor","getLineColor"]}};class Sn extends _e{getShaders(){const e=!!this.props.data?.attributes?.rowIndexes;return super.getShaders({vs:Jd,fs:Qd,source:th(e),defines:e?{USE_ROW_INDEXES:!0}:{},modules:[Ue,ke,Ve,Kd,...this.context.device.type==="webgpu"?[Ln]:[]]})}initializeState(){const e=this.props.data?.attributes?.rowIndexes?{rowIndexes:{size:1,type:"uint32",noAlloc:!0}}:{};this.getAttributeManager().addInstanced({instancePositions:{size:3,type:"float64",fp64:this.use64bitPositions(),transition:!0,accessor:"getPosition"},instanceRadius:{size:1,transition:!0,accessor:"getRadius",defaultValue:1,bufferGroup:"scatterplot-instance-data"},instanceFillColors:{size:this.props.colorFormat.length,transition:!0,type:"unorm8",accessor:"getFillColor",defaultValue:[0,0,0,255],bufferGroup:"scatterplot-instance-data"},instanceLineColors:{size:this.props.colorFormat.length,transition:!0,type:"unorm8",accessor:"getLineColor",defaultValue:[0,0,0,255],bufferGroup:"scatterplot-instance-data"},instanceLineWidths:{size:1,transition:!0,accessor:"getLineWidth",defaultValue:1,bufferGroup:"scatterplot-instance-data"},instancePixelOffset:{size:2,transition:!0,accessor:"getPixelOffset",bufferGroup:"scatterplot-instance-data"},...e})}updateState(e){super.updateState(e),e.changeFlags.extensionsChanged&&(this.state.model?.destroy(),this.state.model=this._getModel(),this.getAttributeManager().invalidateAll())}draw({uniforms:e}){const{radiusUnits:t,radiusScale:i,radiusMinPixels:s,radiusMaxPixels:o,stroked:r,filled:a,billboard:c,antialiasing:l,lineWidthUnits:u,lineWidthScale:f,lineWidthMinPixels:d,lineWidthMaxPixels:h}=this.props,p={stroked:r,filled:a,billboard:c,antialiasing:l,radiusUnits:st[t],radiusScale:i,radiusMinPixels:s,radiusMaxPixels:o,lineWidthUnits:st[u],lineWidthScale:f,lineWidthMinPixels:d,lineWidthMaxPixels:h},g=this.state.model;g.shaderInputs.setProps({scatterplot:p}),g.draw(this.context.renderPass)}_getModel(){const e=[-1,-1,0,1,-1,0,-1,1,0,1,1,0];return new re(this.context.device,{...this.getShaders(),id:this.props.id,bufferLayout:this.getAttributeManager().getBufferLayouts(),geometry:new pe({topology:"triangle-strip",attributes:{positions:{size:3,value:new Float32Array(e)}}}),isInstanced:!0})}}Sn.defaultProps=nh;Sn.layerName="ScatterplotLayer";const Sr={CLOCKWISE:1,COUNTER_CLOCKWISE:-1};function Ar(n,e,t={}){return sh(n,t)!==e?(rh(n,t),!0):!1}function sh(n,e={}){return Math.sign(oh(n,e))}const Ms={x:0,y:1,z:2};function oh(n,e={}){const{start:t=0,end:i=n.length,plane:s="xy"}=e,o=e.size||2;let r=0;const a=Ms[s[0]],c=Ms[s[1]];for(let l=t,u=i-o;l<i;l+=o)r+=(n[l+a]-n[u+a])*(n[l+c]+n[u+c]),u=l;return r/2}function rh(n,e){const{start:t=0,end:i=n.length,size:s=2}=e,o=(i-t)/s,r=Math.floor(o/2);for(let a=0;a<r;++a){const c=t+a*s,l=t+(o-1-a)*s;for(let u=0;u<s;++u){const f=n[c+u];n[c+u]=n[l+u],n[l+u]=f}}}function ce(n,e){const t=e.length,i=n.length;if(i>0){let s=!0;for(let o=0;o<t;o++)if(n[i-t+o]!==e[o]){s=!1;break}if(s)return!1}for(let s=0;s<t;s++)n[i+s]=e[s];return!0}function un(n,e){const t=e.length;for(let i=0;i<t;i++)n[i]=e[i]}function lt(n,e,t,i,s=[]){const o=i+e*t;for(let r=0;r<t;r++)s[r]=n[o+r];return s}function fn(n,e,t,i,s=[]){let o,r;if(t&8)o=(i[3]-n[1])/(e[1]-n[1]),r=3;else if(t&4)o=(i[1]-n[1])/(e[1]-n[1]),r=1;else if(t&2)o=(i[2]-n[0])/(e[0]-n[0]),r=2;else if(t&1)o=(i[0]-n[0])/(e[0]-n[0]),r=0;else return null;for(let a=0;a<n.length;a++)s[a]=(r&1)===a?i[r]:o*(e[a]-n[a])+n[a];return s}function Ut(n,e){let t=0;return n[0]<e[0]?t|=1:n[0]>e[2]&&(t|=2),n[1]<e[1]?t|=4:n[1]>e[3]&&(t|=8),t}function Tr(n,e){const{size:t=2,broken:i=!1,gridResolution:s=10,gridOffset:o=[0,0],startIndex:r=0,endIndex:a=n.length}=e||{},c=(a-r)/t;let l=[];const u=[l],f=lt(n,0,t,r);let d,h;const p=Ir(f,s,o,[]),g=[];ce(l,f);for(let y=1;y<c;y++){for(d=lt(n,y,t,r,d),h=Ut(d,p);h;){fn(f,d,h,p,g);const b=Ut(g,p);b&&(fn(f,g,b,p,g),h=b),ce(l,g),un(f,g),ch(p,s,h),i&&l.length>t&&(l=[],u.push(l),ce(l,f)),h=Ut(d,p)}ce(l,d),un(f,d)}return i?u:u[0]}const Bs=0,ah=1;function Er(n,e=null,t){if(!n.length)return[];const{size:i=2,gridResolution:s=10,gridOffset:o=[0,0],edgeTypes:r=!1}=t||{},a=[],c=[{pos:n,types:r?new Array(n.length/i).fill(ah):null,holes:e||[]}],l=[[],[]];let u=[];for(;c.length;){const{pos:f,types:d,holes:h}=c.shift();lh(f,i,h[0]||f.length,l),u=Ir(l[0],s,o,u);const p=Ut(l[1],u);if(p){let g=Os(f,d,i,0,h[0]||f.length,u,p);const y={pos:g[0].pos,types:g[0].types,holes:[]},b={pos:g[1].pos,types:g[1].types,holes:[]};c.push(y,b);for(let P=0;P<h.length;P++)g=Os(f,d,i,h[P],h[P+1]||f.length,u,p),g[0]&&(y.holes.push(y.pos.length),y.pos=xt(y.pos,g[0].pos),r&&(y.types=xt(y.types,g[0].types))),g[1]&&(b.holes.push(b.pos.length),b.pos=xt(b.pos,g[1].pos),r&&(b.types=xt(b.types,g[1].types)))}else{const g={positions:f};r&&(g.edgeTypes=d),h.length&&(g.holeIndices=h),a.push(g)}}return a}function Os(n,e,t,i,s,o,r){const a=(s-i)/t,c=[],l=[],u=[],f=[],d=[];let h,p,g;const y=lt(n,a-1,t,i);let b=Math.sign(r&8?y[1]-o[3]:y[0]-o[2]),P=e&&e[a-1],x=0,w=0;for(let T=0;T<a;T++)h=lt(n,T,t,i,h),p=Math.sign(r&8?h[1]-o[3]:h[0]-o[2]),g=e&&e[i/t+T],p&&b&&b!==p&&(fn(y,h,r,o,d),ce(c,d)&&u.push(P),ce(l,d)&&f.push(P)),p<=0?(ce(c,h)&&u.push(g),x-=p):u.length&&(u[u.length-1]=Bs),p>=0?(ce(l,h)&&f.push(g),w+=p):f.length&&(f[f.length-1]=Bs),un(y,h),b=p,P=g;return[x?{pos:c,types:e&&u}:null,w?{pos:l,types:e&&f}:null]}function Ir(n,e,t,i){const s=Math.floor((n[0]-t[0])/e)*e+t[0],o=Math.floor((n[1]-t[1])/e)*e+t[1];return i[0]=s,i[1]=o,i[2]=s+e,i[3]=o+e,i}function ch(n,e,t){t&8?(n[1]+=e,n[3]+=e):t&4?(n[1]-=e,n[3]-=e):t&2?(n[0]+=e,n[2]+=e):t&1&&(n[0]-=e,n[2]-=e)}function lh(n,e,t,i){let s=1/0,o=-1/0,r=1/0,a=-1/0;for(let c=0;c<t;c+=e){const l=n[c],u=n[c+1];s=l<s?l:s,o=l>o?l:o,r=u<r?u:r,a=u>a?u:a}return i[0][0]=s,i[0][1]=r,i[1][0]=o,i[1][1]=a,i}function xt(n,e){for(let t=0;t<e.length;t++)n.push(e[t]);return n}const uh=85.051129;function fh(n,e){const{size:t=2,startIndex:i=0,endIndex:s=n.length,normalize:o=!0}=e||{},r=n.slice(i,s);Mr(r,t,0,s-i);const a=Tr(r,{size:t,broken:!0,gridResolution:360,gridOffset:[-180,-180]});if(o)for(const c of a)Br(c,t);return a}function dh(n,e=null,t){const{size:i=2,normalize:s=!0,edgeTypes:o=!1}=t||{};e=e||[];const r=[],a=[];let c=0,l=0;for(let f=0;f<=e.length;f++){const d=e[f]||n.length,h=l,p=hh(n,i,c,d);for(let g=p;g<d;g++)r[l++]=n[g];for(let g=c;g<p;g++)r[l++]=n[g];Mr(r,i,h,l),ph(r,i,h,l,t?.maxLatitude),c=d,a[f]=l}a.pop();const u=Er(r,a,{size:i,gridResolution:360,gridOffset:[-180,-180],edgeTypes:o});if(s)for(const f of u)Br(f.positions,i);return u}function hh(n,e,t,i){let s=-1,o=-1;for(let r=t+1;r<i;r+=e){const a=Math.abs(n[r]);a>s&&(s=a,o=r-1)}return o}function ph(n,e,t,i,s=uh){const o=n[t],r=n[i-e];if(Math.abs(o-r)>180){const a=lt(n,0,e,t);a[0]+=Math.round((r-o)/360)*360,ce(n,a),a[1]=Math.sign(a[1])*s,ce(n,a),a[0]=o,ce(n,a)}}function Mr(n,e,t,i){let s=n[0],o;for(let r=t;r<i;r+=e){o=n[r];const a=o-s;(a>180||a<-180)&&(o-=Math.round(a/360)*360),n[r]=s=o}}function Br(n,e){let t;const i=n.length/e;for(let o=0;o<i&&(t=n[o*e],(t+180)%360===0);o++);const s=-Math.round(t/360)*360;if(s!==0)for(let o=0;o<i;o++)n[o*e]+=s}function gh(n,e,t,i){let s;if(Array.isArray(n[0])){const o=n.length*e;s=new Array(o);for(let r=0;r<n.length;r++)for(let a=0;a<e;a++)s[r*e+a]=n[r][a]||0}else s=n;return t?Tr(s,{size:e,gridResolution:t}):i?fh(s,{size:e}):s}const mh=1,yh=2,qe=4;class _h extends Pr{constructor(e){super({...e,attributes:{positions:{size:3,padding:18,initialize:!0,type:e.fp64?Float64Array:Float32Array},segmentTypes:{size:1,type:e.isWebGPU?Float32Array:Uint8ClampedArray}}})}get(e){return this.attributes[e]}getPathSegmentIndices(e){const t=this.attributes.segmentTypes,i=this.vertexStarts[e],s=Math.min(this.vertexStarts[e+1]??this.instanceCount,this.instanceCount),o=[];for(let r=i;r<s-1;r++)(t[r]&qe)===0&&o.push(r);return o.length&&(t[i]&qe)!==0&&o.unshift(o.pop()),o}getGeometryFromBuffer(e){return this.normalize||this.opts.isWebGPU?super.getGeometryFromBuffer(e):null}normalizeGeometry(e){return this.normalize?gh(e,this.positionSize,this.opts.resolution,this.opts.wrapLongitude):e}getGeometrySize(e){if(Rs(e)){let i=0;for(const s of e)i+=this.getGeometrySize(s);return i}const t=this.getPathLength(e);return t<2?0:this.isClosed(e)?t<3?0:t+2:t}updateGeometryAttributes(e,t){if(t.geometrySize!==0)if(e&&Rs(e))for(const i of e){const s=this.getGeometrySize(i);t.geometrySize=s,this.updateGeometryAttributes(i,t),t.vertexStart+=s}else this._updateSegmentTypes(e,t),this._updatePositions(e,t)}_updateSegmentTypes(e,t){const i=this.attributes.segmentTypes,s=e?this.isClosed(e):!1,{vertexStart:o,geometrySize:r}=t;i.fill(0,o,o+r),s?(i[o]=qe,i[o+r-2]=qe):(i[o]+=mh,i[o+r-2]+=yh),i[o+r-1]=qe}_updatePositions(e,t){const{positions:i}=this.attributes;if(!i||!e)return;const{vertexStart:s,geometrySize:o}=t,r=new Array(3);for(let a=s,c=0;c<o;a++,c++)this.getPointOnPath(e,c,r),i[a*3]=r[0],i[a*3+1]=r[1],i[a*3+2]=r[2]}getPathLength(e){return e.length/this.positionSize}getPointOnPath(e,t,i=[]){const{positionSize:s}=this;t*s>=e.length&&(t+=1-e.length/s);const o=t*s;return i[0]=e[o],i[1]=e[o+1],i[2]=s===3&&e[o+2]||0,i}isClosed(e){if(!this.normalize)return!!this.opts.loop;const{positionSize:t}=this,i=e.length-t;return e[0]===e[i]&&e[1]===e[i+1]&&(t===2||e[2]===e[i+2])}}function Rs(n){return Array.isArray(n[0])}const vh=`struct PathUniforms {
  widthScale: f32,
  widthMinPixels: f32,
  widthMaxPixels: f32,
  jointType: f32,
  capType: f32,
  miterLimit: f32,
  billboard: f32,
  widthUnits: i32,
};

@group(0) @binding(auto)
var<uniform> path: PathUniforms;
`,zs=`layout(std140) uniform pathUniforms {
  float widthScale;
  float widthMinPixels;
  float widthMaxPixels;
  float jointType;
  float capType;
  float miterLimit;
  bool billboard;
  highp int widthUnits;
} path;
`,bh={name:"path",source:vh,vs:zs,fs:zs,uniformTypes:{widthScale:"f32",widthMinPixels:"f32",widthMaxPixels:"f32",jointType:"f32",capType:"f32",miterLimit:"f32",billboard:"f32",widthUnits:"i32"}},xh=`const EPSILON: f32 = 0.001;
const ZERO_OFFSET: vec3<f32> = vec3<f32>(0.0, 0.0, 0.0);

struct JoinResult {
  offset: vec3<f32>,
  cornerOffset: vec2<f32>,
  miterLength: f32,
  pathPosition: vec2<f32>,
  pathLength: f32,
  jointType: f32,
};

struct Attributes {
  @location(0) positions: vec2<f32>,
  @location(1) instanceTypes: f32,
  @location(2) instanceLeftPositions: vec3<f32>,
  @location(3) instanceStartPositions: vec3<f32>,
  @location(4) instanceEndPositions: vec3<f32>,
  @location(5) instanceRightPositions: vec3<f32>,
  @location(6) instanceLeftPositions64Low: vec3<f32>,
  @location(7) instanceStartPositions64Low: vec3<f32>,
  @location(8) instanceEndPositions64Low: vec3<f32>,
  @location(9) instanceRightPositions64Low: vec3<f32>,
  @location(10) instanceStrokeWidths: f32,
  @location(11) instanceColors: vec4<f32>,
  @location(12) rowIndexes: u32,
};

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) vColor: vec4<f32>,
  @location(1) vCornerOffset: vec2<f32>,
  @location(2) vMiterLength: f32,
  @location(3) vPathPosition: vec2<f32>,
  @location(4) vPathLength: f32,
  @location(5) vJointType: f32,
  // Location 6 is reserved for TripsLayer's injected vTime varying.
  @location(7) clipCoordinates: vec2<f32>,
#ifdef DASH_ENABLED
  @location(8) vPathBounds: vec2<f32>,
#endif
};

fn flipIfTrue(flag: bool) -> f32 {
  return select(1.0, -1.0, flag);
}

fn clipLine(position: vec4<f32>, refPosition: vec4<f32>) -> vec4<f32> {
  if (position.w < EPSILON) {
    let r = (EPSILON - refPosition.w) / (position.w - refPosition.w);
    return refPosition + (position - refPosition) * r;
  }
  return position;
}

#ifdef DASH_ENABLED
// Return the visible interval of the original segment before clipLine moves either endpoint.
fn getClippedPathRange(startW: f32, endW: f32) -> vec2<f32> {
  let startClipped = startW < EPSILON;
  let endClipped = endW < EPSILON;
  if (startClipped && endClipped) {
    return vec2<f32>(0.0, 0.0);
  }
  if (startClipped || endClipped) {
    let intersection = clamp((EPSILON - startW) / (endW - startW), 0.0, 1.0);
    if (startClipped) {
      return vec2<f32>(intersection, 1.0);
    }
    return vec2<f32>(0.0, intersection);
  }
  return vec2<f32>(0.0, 1.0);
}
#endif

fn getLineJoinOffset(
  prevPoint: vec3<f32>,
  currPoint: vec3<f32>,
  nextPoint: vec3<f32>,
  width: vec2<f32>,
#ifdef DASH_ENABLED
  sourcePathLength: f32,
  sourcePathRange: vec2<f32>,
#endif
#ifdef ANTIALIASING
  coverageScale: f32,
#endif
  positions: vec2<f32>,
  instanceTypes: f32
) -> JoinResult {
  let isEnd = positions.x > 0.0;
  let sideOfPath = positions.y;
  let isJoint = select(0.0, 1.0, sideOfPath == 0.0);

  var deltaA3 = currPoint - prevPoint;
  var deltaB3 = nextPoint - currPoint;

  let rotationResult = project_needs_rotation(currPoint);
  if (path.billboard == 0.0 && rotationResult.needsRotation) {
    deltaA3 = rotationResult.transform * deltaA3;
    deltaB3 = rotationResult.transform * deltaB3;
  }

  let deltaA = deltaA3.xy / width;
  let deltaB = deltaB3.xy / width;

  let lenA = length(deltaA);
  let lenB = length(deltaB);

  let dirA = select(vec2<f32>(0.0, 0.0), normalize(deltaA), lenA > 0.0);
  let dirB = select(vec2<f32>(0.0, 0.0), normalize(deltaB), lenB > 0.0);

  let perpA = vec2<f32>(-dirA.y, dirA.x);
  let perpB = vec2<f32>(-dirB.y, dirB.x);

  var tangent = dirA + dirB;
  tangent = select(perpA, normalize(tangent), length(tangent) > 0.0);
  let miterVec = vec2<f32>(-tangent.y, tangent.x);
  let dir = select(dirB, dirA, isEnd);
  let perp = select(perpB, perpA, isEnd);
#ifdef DASH_ENABLED
  let segmentLength2D = select(lenB, lenA, isEnd);

  // Extrusion happens in the XY plane, so segmentLength2D is a 2D length and pathPosition.y
  // below measures 2D distance along the segment. For a path that also moves in Z the true
  // arc length is longer by this ratio. Scaling pathLength and pathPosition.y by it makes
  // the coordinate measure real 3D distance while leaving the joint tests unchanged, since
  // they compare the two against each other and both are scaled alike. Billboard mode
  // extrudes in clip space, where the perspective divide has already reduced the segment to
  // its screen projection, so its complete common-space length is supplied by the caller.
  // Mirrors path-layer-vertex.glsl.ts.
  let currDelta3 = select(deltaB3, deltaA3, isEnd);
  let currLength2D = length(currDelta3.xy);
  // Do not clamp a valid denominator to EPSILON: high-zoom Web Mercator deltas are often
  // smaller than that in common space, and changing their scale corrupts even flat paths.
  let safeLength2D = select(1.0, currLength2D, currLength2D > 0.0);
  var arcLengthRatio = 1.0;
  var pathPositionOffset = 0.0;
  var pathLength = segmentLength2D;
  if (path.billboard != 0.0) {
    // clipLine may shorten the visible screen-space segment. Preserve the corresponding interval
    // of the complete common-space arclength instead of compressing the full dash period into the
    // visible span. Keep pathLength complete so justification is stable as the camera clips it.
    let visiblePathLength = sourcePathLength * (sourcePathRange.y - sourcePathRange.x);
    arcLengthRatio = 0.0;
    if (segmentLength2D > 0.0) {
      arcLengthRatio = visiblePathLength / segmentLength2D;
    }
    pathPositionOffset = sourcePathLength * sourcePathRange.x;
    pathLength = sourcePathLength;
  } else if (currLength2D > 0.0) {
    arcLengthRatio = length(currDelta3) / safeLength2D;
    pathLength = segmentLength2D * arcLengthRatio;
  }
#else
  let pathLength = select(lenB, lenA, isEnd);
#endif

  let sinHalfA = abs(dot(miterVec, perp));
  let cosHalfA = abs(dot(dirA, miterVec));
  let turnDirection = flipIfTrue(dirA.x * dirB.y >= dirA.y * dirB.x);
  let cornerPosition = sideOfPath * turnDirection;

  var miterSize = 1.0 / max(sinHalfA, EPSILON);
  miterSize = mix(
    min(miterSize, max(lenA, lenB) / max(cosHalfA, EPSILON)),
    miterSize,
    step(0.0, cornerPosition)
  );

  var offsetVec =
    mix(miterVec * miterSize, perp, step(0.5, cornerPosition)) *
    (sideOfPath + isJoint * turnDirection);

  let isStartCap = lenA == 0.0 || (!isEnd && (instanceTypes == 1.0 || instanceTypes == 3.0));
  let isEndCap = lenB == 0.0 || (isEnd && (instanceTypes == 2.0 || instanceTypes == 3.0));
  let isCap = isStartCap || isEndCap;

  var jointType = path.jointType;
  if (isCap) {
    offsetVec = mix(
      perp * sideOfPath,
      dir * path.capType * 4.0 * flipIfTrue(isStartCap),
      isJoint
    );
    jointType = path.capType;
  }

#ifdef ANTIALIASING
  let coverageOffsetVec = offsetVec * coverageScale;
  var miterLength = dot(coverageOffsetVec, miterVec * turnDirection);
#else
  var miterLength = dot(offsetVec, miterVec * turnDirection);
#endif
  miterLength = select(miterLength, isJoint, isCap);

#ifdef ANTIALIASING
  let offsetFromStartOfPath = coverageOffsetVec + deltaA * select(0.0, 1.0, isEnd);
#else
  let offsetFromStartOfPath = offsetVec + deltaA * select(0.0, 1.0, isEnd);
#endif
  let pathPosition = vec2<f32>(
    dot(offsetFromStartOfPath, perp),
#ifdef DASH_ENABLED
    pathPositionOffset + dot(offsetFromStartOfPath, dir) * arcLengthRatio
#else
    dot(offsetFromStartOfPath, dir)
#endif
  );
  let isValid = step(f32(instanceTypes), 3.5);
#ifdef ANTIALIASING
  var offset = vec3<f32>(coverageOffsetVec * width * isValid, 0.0);
#else
  var offset = vec3<f32>(offsetVec * width * isValid, 0.0);
#endif

  if (path.billboard == 0.0 && rotationResult.needsRotation) {
    offset = rotationResult.transform * offset;
  }

#ifdef ANTIALIASING
  return JoinResult(
    offset, coverageOffsetVec, miterLength, pathPosition, pathLength, jointType
  );
#else
  return JoinResult(offset, offsetVec, miterLength, pathPosition, pathLength, jointType);
#endif
}

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
  var varyings: Varyings;

  geometry.pickingColor = picking_getPickingColorFromIndex(attributes.rowIndexes);

  let isEnd = attributes.positions.x;

  let prevPosition = mix(attributes.instanceLeftPositions, attributes.instanceStartPositions, isEnd);
  let prevPosition64Low = mix(
    attributes.instanceLeftPositions64Low,
    attributes.instanceStartPositions64Low,
    isEnd
  );
  let currPosition = mix(attributes.instanceStartPositions, attributes.instanceEndPositions, isEnd);
  let currPosition64Low = mix(
    attributes.instanceStartPositions64Low,
    attributes.instanceEndPositions64Low,
    isEnd
  );
  let nextPosition = mix(attributes.instanceEndPositions, attributes.instanceRightPositions, isEnd);
  let nextPosition64Low = mix(
    attributes.instanceEndPositions64Low,
    attributes.instanceRightPositions64Low,
    isEnd
  );

  geometry.worldPosition = currPosition;

  let widthPixels =
    clamp(
      project_unit_size_to_pixel(attributes.instanceStrokeWidths * path.widthScale, path.widthUnits),
      path.widthMinPixels,
      path.widthMaxPixels
    ) / 2.0;

  if (path.billboard != 0.0) {
#ifdef DASH_ENABLED
    let prevProjection = project_position_to_clipspace_and_commonspace(
      prevPosition, prevPosition64Low, ZERO_OFFSET
    );
    let nextProjection = project_position_to_clipspace_and_commonspace(
      nextPosition, nextPosition64Low, ZERO_OFFSET
    );
    let prevPositionCommon = prevProjection.commonPosition.xyz;
    let nextPositionCommon = nextProjection.commonPosition.xyz;
    var prevPositionScreen = prevProjection.clipPosition;
    var nextPositionScreen = nextProjection.clipPosition;
#else
    var prevPositionScreen = project_position_to_clipspace(
      prevPosition, prevPosition64Low, ZERO_OFFSET
    );
    var nextPositionScreen = project_position_to_clipspace(
      nextPosition, nextPosition64Low, ZERO_OFFSET
    );
#endif
    let currProjection = project_position_to_clipspace_and_commonspace(
      currPosition, currPosition64Low, ZERO_OFFSET
    );
    geometry.position = currProjection.commonPosition;
    var currPositionScreen = currProjection.clipPosition;
#ifdef DASH_ENABLED
    let currPositionCommon = currProjection.commonPosition.xyz;
    let sourcePathStartScreen = mix(currPositionScreen, prevPositionScreen, isEnd);
    let sourcePathEndScreen = mix(nextPositionScreen, currPositionScreen, isEnd);
    let billboardPathRange = getClippedPathRange(
      sourcePathStartScreen.w, sourcePathEndScreen.w
    );
#endif

    prevPositionScreen = clipLine(prevPositionScreen, currPositionScreen);
    nextPositionScreen = clipLine(nextPositionScreen, currPositionScreen);
    currPositionScreen = clipLine(currPositionScreen, mix(nextPositionScreen, prevPositionScreen, isEnd));

#ifdef ANTIALIASING
    let coverageScale = select(
      1.0,
      (widthPixels + 0.5 / project.devicePixelRatio) / max(widthPixels, 1e-6),
      widthPixels > 0.0
    );
#endif
#ifdef DASH_ENABLED
    let currentDeltaCommon = select(
      nextPositionCommon - currPositionCommon,
      currPositionCommon - prevPositionCommon,
      isEnd > 0.0
    );
    let billboardPathLength = select(
      0.0,
      length(currentDeltaCommon) * project.scale / (widthPixels * project.focalDistance),
      widthPixels > 0.0
    );
#endif
    let join = getLineJoinOffset(
      prevPositionScreen.xyz / prevPositionScreen.w,
      currPositionScreen.xyz / currPositionScreen.w,
      nextPositionScreen.xyz / nextPositionScreen.w,
      project_pixel_size_to_clipspace(vec2<f32>(widthPixels, widthPixels)),
#ifdef DASH_ENABLED
      billboardPathLength,
      billboardPathRange,
#endif
#ifdef ANTIALIASING
      coverageScale,
#endif
      attributes.positions,
      attributes.instanceTypes
    );
#ifdef DASH_ENABLED
    // Phase and justification use the complete source segment, while cap and joint coverage
    // must still recognize the endpoints moved by clipLine.
    varyings.vPathBounds = billboardPathLength * billboardPathRange;
#endif

    geometry.uv = join.pathPosition;
    varyings.position = vec4<f32>(
      currPositionScreen.xyz + join.offset * currPositionScreen.w,
      currPositionScreen.w
    );
    varyings.vCornerOffset = join.cornerOffset;
    varyings.vMiterLength = join.miterLength;
    varyings.vPathPosition = join.pathPosition;
    varyings.vPathLength = join.pathLength;
    varyings.vJointType = join.jointType;
  } else {
    let prevPositionCommon = project_position_vec3_f64(prevPosition, prevPosition64Low);
    let currPositionCommon = project_position_vec3_f64(currPosition, currPosition64Low);
    let nextPositionCommon = project_position_vec3_f64(nextPosition, nextPosition64Low);

    let width = vec2<f32>(
      project_pixel_size_float(widthPixels),
      project_pixel_size_float(widthPixels)
    );
#ifdef ANTIALIASING
    let coverageScale = select(
      1.0,
      (widthPixels + 0.5 / project.devicePixelRatio) / max(widthPixels, 1e-6),
      widthPixels > 0.0
    );
#endif
    let join = getLineJoinOffset(
      prevPositionCommon,
      currPositionCommon,
      nextPositionCommon,
      width,
#ifdef DASH_ENABLED
      1.0,
      vec2<f32>(0.0, 1.0),
#endif
#ifdef ANTIALIASING
      coverageScale,
#endif
      attributes.positions,
      attributes.instanceTypes
    );
#ifdef DASH_ENABLED
    varyings.vPathBounds = vec2<f32>(0.0, join.pathLength);
#endif

    geometry.position = vec4<f32>(currPositionCommon + join.offset, 1.0);
    geometry.uv = join.pathPosition;
    varyings.position = project_common_position_to_clipspace(geometry.position);
    varyings.vCornerOffset = join.cornerOffset;
    varyings.vMiterLength = join.miterLength;
    varyings.vPathPosition = join.pathPosition;
    varyings.vPathLength = join.pathLength;
    varyings.vJointType = join.jointType;
  }

  varyings.clipCoordinates = geometry.position.xy;
  clip_filterPosition(&varyings.position, geometry.worldPosition.xy);

  varyings.vColor = vec4<f32>(
    attributes.instanceColors.rgb,
    attributes.instanceColors.a * layer.opacity
  );
  return varyings;
}

@fragment
fn fragmentMain(varyings: Varyings) -> @location(0) vec4<f32> {
  geometry.uv = varyings.vPathPosition;

#ifdef ANTIALIASING
  // Coordinates of the outer silhouette, in units of half-width: rounded joints and caps are
  // bounded by the corner offset, everywhere else by the edge of the stroke. Dividing by the
  // screen-space derivative converts the distance to the boundary into device pixels, which stays
  // correct under perspective foreshortening and under extensions that rescale the stroke.
#ifdef DASH_ENABLED
  let isCorner =
    varyings.vPathPosition.y < varyings.vPathBounds.x ||
    varyings.vPathPosition.y > varyings.vPathBounds.y;
#else
  let isCorner = varyings.vPathPosition.y < 0.0 || varyings.vPathPosition.y > varyings.vPathLength;
#endif
  let isRound = varyings.vJointType > 0.5;

  // Distance to the silhouette in device pixels, from the derivative of the coordinate that
  // bounds it. Computed before the discards below: derivatives need uniform control flow and are
  // undefined after a discard in the quad. See dev-docs/RFCs/v9.4/analytic-antialiasing-rfc.md
  let bodyCoord = abs(varyings.vPathPosition.x);
  let cornerCoord = length(varyings.vCornerOffset);
  // Both evaluated so each derivative stays on one field across the corner/body boundary
  let bodyPixels = (1.0 - bodyCoord) / max(fwidth(bodyCoord), 1e-6);
  let cornerPixels = (1.0 - cornerCoord) / max(fwidth(cornerCoord), 1e-6);
#ifdef PATH_STYLE_OFFSET
  // Rounded corners still intersect the stroke-width envelope. Extensions may remap
  // vPathPosition.x independently of vCornerOffset, as PathStyleExtension does for offsets.
  let edgePixels = select(bodyPixels, min(cornerPixels, bodyPixels), isRound && isCorner);
#else
  let edgePixels = select(bodyPixels, cornerPixels, isRound && isCorner);
#endif

  // Fragments outside the coverage ramp must not write depth or picking colors.
  if (edgePixels <= -SMOOTH_EDGE_RADIUS) {
    discard;
  }

  if (isCorner) {
    if (!isRound && varyings.vMiterLength > path.miterLimit + 1.0) {
      discard;
    }
  }

  var color = varyings.vColor;

  // Feather one device pixel across the width only, before premultiplication. edgePixels is a
  // signed device-pixel distance and SMOOTH_EDGE_RADIUS is 0.5, so this ramps across one pixel.
  color.a *= smoothedge(0.0, edgePixels);
#else
#ifdef DASH_ENABLED
  if (
    varyings.vPathPosition.y < varyings.vPathBounds.x ||
    varyings.vPathPosition.y > varyings.vPathBounds.y
  ) {
#else
  if (
    varyings.vPathPosition.y < 0.0 ||
    varyings.vPathPosition.y > varyings.vPathLength
  ) {
#endif
    if (varyings.vJointType > 0.5 && length(varyings.vCornerOffset) > 1.0) {
      discard;
    }
    if (
      varyings.vJointType < 0.5 &&
      varyings.vMiterLength > path.miterLimit + 1.0
    ) {
      discard;
    }
  }
#endif

  // Fragment-layer injections that discard pixels must run after analytic coverage derivatives.
  // See TripsLayer, which rejects fragments outside of the active time window at this anchor.
  // DECKGL_FILTER_COLOR
  clip_filterColor(varyings.clipCoordinates);
#ifdef ANTIALIASING
  return deckgl_premultiplied_alpha(color);
#else
  return deckgl_premultiplied_alpha(varyings.vColor);
#endif
}
`,Ph=`#version 300 es
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
in float rowIndexes;
uniform float opacity;
out vec4 vColor;
out vec2 vCornerOffset;
out float vMiterLength;
out vec2 vPathPosition;
out float vPathLength;
out float vJointType;
#ifdef DASH_ENABLED
out vec2 vPathBounds;
#endif
const float EPSILON = 0.001;
const vec3 ZERO_OFFSET = vec3(0.0);
float flipIfTrue(bool flag) {
return -(float(flag) * 2. - 1.);
}
vec3 getLineJoinOffset(
vec3 prevPoint, vec3 currPoint, vec3 nextPoint,
vec2 width
#ifdef DASH_ENABLED
, float sourcePathLength, vec2 sourcePathRange
#endif
#ifdef ANTIALIASING
, float coverageScale
#endif
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
#ifdef DASH_ENABLED
vec3 currDelta3 = isEnd ? deltaA3 : deltaB3;
float currLength2D = length(currDelta3.xy);
float arcLengthRatio = 1.0;
float pathPositionOffset = 0.0;
float pathLength = L;
if (path.billboard) {
float visiblePathLength = sourcePathLength * (sourcePathRange.y - sourcePathRange.x);
arcLengthRatio = L > 0.0 ? visiblePathLength / L : 0.0;
pathPositionOffset = sourcePathLength * sourcePathRange.x;
pathLength = sourcePathLength;
} else if (currLength2D > 0.0) {
arcLengthRatio = length(currDelta3) / currLength2D;
pathLength = L * arcLengthRatio;
}
#endif
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
#ifdef ANTIALIASING
vec2 coverageOffsetVec = offsetVec * coverageScale;
#ifdef DASH_ENABLED
vPathLength = pathLength;
#else
vPathLength = L;
#endif
vCornerOffset = coverageOffsetVec;
vMiterLength = dot(vCornerOffset, miterVec * turnDirection);
vMiterLength = isCap ? isJoint : vMiterLength;
vec2 offsetFromStartOfPath = coverageOffsetVec + deltaA * float(isEnd);
vPathPosition = vec2(
dot(offsetFromStartOfPath, perp),
#ifdef DASH_ENABLED
pathPositionOffset + dot(offsetFromStartOfPath, dir) * arcLengthRatio
#else
dot(offsetFromStartOfPath, dir)
#endif
);
geometry.uv = vPathPosition;
float isValid = step(instanceTypes, 3.5);
vec3 offset = vec3(coverageOffsetVec * width * isValid, 0.0);
#else
#ifdef DASH_ENABLED
vPathLength = pathLength;
#else
vPathLength = L;
#endif
vCornerOffset = offsetVec;
vMiterLength = dot(vCornerOffset, miterVec * turnDirection);
vMiterLength = isCap ? isJoint : vMiterLength;
vec2 offsetFromStartOfPath = vCornerOffset + deltaA * float(isEnd);
vPathPosition = vec2(
dot(offsetFromStartOfPath, perp),
#ifdef DASH_ENABLED
pathPositionOffset + dot(offsetFromStartOfPath, dir) * arcLengthRatio
#else
dot(offsetFromStartOfPath, dir)
#endif
);
geometry.uv = vPathPosition;
float isValid = step(instanceTypes, 3.5);
vec3 offset = vec3(offsetVec * width * isValid, 0.0);
#endif
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
#ifdef DASH_ENABLED
vec2 getClippedPathRange(float startW, float endW) {
bool startClipped = startW < EPSILON;
bool endClipped = endW < EPSILON;
if (startClipped && endClipped) {
return vec2(0.0);
}
if (startClipped || endClipped) {
float intersection = clamp((EPSILON - startW) / (endW - startW), 0.0, 1.0);
return startClipped ? vec2(intersection, 1.0) : vec2(0.0, intersection);
}
return vec2(0.0, 1.0);
}
#endif
void main() {
geometry.pickingColor = picking_getPickingColorFromIndex(rowIndexes);
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
#ifdef DASH_ENABLED
vec4 prevPositionCommon;
vec4 nextPositionCommon;
vec4 prevPositionScreen = project_position_to_clipspace(
prevPosition, prevPosition64Low, ZERO_OFFSET, prevPositionCommon
);
#else
vec4 prevPositionScreen = project_position_to_clipspace(
prevPosition, prevPosition64Low, ZERO_OFFSET
);
#endif
vec4 currPositionScreen = project_position_to_clipspace(currPosition, currPosition64Low, ZERO_OFFSET, geometry.position);
#ifdef DASH_ENABLED
vec4 nextPositionScreen = project_position_to_clipspace(
nextPosition, nextPosition64Low, ZERO_OFFSET, nextPositionCommon
);
#else
vec4 nextPositionScreen = project_position_to_clipspace(
nextPosition, nextPosition64Low, ZERO_OFFSET
);
#endif
#ifdef DASH_ENABLED
vec4 sourcePathStartScreen = mix(currPositionScreen, prevPositionScreen, isEnd);
vec4 sourcePathEndScreen = mix(nextPositionScreen, currPositionScreen, isEnd);
vec2 billboardPathRange = getClippedPathRange(
sourcePathStartScreen.w, sourcePathEndScreen.w
);
#endif
clipLine(prevPositionScreen, currPositionScreen);
clipLine(nextPositionScreen, currPositionScreen);
clipLine(currPositionScreen, mix(nextPositionScreen, prevPositionScreen, isEnd));
width = vec3(widthPixels, 0.0);
DECKGL_FILTER_SIZE(width, geometry);
#ifdef ANTIALIASING
vec2 coveragePadding = vec2(0.5 / project.devicePixelRatio);
float coverageScale = length(width.xy) > 0.0
? length(width.xy + coveragePadding) / length(width.xy)
: 1.0;
#endif
#ifdef DASH_ENABLED
vec3 currentDeltaCommon = isEnd > 0.0
? geometry.position.xyz - prevPositionCommon.xyz
: nextPositionCommon.xyz - geometry.position.xyz;
float billboardPathLength = width.x > 0.0
? length(currentDeltaCommon) * project.scale / (width.x * project.focalDistance)
: 0.0;
#endif
vec3 offset = getLineJoinOffset(
prevPositionScreen.xyz / prevPositionScreen.w,
currPositionScreen.xyz / currPositionScreen.w,
nextPositionScreen.xyz / nextPositionScreen.w,
project_pixel_size_to_clipspace(width.xy)
#ifdef DASH_ENABLED
,
billboardPathLength, billboardPathRange
#endif
#ifdef ANTIALIASING
,
coverageScale
#endif
);
#ifdef DASH_ENABLED
vPathBounds = billboardPathLength * billboardPathRange;
#endif
DECKGL_FILTER_GL_POSITION(currPositionScreen, geometry);
gl_Position = vec4(currPositionScreen.xyz + offset * currPositionScreen.w, currPositionScreen.w);
} else {
prevPosition = project_position(prevPosition, prevPosition64Low);
currPosition = project_position(currPosition, currPosition64Low);
nextPosition = project_position(nextPosition, nextPosition64Low);
width = vec3(project_pixel_size(widthPixels), 0.0);
DECKGL_FILTER_SIZE(width, geometry);
#ifdef ANTIALIASING
vec2 coveragePadding = project_pixel_size(vec2(0.5 / project.devicePixelRatio));
float coverageScale = length(width.xy) > 0.0
? length(width.xy + coveragePadding) / length(width.xy)
: 1.0;
#endif
vec3 offset = getLineJoinOffset(
prevPosition, currPosition, nextPosition, width.xy
#ifdef DASH_ENABLED
, 1.0, vec2(0.0, 1.0)
#endif
#ifdef ANTIALIASING
, coverageScale
#endif
);
#ifdef DASH_ENABLED
vPathBounds = vec2(0.0, vPathLength);
#endif
geometry.position = vec4(currPosition + offset, 1.0);
gl_Position = project_common_position_to_clipspace(geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
}
DECKGL_FILTER_COLOR(vColor, geometry);
}
`,wh=`#version 300 es
#define SHADER_NAME path-layer-fragment-shader
precision highp float;
in vec4 vColor;
in vec2 vCornerOffset;
in float vMiterLength;
in vec2 vPathPosition;
in float vPathLength;
in float vJointType;
#ifdef DASH_ENABLED
in vec2 vPathBounds;
#endif
out vec4 fragColor;
void main(void) {
geometry.uv = vPathPosition;
#ifdef ANTIALIASING
#ifdef DASH_ENABLED
bool isCorner = vPathPosition.y < vPathBounds.x || vPathPosition.y > vPathBounds.y;
#else
bool isCorner = vPathPosition.y < 0.0 || vPathPosition.y > vPathLength;
#endif
bool isRound = vJointType > 0.5;
float bodyCoord = abs(vPathPosition.x);
float cornerCoord = length(vCornerOffset);
float bodyPixels = (1.0 - bodyCoord) / max(fwidth(bodyCoord), 1e-6);
float cornerPixels = (1.0 - cornerCoord) / max(fwidth(cornerCoord), 1e-6);
#ifdef PATH_STYLE_OFFSET
float edgePixels = isRound && isCorner ? min(cornerPixels, bodyPixels) : bodyPixels;
#else
float edgePixels = isRound && isCorner ? cornerPixels : bodyPixels;
#endif
if (edgePixels <= -SMOOTH_EDGE_RADIUS) {
discard;
}
if (isCorner) {
if (!isRound && vMiterLength > path.miterLimit + 1.0) {
discard;
}
}
fragColor = vColor;
fragColor.a *= smoothedge(0.0, edgePixels);
#else
#ifdef DASH_ENABLED
if (vPathPosition.y < vPathBounds.x || vPathPosition.y > vPathBounds.y) {
#else
if (vPathPosition.y < 0.0 || vPathPosition.y > vPathLength) {
#endif
if (vJointType > 0.5 && length(vCornerOffset) > 1.0) {
discard;
}
if (vJointType < 0.5 && vMiterLength > path.miterLimit + 1.0) {
discard;
}
}
fragColor = vColor;
#endif
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`,Or=[0,0,0,255],Ch={widthUnits:"meters",widthScale:{type:"number",min:0,value:1},widthMinPixels:{type:"number",min:0,value:0},widthMaxPixels:{type:"number",min:0,value:Number.MAX_SAFE_INTEGER},jointRounded:!1,capRounded:!1,miterLimit:{type:"number",min:0,value:4},antialiasing:!1,billboard:!1,_pathType:null,getPath:{type:"accessor",value:n=>n.path},getColor:{type:"accessor",value:Or},getWidth:{type:"accessor",value:1},rounded:{deprecatedFor:["jointRounded","capRounded"]}},Ri={enter:(n,e)=>e.length?e.subarray(e.length-n.length):n};function Lh(n){if(n.isGeospatial)return null;const{unitsPerMeter:e}=n.distanceScales;return[e[0],e[1],e[2]]}function Ns(n,e){return n===e||!!(n&&e&&n.length===e.length&&n.every((t,i)=>t===e[i]))}class ht extends _e{getShaders(){const{antialiasing:e}=this.props;return super.getShaders({vs:Ph,fs:wh,source:xh,defines:e?{ANTIALIASING:1}:{},modules:[Ue,ke,Ve,bh,...this.context.device.type==="webgpu"?[Ln]:[]]})}get wrapLongitude(){return!1}getBounds(){return this.context.device.type==="webgpu"?null:this.getAttributeManager()?.getBounds(["vertexPositions"])}getPathProjectionScale(e){const t=this.props.coordinateSystem;if(!!!this.getAttributeManager()?.getAttributes().instanceDashOffsets)return null;if(e instanceof Wt&&e.zoom>=12&&(t==="default"||t==="lnglat"||t==="cartesian")){const r=Bo.getUniforms({viewport:e,coordinateSystem:t,coordinateOrigin:this.props.coordinateOrigin,autoWrapLongitude:this.wrapLongitude});return[e.projectionMode,r.coordinateOrigin[1],r.commonOrigin[1],...r.commonUnitsPerWorldUnit,...r.commonUnitsPerWorldUnit2,r.commonUnitsPerMeter[2]]}const o=Lh(e);return o?[e.projectionMode,...o]:[e.projectionMode]}shouldUpdateState(e){const{viewport:t}=this.context;return super.shouldUpdateState(e)||this.state?.tessellationResolution!==t.resolution||!Ns(this.state?.pathProjectionScale,this.getPathProjectionScale(t))}initializeState(){const t=this.context.device.type==="webgpu";this.getAttributeManager().addInstanced({...t?{pathPositions:{size:24,type:"float32",transition:!1,accessor:"getPath",update:this.calculateWebGPUPositions,shaderAttributes:{instanceLeftPositions:{size:3,elementOffset:0},instanceStartPositions:{size:3,elementOffset:3},instanceEndPositions:{size:3,elementOffset:6},instanceRightPositions:{size:3,elementOffset:9},instanceLeftPositions64Low:{size:3,elementOffset:12},instanceStartPositions64Low:{size:3,elementOffset:15},instanceEndPositions64Low:{size:3,elementOffset:18},instanceRightPositions64Low:{size:3,elementOffset:21}},noAlloc:!0}}:{vertexPositions:{size:3,vertexOffset:1,type:"float64",fp64:this.use64bitPositions(),transition:Ri,accessor:"getPath",update:this.calculatePositions,noAlloc:!0,shaderAttributes:{instanceLeftPositions:{vertexOffset:0},instanceStartPositions:{vertexOffset:1},instanceEndPositions:{vertexOffset:2},instanceRightPositions:{vertexOffset:3}}}},instanceTypes:{size:1,type:t?"float32":"uint8",update:this.calculateSegmentTypes,noAlloc:!0},instanceStrokeWidths:{size:1,accessor:"getWidth",transition:t?!1:Ri,defaultValue:1,bufferGroup:"path-instance-data"},instanceColors:{size:this.props.colorFormat.length,type:"unorm8",accessor:"getColor",transition:t?!1:Ri,defaultValue:Or,bufferGroup:"path-instance-data"},rowIndexes:{size:1,type:"uint32",accessor:(s,{index:o})=>s&&s.__source?s.__source.index:o,bufferGroup:"path-instance-data"}}),this.setState({pathTesselator:new _h({fp64:this.use64bitPositions(),isWebGPU:t}),tessellationResolution:this.context.viewport.resolution,pathProjectionScale:this.getPathProjectionScale(this.context.viewport)})}updateState(e){super.updateState(e);const{props:t,oldProps:i,changeFlags:s}=e,o=this.getAttributeManager(),{viewport:r}=this.context,a=this.state.tessellationResolution!==r.resolution,c=this.getPathProjectionScale(r),l=!Ns(this.state.pathProjectionScale,c),f=s.updateTriggersChanged&&(s.updateTriggersChanged.all||s.updateTriggersChanged.getPath)||t._pathType!==i._pathType||t.positionFormat!==i.positionFormat||t.wrapLongitude!==i.wrapLongitude||a;if(s.dataChanged||f){const{pathTesselator:h}=this.state,p=t.data.attributes||{};h.updateGeometry({data:t.data,geometryBuffer:p.getPath,buffers:p,normalize:!t._pathType,loop:t._pathType==="loop",getGeometry:t.getPath,positionFormat:t.positionFormat,wrapLongitude:t.wrapLongitude,resolution:r.resolution,dataChanged:f?void 0:s.dataChanged}),this.setState({numInstances:h.instanceCount,startIndices:h.vertexStarts,tessellationResolution:r.resolution,pathProjectionScale:c}),!s.dataChanged||f?o.invalidateAll():l&&o.invalidate("instanceDashOffsets")}else l&&(this.setState({pathProjectionScale:c}),o.invalidate("instanceDashOffsets"));(s.extensionsChanged||t.antialiasing!==i.antialiasing)&&(this.state.model?.destroy(),this.state.model=this._getModel(),o.invalidateAll())}getPickingInfo(e){const t=super.getPickingInfo(e),{index:i}=t,s=this.props.data;return s[0]&&s[0].__source&&(t.object=s.find(o=>o.__source.index===i)),t}disablePickingIndex(e){const t=this.props.data;if(t[0]&&t[0].__source)for(let i=0;i<t.length;i++)t[i].__source.index===e&&this._disablePickingIndex(i);else super.disablePickingIndex(e)}draw({uniforms:e}){const{jointRounded:t,capRounded:i,billboard:s,miterLimit:o,widthUnits:r,widthScale:a,widthMinPixels:c,widthMaxPixels:l}=this.props,u=this.state.model,f={jointType:Number(t),capType:Number(i),billboard:s,widthUnits:st[r],widthScale:a,miterLimit:o,widthMinPixels:c,widthMaxPixels:l};u.shaderInputs.setProps({path:f}),u.draw(this.context.renderPass)}_getModel(){const e=[0,1,2,1,4,2,1,3,4,3,5,4],t=[0,0,0,-1,0,1,1,-1,1,1,1,0];return new re(this.context.device,{...this.getShaders(),id:this.props.id,bufferLayout:this.getAttributeManager().getBufferLayouts(),geometry:new pe({topology:"triangle-list",attributes:{indices:new Uint16Array(e),positions:{value:new Float32Array(t),size:2}}}),isInstanced:!0})}calculatePositions(e){const{pathTesselator:t}=this.state;e.startIndices=t.vertexStarts,e.value=t.get("positions")}calculateSegmentTypes(e){const{pathTesselator:t}=this.state;e.startIndices=t.vertexStarts,e.value=t.get("segmentTypes")}calculateWebGPUPositions(e){const{pathTesselator:t}=this.state,i=t.get("positions");if(!i){e.value=null;return}const s=t.instanceCount,o=new Float32Array(s*24),r=[-1,0,1,2];for(let a=0;a<s;a++){const c=a*24;for(let l=0;l<4;l++){const u=a+r[l],f=c+l*3;for(let d=0;d<3;d++){const h=u>=0&&u<s?i[u*3+d]:0,p=Math.fround(h);o[f+d]=p,o[f+d+12]=h-p}}}e.startIndices=t.vertexStarts,e.value=o}}ht.defaultProps=Ch;ht.layerName="PathLayer";var Pt={exports:{}},Fs;function Sh(){if(Fs)return Pt.exports;Fs=1,Pt.exports=n,Pt.exports.default=n;function n(m,v,_){_=_||2;var C=v&&v.length,L=C?v[0]*_:m.length,S=e(m,0,L,_,!0),A=[];if(!S||S.next===S.prev)return A;var I,N,z,H,G,k,J;if(C&&(S=c(m,v,S,_)),m.length>80*_){I=z=m[0],N=H=m[1];for(var $=_;$<L;$+=_)G=m[$],k=m[$+1],G<I&&(I=G),k<N&&(N=k),G>z&&(z=G),k>H&&(H=k);J=Math.max(z-I,H-N),J=J!==0?32767/J:0}return i(S,A,_,I,N,J,0),A}function e(m,v,_,C,L){var S,A;if(L===ie(m,v,_,C)>0)for(S=v;S<_;S+=C)A=X(S,m[S],m[S+1],A);else for(S=_-C;S>=v;S-=C)A=X(S,m[S],m[S+1],A);return A&&w(A,A.next)&&(q(A),A=A.next),A}function t(m,v){if(!m)return m;v||(v=m);var _=m,C;do if(C=!1,!_.steiner&&(w(_,_.next)||x(_.prev,_,_.next)===0)){if(q(_),_=v=_.prev,_===_.next)break;C=!0}else _=_.next;while(C||_!==v);return v}function i(m,v,_,C,L,S,A){if(m){!A&&S&&h(m,C,L,S);for(var I=m,N,z;m.prev!==m.next;){if(N=m.prev,z=m.next,S?o(m,C,L,S):s(m)){v.push(N.i/_|0),v.push(m.i/_|0),v.push(z.i/_|0),q(m),m=z.next,I=z.next;continue}if(m=z,m===I){A?A===1?(m=r(t(m),v,_),i(m,v,_,C,L,S,2)):A===2&&a(m,v,_,C,L,S):i(t(m),v,_,C,L,S,1);break}}}}function s(m){var v=m.prev,_=m,C=m.next;if(x(v,_,C)>=0)return!1;for(var L=v.x,S=_.x,A=C.x,I=v.y,N=_.y,z=C.y,H=L<S?L<A?L:A:S<A?S:A,G=I<N?I<z?I:z:N<z?N:z,k=L>S?L>A?L:A:S>A?S:A,J=I>N?I>z?I:z:N>z?N:z,$=C.next;$!==v;){if($.x>=H&&$.x<=k&&$.y>=G&&$.y<=J&&b(L,I,S,N,A,z,$.x,$.y)&&x($.prev,$,$.next)>=0)return!1;$=$.next}return!0}function o(m,v,_,C){var L=m.prev,S=m,A=m.next;if(x(L,S,A)>=0)return!1;for(var I=L.x,N=S.x,z=A.x,H=L.y,G=S.y,k=A.y,J=I<N?I<z?I:z:N<z?N:z,$=H<G?H<k?H:k:G<k?G:k,je=I>N?I>z?I:z:N>z?N:z,Ge=H>G?H>k?H:k:G>k?G:k,Un=g(J,$,v,_,C),Vn=g(je,Ge,v,_,C),U=m.prevZ,V=m.nextZ;U&&U.z>=Un&&V&&V.z<=Vn;){if(U.x>=J&&U.x<=je&&U.y>=$&&U.y<=Ge&&U!==L&&U!==A&&b(I,H,N,G,z,k,U.x,U.y)&&x(U.prev,U,U.next)>=0||(U=U.prevZ,V.x>=J&&V.x<=je&&V.y>=$&&V.y<=Ge&&V!==L&&V!==A&&b(I,H,N,G,z,k,V.x,V.y)&&x(V.prev,V,V.next)>=0))return!1;V=V.nextZ}for(;U&&U.z>=Un;){if(U.x>=J&&U.x<=je&&U.y>=$&&U.y<=Ge&&U!==L&&U!==A&&b(I,H,N,G,z,k,U.x,U.y)&&x(U.prev,U,U.next)>=0)return!1;U=U.prevZ}for(;V&&V.z<=Vn;){if(V.x>=J&&V.x<=je&&V.y>=$&&V.y<=Ge&&V!==L&&V!==A&&b(I,H,N,G,z,k,V.x,V.y)&&x(V.prev,V,V.next)>=0)return!1;V=V.nextZ}return!0}function r(m,v,_){var C=m;do{var L=C.prev,S=C.next.next;!w(L,S)&&T(L,C,C.next,S)&&O(L,S)&&O(S,L)&&(v.push(L.i/_|0),v.push(C.i/_|0),v.push(S.i/_|0),q(C),q(C.next),C=m=S),C=C.next}while(C!==m);return t(C)}function a(m,v,_,C,L,S){var A=m;do{for(var I=A.next.next;I!==A.prev;){if(A.i!==I.i&&P(A,I)){var N=Z(A,I);A=t(A,A.next),N=t(N,N.next),i(A,v,_,C,L,S,0),i(N,v,_,C,L,S,0);return}I=I.next}A=A.next}while(A!==m)}function c(m,v,_,C){var L=[],S,A,I,N,z;for(S=0,A=v.length;S<A;S++)I=v[S]*C,N=S<A-1?v[S+1]*C:m.length,z=e(m,I,N,C,!1),z===z.next&&(z.steiner=!0),L.push(y(z));for(L.sort(l),S=0;S<L.length;S++)_=u(L[S],_);return _}function l(m,v){return m.x-v.x}function u(m,v){var _=f(m,v);if(!_)return v;var C=Z(_,m);return t(C,C.next),t(_,_.next)}function f(m,v){var _=v,C=m.x,L=m.y,S=-1/0,A;do{if(L<=_.y&&L>=_.next.y&&_.next.y!==_.y){var I=_.x+(L-_.y)*(_.next.x-_.x)/(_.next.y-_.y);if(I<=C&&I>S&&(S=I,A=_.x<_.next.x?_:_.next,I===C))return A}_=_.next}while(_!==v);if(!A)return null;var N=A,z=A.x,H=A.y,G=1/0,k;_=A;do C>=_.x&&_.x>=z&&C!==_.x&&b(L<H?C:S,L,z,H,L<H?S:C,L,_.x,_.y)&&(k=Math.abs(L-_.y)/(C-_.x),O(_,m)&&(k<G||k===G&&(_.x>A.x||_.x===A.x&&d(A,_)))&&(A=_,G=k)),_=_.next;while(_!==N);return A}function d(m,v){return x(m.prev,m,v.prev)<0&&x(v.next,m,m.next)<0}function h(m,v,_,C){var L=m;do L.z===0&&(L.z=g(L.x,L.y,v,_,C)),L.prevZ=L.prev,L.nextZ=L.next,L=L.next;while(L!==m);L.prevZ.nextZ=null,L.prevZ=null,p(L)}function p(m){var v,_,C,L,S,A,I,N,z=1;do{for(_=m,m=null,S=null,A=0;_;){for(A++,C=_,I=0,v=0;v<z&&(I++,C=C.nextZ,!!C);v++);for(N=z;I>0||N>0&&C;)I!==0&&(N===0||!C||_.z<=C.z)?(L=_,_=_.nextZ,I--):(L=C,C=C.nextZ,N--),S?S.nextZ=L:m=L,L.prevZ=S,S=L;_=C}S.nextZ=null,z*=2}while(A>1);return m}function g(m,v,_,C,L){return m=(m-_)*L|0,v=(v-C)*L|0,m=(m|m<<8)&16711935,m=(m|m<<4)&252645135,m=(m|m<<2)&858993459,m=(m|m<<1)&1431655765,v=(v|v<<8)&16711935,v=(v|v<<4)&252645135,v=(v|v<<2)&858993459,v=(v|v<<1)&1431655765,m|v<<1}function y(m){var v=m,_=m;do(v.x<_.x||v.x===_.x&&v.y<_.y)&&(_=v),v=v.next;while(v!==m);return _}function b(m,v,_,C,L,S,A,I){return(L-A)*(v-I)>=(m-A)*(S-I)&&(m-A)*(C-I)>=(_-A)*(v-I)&&(_-A)*(S-I)>=(L-A)*(C-I)}function P(m,v){return m.next.i!==v.i&&m.prev.i!==v.i&&!D(m,v)&&(O(m,v)&&O(v,m)&&B(m,v)&&(x(m.prev,m,v.prev)||x(m,v.prev,v))||w(m,v)&&x(m.prev,m,m.next)>0&&x(v.prev,v,v.next)>0)}function x(m,v,_){return(v.y-m.y)*(_.x-v.x)-(v.x-m.x)*(_.y-v.y)}function w(m,v){return m.x===v.x&&m.y===v.y}function T(m,v,_,C){var L=F(x(m,v,_)),S=F(x(m,v,C)),A=F(x(_,C,m)),I=F(x(_,C,v));return!!(L!==S&&A!==I||L===0&&E(m,_,v)||S===0&&E(m,C,v)||A===0&&E(_,m,C)||I===0&&E(_,v,C))}function E(m,v,_){return v.x<=Math.max(m.x,_.x)&&v.x>=Math.min(m.x,_.x)&&v.y<=Math.max(m.y,_.y)&&v.y>=Math.min(m.y,_.y)}function F(m){return m>0?1:m<0?-1:0}function D(m,v){var _=m;do{if(_.i!==m.i&&_.next.i!==m.i&&_.i!==v.i&&_.next.i!==v.i&&T(_,_.next,m,v))return!0;_=_.next}while(_!==m);return!1}function O(m,v){return x(m.prev,m,m.next)<0?x(m,v,m.next)>=0&&x(m,m.prev,v)>=0:x(m,v,m.prev)<0||x(m,m.next,v)<0}function B(m,v){var _=m,C=!1,L=(m.x+v.x)/2,S=(m.y+v.y)/2;do _.y>S!=_.next.y>S&&_.next.y!==_.y&&L<(_.next.x-_.x)*(S-_.y)/(_.next.y-_.y)+_.x&&(C=!C),_=_.next;while(_!==m);return C}function Z(m,v){var _=new te(m.i,m.x,m.y),C=new te(v.i,v.x,v.y),L=m.next,S=v.prev;return m.next=v,v.prev=m,_.next=L,L.prev=_,C.next=_,_.prev=C,S.next=C,C.prev=S,C}function X(m,v,_,C){var L=new te(m,v,_);return C?(L.next=C.next,L.prev=C,C.next.prev=L,C.next=L):(L.prev=L,L.next=L),L}function q(m){m.next.prev=m.prev,m.prev.next=m.next,m.prevZ&&(m.prevZ.nextZ=m.nextZ),m.nextZ&&(m.nextZ.prevZ=m.prevZ)}function te(m,v,_){this.i=m,this.x=v,this.y=_,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}n.deviation=function(m,v,_,C){var L=v&&v.length,S=L?v[0]*_:m.length,A=Math.abs(ie(m,0,S,_));if(L)for(var I=0,N=v.length;I<N;I++){var z=v[I]*_,H=I<N-1?v[I+1]*_:m.length;A-=Math.abs(ie(m,z,H,_))}var G=0;for(I=0;I<C.length;I+=3){var k=C[I]*_,J=C[I+1]*_,$=C[I+2]*_;G+=Math.abs((m[k]-m[$])*(m[J+1]-m[k+1])-(m[k]-m[J])*(m[$+1]-m[k+1]))}return A===0&&G===0?0:Math.abs((G-A)/A)};function ie(m,v,_,C){for(var L=0,S=v,A=_-C;S<_;S+=C)L+=(m[A]-m[S])*(m[S+1]+m[A+1]),A=S;return L}return n.flatten=function(m){for(var v=m[0][0].length,_={vertices:[],holes:[],dimensions:v},C=0,L=0;L<m.length;L++){for(var S=0;S<m[L].length;S++)for(var A=0;A<v;A++)_.vertices.push(m[L][S][A]);L>0&&(C+=m[L-1].length,_.holes.push(C))}return _},Pt.exports}var Ah=Sh();const Th=Ya(Ah),wt=Sr.CLOCKWISE,Ds=Sr.COUNTER_CLOCKWISE,Pe={};function Eh(n){if(n=n&&n.positions||n,!Array.isArray(n)&&!ArrayBuffer.isView(n))throw new Error("invalid polygon")}function Ke(n){return"positions"in n?n.positions:n}function Vt(n){return"holeIndices"in n?n.holeIndices:null}function Ih(n){return Array.isArray(n[0])}function Mh(n){return n.length>=1&&n[0].length>=2&&Number.isFinite(n[0][0])}function Bh(n){const e=n[0],t=n[n.length-1];return e[0]===t[0]&&e[1]===t[1]&&e[2]===t[2]}function Oh(n,e,t,i){for(let s=0;s<e;s++)if(n[t+s]!==n[i-e+s])return!1;return!0}function ks(n,e,t,i,s){let o=e;const r=t.length;for(let a=0;a<r;a++)for(let c=0;c<i;c++)n[o++]=t[a][c]||0;if(!Bh(t))for(let a=0;a<i;a++)n[o++]=t[0][a]||0;return Pe.start=e,Pe.end=o,Pe.size=i,Ar(n,s,Pe),o}function Us(n,e,t,i,s=0,o,r){o=o||t.length;const a=o-s;if(a<=0)return e;let c=e;for(let l=0;l<a;l++)n[c++]=t[s+l];if(!Oh(t,i,s,o))for(let l=0;l<i;l++)n[c++]=t[s+l];return Pe.start=e,Pe.end=c,Pe.size=i,Ar(n,r,Pe),c}function Rr(n,e){Eh(n);const t=[],i=[];if("positions"in n){const{positions:s,holeIndices:o}=n;if(o){let r=0;for(let a=0;a<=o.length;a++)r=Us(t,r,s,e,o[a-1],o[a],a===0?wt:Ds),i.push(r);return i.pop(),{positions:t,holeIndices:i}}n=s}if(!Ih(n))return Us(t,0,n,e,0,t.length,wt),t;if(!Mh(n)){let s=0;for(const[o,r]of n.entries())s=ks(t,s,r,e,o===0?wt:Ds),i.push(s);return i.pop(),{positions:t,holeIndices:i}}return ks(t,0,n,e,wt),t}function zi(n,e,t){const i=n.length/3;let s=0;for(let o=0;o<i;o++){const r=(o+1)%i;s+=n[o*3+e]*n[r*3+t],s-=n[r*3+e]*n[o*3+t]}return Math.abs(s/2)}function Vs(n,e,t,i){const s=n.length/3;for(let o=0;o<s;o++){const r=o*3,a=n[r+0],c=n[r+1],l=n[r+2];n[r+e]=a,n[r+t]=c,n[r+i]=l}}function Rh(n,e,t,i){let s=Vt(n);s&&(s=s.map(a=>a/e));let o=Ke(n);const r=i&&e===3;if(t){const a=o.length;o=o.slice();const c=[];for(let l=0;l<a;l+=e){c[0]=o[l],c[1]=o[l+1],r&&(c[2]=o[l+2]);const u=t(c);o[l]=u[0],o[l+1]=u[1],r&&(o[l+2]=u[2])}}if(r){const a=zi(o,0,1),c=zi(o,0,2),l=zi(o,1,2);if(!a&&!c&&!l)return[];a>c&&a>l||(c>l?(t||(o=o.slice()),Vs(o,0,2,1)):(t||(o=o.slice()),Vs(o,2,0,1)))}return Th(o,s,e)}class zh extends Pr{constructor(e){const{fp64:t,IndexType:i=Uint32Array}=e;super({...e,attributes:{positions:{size:3,type:t?Float64Array:Float32Array},vertexValid:{type:Uint16Array,size:1},indices:{type:i,size:1}}})}get(e){const{attributes:t}=this;return e==="indices"?t.indices&&t.indices.subarray(0,this.vertexCount):t[e]}updateGeometry(e){super.updateGeometry(e);const t=this.buffers.indices;if(t)this.vertexCount=(t.value||t).length;else if(this.data&&!this.getGeometry)throw new Error("missing indices buffer")}normalizeGeometry(e){if(this.normalize){const t=Rr(e,this.positionSize);return this.opts.resolution?Er(Ke(t),Vt(t),{size:this.positionSize,gridResolution:this.opts.resolution,edgeTypes:!0}):this.opts.wrapLongitude?dh(Ke(t),Vt(t),{size:this.positionSize,maxLatitude:86,edgeTypes:!0}):t}return e}getGeometrySize(e){if(js(e)){let t=0;for(const i of e)t+=this.getGeometrySize(i);return t}return Ke(e).length/this.positionSize}getGeometryFromBuffer(e){return this.normalize||!this.buffers.indices?super.getGeometryFromBuffer(e):null}updateGeometryAttributes(e,t){if(e&&js(e))for(const i of e){const s=this.getGeometrySize(i);t.geometrySize=s,this.updateGeometryAttributes(i,t),t.vertexStart+=s,t.indexStart=this.indexStarts[t.geometryIndex+1]}else{const i=e;this._updateIndices(i,t),this._updatePositions(i,t),this._updateVertexValid(i,t)}}_updateIndices(e,{geometryIndex:t,vertexStart:i,indexStart:s}){const{attributes:o,indexStarts:r,typedArrayManager:a}=this;let c=o.indices;if(!c||!e)return;let l=s;const u=Rh(e,this.positionSize,this.opts.preproject,this.opts.full3d);c=a.allocate(c,s+u.length,{copy:!0});for(let f=0;f<u.length;f++)c[l++]=u[f]+i;r[t+1]=s+u.length,o.indices=c}_updatePositions(e,{vertexStart:t,geometrySize:i}){const{attributes:{positions:s},positionSize:o}=this;if(!s||!e)return;const r=Ke(e);for(let a=t,c=0;c<i;a++,c++){const l=r[c*o],u=r[c*o+1],f=o>2?r[c*o+2]:0;s[a*3]=l,s[a*3+1]=u,s[a*3+2]=f}}_updateVertexValid(e,{vertexStart:t,geometrySize:i}){const{positionSize:s}=this,o=this.attributes.vertexValid,r=e&&Vt(e);if(e&&e.edgeTypes?o.set(e.edgeTypes,t):o.fill(1,t,t+i),r)for(let a=0;a<r.length;a++)o[t+r[a]/s-1]=0;o[t+i-1]=0}}function js(n){return Array.isArray(n)&&n.length>0&&!Number.isFinite(n[0])}const Nh=`struct SolidPolygonUniforms {
  extruded: f32,
  isWireframe: f32,
  elevationScale: f32,
};

@group(0) @binding(auto) var<uniform> solidPolygon: SolidPolygonUniforms;
`,Gs=`layout(std140) uniform solidPolygonUniforms {
  bool extruded;
  bool isWireframe;
  float elevationScale;
} solidPolygon;
`,Fh={name:"solidPolygon",source:Nh,vs:Gs,fs:Gs,uniformTypes:{extruded:"f32",isWireframe:"f32",elevationScale:"f32"}},zr=`in vec4 fillColors;
in vec4 lineColors;
in float rowIndexes;
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
geometry.pickingColor = picking_getPickingColorFromIndex(rowIndexes);
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
`,Dh=`#version 300 es
#define SHADER_NAME solid-polygon-layer-vertex-shader
in vec3 vertexPositions;
in vec3 vertexPositions64Low;
in float elevations;
${zr}
void main(void) {
PolygonProps props;
props.positions = vertexPositions;
props.positions64Low = vertexPositions64Low;
props.elevations = elevations;
props.normal = vec3(0.0, 0.0, 1.0);
calculatePosition(props);
}
`,kh=`#version 300 es
#define SHADER_NAME solid-polygon-layer-vertex-shader-side
#define IS_SIDE_VERTEX
in vec2 positions;
in vec3 vertexPositions;
in vec3 nextVertexPositions;
in vec3 vertexPositions64Low;
in vec3 nextVertexPositions64Low;
in float elevations;
in float instanceVertexValid;
${zr}
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
`,Uh=`#version 300 es
#define SHADER_NAME solid-polygon-layer-fragment-shader
precision highp float;
in vec4 vColor;
out vec4 fragColor;
void main(void) {
fragColor = vColor;
geometry.uv = vec2(0.);
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;function Nr(){return`fn project_offset_normal(vector: vec3<f32>) -> vec3<f32> {
  if (project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT ||
      project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT_OFFSETS) {
    return normalize(vector * project.commonUnitsPerWorldUnit);
  }
  return project_normal(vector);
}

fn apply_polygon_color(
  colors: vec4<f32>,
  normal: vec3<f32>,
  position: vec4<f32>
) -> vec4<f32> {
  if (solidPolygon.extruded > 0.5) {
    let lightColor = lighting_getLightColor2(
      colors.rgb,
      project.cameraPosition,
      position.xyz,
      normal
    );
    return vec4<f32>(lightColor, colors.a * layer.opacity);
  }
  return vec4<f32>(colors.rgb, colors.a * layer.opacity);
}
`}function Fr(){return`@fragment
fn fragmentMain(inp: Varyings) -> @location(0) vec4<f32> {
  geometry.uv = vec2<f32>(0.0, 0.0);

  clip_filterColor(inp.clipCoordinates);

  if (picking.isActive > 0.5) {
    if (!picking_isColorValid(inp.pickingColor)) {
      discard;
    }
    return vec4<f32>(inp.pickingColor, 1.0);
  }

  var fragColor = inp.vColor;

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

  return deckgl_premultiplied_alpha(fragColor);
}
`}function Vh(){return`${Nr()}

struct Attributes {
  @location(0) vertexPositions: vec3<f32>,
  @location(1) vertexPositions64Low: vec3<f32>,
  @location(2) elevations: f32,
  @location(3) fillColors: vec4<f32>,
  @location(4) lineColors: vec4<f32>,
  @location(5) rowIndexes: u32,
};

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) vColor: vec4<f32>,
  @location(1) pickingColor: vec3<f32>,
  @location(2) clipCoordinates: vec2<f32>,
};

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
  var outp: Varyings;

  var pos = attributes.vertexPositions;
  if (solidPolygon.extruded > 0.5) {
    pos.z += attributes.elevations * solidPolygon.elevationScale;
  }

  geometry.worldPosition = attributes.vertexPositions;
  geometry.pickingColor = picking_getPickingColorFromIndex(attributes.rowIndexes);

  let projectedPosition = project_position_to_clipspace_and_commonspace(
    pos,
    attributes.vertexPositions64Low,
    vec3<f32>(0.0)
  );
  geometry.position = projectedPosition.commonPosition;
  outp.position = projectedPosition.clipPosition;

  let normal = project_normal(vec3<f32>(0.0, 0.0, 1.0));
  geometry.normal = normal;

  let colors = select(
    attributes.fillColors,
    attributes.lineColors,
    solidPolygon.isWireframe > 0.5
  );
  outp.vColor = apply_polygon_color(colors, normal, geometry.position);
  outp.pickingColor = geometry.pickingColor;

  outp.clipCoordinates = geometry.position.xy;
  clip_filterPosition(&outp.position, geometry.worldPosition.xy);

  return outp;
}

${Fr()}
`}function jh(n){return`const RING_WINDING_ORDER_CW: bool = ${n?"true":"false"};

${Nr()}

struct Attributes {
  @location(0) positions: vec2<f32>,
  @location(1) vertexPositions: vec3<f32>,
  @location(2) vertexPositions64Low: vec3<f32>,
  @location(3) nextVertexPositions: vec3<f32>,
  @location(4) nextVertexPositions64Low: vec3<f32>,
  @location(5) vertexValid: f32,
  @location(6) elevations: f32,
  @location(7) fillColors: vec4<f32>,
  @location(8) lineColors: vec4<f32>,
  @location(9) rowIndexes: u32,
};

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) vColor: vec4<f32>,
  @location(1) pickingColor: vec3<f32>,
  @location(2) clipCoordinates: vec2<f32>,
};

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
  var outp: Varyings;
  outp.position = vec4<f32>(0.0);
  outp.vColor = vec4<f32>(0.0);
  outp.pickingColor = picking_getPickingColorFromIndex(attributes.rowIndexes);
  outp.clipCoordinates = vec2<f32>(0.0);

  if (attributes.vertexValid < 0.5) {
    return outp;
  }

  let pos = select(attributes.nextVertexPositions, attributes.vertexPositions, RING_WINDING_ORDER_CW);
  let pos64Low = select(
    attributes.nextVertexPositions64Low,
    attributes.vertexPositions64Low,
    RING_WINDING_ORDER_CW
  );
  let nextPos = select(attributes.vertexPositions, attributes.nextVertexPositions, RING_WINDING_ORDER_CW);
  let nextPos64Low = select(
    attributes.vertexPositions64Low,
    attributes.nextVertexPositions64Low,
    RING_WINDING_ORDER_CW
  );

  let position = mix(pos, nextPos, attributes.positions.x);
  let position64Low = mix(pos64Low, nextPos64Low, attributes.positions.x);

  var worldPosition = position;
  if (solidPolygon.extruded > 0.5) {
    worldPosition.z += attributes.elevations * attributes.positions.y * solidPolygon.elevationScale;
  }

  geometry.worldPosition = position;
  geometry.pickingColor = picking_getPickingColorFromIndex(attributes.rowIndexes);

  let projectedPosition = project_position_to_clipspace_and_commonspace(
    worldPosition,
    position64Low,
    vec3<f32>(0.0)
  );
  geometry.position = projectedPosition.commonPosition;
  outp.position = projectedPosition.clipPosition;

  let normal = project_offset_normal(vec3<f32>(
    pos.y - nextPos.y + (pos64Low.y - nextPos64Low.y),
    nextPos.x - pos.x + (nextPos64Low.x - pos64Low.x),
    0.0
  ));
  geometry.normal = normal;

  let colors = select(
    attributes.fillColors,
    attributes.lineColors,
    solidPolygon.isWireframe > 0.5
  );
  outp.vColor = apply_polygon_color(colors, normal, geometry.position);
  outp.pickingColor = geometry.pickingColor;

  outp.clipCoordinates = geometry.position.xy;
  clip_filterPosition(&outp.position, geometry.worldPosition.xy);

  return outp;
}

${Fr()}
`}function Gh(n,e){return n==="top"?Vh():jh(e)}const ti=[0,0,0,255],$h={filled:!0,extruded:!1,wireframe:!1,_normalize:!0,_windingOrder:"CW",_full3d:!1,elevationScale:{type:"number",min:0,value:1},getPolygon:{type:"accessor",value:n=>n.polygon},getElevation:{type:"accessor",value:1e3},getFillColor:{type:"accessor",value:ti},getLineColor:{type:"accessor",value:ti},material:!0},Ct={enter:(n,e)=>e.length?e.subarray(e.length-n.length):n};class fi extends _e{getShaders(e){const t=!this.props._normalize&&this.props._windingOrder==="CCW"?0:1;return super.getShaders({vs:e==="top"?Dh:kh,fs:Uh,source:Gh(e,!!t),defines:{RING_WINDING_ORDER_CW:t},modules:[Ue,ke,Zo,Ve,Fh,...this.context.device.type==="webgpu"?[Ln]:[]]})}get wrapLongitude(){return!1}getBounds(){return this.getAttributeManager()?.getBounds(["vertexPositions"])}initializeState(){const{viewport:e}=this.context;let{coordinateSystem:t}=this.props;const{_full3d:i}=this.props;e.isGeospatial&&t==="default"&&(t="lnglat");let s;t==="lnglat"&&(i?s=e.projectPosition.bind(e):s=e.projectFlat.bind(e)),this.setState({numInstances:0,polygonTesselator:new zh({preproject:s,fp64:this.use64bitPositions(),IndexType:Uint32Array})});const o=this.getAttributeManager(),r=!0,a=this.context.device.type==="webgpu";o.add({indices:{size:1,isIndexed:!0,update:this.calculateIndices,noAlloc:r},vertexPositions:{size:3,type:"float64",stepMode:"dynamic",fp64:this.use64bitPositions(),transition:Ct,accessor:"getPolygon",update:this.calculatePositions,noAlloc:r,shaderAttributes:{nextVertexPositions:{vertexOffset:1}}},[a?"vertexValid":"instanceVertexValid"]:{size:1,type:a?"float32":"uint16",stepMode:"instance",update:this.calculateVertexValid,noAlloc:r},elevations:{size:1,stepMode:"dynamic",transition:Ct,accessor:"getElevation",bufferGroup:"solid-polygon-instance-data"},fillColors:{size:this.props.colorFormat.length,type:"unorm8",stepMode:"dynamic",transition:Ct,accessor:"getFillColor",defaultValue:ti,bufferGroup:"solid-polygon-instance-data"},lineColors:{size:this.props.colorFormat.length,type:"unorm8",stepMode:"dynamic",transition:Ct,accessor:"getLineColor",defaultValue:ti,bufferGroup:"solid-polygon-instance-data"},rowIndexes:{size:1,type:"uint32",stepMode:"dynamic",accessor:(c,{index:l})=>c&&c.__source?c.__source.index:l,bufferGroup:"solid-polygon-instance-data"}})}getPickingInfo(e){const t=super.getPickingInfo(e),{index:i}=t,s=this.props.data;return s[0]&&s[0].__source&&(t.object=s.find(o=>o.__source.index===i)),t}disablePickingIndex(e){const t=this.props.data;if(t[0]&&t[0].__source)for(let i=0;i<t.length;i++)t[i].__source.index===e&&this._disablePickingIndex(i);else super.disablePickingIndex(e)}draw({uniforms:e}){const{extruded:t,filled:i,wireframe:s,elevationScale:o}=this.props,{topModel:r,sideModel:a,wireframeModel:c,polygonTesselator:l}=this.state,u={extruded:!!t,elevationScale:o,isWireframe:!1};c&&s&&(c.setInstanceCount(l.instanceCount-1),c.shaderInputs.setProps({solidPolygon:{...u,isWireframe:!0}}),c.draw(this.context.renderPass)),a&&i&&(a.setInstanceCount(l.instanceCount-1),a.shaderInputs.setProps({solidPolygon:u}),a.draw(this.context.renderPass)),r&&i&&(r.setVertexCount(l.vertexCount),r.shaderInputs.setProps({solidPolygon:u}),r.draw(this.context.renderPass))}updateState(e){super.updateState(e),this.updateGeometry(e);const{props:t,oldProps:i,changeFlags:s}=e,o=this.getAttributeManager();(s.extensionsChanged||t.filled!==i.filled||t.extruded!==i.extruded)&&(this.state.models?.forEach(a=>a.destroy()),this.setState(this._getModels()),o.invalidateAll())}updateGeometry({props:e,oldProps:t,changeFlags:i}){if(i.dataChanged||i.updateTriggersChanged&&(i.updateTriggersChanged.all||i.updateTriggersChanged.getPolygon)){const{polygonTesselator:o}=this.state,r=e.data.attributes||{};o.updateGeometry({data:e.data,normalize:e._normalize,geometryBuffer:r.getPolygon,buffers:r,getGeometry:e.getPolygon,positionFormat:e.positionFormat,wrapLongitude:e.wrapLongitude,resolution:this.context.viewport.resolution,fp64:this.use64bitPositions(),dataChanged:i.dataChanged,full3d:e._full3d}),this.setState({numInstances:o.instanceCount,startIndices:o.vertexStarts}),i.dataChanged||this.getAttributeManager().invalidateAll()}}_getModels(){const{id:e,filled:t,extruded:i}=this.props;let s,o,r;if(t){const a=this.getShaders("top");a.defines={...a.defines,NON_INSTANCED_MODEL:1};let c=this.getAttributeManager().getBufferLayouts({isInstanced:!1});this.context.device.type==="webgpu"&&(c=c.filter(l=>l.name!=="indices"&&l.name!=="vertexValid"&&l.name!=="instanceVertexValid"&&l.name!=="nextVertexPositions")),s=new re(this.context.device,{...a,id:`${e}-top`,topology:"triangle-list",bufferLayout:c,isIndexed:!0,userData:{excludeAttributes:{vertexValid:!0,instanceVertexValid:!0,nextVertexPositions:!0}}})}if(i){let a=this.getAttributeManager().getBufferLayouts({isInstanced:!0});this.context.device.type==="webgpu"&&(a=a.filter(c=>c.name!=="indices")),o=new re(this.context.device,{...this.getShaders("side"),id:`${e}-side`,bufferLayout:a,geometry:new pe({topology:"triangle-strip",attributes:{positions:{size:2,value:new Float32Array([1,0,0,0,1,1,0,1])}}}),isInstanced:!0,userData:{excludeAttributes:{indices:!0}}}),r=new re(this.context.device,{...this.getShaders("side"),id:`${e}-wireframe`,bufferLayout:a,geometry:new pe({topology:"line-strip",attributes:{positions:{size:2,value:new Float32Array([1,0,0,0,0,1,1,1])}}}),isInstanced:!0,userData:{excludeAttributes:{indices:!0}}})}return{models:[o,r,s].filter(Boolean),topModel:s,sideModel:o,wireframeModel:r}}calculateIndices(e){const{polygonTesselator:t}=this.state;e.startIndices=t.indexStarts,e.value=t.get("indices")}calculatePositions(e){const{polygonTesselator:t}=this.state;e.startIndices=t.vertexStarts,e.value=t.get("positions")}calculateVertexValid(e){const t=this.props.data.attributes?.instanceVertexValid?.value,i=this.context.device.type==="webgpu"&&t?t:this.state.polygonTesselator.get("vertexValid");e.value=this.context.device.type==="webgpu"&&i?Float32Array.from(i):i}}fi.defaultProps=$h;fi.layerName="SolidPolygonLayer";function Dr({data:n,getIndex:e,dataRange:t,replace:i}){const{startRow:s=0,endRow:o=1/0}=t,r=n.length;let a=r,c=r;for(let d=0;d<r;d++){const h=e(n[d]);if(a>d&&h>=s&&(a=d),h>=o){c=d;break}}let l=a;const f=c-a!==i.length?n.slice(c):void 0;for(let d=0;d<i.length;d++)n[l++]=i[d];if(f){for(let d=0;d<f.length;d++)n[l++]=f[d];n.length=l}return{startRow:a,endRow:a+i.length}}const kr=[0,0,0,255],Wh=[0,0,0,255],Hh={stroked:!0,filled:!0,extruded:!1,elevationScale:1,wireframe:!1,_normalize:!0,_windingOrder:"CW",lineWidthUnits:"meters",lineWidthScale:1,lineWidthMinPixels:0,lineWidthMaxPixels:Number.MAX_SAFE_INTEGER,lineJointRounded:!1,lineMiterLimit:4,lineAntialiasing:!1,getPolygon:{type:"accessor",value:n=>n.polygon},getFillColor:{type:"accessor",value:Wh},getLineColor:{type:"accessor",value:kr},getLineWidth:{type:"accessor",value:1},getElevation:{type:"accessor",value:1e3},material:!0};class An extends Te{initializeState(){this.state={paths:[],pathsDiff:null},this.props.getLineDashArray&&Y.removed("getLineDashArray","PathStyleExtension")()}updateState({changeFlags:e}){const t=e.dataChanged||e.updateTriggersChanged&&(e.updateTriggersChanged.all||e.updateTriggersChanged.getPolygon);if(t&&Array.isArray(e.dataChanged)){const i=this.state.paths.slice(),s=e.dataChanged.map(o=>Dr({data:i,getIndex:r=>r.__source.index,dataRange:o,replace:this._getPaths(o)}));this.setState({paths:i,pathsDiff:s})}else t&&this.setState({paths:this._getPaths(),pathsDiff:null})}_getPaths(e={}){const{data:t,getPolygon:i,positionFormat:s,_normalize:o}=this.props,r=[],a=s==="XY"?2:3,{startRow:c,endRow:l}=e,{iterable:u,objectInfo:f}=Ae(t,c,l);for(const d of u){f.index++;let h=i(d,f);o&&(h=Rr(h,a));const{holeIndices:p}=h,g=h.positions||h;if(p)for(let y=0;y<=p.length;y++){const b=g.slice(p[y-1]||0,p[y]||g.length);r.push(this.getSubLayerRow({path:b},d,f.index))}else r.push(this.getSubLayerRow({path:g},d,f.index))}return r}renderLayers(){const{data:e,_dataDiff:t,stroked:i,filled:s,extruded:o,wireframe:r,_normalize:a,_windingOrder:c,elevationScale:l,transitions:u,positionFormat:f}=this.props,{lineWidthUnits:d,lineWidthScale:h,lineWidthMinPixels:p,lineWidthMaxPixels:g,lineJointRounded:y,lineMiterLimit:b,lineAntialiasing:P,lineDashJustified:x}=this.props,{getFillColor:w,getLineColor:T,getLineWidth:E,getLineDashArray:F,getElevation:D,getPolygon:O,updateTriggers:B,material:Z}=this.props,{paths:X,pathsDiff:q}=this.state,te=this.getSubLayerClass("fill",fi),ie=this.getSubLayerClass("stroke",ht),m=this.shouldRenderSubLayer("fill",X)&&new te({_dataDiff:t,extruded:o,elevationScale:l,filled:s,wireframe:r,_normalize:a,_windingOrder:c,getElevation:D,getFillColor:w,getLineColor:o&&r?T:kr,material:Z,transitions:u},this.getSubLayerProps({id:"fill",updateTriggers:B&&{getPolygon:B.getPolygon,getElevation:B.getElevation,getFillColor:B.getFillColor,lineColors:o&&r,getLineColor:B.getLineColor}}),{data:e,positionFormat:f,getPolygon:O}),v=!o&&i&&this.shouldRenderSubLayer("stroke",X)&&new ie({_dataDiff:q&&(()=>q),widthUnits:d,widthScale:h,widthMinPixels:p,widthMaxPixels:g,jointRounded:y,miterLimit:b,antialiasing:P,dashJustified:x,_pathType:"loop",transitions:u&&{getWidth:u.getLineWidth,getColor:u.getLineColor,getPath:u.getPolygon},getColor:this.getSubLayerAccessor(T),getWidth:this.getSubLayerAccessor(E),getDashArray:this.getSubLayerAccessor(F)},this.getSubLayerProps({id:"stroke",updateTriggers:B&&{getWidth:B.getLineWidth,getColor:B.getLineColor,getDashArray:B.getLineDashArray}}),{data:X,positionFormat:f,getPath:_=>_.path});return[!o&&m,v,o&&m]}}An.layerName="PolygonLayer";An.defaultProps=Hh;function qh(n,e){if(!n)return null;const t="startIndices"in n?n.startIndices[e]:e,i=n.featureIds.value[t];return t!==-1?Yh(n,i,t):null}function Yh(n,e,t){const i={properties:{...n.properties[e]}};for(const s in n.numericProps)i.properties[s]=n.numericProps[s].value[t];return i}function Xh(n){const e={points:null,lines:null,polygons:null};for(const t in e){const i=n[t].globalFeatureIds.value;e[t]=new Uint32Array(i)}return e}const $s=`layout(std140) uniform sdfUniforms {
  float gamma;
  bool enabled;
  float buffer;
  float outlineBuffer;
  vec4 outlineColor;
} sdf;
`,Zh={name:"sdf",vs:$s,fs:$s,uniformTypes:{gamma:"f32",enabled:"f32",buffer:"f32",outlineBuffer:"f32",outlineColor:"vec4<f32>"}},tt={none:0,start:1,center:2,end:3},Kh=`layout(std140) uniform textUniforms {
  highp vec2 cutoffPixels;
  highp ivec2 align;
  highp float fontSize;
  bool flipY;
} text;

#define ALIGN_MODE_START ${tt.start}
#define ALIGN_MODE_CENTER ${tt.center}
#define ALIGN_MODE_END ${tt.end}
`,Ur={name:"text",vs:Kh,getUniforms:({contentCutoffPixels:n=[0,0],contentAlignHorizontal:e="none",contentAlignVertical:t="none",fontSize:i,viewport:s})=>({cutoffPixels:n,align:[tt[e],tt[t]],fontSize:i,flipY:s?.flipY??!1}),uniformTypes:{cutoffPixels:"vec2<f32>",align:"vec2<i32>",fontSize:"f32",flipY:"f32"}},Jh=`#version 300 es
#define SHADER_NAME multi-icon-layer-vertex-shader
in vec2 positions;
in vec3 instancePositions;
in vec3 instancePositions64Low;
in float instanceSizes;
in float instanceAngles;
in vec4 instanceColors;
in float rowIndexes;
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
geometry.pickingColor = picking_getPickingColorFromIndex(rowIndexes);
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
`,Qh=`#version 300 es
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
`;function ep({collision:n=!1}={}){return`struct IconUniforms {
  sizeScale: f32,
  iconsTextureDim: vec2<f32>,
  sizeBasis: f32,
  sizeMinPixels: f32,
  sizeMaxPixels: f32,
  billboard: i32,
  sizeUnits: i32,
  alphaCutoff: f32
};

struct TextUniforms {
  cutoffPixels: vec2<f32>,
  align: vec2<i32>,
  fontSize: f32,
  flipY: f32
};

struct SdfUniforms {
  gamma: f32,
  enabled: f32,
  buffer: f32,
  outlineBuffer: f32,
  outlineColor: vec4<f32>
};

${n?`struct CollisionUniforms {
  sort: i32,
  enabled: i32
};
`:""}

const ALIGN_MODE_START: i32 = 1;
const ALIGN_MODE_CENTER: i32 = 2;
const ALIGN_MODE_END: i32 = 3;

@group(0) @binding(auto) var<uniform> icon: IconUniforms;
@group(0) @binding(auto) var<uniform> text: TextUniforms;
@group(0) @binding(auto) var<uniform> sdf: SdfUniforms;
${n?"@group(0) @binding(auto) var<uniform> collision: CollisionUniforms;":""}
@group(0) @binding(auto) var iconsTexture : texture_2d<f32>;
@group(0) @binding(auto) var iconsTextureSampler : sampler;
${n?`@group(0) @binding(auto) var collision_texture : texture_2d<f32>;
`:""}

fn rotate_by_angle(vertex: vec2<f32>, angle_deg: f32) -> vec2<f32> {
  let angle_radian = angle_deg * PI / 180.0;
  let c = cos(angle_radian);
  let s = sin(angle_radian);
  let rotation = mat2x2<f32>(vec2<f32>(c, -s), vec2<f32>(s, c));
  return rotation * vertex;
}

fn get_pixel_offset_from_alignment(
  anchor: f32,
  extent: f32,
  clipStart: f32,
  clipEnd: f32,
  mode: i32
) -> f32 {
  if (clipEnd < clipStart) {
    return 0.0;
  }
  if (mode == ALIGN_MODE_START) {
    return max(-(anchor + clipStart), 0.0);
  }
  if (mode == ALIGN_MODE_CENTER) {
    let minValue = max(0.0, anchor + clipStart);
    let maxValue = min(extent, anchor + clipEnd);
    if (minValue < maxValue) {
      return (minValue + maxValue) / 2.0 - anchor;
    }
    return 0.0;
  }
  if (mode == ALIGN_MODE_END) {
    return min(extent - (anchor + clipEnd), 0.0);
  }
  return 0.0;
}

${n?`fn collision_match(texCoords: vec2<f32>, pickingColor: vec3<f32>) -> f32 {
  let textureSize = vec2<i32>(textureDimensions(collision_texture));
  let pixelCoords = clamp(
    vec2<i32>(texCoords * vec2<f32>(textureSize)),
    vec2<i32>(0),
    textureSize - vec2<i32>(1)
  );
  let collisionPickingColor = textureLoad(collision_texture, pixelCoords, 0);
  let delta = dot(abs(collisionPickingColor.rgb - pickingColor), vec3<f32>(1.0));
  return step(delta, 0.001);
}

fn collision_is_visible(texCoords: vec2<f32>, pickingColor: vec3<f32>) -> f32 {
  if (collision.enabled == 0) {
    return 1.0;
  }

  var accumulator = 0.0;
  let stepSize = vec2<f32>(1.0) / project.viewportSize;

  for (var i: i32 = -2; i <= 2; i = i + 1) {
    for (var j: i32 = -2; j <= 2; j = j + 1) {
      let delta = vec2<f32>(f32(j), f32(i)) * stepSize;
      accumulator = accumulator + collision_match(texCoords + delta, pickingColor);
    }
  }

  return pow(accumulator / 25.0, 2.2);
}
`:""}

struct Attributes {
  @location(0) positions: vec2<f32>,

  @location(1) instancePositions: vec3<f32>,
  @location(2) instancePositions64Low: vec3<f32>,
  @location(3) instanceSizes: f32,
  @location(4) instanceAngles: f32,
  @location(5) instanceColors: vec4<f32>,
  @location(6) instanceIconFrames: vec4<f32>,
  @location(7) instanceColorModes: f32,
  @location(8) instanceOffsets: vec2<f32>,
  @location(9) instancePixelOffset: vec2<f32>,
  @location(10) rowIndexes: u32,
  @location(11) instanceClipRect: vec4<f32>,
  ${n?"@location(12) collisionPriorities: f32,":""}
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
  geometry.worldPosition = inp.instancePositions;
  geometry.uv = inp.positions;
  geometry.pickingColor = picking_getPickingColorFromIndex(inp.rowIndexes);

  var outp: Varyings;
  outp.uv = inp.positions;

  let iconSize = inp.instanceIconFrames.zw;

  let sizePixels = clamp(
    project_unit_size_to_pixel(inp.instanceSizes * icon.sizeScale, icon.sizeUnits),
    icon.sizeMinPixels, icon.sizeMaxPixels
  );
  let instanceScale = sizePixels / text.fontSize;

  var pixelOffset = inp.positions / 2.0 * iconSize + inp.instanceOffsets;
  pixelOffset = rotate_by_angle(pixelOffset, inp.instanceAngles) * instanceScale;
  pixelOffset = pixelOffset + inp.instancePixelOffset;
  pixelOffset.y = pixelOffset.y * -1.0;

  var pos: vec4<f32>;
  var anchorPosScreen: vec2<f32>;
  if (icon.billboard != 0) {
    pos = project_position_to_clipspace(inp.instancePositions, inp.instancePositions64Low, vec3<f32>(0.0));
    anchorPosScreen = pos.xy / pos.w;

    let clipOffset = project_pixel_size_to_clipspace(pixelOffset);
    pos = vec4<f32>(pos.x + clipOffset.x, pos.y + clipOffset.y, pos.z, pos.w);
  } else {
    var offsetCommon = vec3<f32>(project_pixel_size_vec2(pixelOffset), 0.0);
    if (text.flipY > 0.5) {
      offsetCommon.y = offsetCommon.y * -1.0;
    }
    let anchorPos = project_position_to_clipspace(inp.instancePositions, inp.instancePositions64Low, vec3<f32>(0.0));
    anchorPosScreen = anchorPos.xy / anchorPos.w;
    pos = project_position_to_clipspace(inp.instancePositions, inp.instancePositions64Low, offsetCommon);
  }

  anchorPosScreen = vec2<f32>(anchorPosScreen.x + 1.0, 1.0 - anchorPosScreen.y) / 2.0 *
    project.viewportSize / project.devicePixelRatio;
  var xy = project_size_vec2(inp.instanceClipRect.xy) * project.scale;
  var wh = project_size_vec2(inp.instanceClipRect.zw) * project.scale;

  if (text.flipY > 0.5) {
    xy.y = -xy.y - wh.y;
  }
  if (text.align.x > 0 || text.align.y > 0) {
    let viewportPixels = project.viewportSize / project.devicePixelRatio;
    let scrollPixels = vec2<f32>(
      get_pixel_offset_from_alignment(anchorPosScreen.x, viewportPixels.x, xy.x, xy.x + wh.x, text.align.x),
      -get_pixel_offset_from_alignment(anchorPosScreen.y, viewportPixels.y, -xy.y - wh.y, -xy.y, text.align.y)
    );
    pixelOffset = pixelOffset + scrollPixels;
    let scrollClipOffset = project_pixel_size_to_clipspace(scrollPixels);
    pos.x = pos.x + scrollClipOffset.x;
    pos.y = pos.y + scrollClipOffset.y;
  }

  if (inp.instanceClipRect.z >= 0.0) {
    if (pixelOffset.x < xy.x || pixelOffset.x > xy.x + wh.x) {
      pos = vec4<f32>(0.0);
    } else if (text.cutoffPixels.x > 0.0) {
      let viewportWidth = project.viewportSize.x / project.devicePixelRatio;
      let left = max(anchorPosScreen.x + xy.x, 0.0);
      let right = min(anchorPosScreen.x + xy.x + wh.x, viewportWidth);
      if (right - left < text.cutoffPixels.x) {
        pos = vec4<f32>(0.0);
      }
    }
  }
  if (inp.instanceClipRect.w >= 0.0) {
    if (pixelOffset.y < xy.y || pixelOffset.y > xy.y + wh.y) {
      pos = vec4<f32>(0.0);
    } else if (text.cutoffPixels.y > 0.0) {
      let viewportHeight = project.viewportSize.y / project.devicePixelRatio;
      let top = max(anchorPosScreen.y - xy.y - wh.y, 0.0);
      let bottom = min(anchorPosScreen.y - xy.y, viewportHeight);
      if (bottom - top < text.cutoffPixels.y) {
        pos = vec4<f32>(0.0);
      }
    }
  }

  ${n?`  if (collision.sort != 0) {
    pos.z = -0.001 * inp.collisionPriorities * pos.w;
  }
  `:""}

  let uvMix = (inp.positions.xy + vec2<f32>(1.0, 1.0)) * 0.5;
  outp.vTextureCoords = mix(inp.instanceIconFrames.xy, inp.instanceIconFrames.xy + iconSize, uvMix) / icon.iconsTextureDim;

  outp.position = pos;
  outp.vColor = inp.instanceColors;
  outp.vColorMode = inp.instanceColorModes;
  outp.pickingColor = picking_getPickingColorFromIndex(inp.rowIndexes);

  return outp;
}

@fragment
fn fragmentMain(inp: Varyings) -> @location(0) vec4<f32> {
  geometry.uv = inp.uv;

  let texColor = textureSample(iconsTexture, iconsTextureSampler, inp.vTextureCoords);
  var alpha = texColor.a;
  var color = inp.vColor;

  if (sdf.enabled > 0.5) {
    let distance = alpha;
    alpha = smoothstep(sdf.buffer - sdf.gamma, sdf.buffer + sdf.gamma, distance);

    if (sdf.outlineBuffer > 0.0) {
      let inFill = alpha;
      let inBorder = smoothstep(sdf.outlineBuffer - sdf.gamma, sdf.outlineBuffer + sdf.gamma, distance);
      color = mix(sdf.outlineColor, inp.vColor, inFill);
      alpha = inBorder;
    }
  } else if (inp.vColorMode == 0.0) {
    color = texColor;
  }

  var a = alpha * color.a * layer.opacity;
  if (a < icon.alphaCutoff) {
    discard;
  }

  if (picking.isActive > 0.5) {
    if (!picking_isColorValid(inp.pickingColor)) {
      discard;
    }
    return vec4<f32>(inp.pickingColor, 1.0);
  }

  ${n?`  let collisionFade = collision_is_visible(inp.position.xy / project.viewportSize, inp.pickingColor);
  a = a * collisionFade;
  if (a <= 0.0001) {
    discard;
  }
  `:""}

  var fragColor = deckgl_premultiplied_alpha(vec4<f32>(color.rgb, a));

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
`}const tp=ep(),Ni=192/256,ip={getIconOffsets:{type:"accessor",value:n=>n.offsets},getContentBox:{type:"accessor",value:[0,0,-1,-1]},fontSize:1,alphaCutoff:.001,smoothing:.1,outlineWidth:0,outlineColor:{type:"color",value:[0,0,0,255]},contentCutoffPixels:{type:"array",value:[0,0]},contentAlignHorizontal:"none",contentAlignVertical:"none"};class Tn extends ui{getShaders(){const e=super.getShaders();return{...e,modules:[...e.modules,Ur,Zh],vs:Jh,fs:Qh,source:tp}}initializeState(){super.initializeState();const e=this.getAttributeManager(),t=e.attributes.instanceIconDefs;t.settings.update=this.calculateInstanceIconDefs,e.addInstanced({rowIndexes:{type:"uint32",size:1,bufferGroup:"icon-instance-data",accessor:(i,{index:s})=>s},instanceClipRect:{size:4,bufferGroup:"icon-instance-data",accessor:"getContentBox",defaultValue:[0,0,-1,-1]}})}updateState(e){super.updateState(e);const{props:t,oldProps:i,changeFlags:s}=e,{outlineColor:o}=t;if(s.extensionsChanged){this.state.fillModel?.destroy();const r=this.context.device.type==="webgpu"?this._getModel(`${this.props.id}-fill`):void 0;this.setState({fillModel:r,models:r?[this.state.model,r]:[this.state.model]})}if(s.updateTriggersChanged&&(s.updateTriggersChanged.getIcon||s.updateTriggersChanged.getIconOffsets)&&this.getAttributeManager().invalidate("instanceIconDefs"),o!==i.outlineColor){const r=[o[0]/255,o[1]/255,o[2]/255,(o[3]??255)/255];this.setState({outlineColor:r})}!t.sdf&&t.outlineWidth&&Y.warn(`${this.id}: fontSettings.sdf is required to render outline`)()}draw(e){const{sdf:t,smoothing:i,fontSize:s,outlineWidth:o,contentCutoffPixels:r,contentAlignHorizontal:a,contentAlignVertical:c}=this.props,{outlineColor:l}=this.state,u=o?Math.max(i,Ni*(1-o)):-1,f=this.state.model,d={buffer:Ni,outlineBuffer:u,gamma:i,enabled:!!t,outlineColor:l},h={contentCutoffPixels:r,contentAlignHorizontal:a,contentAlignVertical:c,fontSize:s,viewport:this.context.viewport};if(f.shaderInputs.setProps({sdf:d,text:h}),super.draw(e),t&&o){const{iconManager:p}=this.state;if(p.getTexture()){const y=this.state.fillModel||f;y.shaderInputs.setProps({sdf:{...d,outlineBuffer:Ni},text:h}),this._drawModel(y)}}}calculateInstanceIconDefs(e,{startRow:t,endRow:i}){const{data:s,getIcon:o,getIconOffsets:r}=this.props;let a=e.getVertexOffset(t);const c=e.value,{iterable:l,objectInfo:u}=Ae(s,t,i);for(const f of l){u.index++;const d=o(f,u),h=r(f,u);if(d){let p=0;for(const g of Array.from(d)){const y=super.getInstanceIconDef(g);y[0]=h[p*2],y[1]+=h[p*2+1],y[6]=1,c.set(y,a),a+=e.size,p++}}}}}Tn.defaultProps=ip;Tn.layerName="MultiIconLayer";const it=1e20,En=new Float64Array(256);for(let n=0;n<256;n++){const e=.5-Math.pow(n/255,.45454545454545453);En[n]=e*Math.abs(e)}En[255]=-it;class np{constructor({fontSize:e=24,buffer:t=3,radius:i=8,cutoff:s=.25,fontFamily:o="sans-serif",fontWeight:r="normal",fontStyle:a="normal",lang:c=null}={}){this.buffer=t,this.radius=i,this.cutoff=s,this.lang=c;const l=this.size=e+t*4,u=this._createCanvas(l),f=this.ctx=u.getContext("2d",{willReadFrequently:!0});f.font=`${a} ${r} ${e}px ${o}`,f.textBaseline="alphabetic",f.textAlign="left",f.fillStyle="black",this.gridOuter=new Float64Array(l*l),this.gridInner=new Float64Array(l*l),this.f=new Float64Array(l),this.z=new Float64Array(l+1),this.v=new Uint16Array(l)}_createCanvas(e){if(typeof OffscreenCanvas<"u")return new OffscreenCanvas(e,e);const t=document.createElement("canvas");return t.width=t.height=e,t}draw(e){const{width:t,actualBoundingBoxAscent:i,actualBoundingBoxDescent:s,actualBoundingBoxLeft:o,actualBoundingBoxRight:r}=this.ctx.measureText(e),a=Math.ceil(i),c=Math.floor(-o),l=Math.max(0,Math.min(this.size-this.buffer,Math.ceil(r)-c)),u=Math.max(0,Math.min(this.size-this.buffer,a+Math.ceil(s))),f=l+2*this.buffer,d=u+2*this.buffer,h=Math.max(f*d,0),p=new Uint8ClampedArray(h),g={data:p,width:f,height:d,glyphWidth:l,glyphHeight:u,glyphTop:a,glyphLeft:c,glyphAdvance:t};if(l===0||u===0)return g;const{ctx:y,buffer:b,gridInner:P,gridOuter:x}=this;this.lang&&(y.lang=this.lang),y.clearRect(b,b,l,u),y.fillText(e,b-c,b+a);const w=y.getImageData(b,b,l,u);x.fill(it,0,h),P.fill(0,0,h);let T=3;for(let O=0;O<u;O++){let B=(O+b)*f+b;for(let Z=0;Z<l;Z++,T+=4,B++){const X=w.data[T];if(X===0)continue;const q=En[X];x[B]=Math.max(0,q),P[B]=Math.max(0,-q)}}Ws(x,0,0,f,d,f,this.f,this.v,this.z);const E=Math.min(b,1);Ws(P,b-E,b-E,l+2*E,u+2*E,f,this.f,this.v,this.z);const F=255/this.radius,D=255*(1-this.cutoff);for(let O=0;O<h;O++){const B=Math.sqrt(x[O])-Math.sqrt(P[O]);p[O]=Math.round(D-F*B)}return g}}function Ws(n,e,t,i,s,o,r,a,c){for(let l=e;l<e+i;l++)Hs(n,t*o+l,o,s,r,a,c);for(let l=t;l<t+s;l++)Hs(n,l*o+e,1,i,r,a,c)}function Hs(n,e,t,i,s,o,r){o[0]=0,r[0]=-it,r[1]=it,s[0]=n[e];for(let a=1,c=0,l=0;a<i;a++){s[a]=n[e+a*t];const u=a*a;do{const f=o[c];l=(s[a]-s[f]+u-f*f)/(a-f)/2}while(l<=r[c]&&--c>-1);c++,o[c]=a,r[c]=l,r[c+1]=it}for(let a=0,c=0;a<i;a++){for(;r[c+1]<a;)c++;const l=o[c],u=a-l;n[e+a*t]=s[l]+u*u}}const sp=32,op=[];function rp(n){return Math.pow(2,Math.ceil(Math.log2(n)))}function ap({characterSet:n,measureText:e,buffer:t,maxCanvasWidth:i,mapping:s={},xOffset:o=0,yOffsetMin:r=0,yOffsetMax:a=0}){let c=o,l=r,u=a;for(const f of n)if(!s[f]){const{advance:d,width:h,ascent:p,descent:g}=e(f),y=p+g;c+h+t*2>i&&(c=0,l=u),s[f]={x:c+t,y:l+t,width:h,height:y,advance:d,anchorX:h/2,anchorY:p},c+=h+t*2,u=Math.max(u,l+y+t*2)}return{mapping:s,xOffset:c,yOffsetMin:l,yOffsetMax:u,canvasHeight:rp(u)}}function Vr(n,e,t,i){let s=0;for(let o=e;o<t;o++){const r=n[o];s+=i[r]?.advance||0}return s}function jr(n,e,t,i,s,o){let r=e,a=0;for(let c=e;c<t;c++){const l=Vr(n,c,c+1,s);a+l>i&&(r<c&&o.push(c),r=c,a=0),a+=l}return a}function cp(n,e,t,i,s,o){let r=e,a=e,c=e,l=0;for(let u=e;u<t;u++)if((n[u]===" "||n[u+1]===" "||u+1===t)&&(c=u+1),c>a){let f=Vr(n,a,c,s);l+f>i&&(r<a&&(o.push(a),r=a,l=0),f>i&&(f=jr(n,a,c,i,s,o),r=o[o.length-1])),a=c,l+=f}return l}function lp(n,e,t,i,s=0,o){o===void 0&&(o=n.length);const r=[];return e==="break-all"?jr(n,s,o,t,i,r):cp(n,s,o,t,i,r),r}function up(n,e,t,i,s,o){let r=0,a=0;for(let c=e;c<t;c++){const l=n[c],u=i[l];u&&(a=Math.max(a,u.height))}for(let c=e;c<t;c++){const l=n[c],u=i[l];u?(s[c]=r+u.anchorX,r+=u.advance):(Y.warn(`Missing character: ${l} (${l.codePointAt(0)})`)(),s[c]=r,r+=sp)}o[0]=r,o[1]=a}function fp(n,e,t,i,s,o){const r=Array.from(n),a=r.length,c=new Array(a),l=new Array(a),u=new Array(a),f=(i==="break-word"||i==="break-all")&&isFinite(s)&&s>0,d=[0,0],h=[0,0];let p=0,g=e+t/2,y=0,b=0;for(let P=0;P<=a;P++){const x=r[P];if((x===`
`||P===a)&&(b=P),b>y){const w=f?lp(r,i,s,o,y,b):op;for(let T=0;T<=w.length;T++){const E=T===0?y:w[T-1],F=T<w.length?w[T]:b;up(r,E,F,o,c,h);for(let D=E;D<F;D++)l[D]=g,u[D]=h[0];p++,g+=t,d[0]=Math.max(d[0],h[0])}y=b}x===`
`&&(c[y]=0,l[y]=0,u[y]=0,y++)}return d[1]=p*t,{x:c,y:l,rowWidth:u,size:d}}function dp({value:n,length:e,stride:t,offset:i,startIndices:s,characterSet:o}){const r=n.BYTES_PER_ELEMENT,a=t?t/r:1,c=i?i/r:0,l=s[e]||Math.ceil((n.length-c)/a),u=o&&new Set,f=new Array(e);let d=n;if(a>1||c>0){const h=n.constructor;d=new h(l);for(let p=0;p<l;p++)d[p]=n[p*a+c]}for(let h=0;h<e;h++){const p=s[h],g=s[h+1]||l,y=d.subarray(p,g);f[h]=String.fromCodePoint.apply(null,y),u&&y.forEach(u.add,u)}if(u)for(const h of u)o.add(String.fromCodePoint(h));return{texts:f,characterCount:l}}class Gr{constructor(e=5){this._cache={},this._order=[],this.limit=e}get(e){const t=this._cache[e];return t&&(this._deleteOrder(e),this._appendOrder(e)),t}set(e,t){this._cache[e]?(this.delete(e),this._cache[e]=t,this._appendOrder(e)):(Object.keys(this._cache).length===this.limit&&this.delete(this._order[0]),this._cache[e]=t,this._appendOrder(e))}delete(e){this._cache[e]&&(delete this._cache[e],this._deleteOrder(e))}_deleteOrder(e){const t=this._order.indexOf(e);t>=0&&this._order.splice(t,1)}_appendOrder(e){this._order.push(e)}}function hp(){const n=[];for(let e=32;e<128;e++)n.push(String.fromCharCode(e));return n}const ze={fontFamily:"Monaco, monospace",fontWeight:"normal",characterSet:hp(),fontSize:64,buffer:4,sdf:!1,cutoff:.25,radius:12,smoothing:.1},qs=1024,Ys=.9,Xs=.3,$r=3;let ii=new Gr($r);function pp(n,e){let t;typeof e=="string"?t=new Set(Array.from(e)):t=new Set(e);const i=ii.get(n);if(!i)return t;for(const s in i.mapping)t.has(s)&&t.delete(s);return t}function gp(n,e){for(let t=0;t<n.length;t++)e.data[4*t+3]=n[t]}function Zs(n,e,t,i){n.font=`${i} ${t}px ${e}`,n.fillStyle="#000",n.textBaseline="alphabetic",n.textAlign="left"}function mp(n,e,t){if(t===void 0){const s=n.measureText("A");return s.fontBoundingBoxAscent?{advance:0,width:0,ascent:Math.ceil(s.fontBoundingBoxAscent),descent:Math.ceil(s.fontBoundingBoxDescent)}:{advance:0,width:0,ascent:e*Ys,descent:e*Xs}}const i=n.measureText(t);return i.actualBoundingBoxAscent?{advance:i.width,width:Math.ceil(i.actualBoundingBoxRight-i.actualBoundingBoxLeft),ascent:Math.ceil(i.actualBoundingBoxAscent),descent:Math.ceil(i.actualBoundingBoxDescent)}:{advance:i.width,width:i.width,ascent:e*Ys,descent:e*Xs}}function yp(n){Y.assert(Number.isFinite(n)&&n>=$r,"Invalid cache limit"),ii=new Gr(n)}class _p{constructor(){this.props={...ze}}get atlas(){return this._atlas}get mapping(){return this._atlas&&this._atlas.mapping}setProps(e={}){Object.assign(this.props,e),e._getFontRenderer&&(this._getFontRenderer=e._getFontRenderer),this._key=this._getKey();const t=pp(this._key,this.props.characterSet),i=ii.get(this._key);if(i&&t.size===0){this._atlas!==i&&(this._atlas=i);return}const s=this._generateFontAtlas(t,i);this._atlas=s,ii.set(this._key,s)}_generateFontAtlas(e,t){const{fontFamily:i,fontWeight:s,fontSize:o,buffer:r,sdf:a,radius:c,cutoff:l}=this.props;let u=t&&t.data;u||(u=document.createElement("canvas"),u.width=qs);const f=u.getContext("2d",{willReadFrequently:!0});Zs(f,i,o,s);const d=w=>mp(f,o,w);let h;this._getFontRenderer?h=this._getFontRenderer(this.props):a&&(h={measure:d,draw:vp(this.props)});const{mapping:p,canvasHeight:g,xOffset:y,yOffsetMin:b,yOffsetMax:P}=ap({measureText:w=>h?h.measure(w):d(w),buffer:r,characterSet:e,maxCanvasWidth:qs,...t&&{mapping:t.mapping,xOffset:t.xOffset,yOffsetMin:t.yOffsetMin,yOffsetMax:t.yOffsetMax}});if(u.height!==g){const w=u.height>0?f.getImageData(0,0,u.width,u.height):null;u.height=g,w&&f.putImageData(w,0,0)}if(Zs(f,i,o,s),h)for(const w of e){const T=p[w],E=T.width,{data:F,left:D=0,top:O=0}=h.draw(w),B=T.x-D,Z=T.y-O,X=Math.max(0,Math.round(B)),q=Math.max(0,Math.round(Z)),te=Math.min(F.width,u.width-X),ie=Math.min(F.height,u.height-q);f.putImageData(F,X,q,0,0,te,ie),T.x=X,T.y=q,T.width=te,T.height=ie,T.anchorX+=te/2-D-E/2,T.anchorY+=O}else for(const w of e){const T=p[w];f.fillText(w,T.x,T.y+T.anchorY)}const x=h?h.measure():d();return{baselineOffset:(x.ascent-x.descent)/2,xOffset:y,yOffsetMin:b,yOffsetMax:P,mapping:p,data:u,width:u.width,height:u.height}}_getKey(){const{fontFamily:e,fontWeight:t,fontSize:i,buffer:s,sdf:o,radius:r,cutoff:a}=this.props;return o?`${e} ${t} ${i} ${s} ${r} ${a}`:`${e} ${t} ${i} ${s}`}}function vp({fontSize:n,buffer:e,radius:t,cutoff:i,fontFamily:s,fontWeight:o}){const r=new np({fontSize:n,buffer:e,radius:t,cutoff:i,fontFamily:s,fontWeight:`${o}`});return a=>{const{data:c,width:l,height:u}=r.draw(a),f=new ImageData(l,u);return gp(c,f),{data:f,left:e,top:e}}}const bp=`struct TextBackgroundUniforms {
  billboard: f32,
  sizeScale: f32,
  sizeMinPixels: f32,
  sizeMaxPixels: f32,
  borderRadius: vec4<f32>,
  padding: vec4<f32>,
  sizeUnits: i32,
  stroked: f32,
};

@group(0) @binding(auto) var<uniform> textBackground: TextBackgroundUniforms;
`,Ks=`layout(std140) uniform textBackgroundUniforms {
  bool billboard;
  float sizeScale;
  float sizeMinPixels;
  float sizeMaxPixels;
  vec4 borderRadius;
  vec4 padding;
  highp int sizeUnits;
  bool stroked;
} textBackground;
`,xp={name:"textBackground",source:bp,vs:Ks,fs:Ks,uniformTypes:{billboard:"f32",sizeScale:"f32",sizeMinPixels:"f32",sizeMaxPixels:"f32",borderRadius:"vec4<f32>",padding:"vec4<f32>",sizeUnits:"i32",stroked:"f32"}},Pp=`#version 300 es
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
geometry.pickingColor = picking_getPickingColorFromInstanceID();
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
`,wp=`#version 300 es
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
`,Cp=`struct TextUniforms {
  cutoffPixels: vec2<f32>,
  align: vec2<i32>,
  fontSize: f32,
  flipY: f32,
};

@group(0) @binding(auto) var<uniform> text: TextUniforms;

fn rotate_by_angle(vertex: vec2<f32>, angle: f32) -> vec2<f32> {
  let angleRadian = radians(angle);
  let cosine = cos(angleRadian);
  let sine = sin(angleRadian);
  let rotationMatrix = mat2x2<f32>(
    vec2<f32>(cosine, -sine),
    vec2<f32>(sine, cosine)
  );
  return rotationMatrix * vertex;
}

struct Attributes {
  @builtin(instance_index) instanceIndex: u32,
  @location(0) positions: vec2<f32>,
  @location(1) instancePositions: vec3<f32>,
  @location(2) instancePositions64Low: vec3<f32>,
  @location(3) instanceSizes: f32,
  @location(4) instanceAngles: f32,
  @location(5) instanceRects: vec4<f32>,
  @location(6) instanceClipRect: vec4<f32>,
  @location(7) instancePixelOffsets: vec2<f32>,
  @location(8) instanceFillColors: vec4<f32>,
  @location(9) instanceLineColors: vec4<f32>,
  @location(10) instanceLineWidths: f32,
};

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) vFillColor: vec4<f32>,
  @location(1) vLineColor: vec4<f32>,
  @location(2) vLineWidth: f32,
  @location(3) uv: vec2<f32>,
  @location(4) dimensions: vec2<f32>,
  @location(5) pickingColor: vec3<f32>,
};

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
  geometry.worldPosition = attributes.instancePositions;
  geometry.uv = attributes.positions;
  geometry.pickingColor = picking_getPickingColorFromIndex(attributes.instanceIndex);

  var varyings: Varyings;
  varyings.uv = attributes.positions;
  varyings.vLineWidth = attributes.instanceLineWidths;

  let sizePixels = clamp(
    project_unit_size_to_pixel(
      attributes.instanceSizes * textBackground.sizeScale,
      textBackground.sizeUnits
    ),
    textBackground.sizeMinPixels,
    textBackground.sizeMaxPixels
  );
  let instanceScale = sizePixels / text.fontSize;

  varyings.dimensions = attributes.instanceRects.zw * instanceScale +
    textBackground.padding.xy + textBackground.padding.zw;

  var pixelOffset =
    (attributes.positions * attributes.instanceRects.zw + attributes.instanceRects.xy) *
      instanceScale +
    mix(-textBackground.padding.xy, textBackground.padding.zw, attributes.positions);
  pixelOffset = rotate_by_angle(pixelOffset, attributes.instanceAngles);
  pixelOffset = pixelOffset + attributes.instancePixelOffsets;
  pixelOffset.y = pixelOffset.y * -1.0;

  var xy = project_size_vec2(attributes.instanceClipRect.xy) * project.scale;
  let wh = project_size_vec2(attributes.instanceClipRect.zw) * project.scale;
  if (text.flipY > 0.5) {
    xy.y = -xy.y - wh.y;
  }
  if (attributes.instanceClipRect.z >= 0.0) {
    varyings.dimensions.x = wh.x;
    pixelOffset.x = xy.x + varyings.uv.x * wh.x + mix(
      -textBackground.padding.x,
      textBackground.padding.z,
      varyings.uv.x
    );
  }
  if (attributes.instanceClipRect.w >= 0.0) {
    varyings.dimensions.y = wh.y;
    pixelOffset.y = xy.y + varyings.uv.y * wh.y + mix(
      -textBackground.padding.y,
      textBackground.padding.w,
      varyings.uv.y
    );
  }

  if (textBackground.billboard > 0.5) {
    var position = project_position_to_clipspace(
      attributes.instancePositions,
      attributes.instancePositions64Low,
      vec3<f32>(0.0)
    );
    let clipOffset = project_pixel_size_to_clipspace(pixelOffset);
    position = vec4<f32>(
      position.x + clipOffset.x,
      position.y + clipOffset.y,
      position.z,
      position.w
    );
    varyings.position = position;
  } else {
    var offsetCommon = vec3<f32>(project_pixel_size_vec2(pixelOffset), 0.0);
    if (text.flipY > 0.5) {
      offsetCommon.y = offsetCommon.y * -1.0;
    }
    varyings.position = project_position_to_clipspace(
      attributes.instancePositions,
      attributes.instancePositions64Low,
      offsetCommon
    );
  }

  varyings.vFillColor = vec4<f32>(
    attributes.instanceFillColors.rgb,
    attributes.instanceFillColors.a * layer.opacity
  );
  varyings.vLineColor = vec4<f32>(
    attributes.instanceLineColors.rgb,
    attributes.instanceLineColors.a * layer.opacity
  );
  varyings.pickingColor = geometry.pickingColor;
  return varyings;
}

fn round_rect(point: vec2<f32>, size: vec2<f32>, radii: vec4<f32>) -> f32 {
  let pixelPosition = (point - 0.5) * size;
  let halfSize = size * 0.5;
  let maxBorderRadius = min(size.x, size.y) * 0.5;
  var borderRadius = min(radii, vec4<f32>(maxBorderRadius));

  borderRadius = select(borderRadius.zwxy, borderRadius, pixelPosition.x > 0.0);
  let radius = select(borderRadius.y, borderRadius.x, pixelPosition.y > 0.0);
  let q = abs(pixelPosition) - halfSize + radius;
  return -(min(max(q.x, q.y), 0.0) + length(max(q, vec2<f32>(0.0))) - radius);
}

fn rect(point: vec2<f32>, size: vec2<f32>) -> f32 {
  let pixelPosition = point * size;
  return min(
    min(pixelPosition.x, size.x - pixelPosition.x),
    min(pixelPosition.y, size.y - pixelPosition.y)
  );
}

fn get_stroked_frag_color(
  distanceToEdge: f32,
  lineWidth: f32,
  fillColor: vec4<f32>,
  lineColor: vec4<f32>
) -> vec4<f32> {
  let isBorder = smoothedge(distanceToEdge, lineWidth);
  return mix(fillColor, lineColor, isBorder);
}

@fragment
fn fragmentMain(varyings: Varyings) -> @location(0) vec4<f32> {
  geometry.uv = varyings.uv;
  var fragColor: vec4<f32>;

  if (any(textBackground.borderRadius != vec4<f32>(0.0))) {
    let distanceToEdge = round_rect(
      varyings.uv,
      varyings.dimensions,
      textBackground.borderRadius
    );
    let shapeAlpha = smoothedge(-distanceToEdge, 0.0);
    if (shapeAlpha == 0.0) {
      discard;
    }
    if (textBackground.stroked > 0.5) {
      fragColor = get_stroked_frag_color(
        distanceToEdge,
        varyings.vLineWidth,
        varyings.vFillColor,
        varyings.vLineColor
      );
    } else {
      fragColor = varyings.vFillColor;
    }
    fragColor.a = fragColor.a * shapeAlpha;
  } else if (textBackground.stroked > 0.5) {
    let distanceToEdge = rect(varyings.uv, varyings.dimensions);
    fragColor = get_stroked_frag_color(
      distanceToEdge,
      varyings.vLineWidth,
      varyings.vFillColor,
      varyings.vLineColor
    );
  } else {
    fragColor = varyings.vFillColor;
  }

  if (picking.isActive > 0.5) {
    if (!picking_isColorValid(varyings.pickingColor)) {
      discard;
    }
    return vec4<f32>(varyings.pickingColor, 1.0);
  }

  if (picking.isHighlightActive > 0.5) {
    let highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
    if (picking_isColorZero(abs(varyings.pickingColor - highlightedObjectColor))) {
      let highlightAlpha = picking.highlightColor.a;
      let blendedAlpha = highlightAlpha + fragColor.a * (1.0 - highlightAlpha);
      if (blendedAlpha > 0.0) {
        let highlightRatio = highlightAlpha / blendedAlpha;
        fragColor = vec4<f32>(
          mix(fragColor.rgb, picking.highlightColor.rgb, highlightRatio),
          blendedAlpha
        );
      } else {
        fragColor = vec4<f32>(fragColor.rgb, 0.0);
      }
    }
  }

  return deckgl_premultiplied_alpha(fragColor);
}
`,Lp={billboard:!0,sizeScale:1,sizeUnits:"pixels",sizeMinPixels:0,sizeMaxPixels:Number.MAX_SAFE_INTEGER,fontSize:1,borderRadius:{type:"object",value:0},padding:{type:"array",value:[0,0,0,0]},getPosition:{type:"accessor",value:n=>n.position},getSize:{type:"accessor",value:1},getAngle:{type:"accessor",value:0},getPixelOffset:{type:"accessor",value:[0,0]},getBoundingRect:{type:"accessor",value:[0,0,0,0]},getClipRect:{type:"accessor",value:[0,0,-1,-1]},getFillColor:{type:"accessor",value:[0,0,0,255]},getLineColor:{type:"accessor",value:[0,0,0,255]},getLineWidth:{type:"accessor",value:1}};class In extends _e{getShaders(){return super.getShaders({vs:Pp,fs:wp,source:Cp,modules:[Ue,ke,Ve,xp,Ur]})}initializeState(){this.getAttributeManager().addInstanced({instancePositions:{size:3,type:"float64",fp64:this.use64bitPositions(),transition:!0,accessor:"getPosition"},instanceSizes:{size:1,transition:!0,bufferGroup:"text-background-instance-data",accessor:"getSize",defaultValue:1},instanceAngles:{size:1,transition:!0,bufferGroup:"text-background-instance-data",accessor:"getAngle"},instanceRects:{size:4,bufferGroup:"text-background-instance-data",accessor:"getBoundingRect"},instanceClipRect:{size:4,bufferGroup:"text-background-instance-data",accessor:"getClipRect",defaultValue:[0,0,-1,-1]},instancePixelOffsets:{size:2,transition:!0,bufferGroup:"text-background-instance-data",accessor:"getPixelOffset"},instanceFillColors:{size:4,transition:!0,type:"unorm8",accessor:"getFillColor",defaultValue:[0,0,0,255]},instanceLineColors:{size:4,transition:!0,type:"unorm8",accessor:"getLineColor",defaultValue:[0,0,0,255]},instanceLineWidths:{size:1,transition:!0,bufferGroup:"text-background-instance-data",accessor:"getLineWidth",defaultValue:1}})}updateState(e){super.updateState(e);const{changeFlags:t}=e;t.extensionsChanged&&(this.state.model?.destroy(),this.state.model=this._getModel(),this.getAttributeManager().invalidateAll())}draw({uniforms:e}){const{billboard:t,sizeScale:i,sizeUnits:s,sizeMinPixels:o,sizeMaxPixels:r,getLineWidth:a,fontSize:c}=this.props;let{padding:l,borderRadius:u}=this.props;l.length<4&&(l=[l[0],l[1],l[0],l[1]]),Array.isArray(u)||(u=[u,u,u,u]);const f=this.state.model,d={billboard:t,stroked:!!a,borderRadius:u,padding:l,sizeUnits:st[s],sizeScale:i,sizeMinPixels:o,sizeMaxPixels:r},h={fontSize:c,viewport:this.context.viewport};f.shaderInputs.setProps({textBackground:d,text:h}),f.draw(this.context.renderPass)}_getModel(){const e=[0,0,1,0,0,1,1,1];return new re(this.context.device,{...this.getShaders(),id:this.props.id,bufferLayout:this.getAttributeManager().getBufferLayouts(),geometry:new pe({topology:"triangle-strip",vertexCount:4,attributes:{positions:{size:2,value:new Float32Array(e)}}}),isInstanced:!0})}}In.defaultProps=Lp;In.layerName="TextBackgroundLayer";const Js={start:1,middle:0,end:-1},Qs={top:1,center:0,bottom:-1},Fi=[0,0,0,255],Sp=1,Ap={billboard:!0,sizeScale:1,sizeUnits:"pixels",sizeMinPixels:0,sizeMaxPixels:Number.MAX_SAFE_INTEGER,background:!1,getBackgroundColor:{type:"accessor",value:[255,255,255,255]},getBorderColor:{type:"accessor",value:Fi},getBorderWidth:{type:"accessor",value:0},backgroundBorderRadius:{type:"object",value:0},backgroundPadding:{type:"array",value:[0,0,0,0]},characterSet:{type:"object",value:ze.characterSet},fontFamily:ze.fontFamily,fontWeight:ze.fontWeight,lineHeight:Sp,outlineWidth:{type:"number",value:0,min:0},outlineColor:{type:"color",value:Fi},fontSettings:{type:"object",value:{},compare:1},wordBreak:"break-word",maxWidth:{type:"number",value:-1},contentCutoffPixels:{type:"array",value:[0,0]},contentAlignHorizontal:"none",contentAlignVertical:"none",getText:{type:"accessor",value:n=>n.text},getPosition:{type:"accessor",value:n=>n.position},getColor:{type:"accessor",value:Fi},getSize:{type:"accessor",value:32},getAngle:{type:"accessor",value:0},getTextAnchor:{type:"accessor",value:"middle"},getAlignmentBaseline:{type:"accessor",value:"center"},getPixelOffset:{type:"accessor",value:[0,0]},getContentBox:{type:"accessor",value:[0,0,-1,-1]},backgroundColor:{deprecatedFor:["background","getBackgroundColor"]}};class di extends Te{constructor(){super(...arguments),this.getBoundingRect=(e,t)=>{const{size:[i,s]}=this.transformParagraph(e,t),{getTextAnchor:o,getAlignmentBaseline:r}=this.props,a=Js[typeof o=="function"?o(e,t):o],c=Qs[typeof r=="function"?r(e,t):r];return[(a-1)*i/2,(c-1)*s/2,i,s]},this.getIconOffsets=(e,t)=>{const{getTextAnchor:i,getAlignmentBaseline:s}=this.props,{x:o,y:r,rowWidth:a,size:[,c]}=this.transformParagraph(e,t),l=Js[typeof i=="function"?i(e,t):i],u=Qs[typeof s=="function"?s(e,t):s],f=o.length,d=new Array(f*2);let h=0;for(let p=0;p<f;p++)d[h++]=(l-1)*a[p]/2+o[p],d[h++]=(u-1)*c/2+r[p];return d}}initializeState(){this.state={styleVersion:0,fontAtlasManager:new _p},this.props.maxWidth>0&&Y.once(1,"v8.9 breaking change: TextLayer maxWidth is now relative to text size")()}updateState(e){const{props:t,oldProps:i,changeFlags:s}=e;(s.dataChanged||s.updateTriggersChanged&&(s.updateTriggersChanged.all||s.updateTriggersChanged.getText))&&this._updateText(),(this._updateFontAtlas()||t.lineHeight!==i.lineHeight||t.wordBreak!==i.wordBreak||t.maxWidth!==i.maxWidth)&&this.setState({styleVersion:this.state.styleVersion+1})}getPickingInfo({info:e}){return e.object=e.index>=0?this.props.data[e.index]:null,e}_updateFontAtlas(){const{fontSettings:e,fontFamily:t,fontWeight:i,_getFontRenderer:s}=this.props,{fontAtlasManager:o,characterSet:r}=this.state,a={...e,characterSet:r,fontFamily:t,fontWeight:i,_getFontRenderer:s};if(!o.mapping)return o.setProps(a),!0;for(const c in a)if(a[c]!==o.props[c])return o.setProps(a),!0;return!1}_updateText(){const{data:e,characterSet:t}=this.props,i=e.attributes?.getText;let{getText:s}=this.props,o=e.startIndices,r;const a=t==="auto"&&new Set;if(i&&o){const{texts:c,characterCount:l}=dp({...ArrayBuffer.isView(i)?{value:i}:i,length:e.length,startIndices:o,characterSet:a});r=l,s=(u,{index:f})=>c[f]}else{const{iterable:c,objectInfo:l}=Ae(e);o=[0],r=0;for(const u of c){l.index++;const f=Array.from(s(u,l)||"");a&&f.forEach(a.add,a),r+=f.length,o.push(r)}}this.setState({getText:s,startIndices:o,numInstances:r,characterSet:a||t})}transformParagraph(e,t){const{fontAtlasManager:i}=this.state,s=i.mapping,{baselineOffset:o}=i.atlas,{fontSize:r}=i.props,a=this.state.getText,{wordBreak:c,lineHeight:l,maxWidth:u}=this.props,f=a(e,t)||"";return fp(f,o,l*r,c,u*r,s)}renderLayers(){const{startIndices:e,numInstances:t,getText:i,fontAtlasManager:{atlas:s,mapping:o},styleVersion:r}=this.state,{data:a,_dataDiff:c,getPosition:l,getColor:u,getSize:f,getAngle:d,getPixelOffset:h,getBackgroundColor:p,getBorderColor:g,getBorderWidth:y,getContentBox:b,backgroundBorderRadius:P,backgroundPadding:x,background:w,billboard:T,fontSettings:E,outlineWidth:F,outlineColor:D,sizeScale:O,sizeUnits:B,sizeMinPixels:Z,sizeMaxPixels:X,contentCutoffPixels:q,contentAlignHorizontal:te,contentAlignVertical:ie,transitions:m,updateTriggers:v}=this.props,_=this.getSubLayerClass("characters",Tn),C=this.getSubLayerClass("background",In),{fontSize:L}=this.state.fontAtlasManager.props;return[w&&new C({getFillColor:p,getLineColor:g,getLineWidth:y,borderRadius:P,padding:x,getPosition:l,getSize:f,getAngle:d,getPixelOffset:h,getClipRect:b,billboard:T,sizeScale:O,sizeUnits:B,sizeMinPixels:Z,sizeMaxPixels:X,fontSize:L,transitions:m&&{getPosition:m.getPosition,getAngle:m.getAngle,getSize:m.getSize,getFillColor:m.getBackgroundColor,getLineColor:m.getBorderColor,getLineWidth:m.getBorderWidth,getPixelOffset:m.getPixelOffset}},this.getSubLayerProps({id:"background",updateTriggers:{getPosition:v.getPosition,getAngle:v.getAngle,getSize:v.getSize,getFillColor:v.getBackgroundColor,getLineColor:v.getBorderColor,getLineWidth:v.getBorderWidth,getPixelOffset:v.getPixelOffset,getBoundingRect:{getText:v.getText,getTextAnchor:v.getTextAnchor,getAlignmentBaseline:v.getAlignmentBaseline,styleVersion:r}}}),{data:a.attributes&&a.attributes.background?{length:a.length,attributes:a.attributes.background}:a,_dataDiff:c,autoHighlight:!1,getBoundingRect:this.getBoundingRect}),new _({sdf:E.sdf,smoothing:Number.isFinite(E.smoothing)?E.smoothing:ze.smoothing,outlineWidth:F/(E.radius||ze.radius),outlineColor:D,iconAtlas:s,iconMapping:o,getPosition:l,getColor:u,getSize:f,getAngle:d,getPixelOffset:h,getContentBox:b,billboard:T,sizeScale:O,sizeUnits:B,sizeMinPixels:Z,sizeMaxPixels:X,fontSize:L,contentCutoffPixels:q,contentAlignHorizontal:te,contentAlignVertical:ie,transitions:m&&{getPosition:m.getPosition,getAngle:m.getAngle,getColor:m.getColor,getSize:m.getSize,getPixelOffset:m.getPixelOffset,getContentBox:m.getContentBox}},this.getSubLayerProps({id:"characters",updateTriggers:{all:v.getText,getPosition:v.getPosition,getAngle:v.getAngle,getColor:v.getColor,getSize:v.getSize,getPixelOffset:v.getPixelOffset,getContentBox:v.getContentBox,getIconOffsets:{getTextAnchor:v.getTextAnchor,getAlignmentBaseline:v.getAlignmentBaseline,styleVersion:r}}}),{data:a,_dataDiff:c,startIndices:e,numInstances:t,getIconOffsets:this.getIconOffsets,getIcon:i})]}static set fontAtlasCacheLimit(e){yp(e)}}di.defaultProps=Ap;di.layerName="TextLayer";const jt={circle:{type:Sn,props:{filled:"filled",stroked:"stroked",lineWidthMaxPixels:"lineWidthMaxPixels",lineWidthMinPixels:"lineWidthMinPixels",lineWidthScale:"lineWidthScale",lineWidthUnits:"lineWidthUnits",pointRadiusMaxPixels:"radiusMaxPixels",pointRadiusMinPixels:"radiusMinPixels",pointRadiusScale:"radiusScale",pointRadiusUnits:"radiusUnits",pointAntialiasing:"antialiasing",pointBillboard:"billboard",getFillColor:"getFillColor",getLineColor:"getLineColor",getLineWidth:"getLineWidth",getPointRadius:"getRadius"}},icon:{type:ui,props:{iconAtlas:"iconAtlas",iconMapping:"iconMapping",iconSizeMaxPixels:"sizeMaxPixels",iconSizeMinPixels:"sizeMinPixels",iconSizeScale:"sizeScale",iconSizeUnits:"sizeUnits",iconAlphaCutoff:"alphaCutoff",iconBillboard:"billboard",getIcon:"getIcon",getIconAngle:"getAngle",getIconColor:"getColor",getIconPixelOffset:"getPixelOffset",getIconSize:"getSize"}},text:{type:di,props:{textSizeMaxPixels:"sizeMaxPixels",textSizeMinPixels:"sizeMinPixels",textSizeScale:"sizeScale",textSizeUnits:"sizeUnits",textBackground:"background",textBackgroundPadding:"backgroundPadding",textFontFamily:"fontFamily",textFontWeight:"fontWeight",textLineHeight:"lineHeight",textMaxWidth:"maxWidth",textOutlineColor:"outlineColor",textOutlineWidth:"outlineWidth",textWordBreak:"wordBreak",textCharacterSet:"characterSet",textBillboard:"billboard",textFontSettings:"fontSettings",getText:"getText",getTextAngle:"getAngle",getTextColor:"getColor",getTextPixelOffset:"getPixelOffset",getTextSize:"getSize",getTextAnchor:"getTextAnchor",getTextAlignmentBaseline:"getAlignmentBaseline",getTextBackgroundColor:"getBackgroundColor",getTextBorderColor:"getBorderColor",getTextBorderWidth:"getBorderWidth"}}},Gt={type:ht,props:{lineWidthUnits:"widthUnits",lineWidthScale:"widthScale",lineWidthMinPixels:"widthMinPixels",lineWidthMaxPixels:"widthMaxPixels",lineJointRounded:"jointRounded",lineCapRounded:"capRounded",lineMiterLimit:"miterLimit",lineBillboard:"billboard",lineAntialiasing:"antialiasing",getLineColor:"getColor",getLineWidth:"getWidth"}},dn={type:fi,props:{extruded:"extruded",filled:"filled",wireframe:"wireframe",elevationScale:"elevationScale",material:"material",_full3d:"_full3d",getElevation:"getElevation",getFillColor:"getFillColor",getLineColor:"getLineColor"}};function Ye({type:n,props:e}){const t={};for(const i in e)t[i]=n.defaultProps[e[i]];return t}function Di(n,e,t="getPosition"){const{transitions:i,updateTriggers:s}=n.props,o={updateTriggers:{},transitions:i&&{[t]:i.geometry}};for(const r in e){const a=e[r];let c=n.props[r];r.startsWith("get")&&(c=n.getSubLayerAccessor(c),o.updateTriggers[a]=s[r],i&&(o.transitions[a]=i[r])),o[a]=c}return o}function Tp(n){if(Array.isArray(n))return n;switch(Y.assert(n.type,"GeoJSON does not have type"),n.type){case"Feature":return[n];case"FeatureCollection":return Y.assert(Array.isArray(n.features),"GeoJSON does not have features array"),n.features;default:return[{geometry:n}]}}function eo(n,e,t={}){const i={pointFeatures:[],lineFeatures:[],polygonFeatures:[],polygonOutlineFeatures:[]},{startRow:s=0,endRow:o=n.length}=t;for(let r=s;r<o;r++){const a=n[r],{geometry:c}=a;if(c)if(c.type==="GeometryCollection"){Y.assert(Array.isArray(c.geometries),"GeoJSON does not have geometries array");const{geometries:l}=c;for(let u=0;u<l.length;u++){const f=l[u];to(f,i,e,a,r)}}else to(c,i,e,a,r)}return i}function to(n,e,t,i,s){const{type:o,coordinates:r}=n,{pointFeatures:a,lineFeatures:c,polygonFeatures:l,polygonOutlineFeatures:u}=e;if(!Ip(o,r)){Y.warn(`${o} coordinates are malformed`)();return}switch(o){case"Point":a.push(t({geometry:n},i,s));break;case"MultiPoint":r.forEach(f=>{a.push(t({geometry:{type:"Point",coordinates:f}},i,s))});break;case"LineString":c.push(t({geometry:n},i,s));break;case"MultiLineString":r.forEach(f=>{c.push(t({geometry:{type:"LineString",coordinates:f}},i,s))});break;case"Polygon":l.push(t({geometry:n},i,s)),r.forEach(f=>{u.push(t({geometry:{type:"LineString",coordinates:f}},i,s))});break;case"MultiPolygon":r.forEach(f=>{l.push(t({geometry:{type:"Polygon",coordinates:f}},i,s)),f.forEach(d=>{u.push(t({geometry:{type:"LineString",coordinates:d}},i,s))})});break}}const Ep={Point:1,MultiPoint:2,LineString:2,MultiLineString:3,Polygon:3,MultiPolygon:4};function Ip(n,e){let t=Ep[n];for(Y.assert(t,`Unknown GeoJSON type ${n}`);e&&--t>0;)e=e[0];return e&&Number.isFinite(e[0])}function Wr(){return{points:{},lines:{},polygons:{},polygonsOutline:{}}}function Lt(n){return n.geometry.coordinates}function Mp(n,e){const t=Wr(),{pointFeatures:i,lineFeatures:s,polygonFeatures:o,polygonOutlineFeatures:r}=n;return t.points.data=i,t.points._dataDiff=e.pointFeatures&&(()=>e.pointFeatures),t.points.getPosition=Lt,t.lines.data=s,t.lines._dataDiff=e.lineFeatures&&(()=>e.lineFeatures),t.lines.getPath=Lt,t.polygons.data=o,t.polygons._dataDiff=e.polygonFeatures&&(()=>e.polygonFeatures),t.polygons.getPolygon=Lt,t.polygonsOutline.data=r,t.polygonsOutline._dataDiff=e.polygonOutlineFeatures&&(()=>e.polygonOutlineFeatures),t.polygonsOutline.getPath=Lt,t}function Bp(n){const e=Wr(),{points:t,lines:i,polygons:s}=n,o=Xh(n);e.points.data={length:t.positions.value.length/t.positions.size,attributes:{...t.attributes,getPosition:t.positions,rowIndexes:{size:1,type:"uint32",value:o.points}},properties:t.properties,numericProps:t.numericProps,featureIds:t.featureIds},e.lines.data={length:i.pathIndices.value.length-1,startIndices:i.pathIndices.value,attributes:{...i.attributes,getPath:i.positions,rowIndexes:{size:1,type:"uint32",value:o.lines}},properties:i.properties,numericProps:i.numericProps,featureIds:i.featureIds},e.lines._pathType="open";const r=s.positions.value.length/s.positions.size,a=Array(r).fill(1);for(const c of s.primitivePolygonIndices.value)a[c-1]=0;return e.polygons.data={length:s.polygonIndices.value.length-1,startIndices:s.polygonIndices.value,attributes:{...s.attributes,getPolygon:s.positions,instanceVertexValid:{size:1,value:new Uint16Array(a)},rowIndexes:{size:1,type:"uint32",value:o.polygons}},properties:s.properties,numericProps:s.numericProps,featureIds:s.featureIds},e.polygons._normalize=!1,s.triangles&&(e.polygons.data.attributes.indices=s.triangles.value),e.polygonsOutline.data={length:s.primitivePolygonIndices.value.length-1,startIndices:s.primitivePolygonIndices.value,attributes:{...s.attributes,getPath:s.positions,rowIndexes:{size:1,type:"uint32",value:o.polygons}},properties:s.properties,numericProps:s.numericProps,featureIds:s.featureIds},e.polygonsOutline._pathType="open",e}const Op=["points","linestrings","polygons"],Rp={...Ye(jt.circle),...Ye(jt.icon),...Ye(jt.text),...Ye(Gt),...Ye(dn),stroked:!0,filled:!0,extruded:!1,wireframe:!1,_full3d:!1,iconAtlas:{type:"object",value:null},iconMapping:{type:"object",value:{}},getIcon:{type:"accessor",value:n=>n.properties.icon},getText:{type:"accessor",value:n=>n.properties.text},pointType:"circle",getRadius:{deprecatedFor:"getPointRadius"}};class Mn extends Te{initializeState(){this.state={layerProps:{},features:{},featuresDiff:{}}}updateState({props:e,changeFlags:t}){if(!t.dataChanged)return;const{data:i}=this.props,s=i&&"points"in i&&"polygons"in i&&"lines"in i;this.setState({binary:s}),s?this._updateStateBinary({props:e,changeFlags:t}):this._updateStateJSON({props:e,changeFlags:t})}_updateStateBinary({props:e,changeFlags:t}){const i=Bp(e.data);this.setState({layerProps:i})}_updateStateJSON({props:e,changeFlags:t}){const i=Tp(e.data),s=this.getSubLayerRow.bind(this);let o={};const r={};if(Array.isArray(t.dataChanged)){const c=this.state.features;for(const l in c)o[l]=c[l].slice(),r[l]=[];for(const l of t.dataChanged){const u=eo(i,s,l);for(const f in c)r[f].push(Dr({data:o[f],getIndex:d=>d.__source.index,dataRange:l,replace:u[f]}))}}else o=eo(i,s);const a=Mp(o,r);this.setState({features:o,featuresDiff:r,layerProps:a})}getPickingInfo(e){const t=super.getPickingInfo(e),{index:i,sourceLayer:s}=t;return t.featureType=Op.find(o=>s.id.startsWith(`${this.id}-${o}-`)),i>=0&&s.id.startsWith(`${this.id}-points-text`)&&this.state.binary&&(t.index=this.props.data.points.globalFeatureIds.value[i]),t}_updateAutoHighlight(e){const t=`${this.id}-points-`,i=e.featureType==="points";for(const s of this.getSubLayers())s.id.startsWith(t)===i&&s.updateAutoHighlight(e)}_renderPolygonLayer(){const{extruded:e,wireframe:t}=this.props,{layerProps:i}=this.state,s="polygons-fill",o=this.shouldRenderSubLayer(s,i.polygons?.data)&&this.getSubLayerClass(s,dn.type);if(o){const r=Di(this,dn.props,"getPolygon"),a=e&&t;return a||delete r.getLineColor,r.updateTriggers.lineColors=a,new o(r,this.getSubLayerProps({id:s,updateTriggers:r.updateTriggers}),i.polygons)}return null}_renderLineLayers(){const{extruded:e,stroked:t}=this.props,{layerProps:i}=this.state,s="polygons-stroke",o="linestrings",r=!e&&t&&this.shouldRenderSubLayer(s,i.polygonsOutline?.data)&&this.getSubLayerClass(s,Gt.type),a=this.shouldRenderSubLayer(o,i.lines?.data)&&this.getSubLayerClass(o,Gt.type);if(r||a){const c=Di(this,Gt.props,"getPath");return[r&&new r(c,this.getSubLayerProps({id:s,updateTriggers:c.updateTriggers}),i.polygonsOutline),a&&new a(c,this.getSubLayerProps({id:o,updateTriggers:c.updateTriggers}),i.lines)]}return null}_renderPointLayers(){const{pointType:e}=this.props,{layerProps:t,binary:i}=this.state;let{highlightedObjectIndex:s}=this.props;!i&&Number.isFinite(s)&&(s=t.points.data.findIndex(a=>a.__source.index===s));const o=new Set(e.split("+")),r=[];for(const a of o){const c=`points-${a}`,l=jt[a],u=l&&this.shouldRenderSubLayer(c,t.points?.data)&&this.getSubLayerClass(c,l.type);if(u){const f=Di(this,l.props);let d=t.points;if(a==="text"&&i){const{rowIndexes:h,...p}=d.data.attributes;d={...d,data:{...d.data,attributes:p}}}r.push(new u(f,this.getSubLayerProps({id:c,updateTriggers:f.updateTriggers,highlightedObjectIndex:s}),d))}}return r}renderLayers(){const{extruded:e}=this.props,t=this._renderPolygonLayer(),i=this._renderLineLayers(),s=this._renderPointLayers();return[!e&&t,i,s,e&&t]}getSubLayerAccessor(e){const{binary:t}=this.state;return!t||typeof e!="function"?super.getSubLayerAccessor(e):(i,s)=>{const{data:o,index:r}=s,a=qh(o,r);return e(a,s)}}}Mn.layerName="GeoJsonLayer";Mn.defaultProps=Rp;const io=12;function ut(n,e,t){return n-Math.round((n-e)/t)*t}function Bn(n,e){const{start:t,period:i}=e,s=(o,r,a,c)=>{const l=(o+a)/2;let u=ut(n(l),r,i);Math.abs(u-r)>=i/4&&c<io&&(u=s(o,r,l,c+1));const f=ut(n(a),u,i);return Math.abs(f-u)>=i/4&&c<io?s(l,u,a,c+1):f};return s(0,t,1,0)}function zp(n){const[e,t,i,s]=n;if(i-e>=360)return[-180,t,180,s];const o=e-ut(e,0,360);return[e-o,t,i-o,s]}function Np(n){const[e,t,i,s]=n;return i<=180?[[e,t,i,s]]:[[e,t,180,s],[-180,t,i-360,s]]}function Nm(n){const[e,t,i,s]=n;return[e,t,e>i?i+360:i,s]}function Fm(n,{semiMajorAxis:e}={}){switch(n=n.toLowerCase(),n){case"m":case"metre":case"meter":case"meters":return 1;case"foot":return .3048;case"us survey foot":return 1200/3937}if(n==="degree"||n==="degrees"){if(e===void 0)throw new Error("CRS with degrees unit requires ellipsoid semi-major-axis");return 2*Math.PI*e/360}throw new Error(`Unsupported CRS units: ${n} when computing metersPerUnit.`)}function Fp(n){const e=oa(n);return e.projName==="longlat"&&(!e.units||e.units==="unknown")&&(e.units="degree",e.to_meter=void 0),e}const ki=new Map;function Dm(n){const e=`EPSG:${n}`;let t=ki.get(e);return t===void 0&&(t=Dp(e,n).catch(i=>{throw ki.delete(e),i}),ki.set(e,t)),t}async function Dp(n,e){if(jn.defs(n)!==void 0){const t=new jn.Proj(n);return{...t,title:t.title??n}}return Fp(await kp(e))}async function kp(n){const e=`https://epsg.io/${n}.json`,t=await fetch(e);if(!t.ok)throw new Error(`Failed to fetch PROJJSON from ${e}`);return await t.json()}function hn(n,e,t,i,s,o={}){const{densifyPts:r=21}=o,a=[e,i,i,e],c=[t,t,s,s];let l=1/0,u=1/0,f=-1/0,d=-1/0;for(let h=0;h<4;h++){const p=a[h],g=c[h],y=a[(h+1)%4],b=c[(h+1)%4];for(let P=0;P<=r;P++){const x=P/(r+1),[w,T]=n(p+(y-p)*x,g+(b-g)*x);w<l&&(l=w),T<u&&(u=T),w>f&&(f=w),T>d&&(d=T)}}return[l,u,f,d]}const no=6378137,so=85.05112877980659;function Up(n,e){const t=n*Math.PI*no/180,i=e*Math.PI/180,s=Math.log(Math.tan(Math.PI/4+i/2))*no;return[t,s]}function km(n,e){return(t,i)=>{const[s,o]=n(t,i);if(Number.isFinite(s)&&Number.isFinite(o))return[s,o];const[r,a]=e(t,i),c=Math.max(-so,Math.min(so,a));return Up(r,c)}}const Vp=90;function jp(n,e,t){const{projectedCorners:i}=e,{topLeft:s,topRight:o,bottomRight:r,bottomLeft:a}=i,c=[s,o,r,a,s],l=[t(s[0],s[1])];for(let p=1;p<c.length;p++){const[g,y]=c[p-1],[b,P]=c[p],x=Bn(w=>t(g+w*(b-g),y+w*(P-y))[0],{start:l[p-1][0],period:360});l.push([x,t(b,P)[1]])}const u=Gp(l),f=[ut((l[0][0]+l[2][0])/2,0,360),(l[0][1]+l[2][1])/2],d=new di({id:`${n}-label`,data:[{position:f,text:`x=${e.index.x} y=${e.index.y} z=${e.index.z}`}],getColor:[255,255,255,255],getSize:24,sizeUnits:"pixels",outlineWidth:3,outlineColor:[0,0,0,255],fontSettings:{sdf:!0}});return[new ht({id:n,data:[u],getPath:p=>p,getColor:[255,0,0,255],getWidth:2,widthUnits:"pixels",pickable:!1,wrapLongitude:!0}),d]}function Gp(n){const e=[n[0]];for(let t=1;t<n.length;t++){const[i,s]=n[t-1],[o,r]=n[t],a=Math.max(1,Math.ceil(Math.abs(o-i)/Vp));for(let c=1;c<=a;c++){const l=c/a;e.push([i+l*(o-i),s+l*(r-s)])}}return e}const $p=[[1/3,1/3,1/3],[.5,.5,0],[.5,0,.5],[0,.5,.5]],Wp=.125;function Hr(n,e,t,i){return{uvs:[n,e,t,e,n,i,t,i],triangles:[3,0,2,0,3,1],halfedges:[3,-1,-1,0,-1,-1]}}const Hp=Hr(0,0,1,1);class qp{reprojectors;width;height;uvs;exactOutputPositions;triangles;_halfedges;_candidatesUV;_candidatesXY;_errorSpace;_pixelSize;_queueIndices;_queue;_errors;_pending;_pendingLen;constructor(e,t,i=t,s={}){this.reprojectors=e,this.width=t,this.height=i,this.uvs=[],this.exactOutputPositions=[],this.triangles=[],this._halfedges=[],this._candidatesUV=[],this._candidatesXY=[],this._queueIndices=[],this._queue=[],this._errors=[],this._pending=[],this._pendingLen=0;const o=s.initialTriangulation??Hp;this._errorSpace=s._errorSpace??"input",this._pixelSize=this._errorSpace==="output"?this._measurePixelSize(o):1,this._seed(o),this._flush()}_seed(e){for(let i=0;i<e.uvs.length;i+=2)this._addPoint(e.uvs[i],e.uvs[i+1]);for(let i=0;i<e.triangles.length;i++)this.triangles[i]=e.triangles[i],this._halfedges[i]=e.halfedges[i];const t=e.triangles.length/3;for(let i=0;i<t;i++)this._candidatesUV[2*i]=0,this._candidatesUV[2*i+1]=0,this._candidatesXY[2*i]=0,this._candidatesXY[2*i+1]=0,this._queueIndices[i]=-1,this._pending[this._pendingLen++]=i}run(e=Wp,{maxIterations:t=1e4}={}){if(e<=0)throw new Error("maxError must be positive");let i=0;for(;this.getMaxError()>e;)if(this.refine(),++i>t){console.warn(`RasterReprojector: mesh refinement did not converge after ${i} iterations (maxError=${e}, currentError=${this.getMaxError()})`);break}}refine(){this._step(),this._flush()}getMaxError(){return this._errors[0]}_flush(){for(let e=0;e<this._pendingLen;e++){const t=this._pending[e];this._findReprojectionCandidate(t)}this._pendingLen=0}_findReprojectionCandidate(e){const t=2*this.triangles[e*3+0],i=2*this.triangles[e*3+1],s=2*this.triangles[e*3+2],o=this.uvs[t],r=this.uvs[t+1],a=this.uvs[i],c=this.uvs[i+1],l=this.uvs[s],u=this.uvs[s+1],f=this.exactOutputPositions[t],d=this.exactOutputPositions[t+1],h=this.exactOutputPositions[i],p=this.exactOutputPositions[i+1],g=this.exactOutputPositions[s],y=this.exactOutputPositions[s+1];let b=0,P=0,x=0,w=0,T=0;for(const E of $p){const F=St(o,a,l,E[0],E[1],E[2]),D=St(r,c,u,E[0],E[1],E[2]),O=St(f,h,g,E[0],E[1],E[2]),B=St(d,p,y,E[0],E[1],E[2]),Z=F*(this.width-1),X=D*(this.height-1);let q,te=0,ie=0;if(this._errorSpace==="output")[te,ie]=this._projectPixel(Z,X),q=Math.hypot(te-O,ie-B)/this._pixelSize;else{const m=this.reprojectors.inverseReproject(O,B),v=this.reprojectors.inverseTransform(m[0],m[1]),_=Z-v[0],C=X-v[1];q=Math.hypot(_,C)}q>b&&(b=q,P=F,x=D,w=te,T=ie)}(P===o&&x===r||P===a&&x===c||P===l&&x===u)&&(b=0),this._candidatesUV[2*e]=P,this._candidatesUV[2*e+1]=x,this._candidatesXY[2*e]=w,this._candidatesXY[2*e+1]=T,this._queuePush(e,b)}_step(){const e=this._queuePop(),t=e*3+0,i=e*3+1,s=e*3+2,o=this.triangles[t],r=this.triangles[i],a=this.triangles[s],c=this.uvs[2*o],l=this.uvs[2*o+1],u=this.uvs[2*r],f=this.uvs[2*r+1],d=this.uvs[2*a],h=this.uvs[2*a+1],p=this._candidatesUV[2*e],g=this._candidatesUV[2*e+1],y=this._errorSpace==="output"?this._addPoint(p,g,[this._candidatesXY[2*e],this._candidatesXY[2*e+1]]):this._addPoint(p,g);if(Ui(c,l,u,f,p,g)===0)this._handleCollinear(y,t);else if(Ui(u,f,d,h,p,g)===0)this._handleCollinear(y,i);else if(Ui(d,h,c,l,p,g)===0)this._handleCollinear(y,s);else{const b=this._halfedges[t],P=this._halfedges[i],x=this._halfedges[s],w=this._addTriangle(o,r,y,b,-1,-1,t),T=this._addTriangle(r,a,y,P,-1,w+1),E=this._addTriangle(a,o,y,x,w+2,T+1);this._legalize(w),this._legalize(T),this._legalize(E)}}_addPoint(e,t,i){const s=this.uvs.length>>1;if(this.uvs.push(e,t),i)return this.exactOutputPositions.push(i[0],i[1]),s;const o=e*(this.width-1),r=t*(this.height-1),a=this.reprojectors.forwardTransform(o,r),c=this.reprojectors.forwardReproject(a[0],a[1]);return this.exactOutputPositions.push(c[0],c[1]),s}_projectPixel(e,t){const i=this.reprojectors.forwardTransform(e,t);return this.reprojectors.forwardReproject(i[0],i[1])}_measurePixelSize(e){let t=Number.POSITIVE_INFINITY,i=Number.NEGATIVE_INFINITY,s=Number.POSITIVE_INFINITY,o=Number.NEGATIVE_INFINITY;for(let f=0;f<e.uvs.length;f+=2)t=Math.min(t,e.uvs[f]),i=Math.max(i,e.uvs[f]),s=Math.min(s,e.uvs[f+1]),o=Math.max(o,e.uvs[f+1]);const r=f=>Number.isFinite(f)&&f>0,a=(t+i)/2,c=(s+o)/2,l=this._pixelSizeAt(a,c);if(r(l))return l;const u=[];for(let f=0;f<=4;f++)for(let d=0;d<=4;d++){const h=this._pixelSizeAt(t+f/4*(i-t),s+d/4*(o-s));r(h)&&u.push(h)}if(u.length===0)throw new Error(`RasterReprojector: _errorSpace "output" needs a finite, positive pixel size on the map, but the pixel at uv (${a}, ${c}) of a ${this.width}x${this.height} mesh measured ${l}, and so did every pixel on a 5x5 grid across the meshed area.`);return u.sort((f,d)=>f-d),u[u.length>>1]}_pixelSizeAt(e,t){const i=e*(this.width-1),s=t*(this.height-1),o=this._projectPixel(i-.5,s),r=this._projectPixel(i+.5,s),a=this._projectPixel(i,s-.5),c=this._projectPixel(i,s+.5),l=r[0]-o[0],u=r[1]-o[1],f=c[0]-a[0],d=c[1]-a[1];return Math.sqrt(Math.abs(l*d-u*f))}_addTriangle(e,t,i,s,o,r,a=this.triangles.length){const c=a/3;return this.triangles[a+0]=e,this.triangles[a+1]=t,this.triangles[a+2]=i,this._halfedges[a+0]=s,this._halfedges[a+1]=o,this._halfedges[a+2]=r,s>=0&&(this._halfedges[s]=a+0),o>=0&&(this._halfedges[o]=a+1),r>=0&&(this._halfedges[r]=a+2),this._candidatesUV[2*c+0]=0,this._candidatesUV[2*c+1]=0,this._candidatesXY[2*c+0]=0,this._candidatesXY[2*c+1]=0,this._queueIndices[c]=-1,this._pending[this._pendingLen++]=c,a}_legalize(e){const t=this._halfedges[e];if(t<0)return;const i=e-e%3,s=t-t%3,o=i+(e+1)%3,r=i+(e+2)%3,a=s+(t+2)%3,c=s+(t+1)%3,l=this.triangles[r],u=this.triangles[e],f=this.triangles[o],d=this.triangles[a],h=this.uvs;if(!Yp(h[2*l],h[2*l+1],h[2*u],h[2*u+1],h[2*f],h[2*f+1],h[2*d],h[2*d+1]))return;const p=this._halfedges[o],g=this._halfedges[r],y=this._halfedges[a],b=this._halfedges[c];this._queueRemove(i/3),this._queueRemove(s/3);const P=this._addTriangle(l,d,f,-1,y,p,i),x=this._addTriangle(d,l,u,P,g,b,s);this._legalize(P+1),this._legalize(x+2)}_handleCollinear(e,t){const i=t-t%3,s=i+(t+1)%3,o=i+(t+2)%3,r=this.triangles[o],a=this.triangles[t],c=this.triangles[s],l=this._halfedges[s],u=this._halfedges[o],f=this._halfedges[t];if(f<0){const E=this._addTriangle(e,r,a,-1,u,-1,i),F=this._addTriangle(r,e,c,E,-1,l);this._legalize(E+1),this._legalize(F+2);return}const d=f-f%3,h=d+(f+2)%3,p=d+(f+1)%3,g=this.triangles[h],y=this._halfedges[h],b=this._halfedges[p];this._queueRemove(d/3);const P=this._addTriangle(r,a,e,u,-1,-1,i),x=this._addTriangle(a,g,e,b,-1,P+1,d),w=this._addTriangle(g,c,e,y,-1,x+1),T=this._addTriangle(c,r,e,l,P+2,w+1);this._legalize(P),this._legalize(x),this._legalize(w),this._legalize(T)}_queuePush(e,t){const i=this._queue.length;this._queueIndices[e]=i,this._queue.push(e),this._errors.push(t),this._queueUp(i)}_queuePop(){const e=this._queue.length-1;return this._queueSwap(0,e),this._queueDown(0,e),this._queuePopBack()}_queuePopBack(){const e=this._queue.pop();return this._errors.pop(),this._queueIndices[e]=-1,e}_queueRemove(e){const t=this._queueIndices[e];if(t<0){const s=this._pending.indexOf(e);if(s!==-1)this._pending[s]=this._pending[--this._pendingLen];else throw new Error("Broken triangulation (something went wrong).");return}const i=this._queue.length-1;i!==t&&(this._queueSwap(t,i),this._queueDown(t,i)||this._queueUp(t)),this._queuePopBack()}_queueLess(e,t){return this._errors[e]>this._errors[t]}_queueSwap(e,t){const i=this._queue[e],s=this._queue[t];this._queue[e]=s,this._queue[t]=i,this._queueIndices[i]=t,this._queueIndices[s]=e;const o=this._errors[e];this._errors[e]=this._errors[t],this._errors[t]=o}_queueUp(e){let t=e;for(;;){const i=t-1>>1;if(i===t||!this._queueLess(t,i))break;this._queueSwap(i,t),t=i}}_queueDown(e,t){let i=e;for(;;){const s=2*i+1;if(s>=t||s<0)break;const o=s+1;let r=s;if(o<t&&this._queueLess(o,s)&&(r=o),!this._queueLess(r,i))break;this._queueSwap(i,r),i=r}return i>e}}function Ui(n,e,t,i,s,o){return(t-s)*(e-o)-(i-o)*(n-s)}function Yp(n,e,t,i,s,o,r,a){const c=n-r,l=e-a,u=t-r,f=i-a,d=s-r,h=o-a,p=c*c+l*l,g=u*u+f*f,y=d*d+h*h;return c*(f*y-g*h)-l*(u*y-g*d)+p*(u*h-f*d)<0}function St(n,e,t,i,s,o){return i*n+s*e+o*t}function Xp(n,e){const{positions:t,uvs:i,triangles:s}=n,o=s.length/3,r=new Float64Array(o),a=new Float64Array(o);let c=!0;for(let g=0;g<o;g++){const y=t[2*s[3*g]],b=t[2*s[3*g+1]],P=t[2*s[3*g+2]],x=Math.floor(Math.min(y,b,P)/e),w=Math.max(x,Math.ceil(Math.max(y,b,P)/e)-1),T=Number.isFinite(x)&&Number.isFinite(w);r[g]=T?x:0,a[g]=T?w:0,c&&=r[g]===r[0]&&a[g]===r[0]}const l=r[0]??0;if(c)return l===0?n:{positions:t.map((g,y)=>y%2===0?g-l*e:g),uvs:i,triangles:s};const u={positions:[],uvs:[],triangles:[]},f=g=>[t[2*g],t[2*g+1],i[2*g],i[2*g+1]],d=([g,y,b,P],x)=>(u.positions.push(g-x,y),u.uvs.push(b,P),u.positions.length/2-1),h=new Map,p=(g,y)=>{const b=`${g}/${y}`;let P=h.get(b);return P===void 0&&(P=d(f(g),y*e),h.set(b,P)),P};for(let g=0;g<o;g++){const y=[s[3*g],s[3*g+1],s[3*g+2]],b=r[g],P=a[g];if(b===P){for(const x of y)u.triangles.push(p(x,b));continue}for(let x=b;x<=P;x++){let w=y.map(f);if(w=oo(w,x*e,1),w=oo(w,(x+1)*e,-1),w.length<3)continue;const T=w.map(E=>d(E,x*e));for(let E=1;E<T.length-1;E++)u.triangles.push(T[0],T[E],T[E+1])}}return u}function oo(n,e,t){const i=o=>t*(o[0]-e)>=0,s=[];for(let o=0;o<n.length;o++){const r=n[o],a=n[(o+1)%n.length];if(i(r)&&s.push(r),i(r)!==i(a)){const c=(e-r[0])/(a[0]-r[0]);s.push([e,r[1]+c*(a[1]-r[1]),r[2]+c*(a[2]-r[2]),r[3]+c*(a[3]-r[3])])}}return s}function qr(n){const e=new Float32Array(n.length),t=new Float32Array(n.length);for(let i=0;i<n.length;i++){const s=n[i],o=Math.fround(s);t[i]=o,e[i]=s-o}return[e,t]}const Zp=32;function Kp(n,e,t,i=Zp){const{forwardTransform:s,forwardReproject:o}=n,r=i,a=i,c=(r+1)*(a+1),l=new Float64Array(c*3),u=new Float32Array(c*2);let f=0;for(let y=0;y<=a;y++)for(let b=0;b<=r;b++){const P=b/r,x=y/a,w=P*(e-1),T=x*(t-1),[E,F]=s(w,T),[D,O]=o(E,F);l[f*3]=D,l[f*3+1]=O,l[f*3+2]=0,u[f*2]=P,u[f*2+1]=x,f++}const[d,h]=qr(l),p=new Uint32Array(r*a*6);let g=0;for(let y=0;y<a;y++)for(let b=0;b<r;b++){const P=y*(r+1)+b,x=P+1,w=P+(r+1),T=w+1;p[g++]=P,p[g++]=w,p[g++]=x,p[g++]=x,p[g++]=w,p[g++]=T}return{indices:p,positions64High:h,positions64Low:d,texCoords:u}}const ro=1-1e-6;function Jp(n,e){const{width:t,height:i,period:s}=e,o=(p,g)=>n.forwardReproject(...n.forwardTransform(p,g))[0],r=t/2,a=i/2,c=o(r,a),l=(p,g)=>Bn(y=>o(r+y*ro*(p-r),a+y*ro*(g-a)),{start:c,period:s}),u=l(0,0),f=l(t,0),d=l(0,i),h=l(t,i);return{...n,forwardReproject:(p,g)=>{const[y,b]=n.inverseTransform(p,g),P=y/t,x=b/i,w=(1-P)*(1-x)*u+P*(1-x)*f+(1-P)*x*d+P*x*h,[T,E]=n.forwardReproject(p,g);return[ut(T,w,s),E]}}}const Vi=Math.PI/180,At=new Float32Array(16),ao=new Float32Array(12);function co(n,e,t){const i=e[0]*Vi,s=e[1]*Vi,o=e[2]*Vi,r=Math.sin(o),a=Math.sin(i),c=Math.sin(s),l=Math.cos(o),u=Math.cos(i),f=Math.cos(s),d=t[0],h=t[1],p=t[2];n[0]=d*f*u,n[1]=d*c*u,n[2]=d*-a,n[3]=h*(-c*l+f*a*r),n[4]=h*(f*l+c*a*r),n[5]=h*u*r,n[6]=p*(c*r+f*a*l),n[7]=p*(-f*r+c*a*l),n[8]=p*u*l}function lo(n){return n[0]=n[0],n[1]=n[1],n[2]=n[2],n[3]=n[4],n[4]=n[5],n[5]=n[6],n[6]=n[8],n[7]=n[9],n[8]=n[10],n[9]=n[12],n[10]=n[13],n[11]=n[14],n.subarray(0,12)}const Qp={size:12,accessor:["getOrientation","getScale","getTranslation","getTransformMatrix"],shaderAttributes:{instanceModelMatrixCol0:{size:3,elementOffset:0},instanceModelMatrixCol1:{size:3,elementOffset:3},instanceModelMatrixCol2:{size:3,elementOffset:6},instanceTranslation:{size:3,elementOffset:9}},update(n,{startRow:e,endRow:t}){const{data:i,getOrientation:s,getScale:o,getTranslation:r,getTransformMatrix:a}=this.props,c=Array.isArray(a),l=c&&a.length===16,u=Array.isArray(o),f=Array.isArray(s),d=Array.isArray(r),h=l||!c&&!!a(i[0]);h?n.constant=l:n.constant=f&&u&&d;const p=n.value;if(n.constant){let g;h?(At.set(a),g=lo(At)):(g=ao,co(g,s,o),g.set(r,9)),n.value=new Float32Array(g)}else{let g=e*n.size;const{iterable:y,objectInfo:b}=Ae(i,e,t);for(const P of y){b.index++;let x;if(h)At.set(l?a:a(P,b)),x=lo(At);else{x=ao;const w=f?s:s(P,b),T=u?o:o(P,b);co(x,w,T),x.set(d?r:r(P,b),9)}p[g++]=x[0],p[g++]=x[1],p[g++]=x[2],p[g++]=x[3],p[g++]=x[4],p[g++]=x[5],p[g++]=x[6],p[g++]=x[7],p[g++]=x[8],p[g++]=x[9],p[g++]=x[10],p[g++]=x[11]}}}};function eg(n,e){return e==="cartesian"||e==="meter-offsets"||e==="default"&&!n.isGeospatial}const tg=`struct SimpleMeshUniforms {
  sizeScale: f32,
  composeModelMatrix: f32,
  hasTexture: f32,
  flatShading: f32,
};

@group(0) @binding(auto) var<uniform> simpleMesh: SimpleMeshUniforms;
@group(0) @binding(auto) var simpleMeshTexture: texture_2d<f32>;
@group(0) @binding(auto) var simpleMeshTextureSampler: sampler;
`,uo=`layout(std140) uniform simpleMeshUniforms {
  float sizeScale;
  bool composeModelMatrix;
  bool hasTexture;
  bool flatShading;
} simpleMesh;
`,ig={name:"simpleMesh",source:tg,vs:uo,fs:uo,uniformTypes:{sizeScale:"f32",composeModelMatrix:"f32",hasTexture:"f32",flatShading:"f32"}},ng=`#version 300 es
#define SHADER_NAME simple-mesh-layer-vs
in vec3 positions;
in vec3 normals;
in vec3 colors;
in vec2 texCoords;
in vec3 instancePositions;
in vec3 instancePositions64Low;
in vec4 instanceColors;
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
geometry.pickingColor = picking_getPickingColorFromInstanceID();
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
`,sg=`#version 300 es
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
`,og=`struct Attributes {
  @builtin(instance_index) instanceIndex: u32,
  @location(0) positions: vec3<f32>,
  @location(1) normals: vec3<f32>,
  @location(2) colors: vec3<f32>,
  @location(3) texCoords: vec2<f32>,
  @location(4) instancePositions: vec3<f32>,
  @location(5) instancePositions64Low: vec3<f32>,
  @location(6) instanceColors: vec4<f32>,
  @location(7) instanceModelMatrixCol0: vec3<f32>,
  @location(8) instanceModelMatrixCol1: vec3<f32>,
  @location(9) instanceModelMatrixCol2: vec3<f32>,
  @location(10) instanceTranslation: vec3<f32>,
};

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) texCoords: vec2<f32>,
  @location(2) normal: vec3<f32>,
  @location(3) positionCommon: vec3<f32>,
  @location(4) pickingColor: vec3<f32>,
};

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
  var varyings: Varyings;

  geometry.worldPosition = attributes.instancePositions;
  geometry.uv = attributes.texCoords;
  geometry.pickingColor = picking_getPickingColorFromIndex(attributes.instanceIndex);

  let instanceModelMatrix = mat3x3<f32>(
    attributes.instanceModelMatrixCol0,
    attributes.instanceModelMatrixCol1,
    attributes.instanceModelMatrixCol2
  );
  let meshPosition =
    (instanceModelMatrix * attributes.positions) * simpleMesh.sizeScale +
    attributes.instanceTranslation;

  if (simpleMesh.composeModelMatrix > 0.5) {
    geometry.normal = project_normal(instanceModelMatrix * attributes.normals);
    geometry.worldPosition += meshPosition;
    let projected = project_position_to_clipspace_and_commonspace(
      attributes.instancePositions + meshPosition,
      attributes.instancePositions64Low,
      vec3<f32>(0.0)
    );
    geometry.position = projected.commonPosition;
    varyings.position = projected.clipPosition;
  } else {
    let projected = project_position_to_clipspace_and_commonspace(
      attributes.instancePositions,
      attributes.instancePositions64Low,
      project_size_vec3(meshPosition)
    );
    geometry.position = projected.commonPosition;
    geometry.normal = project_normal(instanceModelMatrix * attributes.normals);
    varyings.position = projected.clipPosition;
  }

  varyings.color = vec4<f32>(
    attributes.colors * attributes.instanceColors.rgb,
    attributes.instanceColors.a
  );
  varyings.texCoords = attributes.texCoords;
  varyings.normal = geometry.normal;
  varyings.positionCommon = geometry.position.xyz;
  varyings.pickingColor = geometry.pickingColor;
  return varyings;
}

@fragment
fn fragmentMain(varyings: Varyings) -> @location(0) vec4<f32> {
  geometry.uv = varyings.texCoords;

  if (picking.isActive > 0.5) {
    if (!picking_isColorValid(varyings.pickingColor)) {
      discard;
    }
    return vec4<f32>(varyings.pickingColor, 1.0);
  }

  var color = varyings.color;
  if (simpleMesh.hasTexture > 0.5) {
    color = textureSample(simpleMeshTexture, simpleMeshTextureSampler, varyings.texCoords);
  }

  var normal = varyings.normal;
  if (simpleMesh.flatShading > 0.5) {
    // WebGPU's screen-space Y axis reverses the derivative orientation used by GLSL flat shading.
    normal = normalize(cross(dpdy(varyings.positionCommon), dpdx(varyings.positionCommon)));
  }

  color = vec4<f32>(
    lighting_getLightColor2(color.rgb, project.cameraPosition, varyings.positionCommon, normal),
    color.a * layer.opacity
  );

  if (picking.isHighlightActive > 0.5) {
    let highlightedColor = picking_normalizeColor(picking.highlightedObjectColor);
    if (picking_isColorZero(abs(varyings.pickingColor - highlightedColor))) {
      let blendedAlpha = picking.highlightColor.a + color.a * (1.0 - picking.highlightColor.a);
      if (blendedAlpha > 0.0) {
        color = vec4<f32>(
          mix(color.rgb, picking.highlightColor.rgb, picking.highlightColor.a / blendedAlpha),
          blendedAlpha
        );
      }
    }
  }

  return deckgl_premultiplied_alpha(color);
}
`;function rg(n){let e=1/0,t=1/0,i=1/0,s=-1/0,o=-1/0,r=-1/0;const a=n.POSITION?n.POSITION.value:[],c=a&&a.length;for(let l=0;l<c;l+=3){const u=a[l],f=a[l+1],d=a[l+2];e=u<e?u:e,t=f<t?f:t,i=d<i?d:i,s=u>s?u:s,o=f>o?f:o,r=d>r?d:r}return[[e,t,i],[s,o,r]]}function ji(n){const e=n.positions||n.POSITION;Y.assert(e,'no "postions" or "POSITION" attribute in mesh');const t=e.value.length/e.size;let i=n.COLOR_0||n.colors;i||(i={size:3,value:new Float32Array(t*3).fill(1)});let s=n.NORMAL||n.normals;s||(s={size:3,value:new Float32Array(t*3).fill(0)});let o=n.TEXCOORD_0||n.texCoords;return o||(o={size:2,value:new Float32Array(t*2).fill(0)}),{positions:e,colors:i,normals:s,texCoords:o}}function fo(n){return n instanceof pe?(n.attributes=ji(n.attributes),n):n.attributes?new pe({...n,topology:"triangle-list",attributes:ji(n.attributes)}):new pe({topology:"triangle-list",attributes:ji(n)})}const ag=[0,0,0,255],cg={mesh:{type:"object",value:null,async:!0},texture:{type:"image",value:null,async:!0},sizeScale:{type:"number",value:1,min:0},_instanced:!0,wireframe:!1,material:!0,getPosition:{type:"accessor",value:n=>n.position},getColor:{type:"accessor",value:ag},getOrientation:{type:"accessor",value:[0,0,0]},getScale:{type:"accessor",value:[1,1,1]},getTranslation:{type:"accessor",value:[0,0,0]},getTransformMatrix:{type:"accessor",value:[]},textureParameters:{type:"object",ignore:!0,value:null}};class hi extends _e{getShaders(){return super.getShaders({vs:ng,fs:sg,source:og,modules:[Ue,ke,Ko,Ve,ig]})}getBounds(){if(this.props._instanced)return super.getBounds();let e=this.state.positionBounds;if(e)return e;const{mesh:t}=this.props;if(!t)return null;if(e=t.header?.boundingBox,!e){const{attributes:i}=fo(t);i.POSITION=i.POSITION||i.positions,e=rg(i)}return this.state.positionBounds=e,e}initializeState(){this.getAttributeManager().addInstanced({instancePositions:{transition:!0,type:"float64",fp64:this.use64bitPositions(),size:3,accessor:"getPosition"},instanceColors:{type:"unorm8",transition:!0,size:this.props.colorFormat.length,accessor:"getColor",defaultValue:[0,0,0,255]},instanceModelMatrix:Qp}),this.setState({emptyTexture:this.context.device.createTexture({data:new Uint8Array(4),width:1,height:1})})}updateState(e){super.updateState(e);const{props:t,oldProps:i,changeFlags:s}=e;if(t.mesh!==i.mesh||s.extensionsChanged){if(this.state.positionBounds=null,this.state.model?.destroy(),t.mesh){this.state.model=this.getModel(t.mesh);const o=t.mesh.attributes||t.mesh;this.setState({hasNormals:!!(o.NORMAL||o.normals)})}this.getAttributeManager().invalidateAll()}t.texture!==i.texture&&t.texture instanceof oi&&this.setTexture(t.texture),this.state.model&&this.state.model.setTopology(this.props.wireframe?"line-strip":"triangle-list")}finalizeState(e){super.finalizeState(e),this.state.emptyTexture.delete()}draw({uniforms:e}){const{model:t}=this.state;if(!t)return;const{viewport:i,renderPass:s}=this.context,{sizeScale:o,coordinateSystem:r,_instanced:a}=this.props,c={sizeScale:o,composeModelMatrix:!a||eg(i,r),flatShading:!this.state.hasNormals};t.shaderInputs.setProps({simpleMesh:c}),t.draw(s)}get isLoaded(){return!!(this.state?.model&&super.isLoaded)}getModel(e){const t=new re(this.context.device,{...this.getShaders(),id:this.props.id,bufferLayout:this.getAttributeManager().getBufferLayouts(),geometry:fo(e),isInstanced:!0});return t.shaderInputs.setProps({simpleMesh:this.getTextureProps(this.props.texture)}),t}setTexture(e){const{model:t}=this.state;t&&t.shaderInputs.setProps({simpleMesh:this.getTextureProps(e)})}getTextureProps(e){const t=e||this.state.emptyTexture;return{...this.context.device.type==="webgpu"?{simpleMeshTexture:t}:{sampler:t},hasTexture:!!e}}}hi.defaultProps=cg;hi.layerName="SimpleMeshLayer";const lg={name:"create-texture-unorm",inject:{"fs:#decl":"uniform sampler2D textureName;","fs:DECKGL_FILTER_COLOR":`
      color = texture(textureName, geometry.uv);
    `},getUniforms:n=>({textureName:n.textureName})},ug=`#version 300 es
#define SHADER_NAME mesh-texture-layer-fs

precision highp float;

in vec2 vTexCoord;
in vec4 vColor;

out vec4 fragColor;

void main(void) {
  geometry.uv = vTexCoord;

  // We initialize color here before passing into DECKGL_FILTER_COLOR
  vec4 color = vec4(0.0);
  DECKGL_FILTER_COLOR(color, geometry);

  fragColor = vec4(color.rgb, color.a * layer.opacity);
}
`,fg=`#version 300 es
#define SHADER_NAME mesh-texture-layer-vs

// Primitive attributes
in vec3 positions;
in vec3 positions64Low;
in vec3 normals;
in vec3 colors;
in vec2 texCoords;

// Instance attributes
in vec3 instancePositions;
in vec3 instancePositions64Low;
in vec4 instanceColors;
in vec3 instanceModelMatrixCol0;
in vec3 instanceModelMatrixCol1;
in vec3 instanceModelMatrixCol2;
in vec3 instanceTranslation;

// Outputs to fragment shader
out vec2 vTexCoord;
out vec3 cameraPosition;
out vec3 normals_commonspace;
out vec4 position_commonspace;
out vec4 vColor;

void main(void) {
  geometry.worldPosition = instancePositions;
  geometry.uv = texCoords;
  geometry.pickingColor = picking_getPickingColorFromInstanceID();

  vTexCoord = texCoords;
  cameraPosition = project.cameraPosition;
  vColor = vec4(colors * instanceColors.rgb, instanceColors.a);

  mat3 instanceModelMatrix = mat3(instanceModelMatrixCol0, instanceModelMatrixCol1, instanceModelMatrixCol2);
  vec3 pos = (instanceModelMatrix * positions) * simpleMesh.sizeScale + instanceTranslation;

  DECKGL_FILTER_SIZE(pos, geometry);
  // Call project_normal before project_position so the normal isn't affected by
  // a position offset (unused for unlit raster, kept for parity with upstream).
  normals_commonspace = project_normal(instanceModelMatrix * normals);
  geometry.worldPosition += pos;

  // No composeModelMatrix branch: that flag only matters when placing an
  // instanced model offset from an anchor. MeshTextureLayer always draws one
  // mesh at instancePositions = [0,0,0] with identity transforms, so we project
  // the mesh vertex directly (with its fp64 low part). This is correct for both
  // cartesian (common-space, Web Mercator) and lnglat (degrees, GlobeView) —
  // project_position_to_clipspace handles each coordinate system.
  gl_Position = project_position_to_clipspace(pos + instancePositions, positions64Low + instancePositions64Low, vec3(0.0), position_commonspace);
  geometry.position = position_commonspace;

  geometry.normal = normals_commonspace;
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

  DECKGL_FILTER_COLOR(vColor, geometry);
}
`,dg={...hi.defaultProps,renderPipeline:{type:"array",value:[],compare:!0},_instanced:!1,getPosition:{type:"accessor",value:[0,0,0]}};class hg extends hi{static layerName="mesh-texture-layer";static defaultProps=dg;initializeState(){super.initializeState();const e=this.getAttributeManager();e&&e.add({positions64Low:{size:3,type:"float32",noAlloc:!0}})}_resolveRenderPipeline(){const{image:e,renderPipeline:t}=this.props;return[...e?[{module:lg,props:{textureName:e}}]:[],...t??[]]}updateState(e){this.hasRenderPipelineChanged(e)&&(e.changeFlags.extensionsChanged=!0),super.updateState(e)}hasRenderPipelineChanged(e){const{oldProps:t,props:i}=e;if(!!t.image!=!!i.image)return!0;const s=t.renderPipeline??[],o=i.renderPipeline??[];if(s.length!==o.length)return!0;for(let r=0;r<s.length;r++)if(s[r]?.module.name!==o[r]?.module.name)return!0;return!1}getShaders(){const{source:e,...t}=super.getShaders(),i=t.modules;for(const s of this._resolveRenderPipeline())i.push(s.module);return{...t,vs:fg,fs:ug,modules:i}}draw(e){const t={};for(const i of this._resolveRenderPipeline())t[i.module.name]=i.props||{};for(const i of super.getModels())i.shaderInputs.setProps(t);super.draw(e)}}const pg=.125,ho=[[252,73,163],[255,51,204],[204,102,255],[153,51,255],[102,204,255],[51,153,255],[102,255,204],[51,255,170],[0,255,0],[51,204,51],[255,204,102],[255,179,71],[255,102,102],[255,80,80],[255,0,0],[204,0,0],[255,128,0],[255,153,51],[255,255,102],[255,255,51],[0,255,255],[0,204,255]],gg={image:{type:"image",value:null,async:!0},renderPipeline:{type:"array",value:[],compare:!0},debug:!1,debugOpacity:.5};class mg extends Te{static layerName="RasterLayer";static defaultProps=gg;initializeState(){this.setState({})}updateState(e){super.updateState(e);const{props:t,oldProps:i,changeFlags:s}=e,o=t.reprojectionFns.forwardTransform!==i.reprojectionFns?.forwardTransform||t.reprojectionFns.inverseTransform!==i.reprojectionFns?.inverseTransform||t.reprojectionFns.forwardReproject!==i.reprojectionFns?.forwardReproject||t.reprojectionFns.inverseReproject!==i.reprojectionFns?.inverseReproject;(s.dataChanged||t.width!==i.width||t.height!==i.height||o||t.maxError!==i.maxError||t.initialTriangulation!==i.initialTriangulation||t._wrapX!==i._wrapX)&&this._generateMesh()}_generateMesh(){const{width:e,height:t,reprojectionFns:i,initialTriangulation:s,maxError:o=pg,_wrapX:r}=this.props;if(this.context?.viewport?.resolution!==void 0){const{indices:g,positions64High:y,positions64Low:b,texCoords:P}=Kp(i,e+1,t+1);this.setState({reprojector:void 0,mesh:{indices:{value:g,size:1},attributes:{POSITION:{value:y,size:3},TEXCOORD_0:{value:P,size:2}}},positions64Low:b});return}let c;try{const g=r===void 0?i:Jp(i,{width:e,height:t,period:r});c=new qp(g,e+1,t+1,{initialTriangulation:s,_errorSpace:"output"}),c.run(o)}catch(g){this.setState({reprojector:void 0,mesh:void 0,positions64Low:void 0}),this.raiseError(g,"building the reprojection mesh");return}const l={positions:c.exactOutputPositions,uvs:c.uvs,triangles:c.triangles},u=r===void 0?l:Xp(l,r),{indices:f,positions64High:d,positions64Low:h,texCoords:p}=yg(u);this.setState({reprojector:c,mesh:{indices:{value:f,size:1},attributes:{POSITION:{value:d,size:3},TEXCOORD_0:{value:p,size:2}}},positions64Low:h})}renderDebugLayer(){const{mesh:e,positions64Low:t}=this.state,{debugOpacity:i}=this.props;if(!e||!t)return null;const s=e.indices.value;return new An(this.getSubLayerProps({id:"polygon",data:{indices:s,positions64High:e.attributes.POSITION.value,positions64Low:t,length:s.length/3},getPolygon:(o,{index:r,data:a})=>{const{indices:c,positions64High:l,positions64Low:u}=a,f=c[r*3],d=c[r*3+1],h=c[r*3+2],p=g=>[l[g*3]+u[g*3],l[g*3+1]+u[g*3+1]];return[p(f),p(d),p(h),p(f)]},getFillColor:(o,{index:r,target:a})=>{const c=ho[r%ho.length];return a[0]=c[0],a[1]=c[1],a[2]=c[2],a[3]=255,a},getLineColor:[0,0,0],getLineWidth:1,lineWidthUnits:"pixels",opacity:i!==void 0&&Number.isFinite(i)?Math.max(0,Math.min(1,i)):1,pickable:!1}))}renderLayers(){const{mesh:e,positions64Low:t}=this.state,{debug:i,image:s,renderPipeline:o}=this.props;if(!e||!t||!s&&(o?.length??0)===0)return null;const a=[new hg(this.getSubLayerProps({id:"raster",image:s,renderPipeline:o,data:{length:1,attributes:{positions64Low:t}},mesh:e,getColor:[255,255,255]}))];if(i){const c=this.renderDebugLayer();c&&a.push(c)}return a}}function yg(n){const e=n.uvs.length/2,t=new Float32Array(n.uvs),i=new Float64Array(e*3);for(let a=0;a<e;a++)i[a*3]=n.positions[a*2],i[a*3+1]=n.positions[a*2+1],i[a*3+2]=0;const[s,o]=qr(i);return{indices:new Uint32Array(n.triangles),positions64High:o,positions64Low:s,texCoords:t}}class _g{constructor(e){this.index=e,this.isVisible=!1,this.isSelected=!1,this.parent=null,this.children=[],this.content=null,this._loader=void 0,this._abortController=null,this._loaderId=0,this._isLoaded=!1,this._isCancelled=!1,this._needsReload=!1}get bbox(){return this._bbox}set bbox(e){this._bbox||(this._bbox=e,"west"in e?this.boundingBox=[[e.west,e.south],[e.east,e.north]]:this.boundingBox=[[e.left,e.top],[e.right,e.bottom]])}get data(){return this.isLoading&&this._loader?this._loader.then(()=>this.data):this.content}get isLoaded(){return this._isLoaded&&!this._needsReload}get isLoading(){return!!this._loader&&!this._isCancelled}get needsReload(){return this._needsReload||this._isCancelled}get byteLength(){const e=this.content?this.content.byteLength:0;return Number.isFinite(e)||console.error("byteLength not defined in tile data"),e}async _loadData({getData:e,getRequestPriority:t,requestScheduler:i,onLoad:s,onError:o}){const{index:r,id:a,bbox:c,userData:l,zoom:u}=this,f=this._loaderId;this._abortController=new AbortController;const{signal:d}=this._abortController,h=await i.scheduleRequest(this,t);if(!h){this._isCancelled=!0;return}if(this._isCancelled){h.done();return}let p=null,g;try{p=await e({index:r,id:a,bbox:c,userData:l,zoom:u,signal:d})}catch(y){g=y||!0}finally{h.done()}if(f===this._loaderId){if(this._loader=void 0,this.content=p,this._isCancelled&&!p){this._isLoaded=!1;return}this._isLoaded=!0,this._isCancelled=!1,g?o(g,this):s(this)}}loadData(e){return this._isLoaded=!1,this._isCancelled=!1,this._needsReload=!1,this._loaderId++,this._loader=this._loadData(e),this._loader}setNeedsReload(){this.isLoading&&(this.abort(),this._loader=void 0),this._needsReload=!0}abort(){this.isLoaded||(this._isCancelled=!0,this._abortController?.abort())}}const Q={OUTSIDE:-1,INTERSECTING:0,INSIDE:1},po=new M,vg=new M;class On{constructor(e=[0,0,0],t=[0,0,0],i){i=i||po.copy(e).add(t).scale(.5),this.center=new M(i),this.halfDiagonal=new M(t).subtract(this.center),this.minimum=new M(e),this.maximum=new M(t)}clone(){return new On(this.minimum,this.maximum,this.center)}equals(e){return this===e||!!e&&this.minimum.equals(e.minimum)&&this.maximum.equals(e.maximum)}transform(e){return this.center.transformAsPoint(e),this.halfDiagonal.transform(e),this.minimum.transform(e),this.maximum.transform(e),this}intersectPlane(e){const{halfDiagonal:t}=this,i=vg.from(e.normal),s=t.x*Math.abs(i.x)+t.y*Math.abs(i.y)+t.z*Math.abs(i.z),o=this.center.dot(i)+e.distance;return o-s>0?Q.INSIDE:o+s<0?Q.OUTSIDE:Q.INTERSECTING}distanceTo(e){return Math.sqrt(this.distanceSquaredTo(e))}distanceSquaredTo(e){const t=po.from(e).subtract(this.center),{halfDiagonal:i}=this;let s=0,o;return o=Math.abs(t.x)-i.x,o>0&&(s+=o*o),o=Math.abs(t.y)-i.y,o>0&&(s+=o*o),o=Math.abs(t.z)-i.z,o>0&&(s+=o*o),s}}const Xe=new M,go=new M;class Rn{constructor(e=[0,0,0],t=0){this.radius=-0,this.center=new M,this.fromCenterRadius(e,t)}fromCenterRadius(e,t){return this.center.from(e),this.radius=t,this}fromCornerPoints(e,t){return t=Xe.from(t),this.center=new M().from(e).add(t).scale(.5),this.radius=this.center.distance(t),this}equals(e){return this===e||!!e&&this.center.equals(e.center)&&this.radius===e.radius}clone(){return new Rn(this.center,this.radius)}union(e){const t=this.center,i=this.radius,s=e.center,o=e.radius,r=Xe.copy(s).subtract(t),a=r.magnitude();if(i>=a+o)return this.clone();if(o>=a+i)return e.clone();const c=(i+a+o)*.5;return go.copy(r).scale((-i+c)/a).add(t),this.center.copy(go),this.radius=c,this}expand(e){const i=Xe.from(e).subtract(this.center).magnitude();return i>this.radius&&(this.radius=i),this}transform(e){this.center.transform(e);const t=Fa(Xe,e);return this.radius=Math.max(t[0],Math.max(t[1],t[2]))*this.radius,this}distanceSquaredTo(e){const t=this.distanceTo(e);return t*t}distanceTo(e){const i=Xe.from(e).subtract(this.center);return Math.max(0,i.len()-this.radius)}intersectPlane(e){const t=this.center,i=this.radius,o=e.normal.dot(t)+e.distance;return o<-i?Q.OUTSIDE:o<i?Q.INTERSECTING:Q.INSIDE}}const bg=new M,xg=new M,Tt=new M,Et=new M,It=new M,Pg=new M,wg=new M,me={COLUMN0ROW0:0,COLUMN0ROW1:1,COLUMN0ROW2:2,COLUMN1ROW0:3,COLUMN1ROW1:4,COLUMN1ROW2:5,COLUMN2ROW0:6,COLUMN2ROW1:7,COLUMN2ROW2:8};class pi{constructor(e=[0,0,0],t=[0,0,0,0,0,0,0,0,0]){this.center=new M().from(e),this.halfAxes=new K(t)}get halfSize(){const e=this.halfAxes.getColumn(0),t=this.halfAxes.getColumn(1),i=this.halfAxes.getColumn(2);return[new M(e).len(),new M(t).len(),new M(i).len()]}get quaternion(){const e=this.halfAxes.getColumn(0),t=this.halfAxes.getColumn(1),i=this.halfAxes.getColumn(2),s=new M(e).normalize(),o=new M(t).normalize(),r=new M(i).normalize();return new qn().fromMatrix3(new K([...s,...o,...r]))}fromCenterHalfSizeQuaternion(e,t,i){const s=new qn(i),o=new K().fromQuaternion(s);return o[0]=o[0]*t[0],o[1]=o[1]*t[0],o[2]=o[2]*t[0],o[3]=o[3]*t[1],o[4]=o[4]*t[1],o[5]=o[5]*t[1],o[6]=o[6]*t[2],o[7]=o[7]*t[2],o[8]=o[8]*t[2],this.center=new M().from(e),this.halfAxes=o,this}clone(){return new pi(this.center,this.halfAxes)}equals(e){return this===e||!!e&&this.center.equals(e.center)&&this.halfAxes.equals(e.halfAxes)}getBoundingSphere(e=new Rn){const t=this.halfAxes,i=t.getColumn(0,Tt),s=t.getColumn(1,Et),o=t.getColumn(2,It),r=bg.copy(i).add(s).add(o);return e.center.copy(this.center),e.radius=r.magnitude(),e}intersectPlane(e){const t=this.center,i=e.normal,s=this.halfAxes,o=i.x,r=i.y,a=i.z,c=Math.abs(o*s[me.COLUMN0ROW0]+r*s[me.COLUMN0ROW1]+a*s[me.COLUMN0ROW2])+Math.abs(o*s[me.COLUMN1ROW0]+r*s[me.COLUMN1ROW1]+a*s[me.COLUMN1ROW2])+Math.abs(o*s[me.COLUMN2ROW0]+r*s[me.COLUMN2ROW1]+a*s[me.COLUMN2ROW2]),l=i.dot(t)+e.distance;return l<=-c?Q.OUTSIDE:l>=c?Q.INSIDE:Q.INTERSECTING}distanceTo(e){return Math.sqrt(this.distanceSquaredTo(e))}distanceSquaredTo(e){const t=xg.from(e).subtract(this.center),i=this.halfAxes,s=i.getColumn(0,Tt),o=i.getColumn(1,Et),r=i.getColumn(2,It),a=s.magnitude(),c=o.magnitude(),l=r.magnitude();s.normalize(),o.normalize(),r.normalize();let u=0,f;return f=Math.abs(t.dot(s))-a,f>0&&(u+=f*f),f=Math.abs(t.dot(o))-c,f>0&&(u+=f*f),f=Math.abs(t.dot(r))-l,f>0&&(u+=f*f),u}computePlaneDistances(e,t,i=[-0,-0]){let s=Number.POSITIVE_INFINITY,o=Number.NEGATIVE_INFINITY;const r=this.center,a=this.halfAxes,c=a.getColumn(0,Tt),l=a.getColumn(1,Et),u=a.getColumn(2,It),f=Pg.copy(c).add(l).add(u).add(r),d=wg.copy(f).subtract(e);let h=t.dot(d);return s=Math.min(h,s),o=Math.max(h,o),f.copy(r).add(c).add(l).subtract(u),d.copy(f).subtract(e),h=t.dot(d),s=Math.min(h,s),o=Math.max(h,o),f.copy(r).add(c).subtract(l).add(u),d.copy(f).subtract(e),h=t.dot(d),s=Math.min(h,s),o=Math.max(h,o),f.copy(r).add(c).subtract(l).subtract(u),d.copy(f).subtract(e),h=t.dot(d),s=Math.min(h,s),o=Math.max(h,o),r.copy(f).subtract(c).add(l).add(u),d.copy(f).subtract(e),h=t.dot(d),s=Math.min(h,s),o=Math.max(h,o),r.copy(f).subtract(c).add(l).subtract(u),d.copy(f).subtract(e),h=t.dot(d),s=Math.min(h,s),o=Math.max(h,o),r.copy(f).subtract(c).subtract(l).add(u),d.copy(f).subtract(e),h=t.dot(d),s=Math.min(h,s),o=Math.max(h,o),r.copy(f).subtract(c).subtract(l).subtract(u),d.copy(f).subtract(e),h=t.dot(d),s=Math.min(h,s),o=Math.max(h,o),i[0]=s,i[1]=o,i}transform(e){this.center.transformAsPoint(e);const t=this.halfAxes.getColumn(0,Tt);t.transformAsPoint(e);const i=this.halfAxes.getColumn(1,Et);i.transformAsPoint(e);const s=this.halfAxes.getColumn(2,It);return s.transformAsPoint(e),this.halfAxes=new K([...t,...i,...s]),this}getTransform(){throw new Error("not implemented")}}const mo=new M,yo=new M;class Fe{constructor(e=[0,0,1],t=0){this.normal=new M,this.distance=-0,this.fromNormalDistance(e,t)}fromNormalDistance(e,t){return Wi(Number.isFinite(t)),this.normal.from(e).normalize(),this.distance=t,this}fromPointNormal(e,t){e=mo.from(e),this.normal.from(t).normalize();const i=-this.normal.dot(e);return this.distance=i,this}fromCoefficients(e,t,i,s){return this.normal.set(e,t,i),Wi(zt(this.normal.len(),1)),this.distance=s,this}clone(){return new Fe(this.normal,this.distance)}equals(e){return zt(this.distance,e.distance)&&zt(this.normal,e.normal)}getPointDistance(e){return this.normal.dot(e)+this.distance}transform(e){const t=yo.copy(this.normal).transformAsVector(e).normalize(),i=this.normal.scale(-this.distance).transform(e);return this.fromPointNormal(i,t)}projectPointOntoPlane(e,t=[0,0,0]){const i=mo.from(e),s=this.getPointDistance(i),o=yo.copy(this.normal).scale(s);return i.subtract(o).to(t)}}const _o=[new M([1,0,0]),new M([0,1,0]),new M([0,0,1])],vo=new M,Cg=new M;class he{constructor(e=[]){this.planes=e}fromBoundingSphere(e){this.planes.length=2*_o.length;const t=e.center,i=e.radius;let s=0;for(const o of _o){let r=this.planes[s],a=this.planes[s+1];r||(r=this.planes[s]=new Fe),a||(a=this.planes[s+1]=new Fe);const c=vo.copy(o).scale(-i).add(t);r.fromPointNormal(c,o);const l=vo.copy(o).scale(i).add(t),u=Cg.copy(o).negate();a.fromPointNormal(l,u),s+=2}return this}computeVisibility(e){let t=Q.INSIDE;for(const i of this.planes)switch(e.intersectPlane(i)){case Q.OUTSIDE:return Q.OUTSIDE;case Q.INTERSECTING:t=Q.INTERSECTING;break}return t}computeVisibilityWithPlaneMask(e,t){if(Wi(Number.isFinite(t),"parentPlaneMask is required."),t===he.MASK_OUTSIDE||t===he.MASK_INSIDE)return t;let i=he.MASK_INSIDE;const s=this.planes;for(let o=0;o<this.planes.length;++o){const r=o<31?1<<o:0;if(o<31&&(t&r)===0)continue;const a=s[o],c=e.intersectPlane(a);if(c===Q.OUTSIDE)return he.MASK_OUTSIDE;c===Q.INTERSECTING&&(i|=r)}return i}}he.MASK_OUTSIDE=4294967295;he.MASK_INSIDE=0;he.MASK_INDETERMINATE=2147483647;new M;new M;new M;new M;new M;new M;new M;new M;new M;new M;new M;new M;new M;new M;new M;new M;new M;const ue=new K,Lg=new K,Sg=new K,Mt=new K,bo=new K;function Ag(n,e={}){const t=Sc,i=10;let s=0,o=0;const r=Lg,a=Sg;r.identity(),a.copy(n);const c=t*Tg(a);for(;o<i&&Eg(a)>c;)Ig(a,Mt),bo.copy(Mt).transpose(),a.multiplyRight(Mt),a.multiplyLeft(bo),r.multiplyRight(Mt),++s>2&&(++o,s=0);return e.unitary=r.toTarget(e.unitary),e.diagonal=a.toTarget(e.diagonal),e}function Tg(n){let e=0;for(let t=0;t<9;++t){const i=n[t];e+=i*i}return Math.sqrt(e)}const pn=[1,0,0],gn=[2,2,1];function Eg(n){let e=0;for(let t=0;t<3;++t){const i=n[ue.getElementIndex(gn[t],pn[t])];e+=2*i*i}return Math.sqrt(e)}function Ig(n,e){const t=Lc;let i=0,s=1;for(let l=0;l<3;++l){const u=Math.abs(n[ue.getElementIndex(gn[l],pn[l])]);u>i&&(s=l,i=u)}const o=pn[s],r=gn[s];let a=1,c=0;if(Math.abs(n[ue.getElementIndex(r,o)])>t){const l=n[ue.getElementIndex(r,r)],u=n[ue.getElementIndex(o,o)],f=n[ue.getElementIndex(r,o)],d=(l-u)/2/f;let h;d<0?h=-1/(-d+Math.sqrt(1+d*d)):h=1/(d+Math.sqrt(1+d*d)),a=1/Math.sqrt(1+h*h),c=h*a}return K.IDENTITY.to(e),e[ue.getElementIndex(o,o)]=e[ue.getElementIndex(r,r)]=a,e[ue.getElementIndex(r,o)]=c,e[ue.getElementIndex(o,r)]=-c,e}const ve=new M,Mg=new M,Bg=new M,Og=new M,Rg=new M,zg=new K,Ng={diagonal:new K,unitary:new K};function zn(n,e=new pi){if(!n||n.length===0)return e.halfAxes=new K([0,0,0,0,0,0,0,0,0]),e.center=new M,e;const t=n.length,i=new M(0,0,0);for(const O of n)i.add(O);const s=1/t;i.multiplyByScalar(s);let o=0,r=0,a=0,c=0,l=0,u=0;for(const O of n){const B=ve.copy(O).subtract(i);o+=B.x*B.x,r+=B.x*B.y,a+=B.x*B.z,c+=B.y*B.y,l+=B.y*B.z,u+=B.z*B.z}o*=s,r*=s,a*=s,c*=s,l*=s,u*=s;const f=zg;f[0]=o,f[1]=r,f[2]=a,f[3]=r,f[4]=c,f[5]=l,f[6]=a,f[7]=l,f[8]=u;const{unitary:d}=Ag(f,Ng),h=e.halfAxes.copy(d);let p=h.getColumn(0,Bg),g=h.getColumn(1,Og),y=h.getColumn(2,Rg),b=-Number.MAX_VALUE,P=-Number.MAX_VALUE,x=-Number.MAX_VALUE,w=Number.MAX_VALUE,T=Number.MAX_VALUE,E=Number.MAX_VALUE;for(const O of n)ve.copy(O),b=Math.max(ve.dot(p),b),P=Math.max(ve.dot(g),P),x=Math.max(ve.dot(y),x),w=Math.min(ve.dot(p),w),T=Math.min(ve.dot(g),T),E=Math.min(ve.dot(y),E);p=p.multiplyByScalar(.5*(w+b)),g=g.multiplyByScalar(.5*(T+P)),y=y.multiplyByScalar(.5*(E+x)),e.center.copy(p).add(g).add(y);const F=Mg.set(b-w,P-T,x-E).multiplyByScalar(.5),D=new K([F[0],0,0,0,F[1],0,0,0,F[2]]);return e.halfAxes.multiplyRight(D),e}const Me=512,xo=3,Yr=[[.5,.5],[0,0],[0,1],[1,0],[1,1]],Xr=Yr.concat([[0,.5],[.5,0],[1,.5],[.5,1]]),Fg=Xr.concat([[.25,.5],[.75,.5]]);class Be{constructor(e,t,i){this.x=e,this.y=t,this.z=i}get children(){if(!this._children){const e=this.x*2,t=this.y*2,i=this.z+1;this._children=[new Be(e,t,i),new Be(e,t+1,i),new Be(e+1,t,i),new Be(e+1,t+1,i)]}return this._children}update(e){const{viewport:t,cullingVolume:i,elevationBounds:s,minZ:o,maxZ:r,bounds:a,offset:c,project:l}=e,u=this.getBoundingVolume(s,c,l);if(a&&!this.insideBounds(a)||i.computeVisibility(u)<0||l&&this.beyondHorizon(t.cameraPosition,l,s[1]))return!1;if(!this.childVisible){let{z:d}=this;if(d<r&&d>=o){const h=u.distanceTo(t.cameraPosition)*t.scale/t.height;d+=Math.floor(Math.log2(h))}if(d>=r)return this.selected=!0,!0}this.selected=!1,this.childVisible=!0;for(const d of this.children)d.update(e);return!0}getSelected(e=[]){if(this.selected&&e.push(this),this._children)for(const t of this._children)t.getSelected(e);return e}beyondHorizon(e,t,i){const s=e[0],o=e[1],r=e[2],a=Math.sqrt(s*s+o*o+r*r),c=Math.atan2(s,-o)*180/Math.PI,l=Math.asin(r/a)*180/Math.PI,[u,f]=nt(this.x,this.y,this.z),[d,h]=nt(this.x+1,this.y+1,this.z),p=(u+d)/2,g=p+((c-p+540)%360-180),y=Math.max(u,Math.min(g,d)),b=Math.max(h,Math.min(l,f)),P=t([y,b,i]),x=P[0]*s+P[1]*o+P[2]*r,w=P[0]*P[0]+P[1]*P[1]+P[2]*P[2];return x<=w}insideBounds([e,t,i,s]){const o=Math.pow(2,this.z),r=Me/o;return this.x*r<i&&this.y*r<s&&(this.x+1)*r>e&&(this.y+1)*r>t}getBoundingVolume(e,t,i){if(i){const c=this.z<1?Fg:this.z<2?Xr:Yr,l=[];for(const u of c){const f=nt(this.x+u[0],this.y+u[1],this.z);f[2]=e[0],l.push(i(f)),e[0]!==e[1]&&(f[2]=e[1],l.push(i(f)))}return zn(l)}const s=Math.pow(2,this.z),o=Me/s,r=this.x*o+t*Me,a=Me-(this.y+1)*o;return new On([r,a,e[0]],[r+o,a+o,e[1]])}}function Dg(n,e,t,i){const s=n instanceof ri?n.projectPosition:null,o=Object.values(n.getFrustumPlanes()).map(({normal:h,distance:p})=>new Fe(h.clone().negate(),p)),r=new he(o),a=n.distanceScales.unitsPerMeter[2],c=t&&t[0]*a||0,l=t&&t[1]*a||0,u=n instanceof Wt&&n.pitch<=60?e:0;if(i){const[h,p,g,y]=i,b=ot([h,y]),P=ot([g,p]);i=[b[0],Me-b[1],P[0],Me-P[1]]}const f=new Be(0,0,0),d={viewport:n,project:s,cullingVolume:r,elevationBounds:[c,l],minZ:u,maxZ:e,bounds:i,offset:0};if(f.update(d),n instanceof Wt&&n.subViewports&&n.subViewports.length>1){for(d.offset=-1;f.update(d)&&!(--d.offset<-xo););for(d.offset=1;f.update(d)&&!(++d.offset>xo););}return f.getSelected()}const ye=512,kg=[-1/0,-1/0,1/0,1/0],Ug={equal:(n,e)=>{if(n===e)return!0;if(!Array.isArray(n)||!Array.isArray(e))return!1;const t=n.length;if(t!==e.length)return!1;for(let i=0;i<t;i++)if(n[i]!==e[i])return!1;return!0}};function Nn(n,e){const t=[e.transformAsPoint([n[0],n[1]]),e.transformAsPoint([n[2],n[1]]),e.transformAsPoint([n[0],n[3]]),e.transformAsPoint([n[2],n[3]])];return[Math.min(...t.map(s=>s[0])),Math.min(...t.map(s=>s[1])),Math.max(...t.map(s=>s[0])),Math.max(...t.map(s=>s[1]))]}function Vg(n){return Math.abs(n.split("").reduce((e,t)=>(e<<5)-e+t.charCodeAt(0)|0,0))}function jg(n,e){if(!n||!n.length)return null;const{index:t,id:i}=e;if(Array.isArray(n)){const o=Vg(i)%n.length;n=n[o]}let s=n;for(const o of Object.keys(t)){const r=new RegExp(`{${o}}`,"g");s=s.replace(r,String(t[o]))}return Number.isInteger(t.y)&&Number.isInteger(t.z)&&(s=s.replace(/\{-y\}/g,String(Math.pow(2,t.z)-t.y-1))),s}function Gg(n,e,t){let i;return i=n.getBounds(),n.isGeospatial?[Math.max(i[0],t[0]),Math.max(i[1],t[1]),Math.min(i[2],t[2]),Math.min(i[3],t[3])]:[Math.max(Math.min(i[0],t[2]),t[0]),Math.max(Math.min(i[1],t[3]),t[1]),Math.min(Math.max(i[2],t[0]),t[2]),Math.min(Math.max(i[3],t[1]),t[3])]}function $g({viewport:n,z:e,cullRect:t}){return(n.subViewports||[n]).map(s=>mn(s,e||0,t))}function mn(n,e,t){if(!Array.isArray(e)){const o=t.x-n.x,r=t.y-n.y,{width:a,height:c}=t,l={targetZ:e},u=n.unproject([o,r],l),f=n.unproject([o+a,r],l),d=n.unproject([o,r+c],l),h=n.unproject([o+a,r+c],l);return[Math.min(u[0],f[0],d[0],h[0]),Math.min(u[1],f[1],d[1],h[1]),Math.max(u[0],f[0],d[0],h[0]),Math.max(u[1],f[1],d[1],h[1])]}const i=mn(n,e[0],t),s=mn(n,e[1],t);return[Math.min(i[0],s[0]),Math.min(i[1],s[1]),Math.max(i[2],s[2]),Math.max(i[3],s[3])]}function Wg(n,e,t){return t?Nn(n,t).map(s=>s*e/ye):n.map(i=>i*e/ye)}function Fn(n,e){return Math.pow(2,n)*ye/e}function nt(n,e,t){const i=Fn(t,ye),s=n/i*360-180,o=Math.PI-2*Math.PI*e/i,r=180/Math.PI*Math.atan(.5*(Math.exp(o)-Math.exp(-o)));return[s,r]}function Po(n,e,t,i){const s=Fn(t,i);return[n/s*ye,e/s*ye]}function Hg(n,e,t,i,s=ye){if(n.isGeospatial){const[l,u]=nt(e,t,i),[f,d]=nt(e+1,t+1,i);return{west:l,north:u,east:f,south:d}}const[o,r]=Po(e,t,i,s),[a,c]=Po(e+1,t+1,i,s);return{left:o,top:r,right:a,bottom:c}}function qg(n,e,t,i,s){const o=Gg(n,null,i),r=Fn(e,t),[a,c,l,u]=Wg(o,r,s),f=[];for(let d=Math.floor(a);d<l;d++)for(let h=Math.floor(c);h<u;h++)f.push({x:d,y:h,z:e});return f}function Yg({viewport:n,maxZoom:e,minZoom:t,zRange:i,extent:s,tileSize:o=ye,modelMatrix:r,modelMatrixInverse:a,zoomOffset:c=0,visibleMinZoom:l,visibleMaxZoom:u}){let f=n.isGeospatial?Math.round(n.zoom+Math.log2(ye/o)+c):Math.ceil(n.zoom+c);if(typeof t=="number"&&Number.isFinite(t)&&f<t){if(!s)return[];f=t}if(typeof e=="number"&&Number.isFinite(e)&&f>e&&(f=e),l!=null&&n.zoom<l)return[];if(u!=null&&n.zoom>u)return[];let d=s;return r&&a&&s&&!n.isGeospatial&&(d=Nn(s,r)),n.isGeospatial?Dg(n,f,i,s):qg(n,f,o,d||kg,a)}function Xg(n){let e={},t;return i=>{for(const s in i)if(!Zg(i[s],e[s])){t=n(i),e=i;break}return t}}function Zg(n,e){if(n===e)return!0;if(Array.isArray(n)){const t=n.length;if(!e||e.length!==t)return!1;for(let i=0;i<t;i++)if(n[i]!==e[i])return!1;return!0}return!1}const wo=1,gi=2,Kg="never",Jg="no-overlap",Dn="best-available",Qg=5,Zr=0,Kr=1e8,Co=Kr-Zr-1,em={[Dn]:im,[Jg]:nm,[Kg]:()=>{}},tm={extent:null,tileSize:512,maxZoom:null,minZoom:null,maxCacheSize:null,maxCacheByteSize:null,refinementStrategy:"best-available",zRange:null,maxRequests:6,debounceTime:0,zoomOffset:0,visibleMinZoom:null,visibleMaxZoom:null,onTileLoad:()=>{},onTileUnload:()=>{},onTileError:()=>{}};class Jr{constructor(e){this._getCullBounds=Xg($g),this.opts={...tm,...e},this.setOptions(this.opts),this.onTileLoad=t=>{this.opts.onTileLoad?.(t),this.opts.maxCacheByteSize!==null&&(this._cacheByteSize+=t.byteLength,this._resizeCache())},this._requestScheduler=new tc({throttleRequests:this.opts.maxRequests>0||this.opts.debounceTime>0,maxRequests:this.opts.maxRequests,debounceTime:this.opts.debounceTime}),this._cache=new Map,this._tiles=[],this._dirty=!1,this._cacheByteSize=0,this._viewport=null,this._zRange=null,this._selectedTiles=null,this._frameNumber=0,this._modelMatrix=new Ie,this._modelMatrixInverse=new Ie}get tiles(){return this._tiles}get selectedTiles(){return this._selectedTiles}get isLoaded(){return this._selectedTiles!==null&&this._selectedTiles.every(e=>e.isLoaded)}get needsReload(){return this._selectedTiles!==null&&this._selectedTiles.some(e=>e.needsReload)}setOptions(e){Object.assign(this.opts,e),Number.isFinite(e.maxZoom)&&(this._maxZoom=Math.floor(e.maxZoom)),Number.isFinite(e.minZoom)&&(this._minZoom=Math.ceil(e.minZoom)),this._viewport=null}finalize(){for(const e of this._cache.values())e.isLoading&&e.abort();this._cache.clear(),this._tiles=[],this._selectedTiles=null}reloadAll(){for(const e of this._cache.keys()){const t=this._cache.get(e);!this._selectedTiles||!this._selectedTiles.includes(t)?this._cache.delete(e):t.setNeedsReload()}}update(e,{zRange:t,modelMatrix:i}={zRange:null,modelMatrix:null}){const s=i?new Ie(i):new Ie,o=!s.equals(this._modelMatrix);if(!this._viewport||!e.equals(this._viewport)||!zt(this._zRange,t)||o){o&&(this._modelMatrixInverse=s.clone().invert(),this._modelMatrix=s),this._viewport=e,this._zRange=t;const a=this.getTileIndices({viewport:e,maxZoom:this._maxZoom,minZoom:this._minZoom,zRange:t,modelMatrix:this._modelMatrix,modelMatrixInverse:this._modelMatrixInverse});this._selectedTiles=a.map(c=>this._getTile(c,!0)),this._dirty&&this._rebuildTree()}else this.needsReload&&(this._selectedTiles=this._selectedTiles.map(a=>this._getTile(a.index,!0)));const r=this.updateTileStates();return this._pruneRequests(),this._dirty&&this._resizeCache(),r&&this._frameNumber++,this._frameNumber}isTileVisible(e,t,i){if(!e.isVisible)return!1;if(t&&this._viewport){const s=this._getCullBounds({viewport:this._viewport,z:this._zRange,cullRect:t});let{bbox:o}=e;for(const[r,a,c,l]of s){let u;if("west"in o)u=o.west<c&&o.east>r&&o.south<l&&o.north>a;else{if(i&&!Ie.IDENTITY.equals(i)){const[h,p,g,y]=Nn([o.left,o.top,o.right,o.bottom],i);o={left:h,top:p,right:g,bottom:y}}const f=Math.min(o.top,o.bottom),d=Math.max(o.top,o.bottom);u=o.left<c&&o.right>r&&f<l&&d>a}if(u)return!0}return!1}return!0}getTileIndices({viewport:e,maxZoom:t,minZoom:i,zRange:s,modelMatrix:o,modelMatrixInverse:r}){const{tileSize:a,extent:c,zoomOffset:l,visibleMinZoom:u,visibleMaxZoom:f}=this.opts;return Yg({viewport:e,maxZoom:t,minZoom:i,zRange:s,tileSize:a,extent:c,modelMatrix:o,modelMatrixInverse:r,zoomOffset:l,visibleMinZoom:u,visibleMaxZoom:f})}getTileId(e){return`${e.x}-${e.y}-${e.z}`}getTileZoom(e){return e.z}getTileMetadata(e){const{tileSize:t}=this.opts;return{bbox:Hg(this._viewport,e.x,e.y,e.z,t)}}getParentIndex(e){const t=Math.floor(e.x/2),i=Math.floor(e.y/2),s=e.z-1;return{x:t,y:i,z:s}}updateTileStates(){const e=this.opts.refinementStrategy||Dn,t=new Array(this._cache.size);let i=0;for(const s of this._cache.values())t[i++]=s.isVisible,s.isSelected=!1,s.isVisible=!1;for(const s of this._selectedTiles)s.isSelected=!0,s.isVisible=!0;(typeof e=="function"?e:em[e])(Array.from(this._cache.values())),i=0;for(const s of this._cache.values())if(t[i++]!==s.isVisible)return!0;return!1}_getRequestPriority(e){if(!e.isSelected&&!e.isVisible)return-1;const t=this._getTileDistancePriority(e);return e.isSelected?Zr+t:Kr+t}_getTileDistancePriority(e){const{width:t,height:i}=this._viewport||{};if(!this._viewport||!t||!i)return 0;try{const s=this._getTileScreenCorners(e.bbox),o=[t/2,i/2];if(s.length===4){if(this._isPointInPolygon(o,s))return 0;const r=s.reduce((a,c,l)=>{const u=s[(l+1)%s.length];return Math.min(a,this._getPointToSegmentDistanceSquared(o,c,u))},Number.MAX_SAFE_INTEGER);return Math.min(r,Co)}}catch{}return Co}_getTileScreenCorners(e){return("west"in e?[[e.west,e.south],[e.east,e.south],[e.east,e.north],[e.west,e.north]]:[[e.left,e.top],[e.right,e.top],[e.right,e.bottom],[e.left,e.bottom]]).map(i=>this._viewport.project(i)).filter(([i,s])=>Number.isFinite(i)&&Number.isFinite(s))}_isPointInPolygon(e,t){let i=!1;const[s,o]=e;for(let r=0,a=t.length-1;r<t.length;a=r++){const[c,l]=t[r],[u,f]=t[a];l>o!=f>o&&s<(u-c)*(o-l)/(f-l)+c&&(i=!i)}return i}_getPointToSegmentDistanceSquared(e,t,i){const[s,o]=e,[r,a]=t,[c,l]=i,u=c-r,f=l-a,d=u*u+f*f,h=d?Math.max(0,Math.min(1,((s-r)*u+(o-a)*f)/d)):0,p=r+h*u,g=a+h*f,y=s-p,b=o-g;return y*y+b*b}_pruneRequests(){const{maxRequests:e=0}=this.opts,t=[];let i=0;for(const s of this._cache.values())s.isLoading&&(i++,!s.isSelected&&!s.isVisible&&t.push(s));for(;e>0&&i>e&&t.length>0;)t.shift().abort(),i--}_rebuildTree(){const{_cache:e}=this;for(const t of e.values())t.parent=null,t.children&&(t.children.length=0);for(const t of e.values()){const i=this._getNearestAncestor(t);t.parent=i,i?.children&&i.children.push(t)}}_resizeCache(){const{_cache:e,opts:t}=this,i=t.maxCacheSize??(t.maxCacheByteSize!==null?1/0:Qg*this.selectedTiles.length),s=t.maxCacheByteSize??1/0;if(e.size>i||this._cacheByteSize>s){for(const[r,a]of e)if(!a.isVisible&&!a.isSelected&&(this._cacheByteSize-=t.maxCacheByteSize!==null?a.byteLength:0,e.delete(r),this.opts.onTileUnload?.(a)),e.size<=i&&this._cacheByteSize<=s)break;this._rebuildTree(),this._dirty=!0}this._dirty&&(this._tiles=Array.from(this._cache.values()).sort((r,a)=>r.zoom-a.zoom),this._dirty=!1)}_getTile(e,t){const i=this.getTileId(e);let s=this._cache.get(i),o=!1;return!s&&t?(s=new _g(e),Object.assign(s,this.getTileMetadata(s.index)),Object.assign(s,{id:i,zoom:this.getTileZoom(s.index)}),o=!0,this._cache.set(i,s),this._dirty=!0):s&&s.needsReload&&(o=!0),s&&o&&s.loadData({getData:this.opts.getTileData,getRequestPriority:this._getRequestPriority.bind(this),requestScheduler:this._requestScheduler,onLoad:this.onTileLoad,onError:this.opts.onTileError}),s}_getNearestAncestor(e){const{_minZoom:t=0}=this;let i=e.index;for(;this.getTileZoom(i)>t;){i=this.getParentIndex(i);const s=this._getTile(i);if(s)return s}return null}}function im(n){for(const e of n)e.state=0;for(const e of n)e.isSelected&&!Qr(e)&&kn(e);for(const e of n)e.isVisible=!!(e.state&gi)}function nm(n){for(const t of n)t.state=0;for(const t of n)t.isSelected&&Qr(t);const e=Array.from(n).sort((t,i)=>t.zoom-i.zoom);for(const t of e)if(t.isVisible=!!(t.state&gi),t.children&&(t.isVisible||t.state&wo))for(const i of t.children)i.state=wo;else t.isSelected&&kn(t)}function Qr(n){let e=n;for(;e;){if(e.isLoaded||e.content)return e.state|=gi,!0;e=e.parent}return!1}function kn(n){for(const e of n.children)e.isLoaded||e.content?e.state|=gi:kn(e)}const sm={TilesetClass:Jr,data:{type:"data",value:[]},dataComparator:Ug.equal,renderSubLayers:{type:"function",value:n=>new Mn(n)},getTileData:{type:"function",optional:!0,value:null},onViewportLoad:{type:"function",optional:!0,value:null},onTileLoad:{type:"function",value:n=>{}},onTileUnload:{type:"function",value:n=>{}},onTileError:{type:"function",value:n=>console.error(n)},extent:{type:"array",optional:!0,value:null,compare:!0},tileSize:512,maxZoom:null,minZoom:0,maxCacheSize:null,maxCacheByteSize:null,refinementStrategy:Dn,zRange:null,maxRequests:6,debounceTime:0,zoomOffset:0,visibleMinZoom:null,visibleMaxZoom:null};class mi extends Te{initializeState(){this.state={tileset:null,isLoaded:!1}}finalizeState(){this.state?.tileset?.finalize()}get isLoaded(){return!!this.state?.tileset?.selectedTiles?.every(e=>e.isLoaded&&(!e.content||!e.layers||e.layers.every(t=>t.isLoaded)))}shouldUpdateState({changeFlags:e}){return e.somethingChanged}updateState({changeFlags:e}){let{tileset:t}=this.state;const i=e.propsOrDataChanged||e.updateTriggersChanged,s=e.dataChanged||e.updateTriggersChanged&&(e.updateTriggersChanged.all||e.updateTriggersChanged.getTileData);t?i&&(t.setOptions(this._getTilesetOptions()),s?t.reloadAll():t.tiles.forEach(o=>{o.layers=null})):(t=new this.props.TilesetClass(this._getTilesetOptions()),this.setState({tileset:t})),this._updateTileset()}_getTilesetOptions(){const{tileSize:e,maxCacheSize:t,maxCacheByteSize:i,refinementStrategy:s,extent:o,maxZoom:r,minZoom:a,maxRequests:c,debounceTime:l,zoomOffset:u,visibleMinZoom:f,visibleMaxZoom:d}=this.props;return{maxCacheSize:t,maxCacheByteSize:i,maxZoom:r,minZoom:a,tileSize:e,refinementStrategy:s,extent:o,maxRequests:c,debounceTime:l,zoomOffset:u,visibleMinZoom:f,visibleMaxZoom:d,getTileData:this.getTileData.bind(this),onTileLoad:this._onTileLoad.bind(this),onTileError:this._onTileError.bind(this),onTileUnload:this._onTileUnload.bind(this)}}_updateTileset(){const e=this.state.tileset,{zRange:t,modelMatrix:i}=this.props,s=e.update(this.context.viewport,{zRange:t,modelMatrix:i}),{isLoaded:o}=e,r=this.state.isLoaded!==o,a=this.state.frameNumber!==s;o&&(r||a)&&this._onViewportLoad(),a&&this.setState({frameNumber:s}),this.state.isLoaded=o}_onViewportLoad(){const{tileset:e}=this.state,{onViewportLoad:t}=this.props;t&&t(e.selectedTiles)}_onTileLoad(e){this.props.onTileLoad(e),e.layers=null,this.setNeedsUpdate()}_onTileError(e,t){this.props.onTileError(e),t.layers=null,this.setNeedsUpdate()}_onTileUnload(e){this.props.onTileUnload(e)}getTileData(e){const{data:t,getTileData:i,fetch:s}=this.props,{signal:o}=e;return e.url=typeof t=="string"||Array.isArray(t)?jg(t,e):null,i?i(e):s&&e.url?s(e.url,{propName:"data",layer:this,signal:o}):null}renderSubLayers(e){return this.props.renderSubLayers(e)}getSubLayerPropsByTile(e){return null}getPickingInfo(e){const t=e.sourceLayer,i=t.props.tile,s=e.info;return s.picked&&(s.tile=i),s.sourceTile=i,s.sourceTileSubLayer=t,s}_updateAutoHighlight(e){e.sourceTileSubLayer.updateAutoHighlight(e)}renderLayers(){const{visibleMinZoom:e,visibleMaxZoom:t,minZoom:i,extent:s}=this.props,o=this.context.viewport.zoom;if(e!=null&&o<e||t!=null&&o>t||i!=null&&!s&&o<i){for(const a of this.state.tileset.tiles)a.layers=null;return[]}return this.state.tileset.tiles.map(a=>{const c=this.getSubLayerPropsByTile(a);if(!(!a.isLoaded&&!a.content))if(a.layers)c&&a.layers[0]&&Object.keys(c).some(l=>a.layers[0].props[l]!==c[l])&&(a.layers=a.layers.map(l=>l.clone(c)));else{const l=this.renderSubLayers({...this.props,...this.getSubLayerProps({id:a.id,updateTriggers:this.props.updateTriggers}),data:a.content,_offset:0,tile:a});a.layers=zo(l,Boolean).map(u=>u.clone({tile:a,...c}))}return a.layers})}filterSubLayer({layer:e,cullRect:t}){const{tile:i}=e.props,{modelMatrix:s}=this.props;return this.state.tileset.isTileVisible(i,t,s?new Ie(s):null)}}mi.defaultProps=sm;mi.layerName="TileLayer";class Um{levels;projectTo3857;projectFrom3857;projectTo4326;projectFrom4326;projectedBounds;constructor(e){if(e.levels.length===0)throw new Error("AffineTileset requires at least one level");this.levels=e.levels,this.projectTo3857=e.projectTo3857,this.projectFrom3857=e.projectFrom3857,this.projectTo4326=e.projectTo4326,this.projectFrom4326=e.projectFrom4326,this.projectedBounds=e.levels[0].projectedBounds}}const ni=1e-6;function Lo(n,e){const t=Math.floor(n+ni),i=Math.ceil(e-ni)-1;return[t,Math.max(t,i)]}class Vm{tileWidth;tileHeight;matrixWidth;matrixHeight;metersPerPixel;projectedBounds;_affine;_invAffine;_arrayWidth;_arrayHeight;constructor(e){this._affine=e.affine,this._invAffine=Gn(e.affine),this._arrayWidth=e.arrayWidth,this._arrayHeight=e.arrayHeight,this.tileWidth=e.tileWidth,this.tileHeight=e.tileHeight,this.matrixWidth=Math.ceil(e.arrayWidth/e.tileWidth),this.matrixHeight=Math.ceil(e.arrayHeight/e.tileHeight);const t=ra(e.affine),i=aa(e.affine);this.metersPerPixel=Math.sqrt(Math.abs(t*i))*e.mpu;const s=[ne(e.affine,0,0),ne(e.affine,e.arrayWidth,0),ne(e.affine,0,e.arrayHeight),ne(e.affine,e.arrayWidth,e.arrayHeight)],o=s.map(([a])=>a),r=s.map(([,a])=>a);this.projectedBounds=[Math.min(...o),Math.min(...r),Math.max(...o),Math.max(...r)]}projectedTileCorners(e,t){const i=this.tileWidth,s=this.tileHeight,o=this._affine,r=Math.min(e*i,this._arrayWidth),a=Math.min((e+1)*i,this._arrayWidth),c=Math.min(t*s,this._arrayHeight),l=Math.min((t+1)*s,this._arrayHeight);return{topLeft:ne(o,r,c),topRight:ne(o,a,c),bottomLeft:ne(o,r,l),bottomRight:ne(o,a,l)}}tileTransform(e,t){const i=ca(e*this.tileWidth,t*this.tileHeight),s=la(this._affine,i),o=Gn(s);return{forwardTransform:(r,a)=>ne(s,r,a),inverseTransform:(r,a)=>ne(o,r,a)}}crsBoundsToTileRange(e,t,i,s){const o=this._invAffine,r=[ne(o,e,t),ne(o,i,t),ne(o,e,s),ne(o,i,s)],a=r.map(([O])=>O),c=r.map(([,O])=>O),l=Math.min(...a),u=Math.max(...a),f=Math.min(...c),d=Math.max(...c),h=this.tileWidth,p=this.tileHeight,g=this.matrixWidth-1,y=this.matrixHeight-1,[b,P]=Lo(l/h,u/h),[x,w]=Lo(f/p,d/p),T=Math.max(0,b),E=Math.min(g,P),F=Math.max(0,x),D=Math.min(y,w);return{minCol:T,maxCol:E,minRow:F,maxRow:D}}}const om=65536;class ea{entries=new Map;maxEntries;constructor({maxEntries:e=om}={}){this.maxEntries=Math.max(0,e)}get size(){return this.entries.size}get(e,t,i){const s=`${e}/${t}/${i}`,o=this.entries.get(s);if(o!==void 0)return this.entries.delete(s),this.entries.set(s,o),o}set(e,t,i,s){const o=`${e}/${t}/${i}`;this.entries.delete(o),this.entries.set(o,s)}clear(){this.entries.clear()}sweep(){if(this.entries.size<=this.maxEntries)return;const e=Math.floor(this.maxEntries/2),t=this.entries.size-e,i=[];for(const s of this.entries.keys())if(i.push(s),i.length>=t)break;for(const s of i)this.entries.delete(s)}}function ta(n,e){return[Math.max(n[0],e[0]),Math.max(n[1],e[1]),Math.min(n[2],e[2]),Math.min(n[3],e[3])]}function rm(n){const e=n.getBounds();if(!n.subViewports&&!(n instanceof ri)){const[t,i,s,o]=e;return[[Math.max(t,-180),i,Math.min(s,180),o]]}return Np(zp(e))}const ee=512,So=3,am=[[.5,.5],[0,0],[0,1],[1,0],[1,1]],ia=am.concat([[0,.5],[.5,0],[1,.5],[.5,1]]),cm=ia.concat([[.25,.5],[.75,.5]]),yn=6378137,De=2*Math.PI*yn,Ao=De/2,To=85.05112877980659;class si{x;y;z;descriptor;childVisible;selected;_children;constructor(e,t,i,{descriptor:s}){this.x=e,this.y=t,this.z=i,this.descriptor=s}get level(){return this.descriptor.levels[this.z]}get children(){if(!this._children){const e=this.descriptor.levels.length-1;if(this.z>=e)return this._children=null,null;const t=this.z+1,i=this.descriptor.levels[t],s=this.level.projectedTileCorners(this.x,this.y),o=Pm(s),{minCol:r,maxCol:a,minRow:c,maxRow:l}=i.crsBoundsToTileRange(...o),u=[],{descriptor:f}=this;for(let d=c;d<=l;d++)for(let h=r;h<=a;h++)u.push(new si(h,d,t,{descriptor:f}));this._children=u.length>0?u:null}return this._children}update(e){const{viewport:t,cullingVolume:i,elevationBounds:s,minZ:o,maxZ:r=this.descriptor.levels.length-1,project:a,bounds:c,pixelRatio:l,worldOffset:u=0,boundingVolumeCache:f}=e;u===0&&(this.childVisible=!1,this.selected=!1);const{boundingVolume:d,commonSpaceBounds:h}=this.getBoundingVolume(s,a,f,u);if(c){const b=this.getBoundingVolume(s,a,f,0);if(!this.insideBounds(c,b.commonSpaceBounds))return!1}let p=i.computeVisibility(d);const g=a?0:xm(h,u);if(p<0&&g!==0){const b=Mo({boundingVolume:d,commonSpaceBounds:h},g);p=i.computeVisibility(b.boundingVolume)}if(p<0)return!1;const y=this.children;if(!this.childVisible&&this.z>=o){const b=vm(h,t.zoom);if(this.level.metersPerPixel*l/b<=1||this.z>=r||y===null&&this.z>=o)return this.selected=!0,!0}if(y&&y.length>0){u===0&&(this.selected=!1);let b=!1;for(const P of y)P.update(e)&&(b=!0);return b&&(this.childVisible=!0),b}return!0}getSelected(e=[]){if(this.selected&&e.push(this),this._children)for(const t of this._children)t.getSelected(e);return e}insideBounds(e,t){const[i,s,o,r]=e,[a,c,l,u]=t;return[0,-ee,ee].some(h=>a+h<o&&l+h>i)&&c<r&&u>s}getBoundingVolume(e,t,i,s=0){const o=i.get(this.z,this.x,this.y);let r;if(o&&o.zRange[0]===e[0]&&o.zRange[1]===e[1])r=o;else if(o?.commonSpacePositions){const a={...o,zRange:e,boundingVolume:Io(o.commonSpacePositions,e)};i.set(this.z,this.x,this.y,a),r=a}else{const a=this.computeBoundingVolume(e,t);i.set(this.z,this.x,this.y,{zRange:e,...a}),r=a}return s===0?r:Mo(r,s*ee)}computeBoundingVolume(e,t){return t?this._getGlobeBoundingVolume(t):this._getGenericBoundingVolume(e)}_getGenericBoundingVolume(e){const t=this.level.projectedTileCorners(this.x,this.y),i=um(ia,t,this.descriptor.projectTo3857,this.descriptor.projectTo4326),s=bm(i.map(u=>na(u)));let o=Number.POSITIVE_INFINITY,r=Number.POSITIVE_INFINITY,a=Number.NEGATIVE_INFINITY,c=Number.NEGATIVE_INFINITY;for(const[u,f]of s)u<o&&(o=u),f<r&&(r=f),u>a&&(a=u),f>c&&(c=f);const l=[o,r,a,c];return{boundingVolume:Io(s,e),commonSpaceBounds:l,commonSpacePositions:s}}_getGlobeBoundingVolume(e){const t=this.level.projectedTileCorners(this.x,this.y),i=fm(cm,t,this.descriptor.projectTo4326),s=[];let o=Number.POSITIVE_INFINITY,r=Number.POSITIVE_INFINITY,a=Number.NEGATIVE_INFINITY,c=Number.NEGATIVE_INFINITY;for(const[l,u]of i){const f=e([l,u,0]);s.push([f[0],f[1],f[2]]);const[d,h]=ot([l,u]);d<o&&(o=d),h<r&&(r=h),d>a&&(a=d),h>c&&(c=h)}return{boundingVolume:zn(s),commonSpaceBounds:[o,r,a,c]}}}function lm(n,e){return(t,i)=>{const[s,o]=n(t,i);if(Number.isFinite(s)&&Number.isFinite(o))return[s,o];const[r,a]=e(t,i),l=Math.max(-To,Math.min(To,a))*Math.PI/180,u=r*Math.PI*yn/180,f=Math.log(Math.tan(Math.PI/4+l/2))*yn;return[u,f]}}function um(n,e,t,i){const{topLeft:s,topRight:o,bottomLeft:r,bottomRight:a}=e,c=lm(t,i),l=(h,p)=>c(...sa(s,o,r,a,h,p)),[u,f]=n[0],d=l(u,f)[0];return n.map(([h,p])=>{const[g,y]=l(h,p),b=Bn(P=>l(u+P*(h-u),f+P*(p-f))[0],{start:d,period:De});return[Number.isFinite(b)?b:g,y]})}function fm(n,e,t){const{topLeft:i,topRight:s,bottomLeft:o,bottomRight:r}=e,a=[];for(const[c,l]of n){const[u,f]=sa(i,s,o,r,c,l),[d,h]=t(u,f);a.push([d,Math.max(-90,Math.min(90,h))])}return a}function na([n,e]){const t=Math.max(-Ao,Math.min(Ao,e));return[(n/De+.5)*ee,(t/De+.5)*ee]}function dm([n,e]){return[(n/ee-.5)*De,(e/ee-.5)*De]}const hm=100;function pm(n){const{descriptor:e,viewport:t,datasetWgs84Bounds:i}=n,s=e.levels[0],o=[];if(s.matrixWidth*s.matrixHeight<=hm){for(let c=0;c<s.matrixHeight;c++)for(let l=0;l<s.matrixWidth;l++)o.push(new si(l,c,0,{descriptor:e}));return o}const a=[];for(const c of rm(t))for(const l of[-360,0,360]){const u=ta(i,[c[0]+l,c[1],c[2]+l,c[3]]);if(u[0]>=u[2]||u[1]>=u[3])continue;const[f,d,h,p]=hn(e.projectFrom4326,u[0],u[1],u[2],u[3]);a.push(s.crsBoundsToTileRange(f,d,h,p))}for(let c=0;c<a.length;c++){const l=a[c],u=a.slice(0,c);for(let f=l.minRow;f<=l.maxRow;f++)for(let d=l.minCol;d<=l.maxCol;d++)gm(u,d,f)||o.push(new si(d,f,0,{descriptor:e}))}return o}function gm(n,e,t){for(const i of n)if(e>=i.minCol&&e<=i.maxCol&&t>=i.minRow&&t<=i.maxRow)return!0;return!1}function mm(n,e){const{viewport:t,maxZ:i,zRange:s,wgs84Bounds:o,pixelRatio:r=1}=e,a=e.boundingVolumeCache??new ea;a.sweep();const c=t instanceof ri&&t.resolution?t.projectPosition:null,l=Object.values(t.getFrustumPlanes()).map(({normal:B,distance:Z})=>new Fe(B.clone().negate(),Z)),u=new he(l),f=t.distanceScales.unitsPerMeter[2],d=s&&s[0]*f||0,h=s&&s[1]*f||0,p=0,[g,y,b,P]=o,x=ot([g,y]),w=ot([b,P]),T=[x[0],x[1],w[0],w[1]],E=pm({descriptor:n,viewport:t,datasetWgs84Bounds:o}),F={viewport:t,project:c,cullingVolume:u,elevationBounds:[d,h],minZ:p,maxZ:i,bounds:T,pixelRatio:r,boundingVolumeCache:a};for(const B of E)B.update(F);if((t.subViewports?.length??0)>1){for(let B=-1;B>=-So&&Eo(E,F,B);B--);for(let B=1;B<=So&&Eo(E,F,B);B++);}const O=[];for(const B of E)B.getSelected(O);return ym(O)}function ym(n){const e=new Set;return n.filter(t=>{const i=`${t.z}/${t.x}/${t.y}`;return e.has(i)?!1:(e.add(i),!0)})}function Eo(n,e,t){let i=!1;for(const s of n)s.update({...e,worldOffset:t})&&(i=!0);return i}function _m(n,e){return 40075016686e-3*Math.cos(n*Math.PI/180)/2**(e+8)}function vm(n,e){const[t,i,s,o]=n,[,r]=Da([(t+s)/2,(i+o)/2]);return _m(r,e)}function bm(n){const e=n.map(([o])=>o);if(!(Math.max(...e)-Math.min(...e)>=ee/2))return n;const t=n.map(([,o])=>o),i=Math.min(...t),s=Math.max(...t);return[[0,i],[ee,i],[0,s],[ee,s]]}function xm(n,e){const t=n[0]-e*ee;return n[2]-e*ee>ee?-ee:t<0?ee:0}function Io(n,[e,t]){const i=[];for(const[s,o]of n)i.push([s,o,e]),e!==t&&i.push([s,o,t]);return zn(i)}function Mo(n,e){const{boundingVolume:t,commonSpaceBounds:i}=n,s=t.center,o=new M((s[0]??0)+e,s[1]??0,s[2]??0),r=new pi(o,t.halfAxes),a=[i[0]+e,i[1],i[2]+e,i[3]];return{boundingVolume:r,commonSpaceBounds:a}}function Pm({topLeft:n,topRight:e,bottomLeft:t,bottomRight:i}){const s=[n[0],e[0],t[0],i[0]],o=[n[1],e[1],t[1],i[1]];return[Math.min(...s),Math.min(...o),Math.max(...s),Math.max(...o)]}function sa(n,e,t,i,s,o){const r=(1-s)*(1-o),a=s*(1-o),c=(1-s)*o,l=s*o;return[n[0]*r+e[0]*a+t[0]*c+i[0]*l,n[1]*r+e[1]*a+t[1]*c+i[1]*l]}const wm=85.05112877980659,Bt=1e-6;function Cm(n,e=wm){const{topLeft:t,topRight:i,bottomLeft:s,bottomRight:o}=n;if(!(Math.abs(t-i)<Bt&&Math.abs(s-o)<Bt))return;const a=t,c=s;if(Math.abs(c-a)<=Bt||a<=e&&a>=-e&&c<=e&&c>=-e)return;const l=p=>Math.max(0,Math.min(1,p)),u=(e-a)/(c-a),f=(-e-a)/(c-a),d=l(Math.min(u,f)),h=l(Math.max(u,f));if(!(h-d<Bt))return Hr(0,d,1,h)}class Lm extends Jr{descriptor;wgs84Bounds;getPixelRatio;boundingVolumeCache;projectPosition;unprojectPosition;lastViewportIsGlobe;constructor(e,t,{getPixelRatio:i,maxBoundingVolumeCacheSize:s}={}){super(e),this.descriptor=t,this.getPixelRatio=i??(()=>1),this.boundingVolumeCache=new ea({maxEntries:s}),this.projectPosition=(a,c)=>na(t.projectTo3857(a,c)),this.unprojectPosition=(a,c)=>{const[l,u]=dm([a,c]);return t.projectFrom3857(l,u)};const o=hn(this.descriptor.projectTo4326,...this.descriptor.projectedBounds),r=85.0511287798066;this.wgs84Bounds=[o[0],Math.max(o[1],-r),o[2],Math.min(o[3],r)]}finalize(){const{onTileUnload:e}=this.opts;for(const t of this.tiles)t.isLoading?Promise.resolve(t.data).then(()=>e(t)):e(t);super.finalize()}getTileIndices(e){const{viewport:t,minZoom:i}=e,s=!!(t instanceof ri&&t.resolution);if(this.lastViewportIsGlobe!==void 0&&this.lastViewportIsGlobe!==s&&this.boundingVolumeCache.clear(),this.lastViewportIsGlobe=s,typeof i=="number"&&t.zoom<i)return[];let o=this.wgs84Bounds;const{extent:r}=this.opts;if(r&&(o=ta(o,r),o[0]>=o[2]||o[1]>=o[3]))return[];const a=this.descriptor.levels.length-1,c=typeof e.maxZoom=="number"?Math.min(e.maxZoom,a):a;return mm(this.descriptor,{viewport:t,maxZ:c,zRange:e.zRange??null,wgs84Bounds:o,pixelRatio:this.getPixelRatio(),boundingVolumeCache:this.boundingVolumeCache})}getTileId(e){return`${e.x}-${e.y}-${e.z}`}getParentIndex(e){if(e.z===0)return e;const t=this.descriptor.levels[e.z],i=this.descriptor.levels[e.z-1],s=i.metersPerPixel*i.tileWidth,o=i.metersPerPixel*i.tileHeight,r=t.metersPerPixel*t.tileWidth,a=t.metersPerPixel*t.tileHeight,c=s/r,l=o/a;return{x:Math.floor(e.x/c+ni),y:Math.floor(e.y/l+ni),z:e.z-1}}getTileZoom(e){return e.z}getTileMetadata(e){const{x:t,y:i,z:s}=e,o=this.descriptor.levels[s],{tileHeight:r,tileWidth:a}=o,{topLeft:c,topRight:l,bottomLeft:u,bottomRight:f}=o.projectedTileCorners(t,i),d={topLeft:c,topRight:l,bottomLeft:u,bottomRight:f},h=[Math.min(c[0],l[0],u[0],f[0]),Math.min(c[1],l[1],u[1],f[1]),Math.max(c[0],l[0],u[0],f[0]),Math.max(c[1],l[1],u[1],f[1])],[p,g,y,b]=hn(this.descriptor.projectTo4326,...h),{forwardTransform:P,inverseTransform:x}=o.tileTransform(t,i),w=E=>this.descriptor.projectTo4326(E[0],E[1])[1],T=Cm({topLeft:w(c),topRight:w(l),bottomLeft:w(u),bottomRight:w(f)});return{bbox:{west:p,south:g,east:y,north:b},projectedBbox:{left:h[0],bottom:h[1],right:h[2],top:h[3]},projectedCorners:d,tileWidth:a,tileHeight:r,forwardTransform:P,inverseTransform:x,_projectPosition:this.projectPosition,_unprojectPosition:this.unprojectPosition,_webMercatorInitialTriangulation:T}}}const Sm={...mi.defaultProps,maxError:.125,debug:!1,debugOpacity:.5,zRange:{type:"array",value:null,optional:!0,compare:!0}};class jm extends Te{static layerName="RasterTileLayer";static defaultProps=Sm;_tilesetDescriptor(){return this.props.tilesetDescriptor}_isLoadingMetadata(){return!1}get isLoaded(){return!this._isLoadingMetadata()&&super.isLoaded}_getTileDataCallback(){return this.props.getTileData}_renderTileCallback(){return this.props.renderTile}_onTileUnloadCallback(){return this.props.onTileUnload}_renderDebug(e,t){const i=this._tilesetDescriptor();return i?jp(`${this.id}-${e.id}-bounds`,e,i.projectTo4326):[]}renderLayers(){const e=this._tilesetDescriptor(),t=this._getTileDataCallback(),i=this._renderTileCallback();return!e||!t||!i?null:this._renderTileLayer(e,t,i)}_renderTileLayer(e,t,i){const s=this.context.device;class o extends Lm{constructor(E){super(E,e,{getPixelRatio:()=>{const F=s.getDefaultCanvasContext(),[D]=F.getDrawingBufferSize(),[O]=F.getCSSSize();return O?D/O:1}})}}const{tileSize:r,zoomOffset:a,maxZoom:c,minZoom:l,extent:u,debounceTime:f,maxCacheSize:d,maxCacheByteSize:h,maxRequests:p,refinementStrategy:g,zRange:y,updateTriggers:b,onTileError:P,onTileLoad:x,onViewportLoad:w}=this.props;return new mi({id:`raster-tile-layer-${this.id}`,TilesetClass:o,getTileData:T=>this._wrapGetTileData(T,t),renderSubLayers:T=>this._renderSubLayers(T,e,i),updateTriggers:{renderSubLayers:b?.renderTile},tileSize:r,zoomOffset:a,maxZoom:c,minZoom:l,extent:u,debounceTime:f,maxCacheSize:d,maxCacheByteSize:h,maxRequests:p,refinementStrategy:g,zRange:y,onTileError:P,onTileLoad:x,onTileUnload:this._onTileUnloadCallback(),onViewportLoad:w})}async _wrapGetTileData(e,t){const{signal:i}=e,s=this.props.signal,o=s&&i?AbortSignal.any([s,i]):s??i,r={device:this.context.device,signal:o};return t(e,r)}_renderSubLayers(e,t,i){const{maxError:s,debug:o,debugOpacity:r}=this.props,a=e.tile,c=o?this._renderDebug(a,e.data??null):[];if(!e.data)return c;const{forwardTransform:l,inverseTransform:u}=a,f=i(e.data);if(!f)return c;const{image:d,renderPipeline:h}=f,{width:p,height:g}=e.data,y=this.context.viewport.resolution!==void 0;let b,P,x;if(y)b={forwardTransform:l,inverseTransform:u,forwardReproject:t.projectTo4326,inverseReproject:t.projectFrom4326},P="lnglat";else{const{_projectPosition:T,_unprojectPosition:E}=a;b={forwardTransform:l,inverseTransform:u,forwardReproject:T,inverseReproject:E},P="cartesian",x=ee}return[new mg(this.getSubLayerProps({id:`${e.id}-raster`,width:p,height:g,...d!==void 0&&{image:d},renderPipeline:h,maxError:s,reprojectionFns:b,initialTriangulation:y?void 0:a._webMercatorInitialTriangulation,_wrapX:x,debug:o,debugOpacity:r,coordinateSystem:P})),...c]}}export{Vm as A,Ne as B,Pn as C,W as G,re as M,ht as P,jm as R,Jr as T,Um as a,km as b,nf as c,bu as d,Dm as e,zm as f,Ce as g,sn as h,$e as i,Ju as j,Qu as k,ef as l,Fm as m,mf as n,zp as o,Fp as p,lg as q,af as r,Np as s,Nm as t,Bn as u,rm as v,Te as w,mi as x,ut as y,di as z};
//# sourceMappingURL=raster-tile-layer-Dzioqycr.js.map
