(function () {
  const script = document.currentScript;
  const apiBaseUrl = script?.dataset.apiBaseUrl || "";
  const formUrl = "https://forms.gle/aYFRTZbEzBzu76k19";

  const state = {
    open: false,
    history: []
  };

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function addMessage(role, text) {
    const message = createElement("div", `sgf-chat__message sgf-chat__message--${role}`, text);
    messages.append(message);
    messages.scrollTop = messages.scrollHeight;
    state.history.push({ role: role === "user" ? "user" : "assistant", content: text });
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

  async function sendMessage(text) {
    const message = text.trim();
    if (!message) return;

    addMessage("user", message);
    input.value = "";
    send.disabled = true;

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
      addMessage("bot", data.reply || "I do not have confirmed information on that from Stern Grove's approved materials. Please use the Ask a Staff Member button to contact the Stern Grove team through the Patron Experience Form.");
    } catch {
      addMessage("bot", "I do not have confirmed information on that from Stern Grove's approved materials. Please use the Ask a Staff Member button to contact the Stern Grove team through the Patron Experience Form.");
    } finally {
      send.disabled = false;
      input.focus();
    }
  }

  const root = createElement("div", "sgf-chat");
  const panel = createElement("section", "sgf-chat__panel");
  panel.setAttribute("aria-label", "Stern Grove Festival patron support chat");

  const header = createElement("div", "sgf-chat__header");
  const title = createElement("p", "sgf-chat__title", "Stern Grove Support");
  const close = createElement("button", "sgf-chat__close", "x");
  close.type = "button";
  close.setAttribute("aria-label", "Close chat");
  header.append(title, close);

  const messages = createElement("div", "sgf-chat__messages");
  messages.setAttribute("aria-live", "polite");

  const actions = createElement("div", "sgf-chat__actions");
  const staff = createElement("button", "sgf-chat__staff", "Ask a Staff Member");
  staff.type = "button";
  actions.append(staff);

  const form = createElement("form", "sgf-chat__form");
  const input = createElement("input", "sgf-chat__input");
  input.type = "text";
  input.placeholder = "Ask a festival question";
  input.setAttribute("aria-label", "Ask a festival question");
  const send = createElement("button", "sgf-chat__send", "Send");
  send.type = "submit";
  form.append(input, send);

  const launcher = createElement("button", "sgf-chat__launcher", "Festival Help");
  launcher.type = "button";

  panel.append(header, messages, actions, form);
  root.append(panel, launcher);
  document.body.append(root);

  addMessage("bot", "Hi! I can help with common questions about the Festival. What can I help you with?");

  launcher.addEventListener("click", () => setOpen(true));
  close.addEventListener("click", () => setOpen(false));
  staff.addEventListener("click", askStaff);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage(input.value);
  });
})();
