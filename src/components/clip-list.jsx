import * as React from "react";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import VoicemailPlayer from "react-voicemail-player";

export default function ClipList({ clips }) {
  return (
    <div className="clip-list-wrapper">
      <TransitionGroup className="clip-list">
        {clips.map((clip, index) => (
          <AnimatedHeight key={index}>
            <Clip clip={clip} />
          </AnimatedHeight>
        ))}
      </TransitionGroup>
      {clips.length === 0 ? (
        <span className="clip-list-empty">Your clips will appear here</span>
      ) : null}
    </div>
  );
}

function Clip({ clip }) {
  const [url, setUrl] = React.useState(null);

  React.useEffect(() => {
    const url = URL.createObjectURL(clip.blob);
    setUrl(url);
    () => URL.revokeObjectURL(url);
  }, [clip]);

  return (
    <div className="clip-item">
      <VoicemailPlayer className="clip-player">
        {(ref) => <audio ref={ref} src={url} />}
      </VoicemailPlayer>
      <span className="clip-item-timestamp">{formatTime(clip.createdAt)}</span>
    </div>
  );
}

function AnimatedHeight(props) {
  const { children, ...rest } = props;
  return (
    <CSSTransition
      classNames="animated-height-wrapper"
      timeout={500}
      onEntering={(node) => {
        node.style.height = `${node.firstElementChild?.clientHeight || 0}px`;
      }}
      onExiting={(node) => {
        node.style.height = "0px";
        node.style.marginTop = "0px";
        node.style.marginBottom = "0px";
      }}
      {...rest}
    >
      <div>{React.Children.only(children)}</div>
    </CSSTransition>
  );
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours}:${minutes.toString().padStart(2, "0")}`;
}
