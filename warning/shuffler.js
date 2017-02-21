/* Content script for setting up shuffle mode and triggering
   warning messages in order. State for message order is managed here. */

var numWarningSeverities = 4;
var numWarningTypes = 4;
var warnings = [];
var domain = "example.com";

function shuffle(a) {
	// Fisher-Yates shuffle
    for (var i = a.length; i > 0; --i) {
        var j = Math.floor(Math.random() * i);
        var x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

function triggerNext() {
	if (warnings.length > 0) {
		/* Will result in the background script sending this tab a message,
		   which will be received by the loader script's onMessage handler -
		   triggering the warning */
		chrome.runtime.sendMessage({
			domain: domain,
			triggered: true, 
			domainInfo: warnings.pop()
		});
	} else {
		window.close();
	}
};

document.addEventListener("DOMContentLoaded", function() {
	// Generate list of warnings
	for (var i = 0; i < numWarningTypes; ++i) {
		for (var j = 0; j < numWarningSeverities; ++j) {
			warnings.push({
				type: i,
				severity: j
			});
		}
	}
	shuffle(warnings);
	document.getElementById("container").addEventListener("load", triggerNext);
});
