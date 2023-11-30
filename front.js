const APIURL = 'http://localhost:1300'

window.addEventListener('load', listGifs)

async function getGifs() {
    const resp = await fetch(APIURL + '/gifs')
    const data = await resp.json()

    return data
}

async function listGifs() {

    const gifContainer = document.querySelector('#gifContainer')

    const gifs = await getGifs()

    console.log(gifs);

    gifContainer.innerHTML = ''
    gifs.forEach(gif => {
        gifContainer.innerHTML += `
            <div>
            <h4>${gif.name}</h4>
            <img src="${gif.url}"/>
            </div>
        `
    });
}