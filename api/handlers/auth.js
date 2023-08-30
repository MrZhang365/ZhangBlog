import Router from 'express'
import { default as aes256 } from 'aes256'

const router = Router()

export function strToAes(str, key) {
    return aes256.encrypt(key, str)
}

export function aesToStr(str, key) {
    try{
        return aes.decrypt(key, str)
    } catch(e) {
        return ''
    }
}

router.get('/login', (req, res) => {
    res.clearCookie('account')
    res.status(302)
    res.setHeader('Location', global.app.accounts.authUrl)
    res.end()
})

router.get('/github-callback', async (req, res) => {
    res.clearCookie('account')
    if (req.query.error === 'access_denied') return res.redirect('/login/error-cancel.html')
    if (!req.query.code) return res.status(400).end()
    const code = req.query.code

    const token = await app.accounts.codeToToken(code)
    const userInfo = await app.accounts.getUserFromGithub(token)
    userInfo.ip = req.ip

    if (userInfo.type !== 'User') return res.redirect('/login/error-not-user.html')
    
    var user = await app.accounts.getUserById(userInfo.id)
    if (!user) {
        await app.accounts.addUser(userInfo)
        app.db.insert('notices', {
            uid: userInfo.id,
            nick: userInfo.login,
            content: `${userInfo.login} 首次登录了你的博客，你的粉丝又多了一位。`,
            time: Date.now(),
        })    // 异步给站长发送通知
        user = userInfo
    } else {
        await app.db.update('users', { id: user.id }, { username: userInfo.login })
    }

    if (user.banned) return res.redirect('/login/error-account-banned.html')

    const userAes = strToAes(user.id.toString(), process.env.AES_KEY)
    res.cookie('account', userAes, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    })

    if (user.admin) return res.redirect('/login/success-admin.html')
    else return res.redirect('/login/success-user.html')
})

router.get('/account-get', (req, res) => {
    const account = req.account
    const payload = {
        logined: false
    }

    if (account._id) {
        const info = ['id', 'username', 'admin']
        for (let i of info) {
            payload[i] = account[i]
        }
        payload.logined = true
    }

    res.json(payload)
})

router.get('/logout', (req, res) => {
    // 说实话，这个代码是多余的设计，因为这个功能客户端就可以直接实现
    res.clearCookie('account')
    res.redirect('/login')
})

export { router as handler }
export const url = '/auth'