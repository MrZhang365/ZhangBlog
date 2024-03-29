async function getFriends() {
    return (await get('/api/home')).author.friends
}

function getPaper() {
    // 获取到画布（纸）
    return document.getElementById('sky')
}

function whichFriend(x, y, friendsXY) {
    for (let friend in friendsXY) {
        const friendX = friendsXY[friend][0]
        const friendY = friendsXY[friend][1]

        if (x >= friendX && x <= friendX + 5 && y >= friendY && y <= friendY + 5) return friend
    }
    return null
}

async function init() {
    const paper = getPaper()
    const ctx = paper.getContext('2d')
    const friends = await getFriends()
    const friendsXY = {}

    paper.width = window.innerWidth
    paper.height = window.innerHeight

    ctx.height = paper.height
    ctx.width = paper.width

    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, paper.width, paper.height)

    ctx.fillStyle = '#FFFFFF'
    for (let i = 0; i < Object.keys(friends).length; i++) {
        const x = Math.random() * ctx.width
        const y = Math.random() * ctx.height
        ctx.fillRect(x, y, 5, 5)

        friendsXY[Object.keys(friends)[i]] = [x, y]
    }

    paper.onclick = e => {
        console.log('点击了')
        const cvsbox = paper.getBoundingClientRect()
        const x = Math.round(e.clientX - cvsbox.left)
        const y = Math.round(e.clientY - cvsbox.top)
        const result = whichFriend(x, y, friendsXY)
        console.log(result)
        if (result === null) return e.preventDefault()
        const a = document.createElement('a')
        a.href = friends[result]
        a.target = '_blank'
        a.click()
    }
}

init()