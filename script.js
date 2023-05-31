(async () => {
	const dialog = document.createElement("dialog");
	const label = document.createElement("label");
	const progress = document.createElement("progress");
	dialog.style.cssText = "display: flex; flex-direction: column; gap: 15px; padding: 20px; [open] {background: pink;}";
	dialog.appendChild(label);
	dialog.appendChild(progress);
	document.querySelector("ytd-app").appendChild(dialog);
	dialog.showModal();
	try {
		const channelElements = [...document.querySelectorAll("#main-link.channel-link")];
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