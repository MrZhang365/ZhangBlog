async function publish() {
    const data = {
        title: $('article-title').value.trim(),
        content: $('article-content').value.trim(),
    }
    
    var result
    try{
        result = await post('/api/article/publish', data)
    } catch(e) {
        return mdui.alert('文章发布失败', ': (', undefined, { confirmText: '确定' })
    }

    mdui.snackbar('文章发表成功，ID为 ' + result.id, { position: 'right-bottom', timeout: 3000 })
    setTimeout(() => location.href = `/article/#${result.id}`, 3500)
}

$('publish-article').onsubmit = () => {
    publish()
    return false
}

async function editArticle(el) {
    const id = el.getAttribute('data-article')
    const title = $(`${id}-title-edit`).value
    const content = $(`${id}-content-edit`).value

    if (!title || !content) return mdui.alert('标题和内容不能为空', ': (', undefined, { confirmText: '确定' })

    try{
        await post('/api/article/edit', { id, title, content })
        mdui.snackbar('文章修改成功', { position: 'right-bottom', timeout: 3000 })
        setTimeout(() => location.href = `/article/#${id}`, 3500)
    } catch(e) {
        mdui.alert('文章修改失败', ': (', undefined, { confirmText: '确定' })
    }
}

async function delArticle(el) {
    const id = el.getAttribute('data-article')
    await post('/api/article/delete', { id })
}

async function handleDisable(e) {
    const id = e.target.getAttribute('data-id')
    const value = e.target.checked
    e.target.disabled = true

    try{
        await post('/api/article/disable-comment', { id, disabled: value })
        mdui.snackbar('修改成功', { position: 'right-bottom' })
    } catch(err) {
        mdui.snackbar('修改失败', { position: 'right-bottom' })
        e.target.checked = !value
    } finally {
        e.target.disabled = false
    }

}

async function handlePassword(e) {
    if (e.keyCode !== 13) return
    e.preventDefault()

    const id = e.target.getAttribute('data-id')
    const password = e.target.value
    e.target.value = ''
    mdui.updateTextFields()
    e.target.disabled = true
    $(`helper-text-${id}`).textContent = `正在修改密码，请稍后`

    try{
        await post('/api/article/password', { id, password })
        mdui.snackbar('密码修改成功', { position: 'right-bottom' })
    } catch(err) {
        mdui.snackbar('密码修改失败', { position: 'right-bottom' })
    } finally {
        $(`helper-text-${id}`).textContent = `按回车确认，不填则删除密码`
        e.target.disabled = false
    }
}

async function handleNotice(e) {
    const uid = Number.parseInt(e.target.getAttribute('data-id'))
    const content = await new Promise(res => {
        mdui.prompt('请输入通知信息：', '向用户发送通知', text => res(!!text.trim() ? res(text.trim()) : res(null)), () => res(null), {
            confirmText: '发送',
            cancelText: '取消',
        })
    })

    if (!content) return
    try{
        await post('/api/notice/send', { uid, content })
        mdui.snackbar('通知发送成功，等待该用户访问首页吧', { position: 'right-bottom' })
    } catch(e) {
        mdui.snackbar('通知发送失败', { position: 'right-bottom' })
    }
}

function pushArticle(article) {
    const panel = document.createElement('div')
    panel.classList.add('mdui-panel-item')
    
    const header = document.createElement('div')
    header.classList.add('mdui-panel-item-header')
    header.textContent = article.title
    panel.appendChild(header)

    const div = document.createElement('div')
    div.id = article.id
    div.classList.add('mdui-panel-item-body')

    const titleDiv = document.createElement('div')
    titleDiv.classList.add('mdui-textfield', 'mdui-textfield-floating-label')
    div.appendChild(titleDiv)

    const titleIcon = document.createElement('i')
    titleIcon.classList.add('mdui-icon', 'material-icons')
    titleIcon.innerHTML = '&#xe264;'
    titleDiv.appendChild(titleIcon)

    const titleLabel = document.createElement('label')
    titleLabel.classList.add('mdui-textfield-label')
    titleLabel.textContent = '标题'
    titleDiv.appendChild(titleLabel)

    const titleInput = document.createElement('input')
    titleInput.id = `${article.id}-title-edit`
    titleInput.classList.add('mdui-textfield-input')
    titleInput.type = 'text'
    titleInput.value = article.title
    titleDiv.appendChild(titleInput)

    const contentDiv = document.createElement('div')
    contentDiv.classList.add('mdui-textfield', 'mdui-textfield-floating-label')
    div.appendChild(contentDiv)

    const contentIcon = document.createElement('i')
    contentIcon.classList.add('mdui-icon', 'material-icons')
    contentIcon.innerHTML = '&#xe261;'
    contentDiv.appendChild(contentIcon)

    const contentLabel = document.createElement('label')
    contentLabel.classList.add('mdui-textfield-label')
    contentLabel.textContent = '内容'
    contentDiv.appendChild(contentLabel)

    const contentText = document.createElement('textarea')
    contentText.id = `${article.id}-content-edit`
    contentText.classList.add('mdui-textfield-input')
    contentText.value = article.content
    contentDiv.appendChild(contentText)

    const passwordDiv = document.createElement('div')
    passwordDiv.classList.add('mdui-textfield', 'mdui-textfield-floating-label')
    div.appendChild(passwordDiv)

    const passwordIcon = document.createElement('i')
    passwordIcon.classList.add('mdui-icon', 'material-icons')
    passwordIcon.innerHTML = '&#xe897;'
    passwordDiv.appendChild(passwordIcon)

    const passwordLabel = document.createElement('label')
    passwordLabel.classList.add('mdui-textfield-label')
    passwordLabel.textContent = '设置密码'
    passwordDiv.appendChild(passwordLabel)

    const passwordInput = document.createElement('input')
    passwordInput.type = 'password'
    passwordInput.setAttribute('data-id', article.id)
    passwordInput.classList.add('mdui-textfield-input')
    passwordInput.value = ''
    passwordInput.onkeydown = handlePassword
    passwordDiv.appendChild(passwordInput)

    const helperText = document.createElement('div')
    helperText.classList.add('mdui-textfield-helper')
    helperText.id = `helper-text-${article.id}`
    helperText.textContent = '按回车确认，不填则删除密码'
    passwordDiv.appendChild(helperText)

    div.appendChild(document.createElement('br'))

    const disableCommentP = document.createElement('p')
    disableCommentP.textContent = '禁止发送评论'
    div.appendChild(disableCommentP)

    const disableLabel = document.createElement('label')
    disableLabel.classList.add('mdui-switch', 'mdui-float-right')
    disableCommentP.appendChild(disableLabel)

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = !!article.disableComment
    checkbox.setAttribute('data-id', article.id)
    checkbox.onclick = handleDisable
    disableLabel.appendChild(checkbox)

    const icon = document.createElement('i')
    icon.classList.add('mdui-switch-icon')
    disableLabel.appendChild(icon)

    const submitBtn = document.createElement('button')
    submitBtn.classList.add('mdui-btn', 'mdui-btn-block', 'mdui-btn-raised', 'mdui-ripple', 'mdui-color-theme-accent')
    submitBtn.type = 'button'
    submitBtn.textContent = '提交修改'
    submitBtn.setAttribute('data-article', article.id)
    submitBtn.onclick = e => {
        editArticle(e.target)
    }
    div.appendChild(submitBtn)

    div.appendChild(document.createElement('br'))

    const deleteBtn = document.createElement('button')
    deleteBtn.classList.add('mdui-btn', 'mdui-btn-block', 'mdui-btn-raised', 'mdui-ripple', 'mdui-color-red')
    deleteBtn.type = 'button'
    deleteBtn.textContent = '删除文章'
    deleteBtn.setAttribute('data-article', article.id)
    deleteBtn.onclick = e => {
        mdui.confirm('此操作无法撤销，确定要删除这篇文章吗？', '严重警告', async () => {
            try{
                await delArticle(e.target)
                mdui.snackbar('文章删除成功', { position: 'right-bottom', timeout: 3000 })
                setTimeout(() => {
                    $('articles').innerHTML = ''
                    loadArticles()
                }, 3500)
            } catch(e) {
                mdui.alert('文章删除失败', ': (', undefined, { confirmText: '确定' })
            }
        }, () => {}, {
            confirmText: '我确定',
            cancelText: '我是傻逼，我点错了'
        })
    }
    div.appendChild(deleteBtn)
    
    panel.appendChild(div)
    $('articles').appendChild(panel)
    mdui.mutation()
}

async function handleBan(e) {
    const element = e.target
    const id = Number.parseInt(element.getAttribute('data-id'))
    const mode = element.getAttribute('data-mode')

    if (!await confirmBan(mode === 'ban')) return

    try{
        await post(`/api/users/${mode}`, {
            id,
        })
        mdui.snackbar('封禁状态修改成功', { position: 'right-bottom' })
        $('user-list').innerHTML = ''
        initUsers()
    } catch(err) {
        mdui.snackbar('封禁状态修改失败', { position: 'right-bottom' })
    }
}

function pushUser(user) {
    const panel = document.createElement('div')
    panel.classList.add('mdui-panel-item')
    
    const header = document.createElement('div')
    header.classList.add('mdui-panel-item-header')
    header.textContent = user.username
    panel.appendChild(header)

    const div = document.createElement('div')
    div.id = user.id
    div.classList.add('mdui-panel-item-body')

    const usernameTitle = document.createElement('h1')
    usernameTitle.textContent = user.username
    div.appendChild(usernameTitle)

    const stats = document.createElement('p')
    stats.innerHTML = md.render(`用户ID：${user.id}\n是否被封禁：${user.banned}\n是否为管理员：${user.admin}\n注册IP：${user.ip}`)
    div.appendChild(stats)

    const banBtn = document.createElement('button')
    banBtn.type = 'button'
    banBtn.setAttribute('data-id', user.id)
    banBtn.setAttribute('data-mode', user.banned ? 'unban' : 'ban')
    banBtn.textContent = user.banned ? '解除封禁' : '封禁'
    banBtn.classList.add('mdui-btn', 'mdui-btn-block', 'mdui-btn-raised', 'mdui-ripple', 'mdui-color-red')
    banBtn.onclick = handleBan
    div.appendChild(banBtn)
    div.appendChild(document.createElement('br'))

    const noticeBtn = document.createElement('button')
    noticeBtn.type = 'button'
    noticeBtn.setAttribute('data-id', user.id)
    noticeBtn.textContent = '发送通知'
    noticeBtn.classList.add('mdui-btn', 'mdui-btn-block', 'mdui-btn-raised', 'mdui-ripple', 'mdui-color-theme-accent')
    noticeBtn.onclick = handleNotice
    div.appendChild(noticeBtn)
    
    panel.appendChild(div)
    $('user-list').appendChild(panel)
    mdui.mutation()
}

function confirmDelete() {
    return new Promise(res => {
        mdui.confirm('请遵循公平正义的原则 请勿乱删评论“控评”<br>您确定要删除这条评论吗？其子评论也会被删除<br>此操作无法撤销', '严重警告', () => res(true), () => res(false), {
            confirmText: '我确定要删除这条评论',
            cancelText: '我是傻逼，我点错了'
        })
    })
}

function confirmBan(ban = true) {
    return new Promise(res => {
        mdui.confirm(`请遵循公平正义的原则 请勿乱封禁用户以“控评”<br>您确定要${ban ? '封禁' : '解除封禁'}该用户吗？<br>此操作可以撤销`, '严重警告', () => res(true), () => res(false), {
            confirmText: `我确定要${ban ? '封禁' : '解除封禁'}`,
            cancelText: '我是傻逼，我点错了'
        })
    })
}

async function handleDelete(e) {
    e.preventDefault()
    const id = e.target.getAttribute('data-id')

    if (!await confirmDelete()) return
    try{
        await post('/api/comment/delete', {
            id
        })
        mdui.snackbar('评论删除成功', { position: 'right-bottom', timeout: 3000 })
        setTimeout(() => {
            $('comments-div').innerHTML = ''
            initComments()

        })
    } catch(e) {
        mdui.alert(`评论删除失败`, ': (', undefined, {
            confirmText: '确定'
        })
    }
}

function showComment(comment) {
    const div = document.createElement('div')
    div.classList.add('mdui-hoverable', 'mdui-p-a-2')
    div.setAttribute('data-info', JSON.stringify({
        author: comment.nick,
        ip: comment.ip,
        content: comment.content,
        article: comment.article,
        child: false,
    }))

    const titleH4 = document.createElement('h4')
    titleH4.textContent = comment.nick
    div.appendChild(titleH4)

    const timeP = document.createElement('p')
    timeP.textContent = '写于 '

    const timeU = document.createElement('u')
    timeU.textContent = (new Date(comment.time)).toLocaleString()
    timeP.appendChild(timeU)
    div.appendChild(timeP)

    const ipP = document.createElement('p')
    ipP.textContent = '发布IP '

    const ipU = document.createElement('u')
    ipU.textContent = comment.ip
    ipP.appendChild(ipU)
    div.appendChild(ipP)

    const articleP = document.createElement('p')

    const articleLink = document.createElement('a')
    articleLink.textContent = '点击此处查看对应文章'
    articleLink.href = '/article/#' + comment.article
    articleLink.target = '_blank'
    articleP.appendChild(articleLink)
    div.appendChild(articleP)

    const content = md.render(comment.content)
    div.innerHTML += content

    $('comments-div').appendChild(div)

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
            div.setAttribute('data-info', JSON.stringify({
                author: c.nick,
                ip: c.ip,
                content: c.content,
                article: c.article,
                child: true,
            }))

            let titleH4 = document.createElement('h4')
            titleH4.textContent = c.nick
            div.appendChild(titleH4)

            let timeP = document.createElement('p')
            timeP.textContent = '写于 '

            let timeU = document.createElement('u')
            timeU.textContent = (new Date(c.time)).toLocaleString()
            timeP.appendChild(timeU)
            div.appendChild(timeP)

            let ipP = document.createElement('p')
            ipP.textContent = '发布IP '

            let ipU = document.createElement('u')
            ipU.textContent = c.ip
            ipP.appendChild(ipU)
            div.appendChild(ipP)

            let content = md.render(c.content)
            div.innerHTML += content

            let delBtn = document.createElement('button')
            delBtn.type = 'button'
            delBtn.setAttribute('data-id', c.id)
            delBtn.classList.add('mdui-btn', 'mdui-btn-block', 'mdui-btn-raised', 'mdui-ripple', 'mdui-color-red', 'zhangsoft-delete-comment')
            delBtn.textContent = '删除评论'
            div.appendChild(delBtn)
            div.appendChild(document.createElement('br'))

            body.appendChild(div)
            body.appendChild(document.createElement('hr'))
        }
        
        div.appendChild(panelParent)
        div.appendChild(document.createElement('br'))
        mdui.mutation()
    }

    const deleteBtn = document.createElement('button')
    deleteBtn.type = 'button'
    deleteBtn.setAttribute('data-id', comment.id)
    deleteBtn.classList.add('mdui-btn', 'mdui-btn-block', 'mdui-btn-raised', 'mdui-ripple', 'mdui-color-red', 'zhangsoft-delete-comment')
    deleteBtn.textContent = '删除评论'
    div.appendChild(deleteBtn)
    div.appendChild(document.createElement('br'))

    $('comments-div').appendChild(document.createElement('hr'))
    for (let e of document.getElementsByClassName('zhangsoft-delete-comment')) {
        e.onclick = handleDelete
    }
}

async function initComments() {
    const comments = await get('/api/comment/get-all')
    window.comments = comments
    comments.forEach(showComment)
}

async function initUsers() {
    const users = await get('/api/users/list')
    users.forEach(pushUser)
}

async function initConfig() {
    $('disable-comment').onchange = async e => {
        const value = e.target.checked
        e.target.disabled = true

        try{
            await post('/api/config/disable-comment', { disabled: value })
            mdui.snackbar('修改成功', { position: 'right-bottom' })
        } catch(err) {
            mdui.snackbar('修改失败', { position: 'right-bottom' })
            e.target.checked = !value
        } finally {
            e.target.disabled = false
        }
    }
    const disabledComment = (await get('/api/config/disable-comment')).disabled
    $('disable-comment').checked = disabledComment
}

async function loadArticles() {
    const articleList = await get('/api/article/all')
    articleList.forEach(a => {
        pushArticle(a)
    })
}

async function checkLogin() {
    const result = await get('/api/auth/account-get')

    if (!result.admin) {
        location.href = '/login/'
        return
    }
    return true
}

/* 难度太大 暂时不写
function initSearch() {
    $('search').oninput = (e) => {
        const searchType = $('search-by').value
        const target = e.target.value.trim().toLowerCase()

        if (!Array.isArray(window.comments)) return mdui.snackbar('评论列表尚未请求成功 同志仍需等待', {
            position: 'right-bottom'
        })

        if (!target) {
            $('comments-div').innerHTML = ''
            return window.comments.forEach(showComment)
        }

        //const co = window.comments.filter(c => c[searchType].toLowerCase().includes(target))
        const copy = Array.from(window.comments)
        const co = copy.map(c => {
            if (c[searchType].toLowerCase().includes(target)) return c
            c.replys = c.replys.filter(com => com[searchType].toLowerCase().includes(target))
            if (c.replys.length === 0) return false
            return c
        }).filter(c => c !== false)
        $('comments-div').innerHTML = ''
        co.forEach(showComment)
    }
}
*/

checkLogin().then(r => {
    if (r) {
        loadArticles()
        initComments()
        initConfig()
        initUsers()
        // initSearch()    // 难度太大 暂时不写
    }
})