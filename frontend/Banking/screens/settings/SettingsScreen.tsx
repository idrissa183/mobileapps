import { SafeAreaView, ScrollView, Text, View, StyleSheet } from "react-native";
import useTheme from "../../hooks/useTheme";

const SettingsScreen = () => {
    const { isDarkMode } = useTheme();

    const styles = getStyles(isDarkMode);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scroll}>
                <View style={styles.innerContainer}>
                    <Text style={styles.title}>
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const getStyles = (isDarkMode: boolean) =>
    StyleSheet.create({
        container: {
            flex: 1,
            paddingTop: 30,
            backgroundColor: isDarkMode ? '#1f2937' : '#f3f4f6',
        },
        scroll: {
            flex: 1,
        },
        innerContainer: {
            padding: 16, 
        },
        title: {
            fontSize: 24, 
            fontWeight: 'bold',
            marginBottom: 24,
            color: isDarkMode ? '#ffffff' : '#1f2937',
        },
    });

export default SettingsScreen;
