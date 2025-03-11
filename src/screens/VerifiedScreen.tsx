import React, { useEffect, useContext, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { fetchPost } from '../hooks/useFetch';
import { RootStackParamList } from '@/src/types/types';

export default function VerifiedScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Extrahiere den Token aus den Routenparams oder aus der URL (Deep Linking)
  const token = (route.params as { token?: string })?.token;
  
  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setError('Kein Token vorhanden.');
        setLoading(false);
        return;
      }
      try {
        const verifiedUser = await fetchPost("auth/verify", { token });
        if (!verifiedUser || verifiedUser.error) {
          setError('Verifizierung fehlgeschlagen.');
        } else {
          setUser(verifiedUser);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        }
      } catch (err) {
        setError('Ein Fehler ist aufgetreten.');
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [token, setUser, navigation]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Verifiziere...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.container}>
        <Text>{error}</Text>
      </View>
    );
  }

  return null; // Alternativ weitere UI nach erfolgreicher Verifizierung
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
