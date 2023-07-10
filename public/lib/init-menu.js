async function initMenu() {
    const home = await get('/api/home')

    document.title = `${home.site.title} - ${home.site.subtitle}`
    $('title').textContent = document.title
    $('head').src = home.author.head
    $('author-nick').textContent = home.author.nick
    $('about-author').textContent = home.author.about
    socializeClear()    // 《去NM的社交》
    Object.keys(home.author.socialize).forEach(s => {
        socializeAdd(s, home.author.socialize[s])
    })
    friendClear()    // 《一键干掉朋友们》
    Object.keys(home.author.friends).forEach(f => {
        friendAdd(f, home.author.friends[f])
    })
}

initMenu()