# Observations made during programming

## 2024 Day 1

Things that felt clumsy compared to earlier C# attemts:

- string split creates an empty line that needs to be ignored
- If I was to use Object.groupBy instead of the ImmutableJS equivalent, my keys
  would end up being strings even though they were numbers to begin with
- What about Map, what about making a helper for Map.map or Object.map...

## 2024 Day 2

Recording still to be analysed. Biggest issue was typechecking for reduce with a
complex state object. I didn't know that string fields wouldn't be inferred as
matching the type without hints.

## 2024 Day 3

Recording still to be analysed. Reasonably smooth, using regexes, but...

- Definitely need a util to pull sample input for testing
- First (regex-based) approach to part 2 was logically wrong
  - learning about negative lookbehind seemed like a possibility, but seemed to
    involve too much reading. Also, unclear if it would have A) applied, and B)
    been supported
- Second, more direct approach where we manually look for the starts and ends of
  enabled areas worked. This seems in hindsight like there would be functional
  style helpers that would make it faster to write.
