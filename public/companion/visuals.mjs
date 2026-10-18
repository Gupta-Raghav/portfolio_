export const ICONS = {
  chat: '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/>',
  artifacts: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  heartbeat: '<path d="M2 12h5l3-8 4 16 3-8h5"/>',
  memory: '<path d="M12 20s-8-4.7-8-11a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 6.3-8 11-8 11z"/><path d="M12 8v8m-3-4h6"/>',
  connectors: '<path d="m8 3 3 3-5 5-3-3m10 13-3-3 5-5 3 3M8.5 8.5l7 7M6 11l-3 3m10 7 3-3m-2-12 4-4m0 8 4-4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  up: '<path d="M12 19V5m-6 6 6-6 6 6"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  settings: '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  moon: '<path d="M20.7 13a9 9 0 0 1-9.7-9.7A9 9 0 1 0 20.7 13z"/>',
  leaf: '<path d="M20 3C10 2 3 5 4 13s15 10 16-10Z"/><path d="M4 21 15 10"/>',
  book: '<path d="M12 6c-3-3-7-3-10-2v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-1-10 2Zm0 0v15"/>',
  spark: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4V3Z"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  paperclip: '<path d="m8 13 7-7a3 3 0 0 1 4 4L9 20a5 5 0 0 1-7-7L13 2m-9 13 10-10"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  play: '<path d="m7 4 13 8-13 8V4Z"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
  edit: '<path d="m14 5 5 5M4 20l5-1L21 7l-5-5L4 14v6Z"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  history: '<path d="M3 11a9 9 0 1 1 2 7M3 4v7h7m2-4v5l3 2"/>',
  external: '<path d="M14 3h7v7m0-7L10 14M10 3H3v18h18v-7"/>'
};
export function icon(name, cls = '') { return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.spark}</svg>`; }
// Hand-drawn vector renditions, referenced from the official milkmochabear.com store.
// The owner explicitly assigns Milk to Raghav and Mocha to Ananya.
export function avatar(profile, cls = '') {
  const mocha = profile === 'guest';
  const coat = mocha ? '#cc9967' : '#fffdf8';
  const outline = mocha ? '#976740' : '#c4b9ae';
  const blush = mocha ? '#dc8f7d' : '#efb4b0';
  return `<svg class="avatar ${cls}" data-character="${mocha ? 'mocha' : 'milk'}" viewBox="0 0 80 80" aria-hidden="true">
    <circle cx="40" cy="40" r="39" fill="${mocha ? '#eee0d4' : '#e3e9df'}"/>
    <ellipse cx="40" cy="71" rx="25" ry="6" fill="${mocha ? '#dbc8b5' : '#cfd8c9'}" opacity=".65"/>
    <g stroke="${outline}" stroke-width="1.5" stroke-linejoin="round">
      <path d="M23 51c-7 8-8 19-3 23 4 4 10 1 12-1 5 2 11 2 16 0 3 3 10 5 13 0 3-5 1-15-5-22" fill="${coat}"/>
      <circle cx="22" cy="22" r="10" fill="${coat}"/><circle cx="58" cy="22" r="10" fill="${coat}"/>
      <path d="M14 39c0-16 9-23 26-23s26 7 26 23c3 13-8 23-26 23S11 52 14 39Z" fill="${coat}"/>
    </g>
    <ellipse cx="40" cy="47" rx="12" ry="9" fill="${mocha ? '#f1d8b9' : '#fffdf8'}"/>
    <ellipse cx="29" cy="39" rx="2.1" ry="2.8" fill="#513c32"/><ellipse cx="51" cy="39" rx="2.1" ry="2.8" fill="#513c32"/>
    <ellipse cx="22" cy="46" rx="5" ry="3.2" fill="${blush}" opacity=".9"/><ellipse cx="58" cy="46" rx="5" ry="3.2" fill="${blush}" opacity=".9"/>
    <path d="M37 44q3-2 6 0-1 4-3 4t-3-4Z" fill="#513c32"/>
    <path d="M40 47v3m0-1q-3 5-6 1m6-1q3 5 6 1" fill="none" stroke="#513c32" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M40 69s-10-5-10-10c0-5 7-6 10-1 3-5 10-4 10 1 0 5-10 10-10 10Z" fill="${mocha ? '#9b665a' : '#ba7c76'}"/>
    <ellipse cx="28" cy="62" rx="5" ry="7" transform="rotate(-24 28 62)" fill="${coat}" stroke="${outline}" stroke-width="1.4"/>
    <ellipse cx="52" cy="62" rx="5" ry="7" transform="rotate(24 52 62)" fill="${coat}" stroke="${outline}" stroke-width="1.4"/>
  </svg>`;
}
export function brand() { return '<svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true"><g fill="currentColor"><ellipse cx="15" cy="13" rx="7" ry="11" transform="rotate(-32 15 13)"/><ellipse cx="27" cy="23" rx="7" ry="12" transform="rotate(32 27 23)"/><ellipse cx="13" cy="28" rx="7" ry="8"/></g></svg>'; }
export function orb(cls = '') { return `<span class="orb ${cls}" aria-hidden="true"><span class="orb-face"><i></i><i></i><b></b></span></span>`; }
export function art(cover) {
  if (cover === 'landscape') return '<svg class="cover-art" viewBox="0 0 600 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="600" height="360" fill="#dbe3d7"/><circle cx="433" cy="81" r="43" fill="#f8efc9"/><path d="M0 204Q145 114 324 198T600 161V360H0" fill="#adc0ac"/><path d="M0 285Q220 143 390 226T600 228V360H0" fill="#778f76"/><path d="M0 345Q190 255 320 298T600 279V360H0" fill="#405e4f"/><path d="M390 360q-90-62-40-97t-18-53q-18-10-29-8 58 26 19 54t19 104" fill="#ebe2c3"/><path d="m93 253 0-113m-27 49 27-46 27 46m-58 25 31-54 31 54m-70 22 39-64 39 64" stroke="#4e6e58" stroke-width="9" stroke-linejoin="round" fill="none"/><path d="m492 279 0-81m-22 33 22-37 22 37m-49 19 27-46 27 46" stroke="#587460" stroke-width="7" stroke-linejoin="round" fill="none"/></svg>';
  if (cover === 'week') return '<svg class="cover-art" viewBox="0 0 600 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="600" height="360" fill="#e7d8c6"/><circle cx="499" cy="57" r="132" fill="#eee4d6"/><g transform="translate(145 44) rotate(-8 150 130)"><rect x="8" y="10" width="304" height="248" rx="9" fill="#c5b5a1" opacity=".3"/><rect width="304" height="248" rx="9" fill="#faf6ed"/><path d="M0 52h304M32 96h235M32 141h235M32 186h235M96 72v147m61-147v147m60-147v147" stroke="#dedacb" stroke-width="2"/><rect x="105" y="106" width="42" height="26" rx="6" fill="#b5c3a2"/><rect x="164" y="151" width="43" height="26" rx="6" fill="#e4bca5"/><circle cx="57" cy="164" r="13" fill="#d4c7a5"/><path d="M40 22h82m74 0h65" stroke="#80927e" stroke-width="6" stroke-linecap="round"/></g><path d="m447 263 63-124 11 6-60 125-15 11Z" fill="#697c67"/></svg>';
  if (cover === 'ideas') return '<svg class="cover-art" viewBox="0 0 600 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="600" height="360" fill="#e2dfe9"/><circle cx="299" cy="179" r="132" fill="#efecf3"/><g transform="rotate(-12 200 200)"><rect x="143" y="104" width="166" height="200" rx="5" fill="#b7aec5"/><rect x="132" y="94" width="166" height="200" rx="5" fill="#f9f6ed"/><path d="M160 134h95m-95 25h109m-109 25h80m-80 25h105m-105 25h64" stroke="#c4bdcf" stroke-width="4" stroke-linecap="round"/></g><path d="M320 214c48-33 78-59 84-119 27 43 18 90-18 109 29-4 55 7 61 24-37 26-80 18-107 2" fill="#84957c"/><path d="m307 278 96-166" stroke="#556d56" stroke-width="3" fill="none"/><circle cx="364" cy="73" r="12" fill="#ceb87d"/></svg>';
  return '<svg class="cover-art" viewBox="0 0 600 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="600" height="360" fill="#e5cfc2"/><path d="M70 0v360M160 0v360M250 0v360M340 0v360M430 0v360M520 0v360M0 60h600M0 150h600M0 240h600M0 330h600" stroke="#f0dfd3" stroke-width="20"/><ellipse cx="309" cy="195" rx="119" ry="114" fill="#c8ad9d" opacity=".5"/><circle cx="300" cy="180" r="115" fill="#fcf4e7"/><circle cx="300" cy="180" r="86" fill="#e7e2cf"/><g fill="#85916b"><ellipse cx="264" cy="151" rx="22" ry="35" transform="rotate(-40 264 151)"/><ellipse cx="320" cy="167" rx="22" ry="35" transform="rotate(30 320 167)"/><ellipse cx="283" cy="215" rx="22" ry="35" transform="rotate(65 283 215)"/></g><g fill="#bf8059"><circle cx="277" cy="171" r="15"/><circle cx="331" cy="212" r="18"/><circle cx="341" cy="142" r="12"/></g><path d="M139 104v145m-13-145v38q13 16 26 0v-38m303 0v145m0-145q-25 48 0 67" stroke="#9c8d77" stroke-width="6" fill="none" stroke-linecap="round"/></svg>';
}
