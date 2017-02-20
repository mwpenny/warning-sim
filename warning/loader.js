/* Loader for injecting warning messages into pages */

var resBase = chrome.runtime.getURL("warning/");

function initWarning(warning) {
	// Places warning-specific text into the page
	var back = document.querySelector(".warning-back-button");
	var more = document.querySelector(".warning-more-button");
	var wTitle = document.querySelector(".title-text");

	back.innerHTML = warning.backButtonText;
	more.innerHTML = warning.moreInfoButtonText;
	wTitle.insertBefore(document.createTextNode(warning.title), wTitle.firstChild);
	document.querySelector(".warning-body").innerHTML = warning.message;
	document.querySelector(".warning-more-info").innerHTML += warning.moreInfo;
	document.title = warning.title;

	// "More information" button
	more.onclick = function() {
		var infoBox = document.querySelector(".warning-more-info");
		if (infoBox.style.display != "block")
			infoBox.style.display = "block";
		else
			infoBox.style.display = "none";
	};

	back.onclick = function() {
		window.history.back();
	};

	// TODO: "ignore this warning" listener
};

function styleTieredWarning(warning) {
	document.head.innerHTML += "<link rel='stylesheet' type='text/css' href='" + resBase + "tiered.css'>";
	document.querySelector(".warning-body").innerHTML += "<br/><br/>" + warning.instructions;
	document.body.className = warning.class;

	// Higher threat level -> more warning icons
	var wIcons = document.getElementsByClassName("warning-icons")[0].getElementsByTagName("object");
	for (var i = 0; i < 3; ++i) {
		var svg;
		if (i <= warning.severity)
			svg = "warning.svg";
		else
			svg = "warning-outline.svg";
		wIcons[i].setAttribute("data", resBase + svg);
	}
};

function styleControlWarning(warning) {
	var css;
	if (warning.type == 0) {
		// SSL warning
		css = "chrome://browser/skin/aboutNetError.css";
		document.body.className = "certerror";
	}
	else {
		css = "chrome://browser/skin/blockedSite.css"
	}
	document.head.innerHTML += "<link rel='stylesheet' type='text/css' href='" + css + "'>";

	if (warning.type == 0) {
		// SSL warning. "Learn more..." link should be visible
		var learnLink = document.querySelector(".warning-learn-link");
		learnLink.style.display = "inline";
		learnLink.href = warning.learnLink;
	} else {
		/* Not an SSL warning - "more info" button opens link to info in new tab
		   and extra info is shown in the body */
		var more = document.querySelector(".warning-more-button");
		more.onclick = function() {
			window.open(warning.learnLink);
		};
		document.querySelector(".warning-body").innerHTML += warning.moreInfo;
	}
}

// Does this domain trigger a warning?
chrome.runtime.sendMessage({domain: document.domain}, function(warning) {
	if (warning && warning.triggered) {
		// We need a clean DOM
		window.stop();
		document.removeChild(document.documentElement);
		document.appendChild(document.createElement("html"));

		// Load the warning template into the DOM
		var req = new XMLHttpRequest();
		req.addEventListener("load", function(e) {
			document.documentElement.innerHTML = e.target.responseText;
			initWarning(warning);

			// 0 = mild, 1 = medium, 2 = severe, 3 = control
			if (warning.severity == 3)
				styleControlWarning(warning);
			else
				styleTieredWarning(warning);
		});
		req.open("GET", resBase + "template.html");
		req.send();
	}
});
