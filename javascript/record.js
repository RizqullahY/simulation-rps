function getDateString() {
  const d = new Date();
  return d.toLocaleDateString("id-ID").replaceAll("/", "-");
}

function startRecording() {
  recordedChunks = [];

  // Paksa render 1 frame dulu biar ada isi
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.fillText("Recording...", 10, 20);

  // Ambil stream dari canvas | FPS ( FRAME PER SECOND ) 30 / 60 / 90 DLL
  const stream = canvas.captureStream(90);

  let mimeType = "video/webm;codecs=vp9";
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = "video/webm;codecs=vp8";
  }

  recorder = new MediaRecorder(stream, { mimeType });

  recorder.ondataavailable = e => {
    console.log("dataavailable", e.data.size);
    if (e.data.size > 0) recordedChunks.push(e.data);
  };

  recorder.onstart = () => console.log("Recorder started");

  recorder.onstop = () => {
    console.log("Recorder stopped, chunks:", recordedChunks.length);

    const blob = new Blob(recordedChunks, { type: recorder.mimeType });
    console.log("Blob size:", blob.size, "bytes");

    if (blob.size === 0) {
      alert("⚠️ File kosong! Jangan langsung stop, tunggu minimal 2-3 detik.");
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${new Date().toISOString().replace("T"," ").replaceAll(":","-").split(".")[0]} - simulation.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // delay 1 frame supaya stream udah aktif
  requestAnimationFrame(() => {
    recorder.start(200); // flush tiap 1 detik
    // → Lebih realtime, file lebih smooth, beban memori lebih seimbang. 500 / 200
    console.log("Recording started (after first frame)...");
  });
}

function stopRecording() {
  if (recorder && recorder.state === "recording") {
    console.log("Stopping recording...");
    recorder.requestData(); // flush chunk terakhir
    recorder.stop();
  }
}
