let pokemonNames = [];
let pokemonUrl = [];
let renderedPokemonCount = 0;
const blockLength = 50;

async function init() {
    let url = 'https://pokeapi.co/api/v2/pokemon?offset=0&limit=100000';
    let response = await fetch(url);
    let allPokemons = await response.json();
    console.log('Loaded Pokemon:', allPokemons);

    allPokemons.results.forEach(pokemon => {
        pokemonNames.push(pokemon.name);
        pokemonUrl.push(pokemon.url);
    });

    renderPokemonCards();
}

function renderPokemonCards() {
    let pokemonList = document.getElementById('pokemonList');

    // rendern des nächsten Blocks von 50 Elementen
    for (let i = renderedPokemonCount; i < renderedPokemonCount + blockLength && i < pokemonNames.length; i++) {
        pokemonList.innerHTML += /*html*/ `
      <div class="pokemonCard" id="pokemonCard${i}">
          <h2>${pokemonNames[i]}</h2>
          <p>${[i + 1]}#</p>
      </div>
    `;
    }

    renderedPokemonCount += blockLength;

    // Überwachung des Scrollens des Fensters
    window.addEventListener('scroll', () => {
        if (window.scrollY + window.innerHeight >= document.body.scrollHeight) {
            // das Ende des Fensters ist erreicht
            renderPokemonCards();
        }
    });
}