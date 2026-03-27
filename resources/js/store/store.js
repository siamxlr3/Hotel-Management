import { configureStore } from '@reduxjs/toolkit';
import sidebarReducer   from './slices/sidebarSlice';
import localeReducer    from './slices/localeSlice';
import { staffApi }       from './api/staffApi';
import { reportApi }      from './api/reportApi';
import { reservationApi } from './api/reservationApi';
import { roomApi }        from './api/roomApi';
import { expenseApi }     from './api/expenseApi';
import { settingApi }     from './api/settingApi';
import { cmsApi }         from './api/cmsApi';

export const store = configureStore({
  reducer: {
    sidebar:     sidebarReducer,
    locale:      localeReducer,
    [staffApi.reducerPath]:       staffApi.reducer,
    [reportApi.reducerPath]:      reportApi.reducer,
    [reservationApi.reducerPath]: reservationApi.reducer,
    [roomApi.reducerPath]:        roomApi.reducer,
    [expenseApi.reducerPath]:     expenseApi.reducer,
    [settingApi.reducerPath]:     settingApi.reducer,
    [cmsApi.reducerPath]:         cmsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(staffApi.middleware)
      .concat(reportApi.middleware)
      .concat(reservationApi.middleware)
      .concat(roomApi.middleware)
      .concat(expenseApi.middleware)
      .concat(settingApi.middleware)
      .concat(cmsApi.middleware),
});

