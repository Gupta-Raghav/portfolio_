import test from 'node:test';
import assert from 'node:assert/strict';
import { freshState, freshWorkspace, restoreState, escapeHTML, demoReply, ARTIFACTS } from '../../public/companion/state.mjs';

test('people have independent workspaces, including nested state', () => {
  const state = freshState();
  state.workspaces.raghav.chats.push({ id: 'one', messages: [] });
  state.workspaces.raghav.memories[0].text = 'Only the first person';
  state.workspaces.raghav.saved.push('week');
  state.workspaces.raghav.connectors.calendar = ['Read calendar events'];
  assert.equal(state.workspaces.guest.chats.length, 0);
  assert.notEqual(state.workspaces.guest.memories[0].text, 'Only the first person');
  assert.deepEqual(state.workspaces.guest.saved, []);
  assert.deepEqual(state.workspaces.guest.connectors, {});
});
test('corrupt, empty and unsupported local storage recover safely', () => {
  for (const raw of [null, '', 'oops', '{}', 'null', '{"version":8}']) assert.deepEqual(restoreState(raw), freshState());
});
test('restoring data preserves edited profiles, notes and drafts', () => {
  const state = freshState();
  state.profile = 'guest'; state.theme = 'dark'; state.names.guest = 'Alex';
  state.workspaces.guest.notes.push({ id: 'note1', title: 'An idea', body: 'Make something.' });
  state.workspaces.guest.drafts.new = 'A draft';
  assert.deepEqual(restoreState(JSON.stringify(state)), state);
});
test('malformed collections and unknown permissions are discarded', () => {
  const state = freshState();
  state.workspaces.raghav = { chats: [null, 1, { id: 'c', title: {}, messages: [false, { role: 'system', text: '<script>', artifact: 'not-real' }] }], notes: [null, { id: 'n', title: 42 }], connectors: { calendar: ['read everything', 'Read calendar events'] }, memories: [null, { text: 'safe', category: '<img>' }], taskStates: { week: 'executing' }, drafts: { alien: 'discard' } };
  const w = restoreState(JSON.stringify(state)).workspaces.raghav;
  assert.equal(w.chats.length, 1);
  assert.equal(w.chats[0].messages[0].role, 'assistant');
  assert.equal(w.chats[0].messages[0].artifact, null);
  assert.equal(w.memories[0].category, 'Little things');
  assert.deepEqual(w.connectors.calendar, ['Read calendar events']);
  assert.deepEqual(w.taskStates, {}); assert.deepEqual(w.drafts, {});
});
test('all untrusted markup characters are escaped', () => {
  assert.equal(escapeHTML('<img src="x" onerror=\'bad\'>&'), '&lt;img src=&quot;x&quot; onerror=&#39;bad&#39;&gt;&amp;');
});
test('sample replies are explicit about not using AI or starting work', () => {
  for (const prompt of ['plan a weekend', 'focus this week', 'dinner', 'an idea']) {
    const reply = demoReply(prompt);
    assert.match(reply.text, /local preview/);
    assert.match(reply.text, /haven’t sent your message to an AI/);
    assert.ok(ARTIFACTS.some(a => a.id === reply.artifact));
  }
});
test('reset produces fresh data without mutating another person', () => {
  const state = freshState();
  state.workspaces.guest.notes.push({ id: 'g', title: 'Keep', body: 'Me' });
  state.workspaces.raghav = freshWorkspace();
  assert.equal(state.workspaces.guest.notes[0].title, 'Keep');
});
test('stored collections and user text are bounded', () => {
  const state = freshState();
  state.names.raghav = 'a'.repeat(100);
  state.workspaces.raghav.notes = Array.from({ length: 120 }, (_, i) => ({ id: String(i), title: 'n', body: 'b'.repeat(15000) }));
  const loaded = restoreState(JSON.stringify(state));
  assert.equal(loaded.names.raghav.length, 32);
  assert.equal(loaded.workspaces.raghav.notes.length, 100);
  assert.equal(loaded.workspaces.raghav.notes[0].body.length, 10000);
});
