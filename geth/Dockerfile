FROM ethereum/client-go:latest

WORKDIR /root

COPY genesis.json /root/genesis.json

EXPOSE 30303 30303/udp 8545

CMD ["geth", "--datadir", "/root/.ethereum", "--networkid", "12345", "--http", "--http.addr", "0.0.0.0", "--http.port", "8545", "--http.api", "personal,eth,net,web3", "--allow-insecure-unlock", "--dev"]