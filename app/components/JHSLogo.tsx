/* eslint-disable react/prop-types */
const JHSLogo = ({
  width = "w-4/5",
  height = "h-4/5",
  textColor = "text-blue-600",
  textSize = "text-5xl",
  fontFamily = "font-mono",
}) => {
  const generateSunRays = () => {
    return [...Array(32)].map((_, i) => {
      const angle = (i * 360) / 32;
      const innerRadius = 55;
      const outerRadius = 85;
      const innerX = 100 + innerRadius * Math.cos((angle * Math.PI) / 180);
      const innerY = 100 + innerRadius * Math.sin((angle * Math.PI) / 180);
      const outerX = 100 + outerRadius * Math.cos((angle * Math.PI) / 180);
      const outerY = 100 + outerRadius * Math.sin((angle * Math.PI) / 180);

      return (
        <path
          key={i}
          d={`M${innerX} ${innerY} L${outerX} ${outerY}`}
          strokeLinecap="round"
        />
      );
    });
  };

  return (
    <svg className={`${width} ${height}`} viewBox="0 0 200 200">
      <g stroke="currentColor" strokeWidth="1.5" className={textColor}>
        <circle cx="100" cy="100" r="45" fill="none" />
        <circle cx="100" cy="100" r="55" fill="none" />
        {generateSunRays()}
      </g>

      <foreignObject x="50" y="60" width="100" height="80">
        <div className="w-full h-full flex items-center justify-center">
          <span
            className={`${fontFamily} ${textSize} font-bold tracking-wider ${textColor} select-none`}
          >
            JHS
          </span>
        </div>
      </foreignObject>
    </svg>
  );
};

export default JHSLogo;
