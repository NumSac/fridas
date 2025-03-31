function deleteListener(id, name) {
  if (!confirm(`Delete listener "${name}"?`)) return;

  fetch(`/listeners/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  })
    .then((response) => {
      if (response.ok) window.location.reload();
      else throw new Error('Failed to delete listener');
    })
    .catch((error) => {
      console.error(error);
      alert(error.message);
    });
}

function toggleSSLOptions() {
  const sslEnabled = document.getElementById('enableSSL').checked;
  const sslOptions = document.getElementById('sslOptions');
  const sslInputs = sslOptions.querySelectorAll('input');

  sslOptions.style.display = sslEnabled ? 'block' : 'none';
  sslInputs.forEach((input) => {
    input.disabled = !sslEnabled;
    if (!sslEnabled) input.value = '';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize SSL options
  toggleSSLOptions();
  document
    .getElementById('enableSSL')
    .addEventListener('change', toggleSSLOptions);

  // CA Bundle dynamic display
  const caContainer = document.getElementById('sslCaPath').closest('.mb-3');
  caContainer.style.display = 'none';

  // Form validation
  document
    .getElementById('createListenerForm')
    .addEventListener('submit', function (e) {
      const sslEnabled = document.getElementById('enableSSL').checked;
      const keyPath = document.getElementById('sslKeyPath').value;
      const certPath = document.getElementById('sslCertPath').value;
      const sslError = document.getElementById('sslError');

      if (sslEnabled && (!keyPath || !certPath)) {
        e.preventDefault();
        sslError.classList.remove('d-none');
        window.scrollTo({
          top: document.getElementById('sslOptions').offsetTop - 100,
          behavior: 'smooth',
        });
      }
    });
});
