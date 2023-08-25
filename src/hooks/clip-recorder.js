import * as React from "react";

// A ClipRecorderState is one of the following:
// "initial" - initial state where we don't know if we're allowed microphone access
// "requires-permission" - must ask permission to access microphone
// "not-allowed" - the user denied access to microphone
// "ready" - ready to record
// "recording" - recording in progress
// "error" - unexpected error

// A ClipRecorder is an object with the following properties:
// state: ClipRecordertState - current state of the recorder
// error: Error - if `state` is "error", this will reference
//                the error object, otherwise `null`
// stream: MediaStream - if `state` is "recording", this will
//                       refrence the media stream being recorded,
//                       otherwise `null`
// askPermission: () => void - a function that triggers the browser's
//                      "Allow microphone access" dialog
// start: () => void - a function that starts recording
// stop: () => void - a function that stops recording

// (Blob => void) => ClipRecorder
// Creates a ClipRecorder given a function to call when a clip
// is ready (which happens asynchronously after recorder's stop
// method is called)
export default function useClipRecorder(onClip) {
  const [state, setState] = React.useState({
    state: "initial",
    error: null,
  });

  const recorderRef = React.useRef(null);

  React.useEffect(() => {
    if (!navigator.mediaDevices) {
      // older browser, or the page is served over http
      setState({
        state: "not-allowed",
        error: null,
      });
      return;
    }

    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const audioInput = devices.find((d) => d.kind === "audioinput");
      if (!audioInput) {
        setState({
          state: "error",
          error: new DOMException("Microphone not found", "NotFoundError"),
        });
      } else if (!audioInput.deviceId) {
        setState({
          state: "requires-permission",
          error: null,
        });
      } else {
        setState({
          state: "ready",
          error: null,
        });
      }
    });
  }, []);

  const actions = React.useMemo(() => {
    return {
      askPermission() {
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((stream) => {
            // close the stream since we only care about permissions
            stream.getTracks().forEach((track) => track.stop());
            setState({
              state: "ready",
              error: null,
            });
          })
          .catch((err) => {
            if (err.name === "NotAllowedError") {
              setState({
                state: "not-allowed",
                error: null,
              });
            } else {
              setState({
                state: "error",
                error: err,
              });
            }
          });
      },
      start() {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(
          (stream) => {
            recorderRef.current = new MediaRecorder(stream);
            recorderRef.current.start();
            setState({
              state: "recording",
              error: null,
            });
          },
          (err) => {
            setState({
              state: "error",
              error: err,
            });
          }
        );
      },
      stop() {
        const recorder = recorderRef.current;
        if (!recorder) {
          return;
        }

        let blob;
        recorder.ondataavailable = (event) => (blob = event.data);
        recorder.onstop = () => {
          recorderRef.current = null;
          setState({
            state: "ready",
            error: null,
          });
          if (blob.size > 0) {
            onClip(blob);
          }
        };

        recorder.stop();
        recorder.stream.getTracks().forEach((track) => track.stop());
      },
    };
  }, [onClip]);

  return {
    ...state,
    ...actions,
    stream: recorderRef.current?.stream,
  };
}
