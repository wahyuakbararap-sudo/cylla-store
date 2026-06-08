import { openModal, closeModal } from './modal.js';

export function confirmModal(message, onYes) {
  openModal(
    'Konfirmasi',
    `<p>${message}</p>`,
    () => {
      closeModal();
      onYes();
    }
  );
}