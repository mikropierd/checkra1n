const i=new WeakMap;let l=0;export default function o(t){const c=typeof t,s=t&&t.constructor,f=s==Date;if(Object(t)===t&&!f&&s!=RegExp){let e=i.get(t);if(e)return e;e=++l+"~",i.set(t,e);let n;if(s==Array){for(e="@",n=0;n<t.length;n++)e+=o(t[n])+",";i.set(t,e)}else if(s==Object){e="#";const u=Object.keys(t).sort();for(;(n=u.pop())!==void 0;)t[n]!==void 0&&(e+=n+":"+o(t[n])+",");i.set(t,e)}return e}return f?t.toJSON():c=="symbol"?t.toString():c=="string"?JSON.stringify(t):""+t}