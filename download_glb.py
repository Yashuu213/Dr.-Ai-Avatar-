import urllib.request
import urllib.parse
import json
import ssl

def resolve_dns(domain):
    print(f"Resolving {domain} via Google DoH...")
    url = f"https://dns.google/resolve?name={domain}&type=A"
    req = urllib.request.Request(url, headers={'Accept': 'application/dns-json'})
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        for answer in data.get('Answer', []):
            if answer['type'] == 1: # A record
                return answer['data']
    return None

ip = resolve_dns('d1a370nemizbjq.cloudfront.net')
if not ip:
    print("Could not resolve IP")
    exit(1)

print(f"Resolved to IP: {ip}")

url_with_ip = f"https://{ip}/4030d32c-74a6-43ad-8d34-d022b3de9b5e.glb"
print(f"Downloading from {url_with_ip} (Host: d1a370nemizbjq.cloudfront.net)...")

req = urllib.request.Request(url_with_ip, headers={'Host': 'd1a370nemizbjq.cloudfront.net'})
context = ssl._create_unverified_context()

try:
    with urllib.request.urlopen(req, context=context) as response:
        with open(r'd:\Cepilabs works\Ai Avtar\frontend\public\models\doctor.glb', 'wb') as f:
            f.write(response.read())
    print("Download successful!")
except Exception as e:
    print(f"Failed: {e}")
