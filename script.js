(async () => {
   const dialog = document.createElement("dialog");
   const label = document.createElement("label");
   const progress = document.createElement("progress");
   dialog.style.cssText = "display: flex; flex-direction: column; gap: 15px; padding: 20px;";
   dialog.appendChild(label);
   dialog.appendChild(progress);
   document.querySelector("ytd-app").appendChild(dialog);
   dialog.showModal();
   label.innerText = "Loading subscriptions...";
   const content = document.getElementById("content");
   let contentH;
   do {
      contentH = content.offsetHeight;
      window.scrollBy(0, 100000);
      await new Promise((r) => setTimeout(r, 500));
   } while (content.querySelector("#spinnerContainer.active") != null || content.offsetHeight > contentH);
   try {
      const channelElements = [...content.querySelectorAll("ytd-browse:not([hidden]) #main-link.channel-link")];
      progress.max = channelElements.length;
      progress.value = 0;
      const channels = [];
      for (e of channelElements) {
         label.innerText = `Fetching URLS... (${progress.value}/${progress.max})`;
         try {
            const channelName = e.querySelector("yt-formatted-string.ytd-channel-name").innerText;
            const channelReq = await fetch(e.href);
            if (!channelReq.ok) {
               console.error(`Couldn't fetch channel page for ${channelName}`);
               continue;
            }
            const channelPageDoc = new DOMParser().parseFromString(await channelReq.text(), "text/html");
            const links = channelPageDoc.querySelectorAll("body > link[rel=alternate], body > link[rel=canonical]");
            const channelIdMatch = [...links].map((e) => e.href.match("/channel/([a-zA-Z0-9_-]+?)$")).find((e) => e != null);
            if (channelIdMatch == null) {
               console.error(`Couldn't find channel id for ${channelName}`);
               continue;
            }
            channels.push([`https://www.youtube.com/feeds/videos.xml?channel_id=${channelIdMatch[1]}`, channelName, e.href]);
         } finally {
            progress.value++;
            progress.replaceWith(progress);
         }
      }
      if (channelElements.length == 0) alert("Couldn't find any subscriptions");
      const missedChannels = channelElements.length - channels.length;
      if (missedChannels > 0)
         alert(`${missedChannels} channel${missedChannels > 1 ? "s" : ""} couldn't be fetched. Check the console for more info.`);
      const escapeXML = (str) =>
         str.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
      if (channels.length > 0) {
         console.log(channels.map(([feed]) => feed).join("\n"));
         let opmlText = `<?xml version="1.0" encoding="UTF-8"?>\n<opml version="1.0">\n\t<head>\n\t\t<title>YouTube Subscriptions as RSS</title>\n\t</head>\n\t<body>\n\t\t<outline text="YouTube Subscriptions">${channels
            .map(
               ([feed, channelName, channelUrl]) =>
                  `\n\t\t\t<outline type="rss" text="${escapeXML(channelName)}" title="${escapeXML(
                     channelName
                  )}" xmlUrl="${feed}" htmlUrl="${channelUrl}"/>`
            )
            .join("")}\n\t\t</outline>\n\t</body>\n</opml>`;
         const url = window.URL.createObjectURL(new Blob([opmlText], { type: "text/plain" }));
         const anchorTag = document.createElement("a");
         anchorTag.setAttribute("download", "youtube_subs.opml");
         anchorTag.setAttribute("href", url);
         anchorTag.dataset.downloadurl = `text/plain:youtube_subs.opml:${url}`;
         anchorTag.click();
      }
   } catch (e) {
      console.error(e);
      alert("Something went wrong. Check the console for more info.");
   } finally {
      dialog.close();
      dialog.remove();
   }
})();