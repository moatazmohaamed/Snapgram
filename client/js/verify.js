function initVerifyInputs() {
  const inputs = document.querySelectorAll('input[type="text"]');

  inputs.forEach((input, index) => {
    input.addEventListener('input', () => {
      if (input.value.length > 0 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && input.value === '' && index > 0) {
        inputs[index - 1].focus();
      }
    });
  });

  const form = document.getElementById('verifyForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      let code = '';
      inputs.forEach(input => code += input.value);
      if (code.length === 6) {
        window.location.hash = '/reset-password';
      } else {
        alert('Please enter the 6-digit code.');
      }
    });
  }
}

export function init() {
  initVerifyInputs();
}
