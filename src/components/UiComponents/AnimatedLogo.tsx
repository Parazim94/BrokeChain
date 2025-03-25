import React, { useEffect, useRef, useContext } from "react";
import { Animated } from "react-native";
import Svg, { Rect, Text as SvgText } from "react-native-svg";
import { Path } from "react-native-svg";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedSvgText = Animated.createAnimatedComponent(SvgText);

export default function AnimatedLogo() {
  const dashLength = 300;
  const dashAnim = useRef(new Animated.Value(dashLength)).current;
  
  // Neue Animationswerte für den Text
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textScale = useRef(new Animated.Value(0.5)).current;
  
  const { theme } = useContext(ThemeContext);
  const { isLoggedIn } = useContext(AuthContext);

  // Farbwerte basierend auf Login-Status
  const strokeColor = isLoggedIn ? theme.accent : "#00a9d7";
  const textColor = isLoggedIn ? theme.accent : "#00a9d7";
  const textColor2 = isLoggedIn ? theme.accent : "#00AEEF";

  useEffect(() => {
    // Animation für Pfade starten
    const pathAnimation = Animated.timing(dashAnim, {
      toValue: 0,
      duration: 2000,
      useNativeDriver: false,
    });
    
    // Animation für Text mit Verzögerung starten
    const textFadeIn = Animated.timing(textOpacity, {
      toValue: 1,
      duration: 800,
      delay: 1000, // 1 Sekunde verzögern
      useNativeDriver: false,
    });
    
    const textGrow = Animated.timing(textScale, {
      toValue: 1,
      duration: 800,
      delay: 1000, // 1 Sekunde verzögern
      useNativeDriver: false,
    });
    
    // Beide Animationen parallel ausführen
    Animated.parallel([
      pathAnimation, 
      textFadeIn,
      textGrow
    ]).start();
    
  }, [dashAnim, textOpacity, textScale]);

  return (
    <Svg
      width="420"
      height="210"
      viewBox="0 0 220 100"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Hintergrund transparent */}
      <Rect width="100%" height="100%" fill="none" />

      {/* Linkes Kettenglied - Hauptteil */}
      <AnimatedPath
        d="
          M 20,60
          V 40
          A 20,20 0 0 1 40,20 
          H 105 
          A 20,20 0 0 1 120,40
          V 60 
          A 20,20 0 0 1 100,80 
          H 50
        "
        fill="none"
        stroke={strokeColor}
        strokeWidth="8"
        transform="rotate(180,70,50)"
        strokeDasharray={dashLength}
        strokeDashoffset={dashAnim}
      />

      {/* Linkes Kettenglied - unterer Arc (transparent) */}
      <AnimatedPath
        d="
          M 50,80
          A 20,20 0 0 1 20,60
          Z
        "
        fill="none"
        stroke={`${strokeColor}00`} // 00 bedeutet vollständig transparent
        strokeWidth="8"
        transform="rotate(180,70,50)"
        strokeDasharray={dashLength}
        strokeDashoffset={dashAnim}
      />

      {/* Rechtes Kettenglied - Hauptteil */}
      <AnimatedPath
        d="
          M 100,60
          V 40
          A 20,20 0 0 1 120,20 
          H 180 
          A 20,20 0 0 1 200,40 
          V 60 
          A 20,20 0 0 1 180,80 
          H 130
        "
        fill="none"
        stroke={strokeColor}
        strokeWidth="8"
        strokeDasharray={dashLength}
        strokeDashoffset={dashAnim}
      />

      {/* Rechtes Kettenglied - unterer Arc (transparent) */}
      <AnimatedPath
        d="
          M 130,80
          A 20,20 0 0 1 100,60         
          Z
        "
        fill="none"
        stroke={`${strokeColor}00`} // 00 bedeutet vollständig transparent
        strokeWidth="8"
        strokeDasharray={dashLength}
        strokeDashoffset={dashAnim}
      />

      {/* Text BROKE im linken Kettenglied - jetzt animiert */}
      <AnimatedSvgText
        x="55"
        y="55"
        fontFamily="Arial, sans-serif"
        fontSize="14"
        fill={textColor}
        textAnchor="middle"
        opacity={textOpacity}
        scaleX={textScale}
        scaleY={textScale}
        originX="55"
        originY="55"
      >
        BROKE
      </AnimatedSvgText>

      {/* Text CHAIN im rechten Kettenglied - jetzt animiert */}
      <AnimatedSvgText
        x="152"
        y="55"
        fontFamily="Arial, sans-serif"
        fontSize="14"
        fill={textColor2}
        textAnchor="middle"
        opacity={textOpacity}
        scaleX={textScale}
        scaleY={textScale}
        originX="152"
        originY="55"
      >
        CHAIN
      </AnimatedSvgText>
    </Svg>
  );
}
