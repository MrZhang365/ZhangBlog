import * as loader from './ModuleLoader.js'
import dbManager from './MongodbManager.js'
import AccountManager from './AccountManager.js'
import express from 'express'
import * as cookie from 'cookie'

async function load(app) {
    const modules = await loader.load()
    Object.keys(modules).forEach(n => {
        app.use('/api' + modules[n].url, modules[n].handler)
    })
}

async function init(app) {
    app.enable('trust proxy')
    app.use((req, res, next) => {
        req.cookies = cookie.parse(req.get('cookie') || '')
        if (req.get('Content-Type') === 'application/json') {
            var chunks = []
            req.on('data', chunk => {
                chunks.push(chunk)
            })
            req.on('end', () => {
                try{
                    const data = Buffer.concat(chunks).toString()
                    req.body = JSON.parse(data)
                    next()
                }catch (e) {
                    return res.status(400).end()
                }
            })
        }else {
            req.body = {}
            return next()
        }
    })
    app.db = new dbManager()
    app.use(app.db.middleWare.bind(app.db))
    app.accounts = new AccountManager(app.db)
    app.use(app.accounts.middlewareGetAccount.bind(app.accounts))
    await load(app)
}

global.app = express()
await init(global.app)

export default global.app