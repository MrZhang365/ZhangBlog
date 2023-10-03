import { default as aes256 } from 'aes256'

export default class {
    constructor(dbManager) {
        this.db = dbManager
    }
    async middlewareGetAccount(req, res, next) {
        if (req.cookies && req.cookies.account) {
            var id
            try{
                id = aes256.decrypt(process.env.AES_KEY, req.cookies.account)
            }catch(error) {
                res.clearCookie('account')
                return res.status(400).end()
            }

            const num = Number.parseInt(id)
            if (isNaN(num)) {
                res.clearCookie('account')
                return res.status(400).end()
            }

            const account = await this.getUserById(num)
            if (!account) {
                res.clearCookie('account')
                return res.status(401).json({
                    error: 'account-not-found'
                })
            }
            if (account.banned) {
                return res.status(403).json({
                    error: 'banned',
                })
            }
            req.account = account
            next()
        }else {
            req.account = {}
            return next()
        }
    }
    get authUrl() {
        return encodeURI(`https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_OAUTH_ID}`)
    }
    get zs365AuthUrl() {
        return encodeURI(`https://365.zhangsoft.link/3rd-developer?id=${process.env.ZHANGSOFT365_ID}&callback=https://blog.zhangsoft.link/api/auth/zhangso`)
    }
    async codeToToken(code) {
        return (await (await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_OAUTH_ID,
                client_secret: process.env.GITHUB_OAUTH_SECRET,
                code,
            })
        })).json()).access_token
    }
    async getUserFromGithub(token) {
        return await (await fetch('https://api.github.com/user', {
            method: 'GET',
            headers: {
                Authorization: `token ${token}`
            },
        })).json()
    }
    async addUser(userInfo) {
        var isAdmin = false
        if ((await this.db.select('users', { admin: true })).length === 0) isAdmin = true
        await this.db.insert('users', {
            id: userInfo.id,
            username: userInfo.login,
            admin: isAdmin,
            banned: false,
            ip: userInfo.ip,
        })
    }
    async getUserById(id) {
        const got = await this.db.select('users', { id })
        return got[0] || null
    }
    async getUserByName(name) {
        const got = await this.db.select('users', { username: name })
        return got[0] || null
    }
    async getUserByFilter(filter) {
        const got = await this.db.select('users', filter)
        return got[0] || null
    }
}