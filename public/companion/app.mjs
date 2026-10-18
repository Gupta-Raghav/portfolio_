import { freshState, freshWorkspace, restoreState, uid, escapeHTML as e, ARTIFACTS, CONNECTORS, demoReply } from './state.mjs';
import { icon, avatar, brand, art } from './visuals.mjs';
import { account, saveDocument, signOut, syncMessage } from './identity.mjs';

if (!account?.active) throw new Error('A verified session is required.');
const companionAvatar = (cls = 'companion-intro') => avatar(account.user.profile, `companion-bear ${cls}`);
const PROFILES = [account.user.profile];
const storageWarning = false;
const initial = freshState();
initial.profile = account.user.profile;
initial.names[initial.profile] = account.data.name;
initial.theme = account.data.theme;
initial.workspaces[initial.profile] = account.data.workspace;
let state = restoreState(JSON.stringify(initial));
const app = document.querySelector('#app');
const dialog = document.querySelector('#dialog');
const tabs = [{ id: 'chat', name: 'Chat', icon: 'chat' }, { id: 'artifacts', name: 'Artifacts', icon: 'artifacts' }, { id: 'heartbeat', name: 'Heartbeat', icon: 'heartbeat' }, { id: 'memory', name: 'Memory', icon: 'memory' }, { id: 'connectors', name: 'Connectors', icon: 'connectors' }];
let tab = tabs.some(t => `#${t.id}` === location.hash) ? location.hash.slice(1) : 'chat';
let chatId = null;
let filter = 'All';
let query = '';
let attachment = '';
let toastTimer;
let dialogReturnFocus;
let draftTimer;
const workspace = () => state.workspaces[state.profile];
const currentChat = () => workspace().chats.find(chat => chat.id === chatId);
const draftKey = () => chatId || 'new';
const title = () => tabs.find(t => t.id === tab)?.name || 'Chat';
function persist() {
  if (!account.active) return;
  saveDocument({ version: 1, name: state.names[account.user.profile], theme: state.theme, workspace: state.workspaces[account.user.profile] });
}
function notify(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 4500);
}
const btn = (action, name, symbol, cls = 'icon-button', extra = '') => `<button class="${cls}" data-action="${action}" aria-label="${e(name)}" title="${e(name)}" ${extra}>${icon(symbol)}</button>`;
const badge = (text, cls = '') => `<span class="badge ${cls}">${text}</span>`;
function nav(mobile = false) {
  return `<nav class="${mobile ? 'mobile-nav' : 'main-nav'}" aria-label="${mobile ? 'Mobile navigation' : 'Main navigation'}">${tabs.map(t => `<button data-action="tab" data-id="${t.id}" class="nav-item ${t.id === tab ? 'active' : ''}" ${t.id === tab ? 'aria-current="page"' : ''}>${icon(t.icon)}<span>${t.name}</span>${!mobile && t.id === 'artifacts' ? '<span class="nav-count">' + (ARTIFACTS.length + workspace().notes.length) + '</span>' : ''}</button>`).join('')}</nav>`;
}
function sidebar() {
  return `<aside class="sidebar"><a class="brand" href="#chat" aria-label="Cocoa home">${brand()}<span>cocoa<span class="brand-period">.</span></span></a><div class="sidebar-caption">A LITTLE SPACE FOR YOU</div><button class="new-chat" data-action="new-chat">${icon('plus')}<span>A new conversation</span><kbd>⌘ K</kbd></button>${nav()}<div class="sidebar-divider"></div><div class="sidebar-label">YOUR CONVERSATIONS ${btn('history', 'Search conversations', 'search')}</div><div class="recent-chats">${workspace().chats.length ? workspace().chats.slice(0, 5).map(chat => `<button data-action="open-chat" data-id="${e(chat.id)}" class="recent-chat ${chatId === chat.id && tab === 'chat' ? 'selected' : ''}">${icon('chat')}<span>${e(chat.title)}</span></button>`).join('') : '<p class="quiet-note">A thought, a plan, a little curiosity.<br>Your conversations will live here.</p>'}</div><div class="sidebar-bottom"><div class="local-note">${icon('leaf')}<span>A quieter kind of technology.</span></div><button class="profile-button" data-action="profiles">${avatar(state.profile, 'sidebar-avatar')}<span><strong>${e(state.names[state.profile])}’s space</strong><small>Your private workspace</small></span>${icon('down')}</button><div class="sidebar-footer"><a href="/">${icon('external')} Portfolio</a>${btn('settings', 'Settings', 'settings')}</div></div></aside>`;
}
function render() {
  if (!account.active) return;
  document.documentElement.dataset.theme = state.theme;
  document.title = `Cocoa · ${title()}`;
  app.innerHTML = `${sidebar()}<div class="workspace"><header class="topbar"><div class="breadcrumb"><span class="desktop-breadcrumb">Your space <span>/</span></span><span>${title()}</span></div><div class="topbar-actions"><span class="preview-label"><span class="status-dot"></span>Frontend preview</span>${btn('search', 'Search your space', 'search')}${btn('theme', state.theme === 'light' ? 'Use dark theme' : 'Use light theme', state.theme === 'light' ? 'moon' : 'sun')}<button class="mobile-profile" data-action="profiles" aria-label="Your account">${avatar(state.profile, 'topbar-avatar')}</button></div></header><main id="main" tabindex="-1" class="main main-${tab}">${tab === 'chat' ? `<div class="mobile-chat-tools"><button data-action="history">${icon('history')}Conversations</button><button data-action="new-chat">${icon('plus')}New chat</button></div>${chatPage()}` : tab === 'artifacts' ? artifactsPage() : tab === 'heartbeat' ? heartbeatPage() : tab === 'memory' ? memoryPage() : connectorsPage()}</main>${nav(true)}</div>`;
  if (tab === 'chat') {
    const input = app.querySelector('#message');
    input.value = workspace().drafts[draftKey()] || '';
    resizeComposer(input);
    app.querySelector('#send').disabled = !input.value.trim();
    app.querySelector('#messages')?.scrollTo(0, 100000);
  }
}
function navigate(id) {
  if (!tabs.some(t => t.id === id)) return;
  tab = id; filter = 'All'; query = ''; attachment = '';
  history.replaceState(null, '', `#${tab}`);
  render();
  app.querySelector('#main')?.focus({ preventScroll: true });
}
function header(kicker, heading, description, action = '') {
  return `<div class="page-heading"><div><div class="eyebrow">${kicker}</div><h1>${heading}</h1><p>${description}</p></div>${action}</div>`;
}
function composer() {
  return `<div class="composer-wrap"><form id="chat-form" class="composer"><label class="sr-only" for="message">Message Cocoa</label><textarea id="message" rows="1" maxlength="12000" placeholder="A thought, a question, anything on your mind…"></textarea><div id="attachment-preview" class="attachment-preview" ${attachment ? '' : 'hidden'}>${attachment ? `${icon('paperclip')} ${e(attachment)} <span>name only</span>${btn('remove-attachment', 'Remove attachment', 'close')}` : ''}</div><div class="composer-toolbar"><div class="composer-tools">${btn('attach', 'Attach a file name (preview only)', 'plus')}<button type="button" class="composer-mode" data-action="demo-info">${icon('spark')}Local preview${icon('down')}</button></div><button id="send" class="send-button" type="submit" aria-label="Send message" disabled>${icon('up')}</button></div><input type="file" id="file-input" hidden accept=".txt,.md,.pdf,.png,.jpg,.jpeg,.webp"></form><p class="composer-note">${icon('lock')}Private workspace. No AI connected.</p><span class="sync-status" role="status">${e(syncMessage)}</span></div>`;
}
function chatPage() {
  const chat = currentChat();
  return `<div class="chat-layout"><section class="conversation ${chat ? 'has-conversation' : ''}" aria-label="Conversation">${chat ? `<div class="conversation-heading"><div><span class="eyebrow">YOUR CONVERSATION</span><h1>${e(chat.title)}</h1></div>${btn('delete-chat', 'Delete this conversation', 'trash')}</div><div id="messages" class="messages" role="log" aria-label="Messages">${chat.messages.map(message => `<div class="message ${message.role}">${message.role === 'assistant' ? companionAvatar('message-orb') : avatar(state.profile, 'message-avatar')}<div class="message-content"><span class="message-name">${message.role === 'assistant' ? 'Cocoa <span class="inline-demo">DEMO</span>' : e(state.names[state.profile])}</span><div class="message-bubble">${e(message.text)}${message.attachment ? `<div class="message-attachment">${icon('paperclip')}${e(message.attachment)} <small>file name only</small></div>` : ''}</div>${message.artifact ? `<button class="inline-artifact" data-action="artifact" data-id="${message.artifact}">${art(ARTIFACTS.find(a => a.id === message.artifact).cover)}<span><small>SAMPLE ARTIFACT</small><strong>${e(ARTIFACTS.find(a => a.id === message.artifact).title)}</strong><span>Open and settle in ${icon('arrow')}</span></span></button>` : ''}</div></div>`).join('')}</div>` : `<div class="welcome"><div class="welcome-orb">${companionAvatar('hero-orb')}<span class="orbit-dot dot-one"></span><span class="orbit-dot dot-two"></span><span class="orbit-star">✧</span></div><div class="greeting">A GOOD PLACE TO BEGIN</div><h1>Hey ${e(state.names[state.profile])},<br>what’s on your mind?</h1><p>Big plans. Small thoughts. The space in between.<br>I’m here for all of it.</p><div class="starter-grid"><button class="starter" data-action="prompt" data-prompt="Help me make a little space in my week."><span class="starter-icon sage">${icon('sun')}</span><strong>Find a little clarity</strong><span>Make room for the week ${icon('arrow')}</span></button><button class="starter" data-action="prompt" data-prompt="Help me plan a slower weekend for two."><span class="starter-icon peach">${icon('leaf')}</span><strong>Dream up something</strong><span>A plan worth looking forward to ${icon('arrow')}</span></button><button class="starter" data-action="prompt" data-prompt="I have an idea I would like to think through."><span class="starter-icon lavender">${icon('spark')}</span><strong>Follow a thought</strong><span>Let’s see where it takes us ${icon('arrow')}</span></button></div></div>`}${composer()}</section><aside class="context-rail" aria-label="Your day at a glance"><div class="rail-date">${new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}${icon('sun')}</div><div class="rail-heading"><h2>A little inspiration</h2><span class="mini-tag">SAMPLE</span></div><button class="featured-artifact" data-action="artifact" data-id="weekend"><div class="featured-cover">${art('landscape')}<span class="cover-badge">${icon('leaf')} FOR YOUR SLOW DAYS</span></div><div class="featured-body"><span class="eyebrow">A MOMENT FOR YOURSELF</span><h3>The art of a<br>slower weekend</h3><p>Less on the list.<br>More in the moment.</p><span class="text-link">Take a little look ${icon('arrow')}</span></div></button><div class="rail-section"><div class="rail-heading"><h2>In the background</h2>${icon('heartbeat')}</div><div class="idle-status"><span class="status-dot"></span><div><strong>All quiet for now</strong><p>Your agent isn’t connected yet.<br>This is your space to explore.</p></div></div><button class="subtle-link" data-action="tab" data-id="heartbeat">Explore heartbeat ${icon('arrow')}</button></div><div class="rail-quote">“Almost everything will work again if you unplug it for a few minutes, including you.”<span>ANNE LAMOTT</span></div></aside></div>`;
}
function collectionToolbar(kind, categories) {
  return `<div class="collection-toolbar"><div class="filter-chips" aria-label="Filter ${kind}">${categories.map(category => `<button class="chip ${filter === category ? 'selected' : ''}" data-action="filter" data-id="${category}" aria-pressed="${filter === category}">${category}</button>`).join('')}</div><label class="search-field">${icon('search')}<input id="collection-search" type="search" placeholder="Search ${kind}…" aria-label="Search ${kind}" value="${e(query)}"></label></div>`;
}
function allArtifacts() { return [...ARTIFACTS, ...workspace().notes.map(note => ({ ...note, type: 'Notes', cover: 'ideas', tag: 'YOUR NOTE', read: 'Local', subtitle: note.body.slice(0, 70), intro: note.body, sections: [], takeaway: '', local: true }))]; }
function artifactsPage() {
  return `<div class="page-content">${header('MADE TO BE OPENED, NOT SCROLLED PAST', 'Good things, gathered.', 'A home for the plans, ideas, and little discoveries worth keeping.', `<button class="button primary" data-action="new-note">${icon('plus')}New note</button>`)}${collectionToolbar('artifacts', ['All', 'Guides', 'Plans', 'Notes', 'Saved'])}<div id="collection-results">${artifactResults()}</div><div class="section-footnote">${icon('book')}Four hand-crafted sample artifacts. Your future agent’s creations will live here.</div></div>`;
}
function artifactResults() {
  const artifacts = allArtifacts().filter(a => (filter === 'All' || (filter === 'Saved' ? workspace().saved.includes(a.id) : a.type === filter)) && `${a.title} ${a.subtitle}`.toLowerCase().includes(query.toLowerCase()));
  return artifacts.length ? `<div class="artifact-grid">${artifacts.map(a => `<article class="artifact-card"><button class="artifact-open" data-action="artifact" data-id="${e(a.id)}"><div class="artifact-cover">${art(a.cover)}<span class="cover-badge">${a.type.slice(0, -1).toUpperCase()}</span></div><div class="artifact-info"><span class="eyebrow">${a.tag}</span><h2>${e(a.title)}</h2><p>${e(a.subtitle)}</p></div></button><div class="artifact-meta"><span>${a.local ? 'Created by you' : 'Sample artifact'}<span class="meta-dot">·</span>${a.read}${a.local ? '' : ' read'}</span>${btn('save-artifact', workspace().saved.includes(a.id) ? 'Unsave ' + a.title : 'Save ' + a.title, 'bookmark', `icon-button ${workspace().saved.includes(a.id) ? 'is-saved' : ''}`, `data-id="${e(a.id)}" aria-pressed="${workspace().saved.includes(a.id)}"`)}</div></article>`).join('')}</div>` : empty('A little room for something good.', filter === 'Saved' ? 'Save an artifact with the bookmark button and it will be waiting here.' : 'Nothing matches this search. Try another word or filter.');
}
function heartbeatPage() {
  const tasks = [{ id: 'weekend', title: 'Find a weekend worth slowing down for', description: 'A few places, a gentle itinerary, no rushing.', step: 'Research places', progress: 2, icon: 'leaf' }, { id: 'week', title: 'Put a little breathing room in the week', description: 'A weekly brief that keeps the important things close.', step: 'Waiting for your approval', progress: 3, icon: 'sun' }, { id: 'ideas', title: 'Connect the dots in your reading list', description: 'Turn a handful of saved ideas into something useful.', step: 'Gather notes', progress: 1, icon: 'book' }];
  return `<div class="page-content">${header('A WINDOW INTO THE WORK', 'A calm kind of momentum.', 'Long-running work, with nothing hidden behind a spinning wheel.')}
  <div class="heartbeat-banner"><span class="heartbeat-emblem">${icon('heartbeat')}</span><div><h2>Nothing running. Nothing to catch up on.</h2><p>No agent is connected. Below is an interactive preview of how background work will appear.</p></div>${badge('Agent offline', 'neutral')}</div><div class="section-heading"><h2>How it will feel</h2><span class="mini-tag">DEMO SCENARIOS</span></div><div class="task-list">${tasks.map(task => { const paused = workspace().taskStates[task.id] === 'paused'; return `<article class="task-card"><div class="task-top"><span class="task-icon">${icon(task.icon)}</span><div><h3>${task.title}</h3><p>${task.description}</p></div>${badge(paused ? 'Paused preview' : task.step, paused ? 'neutral' : task.id === 'week' ? 'amber' : '')}</div><ol class="task-steps">${['Understand', 'Explore', 'Create', 'Bring it back'].map((step, i) => `<li class="${i < task.progress ? 'complete' : ''}"><span>${i < task.progress ? icon('check') : i + 1}</span>${step}</li>`).join('')}</ol><div class="task-footer"><span>${icon('clock')}Illustrative progress, not live activity</span><div><button class="button quiet" data-action="toggle-task" data-id="${task.id}">${icon(paused ? 'play' : 'pause')}${paused ? 'Resume preview' : 'Pause preview'}</button><button class="button quiet" data-action="artifact" data-id="${task.id}">View sample ${icon('arrow')}</button></div></div></article>`; }).join('')}</div><div class="soft-callout">${icon('lock')}<div><strong>You stay in the loop.</strong><p>When an agent is connected, sensitive actions should always wait for your approval. This prototype cannot run tasks or take actions.</p></div></div></div>`;
}
function memoryPage() {
  return `<div class="page-content">${header('THE LITTLE THINGS THAT MAKE YOU, YOU', 'A space for what matters.', 'Keep the context you want to carry forward. Change your mind anytime.', `<button class="button primary" data-action="add-memory">${icon('plus')}Add a memory</button>`)}<div class="memory-intro"><div class="memory-illustration">${icon('memory')}<span>✧</span></div><div><h2>Remembered with care.<br>Always yours to change.</h2><p>These notes belong to ${e(state.names[state.profile])}’s local workspace. Nothing is inferred, shared, or sent to an AI.</p></div></div>${collectionToolbar('memories', ['All', 'Preferences', 'Goals', 'Little things'])}<div id="collection-results">${memoryResults()}</div><div class="section-footnote">${icon('lock')}Your notes belong only to this Google account; the other person’s workspace is never loaded here.</div></div>`;
}
function memoryResults() {
  const memories = workspace().memories.filter(m => (filter === 'All' || m.category === filter) && m.text.toLowerCase().includes(query.toLowerCase())).sort((a, b) => Number(b.pinned) - Number(a.pinned));
  return memories.length ? `<div class="memory-grid">${memories.map(memory => `<article class="memory-card"><div class="memory-card-heading"><span class="memory-category">${icon(memory.category === 'Goals' ? 'spark' : memory.category === 'Preferences' ? 'settings' : 'leaf')}${memory.category}</span>${btn('pin-memory', memory.pinned ? 'Unpin memory' : 'Pin memory', 'bookmark', `icon-button ${memory.pinned ? 'is-saved' : ''}`, `data-id="${e(memory.id)}" aria-pressed="${memory.pinned}"`)}</div><p>${e(memory.text)}</p><div class="memory-card-footer"><small>${memory.sample ? 'Sample memory' : 'Added by you'} · Private workspace</small><div>${btn('edit-memory', 'Edit memory', 'edit', 'icon-button', `data-id="${e(memory.id)}"`)}${btn('delete-memory', 'Forget memory', 'trash', 'icon-button', `data-id="${e(memory.id)}"`)}</div></div></article>`).join('')}</div>` : empty('Nothing here, just yet.', 'Add something you’d like to remember, or try a different search.');
}
function connectorsPage() {
  return `<div class="page-content">${header('YOUR WORLD, A LITTLE CLOSER', 'Better, together.', 'Bring your favorite tools into the conversation. On your terms.')}<div class="connector-banner">${icon('connectors')}<div><strong>A place for your connections.</strong><p>Explore permissions and save preferences. Real connections and OAuth come later; no accounts are linked.</p></div>${badge('0 connected', 'neutral')}</div>${collectionToolbar('apps', ['All', 'Everyday', 'Knowledge', 'Work'])}<div id="collection-results">${connectorResults()}</div><div class="soft-callout">${icon('lock')}<div><strong>Less access. More intention.</strong><p>Choose only the permissions you need. Don’t enter passwords, API keys, or tokens here. This frontend doesn’t collect them.</p></div></div></div>`;
}
function connectorResults() {
  const apps = CONNECTORS.filter(c => (filter === 'All' || c.category === filter) && `${c.name} ${c.description}`.toLowerCase().includes(query.toLowerCase()));
  return apps.length ? `<div class="connector-grid">${apps.map(c => `<article class="connector-card"><div class="connector-card-top"><span class="app-logo ${c.color}">${c.letter}</span>${workspace().connectors[c.id] ? badge('Preferences saved', 'neutral') : '<span class="connector-category">' + c.category + '</span>'}</div><h2>${c.name}</h2><p>${c.description}</p><button class="button connector-button" data-action="connector" data-id="${c.id}">${workspace().connectors[c.id] ? 'Edit preferences' : 'Explore connection'}${icon('arrow')}</button></article>`).join('')}</div>` : empty('No apps found.', 'Try another name or category.');
}
function empty(heading, description) { return `<div class="empty-state">${icon('leaf')}<h2>${heading}</h2><p>${description}</p></div>`; }
function refreshResults() {
  const target = app.querySelector('#collection-results');
  if (target) target.innerHTML = tab === 'artifacts' ? artifactResults() : tab === 'memory' ? memoryResults() : connectorResults();
}
function showDialog(content, cls = '') {
  if (!dialog.open) dialogReturnFocus = document.activeElement;
  dialog.className = cls;
  dialog.innerHTML = `${btn('close-dialog', 'Close dialog', 'close', 'icon-button dialog-close')}${content}`;
  if (!dialog.open) dialog.showModal();
}
function closeDialog() { dialog.close(); }
dialog.addEventListener('close', () => { if (dialogReturnFocus?.isConnected) dialogReturnFocus.focus(); });
dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeDialog(); } });
function openArtifact(id) {
  const a = allArtifacts().find(item => item.id === id);
  if (!a) return;
  showDialog(`<div class="reader-cover">${art(a.cover)}<span class="cover-badge">${a.local ? 'YOUR NOTE' : 'SAMPLE ARTIFACT'}</span></div><div class="reader-content"><div class="eyebrow">${a.tag}<span class="meta-dot">·</span>${a.read}${a.local ? '' : ' READ'}</div><h1 id="dialog-title">${e(a.title)}</h1><p class="reader-intro">${e(a.intro)}</p>${a.sections.map(section => `<section><h2>${e(section.title)}</h2><p>${e(section.text)}</p></section>`).join('')}${a.takeaway ? `<blockquote>${e(a.takeaway)}</blockquote>` : ''}<div class="reader-actions"><button class="button ${workspace().saved.includes(id) ? 'primary' : ''}" data-action="save-reader" data-id="${e(id)}">${icon('bookmark')}${workspace().saved.includes(id) ? 'Saved to your space' : 'Save for later'}</button><button class="button" data-action="download-artifact" data-id="${e(id)}">${icon('download')}Download note</button>${a.local ? `<button class="button" data-action="edit-note" data-id="${e(id)}">${icon('edit')}Edit</button>${btn('delete-note', 'Delete note', 'trash', 'icon-button', `data-id="${e(id)}"`)}` : ''}</div></div>`, 'artifact-reader');
}
function openProfiles() {
  showDialog(`<div class="dialog-content"><div class="eyebrow">YOUR OWN LITTLE WORLD</div><h2 id="dialog-title">At home in your space.</h2><div class="account-identity">${avatar(account.user.profile, 'chooser-avatar')}<h3>${e(state.names[account.user.profile])}</h3><p>${account.user.profile === 'raghav' ? 'Mocha' : 'Milk'} · Signed in with Google</p></div><p class="dialog-disclaimer">Only your verified Google account can open this workspace. To use another account, sign out first; the other person’s data is never loaded here.</p><button class="button full-width" data-action="settings">${icon('settings')}Your preferences</button><button class="button full-width" data-action="signout">${icon('lock')}Save and sign out</button><button class="text-button full-width" data-action="signout-discard">Sign out without saving pending changes</button><p class="sync-status" aria-live="polite">Your own private workspace</p></div>`);
}
function openSettings() {
  showDialog(`<form id="settings-form" class="dialog-content"><div class="eyebrow">MAKE YOURSELF AT HOME</div><h2 id="dialog-title">Your space, your way.</h2><p>${account.user.profile === 'raghav' ? 'Mocha' : 'Milk'} is your little companion.</p><label class="field-label">Your display name<span class="name-input">${avatar(account.user.profile, 'settings-avatar')}<input name="${account.user.profile}" value="${e(state.names[account.user.profile])}" maxlength="32" required autocomplete="off"></span></label><div class="settings-row"><span>Color mood</span><button class="button" type="button" data-action="theme">${icon(state.theme === 'light' ? 'moon' : 'sun')}${state.theme === 'light' ? 'Try evening mode' : 'Bring back daylight'}</button></div><p class="dialog-disclaimer">Saved to your separate private workspace. Your Google account, not this display name, determines access. No AI agent is connected.</p><button class="button primary full-width" type="submit">Save preferences ${icon('check')}</button><div class="settings-data"><button class="text-button" type="button" data-action="export-workspace">Export your data</button><button class="text-button danger" type="button" data-action="reset-workspace">Reset your space</button></div></form>`);
}
function openMemory(id) {
  const memory = workspace().memories.find(m => m.id === id);
  showDialog(`<form id="memory-form" data-id="${e(id || '')}" class="dialog-content"><div class="eyebrow">A LITTLE CONTEXT</div><h2 id="dialog-title">${memory ? 'A memory can change.' : 'What should stay with you?'}</h2><label class="field-label">Something worth remembering<textarea name="text" rows="4" maxlength="1000" required placeholder="A preference, a goal, a little thing…">${e(memory?.text || '')}</textarea></label><label class="field-label">Keep it under<select name="category">${['Preferences', 'Goals', 'Little things'].map(category => `<option ${memory?.category === category ? 'selected' : ''}>${category}</option>`).join('')}</select></label><p class="dialog-disclaimer">Saved for ${e(state.names[state.profile])} in your private workspace only. Nothing is sent to an AI.</p><button class="button primary full-width" type="submit">${icon('check')}Save memory</button></form>`);
}
function openNote(id) {
  const note = workspace().notes.find(n => n.id === id);
  showDialog(`<form id="note-form" data-id="${e(id || '')}" class="dialog-content"><div class="eyebrow">GIVE A THOUGHT A HOME</div><h2 id="dialog-title">${note ? 'A little room to refine.' : 'A fresh page.'}</h2><label class="field-label">Title<input name="title" required maxlength="100" placeholder="A thought worth keeping" value="${e(note?.title || '')}"></label><label class="field-label">Your note<textarea name="body" rows="8" required maxlength="10000" placeholder="Start anywhere…">${e(note?.body || '')}</textarea></label><button class="button primary full-width" type="submit">${icon('check')}Save to artifacts</button></form>`);
}
function openConnector(id) {
  const c = CONNECTORS.find(item => item.id === id);
  if (!c) return;
  const scopes = workspace().connectors[id] || [c.scopes[0]];
  showDialog(`<form id="connector-form" data-id="${id}" class="dialog-content"><span class="app-logo ${c.color}">${c.letter}</span><h2 id="dialog-title">${c.name}, on your terms.</h2><p>Choose the access you’d want to grant when a real integration is available.</p><fieldset class="permission-list"><legend>Preferred permissions</legend>${c.scopes.map(scope => `<label><input type="checkbox" name="scope" value="${e(scope)}" ${scopes.includes(scope) ? 'checked' : ''}><span>${scope}<small>${scope.startsWith('Read') ? 'Only the items you explicitly select' : 'Always ask before taking an action'}</small></span></label>`).join('')}</fieldset><div class="soft-callout compact">${icon('lock')}<p>This saves a local preference, not a connection. No OAuth, tokens, or account data are used.</p></div><button type="submit" class="button primary full-width">Save preferences ${icon('check')}</button>${workspace().connectors[id] ? `<button type="button" class="text-button full-width" data-action="remove-connector" data-id="${id}">Clear preferences</button>` : ''}</form>`);
}
function openSearch(historyOnly = false) {
  showDialog(`<div class="dialog-content search-dialog"><h2 id="dialog-title">${historyOnly ? 'Find a conversation.' : 'What are you looking for?'}</h2><label class="search-field large">${icon('search')}<input id="global-search" type="search" placeholder="${historyOnly ? 'Search conversations…' : 'Pages, conversations, artifacts, memories…'}" aria-label="Search your space" data-history="${historyOnly}" autofocus></label><div id="search-results">${searchResults('', historyOnly)}</div></div>`);
  dialog.querySelector('#global-search').focus();
}
function searchResults(value, historyOnly) {
  const q = value.trim().toLowerCase();
  const candidates = [...(historyOnly ? [] : tabs.map(t => ({ title: t.name, type: 'Page', action: 'search-tab', id: t.id, icon: t.icon }))), ...workspace().chats.map(chat => ({ title: chat.title, type: 'Conversation', action: 'search-chat', id: chat.id, icon: 'chat', detail: chat.messages.map(m => m.text).join(' ') })), ...(historyOnly ? [] : allArtifacts().map(a => ({ title: a.title, type: 'Artifact', action: 'artifact', id: a.id, icon: 'book' }))), ...(historyOnly ? [] : workspace().memories.map(m => ({ title: m.text, type: 'Memory', action: 'edit-memory', id: m.id, icon: 'memory' })))];
  const matches = candidates.filter(c => `${c.title} ${c.detail || ''}`.toLowerCase().includes(q)).slice(0, 15);
  return matches.length ? matches.map(c => `<button class="search-result" data-action="${c.action}" data-id="${e(c.id)}">${icon(c.icon)}<span>${e(c.title)}<small>${c.type}</small></span>${icon('arrow')}</button>`).join('') : '<p class="no-results">No matches yet. Try a different word.</p>';
}
function confirmAction(heading, description, action, id = '') {
  showDialog(`<div class="dialog-content"><h2 id="dialog-title">${e(heading)}</h2><p>${e(description)}</p><div class="dialog-actions"><button class="button" data-action="close-dialog">Keep it</button><button class="button danger-button" data-action="${action}" data-id="${e(id)}">Yes, remove it</button></div></div>`);
}
function saveArtifact(id) {
  if (!allArtifacts().some(a => a.id === id)) return;
  const saved = workspace().saved;
  workspace().saved = saved.includes(id) ? saved.filter(a => a !== id) : [...saved, id];
  persist();
}
function download(filename, content, type = 'text/markdown') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function resizeComposer(input) { input.style.height = 'auto'; input.style.height = `${Math.min(input.scrollHeight, 150)}px`; }
function submitChat() {
  const input = app.querySelector('#message');
  const message = input.value.trim();
  if (!message) return;
  if (!currentChat() && workspace().chats.length >= 60) return notify('This prototype holds 60 conversations per person. Export or remove an older one first.');
  if (currentChat()?.messages.length >= 200) return notify('This conversation is full. Start a new one to keep going.');
  let chat = currentChat();
  if (!chat) { chat = { id: uid(), title: message.slice(0, 52), messages: [] }; workspace().chats.unshift(chat); chatId = chat.id; delete workspace().drafts.new; }
  chat.messages.push({ role: 'user', text: message, attachment }, demoReply(message));
  delete workspace().drafts[chatId]; attachment = ''; clearTimeout(draftTimer); persist(); render();
  app.querySelector('#message')?.focus();
}
document.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  if (button.closest('form') && button.type === 'submit' && button.dataset.action) event.preventDefault();
  const { action, id } = button.dataset;
  switch (action) {
    case 'tab': navigate(id); break;
    case 'new-chat': chatId = null; navigate('chat'); app.querySelector('#message').focus(); break;
    case 'open-chat': chatId = id; navigate('chat'); break;
    case 'search-chat': closeDialog(); chatId = id; navigate('chat'); break;
    case 'search-tab': closeDialog(); navigate(id); break;
    case 'history': openSearch(true); break;
    case 'search': openSearch(); break;
    case 'profiles': openProfiles(); break;
    case 'signout': signOut().catch(error => notify(error.message)); break;
    case 'signout-discard': confirmAction('Sign out without saving?', 'Any pending changes in this tab will be discarded. Already saved data is not deleted.', 'confirm-signout'); break;
    case 'confirm-signout': signOut({ discard: true }).catch(error => notify(error.message)); break;
    case 'settings': openSettings(); break;
    case 'theme': state.theme = state.theme === 'light' ? 'dark' : 'light'; persist(); render(); if (dialog.querySelector('#settings-form')) { const names = Object.fromEntries(new FormData(dialog.querySelector('#settings-form'))); openSettings(); for (const id of PROFILES) dialog.querySelector(`[name="${id}"]`).value = names[id]; } break;
    case 'close-dialog': closeDialog(); break;
    case 'prompt': { const input = app.querySelector('#message'); input.value = button.dataset.prompt; workspace().drafts[draftKey()] = input.value; persist(); resizeComposer(input); app.querySelector('#send').disabled = false; input.focus(); break; }
    case 'attach': app.querySelector('#file-input').click(); break;
    case 'remove-attachment': attachment = ''; render(); app.querySelector('#message').focus(); break;
    case 'demo-info': showDialog(`<div class="dialog-content">${companionAvatar()}<h2 id="dialog-title">A preview, not a pretend agent.</h2><p>You can write messages, revisit conversations, explore artifacts, and shape your personal space. Replies are fixed examples, not generated answers.</p><p>Your messages are saved to your private workspace, but are never sent to an AI. Files are not uploaded or read; only their names are shown. No agent work runs in the background.</p><button class="button primary full-width" data-action="close-dialog">Make yourself at home ${icon('arrow')}</button></div>`); break;
    case 'filter': filter = id; render(); break;
    case 'artifact': openArtifact(id); break;
    case 'save-artifact': saveArtifact(id); refreshResults(); break;
    case 'save-reader': saveArtifact(id); openArtifact(id); if (tab === 'artifacts') refreshResults(); break;
    case 'download-artifact': { const a = allArtifacts().find(a => a.id === id); if (a) download(`${a.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.md`, `# ${a.title}\n\n${a.local ? 'Local note' : 'Cocoa sample artifact, not AI-generated'}\n\n${a.intro}\n\n${a.sections.map(s => `## ${s.title}\n\n${s.text}`).join('\n\n')}\n\n${a.takeaway}`); break; }
    case 'new-note': openNote(); break;
    case 'edit-note': openNote(id); break;
    case 'delete-note': confirmAction('Let this note go?', 'This removes the note from your private workspace. This cannot be undone.', 'confirm-delete-note', id); break;
    case 'confirm-delete-note': workspace().notes = workspace().notes.filter(n => n.id !== id); workspace().saved = workspace().saved.filter(n => n !== id); persist(); closeDialog(); render(); notify('Note removed.'); break;
    case 'add-memory': openMemory(); break;
    case 'edit-memory': openMemory(id); break;
    case 'pin-memory': { const memory = workspace().memories.find(m => m.id === id); if (memory) { memory.pinned = !memory.pinned; persist(); refreshResults(); } break; }
    case 'delete-memory': confirmAction('Let this memory go?', 'This removes the memory from your private workspace. You can always add a new one later.', 'confirm-delete-memory', id); break;
    case 'confirm-delete-memory': workspace().memories = workspace().memories.filter(m => m.id !== id); persist(); closeDialog(); refreshResults(); notify('Memory forgotten.'); break;
    case 'connector': openConnector(id); break;
    case 'remove-connector': delete workspace().connectors[id]; persist(); closeDialog(); render(); notify('Local connection preferences cleared.'); break;
    case 'toggle-task': workspace().taskStates[id] = workspace().taskStates[id] === 'paused' ? 'queued' : 'paused'; persist(); render(); notify('Preview updated. No real task was changed.'); break;
    case 'delete-chat': confirmAction('Let this conversation go?', 'This deletes the conversation and its draft from your private workspace.', 'confirm-delete-chat', chatId); break;
    case 'confirm-delete-chat': workspace().chats = workspace().chats.filter(c => c.id !== id); delete workspace().drafts[id]; chatId = null; persist(); closeDialog(); render(); notify('Conversation removed.'); break;
    case 'export-workspace': download('cocoa-workspace.json', JSON.stringify({ version: 1, name: state.names[state.profile], workspace: workspace() }, null, 2), 'application/json'); break;
    case 'reset-workspace': confirmAction('Start this space afresh?', `This deletes ${state.names[state.profile]}’s local chats, notes, saved items, and preferences, then restores the sample memories. Export anything you want to keep first. The other person’s workspace is untouched.`, 'confirm-reset'); break;
    case 'confirm-reset': state.workspaces[state.profile] = freshWorkspace(); chatId = null; persist(); closeDialog(); navigate('chat'); notify('A fresh start for this space.'); break;
    default: break;
  }
});
document.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.target;
  if (form.id === 'chat-form') return submitChat();
  const values = new FormData(form);
  if (form.id === 'settings-form') {
    for (const id of PROFILES) state.names[id] = String(values.get(id)).trim().slice(0, 32) || (id === 'raghav' ? 'Raghav' : 'Ananya');
  } else if (form.id === 'memory-form') {
    const text = String(values.get('text')).trim(); if (!text) return;
    if (!form.dataset.id && workspace().memories.length >= 200) return notify('This prototype holds 200 memories per person. Remove an older one first.');
    const existing = workspace().memories.find(m => m.id === form.dataset.id);
    if (existing) Object.assign(existing, { text, category: values.get('category'), sample: false });
    else workspace().memories.unshift({ id: uid(), text, category: values.get('category'), pinned: false, sample: false });
  } else if (form.id === 'note-form') {
    const title = String(values.get('title')).trim(), body = String(values.get('body')).trim(); if (!title || !body) return;
    if (!form.dataset.id && workspace().notes.length >= 100) return notify('This prototype holds 100 notes per person. Export or remove an older one first.');
    const existing = workspace().notes.find(n => n.id === form.dataset.id);
    if (existing) Object.assign(existing, { title, body }); else workspace().notes.unshift({ id: uid(), title, body });
  } else if (form.id === 'connector-form') {
    workspace().connectors[form.dataset.id] = values.getAll('scope');
  } else return;
  persist(); closeDialog(); render(); notify(form.id === 'connector-form' ? 'Preferences saved privately. No account was connected.' : 'Saved to your space.');
});
document.addEventListener('input', event => {
  if (event.target.id === 'message') {
    workspace().drafts[draftKey()] = event.target.value;
    resizeComposer(event.target);
    app.querySelector('#send').disabled = !event.target.value.trim();
    persist();
  }
  if (event.target.id === 'collection-search') { query = event.target.value; refreshResults(); }
  if (event.target.id === 'global-search') dialog.querySelector('#search-results').innerHTML = searchResults(event.target.value, event.target.dataset.history === 'true');
});
document.addEventListener('change', event => {
  if (event.target.id === 'file-input' && event.target.files[0]) {
    attachment = event.target.files[0].name.slice(0, 120); render(); app.querySelector('#message').focus(); notify('Only the file name is shown. The file was not read or uploaded.');
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && dialog.open) { event.preventDefault(); closeDialog(); return; }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); if (!dialog.open) openSearch(); }
  // Mobile keyboards retain their newline key; desktop Enter sends, Shift+Enter adds a line.
  if (event.target.id === 'message' && event.key === 'Enter' && !event.shiftKey && !event.isComposing && matchMedia('(pointer: fine)').matches) { event.preventDefault(); submitChat(); }
});
window.addEventListener('hashchange', () => { if (!account.active) return; const next = location.hash.slice(1); if (tabs.some(t => t.id === next)) navigate(next); });
document.addEventListener('cocoa:sync', event => {
  document.querySelectorAll('.sync-status').forEach(element => { element.textContent = event.detail; });
  if (!['Saving privately…', 'Saved privately'].includes(event.detail)) notify(event.detail);
});
render();
