// public/js/listener-details-script.js
async function stopListener(listenerId) {
  try {
    const response = await fetch(`/listeners/${listenerId}/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    if (response.ok) {
      window.location.reload();
    } else {
      const error = await response.json();
      alert(`Error: ${error.message}`);
    }
  } catch (error) {
    console.error('Stop failed:', error);
    alert('Failed to stop listener');
  }
}

async function startListener(listenerId) {
  try {
    const response = await fetch(`/listeners/${listenerId}/start`, {
      method: 'GET',
    });

    if (response.ok) {
      window.location.reload();
    } else {
      const error = await response.json();
      alert(`Error: ${error.message}`);
    }
  } catch (error) {
    console.error('Start failed:', error);
    alert('Failed to start listener');
  }
}

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
