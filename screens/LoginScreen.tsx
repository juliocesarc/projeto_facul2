import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import { fbAuth } from '../firebaseConfig'; // Certifique-se de que o firebaseConfig está configurado corretamente
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App'; // Tipo da navegação definido no App.tsx
import { signInWithEmailAndPassword } from 'firebase/auth';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }
  
    setLoading(true);
  
    try {
      await signInWithEmailAndPassword(fbAuth, email, password);
      navigation.replace('Home'); // Navega para a Home após login bem-sucedido
    } catch (error: any) {
      console.error('Erro no login:', error.message);
      Alert.alert('Erro', 'Falha ao realizar login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title={loading ? 'Carregando...' : 'Entrar'} onPress={handleLogin} disabled={loading} />
      <Text style={styles.infoText}>
        Não tem uma conta? Clique aqui para se registrar (adicione lógica de registro aqui).
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  infoText: {
    marginTop: 15,
    fontSize: 14,
    textAlign: 'center',
    color: 'gray',
  },
});
