import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axios"; // Impor axiosInstance

// Define the type for the data you expect from the API
interface TrainingItemFromApi {
  topic: string; // Sesuaikan ini jika Anda mengubah alias di backend menjadi 'topic'
  // atau gunakan nama_topik jika backend mengirim itu dan Anda tidak mengubah query
  // nama_topik?: string; 
  startDate: string;
  venue: string;
}

interface TrainingApiResponse {
  success?: boolean; // Tambahkan properti success jika ada
  training: TrainingItemFromApi[];
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
    
    if (daysDiff <= 7) return 'bg-error';
    if (daysDiff <= 14) return 'bg-warning';
    return 'bg-success';
  };

  // Function to format date to DD-MMM
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return date.toLocaleDateString('id-ID', {
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    setLoading(true);
    axiosInstance.get<TrainingApiResponse>("/training")
      .then((response) => {
        const data = response.data;

        if (data && Array.isArray(data.training)) {
          const filteredData = data.training
            .filter((item: TrainingItemFromApi) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const itemStartDate = new Date(item.startDate);
              if (isNaN(itemStartDate.getTime())) {
                  return false;
              }
              return itemStartDate >= today; 
            })
            .map((item: TrainingItemFromApi) => ({
              topic: item.topic || (item as any).nama_topik || "No Topic",
              startDate: formatDate(item.startDate), 
              venue: item.venue || "No Venue",
              color: getColorBasedOnDate(item.startDate), 
            }));
          
          setActivitySteps(filteredData); 
        } else {
          setError(new Error("Fetched data is not in the expected format"));
        }
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
  }, [activitySteps]);

  if (loading) {
    return (
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 px-5 relative w-full break-words">
        <h5 className="card-title mb-6">Next Training</h5>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 px-5 relative w-full break-words">
        <h5 className="card-title mb-6">Next Training</h5>
        <p className="text-red-500">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 px-5 relative w-full break-words">
        <h5 className="card-title mb-6">Next Training</h5>
        {activitySteps.length === 0 ? (
          <p>No upcoming training sessions found.</p>
        ) : (
          <div className="flex flex-col mt-2">
            <ul className="overflow-y-auto max-h-[450px]">
              {activitySteps.map((item, index) => (
                <li key={index} className="flex items-center gap-4 min-h-16">
                  {/* Date Section */}
                  <div className="w-1/4 text-end">
                    <p>{item.startDate}</p>
                  </div>

                  {/* Vertical Line Section */}
                  <div className="flex items-center justify-center w-1/12 relative flex-grow">
                    <div className={`rounded-full ${item.color} p-1.5 w-fit h-fit`}></div>
                    <div className="h-full w-px bg-border"></div> {/* The line now stretches */}
                  </div>

                  {/* Topic and Venue Section */}
                  <div className="flex flex-col justify-center w-1/2 text-dark text-start">
                    <p className="text-xs font-semibold">{item.topic}</p>
                    <p className="text-xs">{item.venue}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default NextTraining;
