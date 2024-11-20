import {
    FIREBASE_API_KEY,
    FIREBASE_STORAGE_BUCKET,
    FIREBASE_APP_ID,
    FIREBASE_PROJECT_ID,
    FIREBASE_AUTH_DOMAIN,
  } from "@env";
  import { initializeApp, getApp, getApps } from "firebase/app";
  import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
    listAll,
  } from "firebase/storage";
  import { getAuth } from "firebase/auth";
  
  // Configurações do Firebase com variáveis de ambiente
  const firebaseConfig = {
    apiKey: FIREBASE_API_KEY,
    authDomain: FIREBASE_AUTH_DOMAIN,
    projectId: FIREBASE_PROJECT_ID,
    storageBucket: FIREBASE_STORAGE_BUCKET,
    appId: FIREBASE_APP_ID,
  };
  
  // Inicializar o Firebase apenas se ainda não estiver inicializado
  if (getApps().length === 0) {
    initializeApp(firebaseConfig);
  }
  
  const fbApp = getApp();
  const fbStorage = getStorage(fbApp);
  const fbAuth = getAuth(fbApp);
  
  // Função para listar arquivos no Firebase Storage
  const listFiles = async () => {
    const listRef = ref(fbStorage, "images");
    const listResp = await listAll(listRef);
    return listResp.items;
  };
  
  // Função para upload de arquivos para o Firebase Storage
  const uploadToFirebase = async (
    uri: string,
    name: string,
    onProgress?: (progress: number) => void
  ): Promise<{ downloadUrl: string; metadata: any }> => {
    const response = await fetch(uri);
    const blob = await response.blob();
  
    const fileRef = ref(fbStorage, `images/${name}`);
    const uploadTask = uploadBytesResumable(fileRef, blob);
  
    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress && onProgress(progress);
        },
        (error) => {
          console.error("Erro no upload:", error);
          reject(error);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            downloadUrl,
            metadata: uploadTask.snapshot.metadata,
          });
        }
      );
    });
  };
  
  export { fbApp, fbStorage, fbAuth, uploadToFirebase, listFiles };
  