require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();

// 정적 파일 제공 경로 설정 (public 폴더에 있는 파일들)
app.use(express.static(path.join(__dirname, "public")));

// index.html을 루트에서 제공할 수 있도록 추가 설정
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// API 키 전달 라우트 설정
app.get("/api-key", (req, res) => {
  res.json({ apiKey: process.env.GOOGLE_MAPS_API_KEY });
});

// 서버 포트 설정 및 시작
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT}에서 실행 중입니다.`);
});
