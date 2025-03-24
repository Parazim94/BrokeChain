import React from "react";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "@/src/types/types";
import { FlatList, Image, Text, View, Platform, useWindowDimensions, StyleSheet } from "react-native";
import Card from "@/src/components/UiComponents/Card";
import Animated, { FadeInUp } from "react-native-reanimated";
import Sparkline from "@/src/components/UiComponents/Sparkline";
import { createStyles } from "@/src/components/PortfolioComponents/portfolioStyles";
import { formatCurrency } from "@/src/utils/formatCurrency";

interface FavProps {
  data: any[];
  theme: any;
}

export default function Fav({ data, theme }: FavProps) {
  const styles = createStyles(theme);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { width: screenWidth } = useWindowDimensions();

  const localStyles = StyleSheet.create({
    cardContent: { flexDirection: "row", width: "100%" },
    logoContainer: { padding: 8, alignItems: "center", justifyContent: "center" },
    coinIcon: { width: 48, height: 48, borderRadius: 16, marginRight: 8 },
    gridContainer: { flex: 1, paddingLeft: 8, width: "100%" },
    gridRow: { flexDirection: "row", alignItems: "center", marginVertical: 4 },
    col1: { width: "20%", paddingRight: 5 },
    col2: { width: "30%", paddingRight: 5, alignItems: "center" },
    col3: { width: "20%", paddingRight: 5, alignItems: "center" },
    col4: { width: "30%", alignItems: "flex-end", justifyContent: "flex-end" },
    hr: { height: 1, backgroundColor: "gray", marginVertical: 4 },
    monoText: { fontFamily: "monospace", fontWeight: "bold" },
    labelText: { fontWeight: "bold", marginRight: 4, color: theme.text },
    sparklineContainer: { alignSelf: "flex-end", alignItems: "flex-end", width: "100%" },
  });

  return (
    <Animated.FlatList
      data={data}
      style={[styles.list, { width: '100%' }]}
      contentContainerStyle={{ paddingHorizontal: 0 }}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <Animated.View 
          entering={FadeInUp.delay(index * 50)}
          style={{ width: '100%' }}
        >
          <Card
            onPress={() => {
              navigation.navigate("Trade", { coin: item });
            }}
            style={{ 
              backgroundColor: theme.background,
              maxWidth: "100%",
              minWidth: 280,
              marginTop: 8,
              width: screenWidth < 1024 ? "95%" : (Platform.OS === "web" ? "100%" : "95%"),
              marginHorizontal: screenWidth < 1024 ? "auto" : (Platform.OS === "web" ? 0 : "auto")
            }}
          >
            {Platform.OS === "web" && window.innerWidth >= 768 ? (
              <>
                {/* --- Fav Web View: Zeile 1 (Logo, Name, Preise) --- */}
                <View style={localStyles.cardContent}>
                  <View style={localStyles.logoContainer}>
                    <Image 
                      source={{ uri: item.image }} 
                      style={localStyles.coinIcon} 
                      resizeMode="cover"
                    />
                  </View>
                  <View style={localStyles.gridContainer}>
                    <View style={localStyles.gridRow}>
                      <View style={localStyles.col1}>
                        <Text style={localStyles.labelText}>{item.name}</Text>
                      </View>
                      <View style={localStyles.col2}>
                        <Text style={[localStyles.labelText, localStyles.monoText, { fontSize: 16, textDecorationLine: "underline" }]}>
                          {formatCurrency(item.current_price)}
                        </Text>
                      </View>
                      <View style={localStyles.col3}>
                        <Text style={[{ color: item.price_change_percentage_24h < 0 ? "red" : "green" }, localStyles.monoText]}>
                          {item.price_change_percentage_24h.toFixed(2)}%
                        </Text>
                      </View>
                      <View style={localStyles.col4}>
                        <View style={localStyles.sparklineContainer}>
                          <Sparkline
                            prices={item.sparkline.price}
                            width={100}
                            height={30}
                            stroke={theme.accent}
                            maxDataPoints={15}
                          />
                        </View>
                      </View>
                    </View>
                    {/* --- Fav Web View: Zeile 2 (High, Low, Vol, Cap) --- */}
                    <View style={localStyles.hr} />
                    <View style={localStyles.gridRow}>
                      <View style={localStyles.col1}>
                        <Text style={{ color: theme.text }}>
                          <Text style={localStyles.labelText}>High: </Text>
                          <Text style={[localStyles.monoText, { color: "grey" }]}>{formatCurrency(item.high_24h)}</Text>
                        </Text>
                      </View>
                      <View style={localStyles.col2}>
                        <Text style={{ color: theme.text }}>
                          <Text style={localStyles.labelText}>Low: </Text>
                          <Text style={[localStyles.monoText, { color: "grey" }]}>{formatCurrency(item.low_24h)}</Text>
                        </Text>
                      </View>
                      <View style={localStyles.col3}>
                        <Text style={{ color: theme.text }}>
                          <Text style={localStyles.labelText}>Vol: </Text>
                          <Text style={[localStyles.monoText, { color: "grey" }]}>{formatCurrency(item.total_volume)}</Text>
                        </Text>
                      </View>
                      <View style={localStyles.col4}>
                        <Text style={{ color: theme.text, textAlign: "right" }}>
                          <Text style={localStyles.labelText}>Cap: </Text>
                          <Text style={[localStyles.monoText, { color: "grey" }]}>{formatCurrency(item.market_cap)}</Text>
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                {/* --- Ende Fav Web View --- */}
              </>
            ) : (
              <View style={localStyles.cardContent}>
                <View style={localStyles.logoContainer}>
                  <Image 
                    source={{ uri: item.image }} 
                    style={localStyles.coinIcon} 
                    resizeMode="cover"
                  />
                </View>
                <View style={localStyles.gridContainer}>
                  <View style={localStyles.gridRow}>
                    <View style={[localStyles.col1, { width: "50%" }]}>
                      <Text style={localStyles.labelText}>{item.name}</Text>
                    </View>
                    <View style={[localStyles.col4, { width: "50%" }]}>
                      <View style={localStyles.sparklineContainer}>
                        <Sparkline
                          prices={item.sparkline.price}
                          width={100}
                          height={30}
                          stroke={theme.accent}
                          maxDataPoints={15}
                        />
                      </View>
                    </View>
                  </View>
                  <View style={localStyles.hr} />
                  <View style={localStyles.gridRow}>
                    <View style={[localStyles.col1, { width: "50%" }]}>
                      <Text style={[localStyles.labelText, localStyles.monoText, { fontSize: 16, textDecorationLine: "underline", textDecorationColor: theme.accent }]}>
                        {formatCurrency(item.current_price)}
                      </Text>
                    </View>
                    <View style={[localStyles.col2, { width: "50%", alignItems: "flex-end" }]}>
                      <Text>
                        <Text style={[localStyles.labelText, { fontSize: 12 }]}>24h: </Text>
                        <Text style={[{ color: item.price_change_percentage_24h < 0 ? "red" : "green" }, localStyles.monoText]}>
                          {item.price_change_percentage_24h.toFixed(2)}%
                        </Text>
                      </Text>
                    </View>
                  </View>
                  <View style={localStyles.gridRow}>
                    <View style={[localStyles.col1, { width: "50%" }]}>
                      <Text style={{ color: theme.text }}>
                        <Text style={localStyles.labelText}>High: </Text>
                        <Text style={[localStyles.monoText, { color: "grey" }]}>{formatCurrency(item.high_24h)}</Text>
                      </Text>
                    </View>
                    <View style={[localStyles.col2, { width: "50%", alignItems: "flex-end" }]}>
                      <Text style={{ color: theme.text }}>
                        <Text style={localStyles.labelText}>Low: </Text>
                        <Text style={[localStyles.monoText, { color: "grey" }]}>{formatCurrency(item.low_24h)}</Text>
                      </Text>
                    </View>
                  </View>
                  <View style={localStyles.gridRow}>
                    <View style={{ width: "50%" }}>
                      <Text style={{ color: theme.text }}>
                        <Text style={localStyles.labelText}>Vol: </Text>
                        <Text style={[localStyles.monoText, { color: "grey" }]}>{formatCurrency(item.total_volume)}</Text>
                      </Text>
                    </View>
                    <View style={{ width: "50%", alignItems: "flex-end" }}>
                      <Text style={{ color: theme.text, textAlign: "left" }}>
                        <Text style={localStyles.labelText}>Cap: </Text>
                        <Text style={[localStyles.monoText, { color: "grey" }]}>{formatCurrency(item.market_cap)}</Text>
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </Card>
        </Animated.View>
      )}
    />
  );
}
