import { useEffect, useState } from "react";

// Define the type for the data you expect
interface Activity {
  topic: string;
  startDate: string;
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
    const timeDiff = d2.getTime() - d1.getTime();
    return timeDiff / (1000 * 3600 * 24); // Convert time difference to days
  };

  // Function to determine the color based on the date
  const getColorBasedOnDate = (startDate: string): string => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    const daysDifference = calculateDaysDifference(today, startDate);

    if (daysDifference === 0) {
      return "bg-primary"; // Today's event
    } else if (daysDifference > 0 && daysDifference <= 7) {
      return "bg-warning"; // Next 7 days events
    } else if (daysDifference > 7) {
      return "bg-secondary"; // More than 7 days ahead
    }
    return "bg-light"; // Default color (if any case doesn't match)
  };

  // Function to format date to DD-MMM
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" };
    return new Intl.DateTimeFormat("en-GB", options).format(date);
  };

  useEffect(() => {
    // Fetch data from the API when the component mounts
    fetch("http://localhost:3000/training")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched data:", data); // Log the entire fetched data

        // Check if the 'training' array exists
        if (data && Array.isArray(data.training)) {
          console.log("Found 'training' array.");
          const filteredData = data.training
            .filter((item: any) => {
              const today = new Date().toISOString().split('T')[0];
              return new Date(item.startDate) >= new Date(today); // Keep only future events
            })
            .map((item: any) => ({
              topic: item.topic,
              startDate: formatDate(item.startDate), // Format the startDate
              venue: item.venue,
              color: getColorBasedOnDate(item.startDate), // Set the color based on the date
            }));
          setActivitySteps(filteredData); // Set the filtered data to the state
        } else {
          console.error("Fetched data is not in the expected format:", data);
          setError(new Error("Fetched data is not in the expected format"));
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
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
