import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, onOpenChange, title, children }) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-96">
          <Dialog.Title className="text-lg font-bold mb-4">{title}</Dialog.Title>
          {children}
          <div className="mt-6 flex justify-end">
            <Dialog.Close asChild>
              <button className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
                Close
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Modal;