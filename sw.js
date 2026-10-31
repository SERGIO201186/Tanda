const C='tanda-v3',F=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(F.map(u=>c.add(u).catch(()=>{})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
 e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(C).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request).then(m=>m||caches.match('./index.html'))))});

self.addEventListener('push',e=>{
  let d={};try{const j=e.data.json();d=j.data||j.notification||j}catch(x){}
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(L=>{
    L.forEach(c=>c.postMessage({type:'push'}));
    if(L.some(c=>c.visibilityState==='visible'))return; // si la app está abierta, se actualiza sola
    return self.registration.showNotification(d.title||'Tanda',{body:d.body||'',icon:'icon-192.png',badge:'icon-192.png',tag:d.tag||'tanda',renotify:true,vibrate:[200,100,200],data:{url:d.url||'./'}});
  }));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(L=>{
    for(const c of L){if('focus' in c)return c.focus()}
    return self.clients.openWindow((e.notification.data&&e.notification.data.url)||'./');
  }));
});
