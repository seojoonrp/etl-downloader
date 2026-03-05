function injectCheckboxes() {
  const items = document.querySelectorAll("a.ig-title");
  items.forEach((item) => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "etl-bulk-checkbox";
    checkbox.value = item.href;

    item.parentNode.insertBefore(checkbox, item);
  });
}

function injectDownloadButton() {
  const button = document.createElement("button");
  button.innerText = "선택 항목 일괄 다운로드";
  button.style.cssText =
    "padding: 8px 16px; background: #00529B; color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 15px;";

  button.addEventListener("click", () => {
    const checkedBoxes = document.querySelectorAll(
      ".etl-bulk-checkbox:checked",
    );
    const urls = Array.from(checkedBoxes).map((cb) => cb.value);

    if (urls.length > 0) {
      chrome.runtime.sendMessage({ action: "downloadFiles", urls: urls });
    } else {
      alert("다운로드할 파일을 선택해주세요.");
    }
  });

  const header = document.querySelector(".item-group-container");
  if (header) {
    header.parentNode.insertBefore(button, header);
  }
}

injectCheckboxes();
injectDownloadButton();
