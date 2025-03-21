import os
from web3 import Web3
from solcx import compile_standard
from dotenv import load_dotenv

load_dotenv()

RPC_URL = os.getenv("BLOCKCHAIN_RPC_URL", "http://geth:8545")
PRIVATE_KEY = os.getenv("BLOCKCHAIN_PRIVATE_KEY", "0xABC123")

w3 = Web3(Web3.HTTPProvider(RPC_URL))
account = w3.eth.account.from_key(PRIVATE_KEY)

# 假設 contract 在 ../contracts/KaiKaiShieldStorage.sol
CONTRACT_PATH = "/app/contracts/KaiKaiShieldStorage.sol"

def compile_contract():
    with open(CONTRACT_PATH, "r") as f:
        source = f.read()
    compiled = compile_standard({
        "language": "Solidity",
        "sources": {
            "KaiKaiShieldStorage.sol": {
                "content": source
            }
        },
        "settings": {
            "outputSelection": {
                "*": {
                    "*": ["abi", "metadata", "evm.bytecode", "evm.sourceMap"]
                }
            }
        }
    })
    return compiled

def deploy_contract():
    compiled = compile_contract()
    bytecode = compiled["contracts"]["KaiKaiShieldStorage.sol"]["KaiKaiShieldStorage"]["evm"]["bytecode"]["object"]
    abi = compiled["contracts"]["KaiKaiShieldStorage.sol"]["KaiKaiShieldStorage"]["abi"]

    contract = w3.eth.contract(abi=abi, bytecode=bytecode)
    nonce = w3.eth.get_transaction_count(account.address)
    tx = contract.constructor().buildTransaction({
        'from': account.address,
        'nonce': nonce,
        'gas': 5000000,
        'gasPrice': w3.toWei('1', 'gwei')
    })
    signed_tx = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    address = receipt.contractAddress
    print(f"Contract deployed at {address}")
    # 可以把地址存到 .env 或 DB
    return address

# 示例：把檔案指紋 & ipfs hash 存到合約
def store_record(fingerprint: str, ipfs_hash: str):
    # 需先自行拿到合約地址
    contract_address = os.getenv("CONTRACT_ADDRESS", "0x...")  
    compiled = compile_contract()
    abi = compiled["contracts"]["KaiKaiShieldStorage.sol"]["KaiKaiShieldStorage"]["abi"]
    contract = w3.eth.contract(address=contract_address, abi=abi)

    nonce = w3.eth.get_transaction_count(account.address)
    tx = contract.functions.storeRecord(fingerprint, ipfs_hash).buildTransaction({
        'from': account.address,
        'nonce': nonce,
        'gas': 500000,
        'gasPrice': w3.toWei('1', 'gwei')
    })
    signed_tx = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    return w3.toHex(receipt.transactionHash)

def upload_to_eth(data: bytes):
    # 範例：把檔案 bytes 當作 data 寫入一筆交易
    nonce = w3.eth.get_transaction_count(account.address)
    tx = {
        'nonce': nonce,
        'to': account.address,
        'value': 0,
        'gas': 210000,
        'gasPrice': w3.toWei('1', 'gwei'),
        'data': data
    }
    signed_tx = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    return w3.toHex(tx_hash)
