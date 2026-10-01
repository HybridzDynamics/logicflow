export function createStatusNotifier(messageElement, toastElement, duration = 2200) {
  let timeoutId;
  return (message) => {
    messageElement.textContent = message;
    toastElement.textContent = message;
    toastElement.classList.add("visible");
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => toastElement.classList.remove("visible"), duration);
  };
}