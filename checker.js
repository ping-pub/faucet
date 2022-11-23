import { Level } from "level";

const WINDOW = 86400 * 1000 // milliseconds in a day
// const WINDOW = 20 * 1000 // 20s for test

export class FrequencyChecker {
    constructor(conf) {
        this.conf = conf
        this.db = new Level(conf.db.path, { valueEncoding: 'json' });
    }

    async check(address, onAccept, onReject)  {
        const conf = this.conf
        this.db.get(address, (err, value) => {
            const now = Date.now()
            const limit = Number(conf.tx.frequency_in_24h) // Date.now() - value.timestamp > WINDOW &&
            // console.log('checker:', err, value.length < limit, value.filter( x => x + WINDOW > now  ).length < limit )
            if(err || value.length < limit || value.filter( x => x + WINDOW > now  ).length < limit) {
                onAccept()
            } else {
                onReject()
            }
        })
    }

    async update(address)  {
        const db = this.db
        db.get(address, function(err, value) {    
            if (err) {
              db.put(address, [Date.now()])
            } else {
              value.push(Date.now())
              db.put(address, value)
            }
          });
    }
}
