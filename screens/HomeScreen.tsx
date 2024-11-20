import React, { useState, useEffect, useRef } from 'react';
import { View, Button, StyleSheet, Image, Text, Platform } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { uploadToFirebase } from '../firebaseConfig'; // Função de upload para Firebase
import * as ImagePicker from 'expo-image-picker';
import Webcam from 'react-webcam';

export default function HomeScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [tipoCamera, setTipoCamera] = useState<CameraType>('back');
  const [cameraRef, setCameraRef] = useState<Camera | null>(null);
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  // Referência para o react-webcam
  const webcamRef = useRef<Webcam | null>(null);

  // Solicitar permissões apenas para dispositivos móveis
  useEffect(() => {
    if (Platform.OS !== 'web') {
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      })();
    } else {
      setHasPermission(true); // Permissão é automática na web
    }
  }, []);

  // Tirar foto com react-webcam (web)
  const tirarFotoWeb = () => {
    if (webcamRef.current) {
      const foto = webcamRef.current.getScreenshot();
      if (foto) setFotoUri(foto); // Define a URI da foto capturada
    }
  };

  // Tirar foto com expo-camera (móveis)
  const tirarFoto = async () => {
    if (Platform.OS === 'web') {
      alert('A funcionalidade de câmera móvel não está disponível na web.');
      return;
    }

    if (cameraRef) {
      const foto = await cameraRef.takePictureAsync();
      setFotoUri(foto.uri);
    } else {
      alert('Câmera não está pronta');
    }
  };

  // Escolher imagem da galeria (funciona em ambas as plataformas)
  const escolherImagem = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setFotoUri(result.assets[0].uri); // Web retorna assets[0].uri
    }
  };

  // Fazer upload para o Firebase Storage
  const enviarParaFirebase = async () => {
    if (!fotoUri) {
      alert('Nenhuma imagem capturada ou selecionada!');
      return;
    }

    try {
      const nomeArquivo = `imagem-${Date.now()}.jpg`;
      const result = await uploadToFirebase(fotoUri, nomeArquivo, (progresso) => {
        setProgress(progresso);
      });

      alert(`Imagem enviada com sucesso!\nURL: ${result.downloadUrl}`);
    } catch (error) {
      console.error(error);
      alert('Erro ao enviar imagem!');
    }
  };

  // Renderização condicional para a web
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        {fotoUri ? (
          <>
            <Image source={{ uri: fotoUri }} style={styles.preview} />
            <Button title="Enviar para o Firebase" onPress={enviarParaFirebase} />
            <Button title="Tirar outra foto" onPress={() => setFotoUri(null)} />
          </>
        ) : (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              style={styles.camera}
            />
            <Button title="Tirar Foto" onPress={tirarFotoWeb} />
          </>
        )}
        <Button title="Escolher Imagem" onPress={escolherImagem} />
      </View>
    );
  }

  // Renderização para dispositivos móveis
  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>Sem acesso à câmera</Text>;
  }

  return (
    <View style={styles.container}>
      {fotoUri ? (
        <>
          <Image source={{ uri: fotoUri }} style={styles.preview} />
          <Text style={styles.progress}>Progresso: {progress.toFixed(0)}%</Text>
          <Button title="Enviar para o Firebase" onPress={enviarParaFirebase} />
          <Button title="Tirar outra foto" onPress={() => setFotoUri(null)} />
        </>
      ) : (
        <Camera
          style={styles.camera}
          type={tipoCamera}
          ref={(ref) => setCameraRef(ref as CameraType)}
        />
      )}
      <Button title="Tirar Foto" onPress={tirarFoto} />
      <Button title="Escolher Imagem da Galeria" onPress={escolherImagem} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  preview: {
    width: '100%',
    height: '70%',
    marginBottom: 20,
  },
  progress: {
    marginVertical: 10,
    fontSize: 16,
  },
});
