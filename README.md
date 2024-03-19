# pandas-at-rest
Pandas at REST - An introduction to Web Development

## setup
Install nodejs:
 * https://nodejs.org/en (use LTS)

Clone this repo:
 * git clone https://github.com/Tiuipuv/pandas-at-rest.git
 * git for windows: https://git-scm.com/download/win

cd into the directory and run:
 * npm install

create a new file in the root of the project, called `.env`. This file should contain your stable diffusion server info, example below:
```
DIFFUSION_URL="10.0.0.1"
DIFFUSION_PORT="7860"
DIFFUSION_MODEL="sd_xl_base_1.0"
```

## running the app
cd into the directory and run:
 * development mode: `npm run dev`
 * production mode: `npm start`

open `http://localhost:8080` in your browser.