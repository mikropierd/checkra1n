const e=globalThis.Blob,o=globalThis.File,a=globalThis.FormData,s=globalThis.Headers,t=globalThis.Request,h=globalThis.Response,i=globalThis.AbortController,l=globalThis.fetch||(()=>{throw new Error("[node-fetch-native] Failed to fetch: `globalThis.fetch` is not available!")});export{i as AbortController,e as Blob,o as File,a as FormData,s as Headers,t as Request,h as Response,l as default,l as fetch};