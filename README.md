# Delounce library

[![Build Status](https://travis-ci.org/Bloomca/delounce.svg?branch=master)](https://travis-ci.org/Bloomca/delounce)
[![npm version](https://badge.fury.io/js/delounce.svg)](https://badge.fury.io/js/delounce)
[![Coverage Status](https://coveralls.io/repos/github/Bloomca/delounce/badge.svg?branch=master)](https://coveralls.io/github/Bloomca/delounce?branch=master)
[![dependencies Status](https://david-dm.org/bloomca/delounce/status.svg)](https://david-dm.org/bloomca/delounce)

We all have bunch of "utility" functions in all our projects. We are pretty used to libraries like [lodash](https://lodash.com/), which take this burden off of us (think about functions like [debounce](https://lodash.com/docs/4.17.4#debounce)); but modern JS applications become more and more asynchronous, and this library tries to fill this gap.

## Installation

```shell
npm install --save delounce
```

## API

> Note: this library requires existing global `Promise`, so you might have to use [native polyfill](https://github.com/stefanpenner/es6-promise), [babel-polyfill](https://babeljs.io/docs/usage/polyfill/) or other promises implementation, like [Bluebird](https://github.com/petkaantonov/bluebird).

> In examples we use [async/await](https://developers.google.com/web/fundamentals/getting-started/primers/async-functions), which were standartised some time ago and [available in all major browsers](http://caniuse.com/#feat=async-functions). However, feel free to use normal promises – each time we await something, we can safely add `.then` to it and write normal callback.

All `time` parameters take it in milliseconds (so, `1000` is equal to 1 second).

### sleep

Simple function to wait some time – for tests, for imitating server response, or for polling.

```javascript
import { sleep } from 'delounce';

doSome();
await sleep(2000);
doStuffAfter2Seconds();
```

### atLeast

Function, which will execute given function and ensure that it took _at least_ given amount of time. It might be helpful, for instance, if your server is too fast, and it creates annoying flashing; or you want to ensure that user noticed processing.

```javascript
import { atLeast } from 'delounce';

// atLeast executes your code and return a promise, which will be
// resolved only after given amount of time (if passed function took less time)
// you can pass promise, function or plain value
const images = await atLeast(500, fetchImages);
// at least 500ms passed – if more, it will be resolved immediately
showImages(images);
```

### atMost

The opposite of the previous function – we set upper limit, so it if takes longer than given amount time, we resolve promise. Also, please note that for consistency we don't resolve with anything (if it times out, with which data should we resolve?), so you should use only as an indicator of loading.

```javascript
import { atMost } from 'delounce';
import { preload } from 'pic-loader';

const imgLinks = ['http://ex.com/first.jpg', 'http://ex.com/second.jpg', 'http://ex.com/third.jpg'];
// we wait one second to preload images, but if takes too much,
// we will just start to show them after one second
await atMost(1000, preload(imgLinks));
showImages(imgLinks);
```

### limit

This function combines `atLeast` and `atMost`, executing given function, but ensuring, that it takes not more and not less than provided timing.

```javascript
import { preload } from 'pic-loader';
import { limit } from 'delounce';

const imgLinks = ['http://ex.com/first.jpg', 'http://ex.com/second.jpg', 'http://ex.com/third.jpg'];
// we ensure that they will be loaded enough not to annoy with glitch, but not too long
limit({ fn: preload(imgLinks), min: 200, max: 1000 });
```

### queue

Queues are pretty straightforward with promises (and even more with async/await) – you just chain promises with `.then`, or with usual code using `await ...` in each line. The problem is, though, that everything should be executed in one place, so all these promises know about each other.
This function places promises one after another based on a name, so we can add these promises independently. For instance, we can show rows one by one, just using name `rows`.

```javascript
import { queue } from 'delounce';

// rows will be fetched one after another
// we don't use await here, because we show rows right after loading
// but add all them synchronously
queue('rows', fetchRow(0)).then(showRow);
queue('rows', fetchRow(1)).then(showRow);
queue('rows', fetchRow(2)).then(showRow);
```

### polling

Sometimes we execute some operation (for instance, pay bills), but there is no direct response; so we have to poll results until we get positive response. Also, sometimes we want to cancel polling, in case we left needed page, for instance.

```js
import { polling } from 'delounce';

// will be executed after 500 / 1000 / 1500 / 2000 / etc
// checkData should return truthy value (or promise which will be
// resolved with truthy value)
// { id: 5 } – will be the first argument with which checkData
// is invoked
const { promise, cancel } = polling(500, checkData, { id: 5 });

// after returning truthy value
promise.then();

// stop polling; promise will be rejected, so you have to
// add promise.catch() to handle it
cancel();
```

## License

MIT
