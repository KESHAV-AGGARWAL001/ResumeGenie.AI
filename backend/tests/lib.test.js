const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { TieredCache } = require('../lib/cache');
const { hashContent } = require('../lib/hashUtil');
const { CircuitBreaker } = require('../lib/circuitBreaker');
const { JobQueue } = require('../lib/jobQueue');

// ─── Cache ─────────────────────────────────────────────────────────
describe('TieredCache', () => {
    it('stores and retrieves values', () => {
        const cache = new TieredCache();
        cache.set('key', 'value');
        assert.equal(cache.get('key'), 'value');
    });

    it('returns undefined for missing keys', () => {
        const cache = new TieredCache();
        assert.equal(cache.get('missing'), undefined);
    });

    it('expires entries after TTL', async () => {
        const cache = new TieredCache({ defaultTTL: 50 });
        cache.set('key', 'value');
        assert.equal(cache.get('key'), 'value');
        await new Promise((r) => setTimeout(r, 80));
        assert.equal(cache.get('key'), undefined);
    });

    it('evicts oldest entry when maxSize is reached', () => {
        const cache = new TieredCache({ maxSize: 2 });
        cache.set('a', 1);
        cache.set('b', 2);
        cache.set('c', 3);
        assert.equal(cache.get('a'), undefined);
        assert.equal(cache.get('b'), 2);
        assert.equal(cache.get('c'), 3);
    });

    it('refreshes LRU order on get', () => {
        const cache = new TieredCache({ maxSize: 2 });
        cache.set('a', 1);
        cache.set('b', 2);
        cache.get('a'); // refresh 'a'
        cache.set('c', 3); // should evict 'b', not 'a'
        assert.equal(cache.get('a'), 1);
        assert.equal(cache.get('b'), undefined);
    });

    it('tracks hit/miss stats', () => {
        const cache = new TieredCache();
        cache.set('x', 1);
        cache.get('x'); // hit
        cache.get('y'); // miss
        const stats = cache.stats();
        assert.equal(stats.hits, 1);
        assert.equal(stats.misses, 1);
        assert.equal(stats.hitRate, '50.0%');
    });

    it('has() returns false for expired entries', async () => {
        const cache = new TieredCache({ defaultTTL: 30 });
        cache.set('k', 'v');
        assert.equal(cache.has('k'), true);
        await new Promise((r) => setTimeout(r, 60));
        assert.equal(cache.has('k'), false);
    });

    it('delete removes entries', () => {
        const cache = new TieredCache();
        cache.set('k', 'v');
        cache.delete('k');
        assert.equal(cache.get('k'), undefined);
    });
});

// ─── Hash ──────────────────────────────────────────────────────────
describe('hashContent', () => {
    it('produces consistent SHA-256 hashes', () => {
        const h1 = hashContent('hello');
        const h2 = hashContent('hello');
        assert.equal(h1, h2);
        assert.equal(h1.length, 64);
    });

    it('produces different hashes for different input', () => {
        assert.notEqual(hashContent('a'), hashContent('b'));
    });

    it('handles objects by JSON-serializing', () => {
        const h1 = hashContent({ a: 1, b: 2 });
        const h2 = hashContent({ a: 1, b: 2 });
        assert.equal(h1, h2);
    });
});

// ─── Circuit Breaker ───────────────────────────────────────────────
describe('CircuitBreaker', () => {
    it('stays CLOSED on success', async () => {
        const cb = new CircuitBreaker('test');
        const result = await cb.exec(() => Promise.resolve('ok'));
        assert.equal(result, 'ok');
        assert.equal(cb.state, 'CLOSED');
    });

    it('opens after failureThreshold failures', async () => {
        const cb = new CircuitBreaker('test', { failureThreshold: 2, resetTimeout: 100 });
        const fail = () => cb.exec(() => Promise.reject(new Error('fail')));

        await assert.rejects(fail);
        await assert.rejects(fail);
        assert.equal(cb.state, 'OPEN');

        await assert.rejects(
            () => cb.exec(() => Promise.resolve('ok')),
            /OPEN/
        );
    });

    it('transitions to HALF_OPEN after resetTimeout', async () => {
        const cb = new CircuitBreaker('test', { failureThreshold: 1, resetTimeout: 50 });
        await assert.rejects(() => cb.exec(() => Promise.reject(new Error('fail'))));
        assert.equal(cb.state, 'OPEN');

        await new Promise((r) => setTimeout(r, 80));
        const result = await cb.exec(() => Promise.resolve('recovered'));
        assert.equal(result, 'recovered');
        assert.equal(cb.state, 'CLOSED');
    });

    it('reports stats', () => {
        const cb = new CircuitBreaker('my-service');
        const stats = cb.stats();
        assert.equal(stats.name, 'my-service');
        assert.equal(stats.state, 'CLOSED');
        assert.equal(stats.failures, 0);
    });
});

// ─── Job Queue ─────────────────────────────────────────────────────
describe('JobQueue', () => {
    it('executes jobs and returns results', async () => {
        const q = new JobQueue('test');
        const result = await q.enqueue(() => Promise.resolve(42));
        assert.equal(result, 42);
    });

    it('respects concurrency limit', async () => {
        const q = new JobQueue('test', { concurrency: 2 });
        let running = 0;
        let maxRunning = 0;

        const job = () =>
            new Promise((resolve) => {
                running++;
                maxRunning = Math.max(maxRunning, running);
                setTimeout(() => { running--; resolve(); }, 30);
            });

        await Promise.all([q.enqueue(job), q.enqueue(job), q.enqueue(job), q.enqueue(job)]);
        assert.ok(maxRunning <= 2, `Max running was ${maxRunning}, expected <= 2`);
    });

    it('propagates errors', async () => {
        const q = new JobQueue('test');
        await assert.rejects(
            () => q.enqueue(() => Promise.reject(new Error('boom'))),
            /boom/
        );
    });

    it('reports stats', () => {
        const q = new JobQueue('compile', { concurrency: 3 });
        const stats = q.stats();
        assert.equal(stats.name, 'compile');
        assert.equal(stats.concurrency, 3);
        assert.equal(stats.running, 0);
        assert.equal(stats.queued, 0);
    });
});
