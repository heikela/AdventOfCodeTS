import { loadSync } from "@std/dotenv";

// Load environment variables from .env file
loadSync({ export: true });

// Get the auth cookie from environment variables
function getAuthCookie(): string {
  const authCookie = Deno.env.get("AUTH_COOKIE");

  if (!authCookie) {
    throw new Error("AUTH_COOKIE not found in environment variables");
  }

  return authCookie;
}

const cookie = getAuthCookie();

async function fetchWithCookie(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      Cookie: `session=${cookie}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.text();
}

export async function getInput(year: number, day: number): Promise<string> {
  const fileName = `inputs/${year}-day${day}.txt`;
  try {
    return await Deno.readTextFile(fileName);
  } catch (e) {
    console.log(`Fetching inputs from Advent of Code site`);
    const input = await fetchWithCookie(
      `https://adventofcode.com/${year}/day/${day}/input`
    );
    await Deno.writeTextFile(fileName, input);
    return input;
  }
}

async function getTaskHtml(year: number, day: number): Promise<string> {
  const fileName = `inputs/${year}-day${day}.html`;
  try {
    return await Deno.readTextFile(fileName);
  } catch (e) {
    console.log(
      `Fetching task description (with examples) from Advent of Code site`
    );
    const html = await fetchWithCookie(
      `https://adventofcode.com/${year}/day/${day}`
    );
    await Deno.writeTextFile(fileName, html);
    return html;
  }
}

export async function getTestBlock(
  year: number,
  day: number,
  blockNumber = 0
): Promise<string> {
  const html = await getTaskHtml(year, day);
  const testBlocks = Array.from(
    html.matchAll(/<pre><code>((?:.|\n)*?)<\/code><\/pre>/g)
  );
  if (testBlocks.length <= blockNumber) {
    throw new Error("Test block not found");
  }
  return testBlocks[blockNumber][1];
}
