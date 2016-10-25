/**
 * @overview handles functions and invokes them if needed
 * @param  {Any} rawValue – value to check whether it is function or not
 * @param  {Any} fnArg – value to invoke function with (optional)
 * @return {Any} result – result of function invokation or just rawValue
 */
function handleValue(rawValue, fnArg) {
  let value = rawValue;

  if (typeof rawValue === 'function') {
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
export function delay({ fn, time }) {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    Promise
      .resolve(handleValue(fn))
      .then(result => {
        reactToPromise({ resolver: resolve, result, startTime, time });
      })
      .catch(error => {
        reactToPromise({ resolver: reject, result: error, startTime, time });
      });
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
export function queue({ name = '__default', fn }) {
    if (!queueObject[name]) {
      queueObject[name] = Promise.resolve();
    }

    queueObject[name] = queueObject[name].then(res => {
      return Promise.resolve(handleValue(fn, res))
    });

    return queueObject[name];
}

// this is a dictionary for holding debouncing sequences
// we hold them by name and keep all info there
const debounceObject = {};

export function createDebounceReaction({ name, fn, time }) {
  if (!name || !fn || !time) {
    throw new Error('Delounce error – for debounce object creating you should provide all data');
  }

  debounceObject[name] = {
    time,
    fn,
    fns: [],
    promises: []
  };
}

export function debounce({ name, fn, time, reaction }) {
  const o = debounceObject[name];

  if (!o) {
    throw new Error('Delounce error – there is no debounce object with such name!');
  }

  // if we have new values, we have to rewrite them
  if (time) {
    o.time = time;
  }

  if (reaction) {
    o.fn = reaction;
  }

  // clear old timer
  if (o.timer) {
    clearTimeout(o.timer);
  }

  let resolveFunction;

  new Promise((resolve) => {
    resolveFunction = resolve;
  });

  o.fns.push(fn);
  o.promises.push(resolveFunction);
  const timer = setTimeout(() => {
    const result = o.fn(o.fns);

    Promise
      .resolve(result)
      .then(() => o.promises.forEach(resolve => resolve()));

    o.timer = null;
    o.fns = [];
    o.promises = [];
  }, o.time);
  o.timer = timer;

  return resolveFunction;
}
