function friendClear() {
    $('friends').innerHTML = ''
}

function friendAdd(name, link) {
    const element = document.createElement('a')
    element.textContent = name
    element.href = link
    $('friends').appendChild(element)
    $('friends').appendChild(document.createElement('br'))
}

function showArticlesByTag() {
    for (let article of document.getElementsByClassName('article')) {
        if (!window.tag) {
            article.classList.remove('mdui-hidden')
            $('reset-tag').classList.add('mdui-fab-hide')
            continue
        }
        $('reset-tag').classList.remove('mdui-fab-hide')
        if (!JSON.parse(article.getAttribute('data-tags')).includes(window.tag)) article.classList.add('mdui-hidden')
        else article.classList.remove('mdui-hidden')
    }
}

function articleAdd(article) {
    $('articles').appendChild(document.createElement('br'))
    const element = document.createElement('div')
    element.classList.add('mdui-hoverable', 'mdui-p-a-2', 'article')
    
    const h1 = document.createElement('h1')

    const titleLink = document.createElement('a')
    titleLink.href = `/article/#${article.id}`
    titleLink.textContent = article.title

    h1.appendChild(titleLink)
    element.appendChild(h1)

    const tags = []
    for (let tag of article.tags) {
        const paperee = document.createElement('div')    // 创建一个MDUI的纸片组件，由于和纸片君ee（paperee）重名，所以就干脆用这个名字 XD
        paperee.classList.add('mdui-chip')
        paperee.setAttribute('data-tag', tag)
        paperee.onclick = e => {
            window.tag = e.target.getAttribute('data-tag')
            showArticlesByTag()
        }

        const ee = document.createElement('span')    // 直接用ee XD
        ee.setAttribute('data-tag', tag)
        ee.classList.add('mdui-chip-title')
        ee.textContent = tag
        paperee.appendChild(ee)

        tags.push(paperee)
    }

    tags.forEach(paperee => {    // 纸片君ee * 2
        element.appendChild(paperee)
    })

    element.setAttribute('data-tags', JSON.stringify(article.tags))

    const timeP = document.createElement('p')
    timeP.textContent = '发表于 '
    const timeU = document.createElement('u')
    timeU.textContent = (new Date(article.time)).toLocaleString()
    timeP.appendChild(timeU)
    element.appendChild(timeP)

    if (article.updateTime) {
        const updateTimeP = document.createElement('p')
        updateTimeP.textContent = '更新于 '
        const updateTimeU = document.createElement('u')
        updateTimeU.textContent = (new Date(article.updateTime)).toLocaleString()
        updateTimeP.appendChild(updateTimeU)
        element.appendChild(updateTimeP)
    }

    const p = document.createElement('p')
    p.innerHTML = md.render(article.content)
    element.appendChild(p)

    $('articles').appendChild(element)
    showArticlesByTag()
}