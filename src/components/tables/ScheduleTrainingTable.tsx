import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { Table } from 'flowbite-react';
// import { HiOutlineDotsVertical } from "react-icons/hi";
import axiosInstance from '../../utils/axios';

interface ScheduleType {
  id: number;
  topic: string;
  startDate: string | Date;
  endDate: string | Date;
  duration: number;
  venue: string;
  requirement: string;
  enrollment: string;
}

interface EmployeeType {
  id: number;
  nama: string;
  departemen: string;
  nip: string;
  grade: number;
  posisi: string;
}

// Definisikan tipe untuk respons API /training
interface ScheduleApiResponse {
  success?: boolean; // Opsional, tergantung apakah backend selalu mengirim ini
  training: ScheduleType[];
}

// Definisikan tipe untuk respons API POST /training/registrasi
interface RegistrationApiResponse {
  success: boolean;
  message?: string;
  // Tambahkan properti lain jika ada, misalnya data registrasi yang berhasil
}

const getScheduleData = async (): Promise<ScheduleType[]> => {
  try {
    const response = await axiosInstance.get<ScheduleApiResponse>('/training');
    const apiData = response.data;
    
    if (apiData && Array.isArray(apiData.training)) {
      return apiData.training;
    } else {
      // console.error('Invalid schedule data format from API. Expected .training array, got:', apiData); // Dihapus
      // throw new Error("Invalid schedule data format from API"); // Lebih baik melempar error
      return []; // Atau kembalikan array kosong jika itu perilaku yang diinginkan
    }
  } catch (error) {
    // console.error('Error fetching schedule data:', error); // Dihapus
    throw error; // Lempar error agar komponen pemanggil bisa menanganinya
  }
};

const jobLevels = [
  'worker',
  'staff',
  'team leader',
  'section head',
  'asisten departemen head',
  'departemen head',
  'asisten plant head',
  'plant head'
].map(level => level.toLowerCase());

const getEmployeeDataForTraining = async (topic: string, requirement: string): Promise<EmployeeType[]> => {
  console.log('[ScheduleTable] getEmployeeDataForTraining: Fetching employees for topic:', topic, 'requirement:', requirement);
  
  const requirementParts = requirement.split('-').map(part => part.trim().toLowerCase());
  let finalRequirements: string[];

  if (requirementParts.length >= 2) {
    const startLevel = requirementParts[0];
    const endLevel = requirementParts[requirementParts.length - 1];
    
    const startIndex = jobLevels.indexOf(startLevel);
    const endIndex = jobLevels.indexOf(endLevel);

    if (startIndex !== -1 && endIndex !== -1 && startIndex <= endIndex) {
      // It's a valid range, expand it
      finalRequirements = jobLevels.slice(startIndex, endIndex + 1);
    } else {
      // Not a valid range according to jobLevels, treat as a single requirement string.
      finalRequirements = [requirement];
    }
  } else {
    // Only one part, or empty. Treat as a single requirement.
    finalRequirements = [requirement];
  }
  
  try {
    // Menggunakan axiosInstance untuk POST request
    const response = await axiosInstance.post<{ employees: EmployeeType[] }>('/training/cek-karyawan', {
      nama_topic: topic,
      requirement: finalRequirements,
    });
    
    const apiData = response.data;
    console.log('[ScheduleTable] getEmployeeDataForTraining: Response from /training/cek-karyawan:', apiData);

    if (apiData && Array.isArray(apiData.employees)) {
      console.log('[ScheduleTable] getEmployeeDataForTraining: Returning employees:', apiData.employees);
      return apiData.employees;
    } else {
      // console.error('Invalid employee data format from axios', apiData); // Dihapus
      // throw new Error("Invalid employee data format from API"); // Lebih baik melempar error
      return []; // Atau kembalikan array kosong jika itu perilaku yang diinginkan
    }
  } catch (error) {
    // console.error('Error fetching employee data with axios:', error); // Dihapus
    throw error; // Lempar error agar bisa ditangani oleh komponen pemanggil
  }
};

const ScheduleTrainingTable: React.FC = () => {
  const [scheduleData, setScheduleData] = useState<ScheduleType[]>([]);
  // const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof ScheduleType; direction: string }>({
    key: 'topic',
    direction: 'asc',
  });
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState<string>('');
  const [visibleData, setVisibleData] = useState<ScheduleType[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [employeeData, setEmployeeData] = useState<EmployeeType[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<number>>(new Set());
  const [originalEmployeeData, setOriginalEmployeeData] = useState<EmployeeType[]>([]); // Store original employee data
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');
  const [selectedTrainingId, setSelectedTrainingId] = useState<number | null>(null);

  useEffect(() => {
    getScheduleData().then((data) => {
      console.log('Data yg diambil' + data);
      // Filter out data that has already passed (endDate < today)
      if (Array.isArray(data)) {
        const today = new Date();
        const filteredData = data.filter((item) => {
          const startDate = new Date(item.startDate); // Convert endDate to Date object
          return startDate >= today; // Only show future or ongoing events
        });
        setScheduleData(filteredData);
        setVisibleData(filteredData);
      } else {
        console.error('Ternyata jadinya ini', data);
      } // Initially show only 5 items
    });
  }, []);

  const handleSearchSch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    filterData(e.target.value, startDateFilter, endDateFilter); // Filter by both search term and date range
  };

  const handleDateFilter = () => {
    filterData(searchTerm, startDateFilter, endDateFilter); // Re-filter when date range is changed
  };
  const filterData = (searchTerm: string, startDateFilter: string, endDateFilter: string) => {
    const filteredData = scheduleData.filter((item) => {
      // Search term filter
      const matchesSearch =
        item.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.venue.toLowerCase().includes(searchTerm.toLowerCase());

      // Date filter
      const startDate = new Date(item.startDate);
      const endDate = new Date(item.endDate);
      const isWithinDateRange =
        (startDateFilter ? startDate >= new Date(startDateFilter) : true) &&
        (endDateFilter ? endDate <= new Date(endDateFilter) : true);

      return matchesSearch && isWithinDateRange;
    });
    
    setVisibleData(filteredData);
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (json.length === 0) {
            alert("File Excel kosong atau format tidak sesuai.");
            return;
        }

        const newSchedules = json.map((row) => {
          // Basic validation
          if (!row.Topic || !row['Start Date'] || !row['End Date'] || !row.Duration || !row.Venue || !row.Requirement) {
              throw new Error("Beberapa kolom yang wajib diisi (Topic, Start Date, End Date, Duration, Venue, Requirement) tidak ditemukan di salah satu baris. Mohon periksa kembali file Excel Anda.");
          }

          // Date validation and conversion
          const startDateFromExcel = new Date(row['Start Date']);
          const endDateFromExcel = new Date(row['End Date']);

          // Create a new Date object in UTC from the date components of the Excel date.
          // This avoids timezone issues where '2025-06-16' becomes '2025-06-15T17:00:00.000Z'.
          const startDate = new Date(Date.UTC(startDateFromExcel.getFullYear(), startDateFromExcel.getMonth(), startDateFromExcel.getDate()));
          const endDate = new Date(Date.UTC(endDateFromExcel.getFullYear(), endDateFromExcel.getMonth(), endDateFromExcel.getDate()));

          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
              throw new Error(`Format tanggal tidak valid pada baris dengan topik "${row.Topic}". Gunakan format tanggal yang standar.`);
          }
            
          return {
            topic: row.Topic,
            startDate: startDate.toISOString(), // Send as ISO string to backend
            endDate: endDate.toISOString(), // Send as ISO string to backend
            duration: row.Duration,
            venue: row.Venue,
            requirement: row.Requirement,
            enrollment: 'Open',
          };
        });

        await axiosInstance.post('/training/import', { schedules: newSchedules });
        
        alert('Jadwal training berhasil diimpor!');
        
        // Refresh data
        getScheduleData().then((data) => {
          if (Array.isArray(data)) {
            const today = new Date();
            const filteredData = data.filter((item) => {
              const itemStartDate = new Date(item.startDate);
              return itemStartDate >= today;
            });
            setScheduleData(filteredData);
            setVisibleData(filteredData);
          }
        });

      } catch (error: any) {
        console.error('Error importing schedules:', error);
        alert(`Gagal mengimpor jadwal: ${error.response?.data?.message || error.message}`);
      } finally {
        // Reset file input so user can upload the same file again if they want
        e.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file); // Use readAsArrayBuffer for better compatibility
  };
  
  const handleEmployeeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmployeeSearchTerm(value);
    
    // If the search term is empty, reset the employee data to the original data
    if (value === '') {
      setEmployeeData(originalEmployeeData);
    } else {
      const filteredEmployeeData = originalEmployeeData.filter(
        (employee) =>
          employee.nama.toLowerCase().includes(value.toLowerCase()) ||
          employee.departemen.toLowerCase().includes(value.toLowerCase()) ||
          employee.nip.toLowerCase().includes(value.toLowerCase())
      );
      setEmployeeData(filteredEmployeeData);
    }
  };

  const handleSort = (key: keyof ScheduleType) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    const sortedData = [...scheduleData].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setSortConfig({ key, direction });
    setVisibleData(sortedData); // After sorting, show only 5 items
  };

  // const handleCheckboxChange = (id: number) => {
  //   const updatedSelectedRows = new Set(selectedRows);
  //   if (updatedSelectedRows.has(id)) {
  //     updatedSelectedRows.delete(id);
  //   } else {
  //     updatedSelectedRows.add(id);
  //   }
  //   setSelectedRows(updatedSelectedRows);
  // };

  // const handleSelectAllChange = () => {
  //   if (selectedRows.size === scheduleData.length) {
  //     setSelectedRows(new Set());
  //   } else {
  //     setSelectedRows(new Set(scheduleData.map((item) => item.id)));
  //   }
  // };

  const formatDate = (date: string | Date): string => {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    return dateObj.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // const loadMore = () => {
  //   const nextData = scheduleData.slice(visibleData.length, visibleData.length + 5);
  //   setVisibleData((prev) => [...prev, ...nextData]);
  // };

  const toggleModal = (training: ScheduleType) => {
    setShowModal(!showModal);
    setSelectedTrainingId(training.id);
    console.log('[ScheduleTable] toggleModal: Opening modal for training ID:', training.id, 'Topic:', training.topic, 'Requirement:', training.requirement);
  
    getEmployeeDataForTraining(training.topic, training.requirement)
      .then((data) => {
        console.log('[ScheduleTable] toggleModal: Employee data received from getEmployeeDataForTraining:', data);
        setEmployeeData(data);
        setOriginalEmployeeData(data);
      })
      .catch(error => {
        console.error('[ScheduleTable] toggleModal: Error fetching employee data:', error);
        setEmployeeData([]); // Reset jika error
        setOriginalEmployeeData([]); // Reset jika error
        // Pertimbangkan untuk menampilkan pesan error kepada pengguna di modal
      });
  };
  

  const handleEmployeeSelection = (id: number) => {
    const updatedSelectedEmployees = new Set(selectedEmployees);
    if (updatedSelectedEmployees.has(id)) {
      updatedSelectedEmployees.delete(id);
    } else {
      updatedSelectedEmployees.add(id);
    }
    setSelectedEmployees(updatedSelectedEmployees);
  };

  const handleRegister = async () => {
    if (selectedEmployees.size === 0) {
      alert('Please select at least one employee to register');
      return;
    }

    const id_training = selectedTrainingId;
    if (!id_training) {
      alert('Selected training ID is missing. Cannot register.');
      return;
    }

    const id_karyawan = Array.from(selectedEmployees);

    try {
      // Menggunakan axiosInstance dan RegistrationApiResponse
      const response = await axiosInstance.post<RegistrationApiResponse>('/training/registrasi', {
        id_training,
        id_karyawan,
      });

      if (response.data && response.data.success) {
        alert(response.data.message || 'Employees successfully registered for the training');
        setShowModal(false);
        setSelectedEmployees(new Set());
      } else {
        alert(response.data?.message || 'Failed to register employees. Please check server logs.');
      }
    } catch (error: any) {
      console.error('Error registering employees:', error);
      let errorMessage = 'An error occurred while registering employees.';
      // Akses error.response.data?.message dengan aman
      if (error.response && error.response.data && typeof error.response.data.message === 'string') {
        errorMessage = error.response.data.message;
      } else if (typeof error.message === 'string') {
        errorMessage = error.message;
      }
      alert(errorMessage);
    }
  };


  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words ">
      <h5 className="card-title mb-10 text-40">Training Schedule</h5>
      <input
            type="text"
            value={searchTerm}
            onChange={handleSearchSch}
            placeholder="Search..."
            className="mb-4 p-2 border rounded-md"
          />
      <div className="mb-4 flex gap-4">
            <input
              type="date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              className="p-2 border rounded-md"
            />
            <input
              type="date"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              className="p-2 border rounded-md"
            />
            <button
              onClick={handleDateFilter}
              className="bg-blue-500 text-white p-2 rounded-md"
            >
              Filter by Date
            </button>
            <label
              htmlFor="file-upload"
              className="bg-green-500 text-white p-2 rounded-md cursor-pointer hover:bg-green-600"
            >
              Impor dari Excel
            </label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".xlsx, .xls"
            />
          </div>
      <div className="mt-3">
        <div className="overflow-x-auto">
          
          {/* Date Range Filters */}
          
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell className="p-6">No.
              </Table.HeadCell>
              <Table.HeadCell className="p-6" onClick={() => handleSort('topic')}>
                Topic
              </Table.HeadCell>
              <Table.HeadCell onClick={() => handleSort('startDate')}>Start Date</Table.HeadCell>
              <Table.HeadCell onClick={() => handleSort('endDate')}>End Date</Table.HeadCell>
              <Table.HeadCell>Duration</Table.HeadCell>
              <Table.HeadCell>Venue</Table.HeadCell>
              <Table.HeadCell>Requirement</Table.HeadCell>
              <Table.HeadCell>Action</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y divide-border dark:divide-darkborder">
              {visibleData.map((item, index) => (
                <Table.Row key={item.id}>
                  <Table.Cell>
                  <h6 className="text-sm">{index +1}</h6>
                  </Table.Cell>
                  <Table.Cell>
                    <h6 className="text-sm">{item.topic}</h6>
                  </Table.Cell>
                  <Table.Cell>
                    <h6 className="text-sm">{formatDate(item.startDate)}</h6>
                  </Table.Cell>
                  <Table.Cell>
                    <h6 className="text-sm">{formatDate(item.endDate)}</h6>
                  </Table.Cell>
                  <Table.Cell>
                    <h6 className="text-sm">{item.duration} hours</h6>
                  </Table.Cell>
                  <Table.Cell>
                    <h6 className="text-sm">{item.venue}</h6>
                  </Table.Cell>
                  <Table.Cell>
                    <h6 className="text-sm">{item.requirement}</h6>
                  </Table.Cell>
                  <Table.Cell>
                    <button
                      className="text-blue-500 hover:underline"
                      onClick={() => toggleModal(item)}
                    >
                      Daftar
                    </button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          {/* {visibleData.length < scheduleData.length && (
            <button onClick={loadMore} className="mt-4 p-2 bg-blue-500 text-white rounded-md">
              Load More
            </button>
          )} */}
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-w-6xl">
            <h2 className="text-xl mb-4">Select Employees for Registration</h2>
            <div className="max-h-96 overflow-y-auto">
              {' '}
              {/* Scrollable container */}
              <input
              type="text"
              value={employeeSearchTerm}
              onChange={handleEmployeeSearch}
              placeholder="Search Employees..."
              className="mb-4 p-2 border rounded-md"
            />
              <Table hoverable>
                <Table.Head>
                  <Table.HeadCell> </Table.HeadCell>
                  <Table.HeadCell>Name</Table.HeadCell>
                  <Table.HeadCell>Departemen</Table.HeadCell>
                  <Table.HeadCell>NIP</Table.HeadCell>
                  <Table.HeadCell>Grade</Table.HeadCell>
                  <Table.HeadCell>Posisi</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y divide-border dark:divide-darkborder">
                  {employeeData.length > 0 ? (
                    employeeData.map((employee) => (
                      <Table.Row key={employee.id}>
                        <Table.Cell>
                          <input
                            type="checkbox"
                            checked={selectedEmployees.has(employee.id)}
                            onChange={() => handleEmployeeSelection(employee.id)}
                          />
                        </Table.Cell>
                        <Table.Cell>{employee.nama}</Table.Cell>
                        <Table.Cell>{employee.departemen}</Table.Cell>
                        <Table.Cell>{employee.nip}</Table.Cell>
                        <Table.Cell>{employee.grade}</Table.Cell>
                        <Table.Cell>{employee.posisi}</Table.Cell>
                      </Table.Row>
                    ))
                  ) : (
                    <Table.Row>
                      <Table.Cell colSpan={6}>No employees found</Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                className="bg-red-500 text-white p-2 rounded-md"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
              <button
                className="bg-blue-500 text-white p-2 rounded-md ml-2"
                onClick={handleRegister}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { ScheduleTrainingTable };
