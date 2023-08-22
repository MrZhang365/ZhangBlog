// 获取文章信息
import { Router } from 'express'
import { default as sha } from 'sha256'
import * as uuid from 'uuid'

const router = Router()
router.get('/get', async (req, res) => {
    const id = req.query.id
    if (!id) return res.status(400).end()

    const got = (await app.db.select('articles', { id: id }))[0]
    if (!got) return res.status(404).end()
    if (got.password && !req.account.admin && sha(decodeURI(req.query.password)).toUpperCase() !== got.password.toUpperCase()) {
        got.content = '您尚未输入密码或密码错误'
        got.password = true
    }

    if (typeof got.password === 'string') delete got.password

    res.json(got)
})

router.get('/all', async (req, res) => {
    if (!req.account.admin) return res.status(401).end()
    const articles = await app.db.select('articles', {})
    res.json(articles.sort((a, b) => b.time - a.time))
})

router.post('/publish', async (req, res) => {
    if (!req.account.admin) return res.status(401).end()
    if (!req.body) return res.status(400).end()
    const title = req.body.title
    const content = req.body.content
    if (typeof title !== 'string' || !title || !content || typeof content !== 'string') return res.status(400).end()
    const tags = Array.isArray(req.tags) ? req.tags : ['默认']

    const id = uuid.v4()
    app.db.insert('articles', {
        id, title, content, tags,
        disableComment: false,
        time: Date.now(),
    })
    res.status(200).json({
        id
    })
})

router.post('/set-tags', async (req, res) => {
    if (!Array.isArray(req.body.tags) || typeof req.body.id !== 'string' || !req.body.id) return res.status(400).end()
    if (req.body.tags.length === 0) return res.status(400).end()

    for (let tag of req.body.tags) {
        if (typeof tag !== 'string' || !tag) return res.status(400).end()
    }
    
    const article = (await app.db.select('articles', { id: req.body.id }))[0]
    if (!article) return res.status(404).end()

    await app.db.update('articles', { id: req.body.id }, { tags: req.body.tags })
    res.json({})
})

router.post('/disable-comment', async (req, res) => {
    if (!req.account.admin) return res.status(401).end()
    if (!req.body) return res.status(400).end()
    if (typeof req.body.disabled !== 'boolean') return res.status(400).end()
    if (typeof req.body.id !== 'string' || !req.body.id) return res.status(400).end()

    const article = (await app.db.select('articles', { id: req.body.id }))[0]
    if (!article) return res.status(404).end()

    await app.db.update('articles', { id: req.body.id }, { disableComment: req.body.disabled })
    res.json({})
})

router.post('/password', async (req, res) => {
    if (!req.account.admin) return res.status(401).end()
    if (!req.body) return res.status(400).end()
    if (typeof req.body.password !== 'string') return res.status(400).end()
    if (typeof req.body.id !== 'string' || !req.body.id) return res.status(400).end()

    const article = (await app.db.select('articles', { id: req.body.id }))[0]
    if (!article) return res.status(404).end()

    const password = req.body.password ? sha(req.body.password).toUpperCase() : null
    await app.db.update('articles', { id: req.body.id }, { password })
    res.json({})
})

router.post('/edit', async (req, res) => {
    if (!req.account.admin) return res.status(401).end()
    if (!req.body) return res.status(400).end()
    const id = req.body.id
    const title = req.body.title
    const content = req.body.content
    if (typeof id !== 'string' || !id || typeof title !== 'string' || !title || !content || typeof content !== 'string') return res.status(400).end()

    const article = (await app.db.select('articles', { id: id }))[0]
    if (!article) return res.status(404).end()

    await app.db.update('articles', { id }, { title, content, updateTime: Date.now() })
    res.status(200).json({
        id
    })
})

router.post('/delete', async (req, res) => {
    if (!req.account.admin) return res.status(401).end()
    if (!req.body) return res.status(400).end()
    if (!req.body.id) return res.status(400).end()

    const id = req.body.id
    if (typeof id !== 'string' || !id) return res.status(400).end()

    const article = (await app.db.select('articles', { id: id }))[0]
    if (!article) return res.status(404).end()

    await app.db.delete('articles', { id: id })
    await app.db.delete('comments', { article: id })
    res.status(200).json({  })    // 返回空的JSON，因为客户端只会解析JSON
})

export { router as handler }
export const url = '/article'