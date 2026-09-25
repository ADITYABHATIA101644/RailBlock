import{j as e}from"./framer-motion-C7FLwXdS.js";import{r as t}from"./react-vendor-Dw6jHN9o.js";import{u as _,W as L,P as O,M as Y,a as K,C as q,S as F,b as M,c as J,F as Q}from"./Float-CN8uk96s.js";import{_ as $}from"./charts-Kb-ygUMG.js";import{E as ee}from"./Environment-l5r6fRhQ.js";import"./radix-ui-D3H5cvtA.js";const re={uniforms:{tDiffuse:{value:null},h:{value:1/512}},vertexShader:`
      varying vec2 vUv;

      void main() {

        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

      }
  `,fragmentShader:`
    uniform sampler2D tDiffuse;
    uniform float h;

    varying vec2 vUv;

    void main() {

    	vec4 sum = vec4( 0.0 );

    	sum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * h, vUv.y ) ) * 0.051;
    	sum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * h, vUv.y ) ) * 0.0918;
    	sum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * h, vUv.y ) ) * 0.12245;
    	sum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * h, vUv.y ) ) * 0.1531;
    	sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;
    	sum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * h, vUv.y ) ) * 0.1531;
    	sum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * h, vUv.y ) ) * 0.12245;
    	sum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * h, vUv.y ) ) * 0.0918;
    	sum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * h, vUv.y ) ) * 0.051;

    	gl_FragColor = sum;

    }
  `},te={uniforms:{tDiffuse:{value:null},v:{value:1/512}},vertexShader:`
    varying vec2 vUv;

    void main() {

      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

    }
  `,fragmentShader:`

  uniform sampler2D tDiffuse;
  uniform float v;

  varying vec2 vUv;

  void main() {

    vec4 sum = vec4( 0.0 );

    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * v ) ) * 0.051;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * v ) ) * 0.0918;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * v ) ) * 0.12245;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * v ) ) * 0.1531;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * v ) ) * 0.1531;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * v ) ) * 0.12245;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * v ) ) * 0.0918;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * v ) ) * 0.051;

    gl_FragColor = sum;

  }
  `},se=t.forwardRef(({scale:n=10,frames:a=1/0,opacity:i=1,width:s=1,height:r=1,blur:m=1,near:o=0,far:l=10,resolution:c=512,smooth:d=!0,color:v="#000000",depthWrite:D=!1,renderOrder:U,...u},y)=>{const b=t.useRef(null),x=_(f=>f.scene),h=_(f=>f.gl),j=t.useRef(null);s=s*(Array.isArray(n)?n[0]:n||1),r=r*(Array.isArray(n)?n[1]:n||1);const[S,V,X,p,R,I,G]=t.useMemo(()=>{const f=new L(c,c),P=new L(c,c);P.texture.generateMipmaps=f.texture.generateMipmaps=!1;const k=new O(s,r).rotateX(Math.PI/2),N=new Y(k),T=new K;T.depthTest=T.depthWrite=!1,T.onBeforeCompile=g=>{g.uniforms={...g.uniforms,ucolor:{value:new q(v)}},g.fragmentShader=g.fragmentShader.replace("void main() {",`uniform vec3 ucolor;
           void main() {
          `),g.fragmentShader=g.fragmentShader.replace("vec4( vec3( 1.0 - fragCoordZ ), opacity );","vec4( ucolor * fragCoordZ * 2.0, ( 1.0 - fragCoordZ ) * 1.0 );")};const E=new F(re),A=new F(te);return A.depthTest=E.depthTest=!1,[f,k,T,N,E,A,P]},[c,s,r,n,v]),B=f=>{p.visible=!0,p.material=R,R.uniforms.tDiffuse.value=S.texture,R.uniforms.h.value=f*1/256,h.setRenderTarget(G),h.render(p,j.current),p.material=I,I.uniforms.tDiffuse.value=G.texture,I.uniforms.v.value=f*1/256,h.setRenderTarget(S),h.render(p,j.current),p.visible=!1};let C=0,w,z;return M(()=>{j.current&&(a===1/0||C<a)&&(C++,w=x.background,z=x.overrideMaterial,b.current.visible=!1,x.background=null,x.overrideMaterial=X,h.setRenderTarget(S),h.render(x,j.current),B(m),d&&B(m*.4),h.setRenderTarget(null),b.current.visible=!0,x.overrideMaterial=z,x.background=w)}),t.useImperativeHandle(y,()=>b.current,[]),t.createElement("group",$({"rotation-x":Math.PI/2},u,{ref:b}),t.createElement("mesh",{renderOrder:U,geometry:V,scale:[1,-1,1],rotation:[-Math.PI/2,0,0]},t.createElement("meshBasicMaterial",{transparent:!0,map:S.texture,opacity:i,depthWrite:D})),t.createElement("orthographicCamera",{ref:j,args:[-s/2,s/2,r/2,-r/2,o,l]}))}),W=30;function ne(){const n=t.useMemo(()=>Array.from({length:26},(a,i)=>-W/2+1+i*1.15),[]);return e.jsxs("group",{position:[0,-1.1,0],children:[[-.85,.85].map((a,i)=>e.jsxs("mesh",{position:[a,.08,0],children:[e.jsx("boxGeometry",{args:[.09,.16,W]}),e.jsx("meshStandardMaterial",{color:"#8fa3c8",metalness:.95,roughness:.25,emissive:"#2862d7",emissiveIntensity:.3})]},i)),n.map((a,i)=>e.jsxs("mesh",{position:[0,0,a],children:[e.jsx("boxGeometry",{args:[2.5,.07,.42]}),e.jsx("meshStandardMaterial",{color:"#151a26",metalness:.6,roughness:.55})]},i))]})}function Z({color:n,speed:a,loopFrom:i,loopTo:s,stopAtZ:r,startDetained:m}){const o=t.useRef(null),l=t.useRef(null),c=t.useRef(null),d=t.useRef({z:i,detained:!!m,resumeTimer:0});return M((v,D)=>{const U=o.current;if(!U)return;const u=d.current;if(u.detained?(u.resumeTimer-=D,u.resumeTimer<=0&&(u.detained=!1)):(u.z-=a*D,r!==void 0&&u.z<=r&&(u.z=r,u.detained=!0,u.resumeTimer=5+Math.random()*4),u.z<s&&(u.z=i)),U.position.z=u.z,l.current){const y=u.detained?.55:.12;l.current.emissiveIntensity+=(y-l.current.emissiveIntensity)*.1,l.current.emissive.set(u.detained?"#ef4444":"#0b0c0e")}if(c.current){c.current.visible=u.detained;const y=c.current.material;y.opacity=.5+Math.sin(v.clock.elapsedTime*6)*.5}}),e.jsxs("group",{ref:o,position:[0,0,i],children:[e.jsxs("mesh",{position:[0,-.72,.9],children:[e.jsx("boxGeometry",{args:[1.14,.62,1.5]}),e.jsx("meshStandardMaterial",{ref:l,color:n,metalness:.75,roughness:.3,emissive:"#0b0c0e",emissiveIntensity:.12})]}),e.jsxs("mesh",{position:[0,-.72,1.78],rotation:[-.5,0,0],children:[e.jsx("boxGeometry",{args:[1.15,.5,.42]}),e.jsx("meshStandardMaterial",{color:n,metalness:.75,roughness:.3})]}),e.jsxs("mesh",{position:[0,-.68,2],children:[e.jsx("sphereGeometry",{args:[.07,10,10]}),e.jsx("meshBasicMaterial",{color:"#fff7cc"})]}),e.jsx("pointLight",{position:[0,-.6,2.3],color:"#ffe9a8",intensity:1.4,distance:5}),[0,1,2].map(v=>e.jsxs("mesh",{position:[0,-.74,-.35-v*1.62],children:[e.jsx("boxGeometry",{args:[1.05,.56,1.42]}),e.jsx("meshStandardMaterial",{color:"#121826",metalness:.7,roughness:.4,emissive:"#12244f",emissiveIntensity:.28})]},v)),e.jsxs("mesh",{ref:c,position:[0,-.15,.9],visible:!!m,children:[e.jsx("sphereGeometry",{args:[.1,10,10]}),e.jsx("meshBasicMaterial",{color:"#ef4444",transparent:!0,opacity:.8,toneMapped:!1})]})]})}function H({position:n}){const a=t.useRef(null),i=t.useRef(null),s=t.useRef(null),r=t.useRef(null),m=t.useRef(0),o=t.useRef(0);M((c,d)=>{o.current+=d,o.current>4&&(o.current=0,m.current=(m.current+1)%3);const v=m.current;a.current&&(a.current.emissiveIntensity=v===0?3:.12),i.current&&(i.current.emissiveIntensity=v===1?3:.12),s.current&&(s.current.emissiveIntensity=v===2?3:.12),r.current&&r.current.color.set(v===0?"#ef4444":v===1?"#f59e0b":"#22c55e")});const l=[{ref:a,color:"#ef4444",y:2.08},{ref:i,color:"#f59e0b",y:1.78},{ref:s,color:"#22c55e",y:1.48}];return e.jsxs("group",{position:n,children:[e.jsxs("mesh",{position:[0,.85,0],children:[e.jsx("cylinderGeometry",{args:[.04,.055,1.7,8]}),e.jsx("meshStandardMaterial",{color:"#1a2233",metalness:.85,roughness:.35})]}),e.jsxs("mesh",{position:[0,1.78,0],children:[e.jsx("boxGeometry",{args:[.34,.98,.22]}),e.jsx("meshStandardMaterial",{color:"#0d1420",metalness:.7,roughness:.4})]}),l.map((c,d)=>e.jsxs("mesh",{position:[0,c.y,.13],children:[e.jsx("circleGeometry",{args:[.085,20]}),e.jsx("meshStandardMaterial",{ref:c.ref,color:"#050505",emissive:c.color,emissiveIntensity:.12,toneMapped:!1})]},d)),e.jsx("pointLight",{ref:r,position:[0,1.78,.6],color:"#ef4444",intensity:.9,distance:4})]})}function ie({z:n=6.5}){const a=t.useRef(null),i=t.useRef(null);return M(s=>{const r=s.clock.elapsedTime;a.current?.children.forEach((m,o)=>{const l=m.material;l.emissiveIntensity=1.2+Math.sin(r*3+o)*.8}),i.current&&(i.current.position.y=-.62+Math.sin(r*1.4)*.04)}),e.jsxs("group",{children:[e.jsx("group",{ref:a,children:[-1.6,1.6].map((s,r)=>e.jsxs("mesh",{position:[s,-.75,n],children:[e.jsx("cylinderGeometry",{args:[.07,.09,.85,8]}),e.jsx("meshStandardMaterial",{color:"#2a0808",emissive:"#ef4444",emissiveIntensity:1.4,metalness:.5,roughness:.5})]},r))}),e.jsxs("mesh",{ref:i,position:[0,-.62,n],rotation:[0,0,Math.PI/2],children:[e.jsx("cylinderGeometry",{args:[.045,.045,2.6,10]}),e.jsx("meshStandardMaterial",{color:"#f59e0b",emissive:"#f59e0b",emissiveIntensity:.35,metalness:.4,roughness:.5})]}),e.jsxs("mesh",{position:[0,-1.06,n],rotation:[-Math.PI/2,0,0],children:[e.jsx("planeGeometry",{args:[3.2,2.4]}),e.jsx("meshBasicMaterial",{color:"#f59e0b",transparent:!0,opacity:.09})]})]})}function ae(){const n=t.useRef(null),a=140,i=t.useMemo(()=>{const s=new Float32Array(a*3);for(let r=0;r<a;r++)s[r*3]=(Math.random()-.5)*9,s[r*3+1]=Math.random()*5-.4,s[r*3+2]=-Math.random()*24+4;return s},[]);return M(s=>{if(!n.current)return;const r=n.current.geometry.attributes.position,m=s.clock.elapsedTime;for(let o=0;o<a;o++){const l=r.getY(o)+.004+o%5*8e-4;r.setY(o,l>4.5?-.4:l),r.setX(o,r.getX(o)+Math.sin(m+o)*4e-4)}r.needsUpdate=!0}),e.jsxs("points",{ref:n,children:[e.jsx("bufferGeometry",{children:e.jsx("bufferAttribute",{attach:"attributes-position",args:[i,3]})}),e.jsx("pointsMaterial",{size:.03,color:"#85a6e9",transparent:!0,opacity:.5,sizeAttenuation:!0})]})}function fe(){return e.jsx("div",{className:"absolute inset-0","aria-hidden":!0,children:e.jsxs(J,{camera:{position:[3.2,2.4,6.5],fov:42},dpr:[1,1.8],gl:{antialias:!0,alpha:!0,powerPreference:"high-performance"},style:{background:"transparent"},children:[e.jsx("fog",{attach:"fog",args:["#0b0c0e",10,26]}),e.jsx("ambientLight",{intensity:.3}),e.jsx("directionalLight",{position:[5,7,4],intensity:.55,color:"#aebadf"}),e.jsx("directionalLight",{position:[-6,3,-5],intensity:.35,color:"#625fff"}),e.jsx(ne,{}),e.jsx(Z,{color:"#1d4ed8",speed:2.6,loopFrom:13,loopTo:-14,stopAtZ:9.5}),e.jsx(Z,{color:"#7f1d1d",speed:2.2,loopFrom:13,loopTo:-14,stopAtZ:12.2,startDetained:!0}),e.jsx(H,{position:[-1.9,-1.1,9.5]}),e.jsx(H,{position:[1.9,-1.1,9.5]}),e.jsx(ie,{z:6.5}),e.jsx(ae,{}),e.jsx(se,{position:[0,-1.12,0],opacity:.55,scale:16,blur:2.6,far:4,color:"#000000"}),e.jsx(ee,{preset:"night"}),e.jsx(Q,{speed:1.2,rotationIntensity:.4,floatIntensity:1,children:e.jsxs("mesh",{position:[0,2.6,-4],children:[e.jsx("icosahedronGeometry",{args:[.55,1]}),e.jsx("meshStandardMaterial",{color:"#0d172b",metalness:.9,roughness:.2,emissive:"#305fbd",emissiveIntensity:.6,flatShading:!0})]})})]})})}export{fe as default};
