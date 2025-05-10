import { useState } from 'react';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

export const useDeleteConfirmation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [onDeleteCallback, setOnDeleteCallback] = useState<() => void>(
    () => {}
  ); // Renamed for clarity

  const openDeleteConfirmation = (itemName: string, onDelete: () => void) => {
    setItemName(itemName);
    setOnDeleteCallback(() => onDelete);
    setIsOpen(true);
  };

  const closeDeleteConfirmation = () => {
    setIsOpen(false);
  };

  const DeleteModal = () => (
    <DeleteConfirmationModal
      isOpen={isOpen}
      onClose={closeDeleteConfirmation}
      itemName={itemName}
      onDelete={() => {
        onDeleteCallback(); // Call the stored callback
        closeDeleteConfirmation();
      }}
    />
  );

  return { openDeleteConfirmation, DeleteModal };
};
