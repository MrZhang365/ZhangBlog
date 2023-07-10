import Router from 'express'
import * as uuid from 'uuid'

const router = Router()
router.post('/publish', async (req, res) => {
    if (!req.account.id) return res.status(401).end()
    if (!req.body) return res.status(400).end()
    
    const article = req.body.id    // 文章ID
    const parent = (typeof req.body.parent === 'string' && !!req.body.parent) ? req.body.parent : undefined    // 父评论ID（仅适用于回复）
    const content = (typeof req.body.content === 'string') ? req.body.content.trim() : undefined    // 内容

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
        if ((!await app.db.select('comments', { id: parent }))[0]) return res.status(404).end()
        comment.parent = parent
    }

    await app.db.insert('comments', comment)
    return res.status(200).json({
        id, 
    })
})

async function makeComment(comment) {
    var c = {
        id: comment.id,
        article: comment.article,
        nick: comment.nick,
        content: comment.content,
        time: comment.time,
        replys: []
    }

    const replys = await app.db.select('comments', { parent: comment.id })

    if (replys.length > 0) {
        for (let i of replys) {
            c.replys.push(await makeComment(i))
        }
    }

    return c
}

router.get('/get', async (req, res) => {
    const id = req.query.id
    if (!id) return res.status(400).end()

    const article = (await app.db.select('articles', { id }))[0]
    if (!article) return res.status(400).end()

    const comments = (await app.db.select('comments', { article: id })).sort((a, b) => b.time - a.time)
    var payload = []

    for (let i of comments) {
        if (typeof i.parent === 'string') continue
        payload.push(await makeComment(i))
    }

    res.json(payload)
})

export const url = '/comment'
export { router as handler }