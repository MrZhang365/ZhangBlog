import Router from 'express'

const router = Router()
router.get('/list', async (req, res) => {
    if (!req.account.id) return res.json([
        {
            nick: '!ZhangBlog!',
            content: '你好，欢迎使用ZhangBlog，可以试试登录哦。',
            time: Date.now()
        }
    ])

    const data = (await app.db.select('notices', { uid: req.account.id })).sort((a, b) => b.time - a.time)
    res.json(data)
})

router.get('/delete', async (req, res) => {
    if (!req.account.id) return res.json({})

    await app.db.delete('notices', { uid: req.account.id })
    res.json({})
})

router.post('/send', async (req, res) => {
    if (!req.account.admin) return res.status(401).end()

    if (!req.body) return res.status(400).end()
    if (typeof req.body.uid !== 'number') return res.status(400).end()
    if (typeof req.body.content !== 'string' || !req.body.content) return res.status(400).end()

    await app.db.insert('notices', {
        uid: req.body.uid,
        nick: '!站长!',
        content: req.body.content,
        time: Date.now(),
    })
    res.json({})
})

export { router as handler }
export const url = '/notice'