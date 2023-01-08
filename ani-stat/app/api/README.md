# Shikimori API implementation

## About

It's very simply typed lib for Shikimori API.

## Utils

I didn't find any schema (JSON, XML or something) for Shikimori API so I had to write this script for auto-parsing request schema directly in browser:

```JS
Object.values($0.children).map((tr) => {
  const [nameCell, valueCell] = tr.children;
	[hisname, , nonRequide] = nameCell.children
	const cellValues = valueCell.querySelector('ul')?.firstElementChild?.textContent || ''
	let values = 'unknown';
	if (cellValues.includes('Must be a number')) values = 'number;';
	if (cellValues.includes('Must be a String')) values = 'string;';
	if (cellValues.includes('Must be one of')) values = `'${cellValues.split(':')[1].replaceAll(/[\s\n]+/gi, '').replaceAll(',','\' | \'')}';`;
  if (values === 'unknown' && valueCell.firstElementChild.textContent.includes('List of')) values = 'string;';
return `${hisname.textContent}${nonRequide ? '?' : ''}: ${values}`
}).join('\n')
```

For example, just go to https://shikimori.one/api/doc/1.0/animes/index, open dev tools, select by mouse `<tbody>` element of Parameters table (or replace `$0` in code to value where `<tbody>` element already contains), paste the code above into console and press `Ctrl+Enter`. That's it, you got the content for your TypeScript interface for request of anime method.

Don't forget that there is a lot of strange types (for example, the `season` section of animes request has only "Exapmles" in type description column, but it's literally `string`), so you still should to validate any `unknown` types.
