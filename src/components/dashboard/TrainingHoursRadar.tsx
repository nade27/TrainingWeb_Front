import { useState, useEffect } from 'react';
import { ApexOptions } from 'apexcharts';
import Chart from 'react-apexcharts';

// Define the structure of the chart data
type ChartData = {
  categories: string[];  // Departemen
  series: { name: string; data: number[] }[];  // Total durasi per departemen
};

// Mock function to simulate database call
const fetchChartData = async (): Promise<ChartData> => {
  try {
    const response = await fetch('http://localhost:3000/dashboard/training-hours');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    
    // Transform the data into the format required for the chart
    const categories = data.trainingHoursData.map((item: { departemen: any; }) => item.departemen);  // Extract departemen as categories
    const series = [{
      name: 'Total Durasi',  // The series name (you can change it)
      data: data.trainingHoursData.map((item: { total_durasi_per_karyawan: string; }) => parseFloat(item.total_durasi_per_karyawan))  // Convert total_durasi to number
    }];
    
    return { categories, series };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      categories: [],
      series: [],
    }; // Return empty data on error
  }
};

const TrainingHours = () => {
  const [chartData, setChartData] = useState<ChartData | null>(null);

  // Fetch data when the component mounts
  useEffect(() => {
    const getData = async () => {
      const data = await fetchChartData();
      setChartData(data);
    };
    getData();
  }, []);

  const optionsRadarChart: ApexOptions = {
  chart: {
    height: 350,
    type: 'radar',
  },
  colors: ['#1E90FF'],  // Single color for the line
  dataLabels: {
    enabled: false,
  },
  grid: {
    show: true,
    borderColor: '#90A4AE50',
    xaxis: {
      lines: {
        show: true,
      },
    },
    yaxis: {
      lines: {
        show: true,
      },
    },
  },
  stroke: {
    width: 2, // Set a stroke width if you want lines to be visible
    curve: 'smooth',
  },
  fill: {
    type: 'solid', // Solid fill type
    opacity: 0.2, // Set the opacity to 0.2 for a light transparent fill
    colors: ['#1E90FF'], // Fill color matching the line colors
  },
  xaxis: {
    categories: chartData ? chartData.categories : [],  // Set categories based on departemen
  },
  yaxis: {
    min: 0,  // Set minimum value to 0
    tickAmount: 7,  // Number of ticks
  },
  tooltip: {
    theme: 'dark',
    y: {
      formatter: function (value: number) {
        return value.toFixed(2);  // Show the data value with 2 decimal places
      },
    },
  },
};


  // Check if chartData or its properties are available
  if (!chartData || !chartData.categories || chartData.categories.length === 0 || !chartData.series || chartData.series.length === 0) {
    return (
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
        <h5 className="card-title">Training Hours by Department</h5>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      <h5 className="card-title">Training Hours by Department</h5>

      <div className="-ms-4 -me-3 mt-2">
        <Chart
          options={optionsRadarChart}
          series={chartData.series}
          type="radar"
          height="315px"
          width="100%"
        />
      </div>
    </div>
  );
};

export { TrainingHours };
