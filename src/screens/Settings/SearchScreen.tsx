import { createStyles } from "@/src/styles/style";
import { View, Text } from "react-native";

export default function SearchScreen() {
  const styles = createStyles(); // Hook innerhalb der Komponente

  return (
    <View>
      <Text style={styles.defaultText}>🔍 Suche nach Coins</Text>
    </View>
  );
}
