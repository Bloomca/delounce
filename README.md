# Delounce library

[![Build Status](https://travis-ci.org/Bloomca/delounce.svg?branch=master)](https://travis-ci.org/Bloomca/delounce)

This is a small library with several functions to handle async actions, such as delay with guaranteed minimum time of execution, queue of functions and debounce function aggregator with next invokation.

## Installation

```shell
npm install --save delounce
```

## Usage example
Almost all usages make more sense when using async/await patters, but promises are fine as well.

```javascript
import { sleep } from 'delounce';

doSome();
await sleep(2000);
doStuffAfter2Seconds();
```

```javascript
import { delay } from 'delounce';

// debounce executes your code and return a promise, which will be
// resolved only after given amount of time (if passed function took less time)
// you can pass promise, function or plain value
const images = await delay({ time: 500, fn: fetchImages })
// at least 500ms passed – if more, it will be resolved immediately
showImages(images)
```

```javascript
import { wait } from 'delounce';
import { preload } from 'pic-loader';

const imgLinks = ['http://ex.com/first.jpg', 'http://ex.com/second.jpg', 'http://ex.com/third.jpg'];
// we wait one second to preload images, but if takes too much,
// we will just start to show them after one second
await wait({ fn: preload(imgLinks), time: 1000 });
showImages(imgLinks);
```

```javascript
import { queue } from 'delounce';

// rows will be fetched one after another
// we don't use await here, because we show rows right after loading
// but add all them synchronously
queue({ name: 'rows', fn: fetchRow(0) }).then(showRow);
queue({ name: 'rows', fn: fetchRow(1) }).then(showRow);
queue({ name: 'rows', fn: fetchRow(2) }).then(showRow);
```

```javascript
import { preload } from 'pic-loader';
import { limit } from 'delounce';

const imgLinks = ['http://ex.com/first.jpg', 'http://ex.com/second.jpg', 'http://ex.com/third.jpg'];
// we ensure that they will be loaded enough not to annoy with glitch, but not too long
limit({ fn: preload(imgLinks), minTime: 200, maxTime: 1000 });
```


```javascript
import { createDebounceReaction, debounce } from 'delounce';

// debounce allows you to accumulate values and then process them together
// this might be useful if you want to check favourites only of showed
// entities, but you want to add them independently to the list
createDebounceReaction({ name: 'favs', fn: (ids) => checkFavs(ids)});
debounce({ name: 'favs', fn: 'ablwe2' });
debounce({ name: 'favs', fn: 'qwqrc1' });
debounce({ name: 'favs', fn: 'pojbm7' });
debounce({ name: 'favs', fn: 'qmlpy0' });
```

## License

MIT
