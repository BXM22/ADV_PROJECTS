import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
  
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
  );
  
  export const chartColors = {
    primary: '#1db954',
    secondary: '#1ed760',
    accent: '#191414',
    background: '#121212',
    text: '#ffffff',
  };