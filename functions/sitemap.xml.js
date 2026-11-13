export async function onRequest({request}){
const API='https://rivo-api.aasifhusenaasifkhan.workers.dev',o=new URL(request.url).origin,ids=await(await fetch(API+'/api/ids')).json();
return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${o}/</loc></url>${ids.map(i=>`<url><loc>${o}/anime/${String(i.name).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}-${i.id}</loc></url>`).join('')}</urlset>`,{headers:{'content-type':'application/xml'}})}
