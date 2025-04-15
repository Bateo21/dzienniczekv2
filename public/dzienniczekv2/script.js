let trainingRecords = [];

function renderTrainingsForSelectedAthlete() {
  const selected = document.getElementById('athlete').value;
  const container = document.getElementById("training-records");
  container.innerHTML = "";

  const filtered = selected
    ? trainingRecords.filter(t => t.athlete === selected)
    : trainingRecords;

  filtered.forEach(displayTrainingData);
}

window.addEventListener('DOMContentLoaded', () => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    window.location.href = '/dzienniczekv2/dzienniczek.html';
    return;
  }

  const decoded = jwt_decode(token);
  const role = decoded.role;
  const clubId = decoded.clubId;  // Pobieramy clubId z tokenu
  const athleteSelect = document.getElementById('athlete');

   // Ustawiamy nazwę klubu w <h2>
   const clubName = clubId === 1 ? "Dynamit 1985" : clubId === 2 ? "Power Team" : "Nieznany klub";  // Przykładowe przypisanie klubów
   document.querySelector('h2').textContent = clubName;  // Zmiana tekstu w <h2>

  if (role === 'zawodnik') {
    athleteSelect.innerHTML = `<option value="${decoded.athleteName}">${decoded.athleteName}</option>`;
  } else {
    athleteSelect.innerHTML = `
      <option value="">-- Wybierz zawodnika --</option>
      <option value="${decoded.athleteName}">${decoded.athleteName}</option>`;
    const athletes = ["Mateusz B", "Marcin W"];
    athletes.forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      athleteSelect.appendChild(opt);
    });
  }

  // 📥 Pobierz dane i zapamiętaj
  fetch('/api/trainings')
    .then(res => res.json())
    .then(data => {
      trainingRecords = data;
      renderTrainingsForSelectedAthlete();
    });

  // 📌 Zmieniono select zawodnika
  athleteSelect.addEventListener('change', renderTrainingsForSelectedAthlete);
});


// Wyświetlanie formularza na podstawie wybranego typu treningu
document.getElementById("training-type").addEventListener("change", function() {
    const trainingType = this.value;
    const imitacjaOptions = document.getElementById("imitacja-options");
    const biegOptions = document.getElementById("bieg-options");
    const nartorolkiOptions = document.getElementById("nartorolki-options");
    const heartRateField = document.getElementById("average-heart-rate");

    // Zawsze pokazuj pole średniego tętna
    heartRateField.style.display = "block";

    // Pokazuje lub ukrywa opcję rodzaju imitacji w zależności od wybranego typu treningu
    if (trainingType === "imitacja") {
        imitacjaOptions.style.display = "block"; // Pokaż opcje imitacji
        biegOptions.style.display = "none"; // Ukryj opcje biegu
        nartorolkiOptions.style.display = "none"
    } else if (trainingType === "bieg") {
        biegOptions.style.display = "block"; // Pokaż opcje biegu
        imitacjaOptions.style.display = "none"; // Ukryj opcje imitacji
        nartorolkiOptions.style.display = "none"
    }
    else if (trainingType === "nartorolki") {
        biegOptions.style.display = "none"; // Ukryj opcje biegu
        nartorolkiOptions.style.display = "block"; // Pokaż opcje nartorolek
    } else {
        imitacjaOptions.style.display = "none"; // Ukryj opcje imitacji
        biegOptions.style.display = "none"; // Ukryj opcje biegu
        nartorolkiOptions.style.display = "none"
    }
});

// Zapisz trening po przesłaniu formularza
document.getElementById("training-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const trainingData = {
        athlete: formData.get("athlete"),
        date: formData.get("date"),
        trainingType: formData.get("training-type"), // Zostawiamy typ treningu
        trainingRange: formData.get("training-range"),
        imitacjaType: formData.get("imitacja-type") || null,  // Zapisuje typ imitacji, jeśli dostępny
        biegType: formData.get("bieg-type") || null,  // Rodzaj biegu (np. długodystansowy, interwałowy)
        nartorolkiType: formData.get("nartorolki-type") || null,  // Zapisuje typ imitacji, jeśli dostępny
        distance: formData.get("distance"),
        duration: formData.get("duration"),
        averageHeartRate: formData.get("average-heart-rate"),  // Zapisz tętno
        notes: formData.get("notes"),
    };
     // 💡 Jeśli użytkownik to zawodnik, nadpisz dane imienia z tokena
     const token = sessionStorage.getItem('token');
     if (token) {
         const decoded = jwt_decode(token);
         if (decoded.role === 'zawodnik') {
             trainingData.athlete = decoded.athleteName;
         }
     }

    // Dodanie treningu do tablicy
    trainingRecords.push(trainingData);

    // Wyświetlenie treningów po zapisaniu
    //displayTrainingData(trainingData);

    fetch('/api/trainings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(trainingData)
    })
    .then(res => res.json())
    .then(data => {
        console.log(data.message);
        alert("Trening zapisany!");
        displayTrainingData(trainingData);
    })
    .catch(err => {
        console.error("Błąd zapisu:", err);
        alert("Błąd zapisu treningu.");
    });
});



// Funkcja do wyświetlania zapisanych treningów
function displayTrainingData(trainingData) {
    const recordsContainer = document.getElementById("training-records");
    const recordDiv = document.createElement("div");
    recordDiv.classList.add("record");

    recordDiv.innerHTML = `
        <p><strong>Zawodnik:</strong> ${trainingData.athlete}</p>
        <p><strong>Data treningu:</strong> ${trainingData.date}</p>
        <p><strong>Typ treningu:</strong> ${trainingData.trainingType}</p>
        ${trainingData.trainingType === 'imitacja' && trainingData.imitacjaType ? `<p><strong>Rodzaj imitacji:</strong> ${trainingData.imitacjaType}</p>` : ''}
        ${trainingData.trainingType === 'bieg' && trainingData.trainingRange ? `<p><strong>Rodzaj biegu:</strong> ${trainingData.trainingRange}</p>` : ''}
        ${trainingData.trainingType === 'bieg' && trainingData.biegType ? `<p><strong>Rodzaj biegu:</strong> ${trainingData.biegType}</p>` : ''}
        ${trainingData.trainingType === 'nartorolki' && trainingData.nartorolkiType ? `<p><strong>Rodzaj nartorolek:</strong> ${trainingData.nartorolkiType}</p>` : ''}
        <p><strong>Dystans:</strong> ${trainingData.distance} km</p>
        <p><strong>Czas trwania:</strong> ${trainingData.duration} min</p>
        ${trainingData.averageHeartRate ? `<p><strong>Średnie tętno:</strong> ${trainingData.averageHeartRate} bpm</p>` : ''}
        <p><strong>Notatka:</strong> ${trainingData.notes || "Brak notatki"}</p>
        <hr>
    `;

    recordsContainer.appendChild(recordDiv);
}

// Funkcja do filtrowania treningów na podstawie wybranego zawodnika
document.getElementById("filter-athlete").addEventListener("change", function() {
    const selectedAthlete = this.value;
    const filteredRecords = selectedAthlete === "all" ? trainingRecords : trainingRecords.filter(record => record.athlete === selectedAthlete);

    // Oczyść poprzednie zapisy
    document.getElementById("training-records").innerHTML = '';

    // Wyświetl przefiltrowane dane
    filteredRecords.forEach(record => displayTrainingData(record));
});