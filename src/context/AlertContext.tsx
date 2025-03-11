import React, { createContext, useState, useContext, useCallback, ReactNode, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from './ThemeContext';

// Alert-Typen, die wir unterstützen möchten
export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertOptions {
  type: AlertType;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
  confirmText?: string;
  cancelText?: string;
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
}

// Default-Werte für den Kontext
const defaultContext: AlertContextType = {
  showAlert: () => {},
  hideAlert: () => {},
};

export const AlertContext = createContext<AlertContextType>(defaultContext);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { theme } = useContext(ThemeContext);
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<AlertOptions>({
    type: 'info',
    title: '',
    message: '',
  });
  
  // Ref für Modal hinzufügen, um findDOMNode-Warnung zu vermeiden
  const modalRef = useRef(null);

  // Entscheiden, ob natives Alert oder Modal basierend auf Plattform
  const isWeb = Platform.OS === 'web';

  // Alert anzeigen - unterscheidet zwischen nativem Alert und Modal
  const showAlert = useCallback((newOptions: AlertOptions) => {
    if (isWeb) {
      // Für Web: Benutzerdefiniertes Modal verwenden
      setOptions(newOptions);
      setVisible(true);
    } else {
      // Für Mobile: Natives Alert verwenden
      if (newOptions.showCancelButton) {
        // Mit Cancel-Button
        Alert.alert(
          newOptions.title,
          newOptions.message,
          [
            {
              text: newOptions.cancelText || 'Cancel',
              onPress: newOptions.onCancel,
              style: 'cancel'
            },
            {
              text: newOptions.confirmText || 'OK',
              onPress: newOptions.onConfirm
            }
          ]
        );
      } else {
        // Ohne Cancel-Button
        Alert.alert(
          newOptions.title,
          newOptions.message,
          [
            {
              text: newOptions.confirmText || 'OK',
              onPress: newOptions.onConfirm
            }
          ]
        );
      }
    }
  }, [isWeb]);

  // Alert verstecken (nur für Web-Modal relevant)
  const hideAlert = useCallback(() => {
    if (isWeb) {
      setVisible(false);
    }
  }, [isWeb]);

  // Icon basierend auf dem Alert-Typ
  const getIconName = (type: AlertType) => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'warning';
      case 'info':
        return 'information-circle';
      default:
        return 'information-circle';
    }
  };

  // Farbe basierend auf dem Alert-Typ
  const getIconColor = (type: AlertType) => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FF9800';
      case 'info':
        return '#2196F3';
      default:
        return '#2196F3';
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      <View style={{ flex: 1 }}>
        {/* Falls Sie Test- oder Debug-Strings verwenden, achten Sie darauf, sie in <Text> zu verpacken */}
        {children}
      </View>
      {isWeb && (
        <Modal
          ref={modalRef}
          transparent={true}
          visible={visible}
          animationType="fade"
          onRequestClose={hideAlert}
        >
          <View style={styles.centeredView}>
            <View style={[styles.modalView, { backgroundColor: theme.background }]}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={getIconName(options.type) as any}
                  size={48}
                  color={getIconColor(options.type)}
                />
              </View>
              
              <Text style={[styles.modalTitle, { color: theme.text }]}>{options.title}</Text>
              <Text style={[styles.modalText, { color: theme.text }]}>{options.message}</Text>
              
              <View style={styles.buttonContainer}>
                {options.showCancelButton && (
                  <TouchableOpacity
                    style={[styles.button, styles.buttonCancel, { borderColor: theme.accent }]}
                    onPress={() => {
                      hideAlert();
                      options.onCancel && options.onCancel();
                    }}
                  >
                    <Text style={[styles.buttonText, { color: theme.accent }]}>
                      {options.cancelText || 'Cancel'}
                    </Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={[
                    styles.button, 
                    styles.buttonConfirm, 
                    { backgroundColor: theme.accent }
                  ]}
                  onPress={() => {
                    hideAlert();
                    options.onConfirm && options.onConfirm();
                  }}
                >
                  <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                    {options.confirmText || 'OK'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </AlertContext.Provider>
  );
};

// Styles für den modalen Dialog (nur für Web)
const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        borderRadius: 12,
        padding: 25,
        alignItems: 'center',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
        width: '85%',
        maxWidth: 400,
    },
    iconContainer: {
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 20,
        textAlign: 'center',
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
    },
    button: {
        borderRadius: 8,
        padding: 12,
        marginHorizontal: 6,
        minWidth: 100,
        alignItems: 'center',
    },
    buttonConfirm: {
        backgroundColor: '#2196F3',
    },
    buttonCancel: {
        backgroundColor: 'transparent',
        borderWidth: 1,
    },
    buttonText: {
        fontWeight: '600',
        textAlign: 'center',
    },
});

// Hook für einfachen Zugriff auf den AlertContext
export const useAlert = () => useContext(AlertContext);
