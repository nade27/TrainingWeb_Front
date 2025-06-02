import { Progress } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

const TrainingHoursDivision = () => {
  const [progress, setProgress] = useState<number>(0);
  const [progressColor, setProgressColor] = useState<string>('bg-lightwarning'); // Default to light warning
  const [isLoading, setIsLoading] = useState<boolean>(true); // To handle loading state

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/dashboard/training-hours-div");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        console.log("API Response:", data); // Log the full response to check the structure

        // Check if the 'trainHoursDiv' field exists in the response
        if (data && data.trainHoursDiv !== undefined) {
          const trainHoursDiv = parseFloat(data.trainHoursDiv);
          
          if (isNaN(trainHoursDiv)) {
            console.error("Invalid trainHoursDiv value:", data.trainHoursDiv);
            return; // Exit if the value is not a valid number
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
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false); // Set loading state to false once data is fetched
      }
    };

    fetchData();
  }, []);

  // Debugging: Log the progress value to ensure it's calculated correctly
  console.log("Progress Value:", progress);

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
      ) : (
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-dark">Progress</p>
          <p className="text-sm text-dark">{Math.round(progress)}%</p> {/* Round the percentage */}
        </div>
      )}

      {/* Progress Bar */}
      <Progress progress={progress} color={progressColor} />

      {/* Debugging: Show the progress percentage */}
      {progress === 0 && !isLoading && (
        <p className="text-red-500">Progress value is 0, check the calculations!</p>
      )}
    </div>
  );
};

export default TrainingHoursDivision;
