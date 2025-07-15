function populateTable(gameId) {
    const tableBody = document.getElementById('pokemon-table-body');
    if (!tableBody) {
        console.error('Table body with id "pokemon-table-body" not found.');
        return;
    }

    // Clear any existing rows
    tableBody.innerHTML = '';

    const gameData = pokemonData[gameId];
    if (!gameData) {
        console.error(`No data found for game: ${gameId}`);
        const row = tableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 3;
        cell.textContent = `No data found for game: ${gameId}`;
        cell.style.textAlign = 'center';
        return;
    }

    // A list to define the display order of categories
    const categoryOrder = ['NEW', 'RAIDS', 'EVENTS', 'DITTO', 'HOME', 'EGGS'];

    // Create a single flat list of all entries, one for each category a pokemon belongs to
    const allEntries = [];
    gameData.forEach(pokemon => {
        pokemon.categories.forEach(category => {
            allEntries.push({ ...pokemon, category });
        });
    });

    // Sort the list based on the predefined category order
    allEntries.sort((a, b) => {
        const indexA = categoryOrder.indexOf(a.category);
        const indexB = categoryOrder.indexOf(b.category);
        return indexA - indexB;
    });

    // Populate the table with the sorted data
    allEntries.forEach(item => {
        const row = tableBody.insertRow();
        row.title = 'Click to copy File Name'; // Add a native tooltip

        // Add click listener to the row to copy the file name
        row.addEventListener('click', () => {
            copyToClipboard(item.fileName);
            showToast(`Copied: ${item.fileName}`);
        });

        // Create and append cells for better security and clarity
        const categoryCell = row.insertCell();
        const fileNameCell = row.insertCell();
        const infoCell = row.insertCell();

        // Use a consistent class name for all categories and set text content
        categoryCell.className = item.category.toLowerCase();
        categoryCell.textContent = item.category;

        fileNameCell.textContent = item.fileName;
        infoCell.textContent = item.info;
    });
}