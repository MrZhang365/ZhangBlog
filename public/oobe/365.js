function showInput() {
    $('input').classList.remove('mdui-hidden')
}

function hideInput() {
    $('input').classList.add('mdui-hidden')
}

function startFlash() {
    $('oobe-text').classList.add('paperee-flash')
}

function stopFlash() {
    $('oobe-text').classList.remove('paperee-flash')
}

function initVars() {
    window.config = {}
}

function handleData(e) {
    if (e.keyCode !== 13) return
    e.preventDefault()
    e.target.onkeydown = () => {}

    window.config[e.target.getAttribute('data-id')] = e.target.value.trim()
    e.target.value = ''
    mdui.updateTextFields()
    hideInput()
    startFlash()
    window.code = autoChangeText()
}

function done() {
    clearInterval(window.code)
    stopFlash()

    const data = {
        site: {},
        author: {},
    }
    for (let key of ['title', 'subtitle']) {
        data.site[key] = window.config[key]
    }

    for (let key of ['nick', 'about', 'head']) {
        data.author[key] = window.config[key]
    }

    post('/api/config/init-about', data).then(() => {
        $('oobe-text').textContent = '尽情使用吧！'
    })
    .catch(() => {
        $('oobe-text').textContent = '糟糕，出错了！'
    })
}

function autoChangeText() {
    const windowTime = (1 / 0.01) * 25 * 2    // 闪烁一次需要的时间
    const txt = [
        { text: '你好' },
        { text: '欢迎使用ZhangBlog' },
        { text: '与君初相识，犹如故人归' },
        { text: '让我们来配置ZhangBlog' },
        { text: '这个博客叫什么名字？', id: 'title', title: '网站标题' },
        { text: '这个标题是什么意思？', id: 'subtitle', title: '网站副标题' },
        { text: '谁会使用这个博客呢？', id: 'nick', title: '您的昵称' },
        { text: '可否介绍一下您自己？', id: 'about', title: '简要介绍一下您自己' },
        { text: '您长什么样子？', id: 'head', title: '您头像的链接' },
        { text: '嗨，别来无恙啊！' },
        { text: '一切即将准备就绪' },
        { text: '请勿关闭此界面' },
    ]
    return setInterval(() => {
        const index = Number.parseInt($('oobe-text').getAttribute('data-index'))
        const now = txt[isNaN(index) ? 0 : (index + 1)]

        if (now === undefined) {
            return done()
        }

        $('oobe-text').textContent = now.text
        $('oobe-text').setAttribute('data-index', String(isNaN(index) ? 0 : (index + 1)))

        if (now.id) {
            stopFlash()
            clearInterval(window.code)
            $('input-text').setAttribute('data-id', now.id)
            $('input-title').textContent = now.title
            $('input-text').onkeydown = handleData
            showInput()
        }
    }, windowTime)
}

initVars()
startFlash()
window.code = autoChangeText()