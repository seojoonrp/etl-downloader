chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "downloadFiles") {
    request.urls.forEach((url) => {
      processAndDownload(url);
    });
  }
});

async function processAndDownload(moduleUrl) {
  try {
    const response = await fetch(moduleUrl);
    const html = await response.text();

    const regex = /<a[^>]*download="true"[^>]*href="([^"]+download_frd=1)"/i;
    const match = html.match(regex);

    if (match && match[1]) {
      const baseUrl = new URL(moduleUrl).origin;
      const downloadUrl = `${baseUrl}${match[1]}`;
      chrome.downloads.download({ url: downloadUrl });
    }
  } catch (error) {
    console.error(error);
  }
}
