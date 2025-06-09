import { Dropdown, Table, Spinner, Alert } from "flowbite-react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axios";
import * as XLSX from 'xlsx';

interface RegisteredDataType {
  id: number;
  nama: string;
  departemen: string;
  nip: string;
  topic: string;
  startDate: string;
  endDate: string;
  duration: string;
  venue: string;
  status: string
}

interface RegisteredApiResponse {
  regtraining: RegisteredDataType[];
}

interface BatchUpdateResponse {
  success: boolean;
  message: string;
}

const getRegisteredData = async (): Promise<RegisteredDataType[]> => {
  try {
    const response = await axiosInstance.get<RegisteredApiResponse>("/training/registrasi");
    const apiData = response.data;

    if (apiData && Array.isArray(apiData.regtraining)) {
      return apiData.regtraining;
    } else if (Array.isArray(apiData)) {
      return apiData as RegisteredDataType[];
    } else {
      console.error("[RegisteredTable] getRegisteredData: Invalid data structure from API. Expected '.regtraining' array or a direct array, got:", apiData);
      return []; 
    }
  } catch (error) {
    console.error("[RegisteredTable] getRegisteredData: Error fetching data:", error);
    throw error;
  }
};

const RegisteredTraining: React.FC = () => {
  const [RegisteredData, setRegisteredData] = useState<RegisteredDataType[]>([]);
  const [visibleData, setVisibleData] = useState<RegisteredDataType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof RegisteredDataType; direction: string }>({ key: 'nama', direction: 'asc' });
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getRegisteredData();
      setRegisteredData(data);
      setVisibleData(data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filterData = (searchTerm: string, startDateFilter: string, endDateFilter: string) => {
    const filteredData = RegisteredData.filter((item) => {
      const matchesSearch =
        item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.departemen.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.status.toLowerCase().includes(searchTerm.toLowerCase());
      
      const startDate = new Date(item.startDate);
      const isWithinDateRange = 
        (startDateFilter ? startDate >= new Date(startDateFilter) : true) &&
        (endDateFilter ? new Date(item.endDate) <= new Date(endDateFilter) : true);

      return matchesSearch && isWithinDateRange;
    });
    setVisibleData(filteredData);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    filterData(e.target.value, startDateFilter, endDateFilter);
  };

  const handleDateFilter = () => {
    filterData(searchTerm, startDateFilter, endDateFilter);
  };

  const handleStatusUpdateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      alert('Pilih file Excel untuk diunggah.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (json.length === 0) {
          alert("File Excel kosong atau format tidak sesuai.");
          return;
        }

        const requiredHeaders = ['nama', 'nip', 'topic'];
        const headers = Object.keys(json[0]);
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

        if (missingHeaders.length > 0) {
          throw new Error(`Kolom berikut tidak ditemukan di file Excel: ${missingHeaders.join(', ')}. Pastikan nama kolom sesuai (nama, nip, topic).`);
        }

        const response = await axiosInstance.patch<BatchUpdateResponse>('/training/registrasi/update-status-batch', { updates: json });

        alert(response.data.message || 'Status training berhasil diperbarui.');

        await fetchData();

      } catch (error: any) {
        console.error('Error updating statuses:', error);
        alert(`Gagal memperbarui status: ${error.response?.data?.message || error.message}`);
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSort = (key: keyof RegisteredDataType) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc'){
      direction = 'desc';
    }

    const sortedData = [...RegisteredData].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setSortConfig({ key, direction });
    setVisibleData(sortedData);
  };
  
  /*Table Action*/
  const tableActionData = [
    {
      icon: "solar:add-circle-outline",
      listtitle: "Add",
    },
    {
      icon: "solar:pen-new-square-broken",
      listtitle: "Edit",
    },
    {
      icon: "solar:trash-bin-minimalistic-outline",
      listtitle: "Delete",
    },
  ];

  if (isLoading) {
    return (
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words text-center">
        <Spinner aria-label="Loading registered training data" size="xl" />
        <p className="mt-2">Memuat data training terdaftar...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
        <Alert color="failure">
          <span className="font-medium">Error!</span> {error}
        </Alert>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6  relative w-full break-words">
        <h5 className="card-title mb-10 text-40">Karyawan yang terdaftar Training</h5>
        <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Cari data"
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
            className="p-2 border  rounded-md"
            />
          <button
            onClick={handleDateFilter}
            className="bg-blue-500 text-white p-2 rounded-md"
          >
            Filter
          </button>
          <label
            htmlFor="status-update-upload"
            className="bg-purple-500 text-white p-2 rounded-md cursor-pointer hover:bg-purple-600"
          >
            Update Status via Excel
          </label>
          <input
            id="status-update-upload"
            type="file"
            className="hidden"
            onChange={handleStatusUpdateUpload}
            accept=".xlsx, .xls"
          />
        </div>
        <div className="mt-3">
         
            <div className="overflow-x-auto">
              <Table hoverable>
                <Table.Head>
                  <Table.HeadCell>No.</Table.HeadCell>
                  <Table.HeadCell onClick={() => handleSort('nama')}>Nama</Table.HeadCell>
                  <Table.HeadCell>NIP</Table.HeadCell>
                  <Table.HeadCell>Departemen</Table.HeadCell>
                  <Table.HeadCell>Topic</Table.HeadCell>
                  <Table.HeadCell onClick={() => handleSort('startDate')}>Tanggal Mulai</Table.HeadCell>
                  <Table.HeadCell onClick={() => handleSort('endDate')}>Tanggal Selesai</Table.HeadCell>
                  <Table.HeadCell>Durasi</Table.HeadCell>
                  <Table.HeadCell>Lokasi</Table.HeadCell>
                  <Table.HeadCell>Status Training</Table.HeadCell>
                  <Table.HeadCell></Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y divide-border dark:divide-darkborder ">
                  {(visibleData && visibleData.length > 0) ? (
                    visibleData.map((item, index) => (
                      <Table.Row key={item.id}>
                        <Table.Cell>
                          <h6 className="text-sm">{index +1}</h6>
                        </Table.Cell>
                        <Table.Cell>
                          <h6 className="text-sm">{item.nama}</h6>
                        </Table.Cell>
                        <Table.Cell>
                          <h6 className="text-sm">{item.nip}</h6>
                        </Table.Cell>
                        <Table.Cell>
                          <h6 className="text-sm">{item.departemen}</h6>
                        </Table.Cell>
                        <Table.Cell>
                          <h6 className="text-sm">{item.topic}</h6>
                        </Table.Cell>
                        <Table.Cell>
                          <h6 className="text-sm">{item.startDate}</h6>
                        </Table.Cell>
                        <Table.Cell>
                          <h6 className="text-sm">{item.endDate}</h6>
                        </Table.Cell>
                        <Table.Cell>
                          <h6 className="text-sm">{item.duration}</h6>
                        </Table.Cell>
                        <Table.Cell>
                          <h6 className="text-sm">{item.venue}</h6>
                        </Table.Cell>
                        <Table.Cell>
                          <h6 className="text-sm">{item.status}</h6>
                        </Table.Cell>
                        <Table.Cell>
                          <Dropdown
                            label=""
                            dismissOnClick={false}
                            renderTrigger={() => (
                              <span className="h-9 w-9 flex justify-center items-center rounded-full hover:bg-lightprimary hover:text-primary cursor-pointer">
                                <HiOutlineDotsVertical size={22} />
                              </span>
                            )}
                          >
                            {tableActionData.map((items, index) => (
                              <Dropdown.Item key={index} className="flex gap-3">
                                {" "}
                                <Icon icon={`${items.icon}`} height={18} />
                                <span>{items.listtitle}</span>
                              </Dropdown.Item>
                            ))}
                          </Dropdown>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  ) : (
                    <Table.Row>
                      <Table.Cell colSpan={11} className="text-center">
                        Tidak ada data training terdaftar yang ditemukan.
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table>
            </div>
         
        </div>
      </div>
    </>
  );
};

export default RegisteredTraining;
