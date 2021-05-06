const Ball = ({ size }) => (
  <>
    <div className="ball" style={{ "--size": size }} />
    <div className="ballShadow" style={{ "--size": size }} />
  </>
);

export { Ball };
