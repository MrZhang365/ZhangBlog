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

    dressForSpecialDate()
}

/**
 * 匹配日期
 * @param {Number} month 
 * @param {Number} day 
 * @returns {Boolean}
 */
function matchDate(month, day) {
    return (new Date()).getMonth() + 1 === month && (new Date()).getDate() === day
}

/**
 * 让主页在特殊的日期打扮一下
 * MrZhang365在2025年12月22日路过：咳咳 几年前的shit代码配上2025新代码 离谱
 */
function dressForSpecialDate() {
    if (matchDate(3, 14)) {
        // 站长生日
        mdui.alert(`今天是MrZhang365的${(new Date()).getFullYear() - 2008}岁生日，也是全球数学日。在这个特殊的日子里，让我们祝MrZhang365生日快乐！也希望他的生活会越来越好`, '生日快乐！')
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
    if (notices.length > 0) {
        $('notice-icon').innerHTML = '&#xe7f7;'
        mdui.snackbar('叮~ 您有新的通知，请点击右上角的铃铛查看', { position: 'right-top' })
    }
    notices.forEach(pushNotice)
}

initPage()