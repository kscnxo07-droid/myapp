# 藥物交互檢查系統

基於 **HL7 FHIR R4** 標準開發的藥物交互檢查輔助工具，結合 Google Gemini AI 分析與 FHIR 資料儲存，實現病人自助查詢與醫師處方輔助的閉環流程。

---

## 專案特色

- 病人端自助輸入用藥描述，由 Gemini AI 分析交互風險
- 醫師端處方輔助，自動讀取病人歷史警示記錄
- 分析結果以 FHIR Observation 資源儲存，實現資料互通
- 前後端分離架構，程式碼清晰易維護

---

## 專案結構

```bash
drug-interaction-app/
├── client/                          # Vue 3 前端（純 JavaScript）
│   ├── src/
│   │   ├── views/
│   │   │   ├── PatientInputView.vue          # 病人端 - 用藥交互查詢
│   │   │   └── EHRPrescriptionView.vue       # 醫師端 - 處方輔助檢查
│   │   ├── router/
│   │   │   └── index.js
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   └── vite.config.js
│
├── server/                          # Express 後端
│   ├── routes/
│   │   ├── interaction.js           # 病人端路由
│   │   └── cds-hooks.js             # 醫師端 CDS Hooks 路由
│   ├── services/
│   │   ├── aiService.js             # Gemini AI 分析服務
│   │   └── fhirService.js           # FHIR 直接讀寫服務
│   ├── server.js                    # 後端入口
│   ├── .env                         # ← 重要：需自行建立此檔案
│   └── package.json
│
├── README.md
└── .gitignore

技術堆疊

類別技術前端Vue 3 + Vite + Bootstrap 5後端Node.js + Express + AxiosAI 引擎Google Gemini 2.5 Flash資料標準HL7 FHIR R4（HAPI FHIR Server）其他Cors, Dotenv, Nodemon

重要提醒：環境設定
⚠️ 必須自行建立 .env 檔案
請在 server/ 資料夾中建立一個名為 .env 的檔案，並加入以下內容：
env# server/.env
GEMINI_API_KEY=你的_Gemini_API_Key_請填入這裡
FHIR_BASE_URL=http://hapi.fhir.org/baseR4
PORT=3000
注意事項：

GEMINI_API_KEY 請務必填入你自己的有效 Gemini API Key
如果沒有 Key，系統會無法呼叫 AI 分析
.env 檔案不會被上傳到 GitHub（已加入 .gitignore）


如何執行專案
1. 安裝依賴
後端
Bashcd server
npm install
前端
Bashcd client
npm install
2. 設定環境變數
確認 server/.env 檔案已建立並填入正確的 GEMINI_API_KEY。
3. 啟動專案
後端（推薦使用 nodemon）
Bashcd server
npm run dev
前端
Bashcd client
npm run dev

完整使用情境
系統以病人 ID 131431142 作為主要測試編號。
推薦測試流程：
步驟 1：病人端自助查詢

開啟病人端頁面（/patient）
輸入用藥描述文字
點擊「送出查詢」
Gemini AI 分析並顯示風險卡片
結果自動儲存至 FHIR Observation

步驟 2：醫師端處方輔助

開啟醫師端頁面（/ehr）
病人 ID 已預填 131431142
（可選）輸入處方藥物
點擊「檢查交互風險」
系統先讀取歷史記錄，若有則顯示歷史警示，否則進行新分析

三組測試情境

情境  病人端輸入 醫師端處方藥物 預期風險等級 重點
1 高風險 我長期服用 Warfarin 5mg，膝蓋扭傷想吃 Ibuprofen  Ibuprofen 400mg tid            高風險 歷史警示自動跳出
2 中風險 我吃 Losartan，想吃含 Pseudoephedrine 的感冒藥   Pseudoephedrine 60mg tid         中風險 即時分析建議
3 低風險 我吃 Metformin，醫師開 Amoxicillin    Amoxicillin 500mg tid                      低風險 綠色安全卡片
