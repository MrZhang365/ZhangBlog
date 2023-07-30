async function post(url, data) {
    const result = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })

    let jsondata = {}
    try{
        jsondata = await result.json()
    } catch(err) {
        throw err
    }

    if (jsondata.error === 'banned') {
        location.href = '/login/error-account-banned.html'
        return jsondata
    } else if (jsondata.error === 'account-not-found') {
        location.href = '/login/error-account-404.html'
        return jsondata
    } else {
        return jsondata
    }
}

async function get(url) {
    const result = await fetch(url, {
        method: 'GET',
    })

    let jsondata = {}
    try{
        jsondata = await result.json()
    } catch(err) {
        throw err
    }

    if (jsondata.error === 'banned') {
        location.href = '/login/error-account-banned.html'
        return jsondata
    } else if (jsondata.error === 'account-not-found') {
        location.href = '/login/error-account-404.html'
        return jsondata
    } else {
        return jsondata
    }
}