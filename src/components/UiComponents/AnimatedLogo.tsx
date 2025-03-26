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
  
  // Text-Arrays für die Buchstaben
  const brokeText = "BROKE".split("");
  const chainText = "CHAIN".split("");
  
  // Animationswerte für jeden Buchstaben erstellen
  const brokeAnims = useRef(brokeText.map(() => new Animated.Value(0))).current;
  const chainAnims = useRef(chainText.map(() => new Animated.Value(0))).current;
  
  const { theme } = useContext(ThemeContext);
  const { isLoggedIn } = useContext(AuthContext);

  // Farbwerte basierend auf Login-Status
  const strokeColor = isLoggedIn ? theme.accent : "#00a9d7";
  const textColor = isLoggedIn ? theme.accent : "#00a9d7";
  const textColor2 = isLoggedIn ? theme.accent : "#00AEEF";

  useEffect(() => {
    // Funktion zur Animation eines Buchstabens mit Verzögerung
    const animateLetters = (
      letterAnims: Animated.Value[],
      startDelay: number = 0,
      letterDelay: number = 100
    ) => {
      return letterAnims.map((anim, index) => {
        return Animated.timing(anim, {
          toValue: 1,
          duration: 300,
          delay: startDelay + index * letterDelay,
          useNativeDriver: false,
        });
      });
    };

    // Animation für Kettenglied-Pfad
    const chainAnimation = Animated.timing(dashAnim, {
      toValue: 0,
      duration: 1800,
      useNativeDriver: false,
    });
    
    // Alle Animationen parallel ausführen
    Animated.parallel([
      // Kettenglied animieren
      chainAnimation,
      
   
      ...animateLetters(brokeAnims, 200),          
      ...animateLetters(chainAnims, 200 + brokeText.length * 120)  
    ]).start();
    
  }, [dashAnim, brokeAnims, chainAnims, brokeText.length]);

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
        strokeWidth="12"
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
        strokeWidth="12"
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
        strokeWidth="11"
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
        strokeWidth="11"
        strokeDasharray={dashLength}
        strokeDashoffset={dashAnim}
      />

      {/* Text BROKE als einzelne animierte Buchstaben */}
      {brokeText.map((letter, index) => {
      
        const letterWidth = 12; 
        const startX = 60 - ((brokeText.length - 1) * letterWidth) / 2; 
        const x = startX + index * letterWidth;
        
        return (
          <AnimatedSvgText
            key={`broke-${index}`}
            x={x.toString()}
            y="55"
            fontFamily="Arial, sans-serif"
            fontSize="16"
            fill={textColor}
            textAnchor="middle"
            opacity={brokeAnims[index]} // Jeder Buchstabe hat seine eigene Animation
            fontWeight="bold"
          >
            {letter}
          </AnimatedSvgText>
        );
      })}

      {/* Text CHAIN als einzelne animierte Buchstaben */}
      {chainText.map((letter, index) => {
        // Angepasste Buchstabenbreiten mit besonderem Fokus auf das "i"
        const letterWidths = {
          'C': 12,
          'H': 12,
          'A': 12,
          'I': 6,  // Schmaler für das i
          'N': 12
        };
        
        // Berechne Position basierend auf den variablen Breiten
        let x = 130; // Startposition
        
        // Addiere die Breiten der vorherigen Buchstaben
        for (let i = 0; i < index; i++) {
          x += letterWidths[chainText[i] as keyof typeof letterWidths];
        }
        
        // Füge die halbe Breite des aktuellen Buchstabens hinzu für zentrierte Positionierung
        x += letterWidths[letter as keyof typeof letterWidths] / 2;
        
        return (
          <AnimatedSvgText
            key={`chain-${index}`}
            x={x.toString()}
            y="55"
            fontFamily="Arial, sans-serif"
            fontSize="16"
            fill={textColor2}
            textAnchor="middle"
            opacity={chainAnims[index]}
            fontWeight="bold"
          >
            {letter}
          </AnimatedSvgText>
        );
      })}
    </Svg>
  );
}
