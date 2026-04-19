class JobQueue {
    constructor(name, { concurrency = 3 } = {}) {
        this.name = name;
        this._concurrency = concurrency;
        this._running = 0;
        this._queue = [];
    }

    enqueue(fn) {
        return new Promise((resolve, reject) => {
            this._queue.push({ fn, resolve, reject });
            this._drain();
        });
    }

    _drain() {
        while (this._running < this._concurrency && this._queue.length > 0) {
            const { fn, resolve, reject } = this._queue.shift();
            this._running++;
            fn()
                .then(resolve)
                .catch(reject)
                .finally(() => {
                    this._running--;
                    this._drain();
                });
        }
    }

    async waitForAll() {
        if (this._running === 0 && this._queue.length === 0) return;
        return new Promise((resolve) => {
            const check = () => {
                if (this._running === 0 && this._queue.length === 0) return resolve();
                setTimeout(check, 100);
            };
            check();
        });
    }

    stats() {
        return {
            name: this.name,
            running: this._running,
            queued: this._queue.length,
            concurrency: this._concurrency,
        };
    }
}

module.exports = { JobQueue };
