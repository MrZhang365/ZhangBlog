// 获取文章信息
import { Router } from 'express'

const router = Router()
router.get('/list', async (req, res) => {
    if (!req.account.admin) return res.status(401).end()

    const users = await app.db.select('users', { })
    res.json(users)
})

router.post('/ban', async (req, res) => {
    if (!req.account.admin) return res.status(401).end()
    if (typeof req.body.id !== 'number') return res.status(400).end()

    const user = (await app.db.select('users', { id: req.body.id }))[0]
    if (!user) return res.status(404).end()

    await app.db.update('users', { id: req.body.id }, { banned: true })
    res.json({})
})

router.post('/unban', async (req, res) => {
    if (!req.account.admin) return res.status(401).end()
    if (typeof req.body.id !== 'number') return res.status(400).end()

    const user = (await app.db.select('users', { id: req.body.id }))[0]
    if (!user) return res.status(404).end()

    await app.db.update('users', { id: req.body.id }, { banned: false })
    res.json({})
})

export { router as handler }
export const url = '/users'