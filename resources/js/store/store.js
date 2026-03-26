import { configureStore } from '@reduxjs/toolkit';
import sidebarReducer   from './slices/sidebarSlice';
import dashboardReducer from './slices/dashboardSlice';
import roomReducer      from './slices/roomSlice';
import settingReducer   from './slices/settingSlice';
import cmsReducer       from './slices/cmsSlice';
import expenseReducer   from './slices/expenseSlice';
import reservationReducer from './slices/reservationSlice';
import localeReducer    from './slices/localeSlice';
import { staffApi }     from './api/staffApi';
import { reportApi }    from './api/reportApi';

export const store = configureStore({
  reducer: {
    sidebar:   sidebarReducer,
    dashboard: dashboardReducer,
    room:      roomReducer,
    setting:   settingReducer,
    cms:       cmsReducer,
    expense:   expenseReducer,
    reservation: reservationReducer,
    locale:    localeReducer,
    [staffApi.reducerPath]: staffApi.reducer,
    [reportApi.reducerPath]: reportApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(staffApi.middleware)
      .concat(reportApi.middleware),
});
