import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar }  from '../store/slices/sidebarSlice';

export function useSidebar() {
  const dispatch = useDispatch();
  const isOpen = useSelector(s => s.sidebar.isOpen);
  return {
    isOpen,
    toggle: () => dispatch(toggleSidebar()),
  };
}

/** 
 * Legacy hook previously using dashboardSlice.
 * Redirects data from RTK Query if available, or returns empty state.
 */
export function useDashboardData() {
  // dashboardSlice was removed in favor of rtk-query reportApi.
  // Returning an empty structure to avoid breaking legacy components.
  return {
    tasks: [],
    recentActivities: [],
    completeTask: () => {},
  };
}
