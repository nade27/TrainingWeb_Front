// hooks/useNipFormat.ts

import { useState } from 'react';

// Hook untuk menangani format NIP
export const useNipFormat = () => {
  const [nip, setNip] = useState<string>('');

  // Fungsi untuk memformat input NIP
  const handleNipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Hanya izinkan angka, dan batasi input agar sesuai dengan format xx-xxxx
    value = value.replace(/\D/g, ''); // Hapus karakter selain angka
    if (value.length > 2) {
      value = value.slice(0, 2) + '-' + value.slice(2, 6); // Format menjadi xx-xxxx
    }
    setNip(value);
  };

  return {
    nip,
    handleNipChange,
  };
};

// src/utils/topicSelectLogic.ts

export interface OptionType {
  label: string;
  value: string;
}

export const getTopicOptions = async (): Promise<OptionType[]> => {
  try {
    const response = await fetch('http://localhost:3000/training');
    const data = await response.json();
    return data; // Data sudah dalam format { label, value }
  } catch (error) {
    console.error('Error fetching data:', error);
    return []; // Jika terjadi error, kembalikan array kosong
  }
};
