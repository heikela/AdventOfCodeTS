import { assertEquals } from "@std/assert";
import * as Utils from "./utils.ts";

Deno.test(function testZipHandlesUnevenLengths() {
  const list1 = [1, 2, 3];
  const list2 = [4, 5];
  const list3 = [6, 7, 8];
  const result = Utils.zip(list1, list2, list3);
  assertEquals(result, [
    [1, 4, 6],
    [2, 5, 7],
  ]);
});
