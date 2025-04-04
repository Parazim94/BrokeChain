import React, { useEffect, useState, useContext, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  StyleSheet,
  Share,
  Platform,
} from "react-native";
import * as Linking from "expo-linking";
import { Ionicons } from "@expo/vector-icons";
import { createStyles } from "../../styles/style";
import { ThemeContext } from "../../context/ThemeContext";
import Card from "@/src/components/UiComponents/Card";

interface Post {
  id: string;
  account: {
    username: string;
    avatar: string;
  };
  content: string;
  created_at: string;
  url: string;
}

export default function ShareScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Record<string, number>>({});
  const postsDataRef = useRef<Post[]>([]);  // Ref für frühe Daten
  const styles = createStyles();
  const shareStyles = createShareStyles();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(
          "https://mastodonapp.uk/api/v1/timelines/tag/crypto?limit=24"
        );
        const data = await response.json();
        // Sofort Daten in Ref speichern für Bild-Preloading
        postsDataRef.current = data;
        setPosts(data);
        
        // Preloading nur für Web vorbereiten
        // Keine direkte Image-Konstruktion verwenden
        // Für Web: Das Preloading wird im render-Block via div+img gemacht
      } catch (error) {
        console.error("Fehler beim Laden der Beiträge:", error);
      } finally {
        setTimeout(() => setLoading(false), 1000);    
      }
    };
    fetchPosts();
  }, []);

  // Bilder schon während des Ladens vorbereiten - nur wenn auf Web-Plattform
  const loadingContent = Platform.OS === "web" && postsDataRef.current.length > 0 && (
    <div style={{ position: 'absolute', opacity: 0, width: 0, height: 0, overflow: 'hidden' }}>
      {postsDataRef.current.map(post => 
        post.account?.avatar && 
        <img key={post.id} src={post.account.avatar} alt="" style={{width: 1, height: 1}} />
      )}
    </div>
  );

  const handleLike = (postId: string) => {
    setLikedPosts((prevLikes) => ({
      ...prevLikes,
      [postId]: (prevLikes[postId] || 0) + 1,
    }));
  };

  const handleShare = async (postUrl: string) => {
    try {
      await Share.share({
        message: `Schau dir diesen Krypto-Post an: ${postUrl}`,
        url: postUrl,
      });
    } catch (error) {
      console.error("Fehler beim Teilen:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={styles.defaultText.color} />
          {loadingContent}
        </View>
      ) : (
        <FlatList
          data={posts}
          style={{ width: "100%" }}
          contentContainerStyle={{
            alignItems: Platform.OS === "web" ? "flex-start" : "center",
            maxWidth:1600,
            marginHorizontal: "auto",
            justifyContent: "center",
            ...(Platform.OS === "web" && { flexDirection: "row", flexWrap: "wrap" })
          }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card
              style={{ marginTop: 16, maxWidth: 350, marginHorizontal: 16, paddingHorizontal: 16 }}
              onPress={() =>
                setExpandedPost(expandedPost === item.id ? null : item.id)
              }
            >
              {/* Header: User-Avatar, Username & Zeitstempel */}
              <View style={shareStyles.postHeaderRow}>
                <Image
                  source={{ uri: item.account.avatar }}
                  style={shareStyles.userAvatar}
                />
                <View style={shareStyles.userInfo}>
                  <Text style={shareStyles.username}>
                    @{item.account.username}
                  </Text>
                  <Text style={shareStyles.postDate}>
                    {new Date(item.created_at).toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Inhalt des Posts */}
              <View style={shareStyles.postContent}>
                <Text
                  style={shareStyles.postText}
                  numberOfLines={expandedPost === item.id ? undefined : 5}
                >
                  {item.content.replace(/<[^>]+>/g, "")}
                </Text>
              </View>

              {/* "Post öffnen"-Button linksbündig, wenn Post aufgeklappt ist */}
              {expandedPost === item.id && (
                <View style={shareStyles.openPostContainer}>
                  <TouchableOpacity
                    onPress={() => Linking.openURL(item.url)}
                    style={shareStyles.openPostButton}
                  >
                    <Text style={shareStyles.openPostButtonText}>
                      Post öffnen
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Interaktionsleiste */}
              <View style={shareStyles.actionRow}>
                <TouchableOpacity style={shareStyles.iconButton}>
                  <Ionicons name="chatbubble-outline" size={20} color="gray" />
                  <Text style={shareStyles.iconText}>214</Text>
                </TouchableOpacity>

                <TouchableOpacity style={shareStyles.iconButton}>
                  <Ionicons name="repeat" size={20} color="gray" />
                  <Text style={shareStyles.iconText}>178</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleLike(item.id)}
                  style={shareStyles.iconButton}
                >
                  <Ionicons name="heart-outline" size={20} color="red" />
                  <Text style={shareStyles.iconText}>
                    {likedPosts[item.id] || 0}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleShare(item.url)}
                  style={shareStyles.iconButton}
                >
                  <Ionicons name="share-outline" size={20} color="gray" />
                </TouchableOpacity>
              </View>
            </Card>
          )}
        />
      )}
    </SafeAreaView>
  );
}

function createShareStyles() {
  const { theme } = useContext(ThemeContext);
  return StyleSheet.create({
    postContainer: {
      width: "95%",
      marginTop: 16,
      padding: 12,
      backgroundColor: theme.background,
      borderRadius: 10,
    },
    postHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    userAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 10,
    },
    userInfo: {
      flexDirection: "column",
    },
    username: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.text,
    },
    postDate: {
      fontSize: 12,
      color: "gray",
    },
    postContent: {
      marginTop: 4,
    },
    postText: {
      fontSize: 14,
      color: theme.text,
    },
    actionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 10,
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: "#222",
    },
    iconButton: {
      flexDirection: "row",
      alignItems: "center",
    },
    iconText: {
      marginLeft: 6,
      fontSize: 14,
      color: "gray",
    },
    openPostContainer: {
      flexDirection: "row",
      justifyContent: "flex-start",
      marginTop: 10,
    },
    openPostButton: {
      backgroundColor: theme.accent,
      paddingVertical: 6,
      paddingHorizontal: 16,
      borderRadius: 5,
    },
    openPostButtonText: {
      color: "white",
      fontSize: 14,
      fontWeight: "bold",
    },
  });
}
