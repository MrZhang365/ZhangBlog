import * as path from 'path'
import * as fs from 'fs'

export function verifyStrings(...strings) {
    for (let i of strings) if (typeof i !== 'string' || !i) return false
    return true
}

export async function load() {
    const modules = {}
    const files = fs.readdirSync(path.resolve('.', 'api', 'handlers')).filter(f => f.endsWith('.js') && !f.startsWith('.') || !f.startsWith('_'))
    for (let i of files) {
        try {
            var loaded = await import(`file://${path.resolve(path.resolve('.', 'api', 'handlers', i))}`)
            if (!verifyStrings(loaded.url)) throw new TypeError(`This module has a f**king string`)
            if (typeof loaded.handler !== 'function') throw new TypeError(`This module has a f**king handler function`)
            modules[i] = loaded
        } catch(e) {
            console.error(`Failed to load ${i}: ${e.message}`)
        }
    }
    return modules
}