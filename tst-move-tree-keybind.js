const TST_ID = "treestyletab@piro.sakura.ne.jp";

// add a listener for the keybind
browser.commands.onCommand.addListener(getTree);

async function getTree(name) {
	console.log(name);
	if (name == "tstMoveTreeToNewWindow") {
		// Get the active tab in the current window
		let tab = (await browser.tabs.query({active: true, currentWindow: true}))[0];

		// Grab the current tree of tabs
		let tree = await browser.runtime.sendMessage(TST_ID, {
			type: 'get-tree',
			tab:  tab.id,
		});

		let ids = flattenTabIds(tree);

		// Use the IDs from that tree to get its structure
		let structure = await browser.runtime.sendMessage(TST_ID, {
			type: 'get-tree-structure',
			tabs: ids,
		});

		// Move the tabs to a new window
		let windowId = await browser.runtime.sendMessage(TST_ID, {
			type: 'open-in-new-window',
			tabs: ids,
		});

		// Apply the structure to the newly moved tabs
		await browser.runtime.sendMessage(TST_ID, {
			type: 'set-tree-structure',
			tabs: ids,
			window: windowId,
			structure: structure,
		});
	}
}

/**
 * Flatten tab IDs from a tree
 * 
 * @param tree Tree to extract tabs from
 * @return List of tab IDs from tree
 */
function flattenTabIds(tree) {
	// Add our ID to the array
	var ids = [tree.id];

	// Recursively add children. Children have the same structure as a top level tree
	for (var i = 0; i < tree.children.length; i++) {
		ids = ids.concat(flattenTabIds(tree.children[i]));
	}

	return arrayUnique(ids);
}

// https://stackoverflow.com/a/1584377
function arrayUnique(array) {
    var a = array.concat();

    for (var i=0; i<a.length; ++i) {
        for (var j=i+1; j<a.length; ++j) {
            if (a[i] === a[j]) {
            	a.splice(j--, 1);
            }
        }
    }

    return a;
}
