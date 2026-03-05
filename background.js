chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "downloadFiles") {
    request.urls.forEach((url) => {
      processAndDownload(url);
    });
  }
});

async function processAndDownload(moduleUrl) {
  try {
    const response = await fetch(moduleUrl, { credentials: "include" });
    const html = await response.text();
    const baseUrl = new URL(response.url).origin;

    // 1) 일반 첨부파일: download="true" + download_frd=1
    const attachRegex =
      /<a[^>]*download="true"[^>]*href="([^"]+download_frd=1)"/i;
    const attachMatch = html.match(attachRegex);

    if (attachMatch && attachMatch[1]) {
      chrome.downloads.download({ url: `${baseUrl}${attachMatch[1]}` });
      return;
    }

    // 2) 과제 페이지 내 파일: instructure_file_link
    //    href가 class 앞이든 뒤든 매칭
    const fileTagRegex = /<a[^>]*instructure_file_link[^>]*>/gi;
    const hrefRegex = /href="([^"]+)"/i;
    let tagMatch;
    while ((tagMatch = fileTagRegex.exec(html)) !== null) {
      const hrefMatch = tagMatch[0].match(hrefRegex);
      if (!hrefMatch) continue;
      let href = hrefMatch[1];
      if (!href.includes("download_frd=1")) {
        href = href.replace(/\?.*$/, "") + "?download_frd=1";
      }
      const downloadUrl = href.startsWith("http")
        ? href
        : `${baseUrl}${href}`;
      chrome.downloads.download({ url: downloadUrl });
    }

    console.log("[ETL Downloader]", response.url, "→ matches:", html.includes("instructure_file_link"));
  } catch (error) {
    console.error(error);
  }
}
