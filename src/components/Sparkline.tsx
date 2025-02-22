import React, { useEffect } from "react";
import Svg, { Polyline } from "react-native-svg";
import { Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
} from "react-native-reanimated";

const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);

type SparklineProps = {
  prices: number[];
  width?: number | string;
  height?: number;
  stroke?: string;
  strokeWidth?: number;
};

export default function Sparkline({
  prices,
  width = 100,
  height = 30,
  stroke = "black",
  strokeWidth = 2,
}: SparklineProps) {
  if (!prices || prices.length === 0) return null;
  
  const effectiveWidth =
    typeof width === "number" ? width : Dimensions.get("window").width;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const scaleY = (value: number) =>
    height - ((value - min) / (max - min || 1)) * height;
  
  // Erzeuge Punkte-String und Array für Längenberechnung
  const pointsArray = prices.map((price, index) => {
    const x = (index / (prices.length - 1)) * effectiveWidth;
    const y = scaleY(price);
    return { x, y };
  });
  const points = pointsArray.map(p => `${p.x},${p.y}`).join(" ");

  // Berechne die Gesamt-Linie (einfache euklidische Summe)
  let totalLength = 0;
  for (let i = 1; i < pointsArray.length; i++) {
    const dx = pointsArray[i].x - pointsArray[i - 1].x;
    const dy = pointsArray[i].y - pointsArray[i - 1].y;
    totalLength += Math.sqrt(dx * dx + dy * dy);
  }

  // Shared value für animierten dashOffset
  const animatedDashOffset = useSharedValue(totalLength);
  
  // Animated props
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: animatedDashOffset.value,
  }));

  useEffect(() => {
    animatedDashOffset.value = withTiming(0, { duration: 1500 });
  }, [animatedDashOffset]);

  return (
    <Svg width={width} height={height}>
      <AnimatedPolyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={totalLength}
        animatedProps={animatedProps}
      />
    </Svg>
  );
}
