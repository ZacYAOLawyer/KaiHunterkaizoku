# fastapi/Dockerfile

FROM python:3.10-slim

# 新增系統依賴
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    libpq-dev \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
