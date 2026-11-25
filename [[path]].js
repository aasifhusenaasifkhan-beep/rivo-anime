// /anime/<naam>-<id> : Google ko har post ka apna title, description, canonical aur structured data milta hai.
// Site ka dikhna/kaam karna wahi rehta (index.html + JS), sirf <head> aur ek text fallback server se bharte hain.
const API='https://rivo-api.aasifhusenaasifkhan.workers.dev';
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const sl=(n,id)=>String(n).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'-'+id;
export async function onRequest({request,env}){
 const u=new URL(request.url),m=u.pathname.match(/-(\d+)\/?$/);
 const page=await env.ASSETS.fetch(new URL('/',request.url));
 if(!m)return page;
 let d;
 try{const r=await fetch(API+'/api/post/'+m[1],{cf:{cacheTtl:300,cacheEverything:true}});if(r.status==404)throw 404;if(!r.ok)throw 0;d=await r.json()}catch(e){if(e!==404)return page;d=null}
 const html=await page.text(),hd={'content-type':'text/html; charset=utf-8'};
 const p=d&&d.post;
 if(!p||!p.name)return new Response(html,{status:404,headers:hd});
 const can=u.origin+'/anime/'+sl(p.name,p.id),title=p.name+' | Rivo Anime',
  syn=String(p.synopsis||'').replace(/\s+/g,' ').trim(),
  desc=(syn?syn.slice(0,140)+(syn.length>140?'...':'')+' ':'')+'Download '+p.name+' Hindi Dubbed & Subbed all episodes on Rivo Anime.',
  genres=String(p.genres||'').split(' ').filter(Boolean),
  ld=JSON.stringify({'@context':'https://schema.org','@type':'TVSeries',name:p.name,image:p.image,description:desc,genre:genres,...(p.year?{datePublished:p.year}:{}),url:can}).replace(/</g,'\\u003c');
 const extra=`<link rel="canonical" href="${esc(can)}"><meta property="og:type" content="video.tv_show"><meta property="og:site_name" content="Rivo Anime"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:image" content="${esc(p.image)}"><meta property="og:url" content="${esc(can)}"><meta name="twitter:card" content="summary_large_image"><script type="application/ld+json">${ld}</script>`;
 const body=`<h1>${esc(p.name)}</h1>${p.category?`<p>${esc(p.category)}</p>`:''}${genres.length?`<p>${esc(genres.join(', '))}</p>`:''}${syn?`<p>${esc(syn)}</p>`:''}`;
 const out=html
  .replace(/<title>[^<]*<\/title>/,()=>`<title>${esc(title)}</title>`)
  .replace(/<meta name="description" content="[^"]*">/,()=>`<meta name="description" content="${esc(desc)}">`)
  .replace('</head>',()=>extra+'</head>')
  .replace('<main id=v></main>',()=>`<main id=v>${body}</main>`);
 return new Response(out,{status:200,headers:{...hd,'cache-control':'public, max-age=300'}});
}
