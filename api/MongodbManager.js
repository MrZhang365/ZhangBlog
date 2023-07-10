import * as mongodb from 'mongodb'

export default class {
    constructor() {
        this.client = new mongodb.MongoClient(process.env.MONGODB_URI, {
            serverApi: {
                version: mongodb.ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        })
    }
    async middleWare(req, res, next) {
        await this.client.connect()
        next()
    }
    async insert(table, data) {
        await this.client.db('blog').collection(table).insertOne(data)
    }
    async delete(table, filter) {
        await this.client.db('blog').collection(table).deleteMany(filter)
    }
    async update(table, filter, data) {
        await this.client.db('blog').collection(table).updateMany(filter, {
            $set: data
        })
    }
    async select(table, filter) {
        return await this.client.db('blog').collection(table).find(filter).toArray()
    }
}