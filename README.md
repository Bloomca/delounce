# Delounce library

This is a small library with several functions to handle async actions, such as delay with guaranteed minimum time of execution, queue of functions and debounce function aggregator with next invokation

## Usage example

```javascript
import { delay, queue, createDebounceReaction, debounce } from 'delounce';

// debounce executes your code and return a promise, which will be
// resolved only after given amount of time (if passed function took less time)
// you can pass promise, function or plain value
delay({ time: 500, fn: fetchImages })
 .then((images) => {
   // at least 500ms passed – if more, it will be resolved immediately
 });

// rows will be fetched one after another
queue({ name: 'rows', fn: fetchRow(0) }).then(showRow);
queue({ name: 'rows', fn: fetchRow(1) }).then(showRow);
queue({ name: 'rows', fn: fetchRow(2) }).then(showRow);

// debounce allows you to accumulate values and then process them together
createDebounceReaction({ name: 'favs', fn: (ids) => makeFavs(ids)});
debounce({ name: 'favs', fn: 'ablwe2' });
debounce({ name: 'favs', fn: 'qwqrc1' });
debounce({ name: 'favs', fn: 'pojbm7' });
debounce({ name: 'favs', fn: 'qmlpy0' });
```

## Installiation

```shell
npm install --save delounce
```

## License

MIT
