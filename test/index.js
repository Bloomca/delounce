import sinon from 'sinon';
import { atLeast, atMost, sleep, queue, createDebounceReaction, debounce, limit } from '../src/index';

test('it should return correct result from value', async () => {
  const value = 5;
  const res = await atLeast(500, value);

  expect(value).toBe(res);
});

test('it should return correct result from synchronous function', async () => {
  const value = 10;
  const res = await atLeast(500, () => value);

  expect(res).toBe(value);
});

test('it should return correct result from asynchronous function', async () => {
  const value = 15;
  const fn = new Promise(res => {
    setTimeout(() => res(value), 1000);
  });
  const res = await atLeast(500, fn);

  expect(res).toBe(value);
});

test('it should resolve fast if promise resolves faster than passed time', async () => {
  const startTime = Date.now();
  const promise = new Promise(res => {
    setTimeout(res, 500);
  });
  await atMost(1000, promise);
  const passedTime = Date.now() - startTime;
  expect(passedTime < 600).toBe(true);
});

test('it should resolve after time if fn takes more than passed time', async () => {
  const startTime = Date.now();
  const promise = new Promise(res => {
    setTimeout(res, 1000);
  });
  await atMost(500, promise);
  const passedTime = Date.now() - startTime;
  expect(passedTime < 600).toBe(true);
});

test('it should queue fns in correct order', async () => {
  const spy1 = sinon.spy();
  const spy2 = sinon.spy();

  queue('test', spy1);
  queue('test', spy2).then(() => {
    sinon.assert.callOrder(spy1, spy2);
  });
});

test('it should sleep given amount of time', async () => {
  const startTime = Date.now();

  await sleep(1000);

  const difference = Date.now() - startTime;
  expect(difference > 980 && difference < 1020).toBe(true);
});

test('it should limit minimum time, if it executes faster', async () => {
  const fn = new Promise(res => setTimeout(res, 100));

  const startTime = Date.now();
  await limit({ fn, min: 150, max: 300 });

  const difference = Date.now() - startTime;
  expect(difference < 160 && difference > 140).toBe(true);
});

test('it should limit maximum time, if it executes longer', async () => {
  const fn = new Promise(res => setTimeout(res, 400));

  const startTime = Date.now();
  await limit({ fn, min: 150, max: 300 });

  const difference = Date.now() - startTime;
  expect(difference < 310 && difference > 290).toBe(true);
});

test('it should not limit time, if it executes in range', async () => {
  const fn = new Promise(res => setTimeout(res, 225));

  const startTime = Date.now();
  await limit({ fn, min: 150, max: 300 });

  const difference = Date.now() - startTime;
  expect(difference < 235 && difference > 215).toBe(true);
});
