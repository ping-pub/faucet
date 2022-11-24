import { Level } from "level";

const WINDOW = 86400 * 1000 // milliseconds in a day
// const WINDOW = 20 * 1000 // 20s for test

export class FrequencyChecker {
    constructor(conf) {
        this.conf = conf
        this.db = new Level(conf.db.path, { valueEncoding: 'json' });
    }

    async check(source, limit) {
        return new Promise((resolve) => {
            this.db.get(source, function (err, value) {
                console.log(source, err, value)
                const now = Date.now()
                if (err || value && value.filter(x => now - x < WINDOW).length < limit) {
                    resolve(true)
                    console.log(source, limit, value, true)
                } else {
                    resolve(false)
                    console.log(source, limit, false)
                }
            });
        })
    }

    async checkIp(ip) {
        return this.check(ip, this.conf.limit.ip)
    }

    async checkAddress(address) {
        return this.check(address, this.conf.limit.address)
    }

    async update(source) {
        const db = this.db
        db.get(source, function (err, history) {
            if (err) {
                db.put(source, [Date.now()])
            } else {
                history.push(Date.now())
                db.put(source, history)
            }
        });
    }
}
