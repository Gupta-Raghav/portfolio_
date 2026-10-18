// Local prototype data only. No requests, credentials, or background agent work.
export const STORAGE_KEY = 'morrow.prototype.v1';
export const PROFILES = ['raghav', 'guest'];
export const DEFAULT_NAMES = { raghav: 'Raghav', guest: 'Guest' };
export const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const ARTIFACTS = [
  { id: 'weekend', title: 'The art of a slower weekend', subtitle: 'Less on the list. More in the moment.', type: 'Guides', cover: 'landscape', tag: 'LITTLE ADVENTURES', read: '4 min', intro: 'You don’t need to go far to feel somewhere else. A small change of scenery, something delicious, and a little unplanned time can be enough.', sections: [
    { title: '01 / Make room for nothing', text: 'Leave the morning unscheduled. Open a window, make your favorite coffee, and let the day arrive before you decide what it should be.' },
    { title: '02 / Take the scenic route', text: 'Pick a neighborhood you rarely visit. Take a camera or a notebook, not a checklist. Look for a tree-lined street, an independent bookstore, or somewhere to sit in the sun.' },
    { title: '03 / Bring a little of it home', text: 'Choose one small thing to remember: a photograph, a new recipe, a few stems from the market. The point isn’t to do more. It’s to notice more.' }
  ], takeaway: 'A good weekend isn’t measured by how much you fit into it.' },
  { id: 'week', title: 'Your week, with room to breathe', subtitle: 'A softer structure for the days ahead.', type: 'Plans', cover: 'week', tag: 'THE WEEK AHEAD', read: '3 min', intro: 'A plan should give you space, not take it away. Start with what matters, then leave a little room for life to happen.', sections: [
    { title: 'Monday & Tuesday / Find your focus', text: 'Choose one meaningful piece of work each morning. Protect a quiet block for it. Let smaller tasks gather into a single afternoon batch.' },
    { title: 'Wednesday & Thursday / Make connections', text: 'Leave time for a conversation you’ve been putting off and an idea that deserves a second look. A walk between meetings counts as a reset.' },
    { title: 'Friday / Close the loops', text: 'Write down what moved forward, what can wait, and one thing you’re proud of. Make next Monday a little kinder to your future self.' }
  ], takeaway: 'Three priorities. A few good pauses. Enough.' },
  { id: 'ideas', title: 'A tiny home for big ideas', subtitle: 'A simple system for your curious mind.', type: 'Notes', cover: 'ideas', tag: 'THINGS WORTH KEEPING', read: '5 min', intro: 'Not every idea needs a project. Sometimes it just needs a place to land, so you can return to it when the time feels right.', sections: [
    { title: 'Collect without organizing', text: 'Give yourself one inbox for loose thoughts: a sentence, a link, a question. Keep the friction low. You can make sense of it later.' },
    { title: 'Look for the recurring thread', text: 'Once a week, look back. Which ideas keep finding you? Group those together, not by a rigid taxonomy, but by what makes you curious.' },
    { title: 'Make one small thing', text: 'Turn one note into a sketch, a paragraph, or a conversation. Ideas become useful when they meet the world, even in a very unfinished form.' }
  ], takeaway: 'Save the spark. You don’t have to build the whole fire today.' },
  { id: 'table', title: 'The Sunday table', subtitle: 'Something simple, made with a little care.', type: 'Guides', cover: 'table', tag: 'AT HOME', read: '3 min', intro: 'An easy table for two: roasted vegetables, something warm from the oven, and no reason to rush.', sections: [
    { title: 'The market list', text: 'Seasonal vegetables, a lemon, fresh herbs, chickpeas, a good loaf of bread, and something sweet to share. Adjust everything to your dietary needs.' },
    { title: 'Let the oven do the work', text: 'Chop the vegetables, toss with olive oil, and roast until golden and tender. Warm the chickpeas with lemon zest and a pinch of cumin. Finish with herbs.' },
    { title: 'Set a table, not a standard', text: 'Use the plates you like. Put on a record. Tear the bread by hand. This is dinner, not a performance.' }
  ], takeaway: 'The best part of the meal is who you share it with.' }
];
export const CONNECTORS = [
  { id: 'calendar', name: 'Google Calendar', letter: '31', color: 'blue', category: 'Everyday', description: 'Make space for what matters.', scopes: ['Read calendar events', 'Suggest new events'] },
  { id: 'notion', name: 'Notion', letter: 'N', color: 'ink', category: 'Knowledge', description: 'Give your ideas a second home.', scopes: ['Read selected pages', 'Draft new pages'] },
  { id: 'gmail', name: 'Gmail', letter: 'M', color: 'rose', category: 'Everyday', description: 'Find the signal in your inbox.', scopes: ['Read selected messages', 'Draft replies for approval'] },
  { id: 'github', name: 'GitHub', letter: '⌘', color: 'ink', category: 'Work', description: 'Keep your projects moving.', scopes: ['Read selected repositories', 'Draft issues for approval'] },
  { id: 'drive', name: 'Google Drive', letter: '△', color: 'sage', category: 'Knowledge', description: 'The right file, right when you need it.', scopes: ['Read selected files', 'Create draft documents'] },
  { id: 'spotify', name: 'Spotify', letter: '≋', color: 'sage', category: 'Everyday', description: 'A soundtrack for your day.', scopes: ['Read saved playlists', 'Suggest music'] }
];
export function freshWorkspace() {
  return { chats: [], memories: [
    { id: 'm1', text: 'Leave room for unplanned time on the weekends.', category: 'Preferences', pinned: true, sample: true },
    { id: 'm2', text: 'A walk and a good coffee can turn a day around.', category: 'Little things', pinned: false, sample: true },
    { id: 'm3', text: 'Make a little more time for creative projects.', category: 'Goals', pinned: false, sample: true }
  ], saved: [], notes: [], connectors: {}, taskStates: {}, drafts: {} };
}
export function freshState() { return { version: 1, profile: 'raghav', names: { ...DEFAULT_NAMES }, theme: 'light', workspaces: { raghav: freshWorkspace(), guest: freshWorkspace() } }; }
const plain = value => value && typeof value === 'object' && !Array.isArray(value);
const text = (value, limit = 12000) => typeof value === 'string' ? value.slice(0, limit) : '';
// Local storage is untrusted: validate shape, cap collections, and discard unknown properties.
export function restoreState(raw) {
  try {
    const input = JSON.parse(raw);
    const state = freshState();
    if (input?.version !== 1) return state;
    if (PROFILES.includes(input.profile)) state.profile = input.profile;
    if (input.theme === 'dark') state.theme = 'dark';
    for (const id of PROFILES) {
      state.names[id] = text(input.names?.[id], 32).trim() || DEFAULT_NAMES[id];
      const source = input.workspaces?.[id];
      if (!plain(source)) continue;
      const workspace = state.workspaces[id];
      if (Array.isArray(source.chats)) workspace.chats = source.chats.filter(plain).slice(0, 60).map(chat => ({
        id: text(chat.id, 80) || uid(), title: text(chat.title, 70) || 'A new thought',
        messages: (Array.isArray(chat.messages) ? chat.messages : []).filter(plain).slice(-200).map(message => ({ role: message.role === 'user' ? 'user' : 'assistant', text: text(message.text), artifact: ARTIFACTS.some(a => a.id === message.artifact) ? message.artifact : null, attachment: text(message.attachment, 120) }))
      }));
      if (Array.isArray(source.memories)) workspace.memories = source.memories.filter(plain).slice(0, 200).map(memory => ({ id: text(memory.id, 80) || uid(), text: text(memory.text, 1000), category: ['Preferences', 'Goals', 'Little things'].includes(memory.category) ? memory.category : 'Little things', pinned: memory.pinned === true, sample: memory.sample === true }));
      if (Array.isArray(source.notes)) workspace.notes = source.notes.filter(plain).slice(0, 100).map(note => ({ id: text(note.id, 80) || uid(), title: text(note.title, 100), body: text(note.body, 10000) }));
      if (Array.isArray(source.saved)) workspace.saved = source.saved.filter(x => typeof x === 'string').slice(0, 120);
      for (const connector of CONNECTORS) {
        if (Array.isArray(source.connectors?.[connector.id])) workspace.connectors[connector.id] = source.connectors[connector.id].filter(x => connector.scopes.includes(x));
      }
      for (const id of ['weekend', 'week', 'ideas']) if (['paused', 'queued'].includes(source.taskStates?.[id])) workspace.taskStates[id] = source.taskStates[id];
      if (plain(source.drafts)) for (const [key, value] of Object.entries(source.drafts).slice(0, 70)) if (key === 'new' || workspace.chats.some(c => c.id === key)) workspace.drafts[key] = text(value);
    }
    return state;
  } catch { return freshState(); }
}
export function artifactForPrompt(prompt) {
  const query = prompt.toLowerCase();
  if (/weekend|adventure|trip|travel/.test(query)) return 'weekend';
  if (/week|plan|focus|day/.test(query)) return 'week';
  if (/dinner|recipe|cook|food/.test(query)) return 'table';
  return 'ideas';
}
export function demoReply(prompt) {
  const artifact = artifactForPrompt(prompt);
  return { role: 'assistant', text: 'This is a local preview, so I haven’t sent your message to an AI or started any work. To show how a conversation could feel, here’s a sample from the artifact library you can explore. Your message stays in this browser.', artifact };
}
