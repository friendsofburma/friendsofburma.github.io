/* global jQuery */
(function ($) {
	"use strict";

	function getAlternateLink(entry) {
		var i;
		if (!entry || !entry.link) {
			return "#";
		}
		for (i = 0; i < entry.link.length; i += 1) {
			if (entry.link[i].rel === "alternate") {
				return entry.link[i].href;
			}
		}
		return "#";
	}

	function getSummary(entry) {
		var raw = "";
		var text;
		if (entry && entry.summary && entry.summary.$t) {
			raw = entry.summary.$t;
		} else if (entry && entry.content && entry.content.$t) {
			raw = entry.content.$t;
		}
		text = $("<div>").html(raw).text().replace(/\s+/g, " ").trim();
		if (text.length > 220) {
			return text.substring(0, 217) + "...";
		}
		return text;
	}

	function escapeHtml(value) {
		return $("<div>").text(value || "").html();
	}

	function upgradeBloggerImageUrl(url) {
		var upgradedUrl = url || "";

		if (!upgradedUrl) {
			return "";
		}

		// Handle Blogger query-style image sizes like ...=s72-c
		upgradedUrl = upgradedUrl.replace(/=s\d+(-c)?$/, "=s1200");
		// Handle Blogger path-style image sizes like .../s72-c/...
		upgradedUrl = upgradedUrl.replace(/\/s\d+(-c)?\//, "/s1200/");

		return upgradedUrl;
	}

	function getImageUrl(entry) {
		var content;
		var imgMatch;
		if (entry && entry.media$thumbnail && entry.media$thumbnail.url) {
			return upgradeBloggerImageUrl(entry.media$thumbnail.url);
		}
		if (!entry || !entry.content || !entry.content.$t) {
			return "";
		}
		content = entry.content.$t;
		imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
		return imgMatch && imgMatch[1] ? upgradeBloggerImageUrl(imgMatch[1]) : "";
	}

	function getPublishedDate(entry) {
		var raw = entry && entry.published && entry.published.$t ? entry.published.$t : "";
		var date;
		if (!raw) {
			return "";
		}
		date = new Date(raw);
		if (isNaN(date.getTime())) {
			return "";
		}
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric"
		});
	}

	function buildPostCard(entry) {
		var title = entry && entry.title && entry.title.$t ? entry.title.$t : "Untitled post";
		var safeTitle = escapeHtml(title);
		var link = getAlternateLink(entry);
		var safeLink = escapeHtml(link);
		var publishedDate = getPublishedDate(entry);
		var safePublishedDate = escapeHtml(publishedDate);
		var summary = getSummary(entry);
		var safeSummary = escapeHtml(summary);
		var imageUrl = getImageUrl(entry);
		var safeImageUrl = escapeHtml(imageUrl);
		var html = "";

		html += '<div class="col-md-6 latest-post-col">';
		html += '<article class="latest-post-card">';
		if (imageUrl) {
			html += '<img class="latest-post-thumb" src="' + safeImageUrl + '" alt="' + safeTitle + '" loading="lazy">';
		}
		html += '<h3 class="latest-post-title"><a href="' + safeLink + '" rel="noopener noreferrer">' + safeTitle + "</a></h3>";
		if (publishedDate) {
			html += '<p class="latest-post-date">' + safePublishedDate + "</p>";
		}
		if (summary) {
			html += '<p class="latest-post-summary">' + safeSummary + "</p>";
		}
		html += '<p><a class="latest-post-read-more" href="' + safeLink + '" rel="noopener noreferrer">Read more &raquo;</a></p>';
		html += "</article>";
		html += "</div>";
		return html;
	}

	function renderPosts(entries) {
		var $container = $("#latest-posts-container");
		var html = "";
		var i;

		if (!$container.length) {
			return;
		}

		if (!entries || !entries.length) {
			$container.html('<div class="col-md-12"><p class="latest-post-status">No recent blog posts were found.</p></div>');
			return;
		}

		for (i = 0; i < entries.length; i += 1) {
			html += buildPostCard(entries[i]);
		}

		$container.html(html);
	}

	function loadLatestPosts() {
		var $container = $("#latest-posts-container");
		var feedUrl = "https://blog.friendsofburma.org/feeds/posts/default?alt=json-in-script&max-results=2&orderby=published&callback=?";

		if (!$container.length) {
			return;
		}

		$.getJSON(feedUrl)
			.done(function (data) {
				var entries = data && data.feed && data.feed.entry ? data.feed.entry : [];
				renderPosts(entries.slice(0, 2));
			})
			.fail(function () {
				$container.html('<div class="col-md-12"><p class="latest-post-status">Unable to load latest posts right now. <a href="https://blog.friendsofburma.org/">Visit the blog</a>.</p></div>');
			});
	}

	$(function () {
		loadLatestPosts();
	});
}(jQuery));
