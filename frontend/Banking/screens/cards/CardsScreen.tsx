import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  SafeAreaView, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Dimensions 
} from "react-native";
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const CardsScreen = () => {
  const { isDarkMode } = useTheme();

  const containerStyle = isDarkMode ? styles.darkContainer : styles.lightContainer;
  const headerTextStyle = isDarkMode ? styles.darkHeaderText : styles.lightHeaderText;
  const secondaryTextStyle = isDarkMode ? styles.darkSecondaryText : styles.lightSecondaryText;
  const cardDetailBgStyle = isDarkMode ? styles.darkCardDetailBg : styles.lightCardDetailBg;
  const cardInfoBgStyle = isDarkMode ? styles.darkCardInfoBg : styles.lightCardInfoBg;

  // Card data
  const cards = [
    { cardNumber: '4032 7782 0824 6661', cardHolder: 'Jimmy Sullivan', cvv: '123' },
    { cardNumber: '1234 5678 9012 3456', cardHolder: 'Sarah Connor', cvv: '456' },
    { cardNumber: '9876 5432 1098 7654', cardHolder: 'John Doe', cvv: '789' },
  ];

  // State to track selected card and CVV visibility
  const [selectedCard, setSelectedCard] = useState(cards[0]);
  const [isCvvVisible, setIsCvvVisible] = useState(false);

  const handleCardClick = (card: typeof cards[0]) => {
    setSelectedCard(card);
    setIsCvvVisible(false); // Reset CVV visibility when switching cards
  };

  const toggleCvvVisibility = () => {
    setIsCvvVisible(!isCvvVisible);
  };

  const formatNumberWithCommas = (number: number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const balance = 1230.60; // Example balance

  return (
    <SafeAreaView style={[styles.container, containerStyle]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.currencyLabel, secondaryTextStyle]}>US Dollar</Text>
            <Text style={[styles.balanceAmount, headerTextStyle]}>{formatNumberWithCommas(balance.toFixed(2))}</Text>
          </View>
          <TouchableOpacity style={styles.topUpButton}>
            <Ionicons name="add-circle-outline" size={18} color="#111827" />
            <Text style={styles.topUpText}>Top Up</Text>
          </TouchableOpacity>
        </View>

        {/* Cards Section */}
        <ScrollView 
          horizontal={true} 
          showsHorizontalScrollIndicator={false} 
          style={styles.cardsContainer}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {cards.map((card, index) => (
            <TouchableOpacity 
              key={index} 
              onPress={() => handleCardClick(card)} 
              activeOpacity={0.8}
            >
              <View style={[styles.cardWrapper,
                (index % 2 === 0 ? {borderColor: "#2563EB"} : {borderColor: "#80b2e6"}),
                (selectedCard.cardNumber === card.cardNumber ? {borderWidth: 2} : {})]}
              >
                <View style={[styles.card, (index % 2 === 0 ? styles.blueCard : styles.cyanCard)]}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardName}>{card.cardHolder}</Text>
                    <Image 
                      source={require('../../assets/avatars/avatar2.jpg')} 
                      style={styles.cardLogo}
                    />
                  </View>
                  <View style={styles.cardNumberContainer}>
                    {card.cardNumber.split(' ').map((chunk, idx) => (
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
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Card Details Section */}
        <View style={[styles.cardDetailsSection, cardDetailBgStyle]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, headerTextStyle]}>Card Detail</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>New Card</Text>
            </TouchableOpacity>
          </View>

          {/* Card Info Items */}
          <View style={styles.cardInfoContainer}>
            <View style={styles.cardInfoItem}>
              <Text style={[styles.cardInfoLabel, secondaryTextStyle]}>CVV:</Text>
              <View style={[styles.cardInfoValue, cardInfoBgStyle]}>
                <Text style={[styles.cardCvvText, headerTextStyle]}>
                {isCvvVisible ? selectedCard.cvv : '***'}
                </Text>
                <TouchableOpacity
                  style={{ marginLeft: 'auto', marginTop: 0 }}
                  onPress={toggleCvvVisibility}
                >
                  <Ionicons
                    name={isCvvVisible ? "eye-outline" : "eye-off-outline"}
                    size={18}
                    color="#111827" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.cardInfoItem}>
              <Text style={[styles.cardInfoLabel, secondaryTextStyle]}>Card Number:</Text>
              <Text style={[styles.cardInfoValueText, headerTextStyle]}>{selectedCard.cardNumber}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.cardActionsContainer}>
            <TouchableOpacity style={styles.withdrawButton}>
              <Ionicons name="arrow-undo-outline" size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Withdraw</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.transferButton}>
              <Ionicons name="arrow-redo-outline" size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Transfer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
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
    height: 340,
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
    fontSize: 20,
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