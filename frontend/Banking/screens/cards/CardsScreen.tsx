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
  ActivityIndicator
} from "react-native";
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import cardService, { Card, CardCreateRequest, CardStatus, CardType } from '../../services/cardService';
import useTranslation from '../../hooks/useTranslation';

const { width } = Dimensions.get('window');

const CardsScreen: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();

  const containerStyle = isDarkMode ? styles.darkContainer : styles.lightContainer;
  const headerTextStyle = isDarkMode ? styles.darkHeaderText : styles.lightHeaderText;
  const secondaryTextStyle = isDarkMode ? styles.darkSecondaryText : styles.lightSecondaryText;
  const cardDetailBgStyle = isDarkMode ? styles.darkCardDetailBg : styles.lightCardDetailBg;
  const cardInfoBgStyle = isDarkMode ? styles.darkCardInfoBg : styles.lightCardInfoBg;

  // États
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isCvvVisible, setIsCvvVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Récupération des cartes au chargement
  useEffect(() => {
    fetchCards();
  }, []);

  // Fonction pour récupérer les cartes
  const fetchCards = async () => {
    setLoading(true);
    try {
      const fetchedCards = await cardService.getAllCards();
      setCards(fetchedCards);
      
      // Sélectionne la première carte par défaut s'il y en a une
      if (fetchedCards.length > 0 && !selectedCard) {
        setSelectedCard(fetchedCards[0]);
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
      // Vous pourriez ajouter une notification d'erreur ici
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour créer une nouvelle carte
  const createNewCard = async () => {
    setCreating(true);
    try {
      const newCardData: CardCreateRequest = {
        card_name: t('cards.defaultNewCardName'),
        card_type: CardType.DEBIT,
        is_contactless: true,
        is_virtual: false
      };
      
      const newCard = await cardService.createCard(newCardData);
      
      // Ajouter la nouvelle carte et la sélectionner
      setCards(prevCards => [...prevCards, newCard]);
      setSelectedCard(newCard);
      
    } catch (error) {
      console.error('Error creating new card:', error);
      // Vous pourriez ajouter une notification d'erreur ici
    } finally {
      setCreating(false);
    }
  };

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
    setIsCvvVisible(false); // Réinitialiser la visibilité du CVV lors du changement de carte
  };

  const toggleCvvVisibility = () => {
    setIsCvvVisible(!isCvvVisible);
  };

  const formatNumberWithCommas = (number: number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Formatage d'un numéro de carte masqué
  const formatCardNumber = (cardNumber: string) => {
    // Si la carte est masquée (comme "************8898"), on peut la formater
    if (cardNumber.startsWith('*')) {
      const lastFour = cardNumber.slice(-4);
      return `**** **** **** ${lastFour}`;
    }
    
    // Sinon, on retourne la carte formatée
    return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const balance = 1230.60; // Exemple de solde - À remplacer par des données réelles

  // Chargement initial
  if (loading && cards.length === 0) {
    return (
      <SafeAreaView style={[styles.container, containerStyle, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={[styles.loadingText, headerTextStyle]}>{t('common.loading')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, containerStyle]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.currencyLabel, secondaryTextStyle]}>{t('currency.usd')}</Text>
            <Text style={[styles.balanceAmount, headerTextStyle]}>{formatNumberWithCommas(balance.toFixed(2))}</Text>
          </View>
          <TouchableOpacity style={styles.topUpButton}>
            <Ionicons name="add-circle-outline" size={18} color="#111827" />
            <Text style={styles.topUpText}>{t('cards.topUp')}</Text>
          </TouchableOpacity>
        </View>

        {/* Cards Section */}
        {loading ? (
          <View style={styles.loadingContainer}>
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
                  (index % 2 === 0 ? {borderColor: "#2563EB"} : {borderColor: "#80b2e6"}),
                  (selectedCard?.id === card.id ? {borderWidth: 2} : {})]}
                >
                  <View style={[styles.card, (index % 2 === 0 ? styles.blueCard : styles.cyanCard)]}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardName}>{card.card_name}</Text>
                      <Image 
                        source={require('../../assets/avatars/avatar2.jpg')} 
                        style={styles.cardLogo}
                      />
                    </View>
                    <View style={styles.cardNumberContainer}>
                      {formatCardNumber(card.card_number).split(' ').map((chunk, idx) => (
                        <Text key={idx} style={styles.cardNumberText}>{chunk}</Text>
                      ))}
                    </View>
                    <View style={styles.cardBrand}>
                      <Text style={styles.cardBrandText}>BCD</Text>
                      <Image 
                        source={require('../../assets/puce.png')} 
                        style={styles.cardPuce}
                      />
                      <Text></Text>
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
          </ScrollView>
        )}

        {/* Card Details Section */}
        {selectedCard && (
          <View style={[styles.cardDetailsSection, cardDetailBgStyle]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, headerTextStyle]}>{t('cards.cardDetail')}</Text>
              <TouchableOpacity onPress={creating ? undefined : createNewCard} disabled={creating}>
                {creating ? (
                  <ActivityIndicator size="small" color="#2563EB" />
                ) : (
                  <Text style={styles.viewAllText}>{t('cards.newCard')}</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Card Info Items */}
            <View style={styles.cardInfoContainer}>
              <View style={styles.cardInfoItem}>
                <Text style={[styles.cardInfoLabel, secondaryTextStyle]}>{t('cards.cardNumber')}:</Text>
                <Text style={[styles.cardInfoValueText, headerTextStyle]}>{formatCardNumber(selectedCard.card_number)}</Text>
              </View>

              <View style={styles.cardInfoItem}>
                <Text style={[styles.cardInfoLabel, secondaryTextStyle]}>{t('cards.expiryDate')}:</Text>
                <Text style={[styles.cardInfoValueText, headerTextStyle]}>{selectedCard.expiry_date}</Text>
              </View>

              <View style={styles.cardInfoItem}>
                <Text style={[styles.cardInfoLabel, secondaryTextStyle]}>{t('cards.cardType')}:</Text>
                <Text style={[styles.cardInfoValueText, headerTextStyle]}>
                  {selectedCard.card_type === CardType.DEBIT ? t('cards.debitCard') : t('cards.virtualCard')}
                </Text>
              </View>

              <View style={styles.cardInfoItem}>
                <Text style={[styles.cardInfoLabel, secondaryTextStyle]}>{t('cards.status')}:</Text>
                <Text style={[styles.cardInfoValueText, headerTextStyle]}>
                  {selectedCard.status === CardStatus.ACTIVE ? t('cards.active') : t('cards.inactive')}
                </Text>
              </View>

              <View style={styles.cardInfoItem}>
                <Text style={[styles.cardInfoLabel, secondaryTextStyle]}>{t('cards.contactless')}:</Text>
                <Text style={[styles.cardInfoValueText, headerTextStyle]}>
                  {selectedCard.is_contactless ? t('common.yes') : t('common.no')}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.cardActionsContainer}>
              <TouchableOpacity style={styles.withdrawButton}>
                <Ionicons name="arrow-undo-outline" size={18} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>{t('cards.withdraw')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.transferButton}>
                <Ionicons name="arrow-redo-outline" size={18} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>{t('cards.transfer')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  loadingContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
    margin: 20,
    borderRadius: 16,
    backgroundColor: '#eceff3',
  },
  currencyLabel: {
    fontSize: 15,
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  topUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  topUpText: {
    marginLeft: 4,
    fontWeight: '500',
    color: '#111827',
  },
  cardsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  cardWrapper: {
    marginRight: 15,
    height: 240,
    width: width * 0.6,
    borderRadius: 22,
    overflow: 'hidden',
    padding: 8,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
  },
  blueCard: {
    backgroundColor: '#2563EB',
  },
  cyanCard: {
    backgroundColor: '#80b2e6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  cardName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
  cardLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: 'contain',
  },
  cardNumberContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  cardNumberText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
    marginVertical: 5,
  },
  cardBrand: {
    display: 'flex',
    flexDirection: 'row',
  },
  cardBrandText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  cardPuce: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginLeft: "15%",
  },
  cardFooter: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardDate: {
    color: 'white',
    fontSize: 12,
  },
  cardStatusBadge: {
    color: 'white',
    fontSize: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  cardDetailsSection: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  viewAllText: {
    fontSize: 16,
    color: '#2563EB',
    textDecorationLine: 'underline',
  },
  cardInfoContainer: {
    marginBottom: 20,
  },
  cardInfoItem: {
    marginBottom: 16,
  },
  cardInfoLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  cardInfoValue: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
    padding: 12,
    borderRadius: 8,
  },
  cardCvvText: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 2,
  },
  cardInfoValueText: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 1,
  },
  cardActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  withdrawButton: {
    backgroundColor: '#2563EB',
    borderRadius: 100,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 10,
  },
  transferButton: {
    backgroundColor: '#111827',
    borderRadius: 100,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 10,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Styles for light mode
  lightContainer: {
    backgroundColor: '#F9FAFB',
  },
  lightHeaderText: {
    color: '#111827',
  },
  lightSecondaryText: {
    color: '#6B7280',
  },
  lightCardDetailBg: {
    backgroundColor: '#FFFFFF',
  },
  lightCardInfoBg: {
    backgroundColor: '#F3F4F6',
  },
  
  // Styles for dark mode
  darkContainer: {
    backgroundColor: '#111827',
  },
  darkHeaderText: {
    color: '#F9FAFB',
  },
  darkSecondaryText: {
    color: '#9CA3AF',
  },
  darkCardDetailBg: {
    backgroundColor: '#1F2937',
  },
  darkCardInfoBg: {
    backgroundColor: '#374151',
  },
});

export default CardsScreen;