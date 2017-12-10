import sinon from "sinon";
import { atLeast, atMost, sleep, queue, limit, polling } from "../src/index";

test("it should return correct result from value", async () => {
  const value = 5;
  const res = await atLeast(100, value);

  expect(value).toBe(res);
});

test("it should return correct result from synchronous function", async () => {
  const value = 10;
  const res = await atLeast(100, () => value);

  expect(res).toBe(value);
});

test("it should return correct result from asynchronous function", async () => {
  const value = 15;
  const fn = new Promise(res => {
    setTimeout(() => res(value), 100);
  });
  const res = await atLeast(50, fn);

  expect(res).toBe(value);
});

test("it should resolve fast if promise resolves faster than passed time", async () => {
  const startTime = Date.now();
  const promise = new Promise(res => {
    setTimeout(res, 50);
  });
  await atMost(1000, promise);
  const passedTime = Date.now() - startTime;
  expect(passedTime < 60).toBe(true);
});

test("it should resolve after time if fn takes more than passed time", async () => {
  const startTime = Date.now();
  const promise = new Promise(res => {
    setTimeout(res, 100);
  });
  await atMost(50, promise);
  const passedTime = Date.now() - startTime;
  expect(passedTime < 60).toBe(true);
});

test("it should queue fns in correct order", async () => {
  const spy1 = sinon.spy();
  const spy2 = sinon.spy();

  queue("test", spy1);
  queue("test", spy2).then(() => {
    sinon.assert.callOrder(spy1, spy2);
  });
});

test("it should sleep given amount of time", async () => {
  const startTime = Date.now();

  await sleep(100);

  const difference = Date.now() - startTime;
  expect(difference > 90 && difference < 110).toBe(true);
});

test("it should limit minimum time, if it executes faster", async () => {
  const fn = new Promise(res => setTimeout(res, 100));

  const startTime = Date.now();
  await limit({ fn, min: 150, max: 300 });

  const difference = Date.now() - startTime;
  expect(difference < 160 && difference > 140).toBe(true);
});

test("it should limit maximum time, if it executes longer", async () => {
  const fn = new Promise(res => setTimeout(res, 400));

  const startTime = Date.now();
  await limit({ fn, min: 150, max: 300 });

  const difference = Date.now() - startTime;
  expect(difference < 310 && difference > 290).toBe(true);
});

test("it should not limit time, if it executes in range", async () => {
  const fn = new Promise(res => setTimeout(res, 225));

  const startTime = Date.now();
  await limit({ fn, min: 150, max: 300 });

  const difference = Date.now() - startTime;
  expect(difference < 235 && difference > 215).toBe(true);
});

test("polling should invoke until fn returns true", async () => {
  let i = 0;
  const poll = () => {
    i++;
    if (i === 3) {
      return true;
    }
  };

  await polling(50, poll).promise;

  expect(i).toBe(3);
});

test("polling should not invoke fn in case of cancelling", async () => {
  let i = 0;
  const poll = () => {
    i++;
    if (i === 3) {
      return true;
    }
  };

  const { cancel } = polling(50, poll);
  await sleep(80);
  cancel();

  expect(i).toBe(1);
});

test("polling should accept async poll function", async () => {
  let i = 0;
  const poll = async () => {
    await sleep(10);
    i++;
    if (i === 3) {
      return true;
    }
  };

  await polling(50, poll).promise;

  expect(i).toBe(3);
});
