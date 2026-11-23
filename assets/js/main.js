// Menú móvil
const btn = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');
if (btn && nav) {
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
}

// Formulario de contacto: envío por AJAX a FormSubmit (si falla JS, el form hace POST normal)
document.querySelectorAll('form.form').forEach((form) => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = form.querySelector('.form-status');
    const submit = form.querySelector('button[type=submit]');
    if (form.querySelector('[name=_honey]').value) return; // bot
    submit.disabled = true;
    status.textContent = 'Sending…';
    try {
      const url = form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/');
      const res = await fetch(url, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && String(data.success) !== 'false') {
        form.reset();
        status.textContent = 'Thank you! Your message has been sent. We will get back to you shortly.';
      } else {
        throw new Error(data.message || 'Error');
      }
    } catch (err) {
      status.innerHTML = 'Sorry, something went wrong. Please write to us at <a href="mailto:info@enmars.eu">info@enmars.eu</a>.';
    } finally {
      submit.disabled = false;
    }
  });
});
