(function () {
  const script = document.currentScript;
  const scriptUrl = script?.src ? new URL(script.src, window.location.href) : null;
  const assetBaseUrl = scriptUrl ? scriptUrl.origin : "";
  const apiBaseUrl = script?.dataset.apiBaseUrl || assetBaseUrl;
  const formUrl = "https://forms.gle/aYFRTZbEzBzu76k19";
  const feedbackFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSf89aX-QlpIDts-sMoTdQNjDwQw-AzKbiQL-WOF34aQOkRBnw/viewform?usp=header";
  const qaMode = new URLSearchParams(window.location.search).has("qa");

  const state = {
    open: false,
    history: [],
    lastExchange: null
  };

  let qaStatus;
  let qaStatusTimer;

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function ensureStylesheet() {
    if (!assetBaseUrl) return;
    const href = `${assetBaseUrl}/styles.css`;
    const alreadyLoaded = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .some((link) => link.href === href);
    if (alreadyLoaded) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.append(link);
  }

  function cleanDisplayText(text) {
    return String(text || "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*{2,}/g, "")
      .trim();
  }

  function addMessage(role, text) {
    const content = role === "bot" ? cleanDisplayText(text) : String(text || "");
    const message = createElement("div", `sgf-chat__message sgf-chat__message--${role}`, content);
    messages.append(message);
    messages.scrollTop = messages.scrollHeight;
    state.history.push({ role: role === "user" ? "user" : "assistant", content });
  }

  function showTypingIndicator() {
    const typing = createElement("div", "sgf-chat__message sgf-chat__message--bot sgf-chat__typing");
    typing.setAttribute("role", "status");
    typing.setAttribute("aria-label", "Stern Grove Support is typing");
    typing.innerHTML = "<span></span><span></span><span></span>";
    messages.append(typing);
    messages.scrollTop = messages.scrollHeight;
    return typing;
  }

  function removeTypingIndicator(typing) {
    if (typing?.parentNode) {
      typing.remove();
    }
  }

  function setOpen(open) {
    state.open = open;
    root.classList.toggle("sgf-chat--open", open);
    launcher.hidden = open;
    if (open) input.focus();
  }

  function askStaff() {
    window.open(formUrl, "_blank", "noopener,noreferrer");
  }

  function setQaStatus(text) {
    if (!qaStatus) return;
    qaStatus.textContent = text;
    clearTimeout(qaStatusTimer);
    if (text) {
      qaStatusTimer = setTimeout(() => {
        qaStatus.textContent = "";
      }, 2200);
    }
  }

  function fallbackCopy(text) {
    const textarea = createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.append(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }

  async function copyText(text) {
    if (!text) {
      setQaStatus("Ask a question first");
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        fallbackCopy(text);
      }
      setQaStatus("Copied");
    } catch {
      fallbackCopy(text);
      setQaStatus("Copied");
    }
  }

  function formatLastExchange() {
    if (!state.lastExchange) return "";
    return [
      `Question: ${state.lastExchange.question}`,
      "",
      `Answer: ${state.lastExchange.answer}`
    ].join("\n");
  }

  function formatTranscript() {
    return state.history
      .map((item) => `${item.role === "user" ? "Patron" : "Chatbot"}: ${item.content}`)
      .join("\n\n");
  }

  async function sendMessage(text) {
    const message = text.trim();
    if (!message) return;

    addMessage("user", message);
    input.value = "";
    send.disabled = true;
    input.disabled = true;
    const typing = showTypingIndicator();

    try {
      const response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message,
          history: state.history.slice(-10)
        })
      });

      const data = await response.json();
      removeTypingIndicator(typing);
      const reply = data.reply || "I do not know the answer to that. Please use the Ask a Staff Member button to contact the Stern Grove team.";
      addMessage("bot", reply);
      state.lastExchange = { question: message, answer: reply };
    } catch {
      removeTypingIndicator(typing);
      const reply = "I do not know the answer to that. Please use the Ask a Staff Member button to contact the Stern Grove team.";
      addMessage("bot", reply);
      state.lastExchange = { question: message, answer: reply };
    } finally {
      send.disabled = false;
      input.disabled = false;
      input.focus();
    }
  }

  const root = createElement("div", "sgf-chat");
  const panel = createElement("section", "sgf-chat__panel");
  panel.setAttribute("aria-label", "Stern Grove Festival patron support chat");

  const header = createElement("div", "sgf-chat__header");
  ensureStylesheet();

  const titleWrap = createElement("div", "sgf-chat__title-wrap");
  const title = createElement("p", "sgf-chat__title", "Stern Grove Support");
  const beta = createElement("span", "sgf-chat__beta", "Beta");
  beta.setAttribute("aria-label", "Beta: this chatbot is new and still being improved");
  titleWrap.append(title, beta);
  const close = createElement("button", "sgf-chat__close", "x");
  close.type = "button";
  close.setAttribute("aria-label", "Close chat");
  header.append(titleWrap, close);

  const messages = createElement("div", "sgf-chat__messages");
  messages.setAttribute("aria-live", "polite");

  const actions = createElement("div", "sgf-chat__actions");
  const staff = createElement("button", "sgf-chat__staff", "Ask a Staff Member");
  staff.type = "button";
  actions.append(staff);

  const qaTools = createElement("div", "sgf-chat__qa");
  qaTools.hidden = !qaMode;
  const qaTitle = createElement("p", "sgf-chat__qa-title", "Staff QA");
  const qaButtons = createElement("div", "sgf-chat__qa-buttons");
  const copyLast = createElement("button", "sgf-chat__qa-button", "Copy last Q&A");
  const copyTranscript = createElement("button", "sgf-chat__qa-button", "Copy transcript");
  const openFeedback = createElement("button", "sgf-chat__qa-button", "Open feedback form");
  qaStatus = createElement("span", "sgf-chat__qa-status");
  copyLast.type = "button";
  copyTranscript.type = "button";
  openFeedback.type = "button";
  qaButtons.append(copyLast, copyTranscript, openFeedback);
  qaTools.append(qaTitle, qaButtons, qaStatus);

  const form = createElement("form", "sgf-chat__form");
  const input = createElement("input", "sgf-chat__input");
  input.type = "text";
  input.placeholder = "Ask a festival question";
  input.setAttribute("aria-label", "Ask a festival question");
  const send = createElement("button", "sgf-chat__send", "Send");
  send.type = "submit";
  form.append(input, send);

  const launcher = createElement("button", "sgf-chat__launcher", "Festival Support");
  launcher.type = "button";

  panel.append(header, messages, actions, qaTools, form);
  root.append(panel, launcher);
  document.body.append(root);

  addMessage("bot", "Hello! I'm an assistant trained to help with common questions about Stern Grove Festival. How can I help you?");

  launcher.addEventListener("click", () => setOpen(true));
  close.addEventListener("click", () => setOpen(false));
  staff.addEventListener("click", askStaff);
  copyLast.addEventListener("click", () => copyText(formatLastExchange()));
  copyTranscript.addEventListener("click", () => copyText(formatTranscript()));
  openFeedback.addEventListener("click", () => {
    window.open(feedbackFormUrl, "_blank", "noopener,noreferrer");
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage(input.value);
  });
})();
