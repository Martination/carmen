import { useState } from 'react';
import { Ball } from "./Ball";

const BallResizer = ({ initialSize, minSize, maxSize }) => {

  const [ballSize, setBallSize] = useState(initialSize);
  const onChange = (event) => {
    setBallSize(event.target.value);
  };

  return (
    <>
      <input type="range" className="slider" min={minSize} max={maxSize} value={ballSize} onChange={onChange} />
      <Ball size={ballSize} />
    </>
  );
};

export { BallResizer };
