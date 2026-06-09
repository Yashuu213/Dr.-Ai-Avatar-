import urllib.request
import json
import time

def search_github(query):
    url = f"https://api.github.com/search/code?q={query}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        print(f"Error: {e}")
        return None

# Search for readyplayer me avatar or doctor glb
print("Searching for doctor models...")
data = search_github("doctor+extension:glb+size:>1000000")
if data and data.get('items'):
    for item in data['items']:
        repo = item['repository']['full_name']
        path = item['path']
        print(f"Found: https://raw.githubusercontent.com/{repo}/main/{path}")
else:
    print("No doctor models found.")

print("\nSearching for realistic avatars...")
data2 = search_github("avatar+extension:glb+size:>2000000")
if data2 and data2.get('items'):
    for item in data2['items'][:5]:
        repo = item['repository']['full_name']
        path = item['path']
        print(f"Found: https://raw.githubusercontent.com/{repo}/main/{path}")
