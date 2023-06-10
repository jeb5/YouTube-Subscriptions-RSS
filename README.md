# YouTube Subscriptions to RSS

**Use this script to generate an OPML file containing RSS feeds of your YouTube subscriptions, which can be imported into your favorite RSS reader.**

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
		const channelElements = [...document.querySelectorAll("ytd-browse #main-link.channel-link")];
		progress.max = channelElements.length;
		progress.value = 0;
		const channels = [];
		for (e of channelElements) {
			label.innerText = `Fetching URLS... (${progress.value}/${progress.max})`;
			const channelName = e.querySelector("yt-formatted-string.ytd-channel-name").innerText;
			const username = e.href.match("/@(.*)$")[1];
			const channelReq = await fetch(`https://www.youtube.com/@${username}`);
			const channelPageDoc = new DOMParser().parseFromString(await channelReq.text(), "text/html");
			const links = channelPageDoc.querySelectorAll("body > link[rel=alternate], body > link[rel=canonical]");
			const channelId = [...links].map(e => e.href.match("/channel/([a-zA-Z0-9_\-]+?)$")).find(e => e != null)[1];
			if (channelId == null) throw new Error(`Couldn't find channel id for @${username}`);
			channels.push([`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, channelName]);
			progress.value++;
			progress.replaceWith(progress);
		};
		if (channels.length == 0) {
			alert("Couldn't find any subscriptions");
		} else {
			console.log(channels.map(([feed, _]) => feed).join("\n"));
			let opmlText = `<opml version="1.0"><head><title>YouTube Subscriptions as RSS</title></head><body><outline text="YouTube Subscriptions" title="YouTube Subscriptions">${channels
				.map(([feed, channelName]) => `<outline type="rss" text="${channelName}" title="${channelName}" xmlUrl="${feed}"/>`)
				.join("")}</outline></body></opml>`;
			const url = window.URL.createObjectURL(new Blob([opmlText], { type: "text/plain" }));
			const anchorTag = document.createElement("a");
			anchorTag.setAttribute("download", "youtube_subs.opml");
			anchorTag.setAttribute("href", url);
			anchorTag.dataset.downloadurl = `text/plain:youtube_subs.opml:${url}`;
			anchorTag.click();
		}
	} catch (e) {
		console.log(e);
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
javascript:(function()%7B(async()%3D%3E%7Bconst%20a%3Ddocument.createElement(%22dialog%22)%2Cb%3Ddocument.createElement(%22label%22)%2Cc%3Ddocument.createElement(%22progress%22)%3Ba.style.cssText%3D%22display%3A%20flex%3B%20flex-direction%3A%20column%3B%20gap%3A%2015px%3B%20padding%3A%2020px%3B%22%2Ca.appendChild(b)%2Ca.appendChild(c)%2Cdocument.querySelector(%22ytd-app%22).appendChild(a)%2Ca.showModal()%3Btry%7Bconst%20a%3D%5B...document.querySelectorAll(%22ytd-browse%20%23main-link.channel-link%22)%5D%3Bc.max%3Da.length%2Cc.value%3D0%3Bconst%20d%3D%5B%5D%3Bfor(e%20of%20a)%7Bb.innerText%3D%60Fetching%20URLS...%20(%24%7Bc.value%7D%2F%24%7Bc.max%7D)%60%3Bconst%20a%3De.querySelector(%22yt-formatted-string.ytd-channel-name%22).innerText%2Cf%3De.href.match(%22%2F%40(.*)%24%22)%5B1%5D%2Cg%3Dawait%20fetch(%60https%3A%2F%2Fwww.youtube.com%2F%40%24%7Bf%7D%60)%2Ch%3Dnew%20DOMParser().parseFromString(await%20g.text()%2C%22text%2Fhtml%22)%2Ci%3Dh.querySelectorAll(%22body%20%3E%20link%5Brel%3Dalternate%5D%2C%20body%20%3E%20link%5Brel%3Dcanonical%5D%22)%2Cj%3D%5B...i%5D.map(a%3D%3Ea.href.match(%22%2Fchannel%2F(%5Ba-zA-Z0-9_-%5D%2B%3F)%24%22)).find(a%3D%3Enull!%3Da)%5B1%5D%3Bif(null%3D%3Dj)throw%20new%20Error(%60Couldn't%20find%20channel%20id%20for%20%40%24%7Bf%7D%60)%3Bd.push(%5B%60https%3A%2F%2Fwww.youtube.com%2Ffeeds%2Fvideos.xml%3Fchannel_id%3D%24%7Bj%7D%60%2Ca%5D)%2Cc.value%2B%2B%2Cc.replaceWith(c)%7Dif(0%3D%3Dd.length)alert(%22Couldn't%20find%20any%20subscriptions%22)%3Belse%7Bconsole.log(d.map((%5Ba%2Cb%5D)%3D%3Ea).join(%22%5Cn%22))%3Blet%20a%3D%60%3Copml%20version%3D%221.0%22%3E%3Chead%3E%3Ctitle%3EYouTube%20Subscriptions%20as%20RSS%3C%2Ftitle%3E%3C%2Fhead%3E%3Cbody%3E%3Coutline%20text%3D%22YouTube%20Subscriptions%22%20title%3D%22YouTube%20Subscriptions%22%3E%24%7Bd.map((%5Ba%2Cb%5D)%3D%3E%60%3Coutline%20type%3D%22rss%22%20text%3D%22%24%7Bb%7D%22%20title%3D%22%24%7Bb%7D%22%20xmlUrl%3D%22%24%7Ba%7D%22%2F%3E%60).join(%22%22)%7D%3C%2Foutline%3E%3C%2Fbody%3E%3C%2Fopml%3E%60%3Bconst%20b%3Dwindow.URL.createObjectURL(new%20Blob(%5Ba%5D%2C%7Btype%3A%22text%2Fplain%22%7D))%2Cc%3Ddocument.createElement(%22a%22)%3Bc.setAttribute(%22download%22%2C%22youtube_subs.opml%22)%2Cc.setAttribute(%22href%22%2Cb)%2Cc.dataset.downloadurl%3D%60text%2Fplain%3Ayoutube_subs.opml%3A%24%7Bb%7D%60%2Cc.click()%7D%7Dcatch(a)%7Bconsole.log(a)%2Calert(%22Something%20went%20wrong.%20Check%20the%20console%20for%20more%20info.%22)%7Dfinally%7Ba.close()%2Ca.remove()%7D%7D)()%3B%7D)()%3B
```

---
<br>

![](https://img.shields.io/badge/Safari-FF1B2D?style=for-the-badge&logo=Safari&logoColor=white)
![](https://img.shields.io/badge/Google_chrome-4285F4?style=for-the-badge&logo=Google-chrome&logoColor=white)
![](https://img.shields.io/badge/Firefox_Browser-FF7139?style=for-the-badge&logo=Firefox-Browser&logoColor=white)

*Working in Chrome, Firefox and Safari as of June 2023*

*This script relies on YouTube maintaining RSS feeds for each channel, information from `<link>` tags on each channel page and class names on YouTube, so it may well break in the future.*