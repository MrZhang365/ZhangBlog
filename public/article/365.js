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

function getInput(text, title) {
    return new Promise(res => {
        mdui.prompt(text, title, res, () => res(null), {
            confirmText: '确定',
            cancelText: '取消',
        })
    })
}

async function initComment() {
    try{
        var result = await get('/api/auth/account-get')
        if (!result.logined) {
            $('send-comment').disabled = true
            $('send-comment').textContent = '请先登录'
            window.disableSendComments = true
        }
    } catch(e) {
        $('send-comment').disabled = true
        $('send-comment').textContent = '账户异常'
        window.disableSendComments = true
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
            const data = {
                id: location.hash.slice(1),
                content,
            }
            if (btn.getAttribute('data-reply')) data.parent = btn.getAttribute('data-reply')
            await post('/api/comment/publish', data)
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
    div.classList.add('mdui-p-a-2')

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

    const replyBtn = document.createElement('button')
    replyBtn.type = 'button'
    replyBtn.setAttribute('data-comment-id', comment.id)
    replyBtn.classList.add('mdui-btn', 'mdui-btn-block', 'mdui-btn-raised', 'mdui-ripple', 'mdui-color-theme-accent')
    replyBtn.textContent = '回复一下'
    replyBtn.onclick = async e => {
        $('send-comment').setAttribute('data-reply', e.target.getAttribute('data-comment-id'))
        $('send-comment').textContent = '回复评论'
        $('comment-input').focus()
    }
    div.appendChild(replyBtn)

    $('comments').appendChild(div)

    if (comment.replys.length > 0) {
        const panelParent = document.createElement('div')
        panelParent.classList.add('mdui-panel')
        panelParent.setAttribute('mdui-panel', '')

        const panel = document.createElement('div')
        panel.classList.add('mdui-panel-item')
        panelParent.appendChild(panel)

        const header = document.createElement('div')
        header.textContent = '回复'
        header.classList.add('mdui-panel-item-header')
        panel.appendChild(header)

        const body = document.createElement('div')
        body.classList.add('mdui-panel-item-body')
        panel.appendChild(body)

        for (let c of comment.replys) {
            let div = document.createElement('div')

            let titleH4 = document.createElement('h4')
            titleH4.textContent = c.nick
            div.appendChild(titleH4)

            let timeP = document.createElement('p')
            timeP.textContent = '写于 '

            let timeU = document.createElement('u')
            timeU.textContent = (new Date(c.time)).toLocaleString()
            timeP.appendChild(timeU)
            div.appendChild(timeP)

            let content = md.render(c.content)
            div.innerHTML += content

            body.appendChild(div)
            body.appendChild(document.createElement('hr'))
        }
        
        div.appendChild(panelParent)
        mdui.mutation()
    }

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