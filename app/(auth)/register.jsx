import { useColorScheme } from '@/hooks/use-color-scheme';
import { auth, db } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
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

export default function Register() {
    const isDark = useColorScheme() === 'dark';
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [staffId, setStaffId] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
    if (!email || !username || !password || !staffId) {
        Alert.alert('Missing Info', 'Please fill in all fields');
        return;
    }

    if (password.length < 6) {
        Alert.alert(
            'Password',
            'Password must be at least 6 characters long.'
        );
        return;
    }

    if (password.includes(username)) {
        Alert.alert(
            'Password',
            'Password must not contain username.'
        );
        return;
    }
    setLoading(true);

    try {
        // Check Staff ID
        const staffRef = doc(db, 'staffIDs', staffId);
        const staffSnap = await getDoc(staffRef);

        if (!staffSnap.exists()) {
            Alert.alert(
                'Access Denied',
                'Invalid Staff ID. Registration restricted to ECG staff.'
            );
            setLoading(false);
            return;
        }

        const staffData = staffSnap.data();
        // Check if already registered
        if (staffData.registered === true) {
            Alert.alert(
                'Access Denied',
                'This Staff ID has already been registered.'
            );
            setLoading(false);
            return;
        }
        // Create Authentication account
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );
        const user = userCredential.user;
        // Save user details
        await setDoc(doc(db, 'users', user.uid), {
            username,
            email,
            staffId,
            role: 'staff',
            createdAt: new Date().toISOString()
        });
        // Mark Staff ID as registered
        await updateDoc(staffRef, {
            registered: true,
            uid: user.uid,
            registeredAt: new Date().toISOString()
        });

        Alert.alert('Success', 'Registration successful!', [
            {
                text: 'OK',
                onPress: () => router.replace('/(tabs)')
            }
        ]);

        } catch (error) {
            Alert.alert('Registration Failed', error.message);
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
                            <TouchableOpacity style={[styles.backButton, isDark && styles.backButtonDark]} onPress={() => router.back()}>
                                <Ionicons name="arrow-back" size={24} color="#FFF" />
                            </TouchableOpacity>
                            <View style={[styles.logoContainer, isDark && styles.logoContainerDark]}>
                                <Image 
                                    source={require('@/assets/images/ecg.jpg')} 
                                    style={styles.logo}
                                    resizeMode="cover"
                                />
                            </View>
                            <Text style={styles.appName}>Create Account</Text>
                            <Text style={[styles.tagline, isDark && styles.taglineDark]}>Join the ECG Management Team</Text>
                        </View>

                        <View style={[styles.formContainer, isDark && styles.formContainerDark]}>
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Full Name</Text>
                                <View style={[styles.inputContainer, isDark && styles.inputContainerDark]}>
                                    <Ionicons name="person-outline" size={20} color="#4E5DD0" style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, isDark && styles.inputDark]}
                                        placeholder="Mr. Yeboah"
                                        placeholderTextColor={isDark ? "#666" : "#A0A0A0"}
                                        value={username}
                                        onChangeText={setUsername}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputWrapper}>
                                <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Staff ID</Text>
                                <View style={[styles.inputContainer, isDark && styles.inputContainerDark]}>
                                    <Ionicons name="card-outline" size={20} color="#4E5DD0" style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, isDark && styles.inputDark]}
                                        placeholder="ECG-XXXXX"
                                        placeholderTextColor={isDark ? "#666" : "#A0A0A0"}
                                        value={staffId}
                                        onChangeText={setStaffId}
                                        autoCapitalize="characters"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputWrapper}>
                                <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Email Address</Text>
                                <View style={[styles.inputContainer, isDark && styles.inputContainerDark]}>
                                    <Ionicons name="mail-outline" size={20} color="#4E5DD0" style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, isDark && styles.inputDark]}
                                        placeholder="yourname@ecg.com"
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

                            <TouchableOpacity 
                                style={[styles.registerButton, loading && styles.disabledButton]} 
                                onPress={handleRegister}
                                disabled={loading}
                            >
                                <LinearGradient
                                    colors={isDark ? ['#4E5DD0', '#333'] : ['#4E5DD0', '#2D3A96']}
                                    style={styles.buttonGradient}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={styles.registerButtonText}>Register</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            <View style={styles.loginLinkContainer}>
                                <Text style={[styles.loginLinkText, isDark && styles.loginLinkTextDark]}>Already have an account? </Text>
                                <TouchableOpacity onPress={() => router.push('/(auth)')}>
                                    <Text style={styles.loginLink}>Login</Text>
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
        height: height * 0.4,
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
        marginTop: 20,
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    backButton: {
        alignSelf: 'flex-start',
        padding: 10,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginBottom: 10,
    },
    backButtonDark: {
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFF',
        padding: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    logoContainerDark: {
        backgroundColor: '#2A2C2E',
    },
    logo: {
        width: '100%',
        height: '100%',
        borderRadius: 35,
    },
    appName: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFF',
        marginTop: 15,
    },
    tagline: {
        fontSize: 14,
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
        padding: 25,
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
    inputWrapper: {
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1C1E',
        marginBottom: 6,
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
        height: 52,
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
        fontSize: 15,
        color: '#1A1C1E',
    },
    inputDark: {
        color: '#E1E2E4',
    },
    registerButton: {
        height: 55,
        borderRadius: 15,
        overflow: 'hidden',
        marginTop: 10,
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
    registerButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.7,
    },
    loginLinkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    loginLinkText: {
        color: '#666',
        fontSize: 14,
    },
    loginLinkTextDark: {
        color: '#999',
    },
    loginLink: {
        color: '#4E5DD0',
        fontSize: 14,
        fontWeight: 'bold',
    },
});