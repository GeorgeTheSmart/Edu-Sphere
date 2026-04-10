fetch('https://d153-106-51-177-49.ngrok-free.app/dashboard/969c2cb2-1c96-4ecf-894d-994da1ece492', { headers: { 'ngrok-skip-browser-warning': '69420' } })
  .then(res => res.text())
  .then(text => require('fs').writeFileSync('dashboard-sample.json', text))
  .catch(console.error);
