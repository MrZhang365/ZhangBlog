let fileToUpload = null

async function checkLogin() {
    const result = await get('/api/auth/account-get')

    if (!result.admin) {
        location.href = '/login/'
        return
    }
    return true
}

function initPage() {
    $('select-file-area').ondrop = handleDrop
    $('select-file-area').ondragenter = e => {
        e.preventDefault()
        $('message').textContent = 'awa 文件来咯！'
    }
    $('select-file-area').ondragover = e => {
        e.preventDefault()
        $('message').textContent = '快点松开鼠标吧'
    }
    $('select-file-area').ondragleave = e => {
        e.preventDefault()
        $('message').textContent = 'QAQ 文件你怎么走了'
    }
    $('select-file-btn').onclick = () => $('file-select').click()
    $('file-select').onchange = e => {
        if (!e.target.files[0]) {
            $('message').textContent = ''
            return handleFile(null)
        }
        $('message').textContent = '文件就在这个框框里'
        handleFile(e.target.files[0])
    }
    $('copy-link').onclick = () => {
        navigator.clipboard.writeText($('link').textContent).then(() => {
            mdui.snackbar('已复制链接', { position: 'right-bottom' })
        })
        .catch(() => {
            mdui.snackbar('链接复制失败', { position: 'right-bottom' })
        })
    }
    $('copy-markdown').onclick = () => {
        navigator.clipboard.writeText($('markdown').textContent).then(() => {
            mdui.snackbar('已复制Markdown', { position: 'right-bottom' })
        })
        .catch(() => {
            mdui.snackbar('Markdown复制失败', { position: 'right-bottom' })
        })
    }
    $('upload-btn').onclick = handleUpload

    get('/api/img/list').then(l => {
        l.forEach(pushImage)
    })
    .catch(() => {
        mdui.snackbar('无法获取图片列表', { position: 'right-bottom' })
    })
}

function handleDrop(e) {
    e.preventDefault()
    if (!e.dataTransfer || !e.dataTransfer.files[0]) {
        $('message').textContent = '你管这叫文件？'
        handleFile(null)
        return
    }
    if (!e.dataTransfer.files[0].type.startsWith('image/')) {
        handleFile(null)
        $('message').textContent = '你管这叫图片？'
        return
    }
    $('message').textContent = '文件就在这个框框里'
    handleFile(e.dataTransfer.files[0])
}

function handleFile(file) {
    fileToUpload = file
}

function readFile(file) {
    return new Promise(res => {
        const reader = new FileReader()
        reader.onload = (e) => {
            res(e.target.result)
            handleFile(null)
        }
        reader.readAsDataURL(file)
    })
}

async function upload() {
    const file = fileToUpload
    if (!file) {
        mdui.alert('看上去还没有选择文件', ': (', undefined, { confirmText: '确定' })
        return false
    }

    $('file-select').value = ''
    $('message').textContent = '文件在前往服务器的路上'

    return await post('/api/img/upload', {
        data: await readFile(file),
        mimetype: file.type,
        filename: file.name,
    })
}

async function handleDelete(e) {
    const img = e.target.getAttribute('data-name')

    mdui.confirm('此操作无法撤销，确定要删除这张图片吗？', '严重警告', async () => {
        try{
            await post('/api/img/delete', {
                filename: img
            })
            mdui.snackbar('图片删除成功', { position: 'right-bottom', timeout: 3000 })
            setTimeout(() => location.reload(), 3000)
        } catch(err) {
            mdui.snackbar('图片删除失败', { position: 'right-bottom' })
        }
    }, () => {}, {
        confirmText: '我确定',
        cancelText: '我是傻逼，我点错了'
    })
}

function pushImage(image) {
    const panel = document.createElement('div')
    panel.classList.add('mdui-panel-item')
    
    const header = document.createElement('div')
    header.classList.add('mdui-panel-item-header')
    header.textContent = image
    panel.appendChild(header)

    const div = document.createElement('div')
    div.classList.add('mdui-panel-item-body')

    const img = document.createElement('img')
    img.src = `${location.protocol}//${location.host}/api/img/get/${image}`
    div.appendChild(img)
    div.appendChild(document.createElement('br'))

    const deleteBtn = document.createElement('button')
    deleteBtn.type = 'button'
    deleteBtn.classList.add('mdui-btn', 'mdui-btn-block', 'mdui-btn-raised', 'mdui-ripple', 'mdui-color-red')
    deleteBtn.setAttribute('data-name', image)
    deleteBtn.onclick = handleDelete
    deleteBtn.textContent = '删除图片'
    div.appendChild(deleteBtn)

    panel.appendChild(div)
    $('images').appendChild(panel)
    mdui.mutation()
}

function handleUpload() {
    upload().then(r => {
        if (!r) return
        $('message').textContent = '文件就在服务器上'
        mdui.snackbar('文件上传成功', { position: 'right-bottom' })
        $('link').textContent = `${location.protocol}//${location.host}/api/img/get/${r.name}`
        $('markdown').textContent = `![](${location.protocol}//${location.host}/api/img/get/${r.name})`
    })
    .catch(() => {
        mdui.alert('文件上传失败', ': (', undefined, { confirmText: '确定' })
    })
}

checkLogin().then(r => {
    if (r) {
        initPage()
    }
})