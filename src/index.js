/**
 * @overview handles functions and invokes them if needed
 * @param  {Any} rawValue – value to check whether it is function or not
 * @param  {Any} fnArg – value to invoke function with (optional)
 * @return {Any} result – result of function invokation or just rawValue
 */
function handleValue(rawValue, fnArg) {
  let value = rawValue;

  if (typeof rawValue === "function") {
    value = rawValue(fnArg);
  }

  return value;
}

/**
 * @overview function to react to result of promise
 * the whole purpose – to reuse code for .then
 * and .catch clauses of promise
 *
 * @param  {Function} params.resolver – function to resolve promise
 * @param  {Any} params.result – result to be resolved with
 * @param  {Number} params.startTime – timestamp when execution started
 * @param  {Number} params.time – minimum number of ms to be taken
 */
function reactToPromise({ resolver, result, startTime, time }) {
  const endTime = Date.now();

  const passedTime = endTime - startTime;

  if (passedTime < time) {
    setTimeout(() => {
      resolver(result);
    }, time - passedTime);
  } else {
    resolver(result);
  }
}

/**
 * @overview execute function (or Promise)
 * and if it took less time it waits and then
 * resolves the result; otherwise just resolves
 * the result immediately
 *
 * @param  {Function} params.fn – function (or Promise, or value)
 * @param  {Number} params.time – minimum number of ms to pass
 * @return {Promise} result – promise with result
 */
export function atLeast(time, fn) {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    Promise.resolve(handleValue(fn))
      .then(result => {
        reactToPromise({ resolver: resolve, result, startTime, time });
      })
      .catch(error => {
        reactToPromise({ resolver: reject, result: error, startTime, time });
      });
  });
}

/**
 * @overview waits certain time, and then, if result
 * is not ready yet, resolves it
 * it DOESN'T return resolved value, it is only for
 * reacting if it takes too much time
 * @param  {Function} params.fn – function (or Promise, or value)
 * @param  {Number} time – number of milliseconds to wait
 * @return {Promise} result – promise after resolving fn or time
 */
export function atMost(time, fn) {
  return new Promise(resolve => {
    setTimeout(resolve, time);

    Promise.resolve(handleValue(fn)).then(() => resolve());
  });
}

// this is an object to store all queues
// the whole idea is to store queues by name
// which will allow to add new promises just
// knowing the name
const queueObject = {};

/**
 * @overview allows to queue functions easily
 *
 * @param  {String} params.name – name of the queue
 * @param  {Function} fn – value to invoke after
 * @return {Promise} result – promise after resolving value
 */
export function queue(name, fn) {
  if (typeof name !== "string") {
    throw new Error(
      "first argument for delounce::queue should be a name for a queue!"
    );
  }

  if (!queueObject[name]) {
    queueObject[name] = Promise.resolve();
  }

  queueObject[name] = queueObject[name].then(res => {
    return Promise.resolve(handleValue(fn, res));
  });

  return queueObject[name];
}

/**
 * @overview resolves after given amount of time
 * @param  {Number} time – ms to wait
 * @return {Promise} result – promise after resolving on time
 */
export function sleep(time) {
  if (!time) {
    return Promise.resolve();
  } else {
    return new Promise(res => {
      setTimeout(res, time);
    });
  }
}

/**
 * @overview combination of delay and wait – at least minTime,
 * but no more than maxTime
 * @param  {Function} params.fn – function (or Promise, or value)
 * @param  {Number} minTime – minimum number of ms to execute
 * @param  {Number} maxTime – maximum number of ms to execute
 * @return {Promise} result – promise after resolving on time
 */
export function limit({ fn, min, max }) {
  const promise = atLeast(min, fn);
  return atMost(max, promise);
}

export function polling(time, fn, ...args) {
  let stop = false;
  let cancel;
  const result = {
    cancel: () => {
      if (!cancel) {
        stop = true;
      }

      cancel();
    }
  };

  result.promise = new Promise(async (resolve, reject) => {
    cancel = reject;

    // if it was canceled even before we reached this point
    if (stop) {
      reject();
    }

    // eslint-disable-next-line no-constant-condition
    while (true) {
      await sleep(time);
      let result = fn(...args);

      if (result && result.then) {
        result = await result;
      }

      if (result) {
        resolve();
      }
    }
  });

  return result;
}
