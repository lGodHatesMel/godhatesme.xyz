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
    const tableBody = document.querySelector('.raid-list tbody');
    const scarletButton = document.querySelector('.scarlet');
    const violetButton = document.querySelector('.violet');

    let raidData = []; // To store the original raid data
    let pressTimer;

    // --- Searchable Dropdown Logic ---
    function setupSearchableDropdown(inputId, dropdownId, dataUrl) {
        const input = document.getElementById(inputId);
        const dropdown = document.getElementById(dropdownId);
        let dataList = [];

        fetch(dataUrl)
            .then(response => response.text())
            .then(data => {
                dataList = data.split('\n').map(item => item.trim()).filter(item => item);

                input.addEventListener('input', () => {
                    const query = input.value.toLowerCase();
                    const filteredItems = dataList.filter(item => item.toLowerCase().includes(query));
                    populateDropdown(filteredItems, query);
                    dropdown.classList.add('show');
                    filterRaids(); // Trigger filter on input change
                });

                input.addEventListener('click', () => {
                    populateDropdown(dataList);
                    dropdown.classList.add('show');
                });
            });

        function populateDropdown(items, query = '') {
            dropdown.innerHTML = '';
            const itemsToShow = (query ? items : items.slice(0, 10));
            itemsToShow.forEach(item => {
                const a = document.createElement('a');
                a.href = '#';
                a.textContent = item;
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    input.value = item;
                    dropdown.classList.remove('show');
                    filterRaids();
                });
                dropdown.appendChild(a);
            });
        }

        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && e.target !== input) {
                dropdown.classList.remove('show');
            }
        });
    }

    setupSearchableDropdown('pokemon-search', 'pokemon-dropdown', 'data/species.txt');
    setupSearchableDropdown('ability-filter', 'ability-dropdown', 'data/abilities.txt');
    setupSearchableDropdown('nature-filter', 'nature-dropdown', 'data/natures.txt');
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
        raidData = [];
        const filesToLoad = version === 'Scarlet' ? scarletFiles : violetFiles;
        const folderPath = `data/${version}/`;

        for (const file of filesToLoad) {
            try {
                const response = await fetch(`${folderPath}${file}`);
                if (!response.ok) continue;
                const data = await response.text();
                const lines = data.split(/\r?\n/).map(line => line.trim()).filter(line => line);
                if (lines.length < 2) continue;

                const headers = lines[0].split('\t');
                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split('\t');
                    if (values.length === headers.length) {
                        const raid = {};
                        headers.forEach((header, index) => {
                            raid[header] = values[index];
                        });
                        raidData.push(raid);
                    }
                }
            } catch (error) {
                console.error(`Error loading file: ${folderPath}${file}`, error);
            }
        }
        populateTable(raidData);
        filterRaids(); // Apply initial filters
    }

    scarletButton.addEventListener('click', () => {
        scarletButton.classList.add('active');
        violetButton.classList.remove('active');
        loadRaidData('Scarlet');
    });

    violetButton.addEventListener('click', () => {
        violetButton.classList.add('active');
        scarletButton.classList.remove('active');
        loadRaidData('Violet');
    });

    function populateTable(data) {
        tableBody.innerHTML = '';
        data.forEach(raid => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${raid.ID || ''}</td>
                <td>${raid.Pokemon || ''}</td>
                <td>${raid.Ability || ''}</td>
                <td>${raid.Nature || ''}</td>
                <td>${raid.HP || ''}</td>
                <td>${raid.ATK || ''}</td>
                <td>${raid.DEF || ''}</td>
                <td>${raid.SPA || ''}</td>
                <td>${raid.SPD || ''}</td>
                <td>${raid.SPE || ''}</td>
                <td>${raid.Gender || ''}</td>
                <td>${raid.TeraType || ''}</td>
            `;

            row.addEventListener('mousedown', () => {
                pressTimer = window.setTimeout(() => {
                    copyToClipboard(raid.ID);
                    alert(`Copied ${raid.ID} to clipboard`);
                }, 1000);
            });

            row.addEventListener('mouseup', () => {
                clearTimeout(pressTimer);
            });

            tableBody.appendChild(row);
        });
    }

    function filterRaids() {
        let filteredData = [...raidData];

        const selectedPokemon = pokemonSearch.value;
        if (selectedPokemon) {
            filteredData = filteredData.filter(raid => raid.Pokemon && raid.Pokemon.toLowerCase().includes(selectedPokemon.toLowerCase()));
        }

        const selectedAbility = abilityFilter.value;
        if (selectedAbility) {
            filteredData = filteredData.filter(raid => raid.Ability && raid.Ability.toLowerCase().includes(selectedAbility.toLowerCase()));
        }

        const selectedNature = natureFilter.value;
        if (selectedNature) {
            filteredData = filteredData.filter(raid => raid.Nature && raid.Nature.toLowerCase().includes(selectedNature.toLowerCase()));
        }

        const hpQuery = hpFilter.value;
        if (hpQuery) {
            filteredData = filteredData.filter(raid => raid.HP === hpQuery);
        }

        const attackQuery = attackFilter.value;
        if (attackQuery) {
            filteredData = filteredData.filter(raid => raid.ATK === attackQuery);
        }

        const defenseQuery = defenseFilter.value;
        if (defenseQuery) {
            filteredData = filteredData.filter(raid => raid.DEF === defenseQuery);
        }

        const spAttackQuery = spAttackFilter.value;
        if (spAttackQuery) {
            filteredData = filteredData.filter(raid => raid.SPA === spAttackQuery);
        }

        const spDefenseQuery = spDefenseFilter.value;
        if (spDefenseQuery) {
            filteredData = filteredData.filter(raid => raid.SPD === spDefenseQuery);
        }

        const speedQuery = speedFilter.value;
        if (speedQuery) {
            filteredData = filteredData.filter(raid => raid.SPE === speedQuery);
        }

        const selectedTera = teraFilter.value;
        if (selectedTera && selectedTera !== 'All') {
            filteredData = filteredData.filter(raid => raid.TeraType === selectedTera);
        }

        populateTable(filteredData);
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

    [hpFilter, attackFilter, defenseFilter, spAttackFilter, spDefenseFilter, speedFilter].forEach(el => {
        el.addEventListener('input', filterRaids);
    });
    teraFilter.addEventListener('change', filterRaids);

    // Set Scarlet as the default active button
    scarletButton.click();
});