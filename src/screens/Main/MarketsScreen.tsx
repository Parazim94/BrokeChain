import { createStyles } from "@/src/styles/style";
import { View, Text } from "react-native";

export default function MarketsScreen() {
  const styles = createStyles();
  return (
    <View style={styles.container}>
      <Text style={styles.defaultText}>📈 Marktübersicht</Text>
    </View>
  );
}
