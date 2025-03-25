import React, { useEffect, useState, useContext, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Platform,
} from "react-native";
import * as Linking from "expo-linking";
import { createStyles } from "../../styles/style";
import { ThemeContext } from "../../context/ThemeContext";
import Card from "@/src/components/UiComponents/Card";
import Button from "@/src/components/UiComponents/Button";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "@/src/types/types";
import { useResponsiveColumns } from "@/src/hooks/useResponsiveColumns";
import CustomModal from "@/src/components/UiComponents/CustomModal";
import LazyImage from "@/src/components/UiComponents/LazyImage";

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
  const [expandedNews, setExpandedNews] = useState<string | null>(null);
  const [modalNews, setModalNews] = useState<NewsItem | null>(null);
  const newsDataRef = useRef<NewsItem[]>([]);  // Ref für frühe Daten
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
          "https://broke.dev-space.vip/marketData/news"
        );
        const data = await response.json();
        // Sofort Daten in Ref speichern, damit Bilder geladen werden können
        newsDataRef.current = data.items;
        setNews(data.items);
        
        // Preload-Versuch nur für Web ohne direktes Image-Object
        if (Platform.OS === "web" && data.items?.length > 0) {
          // Keine direkte Image Konstruktion - nur DOM-Element für preload vorbereiten
          // Web-spezifischer Code wird in renderContent behandelt
        }
      } catch (error) {
        console.error("Fehler beim Laden der Nachrichten:", error);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };
    fetchNews();
  }, []);

  // Render-Logik für hintergrundladende Bilder während des Loadings
  const renderNewsItem = (item: NewsItem, isModalContent = false) => {
    return (
      <>
        {/* Obere Zeile: Bild und Header */}
        <View style={[newsStyles.newsTopRow, { alignItems: "center" }]}>
          {item.enclosure?.link ? (
            <LazyImage
              source={{ uri: item.enclosure.link }}
              style={newsStyles.newsImage}
              resizeMode="cover"
              // Preload aktivieren auch während des Ladens
            />
          ) : (
            <View style={newsStyles.newsImage}>
              <Text style={isModalContent ? [newsStyles.newsDate, { color: "white" }] : newsStyles.newsDate}>
                Kein Bild
              </Text>
            </View>
          )}
          <View style={newsStyles.newsHeader}>
            <Text style={isModalContent ? [newsStyles.newsTitle, { color: "white" }] : newsStyles.newsTitle}>
              {item.title}
            </Text>
            <Text style={isModalContent ? [newsStyles.newsDate, { color: "white" }] : newsStyles.newsDate}>
              {item.pubDate}
            </Text>
          </View>
        </View>
        {/* ...existing code... */}
      </>
    );
  };

  // Mobile Render (Original-Implementierung)
  if (isMobile) {
    // Während Loading werden Bilder bereits geladen
    const loadingContent = newsDataRef.current.length > 0 && (
      <View style={{ opacity: 0, position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
        {newsDataRef.current.map(item => (
          <LazyImage 
            key={item.guid}
            source={item.enclosure?.link ? { uri: item.enclosure.link } : undefined}
            style={{ width: 1, height: 1 }}
          />
        ))}
      </View>
    );

    return (
      <SafeAreaView style={styles.container}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color={styles.defaultText.color} />
            {loadingContent}
          </View>
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
                    <LazyImage
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

  // Web-Render: Bilder vorladend
  if (Platform.OS === "web") {
    // Vorlade-Element für Web - vorsichtiger Ansatz
    const loadingContent = newsDataRef.current.length > 0 && (
      <div style={{ position: 'absolute', opacity: 0, width: 0, height: 0, overflow: 'hidden' }}>
        {newsDataRef.current.map(item => 
          item.enclosure?.link && 
          <img key={item.guid} src={item.enclosure.link} alt="" style={{width: 1, height: 1}} />
        )}
      </div>
    );

    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, width: "100%", alignSelf: "center", }}>
          {loading ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator size="large" color={styles.defaultText.color} />
              {loadingContent}
            </View>
          ) : news && news.length > 0 ? (
            <FlatList
              data={news}
              keyExtractor={(item) => item.guid}
              contentContainerStyle={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
                marginHorizontal: "auto",
                maxWidth: 1600,
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
                      <LazyImage
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
                  <LazyImage
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
              {/* Vertikal scrollbarer Content */}
              <ScrollView 
                horizontal={false}
                showsHorizontalScrollIndicator={false}
                style={{ marginVertical: 8, maxHeight: 400, overflow: "scroll" }}
              >
                <Text style={[newsStyles.newsDescription, { color: "white" }]}> 
                  {modalNews.content.replace(/<[^>]+>/g, "")}
                </Text>
              </ScrollView>
              {/* Button um den Link aufzurufen */}
              <Button
                onPress={() => Linking.openURL(modalNews.link)}
                title="Link öffnen"
                type="primary"
                size="medium"
                style={{ width: 150 }}
              />
            </View>
          </CustomModal>
        )}
      </SafeAreaView>
    );
  }

  // Tablet/Web-Render mit Preloading
  const loadingContent = newsDataRef.current.length > 0 && (
    <div style={{ position: 'absolute', opacity: 0, width: 0, height: 0, overflow: 'hidden' }}>
      {newsDataRef.current.map(item => 
        item.enclosure?.link && 
        <img key={item.guid} src={item.enclosure.link} alt="" style={{width: 1, height: 1}} />
      )}
    </div>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{ flex: 1, width: "100%", maxWidth: 1024, alignSelf: "center" }}
      >
        {loading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color={styles.defaultText.color} />
            {(Platform.OS as string) === "web" && loadingContent}
          </View>
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
                    <LazyImage
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
                <ScrollView style={newsStyles.newsContent}>
                  <Text style={newsStyles.newsDescription} numberOfLines={5}>
                    {item.content.replace(/<[^>]+>/g, "")}
                  </Text>
                </ScrollView>
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
                  <LazyImage
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
