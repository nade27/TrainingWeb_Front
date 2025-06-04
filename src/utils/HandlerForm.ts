// hooks/useNipFormat.ts

import { useState } from 'react';

// Hook untuk menangani format NIP
export const useNipFormat = () => {
  const [nip, setNip] = useState<string>('');

  // Fungsi untuk memformat input NIP
  const handleNipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 8) {
      value = value.slice(0, 8);
    }
    e.target.value = value;
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
    return data.map((topic: any) => ({
      label: topic.name,
      value: topic.id.toString()
    }));
  } catch (error) {
    console.error('Error fetching topics:', error);
    return [];
  }
};
