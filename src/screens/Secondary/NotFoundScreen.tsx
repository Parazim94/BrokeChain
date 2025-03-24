import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '@/src/types/types';
import Button from '@/src/components/UiComponents/Button';

export default function NotFoundScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seite nicht gefunden</Text>
      <Text style={styles.message}>
        Der von Ihnen aufgerufene Link existiert nicht.
      </Text>
      <Button  type={"primary"} title="Zurück zur Startseite" onPress={() => navigation.navigate('Main')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent: 'center', alignItems:'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  message: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
});
