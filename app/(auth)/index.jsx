import { useColorScheme } from '@/hooks/use-color-scheme';
import { auth } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function Login() {
    const isDark = useColorScheme() === 'dark';
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Router will handle the redirect based on auth state
        } catch (error) {
            Alert.alert('Login Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            <LinearGradient
                colors={isDark ? ['#1A1C1E', '#2D3A96'] : ['#4E5DD0', '#8A9FFE']}
                style={styles.backgroundGradient}
            />
            
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.headerSection}>
                            <View style={[styles.logoContainer, isDark && styles.logoContainerDark]}>
                                <Image 
                                    source={require('@/assets/images/ecg.jpg')} 
                                    style={styles.logo}
                                    resizeMode="cover"
                                />
                            </View>
                            <Text style={styles.appName}>ECG Meter</Text>
                            <Text style={[styles.tagline, isDark && styles.taglineDark]}>Smart Meter Management System</Text>
                        </View>

                        <View style={[styles.formContainer, isDark && styles.formContainerDark]}>
                            <Text style={[styles.welcomeText, isDark && styles.welcomeTextDark]}>Welcome Back!</Text>
                            <Text style={[styles.subText, isDark && styles.subTextDark]}>Sign in to continue managing your meters</Text>

                            <View style={styles.inputWrapper}>
                                <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Email Address</Text>
                                <View style={[styles.inputContainer, isDark && styles.inputContainerDark]}>
                                    <Ionicons name="mail-outline" size={20} color="#4E5DD0" style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, isDark && styles.inputDark]}
                                        placeholder="yourname@example.com"
                                        placeholderTextColor={isDark ? "#666" : "#A0A0A0"}
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputWrapper}>
                                <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Password</Text>
                                <View style={[styles.inputContainer, isDark && styles.inputContainerDark]}>
                                    <Ionicons name="lock-closed-outline" size={20} color="#4E5DD0" style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, isDark && styles.inputDark]}
                                        placeholder="••••••••"
                                        placeholderTextColor={isDark ? "#666" : "#A0A0A0"}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!passwordVisible}
                                    />
                                    <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                                        <Ionicons 
                                            name={passwordVisible ? 'eye-off-outline' : 'eye-outline'} 
                                            size={20} 
                                            color={isDark ? "#999" : "#666"} 
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity style={styles.forgotPassword}>
                                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.loginButton, loading && styles.disabledButton]} 
                                onPress={handleLogin}
                                disabled={loading}
                            >
                                <LinearGradient
                                    colors={isDark ? ['#4E5DD0', '#333'] : ['#4E5DD0', '#2D3A96']}
                                    style={styles.buttonGradient}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={styles.loginButtonText}>Login</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            <View style={styles.registerContainer}>
                                <Text style={[styles.registerText, isDark && styles.registerTextDark]}>Don't have an account? </Text>
                                <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                                    <Text style={styles.registerLink}>Register</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    containerDark: {
        backgroundColor: '#1A1C1E',
    },
    backgroundGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: height * 0.45,
    },
    safeArea: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    headerSection: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 30,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFF',
        padding: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 10,
    },
    logoContainerDark: {
        backgroundColor: '#2A2C2E',
    },
    logo: {
        width: '100%',
        height: '100%',
        borderRadius: 45,
    },
    appName: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFF',
        marginTop: 15,
        letterSpacing: 1,
    },
    tagline: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.85)',
        marginTop: 5,
    },
    taglineDark: {
        color: '#999',
    },
    formContainer: {
        backgroundColor: '#FFF',
        marginHorizontal: 25,
        borderRadius: 30,
        padding: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 8,
    },
    formContainerDark: {
        backgroundColor: '#2A2C2E',
        shadowOpacity: 0.3,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1C1E',
        marginBottom: 8,
    },
    welcomeTextDark: {
        color: '#E1E2E4',
    },
    subText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 25,
    },
    subTextDark: {
        color: '#999',
    },
    inputWrapper: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1C1E',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputLabelDark: {
        color: '#E1E2E4',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F3F9',
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 55,
        borderWidth: 1,
        borderColor: '#E1E5F2',
    },
    inputContainerDark: {
        backgroundColor: '#1A1C1E',
        borderColor: '#3A3C3E',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1A1C1E',
    },
    inputDark: {
        color: '#E1E2E4',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 25,
    },
    forgotPasswordText: {
        color: '#4E5DD0',
        fontSize: 14,
        fontWeight: '600',
    },
    loginButton: {
        height: 55,
        borderRadius: 15,
        overflow: 'hidden',
        shadowColor: '#4E5DD0',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 5,
    },
    buttonGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.7,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 25,
    },
    registerText: {
        color: '#666',
        fontSize: 15,
    },
    registerTextDark: {
        color: '#999',
    },
    registerLink: {
        color: '#4E5DD0',
        fontSize: 15,
        fontWeight: 'bold',
    },
});
