require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();

// 정적 파일 제공 경로 설정
app.use(express.static(path.join(__dirname, "public")));

// API 키 전달 라우트 설정
app.get("/api-key", (req, res) => {
  res.json({ apiKey: process.env.GOOGLE_MAPS_API_KEY });
});

// 서버 포트 설정 및 시작
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT}에서 실행 중입니다.`);
});
