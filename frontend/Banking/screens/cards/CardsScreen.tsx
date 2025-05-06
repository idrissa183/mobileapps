import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert
} from "react-native";
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import cardService, { Card, CardCreateRequest, CardStatus, CardType } from '../../services/cardService';
import transactionService, { TransferRequest, DepositRequest, WithdrawalRequest } from '../../services/transactionService';
import useTranslation from '../../hooks/useTranslation';
import { useNavigation } from '@react-navigation/native';
import contactService, { Contact } from '../../services/contactService';
import accountService from '../../services/accountService';

const { width } = Dimensions.get('window');

const CardsScreen: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();


  // Apply styles based on theme
  const containerStyle = isDarkMode ? styles.darkContainer : styles.lightContainer;
  const headerTextStyle = isDarkMode ? styles.darkHeaderText : styles.lightHeaderText;
  const secondaryTextStyle = isDarkMode ? styles.darkSecondaryText : styles.lightSecondaryText;
  const cardDetailBgStyle = isDarkMode ? styles.darkCardDetailBg : styles.lightCardDetailBg;
  const balanceContainerStyle = isDarkMode ? styles.darkBalanceContainer : styles.lightBalanceContainer;
  const inputStyle = isDarkMode ? styles.darkInput : styles.lightInput;
  const modalContainerStyle = isDarkMode ? styles.darkModalContainer : styles.lightModalContainer;

  // States
  const [cards, setCards] = useState<Card[]>([]);


  // State to track selected card and CVV visibility
  const [selectedCard, setSelectedCard] = useState(cards[0]);
  const [isCvvVisible, setIsCvvVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [balance, setBalance] = useState<number>(0);
  const [balanceLoading, setBalanceLoading] = useState<boolean>(true);

  // New Card Modal states
  const [isNewCardModalVisible, setIsNewCardModalVisible] = useState(false);
  const [newCardName, setNewCardName] = useState('');
  const [isContactless, setIsContactless] = useState(true);
  const [isVirtual, setIsVirtual] = useState(false);
  const [cardType, setCardType] = useState<CardType>(CardType.DEBIT);

  // Transaction Modals states
  const [isTopUpModalVisible, setIsTopUpModalVisible] = useState(false);
  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
  const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionDescription, setTransactionDescription] = useState('');
  const [recipientAccountNumber, setRecipientAccountNumber] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState<boolean>(false);


  // Fetch cards on load
  useEffect(() => {
    fetchCards();
    fetchContacts();
    fetchBalance();
  }, []);

  // Function to fetch user balance
  const fetchBalance = async () => {
    setBalanceLoading(true);
    try {
      const userAccount = await accountService.getUserAccount();
      setBalance(userAccount.balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setBalanceLoading(false);
    }
  };

  // Function to fetch cards
  const fetchCards = async () => {
    setCardsLoading(true);
    try {
      const fetchedCards = await cardService.getAllCards();
      setCards(fetchedCards);

      if (fetchedCards.length > 0 && !selectedCard) {
        setSelectedCard(fetchedCards[0]);
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
      Alert.alert(
        t('alerts.error'),
        t('alerts.cardsError'),
        [{ text: t('common.ok') }]
      );
    } finally {
      setCardsLoading(false);
    }
  };

  // Function to fetech contacts
  const fetchContacts = async () => {
    setContactsLoading(true);
    try {
      const data = await contactService.getContacts();
      setContacts(data);
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
      Alert.alert(
        t('alerts.error'),
        t('alerts.contactsError'),
        [{ text: t('common.ok') }]
      );
    } finally {
      setContactsLoading(false);
    }
  };


  // Function to open new card modal
  const openNewCardModal = () => {
    setNewCardName(t('cards.defaultNewCardName'));
    setIsContactless(true);
    setIsVirtual(false);
    setCardType(CardType.DEBIT);
    setIsNewCardModalVisible(true);
  };

  // Function to create new card
  const createNewCard = async () => {
    setLoading(true);
    try {
      const newCardData: CardCreateRequest = {
        card_name: newCardName || t('cards.defaultNewCardName'),
        card_type: cardType,
        is_contactless: isContactless,
        is_virtual: isVirtual
      };

      const newCard = await cardService.createCard(newCardData);

      setCards(prevCards => [...prevCards, newCard]);
      setSelectedCard(newCard);
      setIsNewCardModalVisible(false);
      Alert.alert(
        t('alerts.success'),
        t('alerts.cardCreationSuccess'),
        [{ text: t('common.ok') }]
      );

    } catch (error) {
      console.error('Error creating new card:', error);
      Alert.alert(
        t('alerts.error'),
        t('alerts.cardCreationError'),
        [{ text: t('common.ok') }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Reset transaction modals inputs
  const resetTransactionInputs = () => {
    setTransactionAmount('');
    setTransactionDescription('');
    setRecipientAccountNumber('');
  };

  // Handle Top Up (Deposit)
  const handleTopUp = async () => {
    if (!transactionAmount || parseFloat(transactionAmount) <= 0) {
      Alert.alert(
        t('alerts.error'),
        t('alerts.invalidAmount'),
        [{ text: t('common.ok') }]
      );
      return;
    }

    setLoading(true);
    try {
      const depositData: DepositRequest = {
        amount: parseFloat(transactionAmount),
        description: transactionDescription || t('transactions.depositDefault')
      };

      await transactionService.depositMoney(depositData);
      setIsTopUpModalVisible(false);
      resetTransactionInputs();
      fetchBalance();
      Alert.alert(
        t('alerts.success'),
        t('alerts.depositSuccess',),
        [{ text: t('common.ok') }]
      );

    } catch (error: any) {
      console.error('Error depositing money:', error);
      Alert.alert(
        t('alerts.error'),
        error.response?.data?.detail || t('alerts.depositError'),
        [{ text: t('common.ok') }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Withdraw
  const handleWithdraw = async () => {
    if (!transactionAmount || parseFloat(transactionAmount) <= 0) {
      Alert.alert(
        t('alerts.error'),
        t('alerts.invalidAmount'),
        [{ text: t('common.ok') }]
      );
      return;
    }

    if (parseFloat(transactionAmount) > balance) {
      Alert.alert(
        t('alerts.error'),
        t('alerts.insufficientFunds'),
        [{ text: t('common.ok') }]
      );
      return;
    }

    setLoading(true);
    try {
      const withdrawalData: WithdrawalRequest = {
        amount: parseFloat(transactionAmount),
        description: transactionDescription || t('transactions.withdrawalDefault')
      };

      await transactionService.withdrawMoney(withdrawalData);
      setIsWithdrawModalVisible(false);
      resetTransactionInputs();
      fetchBalance();
      Alert.alert(
        t('alerts.success'),
        t('alerts.withdrawSuccess'),
        [{ text: t('common.ok') }]
      );

    } catch (error: any) {
      console.error('Error withdrawing money:', error);
      if (error.response?.data?.detail === "Insufficient funds") {
        Alert.alert(
          t('alerts.error'),
          t('alerts.insufficientFunds'),
          [{ text: t('common.ok') }]
        );
      } else {
        Alert.alert(
          t('alerts.error'),
          error.response?.data?.detail || t('alerts.withdrawError'),
          [{ text: t('common.ok') }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Transfer
  const handleTransfer = async () => {
    // Validation du destinataire
    if (!recipientAccountNumber) {
      Alert.alert(
        t('alerts.error'),
        t('alerts.noRecipient'),
        [{ text: t('common.ok') }]
      );
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

    // Vérification du solde côté client avant d'appeler l'API
    if (parseFloat(transactionAmount) > balance) {
      Alert.alert(
        t('alerts.error'),
        t('alerts.insufficientFunds'),
        [{ text: t('common.ok') }]
      );
      return;
    }

    setLoading(true);
    try {
      const transferData: TransferRequest = {
        to_account_number: recipientAccountNumber,
        amount: parseFloat(transactionAmount),
        description: transactionDescription || t('transactions.transferDefault')
      };

      await transactionService.transferMoney(transferData);
      setIsTransferModalVisible(false);
      resetTransactionInputs();
      fetchBalance();
      const recipientName = contacts.find(c => c.account_number === recipientAccountNumber)?.full_name || recipientAccountNumber;
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
        // Autres erreurs
        Alert.alert(
          t('alerts.error'),
          error.response?.data?.detail || t('alerts.transferError'),
          [{ text: t('common.ok') }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
    setIsCvvVisible(false);
  };

  const toggleCvvVisibility = () => {
    setIsCvvVisible(!isCvvVisible);
  };

  const formatNumberWithCommas = (number: string) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Format masked card number
  const formatCardNumber = (cardNumber: string) => {
    // If card is masked (like "************8898"), format it
    if (cardNumber.startsWith('*')) {
      const lastFour = cardNumber.slice(-4);
      return `**** **** **** ${lastFour}`;
    }

    // Otherwise return formatted card
    return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
  };


  const CreateCardButton = () => (
    <TouchableOpacity
      style={styles.createCardButton}
      onPress={openNewCardModal}
    >
      <View style={styles.createCardContent}>
        <Ionicons name="add-circle" size={24} color="#2563EB" />
        <Text style={styles.createCardText}>{t('cards.createCard')}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, containerStyle]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#fff" : "#000"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, headerTextStyle]}>{t('title', 'cards')}</Text>
        <View style={{ width: 24 }} />
      </View>
      {/* Balance Section */}
      <View style={[styles.balanceContainer, balanceContainerStyle]}>
        <View>
          <Text style={[styles.currencyLabel, secondaryTextStyle]}>{t('currency.usd')}</Text>
          {balanceLoading ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <Text style={[styles.balanceAmount, headerTextStyle]}>{formatNumberWithCommas(parseFloat(balance.toFixed(2)))}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.topUpButton}
          onPress={() => setIsTopUpModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={18} color={isDarkMode ? "#FFFFFF" : "#111827"} />
          <Text style={[styles.topUpText, isDarkMode && styles.darkTopUpText]}>{t('cards.topUp')}</Text>
        </TouchableOpacity>
      </View>

      {/* Cards Section */}
      {cardsLoading ? (
        <View style={styles.loadingCardContainer}>
          <ActivityIndicator size="small" color="#2563EB" />
        </View>
      ) : (
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={styles.cardsContainer}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {cards.map((card, index) => (
            <TouchableOpacity
              key={card.id}
              onPress={() => handleCardClick(card)}
              activeOpacity={0.8}
            >
              <View style={[styles.cardWrapper,
              (index % 2 === 0 ? { borderColor: "#2563EB" } : { borderColor: "#80b2e6" }),
              (selectedCard?.id === card.id ? { borderWidth: 2 } : {})]}
              >
                <View style={[styles.card, (index % 2 === 0 ? styles.blueCard : styles.cyanCard)]}>
                  <View style={styles.cardHeader}>
                    <Image
                      source={require('../../assets/avatars/avatar2.jpg')}
                      style={styles.cardLogo}
                    />
                  </View>

                  <View style={styles.cardNumberContainer}>
                    <Text style={styles.cardNumberText}>****</Text>
                    <Text style={styles.cardNumberText}>****</Text>
                    <Text style={styles.cardNumberText}>****</Text>
                    <Text style={styles.cardNumberText}>
                      {card.card_number.slice(-4)}
                    </Text>
                  </View>

                  <View style={styles.cardChipSection}>
                    <View style={styles.cardBrand}>
                      <Text style={styles.cardBrandText}>BCD</Text>
                    </View>
                    <Image
                      source={require('../../assets/puce.png')}
                      style={styles.cardPuce}
                    />
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.cardDate}>{t('cards.expiresAt')}: {card.expiry_date}</Text>
                    <Text style={styles.cardStatusBadge}>
                      {card.status === CardStatus.ACTIVE ? t('cards.active') : t('cards.inactive')}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          <CreateCardButton />
        </ScrollView>
      )}

      {/* Card Details Section */}
      {selectedCard && (
        <ScrollView
          style={[styles.cardDetailsSection, cardDetailBgStyle]}
        >
          <View>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, headerTextStyle]}>{t('cards.cardDetail')}</Text>

            </View>

            {/* Card Info Items */}
            <View style={styles.cardInfoContainer}>
              <View style={styles.cardInfoItem}>
                <Text style={[styles.cardInfoLabel, secondaryTextStyle]}>{t('cards.cardNumber')}:</Text>
                <Text style={[styles.cardInfoValueText, headerTextStyle]}>
                  {formatCardNumber(selectedCard.card_number)}
                </Text>
              </View>

              <View style={styles.cardInfoItem}>
                <Text style={[styles.cardInfoLabel, secondaryTextStyle]}>{t('cards.expiryDate')}:</Text>
                <Text style={[styles.cardInfoValueText, headerTextStyle]}>{selectedCard.expiry_date}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.cardActionsContainer}>
              <TouchableOpacity
                style={styles.withdrawButton}
                onPress={() => setIsWithdrawModalVisible(true)}
              >
                <Ionicons name="arrow-down-outline" size={18} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>{t('cards.withdraw')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.transferButton}
                onPress={() => setIsTransferModalVisible(true)}
              >
                <Ionicons name="swap-horizontal-outline" size={18} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>{t('cards.transfer')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Create New Card Modal */}
      <Modal
        visible={isNewCardModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsNewCardModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, modalContainerStyle]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDarkMode ? styles.darkHeaderText : styles.lightHeaderText]}>
                {t('cards.createNewCard')}
              </Text>
              <TouchableOpacity onPress={() => setIsNewCardModalVisible(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? "#FFFFFF" : "#111827"} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, secondaryTextStyle]}>{t('cards.cardName')}</Text>
                <TextInput
                  style={[styles.input, inputStyle]}
                  value={newCardName}
                  onChangeText={setNewCardName}
                  placeholder={t('cards.defaultNewCardName')}
                  placeholderTextColor={isDarkMode ? "#9CA3AF" : "#6B7280"}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, secondaryTextStyle]}>{t('cards.cardType')}</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    style={[styles.radioButton, cardType === CardType.DEBIT && styles.radioButtonActive]}
                    onPress={() => setCardType(CardType.DEBIT)}
                  >
                    <View style={[styles.radioInner, cardType === CardType.DEBIT && styles.radioInnerActive]} />
                    <Text style={[styles.radioText, headerTextStyle]}>{t('cards.debitCard')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.radioButton, cardType === CardType.VIRTUAL && styles.radioButtonActive]}
                    onPress={() => setCardType(CardType.VIRTUAL)}
                  >
                    <View style={[styles.radioInner, cardType === CardType.VIRTUAL && styles.radioInnerActive]} />
                    <Text style={[styles.radioText, headerTextStyle]}>{t('cards.virtualCard')}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, secondaryTextStyle]}>{t('cards.options')}</Text>
                <View style={styles.checkboxGroup}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => setIsContactless(!isContactless)}
                  >
                    <View style={[styles.checkboxInner, isContactless && styles.checkboxActive]}>
                      {isContactless && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                    </View>
                    <Text style={[styles.checkboxText, headerTextStyle]}>{t('cards.contactless')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => setIsVirtual(!isVirtual)}
                  >
                    <View style={[styles.checkboxInner, isVirtual && styles.checkboxActive]}>
                      {isVirtual && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                    </View>
                    <Text style={[styles.checkboxText, headerTextStyle]}>{t('cards.virtual')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsNewCardModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.createButton}
                onPress={createNewCard}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.createButtonText}>{t('common.create')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Top Up Modal */}
      <Modal
        visible={isTopUpModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsTopUpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, modalContainerStyle]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDarkMode ? styles.darkHeaderText : styles.lightHeaderText]}>
                {t('transactions.topUp')}
              </Text>
              <TouchableOpacity onPress={() => setIsTopUpModalVisible(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? "#FFFFFF" : "#111827"} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
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
                  placeholder={t('transactions.depositDefault')}
                  placeholderTextColor={isDarkMode ? "#9CA3AF" : "#6B7280"}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsTopUpModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.createButton}
                onPress={handleTopUp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.createButtonText}>{t('common.confirm')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        visible={isWithdrawModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsWithdrawModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, modalContainerStyle]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDarkMode ? styles.darkHeaderText : styles.lightHeaderText]}>
                {t('transactions.withdraw')}
              </Text>
              <TouchableOpacity onPress={() => setIsWithdrawModalVisible(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? "#FFFFFF" : "#111827"} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
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
                  placeholder={t('transactions.withdrawalDefault')}
                  placeholderTextColor={isDarkMode ? "#9CA3AF" : "#6B7280"}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsWithdrawModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.createButton}
                onPress={handleWithdraw}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.createButtonText}>{t('common.confirm')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Transfer Modal */}
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
                {contactsLoading ? (
                  <ActivityIndicator size="small" color={isDarkMode ? "#818CF8" : "#4F46E5"} />
                ) : (
                  <View style={[styles.dropdown]}>
                    <ScrollView style={styles.dropdownList}>
                      {contacts.length > 0 ? (
                        contacts.map((contact) => (
                          <TouchableOpacity
                            key={contact.id}
                            style={[
                              styles.dropdownItem,
                              recipientAccountNumber === contact.account_number && styles.selectedDropdownItem
                            ]}
                            onPress={() => setRecipientAccountNumber(contact.account_number)}
                          >
                            <Text style={[
                              styles.dropdownText,
                              recipientAccountNumber === contact.account_number && styles.selectedDropdownText,
                              isDarkMode && styles.darkDropdownText
                            ]}>
                              {contact.full_name} ({contact.account_number})
                            </Text>
                          </TouchableOpacity>
                        ))
                      ) : (
                        <Text style={[styles.dropdownText, isDarkMode && styles.darkDropdownText]}>
                          {t('contacts.noContacts')}
                        </Text>
                      )}
                    </ScrollView>
                  </View>
                )}
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
                disabled={loading}
              >
                {loading ? (
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
    paddingTop: 30
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  loadingCardContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 20,
    borderRadius: 16,
  },
  currencyLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  topUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  topUpText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  darkTopUpText: {
    color: '#FFFFFF',
  },
  cardsContainer: {
    marginLeft: 20,
    marginBottom: 20,
  },
  cardWrapper: {
    marginRight: 15,
    borderRadius: 16,
    borderWidth: 0,
    padding: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    width: width * 0.75,
    height: 200,
    borderRadius: 14,
    padding: 16,
    justifyContent: 'space-between',
  },

  blueCard: {
    backgroundColor: '#2563EB',
  },
  cyanCard: {
    backgroundColor: '#0891B2',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cardLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  cardNumberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  cardNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cardChipSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBrand: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  cardBrandText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cardPuce: {
    width: 40,
    height: 30,
    resizeMode: 'contain',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: {
    color: 'white',
    fontSize: 12,
  },
  cardStatusBadge: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  createCardButton: {
    width: width * 0.4,
    height: 200,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2563EB',
    borderStyle: 'dashed',
  },
  createCardContent: {
    alignItems: 'center',
  },
  createCardText: {
    marginTop: 12,
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '500',
  },
  cardDetailsSection: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAllText: {
    color: '#2563EB',
    fontSize: 14,
  },
  cardInfoContainer: {
    marginBottom: 20,
  },
  cardInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(209, 213, 219, 0.3)',
  },
  cardInfoLabel: {
    fontSize: 14,
  },
  cardInfoValueText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  activeIndicator: {
    backgroundColor: '#10B981',
  },
  inactiveIndicator: {
    backgroundColor: '#EF4444',
  },
  cardActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  withdrawButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  transferButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  actionButtonText: {
    color: 'white',
    marginLeft: 6,
    fontWeight: '500',
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
  radioGroup: {
    flexDirection: 'row',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioButtonActive: {
    opacity: 1,
  },
  radioInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioInnerActive: {
    backgroundColor: '#2563EB',
    borderWidth: 5,
  },
  radioText: {
    fontSize: 14,
  },
  checkboxGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 10,
  },
  checkboxInner: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#2563EB',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#2563EB',
  },
  checkboxText: {
    fontSize: 14,
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
  dropdown: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    height: 120,
  },
  dropdownList: {
    flex: 1,
  },
  dropdownItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(209, 213, 219, 0.3)',
  },
  selectedDropdownItem: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },
  dropdownText: {
    fontSize: 14,
  },
  darkDropdownText: {
    color: '#E5E7EB',
  },
  selectedDropdownText: {
    color: '#2563EB',
    fontWeight: '500',
  },

  // Theme-specific styles
  lightContainer: {
    backgroundColor: '#F9FAFB',
  },
  darkContainer: {
    backgroundColor: '#111827',
  },
  lightHeaderText: {
    color: '#111827',
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
  lightCardDetailBg: {
    backgroundColor: '#FFFFFF',
  },
  darkCardDetailBg: {
    backgroundColor: '#1F2937',
  },
  lightBalanceContainer: {
    backgroundColor: '#FFFFFF',
  },
  darkBalanceContainer: {
    backgroundColor: '#1F2937',
  },
  lightInput: {
    color: '#1F2937',
  },
  darkInput: {
    color: '#F9FAFB',
  },
  lightModalContainer: {
    backgroundColor: '#FFFFFF',
  },
  darkModalContainer: {
    backgroundColor: '#1F2937',
  },
});

export default CardsScreen;