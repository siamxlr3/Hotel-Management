import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  language: localStorage.getItem('app_language') || 'ENG',
  currency: localStorage.getItem('app_currency') || 'USD'
};

const localeSlice = createSlice({
  name: 'locale',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem('app_language', action.payload);
    },
    setCurrency: (state, action) => {
      state.currency = action.payload;
      localStorage.setItem('app_currency', action.payload);
    }
  }
});

export const { setLanguage, setCurrency } = localeSlice.actions;

// Selector to get language and currency quickly
export const selectLocale = (state) => state.locale;

export default localeSlice.reducer;
