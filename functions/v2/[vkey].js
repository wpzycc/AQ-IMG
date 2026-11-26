export async function onRequestGet({ request, env }) {
  const { url, method, headers, body } = request;
  const newUrl = new URL(url);
  const referer = headers.get('Referer') || headers.get('Origin') || '';
  
  // 1. 白名单判断
  const allowedOrigins = ['p.wpzy.cc', 'y.wpzy.cc', 'wpzy.cc'];
  const isWhitelisted = allowedOrigins.some(domain => referer.includes(domain));

  // 2. 白名单逻辑：走自建服务器
  if (isWhitelisted) {
    const serverIP = env?.DEFAULT_SERVER_IP || '103.178.56.182';
    const serverPort = env?.DEFAULT_SERVER_PORT || '3333';
    const user = env?.DEFAULT_USER || 'youtairen';
    const pass = env?.DEFAULT_PASS || 'yuyu197917';
    
    // 提取文件名 (比如 /v2/e2kqwUB.jpeg 变成 e2kqwUB.jpeg)
    const filename = newUrl.pathname.replace(/^\/v2\//, '');
    const defaultUrl = `http://${serverIP}:${serverPort}/${filename}`;
    const basicAuth = 'Basic ' + btoa(`${user}:${pass}`);

    try {
      // 尝试请求你的自建服务器（设置 3 秒超时）
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);
      
      const res = await fetch(defaultUrl, {
        method,
        headers: { ...headers, 'Authorization': basicAuth },
        signal: controller.signal
      });
      clearTimeout(timer);
      
      // 如果自建服务器正常返回，直接结束
      if (res.ok) return res;
      throw new Error(`Self-hosted status: ${res.status}`);
    } catch (error) {
      // 如果自建挂了或超时，不报错，继续往下走 WP 兜底
      console.warn('自建服务器失败，切换 WP CDN 兜底:', error.message);
    }
  }

  // 3. 兜底逻辑：不在白名单，或者自建挂了，走你原来的 WP CDN 逻辑
  return fetch(`https://i${Math.floor(Math.random() * 4)}.wp.com/${newUrl.hostname}${newUrl.pathname.replace('/v2', 'vh-img-proxy')}${newUrl.search}`, {
    method,
    headers: {
      ...headers,
      referer: 'https://www.vhimg.com',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    },
    body
  });
}
