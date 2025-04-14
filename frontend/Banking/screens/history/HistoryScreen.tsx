import { SafeAreaView, ScrollView, Text, View } from "react-native";
import useTheme from "../../hooks/useTheme";

const HistoryScreen = () => {
    const {isDarkMode} = useTheme();

    return (
        <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <ScrollView className="flex-1">
                <View className="p-4">
                    <Text className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        History Screen
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

export default HistoryScreen;