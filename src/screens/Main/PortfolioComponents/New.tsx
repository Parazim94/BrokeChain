import React from "react";
import { useNavigation, NavigationProp } from "@react-navigation/native"; // geändert
import { RootStackParamList } from "@/src/navigation/types"; 
import { useTrade } from "@/src/context/TradeContext";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Image, Text, View } from "react-native";
import Card from "@/src/components/Card";
import Sparkline from "@/src/components/Sparkline";
import { createStyles } from "@/src/screens/Main/PortfolioComponents/portfolioStyles";

interface NewProps {
  data: any[];
  theme: any;
}

export default function New({ data, theme }: NewProps) {
  const styles = createStyles(theme);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>(); // geändert
  const { setSelectedCoin } = useTrade();

  return (
    <Animated.FlatList
      data={data}
      style={styles.list}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item, index }) => (
        <Animated.View entering={FadeInUp.delay(index * 50)}>
          <Card
            onPress={() => {
              setSelectedCoin(item.marketInfo || item);
              navigation.navigate("Trade");
            }}
            style={styles.card}
          >
            {/* Zeile 1: Bild, Name und Sparkline */}
            <View style={styles.row}>
              {item.marketInfo && (
                <Image
                  source={{ uri: item.marketInfo.image }}
                  style={styles.coinIconLarge}
                />
              )}
              <Text style={styles.marketName}>
                {item.coinId} {item.marketInfo?.symbol ? `(${item.marketInfo.symbol})` : ""}
              </Text>
              {item.marketInfo && (
                <Sparkline
                  prices={item.marketInfo.sparkline.price}
                  width={100}
                  height={40}
                  stroke={theme.accent}
                  strokeWidth={2}
                />
              )}
            </View>
            {/* Zeile 2: Amount, 24h-Änderung und Value */}
            <View style={styles.row}>
              <Text style={styles.amount}>
                {item.amount} {item.marketInfo?.symbol || ""}
              </Text>
              {item.marketInfo && (
                <>
                  <Text
                    style={{
                      color:
                        item.marketInfo.price_change_percentage_24h < 0
                          ? "red"
                          : "green",
                      marginHorizontal: 8,
                    }}
                  >
                    {item.marketInfo.price_change_percentage_24h.toFixed(2)}%
                  </Text>
                  <Text style={{ color: theme.text }}>
                    {(
                      item.amount * item.marketInfo.current_price
                    ).toLocaleString()} $
                  </Text>
                </>
              )}
            </View>
          </Card>
        </Animated.View>
      )}
    />
  );
}
