import React, { useEffect, useMemo } from "react";
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
  maxDataPoints?: number; // Neue Prop zur Begrenzung der Datenpunkte
};

function Sparkline({
  prices,
  width = 100,
  height = 30,
  stroke = "black",
  strokeWidth = 2,
  staticFlag = true,
  maxDataPoints = 30, 
}: SparklineProps) {
  // Prüfe, ob das Array existiert und gültige Werte enthält
  const validPrices = useMemo(() => {
    if (!Array.isArray(prices)) return [];
    
    const filtered = prices.filter(p => p !== undefined && p !== null && !isNaN(p));
    
    // Reduziere die Anzahl der Datenpunkte, wenn nötig
    if (filtered.length > maxDataPoints) {
      const step = Math.ceil(filtered.length / maxDataPoints);
      return filtered.filter((_, i) => i % step === 0).slice(0, maxDataPoints);
    }
    
    return filtered;
  }, [prices, maxDataPoints]);
  
  // Wenn keine gültigen Preise vorhanden sind, zeige nichts an
  if (validPrices.length === 0) return null;
  
  const effectiveWidth = useMemo(() => 
    typeof width === "number" ? width : Dimensions.get("window").width,
  [width]);
  
  // Berechne min/max mit Sicherheitsüberprüfung
  const { min, max, range } = useMemo(() => {
    const min = Math.min(...validPrices);
    const max = Math.max(...validPrices);
    const range = max - min || 1; // Wenn max === min, verwende 1 als Bereich
    return { min, max, range };
  }, [validPrices]);
  
  const scaleY = (value: number) => {
    if (value === undefined || value === null || isNaN(value)) return height / 2;
    return height - ((value - min) / range) * height;
  };
  
  // Erzeuge Punkte-String und Array für Längenberechnung
  const { points, pointsArray, fillPath, totalLength } = useMemo(() => {
    const pointsArray = validPrices.map((price, index) => {
      const x = (index / Math.max(validPrices.length - 1, 1)) * effectiveWidth;
      const y = scaleY(price);
      return { x, y };
    });
    
    const points = pointsArray.map(p => `${p.x},${p.y}`).join(" ");

    // Erzeuge fillPath
    const first = pointsArray[0];
    const last = pointsArray[pointsArray.length - 1];
    const linePath = pointsArray.map((p, idx) => 
      (idx === 0 ? `L ${p.x} ${p.y}` : `${p.x} ${p.y}`)
    ).join(" ");
    const fillPath = `M ${first.x} ${height} L ${first.x} ${first.y} ${linePath} L ${last.x} ${height} Z`;

    // Berechne die Gesamt-Linie
    let totalLength = 0;
    for (let i = 1; i < pointsArray.length; i++) {
      const dx = pointsArray[i].x - pointsArray[i - 1].x;
      const dy = pointsArray[i].y - pointsArray[i - 1].y;
      totalLength += Math.sqrt(dx * dx + dy * dy);
    }

    return { points, pointsArray, fillPath, totalLength };
  }, [validPrices, effectiveWidth, height, min, range]);

  // Wenn nichts zu zeichnen ist, zeige nichts an
  if (totalLength <= 0) return null;

  // Shared value für animierten dashOffset
  const animatedDashOffset = useSharedValue(staticFlag ? 0 : totalLength);
  
  // Animated props
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: animatedDashOffset.value,
  }));

  useEffect(() => {
    // Animation nur ausführen, wenn staticFlag false ist
    if (!staticFlag) {
      animatedDashOffset.value = withTiming(0, { duration: 500 });
    }
  }, [animatedDashOffset, points, staticFlag]);

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
