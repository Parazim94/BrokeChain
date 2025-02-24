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
} from "react-native";
import * as Linking from "expo-linking";
import { createStyles } from "../../styles/style";
import { ThemeContext } from "../../context/ThemeContext";
import Card from "@/src/components/Card";

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
  const styles = createStyles();
  const shareStyles = createShareStyles();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(
          "https://mastodonapp.uk/api/v1/timelines/tag/crypto?limit=10"
        );
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Fehler beim Laden der Beiträge:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={styles.defaultText.color} />
      ) : (
        <FlatList
          data={posts}
          style={{ width: "100%" }}
          contentContainerStyle={{ alignItems: "center" }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card
              style={{ minWidth: "98%", marginBottom: 16, maxWidth: 1024 }}
              onPress={() =>
                setExpandedPost(expandedPost === item.id ? null : item.id)
              }
            >
              {/* Header: User-Avatar und Username */}
              <View style={[shareStyles.postTopRow, { alignItems: "center" }]}>
                {item.account.avatar ? (
                  <Image
                    source={{ uri: item.account.avatar }}
                    style={shareStyles.userAvatar}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={shareStyles.userAvatar}>
                    <Text style={shareStyles.postDate}>Kein Bild</Text>
                  </View>
                )}
                <View style={shareStyles.postHeader}>
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
                {expandedPost === item.id ? (
                  <ScrollView style={{ maxHeight: 400 }} scrollEnabled={true}>
                    <Text style={shareStyles.postText}>
                      {item.content.replace(/<[^>]+>/g, "")}
                    </Text>
                  </ScrollView>
                ) : (
                  <Text style={shareStyles.postText} numberOfLines={5}>
                    {item.content.replace(/<[^>]+>/g, "")}
                  </Text>
                )}
              </View>

              {/* Button zum Öffnen des Original-Posts */}
              {expandedPost === item.id && (
                <View style={{ marginTop: 8 }}>
                  <TouchableOpacity
                    onPress={() => Linking.openURL(item.url)}
                    style={{
                      backgroundColor: styles.accent.color,
                      padding: 5,
                      borderRadius: 5,
                      width: 150,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "white" }}>Post öffnen</Text>
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

function createShareStyles() {
  const { theme } = useContext(ThemeContext);
  return StyleSheet.create({
    postTopRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    userAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 10,
    },
    postHeader: {
      flex: 1,
      justifyContent: "center",
    },
    username: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 4,
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
  });
}
