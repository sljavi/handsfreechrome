function save_options() {
    var color = document.getElementById('example_option').value;
    var commandAliases = {};
    var aliasesForDown = document.getElementById('down-aliases').value;
    aliasesForDown = aliasesForDown.split(',')
    aliasesForDown.forEach(function(alias) {
        alias = alias.replace(/(^\s*)|(\s*$)/g, '');
        commandAliases[alias] = "down";
    });
    chrome.storage.sync.set({
        example_option: color,
        commandAliases: commandAliases
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
        example_option: 'default',
        commandAliases: {}
    }, function(items) {
        document.getElementById('example_option').value = items.example_option;
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
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);