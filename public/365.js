async function initPage() {
    initNotice()    // 异步任务 初始化通知列表
    $('reset-tag').onclick = resetTag
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

function pushNotice(notice) {
    const tr = document.createElement('tr')

    const nick = document.createElement('td')
    nick.textContent = notice.nick
    tr.appendChild(nick)

    const content = document.createElement('td')
    content.innerHTML = md.render(notice.content)
    tr.appendChild(content)

    const time = document.createElement('td')
    time.textContent = new Date(notice.time).toLocaleString()
    tr.appendChild(time)

    $('notice-list').appendChild(tr)
}

function resetTag() {
    window.tag = null
    showArticlesByTag()
    $('reset-tag').classList.add('mdui-fab-hide')
}

async function initNotice() {
    $('notice-clear').onclick = async () => {
        try{
            $('notice-clear').textContent = '正在清空，请稍后...'
            $('notice-clear').disabled = true
            await get('/api/notice/delete')
            await initNotice()    // 重新初始化
            $('notice-icon').innerHTML = '&#xe7f4;'
            mdui.snackbar('通知列表已清空，部分系统消息除外', { position: 'right-bottom' })
        } catch(e) {
            mdui.snackbar('抱歉，清空通知列表时出现未知异常', { position: 'right-bottom' })
        } finally {
            $('notice-clear').textContent = '一键清空'
            $('notice-clear').disabled = false
        }
    }
    const notices = await get('/api/notice/list')
    $('notice-list').innerHTML = ''
    if (notices.length > 0) $('notice-icon').innerHTML = '&#xe7f7;'
    notices.forEach(pushNotice)
}

initPage()