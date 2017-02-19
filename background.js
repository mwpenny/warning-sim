/* Background script for sending warning message contents to warning pages */

// TODO: control pages

/* Content for tiered warning messages. 0 = mild, 1 = medium, 2 = severe */
var messages = [
	// SSL
	[
		"The authenticity of $, and thus its security, was unable to be verified.",
		"The identity of $ could not be confirmed and therefore its security cannot be guaranteed. Information sent may be visible to others.",
		"A secure connection could not be established to $. While browsing this website, it is possible for an attacker to monitor your activity and steal your personal information (passwords, financial information, conversations, etc.).",
	],
	// Malware
	[
		"$ may contain software which can harm your computer.",
		"$ has been reported by users in the past as being dangerous. It could contain malware.",
		"$ has been reported by users and contains software which could infect and harm your computer. It may also monitor keystrokes and steal personal information such as passwords and banking details.",
	],
	// Phishing
	[
		"The identity of the page at $, and thus the source of its contents, could not be verified.",
		"Past users have reported that $ is fake. It may steal information entered into it.",
		"$ has been reported by users and it is likely impersonating another page. Any personal information entered (passwords, financial information, conversations, etc.) could be stolen.",
	],
	// Unwanted software
	[
		"$ may contain potentially misleading and deceptive software.",
		"Users have reported that $ contains potentially unwanted software which it tries to install.",
		"$ contains potentially dangerous and unwanted software which can negatively impact your computer. Users have reported that the page also employs trickery to encourage downloads of this software (e.g., fake download buttons).",
	],
];
var titles = [
	"Suspicious page",
	"Untrusted page",
	"Potential threat detected!"
];
var instructions = [
	"This page may be dangerous. Proceed with caution.",
	"It is probably not safe to browse to this page.",
	"<b>It is highly reccomended that you do not continue.</b>"
];
var classes = [
	"warning-mild",
	"warning-medium",
	"warning-severe"
];

/* Text for the "more info" section of the page.
   0 = SSL, 1 = malware, 2 = phishing, 3 = unwanted software */
var moreInfo = [
	"Secure websites identify themselves using certificates. When a certificate is unable to be verified, it can mean that security settings have been misconfigured, security of the website has been compromised, or that an attacker is impersonating the website. In any case, any personal information entered into the page is at risk of being seen by others (e.g., passwords and credit card numbers).",
	"Pages containing harmful software (malware) attempt to infect and take over your web browser and computer by installing malicious applications. Such software can allow attackers to steal personal information, delete files, and infect others.",
	"Imitation pages impersonate sources you may trust and allow criminals to steal sensitive information such as passwords and credit card numbers. These pages may look and behave as expected, however information entered into them is actually sent to a criminal - not the organization the page claims to represent.",
	"Unwanted software is classified as software that may behave in ways that you do not approve of or are not aware of. Examples include adware and spyware. Such software may also attempt to install additional unwanted software without your consent. Pages that distribute unwanted software often encourage downloads through deception (e.g., fake links, fake download buttons, and fake exit buttons)."
];

var domains = {};
chrome.storage.local.get("domains", function(data) {
	domains = data.domains;
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	// Update cached trigger domain list
	if (message.hasOwnProperty("domains"))
		domains = message.domains;

	// Check if domain triggers a warning and return its contents (if any)
	if (message.hasOwnProperty("domain")) {
		var response = {triggered: domains.hasOwnProperty(message.domain)};
		if (response.triggered) {
			var domainInfo = domains[message.domain];
			var msg = messages[domainInfo.type][domainInfo.severity];
			response.message = msg.replace("$", "<b>" + message.domain + "</b>");
			response.moreInfo = moreInfo[domainInfo.type];
			response.title = titles[domainInfo.severity];
			response.instructions = instructions[domainInfo.severity];
			response.class = classes[domainInfo.severity];
			response.severity = domainInfo.severity;
		}
		sendResponse(response);
	}
});
