function injectStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .etl-toolbar {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 12px;
      padding-top: 12px;
      padding-bottom: 12px;
      position: sticky;
      top: 0;
      z-index: 100;
      background: #fff;
      margin-top: 12px;
      margin-bottom: -8px;
    }

    .etl-download-btn {
      padding: 8px 16px;
      background: #0f0f70;
      color: white;
      border: none;
      border-radius: 99px;
      cursor: pointer;
      font-size: 14px;
      letter-spacing: -0.02em;
      transition: background 0.2s;
      margin-left: 8px;
    }

    .etl-download-btn:hover {
      background: #2222a2;
      transform: translateY(-1.5px);
    }

    .etl-download-btn:active {
      background: #0a0a50;
    }

    .etl-select-all-label {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      font-size: 14px;
      color: #333;
      letter-spacing: -0.02em;
      user-select: none;
      margin-top: 3px;
    }

    .etl-bulk-checkbox {
      width: 16px !important;
      height: 16px !important;
      cursor: pointer !important;
      accent-color: #0f0f70 !important;
      margin-left: 6px !important;
      margin-right: 10px !important;
      margin-bottom: 3px !important;
    }

    .etl-select-all-checkbox {
      width: 16px !important;
      height: 16px !important;
      cursor: pointer !important;
      accent-color: #0f0f70 !important;
      margin-top: -1px !important;
    }
  `;
  document.head.appendChild(style);
}

let lastCheckedIndex = null;

function injectCheckboxes() {
  const items = document.querySelectorAll(
    ".context_module_item.attachment a.ig-title",
  );
  items.forEach((item) => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "etl-bulk-checkbox";
    checkbox.value = item.href;

    checkbox.addEventListener("change", updateSelectAllState);

    checkbox.addEventListener("click", (e) => {
      const allCheckboxes = Array.from(
        document.querySelectorAll(".etl-bulk-checkbox"),
      );
      const currentIndex = allCheckboxes.indexOf(checkbox);

      if (e.shiftKey && lastCheckedIndex !== null) {
        const start = Math.min(lastCheckedIndex, currentIndex);
        const end = Math.max(lastCheckedIndex, currentIndex);
        for (let i = start; i <= end; i++) {
          allCheckboxes[i].checked = checkbox.checked;
        }
        updateSelectAllState();
      }

      lastCheckedIndex = currentIndex;
    });

    const row = item.closest(".ig-row");
    const typeIcon = row ? row.querySelector(".type_icon") : null;
    if (typeIcon) {
      row.insertBefore(checkbox, typeIcon);
    } else {
      item.parentNode.insertBefore(checkbox, item);
    }
  });
}

function updateSelectAllState() {
  const selectAll = document.querySelector(".etl-select-all-checkbox");
  if (!selectAll) return;

  const all = document.querySelectorAll(".etl-bulk-checkbox");
  const checked = document.querySelectorAll(".etl-bulk-checkbox:checked");

  if (checked.length === 0) {
    selectAll.checked = false;
    selectAll.indeterminate = false;
  } else if (checked.length === all.length) {
    selectAll.checked = true;
    selectAll.indeterminate = false;
  } else {
    selectAll.checked = false;
    selectAll.indeterminate = false;
  }
}

function injectDownloadButton() {
  const toolbar = document.createElement("div");
  toolbar.className = "etl-toolbar";

  const button = document.createElement("button");
  button.innerText = "선택 항목 일괄 다운로드";
  button.className = "etl-download-btn";

  button.addEventListener("click", () => {
    const checkedBoxes = document.querySelectorAll(
      ".etl-bulk-checkbox:checked",
    );
    const urls = Array.from(checkedBoxes).map((cb) => cb.value);

    if (urls.length > 0) {
      try {
        chrome.runtime.sendMessage({ action: "downloadFiles", urls: urls });
      } catch {
        alert("확장 프로그램이 업데이트되었습니다. 페이지를 새로고침해주세요.");
      }
    } else {
      alert("다운로드할 파일을 선택해주세요.");
    }
  });

  const selectAllLabel = document.createElement("label");
  selectAllLabel.className = "etl-select-all-label";

  const selectAllCheckbox = document.createElement("input");
  selectAllCheckbox.type = "checkbox";
  selectAllCheckbox.className = "etl-select-all-checkbox";

  selectAllCheckbox.addEventListener("change", () => {
    const checkboxes = document.querySelectorAll(".etl-bulk-checkbox");
    checkboxes.forEach((cb) => {
      cb.checked = selectAllCheckbox.checked;
    });
    selectAllCheckbox.indeterminate = false;
  });

  selectAllLabel.appendChild(selectAllCheckbox);
  selectAllLabel.appendChild(document.createTextNode("전체 선택"));

  toolbar.appendChild(button);
  toolbar.appendChild(selectAllLabel);

  const header = document.querySelector(".item-group-container");
  if (header) {
    header.parentNode.insertBefore(toolbar, header);
  }
}

injectStyles();
injectCheckboxes();
injectDownloadButton();
