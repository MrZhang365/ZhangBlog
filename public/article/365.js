async function getArticle(id) {
    return await get(`/api/article/get/?id=${id}`)
}

function showArticle(article) {
    const title = document.createElement('h1')
    title.innerHTML = md.render(article.title)
    $('article').appendChild(title)

    const timeP = document.createElement('p')
    timeP.textContent = '发表于 '
    const timeU = document.createElement('u')
    timeU.textContent = (new Date(article.time)).toLocaleString()
    timeP.appendChild(timeU)
    $('article').appendChild(timeP)

    if (article.updateTime) {
        const updateTimeP = document.createElement('p')
        updateTimeP.textContent = '更新于 '
        const updateTimeU = document.createElement('u')
        updateTimeU.textContent = (new Date(article.updateTime)).toLocaleString()
        updateTimeP.appendChild(updateTimeU)
        $('article').appendChild(updateTimeP)
    }

    $('article').innerHTML += md.render(article.content)
}

async function initComment() {
    try{
        var result = await get('/api/auth/account-get')
        if (!result.logined) {
            $('send-comment').disabled = true
            $('send-comment').textContent = '请先登录'
            return
        }
    } catch(e) {
        $('send-comment').disabled = true
        $('send-comment').textContent = '账户异常'
        return
    }

    $('send-comment').onclick = async e => {
        const btn = e.target
        btn.disabled = true

        const content = $('comment-input').value.trim()
        if (!content) {
            mdui.alert('你想表达什么？', '无法发送评论', undefined, { confirmText: '确定' })
            btn.disabled = false
            return
        }
        try{
            btn.textContent = '正在发送...'
            await post('/api/comment/publish', {
                id: location.hash.slice(1),
                content,
            })
            location.reload()
        } catch(e) {
            mdui.alert('这可能是由于网络或账户异常导致的，也可能是因为服务器崩溃', '评论发送失败', undefined, { confirmText: '确定' })
        } finally {
            btn.disabled = false
            btn.textContent = '发送'
        }
    }

    loadComments()
}

function showComment(comment) {
    const div = document.createElement('div')

    const titleH4 = document.createElement('h4')
    titleH4.textContent = comment.nick
    div.appendChild(titleH4)

    const timeP = document.createElement('p')
    timeP.textContent = '写于 '

    const timeU = document.createElement('u')
    timeU.textContent = (new Date(comment.time)).toLocaleString()
    timeP.appendChild(timeU)
    div.appendChild(timeP)

    const content = md.render(comment.content)
    div.innerHTML += content

    $('comments').appendChild(div)
    $('comments').appendChild(document.createElement('hr'))
}

async function loadComments() {
    const comments = await get(`/api/comment/get/?id=${location.hash.slice(1)}`)
    comments.forEach(showComment)
}

async function initArticle() {
    const id = location.hash.slice(1)
    if (!id) return mdui.alert('你干嘛直接访问这个页面？', '你干嘛~ 哈哈哎哟~', undefined, { confirmText: '我干嘛~' })
    
    var data
    try{
        data = await getArticle(id)
    } catch(e) {
        return mdui.alert('获取文章失败', ': (', undefined, { confirmText: '确定' })
    }
    showArticle(data)
}

async function initPage() {
    const id = location.hash.slice(1)
    if (!id) return mdui.alert('你干嘛直接访问这个页面？', '你干嘛~ 哈哈哎哟~', undefined, { confirmText: '我干嘛~' })

    initArticle()
    initComment()
}

initPage()