import React from "react";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "@/src/navigation/types";
import { FlatList, Image, Text, View } from "react-native";
import Card from "@/src/components/Card";
import Animated, { FadeInUp } from "react-native-reanimated";
import Sparkline from "@/src/components/Sparkline";
import { createStyles } from "@/src/screens/Main/PortfolioComponents/portfolioStyles";
import { formatCurrency } from "@/src/utils/formatCurrency";

interface FavProps {
  data: any[];
  theme: any;
}

export default function Fav({ data, theme }: FavProps) {
  const styles = createStyles(theme);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <Animated.FlatList
      data={data}
      style={styles.list}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <Animated.View entering={FadeInUp.delay(index * 50)}>
          <Card
            onPress={() => {
              navigation.navigate("Trade", { coin: item });
            }}
            style={styles.card}
          >
            {/* Erste Zeile: Icon, Name und Sparkline */}
            <View style={styles.row}>
              <Image source={{ uri: item.image }} style={styles.coinIcon} />
              <Text style={[styles.labelText, { flex: 1, marginLeft: 8 }]}>
                {item.name}
              </Text>
              <Sparkline
                prices={item.sparkline.price}
                width={100}
                height={30}
                stroke={theme.accent}
                strokeWidth={2}
              />
            </View>
            {/** Separator */}
            <View style={styles.hr} />
            {/* Zweite Zeile: Preis und 24h-Änderung */}
            <View style={styles.row}>
              <Text style={{ fontFamily: "monospace", color: theme.text }}>
                {formatCurrency(item.current_price)}
              </Text>
              <Text
                style={
                  item.price_change_percentage_24h < 0
                    ? { color: "red" }
                    : { color: "green" }
                }
              >
                {item.price_change_percentage_24h.toFixed(2)}%
              </Text>
            </View>
            {/* Dritte Zeile: High und Low */}
            <View style={styles.row}>
              <Text style={{ color: theme.text }}>
                <Text style={styles.labelText}>High:</Text>{" "}
                {formatCurrency(item.high_24h)}
              </Text>
              <Text style={{ color: theme.text }}>
                <Text style={styles.labelText}>Low:</Text>{" "}
                {formatCurrency(item.low_24h)}
              </Text>
            </View>
            {/* Vierte Zeile: Volumen und Marketcap */}
            <View style={styles.row}>
              <Text style={{ color: theme.text }}>
                <Text style={styles.labelText}>Vol:</Text> {formatCurrency(item.total_volume)}
              </Text>
              <Text style={{ color: theme.text }}>
                <Text style={styles.labelText}>Cap:</Text> {formatCurrency(item.market_cap)}
              </Text>
            </View>
          </Card>
        </Animated.View>
      )}
    />
  );
}
