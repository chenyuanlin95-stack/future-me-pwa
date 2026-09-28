import {initialState} from './model.js';
let db;
export async function openStorage(){
  db=await new Promise((resolve,reject)=>{const req=indexedDB.open('future-me-v1',1);req.onupgradeneeded=()=>{req.result.createObjectStore('state');req.result.createObjectStore('media');};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
  return readState();
}
export function readState(){return new Promise((resolve,reject)=>{const r=db.transaction('state').objectStore('state').get('main');r.onsuccess=()=>resolve(r.result||initialState());r.onerror=()=>reject(r.error);});}
// 所有状态和媒体写入同一事务。未来可在这里替换成 Supabase adapter。
export function mutate(change,media){return new Promise((resolve,reject)=>{
  const tx=db.transaction(['state','media'],'readwrite');let state,result,failed;
  const r=tx.objectStore('state').get('main');
  r.onsuccess=()=>{try{state=r.result||initialState();result=change(state);if(media)tx.objectStore('media').put(media.blob,media.key);tx.objectStore('state').put(state,'main');}catch(e){failed=e;tx.abort();}};
  tx.oncomplete=()=>resolve({state,result});tx.onerror=()=>reject(failed||tx.error);tx.onabort=()=>reject(failed||tx.error||Error('保存失败，请重试。'));
});}
export function getMedia(key){return new Promise((resolve,reject)=>{const r=db.transaction('media').objectStore('media').get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
