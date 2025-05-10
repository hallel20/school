import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  onDelete: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  itemName,
  onDelete,
}) => {
  // Radix Dialog's open state is controlled by its `open` prop,
  // and changes are communicated via `onOpenChange`.
  // If `onOpenChange` is called with `false`, it means the dialog is requesting to be closed.
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 data-[state=open]:animate-overlayShow" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2
          rounded-lg bg-white p-6 shadow-xl
          focus:outline-none data-[state=open]:animate-contentShow
          dark:bg-gray-800"
        >
          <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Delete Confirmation
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Are you sure you want to delete "{itemName}"?
            {/* This action cannot be undone. */}
          </Dialog.Description>

          <div className="mt-6 flex justify-end space-x-3">
            <Dialog.Close asChild>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700
                           hover:bg-gray-200 focus:outline-none focus-visible:ring-2
                           focus-visible:ring-gray-500 focus-visible:ring-offset-2
                           dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={onDelete}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white
                         hover:bg-red-700 focus:outline-none focus-visible:ring-2
                         focus-visible:ring-red-500 focus-visible:ring-offset-2
                         dark:bg-red-500 dark:hover:bg-red-600"
            >
              Delete
            </button>
          </div>

          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute right-4 top-4 rounded-sm p-1 text-gray-400 opacity-70
              transition-opacity hover:text-gray-500 hover:opacity-100 focus:outline-none
              focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
              dark:text-gray-500 dark:hover:text-gray-400"
              aria-label="Close"
            >
              {/* <XMarkIcon className="h-5 w-5" /> Alternatively, use an SVG icon */}
              <span aria-hidden="true">&times;</span>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default DeleteConfirmationModal;
