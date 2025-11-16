document.addEventListener('DOMContentLoaded', function() {
    const grid = document.getElementById('furniture-grid');
    const adminPassword = 'admin123'; // Hardcoded admin password

    // List of 30 furniture names
    const furnitureNames = [
        'Chair', 'Table', 'Sofa', 'Bed', 'Desk', 'Cabinet', 'Shelf', 'Lamp', 'Rug', 'Mirror',
        'Dresser', 'Nightstand', 'Bookshelf', 'Armchair', 'Ottoman', 'Coffee Table', 'Dining Table', 'Barstool', 'Wardrobe', 'Bench',
        'Side Table', 'Recliner', 'Hutch', 'Bean Bag', 'Chaise Lounge', 'Rocking Chair', 'Swivel Chair', 'Footstool', 'Console Table', 'End Table'
    ];

    let claims = {};

    // Load claims from server
    fetch('/api/claims')
        .then(response => response.json())
        .then(data => {
            claims = data;
            renderGrid();
        })
        .catch(error => console.error('Error loading claims:', error));

    function renderGrid() {
        grid.innerHTML = '';
        // Create 30 furniture items
        for (let i = 1; i <= 30; i++) {
            const item = document.createElement('div');
            item.className = 'furniture-item';
            item.id = `furniture-${i}`;
            item.textContent = furnitureNames[i - 1];
            if (claims[i]) {
                item.textContent += ` - Claimed by ${claims[i]}`;
                item.classList.add('claimed');
            }
            item.addEventListener('click', () => handleClick(i));
            grid.appendChild(item);
        }
    }

    function handleClick(id) {
        if (claims[id]) {
            // Already claimed, ask for admin password to unclaim
            const password = prompt('Enter admin password to unclaim:');
            if (password === adminPassword) {
                fetch(`/api/unclaim/${id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        delete claims[id];
                        updateItem(id);
                    } else {
                        alert('Error unclaiming: ' + data.error);
                    }
                })
                .catch(error => console.error('Error unclaiming:', error));
            } else {
                alert('Incorrect password.');
            }
        } else {
            // Not claimed, prompt for username
            const username = prompt('Enter your username to claim this furniture:');
            if (username && username.trim() !== '') {
                fetch(`/api/claim/${id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: username.trim() })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        claims[id] = username.trim();
                        updateItem(id);
                    } else {
                        alert('Error claiming: ' + data.error);
                    }
                })
                .catch(error => console.error('Error claiming:', error));
            }
        }
    }

    function updateItem(id) {
        const item = document.getElementById(`furniture-${id}`);
        if (claims[id]) {
            item.textContent = `${furnitureNames[id - 1]} - Claimed by ${claims[id]}`;
            item.classList.add('claimed');
        } else {
            item.textContent = furnitureNames[id - 1];
            item.classList.remove('claimed');
        }
    }
});
