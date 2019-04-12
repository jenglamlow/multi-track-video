import React, { useRef, useEffect, useState } from "react";
import videoSample from "./multiTrack.mp4";
import audioTrack1 from "./audioTrack_1.aac";
import audioTrack2 from "./audioTrack_2.aac";

export const Video = () => {
  const vRef = useRef(null);
  const a1 = useRef(null);
  const a2 = useRef(null);

  const [sliderValue, setSliderValue] = useState(1);
  const [audioCtx] = useState(
    new (window.AudioContext || window.webkitAudioContext)()
  );
  const [volumeGain] = useState(audioCtx.createGain());
  const [trackEnableGain] = useState(
    Array(2)
      .fill()
      .map(_ => audioCtx.createGain())
  );
  const [s1toggleMap, setS1ToggleMap] = useState(Array(2).fill(true));
  const [s2toggleMap, setS2ToggleMap] = useState(Array(1).fill(true));

  const [s1channelsGain] = useState(
    Array(2)
      .fill()
      .map(_ => audioCtx.createGain())
  );
  const [s2channelsGain] = useState(
    Array(1)
      .fill()
      .map(_ => audioCtx.createGain())
  );

  useEffect(() => {
    const vid = vRef.current;
    const aud1 = a1.current;
    const aud2 = a2.current;
    volumeGain.gain.value = sliderValue;
    const s1Splitter = audioCtx.createChannelSplitter(2);
    const s2Splitter = audioCtx.createChannelSplitter(1);
    const s1merger = audioCtx.createChannelMerger(2);
    const s2merger = audioCtx.createChannelMerger(1);

    vid.onplay = () => {
      aud1.play();
      aud2.play();
      console.log("play");
    };

    vid.onpause = () => {
      aud1.pause();
      aud2.pause();
      console.log("pause");
    };

    const source1 = audioCtx.createMediaElementSource(aud1);
    const source2 = audioCtx.createMediaElementSource(aud2);
    source1.connect(trackEnableGain[0]);
    source2.connect(trackEnableGain[1]);

    trackEnableGain[0].connect(s1Splitter);
    trackEnableGain[1].connect(s2Splitter);

    s1Splitter.connect(s1channelsGain[0], 0);
    s1Splitter.connect(s1channelsGain[1], 1);

    s2Splitter.connect(s2channelsGain[0], 0);

    s1channelsGain[0].connect(s1merger, 0, 0);
    s1channelsGain[1].connect(s1merger, 0, 1);

    s2channelsGain[0].connect(s2merger, 0, 0);

    s1merger.connect(volumeGain);
    s2merger.connect(volumeGain);

    volumeGain.connect(audioCtx.destination);

    const syncTime = () => {
      if (Math.abs(vid.currentTime - aud1.currentTime) > 0.1) {
        aud1.currentTime = vid.currentTime;
      }

      if (Math.abs(vid.currentTime - aud2.currentTime) > 0.1) {
        aud2.currentTime = vid.currentTime;
      }

      requestAnimationFrame(syncTime);
    };

    requestAnimationFrame(syncTime);
  }, []);

  useEffect(() => {
    volumeGain.gain.value = sliderValue;
  }, [sliderValue]);

  const handleTrackEnable = (idx, value) => {
    trackEnableGain[idx].gain.value = value ? 1 : 0;
  };

  const handleSource1Channels = (i, value) => {
    const map = [...s1toggleMap];
    map[i] = value;
    s1channelsGain[i].gain.value = value ? 1 : 0;
    setS1ToggleMap(map);
  };

  const handleSource2Channels = (i, value) => {
    const map = [...s2toggleMap];
    map[i] = value;
    s2channelsGain[i].gain.value = value ? 1 : 0;
    setS2ToggleMap(map);
  };

  return (
    <div>
      <video ref={vRef} src={videoSample} width="1000" controls muted>
        <audio ref={a1} src={audioTrack1} />
        <audio ref={a2} src={audioTrack2} />
      </video>
      <input
        style={{ display: "block" }}
        type="range"
        step="0.01"
        min="0"
        max="1"
        onChange={e => setSliderValue(e.target.value)}
        value={sliderValue}
      />
      <Toggle label="Track 1" idx={0} onChange={handleTrackEnable} />
      <div style={{marginLeft: '3rem'}}>
        <Toggle label="Channel 1" idx={0} onChange={handleSource1Channels} />
        <Toggle label="Channel 2" idx={1} onChange={handleSource1Channels} />
      </div>
      <Toggle label="Track 2" idx={1} onChange={handleTrackEnable} />
      <div style={{marginLeft: '3rem'}}>
        <Toggle label="Channel 1" idx={0} onChange={handleSource2Channels} />
      </div>
    </div>
  );
};

const Toggle = ({ label, idx, onChange }) => {
  const [isToggle, setIsToggle] = useState(true);

  const handleClick = () => {
    const value = !isToggle;
    setIsToggle(value);
    onChange(idx, value);
  };

  return (
    <button style={{ width: "9rem", display: "block" }} onClick={handleClick}>
      {isToggle ? `${label} ON` : `${label} OFF`}
    </button>
  );
};

export default Video;
