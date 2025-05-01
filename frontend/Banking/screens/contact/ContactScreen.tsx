import React, { useState } from 'react';
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
  Dimensions 
} from "react-native";
import { useTheme } from '../../hooks/useTheme';

const { width } = Dimensions.get('window');

const ContactScreen = () => {
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  
  const containerStyle = isDarkMode ? styles.darkContainer : styles.lightContainer;
  const cardStyle = isDarkMode ? styles.darkCard : styles.lightCard;
  const headerTextStyle = isDarkMode ? styles.darkHeaderText : styles.lightHeaderText;
  const secondaryTextStyle = isDarkMode ? styles.darkSecondaryText : styles.lightSecondaryText;
  const inputStyle = isDarkMode ? styles.darkInput : styles.lightInput;
  const inputContainerStyle = isDarkMode ? styles.darkInputContainer : styles.lightInputContainer;

  const contacts = [
    {
      id: '1',
      name: 'Alberto Montero',
      phoneNumber: '+226 (70) 70-62-47',
      email: 'alberto@gmail.com',
      isFrequent: true,
      avatar: require('../../assets/avatars/avatar2.jpg'),
      transactions: 5,
      totalSent: '$1,250.00',
      totalReceived: '$600.00'
    },
    {
      id: '2',
      name: 'Louis Da Silva',
      phoneNumber: '+226 (56) 56-62-47',
      email: 'louis@gmail.com',
      isFrequent: true,
      avatar: require('../../assets/avatars/avatar2.jpg'),
      transactions: 3,
      totalSent: '$85.00',
      totalReceived: '$120.00'
    },
    {
      id: '3',
      name: 'Marina Kostova',
      phoneNumber: '+226 (78) 78-62-47',
      email: 'marina@gmail.com',
      isFrequent: true,
      avatar: require('../../assets/avatars/avatar2.jpg'),
      transactions: 8,
      totalSent: '$350.00',
      totalReceived: '$425.00'
    },
    {
      id: '4',
      name: 'John Smith',
      phoneNumber: '+226 (77) 77-62-47',
      email: 'john@gmail.com',
      isFrequent: false,
      avatar: require('../../assets/avatars/avatar2.jpg'),
      transactions: 2,
      totalSent: '$50.00',
      totalReceived: '$0.00'
    },
    {
      id: '5',
      name: 'Emma Wilson',
      phoneNumber: '+226 (60) 60-62-47',
      email: 'emma@gmail.com',
      isFrequent: false,
      avatar: require('../../assets/avatars/avatar2.jpg'),
      transactions: 1,
      totalSent: '$75.00',
      totalReceived: '$0.00'
    },
    {
      id: '6',
      name: 'Thomas Lee',
      phoneNumber: '+226 (73) 73-62-47',
      email: 'thomas@gmail.com',
      isFrequent: false,
      avatar: require('../../assets/avatars/avatar2.jpg'),
      transactions: 4,
      totalSent: '$230.00',
      totalReceived: '$180.00'
    },
    {
      id: '7',
      name: 'Sophia Garcia',
      phoneNumber: '+226 (79) 79-62-47',
      email: 'sophia@gmail.com',
      isFrequent: false,
      avatar: require('../../assets/avatars/avatar2.jpg'),
      transactions: 2,
      totalSent: '$120.00',
      totalReceived: '$45.00'
    },
    {
      id: '8',
      name: 'Robert Johnson',
      phoneNumber: '+226 (76) 76-62-47',
      email: 'robert@gmail.com',
      isFrequent: false,
      avatar: require('../../assets/avatars/avatar2.jpg'),
      transactions: 3,
      totalSent: '$200.00',
      totalReceived: '$75.00'
    }
  ];

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phoneNumber.includes(searchQuery) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const frequentContacts = contacts.filter(contact => contact.isFrequent);
  
  const renderContactItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.contactItem, cardStyle, selectedContact?.id === item.id && styles.selectedContact]} 
      onPress={() => setSelectedContact(item)}
    >
      <Image source={item.avatar} style={styles.contactAvatar} />
      <View style={styles.contactInfo}>
        <Text style={[styles.contactName, headerTextStyle]}>{item.name}</Text>
        <Text style={[styles.contactDetail, secondaryTextStyle]}>{item.phoneNumber}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, containerStyle]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header avec le titre et le bouton d'ajout de contact */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, headerTextStyle]}>Contacts</Text>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, inputContainerStyle]}>
          <Text style={[styles.searchIcon, secondaryTextStyle]}>🔍</Text>
          <TextInput
            style={[styles.searchInput, inputStyle]}
            placeholder="Search contacts"
            placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={() => setSearchQuery('')}>
              <Text style={secondaryTextStyle}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Contact Details Section - Only shown when a contact is selected */}
        {selectedContact && (
          <View style={[styles.detailsCard, cardStyle]}>
            <View style={styles.detailsHeader}>
              <Image source={selectedContact.avatar} style={styles.detailsAvatar} />
              <View style={styles.detailsHeaderInfo}>
                <Text style={[styles.detailsName, headerTextStyle]}>{selectedContact.name}</Text>
                <Text style={[styles.detailsEmail, secondaryTextStyle]}>{selectedContact.email}</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedContact(null)}>
                <Text style={[styles.closeButtonText, secondaryTextStyle]}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.detailsContent}>
              <View style={styles.detailsRow}>
                <Text style={[styles.detailsLabel, secondaryTextStyle]}>Phone</Text>
                <Text style={[styles.detailsValue, headerTextStyle]}>{selectedContact.phoneNumber}</Text>
              </View>
              
              <View style={styles.detailsRow}>
                <Text style={[styles.detailsLabel, secondaryTextStyle]}>Email</Text>
                <Text style={[styles.detailsValue, headerTextStyle]}>{selectedContact.email}</Text>
              </View>
              
              <View style={styles.detailsRow}>
                <Text style={[styles.detailsLabel, secondaryTextStyle]}>Transactions</Text>
                <Text style={[styles.detailsValue, headerTextStyle]}>{selectedContact.transactions}</Text>
              </View>
              
              <View style={styles.detailsStats}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, headerTextStyle, styles.sentColor]}>{selectedContact.totalSent}</Text>
                  <Text style={[styles.statLabel, secondaryTextStyle]}>Sent</Text>
                </View>
                
                <View style={styles.statDivider}></View>
                
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, headerTextStyle, styles.receivedColor]}>{selectedContact.totalReceived}</Text>
                  <Text style={[styles.statLabel, secondaryTextStyle]}>Received</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.detailsActions}>
              <TouchableOpacity style={styles.actionBtnPrimary}>
                <Text style={styles.actionBtnPrimaryText}>Send Money</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionBtnSecondary}>
                <Text style={[styles.actionBtnSecondaryText, headerTextStyle]}>Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Frequent Contacts */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, headerTextStyle]}>Frequent Contacts</Text>
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.frequentContactsContainer}
          >
            {frequentContacts.map((contact) => (
              <TouchableOpacity 
                key={contact.id}
                style={styles.frequentContactItem}
                onPress={() => setSelectedContact(contact)}
              >
                <Image source={contact.avatar} style={styles.frequentContactAvatar} />
                <Text style={[styles.frequentContactName, headerTextStyle]} 
                      numberOfLines={1} 
                      ellipsizeMode="tail">
                  {contact.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* All Contacts */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, headerTextStyle]}>All Contacts</Text>
          <FlatList
            data={filteredContacts}
            renderItem={renderContactItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.contactListContainer}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Base styles
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
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  
  // Search bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 10,
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  
  // Section styles
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  
  // Frequent contacts
  frequentContactsContainer: {
    paddingHorizontal: 20,
  },
  frequentContactItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  frequentContactAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 8,
  },
  frequentContactName: {
    fontSize: 14,
    textAlign: 'center',
    width: 70,
  },
  
  // Contact list
  contactListContainer: {
    paddingHorizontal: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  selectedContact: {
    borderWidth: 2,
    borderColor: '#1E40AF',
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactDetail: {
    fontSize: 14,
  },
  contactActions: {
    flexDirection: 'row',
  },
  actionButton: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  
  // Details card
  detailsCard: {
    margin: 20,
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  detailsHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  detailsAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  detailsHeaderInfo: {
    flex: 1,
  },
  detailsName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detailsEmail: {
    fontSize: 14,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailsContent: {
    padding: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailsLabel: {
    fontSize: 14,
  },
  detailsValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailsStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  sentColor: {
    color: '#EF4444',
  },
  receivedColor: {
    color: '#10B981',
  },
  detailsActions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  actionBtnPrimary: {
    flex: 1,
    backgroundColor: '#1E40AF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  actionBtnPrimaryText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  actionBtnSecondary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.3)',
  },
  actionBtnSecondaryText: {
    fontWeight: '600',
    fontSize: 16,
  },
  
  // Light mode styles
  lightContainer: {
    backgroundColor: '#FFFFFF',
  },
  lightCard: {
    backgroundColor: '#F3F4F6',
  },
  lightHeaderText: {
    color: '#111827',
  },
  lightSecondaryText: {
    color: '#6B7280',
  },
  lightInput: {
    color: '#111827',
  },
  lightInputContainer: {
    backgroundColor: '#F3F4F6',
  },
  
  // Dark mode styles
  darkContainer: {
    backgroundColor: '#0F172A',
  },
  darkCard: {
    backgroundColor: '#1E293B',
  },
  darkHeaderText: {
    color: '#F9FAFB',
  },
  darkSecondaryText: {
    color: '#9CA3AF',
  },
  darkInput: {
    color: '#F9FAFB',
  },
  darkInputContainer: {
    backgroundColor: '#1E293B',
  },
});

export default ContactScreen;