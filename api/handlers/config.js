import Router from 'express'

const router = Router()
router.post('/init-about', async (req, res) => {
    if (!req.account.admin) return res.status(401).end()
    if (!req.body) return res.status(400).end()

    const config = req.body
    
    for (let key of ['title', 'subtitle']) {
        if (typeof config.site[key] !== 'string' || !config.site[key]) return res.status(400).end()
    }

    for (let key of ['nick', 'about', 'head']) {
        if (typeof config.author[key] !== 'string' || !config.author[key]) return res.status(400).end()
    }

    config.author.socialize = {}
    config.author.friends = {}

    config.site.name = 'site'
    config.author.name = 'author'

    await app.db.delete('about', {  })
    await app.db.insert('about', config.site)
    await app.db.insert('about', config.author)
    res.json({})
})

router.post('/basic-about-author', async (req, res) => {
    if (!req.account.admin) return res.status(401).end()
    if (!req.body) return res.status(400).end()
    if (!req.body.key || typeof req.body.key !== 'string') return res.status(400).end()
    if (!req.body.value || typeof req.body.value !== 'string') return res.status(400).end()

    if (!['nick', 'about', 'head'].includes(req.body.key)) return res.status(400).end()

    const newData = {}
    newData[req.body.key] = req.body.value

    await app.db.update('about', { name: 'author' }, newData)
    res.json({})
})

router.post('/basic-about-site', async (req, res) => {
    if (!req.account.admin) return res.status(401).end()
    if (!req.body) return res.status(400).end()
    if (!req.body.key || typeof req.body.key !== 'string') return res.status(400).end()
    if (!req.body.value || typeof req.body.value !== 'string') return res.status(400).end()

    if (!['title', 'subtitle'].includes(req.body.key)) return res.status(400).end()

    const newData = {}
    newData[req.body.key] = req.body.value

    await app.db.update('about', { name: 'site' }, newData)
    res.json({})
})

router.post('/friend', async (req, res) => {
    if (!req.account.admin) return res.status(401).end()
    if (!req.body) return res.status(400).end()
    
    const title = req.body.title
    const link = req.body.link
    if (typeof title !== 'string' || typeof link !== 'string' || !title || !link) return res.status(400).end()

    var nowAbout = (await app.db.select('about', { name: 'author' }))[0]
    if (link !== 'DELETE') nowAbout.friends[title] = link
    else delete nowAbout.friends[title]
    await app.db.update('about', { name: 'author' }, { friends: nowAbout.friends })
    res.json({})
})

router.get('/disable-comment', async (req, res) => {
    if (!(await app.db.select('config', { name: 'disable-comment' }))[0]) {
        await app.db.delete('config', { name: 'disable-comment' })
        await app.db.insert('config', {
            name: 'disable-comment',
            data: false
        })
    }

    const result = {
        disabled: (await app.db.select('config', { name: 'disable-comment' }))[0].data
    }

    res.json(result)
})

router.post('/disable-comment', async (req, res) => {
    if (!req.account.admin) return res.status(401).end()
    if (!req.body) return res.status(400).end()
    if (typeof req.body.disabled !== 'boolean') return res.status(400).end()

    await app.db.delete('config', { name: 'disable-comment' })
    await app.db.insert('config', {
        name: 'disable-comment',
        data: req.body.disabled
    })

    res.json({})
})

export const url = '/config'
export { router as handler }