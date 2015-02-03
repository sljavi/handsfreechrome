function save_options() {
    var commandAliases = {};
    var aliasesForDown = document.getElementById('down-aliases').value;
    aliasesForDown = aliasesForDown.split(',')
    aliasesForDown.forEach(function(alias) {
        alias = alias.replace(/(^\s*)|(\s*$)/g, '');
        commandAliases[alias] = "down";
    });

    var timeoutDuration = 60000*document.getElementById('timeout-duration').value;

    chrome.storage.sync.set({
        commandAliases: commandAliases,
        timeoutDuration: timeoutDuration
    }, function() {
        var status = document.getElementById('status');

        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
}

function restore_options() {
    chrome.storage.sync.get({
        commandAliases: {},
        timeoutDuration: 180000
    }, function(items) {
        aliasLists = {}; // dictionary from command to list of aliases
        for (alias in items.commandAliases) {
            if (!Object.prototype.hasOwnProperty.call(items.commandAliases, alias)) continue;
            command = items.commandAliases[alias];
            if (aliasLists[command] == null) {
                aliasLists[command] = [alias];
            } else {
                aliasLists[command].push(alias);
            }
        }
        document.getElementById('down-aliases').value = aliasLists['down'].join(', ');

        document.getElementById('timeout-duration').value = items.timeoutDuration/60000;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);