# 📌 **Real-Time DEX Data Aggregation Service**

### **(Meme Coin Aggregator — EternaLabs Backend Task)**

This project implements a **high-performance real-time token aggregation service**, inspired by platforms like **Axiom Trade / DexScreener**.
It aggregates live token data from **multiple DEX sources**, merges them intelligently, caches snapshots, and pushes **real-time updates** via WebSockets.

The system is engineered to handle **rate-limited APIs**, **real-time UI consumption**, and **scalable filtering + pagination**.

---

# 🚀 **Deliverables Checklist**

| Deliverable                                       | Status      | Link                       |
| ------------------------------------------------- | ----------- | -------------------------- |
| **GitHub Repository (Clean Commits)**             | ✅ Completed | *(Your Repo URL)*          |
| **Public Deployment (Render / Railway / Fly.io)** | ✅ Completed     | *(Add URL Here)*           |
| **Documentation (README)**                        | ✅ Included  | This file                  |
| **Video Demo (1–2 minutes)**                      | ✅ Completed | *(YouTube Link Here)*      |
| **Postman/Insomnia Collection**                   | ✔ Required  | *(Add collection to repo)* |
| **10+ Unit/Integration Tests**                    | ✅ Completed  | `tests/*.test.ts`          |

---

# 🧠 **System Overview**

### **High-Level Architecture**

```
     ┌──────────────┐       ┌──────────────────────────┐
     │ Scheduler     │       │ Dex Clients (API Layer)  │
     │ (Every 10 sec)│──────▶│ DexScreener + GeckoTerminal API    │
     └───────▲──────┘       └──────────────▲───────────┘
             │                              │
             │                              │ Raw Data
             │                       ┌──────┴────────┐
             │                       │ Aggregator     │
             │                       │ (Normalize +   │
             │                       │  Merge + Diff) │
             │                       └──────┬────────┘
             │                              │ Snapshot + Diffs
             │                         ┌────┴───────────┐
             │                         │ Redis (Upstash) │
             │                         │ Cache + Pub/Sub │
             ▼                         └──────┬──────────┘
     ┌────────────────┐                   Push Updates
     │  REST API      │◀──────────────────────────────┐
     │ /tokens        │                               │
     └─────▲──────────┘                               │
           │                                          │
           │ Initial Snapshot                         │
           │                                          │
     ┌─────┴────────┐               ┌──────────────────────────────┐
     │ WebSocket     │◀──────────────│ Clients (Browser Tabs, UI)   │
     │ upd events    │ Real-time diff│ receive only changed tokens  │
     └──────────────┘               └──────────────────────────────┘
```

---

# 🧩 **Features**

### ✅ Real-time DEX aggregation

Fetches and merges data from:

* **DexScreener**
* **GeckoTerminal (Search API)**

### ✅ High-performance caching

Redis (Upstash) stores:

* Latest snapshot → `tokens:snapshot`
* Latest diffs → `tokens:diffs`

### ✅ WebSocket updates

Clients receive only deltas (`upd` event), not full lists → extremely efficient.

### ✅ Filtering, Sorting, Pagination

REST API:

* `/tokens?sort=volume&limit=20&cursor=xyz`
* Computes nextCursor for infinite scroll


### ✅ Clean modular codebase

Fully separated:

* Routes
* Scheduler
* Aggregator
* WebSocket manager
* Cache layer
* Retry utilities

---

# 📁 **Project Structure**

```
/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config.ts
│   ├── scheduler.ts
│   ├── routes/
│   │   └── tokens.ts
│   ├── services/
│   │   ├── agg.ts
│   │   ├── dexClient.ts
│   │   ├── cache.ts
│   │   └── webSockets.ts
│   ├── utils/
│   │   ├── backoff.ts
│   │   └── merge.ts
│   │   └── cursor.ts
├── tests/
│   └── api.test.ts
├── package.json
└── .env
```

---

# ⚙️ **Environment Setup**

### 1️⃣ **Clone repository**

```sh
git clone <your-repo-url>
cd eternalabs_backend_task_1
```

### 2️⃣ **Install dependencies**

```sh
npm install
```

### 3️⃣ **Create `.env`**

```
PORT=5251
REDIS_URL=https://alive-pelican-21300.upstash.io
REDIS_TOKEN=xxxxx
POLL_INTERVAL=10000
TTL_SEC=30
```

### 4️⃣ **Run server**

```sh
npm run start
```

---

# 🧪 **Testing**

Run Jest test suite:

```sh
npm test
```

Tests include:

* Sorting logic
* Filtering
* Cursor pagination
* Redis mock caching
* Aggregator merge logic
* Backoff logic

---

# 🔗 **REST API Documentation**

## **GET /tokens**

### Query Parameters:

| Parameter | Type   | Default  | Description                      |
| --------- | ------ | -------- | -------------------------------- |
| `limit`   | number | 20       | Max 100                          |
| `sort`    | string | "volume" | volume, market_cap, price_change |
| `order`   | string | "desc"   | asc / desc                       |
| `period`  | string | "24h"    | 1h / 24h / 7d                    |
| `cursor`  | string | ""       | For pagination                   |
| `min_liq` | number | 0        | Minimum liquidity                |
| `min_vol` | number | 0        | Minimum 24h volume               |

### Example:

```
GET /tokens?sort=price_change&period=1h&limit=5&min_liq=1000
```

### Response Example:

```json
{
  "items": [
    {
      "token_address": "So1111...",
      "token_name": "Solana",
      "price_sol": 148,
      "volume_sol": 120000,
      "sources": ["dexscreener", "geckoterminal"]
    }
  ],
  "nextCursor": "MjA="
}
```

---

# 🔗 **WebSocket API**

### Connect:

```
ws://<host>:5251
```

### Incoming Events:

| Event         | Description         |
| ------------- | ------------------- |
| `initialData` | Full token snapshot |
| `upd`         | Only changed tokens |

### Example client:

```js
const ws = io("ws://localhost:5251");
ws.on("initialData", d => console.log("Initial:", d));
ws.on("upd", d => console.log("Update:", d));
```

---

# 🧠 **Design Decisions Explained**

### 1. **Polling instead of streaming**

DEX APIs do **not** provide WebSockets.
Polling + diffing gives predictable, rate-limited load.

### 2. **Merging rules**

If a token appears on both DEXs:

* Volume = sum
* Market cap = max
* Price = latest non-null
* Sources = union

### 4. **Real-time efficiency**

WebSockets send **only diffs** → minimal bandwidth.

---

# 🧪 **Load Testing Instructions**

### Verify high-performance response:

```
ab -n 100 -c 10 http://localhost:5251/tokens
```

---

# 🚀 **Deployment Instructions**

```
https://your-host.com/tokens
ws://your-host.com
```

---

# 🙌 **Author**

**Prashant Agrawal**
IIIT Allahabad