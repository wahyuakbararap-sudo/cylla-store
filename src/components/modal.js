export function openModal(title, body, onSubmit) {
  const oldModal = document.querySelector('.modal-backdrop');
  if (oldModal) oldModal.remove();

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';

  modal.innerHTML = `
    <div class="modal-box">
      <div class="modal-head">
        <h2>${title}</h2>
        <button class="modal-close">×</button>
      </div>

      <form id="modalForm">
        ${body}

        <div class="modal-actions">
          <button type="button" class="btn-secondary modal-cancel">Batal</button>
          <button type="submit">Simpan</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('.modal-close').onclick = closeModal;
  modal.querySelector('.modal-cancel').onclick = closeModal;

  modal.querySelector('#modalForm').onsubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };
}

export function closeModal() {
  document.querySelector('.modal-backdrop')?.remove();
}