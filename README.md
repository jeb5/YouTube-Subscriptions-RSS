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
            const rssUrlMatch = channelHTML.match(/<link\srel="alternate"\stype="application\/rss\+xml"\stitle="RSS"\shref="(.+?)"/);
            if (rssUrlMatch == null) {
               console.error(`Couldn't find RSS feed for ${channelName}`);
               continue;
            }
            channels.push([rssUrlMatch[1], channelName, e.href]);
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
javascript:(function()%7B(async()%3D%3E%7Bconst%20t%3Ddocument.createElement(%22dialog%22)%2Cn%3Ddocument.createElement(%22label%22)%2Co%3Ddocument.createElement(%22progress%22)%3Bt.style.cssText%3D%22display%3A%20flex%3B%20flex-direction%3A%20column%3B%20gap%3A%2015px%3B%20padding%3A%2020px%3B%22%2Ct.appendChild(n)%2Ct.appendChild(o)%2Cdocument.querySelector(%22ytd-app%22).appendChild(t)%2Ct.showModal()%2Cn.innerText%3D%22Loading%20subscriptions...%22%3Bconst%20l%3Ddocument.getElementById(%22content%22)%3Blet%20i%3Bdo%7Bi%3Dl.offsetHeight%2Cwindow.scrollBy(0%2C1e5)%2Cawait%20new%20Promise((e%3D%3EsetTimeout(e%2C500)))%7Dwhile(null!%3Dl.querySelector(%22%23spinnerContainer.active%22)%7C%7Cl.offsetHeight%3Ei)%3Btry%7Bconst%20t%3D%5B...l.querySelectorAll(%22ytd-browse%3Anot(%5Bhidden%5D)%20%23main-link.channel-link%22)%5D%3Bo.max%3Dt.length%2Co.value%3D0%3Bconst%20i%3D%5B%5D%3Bfor(e%20of%20t)%7Bn.innerText%3D%60Fetching%20URLS...%20(%24%7Bo.value%7D%2F%24%7Bo.max%7D)%60%3Btry%7Bconst%20t%3De.querySelector(%22yt-formatted-string.ytd-channel-name%22).innerText%2Cn%3Dawait%20fetch(e.href)%3Bif(!n.ok)%7Bconsole.error(%60Couldn't%20fetch%20channel%20page%20for%20%24%7Bt%7D%60)%3Bcontinue%7Dconst%20o%3D(await%20n.text()).match(%2F%3Clink%5Csrel%3D%22alternate%22%5Cstype%3D%22application%5C%2Frss%5C%2Bxml%22%5Cstitle%3D%22RSS%22%5Cshref%3D%22(.%2B%3F)%22%2F)%3Bif(null%3D%3Do)%7Bconsole.error(%60Couldn't%20find%20RSS%20feed%20for%20%24%7Bt%7D%60)%3Bcontinue%7Di.push(%5Bo%5B1%5D%2Ct%2Ce.href%5D)%7Dfinally%7Bo.value%2B%2B%2Co.replaceWith(o)%7D%7D0%3D%3Dt.length%26%26alert(%22Couldn't%20find%20any%20subscriptions%22)%3Bconst%20r%3Dt.length-i.length%3Br%3E0%26%26alert(%60%24%7Br%7D%20channel%24%7Br%3E1%3F%22s%22%3A%22%22%7D%20couldn't%20be%20fetched.%20Check%20the%20console%20for%20more%20info.%60)%3Bconst%20a%3De%3D%3Ee.replace(%2F%5B%3C%3E%26'%22%5D%2Fg%2C(e%3D%3E(%7B%22%3C%22%3A%22%26lt%3B%22%2C%22%3E%22%3A%22%26gt%3B%22%2C%22%26%22%3A%22%26amp%3B%22%2C%22'%22%3A%22%26apos%3B%22%2C'%22'%3A%22%26quot%3B%22%7D%5Be%5D)))%3Bif(i.length%3E0)%7Bconsole.log(i.map(((%5Be%5D)%3D%3Ee)).join(%22%5Cn%22))%3Blet%20e%3D%60%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%5Cn%3Copml%20version%3D%221.0%22%3E%5Cn%5Ct%3Chead%3E%5Cn%5Ct%5Ct%3Ctitle%3EYouTube%20Subscriptions%20as%20RSS%3C%2Ftitle%3E%5Cn%5Ct%3C%2Fhead%3E%5Cn%5Ct%3Cbody%3E%5Cn%5Ct%5Ct%3Coutline%20text%3D%22YouTube%20Subscriptions%22%3E%24%7Bi.map(((%5Be%2Ct%2Cn%5D)%3D%3E%60%5Cn%5Ct%5Ct%5Ct%3Coutline%20type%3D%22rss%22%20text%3D%22%24%7Ba(t)%7D%22%20title%3D%22%24%7Ba(t)%7D%22%20xmlUrl%3D%22%24%7Be%7D%22%20htmlUrl%3D%22%24%7Bn%7D%22%2F%3E%60)).join(%22%22)%7D%5Cn%5Ct%5Ct%3C%2Foutline%3E%5Cn%5Ct%3C%2Fbody%3E%5Cn%3C%2Fopml%3E%60%3Bconst%20t%3Dwindow.URL.createObjectURL(new%20Blob(%5Be%5D%2C%7Btype%3A%22text%2Fplain%22%7D))%2Cn%3Ddocument.createElement(%22a%22)%3Bn.setAttribute(%22download%22%2C%22youtube_subs.opml%22)%2Cn.setAttribute(%22href%22%2Ct)%2Cn.dataset.downloadurl%3D%60text%2Fplain%3Ayoutube_subs.opml%3A%24%7Bt%7D%60%2Cn.click()%7D%7Dcatch(e)%7Bconsole.error(e)%2Calert(%22Something%20went%20wrong.%20Check%20the%20console%20for%20more%20info.%22)%7Dfinally%7Bt.close()%2Ct.remove()%7D%7D)()%3B%7D)()%3B
```

---

<br>

![](https://img.shields.io/badge/Safari-FF1B2D?style=for-the-badge&logo=Safari&logoColor=white)
![](https://img.shields.io/badge/Google_chrome-4285F4?style=for-the-badge&logo=Google-chrome&logoColor=white)
![](https://img.shields.io/badge/Firefox_Browser-FF7139?style=for-the-badge&logo=Firefox-Browser&logoColor=white)

_Working in Chrome, Firefox and Safari at last commit date_

_This script relies on YouTube maintaining RSS feeds for each channel, information from `<link>` tags on each channel page and class names on YouTube, so it may well break in the future._
