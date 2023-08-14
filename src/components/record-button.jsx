import * as React from "react";

export default function RecordButton({
  isEnabled,
  isRecording,
  onStart,
  onStop,
  stream,
}) {
  const btnRef = React.useRef();
  const [btnSize, setBtnSize] = React.useState(0);

  const startRecording = React.useCallback(
    (event) => {
      if (event.button !== 0 || !isEnabled) {
        return;
      }

      const stopRecording = () => {
        ["pointerup", "pointercancel"].forEach((eventName) => {
          document.documentElement.removeEventListener(
            eventName,
            stopRecording
          );
        });
        onStop();
      };

      ["pointerup", "pointercancel"].forEach((eventName) => {
        document.documentElement.addEventListener(eventName, stopRecording, {
          capture: true,
          once: true,
        });
      });

      onStart();
    },
    [onStart, onStop, isEnabled]
  );

  React.useLayoutEffect(() => {
    const bbox = btnRef.current.getBoundingClientRect();
    setBtnSize(bbox.width);
  }, []);

  return (
    <div style={{ position: "relative" }}>
      {stream && <Visualize stream={stream} btnSize={btnSize} />}
      <button
        ref={btnRef}
        aria-label={isRecording ? "Recording" : "Record"}
        className="button record-button"
        onPointerDown={startRecording}
        disabled={!isEnabled}
      >
        <MicrophoneIcon />
      </button>
    </div>
  );
}

const MicrophoneIcon = React.memo(() => {
  return (
    <svg viewBox="0 0 24 24" className="icon-microphone">
      <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 1 1-8 0V5a4 4 0 0 1 4-4z" />
      <path d="M13 18.94V21h3a1 1 0 0 1 0 2H8a1 1 0 0 1 0-2h3v-2.06A8 8 0 0 1 4 11a1 1 0 0 1 2 0 6 6 0 1 0 12 0 1 1 0 0 1 2 0 8 8 0 0 1-7 7.94z" />
    </svg>
  );
});

function Visualize({ stream, btnSize }) {
  const canvasRef = React.useRef();
  const canvasSize = btnSize * 2;

  React.useEffect(() => {
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    source.connect(analyser);

    const fillColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--color-primary-500");

    let rafId;
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      const MIN_RADIUS = btnSize / 2;
      const MAX_RADIUS = canvasSize / 2;
      const CENTER = canvasSize / 2;

      analyser.getByteTimeDomainData(dataArray);

      const canvasCtx = canvas.getContext("2d");
      canvasCtx.clearRect(0, 0, canvasSize, canvasSize);

      let max = 0;
      for (let i = 0; i < bufferLength; i++) {
        let v = dataArray[i] / 128.0 - 1;
        max = Math.max(v, max);
      }

      let r = max * (MAX_RADIUS - MIN_RADIUS) + MIN_RADIUS;

      canvasCtx.fillStyle = fillColor;

      canvasCtx.beginPath();
      canvasCtx.arc(CENTER, CENTER, r, 0, Math.PI * 2);
      canvasCtx.fill();

      rafId = requestAnimationFrame(draw);
    };

    draw();

    () => {
      cancelAnimationFrame(rafId);
      audioCtx.close();
    };
  }, [stream]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize}
      height={canvasSize}
      style={{
        position: "absolute",
        top: `-${(canvasSize - btnSize) / 2}px`,
        left: `-${(canvasSize - btnSize) / 2}px`,
        zIndex: -1,
        opacity: 0.3,
      }}
    />
  );
}
