// 获取首页信息
import Router from 'express'

const router = Router()
router.get('/', async (req, res) => {
    const payload = {}
    
    payload.articles = (await app.db.select('articles', {})).map(a => {
        if (a.content.length > 60) a.content = a.content.slice(0, 60) + '...'    // 如果文章内容超过20个字，则截取前20字并加上省略号
        return a
    }).sort((a, b) => b.time - a.time)    // 获取全部文章，然后处理一下

    const abouts = await app.db.select('about', {})

    const aboutSite = abouts.find(a => a.name === 'site')    // 网站信息
    delete aboutSite._id    // 删除 _id
    payload.site = aboutSite

    const aboutAuthor = abouts.find(a => a.name === 'author')    // 个人信息
    delete aboutAuthor._id
    payload.author = aboutAuthor

    res.json(payload)    // 发送JSON响应信息
})

export { router as handler }
export const url = '/home'