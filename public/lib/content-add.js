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

function socializeClear() {
    $('socialize').innerHTML = ''
}

function socializeAdd(name, link) {
    const element = document.createElement('a')
    element.textContent = name
    element.href = link
    $('socialize').appendChild(element)
    $('socialize').appendChild(document.createElement('br'))
}

function articleAdd(article) {
    $('articles').appendChild(document.createElement('br'))
    const element = document.createElement('div')
    element.classList.add('mdui-hoverable', 'mdui-p-a-2')
    
    const h1 = document.createElement('h1')

    const titleLink = document.createElement('a')
    titleLink.href = `/article/#${article.id}`
    titleLink.textContent = article.title

    h1.appendChild(titleLink)
    element.appendChild(h1)

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
}