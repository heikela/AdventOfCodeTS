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
