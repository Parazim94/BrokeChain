import React from "react";
import Svg, { Polyline } from "react-native-svg";

type SparklineProps = {
  prices: number[];
  width?: number;
  height?: number;
  stroke?: string;
  strokeWidth?: number;
};

export default function Sparkline({
  prices,
  width = 100,
  height = 30,
  stroke = "green",
  strokeWidth = 2,
}: SparklineProps) {
  if (!prices || prices.length === 0) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const scaleY = (value: number) =>
    height - ((value - min) / (max - min || 1)) * height;
  const points = prices
    .map((price, index) => {
      const x = (index / (prices.length - 1)) * width;
      const y = scaleY(price);
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <Svg width={width} height={height}>
      <Polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}
