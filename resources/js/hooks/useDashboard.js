import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar }  from '../store/slices/sidebarSlice';
import { toggleTaskDone } from '../store/slices/dashboardSlice';

export function useSidebar() {
  const dispatch = useDispatch();
  const isOpen = useSelector(s => s.sidebar.isOpen);
  return {
    isOpen,
    toggle: () => dispatch(toggleSidebar()),
  };
}

export function useDashboardData() {
  const dispatch = useDispatch();
  const data = useSelector(s => s.dashboard);
  return {
    ...data,
    completeTask: (id) => dispatch(toggleTaskDone(id)),
  };
}
