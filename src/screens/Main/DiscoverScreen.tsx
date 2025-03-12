import React, { useEffect, useState, useContext } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Platform,
} from "react-native";
import * as Linking from "expo-linking";
import { createStyles } from "../../styles/style";
import { ThemeContext } from "../../context/ThemeContext";
import Card from "@/src/components/Card";
import Button from "@/src/components/Button";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "@/src/types/types";
import { useResponsiveColumns } from "@/src/hooks/useResponsiveColumns";
import CustomModal from "@/src/components/CustomModal";

interface NewsItem {
  guid: string;
  link: string;
  title: string;
  pubDate: string;
  description: string;
  content: string;
  enclosure?: { link: string };
}

export default function CryptoNews() {
  const { theme } = useContext(ThemeContext);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNews, setExpandedNews] = useState<string | null>(null); // bleibt für mobile View
  const [modalNews, setModalNews] = useState<NewsItem | null>(null); // <-- neu
  const styles = createStyles();
  const newsStyles = createNewsStyles();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { width } = useWindowDimensions();
  const columns = useResponsiveColumns();
  const isMobile = width < 768;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(
          "https://broke-end.vercel.app/marketData/news"
        );
        const data = await response.json();
        setNews(data.items);
      } catch (error) {
        console.error("Fehler beim Laden der Nachrichten:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  // Mobile Render (Original-Implementierung)
  if (isMobile) {
    return (
      <SafeAreaView style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color={styles.defaultText.color} />
        ) : news && news.length > 0 ? (
          <FlatList
            data={news}
            style={{ padding: 5 }}
            contentContainerStyle={{ alignItems: "center" }}
            keyExtractor={(item) => item.guid}
            renderItem={({ item }) => (
              <Card
                style={{ minWidth: "98%", marginTop: 16, maxWidth: 350 }}
                onPress={() =>
                  setExpandedNews(expandedNews === item.guid ? null : item.guid)
                }
              >
                {/* Obere Zeile: Bild und Header */}
                <View style={[newsStyles.newsTopRow, { alignItems: "center" }]}>
                  {item.enclosure?.link ? (
                    <Image
                      source={{ uri: item.enclosure.link }}
                      style={newsStyles.newsImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={newsStyles.newsImage}>
                      <Text style={newsStyles.newsDate}>Kein Bild</Text>
                    </View>
                  )}
                  <View style={newsStyles.newsHeader}>
                    <Text style={newsStyles.newsTitle}>{item.title}</Text>
                    <Text style={newsStyles.newsDate}>{item.pubDate}</Text>
                  </View>
                </View>
                {/* Content unterhalb */}
                <View style={newsStyles.newsContent}>
                  {expandedNews === item.guid ? (
                    <ScrollView style={{ maxHeight: 400 }} scrollEnabled={true}>
                      <Text style={newsStyles.newsDescription}>
                        {item.content.replace(/<[^>]+>/g, "")}
                      </Text>
                    </ScrollView>
                  ) : (
                    <Text style={newsStyles.newsDescription} numberOfLines={6}>
                      {item.content.replace(/<[^>]+>/g, "")}
                    </Text>
                  )}
                </View>
                {/* Button, um den Artikel zu öffnen */}
                {expandedNews === item.guid && (
                  <View style={{ marginTop: 8 }}>
                    <Button
                      onPress={() => Linking.openURL(item.link)}
                      title="Artikel öffnen"
                      type="primary"
                      size="medium"
                      style={{ width: 150 }}
                    />
                  </View>
                )}
              </Card>
            )}
          />
        ) : (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <Text style={[styles.defaultText, { fontSize: 16 }]}>
              No News Fetched
            </Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // Web-Render: Öffne bei Klick ein Modal
  if (Platform.OS === "web") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, width: "100%", alignSelf: "center" }}>
          {loading ? (
            <ActivityIndicator size="large" color={styles.defaultText.color} />
          ) : news && news.length > 0 ? (
            <FlatList
              data={news}
              keyExtractor={(item) => item.guid}
              contentContainerStyle={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
                padding: 8,
              }}
              renderItem={({ item }) => (
                <Card
                  style={{
                    margin: 8,
                    width: 350,
                  }}
                  onPress={() => setModalNews(item)}
                >
                  {/* Obere Zeile: Bild und Header */}
                  <View
                    style={[newsStyles.newsTopRow, { alignItems: "center" }]}
                  >
                    {item.enclosure?.link ? (
                      <Image
                        source={{ uri: item.enclosure.link }}
                        style={newsStyles.newsImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={newsStyles.newsImage}>
                        <Text style={newsStyles.newsDate}>Kein Bild</Text>
                      </View>
                    )}
                    <View style={newsStyles.newsHeader}>
                      <Text style={newsStyles.newsTitle}>{item.title}</Text>
                      <Text style={newsStyles.newsDate}>{item.pubDate}</Text>
                    </View>
                  </View>
                  <View style={newsStyles.newsContent}>
                    <Text style={newsStyles.newsDescription} numberOfLines={5}>
                      {item.content.replace(/<[^>]+>/g, "")}
                    </Text>
                  </View>
                </Card>
              )}
            />
          ) : (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
              }}
            >
              <Text style={[styles.defaultText, { fontSize: 16 }]}>
                no News Fetched
              </Text>
            </View>
          )}
        </View>

        {/* Using our new CustomModal */}
        {modalNews && (
          <CustomModal
            visible={true}
            onClose={() => setModalNews(null)}
            width={748}
          >
            <View style={{ padding: 16 }}>
              <View style={[newsStyles.newsTopRow, { alignItems: "center" }]}>
                {modalNews.enclosure?.link ? (
                  <Image
                    source={{ uri: modalNews.enclosure.link }}
                    style={newsStyles.newsImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={newsStyles.newsImage}>
                    <Text style={[newsStyles.newsDate, { color: "white" }]}>
                      Kein Bild
                    </Text>
                  </View>
                )}
                <View style={newsStyles.newsHeader}>
                  <Text style={[newsStyles.newsTitle, { color: "white" }]}>
                    {modalNews.title}
                  </Text>
                  <Text style={[newsStyles.newsDate, { color: "white" }]}>
                    {modalNews.pubDate}
                  </Text>
                </View>
              </View>
              <ScrollView>
                <Text style={[newsStyles.newsDescription, { color: "white" }]}>
                  {modalNews.content.replace(/<[^>]+>/g, "")}
                </Text>
              </ScrollView>
              
            </View>
          </CustomModal>
        )}
      </SafeAreaView>
    );
  }

  // Tablet/Web-Render (Responsive mit Columns)
  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{ flex: 1, width: "100%", maxWidth: 1024, alignSelf: "center" }}
      >
        {loading ? (
          <ActivityIndicator size="large" color={styles.defaultText.color} />
        ) : news && news.length > 0 ? (
          <FlatList
            data={news}
            style={{ width: "100%" }}
            contentContainerStyle={{
              padding: 8,
              alignItems: columns > 1 ? "flex-start" : "center",
            }}
            numColumns={columns}
            key={columns} // Force re-render when columns change
            keyExtractor={(item) => item.guid}
            renderItem={({ item }) => (
              <Card
                style={{
                  margin: 8,
                  maxWidth: width / columns - 24,
                  flex: 1,
                }}
                onPress={() => setModalNews(item)}
              >
                {/* Obere Zeile: Bild und Header */}
                <View style={[newsStyles.newsTopRow, { alignItems: "center" }]}>
                  {item.enclosure?.link ? (
                    <Image
                      source={{ uri: item.enclosure.link }}
                      style={newsStyles.newsImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={newsStyles.newsImage}>
                      <Text style={newsStyles.newsDate}>Kein Bild</Text>
                    </View>
                  )}
                  <View style={newsStyles.newsHeader}>
                    <Text style={newsStyles.newsTitle}>{item.title}</Text>
                    <Text style={newsStyles.newsDate}>{item.pubDate}</Text>
                  </View>
                </View>

                {/* Content unterhalb */}
                <View style={newsStyles.newsContent}>
                  <Text style={newsStyles.newsDescription} numberOfLines={5}>
                    {item.content.replace(/<[^>]+>/g, "")}
                  </Text>
                </View>
              </Card>
            )}
          />
        ) : (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <Text style={[styles.defaultText, { fontSize: 16 }]}>
              no News Fetched
            </Text>
          </View>
        )}

        {/* Using our new CustomModal */}
        {modalNews && (
          <CustomModal
            visible={true}
            onClose={() => setModalNews(null)}
            width={650}
          >
            <View style={{ padding: 16 }}>
              <View style={[newsStyles.newsTopRow, { alignItems: "center" }]}>
                {modalNews.enclosure?.link ? (
                  <Image
                    source={{ uri: modalNews.enclosure.link }}
                    style={newsStyles.newsImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={newsStyles.newsImage}>
                    <Text style={[newsStyles.newsDate, { color: "white" }]}>
                      Kein Bild
                    </Text>
                  </View>
                )}
                <View style={newsStyles.newsHeader}>
                  <Text style={[newsStyles.newsTitle, { color: "white" }]}>
                    {modalNews.title}
                  </Text>
                  <Text style={[newsStyles.newsDate, { color: "white" }]}>
                    {modalNews.pubDate}
                  </Text>
                </View>
              </View>
              <ScrollView>
                <Text style={[newsStyles.newsDescription, { color: "white" }]}>
                  {modalNews.content.replace(/<[^>]+>/g, "")}
                </Text>
              </ScrollView>         
            </View>
          </CustomModal>
        )}
      </View>
    </SafeAreaView>
  );
}

function createNewsStyles() {
  const { theme } = useContext(ThemeContext);
  return StyleSheet.create({
    newsTopRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    newsImage: {
      width: 80,
      height: 80,
      borderRadius: 10,
      marginRight: 10,
    },
    newsHeader: {
      flex: 1,
      justifyContent: "center",
    },
    newsTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 4,
    },
    newsDate: {
      fontSize: 12,
      color: "gray",
    },
    newsContent: {
      marginTop: 4,
    },
    newsDescription: {
      fontSize: 14,
      color: theme.text,
    },
  });
}
