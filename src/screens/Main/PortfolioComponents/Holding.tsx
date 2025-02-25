import React from "react";
import { useNavigation, NavigationProp } from "@react-navigation/native"; // geändert
import { RootStackParamList } from "@/src/navigation/types";
import { FlatList, View, Image, Text } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import Sparkline from "@/src/components/Sparkline";
import Card from "@/src/components/Card";
import { createStyles } from "@/src/screens/Main/PortfolioComponents/portfolioStyles";
import { formatCurrency } from "@/src/utils/formatCurrency";

interface HoldingProps {
  data: any[];
  theme: any;
}

export default function Holding({ data, theme }: HoldingProps) {
  const styles = createStyles(theme);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>(); // geändert
  console.log(data);
  return (
    <Animated.FlatList
      data={data}
      style={styles.list}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item, index }) => (
        <Animated.View entering={FadeInUp.delay(index * 50)}>
          <Card
            onPress={() => {
              navigation.navigate("Trade", { coin: item.marketInfo || item });
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
                
                {item.marketInfo?.symbol ? `${item.marketInfo.name}` : ""}
              </Text>
              {item.marketInfo && (
                <Sparkline
                  prices={item.marketInfo.sparkline.price}
                  width={100}
                  height={20}
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
                    style={
                      item.marketInfo.price_change_percentage_24h < 0
                        ? { color: "red", marginHorizontal: 8 }
                        : { color: "green", marginHorizontal: 8 }
                    }
                  >
                    {item.marketInfo.price_change_percentage_24h.toFixed(2)}%
                  </Text>
                  <Text style={{ color: theme.text }}>
                    {formatCurrency(
                      item.amount * item.marketInfo.current_price
                    )}
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
