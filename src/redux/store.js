// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit'; // configureStore es una función que crea el store de la aplicación
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER, } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage por defecto
import authReducer from './loginSlice';        // authReducer es el reducer de autenticación
import registerReducer from './registerSlice'; // registerReducer es el reducer de registro
import clothReducer from './clothSlice';       // clothReducer es el reducer de productos
import shopReducer from './shopSlice';         // shopReducer es el reducer de tiendas
import categoriesReducer from './categoriesSlice'; // categoriesReducer es el reducer de categorías
import cartReducer from './cartSlice';         // cartReducer es el reducer de carrito

// Configuración de persistencia para el slice auth
const authPersistConfig = {
  key: 'auth',
  storage,
};

// Configuración de persistencia para el slice cart (solo guardamos los items)
const cartPersistConfig = {
  key: 'cart',
  storage,
  whitelist: ['items'], // no persistimos loading ni error
};

// Aplicar persistReducer al authReducer y al cartReducer
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    register: registerReducer,
    cloths: clothReducer,
    shop: shopReducer,
    categories: categoriesReducer,
    cart: persistedCartReducer,
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
