
import { Dropdown } from "flowbite-react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Icon } from "@iconify/react";
import { Table } from "flowbite-react";
import { useEffect, useState } from "react";


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

const getRegisteredData = async (): Promise<RegisteredDataType[]> => {
  try {
    const response = await fetch("http://localhost:3000/training/registrasi");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();

    // Check the structure of the response and access the 'regtraining' property
    if (data && Array.isArray(data.regtraining)) {
      console.log("Valid data structure", data.regtraining);  // Log to verify the array
      return data.regtraining;  // Return the regtraining array
    } else {
      console.error("Invalid data structure:", data);
      return [];  // Return an empty array if the structure is not as expected
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};




const RegisteredTraining: React.FC = () => {
  const [RegisteredData, setRegisteredData] = useState<RegisteredDataType[]>([]);
  const [visibleData, setVisibleData] = useState<RegisteredDataType[]>([]);
  // const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof RegisteredDataType; direction: string}>({key: 'nama',direction: 'asc'});
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      const data = await getRegisteredData();
      console.log('Fetched Data:', data);
  
      // If the data is not an array, return an empty array
      if (Array.isArray(data)) {
        setRegisteredData(data);
        setVisibleData(data);
      } else {
        console.error('Invalid data format received from the API.');
        setRegisteredData([]);
        setVisibleData([]);
      }
    };
    fetchData();
  }, []);
  

  const filterData = (searchTerm: string, startDateFilter: string, endDateFilter: string) => {
    const filteredData = RegisteredData.filter((item) => {
      const matchesSearch =
        item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.departemen.toLowerCase().includes(searchTerm.toLowerCase());

      const startDate = new Date(item.startDate);
      const endDate = new Date(item.endDate);
      const isWithinDateRange =
        (startDateFilter ? startDate >= new Date(startDateFilter) : true) &&
        (endDateFilter ? endDate <= new Date(endDateFilter) : true);
      return matchesSearch && isWithinDateRange;
    });
    setVisibleData(filteredData);
    console.log('Visible Data',visibleData)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    filterData(e.target.value, startDateFilter, endDateFilter);
  };

  const handleDateFilter = () => {
    filterData(searchTerm, startDateFilter, endDateFilter);
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
                  {(visibleData || []).map((item, index) => (
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
                  ))}
                </Table.Body>
              </Table>
            </div>
         
        </div>
      </div>
    </>
  );
};

export  { RegisteredTraining };
