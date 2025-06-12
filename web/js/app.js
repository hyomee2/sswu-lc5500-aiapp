// js/app.js
let mediaRecorder;
let audioChunks = [];
let isRecording = false;

const recordBtn = document.getElementById("recordBtn");
const status = document.getElementById("status");
const resultText = document.getElementById("resultText");

recordBtn.addEventListener("click", async () => {
  if (!isRecording) {
    // 녹음 시작
    audioChunks = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (e) => {
      audioChunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      status.textContent = "🔁 처리 중...";
      const blob = new Blob(audioChunks, { type: "audio/wav" });
      const formData = new FormData();
      formData.append("audio", blob, "input.wav");

      try {
        const res = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (data.error) {
          resultText.textContent = `❌ 오류: ${data.error}`;
        } else {
          resultText.textContent = `${data.text}`;
        }

        status.textContent = "✅ 처리 완료!";
      } catch (err) {
        console.error(err);
        resultText.textContent = "❌ 네트워크 오류";
        status.textContent = "⚠️ 오류 발생";
      }
    };

    mediaRecorder.start();
    status.textContent = "🎙️ 녹음 중... 다시 누르면 종료";
    recordBtn.classList.add("recording");
    isRecording = true;

    // 정지할 때 스트림 참조를 위해 저장
    recordBtn.streamRef = stream;
  } else {
    // 녹음 정지
    mediaRecorder.stop();
    recordBtn.streamRef.getTracks().forEach(track => track.stop());
    status.textContent = "⏹️ 녹음 종료됨";
    recordBtn.classList.remove("recording");
    isRecording = false;
  }
});
