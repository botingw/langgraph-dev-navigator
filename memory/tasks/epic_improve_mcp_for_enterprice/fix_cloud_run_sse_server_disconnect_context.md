我直接幫你整理成一份可以丟給 AI coding assistant 的「功能規格 + 技術背景」。你只要 copy 貼給 Cline / 其他助手就行。

---

## 一、背景與現狀（Context）

### 1. 架構概述

* 你有一個基於 **FastMCP** 的 **MCP server**，支援兩種 transport：

  * `TRANSPORT=stdio`
  * `TRANSPORT=sse`
* SSE 模式時，server 會：

  * 在 `/sse` 建立 **Server-Sent Events** 連線；
  * 在 SSE stream 裡發 `event: endpoint`，內容是 `data: /messages/?session_id=...`
  * client 再用這個 `session_id` 對 `/messages` 發 JSON-RPC（例如 `tools/list`）。
* 部署有兩種環境：

  1. **Local Docker**

     * `uvicorn` 綁 `0.0.0.0:8051`
     * `curl http://localhost:8051/sse`：

       * 收到 `event: endpoint`
       * 之後持續看到 `: ping - ...`（server 會發 heartbeat）
     * `POST /messages?session_id=...`

       * `{}` -> `400`（JSON-RPC body 錯，route 存在）
       * `tools/list` -> `202 Accepted`（JSON-RPC 被接受，結果由 SSE stream 推回）
  2. **Cloud Run（remote）**

     * URL: `https://mcp-crawl4ai-rag-....run.app`
     * `curl https://.../sse`：

       * 收到 `event: endpoint`
       * **看不到任何 `: ping`**
     * `POST /messages?session_id=...`

       * `{}` -> `400`
       * `tools/list` -> `202 Accepted`
     * Cloud Run logs 中，每 ~6–7 秒出現：

       * `GET 200 ... /sse`
       * `Truncated response body. Usually implies that the request timed out or the application exited before the response was finished.`

### 2. 客戶端行為

* **本地 / stdio**：

  * Cline / AI 助手 連 stdio transport 時工作正常。
* **本地 / SSE**：

  * Cline 連 `http://localhost:8051/sse` 時工作正常（因為有穩定 ping）。
* **Cloud Run / SSE**：

  * Cline MCP config：

    ```jsonc
    "crawl4ai-rag-sse-remote": {
      "disabled": false,
      "timeout": 600,
      "type": "sse",
      "url": "https://mcp-crawl4ai-rag-....run.app/sse"
    }
    ```
  * Cline 一直報：

    * `MCP error -32001: Request timed out`
  * MCP Inspector 用：

    * Transport: `SSE`
    * URL: `https://.../sse`
    * Connection: `Via Proxy`
    * 也是連不到，並觸發 Cloud Run 的 truncate log。

### 3. 日誌差異

* local log 有類似：

  * `✓ Knowledge graph validator initialized`
  * `Initializing Neo4j connection...`
  * `Creating constraints and indexes...`
* remote Cloud Run log **目前看不到這些 INFO log**（只看到部份 error log）。
* Python 端這些 log 是透過 `logger.info(...)` 打出來的。

---

## 二、從零推導的問題模型（First Principles）

### 1. 我們已經排除的東西

**不是**以下問題：

1. **路徑錯誤**

   * `/sse` 在 local & remote 都是 `200 text/event-stream`。
   * `/messages` 在 local & remote 都存在：

     * `{}` -> `400`
     * 合法 JSON-RPC (`tools/list`) -> `202 Accepted`
2. **部署 image 完全錯版**

   * remote 現在行為與本地一致（`/sse`+`/messages`+`tools/list` 的協議）。
3. **TLS / DNS / HTTP 基礎連線問題**

   * `curl -v https://.../sse`、`/messages` 都能建立正確連線。

所以「MCP server 是否有掛？路徑是否正確？」這一層是 OK 的。

### 2. 真正還存在的問題

1. **Local vs Remote SSE 行為差異：**

   * local `/sse`：會開始持續 `: ping`（heartbeat）
   * remote `/sse`：只看到 `event: endpoint`，然後 connection 在 ~6–7 秒內被切斷（從 Cloud Run truncated log 可見）

2. **Cloud Run 對 `/sse` 的觀察：**

   * 每 6–7 秒就有一條新的 `GET /sse`
   * 每次都伴隨一條 `Truncated response body`
     → 說明：
   * SSE 連線被建立了，但 response 還在 streaming 就被強制中斷
   * 這符合「HTTP/2 idle timeout / client 主動關連線」模式

3. **Cline / MCP Inspector 的錯誤：**

   * 它們依賴這條 SSE 流來接收 JSON-RPC 回應；
   * 當 SSE 每 6 秒就死一次，結果收不完整，最後對上層報：
     `MCP error -32001: Request timed out`

### 3. first-principle 結論

從 SSE 定義 + proxy 行為出發，可以得到：

* Cloud Run / GFE 對「**長時間沒資料的 streaming 連線**」很不友善（~6 秒沒資料就 kill）。
* SSE 是「server → client 單向」：

  * idle timeout 只能靠 **server 持續送 heartbeat** 解，client 再怎麼「多發 request」也救不了現有的連線。
* 你目前的 server：

  * 有 heartbeat（local 可見 `: ping`）
  * 但 **在 Cloud Run 上，第一個 ping 沒有在 idle window 之前成功送出去**（或沒 flush 出來），
  * 造成 SSE 連線在 ping 發出之前就被 proxy / client 結束。

---

## 三、要交給 AI 助手做的「功能 / 任務」規格

下面是你可以直接貼給 Cline 的 spec。分成多個 Feature，讓它可以逐一實作 / refactor。

---

### Feature 1：穩定的 SSE Heartbeat（Server-side heartbeat）

**目標：**
讓 `/sse` 在 Cloud Run 環境下，**實際上每 ≤ 3 秒就 flush 一個 heartbeat chunk** 到 client，確保不被 Cloud Run / HTTP/2 idle timeout 掐掉。

**需求：**

1. 在 SSE transport 路徑中（FastMCP / `run_sse_async()` 相關），實作或調整 server-side heartbeat：

   * 心跳格式可以是 SSE comment 或 event，例如：

     * `: ping\n\n`
     * 或 `event: ping\ndata: {}\n\n`
   * 必須確保是「真的寫到 response」，而不是只在 memory 裡排隊。

2. **Heartbeat 間隔**：

   * 以 Cloud Run 實測約 6–7 秒 idle 就 truncated 為基準，
   * 設計 heartbeat 間隔為 **2 秒** 或 **3 秒**，並留出 margin。
   * heartbeats 頻率應該可以透過 config 調整，例如：

     * `.env` 變數：`SSE_HEARTBEAT_INTERVAL_SECONDS`（預設 2 或 3）

3. 確保 heartbeat 在 Cloud Run 上能正常 flush：

   * 使用適合 streaming 的 response / ASGI pattern（例如 generator / async generator）。
   * 若需要，顯式調用 flush（視使用的 framework / library 而定）。

4. 實作完成後，驗證方式（讓助手也一併寫 script / docs）：

   * 在 Cloud Run 上：

     * `curl --no-buffer https://<cloud-run-url>/sse`
     * 觀察輸出至少 20–30 秒，期望看到：

       * `event: endpoint`
       * 後續每 2–3 秒有 `: ping` 或等效 heartbeat 行。
     * Cloud Run logs 不應再每 6–7 秒出現 `Truncated response body` 對 `/sse`。

---

### Feature 2：初始化流程不阻塞 SSE Heartbeat（Non-blocking init）

**目標：**
避免 heavy 初始化（model loading, knowledge graph, Neo4j 等）卡死 event loop，導致 `/sse` 心跳 loop 起不來或無法按時發送。

**已知 heavy 步驟：**

* 初始化 `knowledge_graph_validator`
* 連線 Neo4j（`Initializing Neo4j connection...`）
* 建 index / constraint（`Creating constraints and indexes...`）
* 載入 `sentence_transformers.cross_encoder.CrossEncoder` 等模型
* 初始化 knowledge graph components

**需求：**

1. 將這些 heavy init 從「SSE 連線建立的 critical path」移出：

   * 不要在剛啟動 `/sse` 或 `lifespan` 的同步部分一次做完所有 heavy init，
   * 以免第一個 heartbeat 延遲到 idle timeout 之後。

2. 採用 lazy-init 或 background init：

   * 方案 A（lazy-init）：在第一次真正的 tool call（例如某個 tool 的 handler）才啟動 heavy init，並把結果 cache 起來。
   * 方案 B（background task）：在 lifespan start 時啟動一個 background task：

     * heartbeat loop 優先啟動並穩定發 ping；
     * background task 以 async / non-blocking 方式做 heavy init。

3. 在 heavy init 過程中，仍要確保 heartbeat loop 不被阻塞：

   * 如果使用 async，避免在 event loop 上塞 blocking I/O / CPU-heavy job；必要時使用 `run_in_executor` 或類似方式。
   * 如果真的要做重 CPU 操作，要用 background thread/process，不要卡住主 loop。

4. 驗證：

   * Cloud Run 上部署新版本後，立刻打 `/sse`：

     * 觀察是否能在數秒內開始看到穩定 heartbeat；
     * 看是否同時可以在 log 裡看到 heavy init 的進度（代表兩者並行）。

---

### Feature 3：Logging 一致性與可觀測性（Logging & Observability）

**目標：**
讓 local 與 Cloud Run log 能夠清楚反映實際行為，方便 debug SSE / init 相關問題。

**需求：**

1. 設定全局 logging：

   * 在 MCP server 入口處（程式主入口 / FastMCP 啟動之前），加入明確的 logging config，例如：

     ```python
     import logging, sys

     logging.basicConfig(
         level=logging.INFO,
         format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
         handlers=[logging.StreamHandler(sys.stdout)],
     )
     ```
   * 確保：

     * INFO 級別 log 會輸出到 stdout；
     * Cloud Run 能收到這些 log（Cloud Run 會抓 stdout/stderr）。

2. 在關鍵節點加明確 marker：

   * SSE 相關：

     * 開始 SSE 連線（進入 `/sse` handler）
     * 發送 heartbeat 時（印出 timestamp + session_id）
   * Heavy init 相關：

     * `knowledge_graph_validator initialized`
     * `Initializing Neo4j connection...`
     * `Creating constraints and indexes...`
     * model load 開始 / 完成

3. 檢查 Cloud Run 的 log：

   * 確保這些 INFO log **在 remote 也能看到**（不是只在 local 出現）。

4. 若之前 `logger.info(...)` 在 Cloud Run 看不到：

   * 確認 logger name / handler 等設置，讓這些 logger 最終都掛在 root logger 上，或共享同一個 stdout handler。

---

### Feature 4：自動化診斷腳本 / 說明（Diagnostics）

**目標：**
讓未來可以快速檢查「MCP SSE 在 Cloud Run 是否健康」，不用每次手動推理。

**需求：**

讓 AI 助手幫你做一個簡單的診斷腳本或 README 片段，包含：

1. 本機測試步驟：

   * `curl -v http://localhost:8051/sse`
   * `curl -v -X POST ... /messages?session_id=...` 測 `{}` & `tools/list`
   * 預期觀察點（200, 400, 202, ping 行為等）

2. Cloud Run 測試步驟：

   * `curl --no-buffer https://<url>/sse`：

     * 應該看到 endpoint + 週期性的 heartbeat，不會被 6 秒 truncate。
   * `curl -v -X POST ... /messages?session_id=...` + `tools/list`：

     * 應該回 202，且 SSE 連線不被切斷。

3. Cloud Run log 檢查：

   * 不再出現每 6–7 秒對 `/sse` 的 `Truncated response body`。
   * heavy init / heartbeat log 正常出現。

---

### Feature 5（可選）：Cloud Run 設定優化

**目標：**
給 server 一個比較合理的執行環境，避免非必要的 timeout / cold start 影響。

**需求：**

1. Request timeout：

   * 在 Cloud Run 裡把 request timeout 設定調高（例如 600 秒 / 3600 秒），
   * 避免長時間 SSE 連線因為整體請求 timeout 被強制結束。

2. Min instances：

   * 設定 `min-instances = 1`（或以上），
   * 減少每次連線需要冷啟的情況，避免 init + SSE 第一個 heartbeat 疊加延遲。

---

## 四、交付成果 / 驗收標準（Acceptance Criteria）

AI coding assistant 做完後，你（或它自己）應該至少能證明：

1. **協議層面：**

   * Remote `/sse` + `/messages` + `tools/list` 行為和 local 一致（已經做到，需保持）。

2. **SSE 連線穩定性：**

   * `curl --no-buffer https://<cloud-run-url>/sse`：

     * 能看到 `event: endpoint` 之後，每 ≤ 3 秒有 heartbeat 輸出；
     * 連線能持續 > 1–2 分鐘，不被 Cloud Run truncate。
   * Cloud Run logs 不再每 6–7 秒針對 `/sse` 打 `Truncated response body` warning。

3. **客戶端行為：**

   * Cline 連 remote SSE 時，不再出現 `MCP error -32001: Request timed out`；
   * MCP Inspector 用 SSE + Via Proxy 連 remote，能正常列出 tools 並調用簡單 tool。

4. **Logging 可觀測性：**

   * 在 Cloud Run logs 裡能看到：

     * SSE 連線建立 / heartbeat log；
     * knowledge graph / Neo4j / model 等初始化 log；
   * 這些 log 與 local 行為一致（只是請求路由不同）。

---

你可以把上面 **「三、要交給 AI 助手做的功能 / 任務規格」** 整段直接丟給 Cline，讓它從 Feature 1 開始實作 /重構，順帶幫你做 logging / config 參數化。
