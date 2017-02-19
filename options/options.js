/* Interface with WebExtension storage API for options screen */

var warningTypes = ["SSL", "Malware", "Phishing", "Unwanted software"];
var severities = ["Low", "Medium", "High", "Control"];
var domains = [];

function addTableEntry(table, entry) {
    // Adds a warning trigger entry to the specified table
    var row = table.insertRow();

    var cell = row.insertCell();
    cell.appendChild(document.createTextNode(entry.domain));

    cell = row.insertCell();
    cell.appendChild(document.createTextNode(warningTypes[entry.type]));

    cell = row.insertCell();
    cell.appendChild(document.createTextNode(severities[entry.severity]));

    cell = row.insertCell();
    cell.className = "btn-delete";
    cell.appendChild(document.createTextNode("x"));

    cell.addEventListener("click", function(e) {
        // Delete selected row
        var row = e.target.parentNode;
        var domainIndex = domains.indexOf(row.cells[0].innerHTML);
        if (domainIndex > -1)
            domains.splice(domainIndex, 1);
        row.parentNode.deleteRow(row.rowIndex-1);
        saveTable();
    });

    domains.push(entry.domain);

    // Move edit row to the end of the table
    var row = document.getElementById("row-edit");
    row.parentNode.insertBefore(row, null);
}

function loadTable() {
    chrome.storage.local.get("domains", function(data) {
        // Populate the table with the retrieved warning triggers
        var table = document.getElementById("table-domains");
        var domains = Object.keys(data.domains);
        for (var i = 0; i < domains.length; ++i) {
            var entry = {domain: domains[i]};
            for (var prop in data.domains[domains[i]])
                entry[prop] = data.domains[domains[i]][prop];
            addTableEntry(table, entry);
        }
    });
}

function saveTable() {
    // Save table data to local storage
    var rows = document.querySelectorAll("tbody > tr:not(#row-edit)");
    var data = {domains: {}};
    for (var i = 0; i < rows.length; ++i) {
        var row = rows[i];
        data.domains[row.cells[0].innerHTML] = {
            type: warningTypes.indexOf(row.cells[1].innerHTML),
            severity: severities.indexOf(row.cells[2].innerHTML)
        };
    }
    chrome.storage.local.set(data, function() {
        chrome.runtime.sendMessage(data);  // Send to background script

        var e = chrome.runtime.lastError;
        if (e)
            console.log(e.message);
    });
}

function populateDropdown(elem, entries) {
    for (var i = 0; i < entries.length; ++i) {
        var opt = document.createElement("option");
        opt.appendChild(document.createTextNode(entries[i]));
        elem.appendChild(opt); 
    }
}

function resetEditInputs() {
    // Reset user-editable fields
    document.querySelector("tr#row-edit input[name='domain']").value = "";
    var selectors = document.querySelectorAll("tr#row-edit select");
    for (var i = 0; i < selectors.length; ++i) {
        selectors[i].selectedIndex = 0;
    }
}

function showEditControls(showing) {
    var newClass = showing ? "" : "hidden";

    document.getElementById("btn-add").className = showing ? "hidden" : "";
    document.getElementById("row-edit").className = newClass;
    document.getElementById("btns-control").className = newClass;
}

function commitEdit() {
    var entry = {
        domain: document.querySelector("tr#row-edit input[name='domain']").value,
        type: document.querySelector("tr#row-edit select[name='type']").selectedIndex,
        severity: document.querySelector("tr#row-edit select[name='severity']").selectedIndex
    };
    addTableEntry(document.getElementById("table-domains"), entry);

    showEditControls(false);
    saveTable();
}

document.addEventListener("DOMContentLoaded", function() {
    var selectors = document.querySelectorAll("tr#row-edit select");
    populateDropdown(selectors[0], warningTypes);
    populateDropdown(selectors[1], severities);

    document.getElementById("btn-add").addEventListener("click", function() {
        resetEditInputs();
        showEditControls(true);
    });
    var acceptBtn = document.getElementById("btn-accept");
    acceptBtn.addEventListener("click", commitEdit);
    document.getElementById("btn-cancel").addEventListener("click", function() {
        showEditControls(false);
    });

    document.querySelector("tr#row-edit input[name='domain']").addEventListener("input", function(e) {
        // Prevent adding duplicate entries
        if (domains.indexOf(e.target.value) !== -1)
            acceptBtn.className = "hidden";
        else
            acceptBtn.className = "";
    });

    loadTable();
});
