import React from "react";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "@/src/types/types";
import { FlatList, Image, Text, View, Platform } from "react-native";
import Card from "@/src/components/Card";
import Animated, { FadeInUp } from "react-native-reanimated";
import Sparkline from "@/src/components/Sparkline";
import { createStyles } from "@/src/components/PortfolioComponents/portfolioStyles";
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
              marginHorizontal: Platform.OS === "web" ? 0 : "auto",
              width: Platform.OS === "web" ? "100%" : "95%",
              marginTop: 8,
            }}
          >
            {/* Erste Zeile: Icon, Name und Sparkline */}
            <View style={{ 
              flexDirection: "row", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginVertical: 4 
            }}>
              <Image 
                source={{ uri: item.image }} 
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  marginRight: 8,
                }} 
              />
              <Text style={[styles.labelText, { flex: 1, marginLeft: 8 }]}>
                {item.name}
              </Text>
              <View style={{ 
                width: 100, 
                height: 40, 
                overflow: "visible",
                marginLeft: 8
              }}>
                <Sparkline
                  prices={item.sparkline.price}
                  width={100}
                  height={32}
                  stroke={theme.accent}
                  strokeWidth={1.5}
                  maxDataPoints={20}
                  // Explizit den staticFlag auf false setzen, um Animation zu ermöglichen
                  staticFlag={false}
                />
              </View>
            </View>
            
            {/* Trennlinie */}
            <View style={{ height: 1, backgroundColor: "gray", marginVertical: 4 }} />
            
            {/* Zweite Zeile: Preis und 24h-Änderung */}
            <View style={{ 
              flexDirection: "row", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginVertical: 4 
            }}>
              <Text style={{ 
                fontFamily: "monospace", 
                fontWeight: "bold", 
                color: theme.text,
                fontSize: 16, 
                textDecorationLine: "underline", 
                textDecorationColor: theme.accent 
              }}>
                {formatCurrency(item.current_price)}
              </Text>
              <Text>
                <Text style={{ fontWeight: "bold", color: theme.text, fontSize: 12 }}>
                  24h:{" "}
                </Text>
                <Text style={{ 
                  color: item.price_change_percentage_24h < 0 ? "red" : "green",
                  fontFamily: "monospace",
                  fontWeight: "bold" 
                }}>
                  {item.price_change_percentage_24h.toFixed(2)}%
                </Text>
              </Text>
            </View>
            
            {/* Dritte Zeile: High und Low */}
            <View style={{ 
              flexDirection: "row", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginVertical: 4 
            }}>
              <Text style={{ color: theme.text }}>
                <Text style={{ fontWeight: "bold", color: theme.text }}>High:</Text>
                <Text style={{ fontFamily: "monospace", color: "grey" }}>
                  {" "}{formatCurrency(item.high_24h)}
                </Text>
              </Text>
              <Text style={{ color: theme.text }}>
                <Text style={{ fontWeight: "bold", color: theme.text }}>Low:</Text>
                <Text style={{ fontFamily: "monospace", color: "grey" }}>
                  {" "}{formatCurrency(item.low_24h)}
                </Text>
              </Text>
            </View>
            
            {/* Vierte Zeile: Volumen und Marketcap */}
            <View style={{ 
              flexDirection: "row", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginVertical: 4 
            }}>
              <Text style={{ color: theme.text }}>
                <Text style={{ fontWeight: "bold", color: theme.text }}>Vol:</Text>
                <Text style={{ fontFamily: "monospace", color: "grey" }}>
                  {" "}{formatCurrency(item.total_volume)}
                </Text>
              </Text>
              <Text style={{ color: theme.text }}>
                <Text style={{ fontWeight: "bold", color: theme.text }}>Cap:</Text>
                <Text style={{ fontFamily: "monospace", color: "grey" }}>
                  {" "}{formatCurrency(item.market_cap)}
                </Text>
              </Text>
            </View>
          </Card>
        </Animated.View>
      )}
    />
  );
}
