
fetch('https://d153-106-51-177-49.ngrok-free.app/users/login-or-register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    phone_number: '+12345678901',
    name: 'Testy',
    email: 'test@testy.com'
  })
})
.then(res => res.text())
.then(console.log)
.catch(console.error);
