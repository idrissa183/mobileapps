import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    Dimensions
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../App';
import useTheme from '../../hooks/useTheme';
import useTranslation from '../../hooks/useTranslation';
import authService from '../../services/authService';
import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';
import Button from '../../components/common/Button';


type OTPVerificationRouteProp = RouteProp<RootStackParamList, 'OTPVerification'>;
type OTPVerificationNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const OTPVerificationScreen = () => {
    const navigation = useNavigation<OTPVerificationNavigationProp>();
    const route = useRoute<OTPVerificationRouteProp>();
    const { isDarkMode } = useTheme();
    const { t } = useTranslation();

    const { email, mode } = route.params || { email: '', mode: 'register' };

    const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResendingOtp, setIsResendingOtp] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [canResend, setCanResend] = useState(false);

    const inputRefs = useRef<Array<TextInput | null>>(Array(6).fill(null));

    const styles = getStyles(isDarkMode);

    useEffect(() => {
        if (!email) {
            Alert.alert(
                t('error', 'common'),
                t('emailMissing', 'auth'),
                [{ text: t('goBack', 'common'), onPress: () => navigation.goBack() }]
            );
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleOtpChange = (text: string, index: number) => {
        if (text.length > 1) {
            text = text[text.length - 1];
        }

        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        if (text !== '' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        // Handle backspace
        if (e.nativeEvent.key === 'Backspace' && index > 0 && otp[index] === '') {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOTP = async () => {
        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            Alert.alert(
                t('error', 'common'),
                t('invalidOtpLength', 'auth')
            );
            return;
        }

        setIsVerifying(true);

        try {
            await authService.verifyOtp(email, otpCode);
            navigation.navigate('SignIn');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || t('otpVerificationFailed', 'auth');
            Alert.alert(t('error', 'common'), errorMessage);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResendOTP = async () => {
        if (!canResend) return;

        setIsResendingOtp(true);

        try {
            await authService.resendOtp(email);

            // Reset timer
            setTimeLeft(60);
            setCanResend(false);

            Alert.alert(
                t('success', 'common'),
                t('otpResent', 'auth')
            );
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || t('otpResendFailed', 'auth');
            Alert.alert(t('error', 'common'), errorMessage);
        } finally {
            setIsResendingOtp(false);
        }
    };

    const formatTime = (seconds: number) => {
        return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
    };

    return (
        <SafeAreaWrapper>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#fff" : "#000"} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {t('otpVerification', 'auth')}
                    </Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="shield-checkmark" size={80} color="#3B82F6" />
                    </View>

                    <Text style={styles.title}>
                        {t('verifyYourEmail', 'auth')}
                    </Text>

                    <Text style={styles.subtitle}>
                        {t('otpSentTo', 'auth')} <Text style={styles.emailText}>{email}</Text>
                    </Text>

                    {/* OTP Input */}
                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => (inputRefs.current[index] = ref)}
                                style={[
                                    styles.otpInput,
                                    digit ? styles.filledInput : {},
                                ]}
                                value={digit}
                                onChangeText={(text) => handleOtpChange(text, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                keyboardType="number-pad"
                                maxLength={1}
                                selectTextOnFocus
                            />
                        ))}
                    </View>

                    {/* Timer and Resend */}
                    <View style={styles.timerContainer}>
                        <Text style={styles.timerText}>
                            {canResend
                                ? t('didntReceiveCode', 'auth')
                                : `${t('resendCodeIn', 'auth')} ${formatTime(timeLeft)}`
                            }
                        </Text>

                        <TouchableOpacity
                            onPress={handleResendOTP}
                            disabled={!canResend || isResendingOtp}
                            style={[styles.resendButton, !canResend && styles.disabledButton]}
                        >
                            {isResendingOtp ? (
                                <ActivityIndicator size="small" color="#3B82F6" />
                            ) : (
                                <Text style={[styles.resendText, !canResend && styles.disabledText]}>
                                    {t('resendCode', 'auth')}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Verify button */}
                    <Button
                        title={t('verifyAndContinue', 'auth')}
                        onPress={handleVerifyOTP}
                        loading={isVerifying}
                        fullWidth
                    />
                </View>
            </KeyboardAvoidingView>

            {/* Loading overlay */}
            {isVerifying}
        </SafeAreaWrapper>
    );
};

const getStyles = (isDarkMode: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: isDarkMode ? '#121212' : '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? '#333' : '#E5E7EB',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: isDarkMode ? '#fff' : '#111',
    },
    content: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: isDarkMode ? '#2563EB20' : '#3B82F620',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: isDarkMode ? '#fff' : '#111',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: isDarkMode ? '#ccc' : '#4B5563',
        marginBottom: 32,
        textAlign: 'center',
        paddingHorizontal: 16,
    },
    emailText: {
        fontWeight: '600',
        color: isDarkMode ? '#3B82F6' : '#2563EB',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 32,
    },
    otpInput: {
        width: Dimensions.get('window').width / 8,
        height: 56,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: isDarkMode ? '#333' : '#D1D5DB',
        backgroundColor: isDarkMode ? '#1F2937' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
    },
    filledInput: {
        borderColor: '#3B82F6',
        backgroundColor: isDarkMode ? '#1E3A8A20' : '#3B82F610',
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        flexWrap: 'wrap',
    },
    timerText: {
        fontSize: 14,
        color: isDarkMode ? '#ccc' : '#6B7280',
        marginRight: 8,
    },
    resendButton: {
        paddingVertical: 8,
    },
    resendText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3B82F6',
    },
    disabledButton: {
        opacity: 0.5,
    },
    disabledText: {
        color: isDarkMode ? '#64748B' : '#94A3B8',
    }
});

export default OTPVerificationScreen;