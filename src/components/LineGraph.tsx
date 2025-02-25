import React from "react";
import Sparkline from "@/src/components/Sparkline";

type LineGraphProps = {
  prices: number[];
  stroke?: string;
  width?: number | string;
  height?: number;
};

export default function LineGraph({
  prices,
  stroke = "black",
  width = "100%",
  height = 100,
}: LineGraphProps) {
  return (
    // Gibt intern die Sparkline-Komponente zurück
    <Sparkline
      prices={prices}
      stroke={stroke}
      width={width}
      height={height}
    />
  );
}
