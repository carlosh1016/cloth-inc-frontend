import { configureStore } from '@reduxjs/toolkit'; // configureStore es una función que crea el store de la aplicación
import authReducer from './loginSlice'; // authReducer es el reducer de autenticación
import registerReducer from './registerSlice'; // registerReducer es el reducer de registro

export const store = configureStore({
  reducer: {
    auth: authReducer,
    register: registerReducer,
  },
});

export default store; // exportamos el store para que pueda ser usado en la aplicación