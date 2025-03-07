import React from "react";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "@/src/types/types";
import { Image, Text, View, Platform, useWindowDimensions } from "react-native";
import Card from "@/src/components/Card";
import Animated, { FadeInUp } from "react-native-reanimated";
import Sparkline from "@/src/components/Sparkline";
import { createStyles } from "@/src/components/PortfolioComponents/portfolioStyles";
import { formatCurrency } from "@/src/utils/formatCurrency";

interface HoldingProps {
  data: any[];
  theme: any;
}

export default function Holding({ data, theme }: HoldingProps) {
  const styles = createStyles(theme);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { width: screenWidth } = useWindowDimensions();

  return (
    <Animated.FlatList
      data={data}
      style={[styles.list, { width: "100%" }]}
      contentContainerStyle={{ paddingHorizontal: 0 }}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item, index }) => (
        <Animated.View
          entering={FadeInUp.delay(index * 50)}
          style={{ width: "100%" }}
        >
          <Card
            onPress={() => {
              navigation.navigate("Trade", { coin: item.marketInfo });
            }}
            style={{
              ...styles.card,
              width: screenWidth < 1024 ? "95%" : (Platform.OS === "web" ? "100%" : "95%"),
              marginHorizontal: screenWidth < 1024 ? "auto" : (Platform.OS === "web" ? 0 : "auto")
            }}
          >
            {/* Neues Layout: Logo links, Inhalt rechts */}
            <View style={{ flexDirection: "row", width: "100%" }}>
              {/* Logo links, über beide Zeilen */}
              {item.marketInfo && (
                <View style={{ justifyContent: "center", paddingRight: 10 }}>
                  <Image
                    source={{ uri: item.marketInfo.image }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 25,
                    }}
                  />
                </View>
              )}

              {/* Inhalt rechts */}
              <View style={{ flex: 1 }}>
                {/* Erste Zeile: Name und Sparkline */}
                <View style={[styles.row, { width: "100%" }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.marketName}>
                      {item.marketInfo?.name}{" "}
                      {item.marketInfo?.name
                        ? `(${item.marketInfo.symbol.toUpperCase()})`
                        : ""}
                    </Text>
                    {item.marketInfo && (

                    <View style={{ flexDirection: "row" }}>
                      <Text
                        style={{
                          color: "grey",
                          fontSize: 12,
                          fontFamily: "monospace",
                          textAlign: "left",
                        }}
                      >
                        Market: {" "}
                      </Text>
                      <Text style={{ color:theme.accent, fontSize: 12, fontFamily: "monospace" }}>                       
                      {formatCurrency(item.marketInfo.current_price)}
                    </Text>
                    </View>
                    )}
                  </View>
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

                {/* Zweite Zeile: Grid-Layout mit Amount, 24h-Änderung und Value */}
                <View style={styles.gridRow}>
                  <View style={styles.gridCol1}>
                    <Text style={[styles.amount, { fontFamily: "monospace" }]}>
                      {item.amount} {item.marketInfo?.symbol || ""}
                    </Text>
                  </View>
                  {item.marketInfo && (
                    <>
                      <View style={styles.gridCol2}>
                        <Text
                          style={{
                            color:
                              item.marketInfo.price_change_percentage_24h < 0
                                ? "red"
                                : "green",
                            fontFamily: "monospace",
                          }}
                        >
                          {item.marketInfo.price_change_percentage_24h.toFixed(
                            2
                          )}
                          %
                        </Text>
                      </View>
                      <View style={styles.gridCol3}>
                        <Text
                          style={[styles.value, { fontFamily: "monospace" }]}
                        >
                          {formatCurrency(
                            item.amount * item.marketInfo.current_price
                          )}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              </View>
            </View>
          </Card>
        </Animated.View>
      )}
    />
  );
}
