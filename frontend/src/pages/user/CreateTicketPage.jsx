import { useState } from 'react';
import { createTicketRequest } from '../../services/api/ticket.api';
import { analyzeTicketRequest, suggestDescriptionsRequest } from '../../services/api/ai.api';

const CreateTicketPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('Other');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [suggestError, setSuggestError] = useState('');
  const [isTitleSuggesting, setIsTitleSuggesting] = useState(false);
  const [titleOptions, setTitleOptions] = useState([]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      await createTicketRequest({ title, description, priority, category });
      setMessage('Ticket created successfully');
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('Other');
      setSuggestions(null);
        setTitleOptions([]);
    } catch (submitError) {
      setError(submitError?.response?.data?.message || 'Failed to create ticket');
    }
  };

  const handleAiSuggest = async () => {
    if (!description || description.trim().length < 10) {
      setSuggestError('Please add a longer description for AI suggestions (at least 10 characters).');
      return;
    }
    setSuggestError('');
    setIsSuggesting(true);
    setSuggestions(null);

    try {
      const data = await analyzeTicketRequest(description);
      const payload = data?.data || {};

      const suggested = {
        title:
          payload.suggestedTitle ||
          (Array.isArray(payload.suggestedTitles) && payload.suggestedTitles[0]) ||
          payload.ticketTitle ||
          '',
        category: payload.category || payload.predictedCategory || '',
        priority: payload.priority || payload.predictedPriority || '',
        description:
          payload.summary ||
          payload.reply ||
          (Array.isArray(payload.suggestedDescriptions) && payload.suggestedDescriptions[0]) ||
          ''
      };

      setSuggestions(suggested);
    } catch (err) {
      setSuggestError(err?.response?.data?.message || 'AI suggestion failed');
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleTitleSuggest = async () => {
    if (!title || title.trim().length < 3) {
      setSuggestError('Please enter a short title (at least 3 characters) to get suggestions.');
      return;
    }

    setSuggestError('');
    setIsTitleSuggesting(true);
    setTitleOptions([]);

    try {
      const res = await suggestDescriptionsRequest(title.trim());
      const opts = res?.data?.descriptions || res?.descriptions || [];
      setTitleOptions(opts.slice(0, 3));
    } catch (err) {
      setSuggestError(err?.response?.data?.message || 'Title-based suggestion failed');
    } finally {
      setIsTitleSuggesting(false);
    }
  };

  const applyTitleOption = (text) => {
    if (!text) return;
    setDescription(text);
  };

  const applySuggestions = () => {
    if (!suggestions) return;
    if (suggestions.title) setTitle(suggestions.title);
    if (suggestions.description) setDescription(suggestions.description);
    if (suggestions.priority) setPriority(suggestions.priority);
    if (suggestions.category) setCategory(suggestions.category);
  };

  return (
    <section className="relative mx-auto max-w-5xl rounded-3xl border border-[var(--tm-border)] bg-[var(--tm-surface)] p-6 text-[var(--tm-text)] shadow-lg md:p-8">
      <div className="absolute -left-16 top-10 h-56 w-56 rounded-full bg-gradient-to-br from-cyan-500/20 to-transparent blur-3xl" />
      <div className="absolute -right-16 bottom-8 h-64 w-64 rounded-full bg-gradient-to-br from-fuchsia-500/20 to-transparent blur-3xl" />

      <div className="relative grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="mb-4 rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface-soft)] p-4">
            <p className="inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-wide text-[var(--tm-text-muted)]">Ticket Submission</p>
            <h1 className="mt-3 text-2xl font-semibold text-[var(--tm-text)]">Create Ticket</h1>
            <p className="mt-2 text-sm text-[var(--tm-text-muted)]">Share your issue details and route it quickly to the right support queue.</p>
          </div>

          {message ? (
            <p className="mb-4 rounded-xl border border-emerald-300/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">{message}</p>
          ) : null}
          {error ? (
            <p className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">{error}</p>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface-muted)] p-5 shadow-sm">
            <div>
              <label className="mb-1 flex items-center justify-between text-sm font-medium text-[var(--tm-text-muted)]">
                <span>Title</span>
                <button
                  type="button"
                  onClick={handleTitleSuggest}
                  disabled={isTitleSuggesting}
                  className="ml-2 rounded-md border border-[var(--tm-border)] bg-transparent px-2 py-1 text-xs text-[var(--tm-text-muted)] hover:bg-[var(--tm-hover)]"
                >
                  {isTitleSuggesting ? 'Thinking…' : 'Suggest descriptions'}
                </button>
              </label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Short, descriptive title"
                className="w-full rounded-lg border border-[var(--tm-border)] bg-[var(--tm-surface)] px-3 py-2.5 text-[var(--tm-text)] outline-none transition focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--tm-text-muted)]">Description</label>
              <textarea
                rows={6}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the issue, steps to reproduce, expected vs actual behavior"
                className="w-full rounded-lg border border-[var(--tm-border)] bg-[var(--tm-surface)] px-3 py-2.5 text-[var(--tm-text)] outline-none transition focus:border-cyan-400"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--tm-text-muted)]">Priority</label>
                <select
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                  className="w-full rounded-lg border border-[var(--tm-border)] bg-[var(--tm-surface)] px-3 py-2.5 text-[var(--tm-text)] outline-none transition focus:border-cyan-400"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--tm-text-muted)]">Category</label>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full rounded-lg border border-[var(--tm-border)] bg-[var(--tm-surface)] px-3 py-2.5 text-[var(--tm-text)] outline-none transition focus:border-cyan-400"
                >
                  <option value="Hardware">Hardware</option>
                  <option value="Software">Software</option>
                  <option value="Network">Network</option>
                  <option value="Access">Access</option>
                  <option value="Security">Security</option>
                  <option value="Account">Account</option>
                  <option value="Billing">Billing</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
              >
                Submit Ticket
              </button>

              <button
                type="button"
                onClick={handleAiSuggest}
                disabled={isSuggesting}
                className="ml-2 rounded-lg border border-[var(--tm-border)] bg-transparent px-3 py-2 text-sm text-[var(--tm-text)] transition hover:bg-[var(--tm-hover)]"
              >
                {isSuggesting ? 'Suggesting…' : 'AI Suggest'}
              </button>

              {suggestions ? (
                <button
                  type="button"
                  onClick={applySuggestions}
                  className="ml-auto rounded-lg border border-[var(--tm-border)] bg-[var(--tm-surface-soft)] px-3 py-2 text-sm text-[var(--tm-text)] transition hover:brightness-95"
                >
                  Apply Suggestions
                </button>
              ) : null}
            </div>

            {suggestError ? <p className="text-sm text-red-600">{suggestError}</p> : null}
          </form>
        </div>

        <aside className="rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface-soft)] p-4">
          <h3 className="text-sm font-medium text-[var(--tm-text)]">AI Suggestions</h3>
          <p className="mt-1 text-xs text-[var(--tm-text-muted)]">Let the AI suggest a better title, summary, category, and priority.</p>

          <div className="mt-4 space-y-3">
            {!suggestions && titleOptions.length === 0 ? (
              <div className="rounded-md border border-[var(--tm-border)] bg-[var(--tm-surface)] p-3 text-sm text-[var(--tm-text-muted)]">No suggestions yet — enter a description and click <strong>AI Suggest</strong>, or provide a title and click <strong>Suggest descriptions</strong>.</div>
            ) : (
              <div className="space-y-3">
                {titleOptions.length > 0 ? (
                  <div>
                    <p className="text-xs text-[var(--tm-text-muted)]">Descriptions from Title</p>
                    <div className="mt-2 space-y-2">
                      {titleOptions.map((opt, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <button type="button" onClick={() => applyTitleOption(opt)} className="rounded-md border border-[var(--tm-border)] bg-[var(--tm-surface)] px-2 py-1 text-sm text-[var(--tm-text)] hover:brightness-95">Use</button>
                          <p className="text-sm text-[var(--tm-text)]">{opt}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {suggestions ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-[var(--tm-text-muted)]">Suggested Title</p>
                      <p className="mt-1 break-words text-sm font-semibold text-[var(--tm-text)]">{suggestions.title || '-'}</p>
                    </div>

                    <div>
                      <p className="text-xs text-[var(--tm-text-muted)]">Suggested Priority</p>
                      <p className="mt-1 text-sm text-[var(--tm-text)]">{(suggestions.priority && suggestions.priority.toString()) || '-'}</p>
                    </div>

                    <div>
                      <p className="text-xs text-[var(--tm-text-muted)]">Suggested Category</p>
                      <p className="mt-1 text-sm text-[var(--tm-text)]">{suggestions.category || '-'}</p>
                    </div>

                    <div>
                      <p className="text-xs text-[var(--tm-text-muted)]">Suggested Summary</p>
                      <p className="mt-1 max-h-36 overflow-auto break-words text-sm text-[var(--tm-text)]">{suggestions.description || '-'}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
};

export default CreateTicketPage;
