// Design Claim 20 (Chapter 4): point-of-action reminders.
// Adds a live moderation warning under every textarea marked with
// data-moderation-check. The draft is sent to /moderation/check as the user
// types (debounced), so they are reminded of the rules before submitting.
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('textarea[data-moderation-check]').forEach((textarea) => {
    const alert = document.createElement('div');
    alert.className = 'alert py-1 px-2 small mt-2 d-none';
    alert.setAttribute('role', 'alert');
    textarea.insertAdjacentElement('afterend', alert);

    let timer = null;
    textarea.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const text = textarea.value.trim();
        if (!text) {
          alert.classList.add('d-none');
          return;
        }
        try {
          const body = new URLSearchParams({ content: text });
          if (textarea.dataset.newcomer === '1') body.append('newcomer', '1');
          const res = await fetch('/moderation/check', {
            method: 'POST',
            body: body,
          });
          const data = await res.json();
          if (data.category === 'ok') {
            alert.classList.add('d-none');
          } else {
            alert.className = `alert alert-${data.category} py-1 px-2 small mt-2`;
            alert.textContent = '⚠️ ' + data.message;
          }
        } catch (e) {
          alert.classList.add('d-none');
        }
      }, 400);
    });
  });
});
