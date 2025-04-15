const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const trainingsPath = path.join(__dirname, 'trainings.json');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'tajny_klucz'; // 🔐 Zmien na cos mocnego w produkcji
app.use(express.json()); // Middleware do parsowania JSON
const zawodnicyStatePath = path.join(__dirname, 'zawodnicy.json'); // Zmieniamy nazwę pliku na zawodnicy.json
///////////////////////////////////////////////////////////////// checkboxy //////////////////////////////////
// Endpoint do pobierania stanu checkboxów

// Endpoint do pobierania stanu checkboxów
// Endpoint do pobierania stanu checkboxów
app.get('/api/checkboxState', (req, res) => {
  fs.readFile(zawodnicyStatePath, 'utf8', (err, data) => {
      if (err) {
          console.error('Błąd odczytu pliku:', err);
          return res.status(500).json({ message: 'Błąd odczytu stanu checkboxów' });
      }
      console.log('Stan checkboxów odczytany z pliku:', data);  // Logowanie odczytanych danych
      res.json(JSON.parse(data || '{}')); // Jeśli plik jest pusty, zwróci pusty obiekt
  });
});

// Endpoint do pobierania stanu checkboxów
app.get('/api/checkboxState', (req, res) => {
  fs.readFile(zawodnicyStatePath, 'utf8', (err, data) => {
      if (err) {
          console.error('Błąd odczytu pliku:', err);
          return res.status(500).json({ message: 'Błąd odczytu stanu checkboxów' });
      }
      console.log('Stan checkboxów odczytany z pliku:', data);  // Logowanie odczytanych danych
      res.json(JSON.parse(data || '{}')); // Jeśli plik jest pusty, zwróci pusty obiekt
  });
});

// Endpoint do pobierania stanu checkboxów
app.get('/api/checkboxState', (req, res) => {
  fs.readFile(zawodnicyStatePath, 'utf8', (err, data) => {
      if (err) {
          console.error('Błąd odczytu pliku:', err);
          return res.status(500).json({ message: 'Błąd odczytu stanu checkboxów' });
      }
      console.log('Stan checkboxów odczytany z pliku:', data);  // Logowanie odczytanych danych
      res.json(JSON.parse(data || '{}')); // Jeśli plik jest pusty, zwróci pusty obiekt
  });
});

// Endpoint do zapisywania stanu checkboxów
app.post('/api/checkboxState', (req, res) => {
  const checkboxState = req.body;  // Oczekujemy, że dane będą w ciele zapytania

  console.log('Otrzymane dane do zapisu:', checkboxState);  // Logujemy dane otrzymane z front-endu

  // Odczytanie istniejących danych
  fs.readFile(zawodnicyStatePath, 'utf8', (err, data) => {
      if (err) {
          console.error('Błąd odczytu pliku:', err);
          return res.status(500).json({ message: 'Błąd odczytu stanu checkboxów' });
      }

      let existingData = JSON.parse(data || '{}');  // Wczytujemy istniejące dane

      // Aktualizowanie stanu checkboxów
      existingData = { ...existingData, ...checkboxState };

      // Zapisanie zaktualizowanych danych
      fs.writeFile(zawodnicyStatePath, JSON.stringify(existingData, null, 2), (err) => {
          if (err) {
              console.error('Błąd zapisu do pliku:', err);  // Logowanie błędu zapisu
              return res.status(500).json({ message: 'Błąd zapisu stanu checkboxów' });
          }
          console.log('Stan checkboxów zapisany do pliku');  // Potwierdzenie zapisu
          res.json({ message: 'Stan checkboxów zapisany' });
      });
  });
});

////////////////////////////////////////////////////
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const users = [
  {
    id: 1,
    username: 'patryk',
    passwordHash: '',
    role: 'trener',
    clubId: 1 // Klub Patryka
  },
  {
    id: 2,
    username: 'krzysztof',
    passwordHash: '',
    role: 'trener',
    clubId: 2 // Klub Krzysztofa
  },
  {
    id: 3,
    username: 'mateusz',
    passwordHash: '',
    role: 'zawodnik',
    athleteName: 'Mateusz B',
    clubId: 1 // Zawodnik w klubie Patryka
  },
  {
    id: 4,
    username: 'marcin',
    passwordHash: '',
    role: 'zawodnik',
    athleteName: 'Marcin W',
    clubId: 1 // Zawodnik w klubie Patryka
  },
  {
    id: 5,
    username: 'anna',
    passwordHash: '',
    role: 'zawodnik',
    athleteName: 'Anna K',
    clubId: 2 // Zawodnik w klubie Krzysztofa
  },
  {
    id: 6,
    username: 'lukasz',
    passwordHash: '',
    role: 'zawodnik',
    athleteName: 'Łukasz T',
    clubId: 2 // Zawodnik w klubie Krzysztofa
  }
];

const clubs = [
  {
    id: 1,
    name: 'Dynamit',
    athletes: [
      { id: 3, name: 'Mateusz B' },
      { id: 4, name: 'Marcin W' }
    ]
  },
  {
    id: 2,
    name: 'Power Team',
    athletes: [
      { id: 5, name: 'Anna K' },
      { id: 6, name: 'Łukasz T' }
    ]
  }
];

// Haszuj hasło tylko raz przy starcie
(async () => {
    const password = 'haslo123';
    const hash = await bcrypt.hash(password, 10);
  
    users.forEach(user => {
      user.passwordHash = hash;
    });
  })();

  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user) return res.status(401).json({ message: 'Nieprawidłowy login' });
  
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Nieprawidłowe hasło' });
  
    // Znajdź klub trenera
    const club = clubs.find(c => c.id === user.clubId);
  
    // Filtruj zawodników przypisanych do klubu trenera
    const athletesForUser = club.athletes.filter(athlete => 
      users.some(u => u.id === athlete.id && u.clubId === user.clubId)
    );
  
    console.log('Zawodnicy dla trenera:', athletesForUser);  // Debugowanie
  
    const token = jwt.sign({
      userId: user.id,
      username: user.username,
      role: user.role,
      clubId: user.clubId,
      athletes: athletesForUser,  // Zwracamy zawodników tylko z przypisanego klubu
      athleteName: user.athleteName
    }, SECRET_KEY, { expiresIn: '1h' });
  
    res.json({ message: 'Zalogowano', token });
  });

// Start serwera
app.listen(PORT, () => {
  console.log(`Serwer działa na http://localhost:${PORT}`);
});


  app.post('/api/trainings', (req, res) => {
    const newTraining = req.body;
  
    fs.readFile(trainingsPath, 'utf8', (err, data) => {
      let trainings = [];
      if (!err && data) {
        trainings = JSON.parse(data);
      }
  
      trainings.push(newTraining);
  
      fs.writeFile(trainingsPath, JSON.stringify(trainings, null, 2), (err) => {
        if (err) {
          console.error("Błąd zapisu:", err);
          return res.status(500).json({ message: 'Błąd zapisu' });
        }
        res.json({ message: 'Zapisano trening' });
      });
    });
  });

  app.get('/api/trainings', (req, res) => {
    fs.readFile(trainingsPath, 'utf8', (err, data) => {
      if (err) {
        console.error("Błąd odczytu:", err);
        return res.status(500).json({ message: 'Błąd odczytu' });
      }
      const trainings = JSON.parse(data || '[]');
      res.json(trainings);
    });
  });

  app.get('/api/athletes', (req, res) => {
    const { clubId } = req.query; // Odbieramy clubId z query string

    if (!clubId) {
        return res.status(400).json({ message: 'Brak clubId w zapytaniu' });
    }

    // Znajdź klub na podstawie clubId
    const club = clubs.find(c => c.id == clubId);
    
    if (!club) {
        return res.status(404).json({ message: 'Klub nie znaleziony' });
    }

    // Zwróć listę zawodników przypisanych do klubu
    res.json(club.athletes);
});
  