let allLoadedPokemon = [];
let allPokemonUrl = [];
let pokemonData = [];
let startPokemon = 0;
let lastPokemon = 20;
let isLoading = false;
let filteredPokemon = [];


async function init() {
    let url = `https://pokeapi.co/api/v2/pokemon/?offset=${startPokemon}&limit=${lastPokemon}`;
    let response = await fetch(url);
    let loadedPokemon = await response.json();
    allLoadedPokemon = loadedPokemon['results'];
    pushAllPokemonUrl();
}


function pushAllPokemonUrl() {
    allPokemonUrl = [];
    for (let i = 0; i < allLoadedPokemon.length; i++) {
        allPokemonUrl.push(allLoadedPokemon[i]['url']);
    }
    loadAndPushPokemonData();
}


async function loadAndPushPokemonData() {
    pokemonData = [];
    for (let i = 0; i < allPokemonUrl.length; i++) {
        let url = allPokemonUrl[i];
        let response = await fetch(url);
        let loadedPokemonData = await response.json();

        pokemonData.push(loadedPokemonData);
    }
    renderPokemonCards();
}


function renderPokemonCards() {
    document.getElementById('pokemonList').innerHTML = '';
    for (let i = 0; i < pokemonData.length; i++) {
        let name = pokemonData[i]['name'];
        let id = pokemonData[i]['id'].toString().padStart(4, '0');
        let img = pokemonData[i]['sprites'];

        document.getElementById('pokemonList').innerHTML += templateRenderPokemonCards(i, name, id, img);
    }
    renderPokemonTypes();
}


function renderPokemonTypes() {
    for (let i = 0; i < pokemonData.length; i++) {
        for (let t = 0; t < pokemonData[i]['types'].length; t++) {
            let type = pokemonData[i]['types'][t]['type']['name'];
            document.getElementById(`types${i}`).innerHTML += /*html*/ `
                <div class="typesContainer">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
            `;
        }
    }
}


function openPopUp(i) {
    document.getElementById('popUpCardContainer').classList.remove('d-none');
    document.getElementById('popUpCardContainer').classList.add('popUpCardContainer');
    document.getElementById('popUpCardContainer').innerHTML = templateOpenPopUp(i);
    if (i == 0) {
        document.getElementById('backIcon').style.visibility = 'hidden';
    }
    renderTypesForPopUp(i);
}


function renderTypesForPopUp(i) {
    for (let j = 0; j < pokemonData[i]['types'].length; j++) {
        let type = pokemonData[i]['types'][j]['type']['name'];
        document.getElementById(`typesPopUp${i}`).innerHTML += /*html*/ `
            <div class="typesPopUp">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
        `;
    }
    showAbout(i);
}


function showAbout(i) {
    let baseXP = pokemonData[i]['base_experience'];
    let height = pokemonData[i]['height'] * 10;
    let weight = pokemonData[i]['weight'] / 10;
    weight = weight.toString().replace(".", ",");

    document.getElementById('showInfos').innerHTML = templateShowAbout(baseXP, height, weight);

    renderAbilities(i);
}


function renderAbilities(i) {
    for (let a = 0; a < pokemonData[i]['abilities'].length; a++) {
        let ability = pokemonData[i]['abilities'][a]['ability']['name'];
        ability = ability.charAt(0).toUpperCase() + ability.slice(1);

        document.getElementById('abilities').innerHTML += /*html*/ `
            <span>${ability}</span>
        `;
    }
}


function showStats(i) {
    document.getElementById('showInfos').innerHTML = /*html*/ `
        <div class="chartContainer">
            <canvas id="myChart"></canvas>
        </div>
    `;

    const ctx = document.getElementById('myChart');
    let data = [];
    for (let s = 0; s < pokemonData[i]['stats'].length; s++) {
        let baseStat = pokemonData[i]['stats'][s]['base_stat'];
        data.push(baseStat);
    };

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['HP', 'Attack', 'Defense', 'Spacial-Attack', 'Special-Defense', 'Speed'],
            datasets: [{
                label: pokemonData[i]['name'].charAt(0).toUpperCase() + pokemonData[i]['name'].slice(1),
                data: data,
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}


function showMoves(i) {
    document.getElementById('showInfos').innerHTML = /*html*/ `
        <div class="movesContainer" id="movesContainer"></div>
    `;

    for (let m = 0; m < pokemonData[i]['moves'].length; m++) {
        let move = pokemonData[i]['moves'][m]['move']['name'];
        document.getElementById('movesContainer').innerHTML += /*html*/ `
            <span>${move.charAt(0).toUpperCase() + move.slice(1)}</span>
        `;
    }
}


function back(i) {
    if (i > 0) {
        openPopUp(i - 1);
    }
}


function next(i) {
    if (i < pokemonData.length - 1) {
        openPopUp(i + 1);
    }
}


function doNotClose(event) {
    event.stopPropagation();
}


function closePopUp() {
    document.getElementById('popUpCardContainer').classList.remove('popUpCardContainer');
    document.getElementById('popUpCardContainer').classList.add('d-none');
}


window.onscroll = function () {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        renderMorePokemonCards();
        document.getElementById('loadingSymbol').classList.remove('d-none');
    }
}


async function renderMorePokemonCards() {
    if (!isLoading) {
        isLoading = true;
        startPokemon += 20;
        lastPokemon = 20;
        let url = `https://pokeapi.co/api/v2/pokemon/?offset=${startPokemon}&limit=${lastPokemon}`;
        let response = await fetch(url);
        let moreLoadedPokemon = await response.json();

        allLoadedPokemon = allLoadedPokemon.concat(moreLoadedPokemon['results'])

        pushAllPokemonUrl();

        setTimeout(() => {
            isLoading = false;
            document.getElementById('loadingSymbol').classList.add('d-none');
        }, 3000)
    }
}


function filterPokemons() {
    filteredPokemon = [];
    let search = document.getElementById('search').value;
    search = search.toLowerCase();
    console.log(search);

    document.getElementById('pokemonList').innerHTML = '';

    for (let i = 0; i < pokemonData.length; i++) {
        if (pokemonData[i]['name'].toLowerCase().includes(search)) {
            filteredPokemon.push(pokemonData[i]);
        }
    }
    renderFilteredPokemons();
}


function renderFilteredPokemons() {
    for (let f = 0; f < filteredPokemon.length; f++) {
        let name = filteredPokemon[f]['name'];
        let id = filteredPokemon[f]['id'].toString().padStart(4, '0');
        let img = filteredPokemon[f]['sprites'];
        
        document.getElementById('pokemonList').innerHTML += templateRenderPokemonCards(f, name, id, img);
    }
    renderTypesForFilter();
}


function renderTypesForFilter() {
    for (let i = 0; i < filteredPokemon.length; i++) {
        for (let t = 0; t < filteredPokemon[i]['types'].length; t++) {
            let type = filteredPokemon[i]['types'][t]['type']['name'];
            document.getElementById(`types${i}`).innerHTML += /*html*/ `
                <div class="typesContainer">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
            `;
        }
    }
}


//Templates

function templateRenderPokemonCards(i, name, id, img) {
    return /*html*/ `
        <div class="pokemonCard" id="pokemonCard${i}" onclick="openPopUp(${i})">
            <div class="pokemonCardNameAndNumber">
                <h2>${name}</h2>
                <span>#${id}</span>
            </div>

            <div class="pokemonCardTypesAndImg">
                <div id="types${i}" class="pokemonCardTypes"></div>
                <img src="${img['other']['official-artwork']['front_default']}">
            </div>
        </div>
    `;
}


function templateOpenPopUp(i) {
    return /*html*/ `
        <img src="img/back.png" class="back-next-icons" id="backIcon" onclick="doNotClose(event); back(${i})">

        <div class="popUpCard" onclick="doNotClose(event)">
            <div class="popUpCardTop">
                <div class="pokemonCardNameAndNumber">
                    <h1>${pokemonData[i]['name']}</h1>
                    <h2>#${pokemonData[i]['id'].toString().padStart(4, '0')}</h2>
                </div>

                <div class="pokemonCardTypesAndImgPopUp">
                    <div id="typesPopUp${i}" class="typesPopUpContainer"></div>
                    <img src="${pokemonData[i]['sprites']['other']['official-artwork']['front_default']}">
                </div>
            </div>

            <div class="popUpCardBottom">
                <nav class="navbar">
                    <p onclick="showAbout(${i})">About</p>
                    <p onclick="showStats(${i})">Stats</p>
                    <p onclick="showMoves(${i})">Moves</p>
                </nav>

                <div class="showInfos" id="showInfos">
                
                </div>
            </div>
        </div>

        <img src="img/next.png" class="back-next-icons" id="nextIcon" onclick="doNotClose(event); next(${i})">
    `;
}


function templateShowAbout(baseXP, height, weight) {
    return /*html*/ `
        <table class="tableAbout">
            <tbody>
                <tr>
                    <td>Base Experience:</td>
                    <td class="tdAbout">${baseXP}</td>
                </tr>

                <tr>
                    <td>Height:</td>
                    <td class="tdAbout">${height} cm</td>
                </tr>

                <tr>
                    <td>Weight:</td>
                    <td class="tdAbout">${weight} kg</td>
                </tr>

                <tr>
                    <td>Abilities:</td>
                    <td class="abilities" id="abilities"></td>
                </tr>
            </tbody>
        </table>
    `;
}