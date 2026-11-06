import{c as N}from"./expression-Bl_GL2tO.js";import{g as f,c as v,r as m,d as k,f as M,h as L,i as S,G as z,j as y,k as V,C as $,l as _}from"./raster-tile-layer-BGzDBMpX.js";import{n as Ee}from"./raster-tile-layer-BGzDBMpX.js";import{f as R}from"./globe-viewport-Cpw9-gRD.js";import"./index-Bs8jG7z5.js";import"./index-B8-Cfmr6.js";import"./affine-Dq74FZIl.js";import"./webgl-device-CSOytpHd.js";import"./utils-CzN9cXHb.js";import"./_commonjsHelpers-CE1G-McA.js";import"./index-m1Il_47c.js";import"./I18N-BC6F-L_M.js";const B=`fn arithmetic_add(x: {TYPE}, y: {TYPE}) -> {TYPE} {
  return x + y;
}

fn arithmetic_subtract(x: {TYPE}, y: {TYPE}) -> {TYPE} {
  return x - y;
}

fn arithmetic_multiply(x: {TYPE}, y: {TYPE}) -> {TYPE} {
  return x * y;
}

fn arithmetic_divide(x: {TYPE}, y: {TYPE}) -> {TYPE} {
  return x / y;
}

fn arithmetic_tan(x: f32) -> f32 {
  return tan_fp32(x);
}
`,ue=({inputs:n,output:e,target:r})=>{const t=e.type,s=f(t),i=v(t),a=n.namedInputs;return m({module:{name:"arithmetic",source:B,dependencies:[R]},inputs:a,output:e,operationType:t,outputBuffer:r,expression:c=>N(n.expression,{operations:k,inputs:a,laneIndex:c,formatInput:o=>`${o}[${c}]`,formatOutOfBoundsInput:o=>a[o].size===1?`${o}[0]`:i,formatLiteral:o=>{const l=Array.isArray(o)?o[c]??0:o;return`${s}(${M(t,l)})`},formatCall:(o,l)=>`${o}(${l.join(", ")})`})}),{success:!0}},Y=`fn row_dot(x: array<{TYPE}, {X_LEN}>, y: array<{TYPE}, {Y_LEN}>) -> array<f32, 1> {
  var sum = 0.0;
  for (var i = 0u; i < {X_LEN}u; i = i + 1u) {
    sum += f32(x[i]) * f32(y[i]);
  }
  return array<f32, 1>(sum);
}
`,le=({inputs:n,output:e,target:r})=>(m({module:{name:"row_dot",source:Y},inputs:n,output:e,operationType:"float32",outputBuffer:r}),{success:!0}),O=`fn equalAll(x: array<{TYPE}, {X_LEN}>, y: array<{TYPE}, {Y_LEN}>) -> array<u32, 1> {
  var allEqual = 1u;
  for (var i = 0u; i < {X_LEN}u; i = i + 1u) {
    if (x[i] != y[i]) {
      allEqual = 0u;
      break;
    }
  }
  return array<u32, 1>(allEqual);
}
`,ce=({inputs:n,output:e,target:r})=>(m({module:{name:"equalAll",source:O},inputs:n,output:e,operationType:n.x.type,outputBuffer:r}),{success:!0}),p=64;function I(n,e,r){const t=f(e.type);return`@group(0) @binding(${r}) var<storage, read> ${n}: array<${t}>;`}function C(n,e,r,t=n){const s=f(r);if(e.isConstant){const l=e.value;if(!l)throw new Error(`Constant input ${e} is missing CPU values`);return`fn read_${t}(_sourceIndex: u32) -> array<${s}, ${e.size}> {
  return array<${s}, ${e.size}>(${Array.from({length:e.size},(u,d)=>L(s,l[d]??0)).join(", ")});
}`}const i=e.stride/e.ValueType.BYTES_PER_ELEMENT,a=e.offset/e.ValueType.BYTES_PER_ELEMENT,o=f(e.type)===s?"":`${s}`;return`fn read_${t}(sourceIndex: u32) -> array<${s}, ${e.size}> {
  var value: array<${s}, ${e.size}>;
  let rowOffset = ${a}u + sourceIndex * ${i}u;
${Array.from({length:e.size},(l,u)=>o?`  value[${u}] = ${o}(${n}[rowOffset + ${u}u]);`:`  value[${u}] = ${n}[rowOffset + ${u}u];`).join(`
`)}
  return value;
}`}function F(n,e){return C("sourceValues",n,e,"source_values")}function T(n,e){const r=f(n.type);return`@group(0) @binding(${e}) var<storage, read_write> result: array<${r}>;`}function P(n){const e=n.stride/n.ValueType.BYTES_PER_ELEMENT,r=n.offset/n.ValueType.BYTES_PER_ELEMENT;return`fn write_result(rowIndex: u32, value: array<${f(n.type)}, ${n.size}>) {
  let rowOffset = ${r}u + rowIndex * ${e}u;
${Array.from({length:n.size},(s,i)=>`  result[rowOffset + ${i}u] = value[${i}];`).join(`
`)}
}`}function G(n,e){const r=v(n);return`fn zero_result() -> array<${f(n)}, ${e}> {
  var result: array<${f(n)}, ${e}>;
${Array.from({length:e},(t,s)=>`  result[${s}] = ${r};`).join(`
`)}
  return result;
}`}const de=({inputs:n,output:e,target:r})=>{const{sourceValues:t}=n;if(t.length===0){const o=new e.ValueType(e.length*e.size);return r.write(o),{success:!0,value:o}}if(t.isConstant){const o=t.value;if(!o)throw new Error(`Constant input ${t} is missing CPU values`);const l=new e.ValueType(e.length*e.size);for(let u=0;u<e.length;u++){const d=o[u];l[u*2]=d,l[u*2+1]=d}return r.write(l),{success:!0,value:l}}const s=[];let i=t,a="raw",c=t.length;try{for(;;){const o=Math.ceil(c/p),l=e.length*o,u=o===1?r:S.createOrReuse(r.device,l*e.stride);if(o>1&&s.push(u),A({input:i,inputMode:a,inputGroupCount:c,channelCount:e.length,outputType:e.type,outputBuffer:u,outputLength:l,outputStride:e.stride,outputOffset:e.offset}),o===1)break;i=new z({buffer:u,type:e.type,size:2,length:l}),a="partial",c=o}return{success:!0}}finally{for(const o of s)S.recycle(o)}};function A({input:n,inputMode:e,inputGroupCount:r,channelCount:t,outputType:s,outputBuffer:i,outputLength:a,outputStride:c,outputOffset:o}){const l=f(s),u=y(a,i.device.limits.maxComputeWorkgroupsPerDimension),d=new z({buffer:i,type:s,size:2,length:a,stride:c,offset:o}),x=`
${n.isConstant?"":I("sourceValues",n,0)}
${F(n,s)}
${T(d,n.isConstant?0:1)}
${P(d)}
${U(e,s,t,r)}

var<workgroup> sharedMin: array<${l}, ${p}>;
var<workgroup> sharedMax: array<${l}, ${p}>;

@compute @workgroup_size(${p}) fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_id) localId: vec3<u32>
) {
  let outputRowIndex = ${V(u)};
  if (outputRowIndex >= ${a}u) {
    return;
  }

  let channelIndex = outputRowIndex % ${t}u;
  let outputGroupIndex = outputRowIndex / ${t}u;
  let inputGroupIndex = outputGroupIndex * ${p}u + localId.x;

  let result = extent_pass(channelIndex, inputGroupIndex);
  sharedMin[localId.x] = result[0];
  sharedMax[localId.x] = result[1];
  workgroupBarrier();

  var stride = ${Math.floor(p/2)}u;
  loop {
    if (stride == 0u) {
      break;
    }
    if (localId.x < stride) {
      let compareIndex = localId.x + stride;
      if (sharedMin[compareIndex] < sharedMin[localId.x]) {
        sharedMin[localId.x] = sharedMin[compareIndex];
      }
      if (sharedMax[compareIndex] > sharedMax[localId.x]) {
        sharedMax[localId.x] = sharedMax[compareIndex];
      }
    }
    workgroupBarrier();
    stride = stride / 2u;
  }

  if (localId.x == 0u) {
    write_result(outputRowIndex, array<${l}, 2>(sharedMin[0], sharedMax[0]));
  }
}
`,g=new $(i.device,{source:x,shaderLayout:{bindings:[...n.isConstant?[]:[{name:"sourceValues",type:"storage",group:0,location:0}],{name:"result",type:"storage",group:0,location:n.isConstant?0:1}]}}),h={result:i};n.isConstant||(h.sourceValues=n.buffer),g.setBindings(h);const b=i.device.beginComputePass({});g.dispatch(b,u.x,u.y,u.z),b.end(),i.device.submit(),g.destroy()}function U(n,e,r,t){const s=f(e),[i,a]=W(e);return n==="raw"?`fn extent_pass(channelIndex: u32, inputGroupIndex: u32) -> array<${s}, 2> {
  var result: array<${s}, 2>;
  result[0] = ${i};
  result[1] = ${a};

  if (inputGroupIndex < ${t}u) {
    let value = read_source_values(inputGroupIndex);
    result[0] = value[channelIndex];
    result[1] = value[channelIndex];
  }

  return result;
}`:`fn extent_pass(channelIndex: u32, inputGroupIndex: u32) -> array<${s}, 2> {
  var result: array<${s}, 2>;
  result[0] = ${i};
  result[1] = ${a};

  if (inputGroupIndex < ${t}u) {
    let rowIndex = inputGroupIndex * ${r}u + channelIndex;
    let value = read_source_values(rowIndex);
    result[0] = value[0];
    result[1] = value[1];
  }

  return result;
}`}function W(n){switch(n){case"uint32":return["0xffffffffu","0u"];case"sint32":return["2147483647","-2147483648"];case"float32":return["3.402823e38","-3.402823e38"];default:throw new Error(`Unsupported WebGPU extent type for ${n}`)}}function D(){const n=new Uint16Array([255]);return new Uint8Array(n.buffer)[0]>0}const j=`const LE: bool = ${D()?"true":"false"};
const F32_NAN: u32 = 0xffffffffu;
const F32_INF: u32 = 0x7f800000u;

fn roundShiftRight(value: u32, shift: i32) -> u32 {
  if (shift <= 0) {
    return value << u32(-shift);
  }

  if (shift >= 32) {
    if (shift == 32 && value > 0x80000000u) {
      return 1u;
    }
    return 0u;
  }

  let shiftU32 = u32(shift);
  let truncated = value >> shiftU32;
  let halfShift = 1u << u32(shift - 1);
  let remainder = value & ((1u << shiftU32) - 1u);
  if (remainder > halfShift || (remainder == halfShift && (truncated & 1u) == 1u)) {
    return truncated + 1u;
  }
  return truncated;
}

fn makeFloatImmediate(sign: u32, exponent: i32, mantissa: u32) -> u32 {
  return (sign << 31u) | (u32(exponent + 127) << 23u) | (mantissa & 0x7fffffu);
}

fn makeFloat(sign: u32, exponent: i32, significand: u32) -> u32 {
  if (significand == 0u) {
    return sign << 31u;
  }

  let leadingZeros = i32(countLeadingZeros(significand));
  var normalizedExponent = exponent + 31 - leadingZeros;

  if (normalizedExponent > 127) {
    return (sign << 31u) | F32_INF;
  }

  var mantissa: u32;
  if (normalizedExponent >= -126) {
    mantissa = roundShiftRight(significand, 8 - leadingZeros);
    if (mantissa >= 0x1000000u) {
      mantissa = mantissa >> 1u;
      normalizedExponent += 1;
      if (normalizedExponent > 127) {
        return (sign << 31u) | F32_INF;
      }
    }
    return makeFloatImmediate(sign, normalizedExponent, mantissa);
  }

  let subnormalShift = -149 - exponent;
  mantissa = roundShiftRight(significand, subnormalShift);
  if (mantissa >= 0x800000u) {
    return (sign << 31u) | (1u << 23u);
  }
  return (sign << 31u) | mantissa;
}

fn parseAsDouble(words: vec2<u32>) -> vec2<u32> {
  var d = words;
  if (LE) {
    d = d.yx;
  }

  let sign = (d.x >> 31u) & 1u;
  let exponentBits = (d.x >> 20u) & 0x7ffu;
  let exponent = i32(exponentBits) - 1023;
  let fractionHigh = d.x & 0xfffffu;
  let fractionLow = d.y;

  if (exponentBits == 0x7ffu) {
    if (fractionHigh == 0u && fractionLow == 0u) {
      return vec2<u32>((sign << 31u) | F32_INF, F32_NAN);
    }
    return vec2<u32>(F32_NAN);
  }

  if (exponentBits == 0u) {
    return vec2<u32>(sign << 31u);
  }

  if (exponent > 127) {
    return vec2<u32>((sign << 31u) | F32_INF, ((1u - sign) << 31u) | F32_INF);
  }

  let highSignificand = 0x800000u | (fractionHigh << 3u) | (fractionLow >> 29u);
  let lowSignificand = fractionLow & 0x1fffffffu;

  if (exponent < -126) {
    let highPart = makeFloat(sign, exponent - 23, highSignificand);
    let lowPart = makeFloat(sign, exponent - 52, lowSignificand);
    return vec2<u32>(highPart, lowPart);
  }

  let roundUp = lowSignificand > 0x10000000u ||
    (lowSignificand == 0x10000000u && (highSignificand & 1u) == 1u);

  var roundedSignificand = highSignificand + select(0u, 1u, roundUp);
  var highExponent = exponent;
  if (roundedSignificand == 0x1000000u) {
    roundedSignificand = 0x800000u;
    highExponent += 1;
  }

  if (highExponent > 127) {
    return vec2<u32>((sign << 31u) | F32_INF, ((1u - sign) << 31u) | F32_INF);
  }

  let highPart = makeFloatImmediate(sign, highExponent, roundedSignificand);

  var remainder = i32(lowSignificand);
  var lowSign = sign;
  if (roundUp) {
    remainder -= 0x20000000;
  }
  if (remainder < 0) {
    lowSign = 1u - sign;
    remainder = -remainder;
  }

  let lowPart = makeFloat(lowSign, exponent - 52, u32(remainder));
  return vec2<u32>(highPart, lowPart);
}

fn fround(x: array<u32, {X_LEN}>) -> array<f32, {RESULT_LEN}> {
  var result: array<f32, {RESULT_LEN}>;
  let n = {X_LEN}u / 2u;
  for (var i = 0u; i < n; i = i + 1u) {
    let parts = parseAsDouble(vec2<u32>(x[i * 2u], x[i * 2u + 1u]));
    result[i] = bitcast<f32>(parts.x);
    result[i + n] = bitcast<f32>(parts.y);
  }
  return result;
}
`,fe=({inputs:n,output:e,target:r})=>(m({module:{name:"fround",source:j},inputs:n,output:e,operationType:"uint32",outputBuffer:r}),{success:!0}),pe=async({inputs:n,output:e,target:r})=>{const{ids:t,sourceValues:s}=n,i=f(t.type),a=[];t.isConstant||a.push({name:"ids",input:t,index:a.length}),s.isConstant||a.push({name:"sourceValues",input:s,index:a.length});const c=y(Math.ceil(e.length/p),r.device.limits.maxComputeWorkgroupsPerDimension),o=`
${a.map(({name:x,input:g,index:h})=>I(x,g,h)).join(`
`)}
${q(t,i)}
${F(s,e.type)}
${T(e,a.length)}
${P(e)}
${G(e.type,e.size)}
${X(t.type,e.type,e.size,s.length)}

@compute @workgroup_size(${p}) fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_id) localId: vec3<u32>
) {
  let rowIndex = ${_(c,p)};
  if (rowIndex >= ${e.length}u) {
    return;
  }

  let idsValue = read_ids(rowIndex);
  let result = gather(idsValue);
  write_result(rowIndex, result);
}
`,l=new $(r.device,{source:o,shaderLayout:{bindings:[...a.map(({name:x,index:g})=>({name:x,type:"storage",group:0,location:g})),{name:"result",type:"storage",group:0,location:a.length}]}}),u={};t.isConstant||(u.ids=t.buffer),s.isConstant||(u.sourceValues=s.buffer),u.result=r,l.setBindings(u);const d=r.device.beginComputePass({});return l.dispatch(d,c.x,c.y,c.z),d.end(),r.device.submit(),l.destroy(),{success:!0}};function q(n,e){if(n.isConstant){const s=n.value;if(!s)throw new Error(`Constant input ${n} is missing CPU values`);return`fn read_ids(_rowIndex: u32) -> ${e} {
  return ${L(e,s[0]??0)};
}`}const r=n.stride/n.ValueType.BYTES_PER_ELEMENT,t=n.offset/n.ValueType.BYTES_PER_ELEMENT;return`fn read_ids(rowIndex: u32) -> ${e} {
  let rowOffset = ${t}u + rowIndex * ${r}u;
  return ids[rowOffset];
}`}function X(n,e,r,t){const s=f(n),i=f(e);return`fn gather(idsValue: ${s}) -> array<${i}, ${r}> {
  let sourceIndex = ${s==="u32"?"i32(idsValue)":s==="i32"?"idsValue":"i32(idsValue)"};
  if (sourceIndex < 0 || sourceIndex >= ${t}) {
    return zero_result();
  }
  return read_source_values(u32(sourceIndex));
}`}const xe=async({inputs:n,output:e,target:r})=>{const{segments:t}=n,s=t.isConstant?[]:[{name:"segments",input:t,index:0}],i=y(Math.ceil(e.length/p),r.device.limits.maxComputeWorkgroupsPerDimension),a=`
${s.map(({name:u,input:d,index:x})=>I(u,d,x)).join(`
`)}
${C("segments",t,"uint32")}
${T(e,s.length)}
${P(e)}
${Z(t.length)}

@compute @workgroup_size(${p}) fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_id) localId: vec3<u32>
) {
  let rowIndex = ${_(i,p)};
  if (rowIndex >= ${e.length}u) {
    return;
  }

  let result = segmented_map(rowIndex);
  write_result(rowIndex, result);
}
`,c=new $(r.device,{source:a,shaderLayout:{bindings:[...s.map(({name:u,index:d})=>({name:u,type:"storage",group:0,location:d})),{name:"result",type:"storage",group:0,location:s.length}]}}),o=Object.fromEntries(s.map(({name:u,input:d})=>[u,d.buffer]));o.result=r,c.setBindings(o);const l=r.device.beginComputePass({});return c.dispatch(l,i.x,i.y,i.z),l.end(),r.device.submit(),c.destroy(),{success:!0}};function Z(n){return`fn segmented_map(vertexIndex: u32) -> array<u32, 2> {
  var low = 0i;
  var high = ${n}i;
  while (low < high) {
    let mid = low + (high - low) / 2i;
    let midStart = read_segments(u32(mid))[0];
    if (midStart <= vertexIndex) {
      low = mid + 1i;
    } else {
      high = mid;
    }
  }

  let segmentIndex = u32(max(low - 1i, 0i));
  let segmentStart = read_segments(segmentIndex)[0];
  return array<u32, 2>(segmentIndex, vertexIndex - segmentStart);
}`}const H=`fn row_length(x: array<{TYPE}, {X_LEN}>) -> array<f32, 1> {
  var sum = 0.0;
  for (var i = 0u; i < {X_LEN}u; i = i + 1u) {
    sum += f32(x[i]) * f32(x[i]);
  }
  return array<f32, 1>(sqrt(sum));
}
`,ge=({inputs:n,output:e,target:r})=>(m({module:{name:"row_length",source:H},inputs:n,output:e,operationType:"float32",outputBuffer:r}),{success:!0}),me=async({inputs:n,output:e,target:r})=>{const t=v(e.type);return m({module:{name:"select",source:`// inline expression select
`},inputs:n,output:e,operationType:e.type,outputBuffer:r,expression:s=>{const i=w("condition",n.condition,s,t),a=w("whenTrue",n.whenTrue,s,t);return`select(${w("whenFalse",n.whenFalse,s,t)}, ${a}, ${i} != ${t})`}}),{success:!0}};function w(n,e,r,t){return r<e.size?`${n}[${r}]`:e.size===1?`${n}[0]`:t}const E=64,he=({inputs:n,output:e,target:r})=>{const t=y(Math.ceil(e.length/E),r.device.limits.maxComputeWorkgroupsPerDimension),s=`@group(0) @binding(0) var<storage, read_write> result: array<i32>;

@compute @workgroup_size(${E}) fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_id) localId: vec3<u32>
) {
  let rowIndex = ${_(t,E)};
  if (rowIndex >= ${e.length}u) {
    return;
  }

  let rowOffset = ${e.offset/e.ValueType.BYTES_PER_ELEMENT}u + rowIndex * ${e.stride/e.ValueType.BYTES_PER_ELEMENT}u;
  result[rowOffset] = ${n.start} + i32(rowIndex) * ${n.step};
}
`,i=new $(r.device,{source:s,shaderLayout:{bindings:[{name:"result",type:"storage",group:0,location:0}]}});i.setBindings({result:r});const a=r.device.beginComputePass({});return i.dispatch(a,t.x,t.y,t.z),a.end(),r.device.submit(),i.destroy(),{success:!0}},ye=({inputs:n,output:e,target:r})=>{const{columns:t}=n;return m({module:{name:"swizzle",source:"// swizzle expression handled inline"},expression:s=>`x[${t[s]}]`,inputs:{x:n.x},output:e,outputBuffer:r}),{success:!0}};export{ue as arithmetic,le as dot,ce as equalAll,de as extent,fe as fround,pe as gather,Ee as interleave,ge as length,xe as segmentedMap,me as select,he as sequence,ye as swizzle};
//# sourceMappingURL=index-Do_dcg_h.js.map
