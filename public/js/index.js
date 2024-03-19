const WS_EVENTS = {
  panda_created: 1,
  panda_updated: 2,
  panda_deleted: 3
};

// Our entry point, called when the webpage loads
window.onload = () => {
  // Listen to socket events
  setupSocket();

  // Bind the left form to submit json data
  const form = document.getElementById('formPanda');
  form.addEventListener('submit', createPanda);

  // Bind delete button to do deletions
  const btnDelete = document.getElementById('btnDelete');
  btnDelete.onclick = deletePandas;

  // Populate right panel
  refreshPandasList();
};

/**
 * Setup websocket, and handle events that modify the GUI
 */
function setupSocket()
{
  const webSocket = new WebSocket(`ws://${location.hostname}:8081`);

  // Announce when socket opens
  webSocket.onopen = () => {
    console.log('WebSocket open');
  };

  // Capture any incoming socket messages, and do something with them
  webSocket.onmessage = (event) => {
    console.log('WebSocket message recieved');
    const msg = JSON.parse(event.data);
    // If panda CRUD happens, lets just bail and refresh the whole list
    if ([WS_EVENTS.panda_created, WS_EVENTS.panda_updated, WS_EVENTS.panda_deleted].includes(msg.event))
      refreshPandasList();
  };

  // Announce when socket has an error
  webSocket.onerror = (err) => {
    console.error('WebSocket error');
    console.error(err);
    webSocket.close();
  };

  // If it closes, retry opening the socket
  webSocket.onclose = (event) => {
    console.log('WebSocket closed, reopening...');
    setTimeout(setupSocket, 1000);
  };
}

/**
 * Refreshes the right panda panel with all new panda cards
 */
async function refreshPandasList() {
  // Get DOM element, reset it to Loading text
  const pandaHolder = document.getElementById('listPandas');
  pandaHolder.innerText = 'Loading...';

  // Hit the api and parse it
  const response = await fetch('/api/pandas');
  const pandas = await response.json();
  pandaHolder.innerHTML = '';

  if (pandas.length > 0)
    pandas.forEach(panda => {
      // Build a bootstrap card for each panda recieved
      const card = document.createElement('div');
      card.innerHTML = `
        <div class="row g-0">
          <div class="col-md-4 img-container">
            <img
              src="${panda.image ? 'data:image/png;base64,' + panda.image : './images/stock_panda.png'}"
              class="img-fluid rounded" alt="Cute Panda">
            ${panda.image ? '' : '<div class="spinner-grow text-primary overlay"></div>'}
          </div>
          <div class="col-md-8">
            <div class="card-body">
              <h5 class="card-title">${panda.name}</h5>
              <p class="card-text">
                <B>Biome: </B>${panda.biome}<BR>
                <B>Outfit: </B>${panda.outfit}<BR>
                <B>Favorite Food: </B>${panda.food}<BR>
                <B>Sleepiness: </B>${panda.sleepiness}<BR>
              </p>
            </div>
          </div>
        </div>`;
      card.className = 'card mb-3';
      pandaHolder.appendChild(card);
    });
  else
    pandaHolder.innerHTML = '<P><I>Currently you appear to have no pandas.</I></P>';
}

/**
 * Handle hitting the delete API, and updating the GUI
 * @param {MouseEvent} e mouse event from onclick
 */
async function deletePandas(e) {
  // Prevent default event behavior, reset error div
  e.preventDefault();
  e.stopPropagation();
  const errDiv = document.getElementById('deleteError');
  errDiv.style.opacity = 0;
  errDiv.innerText = '';

  // Hit API endpoint for deletes
  const config = {
    method: 'DELETE'
  };
  const res = await fetch('/api/pandas', config);
  const parsed = await res.json();

  // Display any error, or refresh the panda list
  if (parsed.error) {
    errDiv.style.opacity = 1;
    errDiv.innerText = parsed.error;
  }
  else
    refreshPandasList();
}


/**
 * Handle hitting the post API, and updating the GUI
 * @param {SubmitEvent} e submit event from form submit
 */
async function createPanda(e) {
  // Prevent default event behavior, reset error div
  e.preventDefault();
  e.stopPropagation();
  const errDiv = document.getElementById('createError');
  errDiv.style.opacity = 0;
  errDiv.innerText = '';

  // Gather all form data from the form
  const form = new FormData(e.target);
  const panda = {};
  for (const [key, value] of form.entries())
    panda[key] = value;


  // Hit API endpoint for creates
  const config = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(panda)
  };
  const res = await fetch('/api/pandas', config);
  const parsed = await res.json();

  // Display any error, or refresh the panda list and reset the form
  if (parsed.error) {
    errDiv.style.opacity = 1;
    errDiv.innerText = parsed.error;
  }
  else {
    e.target.reset();
    refreshPandasList();
  }
}