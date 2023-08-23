import * as React from "react";
import RecordButton from "../components/record-button";
import ClipList from "../components/clip-list";
import useClipRecorder from "../hooks/clip-recorder";

// A Clip is an object with the following properties:
// `blob: Blob` - audio data Blob
// `createdAt: number` - timestamp when the clip was created

export default function Home() {
  const [clips, setClips] = React.useState([]);
  const [isDragging, setIsDragging] = React.useState(false);

  const addNewClip = React.useCallback((blob) => {
    setClips((current) => [...current, { blob, createdAt: Date.now() }]);
  }, []);
  const { state, error, askPermission, start, stop, stream } =
    useClipRecorder(addNewClip);

  const onDrop = (event) => {
    setIsDragging(false);
    event.preventDefault();

    if (!event.dataTransfer) return;

    let file = event.dataTransfer.files.item(0);
    if (file && file.type.startsWith("audio/")) {
      addNewClip(file);
    }
  };

  const onDragOver = (event) => {
    setIsDragging(true);
    event.preventDefault();
  };

  const onDragLeave = (event) => {
    setIsDragging(false);
    event.preventDefault();
  };

  const renderIntro = () => {
    switch (state) {
      case "initial":
      case "ready":
      case "recording":
        return (
          <ul className="claim-list">
            <li className="claim-item">
              <span role="presentation">⏺️</span>Press and hold the microphone
              button below to record a new clip
            </li>
          </ul>
        );
      case "requires-permission":
        return (
          <>
            <ul className="claim-list">
              <li className="claim-item">
                <span role="presentation">🎙️</span>This demo requires access to
                microphone to record sound clips
              </li>
              <li className="claim-item">
                <span role="presentation">🙈</span>
                Anything you record will <em>not</em> be transmitted over
                network or saved
              </li>
              <li className="claim-item">
                <span role="presentation">🙏</span>
                To access your microphone we need to ask your permission first
              </li>
            </ul>
            <button className="button" onClick={askPermission}>
              Ask permission
            </button>
          </>
        );
      case "not-allowed":
        return (
          <>
            <ul className="claim-list">
              <li className="claim-item">
                <span role="presentation">🤫</span>Microphone is not available.
              </li>
              <li className="claim-item">
                <span role="presentation">⬆️</span>You can drag and drop an
                audio file onto this window,
                <br /> or click the button below to choose an audio file from
                your device
              </li>
            </ul>
            <label className="button">
              Choose file
              <input
                hidden
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  const file = e.target.files && e.target.files[0];
                  if (file) {
                    addNewClip(file);
                    e.target.value = null;
                  }
                }}
              />
            </label>
          </>
        );
      case "error":
        return (
          <ul className="claim-list">
            <li className="claim-item">
              <span role="presentation">🐛</span>There was an unexpected error:{" "}
              {error.message}
              <br /> <br />
              Please let us know about it by{" "}
              <a
                className="link"
                href="https://github.com/vadimavdeev/react-voicemail-player/issues/new"
                target="blank"
                rel="noopener"
              >
                creating an Issue
              </a>
            </li>
          </ul>
        );
    }
  };

  return (
    <div
      className={`content ${isDragging ? "drop-target-root" : ""}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <h1 className="title">React Voicemail Player Demo</h1>
      <section className="intro">{renderIntro()}</section>
      <ClipList clips={clips} />
      <RecordButton
        isEnabled={state === "recording" || state === "ready"}
        isRecording={state === "recording"}
        onStart={start}
        onStop={stop}
        stream={stream}
      />
      {isDragging ? <div className="drop-target" /> : null}
    </div>
  );
}
