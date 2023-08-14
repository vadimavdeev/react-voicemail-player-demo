import * as React from "react";

/**
 * The About function defines the component that makes up the About page
 * This component is attached to the /about path in router.jsx
 */

export default function About() {
  return (
    <div className="page about">
      <h1 className="title">About this site</h1>
      <p className="text">
        A demo of{" "}
        <a
          className="link"
          href="https://github.com/vadimavdeev/react-voicemail-player"
        >
          react-voicemail-player
        </a>{" "}
        component. See it in action by recording sound clips (if you allow
        access to microphone), or uploading audio files from your computer
        (otherwise). Anything you upload and/or record will not be saved and
        will never leave your browser.
      </p>
      <p className="text">
        Feel free to check out the{" "}
        <a
          className="link"
          href="https://glitch.com/edit/#!/curly-shell-microceratops"
        >
          source code
        </a>
        .
      </p>
      <p>
        Built with{" "}
        <a className="link" href="https://reactjs.org/">
          React
        </a>{" "}
        and{" "}
        <a className="link" href="https://vitejs.dev/">
          Vite
        </a>{" "}
        on{" "}
        <a className="link" href="https://glitch.com/">
          Glitch
        </a>
        .
      </p>
    </div>
  );
}
