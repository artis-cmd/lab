
function initClient() {
    gapi.client.init({
        apiKey: 'AIzaSyC6oq96wZFvcQ5oW0iiIBusSMw8DEEktOs',
        clientId: '637353525540-h6fp54dnb8o54c4j3kacfro8ki02ddge.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/spreadsheets',
    }).then(() => {
        console.log('GAPI client initialized.');
    });
}

function loadGapi() {
    gapi.load('client:auth2', initClient);
}

document.addEventListener('DOMContentLoaded', () => {
    loadGapi();
    // 기존 코드...
});

function addToGoogleSheets(item) {
    const params = {
        spreadsheetId: '1g8D1tkda-8GsB5LP2p-YoaoQ3hQYUsY9Vz8EfR4UGnY',
        range: 'Sheet1!A1', // 원하는 범위로 변경
        valueInputOption: 'RAW',
    };

    const valueRangeBody = {
        "majorDimension": "ROWS",
        "values": [
            [item]
        ]
    };

    gapi.client.sheets.spreadsheets.values.append(params, valueRangeBody)
        .then(response => {
            console.log('Data added to Google Sheets:', response);
        })
        .catch(error => {
            console.error('Error adding data to Google Sheets:', error);
        });
}

function addItemToList(item, listId) {
    console.log('addItemToList called for', item);
    const list = document.getElementById(listId);
    const listItem = document.createElement('li');
    listItem.textContent = item;

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.style.marginLeft = '10px';
    editButton.onclick = () => {
        const newValue = prompt('Edit item:', item);
        if (newValue) {
            listItem.textContent = newValue;
            listItem.appendChild(editButton);
            listItem.appendChild(checkButton);
        }
    };

    const checkButton = document.createElement('button');
    checkButton.textContent = 'Check';
    checkButton.style.marginLeft = '5px';
    checkButton.onclick = () => alert('Check ' + item);

    listItem.appendChild(editButton);
    listItem.appendChild(checkButton);
    list.appendChild(listItem);

    // Google Sheets API 호출
    addToGoogleSheets(item);
}

document.addEventListener('DOMContentLoaded', () => {
    const form1 = document.getElementById('form1');
    const form2 = document.getElementById('form2');
    const form3 = document.getElementById('form3');

    form1.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('input1');
        const item = input.value;
        addItemToList(item, 'items-list1');
        input.value = '';
        console.log('Form 1 submitted');
    });

    form2.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('input2');
        const item = input.value;
        addItemToList(item, 'items-list2');
        input.value = '';
        console.log('Form 2 submitted');
    });

    form3.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('input3');
        const item = input.value;
        addItemToList(item, 'items-list3');
        input.value = '';
        console.log('Form 3 submitted');
    });
}); 