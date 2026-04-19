const STATES = { CLOSED: 'CLOSED', OPEN: 'OPEN', HALF_OPEN: 'HALF_OPEN' };

class CircuitBreaker {
    constructor(name, { failureThreshold = 5, resetTimeout = 60000, halfOpenMax = 2 } = {}) {
        this.name = name;
        this._failureThreshold = failureThreshold;
        this._resetTimeout = resetTimeout;
        this._halfOpenMax = halfOpenMax;
        this._state = STATES.CLOSED;
        this._failures = 0;
        this._halfOpenAttempts = 0;
        this._nextAttempt = 0;
    }

    get state() { return this._state; }

    async exec(fn) {
        if (this._state === STATES.OPEN) {
            if (Date.now() < this._nextAttempt) {
                throw new Error(`Circuit breaker "${this.name}" is OPEN — failing fast`);
            }
            this._state = STATES.HALF_OPEN;
            this._halfOpenAttempts = 0;
        }

        if (this._state === STATES.HALF_OPEN && this._halfOpenAttempts >= this._halfOpenMax) {
            this._trip();
            throw new Error(`Circuit breaker "${this.name}" tripped again during HALF_OPEN`);
        }

        try {
            if (this._state === STATES.HALF_OPEN) this._halfOpenAttempts++;
            const result = await fn();
            this._onSuccess();
            return result;
        } catch (err) {
            this._onFailure();
            throw err;
        }
    }

    _onSuccess() {
        this._failures = 0;
        this._state = STATES.CLOSED;
    }

    _onFailure() {
        this._failures++;
        if (this._failures >= this._failureThreshold || this._state === STATES.HALF_OPEN) {
            this._trip();
        }
    }

    _trip() {
        this._state = STATES.OPEN;
        this._nextAttempt = Date.now() + this._resetTimeout;
    }

    stats() {
        return {
            name: this.name,
            state: this._state,
            failures: this._failures,
            nextAttempt: this._state === STATES.OPEN ? new Date(this._nextAttempt).toISOString() : null,
        };
    }
}

module.exports = { CircuitBreaker, STATES };
