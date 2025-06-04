import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axios"; // Impor axiosInstance

// Define the type for the data you expect from the API
interface TrainingItem {
  topic: string;
  startDate: string;
  venue: string;
  // Anda mungkin perlu menambahkan properti lain di sini jika ada dari API
}

interface TrainingApiResponse {
  training: TrainingItem[];
  // tambahkan properti lain di root response jika ada, misal: message: string;
}

// Define the type for the processed activity steps
interface Activity {
  topic: string;
  startDate: string; // Ini sudah diformat
  venue: string;
  color: string;
}

const NextTraining = () => {
  const [activitySteps, setActivitySteps] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to calculate the difference in days between two dates
  const calculateDaysDifference = (date1: string, date2: string): number => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Function to determine the color based on the date
  const getColorBasedOnDate = (startDate: string): string => {
    const today = new Date().toISOString().split('T')[0];
    const daysDiff = calculateDaysDifference(today, startDate);
    
    if (daysDiff <= 7) return 'text-error';
    if (daysDiff <= 14) return 'text-warning';
    return 'text-success';
  };

  // Function to format date to DD-MMM
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    setLoading(true); // Set loading true di awal
    axiosInstance.get<TrainingApiResponse>("/training") // Gunakan tipe TrainingApiResponse
      .then((response) => {
        const data = response.data;
        console.log("Fetched data with axios:", data); 

        // Sekarang 'data' memiliki tipe TrainingApiResponse, dan 'data.training' akan dikenali
        if (data && Array.isArray(data.training)) {
          console.log("Found 'training' array with axios.");
          const filteredData = data.training
            .filter((item: TrainingItem) => { // item sekarang bertipe TrainingItem
              const today = new Date().toISOString().split('T')[0];
              return new Date(item.startDate) >= new Date(today); 
            })
            .map((item: TrainingItem) => ({
              topic: item.topic,
              startDate: formatDate(item.startDate), 
              venue: item.venue,
              color: getColorBasedOnDate(item.startDate), 
            }));
          setActivitySteps(filteredData); 
        } else {
          console.error("Fetched data with axios is not in the expected format:", data);
          setError(new Error("Fetched data is not in the expected format"));
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data with axios:", error);
        setError(error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <>
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 px-5 relative w-full break-words">
        <h5 className="card-title mb-6">Next Training</h5>

        <div className="flex flex-col mt-2">
          <ul className="overflow-y-auto max-h-[450px]">
            {activitySteps.map((item, index) => (
              <li key={index} className="flex items-center gap-4 min-h-16">
                {/* Date Section */}
                <div className="w-1/4 text-end">
                  <p>{item.startDate || "No Start Date Provided"}</p>
                </div>

                {/* Vertical Line Section */}
                <div className="flex items-center justify-center w-1/12 relative flex-grow">
                  <div className={`rounded-full ${item.color} p-1.5 w-fit h-fit`}></div>
                  <div className="h-full w-px bg-border"></div> {/* The line now stretches */}
                </div>

                {/* Topic and Venue Section */}
                <div className="flex flex-col justify-center w-1/2 text-dark text-start">
                  <p className="text-xs font-semibold">{item.topic || "No Topic Provided"}</p>
                  <p className="text-xs">{item.venue || "No Venue Provided"}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default NextTraining;
