const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();
const PORT = 5555;

// 정적 파일 서빙
app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/isokay', (req, res) => {
    res.sendFile(path.join(__dirname, 'isokay.html'));
});

app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/css", express.static(path.join(__dirname, "css")));

app.use(cors());
const upload = multer({ dest: "uploads/" });

app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  const inputPath = req.file.path;
  const outputPath = path.join(__dirname, "result.txt");

  const whisperCmd = `python whisper_run.py "${inputPath}" "${outputPath}"`;
  exec(whisperCmd, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Whisper 오류:", stderr);
      return res.status(500).json({ error: "STT 처리 중 오류 발생" });
    }

    let transcribedText = "결과 없음";
    try {
      transcribedText = fs.readFileSync(outputPath, "utf-8").trim();
    } catch (e) {
      console.error("❌ 결과 파일 읽기 오류:", e);
      return res.status(500).json({ error: "결과 파일을 읽을 수 없습니다." });
    }

    console.log("🎧 Whisper 결과:", transcribedText);

    // LLaMA 제거 → Whisper 결과만 반환
    res.json({ text: transcribedText });
  });
});

app.listen(PORT, () => {
  console.log(`🔊 HeardU 서버 실행 중: http://localhost:${PORT}`);
});
