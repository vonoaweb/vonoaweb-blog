"""Avisa a IndexNow (Bing, y con eso ChatGPT y Copilot) de las paginas que
cambiaron en un push. Lo llama el workflow despues de publicar.

Uso: python3 .github/indexnow.py <landing|blog> [sha_anterior] [--dry-run]
"""
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.request

KEY = '52228c04413911c45ee983da854c55ef'
SITES = {
    'landing': 'https://vonoaweb.com',
    'blog': 'https://blog.vonoaweb.com',
}


def git(*args):
    return subprocess.run(['git', *args], capture_output=True, text=True, check=True).stdout


def changed_files(before):
    """Archivos agregados o modificados desde `before` (o en el ultimo commit)."""
    valid = before and set(before) != {'0'}
    if valid:
        try:
            git('cat-file', '-e', before + '^{commit}')
        except subprocess.CalledProcessError:
            valid = False
    rng = f'{before}..HEAD' if valid else 'HEAD~1..HEAD'
    out = git('diff', '--name-only', '--diff-filter=AM', rng)
    return [f for f in out.splitlines() if f]


def landing_urls(files, base):
    urls = []
    for f in files:
        if not f.endswith('.html') or f.startswith('qr/') or not os.path.exists(f):
            continue
        with open(f, encoding='utf-8') as fh:
            if re.search(r'<meta name="robots" content="[^"]*noindex', fh.read()):
                continue  # gracias, 404, paginas viejas que redirigen
        path = '/' + f
        if path.endswith('/index.html'):
            path = path[:-len('index.html')]
        urls.append(base + path)
    return urls


def post_url(md, base):
    with open(md, encoding='utf-8') as fh:
        m = re.search(r'^slug:\s*"?([^"\n]+)"?', fh.read(), re.M)
    slug = m.group(1).strip() if m else os.path.basename(md)[:-3]
    return f'{base}/posts/{slug}/'


def blog_urls(files, base):
    posts_dir = 'content/posts'
    post_files = [f for f in files if f.startswith(posts_dir + '/') and f.endswith('.md')]
    # Si cambio el diseno o la configuracion, cambian todas las paginas
    template_change = any(f.startswith(('layouts/', 'static/css/')) or f == 'hugo.toml' for f in files)
    if template_change:
        post_files = [os.path.join(posts_dir, f) for f in sorted(os.listdir(posts_dir)) if f.endswith('.md')]
    urls = [post_url(f, base) for f in post_files if os.path.exists(f)]
    if urls:
        urls.insert(0, base + '/')
    return urls


def main():
    site = sys.argv[1]
    before = next((a for a in sys.argv[2:] if not a.startswith('--')), '')
    dry = '--dry-run' in sys.argv
    base = SITES[site]
    files = changed_files(before)
    urls = landing_urls(files, base) if site == 'landing' else blog_urls(files, base)
    if not urls:
        print('Sin paginas nuevas o modificadas: no se avisa a IndexNow.')
        return
    payload = {
        'host': base.split('//')[1],
        'key': KEY,
        'keyLocation': f'{base}/{KEY}.txt',
        'urlList': urls[:10000],
    }
    print(f'{len(urls)} URL(s):', *urls, sep='\n  ')
    if dry:
        print(json.dumps(payload, indent=2))
        return
    req = urllib.request.Request(
        'https://api.indexnow.org/indexnow',
        data=json.dumps(payload).encode(),
        headers={'Content-Type': 'application/json; charset=utf-8'},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            print('IndexNow respondio', r.status)
    except urllib.error.HTTPError as e:
        # 200 y 202 son exito; cualquier otra cosa se reporta pero no tumba el deploy
        print(f'::warning::IndexNow respondio {e.code}: {e.read()[:300]!r}')
    except urllib.error.URLError as e:
        print(f'::warning::No se pudo contactar a IndexNow: {e.reason}')


if __name__ == '__main__':
    main()
