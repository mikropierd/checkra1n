var ve=Object.defineProperty;var l=(e,t)=>ve(e,"name",{value:t,configurable:!0});import a from"node:path";import ee from"node:fs";import Te from"node:module";import{resolveExports as Ae}from"resolve-pkg-maps";import Oe from"fs";function B(e){return e.startsWith("\\\\?\\")?e:e.replace(/\\/g,"/")}l(B,"slash");const R=l(e=>{const t=ee[e];return(i,...n)=>{const o=`${e}:${n.join(":")}`;let s=i==null?void 0:i.get(o);return s===void 0&&(s=Reflect.apply(t,ee,n),i==null||i.set(o,s)),s}},"cacheFs"),F=R("existsSync"),je=R("readFileSync"),P=R("statSync"),ne=l((e,t,i)=>{for(;;){const n=a.posix.join(e,t);if(F(i,n))return n;const o=a.dirname(e);if(o===e)return;e=o}},"findUp"),J=/^\.{1,2}(\/.*)?$/,M=l(e=>{const t=B(e);return J.test(t)?t:`./${t}`},"normalizeRelativePath");function _e(e,t=!1){const i=e.length;let n=0,o="",s=0,r=16,f=0,u=0,p=0,T=0,w=0;function O(c,m){let g=0,y=0;for(;g<c||!m;){let j=e.charCodeAt(n);if(j>=48&&j<=57)y=y*16+j-48;else if(j>=65&&j<=70)y=y*16+j-65+10;else if(j>=97&&j<=102)y=y*16+j-97+10;else break;n++,g++}return g<c&&(y=-1),y}l(O,"scanHexDigits");function v(c){n=c,o="",s=0,r=16,w=0}l(v,"setPosition");function A(){let c=n;if(e.charCodeAt(n)===48)n++;else for(n++;n<e.length&&N(e.charCodeAt(n));)n++;if(n<e.length&&e.charCodeAt(n)===46)if(n++,n<e.length&&N(e.charCodeAt(n)))for(n++;n<e.length&&N(e.charCodeAt(n));)n++;else return w=3,e.substring(c,n);let m=n;if(n<e.length&&(e.charCodeAt(n)===69||e.charCodeAt(n)===101))if(n++,(n<e.length&&e.charCodeAt(n)===43||e.charCodeAt(n)===45)&&n++,n<e.length&&N(e.charCodeAt(n))){for(n++;n<e.length&&N(e.charCodeAt(n));)n++;m=n}else w=3;return e.substring(c,m)}l(A,"scanNumber");function b(){let c="",m=n;for(;;){if(n>=i){c+=e.substring(m,n),w=2;break}const g=e.charCodeAt(n);if(g===34){c+=e.substring(m,n),n++;break}if(g===92){if(c+=e.substring(m,n),n++,n>=i){w=2;break}switch(e.charCodeAt(n++)){case 34:c+='"';break;case 92:c+="\\";break;case 47:c+="/";break;case 98:c+="\b";break;case 102:c+="\f";break;case 110:c+=`
`;break;case 114:c+="\r";break;case 116:c+="	";break;case 117:const j=O(4,!0);j>=0?c+=String.fromCharCode(j):w=4;break;default:w=5}m=n;continue}if(g>=0&&g<=31)if(h(g)){c+=e.substring(m,n),w=2;break}else w=6;n++}return c}l(b,"scanString");function $(){if(o="",w=0,s=n,u=f,T=p,n>=i)return s=i,r=17;let c=e.charCodeAt(n);if(G(c)){do n++,o+=String.fromCharCode(c),c=e.charCodeAt(n);while(G(c));return r=15}if(h(c))return n++,o+=String.fromCharCode(c),c===13&&e.charCodeAt(n)===10&&(n++,o+=`
`),f++,p=n,r=14;switch(c){case 123:return n++,r=1;case 125:return n++,r=2;case 91:return n++,r=3;case 93:return n++,r=4;case 58:return n++,r=6;case 44:return n++,r=5;case 34:return n++,o=b(),r=10;case 47:const m=n-1;if(e.charCodeAt(n+1)===47){for(n+=2;n<i&&!h(e.charCodeAt(n));)n++;return o=e.substring(m,n),r=12}if(e.charCodeAt(n+1)===42){n+=2;const g=i-1;let y=!1;for(;n<g;){const j=e.charCodeAt(n);if(j===42&&e.charCodeAt(n+1)===47){n+=2,y=!0;break}n++,h(j)&&(j===13&&e.charCodeAt(n)===10&&n++,f++,p=n)}return y||(n++,w=1),o=e.substring(m,n),r=13}return o+=String.fromCharCode(c),n++,r=16;case 45:if(o+=String.fromCharCode(c),n++,n===i||!N(e.charCodeAt(n)))return r=16;case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:return o+=A(),r=11;default:for(;n<i&&U(c);)n++,c=e.charCodeAt(n);if(s!==n){switch(o=e.substring(s,n),o){case"true":return r=8;case"false":return r=9;case"null":return r=7}return r=16}return o+=String.fromCharCode(c),n++,r=16}}l($,"scanNext");function U(c){if(G(c)||h(c))return!1;switch(c){case 125:case 93:case 123:case 91:case 34:case 58:case 44:case 47:return!1}return!0}l(U,"isUnknownContentCharacter");function E(){let c;do c=$();while(c>=12&&c<=15);return c}return l(E,"scanNextNonTrivia"),{setPosition:v,getPosition:l(()=>n,"getPosition"),scan:t?E:$,getToken:l(()=>r,"getToken"),getTokenValue:l(()=>o,"getTokenValue"),getTokenOffset:l(()=>s,"getTokenOffset"),getTokenLength:l(()=>n-s,"getTokenLength"),getTokenStartLine:l(()=>u,"getTokenStartLine"),getTokenStartCharacter:l(()=>s-T,"getTokenStartCharacter"),getTokenError:l(()=>w,"getTokenError")}}l(_e,"createScanner");function G(e){return e===32||e===9}l(G,"isWhiteSpace");function h(e){return e===10||e===13}l(h,"isLineBreak");function N(e){return e>=48&&e<=57}l(N,"isDigit");var te;(function(e){e[e.lineFeed=10]="lineFeed",e[e.carriageReturn=13]="carriageReturn",e[e.space=32]="space",e[e._0=48]="_0",e[e._1=49]="_1",e[e._2=50]="_2",e[e._3=51]="_3",e[e._4=52]="_4",e[e._5=53]="_5",e[e._6=54]="_6",e[e._7=55]="_7",e[e._8=56]="_8",e[e._9=57]="_9",e[e.a=97]="a",e[e.b=98]="b",e[e.c=99]="c",e[e.d=100]="d",e[e.e=101]="e",e[e.f=102]="f",e[e.g=103]="g",e[e.h=104]="h",e[e.i=105]="i",e[e.j=106]="j",e[e.k=107]="k",e[e.l=108]="l",e[e.m=109]="m",e[e.n=110]="n",e[e.o=111]="o",e[e.p=112]="p",e[e.q=113]="q",e[e.r=114]="r",e[e.s=115]="s",e[e.t=116]="t",e[e.u=117]="u",e[e.v=118]="v",e[e.w=119]="w",e[e.x=120]="x",e[e.y=121]="y",e[e.z=122]="z",e[e.A=65]="A",e[e.B=66]="B",e[e.C=67]="C",e[e.D=68]="D",e[e.E=69]="E",e[e.F=70]="F",e[e.G=71]="G",e[e.H=72]="H",e[e.I=73]="I",e[e.J=74]="J",e[e.K=75]="K",e[e.L=76]="L",e[e.M=77]="M",e[e.N=78]="N",e[e.O=79]="O",e[e.P=80]="P",e[e.Q=81]="Q",e[e.R=82]="R",e[e.S=83]="S",e[e.T=84]="T",e[e.U=85]="U",e[e.V=86]="V",e[e.W=87]="W",e[e.X=88]="X",e[e.Y=89]="Y",e[e.Z=90]="Z",e[e.asterisk=42]="asterisk",e[e.backslash=92]="backslash",e[e.closeBrace=125]="closeBrace",e[e.closeBracket=93]="closeBracket",e[e.colon=58]="colon",e[e.comma=44]="comma",e[e.dot=46]="dot",e[e.doubleQuote=34]="doubleQuote",e[e.minus=45]="minus",e[e.openBrace=123]="openBrace",e[e.openBracket=91]="openBracket",e[e.plus=43]="plus",e[e.slash=47]="slash",e[e.formFeed=12]="formFeed",e[e.tab=9]="tab"})(te||(te={})),new Array(20).fill(0).map((e,t)=>" ".repeat(t));const D=200;new Array(D).fill(0).map((e,t)=>`
`+" ".repeat(t)),new Array(D).fill(0).map((e,t)=>"\r"+" ".repeat(t)),new Array(D).fill(0).map((e,t)=>`\r
`+" ".repeat(t)),new Array(D).fill(0).map((e,t)=>`
`+"	".repeat(t)),new Array(D).fill(0).map((e,t)=>"\r"+"	".repeat(t)),new Array(D).fill(0).map((e,t)=>`\r
`+"	".repeat(t));var x;(function(e){e.DEFAULT={allowTrailingComma:!1}})(x||(x={}));function $e(e,t=[],i=x.DEFAULT){let n=null,o=[];const s=[];function r(u){Array.isArray(o)?o.push(u):n!==null&&(o[n]=u)}return l(r,"onValue"),ye(e,{onObjectBegin:l(()=>{const u={};r(u),s.push(o),o=u,n=null},"onObjectBegin"),onObjectProperty:l(u=>{n=u},"onObjectProperty"),onObjectEnd:l(()=>{o=s.pop()},"onObjectEnd"),onArrayBegin:l(()=>{const u=[];r(u),s.push(o),o=u,n=null},"onArrayBegin"),onArrayEnd:l(()=>{o=s.pop()},"onArrayEnd"),onLiteralValue:r,onError:l((u,p,T)=>{t.push({error:u,offset:p,length:T})},"onError")},i),o[0]}l($e,"parse$1");function ye(e,t,i=x.DEFAULT){const n=_e(e,!1),o=[];function s(k){return k?()=>k(n.getTokenOffset(),n.getTokenLength(),n.getTokenStartLine(),n.getTokenStartCharacter()):()=>!0}l(s,"toNoArgVisit");function r(k){return k?()=>k(n.getTokenOffset(),n.getTokenLength(),n.getTokenStartLine(),n.getTokenStartCharacter(),()=>o.slice()):()=>!0}l(r,"toNoArgVisitWithPath");function f(k){return k?_=>k(_,n.getTokenOffset(),n.getTokenLength(),n.getTokenStartLine(),n.getTokenStartCharacter()):()=>!0}l(f,"toOneArgVisit");function u(k){return k?_=>k(_,n.getTokenOffset(),n.getTokenLength(),n.getTokenStartLine(),n.getTokenStartCharacter(),()=>o.slice()):()=>!0}l(u,"toOneArgVisitWithPath");const p=r(t.onObjectBegin),T=u(t.onObjectProperty),w=s(t.onObjectEnd),O=r(t.onArrayBegin),v=s(t.onArrayEnd),A=u(t.onLiteralValue),b=f(t.onSeparator),$=s(t.onComment),U=f(t.onError),E=i&&i.disallowComments,c=i&&i.allowTrailingComma;function m(){for(;;){const k=n.scan();switch(n.getTokenError()){case 4:g(14);break;case 5:g(15);break;case 3:g(13);break;case 1:E||g(11);break;case 2:g(12);break;case 6:g(16);break}switch(k){case 12:case 13:E?g(10):$();break;case 16:g(1);break;case 15:case 14:break;default:return k}}}l(m,"scanNext");function g(k,_=[],C=[]){if(U(k),_.length+C.length>0){let d=n.getToken();for(;d!==17;){if(_.indexOf(d)!==-1){m();break}else if(C.indexOf(d)!==-1)break;d=m()}}}l(g,"handleError");function y(k){const _=n.getTokenValue();return k?A(_):(T(_),o.push(_)),m(),!0}l(y,"parseString");function j(){switch(n.getToken()){case 11:const k=n.getTokenValue();let _=Number(k);isNaN(_)&&(g(2),_=0),A(_);break;case 7:A(null);break;case 8:A(!0);break;case 9:A(!1);break;default:return!1}return m(),!0}l(j,"parseLiteral");function ke(){return n.getToken()!==10?(g(3,[],[2,5]),!1):(y(!1),n.getToken()===6?(b(":"),m(),V()||g(4,[],[2,5])):g(5,[],[2,5]),o.pop(),!0)}l(ke,"parseProperty");function be(){p(),m();let k=!1;for(;n.getToken()!==2&&n.getToken()!==17;){if(n.getToken()===5){if(k||g(4,[],[]),b(","),m(),n.getToken()===2&&c)break}else k&&g(6,[],[]);ke()||g(4,[],[2,5]),k=!0}return w(),n.getToken()!==2?g(7,[2],[]):m(),!0}l(be,"parseObject");function we(){O(),m();let k=!0,_=!1;for(;n.getToken()!==4&&n.getToken()!==17;){if(n.getToken()===5){if(_||g(4,[],[]),b(","),m(),n.getToken()===4&&c)break}else _&&g(6,[],[]);k?(o.push(0),k=!1):o[o.length-1]++,V()||g(4,[],[4,5]),_=!0}return v(),k||o.pop(),n.getToken()!==4?g(8,[4],[]):m(),!0}l(we,"parseArray");function V(){switch(n.getToken()){case 3:return we();case 1:return be();case 10:return y(!0);default:return j()}}return l(V,"parseValue"),m(),n.getToken()===17?i.allowEmptyContent?!0:(g(4,[],[]),!1):V()?(n.getToken()!==17&&g(9,[],[]),!0):(g(4,[],[]),!1)}l(ye,"visit");var ie;(function(e){e[e.None=0]="None",e[e.UnexpectedEndOfComment=1]="UnexpectedEndOfComment",e[e.UnexpectedEndOfString=2]="UnexpectedEndOfString",e[e.UnexpectedEndOfNumber=3]="UnexpectedEndOfNumber",e[e.InvalidUnicode=4]="InvalidUnicode",e[e.InvalidEscapeCharacter=5]="InvalidEscapeCharacter",e[e.InvalidCharacter=6]="InvalidCharacter"})(ie||(ie={}));var oe;(function(e){e[e.OpenBraceToken=1]="OpenBraceToken",e[e.CloseBraceToken=2]="CloseBraceToken",e[e.OpenBracketToken=3]="OpenBracketToken",e[e.CloseBracketToken=4]="CloseBracketToken",e[e.CommaToken=5]="CommaToken",e[e.ColonToken=6]="ColonToken",e[e.NullKeyword=7]="NullKeyword",e[e.TrueKeyword=8]="TrueKeyword",e[e.FalseKeyword=9]="FalseKeyword",e[e.StringLiteral=10]="StringLiteral",e[e.NumericLiteral=11]="NumericLiteral",e[e.LineCommentTrivia=12]="LineCommentTrivia",e[e.BlockCommentTrivia=13]="BlockCommentTrivia",e[e.LineBreakTrivia=14]="LineBreakTrivia",e[e.Trivia=15]="Trivia",e[e.Unknown=16]="Unknown",e[e.EOF=17]="EOF"})(oe||(oe={}));const Be=$e;var se;(function(e){e[e.InvalidSymbol=1]="InvalidSymbol",e[e.InvalidNumberFormat=2]="InvalidNumberFormat",e[e.PropertyNameExpected=3]="PropertyNameExpected",e[e.ValueExpected=4]="ValueExpected",e[e.ColonExpected=5]="ColonExpected",e[e.CommaExpected=6]="CommaExpected",e[e.CloseBraceExpected=7]="CloseBraceExpected",e[e.CloseBracketExpected=8]="CloseBracketExpected",e[e.EndOfFileExpected=9]="EndOfFileExpected",e[e.InvalidCommentToken=10]="InvalidCommentToken",e[e.UnexpectedEndOfComment=11]="UnexpectedEndOfComment",e[e.UnexpectedEndOfString=12]="UnexpectedEndOfString",e[e.UnexpectedEndOfNumber=13]="UnexpectedEndOfNumber",e[e.InvalidUnicode=14]="InvalidUnicode",e[e.InvalidEscapeCharacter=15]="InvalidEscapeCharacter",e[e.InvalidCharacter=16]="InvalidCharacter"})(se||(se={}));const le=l((e,t)=>Be(je(t,e,"utf8")),"readJsonc"),z=Symbol("implicitBaseUrl"),L="${configDir}",Fe=l(()=>{const{findPnpApi:e}=Te;return e&&e(process.cwd())},"getPnpApi"),Q=l((e,t,i,n)=>{const o=`resolveFromPackageJsonPath:${e}:${t}:${i}`;if(n!=null&&n.has(o))return n.get(o);const s=le(e,n);if(!s)return;let r=t||"tsconfig.json";if(!i&&s.exports)try{const[f]=Ae(s.exports,t,["require","types"]);r=f}catch{return!1}else!t&&s.tsconfig&&(r=s.tsconfig);return r=a.join(e,"..",r),n==null||n.set(o,r),r},"resolveFromPackageJsonPath"),H="package.json",X="tsconfig.json",Le=l((e,t,i)=>{let n=e;if(e===".."&&(n=a.join(n,X)),e[0]==="."&&(n=a.resolve(t,n)),a.isAbsolute(n)){if(F(i,n)){if(P(i,n).isFile())return n}else if(!n.endsWith(".json")){const v=`${n}.json`;if(F(i,v))return v}return}const[o,...s]=e.split("/"),r=o[0]==="@"?`${o}/${s.shift()}`:o,f=s.join("/"),u=Fe();if(u){const{resolveRequest:v}=u;try{if(r===e){const A=v(a.join(r,H),t);if(A){const b=Q(A,f,!1,i);if(b&&F(i,b))return b}}else{let A;try{A=v(e,t,{extensions:[".json"]})}catch{A=v(a.join(e,X),t)}if(A)return A}}catch{}}const p=ne(a.resolve(t),a.join("node_modules",r),i);if(!p||!P(i,p).isDirectory())return;const T=a.join(p,H);if(F(i,T)){const v=Q(T,f,!1,i);if(v===!1)return;if(v&&F(i,v)&&P(i,v).isFile())return v}const w=a.join(p,f),O=w.endsWith(".json");if(!O){const v=`${w}.json`;if(F(i,v))return v}if(F(i,w)){if(P(i,w).isDirectory()){const v=a.join(w,H);if(F(i,v)){const b=Q(v,"",!0,i);if(b&&F(i,b))return b}const A=a.join(w,X);if(F(i,A))return A}else if(O)return w}},"resolveExtendsPath"),Y=l((e,t)=>M(a.relative(e,t)),"pathRelative"),re=["files","include","exclude"],Ue=l((e,t,i,n)=>{const o=Le(e,t,n);if(!o)throw new Error(`File '${e}' not found.`);if(i.has(o))throw new Error(`Circularity detected while resolving configuration: ${o}`);i.add(o);const s=a.dirname(o),r=ue(o,n,i);delete r.references;const{compilerOptions:f}=r;if(f){const{baseUrl:u}=f;u&&!u.startsWith(L)&&(f.baseUrl=B(a.relative(t,a.join(s,u)))||"./");let{outDir:p}=f;p&&(p.startsWith(L)||(p=a.relative(t,a.join(s,p))),f.outDir=B(p)||"./")}for(const u of re){const p=r[u];p&&(r[u]=p.map(T=>T.startsWith(L)?T:B(a.relative(t,a.join(s,T)))))}return r},"resolveExtends"),Ee=["outDir","declarationDir"],ue=l((e,t,i=new Set)=>{let n;try{n=le(e,t)||{}}catch{throw new Error(`Cannot resolve tsconfig at path: ${e}`)}if(typeof n!="object")throw new SyntaxError(`Failed to parse tsconfig at: ${e}`);const o=a.dirname(e);if(n.compilerOptions){const{compilerOptions:s}=n;s.paths&&!s.baseUrl&&(s[z]=o)}if(n.extends){const s=Array.isArray(n.extends)?n.extends:[n.extends];delete n.extends;for(const r of s.reverse()){const f=Ue(r,o,new Set(i),t),u={...f,...n,compilerOptions:{...f.compilerOptions,...n.compilerOptions}};f.watchOptions&&(u.watchOptions={...f.watchOptions,...n.watchOptions}),n=u}}if(n.compilerOptions){const{compilerOptions:s}=n,r=["baseUrl","rootDir"];for(const f of r){const u=s[f];if(u&&!u.startsWith(L)){const p=a.resolve(o,u),T=Y(o,p);s[f]=T}}for(const f of Ee){let u=s[f];u&&(Array.isArray(n.exclude)||(n.exclude=[]),n.exclude.includes(u)||n.exclude.push(u),u.startsWith(L)||(u=M(u)),s[f]=u)}}else n.compilerOptions={};if(n.include?(n.include=n.include.map(B),n.files&&delete n.files):n.files&&(n.files=n.files.map(s=>s.startsWith(L)?s:M(s))),n.watchOptions){const{watchOptions:s}=n;s.excludeDirectories&&(s.excludeDirectories=s.excludeDirectories.map(r=>B(a.resolve(o,r))))}return n},"_parseTsconfig"),I=l((e,t)=>{if(e.startsWith(L))return B(a.join(t,e.slice(L.length)))},"interpolateConfigDir"),Ne=["outDir","declarationDir","outFile","rootDir","baseUrl","tsBuildInfoFile"],fe=l((e,t=new Map)=>{const i=a.resolve(e),n=ue(i,t),o=a.dirname(i),{compilerOptions:s}=n;if(s){for(const f of Ne){const u=s[f];if(u){const p=I(u,o);s[f]=p?Y(o,p):u}}for(const f of["rootDirs","typeRoots"]){const u=s[f];u&&(s[f]=u.map(p=>{const T=I(p,o);return T?Y(o,T):p}))}const{paths:r}=s;if(r)for(const f of Object.keys(r))r[f]=r[f].map(u=>{var p;return(p=I(u,o))!=null?p:u})}for(const r of re){const f=n[r];f&&(n[r]=f.map(u=>{var p;return(p=I(u,o))!=null?p:u}))}return n},"parseTsconfig"),De=l((e=process.cwd(),t="tsconfig.json",i=new Map)=>{const n=ne(B(e),t,i);if(!n)return null;const o=fe(n,i);return{path:n,config:o}},"getTsconfig"),he=/\*/g,ce=l((e,t)=>{const i=e.match(he);if(i&&i.length>1)throw new Error(t)},"assertStarCount"),de=l(e=>{if(e.includes("*")){const[t,i]=e.split("*");return{prefix:t,suffix:i}}return e},"parsePattern"),Pe=l(({prefix:e,suffix:t},i)=>i.startsWith(e)&&i.endsWith(t),"isPatternMatch"),xe=l((e,t,i)=>Object.entries(e).map(([n,o])=>(ce(n,`Pattern '${n}' can have at most one '*' character.`),{pattern:de(n),substitutions:o.map(s=>{if(ce(s,`Substitution '${s}' in pattern '${n}' can have at most one '*' character.`),!t&&!J.test(s))throw new Error("Non-relative paths are not allowed when 'baseUrl' is not set. Did you forget a leading './'?");return a.resolve(i,s)})})),"parsePaths"),Ie=l(e=>{const{compilerOptions:t}=e.config;if(!t)return null;const{baseUrl:i,paths:n}=t;if(!i&&!n)return null;const o=z in t&&t[z],s=a.resolve(a.dirname(e.path),i||o||"."),r=n?xe(n,i,s):[];return f=>{if(J.test(f))return[];const u=[];for(const O of r){if(O.pattern===f)return O.substitutions.map(B);typeof O.pattern!="string"&&u.push(O)}let p,T=-1;for(const O of u)Pe(O.pattern,f)&&O.pattern.prefix.length>T&&(T=O.pattern.prefix.length,p=O);if(!p)return i?[B(a.join(s,f))]:[];const w=f.slice(p.pattern.prefix.length,f.length-p.pattern.suffix.length);return p.substitutions.map(O=>B(O.replace("*",w)))}},"createPathsMatcher"),pe=l(e=>{let t="";for(let i=0;i<e.length;i+=1){const n=e[i],o=n.toUpperCase();t+=n===o?n.toLowerCase():o}return t},"s"),Se=65,We=97,Ve=l(()=>Math.floor(Math.random()*26),"m"),Re=l(e=>Array.from({length:e},()=>String.fromCodePoint(Ve()+(Math.random()>.5?Se:We))).join(""),"S"),Je=l((e=Oe)=>{const t=process.execPath;if(e.existsSync(t))return!e.existsSync(pe(t));const i=`/${Re(10)}`;e.writeFileSync(i,"");const n=!e.existsSync(pe(i));return e.unlinkSync(i),n},"l"),{join:S}=a.posix,Z={ts:[".ts",".tsx",".d.ts"],cts:[".cts",".d.cts"],mts:[".mts",".d.mts"]},Me=l(e=>{const t=[...Z.ts],i=[...Z.cts],n=[...Z.mts];return e!=null&&e.allowJs&&(t.push(".js",".jsx"),i.push(".cjs"),n.push(".mjs")),[...t,...i,...n]},"getSupportedExtensions"),Ge=l(e=>{const t=[];if(!e)return t;const{outDir:i,declarationDir:n}=e;return i&&t.push(i),n&&t.push(n),t},"getDefaultExcludeSpec"),ae=l(e=>e.replaceAll(/[.*+?^${}()|[\]\\]/g,String.raw`\$&`),"escapeForRegexp"),ze=["node_modules","bower_components","jspm_packages"],q=`(?!(${ze.join("|")})(/|$))`,Qe=/(?:^|\/)[^.*?]+$/,ge="**/*",W="[^/]",K="[^./]",me=process.platform==="win32",He=l(({config:e,path:t},i=Je())=>{if("extends"in e)throw new Error("tsconfig#extends must be resolved. Use getTsconfig or parseTsconfig to resolve it.");if(!a.isAbsolute(t))throw new Error("The tsconfig path must be absolute");me&&(t=B(t));const n=a.dirname(t),{files:o,include:s,exclude:r,compilerOptions:f}=e,u=o==null?void 0:o.map(b=>S(n,b)),p=Me(f),T=i?"":"i",O=(r||Ge(f)).map(b=>{const $=S(n,b),U=ae($).replaceAll(String.raw`\*\*/`,"(.+/)?").replaceAll(String.raw`\*`,`${W}*`).replaceAll(String.raw`\?`,W);return new RegExp(`^${U}($|/)`,T)}),v=o||s?s:[ge],A=v?v.map(b=>{let $=S(n,b);Qe.test($)&&($=S($,ge));const U=ae($).replaceAll(String.raw`/\*\*`,`(/${q}${K}${W}*)*?`).replaceAll(/(\/)?\\\*/g,(E,c)=>{const m=`(${K}|(\\.(?!min\\.js$))?)*`;return c?`/${q}${K}${m}`:m}).replaceAll(/(\/)?\\\?/g,(E,c)=>{const m=W;return c?`/${q}${m}`:m});return new RegExp(`^${U}$`,T)}):void 0;return b=>{if(!a.isAbsolute(b))throw new Error("filePath must be absolute");if(me&&(b=B(b)),u!=null&&u.includes(b))return e;if(!(!p.some($=>b.endsWith($))||O.some($=>$.test(b)))&&A&&A.some($=>$.test(b)))return e}},"createFilesMatcher");export{He as createFilesMatcher,Ie as createPathsMatcher,De as getTsconfig,fe as parseTsconfig};