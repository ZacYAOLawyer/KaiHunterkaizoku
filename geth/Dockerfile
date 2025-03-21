# geth/Dockerfile
FROM ethereum/client-go:latest

WORKDIR /root

COPY genesis.json /root/genesis.json

# 建立資料夾 .ethereum
RUN mkdir -p /root/.ethereum

# 用 genesis.json 初始化私有鏈
RUN geth init /root/genesis.json --datadir /root/.ethereum

# 開放埠：30303(p2p), 8545(RPC)
EXPOSE 30303 30303/udp 8545

# 這裡預設以 --dev 模式啟動
CMD ["geth",
     "--datadir", "/root/.ethereum",
     "--networkid", "12345",
     "--http",
     "--http.addr", "0.0.0.0",
     "--http.port", "8545",
     "--http.api", "personal,eth,net,web3",
     "--allow-insecure-unlock",
     "--dev"]
