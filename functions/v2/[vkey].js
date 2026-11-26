export async function onRequestGet({ request }) {
  const { url } = request;
  const newUrl = new URL(url);
  const referer = request.headers.get('Referer') || '';
  
  const isWhitelisted = ['p.wpzy.cc', 'y.wpzy.cc', 'wpzy.cc'].some(d => referer.includes(d));

  if (isWhitelisted) {
    // ⚠️ 核心修改：保留完整的 /v2/ 路径
    let filename = newUrl.pathname; 
    // 如果你的服务器不需要 /v2/，就把上面那行改成：let filename = newUrl.pathname.replace(/^\/v2\//, '');

    // ⚠️ 核心修改：使用 HTTPS 协议，绝对不要用 HTTP，否则 Cloudflare 直接拦
    const defaultUrl = `https://proxy.wpzy.cc${filename}`; 
    const basicAuth = 'Basic ' + btoa('youtairen:yuyu197917');

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500); 
      
      const res = await fetch(defaultUrl, {
        headers: { 
            'Authorization': basicAuth, 
            'Accept': 'image/*',
            'User-Agent': 'Mozilla/5.0'
        },
        signal: controller.signal
      });
      clearTimeout(timer);

      if (res.ok) return res;
      
      // 直接暴露错误方便排查
      return new Response(`自建服务器返回错误代码: ${res.status}`, { status: 502 });
      
    } catch (e) {
      return new Response(`fetch报错: ${e.name} - ${e.message}`, { status: 502 });
    }
  }

  // 兜底逻辑
  return fetch(`https://i${Math.floor(Math.random() * 4)}.wp.com/${newUrl.hostname}${newUrl.pathname.replace('/v2', 'vh-img-proxy')}${newUrl.search}`, {
    headers: {
      'referer': 'https://www.vhimg.com',
      'User-Agent': 'Mozilla/5.0'
    }
  });
}
