fetch('https://d153-106-51-177-49.ngrok-free.app/topics/available', { headers: { 'ngrok-skip-browser-warning': '69420' } })
  .then(res => res.text())
  .then(text => require('fs').writeFileSync('topics.json', text))
  .catch(console.error);
