var popupButtonList = [], popupButtonSeparator = '|';

// Define popup template.
$.extend($.FroalaEditor.POPUP_TEMPLATES, {
    "customPlugin.popup": '[_BUTTONS_]'
});


// The custom popup is defined inside a plugin (new or existing).
$.FroalaEditor.PLUGINS.customPlugin = function (editor) {
    this.isShown = false;
    // Create custom popup.
    function initPopup() {
        // Popup buttons.
        var popup_buttons = '';

        // Create the list of buttons.
        if (editor.opts.popupButtons.length > 1) {
            popup_buttons += '<div class="fr-buttons">';
            popup_buttons += editor.button.buildList(editor.opts.popupButtons);
            popup_buttons += '</div>';
        }

        // Load popup template.
        var template = {
            buttons: popup_buttons
        };

        // Create popup.
        var $popup = editor.popups.create('customPlugin.popup', template);

        return $popup;
    }

    // Show the popup
    function showPopup() {
        var $popup = editor.popups.get('customPlugin.popup');
        if (!$popup) $popup = initPopup();

        //  var isVisible = editor.popups.isVisible('customPlugin.popup');
        //  if(isVisible) this.hidePopup()
        editor.popups.setContainer('customPlugin.popup', editor.$tb);

        var $btn = editor.$tb.find('.fr-command[data-cmd="customButtons"]');

        var left = $btn.offset().left + $btn.outerWidth() / 2;
        var top = $btn.offset().top + (editor.opts.toolbarBottom ? 10 : $btn.outerHeight() - 10);

        // Show the custom popup.
        editor.popups.show('customPlugin.popup', left, top, $btn.outerHeight());
        this.isShown = true;
    }

    // Hide the custom popup.
    function hidePopup() {
        editor.popups.hide('customPlugin.popup');
        this.isShown = false;
    }

    // Methods visible outside the plugin.
    return {
        showPopup: showPopup,
        hidePopup: hidePopup
    }
}

// Define an icon and command for the button that opens the custom popup.
$.FroalaEditor.DefineIcon('buttonIcon', { NAME: 'angle-double-down' })
$.FroalaEditor.RegisterCommand('customButtons', {
    title: 'Custom Options',
    icon: 'buttonIcon',
    undo: false,
    focus: false,
    plugin: 'customPlugin',
    callback: function () {
        this.customPlugin.showPopup();
    }
});


// Register Custom Commands
function registerCustomCommands(item) {
    $.FroalaEditor.DefineIcon(item.name, { NAME: item.iconName });
    $.FroalaEditor.RegisterCommand(item.name, {
        title: 'Button',
        undo: true,
        focus: false,
        callback: function () {
            insertElementInEditor(this, item.id);
        }
    });
    popupButtonList.push(item.name);
    popupButtonList.push(popupButtonSeparator);
}

// Define popup buttons.
function definePopupButtons() {
    popupButtonList.pop();
    $.extend($.FroalaEditor.DEFAULTS, {
        popupButtons: popupButtonList,
    });
}

// Insert the custom element in Editor
function insertElementInEditor(editor, id) {
    editor.html.insert('&lt;bcv:insertOutput id="' + id + '"&gt; <br>' +
        '&lt;/bcv:insertOutput&gt;<br>');
    editor.undo.saveStep();
    editor.customPlugin.hidePopup();
}

// Initialize the editor.
function initEditor() {
    definePopupButtons();
    $('#froala-editor').froalaEditor({
        toolbarButtons: ['bold', 'italic', '|', 'customButtons'],
        pluginsEnabled: ['customPlugin']
    })
}

// Fetch Custom Buttons Data 
function getEditorCustomButtons(url) {
    $.getJSON(url, function (data) {
        var classList = data._embedded.componentDefinitionOutputClassList;
        $.each(classList, function (index, classItem) {
            registerCustomCommands(classItem);
        });
        initEditor();
    });
}


$(function () {
    getEditorCustomButtons("/data.json");
})
