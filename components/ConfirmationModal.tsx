import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonVariant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  confirmButtonVariant = 'danger',
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="md">
      <div className="font-body text-gumball-dark dark:text-gumball-light-bg/90 mt-2 mb-6 text-sm sm:text-base leading-relaxed">
        {message}
      </div>
      <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
        <Button 
          onClick={onCancel} 
          variant="ghost" 
          className="w-full sm:w-auto"
        >
          {cancelButtonText}
        </Button>
        <Button 
          onClick={onConfirm} 
          variant={confirmButtonVariant} 
          className="w-full sm:w-auto"
        >
          {confirmButtonText}
        </Button>
      </div>
    </Modal>
  );
};
