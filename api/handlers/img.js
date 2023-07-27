// 内置图床
import { Router } from 'express'
import { default as multer } from 'multer'
import * as uuid from 'uuid'
import * as path from 'path'
import { dataUriToBuffer as uriToBuffer } from 'data-uri-to-buffer'

const router = Router()
router.get('/list', async (req, res) => {
    if (!req.account.admin) return res.status(401).end()
    const result = await app.db.select('images', {})
    const list = result.map(f => f.name)
    res.json(list)
})

router.get('/get/:name', async (req, res) => {
    const name = req.params.name
    if (!name) return res.status(400).end()

    const result = (await app.db.select('images', { name }))[0]
    if (!result) return res.status(404).end()

    res.type(result.mime)
    res.send(uriToBuffer(result.data))
})

router.post('/delete', async (req, res) => {
    if (!req.account.admin) return res.status(401).end()
    if (!req.body) return res.status(400).end()
    if (!req.body.filename) return res.status(400).end()

    const name = req.body.filename
    if (!name) return res.status(400).end()

    const file = (await app.db.select('images', { name }))[0]
    if (!file) return res.status(404).end()

    await app.db.delete('images', { name })
    res.json({})
})

router.post('/upload', multer().single('file'), async (req, res) => {
    if (!req.account.admin) return res.status(401).end()
    if (!req.body) return res.status(400).end()

    const file = req.body
    if (!file.mimetype.startsWith('image/')) return res.status(400).end()
    
    if (!path.extname(file.filename)) return res.status(400).end()

    const name = uuid.v4() + path.extname(file.filename)
    await app.db.insert('images', {
        name,
        mime: file.mimetype,
        data: file.data,
        time: Date.now(),
    })

    res.json({
        name
    })
})

export { router as handler }
export const url = '/img'