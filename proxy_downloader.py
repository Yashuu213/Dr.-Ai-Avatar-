import urllib.request
import json
import random
import os

url_to_download = "https://models.readyplayer.me/64b6695b28795c65d642879d.glb"
output_path = r'd:\Cepilabs works\Ai Avtar\frontend\public\models\doctor.glb'

print("Fetching free proxies...")
proxy_api_url = "https://proxylist.geonode.com/api/proxy-list?limit=50&page=1&sort_by=lastChecked&sort_type=desc&protocols=http,https"
req = urllib.request.Request(proxy_api_url, headers={'User-Agent': 'Mozilla/5.0'})
proxies = []
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        for p in data['data']:
            proxies.append(f"{p['protocols'][0]}://{p['ip']}:{p['port']}")
except Exception as e:
    print("Failed to fetch proxies:", e)
    exit(1)

print(f"Found {len(proxies)} proxies. Trying to download...")
random.shuffle(proxies)

success = False
for proxy_url in proxies:
    print(f"Trying proxy {proxy_url}...")
    proxy_handler = urllib.request.ProxyHandler({'http': proxy_url, 'https': proxy_url})
    opener = urllib.request.build_opener(proxy_handler)
    req = urllib.request.Request(url_to_download, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with opener.open(req, timeout=10) as response:
            content = response.read()
            if len(content) > 100000: # Ensure it's a valid GLB (>100KB)
                with open(output_path, 'wb') as f:
                    f.write(content)
                print(f"Success! Downloaded {len(content)} bytes via {proxy_url}")
                success = True
                break
    except Exception as e:
        print(f"  Failed: {e}")

if not success:
    print("All proxies failed.")
