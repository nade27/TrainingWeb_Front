import { Label, TextInput, Button } from 'flowbite-react';
import { useNipFormat, getTopicOptions, OptionType, } from '../../utils/HandlerForm.ts';
import Select from 'react-select';
import React, { useEffect, useState } from 'react';
import {ScheduleTraining} from '../tables/ScheduleTrainingTable.tsx';

const FormDaftarTraining: React.FC = () => {
  const { nip, handleNipChange } = useNipFormat();
  const [options, setOptions] = useState<OptionType[]>([]);

  useEffect(() => {
    // Ambil data saat komponen pertama kali dimuat
    getTopicOptions().then((data) => {
      setOptions(data);
    });
  }, []);

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      <h5 className="card-title">Pendaftaran Training</h5>
      <div className="mt-6">
        <div className="">
          <div className="lg:col-span-6 col-span-12 mb-4">
            <div className="flex  flex-col gap-4">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="name" value="Nama Lengkap" />
                </div>
                <TextInput
                  id="name"
                  type="text"
                  placeholder="Nama Lengkap"
                  required
                  className="form-control form-rounded-xl"
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="nip" value="NIP" />
                </div>
                <TextInput
                  id="nip"
                  type="text"
                  value={nip}
                  onChange={handleNipChange}
                  placeholder="12-3456"
                  required
                  className="form-control form-rounded-xl"
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="dept" value="Departemen" />
                </div>
                <TextInput
                  id="dept"
                  type="text"
                  required
                  className="form-control form-rounded-xl"
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="grade" value="Grade" />
                </div>
                <TextInput
                  id="Grade"
                  type="number"
                  required
                  className="form-control form-rounded-xl"
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="cc" value="Cost Center" />
                </div>
                <TextInput id="cc" type="text" required className="form-control form-rounded-xl" />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="topic" value="Topik Training" />
                </div>
                <Select 
                  id="topic"
                  options={options}
                  placeholder="Pilih Topik Training"
                  required 
                  className="select-rounded"
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="schtraining" value="Training Schedule" />
                </div>
                <TextInput id="schtrain" type="datetime-local" required className="form-control form-rounded-xl" />
              </div>
              <div id="schtraining" className="mb-2 block">
                <Label htmlFor="schtraining" />
                <ScheduleTraining/>
              </div>


            </div>
          </div>
          {/* <div className="lg:col-span-6 col-span-12 mb-10">
            <div className="flex  flex-col gap-4">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="countries1" value="Country" />
                </div>
                <Select id="countries1" required className="select-rounded">
                  <option>India</option>
                  <option>Canada</option>
                  <option>France</option>
                  <option>Germany</option>
                </Select>
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="countries2" value="State" />
                </div>
                <Select id="countries2" required className="select-rounded">
                  <option>Delhi</option>
                  <option>Gujarat</option>
                  <option>Mumbai</option>
                  <option>Chennai</option>
                </Select>
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="countries3" value="City" />
                </div>
                <Select id="countries3" required className="select-rounded">
                  <option>Rajkot</option>
                  <option>Ahemedabad</option>
                </Select>
              </div>
            </div>
          </div> */}
          <div className="col-span-12 flex gap-3">
            <Button color={'primary'}>Submit</Button>
            <Button color={'error'}>Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormDaftarTraining;
