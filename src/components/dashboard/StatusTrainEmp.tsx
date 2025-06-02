import { Badge } from 'flowbite-react';
import { Table } from 'flowbite-react';
import { useEffect, useState } from 'react';
import SimpleBar from 'simplebar-react';

interface TrainingHoursEmployeeData {
  id: number;
  nama_karyawan: string;
  nip: string;
  departemen: string;
  posisi: string;
  total_durasi: string;
}

const getTrainHoursEmployeeData = async (): Promise<TrainingHoursEmployeeData[]> => {
  try {
    const response = await fetch('http://localhost:3000/dashboard/training-hours-employee');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log('Fetched Data:', data); // Log full data to check the structure

    // Check if 'trainingHoursEmployee' exists in the response
    if (data && Array.isArray(data.trainingHoursEmployee)) {
      console.log('Valid data structure', data.trainingHoursEmployee); // Log to verify the array
      return data.trainingHoursEmployee; // Return the array inside 'trainingHoursEmployee'
    } else {
      console.error('Invalid data structure:', data);
      return []; // Return an empty array if the structure is not as expected
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
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
  const [TrainHourEmployeeData, setTrainHoursEmployeeData] = useState<TrainingHoursEmployeeData[]>(
    [],
  );

  useEffect(() => {
    const fetchData = async () => {
      const data = await getTrainHoursEmployeeData();
      console.log('Fetched Data:', data); // Log the data to verify 'total_durasi'
      if (Array.isArray(data)) {
        setTrainHoursEmployeeData(data);
      } else {
        console.error('Data is not an array:', data);
      }
    };
    fetchData();
  }, []);

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
                {TrainHourEmployeeData.map((item, index) => {
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
