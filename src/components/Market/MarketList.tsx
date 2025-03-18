import React from "react";
import Animated from "react-native-reanimated";
import { 
  StyleSheet, 
  View, 
  Text, 
  RefreshControl, 
  Image, 
  Platform, 
  ImageStyle, 
  StyleProp, 
  ImageSourcePropType,
  ImageResizeMode
} from "react-native";
import Card from "@/src/components/Card";
import Sparkline from "@/src/components/Market/Sparkline";
import { formatCurrency } from "@/src/utils/formatCurrency";

// Typdefinition für die PlatformImage-Props
interface PlatformImageProps {
  source: ImageSourcePropType;
  style: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
}


const PlatformImage: React.FC<PlatformImageProps> = ({ source, style, resizeMode }) => {
  return <Image source={source} style={style} resizeMode={resizeMode} />;
};

export interface Ticker {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
  total_volume: number;
  market_cap: number;
  image: string;
  sparkline: { price: number[] };
}

interface MarketListProps {
  tickers: Ticker[];
  onPressItem: (item: Ticker) => void;
  accentColor: string;
  defaultTextColor: string;
  containerBackground: string;
  onRefresh?: () => Promise<any>;
}

export default function MarketList({
  tickers,
  onPressItem,
  accentColor,
  defaultTextColor,
  containerBackground,
  onRefresh,
}: MarketListProps) {
  const localStyles = StyleSheet.create({
    cardStyle: {
      backgroundColor: containerBackground,
      maxWidth: 1024,
      minWidth: 280,
      marginHorizontal: "auto",
      width: "95%",
      marginTop: 8,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginVertical: 4,
    },
    rowCenter: {
      alignItems: "center",
    },
    coinIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      marginRight: 8,
    },
    labelText: {
      fontWeight: "bold",
      marginRight: 4,
      color: defaultTextColor,
    },
    flexText: {
      marginLeft: 8,
      flex: 1,
    },
    hr: {
      height: 1,
      backgroundColor: "gray",
      marginVertical: 4,
    },
    monoText: {
      fontFamily: "monospace",    
      fontWeight: "bold",
    },
    cardContent: {
      flexDirection: "row",
      width: "100%",
    },
    logoContainer: {
      padding: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    gridContainer: {
      flex: 1,
      paddingLeft: 8,
      width: "100%",
    },
    gridRow: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 4,
    },
    col1: { width: "20%", paddingRight: 5 },
    col2: { width: "30%", paddingRight: 5, alignItems:"center" },
    col3: { width: "20%", paddingRight: 5, alignItems:"center" },
    col4: { 
      width: "30%", 
      alignItems: "flex-end", // Rechtsbündige Ausrichtung
      justifyContent: "flex-end" // Zusätzliche Ausrichtung
    },
    // Fix für die Sparkline damit sie rechts erscheint
    sparklineContainer: {
      alignSelf: "flex-end",
      alignItems: "flex-end",
      width: "100%"
    },
  });

  return (
    <View style={{ flex: 1 }}>
      <Animated.FlatList
        data={tickers}
        keyExtractor={(item) => item.id}
        initialNumToRender={8} // Reduzieren der initial gerenderten Elemente
        maxToRenderPerBatch={5} // Reduzieren der Batch-Größe
        windowSize={10} // Kleineres Fenster für bessere Performance
        removeClippedSubviews={Platform.OS !== 'web'} // Auf Web kann dies Probleme verursachen
        renderItem={({ item }) => {
          return (
            <Animated.View>

              {/* webview */}
              <Card onPress={() => onPressItem(item)} style={localStyles.cardStyle}>
                {Platform.OS === "web" && window.innerWidth >= 768 ? (
                  <View style={localStyles.cardContent}>
                    {/* Logo Container */}
                    <View style={localStyles.logoContainer}>
                      <PlatformImage
                        source={{ uri: item.image }}
                        style={localStyles.coinIcon}
                        resizeMode="cover"
                      />
                    </View>
                    
                    {/* Grid Container */}
                    <View style={localStyles.gridContainer}>
                      {/* Zeile 1: Name, Preis, Change, Sparkline */}
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
                              stroke={accentColor}
                              maxDataPoints={15}
                            />
                          </View>
                        </View>
                      </View>

                      {/* Zeile 2: hr */}
                      <View style={localStyles.hr} />

                      {/* Zeile 3: High, Low, Vol, Cap */}
                      <View style={localStyles.gridRow}>
                        <View style={localStyles.col1}>
                          <Text style={{ color: defaultTextColor }}>
                            <Text style={localStyles.labelText}>High: </Text>
                            <Text style={[localStyles.monoText, { color: "grey" }]}>{formatCurrency(item.high_24h)}</Text>
                          </Text>
                        </View>
                        <View style={localStyles.col2}>
                          <Text style={{ color: defaultTextColor }}>
                            <Text style={localStyles.labelText}>Low: </Text>
                            <Text style={[localStyles.monoText, { color: "grey" }]}>{formatCurrency(item.low_24h)}</Text>
                          </Text>
                        </View>
                        <View style={localStyles.col3}>
                          <Text style={{ color: defaultTextColor }}>
                            <Text style={localStyles.labelText}>Vol: </Text>
                            <Text style={[localStyles.monoText, { color: "grey" }]}>{formatCurrency(item.total_volume)}</Text>
                          </Text>
                        </View>
                        <View style={localStyles.col4}>
                          <Text style={{ color: defaultTextColor, textAlign: "right" }}>
                            <Text style={localStyles.labelText}>Cap: </Text>
                            <Text style={[localStyles.monoText, { color: "grey" }]}>{formatCurrency(item.market_cap)}</Text>
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ) : (

                  // mobile view1
                  <View style={localStyles.cardContent}>
                    {/* Logo Container */}
                    <View style={localStyles.logoContainer}>
                      <PlatformImage
                        source={{ uri: item.image }} 
                        style={localStyles.coinIcon} 
                        resizeMode="cover"
                      />
                    </View>
                    
                    {/* Grid Container */}
                    <View style={localStyles.gridContainer}>
                      {/* Zeile 1: Name, Sparkline */}
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
                              stroke={accentColor} 
                              maxDataPoints={15} // Auf 15 Datenpunkte reduzieren für bessere Performance
                            />
                          </View>
                        </View>
                      </View>
                      <View style={localStyles.hr} />
                      <View style={localStyles.gridRow}>
                        <View style={[localStyles.col1, { width: "50%" }]}>
                          <Text style={[localStyles.labelText, localStyles.monoText, { fontSize: 16, textDecorationLine: "underline", textDecorationColor: accentColor }]}>
                            {formatCurrency(item.current_price)}
                          </Text>
                        </View>
                        <View style={[localStyles.col2, { width: "50%",alignItems:"flex-end"  } ]}>
                          <Text>
                            <Text style={[localStyles.labelText, {fontSize:12}]}>24h: </Text>
                            <Text style={[{ color: item.price_change_percentage_24h < 0 ? "red" : "green" }, localStyles.monoText]}>{item.price_change_percentage_24h.toFixed(2)}%</Text> 
                          </Text>
                        </View>
                      </View>
                      <View style={localStyles.gridRow}>
                        <View style={[localStyles.col1, { width: "50%", }]}>
                          <Text style={{ color: defaultTextColor }}>
                            <Text style={localStyles.labelText}>High: </Text>
                            <Text style={[localStyles.monoText, { color: "grey" }]}>
                              {formatCurrency(item.high_24h)}
                            </Text>
                          </Text>
                        </View>
                        <View style={[localStyles.col2, { width: "50%",alignItems:"flex-end" }]}>
                          <Text style={{ color: defaultTextColor }}>
                            <Text style={localStyles.labelText}>Low: </Text>
                            <Text style={[localStyles.monoText, { color: "grey"}]}>
                              {formatCurrency(item.low_24h)}
                            </Text>
                          </Text>
                        </View>
                      </View>
                      <View style={localStyles.gridRow}>
                        <View style={{ width: "50%" }}>
                          <Text style={{ color: defaultTextColor }}>
                            <Text style={localStyles.labelText}>Vol: </Text>
                            <Text style={[localStyles.monoText, { color:"grey" }]}>
                              {formatCurrency(item.total_volume)}
                            </Text>
                          </Text>
                        </View>
                        <View style={{ width: "50%", alignItems: "flex-end" }}>
                          <Text style={{ color: defaultTextColor, textAlign: "left" }}>
                            <Text style={localStyles.labelText}>Cap: </Text>
                            <Text style={[localStyles.monoText, { color:"grey" }]}>
                              {formatCurrency(item.market_cap)}
                            </Text>
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
              </Card>
            </Animated.View>
          );
        }}
        refreshControl={
          onRefresh && (
            <RefreshControl
              refreshing={false}
              onRefresh={onRefresh}
              tintColor={accentColor}
            />
          )
        }
      />
    </View>
  );
}
