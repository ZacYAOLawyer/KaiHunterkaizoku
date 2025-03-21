# main.py
import uvicorn
from fastapi import FastAPI, UploadFile, File
from blockchain import upload_to_eth, deploy_contract, store_record
from crawler import crawl_social
from analytics import video_analysis

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "FastAPI is healthy"}

@app.post("/blockchain/upload")
async def blockchain_upload(file: UploadFile = File(...)):
    content = await file.read()
    # 將檔案bytes上傳區塊鏈 (寫入交易 data)
    tx_hash = upload_to_eth(content)
    return {"tx_hash": tx_hash}

@app.post("/blockchain/storeRecord")
def store_on_chain(fingerprint: str, ipfs_hash: str):
    # 呼叫 store_record(fingerprint, ipfs_hash)
    tx_hash = store_record(fingerprint, ipfs_hash)
    return {"tx_hash": tx_hash}

@app.get("/crawl/{platform}")
def crawl_api(platform: str, keyword: str):
    return crawl_social(platform, keyword)

@app.post("/analyze")
def analyze(video_url: str):
    return video_analysis(video_url)

@app.post("/deploy_contract")
def deploy_sc():
    contract_address = deploy_contract()
    return {"contract_address": contract_address}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
