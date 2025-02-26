import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Sparkline from "@/src/components/Sparkline";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { createStyles as createGlobalStyles } from "@/src/styles/style";

interface UserInfoProps {
  userName: string;  // jetzt als Prop definiert
  cash: number;
  positionsValue: number;
  combinedValue: number;
  history: { total: number; date: string }[];
  theme: any;
  styles: any;
}

export default function UserInfo({
  userName,
  cash,
  positionsValue,
  combinedValue,
  history,
  theme,
  styles,
}: UserInfoProps) {
  const globalStyles = createGlobalStyles();
  
  // Interne History-Auswahl, initial "360d"
  const [localHistory, setLocalHistory] = React.useState("360d");
  const historyOptions = ["7d", "30d", "360d"];
  
  let dataPoints = 7;
  switch (localHistory) {
    case "30d":
      dataPoints = 30;
      break;
    case "360d":
      dataPoints = 360;
      break;
    default:
      dataPoints = 7;
  }
  const historyData = history.slice(-dataPoints);
  const historyValues = historyData.map(item => item.total);
  
  return (
    <View
      style={[
        {
          maxWidth: 1024,
          margin: "auto",
          width: "95%",
          marginTop: 10,
          padding: 10,
          backgroundColor: theme.background,
        },
        globalStyles.sparklineShadow,
      ]}
    >
      <View style={styles.row}>
        <Text style={styles.header}>{userName}</Text>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        <View style={{ width: "50%", padding: 4 }}>
          <Text style={{ color: theme.text, fontSize: 16 }}>Cash</Text>
        </View>
        <View style={{ width: "50%", padding: 4 }}>
          <Text style={{ color: theme.text, fontSize: 16, textAlign: "right" }}>
            {formatCurrency(cash)}
          </Text>
        </View>
        <View style={{ width: "50%", padding: 4 }}>
          <Text style={{ color: theme.text, fontSize: 16 }}>Positions</Text>
        </View>
        <View style={{ width: "50%", padding: 4 }}>
          <Text style={{ color: theme.text, fontSize: 16, textAlign: "right" }}>
            {formatCurrency(positionsValue)}
          </Text>
        </View>
        <View style={{ width: "50%", padding: 4 }}>
          <Text style={{ color: theme.accent, fontSize: 16 }}>Total</Text>
        </View>
        <View style={{ width: "50%", padding: 4 }}>
          <Text style={{ color: theme.accent, fontSize: 16, textAlign: "right" }}>
            {formatCurrency(combinedValue)}
          </Text>
        </View>
      </View>
      {/* Neuer horizontaler History-Switch (intern) */}
      <View style={{ flexDirection: "row", justifyContent: "flex-start", marginVertical: 8 }}>
        {historyOptions.map((opt) => (
          <TouchableOpacity
            key={opt}
            onPress={() => setLocalHistory(opt)}
            style={[
              styles.intervalButton,
              { marginHorizontal: 4 },
              localHistory === opt && styles.intervalButtonActive,
            ]}
          >
            <Text style={localHistory === opt ? styles.intervalTextActive : styles.intervalText}>
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.sparklineContainer}>
        <Sparkline
          prices={historyValues}
          width="100%"
          height={80}
          stroke={theme.accent}
          strokeWidth={2}
        />
      </View>
    </View>
  );
}