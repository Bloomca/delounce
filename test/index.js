import test from 'ava';

import sinon from 'sinon';
import { delay, wait, queue, createDebounceReaction, debounce } from '../src/index';

test('it should return correct result from value', async t => {
  const value = 5;
  const res = await delay({ fn: value, time: 500 });

  t.is(value, res);
});

test('it should return correct result from synchronous function', async t => {
  const value = 10;
  const res = await delay({ fn: () => value, time: 500 });

  t.is(res, value);
});

test('it should return correct result from asynchronous function', async t => {
  const value = 15;
  const fn = new Promise(res => {
    setTimeout(() => res(value), 1000);
  });
  const res = await delay({ fn, time: 500 });

  t.is(res, value);
});

test('it should resolve fast if promise resolves faster than passed time', async t => {
  const startTime = Date.now();
  const promise = new Promise(res => {
    setTimeout(res, 500);
  });
  await wait({ fn: promise, time: 1000 });
  const passedTime = Date.now() - startTime;
  t.true(passedTime < 600);
});

test('it should resolve after time if fn takes more than passed time', async t => {
  const startTime = Date.now();
  const promise = new Promise(res => {
    setTimeout(res, 1000);
  });
  await wait({ fn: promise, time: 500 });
  const passedTime = Date.now() - startTime;
  t.true(passedTime < 600);
});

test('it should queue fns in correct order', async t => {
  const spy1 = sinon.spy();
  const spy2 = sinon.spy();

  queue({ name: 'test', fn: spy1 });
  queue({ name: 'test', fn: spy2 }).then(() => {
    sinon.assert.callOrder(spy1, spy2);
  });
});

test('it should throw error if no enough info for debounce object creation', t => {
  t.throws(() => {
    createDebounceReaction({ name: '123' });
  });
});

test('it should throw error if name for debounce doesn\'t exist', t => {
  t.throws(() => {
    debounce({ name: '456' });
  });
});

test.cb('it should invoke reaction with correct arguments', t => {
  t.plan(2);
  createDebounceReaction({
    name: '789',
    fn: function(args) {
      t.is(args.length, 3);
      t.deepEqual(args.map(fn => fn()), [5, 10, 15]);
      t.end();
    },
    time: 100
  });

  debounce({ name: '789', fn: () => 5 });
  debounce({ name: '789', fn: () => 10 });
  debounce({ name: '789', fn: () => 15 });
});
