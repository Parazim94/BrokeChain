import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import * as Linking from "expo-linking";
import { createStyles } from "../../styles/style";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

const RSS_URL = "https://www.coindesk.com/arc/outboundfeeds/rss/";
const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
  RSS_URL
)}`;

interface NewsItem {
  guid: string;
  link: string;
  title: string;
  pubDate: string;
  description: string;
  enclosure?: { link: string };
}

export default function CryptoNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const styles = createStyles();
  const newsStyles = createNewsStyles();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(API_URL);
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
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={styles.defaultText.color} />
      ) : (
        <FlatList
          data={news}
          keyExtractor={(item) => item.guid}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={newsStyles.newsCard}
              onPress={() => Linking.openURL(item.link)}
            >
              {item.enclosure?.link ? (
                <Image
                  source={{ uri: item.enclosure.link }}
                  style={newsStyles.newsImage}
                />
              ) : (
                <View style={newsStyles.newsImage}>
                  <Text style={newsStyles.newsDate}>Kein Bild</Text>
                </View>
              )}
              <View style={newsStyles.newsTextContainer}>
                <Text style={newsStyles.newsTitle}>{item.title}</Text>
                <Text style={newsStyles.newsDate}>{item.pubDate}</Text>
                <Text style={newsStyles.newsDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

function createNewsStyles() {
  const { colorTheme, theme } = useContext(ThemeContext);

  return StyleSheet.create({
    newsCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colorTheme === "dark" ? "#222" : "#f8f8f8",
      padding: 12,
      marginVertical: 5,
      borderRadius: 10,
      shadowColor: "#000",
      shadowOpacity: colorTheme === "dark" ? 0.4 : 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 3,
    },
    newsImage: {
      width: 80,
      height: 80,
      borderRadius: 10,
      marginRight: 10,
    },
    newsTextContainer: {
      flex: 1,
    },
    newsTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 5,
    },
    newsDate: {
      fontSize: 12,
      color: colorTheme === "dark" ? "#bbb" : "gray",
    },
    newsDescription: {
      fontSize: 14,
      color: theme.text,
    },
  });
}
