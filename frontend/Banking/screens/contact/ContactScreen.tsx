import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal
} from "react-native";
import { useTheme } from '../../hooks/useTheme';
import contactService, { Contact } from '../../services/contactService';
import { useDebounce } from '../../hooks/useDebounce';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useTranslation from '../../hooks/useTranslation';
import transactionService, { TransferRequest } from '../../services/transactionService';

const { width } = Dimensions.get('window');

const defaultAvatar = require('../../assets/avatars/avatar2.jpg');

const ContactScreen: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [frequentContacts, setFrequentContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Transfer modal state
  const [isTransferModalVisible, setIsTransferModalVisible] = useState<boolean>(false);
  const [transactionAmount, setTransactionAmount] = useState<string>('');
  const [transactionDescription, setTransactionDescription] = useState<string>('');
  const [transferLoading, setTransferLoading] = useState<boolean>(false);

  const resetTransactionInputs = () => {
    setTransactionAmount('');
    setTransactionDescription('');
  };

  const fetchContacts = useCallback(async (search?: string) => {
    try {
      setError(null);
      const data = await contactService.getContacts(search);
      setContacts(data);

      setFrequentContacts(data.slice(0, 3));
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
      setError(t('contacts.errorFetching'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchContacts(debouncedSearch);
  }, [debouncedSearch, fetchContacts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchContacts(searchQuery);
  }, [fetchContacts, searchQuery]);

  const handleContactPress = async (contact: Contact) => {
    try {
      setLoading(true);
      const contactDetails = await contactService.getContactById(contact.user_id);
      setSelectedContact(contactDetails);
    } catch (err) {
      console.error('Failed to fetch contact details:', err);
      setError(t('contacts.errorFetchingDetails'));
    } finally {
      setLoading(false);
    }
  };

  const handleSendMoney = () => {
    if (selectedContact) {
      setIsTransferModalVisible(true);
    }
  };

  const handleTransfer = async () => {
    if (!selectedContact) {
      return;
    }

    // Validation du montant
    if (!transactionAmount || parseFloat(transactionAmount) <= 0) {
      Alert.alert(
        t('alerts.error'),
        t('alerts.invalidAmount'),
        [{ text: t('common.ok') }]
      );
      return;
    }

    setTransferLoading(true);
    try {
      const transferData: TransferRequest = {
        to_account_number: selectedContact.account_number,
        amount: parseFloat(transactionAmount),
        description: transactionDescription || t('transactions.transferDefault')
      };

      await transactionService.transferMoney(transferData);
      setIsTransferModalVisible(false);
      resetTransactionInputs();

      Alert.alert(
        t('alerts.success'),
        t('alerts.transferSuccess'),
        [{ text: t('common.ok') }]
      );

    } catch (error: any) {
      console.error('Error transferring money:', error);
      if (error.response?.data?.detail === "Solde insuffisant") {
        Alert.alert(
          t('alerts.error'),
          t('alerts.insufficientFunds'),
          [{ text: t('common.ok') }]
        );
      } else if (error.response?.data?.detail === "Impossible de transférer vers le même compte") {
        Alert.alert(
          t('alerts.error'),
          t('alerts.sameAccountTransfer'),
          [{ text: t('common.ok') }]
        );
      } else if (error.response?.data?.detail === "Le compte destinataire est inactif") {
        Alert.alert(
          t('alerts.error'),
          t('alerts.inactiveRecipient'),
          [{ text: t('common.ok') }]
        );
      } else {
        Alert.alert(
          t('alerts.error'),
          error.response?.data?.detail || t('alerts.transferError'),
          [{ text: t('common.ok') }]
        );
      }
    } finally {
      setTransferLoading(false);
    }
  };

  const containerStyle = isDarkMode ? styles.darkContainer : styles.lightContainer;
  const cardStyle = isDarkMode ? styles.darkCard : styles.lightCard;
  const headerTextStyle = isDarkMode ? styles.darkHeaderText : styles.lightHeaderText;
  const secondaryTextStyle = isDarkMode ? styles.darkSecondaryText : styles.lightSecondaryText;
  const inputStyle = isDarkMode ? styles.darkInput : styles.lightInput;
  const inputContainerStyle = isDarkMode ? styles.darkInputContainer : styles.lightInputContainer;
  const modalContainerStyle = isDarkMode ? styles.darkModalContainer : styles.lightModalContainer;

  const renderContactItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      style={[styles.contactItem, cardStyle, selectedContact?.id === item.id && styles.selectedContact]}
      onPress={() => handleContactPress(item)}
    >
      <View style={styles.contactAvatarContainer}>
        {item.profile_image ? (
          <Image source={{ uri: item.profile_image }} style={styles.contactAvatar} />
        ) : (
          <Image source={defaultAvatar} style={styles.contactAvatar} />
        )}
      </View>
      <View style={styles.contactInfo}>
        <Text style={[styles.contactName, headerTextStyle]} numberOfLines={1}>
          {item.full_name}
        </Text>
        <Text style={[styles.contactDetail, secondaryTextStyle]} numberOfLines={1}>
          {item.username} • {item.account_number}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderFrequentContact = (contact: Contact) => (
    <TouchableOpacity
      key={contact.id}
      style={styles.frequentContactItem}
      onPress={() => handleContactPress(contact)}
    >
      <View style={styles.frequentAvatarContainer}>
        {contact.profile_image ? (
          <Image source={{ uri: contact.profile_image }} style={styles.frequentContactAvatar} />
        ) : (
          <Image source={defaultAvatar} style={styles.frequentContactAvatar} />
        )}
      </View>
      <Text
        style={[styles.frequentContactName, headerTextStyle]}
        numberOfLines={1}
        ellipsizeMode="tail">
        {contact.full_name.split(' ')[0]}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color={isDarkMode ? '#6B7280' : '#9CA3AF'} />
      <Text style={[styles.emptyText, secondaryTextStyle]}>
        {searchQuery ? t('contacts.noResults') : t('contacts.noContacts')}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, containerStyle]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#fff" : "#000"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, headerTextStyle]}>{t('title', 'contacts')}</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4F46E5']}
            tintColor={isDarkMode ? '#818CF8' : '#4F46E5'}
          />
        }
      >

        {/* Search Bar */}
        <View style={[styles.searchContainer, inputContainerStyle]}>
          <Ionicons name="search-outline" size={20} style={styles.searchIcon} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
          <TextInput
            style={[styles.searchInput, inputStyle]}
            placeholder={t('contacts.searchPlaceholder')}
            placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          )}
        </View>

        {/* Loading Indicator */}
        {loading && !refreshing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={isDarkMode ? '#818CF8' : '#4F46E5'} />
          </View>
        )}

        {/* Contact Details Section - Only shown when a contact is selected */}
        {selectedContact && !loading && (
          <View style={[styles.detailsCard, cardStyle]}>
            <View style={styles.detailsHeader}>
              <View style={styles.detailsAvatarContainer}>
                {selectedContact.profile_image ? (
                  <Image source={{ uri: selectedContact.profile_image }} style={styles.detailsAvatar} />
                ) : (
                  <Image source={defaultAvatar} style={styles.detailsAvatar} />
                )}
              </View>
              <View style={styles.detailsHeaderInfo}>
                <Text style={[styles.detailsName, headerTextStyle]}>{selectedContact.full_name}</Text>
                <Text style={[styles.detailsEmail, secondaryTextStyle]}>{selectedContact.email}</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedContact(null)}>
                <Ionicons name="close-outline" size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            <View style={styles.detailsContent}>
              <View style={styles.detailsRow}>
                <Text style={[styles.detailsLabel, secondaryTextStyle]}>{t('contacts.username')}</Text>
                <Text style={[styles.detailsValue, headerTextStyle]}>{selectedContact.username}</Text>
              </View>

              {selectedContact.phone && (
                <View style={styles.detailsRow}>
                  <Text style={[styles.detailsLabel, secondaryTextStyle]}>{t('contacts.phone')}</Text>
                  <Text style={[styles.detailsValue, headerTextStyle]}>{selectedContact.phone}</Text>
                </View>
              )}

              <View style={styles.detailsRow}>
                <Text style={[styles.detailsLabel, secondaryTextStyle]}>{t('contacts.accountName')}</Text>
                <Text style={[styles.detailsValue, headerTextStyle]}>{selectedContact.account_name}</Text>
              </View>

              <View style={styles.detailsRow}>
                <Text style={[styles.detailsLabel, secondaryTextStyle]}>{t('contacts.accountNumber')}</Text>
                <Text style={[styles.detailsValue, headerTextStyle]}>{selectedContact.account_number}</Text>
              </View>
            </View>

            <View style={styles.detailsActions}>
              <TouchableOpacity
                style={styles.actionBtnPrimary}
                onPress={handleSendMoney}
              >
                <Text style={styles.actionBtnPrimaryText}>{t('contacts.sendMoney')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!loading && (
          <>
            {/* Frequent Contacts */}
            {frequentContacts.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, headerTextStyle]}>{t('contacts.frequent')}</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.frequentContactsContainer}
                >
                  {frequentContacts.map(renderFrequentContact)}
                </ScrollView>
              </View>
            )}

            {/* All Contacts */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, headerTextStyle]}>{t('contacts.all')}</Text>
              {contacts.length === 0 ? renderEmptyList() : (
                <FlatList
                  data={contacts}
                  renderItem={renderContactItem}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                  contentContainerStyle={styles.contactListContainer}
                />
              )}
            </View>
          </>
        )}
      </ScrollView>
      <Modal
        visible={isTransferModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsTransferModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, modalContainerStyle]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDarkMode ? styles.darkHeaderText : styles.lightHeaderText]}>
                {t('transactions.transfer')}
              </Text>
              <TouchableOpacity onPress={() => setIsTransferModalVisible(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? "#FFFFFF" : "#111827"} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, secondaryTextStyle]}>{t('transactions.recipient')}</Text>
                <View style={[styles.recipientDisplay]}>
                  <Text style={[styles.recipientText, isDarkMode && styles.darkRecipientText]}>
                    {selectedContact?.full_name} ({selectedContact?.account_number})
                  </Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, secondaryTextStyle]}>{t('transactions.amount')}</Text>
                <TextInput
                  style={[styles.input, inputStyle]}
                  value={transactionAmount}
                  onChangeText={setTransactionAmount}
                  placeholder="0.00"
                  placeholderTextColor={isDarkMode ? "#9CA3AF" : "#6B7280"}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, secondaryTextStyle]}>{t('transactions.description')}</Text>
                <TextInput
                  style={[styles.input, inputStyle]}
                  value={transactionDescription}
                  onChangeText={setTransactionDescription}
                  placeholder={t('transactions.transferDefault')}
                  placeholderTextColor={isDarkMode ? "#9CA3AF" : "#6B7280"}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsTransferModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.createButton}
                onPress={handleTransfer}
                disabled={transferLoading}
              >
                {transferLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.createButtonText}>{t('common.confirm')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
  },
  lightContainer: {
    backgroundColor: '#F9FAFB',
  },
  darkContainer: {
    backgroundColor: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  lightHeaderText: {
    color: '#1F2937',
  },
  darkHeaderText: {
    color: '#F9FAFB',
  },
  lightSecondaryText: {
    color: '#6B7280',
  },
  darkSecondaryText: {
    color: '#9CA3AF',
  },
  addButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 48,
  },
  lightInputContainer: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
  },
  darkInputContainer: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  lightInput: {
    color: '#1F2937',
  },
  darkInput: {
    color: '#F9FAFB',
  },
  clearButton: {
    padding: 4,
  },
  backButton: {
    padding: 8,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  frequentContactsContainer: {
    paddingBottom: 8,
  },
  frequentContactItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  frequentAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  frequentContactAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  frequentContactName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  contactListContainer: {
    paddingBottom: 24,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  lightCard: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  darkCard: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
    borderWidth: 1,
  },
  contactAvatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  contactInfo: {
    marginLeft: 16,
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
  },
  contactDetail: {
    fontSize: 14,
    marginTop: 2,
  },
  selectedContact: {
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  detailsCard: {
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 16,
    overflow: 'hidden',
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  detailsAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  detailsHeaderInfo: {
    marginLeft: 16,
    flex: 1,
  },
  detailsName: {
    fontSize: 18,
    fontWeight: '600',
  },
  detailsEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  detailsContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailsLabel: {
    fontSize: 14,
  },
  detailsValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  lightDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  darkDivider: {
    height: 1,
    backgroundColor: '#374151',
  },
  detailsActions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionBtnPrimary: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  actionBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionBtnSecondary: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  actionBtnSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#EF4444',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  lightModalContainer: {
    backgroundColor: '#FFFFFF',
  },
  darkModalContainer: {
    backgroundColor: '#1F2937',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  recipientDisplay: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    justifyContent: 'center',
  },
  recipientText: {
    fontSize: 16,
    color: '#1F2937',
  },
  darkRecipientText: {
    color: '#F9FAFB',
  },
});

export default ContactScreen;