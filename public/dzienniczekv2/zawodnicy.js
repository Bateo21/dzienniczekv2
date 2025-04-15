window.addEventListener('DOMContentLoaded', () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
        window.location.href = '/dzienniczekv2/dzienniczek.html';  // Jeśli brak tokenu, przekierowujemy
        return;
    }

    const decoded = jwt_decode(token);
    const clubId = decoded.clubId;  // Pobieramy clubId z tokenu

    // Ustawiamy nazwę klubu w <h2>
    const clubName = clubId === 1 ? "Dynamit 1985" : clubId === 2 ? "Power Team" : "Nieznany klub";
    document.getElementById('club-name').textContent = clubName;

    // Pobranie listy zawodników z serwera na podstawie clubId
    fetch(`/api/athletes?clubId=${clubId}`)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('table tbody');
            tableBody.innerHTML = '';  // Czyścimy istniejące dane w tabeli

            // Dodaj zawodników do tabeli
            data.forEach(athlete => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${athlete.name}</td>
                    <td>1998</td> <!-- Zmienna '1998' to przykład - możesz dodać rok urodzenia -->
                    <td>
                        ${generateCheckboxes(athlete.id)}  <!-- Generowanie 12 checkboxów -->
                    </td>
                `;
                tableBody.appendChild(row);
            });

            // Załaduj stan checkboxów z serwera
            loadCheckboxState();
        })
        .catch(error => {
            console.error('Błąd pobierania zawodników:', error);
        });
});

// Funkcja generująca 12 checkboxów dla danego zawodnika
function generateCheckboxes(athleteId) {
    let checkboxesHTML = '';
    for (let i = 1; i <= 12; i++) {
        checkboxesHTML += `
            <label class="checkbox">
                <input type="checkbox" id="check-${athleteId}-${i}" onclick="toggleCheckbox(this, ${athleteId}, ${i})">
                <span class="checkmark"></span>
            </label>
        `;
    }
    return checkboxesHTML;
}

// Funkcja do zmiany stanu checkboxa i zapisywania go na serwerze
function toggleCheckbox(checkbox, athleteId, checkboxId) {
    const checkboxState = {
        [`${athleteId}-${checkboxId}`]: checkbox.checked  // athleteId oraz checkboxId jako klucz
    };

    console.log('Przesyłane dane do zapisu:', checkboxState);  // Logujemy dane przed wysłaniem

    // Wysyłamy dane do serwera (zwracamy stan checkboxa w JSON)
    fetch('/api/checkboxState', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(checkboxState)  // Upewniamy się, że dane są w formacie JSON
    })
    .then(response => response.json())
    .then(data => {
        console.log('Odpowiedź serwera:', data);  // Logujemy odpowiedź serwera
    })
    .catch(error => {
        console.error('Błąd zapisywania stanu checkboxów:', error);
    });

    // Zmiana tła checkboxa (zielony dla zaznaczonego, czerwony dla niezaznaczonego)
    if (checkbox.checked) {
        checkbox.nextElementSibling.style.backgroundColor = 'green';
    } else {
        checkbox.nextElementSibling.style.backgroundColor = 'red';
    }
}

// Funkcja do załadowania stanu checkboxów z serwera
function loadCheckboxState() {
    fetch('/api/checkboxState')
        .then(response => response.json())
        .then(data => {
            for (const [key, checked] of Object.entries(data)) {
                const [athleteId, checkboxId] = key.split('-');  // Oddzielamy athleteId i checkboxId
                const checkbox = document.getElementById(`check-${athleteId}-${checkboxId}`);
                if (checkbox) {
                    checkbox.checked = checked;
                    checkbox.nextElementSibling.style.backgroundColor = checked ? 'green' : 'red';
                }
            }
        })
        .catch(error => {
            console.error('Błąd ładowania stanu checkboxów:', error);
        });
}

    // Zmiana tła checkboxa (zielony dla zaznaczonego, czerwony dla niezaznaczonego)
    if (checkbox.checked) {
        checkbox.nextElementSibling.style.backgroundColor = 'green';
    } else {
        checkbox.nextElementSibling.style.backgroundColor = 'red';
    }
