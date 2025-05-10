import { useState } from 'react';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

export const useDeleteConfirmation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [onConfirmCallback, setOnConfirmCallback] = useState<() => void>(
    () => {}
  );

  const openDeleteConfirmation = ({
    title,
    message,
    onConfirm,
  }: {
    title: string;
    message: string;
    onConfirm: () => void;
  }) => {
    setTitle(title);
    setMessage(message);
    setOnConfirmCallback(() => onConfirm);
    setIsOpen(true);
  };

  const closeDeleteConfirmation = () => {
    setIsOpen(false);
    setTitle('');
  };

  const DeleteModal = () => (
    <DeleteConfirmationModal
      isOpen={isOpen}
      onClose={closeDeleteConfirmation}
      title={title}
      message={message}
      onConfirm={() => {
        onConfirmCallback(); // Call the stored callback
        closeDeleteConfirmation();
      }}
    />
  );

  return { openDeleteConfirmation, DeleteModal };
};
