import { configureStore } from "@reduxjs/toolkit";
import inputsReducer from "./reducers";
import navReducer from "../features/nav/NavSlice";
import uiSlice from "./Slices/uiSlice";
import filesReducer from "../features/nav/files/filesSlice";
import optionsReducer from "../store/Slices/selectOptionSlice";
import formReducer from "../store/Slices/formSlice";
import navbarReducer from "./navbarSlice";
import searchReducer from "./Slices/searchSlice";
import ticketsReducer from "./ticketSlice";
import authReducer from "../features/auth/authSlice";
import authenticationReducer from "./Slices/auth/authenticationSlice";
import buttonReducer from "./Slices/buttonSlice";
import forgotPasswordReducer from "./Slices/forgotpasswordSlice";
import itemsSlice from "./Slices/itemsSlice";
import ticketCreationSlice from "../features/auth/ticketCreationSlice";
import userReducer from "../store/Slices/userSlice";

const store = configureStore({
  reducer: {
    inputs: inputsReducer,
    navigation: navReducer,
    ui: uiSlice,
    files: filesReducer,
    options: optionsReducer,
    form: formReducer,
    navbar: navbarReducer,
    search: searchReducer,
    tickets: ticketsReducer,
    auth: authReducer,
    authentication: authenticationReducer,
    button: buttonReducer,
    forgotPassword: forgotPasswordReducer,
    items: itemsSlice,
    ticketCreation: ticketCreationSlice,
    user: userReducer,
  },
});

export default store;
