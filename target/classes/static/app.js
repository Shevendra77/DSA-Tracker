const saved = localStorage.getItem('theme');
if (saved) document.documentElement.dataset.theme = saved;

function setTheme(name) {
  document.documentElement.dataset.theme = name;
  localStorage.setItem('theme', name);
}

const state = {
  questions: [],
  topics: [],
  activeTopic: 'all',
  search: '',
  status: 'all',
  difficulty: 'all'
};

const $ = id => document.getElementById(id);

let toastTimer;
let revisionState = {};

try {
  revisionState = JSON.parse(
    localStorage.getItem('dsaRevisionState') || '{}'
  );
} catch {
  revisionState = {};
}

const knownQuestions = {
  'Remove K Digits': {
    pattern: 'Monotonic Stack',
    url: 'https://leetcode.com/problems/remove-k-digits/',
    note: 'Keep digits increasing. Remove larger preceding digits when a smaller digit appears.',
    difficulty: 'Medium'
  },
  'Two Sum': {
    pattern: 'Hashing',
    url: 'https://leetcode.com/problems/two-sum/',
    note: 'Store previously seen numbers and look for the required complement.',
    difficulty: 'Easy'
  },
  'Squares of a Sorted Array': {
    pattern: 'Two Pointers',
    url: 'https://leetcode.com/problems/squares-of-a-sorted-array/',
    note: 'Compare both ends and place the larger square at the end.',
    difficulty: 'Easy'
  },
  'Move Zeroes': {
    pattern: 'Two Pointers',
    url: 'https://leetcode.com/problems/move-zeroes/',
    note: 'Move non-zero elements forward while preserving their order.',
    difficulty: 'Easy'
  },
  'Valid Parentheses': {
    pattern: 'Stack',
    url: 'https://leetcode.com/problems/valid-parentheses/',
    note: 'Push opening brackets and match them when closing brackets appear.',
    difficulty: 'Easy'
  },
  'Binary Search': {
    pattern: 'Binary Search',
    url: 'https://leetcode.com/problems/binary-search/',
    note: 'Discard half the sorted search space after each comparison.',
    difficulty: 'Easy'
  },
  'Longest Substring Without Repeating Characters': {
    pattern: 'Sliding Window + Hashing',
    url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    note: 'Maintain a window with unique characters.',
    difficulty: 'Medium'
  },
  'Container With Most Water': {
    pattern: 'Two Pointers',
    url: 'https://leetcode.com/problems/container-with-most-water/',
    note: 'Move the pointer at the shorter boundary to seek a larger area.',
    difficulty: 'Medium'
  },
  '3Sum': {
    pattern: 'Sorting + Two Pointers',
    url: 'https://leetcode.com/problems/3sum/',
    note: 'Sort the array, fix one value, then search with two pointers.',
    difficulty: 'Medium'
  },
  'Trapping Rain Water': {
    pattern: 'Two Pointers',
    url: 'https://leetcode.com/problems/trapping-rain-water/',
    note: 'Track left and right maximum heights to calculate trapped water.',
    difficulty: 'Hard'
  }
};

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  return response.json();
}

function notify(message, error = false) {
  const toast = $('toast');

  toast.textContent = message;
  toast.classList.toggle('error', error);
  toast.classList.add('show');

  clearTimeout(toastTimer);

  toastTimer = setTimeout(
    () => toast.classList.remove('show'),
    2600
  );
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[ch]);
}

function getMetadata(q) {
  const known = knownQuestions[q.title] || {};

  let pattern = q.pattern || known.pattern || '';

  if (!pattern) {
    const title = q.title.toLowerCase();

    if (/binary search|search insert|rotated sorted|square root|peak element/.test(title)) {
      pattern = 'Binary Search';
    } else if (/substring|window|every window|consecutive ones iii/.test(title)) {
      pattern = 'Sliding Window';
    } else if (/two sum|duplicate|frequency|anagram|hash|consecutive sequence/.test(title)) {
      pattern = 'Hashing';
    } else if (/reverse linked|linked list|cycle in linked|nth node/.test(title)) {
      pattern = 'Linked List';
    } else if (/parentheses|next greater|next smaller|stock span|histogram|min stack/.test(title)) {
      pattern = 'Stack';
    } else if (/two pointers|container with most water|3sum|4sum|move zeroes|sorted array/.test(title)) {
      pattern = 'Two Pointers';
    } else {
      pattern = q.topic === 'Arrays' ? 'Array Traversal' : q.topic;
    }
  }

  const resourceUrl =
    q.resourceUrl ||
    q.url ||
    known.url ||
    `https://leetcode.com/problemset/?search=${encodeURIComponent(q.title)}`;

  const rawDifficulty = q.difficulty || known.difficulty || 'Medium';

  // Normalize difficulty values for consistent filtering.
  const difficultyMap = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard'
  };

  const difficulty =
    difficultyMap[String(rawDifficulty).trim().toLowerCase()] ||
    'Medium';

  return {
    pattern,
    url: resourceUrl,
    note: q.note || known.note || 'Add your intuition and approach here.',
    difficulty
  };
}

function topicStats() {
  const stats = {};

  state.questions.forEach(q => {
    if (!stats[q.topic]) {
      stats[q.topic] = { total: 0, solved: 0 };
    }

    stats[q.topic].total++;

    if (q.solved) {
      stats[q.topic].solved++;
    }
  });

  return stats;
}

function renderNavigation() {
  const stats = topicStats();

  $('topicNav').innerHTML = Object.entries(stats).map(([topic, s]) => {
    const percent = s.total
      ? Math.round(s.solved * 100 / s.total)
      : 0;

    return `
      <button class="topic-btn ${
        state.activeTopic === topic ? 'active' : ''
      }" data-topic-nav="${escapeHtml(topic)}">
        <span class="topic-label-wrap">
          <span class="topic-label-line">
            <span class="topic-dot"></span>
            <span class="topic-name">${escapeHtml(topic)}</span>
          </span>
          <span class="topic-mini-track">
            <span style="width:${percent}%"></span>
          </span>
        </span>
        <span class="topic-count">${s.solved}/${s.total}</span>
      </button>`;
  }).join('');

  $('topicNav').querySelectorAll('[data-topic-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      setTopic(btn.dataset.topicNav);
    });
  });

  $('topicFilter').innerHTML =
    '<option value="all">All topics</option>' +
    Object.keys(stats).map(topic =>
      `<option value="${escapeHtml(topic)}">${escapeHtml(topic)}</option>`
    ).join('');

  $('topicFilter').value = state.activeTopic;
  $('sideTotal').textContent = state.questions.length;
}

function renderDashboard() {
  const total = state.questions.length;
  const solved = state.questions.filter(q => q.solved).length;
  const remaining = total - solved;

  const percent = total
    ? Math.round(solved * 1000 / total) / 10
    : 0;

  $('totalStat').textContent = total;
  $('solvedStat').textContent = solved;
  $('remainingStat').textContent = remaining;
  $('solvedPercent').textContent = `${percent}%`;
  $('progressPercent').textContent = `${percent}%`;
  $('overallBar').style.width = `${percent}%`;

  $('progressMessage').textContent = solved === 0
    ? 'Your journey starts here.'
    : remaining === 0
      ? 'Amazing! You completed every question.'
      : `${remaining} more to reach your goal.`;
}

function filteredQuestions() {
  return state.questions.filter(q => {
    const topicOk =
      state.activeTopic === 'all' ||
      q.topic === state.activeTopic;

    const statusOk =
      state.status === 'all' ||
      (state.status === 'solved' ? q.solved : !q.solved);

    const meta = getMetadata(q);

    const search = state.search.toLowerCase();

    const searchOk = [
      q.title,
      q.topic,
      meta.pattern,
      meta.note,
      meta.difficulty
    ].some(value =>
      String(value).toLowerCase().includes(search)
    );

    // NEW: Difficulty filter
    const difficultyOk =
      state.difficulty === 'all' ||
      meta.difficulty.toLowerCase() ===
        state.difficulty.toLowerCase();

    return topicOk && statusOk && searchOk && difficultyOk;
  });
}

function renderQuestions() {
  const visible = filteredQuestions();

  $('questionRows').innerHTML = visible.map(q => {
    const meta = getMetadata(q);
    const revisionDone = Boolean(revisionState[q.id]);
    const difficulty = meta.difficulty.toLowerCase();

    const difficultyClass =
      difficulty === 'easy' ? 'difficulty-easy' :
      difficulty === 'hard' ? 'difficulty-hard' :
      'difficulty-medium';

    return `
      <tr class="${q.solved ? 'solved-row' : ''}">
        <td class="check-col">
          <input
            class="question-check"
            type="checkbox"
            aria-label="Mark ${escapeHtml(q.title)} solved"
            data-id="${q.id}"
            ${q.solved ? 'checked' : ''}>
        </td>

        <td>
          <span class="question-title">${escapeHtml(q.title)}</span>
        </td>

        <td>
          <div class="pattern-cell">${escapeHtml(meta.pattern)}</div>
          <div style="margin-top:5px">
            <span class="topic-pill" data-topic="${escapeHtml(q.topic)}">
              ${escapeHtml(q.topic)}
            </span>
          </div>
        </td>

        <td>
          <a class="question-table-link"
             href="${escapeHtml(meta.url)}"
             target="_blank"
             rel="noopener noreferrer">Open ↗</a>
        </td>

        <td>
          <div class="question-note">${escapeHtml(meta.note)}</div>
        </td>

        <td>
          <button
            class="revision-btn ${revisionDone ? 'is-done' : ''}"
            type="button"
            data-revision-id="${q.id}"
            aria-pressed="${revisionDone}"
            aria-label="${revisionDone ? 'Mark revision pending' : 'Mark revision complete'}">
            ${revisionDone ? '✓ Done' : '＋ Review'}
          </button>
        </td>

        <td>
          <span class="difficulty-pill ${difficultyClass}">
            ${escapeHtml(meta.difficulty)}
          </span>
        </td>
      </tr>`;
  }).join('');

  $('emptyState').classList.toggle('hidden', visible.length !== 0);
  $('questionRows').classList.toggle('hidden', visible.length === 0);

  $('visibleCount').textContent =
    `${visible.length} question${visible.length === 1 ? '' : 's'}`;

  $('footerCount').textContent =
    `Showing ${visible.length} of ${state.questions.length} questions`;

  $('questionRows').querySelectorAll('.question-check').forEach(input => {
    input.addEventListener('change', () => {
      updateQuestion(Number(input.dataset.id), input.checked, input);
    });
  });

  $('questionRows').querySelectorAll('[data-revision-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.revisionId;
      const previousValue = Boolean(revisionState[id]);

      revisionState[id] = !previousValue;

      try {
        localStorage.setItem(
          'dsaRevisionState',
          JSON.stringify(revisionState)
        );

        renderQuestions();

        notify(revisionState[id]
          ? 'Revision marked complete ✓'
          : 'Revision marked pending');
      } catch {
        revisionState[id] = previousValue;
        notify('Could not save revision in this browser.', true);
      }
    });
  });
}

function renderAll() {
  const active = state.activeTopic;

  $('crumbTopic').textContent =
    active === 'all' ? 'All Questions' : active;

  $('listTitle').textContent =
    active === 'all' ? 'All Questions' : active;

  $('listSubtitle').textContent =
    active === 'all'
      ? 'Work through your placement checklist topic by topic.'
      : `Track your ${active} practice and keep moving forward.`;

  renderNavigation();
  renderDashboard();
  renderQuestions();
}

async function updateQuestion(id, solved, input) {
  const question = state.questions.find(q => q.id === id);

  if (!question) return;

  const old = question.solved;

  question.solved = solved;
  input.disabled = true;

  renderDashboard();
  renderNavigation();

  try {
    const saved = await api(`/api/questions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ solved })
    });

    Object.assign(question, saved);
    renderAll();

    notify(solved
      ? 'Question completed and saved ✓'
      : 'Question marked as not solved');
  } catch {
    question.solved = old;
    renderAll();

    notify(
      'Could not save. Check that Spring Boot and MySQL are running.',
      true
    );
  }
}

function setTopic(topic) {
  state.activeTopic = topic;
  renderAll();
}

function exportCsv() {
  const rows = [[
    'Problem',
    'Topic',
    'Pattern',
    'Resource',
    'Note',
    'Revision',
    'Difficulty',
    'Status'
  ]];

  state.questions.forEach(q => {
    const meta = getMetadata(q);

    rows.push([
      q.title,
      q.topic,
      meta.pattern,
      meta.url,
      meta.note,
      revisionState[q.id] ? 'Reviewed' : 'Pending',
      meta.difficulty,
      q.solved ? 'Completed' : 'Not solved'
    ]);
  });

  const csv = rows.map(row =>
    row.map(value =>
      `"${String(value ?? '').replace(/"/g, '""')}"`
    ).join(',')
  ).join('\r\n');

  const blob = new Blob(['\ufeff' + csv], {
    type: 'text/csv;charset=utf-8;'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'java-dsa-placement-progress.csv';

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);

  notify('Progress exported to CSV ✓');
}

function resetFilters() {
  state.activeTopic = 'all';
  state.search = '';
  state.status = 'all';
  state.difficulty = 'all';

  $('searchInput').value = '';
  $('statusFilter').value = 'all';
  $('topicFilter').value = 'all';
  $('difficultyFilter').value = 'all';

  renderAll();

  notify('Filters cleared. Saved progress is unchanged.');
}

async function clearProgress() {
  const solvedQuestions = state.questions.filter(q => q.solved);

  if (!solvedQuestions.length) {
    notify('There are no completed questions to clear.');
    return;
  }

  const confirmed = window.confirm(
    `Clear progress for ${solvedQuestions.length} solved questions?\n\n` +
    'This will mark them as not solved in the database. ' +
    'Your questions will not be deleted.'
  );

  if (!confirmed) return;

  const button = $('clearProgress');

  button.disabled = true;
  button.textContent = 'Clearing...';

  try {
    for (const question of solvedQuestions) {
      await api(`/api/questions/${question.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ solved: false })
      });
    }

    state.questions = await api('/api/questions');

    renderAll();
    notify('Solved progress cleared successfully.');
  } catch {
    try {
      state.questions = await api('/api/questions');
      renderAll();
    } catch {
      // Keep the current view if refreshing also fails.
    }

    notify(
      'Some changes may have been saved. Reload and check your progress.',
      true
    );
  } finally {
    button.disabled = false;
    button.textContent = 'Clear Progress';
  }
}

async function init() {
  try {
    state.questions = await api('/api/questions');

    $('allNav').addEventListener('click', () => {
      setTopic('all');
    });

    $('searchInput').addEventListener('input', e => {
      state.search = e.target.value.trim();
      renderQuestions();
    });

    $('statusFilter').addEventListener('change', e => {
      state.status = e.target.value;
      renderQuestions();
    });

    $('topicFilter').addEventListener('change', e => {
      setTopic(e.target.value);
    });

    // NEW: Difficulty filter event
    $('difficultyFilter').addEventListener('change', e => {
      state.difficulty = e.target.value;
      renderQuestions();
    });

    $('exportButton').addEventListener('click', exportCsv);
    $('resetFilters').addEventListener('click', resetFilters);
    $('clearProgress').addEventListener('click', clearProgress);

    renderAll();
  } catch {
    $('questionRows').innerHTML = `
      <tr>
        <td colspan="7" class="loading">
          Could not load questions. Make sure Spring Boot and MySQL
          are running, then refresh.
        </td>
      </tr>`;

    notify('Could not connect to the backend.', true);
  }
}

init();
