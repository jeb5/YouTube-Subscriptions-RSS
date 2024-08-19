# YouTube Subscriptions to RSS

**Use this script to get the RSS feeds of all your YouTube subscriptions. It downloads as an OPML file, which can be imported into your favorite RSS reader.**

## Usage

1. Navigate to [youtube.com/feed/channels](https://www.youtube.com/feed/channels).
2. Run the script or activate the bookmarklet. An OPML file will download, and a list of RSS feeds will be logged to the console if you need it.
3. Import into your favorite RSS reader, and let me know if you run into any issues.

---

## Script

Paste this into the console at [youtube.com/feed/channels](https://www.youtube.com/feed/channels) to download the OPML file:

```javascript
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
      const escapeHTMLPolicy = window.chrome ? trustedTypes.createPolicy("m", { createHTML: (string) => string, }) : null;
      for (e of channelElements) {
         label.innerText = `Fetching URLS... (${progress.value}/${progress.max})`;
         try {
            const channelName = e.querySelector("yt-formatted-string.ytd-channel-name").innerText;
            const channelReq = await fetch(e.href);
            if (!channelReq.ok) {
               console.error(`Couldn't fetch channel page for ${channelName}`);
               continue;
            }
            let channelHTML = await channelReq.text();
            if (window.chrome) channelHTML = escapeHTMLPolicy.createHTML(channelHTML);
            const channelPageDoc = Document.parseHTMLUnsafe(channelHTML);
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
```

## Bookmarklet

You can also save this as a bookmarklet to run it in one click. Just create a new bookmark and paste the following into the URL field:

```
javascript:(function()%7B(async()%3D%3E%7Blet%20t%3Ddocument.createElement(%22dialog%22)%2Cn%3Ddocument.createElement(%22label%22)%2Cl%3Ddocument.createElement(%22progress%22)%3Bt.style.cssText%3D%22display%3A%20flex%3B%20flex-direction%3A%20column%3B%20gap%3A%2015px%3B%20padding%3A%2020px%3B%22%2Ct.appendChild(n)%2Ct.appendChild(l)%2Cdocument.querySelector(%22ytd-app%22).appendChild(t)%2Ct.showModal()%2Cn.innerText%3D%22Loading%20subscriptions...%22%3Blet%20o%3Ddocument.getElementById(%22content%22)%2Cr%3Bdo%20r%3Do.offsetHeight%2Cwindow.scrollBy(0%2C1e5)%2Cawait%20new%20Promise(t%3D%3EsetTimeout(t%2C500))%3Bwhile(null!%3Do.querySelector(%22%23spinnerContainer.active%22)%7C%7Co.offsetHeight%3Er)%3Btry%7Blet%20a%3D%5B...o.querySelectorAll(%22ytd-browse%3Anot(%5Bhidden%5D)%20%23main-link.channel-link%22)%5D%3Bl.max%3Da.length%2Cl.value%3D0%3Blet%20i%3D%5B%5D%2Cc%3Dwindow.chrome%3FtrustedTypes.createPolicy(%22m%22%2C%7BcreateHTML%3At%3D%3Et%7D)%3Anull%3Bfor(e%20of%20a)%7Bn.innerText%3D%60Fetching%20URLS...%20(%24%7Bl.value%7D%2F%24%7Bl.max%7D)%60%3Btry%7Blet%20s%3De.querySelector(%22yt-formatted-string.ytd-channel-name%22).innerText%2Cd%3Dawait%20fetch(e.href)%3Bif(!d.ok)%7Bconsole.error(%60Couldn't%20fetch%20channel%20page%20for%20%24%7Bs%7D%60)%3Bcontinue%7Dlet%20u%3Dawait%20d.text()%3Bwindow.chrome%26%26(u%3Dc.createHTML(u))%3Blet%20h%3DDocument.parseHTMLUnsafe(u)%2Cp%3Dh.querySelectorAll(%22body%20%3E%20link%5Brel%3Dalternate%5D%2C%20body%20%3E%20link%5Brel%3Dcanonical%5D%22)%2Cm%3D%5B...p%5D.map(t%3D%3Et.href.match(%22%2Fchannel%2F(%5Ba-zA-Z0-9_-%5D%2B%3F)%24%22)).find(t%3D%3Enull!%3Dt)%3Bif(null%3D%3Dm)%7Bconsole.error(%60Couldn't%20find%20channel%20id%20for%20%24%7Bs%7D%60)%3Bcontinue%7Di.push(%5B%60https%3A%2F%2Fwww.youtube.com%2Ffeeds%2Fvideos.xml%3Fchannel_id%3D%24%7Bm%5B1%5D%7D%60%2Cs%2Ce.href%5D)%7Dfinally%7Bl.value%2B%2B%2Cl.replaceWith(l)%7D%7D0%3D%3Da.length%26%26alert(%22Couldn't%20find%20any%20subscriptions%22)%3Blet%20f%3Da.length-i.length%3Bf%3E0%26%26alert(%60%24%7Bf%7D%20channel%24%7Bf%3E1%3F%22s%22%3A%22%22%7D%20couldn't%20be%20fetched.%20Check%20the%20console%20for%20more%20info.%60)%3Blet%20y%3Dt%3D%3Et.replace(%2F%5B%3C%3E%26'%22%5D%2Fg%2Ct%3D%3E(%7B%22%3C%22%3A%22%26lt%3B%22%2C%22%3E%22%3A%22%26gt%3B%22%2C%22%26%22%3A%22%26amp%3B%22%2C%22'%22%3A%22%26apos%3B%22%2C'%22'%3A%22%26quot%3B%22%7D)%5Bt%5D)%3Bif(i.length%3E0)%7Bconsole.log(i.map((%5Bt%5D)%3D%3Et).join(%22%5Cn%22))%3Blet%20g%3D%60%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%0A%3Copml%20version%3D%221.0%22%3E%0A%09%3Chead%3E%0A%09%09%3Ctitle%3EYouTube%20Subscriptions%20as%20RSS%3C%2Ftitle%3E%0A%09%3C%2Fhead%3E%0A%09%3Cbody%3E%0A%09%09%3Coutline%20text%3D%22YouTube%20Subscriptions%22%3E%24%7Bi.map((%5Bt%2Cn%2Cl%5D)%3D%3E%60%0A%09%09%09%3Coutline%20type%3D%22rss%22%20text%3D%22%24%7By(n)%7D%22%20title%3D%22%24%7By(n)%7D%22%20xmlUrl%3D%22%24%7Bt%7D%22%20htmlUrl%3D%22%24%7Bl%7D%22%2F%3E%60).join(%22%22)%7D%0A%09%09%3C%2Foutline%3E%0A%09%3C%2Fbody%3E%0A%3C%2Fopml%3E%60%2Cb%3Dwindow.URL.createObjectURL(new%20Blob(%5Bg%5D%2C%7Btype%3A%22text%2Fplain%22%7D))%2Cx%3Ddocument.createElement(%22a%22)%3Bx.setAttribute(%22download%22%2C%22youtube_subs.opml%22)%2Cx.setAttribute(%22href%22%2Cb)%2Cx.dataset.downloadurl%3D%60text%2Fplain%3Ayoutube_subs.opml%3A%24%7Bb%7D%60%2Cx.click()%7D%7Dcatch(%24)%7Bconsole.error(%24)%2Calert(%22Something%20went%20wrong.%20Check%20the%20console%20for%20more%20info.%22)%7Dfinally%7Bt.close()%2Ct.remove()%7D%7D)()%3B%7D)()%3B
```

---

<br>

![](https://img.shields.io/badge/Safari-FF1B2D?style=for-the-badge&logo=Safari&logoColor=white)
![](https://img.shields.io/badge/Google_chrome-4285F4?style=for-the-badge&logo=Google-chrome&logoColor=white)
![](https://img.shields.io/badge/Firefox_Browser-FF7139?style=for-the-badge&logo=Firefox-Browser&logoColor=white)

_Working in Chrome, Firefox and Safari at last commit date_

_This script relies on YouTube maintaining RSS feeds for each channel, information from `<link>` tags on each channel page and class names on YouTube, so it may well break in the future._
