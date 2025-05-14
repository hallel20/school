// CustomSelectComponent.tsx
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import Select, { StylesConfig } from 'react-select';

// ... options and Option interface
export interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: Option | null;
  onChange: (option: Option | null) => void;
  onBlur?: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
  inputId?: string;
  className?: string;
  defaultValue?: Option;
  isClearable?: boolean;
  placeholder?: string;
  label?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = (props) => {
  const { theme } = useTheme();

  const customStyles: StylesConfig<Option, false> = {
    control: (baseStyles, state) => ({
      ...baseStyles,
      backgroundColor: theme === 'dark' ? '#4a5568' : '#fff',
      color: theme === 'dark' ? '#eee' : '#333',
      borderColor: state.isFocused
        ? theme === 'dark' // gray-700
          ? '#777'
          : '#ccc'
        : theme === 'dark'
        ? '#555'
        : '#aaa',
      '&:hover': {
        borderColor: theme === 'dark' ? '#777' : '#ccc',
      },
    }),
    option: (baseStyles, state) => ({
      ...baseStyles,
      backgroundColor: state.isSelected
        ? theme === 'dark'
          ? '#555'
          : '#ddd'
        : state.isFocused
        ? theme === 'dark'
          ? '#444'
          : '#eee'
        : theme === 'dark'
        ? '#333'
        : '#fff',
      color: theme === 'dark' ? '#eee' : '#333',
      '&:active': {
        backgroundColor: theme === 'dark' ? '#666' : '#ccc',
      },
    }),
    singleValue: (baseStyles) => ({
      ...baseStyles,
      color: theme === 'dark' ? '#eee' : '#333',
    }),
    input: (baseStyles) => ({
      ...baseStyles,
      color: theme === 'dark' ? '#eee' : '#333',
    }),
    placeholder: (baseStyles) => ({
      ...baseStyles,
      color: theme === 'dark' ? '#aaa' : '#777',
    }),
    menu: (baseStyles) => ({
      ...baseStyles,
      backgroundColor: theme === 'dark' ? '#333' : '#fff',
      color: theme === 'dark' ? '#eee' : '#333',
      borderColor: theme === 'dark' ? '#555' : '#aaa',
    }),
    dropdownIndicator: (baseStyles) => ({
      ...baseStyles,
      color: theme === 'dark' ? '#aaa' : '#777',
    }),
    indicatorSeparator: (baseStyles) => ({
      ...baseStyles,
      backgroundColor: theme === 'dark' ? '#555' : '#aaa',
    }),
  };

  return <Select styles={customStyles} {...props} />;
};

export default CustomSelect;
