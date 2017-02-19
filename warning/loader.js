/* Loader for injecting warning messages in pages */

var resBase = chrome.runtime.getURL("warning/");

function styleWarning(warningInfo) {
	// Style page depending on warning type
	var wTitle = document.getElementsByClassName("warning-title")[0];
	var wBody = document.getElementsByClassName("warning-body")[0];

	wTitle.insertBefore(document.createTextNode(warningInfo.title), wTitle.firstChild);
	wBody.innerHTML = warningInfo.message + "<br/><br/>" + warningInfo.instructions;
	document.getElementsByClassName("warning-more-info")[0].innerHTML += warningInfo.moreInfo;
	document.title = warningInfo.title;
	document.body.className = warningInfo.class;

	// Higher threat level -> more warning icons
	var i;
	var wIcons = document.getElementsByClassName("warning-icons")[0].getElementsByTagName("object");
	for (i = 0; i < 3; ++i) {
		var svg;
		if (i <= warningInfo.severity)
			svg = "warning.svg";
		else
			svg = "warning-outline.svg";
		wIcons[i].setAttribute("data", resBase + svg);
	}

	// "More information" button
	var moreLink = document.getElementsByClassName("warning-more-link")[0];
	moreLink.addEventListener("click", function() {
	    document.getElementsByClassName("warning-more-info")[0].style.display = "block";
	    moreLink.style.visibility = "hidden";
	});
};

function loadWarning(warningInfo) {
	// Construct warning message in the DOM
	var req = new XMLHttpRequest();
	req.addEventListener("load", function(e) {
		document.head.innerHTML = "<link rel='stylesheet' type='text/css' href='" + resBase + "warnings.css'>";
		document.body.innerHTML = e.target.responseText;
		styleWarning(warningInfo);
	});
	req.open("GET", resBase + "warning.html");
	req.send();
};

// Does this domain trigger a warning?
chrome.runtime.sendMessage({domain: document.domain}, function(response) {
	if (response && response.triggered) {
		// We need a clean DOM
		window.stop();
		document.removeChild(document.documentElement);
		document.appendChild(document.createElement("html"));
		document.documentElement.appendChild(document.createElement("head"));
		document.documentElement.appendChild(document.createElement("body"));
		loadWarning(response);
	}
});
