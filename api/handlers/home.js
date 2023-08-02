// 获取首页信息
import Router from 'express'

const router = Router()
router.get('/', async (req, res) => {
    const payload = {}
    
    // ********** 处理文章列表 开始 **********
    const articles = (await app.db.select('articles', {})).map(a => {
        if (a.content.length > 60) a.content = a.content.slice(0, 60) + '...'    // 如果文章内容超过60个字，则截取前60字并加上省略号
        if (a.password && !req.account.admin) a.content = `请输入密码以查看本文章`
        delete a.password    // 管你有没有 格杀勿论
        return a
    }).sort((a, b) => b.time - a.time)    // 获取全部文章，然后处理一下

    const pages = []
	for (let i = 0; i < Math.ceil(articles.length / 10); i++) {
		pages.push([])
	}
	for (let i in pages) {
		pages[i] = articles.splice(0, 10)
	}

    var index = Number.parseInt(req.query.index) - 1
    if (isNaN(index) || index < 0) index = 0
    if (index > pages.length - 1) return res.status(400).end()

    payload.articles = pages[index]
    payload.index = {
        now: index + 1,
        all: pages.length
    }
    // ********** 处理文章列表 结束 **********

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