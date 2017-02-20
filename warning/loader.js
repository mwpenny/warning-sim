/* Loader for injecting warning messages into pages */

var resBase = chrome.runtime.getURL("warning/");

function insertWarningText(warning) {
	// Places warning-specific text into the page
	var wTitle = document.getElementsByClassName("warning-title")[0];
	wTitle.insertBefore(document.createTextNode(warning.title), wTitle.firstChild);
	document.getElementsByClassName("warning-body")[0].innerHTML = warning.message;
	document.getElementsByClassName("warning-more-info")[0].innerHTML += warning.moreInfo;
	document.title = warning.title;
	document.head.innerHTML += "<link rel='icon' type='image/png' href='chrome://global/skin/icons/warning-16.png'/>";

	var back = document.getElementsByClassName("warning-back-button")[0];
	var more = document.getElementsByClassName("warning-more-button")[0];

	back.innerHTML = warning.backButtonText;
	more.innerHTML = warning.moreInfoButtonText;

	// "More information" button
	more.onclick = function() {
		var infoBox = document.getElementsByClassName("warning-more-info")[0];
		if (infoBox.style.display != "block")
			infoBox.style.display = "block";
		else
			infoBox.style.display = "none";
	};

	back.addEventListener("click", function() {
		window.history.back();
	});

	// TODO: "ignore this warning" listener
};

function styleTieredWarning(warning) {
	// Style page depending on warning type
	document.getElementsByClassName("warning-body")[0].innerHTML += "<br/><br/>" + warning.instructions;
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
	var learnLink = document.getElementsByClassName("warning-learn-link")[0];
	if (warning.type > 0) {
		// Not an SSL warning - "more info" button opens link to info in new tab
		var more = document.getElementsByClassName("warning-more-button")[0];
		more.onclick = function() {
			window.open(warning.learnLink);
		};
		learnLink.parentNode.remove();
		document.getElementsByClassName("warning-body")[0].innerHTML += warning.moreInfo;
	} else {
		learnLink.href = warning.learnLink;
	}
}

function xhr(url, cb) {
	// Performs an AJAX call
	var req = new XMLHttpRequest();
	req.addEventListener("load", cb);
	req.open("GET", url);
	req.send();
}

function loadTieredWarning(warning) {
	// Loads tiered warning message
	xhr(resBase + "tiered.html", function(e) {
		document.head.innerHTML = "<link rel='stylesheet' type='text/css' href='" + resBase + "tiered.css'>";
		document.body.innerHTML = e.target.responseText;
		insertWarningText(warning);
		styleTieredWarning(warning);
	});
};

function loadControlWarning(warning) {
	// Loads control warning message
	xhr(resBase + "control.html", function(e) {
		var css;
		// SSL warning
		if (warning.type == 0) {
			css = "chrome://browser/skin/aboutNetError.css";
			document.body.className = "certerror";
		}
		else {
			css = "chrome://browser/skin/blockedSite.css"
		}
		document.head.innerHTML = "<link rel='stylesheet' type='text/css' href='" + css + "'>";
		document.body.innerHTML = e.target.responseText;
		insertWarningText(warning);
		styleControlWarning(warning);
	});
};

// Does this domain trigger a warning?
chrome.runtime.sendMessage({domain: document.domain}, function(warning) {
	if (warning && warning.triggered) {
		// We need a clean DOM
		window.stop();
		document.removeChild(document.documentElement);
		document.appendChild(document.createElement("html"));
		document.documentElement.appendChild(document.createElement("head"));
		document.documentElement.appendChild(document.createElement("body"));

		// 0 = mild, 1 = medium, 2 = severe, 3 = control
		if (warning.severity == 3)
			loadControlWarning(warning);
		else
			loadTieredWarning(warning);
	}
});
