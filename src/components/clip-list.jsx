import * as React from "react";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import VoicemailPlayer from "react-voicemail-player";

export default function ClipList({ clips }) {
  const clipRefPairs = React.useMemo(() => {
    return clips.map((clip) => [clip, React.createRef(null)]);
  }, [clips]);

  return (
    <div className="clip-list-wrapper">
      <TransitionGroup className="clip-list">
        {clipRefPairs.map(([clip, ref], index) => (
          <AnimatedHeight key={index} ref={ref}>
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
  const [url, setUrl] = React.useState(clip.url);

  React.useEffect(() => {
    if (!clip.url && clip.blob) {
      const blobUrl = URL.createObjectURL(clip.blob);
      setUrl(blobUrl);
      () => URL.revokeObjectURL(blobUrl);
    }
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

const AnimatedHeight = React.forwardRef(function (props, ref) {
  const { children, ...rest } = props;
  return (
    <CSSTransition
      nodeRef={ref}
      classNames="animated-height-wrapper"
      timeout={500}
      onEntering={() => {
        ref.current.style.height = `${
          ref.current.firstElementChild?.clientHeight || 0
        }px`;
      }}
      onExiting={() => {
        ref.current.style.height = "0px";
        ref.current.style.marginTop = "0px";
        ref.current.style.marginBottom = "0px";
      }}
      {...rest}
    >
      <div ref={ref}>{React.Children.only(children)}</div>
    </CSSTransition>
  );
});

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours}:${minutes.toString().padStart(2, "0")}`;
}
