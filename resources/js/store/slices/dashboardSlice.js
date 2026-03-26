import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  stats: [
    { id: 1, label: 'New Bookings',   value: '840',      change: '+8.70%', positive: true,  icon: 'calendar' },
    { id: 4, label: 'Total Revenue',  value: '$123,980', change: '+5.70%', positive: true,  icon: 'dollar' },
  ],
  roomAvailability: {
    occupied: 286,
    reserved: 87,
    available: 32,
    notReady: 13,
    total: 418,
  },
  overallRating: {
    score: 4.6,
    label: 'Impressive',
    reviews: 2546,
    categories: [
      { name: 'Facilities',   score: 4.4 },
      { name: 'Cleanliness',  score: 4.7 },
      { name: 'Services',     score: 4.6 },
      { name: 'Comfort',      score: 4.8 },
      { name: 'Location',     score: 4.5 },
    ],
  },
  tasks: [
    { id: 1, date: 'June 19, 2028', title: 'Set Up Conference Room B for 10 AM Meeting',          done: false, highlight: false },
    { id: 2, date: 'June 19, 2028', title: 'Restock Housekeeping Supplies on 3rd Floor',            done: false, highlight: false },
    { id: 3, date: 'June 20, 2028', title: 'Inspect and Clean the Pool Area',                       done: false, highlight: true  },
    { id: 4, date: 'June 20, 2028', title: 'Check-In Assistance During Peak Hours (4 PM - 6 PM)',   done: false, highlight: true  },
  ],
  recentActivities: [
    { id: 1, time: '12:00 PM', title: 'Conference Room Setup',  desc: 'Events Team set up Conference Room B for 10 AM meeting, including AV equipment and refreshments.', color: 'green' },
    { id: 2, time: '11:30 AM', title: 'Guest Check-Out',        desc: 'Sarah Johnson completed check-out process and updated room availability for Room 305.',              color: 'blue'  },
    { id: 3, time: '11:00 AM', title: 'Room Cleaning Completed',desc: 'Maria Gonzalez cleaned and prepared Room 204 for new guests.',                                      color: 'yellow'},
  ],
  revenueData: [
    { month: 'Dec 2027', revenue: 180000 },
    { month: 'Jan 2028', revenue: 220000 },
    { month: 'Feb 2028', revenue: 315060 },
    { month: 'Mar 2028', revenue: 260000 },
    { month: 'Apr 2028', revenue: 290000 },
    { month: 'May 2028', revenue: 275000 },
  ],
  reservationsData: [
    { date: '12 Jun', booked: 75, canceled: 15 },
    { date: '13 Jun', booked: 80, canceled: 20 },
    { date: '14 Jun', booked: 70, canceled: 18 },
    { date: '15 Jun', booked: 85, canceled: 12 },
    { date: '16 Jun', booked: 90, canceled: 25 },
    { date: '17 Jun', booked: 88, canceled: 20 },
    { date: '18 Jun', booked: 95, canceled: 10 },
  ],
  bookings: [
    { id: 'LG-B00108', guest: 'Angus Copper',    type: 'Deluxe',   room: 'Room 101', duration: '3 nights', checkIn: 'June 19, 2028', checkOut: 'June 22, 2028', status: 'Checked-In' },
    { id: 'LG-B00109', guest: 'Catherine Lopp',  type: 'Standard', room: 'Room 202', duration: '2 nights', checkIn: 'June 19, 2028', checkOut: 'June 21, 2028', status: 'Checked-In' },
    { id: 'LG-B00110', guest: 'Marcus Webb',     type: 'Suite',    room: 'Room 305', duration: '4 nights', checkIn: 'June 20, 2028', checkOut: 'June 24, 2028', status: 'Reserved'  },
    { id: 'LG-B00111', guest: 'Sophie Laurent',  type: 'Deluxe',   room: 'Room 412', duration: '1 night',  checkIn: 'June 20, 2028', checkOut: 'June 21, 2028', status: 'Checked-In'},
    { id: 'LG-B00112', guest: 'David Tanaka',    type: 'Standard', room: 'Room 110', duration: '3 nights', checkIn: 'June 21, 2028', checkOut: 'June 24, 2028', status: 'Reserved'  },
  ],
};

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    toggleTaskDone: (state, action) => {
      const task = state.tasks.find(t => t.id === action.payload);
      if (task) task.done = !task.done;
    },
  },
});

export const { toggleTaskDone } = dashboardSlice.actions;
export default dashboardSlice.reducer;
