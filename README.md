# Delounce library

[![Build Status](https://travis-ci.org/Bloomca/delounce.svg?branch=master)](https://travis-ci.org/Bloomca/delounce)

This is a small library with several functions to handle async actions, such as delay with guaranteed minimum time of execution, queue of functions and debounce function aggregator with next invokation.

## Installation

```shell
npm install --save delounce
```

## Usage example

```javascript
import { delay } from 'delounce';

// debounce executes your code and return a promise, which will be
// resolved only after given amount of time (if passed function took less time)
// you can pass promise, function or plain value
delay({ time: 500, fn: fetchImages })
 .then((images) => {
   // at least 500ms passed – if more, it will be resolved immediately
 });

import { wait } from 'delounce';
import { preload } from 'pic-loader';

const imgLinks = ['http://ex.com/first.jpg', 'http://ex.com/second.jpg', 'http://ex.com/third.jpg'];
// we wait one second to preload images, but if takes too much,
// we will just start to show them after one second
wait({ fn: preload(imgLinks), time: 1000 }).then(showImages);

import { queue } from 'delounce';

// rows will be fetched one after another
queue({ name: 'rows', fn: fetchRow(0) }).then(showRow);
queue({ name: 'rows', fn: fetchRow(1) }).then(showRow);
queue({ name: 'rows', fn: fetchRow(2) }).then(showRow);

import { createDebounceReaction, debounce } from 'delounce';

// debounce allows you to accumulate values and then process them together
createDebounceReaction({ name: 'favs', fn: (ids) => makeFavs(ids)});
debounce({ name: 'favs', fn: 'ablwe2' });
debounce({ name: 'favs', fn: 'qwqrc1' });
debounce({ name: 'favs', fn: 'pojbm7' });
debounce({ name: 'favs', fn: 'qmlpy0' });
```

## License

MIT
