- expose event loop post function to native modules
- emitter once
- fix open rom dialog appearing behind script render overlay
- implement `EMU_LOADED_STATE`
- loadstate/savestate paths
- pj64.open(romPath, callback?: (null | Error) => void): void
- pj64.close(callback: () => void)
- write input history to a file
- debug.getsymbol? (symbol types don't line up well with the API's type IDs system)
- debug.setsymbol?
- pj64.savesetting(section, name, value)
- pj64.loadsetting(section, name)
- pj64.addmenu(null, caption, callback, menuKey)
- pj64.delmenu()
- autorun execution order
- drawing
  - make sure ctx.fill() implementation is correct
  - ctx.getimage(x, y, width, height)
  - d2d vsync toggle

```
mem.search(valueType: number, config: Object): SearchResults

    Searches memory for a scalar value.

    `config` may contain the following properties:

        `searchType`          The search type. See table below. (default: `SEARCH_EXACT_VALUE`).
        `range`               The AddressRange to search (default: `ADDR_ANY_RDRAM`).
        `value`               The value to search for. Not used if `searchType` is `SEARCH_UNKNOWN_VALUE`.

    `searchType` may be one of the following:

        `SEARCH_EXACT`        Search memory for exact value (default).
        `SEARCH_UNKNOWN`      Search for unknown value. `value` parameter is not used.
        `SEARCH_GREATER_THAN` Search for variables greater than `value`.
        `SEARCH_LESS_THAN`    Search for variables less than `value`.

    If `range` is not specified, `ADDR_ANY_RDRAM` (0x80000000 : 0x807FFFFF) is used.

mem.stringSearch(value: string, config: Object)

    Searches memory for an 8-bit character string or `Buffer`.

    `config` may contain the following properties:

        `ignoreCase`         Letter case is ignored if `true` (default: `false`).
        `unknownEncoding`    If `true`, the scanner will yield strings that have matching relative character values
                             (e.g. `"ABCD"` would match byte sequence `0x00 0x01 0x02 0x03`).

------------------------------------------

SearchResults

    results.valueType

        Value type ID.

    results.range: AddressRange
    
        Memory range that was searched.
    
    results.numResults

        Number of results.

    results.getResult(index): SearchResultItem

        Returns the SearchResultItem at `index`.

    results.narrow(narrowType[, newValue]): void

        Narrows the search results.

        `NARROW_EXACT`          Keeps results that are equal to `newValue`.
        `NARROW_GREATER_THAN`   Keeps results that are greater than `newValue`.
        `NARROW_LESS_THAN`      Keeps results that are less than `newValue`.
        `NARROW_CHANGED`        Keeps results that have changed.
        `NARROW_UNCHANGED`      Keeps results that have not changed.
        `NARROW_INCREASED`      Keeps results that have increased.
        `NARROW_DECREASED`      Keeps results that have decreased.

------------------------------------------

SearchResultItem

    item.valueType
    item.size
    item.address
    item.oldValue       
    item.currentValue   the current value in memory

--------------------------------------
```