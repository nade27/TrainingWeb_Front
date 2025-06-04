import React, { useEffect, useState } from 'react';
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

const getScheduleData = async (): Promise<ScheduleType[]> => {
  try {
    const response = await axiosInstance.get('/training/schedule');
    return response.data;
  } catch (error) {
    console.error('Error fetching schedule data:', error);
    return [];
  }
};

const getEmployeeDataForTraining = async (topic: string, requirement: string): Promise<EmployeeType[]> => {
  try {
    // Mengirim nama_topic ke backend saat tombol "Daftar" diklik
    const response = await fetch('http://localhost:3000/training/cek-karyawan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nama_topic: topic, requirement: requirement }), // Kirimkan nama topic ke backend
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log('Employee Data:', data);

    if (data && Array.isArray(data.employees)) {
      return data.employees; // Update employee data
    } else {
      console.error('Invalid employee data format', data);
      return []; // Return empty array if data format is invalid
    }
  } catch (error) {
    console.error('Error fetching employee data:', error);
    return []; // Return an empty array on error
  }
};

const ScheduleTraining: React.FC = () => {
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
    return dateObj.toLocaleDateString();
  };

  // const loadMore = () => {
  //   const nextData = scheduleData.slice(visibleData.length, visibleData.length + 5);
  //   setVisibleData((prev) => [...prev, ...nextData]);
  // };

  const toggleModal = (training: ScheduleType) => {
    setShowModal(!showModal);
    setSelectedTrainingId(training.id); // Set the selected training ID when modal opens
  
    // Fetch employee data based on the selected training topic
    getEmployeeDataForTraining(training.topic, training.requirement).then((data) => {
      setEmployeeData(data); // Update employee data state
      setOriginalEmployeeData(data); // Store original employee data for reset
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
    // Ensure there are selected employees
    if (selectedEmployees.size === 0) {
      alert('Please select at least one employee to register');
      return;
    }

    // Get the selected training ID from the modal (this will be passed into the modal)
    const id_training = selectedTrainingId;
    console.log("Selected Training ID: " + id_training); // Debugging to ensure the correct id

    // Convert selected employee IDs to an array
    const id_karyawan = Array.from(selectedEmployees);
    console.log("KywTraining" + id_karyawan)

    try {
      const response = await fetch('http://localhost:3000/training/registrasi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_training,
          id_karyawan,
        }),
      });
      console.log(id_training)
      console.log(id_karyawan)

      const result = await response.json();
      if (result.ok) {
        alert('Employees successfully registered for the training');
      } else {
        alert('Failed to register employees');
      }
    } catch (error) {
      console.error('Error registering employees:', error);
      alert('An error occurred while registering employees');
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

export { ScheduleTraining };
