const button = document.querySelector('#quote-button');
const quoteText = document.querySelector('#quote-text');
const quoteAuthor = document.querySelector('#quote-author');
const statusMessage = document.querySelector('#status-message');

function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle('error', isError);
}

async function loadQuote() {
  button.disabled = true;
  setStatus('Загрузка...');

  try {
    const response = await fetch('/api/quote');

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const quote = await response.json();

    quoteText.textContent = quote.text;
    quoteAuthor.textContent = `— ${quote.author}`;
    setStatus('');
  } catch (error) {
    setStatus('Не удалось получить цитату. Проверьте миграции и состояние сервера.', true);
  } finally {
    button.disabled = false;
  }
}

button.addEventListener('click', loadQuote);
