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

    mdui.snackbar('文章发表成功，文章ID为 ' + result.id, { position: 'right-bottom', timeout: 3000 })
    setTimeout(() => location.href = `/article/#${result.id}`, 3000)
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
        setTimeout(() => location.href = `/article/#${id}`, 3000)
    } catch(e) {
        mdui.alert('文章修改失败', ': (', undefined, { confirmText: '确定' })
    }
}

async function delArticle(el) {
    const id = el.getAttribute('data-article')
    await post('/api/article/delete', { id })
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
    titleInput.maxLength = 20
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
                    location.reload()
                }, 3000)
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

async function loadArticles() {
    const articleList = await get('/api/article/all')
    articleList.forEach(a => {
        pushArticle(a)
    })
}

async function checkLogin() {
    const result = await get('/api/auth/account-get')

    if (!result.admin) return location.href = '/login/'
    return true
}

checkLogin().then(r => {
    if (r) loadArticles()
})