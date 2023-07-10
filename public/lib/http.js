async function post(url, data) {
    return await (await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })).json()
}

async function get(url) {
    return await (await fetch(url, {
        method: 'GET'
    })).json()
}