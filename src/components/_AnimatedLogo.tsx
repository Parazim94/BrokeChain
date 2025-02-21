import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import Svg, { Rect, Text as SvgText } from "react-native-svg";
import { Path } from "react-native-svg";

const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function AnimatedLogo() {
  const dashLength = 300;
  const dashAnim = useRef(new Animated.Value(dashLength)).current;

  useEffect(() => {
    Animated.timing(dashAnim, {
      toValue: 0,
      duration: 2000,
      useNativeDriver: false,
    }).start();
  }, [dashAnim]);

  return (
    <Svg
      width="110"
      height="55"
      viewBox="0 0 220 100"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Hintergrund transparent */}
      <Rect width="100%" height="100%" fill="none" />
   
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
          A 20,20 0 20 1 20,60 
          Z
        "
        fill="none"
        stroke="#00a9d7"
        strokeWidth="8"
        transform="rotate(180,70,50)"
        strokeDasharray={dashLength}
        strokeDashoffset={dashAnim}
      />

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
          A 20,20 0 20 1 100,30 
          Z
        "
        fill="none"
        stroke="#00a9d7"
        strokeWidth="8"
        strokeDasharray={dashLength}
        strokeDashoffset={dashAnim}
      />
      {/* Text BROKE im linken Kettenglied */}
      <SvgText
        x="55"
        y="55"
        fontFamily="Arial, sans-serif"
        fontSize="14"
        fill="#00a9d7"
        textAnchor="middle"
      >
        BROKE
      </SvgText>
      {/* Text CHAIN im rechten Kettenglied */}
      <SvgText
        x="152"
        y="55"
        fontFamily="Arial, sans-serif"
        fontSize="14"
        fill="#00AEEF"
        textAnchor="middle"
      >
        CHAIN
      </SvgText>
    </Svg>
  );
}
