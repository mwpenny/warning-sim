/* Background script for sending warning message contents to warning pages */

var tieredStrings = [
	{
		title: "Suspicious page",
		instructions: "This page may be dangerous. Proceed with caution.",
		class: "warning-mild"
	},
	{
		title: "Untrusted page",
		instructions: "It is probably not safe to browse to this page.",
		class: "warning-medium"
	},
	{
		title: "Potential threat detected!",
		instructions: "<b>It is highly reccomended that you do not continue.</b>",
		class: "warning-severe"
	}
];

var warnings = [
	// SSL
	{
		controlTitle: "Your connection is not secure",
		tieredMessages: [
			"The authenticity of <b>$</b>, and thus its security, was unable to be verified.",
			"The identity of <b>$</b> could not be confirmed and therefore its security cannot be guaranteed. Information sent may be visible to others.",
			"A secure connection could not be established to <b>$</b>. While browsing this website, it is possible for an attacker to monitor your activity and steal your personal information (passwords, financial information, conversations, etc.).",
			"The owner of $ has configured their website improperly. To protect your information from being stolen, Firefox has not connected to this website."
		],
		tieredMoreInfo: "Secure websites identify themselves using certificates. When a certificate is unable to be verified, it can mean that security settings have been misconfigured, security of the website has been compromised, or that an attacker is impersonating the website. In any case, any personal information entered into the page is at risk of being seen by others (e.g., passwords and credit card numbers).",
		controlMoreInfo: "$ uses an invalid security certificate.<br/><br/>The certificate is not trusted because the issuer certificate is unknown. The server might not be sending the appropriate intermediate certificates. An additional root certificate may need to be imported.",
		controlLearnLink: "https://support.mozilla.org/kb/what-does-your-connection-is-not-secure-mean",
		controlBackButtonText: "Go Back",
		controlMoreInfoButtonText: "Advanced"
	},
	// Malware
	{
		controlTitle: "Reported Attack Page!",
		tieredMessages: [
			"<b>$</b> may contain software which can harm your computer.",
			"<b>$</b> has been reported by users in the past as being dangerous. It could contain malware.",
			"<b>$</b> has been reported by users and contains software which could infect and harm your computer. It may also monitor keystrokes and steal personal information such as passwords and banking details.",
			"This web page at $ has been reported as an attack page and has been blocked based on your security preferences."
		],
		tieredMoreInfo: "Pages containing harmful software (malware) attempt to infect and take over your web browser and computer by installing malicious applications. Such software can allow attackers to steal personal information, delete files, and infect others.",
		controlMoreInfo: "<p>Attack pages try to install programs that steal private information, use your computer to attack others, or damage your system.</p><p>Some attack pages intentionally distribute harmful software, but many are compromised without the knowledge or permission of their owners.</p>",
		controlLearnLink: "https://support.mozilla.org/t5/Protect-your-privacy/How-does-built-in-Phishing-and-Malware-Protection-work/ta-p/9395",
		controlBackButtonText: "Get me out of here!",
		controlMoreInfoButtonText: "Why was this page blocked?"
	},
	// Phishing
	{
		controlTitle: "Deceptive Site!",
		tieredMessages: [
			"The identity of the page at <b>$</b>, and thus the source of its contents, could not be verified.",
			"Past users have reported that <b>$</b> is fake. It may steal information entered into it.",
			"<b>$</b> has been reported by users and it is likely impersonating another page. Any personal information entered (passwords, financial information, conversations, etc.) could be stolen.",
			"This web page at $ has been reported as a deceptive site and has been blocked based on your security preferences."
		],
		tieredMoreInfo: "Imitation pages impersonate sources you may trust and allow criminals to steal sensitive information such as passwords and credit card numbers. These pages may look and behave as expected, however information entered into them is actually sent to a criminal - not the organization the page claims to represent.",
		controlMoreInfo: "<p>Deceptive sites are designed to trick you into doing something dangerous, like installing software, or revealing your personal information, like passwords, phone numbers or credit cards.</p><p>Entering any information on this web page may result in identity theft or other fraud.</p>",
		controlLearnLink: "https://support.mozilla.org/t5/Protect-your-privacy/How-does-built-in-Phishing-and-Malware-Protection-work/ta-p/9395",
		controlBackButtonText: "Get me out of here!",
		controlMoreInfoButtonText: "Why was this page blocked?"
	},
	// Unwanted software
	{
		controlTitle: "Reported Unwanted Software Page!",
		tieredMessages: [
			"<b>$</b> may contain potentially misleading and deceptive software.",
			"Users have reported that <b>$</b> contains potentially unwanted software which it tries to install.",
			"<b>$</b> contains potentially dangerous and unwanted software which can negatively impact your computer. Users have reported that the page also employs trickery to encourage downloads of this software (e.g., fake download buttons).",
			"This web page at $ has been reported to contain unwanted software and has been blocked based on your security preferences."
		],
		tieredMoreInfo: "Unwanted software is classified as software that may behave in ways that you do not approve of or are not aware of. Examples include adware and spyware. Such software may also attempt to install additional unwanted software without your consent. Pages that distribute unwanted software often encourage downloads through deception (e.g., fake links, fake download buttons, and fake exit buttons).",
		controlMoreInfo: "<p>Unwanted software pages try to install software that can be deceptive and affect your system in unexpected ways.</p>",
		controlLearnLink: "https://support.mozilla.org/t5/Protect-your-privacy/How-does-built-in-Phishing-and-Malware-Protection-work/ta-p/9395",
		controlBackButtonText: "Get me out of here!",
		controlMoreInfoButtonText: "Why was this page blocked?"
	}
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
			var warning = warnings[domainInfo.type];
			var msg = warning.tieredMessages[domainInfo.severity];
			response.message = msg.replace("$", message.domain);

			if (domainInfo.severity == 3) {
				// 3 = control warning message
				response.moreInfo = warning.controlMoreInfo;
				response.title = warning.controlTitle;
				response.learnLink = warning.controlLearnLink;
				response.backButtonText = warning.controlBackButtonText;
				response.moreInfoButtonText = warning.controlMoreInfoButtonText;
			} else {
				var ts = tieredStrings[domainInfo.severity];
				response.moreInfo = warning.tieredMoreInfo;
				response.title = ts.title;
				response.instructions = ts.instructions;
				response.class = ts.class;
				response.backButtonText = "Go Back";
				response.moreInfoButtonText = "More information";
			}
			response.moreInfo = response.moreInfo.replace("$", message.domain);
			response.severity = domainInfo.severity;
			response.type = domainInfo.type;
		}
		sendResponse(response);
	}
});
