import React, { useEffect, useState, useContext } from "react";
import { SafeAreaView, View, Text, FlatList, ActivityIndicator, Image, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import * as Linking from "expo-linking";
import { createStyles } from "../../styles/style";
import { ThemeContext } from "../../context/ThemeContext";
import Card from "@/src/components/Card";

// const RSS_URL = "https://www.coindesk.com/arc/outboundfeeds/rss/";
// const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
//   RSS_URL
// )}`;

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
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNews, setExpandedNews] = useState<string | null>(null);
  const styles = createStyles();
  const newsStyles = createNewsStyles();

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

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={styles.defaultText.color} />
      ) : (
        <FlatList
          data={news}
          style={{ padding:5 }}
          contentContainerStyle={{ alignItems: "center" }}
          keyExtractor={(item) => item.guid}
          renderItem={({ item }) => (
            <Card
              style={{ minWidth: "98%", marginBottom: 16, }}
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
                  <Text style={newsStyles.newsDescription} numberOfLines={5}>
                    {item.content.replace(/<[^>]+>/g, "")}
                  </Text>
                )}
              </View>
              {/* Button, um den Artikel zu öffnen */}
              {expandedNews === item.guid && (
                <View style={{ marginTop: 8 }}>
                  <TouchableOpacity
                    onPress={() => Linking.openURL(item.link)}
                    style={{
                      backgroundColor: styles.accent.color,
                      padding: 5,
                      borderRadius: 5,
                      width: 150,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{color:"white"}}>Artikel öffnen</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>
          )}
        />
      )}
    </SafeAreaView>
  );
}

function createNewsStyles() {
  const { colorTheme, theme } = useContext(ThemeContext);
  const styles = createStyles();  
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
