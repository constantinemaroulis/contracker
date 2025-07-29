document.addEventListener('DOMContentLoaded', () => {
  const ssnInput = document.getElementById('ssnInput');
  ssnInput.focus();

  document.querySelectorAll('.keypad .key').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const value = btn.value;
      if (value === 'clr') {
        ssnInput.value = '';
        return;
      }
      if (value === 'del') {
        ssnInput.value = ssnInput.value.slice(0, -1);
        return;
      }
      if (ssnInput.value.length < 6 && /^\d$/.test(value)) {
        ssnInput.value += value;
      }
    });
  });

  document.addEventListener('keydown', e => {
    const val = ssnInput.value;
    if (e.key === 'Backspace') {
      e.preventDefault();
      ssnInput.value = val.slice(0, -1);
      return;
    }
    if (e.key === 'Delete') {
      ssnInput.value = '';
      e.preventDefault();
      return;
    }
    if (val.length >= 6) {
      e.preventDefault();
      return;
    }
    if (/\d/.test(e.key)) {
      e.preventDefault();
      ssnInput.value += e.key;
    }
  });
});
