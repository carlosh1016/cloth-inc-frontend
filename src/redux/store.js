import { configureStore } from '@reduxjs/toolkit'; // configureStore es una función que crea el store de la aplicación
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage por defecto
import authReducer from './loginSlice'; // authReducer es el reducer de autenticación
import registerReducer from './registerSlice'; // registerReducer es el reducer de registro

// Configuración de persistencia para el slice auth
const authPersistConfig = {
  key: 'auth',
  storage,
};

// Aplicar persistReducer al authReducer
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    register: registerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export default store; // exportamos el store para que pueda ser usado en la aplicación