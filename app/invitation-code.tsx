import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Key, Check } from 'lucide-react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useInvitationCode } from '../lib/invitation-service';

export default function InvitationCodeScreen() {
  const [invitationCode, setInvitationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitCode = async () => {
    if (!invitationCode.trim()) {
      Alert.alert('Fel', 'Vänligen ange en inbjudningskod');
      return;
    }

    setIsLoading(true);
    
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { data, error } = await useInvitationCode(invitationCode.trim());
      
      if (error) {
        Alert.alert('Fel', error);
        setIsLoading(false);
        return;
      }

      if (data?.success) {
        Alert.alert(
          'Framgång!', 
          `Du har gått med i bigården "${data.apiary.name}"!`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch {
      Alert.alert('Fel', 'Ett oväntat fel inträffade. Försök igen.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasteCode = async () => {
    // Här skulle vi normalt använda Clipboard från expo-clipboard
    // För nu simulerar vi att klistra in en kod
    setInvitationCode('ABC123DEF456');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FFF8E1', '#F5F5DC']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Pressable 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#8B4513" />
          </Pressable>
          <Text style={styles.title}>Gå med i bigård</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.iconContainer}>
              <Key size={32} color="#F7B801" />
            </View>
            <Text style={styles.infoTitle}>Anslut till en bigård</Text>
            <Text style={styles.infoDescription}>
              Ange inbjudningskoden du fått från bigårdens ägare för att få tillgång till kupor, inspektioner och skördar.
            </Text>
          </View>

          {/* Input Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Inbjudningskod</Text>
            <View style={styles.inputCard}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={invitationCode}
                  onChangeText={setInvitationCode}
                  placeholder="Ange 8-siffrig kod (t.ex. ABC123XY)"
                  placeholderTextColor="#8B7355"
                  autoCapitalize="characters"
                  maxLength={8}
                />
              </View>
              <Pressable style={styles.pasteButton} onPress={handlePasteCode}>
                <Text style={styles.pasteButtonText}>Klistra in från urklipp</Text>
              </Pressable>
            </View>
          </View>

          {/* Benefits Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vad får du tillgång till?</Text>
            <View style={styles.benefitsCard}>
              <View style={styles.benefitItem}>
                <Check size={20} color="#4CAF50" />
                <Text style={styles.benefitText}>Se alla kupor i bigården</Text>
              </View>
              <View style={styles.benefitItem}>
                <Check size={20} color="#4CAF50" />
                <Text style={styles.benefitText}>Lägg till inspektioner och observationer</Text>
              </View>
              <View style={styles.benefitItem}>
                <Check size={20} color="#4CAF50" />
                <Text style={styles.benefitText}>Registrera skördar och uppgifter</Text>
              </View>
              <View style={styles.benefitItem}>
                <Check size={20} color="#4CAF50" />
                <Text style={styles.benefitText}>Samarbeta med andra biodlare</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <Pressable 
          style={[
            styles.submitButton, 
            (isLoading || !invitationCode.trim()) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmitCode}
          disabled={isLoading || !invitationCode.trim()}
        >
          <Text style={[
            styles.submitButtonText,
            (isLoading || !invitationCode.trim()) && styles.submitButtonTextDisabled
          ]}>
            {isLoading ? 'Ansluter...' : 'Gå med i bigård'}
          </Text>
        </Pressable>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  scrollView: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F7B801' + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoDescription: {
    fontSize: 14,
    color: '#8B7355',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  inputCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainer: {
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E8D5B7',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#8B4513',
    backgroundColor: '#FFF8E1',
    minHeight: 50,
  },
  pasteButton: {
    backgroundColor: '#F7B801',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  pasteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  benefitsCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#8B4513',
    marginLeft: 12,
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#F7B801',
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#E8D5B7',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButtonTextDisabled: {
    color: '#8B7355',
  },
});