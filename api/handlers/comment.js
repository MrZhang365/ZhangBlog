import Router from 'express'
import * as uuid from 'uuid'
import { default as sha } from 'sha256'

const router = Router()
router.post('/publish', async (req, res) => {
    if (Date.now() - req.account.lastComment <= 60000) {
        return res.status(429).json({ error: 'fast' })
    }
    if (!(await app.db.select('config', { name: 'disable-comment' }))[0]) {
        await app.db.delete('config', { name: 'disable-comment' })
        await app.db.insert('config', {
            name: 'disable-comment',
            data: false
        })
    }

    if ((await app.db.select('config', { name: 'disable-comment' }))[0].data) return res.status(403).end()

    if (!req.account.id) return res.status(401).end()
    if (!req.body) return res.status(400).end()
    
    const article = req.body.id    // 文章ID
    const parent = (typeof req.body.parent === 'string' && !!req.body.parent) ? req.body.parent : undefined    // 父评论ID（仅适用于回复）
    const content = (typeof req.body.content === 'string') ? req.body.content.trim() : undefined    // 内容

    const a = (await app.db.select('articles', { id: article }))[0]
    if (!a) return res.status(404).end()
    if (a.disableComment) return res.status(403).end()
    if (a.password && !req.account.admin && sha(decodeURI(req.query.password)).toUpperCase() !== a.password.toUpperCase()) return res.status(403).end()

    if (!article || typeof article !== 'string') return res.status(400).end()
    if (!content) return res.status(400).end()

    const id = uuid.v4()
    const comment = {
        id, article,
        nick: req.account.username,
        content,
        ip: req.ip,
        time: Date.now(),
        uid: req.account.id,
    }

    if (typeof parent === 'string') {
        const parentComment = (await app.db.select('comments', { id: parent }))[0]
        if (!parentComment) return res.status(404).end()
        if (typeof parentComment.parent === 'string') return res.status(400).end()
        
        comment.parent = parent
        if (parentComment.uid !== req.account.uid) await app.db.insert('notices', {
            uid: parentComment.uid,
            nick: req.account.username,
            content: `${req.account.username} 在[${a.title}](/article/#${a.id}) 回复了你的评论“${parentComment.content.length > 10 ? parentComment.content.slice(0, 10) + '...' : parentComment.content}”，TA说：“${comment.content.length > 10 ? comment.content.slice(0, 10) + '...' : comment.content}”`,
            time: Date.now(),
        })
    }

    await app.db.insert('comments', comment)
    await app.db.update('users', { id: req.account.id }, { lastComment: Date.now() })
    if (!req.account.admin) await app.db.insert('notices', {
        uid: (await app.db.select('users', { admin: true }))[0].id,
        nick: req.account.username,
        content: `${req.account.username} 在[${a.title}](/article/#${a.id})发表了评论，TA说：“${comment.content.length > 10 ? comment.content.slice(0, 10) + '...' : comment.content}”`,
        time: Date.now(),
    })
    return res.json({
        id, 
    })
})

async function makeComment(comment, admin = false) {
    var c = {
        id: comment.id,
        uid: comment.uid, 
        article: comment.article,
        nick: comment.nick,
        content: comment.content,
        time: comment.time,
        replys: []
    }

    if (admin) c.ip = comment.ip

    const replys = (await app.db.select('comments', { parent: comment.id })).sort((a, b) => a.time - b.time)

    if (replys.length > 0) {
        for (let i of replys) {
            c.replys.push(await makeComment(i, admin))
        }
    }

    return c
}

router.get('/get', async (req, res) => {
    const id = req.query.id
    if (!id) return res.status(400).end()

    const article = (await app.db.select('articles', { id }))[0]
    if (!article) return res.status(400).end()
    if (article.password && !req.account.admin && sha(decodeURI(req.query.password)).toUpperCase() !== article.password.toUpperCase()) return res.json([])

    const comments = (await app.db.select('comments', { article: id })).sort((a, b) => b.time - a.time)
    var payload = []

    for (let i of comments) {
        if (typeof i.parent === 'string') continue
        payload.push(await makeComment(i))
    }

    res.json(payload)
})

router.post('/delete', async (req, res) => {
    if (!req.account.admin) return res.status(401).end()
    if (!req.body) return res.status(400).end()
    if (typeof req.body.id !== 'string') return res.status(400).end()

    const id = req.body.id
    await app.db.delete('comments', {
        id
    })
    await app.db.delete('comments', {
        parent: id
    })
    res.json({})
})

router.get('/get-all', async (req, res) => {
    if (!req.account.admin) return res.status(401).end()

    const comments = (await app.db.select('comments', {  })).sort((a, b) => b.time - a.time)
    var payload = []

    for (let i of comments) {
        if (typeof i.parent === 'string') continue
        payload.push(await makeComment(i, true))
    }

    res.json(payload)
})

export const url = '/comment'
export { router as handler }