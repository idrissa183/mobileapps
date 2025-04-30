import React from 'react';
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
  const cardNumber = '4032 7782 0824 6661';
  const cardHolder = 'Jimmy Sullivan';
  const cvv = '***';

  return (
    <SafeAreaView style={[styles.container, containerStyle]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.currencyLabel, secondaryTextStyle]}>US Dollar</Text>
            <Text style={[styles.balanceAmount, headerTextStyle]}>1.230,60</Text>
          </View>
          <TouchableOpacity style={styles.topUpButton}>
            <Ionicons name="add-circle-outline" size={18} color="#111827" />
            <Text style={styles.topUpText}>Top Up</Text>
          </TouchableOpacity>
        </View>

        {/* Cards Section */}
        <View style={styles.cardsContainer}>
          {/* Card 1 */}
          <View style={styles.cardWrapper}>
            <View style={[styles.card, styles.blueCard]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardName}>{cardHolder}</Text>
                <Image 
                  source={require('../../assets/avatars/avatar1.jpg')} 
                  style={styles.cardLogo}
                />
              </View>
              <View style={styles.cardNumberContainer}>
                <Text style={styles.cardNumberText}>4032</Text>
                <Text style={styles.cardNumberText}>7782</Text>
                <Text style={styles.cardNumberText}>0824</Text>
                <Text style={styles.cardNumberText}>6661</Text>
              </View>
              <View style={styles.cardBrand}>
                <Text style={styles.cardBrandText}>BCD</Text>
              </View>
            </View>
          </View>

          {/* Card 2 */}
          <View style={[styles.cardWrapper, styles.secondaryCardWrapper]}>
            <View style={[styles.card, styles.lightBlueCard]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardNameSecondary}>{cardHolder}</Text>
                <Image 
                  source={require('../../assets/avatars/avatar1.jpg')} 
                  style={styles.cardLogo}
                />
              </View>
              <View style={styles.cardNumberContainer}>
                <Text style={styles.cardNumberTextSecondary}>4032</Text>
                <Text style={styles.cardNumberTextSecondary}>7782</Text>
                <Text style={styles.cardNumberTextSecondary}>0824</Text>
                <Text style={styles.cardNumberTextSecondary}>6661</Text>
              </View>
              <View style={styles.cardBrand}>
                <Text style={styles.cardBrandText}>BCD</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Card Details Section */}
        <View style={[styles.cardDetailsSection, cardDetailBgStyle]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, headerTextStyle]}>Card Detail</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* Card Info Items */}
          <View style={styles.cardInfoContainer}>
            <View style={styles.cardInfoItem}>
              <Text style={[styles.cardInfoLabel, secondaryTextStyle]}>CVV:</Text>
              <View style={[styles.cardInfoValue, cardInfoBgStyle]}>
                <Text style={[styles.cardCvvText, headerTextStyle]}>{cvv}</Text>
              </View>
            </View>

            <View style={styles.cardInfoItem}>
              <Text style={[styles.cardInfoLabel, secondaryTextStyle]}>Card Number:</Text>
              <Text style={[styles.cardInfoValueText, headerTextStyle]}>{cardNumber}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.cardActionsContainer}>
            <TouchableOpacity style={styles.withdrawButton}>
              <Ionicons name="wallet-outline" size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Withdraw</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.transferButton}>
              <Ionicons name="arrow-forward-outline" size={18} color="#FFFFFF" />
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
    // backgroundColor: '#F3F4F6',
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
    marginBottom: 15,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
  },
  secondaryCardWrapper: {
    position: 'absolute',
    top: 15,
    right: 0,
    width: '50%',
    height: 160,
    zIndex: 1,
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
  lightBlueCard: {
    backgroundColor: '#93C5FD',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  cardName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  cardNameSecondary: {
    color: '#1E3A8A',
    fontSize: 12,
    fontWeight: '500',
  },
  cardLogo: {
    width: 40,
    height: 24,
    resizeMode: 'contain',
  },
  cardNumberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  cardNumberTextSecondary: {
    color: '#1E3A8A',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  cardBrand: {
    alignItems: 'flex-start',
  },
  cardBrandText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    letterSpacing: 2,
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAllText: {
    fontSize: 14,
    color: '#2563EB',
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
    marginTop: 10,
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
  
  // Styles pour le mode clair
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
  
  // Styles pour le mode sombre
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