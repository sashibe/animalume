import { useEffect, useRef, useState } from 'react';

// ─── Vertex Shader ───────────────────────────────────────────────────────────

const VERT_SRC = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

// ─── Shared preamble (inlined into each FRAG) ────────────────────────────────
// precision mediump float;
// uniform float u_time;  uniform vec2 u_mouse;  uniform vec2 u_resolution;
// varying vec2 v_uv;
// float hash(vec2 p){ ... }
// float noise(vec2 p){ ... }
// float fbm(vec2 p){ ... }

const COMMON_PREAMBLE = `
    precision mediump float;
    uniform float u_time;
    uniform vec2  u_mouse;
    uniform vec2  u_resolution;
    varying vec2  v_uv;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
    float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);float a=hash(i),b=hash(i+vec2(1,0)),c=hash(i+vec2(0,1)),d=hash(i+vec2(1,1));return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}
    float fbm(vec2 p){float v=0.0,a=0.5,fr=2.0;for(int i=0;i<5;i++){v+=a*noise(p*fr);a*=0.5;fr*=2.0;}return v;}
`;

// ─── Fragment Shaders (buildFrag inlined) ─────────────────────────────────────

const FRAG_0 = COMMON_PREAMBLE + `
    void main(){vec2 asp=vec2(u_resolution.x/u_resolution.y,1.0);vec2 uv=v_uv*asp,mouse=u_mouse*asp;float mi=smoothstep(0.5,0.0,length(uv-mouse));vec2 offset=vec2(fbm(uv+u_time*0.1),fbm(uv+u_time*0.1+5.0));float r=fbm(uv+offset+vec2(mi*0.1,0.0));float g=fbm(uv+offset);float b=fbm(uv+offset-vec2(mi*0.1,0.0));r*=0.8+0.2*sin(u_time);g*=0.8+0.2*sin(u_time+2.0);b*=0.8+0.2*sin(u_time+4.0);gl_FragColor=vec4(mix(vec3(r,g,b),vec3(1.0),mi*0.3),1.0);}
  `;

const FRAG_1 = COMMON_PREAMBLE + `
    float turb(vec2 p){float v=0.0,a=0.5,fr=2.0;for(int i=0;i<5;i++){v+=a*abs(noise(p*fr)*2.0-1.0);a*=0.5;fr*=2.0;}return v;}
    void main(){vec2 asp=vec2(u_resolution.x/u_resolution.y,1.0);vec2 uv=v_uv*asp,mouse=u_mouse*asp;float mi=smoothstep(0.6,0.0,length(uv-mouse));float t=u_time*0.08;vec2 offset=vec2(turb(uv+t),turb(uv+t+4.3));float r=turb(uv+offset*1.2+vec2(mi*0.12,0.0));float g=turb(uv+offset);float b=turb(uv+offset-vec2(mi*0.12,0.0));r*=0.8+0.2*sin(u_time*0.6);g*=0.8+0.2*sin(u_time*0.6+2.0);b*=0.8+0.2*sin(u_time*0.6+4.0);gl_FragColor=vec4(mix(vec3(r,g,b),vec3(1.0),mi*0.3),1.0);}
  `;

const FRAG_2 = COMMON_PREAMBLE + `
    float ridge(vec2 p){float v=0.0,a=0.5,fr=2.0;for(int i=0;i<5;i++){float n=1.0-abs(noise(p*fr)*2.0-1.0);v+=a*n;a*=0.5;fr*=2.0;}return v;}
    void main(){vec2 asp=vec2(u_resolution.x/u_resolution.y,1.0);vec2 uv=v_uv*asp,mouse=u_mouse*asp;float mi=smoothstep(0.5,0.0,length(uv-mouse));float t=u_time*0.05;vec2 offset=vec2(fbm(uv*0.7+t),fbm(uv*0.7+t+7.0));float r=ridge(uv+offset+vec2(mi*0.1,0.0));float g=ridge(uv+offset+vec2(0.0,0.05));float b=ridge(uv+offset-vec2(mi*0.1,0.0));r*=0.8+0.2*sin(u_time*0.5);g*=0.8+0.2*sin(u_time*0.5+2.0);b*=0.8+0.2*sin(u_time*0.5+4.0);gl_FragColor=vec4(mix(vec3(r,g,b),vec3(1.0),mi*0.3),1.0);}
  `;

const FRAG_3 = COMMON_PREAMBLE + `
    void main(){vec2 asp=vec2(u_resolution.x/u_resolution.y,1.0);vec2 uv=v_uv*asp,mouse=u_mouse*asp;float mi=smoothstep(0.5,0.0,length(uv-mouse));vec2 center=vec2(0.5*asp.x,0.5);vec2 d=uv-center;float angle=atan(d.y,d.x)*0.15915;float radius=length(d);float t=u_time*0.06;vec2 pUV=vec2(angle+radius*0.5+t,radius*2.0);vec2 offset=vec2(fbm(pUV+t*0.5),fbm(pUV+t*0.5+5.0));float r=fbm(pUV+offset+vec2(mi*0.1,0.0));float g=fbm(pUV+offset);float b=fbm(pUV+offset-vec2(mi*0.1,0.0));r*=0.8+0.2*sin(u_time*0.7);g*=0.8+0.2*sin(u_time*0.7+2.0);b*=0.8+0.2*sin(u_time*0.7+4.0);gl_FragColor=vec4(mix(vec3(r,g,b),vec3(1.0),mi*0.3),1.0);}
  `;

const FRAG_4 = COMMON_PREAMBLE + `
    #define PI 3.14159265359
    float pulse(float time,float speed,float intensity){return intensity*(0.5+0.5*sin(time*speed));}
    vec3 rainbow(float t){vec3 a=vec3(0.5),b=vec3(0.5),c=vec3(1.0),d=vec3(0.0,0.33,0.67);return a+b*cos(6.28318*(c*t+d));}
    vec3 mod289v3(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec2 mod289v2(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec3 permute4(vec3 x){return mod289v3(((x*34.0)+1.0)*x);}
    float snoise(vec2 v){const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289v2(i);vec3 p=permute4(permute4(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);m=m*m;m=m*m;vec3 x2=2.0*fract(p*C.www)-1.0;vec3 h=abs(x2)-0.5;vec3 ox=floor(x2+0.5);vec3 a0=x2-ox;m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.0*dot(m,g);}
    float blurredWave(vec2 uv,float time,float frequency,float amplitude){float asp=u_resolution.x/u_resolution.y;vec2 c=uv-0.5;c.x*=asp;float dist=length(c);float angle=atan(c.y,c.x);float wOff=sin(angle*5.0+time*0.5)*0.1;float wave=sin(dist*frequency-time*2.0+wOff)*amplitude;float n=snoise(c*3.0+time*0.1)*0.2;return wave+n;}
    void main(){float asp=u_resolution.x/u_resolution.y;vec2 uv=v_uv;vec2 cUV=uv-0.5;cUV.x*=asp;vec2 mPos=u_mouse-0.5;mPos.x*=asp;float mi=smoothstep(0.5,0.0,length(mPos-cUV))*0.5;float pulsation=pulse(u_time,0.5,0.5+mi);float dist=length(cUV);float w1=blurredWave(uv,u_time,10.0+pulsation*5.0,0.5);float w2=blurredWave(uv,u_time*0.7,15.0,0.3);float w3=blurredWave(uv,u_time*1.3,8.0,0.4);float cw=(w1+w2+w3)/3.0;vec3 color=rainbow(dist*2.0-u_time*0.2+cw);float glow=smoothstep(0.5+pulsation*0.3,0.0,dist);color+=glow*vec3(0.3,0.4,0.9)*pulsation;color+=mi*vec3(0.9,0.7,0.3);color=mix(color,vec3(0.1,0.1,0.2),0.2);color=mix(color,color*(1.0+cw*0.5),0.7);gl_FragColor=vec4(color,1.0);}
  `;

const FRAG_5 = COMMON_PREAMBLE + `
    float sdCircle(vec2 p,float r){return length(p)-r;}
    vec2 rotate2D(vec2 p,float angle){float s=sin(angle),c=cos(angle);return mat2(c,-s,s,c)*p;}
    void main(){vec2 uv=v_uv;vec2 asp=vec2(u_resolution.x/u_resolution.y,1.0);uv=(uv-0.5)*asp;vec3 col=vec3(0.1,0.1,0.15);float mouseInfluence=length(u_mouse-vec2(0.5));float t=u_time*0.5;for(float i=0.0;i<12.0;i++){float angle=t+i*3.14159*2.0/12.0;vec2 offset=vec2(cos(angle),sin(angle))*(0.3+0.1*sin(t+i));vec2 p=rotate2D(uv-offset,angle+t);float size=0.05+0.02*sin(t*2.0+i)+mouseInfluence*0.1;float d=sdCircle(p,size);float glow=0.02/(abs(d)+0.01);vec3 dotCol=vec3(0.3+0.7*sin(i+t),0.5,1.0);col+=dotCol*glow*0.15;}col+=hash(uv+t)*0.03;col*=1.0-length(uv)*0.7;col=smoothstep(0.0,1.0,col);gl_FragColor=vec4(col,1.0);}
  `;

const FRAG_6 = COMMON_PREAMBLE + `
    #define PI 3.14159265359
    mat2 rotateMat(float angle){float s=sin(angle),c=cos(angle);return mat2(c,-s,s,c);}
    float hash21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
    float smin(float a,float b,float k){float h=clamp(0.5+0.5*(b-a)/k,0.0,1.0);return mix(b,a,h)-k*h*(1.0-h);}
    float sdSeg(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;return length(pa-ba*clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0));}
    float sdCircle6(vec2 p,float r){return length(p)-r;}
    float sdBox(vec2 p,vec2 b){vec2 d=abs(p)-b;return length(max(d,0.0))+min(max(d.x,d.y),0.0);}
    void main(){vec2 uv=v_uv;float asp=u_resolution.x/u_resolution.y;uv.x*=asp;vec2 center=vec2(asp*0.5,0.5);uv-=center;vec2 mouse=u_mouse;mouse.x*=asp;mouse-=center;float mi=smoothstep(0.5,0.0,length(mouse));float t=u_time*0.5;float gs=10.0+mi*5.0;vec2 gUV=fract(uv*gs)-0.5;vec2 gID=floor(uv*gs);float cr=hash21(gID);float ct=t+cr*2.0*PI;gUV=rotateMat(ct*(cr-0.5)*2.0)*gUV;float circle=sdCircle6(gUV,0.2+0.1*sin(ct*2.0));float rect=sdBox(gUV,vec2(0.2+0.05*cos(ct*3.0)));vec2 lA=vec2(cos(ct),sin(ct))*0.2;vec2 lB=vec2(cos(ct+PI*0.5),sin(ct+PI*0.5))*0.2;float line=sdSeg(gUV,lA,lB)-0.03;float shape=smin(smin(circle,rect,0.1),line,0.1);vec3 sc=0.5+0.5*cos(cr*6.28+vec3(0.0,2.0,4.0));float glow=smoothstep(0.05,0.0,shape)+smoothstep(0.2,0.0,shape)*0.6;vec3 col=mix(vec3(0.05,0.07,0.1),sc,glow);col*=0.8+0.2*(0.5+0.5*sin(t*2.0+mi*5.0));col*=1.0-smoothstep(0.5,1.5,length(v_uv-0.5)*2.0);col+=sc*smoothstep(0.3,0.0,length(uv-mouse))*0.5;gl_FragColor=vec4(col,1.0);}
  `;

const FRAG_7 = COMMON_PREAMBLE + `
    float hash1f(float n){return fract(sin(n)*43758.5453);}
    float noise7(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);float n=i.x+i.y*57.0;return mix(mix(hash1f(n),hash1f(n+1.0),f.x),mix(hash1f(n+57.0),hash1f(n+58.0),f.x),f.y);}
    float fbm7(vec2 p){float v=0.0;v+=0.5000*noise7(p);p*=2.02;v+=0.2500*noise7(p);p*=2.03;v+=0.1250*noise7(p);return v;}
    float lineSDF(vec2 p,float angle,float width){float s=sin(angle),c=cos(angle);p=abs(vec2(c*p.x+s*p.y,-s*p.x+c*p.y));return smoothstep(width,width*0.8,p.y);}
    void main(){vec2 uv=v_uv-0.5;float asp=u_resolution.x/u_resolution.y;uv.x*=asp;float mi=smoothstep(0.5,0.0,length(uv-(u_mouse-0.5)*vec2(asp,1.0)));vec3 col=vec3(1.0);float t=u_time*0.1;for(int i=0;i<4;i++){float fi=float(i);vec2 off=vec2(fi*0.2,fi*0.15);float angle=t+fi*0.5+fbm7(uv*2.0+fi);float width=0.01+0.005*sin(t*2.0+fi)+mi*0.02;float l=lineSDF(uv+off,angle,width);l*=step(fbm7(uv*4.0+fi*10.0+t),0.7+fi*0.1);col=min(col,mix(col,vec3(0.0),l));l=lineSDF(uv-off,angle+radians(45.0),width*0.8);l*=step(fbm7(uv*3.0-fi*5.0+t),0.6+fi*0.1);col=min(col,mix(col,vec3(0.0),l));}gl_FragColor=vec4(col,1.0);}
  `;

const FRAG_8 = COMMON_PREAMBLE + `
    #define PI 3.14159265359
    float hash8f(float n){return fract(sin(n)*43758.5453);}
    float noise8(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);float n=i.x+i.y*57.0;return mix(mix(hash8f(n),hash8f(n+1.0),f.x),mix(hash8f(n+57.0),hash8f(n+58.0),f.x),f.y);}
    float lineSDF8(vec2 p,vec2 a,vec2 b,float thickness){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);return smoothstep(thickness,0.0,length(pa-ba*h));}
    void main(){vec2 uv=v_uv*2.0-1.0;float asp=u_resolution.x/u_resolution.y;uv.x*=asp;vec2 mouse=(u_mouse*2.0-1.0)*vec2(asp,1.0);float mi=max(0.5,1.0-length(uv-mouse)*0.8);vec3 color=vec3(0.05,0.15,0.05);float lineIntensity=0.0;for(int i=0;i<15;i++){float lt=float(i)/15.0;float yO=noise8(vec2(lt*3.0,u_time*0.2))*2.0-1.0;float xO=sin(lt*PI*2.0+u_time*0.5)*0.5;float spd=0.5+mi*0.5;vec2 a=vec2(-1.5+xO+sin(u_time*spd+lt*10.0)*0.3,lt*2.0-1.0+yO);vec2 b=vec2(1.5+xO+cos(u_time*spd+lt*10.0)*0.3,lt*2.0-1.0+yO);float thick=0.02+0.03*mi;float l=lineSDF8(uv,a,b,thick);vec3 lc=vec3(0.0,0.8,0.2)+vec3(0.0,0.2,0.0)*sin(lt*10.0+u_time);float glow=lineSDF8(uv,a,b,thick+0.1)*0.5;lineIntensity+=l+glow*0.3;color=mix(color,lc,l);color+=lc*glow*0.3;}color+=vec3(0.0,0.03,0.01)*noise8(uv*20.0+u_time*0.1);color+=vec3(0.0,0.05,0.02)*sin(u_time*0.5)*lineIntensity;color*=smoothstep(0.0,1.0,1.0-length(uv*0.5));gl_FragColor=vec4(color,1.0);}
  `;

const FRAG_9 = COMMON_PREAMBLE + `
    mat2 rotateMat9(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}
    void main(){vec2 uv=v_uv-0.5;float asp=u_resolution.x/u_resolution.y;uv.x*=asp;uv=rotateMat9(0.4)*uv;uv*=1.0+sin(u_time*0.3)*0.05;vec2 mouse=(u_mouse-0.5)*vec2(asp,1.0);float md=length(uv-mouse);uv+=sin(u_time*0.5+uv.yx*10.0)*smoothstep(1.0,0.0,md)*0.1;vec2 grid=uv*8.0;vec2 id=floor(grid);vec2 local=fract(grid)-0.5;float cells=hash(id*0.7+floor(u_time*0.3));vec3 col=vec3(0.95);if(cells<0.4)col=vec3(0.9,0.1,0.1);if(cells>0.6&&cells<0.8)col=vec3(0.1,0.3,0.9);if(cells>0.8)col=vec3(0.9,0.8,0.1);float line=smoothstep(0.45,0.5,abs(local.x))+smoothstep(0.45,0.5,abs(local.y));col=mix(col,vec3(0.0),clamp(line,0.0,1.0));gl_FragColor=vec4(col,1.0);}
  `;

const FRAG_10 = COMMON_PREAMBLE + `
    #define PI 3.14159265359
    #define TWO_PI 6.28318530718
    float hash10f(float n){return fract(sin(n)*43758.5453);}
    float noise10(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);float n=i.x+i.y*57.0;return mix(mix(hash10f(n),hash10f(n+1.0),f.x),mix(hash10f(n+57.0),hash10f(n+58.0),f.x),f.y);}
    float fbm10(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise10(p);p*=2.0;a*=0.5;}return v;}
    float flowerSDF(vec2 p,float radius,float petals,float ps){return length(p)-radius-ps*pow(abs(sin(atan(p.y,p.x)*petals)),0.5);}
    float stemSDF(vec2 p,vec2 s,vec2 e,float w){vec2 pa=p-s,ba=e-s;return length(pa-ba*clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0))-w;}
    float leafSDF(vec2 p,vec2 c,float sz,float ang){p-=c;float cx=cos(ang),sx=sin(ang);p=vec2(cx*p.x-sx*p.y,sx*p.x+cx*p.y);return length(p)-sz*(1.0+0.3*sin(atan(p.y,p.x)*8.0));}
    vec3 palette10(float t){return vec3(0.5)+vec3(0.5)*cos(TWO_PI*(vec3(1.0)*t+vec3(0.3,0.2,0.2)));}
    void main(){float asp=u_resolution.x/u_resolution.y;vec2 uv=v_uv;uv.x*=asp;vec2 p=uv-vec2(0.5*asp,0.5);vec2 mouse=u_mouse;mouse.x*=asp;float mi=smoothstep(0.3,0.0,length(p-(mouse-vec2(0.5*asp,0.5))));vec3 col=mix(vec3(0.7,0.9,1.0),vec3(0.4,0.6,0.9),v_uv.y);float gnd=smoothstep(0.0,0.05,v_uv.y-0.4);col=mix(col,vec3(0.2,0.5,0.2),1.0-gnd);col=mix(col,vec3(0.3,0.6,0.3)*(0.8+0.4*fbm10(p*20.0+u_time*0.1)),(1.0-gnd)*0.7);for(int i=0;i<12;i++){float fi=float(i);float ang=fi*TWO_PI/12.0+u_time*0.1;vec2 fp=vec2(0.5*cos(ang)*asp,0.3*sin(ang)-0.1);vec2 ss=vec2(fp.x,-0.5);if(stemSDF(p,ss,fp,0.005+0.002*sin(fi))<0.0)col=mix(col,vec3(0.2,0.8,0.2),0.8);for(int j=0;j<2;j++){float fj=float(j);if(leafSDF(p,mix(ss,fp,0.3+0.4*fj),0.03+0.01*sin(fi*2.7),fj*PI+fi*0.5)<0.0)col=mix(col,vec3(0.2,0.7,0.3),0.9);}float np=5.0+float(i-int(i/3)*3);if(flowerSDF(p-fp,0.05+0.02*sin(fi*1.7)+mi*0.02,np,0.03+0.01*cos(fi*2.1)+mi*0.01)<0.0){col=mix(col,palette10(fi/12.0+u_time*0.1),0.9);if(length(p-fp)-(0.05+0.02*sin(fi*1.7))*0.5<0.0)col=mix(col,vec3(1.0,0.8,0.2),0.9);}}for(int i=0;i<20;i++){float fi=float(i);vec2 pp=vec2(0.5*sin(u_time*0.2+fi*1.3)*cos(u_time*0.3+fi)*asp,0.4*cos(u_time*0.25+fi*0.7)-0.1);if(length(p-pp)-(0.003+0.002*sin(u_time+fi*2.0))<0.0)col=mix(col,vec3(1.0),0.7);}col=mix(col,vec3(1.0,0.9,0.7),smoothstep(0.1,-0.05,length(p-vec2(0.3*asp,0.3))-0.1)*0.5);col*=1.0-length(v_uv-0.5)*0.5;gl_FragColor=vec4(col,1.0);}
  `;

const FRAG_11 = COMMON_PREAMBLE + `
    #define PI 3.14159265359
    #define TWO_PI 6.28318530718
    float hash11f(float n){return fract(sin(n)*43758.5453123);}
    float noise11(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);float n=i.x+i.y*57.0;return mix(mix(hash11f(n),hash11f(n+1.0),f.x),mix(hash11f(n+57.0),hash11f(n+58.0),f.x),f.y);}
    float fbm11(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise11(p);p*=2.0;a*=0.5;}return v;}
    float petalSDF(vec2 p,float sz,float angle){p=mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*p;float r=length(p);float theta=atan(p.y,p.x);float shape=1.0-sin(theta*5.0)*0.2;return smoothstep(sz*shape,sz*shape-0.05,r);}
    vec4 blossom(vec2 p,float sz,vec3 col){float a=0.0;for(int i=0;i<5;i++)a+=petalSDF(p,sz,float(i)*TWO_PI/5.0);a+=smoothstep(sz*0.2,sz*0.15,length(p));a=clamp(a,0.0,1.0);return vec4(col+fbm11(p*10.0+u_time*0.1)*0.2,a);}
    vec2 windOffset(vec2 p,float t){return p+vec2(sin(p.y*2.0+t)*0.02,cos(p.x*2.0+t)*0.01);}
    void main(){float asp=u_resolution.x/u_resolution.y;vec2 uv=(v_uv-0.5)*vec2(asp,1.0)+0.5;vec3 sky=mix(vec3(0.6,0.8,1.0),vec3(0.9,0.7,0.8),smoothstep(0.0,1.0,uv.y));float mi=smoothstep(0.5,0.0,length(uv-u_mouse));vec4 col=vec4(sky,1.0);for(int i=0;i<20;i++){float fi=float(i);float t=u_time*0.2+fi*1.234;float sz=0.05+hash11f(fi)*0.05+mi*0.03;vec2 pos=vec2(mod(hash11f(fi*1.234)+sin(t*(0.5+hash11f(fi)*0.5))*0.2,1.0),mod(hash11f(fi*5.678)-t*(0.1+hash11f(fi)*0.1),1.0));pos=windOffset(pos,u_time*0.5);pos+=(u_mouse-vec2(0.5))*0.1*mi;vec3 pc=mix(vec3(1.0,0.8,0.9),vec3(1.0),hash11f(fi*3.456));vec4 bl=blossom((uv-pos)*vec2(asp,1.0),sz,pc);col=mix(col,vec4(bl.rgb,1.0),bl.a*0.8);}col.rgb+=fbm11(uv*20.0+vec2(0.0,-u_time*0.2))*0.05;gl_FragColor=col;}
  `;

const FRAG_12 = COMMON_PREAMBLE + `
    #define PI 3.14159265359
    #define NUM_BEAMS 12
    float hash12f(float n){return fract(sin(n)*43758.5453123);}
    float noise1d(float x){float i=floor(x),f=fract(x);return mix(hash12f(i),hash12f(i+1.0),f*f*(3.0-2.0*f));}
    vec3 hsl2rgb12(float h,float s,float l){vec3 rgb=clamp(abs(mod(h*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0,0.0,1.0);return l+s*(rgb-0.5)*(1.0-abs(2.0*l-1.0));}
    float vBeam(vec2 uv,vec2 origin,float angle,float width,float t){vec2 dir=vec2(cos(angle),sin(angle));vec2 d=uv-origin;float along=dot(d,dir);if(along<0.0)return 0.0;float perp=dot(d,vec2(-dir.y,dir.x));float cw=width+along*0.35;float core=exp(-abs(perp)*8.0/(cw+0.01))*exp(-along*0.4);float glow=exp(-abs(perp)*2.0/(cw+0.01))*exp(-along*0.6);float n=noise1d(along*5.0-t*2.0+perp*10.0);float dust=smoothstep(0.4,0.6,noise1d(along*15.0+t*3.0)*0.5+0.5)*exp(-abs(perp)*4.0/(cw+0.01))*exp(-along*0.5);return(core*1.5+glow*0.4+dust*0.3)*(0.8+0.2*n);}
    void main(){float asp=u_resolution.x/u_resolution.y;vec2 st=vec2((v_uv.x-0.5)*asp,v_uv.y-0.5);vec2 mouse=vec2((u_mouse.x-0.5)*asp,u_mouse.y-0.5);float mi=exp(-length(st-mouse)*2.0);vec3 col=mix(vec3(0.0,0.0,0.02),vec3(0.02,0.0,0.05),v_uv.y);col+=vec3(0.05,0.03,0.08)*exp(-v_uv.y*3.0)*0.15;float t=u_time;for(int i=0;i<NUM_BEAMS;i++){float fi=float(i),nb=float(NUM_BEAMS);float ox=(fi/(nb-1.0)-0.5)*asp*1.2;vec2 orig=vec2(ox,0.6);float aoff=sin(t*(0.3+hash12f(fi*7.3)*0.4)+fi*1.7)*(0.4+0.2*sin(t*0.3+fi));float ba=-PI*0.5+aoff;ba=mix(ba,atan(mouse.y-orig.y,mouse.x-orig.x),mi*0.3);float hue=fract(fi/nb+t*0.05);float pulse=0.6+0.4*sin(t*(1.0+hash12f(fi*3.1)*2.0)+fi*0.8);float w=0.02+0.015*sin(t*0.7+fi*1.3);col+=hsl2rgb12(hue,0.8+0.2*sin(t+fi*2.0),0.6)*vBeam(st,orig,ba,w*(1.0+mi*0.3),t+fi*10.0)*pulse*(0.8+mi*0.5);col+=hsl2rgb12(hue,0.6,0.8)*exp(-length(st-orig)*15.0)*0.5*pulse;}for(int i=0;i<6;i++){float fi=float(i);float side=mod(fi,2.0)==0.0?-1.0:1.0;vec2 orig=vec2(side*asp*0.7,0.3+fi*0.08);float ba=(side>0.0?PI-0.5:0.5)+sin(t*0.5+fi*2.1)*0.3-PI*0.15*side;ba=mix(ba,atan(mouse.y-orig.y,mouse.x-orig.x),mi*0.2);col+=hsl2rgb12(fract(0.6+fi*0.12+t*0.03),0.9,0.55)*vBeam(st,orig,ba,0.015+0.01*sin(t*0.9+fi),t+fi*5.0)*(0.4+0.6*sin(t*1.5+fi*1.2))*0.7;}for(int i=0;i<4;i++){float fi=float(i);vec2 orig=vec2((fi/3.0-0.5)*asp*0.8,0.55);float ba=-PI*0.5+sin(t*(0.8+fi*0.2)+fi*PI*0.5)*0.6+mi*0.2*sin(t+fi);col+=hsl2rgb12(fract(t*0.1+fi*0.25),0.7,0.7)*vBeam(st,orig,ba,0.03,t+fi*20.0)*0.5*smoothstep(0.0,0.1,sin(t*3.0+fi*1.5));}col+=vec3(0.02,0.01,0.03)*noise1d(st.x*3.0+t*0.2)*noise1d(st.y*2.0-t*0.1);col*=smoothstep(0.0,1.0,1.0-length(v_uv-0.5)*0.8);col=col/(1.0+col);col=pow(col,vec3(0.95));gl_FragColor=vec4(col,1.0);}
  `;

const FRAG_SRCS: string[] = [
  FRAG_0, FRAG_1, FRAG_2, FRAG_3, FRAG_4, FRAG_5, FRAG_6,
  FRAG_7, FRAG_8, FRAG_9, FRAG_10, FRAG_11, FRAG_12,
];

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  variant?: number;  // 0-12, which shader to render
  opacity?: number;  // 0-1, default 0.35
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ShaderBackground({ opacity, variant }: Props) {
  const resolvedOpacity = opacity !== undefined ? opacity : 0.35;
  const resolvedVariant = variant !== undefined ? variant : 0;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef  = useRef<number[]>([0.5, 0.5]);

  const [activeVariant,  setActiveVariant]  = useState(resolvedVariant);
  const [displayOpacity, setDisplayOpacity] = useState(0);

  // Fade in on mount
  useEffect(() => {
    const t = setTimeout(() => setDisplayOpacity(resolvedOpacity), 80);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Variant cross-fade: fade out → swap → fade in
  useEffect(() => {
    if (resolvedVariant === activeVariant) return;
    setDisplayOpacity(0);
    const t1 = setTimeout(() => {
      setActiveVariant(resolvedVariant);
      const t2 = setTimeout(() => setDisplayOpacity(resolvedOpacity), 60);
      return () => clearTimeout(t2);
    }, 700);
    return () => clearTimeout(t1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedVariant]);

  // WebGL render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = (
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    ) as WebGLRenderingContext | null;
    if (!gl) return;

    function compile(type: number, src: string): WebGLShader | null {
      if (!gl) return null;
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    }

    const vs = compile(gl.VERTEX_SHADER, VERT_SRC);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG_SRCS[activeVariant] ?? FRAG_SRCS[0]);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime  = gl.getUniformLocation(program, 'u_time');
    const uMouse = gl.getUniformLocation(program, 'u_mouse');
    const uRes   = gl.getUniformLocation(program, 'u_resolution');

    const t0 = performance.now();
    let rafId: number;

    function resize() {
      if (!gl || !canvas) return;
      const p = canvas.parentElement;
      if (!p) return;
      const w = p.offsetWidth  || 1;
      const h = p.offsetHeight || 1;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width  = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }

    function render() {
      if (!gl || !canvas) return;
      resize();
      const t = (performance.now() - t0) * 0.001;
      gl.uniform1f(uTime, t);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouseRef.current[0], mouseRef.current[1]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafId = requestAnimationFrame(render);
    }
    render();

    function onMouseMove(e: MouseEvent) {
      if (!canvas) return;
      const r = canvas.getBoundingClientRect();
      mouseRef.current = [
        (e.clientX - r.left) / (r.width  || 1),
        1 - (e.clientY - r.top)  / (r.height || 1),
      ];
    }

    function onTouchMove(e: TouchEvent) {
      if (!canvas) return;
      const tc = e.touches[0];
      const r  = canvas.getBoundingClientRect();
      mouseRef.current = [
        (tc.clientX - r.left) / (r.width  || 1),
        1 - (tc.clientY - r.top)  / (r.height || 1),
      ];
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      if (gl) {
        gl.deleteProgram(program);
        if (buf) gl.deleteBuffer(buf);
        if (vs) gl.deleteShader(vs);
        if (fs) gl.deleteShader(fs);
      }
    };
  }, [activeVariant]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        opacity: displayOpacity,
        transition: 'opacity 700ms ease-in-out',
        pointerEvents: 'none',
      }}
    />
  );
}
