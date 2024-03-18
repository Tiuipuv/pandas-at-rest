window.onload = async () => {
  const form = document.getElementById('formPanda');
  form.addEventListener('submit', createPanda);

  const btnDelete = document.getElementById('btnDelete');
  btnDelete.onclick = deletePandas;
  refreshPandasList();
};

async function refreshPandasList() {
  const pandaHolder = document.getElementById('listPandas');
  pandaHolder.innerText = 'Loading...';

  const response = await fetch('/api/pandas');
  const pandas = await response.json();
  pandaHolder.innerHTML = '';

  const def_img = 'https://img.freepik.com/free-vector/cute-panda-with-bamboo_138676-3053.jpg?w=826&t=st=1709514621~exp=1709515221~hmac=51b3cb9a913f0cd71dc9382e921104c5fcba0376156217ae4e9cb660556505ce'

  if (pandas.length > 0)
    pandas.forEach(panda => {
      const card = document.createElement('div');
      card.innerHTML = `
        <div class="row g-0">
          <div class="col-md-4">
            <img
              src="${panda.image ? 'data:image/png;base64,' + panda.image : def_img}"
              class="img-fluid rounded" alt="Cute Panda">
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

async function deletePandas(e) {
  e.preventDefault();
  e.stopPropagation();
  const errDiv = document.getElementById('deleteError');
  errDiv.style.opacity = 0;
  errDiv.innerText = '';

  const config = {
    method: 'DELETE'
  };
  const res = await fetch('/api/pandas', config);
  const parsed = await res.json();
  if (parsed.error)
  {
    errDiv.style.opacity = 1;
    errDiv.innerText = parsed.error;
  }
  else
    refreshPandasList();
}

async function createPanda(e) {
  e.preventDefault();
  e.stopPropagation();
  const errDiv = document.getElementById('createError');
  errDiv.style.opacity = 0;
  errDiv.innerText = '';

  const form = new FormData(e.target);
  const panda = {};
  for (const [key, value] of form.entries())
    panda[key] = value;

  const config = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(panda)
  };
  const res = await fetch('/api/pandas', config);
  const parsed = await res.json();
  if (parsed.error)
  {
    errDiv.style.opacity = 1;
    errDiv.innerText = parsed.error;
  }
  else
  {
    e.target.reset();
    refreshPandasList();
  }
}