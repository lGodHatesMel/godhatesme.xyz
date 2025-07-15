document.addEventListener('DOMContentLoaded', () => {
    const pokemonSearch = document.getElementById('pokemon-search');
    const abilityFilter = document.getElementById('ability-filter');
    const natureFilter = document.getElementById('nature-filter');
    const hpFilter = document.getElementById('hp-filter');
    const attackFilter = document.getElementById('attack-filter');
    const defenseFilter = document.getElementById('defense-filter');
    const spAttackFilter = document.getElementById('sp-attack-filter');
    const spDefenseFilter = document.getElementById('sp-defense-filter');
    const speedFilter = document.getElementById('speed-filter');
    const teraFilter = document.getElementById('tera-filter');
    const markFilter = document.getElementById('mark-filter');
    const tableBody = document.querySelector('.raid-list tbody');
    const scarletButton = document.querySelector('.scarlet');
    const violetButton = document.querySelector('.violet');
    const starButtons = document.querySelectorAll('.star-button[data-stars]');
    const resetFiltersButton = document.getElementById('reset-filters');
    const customTooltip = document.getElementById('custom-tooltip');

    let raidData = []; // To store the original raid data
    let pressTimer;
    let selectedStars = 'Any';
    let currentPage = 1;
    const rowsPerPage = 50; // Display 50 rows per page
    let filteredRaidData = []; // To store the currently filtered data

    // Initialize the Web Worker outside the function to avoid creating multiple workers
    const dataWorker = new Worker(`data-parser.js?v=${new Date().getTime()}`);

    dataWorker.onmessage = (event) => {
        raidData = event.data.raidData;
        console.log(`Finished loading data. Total raidData length: ${raidData.length}`);
        filteredRaidData = [...raidData]; // Initialize filtered data with all raid data
        populateTable(filteredRaidData); // Populate table with the first page of all data
    };

    dataWorker.onerror = (error) => {
        console.error('Worker error:', error);
    };

    // Debounce function to limit frequent function calls
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Pagination controls
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');

    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                populateTable(filteredRaidData);
            }
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredRaidData.length / rowsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                populateTable(filteredRaidData);
            }
        });
    }

    // --- Searchable Dropdown Logic ---
    function setupSearchableDropdown(inputId, dropdownId, dataUrl, isStatFilter = false) {
        const input = document.getElementById(inputId);
        const dropdown = document.getElementById(dropdownId);
        let dataList = [];

        if (isStatFilter) {
            for (let i = 0; i <= 31; i++) {
                dataList.push(i.toString());
            }
            populateDropdown(dataList); // Populate initially for stat filters
        } else {
            fetch(dataUrl)
                .then(response => response.text())
                .then(data => {
                    dataList = data.split('\n').map(item => item.trim()).filter(item => item);
                    populateDropdown(dataList); // Populate initially for text filters
                });
        }

        function populateDropdown(items, query = '') {
            dropdown.innerHTML = '';
            const itemsToShow = (query ? items.filter(item => item.toLowerCase().includes(query.toLowerCase())) : items);
            itemsToShow.forEach(item => {
                const a = document.createElement('a');
                a.href = '#';
                a.textContent = item;
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    input.value = item;
                    dropdown.classList.remove('show');
                    currentPage = 1; // Reset to first page on filter change
                    filterRaids();
                });
                dropdown.appendChild(a);
            });
        }

        input.addEventListener('input', debounce(() => {
            const query = input.value.toLowerCase();
            const filteredItems = dataList.filter(item => item.toLowerCase().includes(query));
            populateDropdown(filteredItems, query);
            dropdown.classList.add('show');
            currentPage = 1; // Reset to first page on filter change
            filterRaids();
        }, 300));

        input.addEventListener('click', () => {
            populateDropdown(dataList);
            dropdown.classList.add('show');
        });

        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && e.target !== input) {
                dropdown.classList.remove('show');
            }
        });
    }

    setupSearchableDropdown('pokemon-search', 'pokemon-dropdown', 'data/species.txt');
    setupSearchableDropdown('ability-filter', 'ability-dropdown', 'data/abilities.txt');
    setupSearchableDropdown('nature-filter', 'nature-dropdown', 'data/natures.txt');
    setupSearchableDropdown('hp-filter', 'hp-dropdown', null, true);
    setupSearchableDropdown('attack-filter', 'attack-dropdown', null, true);
    setupSearchableDropdown('defense-filter', 'defense-dropdown', null, true);
    setupSearchableDropdown('sp-attack-filter', 'sp-attack-dropdown', null, true);
    setupSearchableDropdown('sp-defense-filter', 'sp-defense-dropdown', null, true);
    setupSearchableDropdown('speed-filter', 'speed-dropdown', null, true);
    // --- End Searchable Dropdown Logic ---

    // Populate Tera Type Filter
    const teraTypes = ['Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy', 'Stellar'];
    teraFilter.appendChild(new Option('Any Tera', 'All'));
    teraTypes.forEach(type => {
        teraFilter.appendChild(new Option(type, type));
    });

    const scarletFiles = ['ID1.txt', 'ID2.txt', 'ID3.txt', 'ID4.txt', 'ID5.txt', 'ID6.txt', 'P1.txt', 'P2.txt', 'P3.txt', 'P4.txt', 'P5.txt', 'P6.txt', 'P7.txt', 'P8.txt', 'PI.txt', 'TM1.txt', 'TM2.txt', 'TM3.txt', 'TM4.txt', 'TM5.txt', 'TM6.txt'];
    const violetFiles = ['ID1.txt', 'ID2.txt', 'ID3.txt', 'ID4.txt', 'ID5.txt', 'ID6.txt', 'IDI.txt', 'P1.txt', 'P2.txt', 'P3.txt', 'P4.txt', 'P5.txt', 'P6.txt', 'P7.txt', 'P8.txt', 'PI.txt', 'TM1.txt', 'TM2.txt', 'TM3.txt', 'TM4.txt', 'TM5.txt', 'TM6.txt'];

    async function loadRaidData(version) {
        raidData = []; // Clear existing data
        console.log(`Loading raid data for ${version} using Web Worker...`);
        // Send message to worker to start loading data
        dataWorker.postMessage({ version, scarletFiles, violetFiles });
    }

    scarletButton.addEventListener('click', () => {
        scarletButton.classList.add('active');
        violetButton.classList.remove('active');
        currentPage = 1; // Reset to first page on version change
        loadRaidData('Scarlet');
    });

    violetButton.addEventListener('click', () => {
        violetButton.classList.add('active');
        scarletButton.classList.remove('active');
        currentPage = 1; // Reset to first page on version change
        loadRaidData('Violet');
    });

    starButtons.forEach(button => {
        button.addEventListener('click', () => {
            starButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            selectedStars = button.dataset.stars;
            currentPage = 1; // Reset to first page on filter change
            filterRaids();
        });
    });

    resetFiltersButton.addEventListener('click', () => {
        pokemonSearch.value = '';
        abilityFilter.value = '';
        natureFilter.value = '';
        hpFilter.value = '';
        attackFilter.value = '';
        defenseFilter.value = '';
        spAttackFilter.value = '';
        spDefenseFilter.value = '';
        speedFilter.value = '';
        teraFilter.value = 'All';
        markFilter.value = 'Any';

        starButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector('.star-button[data-stars="Any"]').classList.add('active');
        selectedStars = 'Any';

        currentPage = 1; // Reset to first page on filter change
        filterRaids();
    });

    function populateTable(dataToDisplay) {
        tableBody.innerHTML = '';
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        const paginatedData = dataToDisplay.slice(startIndex, endIndex);
        console.log(`populateTable: Displaying ${paginatedData.length} rows.`);

        paginatedData.forEach(raid => {
            const row = document.createElement('tr');
            row.title = 'Click to copy ID'; // Native tooltip for mobile long-press & accessibility
            // Store the ID on the row itself for easy access
            row.dataset.id = raid.ID || '';
            row.innerHTML = `
                <td data-label="ID">${raid.ID || ''}</td>
                <td data-label="Pokemon">${raid.Pokemon || ''}</td>
                <td data-label="Ability">${raid.Ability || ''}</td>
                <td data-label="Nature">${raid.Nature || ''}</td>
                <td data-label="HP">${raid.HP || ''}</td>
                <td data-label="ATK">${raid.ATK || ''}</td>
                <td data-label="DEF">${raid.DEF || ''}</td>
                <td data-label="SPA">${raid.SPA || ''}</td>
                <td data-label="SPD">${raid.SPD || ''}</td>
                <td data-label="SPE">${raid.SPE || ''}</td>
                <td data-label="Gender">${raid.Gender || ''}</td>
                <td data-label="Tera Type">${raid.TeraType || ''}</td>
                <td data-label="Mark">${raid.Mark || 'None'}</td>
            `;

            // Add a single click listener to the entire row
            row.addEventListener('click', () => {
                const idToCopy = row.dataset.id;
                if (idToCopy) {
                    copyToClipboard(idToCopy);
                    showToast(`Copied ${idToCopy} to clipboard`);
                }
            });

            // Custom tooltip for desktop hover
            row.addEventListener('mouseover', (e) => {
                if (customTooltip) {
                    customTooltip.textContent = 'Click to copy ID';
                    // Use clientX/Y for fixed positioning
                    customTooltip.style.left = `${e.clientX + 15}px`;
                    customTooltip.style.top = `${e.clientY + 15}px`;
                    customTooltip.style.display = 'block';
                    setTimeout(() => { customTooltip.style.opacity = '1'; }, 10); // Fade in
                }
            });
            row.addEventListener('mouseout', () => {
                if (customTooltip) {
                    customTooltip.style.opacity = '0';
                    // Hide element after the fade-out transition
                    setTimeout(() => { customTooltip.style.display = 'none'; }, 200);
                }
            });

            tableBody.appendChild(row);
        });

        const totalPages = Math.ceil(dataToDisplay.length / rowsPerPage);
        if (pageInfo) {
            pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        }
    }

    function filterRaids() {
        let filteredData = [...raidData];
        console.log(`Filtering raids. Initial data length: ${filteredData.length}`);

        const selectedPokemon = pokemonSearch.value;
        if (selectedPokemon) {
            filteredData = filteredData.filter(raid => raid.Pokemon && raid.Pokemon.toLowerCase().includes(selectedPokemon.toLowerCase()));
            console.log(`After Pokemon filter (${selectedPokemon}): ${filteredData.length}`);
        }

        const selectedAbility = abilityFilter.value;
        if (selectedAbility) {
            filteredData = filteredData.filter(raid => raid.Ability && raid.Ability.toLowerCase().includes(selectedAbility.toLowerCase()));
            console.log(`After Ability filter (${selectedAbility}): ${filteredData.length}`);
        }

        const selectedNature = natureFilter.value;
        if (selectedNature) {
            filteredData = filteredData.filter(raid => raid.Nature && raid.Nature.toLowerCase().includes(selectedNature.toLowerCase()));
            console.log(`After Nature filter (${selectedNature}): ${filteredData.length}`);
        }

        const hpQuery = hpFilter.value;
        if (hpQuery) {
            filteredData = filteredData.filter(raid => raid.HP === hpQuery);
            console.log(`After HP filter (${hpQuery}): ${filteredData.length}`);
        }

        const attackQuery = attackFilter.value;
        if (attackQuery) {
            filteredData = filteredData.filter(raid => raid.ATK === attackQuery);
            console.log(`After Attack filter (${attackQuery}): ${filteredData.length}`);
        }

        const defenseQuery = defenseFilter.value;
        if (defenseQuery) {
            filteredData = filteredData.filter(raid => raid.DEF === defenseQuery);
            console.log(`After Defense filter (${defenseQuery}): ${filteredData.length}`);
        }

        const spAttackQuery = spAttackFilter.value;
        if (spAttackQuery) {
            filteredData = filteredData.filter(raid => raid.SPA === spAttackQuery);
            console.log(`After Sp. Attack filter (${spAttackQuery}): ${filteredData.length}`);
        }

        const spDefenseQuery = spDefenseFilter.value;
        if (spDefenseQuery) {
            filteredData = filteredData.filter(raid => raid.SPD === spDefenseQuery);
            console.log(`After Sp. Defense filter (${spDefenseQuery}): ${filteredData.length}`);
        }

        const speedQuery = speedFilter.value;
        if (speedQuery) {
            filteredData = filteredData.filter(raid => raid.SPE === speedQuery);
            console.log(`After Speed filter (${speedQuery}): ${filteredData.length}`);
        }

        const selectedTera = teraFilter.value;
        if (selectedTera && selectedTera !== 'All') {
            filteredData = filteredData.filter(raid => raid.TeraType === selectedTera);
            console.log(`After Tera filter (${selectedTera}): ${filteredData.length}`);
        }

        const selectedMark = markFilter.value;
        if (selectedMark && selectedMark !== 'Any') {
            filteredData = filteredData.filter(raid => raid.Mark === selectedMark);
            console.log(`After Mark filter (${selectedMark}): ${filteredData.length}`);
        }

        // Filter by stars
        if (selectedStars === '1-2') {
            filteredData = filteredData.filter(raid => raid.Stars && (parseInt(raid.Stars) === 1 || parseInt(raid.Stars) === 2));
            console.log(`After Stars filter (1-2): ${filteredData.length}`);
        } else if (selectedStars === '3-5') {
            filteredData = filteredData.filter(raid => raid.Stars && (parseInt(raid.Stars) >= 3 && parseInt(raid.Stars) <= 5));
            console.log(`After Stars filter (3-5): ${filteredData.length}`);
        } else if (selectedStars === '6') {
            filteredData = filteredData.filter(raid => raid.Stars && parseInt(raid.Stars) === 6);
            console.log(`After Stars filter (6): ${filteredData.length}`);
        }

        console.log(`Final filtered data length: ${filteredData.length}`);
        filteredRaidData = filteredData; // Store the filtered data
        populateTable(filteredRaidData);
    }

    function copyToClipboard(text) {
        if (!text) return;
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }

    function showToast(message) {
        // Remove any existing toast
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.classList.add('show');
        }, 10); // Small delay to allow CSS transition

        // Animate out and remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500); // Wait for fade out
        }, 2000); // Toast visible for 2 seconds
    }

    // Use debounced filterRaids for input fields
    [hpFilter, attackFilter, defenseFilter, spAttackFilter, spDefenseFilter, speedFilter].forEach(el => {
        el.addEventListener('input', debounce(filterRaids, 300));
    });
    teraFilter.addEventListener('change', filterRaids);
    markFilter.addEventListener('change', filterRaids);

    // Set Scarlet as the default active button and load data
    scarletButton.click();
    document.querySelector('.star-button[data-stars="Any"]').classList.add('active');
});