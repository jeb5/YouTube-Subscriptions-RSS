# YouTube Subscriptions to RSS

**Use this script to get the RSS feeds of all your YouTube subscriptions. Downloads as an OPML file, which can be imported into your favorite RSS reader.**

## Usage:

1. Navigate to https://www.youtube.com/feed/channels
2. Run the script or activate the bookmarklet. An OPML file will download, and a list of RSS feeds will be logged to the console if you need it.

---

## Script:

Paste this into the console at [https://www.youtube.com/feed/channels](https://www.youtube.com/feed/channels) to download the OPML file:

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
	try {
		const channelElements = [...document.querySelectorAll("ytd-browse:not([hidden]) #main-link.channel-link")];
		progress.max = channelElements.length;
		progress.value = 0;
		const channels = [];
		for (e of channelElements) {
			label.innerText = `Fetching URLS... (${progress.value}/${progress.max})`;
			try {
				const channelName = e.querySelector("yt-formatted-string.ytd-channel-name").innerText;
				const channelReq = await fetch(e.href);
				if (!channelReq.ok) { console.error(`Couldn't fetch channel page for ${channelName}`); continue; }
				const channelPageDoc = new DOMParser().parseFromString(await channelReq.text(), "text/html");
				const links = channelPageDoc.querySelectorAll("body > link[rel=alternate], body > link[rel=canonical]");
				const channelIdMatch = [...links].map(e => e.href.match("/channel/([a-zA-Z0-9_\-]+?)$")).find(e => e != null);
				if (channelIdMatch == null) { console.error(`Couldn't find channel id for ${channelName}`); continue; }
				channels.push([`https://www.youtube.com/feeds/videos.xml?channel_id=${channelIdMatch[1]}`, channelName]);
			} finally {
				progress.value++;
				progress.replaceWith(progress);
			}
		};
		if (channelElements.length == 0) alert("Couldn't find any subscriptions");
		const missedChannels = channelElements.length - channels.length;
		if (missedChannels > 0) alert(`${missedChannels} channel${missedChannels > 1 ? "s" : ""} couldn't be fetched. Check the console for more info.`);
		if (channels.length > 0) {
			console.log(channels.map(([feed, _]) => feed).join("\n"));
			let opmlText = `<opml version="1.0">\n\t<head>\n\t\t<title>YouTube Subscriptions as RSS</title>\n\t</head>\n\t<body>\n\t\t<outline text="YouTube Subscriptions">${channels
        .map(
          ([feed, channelName]) =>
            `\n\t\t\t<outline type="rss" text="${channelName}" xmlUrl="${feed}"/>`
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

## Bookmarklet:

You can save this as a bookmarklet to run it in one click. Just create a new bookmark and paste the following into the URL field:

```
javascript:(function()%7B(async()%3D%3E%7Bconst%20t%3Ddocument.createElement(%22dialog%22)%2Cn%3Ddocument.createElement(%22label%22)%2Co%3Ddocument.createElement(%22progress%22)%3Bt.style.cssText%3D%22display%3A%20flex%3B%20flex-direction%3A%20column%3B%20gap%3A%2015px%3B%20padding%3A%2020px%3B%22%2Ct.appendChild(n)%2Ct.appendChild(o)%2Cdocument.querySelector(%22ytd-app%22).appendChild(t)%2Ct.showModal()%3Btry%7Bconst%20t%3D%5B...document.querySelectorAll(%22ytd-browse%3Anot(%5Bhidden%5D)%20%23main-link.channel-link%22)%5D%3Bo.max%3Dt.length%2Co.value%3D0%3Bconst%20l%3D%5B%5D%3Bfor(e%20of%20t)%7Bn.innerText%3D%60Fetching%20URLS...%20(%24%7Bo.value%7D%2F%24%7Bo.max%7D)%60%3Btry%7Bconst%20t%3De.querySelector(%22yt-formatted-string.ytd-channel-name%22).innerText%2Cn%3Dawait%20fetch(e.href)%3Bif(!n.ok)%7Bconsole.error(%60Couldn't%20fetch%20channel%20page%20for%20%24%7Bt%7D%60)%3Bcontinue%7Dconst%20o%3D(new%20DOMParser).parseFromString(await%20n.text()%2C%22text%2Fhtml%22)%2Ca%3D%5B...o.querySelectorAll(%22body%20%3E%20link%5Brel%3Dalternate%5D%2C%20body%20%3E%20link%5Brel%3Dcanonical%5D%22)%5D.map((e%3D%3Ee.href.match(%22%2Fchannel%2F(%5Ba-zA-Z0-9_-%5D%2B%3F)%24%22))).find((e%3D%3Enull!%3De))%3Bif(null%3D%3Da)%7Bconsole.error(%60Couldn't%20find%20channel%20id%20for%20%24%7Bt%7D%60)%3Bcontinue%7Dl.push(%5B%60https%3A%2F%2Fwww.youtube.com%2Ffeeds%2Fvideos.xml%3Fchannel_id%3D%24%7Ba%5B1%5D%7D%60%2Ct%5D)%7Dfinally%7Bo.value%2B%2B%2Co.replaceWith(o)%7D%7D0%3D%3Dt.length%26%26alert(%22Couldn't%20find%20any%20subscriptions%22)%3Bconst%20a%3Dt.length-l.length%3Bif(a%3E0%26%26alert(%60%24%7Ba%7D%20channel%24%7Ba%3E1%3F%22s%22%3A%22%22%7D%20couldn't%20be%20fetched.%20Check%20the%20console%20for%20more%20info.%60)%2Cl.length%3E0)%7Bconsole.log(l.map(((%5Be%2Ct%5D)%3D%3Ee)).join(%22%5Cn%22))%3Blet%20e%3D%60%3Copml%20version%3D%221.0%22%3E%5Cn%5Ct%3Chead%3E%5Cn%5Ct%5Ct%3Ctitle%3EYouTube%20Subscriptions%20as%20RSS%3C%2Ftitle%3E%5Cn%5Ct%3C%2Fhead%3E%5Cn%5Ct%3Cbody%3E%5Cn%5Ct%5Ct%3Coutline%20text%3D%22YouTube%20Subscriptions%22%3E%24%7Bl.map(((%5Be%2Ct%5D)%3D%3E%60%5Cn%5Ct%5Ct%5Ct%3Coutline%20type%3D%22rss%22%20text%3D%22%24%7Bt%7D%22%20xmlUrl%3D%22%24%7Be%7D%22%2F%3E%60)).join(%22%22)%7D%5Cn%5Ct%5Ct%3C%2Foutline%3E%5Cn%5Ct%3C%2Fbody%3E%5Cn%3C%2Fopml%3E%60%3Bconst%20t%3Dwindow.URL.createObjectURL(new%20Blob(%5Be%5D%2C%7Btype%3A%22text%2Fplain%22%7D))%2Cn%3Ddocument.createElement(%22a%22)%3Bn.setAttribute(%22download%22%2C%22youtube_subs.opml%22)%2Cn.setAttribute(%22href%22%2Ct)%2Cn.dataset.downloadurl%3D%60text%2Fplain%3Ayoutube_subs.opml%3A%24%7Bt%7D%60%2Cn.click()%7D%7Dcatch(e)%7Bconsole.error(e)%2Calert(%22Something%20went%20wrong.%20Check%20the%20console%20for%20more%20info.%22)%7Dfinally%7Bt.close()%2Ct.remove()%7D%7D)()%3B%7D)()%3B
```

---

<br>

![](https://img.shields.io/badge/Safari-FF1B2D?style=for-the-badge&logo=Safari&logoColor=white)
![](https://img.shields.io/badge/Google_chrome-4285F4?style=for-the-badge&logo=Google-chrome&logoColor=white)
![](https://img.shields.io/badge/Firefox_Browser-FF7139?style=for-the-badge&logo=Firefox-Browser&logoColor=white)

_Working in Chrome, Firefox and Safari as of August 2023_

_This script relies on YouTube maintaining RSS feeds for each channel, information from `<link>` tags on each channel page and class names on YouTube, so it may well break in the future._
