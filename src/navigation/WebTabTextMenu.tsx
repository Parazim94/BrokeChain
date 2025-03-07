import React, { useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, useNavigationState, CommonActions } from "@react-navigation/native";
import { ThemeContext } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import Card from "../components/Card";

const tabs = [
  { name: "Markets", label: "Markets", icon: "trending-up" },
  { name: "Share", label: "Share", icon: "share-social" },
  { name: "Trade", label: "Trade", icon: "swap-horizontal" },
  { name: "Discover", label: "Discover", icon: "compass" },
  { name: "Portfolio", label: "Portfolio", icon: "wallet" },
];

export default function WebTabTextMenu() {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  // State für den aktiven Tab
  const [activeTab, setActiveTab] = useState("Markets");
  
  // Get active route name with improved navigation state detection
  const navigationState = useNavigationState(state => state);

  // Verbesserte Logik zum Finden des aktiven Tabs
  useEffect(() => {
    const findActiveRoute = () => {
      if (!navigationState?.routes) return;
      
      // Finde den Main-Route
      const mainRoute = navigationState.routes.find(route => route.name === "Main");
      if (!mainRoute?.state) return;
      
      // Navigiere durch die verschachtelten Navigator-Zustände
      let currentState = mainRoute.state;
      
      // Falls wir einen DrawerNavigator haben
      if (currentState.routes?.[0]?.state?.routeNames) {
        const drawerState = currentState.routes[0].state;
        const activeIndex = drawerState.index || 0;
        if (drawerState.routeNames?.[activeIndex]) {
          setActiveTab(drawerState.routeNames[activeIndex]);
        }
      } 
      // Falls wir einen TabNavigator haben
      else if (currentState.routeNames) {
        const activeIndex = currentState.index || 0;
        if (currentState.routeNames?.[activeIndex]) {
          setActiveTab(currentState.routeNames[activeIndex]);
        }
      }
    };
    
    findActiveRoute();
  }, [navigationState]);

  const handleNavigation = (screenName: string) => {
    // Aktualisiere den aktiven Tab sofort für bessere UX
    setActiveTab(screenName);
    
    // Navigiere zum ausgewählten Screen
    navigation.dispatch(
      CommonActions.navigate({
        name: "Main",
        params: {
          screen: screenName
        }
      })
    );
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;
        
        const tabContent = (
          <View style={styles.tabContent}>
            <Ionicons 
              name={tab.icon as keyof typeof Ionicons.glyphMap} 
              size={16} 
              color={isActive ? theme.accent : theme.text} 
              style={styles.icon}
            />
            <Text
              style={{
                fontSize: 14,
                fontWeight: isActive ? "600" : "normal",
                color: isActive ? theme.accent : theme.text,
              }}
            >
              {tab.label}
            </Text>
          </View>
        );

        return isActive ? (
          <Card key={tab.name} style={styles.activeCard}>
            <TouchableOpacity
              onPress={() => handleNavigation(tab.name)}
              style={styles.tabButton}
            >
              {tabContent}
            </TouchableOpacity>
          </Card>
        ) : (
          <TouchableOpacity
            key={tab.name}
            onPress={() => handleNavigation(tab.name)}
            style={styles.tabButton}
          >
            {tabContent}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  tabButton: {
    marginHorizontal: 6,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 5,
  },
  activeCard: {
    paddingVertical: 8,
    paddingHorizontal: 0,
    margin: 0,
    marginHorizontal: 0,
    borderRadius: 12,
  }
});
