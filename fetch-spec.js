fetch('https://d153-106-51-177-49.ngrok-free.app/openapi.json', { headers: { 'ngrok-skip-browser-warning': '69420' } })
  .then(res => res.text())
  .then(text => require('fs').writeFileSync('api-spec.json', text))
  .catch(console.error);
