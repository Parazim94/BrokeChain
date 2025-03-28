import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  GestureResponderEvent,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Svg, { Polyline, Path, Defs, LinearGradient, Stop, Circle } from "react-native-svg";
import * as d3Scale from "d3-scale";
import { format } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { createStyles } from "./portfolioStyles";

interface EnhancedSparklineProps {
  prices: number[];
  dates: string[];
  width?: number | string;
  height?: number;
  stroke?: string;
  strokeWidth?: number;
  theme: any;
}

export default function EnhancedSparkline({
  prices,
  dates,
  width = "100%",
  height = 80,
  stroke = "#4CAF50",
  strokeWidth = 2,
  theme,
}: EnhancedSparklineProps) {
  const styles = createStyles(theme);

  // Tooltip state
  const [tooltip, setTooltip] = useState<{
    index: number;
    x: number;
    y: number;
    isVisible: boolean;
    isPersistent: boolean;
  } | null>(null);

  // Container layout
  const [containerLayout, setContainerLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // Calculate margins
  const margin = { top: 5, right: 5, bottom: 5, left: 5 };
  const numericWidth = typeof width === "string" 
    ? Dimensions.get("window").width 
    : width;
  const chartWidth = numericWidth - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Scales
  const xScale = d3Scale
    .scaleLinear()
    .domain([0, prices.length - 1])
    .range([margin.left, chartWidth - margin.right]);

  const minValue = Math.min(...prices);
  const maxValue = Math.max(...prices);
  const yScale = d3Scale
    .scaleLinear()
    .domain([minValue, maxValue])
    .range([chartHeight - margin.bottom, margin.top]);

  // Generate points for polyline
  const points = prices
    .map((price, i) => `${xScale(i)},${yScale(price)}`)
    .join(" ");

  // Generate fill path
  const fillPath =
    `M ${margin.left} ${chartHeight} ` +
    prices
      .map((price, i) => `${xScale(i)} ${yScale(price)}`)
      .join(" ") +
    ` L ${chartWidth} ${chartHeight} Z`;

  // Handle touch/mouse events
  const handleTouch = (event: GestureResponderEvent, isPersistent = false) => {
    if (prices.length === 0) return;

    const { locationX } = event.nativeEvent;
    // Find closest point
    const idx = Math.min(
      Math.max(
        0,
        Math.round(
          ((locationX - margin.left) / (chartWidth - margin.left - margin.right)) *
            (prices.length - 1)
        )
      ),
      prices.length - 1
    );

    // Close persistent tooltip if tapping the same point
    if (
      isPersistent &&
      tooltip &&
      tooltip.isPersistent &&
      tooltip.index === idx
    ) {
      setTooltip(null);
      return;
    }

    // Calculate actual x,y position
    const x = xScale(idx);
    const y = yScale(prices[idx]);

    setTooltip({
      index: idx,
      x,
      y,
      isVisible: true,
      isPersistent,
    });
  };

  // Create pan responder
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => handleTouch(evt),
    onPanResponderMove: (evt) => {
      if (!tooltip || !tooltip.isPersistent) {
        handleTouch(evt);
      }
    },
    onPanResponderRelease: (evt) => handleTouch(evt, true),
  });

  return (
    <View
      style={[styles.sparklineContainer, { height }]}
      onLayout={(event) => {
        const { x, y, width, height } = event.nativeEvent.layout;
        setContainerLayout({ x, y, width, height });
      }}
      {...panResponder.panHandlers}
    >
      <Svg width="100%" height={height}>
        <Defs>
          <LinearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={stroke} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={stroke} stopOpacity="0.05" />
          </LinearGradient>
        </Defs>

        {/* Gradient fill under line */}
        <Path d={fillPath} fill="url(#fillGradient)" />

        {/* Main line */}
        <Polyline
          points={points}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
        />

        {/* Selected point marker */}
        {tooltip && (
          <Circle
            cx={xScale(tooltip.index)}
            cy={yScale(prices[tooltip.index])}
            r={5}
            fill={theme.accent}
            stroke="#fff"
            strokeWidth={2}
          />
        )}
      </Svg>

      {/* Tooltip */}
      {tooltip && tooltip.isVisible && (
        <View
          style={[
            styles.tooltip,
            {
              left: tooltip.x - 75,
              top: tooltip.y - 45,
              backgroundColor: tooltip.isPersistent
                ? `${theme.accent}15`
                : "rgba(0,0,0,0.8)",
              borderWidth: tooltip.isPersistent ? 1 : 0,
              borderColor: `${theme.accent}40`,
            },
          ]}
        >
          <View style={styles.tooltipHeader}>
            <Text
              style={[
                styles.tooltipDate,
                { color: tooltip.isPersistent ? theme.text : "#fff" },
              ]}
            >
              {format(new Date(dates[tooltip.index]), "MMM d, yyyy")}
            </Text>

            {tooltip.isPersistent && (
              <TouchableOpacity onPress={() => setTooltip(null)}>
                <Ionicons name="close-circle" size={16} color="red" />
              </TouchableOpacity>
            )}
          </View>

          <Text
            style={[
              styles.tooltipValue,
              {
                color: tooltip.isPersistent ? theme.accent : "#fff",
                fontWeight: tooltip.isPersistent ? "bold" : "normal",
              },
            ]}
          >
            {formatCurrency(prices[tooltip.index])}
          </Text>
        </View>
      )}
    </View>
  );
}
