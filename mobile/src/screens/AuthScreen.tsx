import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/useAuthStore';
import { colors } from '../theme';

const AuthScreen = ({ navigation, route }: any) => {
  const isSignup = route.name === 'Signup';
  const { login, signup, isLoading, error, clearError } = useAuthStore();
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });

  useEffect(() => navigation.addListener('focus', clearError), [navigation, clearError]);

  const submit = () => {
    if (isSignup) signup(form.fullName.trim(), form.email.trim(), form.password);
    else login(form.email.trim(), form.password);
  };

  const canSubmit = form.email && form.password.length >= 6 && (!isSignup || form.fullName.trim());

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps='handled'>
          <Image source={require('../assets/logo.png')} style={styles.logo} />
          <Text style={styles.heading}>{isSignup ? 'Sign up to start listening' : 'Log in to listen'}</Text>

          {isSignup && (
            <TextInput
              style={styles.input}
              placeholder='Full name'
              placeholderTextColor={colors.subtle}
              value={form.fullName}
              onChangeText={fullName => setForm({ ...form, fullName })}
              textContentType='name'
            />
          )}
          <TextInput
            style={styles.input}
            placeholder='Email'
            placeholderTextColor={colors.subtle}
            value={form.email}
            onChangeText={email => setForm({ ...form, email })}
            autoCapitalize='none'
            keyboardType='email-address'
            textContentType='emailAddress'
          />
          <TextInput
            style={styles.input}
            placeholder='Password (min. 6 characters)'
            placeholderTextColor={colors.subtle}
            value={form.password}
            onChangeText={password => setForm({ ...form, password })}
            secureTextEntry
            textContentType={isSignup ? 'newPassword' : 'password'}
            onSubmitEditing={() => canSubmit && submit()}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            style={[styles.button, (!canSubmit || isLoading) && styles.disabled]}
            onPress={submit}
            disabled={!canSubmit || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.accentText} />
            ) : (
              <Text style={styles.buttonText}>{isSignup ? 'Sign up' : 'Log in'}</Text>
            )}
          </Pressable>

          <View style={styles.switchRow}>
            <Text style={styles.muted}>{isSignup ? 'Already have an account? ' : "Don't have an account? "}</Text>
            <Pressable onPress={() => navigation.replace(isSignup ? 'Login' : 'Signup')}>
              <Text style={styles.link}>{isSignup ? 'Log in' : 'Sign up'}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
export default AuthScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 14 },
  logo: { width: 64, height: 64, alignSelf: 'center', marginBottom: 8 },
  heading: { color: colors.text, fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  input: {
    backgroundColor: colors.card,
    color: colors.text,
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 50,
    fontSize: 16,
  },
  error: { color: colors.danger },
  button: {
    backgroundColor: colors.accent,
    height: 50,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  disabled: { opacity: 0.5 },
  buttonText: { color: colors.accentText, fontWeight: '700', fontSize: 16 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  muted: { color: colors.muted },
  link: { color: colors.text, fontWeight: '700', textDecorationLine: 'underline' },
});
