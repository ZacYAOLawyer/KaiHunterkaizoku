import requests
from bs4 import BeautifulSoup

def crawl_social(platform, keyword):
    if platform == 'youtube':
        url = f"https://www.youtube.com/results?search_query={keyword}"
    elif platform == 'tiktok':
        url = f"https://www.tiktok.com/search?q={keyword}"
    elif platform == 'facebook':
        url = f"https://www.facebook.com/search/videos/?q={keyword}"
    elif platform == 'instagram':
        url = f"https://www.instagram.com/explore/tags/{keyword}/"
    else:
        return {"error": "Invalid platform"}

    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, 'html.parser')
    return {"raw_data": soup.get_text()[:300]}
