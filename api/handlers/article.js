// 获取首页信息
import { Router } from 'express'
import * as uuid from 'uuid'

const router = Router()
router.get('/get', async (req, res) => {
    const id = req.query.id
    if (!id) return res.status(400).end()

    const got = (await app.db.select('articles', { id: id }))[0]
    if (!got) return res.status(404).end()

    res.json(got)
})

router.get('/all', async (req, res) => {
    const articles = await app.db.select('articles', {})
    res.json(articles.sort((a, b) => b.time - a.time))
})

router.post('/publish', async (req, res) => {
    if (!req.account.admin) return res.status(401).end()
    if (!req.body) return res.status(400).end()
    const title = req.body.title
    const content = req.body.content
    if (typeof title !== 'string' || !title || !content || typeof content !== 'string') return res.status(400).end()

    const id = uuid.v4()
    app.db.insert('articles', {
        id, title, content,
        time: Date.now(),
    })
    res.status(200).json({
        id
    })
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
    const id = req.body.id
    if (typeof id !== 'string' || !id) return res.status(400).end()

    const article = (await app.db.select('articles', { id: id }))[0]
    if (!article) return res.status(404).end()

    await app.db.delete('articles', { id: id })
    res.status(200).json({  })    // 返回空的JSON，因为客户端只会解析JSON
})

export { router as handler }
export const url = '/article'