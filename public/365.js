async function initPage() {
    const home = await get('/api/home')

    home.articles.forEach(a => {
        articleAdd(a)
    })
}

initPage()