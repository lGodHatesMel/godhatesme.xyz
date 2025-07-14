document.addEventListener('DOMContentLoaded', () => {
    const categoryFilter = document.getElementById('categoryFilter');
    const pokemonSearch = document.getElementById('pokemonSearch');
    const pokemonDropdown = document.getElementById('pokemonDropdown');
    const tableRows = document.querySelectorAll('table tr:not(:first-child)');

    let allPokemonNames = [];

    // Fetch species data for autocomplete
    fetch('../../Raid-List/data/species.txt')
        .then(response => response.text())
        .then(data => {
            allPokemonNames = data.split('\n').map(name => name.trim()).filter(name => name);
        })
        .catch(error => console.error('Error fetching species data:', error));

    // Function to filter and display table rows
    function filterTable() {
        const selectedCategory = categoryFilter.value;
        const searchTerm = pokemonSearch.value.toLowerCase();

        tableRows.forEach(row => {
            const categoryCell = row.querySelector('td:first-child');
            const fileNameCell = row.querySelector('td:nth-child(2)');

            const categoryMatch = selectedCategory === '' || (categoryCell && categoryCell.textContent === selectedCategory);

            let pokemonNameMatch = true;
            if (searchTerm) {
                pokemonNameMatch = false;
                if (fileNameCell) {
                    const fileName = fileNameCell.textContent.toLowerCase();
                    // Extract potential Pokemon name from variations like "Gift (Ray Yamanakas Amoonguss)"
                    const match = fileName.match(/\(([^)]+)\)/);
                    let extractedName = match ? match[1].toLowerCase() : fileName;

                    // Remove common prefixes/suffixes that are not part of the Pokemon name
                    extractedName = extractedName.replace(/^(gift|raid|egg|home)[- ]*/, '').trim();
                    extractedName = extractedName.replace(/\s*\(h\)$/, '').trim(); // Remove (H) for hidden ability

                    // Check if the extracted name or the full file name contains the search term
                    if (extractedName.includes(searchTerm) || fileName.includes(searchTerm)) {
                        pokemonNameMatch = true;
                    }
                }
            }

            if (categoryMatch && pokemonNameMatch) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    // Autocomplete logic
    pokemonSearch.addEventListener('input', () => {
        const inputVal = pokemonSearch.value.toLowerCase();
        pokemonDropdown.innerHTML = '';

        if (inputVal.length === 0) {
            pokemonDropdown.style.display = 'none';
            filterTable(); // Re-filter when search is cleared
            return;
        }

        const filteredNames = allPokemonNames.filter(name => name.toLowerCase().includes(inputVal));

        filteredNames.forEach(name => {
            const div = document.createElement('div');
            div.textContent = name;
            div.addEventListener('click', () => {
                pokemonSearch.value = name;
                pokemonDropdown.style.display = 'none';
                filterTable();
            });
            pokemonDropdown.appendChild(div);
        });

        pokemonDropdown.style.display = filteredNames.length > 0 ? 'block' : 'none';
        filterTable(); // Filter as user types
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!pokemonSearch.contains(e.target) && !pokemonDropdown.contains(e.target)) {
            pokemonDropdown.style.display = 'none';
        }
    });

    categoryFilter.addEventListener('change', filterTable);
    pokemonSearch.addEventListener('change', filterTable); // Trigger filter on blur/enter

    // Initial filter on page load
    filterTable();
});