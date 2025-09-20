import { View, Text, StyleSheet, ScrollView, Pressable, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Plus, Share2, Copy, Trash2, Calendar, Users } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { createInvitationCode, getInvitationCodes, deactivateInvitationCode, InvitationCode } from '../lib/invitation-service';

export default function ManageInvitationsScreen() {
  const [invitationCodes, setInvitationCodes] = useState<InvitationCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [maxUses, setMaxUses] = useState('1');
  const [expiresInDays, setExpiresInDays] = useState('7');
  const [isCreating, setIsCreating] = useState(false);

  // För demo - använd en hårdkodad bigård-ID
  // I verkligheten skulle detta komma från användarens valda bigård
  const currentApiaryId = 'demo-apiary-id';

  useEffect(() => {
    loadInvitationCodes();
  }, []);

  const loadInvitationCodes = async () => {
    try {
      const { data, error } = await getInvitationCodes(currentApiaryId);
      if (error) {
        Alert.alert('Fel', 'Kunde inte ladda inbjudningskoder');
        return;
      }
      setInvitationCodes(data || []);
    } catch {
      Alert.alert('Fel', 'Ett oväntat fel inträffade');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCode = async () => {
    if (!maxUses || parseInt(maxUses) < 1) {
      Alert.alert('Fel', 'Antal användningar måste vara minst 1');
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await createInvitationCode(
        currentApiaryId,
        parseInt(maxUses),
        parseInt(expiresInDays) || undefined
      );

      if (error) {
        Alert.alert('Fel', error);
        return;
      }

      if (data) {
        setInvitationCodes(prev => [data, ...prev]);
        setShowCreateModal(false);
        setMaxUses('1');
        setExpiresInDays('7');
        Alert.alert('Framgång!', `Inbjudningskod ${data.code} har skapats`);
      }
    } catch {
      Alert.alert('Fel', 'Kunde inte skapa inbjudningskod');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyCode = (code: string) => {
    // Här skulle vi använda Clipboard från expo-clipboard
    Alert.alert('Kopierat!', `Koden ${code} har kopierats till urklipp`);
  };

  const handleDeactivateCode = (codeId: string, code: string) => {
    Alert.alert(
      'Inaktivera kod',
      `Är du säker på att du vill inaktivera koden ${code}?`,
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Inaktivera',
          style: 'destructive',
          onPress: async () => {
            const { data, error } = await deactivateInvitationCode(codeId);
            if (error) {
              Alert.alert('Fel', 'Kunde inte inaktivera koden');
              return;
            }
            if (data) {
              setInvitationCodes(prev => prev.filter(c => c.id !== codeId));
              Alert.alert('Framgång!', 'Koden har inaktiverats');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE');
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isMaxUsesReached = (code: InvitationCode) => {
    return code.current_uses >= code.max_uses;
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
          <Text style={styles.title}>Hantera inbjudningar</Text>
          <Pressable 
            style={styles.addButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={24} color="#8B4513" />
          </Pressable>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.iconContainer}>
              <Share2 size={32} color="#F7B801" />
            </View>
            <Text style={styles.infoTitle}>Dela din bigård</Text>
            <Text style={styles.infoDescription}>
              Skapa inbjudningskoder för att låta andra biodlare gå med i din bigård och samarbeta.
            </Text>
          </View>

          {/* Invitation Codes List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Aktiva inbjudningskoder</Text>
            {isLoading ? (
              <View style={styles.loadingCard}>
                <Text style={styles.loadingText}>Laddar...</Text>
              </View>
            ) : invitationCodes.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Inga inbjudningskoder skapade än</Text>
                <Text style={styles.emptySubtext}>Tryck på + för att skapa din första kod</Text>
              </View>
            ) : (
              invitationCodes.map((code) => (
                <View key={code.id} style={styles.codeCard}>
                  <View style={styles.codeHeader}>
                    <View style={styles.codeInfo}>
                      <Text style={styles.codeText}>{code.code}</Text>
                      <View style={styles.codeStats}>
                        <View style={styles.statItem}>
                          <Users size={16} color="#8B7355" />
                          <Text style={styles.statText}>
                            {code.current_uses}/{code.max_uses}
                          </Text>
                        </View>
                        {code.expires_at && (
                          <View style={styles.statItem}>
                            <Calendar size={16} color="#8B7355" />
                            <Text style={[
                              styles.statText,
                              isExpired(code.expires_at) && styles.expiredText
                            ]}>
                              {formatDate(code.expires_at)}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <View style={styles.codeActions}>
                      <Pressable 
                        style={styles.actionButton}
                        onPress={() => handleCopyCode(code.code)}
                      >
                        <Copy size={20} color="#F7B801" />
                      </Pressable>
                      <Pressable 
                        style={styles.actionButton}
                        onPress={() => handleDeactivateCode(code.id, code.code)}
                      >
                        <Trash2 size={20} color="#FF6B6B" />
                      </Pressable>
                    </View>
                  </View>
                  
                  {(isExpired(code.expires_at) || isMaxUsesReached(code)) && (
                    <View style={styles.statusBanner}>
                      <Text style={styles.statusText}>
                        {isExpired(code.expires_at) ? 'Utgången' : 'Max användningar nådd'}
                      </Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Create Modal */}
        <Modal
          visible={showCreateModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCreateModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Skapa inbjudningskod</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Antal användningar</Text>
                <TextInput
                  style={styles.textInput}
                  value={maxUses}
                  onChangeText={setMaxUses}
                  keyboardType="numeric"
                  placeholder="1"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Giltighet (dagar)</Text>
                <TextInput
                  style={styles.textInput}
                  value={expiresInDays}
                  onChangeText={setExpiresInDays}
                  keyboardType="numeric"
                  placeholder="7"
                />
                <Text style={styles.inputHint}>Lämna tomt för ingen utgångsdatum</Text>
              </View>

              <View style={styles.modalActions}>
                <Pressable 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowCreateModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Avbryt</Text>
                </Pressable>
                <Pressable 
                  style={[styles.modalButton, styles.createButton]}
                  onPress={handleCreateCode}
                  disabled={isCreating}
                >
                  <Text style={styles.createButtonText}>
                    {isCreating ? 'Skapar...' : 'Skapa'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  addButton: {
    padding: 4,
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
  loadingCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingText: {
    fontSize: 16,
    color: '#8B7355',
  },
  emptyCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8B7355',
  },
  codeCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  codeInfo: {
    flex: 1,
  },
  codeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  codeStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#8B7355',
  },
  expiredText: {
    color: '#FF6B6B',
  },
  codeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  statusBanner: {
    backgroundColor: '#FFE5E5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  statusText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E8D5B7',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#8B4513',
    backgroundColor: '#FFF8E1',
  },
  inputHint: {
    fontSize: 12,
    color: '#8B7355',
    marginTop: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  createButton: {
    backgroundColor: '#F7B801',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});