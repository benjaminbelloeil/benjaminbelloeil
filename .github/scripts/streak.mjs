// Regenerates assets/streak.svg from the GitHub contribution calendar.
import { writeFile } from 'node:fs/promises';

const username = process.env.GITHUB_USER || 'benjaminbelloeil';
const token = process.env.GITHUB_TOKEN;
const output = process.env.STREAK_OUTPUT || 'assets/streak.svg';

if (!token) throw new Error('GITHUB_TOKEN must be set.');

async function graphql(query, variables) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  const body = await res.json();
  if (!res.ok || body.errors) throw new Error(JSON.stringify(body.errors || body));
  return body.data;
}

const { user } = await graphql(
  `query($login: String!) { user(login: $login) { createdAt contributionsCollection { contributionYears } } }`,
  { login: username }
);

// The calendar only spans one year per request, so fetch each contribution year.
const days = new Map();
for (const year of user.contributionsCollection.contributionYears) {
  const data = await graphql(
    `query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) { contributionsCollection(from: $from, to: $to) {
        contributionCalendar { weeks { contributionDays { date contributionCount } } }
      } }
    }`,
    { login: username, from: `${year}-01-01T00:00:00Z`, to: `${year}-12-31T23:59:59Z` }
  );
  for (const week of data.user.contributionsCollection.contributionCalendar.weeks) {
    for (const day of week.contributionDays) days.set(day.date, day.contributionCount);
  }
}

const today = new Date().toISOString().slice(0, 10);
const dates = [...days.keys()].filter((d) => d <= today).sort();
const total = dates.reduce((sum, d) => sum + days.get(d), 0);

let longest = { length: 0, start: null, end: null };
let run = { length: 0, start: null, end: null };
for (const date of dates) {
  if (days.get(date) > 0) {
    run = run.length ? { ...run, length: run.length + 1, end: date } : { length: 1, start: date, end: date };
    if (run.length > longest.length) longest = run;
  } else {
    run = { length: 0, start: null, end: null };
  }
}

// A day without contributions yet doesn't break the streak until it is over.
let i = dates.length - 1;
if (dates[i] === today && days.get(today) === 0) i--;
const current = { length: 0, start: null, end: dates[i] };
for (; i >= 0 && days.get(dates[i]) > 0; i--) {
  current.length++;
  current.start = dates[i];
}

const fmt = (date, withYear = true) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', ...(withYear && { year: 'numeric' }), timeZone: 'UTC'
  });
const range = (r) => {
  if (!r.length) return '';
  const thisYear = r.start.slice(0, 4) === today.slice(0, 4) && r.end.slice(0, 4) === today.slice(0, 4);
  return r.start === r.end ? fmt(r.start, !thisYear) : `${fmt(r.start, !thisYear)} - ${fmt(r.end, !thisYear)}`;
};

const firstDate = dates.find((d) => days.get(d) > 0) || dates[0];
const font = 'font-family="&quot;Segoe UI&quot;, Ubuntu, sans-serif"';
const text = (x, y, fill, weight, size, style, value, ty = 32) =>
  `<g transform="translate(${x}, ${y})"><text x="0" y="${ty}" stroke-width="0" text-anchor="middle" fill="${fill}" stroke="none" ${font} font-weight="${weight}" font-size="${size}px" font-style="normal" style="${style}">${value}</text></g>`;
const fade = (delay) => `opacity: 0; animation: fadein 0.5s linear forwards ${delay}s`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" style="isolation: isolate" viewBox="0 0 900 180" width="900px" height="180px" direction="ltr" role="img" aria-label="${total.toLocaleString('en-US')} total contributions, current streak of ${current.length} days, longest streak of ${longest.length} days">
  <style>
    @keyframes currstreak { 0% { font-size: 3px; opacity: 0.2; } 80% { font-size: 34px; opacity: 1; } 100% { font-size: 28px; opacity: 1; } }
    @keyframes fadein { 0% { opacity: 0; } 100% { opacity: 1; } }
  </style>
  <defs>
    <clipPath id="outer_rectangle"><rect width="900" height="180" rx="4.5" /></clipPath>
    <mask id="mask_out_ring_behind_fire">
      <rect width="900" height="180" fill="white" />
      <ellipse id="mask-ellipse" cx="450" cy="32" rx="13" ry="18" fill="black" />
    </mask>
  </defs>
  <g clip-path="url(#outer_rectangle)">
    <rect stroke="#383838" stroke-opacity="1" fill="#111111" rx="5" x="0.5" y="0.5" width="899" height="179" stroke-width="1" ry="5" vector-effect="non-scaling-stroke" />
    <line x1="300" y1="24.25" x2="300" y2="162.5" vector-effect="non-scaling-stroke" stroke-width="1" stroke="#383838" />
    <line x1="600" y1="24.25" x2="600" y2="162.5" vector-effect="non-scaling-stroke" stroke-width="1" stroke="#383838" />
    ${text(150, 40.5, '#FFFFFF', 700, 28, fade(0.6), total.toLocaleString('en-US'))}
    ${text(150, 76.5, '#FFFFFF', 400, 14, fade(0.7), 'Total Contributions')}
    ${text(150, 106.5, '#a0a0a0', 400, 12, fade(0.8), `${fmt(firstDate)} - Present`)}
    ${text(450, 100.5, '#FF9A3C', 700, 14, fade(0.9), 'Current Streak')}
    ${text(450, 137.5, '#a0a0a0', 400, 12, fade(0.9), range(current), 21)}
    <g mask="url(#mask_out_ring_behind_fire)">
      <circle cx="450" cy="63.5" r="40" fill="none" stroke="#FF9A3C" stroke-width="5" style="${fade(0.4)}" />
    </g>
    <g transform="translate(450, 12)" style="${fade(0.6)}">
      <path d="M 1.5 0.67 C 1.5 0.67 2.24 3.32 2.24 5.47 C 2.24 7.53 0.89 9.2 -1.17 9.2 C -3.23 9.2 -4.79 7.53 -4.79 5.47 L -4.76 5.11 C -6.78 7.51 -8 10.62 -8 13.99 C -8 18.41 -4.42 22 0 22 C 4.42 22 8 18.41 8 13.99 C 8 8.6 5.41 3.79 1.5 0.67 Z M -0.29 19 C -2.07 19 -3.51 17.6 -3.51 15.86 C -3.51 14.24 -2.46 13.1 -0.7 12.74 C 1.07 12.38 2.9 11.53 3.92 10.16 C 4.31 11.45 4.51 12.81 4.51 14.2 C 4.51 16.85 2.36 19 -0.29 19 Z" fill="#FF9A3C" />
    </g>
    ${text(450, 40.5, '#FF9A3C', 700, 28, 'animation: currstreak 0.6s linear forwards', current.length)}
    ${text(750, 40.5, '#FFFFFF', 700, 28, fade(1.2), longest.length)}
    ${text(750, 76.5, '#FFFFFF', 400, 14, fade(1.3), 'Longest Streak')}
    ${text(750, 106.5, '#a0a0a0', 400, 12, fade(1.4), range(longest))}
  </g>
</svg>
`;

await writeFile(output, svg);
console.log(`streak.svg: total ${total}, current ${current.length} (${range(current)}), longest ${longest.length} (${range(longest)})`);
