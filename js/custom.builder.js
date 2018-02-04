/**
 * @param {*} editorId 
 * @param {*} toolbarButtons 
 * @param {*} pluginsEnabled 
 * @param {*} apiUrl 
 */
var CustomFroalaEditorBuilder = function(editorId, toolbarButtons, pluginsEnabled, apiUrl) {
    this.editorId = editorId;
    this.toolbarButtons = toolbarButtons;
    this.pluginsEnabled = pluginsEnabled;
    this.apiUrl = apiUrl;
    this.optionList = {};

    // Define Custon Dropdown
    var defineCustomDropdown = function () {
        $.FroalaEditor.DefineIcon('custom_dropdown', {NAME: 'cog'});
        $.FroalaEditor.RegisterCommand('custom_dropdown', {
          title: 'Advanced options',
          type: 'dropdown',
          focus: false,
          undo: true,
          refreshAfterCallback: true,
          options: this.optionList,
          callback: function (cmd, val) {
              insertElementInEditor(this, val);
          },
          // Callback on refresh.
          refresh: function ($btn) {
          },
          // Callback on dropdown show.
          refreshOnShow: function ($btn, $dropdown) {
          }
        });
        this.toolbarButtons.push('custom_dropdown');
    }
    
    // Register Custom Commands
    var registerCustomCommands = function(item) {
        var val = "<i class='fa fa-" + item.iconName + "'></i> " + item.name;
        var key =  item.id;
        this.optionList[key] = val;
    }
    
    // Insert the custom element in Editor
    var insertElementInEditor = function(editor, id) {
        editor.html.insert('&lt;bcv:insertOutput id="' + id + '"&gt;' +
            '&lt;/bcv:insertOutput&gt;');
        editor.undo.saveStep();
    }
    
    // Initialize the editor.
    var initFroalaEditor = function () {
        defineCustomDropdown();
        $(this.editorId).froalaEditor({
            toolbarButtons: this.toolbarButtons,
            pluginsEnabled: this.pluginsEnabled
        })
    }
    
    // Fetch Custom Buttons Data 
    var getEditorCustomOptions = function() {
        $.getJSON(this.apiUrl, function (data) {
            var classList = data._embedded.componentDefinitionOutputClassList;
            $.each(classList, function (index, classItem) {
                registerCustomCommands(classItem);
            });
            initFroalaEditor();
        }, function(err){console.log(err)});
    }

    var init = function(){
        getEditorCustomOptions();
    }
    
    return {
        init : init
    }

}
