require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();

// 정적 파일 제공 경로 설정 (public 폴더 안에 있는 파일들)
app.use(express.static(path.join(__dirname, "public")));

// 루트 경로에서 index.html 파일 제공
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API 키 전달 라우트 설정
app.get("/api-key", (req, res) => {
  res.json({ apiKey: process.env.GOOGLE_MAPS_API_KEY });
});

// 서버 포트 설정 및 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT}에서 실행 중입니다.`);
});

module.exports = app;
