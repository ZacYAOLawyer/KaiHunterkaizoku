import random

def video_analysis(video_url: str):
    return {
        "video_url": video_url,
        "views": random.randint(100, 100000),
        "likes": random.randint(1, 5000),
        "shares": random.randint(1, 2000),
        "CPI": round(random.uniform(0, 10), 2),
        "CMA": "建議合作品牌 / 聯盟行銷"
    }
