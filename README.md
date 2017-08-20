# ![icon](icons/icon-48.png) warning-sim
---

A Firefox/Chrome* extension (WebExtensions API) for displaying simulated warning messages in user studies. A report on the study that this extension was created and used for can be found in the `User study` directory, along with the raw data that was collected.

Features:
* Set warning messages to trigger on specific domains (specify warning type and severity)
* Record metrics tagged with a participant ID (which buttons were clicked and how much time was spent on the page)
* "Shuffle mode": all warnings are shown in a random order (useful for collecting metrics for a user study). The next warning is shown when either "back" or "ignore" are clicked, and the tab is closed after viewing the last one.

Screenshot:
![options](screenshots/options.png)

_*Note that Firefox internal CSS is used by parts of the warning and options pages, so some modifications will need to be done to make them look the same in Chrome. The main functionality works cross-browser._