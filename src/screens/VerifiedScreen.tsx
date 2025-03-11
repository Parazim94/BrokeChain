import React, { useEffect, useContext, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { fetchPost } from '../hooks/useFetch';
import { RootStackParamList } from '@/src/types/types';
import { ThemeContext } from '../context/ThemeContext';
import * as Linking from 'expo-linking';

export default function VerifiedScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { theme } = useContext(ThemeContext);
  const { setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [debug, setDebug] = useState<string>('');

  // Extrahiere den Token auf verschiedene Arten - für besseres Debugging
  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Versuch 1: Token aus Route Params
        let token = (route.params as any)?.token;
        
        // Versuch 2: Token aus URL direkt extrahieren
        if (!token) {
          const url = await Linking.getInitialURL();
          setDebug(prev => prev + `\nURL: ${url || 'keine URL'}`);
          
          if (url) {
            const segments = url.split('/');
            // Annahme: URL-Format ist .../auth/verify/TOKEN
            token = segments[segments.length - 1];
            setDebug(prev => prev + `\nExtrahierter Token aus URL: ${token?.substring(0, 20)}...`);
          }
        }

        // Versuch 3: Token aus der URL-Adresse des Browsers extrahieren, wenn Web
        if (!token && typeof window !== 'undefined') {
          const pathname = window.location.pathname;
          setDebug(prev => prev + `\nPathname: ${pathname}`);
          
          const segments = pathname.split('/');
          // Annahme: URL-Format ist .../auth/verify/TOKEN
          token = segments[segments.length - 1];
          setDebug(prev => prev + `\nExtrahierter Token aus Pathname: ${token?.substring(0, 20)}...`);
        }

        if (!token) {
          setError('Kein Verifizierungstoken gefunden.');
          setLoading(false);
          return;
        }

        setDebug(prev => prev + `\nVerwende Token: ${token.substring(0, 20)}...`);
        
        // API-Aufruf zur Verifizierung
        const verifiedUser = await fetchPost("auth/verify", { token });
        
        if (!verifiedUser) {
          setError('Keine Antwort vom Server erhalten.');
        } else if (verifiedUser.error) {
          setError(`Fehler bei der Verifizierung: ${verifiedUser.error}`);
          setDebug(prev => prev + `\nServer-Fehler: ${JSON.stringify(verifiedUser)}`);
        } else {
          // Erfolgreiche Verifizierung
          setUser(verifiedUser);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        }
      } catch (err: any) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(`Fehler bei der Verarbeitung: ${errorMessage}`);
        setDebug(prev => prev + `\nException: ${JSON.stringify(err)}`);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [route.params, setUser, navigation]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={[styles.text, { color: theme.text }]}>Verifiziere deine E-Mail-Adresse...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: theme.text }]}>
          {error ? 'Verifizierung fehlgeschlagen' : 'Verifizierung erfolgreich'}
        </Text>
        
        {error ? (
          <>
            <Text style={[styles.errorMessage, { color: theme.text || 'red' }]}>{error}</Text>
            <Text style={[styles.text, { color: theme.text }]}>
              Bitte versuche es erneut oder kontaktiere den Support.
            </Text>
            {__DEV__ && (
              <View style={styles.debugContainer}>
                <Text style={[styles.debugTitle, { color: theme.text }]}>Debug-Info:</Text>
                <Text style={[styles.debugText, { color: theme.text }]}>{debug}</Text>
              </View>
            )}
          </>
        ) : (
          <Text style={[styles.text, { color: theme.text }]}>
            Deine E-Mail wurde verifiziert. Du wirst zur Hauptseite weitergeleitet.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1
  },
  contentContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20,
    minHeight: 300
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center'
  },
  text: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center'
  },
  errorMessage: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  debugContainer: {
    marginTop: 30,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    width: '100%'
  },
  debugTitle: {
    fontWeight: 'bold',
    marginBottom: 5
  },
  debugText: {
    fontFamily: 'monospace'
  }
});
