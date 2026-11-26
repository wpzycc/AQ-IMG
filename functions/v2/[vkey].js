export async function onRequestGet({ request }) {
  const { url } = request;
  const newUrl = new URL(url);
  const referer = request.headers.get('Referer') || '';
  
  const isWhitelisted = ['p.wpzy.cc', 'y.wpzy.cc', 'wpzy.cc'].some(d => referer.includes(d));

  if (isWhitelisted) {
    const filename = newUrl.pathname.replace(/^\/v2\//, '');
    // 这里使用你的新域名和 3333 端口
    const defaultUrl = `http://proxy.wpzy.cc/${filename}`; 
    const basicAuth = 'Basic ' + btoa('youtairen:yuyu197917');

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500); // 2.5 秒超时
      
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
      
    } catch (e) {
      // 这里把错误信息输出到图片，方便你排查（比如看到 502 还是超时）
      // 如果你确认没问题，可以把这行删掉，让它静默走兜底
      return new Response(`自建服务器请求失败: ${e.message}`, { status: 502 });
    }
  }

  // 兜底逻辑：走 WP CDN
  return fetch(`https://i${Math.floor(Math.random() * 4)}.wp.com/${newUrl.hostname}${newUrl.pathname.replace('/v2', 'vh-img-proxy')}${newUrl.search}`, {
    headers: {
      'referer': 'https://www.vhimg.com',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
}
