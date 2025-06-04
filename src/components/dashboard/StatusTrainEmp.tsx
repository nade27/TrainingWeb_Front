import { Badge } from 'flowbite-react';
import { Table } from 'flowbite-react';
import { useEffect, useState } from 'react';
import SimpleBar from 'simplebar-react';
import axiosInstance from '../../utils/axios'; // Impor axiosInstance

interface TrainingHoursEmployeeData {
  id: number;
  nama_karyawan: string;
  nip: string;
  departemen: string;
  posisi: string;
  total_durasi: string;
}

// Definisikan tipe untuk respons API
interface StatusTrainEmpApiResponse {
  trainingHoursEmployee: TrainingHoursEmployeeData[];
}

const getTrainHoursEmployeeData = async (): Promise<TrainingHoursEmployeeData[]> => {
  try {
    const response = await axiosInstance.get<StatusTrainEmpApiResponse>('/dashboard/training-hours-employee');
    const apiData = response.data;

    if (apiData && Array.isArray(apiData.trainingHoursEmployee)) {
      return apiData.trainingHoursEmployee;
    } else {
      throw new Error("Invalid data structure from API");
    }
  } catch (error) {
    throw error; 
  }
};

// Function to determine the priority based on total_durasi
const getPriority = (total_durasi: string) => {
  const hours = parseInt(total_durasi); // Assuming total_durasi is in hours
  let prioritybg = '';
  let prioritycolor = '';
  let prioritytext = '';

  if (hours < 7) {
    prioritybg = 'bg-lighterror';
    prioritycolor = 'text-error';
    prioritytext = 'High';
  } else if (hours >= 7 && hours <= 12) {
    prioritybg = 'bg-lightwarning';
    prioritycolor = 'text-warning';
    prioritytext = 'Medium';
  } else if (hours > 13) {
    prioritybg = 'bg-lightsuccess';
    prioritycolor = 'text-success';
    prioritytext = 'Low';
  }

  return { prioritybg, prioritycolor, prioritytext };
};

const TrainHoursEmployee = () => {
  const [trainHourEmployeeData, setTrainHoursEmployeeData] = useState<TrainingHoursEmployeeData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getTrainHoursEmployeeData();
        setTrainHoursEmployeeData(data);
      } catch (err: any) {
        setError(err.message || "Failed to load employee training data.");
        setTrainHoursEmployeeData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6">
        <h5 className="card-title mb-6 px-6">Training Status Employee</h5>
        <p className="px-6">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6">
        <h5 className="card-title mb-6 px-6">Training Status Employee</h5>
        <p className="text-red-500 px-6">Error: {error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 px-0 relative w-full break-words">
        <div className="px-6">
          <h5 className="card-title mb-6">Training Status Employee</h5>
        </div>
        <SimpleBar className="max-h-[450px]">
          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell className="p-6">Nama Karyawan</Table.HeadCell>
                <Table.HeadCell>NIP</Table.HeadCell>
                <Table.HeadCell>Departemen</Table.HeadCell>
                <Table.HeadCell>Training Hours</Table.HeadCell>
                <Table.HeadCell>Priority</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y divide-border dark:divide-darkborder ">
                {trainHourEmployeeData.map((item, index) => {
                  const { prioritybg, prioritycolor, prioritytext } = getPriority(
                    item.total_durasi,
                  );
                  const totalDurasi = item.total_durasi || 0; // Default to 0 if undefined
                  return (
                    <Table.Row key={index}>
                      <Table.Cell className="whitespace-nowrap ps-6">
                        <div className="flex gap-3 items-center">
                          <div className="truncat line-clamp-2 sm:text-wrap max-w-56">
                            <h6 className="text-sm">{item.nama_karyawan}</h6>
                            <p className="text-xs ">{item.posisi}</p>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="me-5">
                          <p className="text-base">{item.nip}</p>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="me-5">
                          <p className="text-base">{item.departemen}</p>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="me-5">
                          {/* Display the total_durasi with a fallback */}
                          <p className="text-base">{totalDurasi}/14 (Hours)</p>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge className={`${prioritybg} ${prioritycolor}`}>{prioritytext}</Badge>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </div>
        </SimpleBar>
      </div>
    </>
  );
};

export default TrainHoursEmployee;
