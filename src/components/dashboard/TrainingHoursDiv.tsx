import { Progress } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axios"; // Impor axiosInstance

// Definisikan tipe untuk respons API
interface TrainingHoursDivApiResponse {
  trainHoursDiv: string | number; 
  // tambahkan properti lain di root response jika ada
}

const TrainingHoursDivision = () => {
  const [progress, setProgress] = useState<number>(0);
  const [progressColor, setProgressColor] = useState<string>('bg-lightwarning'); // Default to light warning
  const [isLoading, setIsLoading] = useState<boolean>(true); // To handle loading state
  const [error, setError] = useState<string | null>(null); // State untuk menangani error

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get<TrainingHoursDivApiResponse>("/dashboard/training-hours-div");
        const data = response.data;
        console.log("API Response (TrainingHoursDiv):", data);

        if (data && data.trainHoursDiv !== undefined) {
          const trainHoursDiv = parseFloat(data.trainHoursDiv.toString());
          
          if (isNaN(trainHoursDiv)) {
            console.error("Invalid trainHoursDiv value:", data.trainHoursDiv);
            setError("Invalid data format from server.");
            return;
          }

          const target = 14;
          const percentage = (trainHoursDiv / target) * 100;
          console.log("Training Hours Division:", trainHoursDiv, "Percentage:", percentage);

          // Set progress and color based on the percentage
          setProgress(percentage);

          if (percentage < 30) {
            setProgressColor('red');
          } else if (percentage >= 30 && percentage <= 75) {
            setProgressColor('yellow');
          } else {
            setProgressColor('green');
          }

        } else {
          console.error("trainHoursDiv not found in response", data);
          setError("Data not found in server response.");
        }

      } catch (err: any) {
        console.error("Error fetching data (TrainingHoursDiv):", err);
        setError(err.message || "Failed to fetch data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Debugging: Log the progress value to ensure it's calculated correctly
  console.log("Progress Value (TrainingHoursDiv):", progress);

  return (
    <div className="bg-white rounded-xl shadow-md p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-lightsecondary text-secondary p-3 rounded-md">
          <Icon icon="solar:football-outline" height={24} />
        </div>
        <p className="text-lg text-dark font-semibold">Training Hours Division</p>
      </div>

      {isLoading ? (
        // Display a loading message if the data is still being fetched
        <p className="text-sm text-dark">Loading...</p>
      ) : error ? (
        <p className="text-sm text-red-500">Error: {error}</p> // Tampilkan pesan error
      ) : (
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-dark">Progress</p>
          <p className="text-sm text-dark">{Math.round(progress)}%</p> {/* Round the percentage */}
        </div>
      )}

      {/* Progress Bar */}
      {!isLoading && !error && (
        <Progress progress={progress} color={progressColor} />
      )}

      {/* Debugging: Show the progress percentage */}
      {progress === 0 && !isLoading && !error && (
        <p className="text-red-500">Progress value is 0, check the calculations or data!</p>
      )}
    </div>
  );
};

export default TrainingHoursDivision;
