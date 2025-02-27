import React, { useEffect } from "react";
import Svg, { Polyline, Defs, LinearGradient, Stop, Path } from "react-native-svg";
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
  staticFlag?: boolean;
};

function Sparkline({
  prices,
  width = 100,
  height = 30,
  stroke = "black",
  strokeWidth = 2,
  staticFlag = true,
}: SparklineProps) {
  // Prüfe, ob das Array existiert und gültige Werte enthält
  const validPrices = Array.isArray(prices) ? 
    prices.filter(p => p !== undefined && p !== null && !isNaN(p)) : [];
  
  // Wenn keine gültigen Preise vorhanden sind, zeige nichts an
  if (validPrices.length === 0) return null;
  
  const effectiveWidth =
    typeof width === "number" ? width : Dimensions.get("window").width;
  
  // Berechne min/max mit Sicherheitsüberprüfung
  const min = Math.min(...validPrices);
  const max = Math.max(...validPrices);
  
  // Verhindere Division durch Null und stelle sicher, dass wir keine NaN erhalten
  const range = max - min || 1; // Wenn max === min, verwende 1 als Bereich
  
  const scaleY = (value: number) => {
    if (value === undefined || value === null || isNaN(value)) return height / 2;
    return height - ((value - min) / range) * height;
  };
  
  // Erzeuge Punkte-String und Array für Längenberechnung
  const pointsArray = validPrices.map((price, index) => {
    const x = (index / Math.max(validPrices.length - 1, 1)) * effectiveWidth;
    const y = scaleY(price);
    return { x, y };
  });
  
  const points = pointsArray.map(p => `${p.x},${p.y}`).join(" ");

  // Erzeuge fillPath: Beginne beim ersten x an der unteren Kante, folge dann den Punkten und schließe beim letzten Punkt an der unteren Kante
  const fillPath = (() => {
    const first = pointsArray[0];
    const last = pointsArray[pointsArray.length - 1];
    const linePath = pointsArray.map((p, idx) => (idx === 0 ? `L ${p.x} ${p.y}` : `${p.x} ${p.y}`)).join(" ");
    return `M ${first.x} ${height} L ${first.x} ${first.y} ${linePath} L ${last.x} ${height} Z`;
  })();

  // Berechne die Gesamt-Linie
  let totalLength = 0;
  for (let i = 1; i < pointsArray.length; i++) {
    const dx = pointsArray[i].x - pointsArray[i - 1].x;
    const dy = pointsArray[i].y - pointsArray[i - 1].y;
    totalLength += Math.sqrt(dx * dx + dy * dy);
  }

  // Wenn nichts zu zeichnen ist, zeige nichts an
  if (totalLength <= 0) return null;

  // Shared value für animierten dashOffset
  const animatedDashOffset = useSharedValue(totalLength);
  
  // Animated props
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: animatedDashOffset.value,
  }));

  useEffect(() => {
    animatedDashOffset.value = withTiming(0, { duration: 1500 });
  }, [animatedDashOffset, points]); // Reagiere auch auf Änderungen in den Punkten

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="sparkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={stroke} stopOpacity="0.5" />
          <Stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      {/* Bereich unter der Linie */}
      <Path d={fillPath} fill="url(#sparkGradient)" />
      {/* Die animierte Linie */}
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

export default React.memo(Sparkline);
