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
    const starButtons = document.querySelectorAll('.star-button[data-stars]');
    const resetFiltersButton = document.getElementById('reset-filters');

    let raidData = []; // To store the original raid data
    let pressTimer;
    let selectedStars = 'Any';

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
                    filterRaids();
                });
                dropdown.appendChild(a);
            });
        }

        input.addEventListener('input', () => {
            const query = input.value.toLowerCase();
            const filteredItems = dataList.filter(item => item.toLowerCase().includes(query));
            populateDropdown(filteredItems, query);
            dropdown.classList.add('show');
            filterRaids();
        });

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
      raidData = [];
      const filesToLoad = version === "Scarlet" ? scarletFiles : violetFiles;
      const folderPath = `data/${version}/`;

      console.log(
        `Loading raid data for ${version} from ${filesToLoad.length} files...`
      );

      for (const file of filesToLoad) {
        try {
          const response = await fetch(`${folderPath}${file}`);
          if (!response.ok) {
            console.warn(
              `Failed to fetch ${folderPath}${file}: ${response.status} ${response.statusText}`
            );
            continue;
          }
          const data = await response.text();
          const lines = data
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line);
          if (lines.length < 2) {
            console.warn(
              `Skipping empty or malformed file: ${folderPath}${file}`
            );
            continue;
          }
          const headers = lines[0].split("\t");
          let entriesAddedFromFile = 0;
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split("\t");
            if (values.length === headers.length) {
              const raid = {};
              headers.forEach((header, index) => {
                raid[header] = values[index];
              });
              raidData.push(raid);
              entriesAddedFromFile++;
            } else {
              console.warn(
                `Skipping malformed line in ${folderPath}${file}: ${lines[i]}`
              );
            }
          }
          console.log(
            `File: ${folderPath}${file}, Total lines read: ${lines.length}, Entries added: ${entriesAddedFromFile}`
          );
        } catch (error) {
          console.error(`Error loading file: ${folderPath}${file}`, error);
        }
      }
      console.log(
        `Finished loading data for ${version}. Total raidData length: ${raidData.length}`
      );
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

    starButtons.forEach(button => {
        button.addEventListener('click', () => {
            starButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            selectedStars = button.dataset.stars;
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

        starButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector('.star-button[data-stars="Any"]').classList.add('active');
        selectedStars = 'Any';

        filterRaids();
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

    // Set Scarlet as the default active button and load data
    scarletButton.click();
    document.querySelector('.star-button[data-stars="Any"]').classList.add('active');
});