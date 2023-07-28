async function initPage() {
    const home = await get('/api/home')

    home.articles.forEach(a => {
        articleAdd(a)
    })

    for (let i = 1; i <= home.index.all; i++) {
        let opt = document.createElement('option')
        opt.value = String(i)
        opt.textContent = String(i)
        if (i === home.index.now) opt.selected = true
        $('page').appendChild(opt)
    }

    $('page').onchange = async e => {
        $('articles').innerHTML = ''

        const home = await get('/api/home/?index=' + e.target.value)

        home.articles.forEach(a => {
            articleAdd(a)
        })
    }
}

initPage()