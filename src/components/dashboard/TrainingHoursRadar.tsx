import { useState, useEffect } from 'react';
import { ApexOptions } from 'apexcharts';
import Chart from 'react-apexcharts';
import axiosInstance from '../../utils/axios'; // Impor axiosInstance

// Definisikan tipe untuk item data dan respons API
interface TrainingHourItem {
  departemen: string;
  total_durasi_per_karyawan: string | number;
}

interface TrainingHoursApiResponse {
  trainingHoursData: TrainingHourItem[];
}

// Definisikan tipe untuk data chart yang sudah diproses
type ChartData = {
  categories: string[];
  series: { name: string; data: number[] }[];
};

const fetchChartData = async (): Promise<ChartData> => {
  try {
    const response = await axiosInstance.get<TrainingHoursApiResponse>('/dashboard/training-hours');
    const apiData = response.data;
    
    if (apiData && Array.isArray(apiData.trainingHoursData)) {
      const categories = apiData.trainingHoursData.map((item) => item.departemen);
      const seriesData = apiData.trainingHoursData.map((item) => parseFloat(item.total_durasi_per_karyawan.toString()));
      
      return {
        categories,
        series: [{
          name: 'Total Durasi',
          data: seriesData,
        }],
      };
    } else {
      throw new Error("Invalid data structure from API");
    }
  } catch (error) {
    throw error; 
  }
};

const TrainingHours = () => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchChartData();
        setChartData(data);
      } catch (err:any) {
        setError(err.message || "Failed to load chart data.");
        setChartData({ categories: [], series: [] });
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, []);

  const optionsRadarChart: ApexOptions = {
  chart: {
    height: 350,
    type: 'radar',
  },
  colors: ['#1E90FF'],
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
    width: 2, 
    curve: 'smooth',
  },
  fill: {
    type: 'solid', 
    opacity: 0.2, 
    colors: ['#1E90FF'], 
  },
  xaxis: {
    categories: chartData ? chartData.categories : [],
  },
  yaxis: {
    min: 0,  
    tickAmount: 7, 
  },
  tooltip: {
    theme: 'dark',
    y: {
      formatter: function (value: number) {
        return value.toFixed(2);
      },
    },
  },
};

  if (isLoading) {
    return (
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
        <h5 className="card-title">Training Hours by Department</h5>
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
        <h5 className="card-title">Training Hours by Department</h5>
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!chartData || chartData.categories.length === 0) {
    return (
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
        <h5 className="card-title">Training Hours by Department</h5>
        <div>No data available to display chart.</div>
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
