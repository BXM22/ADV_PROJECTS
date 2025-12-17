// Import the Bar chart component from react-chartjs-2 library
import { Bar } from 'react-chartjs-2';
// Import color configuration from the chart config file
import { chartColors } from './chartConfig';

// Define the interface (type contract) for component props
interface TopTracksChartProps {
  // Array of track objects with name, artist, and optional playCount
  tracks: Array<{ name: string; artist: string; playCount?: number }>;
  // Optional limit for how many tracks to display (defaults to 10 if not provided)
  limit?: number;
}

// Export the TopTracksChart component function
// Destructure props: tracks array and limit (defaults to 10 if not provided)
export function TopTracksChart({ tracks, limit = 10 }: TopTracksChartProps) {
  // Slice the tracks array to get only the first 'limit' number of tracks
  const topTracks = tracks.slice(0, limit);
  
  // Create the data object that Chart.js needs to render the chart
  const data = {
    // Extract track names to use as labels on the x-axis
    labels: topTracks.map(t => t.name),
    // Define the dataset(s) to display on the chart
    datasets: [{
      label: 'Plays', // Label for the dataset (shown in legend if enabled)
      // Extract playCount values, defaulting to 0 if playCount is undefined
      data: topTracks.map(t => t.playCount || 0),
      // Set the background color of the bars using primary color from config
      backgroundColor: chartColors.primary,
      // Set the border color of the bars using secondary color from config
      borderColor: chartColors.secondary,
      borderWidth: 1, // Set the border width to 1 pixel
    }],
  };
  
  // Configure chart display options
  const options = {
    responsive: true, // Make the chart responsive to container size changes
    plugins: {
      legend: { display: false }, // Hide the legend (we only have one dataset)
      // Display chart title with text and color
      title: { display: true, text: 'Top Tracks', color: chartColors.text },
    },
    scales: {
      // Configure the y-axis (vertical axis)
      y: { beginAtZero: true, ticks: { color: chartColors.text } },
      // Configure the x-axis (horizontal axis) with text color
      x: { ticks: { color: chartColors.text } },
    },
  };
  
  // Return the Bar chart component with the data and options
  return <Bar data={data} options={options} />;
}